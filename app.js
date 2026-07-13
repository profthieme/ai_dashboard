/* ============================================================
   Dashboard app.js  (VS Code edition)
   Sections: Quick Links · Curated News editor · Weather terminal
   ============================================================ */

/* ------------------------------------------------------------
   1. CONFIG — edit this block only
   ------------------------------------------------------------ */
const CONFIG = {

    /* Quick links: your groups and local images, carried over
       from the previous dashboard unchanged.                   */
    imageBaseUrl: './images/',
    quickLinks: {
        'Personal': [
            { name: 'Amazon', url: 'http://www.amazon.com/', image: 'amazon40.jpg' },
            { name: 'Cozi', url: 'https://www.cozi.com/', image: 'cozi.jpg' },
            { name: 'GitHub', url: 'https://github.com/profthieme', image: 'github.jpg' },
            { name: 'IMDb', url: 'https://www.imdb.com/', image: 'imdb40.png' },
            { name: 'JustWatch', url: 'https://www.justwatch.com/', image: 'justwatch.jpg' },
            { name: 'Kroger', url: 'https://www.kroger.com/rx/dashboard', image: 'kroger.png' },
            { name: 'McCulley', url: 'http://mcculleyallergy.com/', image: 'mcculley.jpg' },
            { name: 'Next Episode', url: 'https://next-episode.net/', image: 'next-episode50.jpg' },
            { name: 'Pandora', url: 'https://www.pandora.com/', image: 'pandora.jpg' },
            { name: 'MyUTK', url: 'https://secure.touchnet.com/C21610_tsa/web/login.jsp', image: 'utk.png' }
        ],
        'Work': [
            { name: 'EBSCO', url: 'https://ezproxy.memphis.edu:3443/login?url=https://search.ebscohost.com/login.aspx?profile=ehost&groupid=main&defaultdb=bsu&authtype=ip,uid&custid=s3652670', image: 'bsu.png' },
            { name: 'VitalSource', url: 'https://www.vitalsource.com/', image: 'bookshelf.jpg' },
            { name: 'Canvas', url: 'https://memphis.instructure.com/', image: 'canvas.jpg' },
            { name: 'UofM Email', url: 'https://ummail.memphis.edu/', image: 'office365.png' },
            { name: 'Faculty Senate', url: 'http://www.memphis.edu/facultysenate/', image: 'facsenate.jpg' },
            { name: 'Fogelman', url: 'http://memphis.edu/fcbe/', image: 'fcbe40.jpg' },
            { name: 'HBS Press', url: 'https://cb.hbsp.harvard.edu/', image: 'hbsp.jpg' },
            { name: 'Interlibrary', url: 'https://itlibloan.memphis.edu/', image: 'illiad.jpg' },
            { name: 'Taylor & Francis', url: 'https://www-taylorfrancis-com.ezproxy.memphis.edu/', image: 'taylor-francis.jpg' },
            { name: 'UofM', url: 'http://memphis.edu/', image: 'uofm.gif' },
            { name: 'Libraries', url: 'http://www.memphis.edu/libraries/', image: 'libraries.jpg' },
            { name: 'Portal', url: 'https://portal.memphis.edu/', image: 'UofMportal.jpg' },
            { name: 'UMware', url: 'http://umware.memphis.edu/', image: 'umware.jpg' }
        ],
        'Weather': [
            { name: 'Ambient', url: 'https://dashboard.ambientweather.net/devices/public/e38deadd664d7b3db91ec313040ea3b3', image: 'ambientweather.jpg' },
            { name: 'Weatherbug', url: 'https://weather.weatherbug.com/', image: 'weatherbug40.jpg' },
            { name: 'Wunderground', url: 'https://www.wunderground.com/dashboard/pws/KTNCOLLI33', image: 'wunderground.jpg' }
        ]
    },

    /* FontAwesome icons for the group headers. */
    linkGroupIcons: {
        'Personal': 'fas fa-home',
        'Work': 'fas fa-briefcase',
        'Weather': 'fas fa-cloud-sun'
    },

    /* Repo the Upload button commits to (via GitHub API). */
    github: {
        owner: 'profthieme',
        repo: 'ai_dashboard',
        branch: 'main'
    },

    /* The three curated-news subsections. Each maps to its own
       data file so per-section commits stay clean.             */
    sections: [
        { key: 'ai_business', label: 'AI + Business',  file: 'data/news_business.json', tab: 'ai_business.json' },
        { key: 'ai_highered', label: 'AI + Higher Ed', file: 'data/news_highered.json', tab: 'ai_highered.json' },
        { key: 'other',       label: 'Other News',     file: 'data/news_other.json',    tab: 'other_news.json' }
    ],

    /* Legacy file: still read as a fallback so existing curated
       content shows up until the new files exist.              */
    legacyNewsFile: 'data/news.json',

    weatherFile: 'data/weather.json',

    /* Open Notebook (local). If your previous app.js used a
       different endpoint or payload, mirror it in
       sendToOpenNotebook() near the bottom of this file.       */
    openNotebook: {
        url: 'http://localhost:5055',
        notebookId: 'notebook:ai-research'
    }
};

