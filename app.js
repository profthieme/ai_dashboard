// Configuration - Quick Links from profthieme.github.io/links/
const CONFIG = {
    // Quick Links organized by sections (from https://profthieme.github.io/links/)
    quickLinks: {
        'Personal': [
            { name: 'Amazon', url: 'http://www.amazon.com/', icon: 'fab fa-amazon' },
            { name: 'Cozi', url: 'https://www.cozi.com/', icon: 'fas fa-calendar-alt' },
            { name: 'GitHub', url: 'https://github.com/profthieme', icon: 'fab fa-github' },
            { name: 'IMDb', url: 'https://www.imdb.com/', icon: 'fas fa-film' },
            { name: 'JustWatch', url: 'https://www.justwatch.com/', icon: 'fas fa-tv' },
            { name: 'Kroger pharmacy', url: 'https://www.kroger.com/rx/dashboard', icon: 'fas fa-pills' },
            { name: 'McCulley Allergy', url: 'http://mcculleyallergy.com/', icon: 'fas fa-user-md' },
            { name: 'Next Episode', url: 'https://next-episode.net/', icon: 'fas fa-tv' },
            { name: 'Pandora', url: 'https://www.pandora.com/', icon: 'fab fa-pandora' },
            { name: 'MyUTK', url: 'https://secure.touchnet.com/C21610_tsa/web/login.jsp', icon: 'fas fa-university' }
        ],
        'Work': [
            { name: 'EBSCO Business Source Ultimate', url: 'https://ezproxy.memphis.edu:3443/login?url=https://search.ebscohost.com/login.aspx?profile=ehost&groupid=main&defaultdb=bsu&authtype=ip,uid&custid=s3652670', icon: 'fas fa-book' },
            { name: 'VitalSource', url: 'https://www.vitalsource.com/', icon: 'fas fa-book-reader' },
            { name: 'Canvas', url: 'https://memphis.instructure.com/', icon: 'fas fa-graduation-cap' },
            { name: 'UofM Email', url: 'https://ummail.memphis.edu/', icon: 'fas fa-envelope' },
            { name: 'UofM Faculty Senate', url: 'http://www.memphis.edu/facultysenate/', icon: 'fas fa-users' },
            { name: 'Fogelman College of Business and Economics', url: 'http://memphis.edu/fcbe/', icon: 'fas fa-building' },
            { name: 'Harvard Business School Press', url: 'https://cb.hbsp.harvard.edu/', icon: 'fas fa-book' },
            { name: 'UofM Interlibrary Loan', url: 'https://itlibloan.memphis.edu/', icon: 'fas fa-book' },
            { name: 'Taylor & Francis Resources', url: 'https://www-taylorfrancis-com.ezproxy.memphis.edu/', icon: 'fas fa-file-alt' },
            { name: 'University of Memphis', url: 'http://memphis.edu/', icon: 'fas fa-university' },
            { name: 'U of M Libraries', url: 'http://www.memphis.edu/libraries/', icon: 'fas fa-library' },
            { name: 'UofM Portal', url: 'https://portal.memphis.edu/', icon: 'fas fa-id-card' },
            { name: 'UMware', url: 'http://umware.memphis.edu/', icon: 'fas fa-desktop' }
        ],
        'Weather': [
            { name: 'Ambient Weather', url: 'https://dashboard.ambientweather.net/devices/public/e38deadd664d7b3db91ec313040ea3b3', icon: 'fas fa-cloud-sun' },
            { name: 'Weatherbug', url: 'https://weather.weatherbug.com/', icon: 'fas fa-cloud' },
            { name: 'Weather Underground PWS KTNCOLLI33', url: 'https://www.wunderground.com/dashboard/pws/KTNCOLLI33', icon: 'fas fa-thermometer-half' }
        ]
    },
    
    // GitHub Pages data URLs (update these after deploying)
    weatherDataUrl: './data/weather.json',
    newsDataUrl: './data/news.json',
    
    // Open Notebook API endpoint (for desktop)
    openNotebookApi: 'http://host.docker.internal:5055'
};

// State
let newsArticles = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    renderQuickLinks();
    await loadWeatherData();
    await loadNewsData();
    updateLastUpdated();
});

