// Configuration - Quick Links from profthieme.github.io/links/
const CONFIG = {
    // Quick Links organized by sections with Font Awesome icons
    quickLinks: {
        'Personal': [
            { name: 'Amazon', url: 'http://www.amazon.com/', icon: 'fab fa-amazon' },
            { name: 'Cozi', url: 'https://www.cozi.com/', icon: 'fas fa-calendar-check' },
            { name: 'GitHub', url: 'https://github.com/profthieme', icon: 'fab fa-github' },
            { name: 'IMDb', url: 'https://www.imdb.com/', icon: 'fas fa-film' },
            { name: 'JustWatch', url: 'https://www.justwatch.com/', icon: 'fas fa-tv' },
            { name: 'Kroger', url: 'https://www.kroger.com/rx/dashboard', icon: 'fas fa-pills' },
            { name: 'McCulley', url: 'http://mcculleyallergy.com/', icon: 'fas fa-user-md' },
            { name: 'Next Episode', url: 'https://next-episode.net/', icon: 'fas fa-tv' },
            { name: 'Pandora', url: 'https://www.pandora.com/', icon: 'fas fa-music' },
            { name: 'MyUTK', url: 'https://secure.touchnet.com/C21610_tsa/web/login.jsp', icon: 'fas fa-university' }
        ],
        'Work': [
            { name: 'EBSCO', url: 'https://ezproxy.memphis.edu:3443/login?url=https://search.ebscohost.com/login.aspx?profile=ehost&groupid=main&defaultdb=bsu&authtype=ip,uid&custid=s3652670', icon: 'fas fa-book' },
            { name: 'VitalSource', url: 'https://www.vitalsource.com/', icon: 'fas fa-book-open' },
            { name: 'Canvas', url: 'https://memphis.instructure.com/', icon: 'fas fa-graduation-cap' },
            { name: 'UofM Email', url: 'https://ummail.memphis.edu/', icon: 'fas fa-envelope' },
            { name: 'Faculty Senate', url: 'http://www.memphis.edu/facultysenate/', icon: 'fas fa-users' },
            { name: 'Fogelman', url: 'http://memphis.edu/fcbe/', icon: 'fas fa-building' },
            { name: 'HBS Press', url: 'https://cb.hbsp.harvard.edu/', icon: 'fas fa-book' },
            { name: 'Interlibrary', url: 'https://itlibloan.memphis.edu/', icon: 'fas fa-book' },
            { name: 'Taylor & Francis', url: 'https://www-taylorfrancis-com.ezproxy.memphis.edu/', icon: 'fas fa-file-alt' },
            { name: 'UofM', url: 'http://memphis.edu/', icon: 'fas fa-university' },
            { name: 'Libraries', url: 'http://www.memphis.edu/libraries/', icon: 'fas fa-book' },
            { name: 'Portal', url: 'https://portal.memphis.edu/', icon: 'fas fa-id-card' },
            { name: 'UMware', url: 'http://umware.memphis.edu/', icon: 'fas fa-desktop' }
        ],
        'Weather': [
            { name: 'Ambient', url: 'https://dashboard.ambientweather.net/devices/public/e38deadd664d7b3db91ec313040ea3b3', icon: 'fas fa-cloud-sun' },
            { name: 'Weatherbug', url: 'https://weather.weatherbug.com/', icon: 'fas fa-cloud' },
            { name: 'Wunderground', url: 'https://www.wunderground.com/dashboard/pws/KTNCOLLI33', icon: 'fas fa-thermometer-half' }
        ]
    },
    
    weatherDataUrl: './data/weather.json',
    newsDataUrl: './data/news.json'
};

let newsArticles = [];

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

// Render quick links as icons
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
                        <i class="${link.icon}"></i>
                        <span class="link-icon-label">${link.name}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
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
        document.getElementById('weather-data').innerHTML = `
            <div class="loading">Weather data unavailable</div>
        `;
    }
}

