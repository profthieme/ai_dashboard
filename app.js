// Configuration - Quick Links with LOCAL images
const CONFIG = {
    imageBaseUrl: './images/',
    
    // Quick Links - using actual image filenames from ./images/ folder
    quickLinks: {
        'Personal': [
            { name: 'Amazon', url: 'http://www.amazon.com/', image: 'amazon40.jpg' },
            { name: 'Cozi', url: 'https://www.cozi.com/', image: 'cozi.jpg' },
            { name: 'GitHub', url: 'https://github.com/profthieme', image: 'github.jpg' },
            { name: 'IMDb', url: 'https://www.imdb.com/', image: 'imdb.jpg' },
            { name: 'JustWatch', url: 'https://www.justwatch.com/', image: 'justwatch.jpg' },
            { name: 'Kroger', url: 'https://www.kroger.com/rx/dashboard', image: 'kroger.png' },
            { name: 'McCulley', url: 'http://mcculleyallergy.com/', image: 'mcculley.jpg' },
            { name: 'Next Episode', url: 'https://next-episode.net/', image: 'next-episode50.jpg' },
            { name: 'Pandora', url: 'https://www.pandora.com/', image: 'pandora.jpg' },
            { name: 'MyUTK', url: 'https://secure.touchnet.com/C21610_tsa/web/login.jsp', image: 'utm.jpg' }
        ],
        'Work': [
            { name: 'EBSCO', url: 'https://ezproxy.memphis.edu:3443/login?url=https://search.ebscohost.com/login.aspx?profile=ehost&groupid=main&defaultdb=bsu&authtype=ip,uid&custid=s3652670', image: 'bsu.png' },
            { name: 'VitalSource', url: 'https://www.vitalsource.com/', image: 'vitalsource.jpg' },
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
    
    weatherDataUrl: './data/weather.json',
    newsDataUrl: './data/news.json'
};

let newsArticles = [];
let newsLastFetched = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    renderQuickLinks();
    await loadWeatherData();
    await loadNewsData();
    updateLastUpdated();
    // Open Quick Links by default
    setTimeout(() => {
        toggleCard('card-links');
    }, 100);
});

// Toggle card pulldown
function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    const wasActive = card.classList.contains('active');
    
    // Close all cards
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    
    // Open clicked card if it wasn't already open
    if (!wasActive) {
        card.classList.add('active');
    }
}

