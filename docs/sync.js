// Favorites store + optional cross-device sync via a secret GitHub Gist.
//
// Local model (localStorage "fav-state"):
//   { conferences: { <id>: [on(0|1), ts(ms)] }, organizations: { ... } }
// Each id is a last-writer-wins register, so removals propagate correctly
// between devices (plain set-union would resurrect deleted favorites).
//
// Remote: one secret Gist holding conference-search-favorites.json with the same shape.
// The token (classic PAT, scope "gist") is stored only in this browser's localStorage.
(() => {
  'use strict';

  const STATE_KEY = 'fav-state';
  const TOKEN_KEY = 'gist-token';
  const GIST_KEY = 'gist-id';
  const LAST_KEY = 'gist-last-sync';
  const FILE_NAME = 'conference-search-favorites.json';
  const GIST_DESC = 'Conference Search favorites (auto-synced)';
  const API = 'https://api.github.com';
  const KINDS = ['conferences', 'organizations'];

  // --- Local state ---
  let state = load();
  const listeners = [];
  let pushTimer = null;
  let syncing = false;
  let lastError = '';
  let lastVisibleSync = 0;

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      if (s && typeof s === 'object') return normalize(s);
    } catch { /* fall through */ }
    // Migrate legacy keys (plain id arrays). ts=0 so any remote record wins.
    const s = { conferences: {}, organizations: {} };
    try {
      JSON.parse(localStorage.getItem('favorites') || '[]').forEach((id) => { s.conferences[id] = [1, 0]; });
      JSON.parse(localStorage.getItem('org-favorites') || '[]').forEach((id) => { s.organizations[id] = [1, 0]; });
    } catch { /* ignore */ }
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
    return s;
  }

  function normalize(s) {
    const out = {};
    KINDS.forEach((k) => {
      out[k] = {};
      const src = (s && s[k]) || {};
      Object.keys(src).forEach((id) => {
        const v = src[id];
        if (Array.isArray(v) && v.length === 2) out[k][id] = [v[0] ? 1 : 0, Number(v[1]) || 0];
      });
    });
    return out;
  }

  function save() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function emit() {
    listeners.forEach((cb) => { try { cb(); } catch { /* ignore */ } });
    renderStatus();
  }

  function has(kind, id) {
    const v = state[kind] && state[kind][id];
    return !!(v && v[0]);
  }

  function ids(kind) {
    return Object.keys(state[kind] || {}).filter((id) => state[kind][id][0]);
  }

  function set(kind, id, on) {
    if (!KINDS.includes(kind) || !id) return;
    state[kind][id] = [on ? 1 : 0, Date.now()];
    save();
    emit();
    schedulePush();
  }

  function clear(kind) {
    const kinds = kind ? [kind] : KINDS;
    const now = Date.now();
    kinds.forEach((k) => Object.keys(state[k]).forEach((id) => { state[k][id] = [0, now]; }));
    save();
    emit();
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

  function same(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

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

  function payload() {
    return JSON.stringify({ version: 1, updated: new Date().toISOString(), ...state }, null, 2);
  }

  async function discoverGist() {
    const list = await gh('GET', '/gists?per_page=100');
    const g = (list || []).find((x) => x.files && x.files[FILE_NAME]);
    return g ? g.id : '';
  }

  async function readGist(id) {
    const g = await gh('GET', `/gists/${id}`);
    const f = g.files && g.files[FILE_NAME];
    if (!f) return null;
    let content = f.content;
    if (f.truncated && f.raw_url) content = await (await fetch(f.raw_url)).text();
    try { return normalize(JSON.parse(content)); } catch { return null; }
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
      let remote = null;
      if (id) {
        try {
          remote = await readGist(id);
        } catch (e) {
          if (e.status === 404) { localStorage.removeItem(GIST_KEY); id = ''; } else throw e;
        }
      }
      const merged = remote ? merge(state, remote) : state;
      const localChanged = !same(merged, state);
      const remoteChanged = !remote || !same(merged, remote);
      if (localChanged) { state = merged; save(); }
      if (!id) {
        const g = await gh('POST', '/gists', { description: GIST_DESC, public: false, files: { [FILE_NAME]: { content: payload() } } });
        localStorage.setItem(GIST_KEY, g.id);
      } else if (remoteChanged) {
        await gh('PATCH', `/gists/${id}`, { files: { [FILE_NAME]: { content: payload() } } });
      }
      localStorage.setItem(LAST_KEY, new Date().toISOString());
      if (localChanged) emit();
    } catch (e) {
      lastError = e.status === 401 ? 'Token rejected (401). Check the token and its "gist" scope.'
        : e.status === 403 ? 'Forbidden (403). Token lacks the "gist" scope or rate limit hit.'
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
      $status.textContent = 'Not connected. Favorites stay in this browser only.';
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

  window.FavSync = { has, ids, set, clear, onChange: (cb) => listeners.push(cb), syncNow, configure, disconnect, isConnected: () => !!token() };

  renderStatus();
  if (token()) { lastVisibleSync = Date.now(); syncNow(); }
})();
