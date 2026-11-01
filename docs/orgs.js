// Organizations tab: academic societies, standards bodies, initiatives, communities.
// Data: data/organizations.json (+ data/org-tags.json for alias search, conferences.json for cross-links).
(() => {
  'use strict';

  const RAW_BASE = 'https://raw.githubusercontent.com/dobachi/conference-search-data/main/data/';

  const TYPE_LABELS = {
    'academic-society': '学会',
    'standards-body': '標準化団体',
    'industry-association': '業界団体',
    'consortium': 'コンソーシアム',
    'initiative': 'イニシアティブ',
    'oss-foundation': 'OSS 財団',
    'public-program': '公的プログラム',
    'corporate-community': '企業・ユーザーコミュニティ',
  };
  const MEMBERSHIP_LABELS = { open: '参加自由', paid: '有料会員制', invite: '招待制', unknown: '' };

  // --- State ---
  let loaded = false;
  let loading = false;
  let orgs = [];
  let tagAliases = {};        // tag -> [aliases]
  let confIndex = {};         // conference id -> {name, url}
  let activeTags = new Set();
  const favorites = { has: (id) => window.FavSync.has('organizations', id) };  // backed by sync.js

  // --- DOM ---
  const $tabs = document.querySelectorAll('#main-tabs .tab-btn');
  const $sections = { events: document.getElementById('tab-events'), orgs: document.getElementById('tab-orgs') };
  const $type = document.getElementById('org-type-filter');
  const $region = document.getElementById('org-region-filter');
  const $search = document.getElementById('org-search-input');
  const $favOnly = document.getElementById('org-fav-only');
  const $cloud = document.getElementById('org-tag-cloud');
  const $active = document.getElementById('org-active-tags');
  const $stats = document.getElementById('org-stats');
  const $updated = document.getElementById('org-updated');
  const $loading = document.getElementById('org-loading');
  const $error = document.getElementById('org-error');
  const $list = document.getElementById('org-list');

  // --- Tabs ---
  function activateTab(name, pushHash = true) {
    $tabs.forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
    Object.entries($sections).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
    if (pushHash) {
      const newHash = name === 'orgs' ? '#orgs' : '';
      if (location.hash !== newHash) history.replaceState(null, '', location.pathname + location.search + newHash);
    }
    if (name === 'orgs' && !loaded) load();
  }

  $tabs.forEach((b) => b.addEventListener('click', () => activateTab(b.dataset.tab)));
  window.addEventListener('hashchange', () => activateTab(location.hash.startsWith('#orgs') ? 'orgs' : 'events', false));

  // --- Data ---
  async function fetchJson(file) {
    let res = await fetch('./data/' + file).catch(() => null);
    if (!res || !res.ok) res = await fetch(RAW_BASE + file);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    return res.json();
  }

  async function load() {
    if (loading) return;
    loading = true;
    $loading.classList.remove('hidden');
    try {
      const [orgData, tagData, confData] = await Promise.all([
        fetchJson('organizations.json'),
        fetchJson('org-tags.json').catch(() => ({ tags: [] })),
        fetchJson('conferences.json').catch(() => ({ conferences: [] })),
      ]);
      orgs = orgData.organizations || [];
      (tagData.tags || []).forEach((t) => { tagAliases[t.tag] = t.aliases || []; });
      (confData.conferences || []).forEach((c) => { confIndex[c.id] = { name: c.name, url: c.url, start: c.dates && c.dates.start }; });
      $updated.textContent = orgData.last_updated ? `Updated: ${orgData.last_updated}` : '';
      populateFilters();
      applyHashTag();
      render();
      loaded = true;
    } catch (err) {
      $error.textContent = `Failed to load organizations: ${err.message}`;
      $error.classList.remove('hidden');
    } finally {
      loading = false;
      $loading.classList.add('hidden');
    }
  }

  // Optional deep link: #orgs?tag=データスペース
  function applyHashTag() {
    const m = location.hash.match(/^#orgs\?(.*)$/);
    if (!m) return;
    const params = new URLSearchParams(m[1]);
    (params.get('tag') || '').split(',').filter(Boolean).forEach((t) => activeTags.add(t));
    if (params.get('q')) $search.value = params.get('q');
  }

  function populateFilters() {
    const types = new Set();
    const regions = new Set();
    orgs.forEach((o) => { if (o.type) types.add(o.type); if (o.region) regions.add(o.region); });
    [...types].sort().forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = TYPE_LABELS[t] || t;
      $type.appendChild(opt);
    });
    [...regions].sort().forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      $region.appendChild(opt);
    });
  }

  // --- Filtering ---
  function searchableText(o) {
    const aliasExpansion = (o.tags || []).flatMap((t) => tagAliases[t] || []);
    return [
      o.name, o.name_ja, o.summary, o.country, o.region,
      ...(o.aliases || []), ...(o.tags || []), ...(o.outputs || []), ...(o.groups || []),
      ...aliasExpansion,
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function filtered() {
    const type = $type.value;
    const region = $region.value;
    const q = $search.value.toLowerCase().trim();
    const favOnly = $favOnly.checked;
    return orgs.filter((o) => {
      if (type && o.type !== type) return false;
      if (region && o.region !== region) return false;
      if (favOnly && !favorites.has(o.id)) return false;
      if (activeTags.size > 0 && ![...activeTags].every((t) => (o.tags || []).includes(t))) return false;
      if (q && !searchableText(o).includes(q)) return false;
      return true;
    }).sort((a, b) => (a.name_ja || a.name).localeCompare(b.name_ja || b.name, 'ja'));
  }

  // --- Tags ---
  function toggleTag(tag) {
    if (activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
    render();
  }

  function renderTagCloud(list) {
    const counts = {};
    list.forEach((o) => (o.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const allTags = new Set(orgs.flatMap((o) => o.tags || []));
    const entries = [...allTags].map((t) => [t, counts[t] || 0])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'));
    $cloud.innerHTML = entries.map(([t, n]) =>
      `<span class="tag clickable${activeTags.has(t) ? ' tag-active' : ''}" data-tag="${esc(t)}">${esc(t)}<span class="tag-count">${n}</span></span>`
    ).join('');
    $cloud.querySelectorAll('.tag').forEach((el) => el.addEventListener('click', () => toggleTag(el.dataset.tag)));
  }

  function renderActiveTags() {
    if (activeTags.size === 0) { $active.classList.add('hidden'); return; }
    $active.classList.remove('hidden');
    $active.innerHTML = [...activeTags].map((t) =>
      `<span class="active-tag" data-tag="${esc(t)}">${esc(t)} &times;</span>`).join('') +
      '<span class="active-tag clear-tags">Clear all</span>';
    $active.querySelectorAll('.active-tag:not(.clear-tags)').forEach((el) =>
      el.addEventListener('click', () => toggleTag(el.dataset.tag)));
    $active.querySelector('.clear-tags').addEventListener('click', () => { activeTags.clear(); render(); });
  }

  // --- Favorites ---
  function toggleFavorite(id) {
    window.FavSync.set('organizations', id, !favorites.has(id));
  }
  window.FavSync.onChange(() => { if (loaded) render(); });

  // --- Rendering ---
  function render() {
    const list = filtered();
    renderTagCloud(list);
    renderActiveTags();
    $stats.textContent = `${list.length} / ${orgs.length} organizations`;

    if (list.length === 0) {
      $list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">No organizations found</div>';
      return;
    }

    $list.innerHTML = list.map((o) => {
      const isFav = favorites.has(o.id);
      const title = o.name_ja && o.name_ja !== o.name ? `${o.name_ja} <span style="font-weight:normal;color:var(--text-secondary)">(${esc(o.name)})</span>` : esc(o.name);
      const meta = [
        TYPE_LABELS[o.type] ? `<span class="org-type">${esc(TYPE_LABELS[o.type])}</span>` : '',
        o.status && o.status !== 'active' ? `<span class="org-status-${esc(o.status)}">${esc(o.status)}</span>` : '',
        o.country ? `<span>${esc(o.country)}</span>` : '',
        o.founded ? `<span>Since ${esc(o.founded)}</span>` : '',
        MEMBERSHIP_LABELS[o.membership] ? `<span>${esc(MEMBERSHIP_LABELS[o.membership])}</span>` : '',
      ].filter(Boolean).join('');
      const outputs = (o.outputs || []).map((x) => `<span class="output-chip">${esc(x)}</span>`).join('');
      const groups = (o.groups || []).length ? `<div class="org-groups">注目グループ: ${o.groups.map(esc).join(' / ')}</div>` : '';
      const related = (o.related_conferences || []).map((id) => {
        const c = confIndex[id];
        if (!c) return '';
        return c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name);
      }).filter(Boolean);
      const relatedHtml = related.length ? `<div class="org-related">関連イベント: ${related.join(' · ')}</div>` : '';
      const tags = (o.tags || []).map((t) =>
        `<span class="tag clickable${activeTags.has(t) ? ' tag-active' : ''}" data-tag="${esc(t)}">${esc(t)}</span>`).join('');
      const aliases = (o.aliases || []).length ? `<div class="org-groups">別名: ${o.aliases.map(esc).join(', ')}</div>` : '';

      return `
        <div class="conf-card${isFav ? ' fav' : ''}">
          <div class="conf-card-header">
            <div class="conf-name">
              <button class="fav-btn${isFav ? ' active' : ''}" data-id="${esc(o.id)}" aria-label="Toggle favorite">${isFav ? '★' : '☆'}</button>
              ${o.url ? `<a href="${esc(o.url)}" target="_blank" rel="noopener">${title}</a>` : title}
            </div>
          </div>
          <div class="conf-meta">${meta}</div>
          ${o.summary ? `<div class="conf-summary">${esc(o.summary)}</div>` : ''}
          ${outputs ? `<div class="org-outputs">${outputs}</div>` : ''}
          ${groups}
          ${aliases}
          ${relatedHtml}
          ${tags ? `<div class="conf-tags">${tags}</div>` : ''}
          ${o.verified ? `<div class="org-verified">Verified: ${esc(o.verified)}</div>` : ''}
        </div>`;
    }).join('');

    $list.querySelectorAll('.fav-btn').forEach((btn) => btn.addEventListener('click', () => toggleFavorite(btn.dataset.id)));
    $list.querySelectorAll('.tag.clickable').forEach((el) => el.addEventListener('click', () => toggleTag(el.dataset.tag)));
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  [$type, $region, $favOnly].forEach((el) => el.addEventListener('change', render));
  $search.addEventListener('input', render);

  // --- Init ---
  if (location.hash.startsWith('#orgs')) activateTab('orgs', false);
})();