// Render weather tiles
function renderWeatherTiles(data) {
    const container = document.getElementById('weather-data');
    
    const fmt = (val, decimals = 1) => {
        if (val === undefined || val === null || isNaN(val)) return 'N/A';
        return decimals === 0 ? val.toFixed(0) : val.toFixed(decimals);
    };
    
    const getCardinal = (deg) => {
        if (deg === undefined || deg === null) return 'N/A';
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(deg / 22.5) % 16;
        return dirs[index];
    };
    
    const getUvRisk = (uv) => {
        if (!uv || uv < 3) return { level: 'Low', class: '' };
        if (uv < 6) return { level: 'Moderate', class: 'moderate' };
        if (uv < 8) return { level: 'High', class: 'high' };
        if (uv < 11) return { level: 'Very High', class: 'high' };
        return { level: 'Extreme', class: 'extreme' };
    };
    
    const uvData = getUvRisk(data.uv);
    const uvDots = [];
    for (let i = 1; i <= 11; i++) {
        let dotClass = '';
        if (i <= Math.floor(data.uv || 0)) {
            if (i <= 2) dotClass = '';
            else if (i <= 5) dotClass = 'moderate';
            else if (i <= 7) dotClass = 'high';
            else dotClass = 'extreme';
        }
        uvDots.push(`<div class="uv-dot ${dotClass ? 'active ' + dotClass : ''}"></div>`);
    }
    
    const tiles = [];
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-thermometer-half"></i> Outdoor</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Temperature</span>
                    <span class="stat-value primary">${fmt(data.tempf, 1)}°F</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">High / Low</span>
                    <span class="stat-value">${fmt(data.tempmaxf, 1)}° / ${fmt(data.tempminf, 1)}°</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Feels Like</span>
                    <span class="stat-value">${fmt(data.feelsLike, 1)}°F</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Dew Point</span>
                    <span class="stat-value">${fmt(data.dewPoint, 1)}°F</span>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-home"></i> Indoor</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Temperature</span>
                    <span class="stat-value">${fmt(data.tempinf, 1)}°F</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Humidity</span>
                    <span class="stat-value">${fmt(data.humidityin, 0)}%</span>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-wind"></i> Wind</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Speed</span>
                    <span class="stat-value">${fmt(data.windspeedmph, 1)} mph</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Gust</span>
                    <span class="stat-value">${fmt(data.windgustmph, 1)} mph</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Direction</span>
                    <span class="stat-value">${data.winddir ? `${data.winddir}° (${getCardinal(data.winddir)})` : 'N/A'}</span>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-cloud-rain"></i> Rain</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Daily</span>
                    <span class="stat-value">${fmt(data.dailyrainin, 2)} in</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Monthly</span>
                    <span class="stat-value">${fmt(data.monthlyrainin, 2)} in</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">${fmt(data.totalrainin, 2)} in</span>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-tachometer-alt"></i> Pressure</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Relative</span>
                    <span class="stat-value primary">${fmt(data.baromrelin, 2)} inHg</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Trend</span>
                    <span class="stat-value">${(data.baromrelin || 0) > 30.0 ? '↑ Rising' : (data.baromrelin || 0) < 29.8 ? '↓ Falling' : '→ Steady'}</span>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-tint"></i> Humidity</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Outdoor</span>
                    <span class="stat-value primary">${fmt(data.humidity, 0)}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Indoor</span>
                    <span class="stat-value">${fmt(data.humidityin, 0)}%</span>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-sun"></i> UV Index</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Current</span>
                    <span class="stat-value primary">${fmt(data.uv, 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Risk</span>
                    <span class="stat-value"><span class="alert-badge ${uvData.class}">${uvData.level}</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Scale</span>
                    <div class="uv-risk">${uvDots.join('')}</div>
                </div>
            </div>
        </div>
    `);
    
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-sun"></i> Solar</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Radiation</span>
                    <span class="stat-value primary">${fmt(data.solarradiation, 0)} W/m²</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Level</span>
                    <span class="stat-value">${data.solarradiation > 800 ? 'Very High' : data.solarradiation > 500 ? 'High' : 'Moderate'}</span>
                </div>
            </div>
        </div>
    `);
    
    container.innerHTML = `<div class="weather-tiles">${tiles.join('')}</div>`;
}

// Load news data
async function loadNewsData() {
    try {
        const response = await fetch(CONFIG.newsDataUrl + '?t=' + Date.now());
        if (!response.ok) throw new Error('News data not available');
        
        const data = await response.json();
        newsArticles = data.articles || [];
        renderNewsPulldown(newsArticles);
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('news-pulldown').innerHTML = `
            <div class="loading">News data unavailable</div>
        `;
    }
}

// Render news as nested pulldown
function renderNewsPulldown(articles) {
    const container = document.getElementById('news-pulldown');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles curated yet</div>';
        return;
    }
    
    const grouped = {
        'AI + Business': articles.filter(a => a.theme === 'AI + Business' || a.category === 'ai-business'),
        'AI + Higher Ed': articles.filter(a => a.theme === 'AI + Higher Ed' || a.category === 'ai-education'),
        'AI Technology': articles.filter(a => a.theme === 'AI Technology' || a.category === 'ai-tech'),
        'AI General': articles.filter(a => !a.theme || a.theme === 'AI General')
    };
    
    const nonEmptyGroups = Object.entries(grouped).filter(([_, items]) => items.length > 0);
    
    const sectionIcons = {
        'AI + Business': 'fas fa-briefcase',
        'AI + Higher Ed': 'fas fa-graduation-cap',
        'AI Technology': 'fas fa-microchip',
        'AI General': 'fas fa-robot'
    };
    
    const html = nonEmptyGroups.map(([category, items], index) => `
        <div class="pulldown-item ${index === 0 ? 'active' : ''}">
            <div class="pulldown-header" onclick="toggleNewsPulldown(this)">
                <div class="pulldown-title">
                    <i class="${sectionIcons[category] || 'fas fa-newspaper'}"></i>
                    ${category}
                    <span class="pulldown-count">${items.length}</span>
                </div>
                <i class="fas fa-chevron-down pulldown-icon"></i>
            </div>
            <div class="pulldown-content">
                <div class="articles-list">
                    ${items.map((article) => `
                        <div class="article-item ${article.category === 'ai-business' ? 'ai-business' : ''}">
                            <div class="article-title" onclick="window.open('${article.url}', '_blank')">
                                ${article.title}
                            </div>
                            <div class="article-meta">
                                <span class="article-source">${article.source}</span> • 
                                <span class="article-date">${formatDate(article.date)}</span>
                            </div>
                            <div class="article-synopsis">${article.synopsis || 'No synopsis available'}</div>
                            ${article.theme ? `<span class="article-tag ${article.category === 'ai-business' ? 'ai-business' : ''}">${article.theme}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `<div class="news-pulldown">${html}</div>`;
}

// Toggle news pulldown
function toggleNewsPulldown(header) {
    const item = header.parentElement;
    const wasActive = item.classList.contains('active');
    
    document.querySelectorAll('.pulldown-item').forEach(i => i.classList.remove('active'));
    
    if (!wasActive) {
        item.classList.add('active');
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Update timestamp
function updateLastUpdated() {
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
}