// Render quick links organized by sections
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
                <i class="${sectionIcons[sectionName] || 'fas fa-link'}"></i>
                ${sectionName}
            </div>
            <div class="links-grid">
                ${links.map(link => `
                    <a href="${link.url}" target="_blank" class="link-item">
                        <i class="${link.icon}"></i>
                        <span class="link-name">${link.name}</span>
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
            <div class="weather-stat">
                <div class="label">Status</div>
                <div class="value" style="font-size: 1.2rem;">Data unavailable</div>
            </div>
        `;
    }
}

// Render weather data in Ambient Weather-style tiles
function renderWeatherTiles(data) {
    const container = document.getElementById('weather-data');
    
    const fmt = (val, decimals = 1) => {
        if (val === undefined || val === null || isNaN(val)) return 'N/A';
        return decimals === 0 ? val.toFixed(0) : val.toFixed(decimals);
    };
    
    const change = (val, suffix = '') => {
        if (val === undefined || val === null) return '—';
        const sign = val >= 0 ? '+' : '';
        return `${sign}${fmt(val, 1)}${suffix}`;
    };
    
    const getCardinal = (deg) => {
        if (deg === undefined || deg === null) return 'N/A';
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(deg / 22.5) % 16;
        return dirs[index];
    };
    
    const getUvRisk = (uv) => {
        if (!uv || uv < 3) return { level: 'Low', class: '', risk: 'low' };
        if (uv < 6) return { level: 'Moderate', class: 'moderate', risk: 'moderate' };
        if (uv < 8) return { level: 'High', class: 'high', risk: 'high' };
        if (uv < 11) return { level: 'Very High', class: 'high', risk: 'very-high' };
        return { level: 'Extreme', class: 'extreme', risk: 'extreme' };
    };
    
    const uvData = getUvRisk(data.uv);
    const uvDots = [];
    for (let i = 1; i <= 11; i++) {
        let dotClass = '';
        if (i <= Math.floor(data.uv || 0)) {
            if (i <= 2) dotClass = '';
            else if (i <= 5) dotClass = 'moderate';
            else if (i <= 7) dotClass = 'high';
            else if (i <= 10) dotClass = 'extreme';
            else dotClass = 'extreme';
        }
        uvDots.push(`<div class="uv-dot ${dotClass ? 'active ' + dotClass : ''}"></div>`);
    }
    
    const tiles = [];
    
    // Outdoor Temperature Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-thermometer-half"></i> Outdoor</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row with-subtext">
                    <span class="stat-label">Temperature</span>
                    <span class="stat-value primary">${fmt(data.tempf, 1)}<span class="stat-unit">°F</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">High / Low</span>
                    <span class="stat-value">${fmt(data.tempmaxf, 1)}° / ${fmt(data.tempminf, 1)}°</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Feels Like</span>
                    <span class="stat-value">${fmt(data.feelsLike, 1)}<span class="stat-unit">°F</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Dew Point</span>
                    <span class="stat-value">${fmt(data.dewPoint, 1)}<span class="stat-unit">°F</span></span>
                </div>
            </div>
        </div>
    `);
    
    // Indoor Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-home"></i> Indoor</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Temperature</span>
                    <span class="stat-value">${fmt(data.tempinf, 1)}<span class="stat-unit">°F</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Humidity</span>
                    <span class="stat-value">${fmt(data.humidityin, 0)}<span class="stat-unit">%</span></span>
                </div>
            </div>
        </div>
    `);
    
    // Wind Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-wind"></i> Wind</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Speed</span>
                    <span class="stat-value">${fmt(data.windspeedmph, 1)}<span class="stat-unit">mph</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Gust</span>
                    <span class="stat-value">${fmt(data.windgustmph, 1)}<span class="stat-unit">mph</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Direction</span>
                    <span class="stat-value">${data.winddir ? `${data.winddir}° (${getCardinal(data.winddir)})` : 'N/A'}</span>
                </div>
            </div>
        </div>
    `);
    
    // Rainfall Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-cloud-rain"></i> Rainfall</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Daily</span>
                    <span class="stat-value">${fmt(data.dailyrainin, 2)}<span class="stat-unit">in</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Monthly</span>
                    <span class="stat-value">${fmt(data.monthlyrainin, 2)}<span class="stat-unit">in</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">${fmt(data.totalrainin, 2)}<span class="stat-unit">in</span></span>
                </div>
            </div>
        </div>
    `);
    
    // Pressure Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-tachometer-alt"></i> Pressure</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Relative</span>
                    <span class="stat-value primary">${fmt(data.baromrelin, 2)}<span class="stat-unit">inHg</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Trend</span>
                    <span class="stat-value">${(data.baromrelin || 0) > 30.0 ? '↑ Rising' : (data.baromrelin || 0) < 29.8 ? '↓ Falling' : '→ Steady'}</span>
                </div>
            </div>
        </div>
    `);
    
    // Humidity Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-tint"></i> Humidity</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Outdoor</span>
                    <span class="stat-value primary">${fmt(data.humidity, 0)}<span class="stat-unit">%</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Indoor</span>
                    <span class="stat-value">${fmt(data.humidityin, 0)}<span class="stat-unit">%</span></span>
                </div>
            </div>
        </div>
    `);
    
    // UV Index Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-sun"></i> UV Index</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row with-subtext">
                    <span class="stat-label">Current UV</span>
                    <span class="stat-value primary">${fmt(data.uv, 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Risk Level</span>
                    <span class="stat-value"><span class="alert-badge ${uvData.class}">${uvData.level}</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">UV Scale</span>
                    <div class="uv-risk">${uvDots.join('')}</div>
                </div>
            </div>
        </div>
    `);
    
    // Solar Radiation Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-sun"></i> Solar Radiation</h3>
            </div>
            <div class="tile-stats">
                <div class="stat-row with-subtext">
                    <span class="stat-label">Current</span>
                    <span class="stat-value primary">${fmt(data.solarradiation, 0)}<span class="stat-unit">W/m²</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Level</span>
                    <span class="stat-value">${data.solarradiation > 800 ? 'Very High' : data.solarradiation > 500 ? 'High' : data.solarradiation > 200 ? 'Moderate' : 'Low'}</span>
                </div>
            </div>
        </div>
    `);
    
    container.innerHTML = `<div class="weather-tiles">${tiles.join('')}</div>`;
}

