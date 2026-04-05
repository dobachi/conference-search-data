(() => {
  'use strict';

  // --- State ---
  let allConferences = [];
  let lastUpdated = '';

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
  const $settingsBtn = document.getElementById('settings-btn');
  const $settingsModal = document.getElementById('settings-modal');
  const $settingsClose = document.getElementById('settings-close');
  const $themeSelect = document.getElementById('theme-select');

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

  // --- Settings modal ---
  $settingsBtn.addEventListener('click', () => $settingsModal.classList.remove('hidden'));
  $settingsClose.addEventListener('click', () => $settingsModal.classList.add('hidden'));
  $settingsModal.addEventListener('click', (e) => {
    if (e.target === $settingsModal) $settingsModal.classList.add('hidden');
  });

  // --- Data loading ---
  async function loadConferences() {
    try {
      // Try relative path first (local dev), then raw GitHub URL (GitHub Pages)
      let res = await fetch('./data/conferences.json').catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('https://raw.githubusercontent.com/dobachi/conference-search-data/main/data/conferences.json');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allConferences = data.conferences || [];
      lastUpdated = data.last_updated || '';
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

    let filtered = allConferences.filter((c) => {
      if (cat && !(c.categories || []).includes(cat)) return false;
      if (region && (!c.location || c.location.region !== region)) return false;
      if (status && c.status !== status) return false;
      if (cfpOnly && (!c.cfp || c.cfp.status !== 'open')) return false;
      if (query) {
        const searchable = [
          c.name,
          c.summary,
          ...(c.categories || []),
          ...(c.topics || []),
          c.location ? c.location.city : '',
          c.location ? c.location.country : '',
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });

    // Sort: upcoming first by date, then ongoing, then ended
    filtered.sort((a, b) => {
      const order = { upcoming: 0, ongoing: 1, ended: 2 };
      const sa = order[a.status] ?? 1;
      const sb = order[b.status] ?? 1;
      if (sa !== sb) return sa - sb;
      return (a.dates?.start || '').localeCompare(b.dates?.start || '');
    });

    renderConferences(filtered);
    $stats.textContent = `${filtered.length} / ${allConferences.length} conferences` +
      (lastUpdated ? ` | Last updated: ${lastUpdated}` : '');
  }

  // Event listeners for filters
  $catFilter.addEventListener('change', applyFilters);
  $regionFilter.addEventListener('change', applyFilters);
  $statusFilter.addEventListener('change', applyFilters);
  $search.addEventListener('input', applyFilters);
  $cfpOnly.addEventListener('change', applyFilters);

  // --- Rendering ---
  function renderConferences(list) {
    if (list.length === 0) {
      $list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">No conferences found</div>';
      return;
    }

    $list.innerHTML = list.map((c) => {
      const dateStr = formatDateRange(c.dates);
      const locationStr = formatLocation(c.location);
      const cfpHtml = renderCfp(c.cfp);
      const statusClass = `status-${c.status || 'upcoming'}`;
      const statusLabel = (c.status || 'upcoming').charAt(0).toUpperCase() + (c.status || 'upcoming').slice(1);

      const tagsHtml = (c.categories || []).concat(c.topics || [])
        .map((t) => `<span class="tag">${esc(t)}</span>`)
        .join('');

      return `
        <div class="conf-card">
          <div class="conf-card-header">
            <div class="conf-name">
              ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}
            </div>
            <span class="conf-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="conf-meta">
            <span>${dateStr}</span>
            <span>${locationStr}</span>
            <span>${esc(c.format || '')}</span>
            ${cfpHtml}
          </div>
          ${c.summary ? `<div class="conf-summary">${esc(c.summary)}</div>` : ''}
          ${tagsHtml ? `<div class="conf-tags">${tagsHtml}</div>` : ''}
        </div>
      `;
    }).join('');
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

  // --- Service Worker ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // --- Init ---
  initTheme();
  loadConferences();
})();