// Render quick links with local images
function renderQuickLinks() {
    const container = document.getElementById('quick-links');
    const sections = CONFIG.quickLinks;
    
    const sectionIcons = {
        'Personal': 'fas fa-home',
        'Work': 'fas fa-briefcase',
        'Weather': 'fas fa-cloud-sun'
    };
    
    const html = Object.entries(sections).map(([sectionName, links]) => `
        <div class="link-section">
            <div class="link-section-title">
                <i class="${sectionIcons[sectionName]}"></i>
                ${sectionName}
            </div>
            <div class="links-icon-grid">
                ${links.map(link => `
                    <a href="${link.url}" target="_blank" class="link-icon-item" title="${link.name}">
                        <img src="${CONFIG.imageBaseUrl}${link.image}" alt="${link.name}" 
                             onerror="console.error('Failed to load image:', '${link.image}'); this.style.display='none'; this.parentElement.innerHTML+='<span style=\"font-size:1.5rem;color:#ccc\">❓</span>';">
                        <span class="link-icon-label">${link.name}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Refresh news articles - FORCE reload from server
async function refreshNews(event) {
    if (event) event.stopPropagation();
    
    const btn = event.currentTarget;
    const icon = btn.querySelector('i');
    
    // Add spinning animation
    btn.classList.add('spinning');
    
    try {
        const cacheBuster = Date.now();
        const url = CONFIG.newsDataUrl + '?t=' + cacheBuster;
        
        console.log('[Dashboard] Refreshing news from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            cache: 'reload',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('[Dashboard] Raw news data:', data);
        
        if (!data.articles || data.articles.length === 0) {
            throw new Error('No articles in response');
        }
        
        newsArticles = data.articles;
        newsLastFetched = new Date();
        
        console.log('[Dashboard] News refreshed:', newsArticles.length, 'articles');
        
        // Log article categories
        const categories = {};
        newsArticles.forEach(a => {
            const cat = a.category || a.theme || 'uncategorized';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        console.log('[Dashboard] Articles by category:', categories);
        
        renderNewsPulldown(newsArticles);
        updateLastUpdated();
        
        alert(`✓ Refreshed ${newsArticles.length} articles at ${newsLastFetched.toLocaleTimeString()}`);
        
    } catch (error) {
        console.error('[Dashboard] Error refreshing news:', error);
        alert('✗ Failed to refresh: ' + error.message);
    } finally {
        setTimeout(() => {
            btn.classList.remove('spinning');
        }, 1000);
    }
}

// Load weather data
async function loadWeatherData() {
    try {
        const response = await fetch(CONFIG.weatherDataUrl + '?t=' + Date.now());
        if (!response.ok) throw new Error('Weather data not available');
        
        const data = await response.json();
        renderWeatherTiles(data);
    } catch (error) {
        console.error('Error loading weather:', error);
        document.getElementById('weather-data').innerHTML = '<div class="loading">Weather unavailable</div>';
    }
}

// Render weather tiles
function renderWeatherTiles(data) {
    const container = document.getElementById('weather-data');
    
    const fmt = (val, decimals = 1) => val != null ? val.toFixed(decimals) : 'N/A';
    
    const getCardinal = (deg) => {
        if (deg == null) return 'N/A';
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return dirs[Math.round(deg / 22.5) % 16];
    };
    
    const getUvRisk = (uv) => {
        if (!uv || uv < 3) return { level: 'Low', class: '' };
        if (uv < 6) return { level: 'Moderate', class: 'moderate' };
        if (uv < 8) return { level: 'High', class: 'high' };
        if (uv < 11) return { level: 'Very High', class: 'high' };
        return { level: 'Extreme', class: 'extreme' };
    };
    
    const uvData = getUvRisk(data.uv);
    const uvDots = Array.from({length: 11}, (_, i) => {
        const active = i < Math.floor(data.uv || 0);
        const cls = active ? (i < 3 ? '' : i < 6 ? 'moderate' : i < 8 ? 'high' : 'extreme') : '';
        return `<div class="uv-dot${cls ? ' active ' + cls : ''}"></div>`;
    });
    
    const tiles = [
        {
            title: 'Outdoor', icon: 'thermometer-half',
            stats: [
                ['Temperature', `${fmt(data.tempf, 1)}°F`, true],
                ['High / Low', `${fmt(data.tempmaxf, 1)}° / ${fmt(data.tempminf, 1)}°`],
                ['Feels Like', `${fmt(data.feelsLike, 1)}°F`],
                ['Dew Point', `${fmt(data.dewPoint, 1)}°F`]
            ]
        },
        {
            title: 'Indoor', icon: 'home',
            stats: [
                ['Temperature', `${fmt(data.tempinf, 1)}°F`],
                ['Humidity', `${fmt(data.humidityin, 0)}%`]
            ]
        },
        {
            title: 'Wind', icon: 'wind',
            stats: [
                ['Speed', `${fmt(data.windspeedmph, 1)} mph`],
                ['Gust', `${fmt(data.windgustmph, 1)} mph`],
                ['Direction', `${data.winddir ? data.winddir + '° (' + getCardinal(data.winddir) + ')' : 'N/A'}`]
            ]
        },
        {
            title: 'Rain', icon: 'cloud-rain',
            stats: [
                ['Daily', `${fmt(data.dailyrainin, 2)} in`],
                ['Monthly', `${fmt(data.monthlyrainin, 2)} in`],
                ['Total', `${fmt(data.totalrainin, 2)} in`]
            ]
        },
        {
            title: 'Pressure', icon: 'tachometer-alt',
            stats: [
                ['Relative', `${fmt(data.baromrelin, 2)} inHg`, true],
                ['Trend', (data.baromrelin || 0) > 30.0 ? '↑ Rising' : (data.baromrelin || 0) < 29.8 ? '↓ Falling' : '→ Steady']
            ]
        },
        {
            title: 'Humidity', icon: 'tint',
            stats: [
                ['Outdoor', `${fmt(data.humidity, 0)}%`, true],
                ['Indoor', `${fmt(data.humidityin, 0)}%`]
            ]
        },
        {
            title: 'UV Index', icon: 'sun',
            stats: [
                ['Current', `${fmt(data.uv, 0)}`, true],
                ['Risk', `<span class="alert-badge ${uvData.class}">${uvData.level}</span>`],
                ['Scale', `<div class="uv-risk">${uvDots.join('')}</div>`]
            ]
        },
        {
            title: 'Solar', icon: 'sun',
            stats: [
                ['Radiation', `${fmt(data.solarradiation, 0)} W/m²`, true],
                ['Level', data.solarradiation > 800 ? 'Very High' : data.solarradiation > 500 ? 'High' : 'Moderate']
            ]
        }
    ].map(tile => `
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-${tile.icon}"></i> ${tile.title}</h3>
            </div>
            <div class="tile-stats">
                ${tile.stats.map(([label, value, primary]) => `
                    <div class="stat-row">
                        <span class="stat-label">${label}</span>
                        <span class="stat-value${primary ? ' primary' : ''}">${value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `<div class="weather-tiles">${tiles}</div>`;
}

// Load news data
async function loadNewsData() {
    try {
        const response = await fetch(CONFIG.newsDataUrl + '?t=' + Date.now());
        if (!response.ok) throw new Error('News data not available');
        
        const data = await response.json();
        newsArticles = data.articles || [];
        newsLastFetched = new Date();
        
        console.log('[Dashboard] Loaded', newsArticles.length, 'articles');
        console.log('[Dashboard] Categories:', newsArticles.map(a => a.category || a.theme));
        
        renderNewsPulldown(newsArticles);
    } catch (error) {
        console.error('[Dashboard] Error loading news:', error);
        document.getElementById('news-pulldown').innerHTML = `
            <div class="loading">
                News unavailable.<br>
                <small>Click Refresh or use manual curation.</small>
            </div>
        `;
    }
}

// Render news with explicit category filtering
function renderNewsPulldown(articles) {
    const container = document.getElementById('news-pulldown');
    
    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles. Click Refresh or curate manually.</div>';
        return;
    }
    
    // EXPLICIT filtering by category field
    const sections = {
        'AI + Business': articles.filter(a => a.category === 'ai-business'),
        'AI in Higher Education': articles.filter(a => a.category === 'ai-education'),
        'AI Technology': articles.filter(a => a.category === 'ai-tech'),
        'AI General': articles.filter(a => !a.category || !['ai-business', 'ai-education', 'ai-tech'].includes(a.category))
    };
    
    console.log('[Dashboard] Section counts:', {
        'Business': sections['AI + Business'].length,
        'Education': sections['AI in Higher Education'].length,
        'Technology': sections['AI Technology'].length,
        'General': sections['AI General'].length
    });
    
    const sectionConfig = {
        'AI + Business': { icon: 'fa-briefcase', class: 'ai-business' },
        'AI in Higher Education': { icon: 'fa-graduation-cap', class: 'ai-education' },
        'AI Technology': { icon: 'fa-microchip', class: 'ai-tech' },
        'AI General': { icon: 'fa-robot', class: '' }
    };
    
    const html = Object.entries(sections)
        .filter(([_, items]) => items.length > 0)
        .map(([name, items], idx) => {
            const cfg = sectionConfig[name];
            return `
                <div class="pulldown-item ${idx === 0 ? 'active' : ''}">
                    <div class="pulldown-header" onclick="toggleNewsPulldown(this)">
                        <div class="pulldown-title">
                            <i class="fas ${cfg.icon}"></i>
                            ${name}
                            <span class="pulldown-count">${items.length}</span>
                        </div>
                        <i class="fas fa-chevron-down pulldown-icon"></i>
                    </div>
                    <div class="pulldown-content">
                        <div class="articles-list">
                            ${items.map(article => `
                                <div class="article-item ${cfg.class}">
                                    <div class="article-title" onclick="window.open('${article.url}', '_blank')">
                                        ${article.title}
                                    </div>
                                    <div class="article-meta">
                                        <span class="article-source">${article.source}</span> • 
                                        <span class="article-date">${formatDate(article.date)}</span>
                                    </div>
                                    <div class="article-synopsis">${article.synopsis ? article.synopsis.substring(0, 400) + (article.synopsis.length > 400 ? '...' : '') : 'No synopsis'}</div>
                                    ${article.theme ? `<span class="article-tag ${cfg.class}">${article.theme}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    
    container.innerHTML = `<div class="news-pulldown">${html}</div>`;
}

// Toggle news pulldown
function toggleNewsPulldown(header) {
    const item = header.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.pulldown-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Update timestamp
function updateLastUpdated() {
    let text = new Date().toLocaleString();
    if (newsLastFetched) text += ` (News: ${newsLastFetched.toLocaleTimeString()})`;
    document.getElementById('lastUpdated').textContent = text;
}