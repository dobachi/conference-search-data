// Favorites + notes store, with optional cross-device sync via a secret GitHub Gist.
//
// Local model (localStorage):
//   "fav-state"  : { conferences: { <id>: [on(0|1), ts] }, organizations: { ... } }
//   "note-state" : { conferences: { <id>: [text,   ts] }, organizations: { ... } }
// Every id is a last-writer-wins register ([value, timestamp]), so removals and
// edits propagate correctly between devices. An empty note text is a tombstone.
//
// Remote: one secret Gist with two files of the same shape:
//   conference-search-favorites.json / conference-search-notes.json
// The token (fine-grained: Account permission "Gists: Read and write", or classic
// scope "gist") is stored only in this browser's localStorage.
(() => {
  'use strict';

  const TOKEN_KEY = 'gist-token';
  const GIST_KEY = 'gist-id';
  const LAST_KEY = 'gist-last-sync';
  const GIST_DESC = 'Conference Search favorites & notes (auto-synced)';
  const API = 'https://api.github.com';
  const KINDS = ['conferences', 'organizations'];
  const STORES = {
    fav: { key: 'fav-state', file: 'conference-search-favorites.json', coerce: (v) => (v ? 1 : 0) },
    note: { key: 'note-state', file: 'conference-search-notes.json', coerce: (v) => String(v == null ? '' : v) },
  };

  // --- Local state ---
  const state = { fav: null, note: null };
  const listeners = [];
  let pushTimer = null;
  let syncing = false;
  let lastError = '';
  let lastVisibleSync = 0;

  function normalize(store, s) {
    const out = {};
    KINDS.forEach((k) => {
      out[k] = {};
      const src = (s && s[k]) || {};
      Object.keys(src).forEach((id) => {
        const v = src[id];
        if (Array.isArray(v) && v.length === 2) out[k][id] = [STORES[store].coerce(v[0]), Number(v[1]) || 0];
      });
    });
    return out;
  }

  function load(store) {
    try {
      const s = JSON.parse(localStorage.getItem(STORES[store].key) || 'null');
      if (s && typeof s === 'object') return normalize(store, s);
    } catch { /* fall through */ }
    const s = { conferences: {}, organizations: {} };
    if (store === 'fav') {
      // Migrate legacy keys (plain id arrays). ts=0 so any remote record wins.
      try {
        JSON.parse(localStorage.getItem('favorites') || '[]').forEach((id) => { s.conferences[id] = [1, 0]; });
        JSON.parse(localStorage.getItem('org-favorites') || '[]').forEach((id) => { s.organizations[id] = [1, 0]; });
      } catch { /* ignore */ }
    }
    localStorage.setItem(STORES[store].key, JSON.stringify(s));
    return s;
  }

  state.fav = load('fav');
  state.note = load('note');

  function save(store) {
    localStorage.setItem(STORES[store].key, JSON.stringify(state[store]));
  }

  // what: 'fav' | 'note' | 'sync'
  function emit(what) {
    listeners.forEach((cb) => { try { cb(what); } catch { /* ignore */ } });
    renderStatus();
  }

  function rec(store, kind, id) {
    return state[store][kind] && state[store][kind][id];
  }

  // Favorites
  const has = (kind, id) => !!(rec('fav', kind, id) && rec('fav', kind, id)[0]);
  const ids = (kind) => Object.keys(state.fav[kind] || {}).filter((id) => state.fav[kind][id][0]);

  function set(kind, id, on) {
    if (!KINDS.includes(kind) || !id) return;
    state.fav[kind][id] = [on ? 1 : 0, Date.now()];
    save('fav');
    emit('fav');
    schedulePush();
  }

  function clear(kind) {
    const kinds = kind ? [kind] : KINDS;
    const now = Date.now();
    kinds.forEach((k) => Object.keys(state.fav[k]).forEach((id) => { state.fav[k][id] = [0, now]; }));
    save('fav');
    emit('fav');
    schedulePush();
  }

  // Notes
  const getNote = (kind, id) => (rec('note', kind, id) ? rec('note', kind, id)[0] : '');
  const hasNote = (kind, id) => getNote(kind, id).trim().length > 0;
  const noteIds = (kind) => Object.keys(state.note[kind] || {}).filter((id) => state.note[kind][id][0].trim());

  function setNote(kind, id, text) {
    if (!KINDS.includes(kind) || !id) return;
    const t = String(text == null ? '' : text);
    if (getNote(kind, id) === t) return;
    state.note[kind][id] = [t, Date.now()];
    save('note');
    emit('note');
    schedulePush();
  }

  // Merge: per id, the record with the larger timestamp wins; ties prefer remote.
  function merge(local, remote) {
    const out = { conferences: {}, organizations: {} };
    KINDS.forEach((k) => {
      const keys = new Set([...Object.keys(local[k] || {}), ...Object.keys(remote[k] || {})]);
      keys.forEach((id) => {
        const l = local[k] && local[k][id];
        const r = remote[k] && remote[k][id];
        if (l && r) out[k][id] = r[1] >= l[1] ? r : l;
        else out[k][id] = l || r;
      });
    });
    return out;
  }

  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // --- Gist API ---
  const token = () => localStorage.getItem(TOKEN_KEY) || '';
  const gistId = () => localStorage.getItem(GIST_KEY) || '';

  async function gh(method, path, body) {
    const res = await fetch(API + path, {
      method,
      headers: {
        'Authorization': `Bearer ${token()}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = new Error(`GitHub API ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  function payload(store) {
    return JSON.stringify({ version: 1, updated: new Date().toISOString(), ...state[store] }, null, 2);
  }

  async function discoverGist() {
    const list = await gh('GET', '/gists?per_page=100');
    const g = (list || []).find((x) => x.files && (x.files[STORES.fav.file] || x.files[STORES.note.file]));
    return g ? g.id : '';
  }

  async function readFile(files, store) {
    const f = files && files[STORES[store].file];
    if (!f) return null;
    let content = f.content;
    if (f.truncated && f.raw_url) content = await (await fetch(f.raw_url)).text();
    try { return normalize(store, JSON.parse(content)); } catch { return null; }
  }

  async function syncNow() {
    if (!token() || syncing) return;
    syncing = true;
    lastError = '';
    renderStatus();
    try {
      let id = gistId();
      if (!id) {
        id = await discoverGist();
        if (id) localStorage.setItem(GIST_KEY, id);
      }
      const remote = { fav: null, note: null };
      if (id) {
        try {
          const g = await gh('GET', `/gists/${id}`);
          remote.fav = await readFile(g.files, 'fav');
          remote.note = await readFile(g.files, 'note');
        } catch (e) {
          if (e.status === 404) { localStorage.removeItem(GIST_KEY); id = ''; } else throw e;
        }
      }
      let localChanged = false;
      const filesToWrite = {};
      Object.keys(STORES).forEach((store) => {
        const merged = remote[store] ? merge(state[store], remote[store]) : state[store];
        if (!same(merged, state[store])) { state[store] = merged; save(store); localChanged = true; }
        if (!remote[store] || !same(merged, remote[store])) filesToWrite[STORES[store].file] = { content: payload(store) };
      });
      if (!id) {
        const g = await gh('POST', '/gists', { description: GIST_DESC, public: false, files: filesToWrite });
        localStorage.setItem(GIST_KEY, g.id);
      } else if (Object.keys(filesToWrite).length) {
        await gh('PATCH', `/gists/${id}`, { files: filesToWrite });
      }
      localStorage.setItem(LAST_KEY, new Date().toISOString());
      if (localChanged) emit('sync');
    } catch (e) {
      lastError = e.status === 401 ? 'Token rejected (401). Check the token and its Gists permission.'
        : e.status === 403 ? 'Forbidden (403). Token lacks Gists write permission or rate limit hit.'
        : `Sync failed: ${e.message}`;
    } finally {
      syncing = false;
      renderStatus();
    }
  }

  function schedulePush() {
    if (!token()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(syncNow, 1500);
  }

  function configure(tok) {
    localStorage.setItem(TOKEN_KEY, tok.trim());
    localStorage.removeItem(GIST_KEY); // re-discover for this account
    return syncNow();
  }

  function disconnect() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GIST_KEY);
    localStorage.removeItem(LAST_KEY);
    lastError = '';
    renderStatus();
  }

  // --- Settings UI (elements are optional; module works without them) ---
  const $token = document.getElementById('gist-token');
  const $status = document.getElementById('sync-status');
  const $connect = document.getElementById('sync-connect');
  const $now = document.getElementById('sync-now');
  const $disc = document.getElementById('sync-disconnect');

  function renderStatus() {
    if (!$status) return;
    const connected = !!token();
    if ($now) $now.disabled = !connected || syncing;
    if ($disc) $disc.classList.toggle('hidden', !connected);
    if ($connect) $connect.textContent = connected ? 'Update token' : 'Connect';
    if (!connected) {
      $status.textContent = 'Not connected. Favorites and notes stay in this browser only.';
      return;
    }
    const last = localStorage.getItem(LAST_KEY);
    const id = gistId();
    const parts = [];
    parts.push(syncing ? 'Syncing…' : (last ? `Last sync: ${last.replace('T', ' ').slice(0, 16)} UTC` : 'Connected, not synced yet'));
    if (id) parts.push(`Gist: ${id.slice(0, 8)}…`);
    $status.innerHTML = parts.map((p) => `<span>${p}</span>`).join(' · ') +
      (id ? ` <a href="https://gist.github.com/${id}" target="_blank" rel="noopener">open</a>` : '') +
      (lastError ? `<div class="sync-error">${lastError}</div>` : '');
  }

  if ($connect) {
    $connect.addEventListener('click', () => {
      const v = $token ? $token.value.trim() : '';
      if (!v) { if ($token) $token.focus(); return; }
      configure(v);
      if ($token) $token.value = '';
    });
  }
  if ($now) $now.addEventListener('click', syncNow);
  if ($disc) $disc.addEventListener('click', disconnect);

  // Sync on load and when the tab becomes visible again (at most once a minute).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && token() && Date.now() - lastVisibleSync > 60000) {
      lastVisibleSync = Date.now();
      syncNow();
    }
  });

  // --- Note box UI helper shared by the Events and Organizations lists ---
  const openNotes = new Set();   // "<kind>:<id>" opened by the user in this session
  const noteTimers = {};

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  const NotesUI = {
    isOpen: (kind, id) => openNotes.has(`${kind}:${id}`) || hasNote(kind, id),
    toggleHtml(kind, id) {
      const on = hasNote(kind, id);
      return `<button class="note-btn${on ? ' active' : ''}" data-kind="${esc(kind)}" data-id="${esc(id)}" aria-label="Toggle memo" title="Memo">&#9998;</button>`;
    },
    boxHtml(kind, id) {
      if (!NotesUI.isOpen(kind, id)) return '';
      return `<div class="note-box"><textarea class="note-text" data-kind="${esc(kind)}" data-id="${esc(id)}" rows="2" placeholder="Memo (synced with favorites)">${esc(getNote(kind, id))}</textarea><span class="note-saved" aria-live="polite"></span></div>`;
    },
    // Attach handlers after a list render. rerender() is called when a box is opened/closed.
    bind(container, rerender) {
      container.querySelectorAll('.note-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = `${btn.dataset.kind}:${btn.dataset.id}`;
          if (hasNote(btn.dataset.kind, btn.dataset.id)) {
            // Has content: button focuses the box instead of hiding it
            const ta = container.querySelector(`.note-text[data-kind="${btn.dataset.kind}"][data-id="${CSS.escape(btn.dataset.id)}"]`);
            if (ta) ta.focus();
            return;
          }
          if (openNotes.has(key)) openNotes.delete(key); else openNotes.add(key);
          rerender();
          if (openNotes.has(key)) {
            const ta = container.querySelector(`.note-text[data-kind="${btn.dataset.kind}"][data-id="${CSS.escape(btn.dataset.id)}"]`);
            if (ta) ta.focus();
          }
        });
      });
      container.querySelectorAll('.note-text').forEach((ta) => {
        const key = `${ta.dataset.kind}:${ta.dataset.id}`;
        const saved = ta.parentElement.querySelector('.note-saved');
        ta.addEventListener('input', () => {
          clearTimeout(noteTimers[key]);
          if (saved) saved.textContent = '…';
          noteTimers[key] = setTimeout(() => {
            setNote(ta.dataset.kind, ta.dataset.id, ta.value);
            if (saved) saved.textContent = 'saved';
          }, 800);
        });
        ta.addEventListener('blur', () => {
          clearTimeout(noteTimers[key]);
          setNote(ta.dataset.kind, ta.dataset.id, ta.value);
          if (!ta.value.trim()) { openNotes.delete(key); rerender(); }
        });
      });
    },
    editing: () => !!(document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('note-text')),
  };

  window.FavSync = {
    has, ids, set, clear,
    getNote, hasNote, noteIds, setNote,
    onChange: (cb) => listeners.push(cb),
    syncNow, configure, disconnect, isConnected: () => !!token(),
  };
  window.NotesUI = NotesUI;

  renderStatus();
  if (token()) { lastVisibleSync = Date.now(); syncNow(); }
})();