const TOKEN_KEY = 'dash_gh_token';

/* ------------------------------------------------------------
   2. State
   ------------------------------------------------------------ */
const state = {
    news: {},            // key -> { articles: [], last_updated: str|null, loadedFrom: str }
    activeTab: CONFIG.sections[0].key,
    selected: new Set(), // article URLs selected for podcast
    pending: null        // parsed upload awaiting commit: { key -> [articles] }
};

/* ------------------------------------------------------------
   3. Utilities
   ------------------------------------------------------------ */
function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtDate(str) {
    if (!str) return 'date unknown';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function sectionByKey(key) {
    return CONFIG.sections.find(s => s.key === key);
}

function b64encodeUtf8(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
}

/* Normalize one article object from any of the accepted shapes
   (new prompt output, legacy news.json, hand-written).         */
function normalizeArticle(a) {
    if (!a || typeof a !== 'object') return null;
    const title = a.title && String(a.title).trim();
    const url = a.url && String(a.url).trim();
    if (!title || !url) return null;
    return {
        title,
        url,
        source: a.source || a.publisher || 'Unknown source',
        date: a.date_parsed || a.date || '',
        synopsis: a.synopsis || a.summary || '',
        tags: Array.isArray(a.tags) ? a.tags : (a.tag ? [a.tag] : []),
        verification: a.verification || a.verification_note || ''
    };
}

/* Map legacy category/theme values onto the three sections. */
function legacySectionKey(a) {
    const c = String(a.category || a.theme || '').toLowerCase();
    if (c.includes('business')) return 'ai_business';
    if (c.includes('education') || c.includes('higher')) return 'ai_highered';
    return 'other';
}

/* ------------------------------------------------------------
   4. Panels (collapse / expand)
   ------------------------------------------------------------ */
function toggleCard(id) {
    document.getElementById(id)?.classList.toggle('collapsed');
}

/* ------------------------------------------------------------
   5. Quick links
   Rendered as a JSON-style listing, matching the code aesthetic
   of the news editor: group names as comments, links as
   "name": "url" lines with a continuous line-number gutter.
   ------------------------------------------------------------ */
function renderQuickLinks() {
    const box = document.getElementById('quick-links');
    const rows = [];
    for (const [group, links] of Object.entries(CONFIG.quickLinks)) {
        rows.push(`<div class="ql-group">// ${esc(group)}</div>`);
        links.forEach(l => {
            rows.push(`
                <a class="ql-link" href="${esc(l.url)}" target="_blank" rel="noopener">
                    <span class="prop">"${esc(l.name)}"</span><span class="punc">: </span><span class="str">"${esc(l.url)}"</span><span class="punc">,</span>
                </a>`);
        });
    }
    box.innerHTML = rows.join('');
}

/* ------------------------------------------------------------
   6. News: loading
   ------------------------------------------------------------ */
async function fetchJson(path) {
    const res = await fetch(`${path}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.json();
}

async function loadNews() {
    let anyNewFile = false;

    for (const sec of CONFIG.sections) {
        try {
            const data = await fetchJson(sec.file);
            const articles = (data.articles || []).map(normalizeArticle).filter(Boolean);
            state.news[sec.key] = {
                articles,
                last_updated: data.last_updated || null,
                loadedFrom: sec.file
            };
            anyNewFile = true;
        } catch {
            state.news[sec.key] = { articles: [], last_updated: null, loadedFrom: null };
        }
    }

    /* Fallback: legacy single-file feed, routed by category. */
    if (!anyNewFile) {
        try {
            const legacy = await fetchJson(CONFIG.legacyNewsFile);
            for (const raw of (legacy.articles || [])) {
                const art = normalizeArticle(raw);
                if (!art) continue;
                const key = legacySectionKey(raw);
                state.news[key].articles.push(art);
                state.news[key].last_updated = legacy.last_updated || null;
                state.news[key].loadedFrom = CONFIG.legacyNewsFile;
            }
        } catch { /* nothing curated yet */ }
    }

    renderNews();
}

/* ------------------------------------------------------------
   7. News: rendering (the editor)
   ------------------------------------------------------------ */
function renderNews() {
    renderTabs();
    renderFile();
    renderStatusBar();
}

function renderTabs() {
    const bar = document.getElementById('news-tabbar');
    bar.innerHTML = CONFIG.sections.map(sec => {
        const n = state.news[sec.key]?.articles.length ?? 0;
        const active = state.activeTab === sec.key ? ' active' : '';
        return `
            <button class="tab${active}" role="tab" aria-selected="${!!active}"
                    onclick="switchTab('${sec.key}')">
                <i class="fas fa-file-code" aria-hidden="true"></i>
                ${esc(sec.tab)}
                <span class="tab-count">${n}</span>
            </button>`;
    }).join('');
}

function switchTab(key) {
    state.activeTab = key;
    renderNews();
}

function renderFile() {
    const sec = sectionByKey(state.activeTab);
    const info = state.news[sec.key] || { articles: [] };
    const box = document.getElementById('news-content');
    document.getElementById('news-crumb').innerHTML =
        `data &rsaquo; <span class="tok-fn">${esc(sec.tab)}</span> &rsaquo; <span class="tok-comment">${esc(sec.label)}</span>`;

    if (!info.articles.length) {
        box.innerHTML = `
            <div class="empty-file">// ${esc(sec.label)}: no articles yet.<br>
            // Run the curation prompt, then click Upload to post results here.</div>`;
        return;
    }

    box.innerHTML = info.articles.map(a => {
        const checked = state.selected.has(a.url) ? ' checked' : '';
        const selCls = state.selected.has(a.url) ? ' selected' : '';
        const tags = (a.tags || []).map(t => `<span class="tag">#${esc(t)}</span>`).join(' ');
        const syn = a.synopsis
            ? `<div class="line"><span class="prop">&quot;synopsis&quot;</span><span class="punc">: </span><span class="str">&quot;${esc(a.synopsis)}&quot;</span></div>`
            : '';
        return `
        <article class="entry${selCls}">
            <label class="entry-select" title="Select for podcast">
                <input type="checkbox" class="sel-box"${checked} data-url="${esc(a.url)}">
            </label>
            <div class="entry-lines">
                <div class="line comment">// ${esc(a.source)} &middot; ${esc(fmtDate(a.date))} ${tags}</div>
                <div class="line"><span class="prop">&quot;title&quot;</span><span class="punc">: </span><a class="str" href="${esc(a.url)}" target="_blank" rel="noopener">&quot;${esc(a.title)}&quot;</a><span class="punc">,</span></div>
                ${syn}
            </div>
        </article>`;
    }).join('');
}

function renderStatusBar() {
    const counts = CONFIG.sections
        .map(s => `${s.label.replace('AI + ', '')}: ${state.news[s.key]?.articles.length ?? 0}`)
        .join('  ·  ');
    document.getElementById('status-counts').textContent = counts;

    const updates = CONFIG.sections
        .map(s => state.news[s.key]?.last_updated)
        .filter(Boolean)
        .sort();
    const latest = updates.length ? updates[updates.length - 1] : null;
    document.getElementById('status-updated').textContent =
        latest ? `updated ${fmtDate(latest)}` : 'no curated data';

    document.getElementById('status-token').innerHTML = localStorage.getItem(TOKEN_KEY)
        ? '<i class="fas fa-key"></i> token set'
        : '<i class="fas fa-key"></i> no token';
}

/* ------------------------------------------------------------
   8. Podcast selection (NotebookLM / Open Notebook)
   ------------------------------------------------------------ */
function toggleSelect(url, on) {
    if (on) state.selected.add(url); else state.selected.delete(url);
    document.getElementById('selected-count').textContent = `${state.selected.size} selected`;
    renderFile();
}

function selectedArticles() {
    const all = CONFIG.sections.flatMap(s => state.news[s.key]?.articles ?? []);
    return all.filter(a => state.selected.has(a.url));
}

function sendToNotebookLM() {
    const arts = selectedArticles();
    if (!arts.length) { alert('Select at least one article first.'); return; }
    const urls = arts.map(a => a.url).join('\n');
    navigator.clipboard?.writeText(urls).catch(() => {});
    alert(`Copied ${arts.length} URL(s) to the clipboard.\nPaste them as sources in NotebookLM.`);
    window.open('https://notebooklm.google.com/', '_blank', 'noopener');
}

async function sendToOpenNotebook() {
    const arts = selectedArticles();
    if (!arts.length) { alert('Select at least one article first.'); return; }
    /* NOTE: mirrors a minimal Open Notebook sources call. If your
       previous app.js used a different route/payload, replace the
       body below with that version. */
    try {
        for (const a of arts) {
            await fetch(`${CONFIG.openNotebook.url}/api/sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notebook_id: CONFIG.openNotebook.notebookId,
                    type: 'link',
                    url: a.url,
                    title: a.title
                })
            });
        }
        alert(`Sent ${arts.length} article(s) to Open Notebook.`);
    } catch (err) {
        alert('Could not reach Open Notebook. If this page is served over HTTPS, ' +
              'the browser blocks calls to http://localhost (mixed content). ' +
              'Run the dashboard locally, or add the sources inside Open Notebook.\n\n' + err);
    }
}

/* ------------------------------------------------------------
   9. Upload workflow
   ------------------------------------------------------------ */
function openUpload() {
    state.pending = null;
    document.getElementById('upload-text').value = '';
    document.getElementById('upload-parse-status').textContent = '';
    document.getElementById('upload-commit-status').textContent = '';
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('upload-step-input').classList.remove('hidden');
    document.getElementById('upload-step-preview').classList.add('hidden');
    document.getElementById('upload-target-label').textContent =
        `// active tab: ${sectionByKey(state.activeTab).label}`;
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUpload() {
    document.getElementById('upload-modal').classList.add('hidden');
}

function backToInput() {
    document.getElementById('upload-step-preview').classList.add('hidden');
    document.getElementById('upload-step-input').classList.remove('hidden');
}

function setStatus(id, msg, cls) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.className = 'modal-status' + (cls ? ' ' + cls : '');
}

/* Accepts:
   - full prompt output: { sections: { ai_business:[], ai_highered:[], other:[] } }
   - a single-section object: { articles: [...] }
   - a bare array: [ ... ]                                         */
function parseUpload() {
    const text = document.getElementById('upload-text').value.trim();
    if (!text) { setStatus('upload-parse-status', 'Paste JSON or choose a file first.', 'error'); return; }

    /* tolerate a pasted ```json fence */
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');

    let data;
    try { data = JSON.parse(cleaned); }
    catch (err) { setStatus('upload-parse-status', 'Invalid JSON: ' + err.message, 'error'); return; }

    const pending = { ai_business: [], ai_highered: [], other: [] };
    const aliases = {
        ai_business: 'ai_business', 'ai+business': 'ai_business', business: 'ai_business',
        ai_highered: 'ai_highered', 'ai+highered': 'ai_highered', highered: 'ai_highered',
        ai_education: 'ai_highered', education: 'ai_highered',
        other: 'other', other_news: 'other', othernews: 'other'
    };

    if (Array.isArray(data)) {
        data.forEach(a => { const n = normalizeArticle(a); if (n) pending[state.activeTab].push(n); });
    } else if (data && data.sections && typeof data.sections === 'object') {
        for (const [k, arr] of Object.entries(data.sections)) {
            const key = aliases[k.toLowerCase().replace(/[\s-]/g, '_')] || null;
            if (!key || !Array.isArray(arr)) continue;
            arr.forEach(a => { const n = normalizeArticle(a); if (n) pending[key].push(n); });
        }
    } else if (data && Array.isArray(data.articles)) {
        data.articles.forEach(a => { const n = normalizeArticle(a); if (n) pending[state.activeTab].push(n); });
    } else {
        setStatus('upload-parse-status', 'Unrecognized structure. Expected an array, {articles:[...]}, or {sections:{...}}.', 'error');
        return;
    }

    const total = Object.values(pending).reduce((n, arr) => n + arr.length, 0);
    if (!total) { setStatus('upload-parse-status', 'No valid articles found (each needs at least title + url).', 'error'); return; }

    state.pending = pending;
    renderPreview();
    document.getElementById('upload-step-input').classList.add('hidden');
    document.getElementById('upload-step-preview').classList.remove('hidden');
    setStatus('upload-commit-status', `${total} article(s) ready.`, 'ok');
}

function renderPreview() {
    const box = document.getElementById('upload-preview');
    const rows = [];
    for (const sec of CONFIG.sections) {
        state.pending[sec.key].forEach((a, i) => {
            const options = CONFIG.sections.map(s =>
                `<option value="${s.key}"${s.key === sec.key ? ' selected' : ''}>${esc(s.label)}</option>`).join('');
            rows.push(`
            <div class="preview-item" data-sec="${sec.key}" data-idx="${i}">
                <input type="text" value="${esc(a.title)}"
                       onchange="editPending('${sec.key}',${i},'title',this.value)">
                <button class="preview-remove" title="Remove"
                        onclick="removePending('${sec.key}',${i})"><i class="fas fa-trash"></i></button>
                <textarea onchange="editPending('${sec.key}',${i},'synopsis',this.value)"
                          placeholder="synopsis">${esc(a.synopsis)}</textarea>
                <span></span>
                <div class="preview-meta">
                    <select onchange="movePending('${sec.key}',${i},this.value)">${options}</select>
                    <span>${esc(a.source)} · ${esc(fmtDate(a.date))}</span>
                    <a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.url)}</a>
                </div>
            </div>`);
        });
    }
    box.innerHTML = rows.join('') ||
        '<div class="empty-file">// nothing left to post</div>';
}

function editPending(sec, idx, field, value) {
    if (state.pending?.[sec]?.[idx]) state.pending[sec][idx][field] = value;
}

function removePending(sec, idx) {
    state.pending[sec].splice(idx, 1);
    renderPreview();
}

function movePending(sec, idx, target) {
    if (sec === target) return;
    const [a] = state.pending[sec].splice(idx, 1);
    state.pending[target].push(a);
    renderPreview();
}

/* Merge pending items into current section data per chosen mode. */
function buildMergedSections() {
    const mode = document.querySelector('input[name="upload-mode"]:checked')?.value || 'append';
    const now = new Date().toISOString();
    const out = {};
    for (const sec of CONFIG.sections) {
        const incoming = state.pending[sec.key];
        if (!incoming.length) continue;
        let articles;
        if (mode === 'replace') {
            articles = incoming.slice();
        } else {
            const existing = state.news[sec.key]?.articles ?? [];
            const seen = new Set(incoming.map(a => a.url));
            articles = incoming.concat(existing.filter(a => !seen.has(a.url)));
        }
        out[sec.key] = {
            section: sec.key,
            label: sec.label,
            last_updated: now,
            curated_by: 'manual_upload',
            total_count: articles.length,
            articles
        };
    }
    return out;
}

function downloadSectionFiles() {
    const merged = buildMergedSections();
    const keys = Object.keys(merged);
    if (!keys.length) { setStatus('upload-commit-status', 'Nothing to download.', 'error'); return; }
    for (const key of keys) {
        const sec = sectionByKey(key);
        const blob = new Blob([JSON.stringify(merged[key], null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = sec.file.split('/').pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
    }
    setStatus('upload-commit-status',
        `Downloaded ${keys.length} file(s). Commit them to ${keys.map(k => sectionByKey(k).file).join(', ')}.`, 'ok');
}

/* --- GitHub API commit --- */
async function ghRequest(path, opts = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No GitHub token saved (gear icon > Settings).');
    const res = await fetch(`https://api.github.com${path}`, {
        ...opts,
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...(opts.headers || {})
        }
    });
    if (!res.ok && res.status !== 404) {
        const body = await res.text().catch(() => '');
        throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
    }
    return res;
}

async function commitToGitHub() {
    const merged = buildMergedSections();
    const keys = Object.keys(merged);
    if (!keys.length) { setStatus('upload-commit-status', 'Nothing to post.', 'error'); return; }

    const { owner, repo, branch } = CONFIG.github;
    setStatus('upload-commit-status', 'Committing to GitHub ...', 'busy');

    try {
        for (const key of keys) {
            const sec = sectionByKey(key);
            const path = sec.file;
            const api = `/repos/${owner}/${repo}/contents/${path}`;

            /* Get current sha if the file exists. */
            let sha;
            const getRes = await ghRequest(`${api}?ref=${branch}&t=${Date.now()}`);
            if (getRes.status === 200) sha = (await getRes.json()).sha;

            const body = {
                message: `Curated: ${sec.label} (${merged[key].total_count} articles)`,
                content: b64encodeUtf8(JSON.stringify(merged[key], null, 2)),
                branch
            };
            if (sha) body.sha = sha;

            const putRes = await ghRequest(api, { method: 'PUT', body: JSON.stringify(body) });
            if (putRes.status === 404) throw new Error(`Could not write ${path} (check token repo access).`);
        }
        /* Reflect the commit immediately; the Pages deploy itself
           takes about a minute, so refetching now would be stale. */
        for (const key of keys) {
            state.news[key] = {
                articles: merged[key].articles,
                last_updated: merged[key].last_updated,
                loadedFrom: sectionByKey(key).file
            };
        }
        setStatus('upload-commit-status',
            `Posted ${keys.length} section(s). GitHub Pages refreshes in about a minute.`, 'ok');
        setTimeout(() => { closeUpload(); renderNews(); }, 1600);
    } catch (err) {
        setStatus('upload-commit-status', String(err.message || err), 'error');
    }
}

/* ------------------------------------------------------------
   10. Settings (token)
   ------------------------------------------------------------ */
function openSettings(ev) {
    ev?.stopPropagation();
    document.getElementById('gh-token').value = localStorage.getItem(TOKEN_KEY) || '';
    document.getElementById('settings-status').textContent = '';
    document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}
function saveToken() {
    const v = document.getElementById('gh-token').value.trim();
    if (!v) { setStatus('settings-status', 'Token is empty.', 'error'); return; }
    localStorage.setItem(TOKEN_KEY, v);
    setStatus('settings-status', 'Saved to this browser.', 'ok');
    renderStatusBar();
}
function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    document.getElementById('gh-token').value = '';
    setStatus('settings-status', 'Token removed.', 'ok');
    renderStatusBar();
}

/* ------------------------------------------------------------
   11. Weather terminal
   Field names match the flat structure written by the
   fetch-weather workflow (Ambient Weather API).
   ------------------------------------------------------------ */
function fmtNum(val, decimals = 1) {
    const n = Number(val);
    return (val === null || val === undefined || isNaN(n)) ? 'N/A' : n.toFixed(decimals);
}

function cardinal(deg) {
    if (deg === null || deg === undefined) return '';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
}

function uvRisk(uv) {
    if (!uv || uv < 3) return 'Low';
    if (uv < 6) return 'Moderate';
    if (uv < 8) return 'High';
    if (uv < 11) return 'Very High';
    return 'Extreme';
}

async function loadWeather() {
    const box = document.getElementById('weather-data');
    try {
        let d = await fetchJson(CONFIG.weatherFile);
        if (Array.isArray(d)) d = d[0] || {};
        if (d.lastData) d = { ...d, ...d.lastData };

        const trend = (d.baromrelin || 0) > 30.0 ? 'rising'
                    : (d.baromrelin || 0) < 29.8 ? 'falling' : 'steady';

        const groups = [
            ['outdoor', [
                ['temp',       fmtNum(d.tempf), '°F'],
                ['high / low', `${fmtNum(d.tempmaxf)} / ${fmtNum(d.tempminf)}`, '°F'],
                ['feels_like', fmtNum(d.feelsLike), '°F'],
                ['dew_point',  fmtNum(d.dewPoint), '°F']
            ]],
            ['wind', [
                ['speed',     fmtNum(d.windspeedmph), 'mph'],
                ['gust',      fmtNum(d.windgustmph), 'mph'],
                ['direction', d.winddir != null ? `${d.winddir}° ${cardinal(d.winddir)}` : 'N/A', '']
            ]],
            ['rain', [
                ['today',   fmtNum(d.dailyrainin, 2), 'in'],
                ['month',   fmtNum(d.monthlyrainin, 2), 'in'],
                ['total',   fmtNum(d.totalrainin, 2), 'in']
            ]],
            ['pressure', [
                ['relative', fmtNum(d.baromrelin, 2), 'inHg'],
                ['trend',    trend, '']
            ]],
            ['humidity', [
                ['outdoor', fmtNum(d.humidity, 0), '%'],
                ['indoor',  fmtNum(d.humidityin, 0), '%']
            ]],
            ['indoor', [
                ['temp',     fmtNum(d.tempinf), '°F'],
                ['humidity', fmtNum(d.humidityin, 0), '%']
            ]],
            ['uv_index', [
                ['current', fmtNum(d.uv, 0), ''],
                ['risk',    uvRisk(d.uv), '']
            ]],
            ['solar', [
                ['radiation', fmtNum(d.solarradiation, 0), 'W/m²'],
                ['level', d.solarradiation > 800 ? 'Very High'
                        : d.solarradiation > 500 ? 'High' : 'Moderate', '']
            ]]
        ];

        const when = d.date || d.dateutc || null;
        const stamp = when
            ? ` <span class="tok-comment">// ${esc(new Date(isNaN(when) ? when : Number(when)).toLocaleString())}</span>`
            : '';

        box.innerHTML = `
            <div class="term-line"><span class="prompt">$</span> cat ${CONFIG.weatherFile}${stamp}</div>
            <div class="term-groups">
                ${groups.map(([title, rows]) => `
                <div class="term-group">
                    <div class="term-group-title">// ${title}</div>
                    ${rows.map(([k, v, u]) => `
                    <div class="term-kv">
                        <span class="k">${k}</span>
                        <span><span class="v">${v}</span>${u ? ` <span class="u">${u}</span>` : ''}</span>
                    </div>`).join('')}
                </div>`).join('')}
            </div>`;
    } catch {
        box.innerHTML = `<div class="term-line tok-error">// weather data unavailable —
            run the Fetch Weather Data workflow in GitHub Actions.</div>`;
    }
}

/* ------------------------------------------------------------
   12. Init
   ------------------------------------------------------------ */
function tickClock() {
    document.getElementById('clock').textContent =
        new Date().toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
}

document.addEventListener('DOMContentLoaded', () => {
    renderQuickLinks();
    loadNews();
    loadWeather();
    tickClock();
    setInterval(tickClock, 30000);

    document.getElementById('news-content').addEventListener('change', (ev) => {
        const box = ev.target.closest('.sel-box');
        if (box) toggleSelect(box.dataset.url, box.checked);
    });

    document.getElementById('upload-file').addEventListener('change', async (ev) => {
        const f = ev.target.files?.[0];
        if (!f) return;
        document.getElementById('upload-text').value = await f.text();
        setStatus('upload-parse-status', `Loaded ${f.name}. Click Parse & preview.`, 'ok');
    });

    /* close modals on backdrop click / Escape */
    for (const id of ['upload-modal', 'settings-modal']) {
        document.getElementById(id).addEventListener('click', (ev) => {
            if (ev.target.id === id) ev.target.classList.add('hidden');
        });
    }
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
            document.getElementById('upload-modal').classList.add('hidden');
            document.getElementById('settings-modal').classList.add('hidden');
        }
    });
});