// Load news data and render as pulldown
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
            <div class="loading">
                <p>News data not available yet.</p>
                <p style="font-size: 0.85rem; margin-top: 10px;">The GitHub Actions workflow will populate this soon.</p>
            </div>
        `;
    }
}

// Render news as pulldown/accordion menu
function renderNewsPulldown(articles) {
    const container = document.getElementById('news-pulldown');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles curated yet. Check back later!</div>';
        return;
    }
    
    // Group articles by theme
    const grouped = {
        'AI + Business': articles.filter(a => a.theme === 'AI + Business' || a.category === 'ai-business'),
        'AI + Higher Ed': articles.filter(a => a.theme === 'AI + Higher Ed' || a.category === 'ai-education'),
        'AI Technology': articles.filter(a => a.theme === 'AI Technology' || a.category === 'ai-tech'),
        'AI General': articles.filter(a => !a.theme || a.theme === 'AI General')
    };
    
    // Filter out empty groups
    const nonEmptyGroups = Object.entries(grouped).filter(([_, items]) => items.length > 0);
    
    const sectionIcons = {
        'AI + Business': 'fas fa-briefcase',
        'AI + Higher Ed': 'fas fa-graduation-cap',
        'AI Technology': 'fas fa-microchip',
        'AI General': 'fas fa-robot'
    };
    
    const html = nonEmptyGroups.map(([category, items], index) => `
        <div class="pulldown-item ${index === 0 ? 'active' : ''}">
            <div class="pulldown-header" onclick="togglePulldown(this)">
                <div class="pulldown-title">
                    <i class="${sectionIcons[category] || 'fas fa-newspaper'}"></i>
                    ${category}
                    <span class="pulldown-count">${items.length}</span>
                </div>
                <div class="pulldown-icon">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="pulldown-content">
                <div class="articles-list">
                    ${items.map((article, idx) => `
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

// Toggle pulldown accordion
function togglePulldown(header) {
    const item = header.parentElement;
    const wasActive = item.classList.contains('active');
    
    // Close all items
    document.querySelectorAll('.pulldown-item').forEach(i => i.classList.remove('active'));
    
    // Open clicked item if it wasn't already open
    if (!wasActive) {
        item.classList.add('active');
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleString();
}