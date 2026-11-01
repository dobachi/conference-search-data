(() => {
  'use strict';

  // --- State ---
  let allConferences = [];
  const REPO_BLOB = 'https://github.com/dobachi/conference-search-data/blob/main/';  // notes/ へのリンク
  let lastUpdated = '';
  const favorites = { has: (id) => window.FavSync.has('conferences', id) };  // backed by sync.js
  let currentView = 'list';
  let calMonth = new Date().getMonth();
  let calYear = new Date().getFullYear();
  let activeTags = new Set();

  // --- DOM refs ---
  const $list = document.getElementById('conf-list');
  const $loading = document.getElementById('loading');
  const $error = document.getElementById('error');
  const $stats = document.getElementById('stats');
  const $catFilter = document.getElementById('category-filter');
  const $regionFilter = document.getElementById('region-filter');
  const $statusFilter = document.getElementById('status-filter');
  const $search = document.getElementById('search-input');
  const $cfpOnly = document.getElementById('cfp-only');
  const $favOnly = document.getElementById('fav-only');
  const $memoOnly = document.getElementById('memo-only');
  const $settingsBtn = document.getElementById('settings-btn');
  const $settingsModal = document.getElementById('settings-modal');
  const $settingsClose = document.getElementById('settings-close');
  const $themeSelect = document.getElementById('theme-select');
  const $lastUpdated = document.getElementById('last-updated');
  const $activeTags = document.getElementById('active-tags');
  const $calendar = document.getElementById('calendar');
  const $viewList = document.getElementById('view-list');
  const $viewCal = document.getElementById('view-cal');
  const $favActions = document.getElementById('fav-actions');
  const $exportFav = document.getElementById('export-fav');
  const $importFav = document.getElementById('import-fav');
  const $importFavFile = document.getElementById('import-fav-file');
  const $clearFav = document.getElementById('clear-fav');

  // --- Favorites (store lives in sync.js; re-render on any change) ---
  window.FavSync.onChange((what) => {
    if (!allConferences.length) return;
    if (what === 'note' || (what === 'sync' && window.NotesUI.editing())) return;  // don't re-render under the cursor
    applyFilters();
  });

  function toggleFavorite(id) {
    window.FavSync.set('conferences', id, !favorites.has(id));
  }

  function exportFavorites() {
    const favConfs = allConferences.filter((c) => favorites.has(c.id));
    const orgIds = window.FavSync.ids('organizations');
    const data = {
      exported_at: new Date().toISOString(),
      count: favConfs.length + orgIds.length,
      conferences: favConfs,
      organizations: orgIds.map((id) => ({ id })),
      notes: {
        conferences: Object.fromEntries(window.FavSync.noteIds('conferences').map((id) => [id, window.FavSync.getNote('conferences', id)])),
        organizations: Object.fromEntries(window.FavSync.noteIds('organizations').map((id) => [id, window.FavSync.getNote('organizations', id)])),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFavorites() {
    if (!confirm('Clear all favorites (events and organizations)? Notes are kept.')) return;
    window.FavSync.clear();
  }

  function importFavorites(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const confIds = (data.conferences || []).map((c) => c.id).filter(Boolean);
        const orgIds = (data.organizations || []).map((o) => o.id).filter(Boolean);
        const notes = data.notes || {};
        const noteCount = Object.keys(notes.conferences || {}).length + Object.keys(notes.organizations || {}).length;
        if (confIds.length + orgIds.length + noteCount === 0) {
          alert('No favorites or notes found in the file.');
          return;
        }
        let notesAdded = 0;
        ['conferences', 'organizations'].forEach((kind) => {
          Object.entries(notes[kind] || {}).forEach(([id, text]) => {
            if (text && !window.FavSync.hasNote(kind, id)) { window.FavSync.setNote(kind, id, text); notesAdded++; }
          });
        });
        const knownIds = new Set(allConferences.map((c) => c.id));
        let added = 0;
        confIds.forEach((id) => {
          if (knownIds.has(id) && !favorites.has(id)) { window.FavSync.set('conferences', id, true); added++; }
        });
        orgIds.forEach((id) => {
          if (!window.FavSync.has('organizations', id)) { window.FavSync.set('organizations', id, true); added++; }
        });
        alert(`Imported ${added} favorites and ${notesAdded} notes (${confIds.length + orgIds.length - added} favorites skipped: already favorited or not found; existing notes were kept).`);
      } catch {
        alert('Invalid JSON file.');
      }
      $importFavFile.value = '';
    };
    reader.readAsText(file);
  }

  $exportFav.addEventListener('click', exportFavorites);
  $importFav.addEventListener('click', () => $importFavFile.click());
  $importFavFile.addEventListener('change', () => {
    if ($importFavFile.files[0]) importFavorites($importFavFile.files[0]);
  });
  $clearFav.addEventListener('click', clearFavorites);

  // --- Theme ---
  function initTheme() {
    const saved = localStorage.getItem('theme') || 'auto';
    document.documentElement.setAttribute('data-theme', saved);
    $themeSelect.value = saved;
  }

  $themeSelect.addEventListener('change', () => {
    const t = $themeSelect.value;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  });

  // --- Tag filter ---
  function toggleTag(tag) {
    if (activeTags.has(tag)) {
      activeTags.delete(tag);
    } else {
      activeTags.add(tag);
    }
    renderActiveTags();
    applyFilters();
  }

  function clearTags() {
    activeTags.clear();
    renderActiveTags();
    applyFilters();
  }

  function renderActiveTags() {
    if (activeTags.size === 0) {
      $activeTags.classList.add('hidden');
      return;
    }
    $activeTags.classList.remove('hidden');
    $activeTags.innerHTML =
      [...activeTags].map((t) =>
        `<span class="active-tag" data-tag="${esc(t)}">${esc(t)} &times;</span>`
      ).join('') +
      '<span class="active-tag clear-tags">Clear all</span>';

    $activeTags.querySelectorAll('.active-tag:not(.clear-tags)').forEach((el) => {
      el.addEventListener('click', () => toggleTag(el.dataset.tag));
    });
    $activeTags.querySelector('.clear-tags').addEventListener('click', clearTags);
  }

  // --- View toggle ---
  function setView(view) {
    currentView = view;
    $viewList.classList.toggle('active', view === 'list');
    $viewCal.classList.toggle('active', view === 'calendar');
    $list.classList.toggle('hidden', view !== 'list');
    $calendar.classList.toggle('hidden', view !== 'calendar');
    applyFilters();
  }

  $viewList.addEventListener('click', () => setView('list'));
  $viewCal.addEventListener('click', () => setView('calendar'));

  // --- Settings modal ---
  $settingsBtn.addEventListener('click', () => $settingsModal.classList.remove('hidden'));
  $settingsClose.addEventListener('click', () => $settingsModal.classList.add('hidden'));
  $settingsModal.addEventListener('click', (e) => {
    if (e.target === $settingsModal) $settingsModal.classList.add('hidden');
  });

  // --- Data loading ---
  async function loadConferences() {
    try {
      let res = await fetch('./data/conferences.json').catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('https://raw.githubusercontent.com/dobachi/conference-search-data/main/data/conferences.json');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allConferences = data.conferences || [];
      lastUpdated = data.last_updated || '';
      $lastUpdated.textContent = lastUpdated ? `Updated: ${lastUpdated}` : '';
      populateFilters();
      applyFilters();
      $loading.classList.add('hidden');
    } catch (err) {
      $loading.classList.add('hidden');
      $error.textContent = `Failed to load data: ${err.message}`;
      $error.classList.remove('hidden');
    }
  }

  // --- Filters ---
  function populateFilters() {
    const categories = new Set();
    const regions = new Set();
    allConferences.forEach((c) => {
      (c.categories || []).forEach((cat) => categories.add(cat));
      if (c.location && c.location.region) regions.add(c.location.region);
    });

    [...categories].sort().forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      $catFilter.appendChild(opt);
    });

    [...regions].sort().forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      $regionFilter.appendChild(opt);
    });
  }

  function applyFilters() {
    const cat = $catFilter.value;
    const region = $regionFilter.value;
    const status = $statusFilter.value;
    const query = $search.value.toLowerCase().trim();
    const cfpOnly = $cfpOnly.checked;
    const favOnly = $favOnly.checked;
    const memoOnly = $memoOnly.checked;

    let filtered = allConferences.filter((c) => {
      // Hide events before 2026
      const start = c.dates?.start || '';
      if (start && start < '2026-01-01' && !window.FavSync.hasNote('conferences', c.id)) return false;
      if (cat && !(c.categories || []).includes(cat)) return false;
      if (region && (!c.location || c.location.region !== region)) return false;
      if (status && c.status !== status) return false;
      if (cfpOnly && (!c.cfp || c.cfp.status !== 'open')) return false;
      if (favOnly && !favorites.has(c.id)) return false;
      if (memoOnly && !window.FavSync.hasNote('conferences', c.id)) return false;
      if (activeTags.size > 0) {
        const allTags = (c.categories || []).concat(c.topics || []);
        if (![...activeTags].every((t) => allTags.includes(t))) return false;
      }
      if (query) {
        const searchable = [
          c.name,
          c.summary,
          window.FavSync.getNote('conferences', c.id),
          ...(c.categories || []),
          ...(c.topics || []),
          c.location ? c.location.city : '',
          c.location ? c.location.country : '',
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const order = { upcoming: 0, ongoing: 1, ended: 2 };
      const sa = order[a.status] ?? 1;
      const sb = order[b.status] ?? 1;
      if (sa !== sb) return sa - sb;
      return (a.dates?.start || '').localeCompare(b.dates?.start || '');
    });

    if (currentView === 'list') {
      renderConferences(filtered);
    } else {
      renderCalendar(filtered);
    }
    const favCount = favorites.size;
    $stats.textContent = `${filtered.length} / ${allConferences.length} conferences` +
      (favCount ? ` | Favorites: ${favCount}` : '');
    $favActions.classList.remove('hidden');
    $exportFav.classList.toggle('hidden', favCount === 0);
  }

  $catFilter.addEventListener('change', applyFilters);
  $regionFilter.addEventListener('change', applyFilters);
  $statusFilter.addEventListener('change', applyFilters);
  $search.addEventListener('input', applyFilters);
  $cfpOnly.addEventListener('change', applyFilters);
  $favOnly.addEventListener('change', applyFilters);
  $memoOnly.addEventListener('change', applyFilters);

  // --- Rendering ---
  function renderConferences(list) {
    if (list.length === 0) {
      $list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">No conferences found</div>';
      return;
    }

    const sectionLabels = { upcoming: 'Upcoming', ongoing: 'Ongoing', ended: 'Past Events' };
    let prevStatus = null;
    const html = [];

    list.forEach((c) => {
      const st = c.status || 'upcoming';
      if (st !== prevStatus) {
        html.push(`<div class="section-divider">${sectionLabels[st] || st}</div>`);
        prevStatus = st;
      }

      const dateStr = formatDateRange(c.dates);
      const locationStr = formatLocation(c.location);
      const cfpHtml = renderCfp(c.cfp);
      const statusClass = `status-${st}`;
      const statusLabel = st.charAt(0).toUpperCase() + st.slice(1);
      const isFav = favorites.has(c.id);
      const favClass = isFav ? 'fav-btn active' : 'fav-btn';

      const tagsHtml = (c.categories || []).concat(c.topics || [])
        .map((t) => {
          const isActive = activeTags.has(t);
          return `<span class="tag clickable${isActive ? ' tag-active' : ''}" data-tag="${esc(t)}">${esc(t)}</span>`;
        })
        .join('');

      html.push(`
        <div class="conf-card${isFav ? ' fav' : ''}">
          <div class="conf-card-header">
            <div class="conf-name">
              <button class="${favClass}" data-id="${esc(c.id)}" aria-label="Toggle favorite">${isFav ? '\u2605' : '\u2606'}</button>
              ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}
            </div>
            <span class="conf-card-actions">${window.NotesUI.toggleHtml('conferences', c.id)}<span class="conf-status ${statusClass}">${statusLabel}</span></span>
          </div>
          <div class="conf-meta">
            <span>${dateStr}</span>
            <span>${locationStr}</span>
            <span>${esc(c.format || '')}</span>
            ${cfpHtml}
          </div>
          ${c.summary ? `<div class="conf-summary">${esc(c.summary)}</div>` : ''}
          ${c.notes ? `<div class="org-notes"><a href="${esc(REPO_BLOB + c.notes)}" target="_blank" rel="noopener">\u{1F4C4} 調査メモを読む</a></div>` : ''}
          ${tagsHtml ? `<div class="conf-tags">${tagsHtml}</div>` : ''}
          ${window.NotesUI.boxHtml('conferences', c.id)}
        </div>
      `);
    });

    $list.innerHTML = html.join('');

    // Attach favorite toggle handlers
    $list.querySelectorAll('.fav-btn').forEach((btn) => {
      btn.addEventListener('click', () => toggleFavorite(btn.dataset.id));
    });

    // Attach tag click handlers
    $list.querySelectorAll('.tag.clickable').forEach((el) => {
      el.addEventListener('click', () => toggleTag(el.dataset.tag));
    });

    // Memo boxes
    window.NotesUI.bind($list, () => renderConferences(list));
  }

  // --- Calendar rendering ---
  function renderCalendar(list) {
    const monthNames = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];

    // Build event map: date string -> array of conferences
    const eventMap = {};
    list.forEach((c) => {
      const start = c.dates?.start;
      if (!start) return;
      if (!eventMap[start]) eventMap[start] = [];
      eventMap[start].push(c);
    });

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    let html = `
      <div class="cal-nav">
        <button id="cal-prev">&lt;</button>
        <span>${monthNames[calMonth]} ${calYear}</span>
        <button id="cal-next">&gt;</button>
      </div>
      <div class="cal-weekdays">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
        <span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div class="cal-grid">
    `;

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-day empty"></div>';
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const events = eventMap[dateStr] || [];
      const maxShow = 3;

      html += `<div class="cal-day${isToday ? ' today' : ''}">`;
      html += `<div class="cal-day-num">${d}</div>`;

      events.slice(0, maxShow).forEach((c) => {
        const isFav = favorites.has(c.id);
        const label = c.name.length > 20 ? c.name.slice(0, 18) + '...' : c.name;
        const title = `${c.name}\n${formatDateRange(c.dates)}\n${formatLocation(c.location)}`;
        if (c.url) {
          html += `<a class="cal-event${isFav ? ' fav' : ''}" href="${esc(c.url)}" target="_blank" rel="noopener" title="${esc(title)}">${isFav ? '\u2605 ' : ''}${esc(label)}</a>`;
        } else {
          html += `<span class="cal-event${isFav ? ' fav' : ''}" title="${esc(title)}">${isFav ? '\u2605 ' : ''}${esc(label)}</span>`;
        }
      });

      if (events.length > maxShow) {
        html += `<span class="cal-more">+${events.length - maxShow} more</span>`;
      }

      html += '</div>';
    }

    html += '</div>';
    $calendar.innerHTML = html;

    // Nav listeners
    document.getElementById('cal-prev').addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      applyFilters();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      applyFilters();
    });
  }

  function formatDateRange(dates) {
    if (!dates) return '';
    const s = dates.start || '';
    const e = dates.end || '';
    if (s && e && s !== e) return `${s} ~ ${e}`;
    return s || e;
  }

  function formatLocation(loc) {
    if (!loc) return '';
    const parts = [loc.city, loc.country].filter(Boolean);
    return parts.join(', ');
  }

  function renderCfp(cfp) {
    if (!cfp || !cfp.status) return '';
    if (cfp.status === 'open') {
      const deadlineStr = cfp.deadline ? ` (~${cfp.deadline})` : '';
      const isSoon = cfp.deadline && isWithinDays(cfp.deadline, 14);
      const cls = isSoon ? 'cfp-soon' : 'cfp-open';
      const label = isSoon ? 'CFP Soon' : 'CFP Open';
      return `<span class="cfp-badge ${cls}">${label}${deadlineStr}</span>`;
    }
    if (cfp.status === 'closed') {
      return '<span class="cfp-badge cfp-closed">CFP Closed</span>';
    }
    return '';
  }

  function isWithinDays(dateStr, days) {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = (target - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= days;
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // --- On-demand menu while scrolled ---
  // At the top the header/tabs sit in normal flow. Once scrolled past them they
  // leave the screen; a floating button (bottom right) pulls them in as an
  // overlay. Scrolling further down closes the overlay again.
  (() => {
    const $bar = document.getElementById('top-bar');
    const $fab = document.getElementById('menu-fab');
    const $toTop = document.getElementById('to-top');
    if (!$bar || !$fab) return;
    const $spacer = document.createElement('div');
    $spacer.className = 'top-bar-spacer';
    $bar.after($spacer);
    let lastY = window.scrollY;
    let open = false;
    let threshold = 0;   // page y below which the bar is back in normal flow
    const setOpen = (v) => {
      open = v;
      $bar.classList.toggle('top-bar-open', v);
      $fab.setAttribute('aria-expanded', String(v));
    };
    const update = () => {
      const y = window.scrollY;
      const floating = $bar.classList.contains('top-bar-floating');
      if (!floating) threshold = $bar.offsetTop + $bar.offsetHeight;
      const scrolled = y > threshold;
      if (scrolled && !floating) {
        $spacer.style.height = $bar.offsetHeight + 'px';   // keep layout stable
        $bar.classList.add('top-bar-floating');
      } else if (!scrolled && floating) {
        $bar.classList.remove('top-bar-floating');
        $spacer.style.height = '';
        setOpen(false);
      }
      if (open && y - lastY > 10) setOpen(false);           // scrolling down closes it
      $fab.classList.toggle('hidden', !scrolled);
      if ($toTop) $toTop.classList.toggle('hidden', !scrolled);
      lastY = y;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => { if ($bar.classList.contains('top-bar-floating')) $spacer.style.height = $bar.offsetHeight + 'px'; });
    $fab.addEventListener('click', () => setOpen(!open));
    if ($toTop) $toTop.addEventListener('click', () => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.querySelectorAll('#main-tabs .tab-btn').forEach((b) => b.addEventListener('click', () => setOpen(false)));
  })();

  // --- Service Worker ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // --- Init ---
  initTheme();
  loadConferences();
})();
