// Configuration - Quick Links with LOCAL images (copied from profthieme/links/images)
const CONFIG = {
    // Local image path - images are stored in this repo
    imageBaseUrl: './images/',
    
    // Quick Links organized by sections with image filenames
    quickLinks: {
        'Personal': [
            { name: 'Amazon', url: 'http://www.amazon.com/', image: 'amazon40.jpg' },
            { name: 'Cozi', url: 'https://www.cozi.com/', image: 'cozi.jpg' },
            { name: 'GitHub', url: 'https://github.com/profthieme', image: 'github.gif' },
            { name: 'IMDb', url: 'https://www.imdb.com/', image: 'imdb.jpg' },
            { name: 'JustWatch', url: 'https://www.justwatch.com/', image: 'justwatch.png' },
            { name: 'Kroger', url: 'https://www.kroger.com/rx/dashboard', image: 'kroger.gif' },
            { name: 'McCulley', url: 'http://mcculleyallergy.com/', image: 'mcculley.jpg' },
            { name: 'Next Episode', url: 'https://next-episode.net/', image: 'nextepisode.jpg' },
            { name: 'Pandora', url: 'https://www.pandora.com/', image: 'pandora.gif' },
            { name: 'MyUTK', url: 'https://secure.touchnet.com/C21610_tsa/web/login.jsp', image: 'utm.jpg' }
        ],
        'Work': [
            { name: 'EBSCO', url: 'https://ezproxy.memphis.edu:3443/login?url=https://search.ebscohost.com/login.aspx?profile=ehost&groupid=main&defaultdb=bsu&authtype=ip,uid&custid=s3652670', image: 'ebsco.gif' },
            { name: 'VitalSource', url: 'https://www.vitalsource.com/', image: 'vitalsource.jpg' },
            { name: 'Canvas', url: 'https://memphis.instructure.com/', image: 'canvas.png' },
            { name: 'UofM Email', url: 'https://ummail.memphis.edu/', image: 'email.gif' },
            { name: 'Faculty Senate', url: 'http://www.memphis.edu/facultysenate/', image: 'facultysenate.jpg' },
            { name: 'Fogelman', url: 'http://memphis.edu/fcbe/', image: 'fogelman.jpg' },
            { name: 'HBS Press', url: 'https://cb.hbsp.harvard.edu/', image: 'harvardbusinesspress.jpg' },
            { name: 'Interlibrary', url: 'https://itlibloan.memphis.edu/', image: 'illiad.jpg' },
            { name: 'Taylor & Francis', url: 'https://www-taylorfrancis-com.ezproxy.memphis.edu/', image: 'taylorfrancis.gif' },
            { name: 'UofM', url: 'http://memphis.edu/', image: 'universityofmemphis.jpg' },
            { name: 'Libraries', url: 'http://www.memphis.edu/libraries/', image: 'libraries.jpg' },
            { name: 'Portal', url: 'https://portal.memphis.edu/', image: 'UofMportal.jpg' },
            { name: 'UMware', url: 'http://umware.memphis.edu/', image: 'vmware.gif' }
        ],
        'Weather': [
            { name: 'Ambient', url: 'https://dashboard.ambientweather.net/devices/public/e38deadd664d7b3db91ec313040ea3b3', image: 'ambientweather.jpg' },
            { name: 'Weatherbug', url: 'https://weather.weatherbug.com/', image: 'weatherbug.jpg' },
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
                        <img src="${CONFIG.imageBaseUrl}${link.image}" alt="${link.name}" onerror="this.style.display='none'">
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
        // Force fresh fetch by adding unique timestamp and bypassing cache
        const cacheBuster = Date.now();
        const url = CONFIG.newsDataUrl + '?t=' + cacheBuster + '&refresh=' + cacheBuster;
        
        console.log('Refreshing news from:', url);
        
        // Use fetch with cache: 'reload' to bypass browser cache
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
        
        if (!data.articles || data.articles.length === 0) {
            throw new Error('No articles in response');
        }
        
        newsArticles = data.articles;
        newsLastFetched = new Date();
        
        console.log('News refreshed successfully:', newsArticles.length, 'articles');
        
        // Re-render the news section
        renderNewsPulldown(newsArticles);
        updateLastUpdated();
        
        // Show success message
        alert(`Refreshed ${newsArticles.length} articles at ${newsLastFetched.toLocaleTimeString()}`);
        
    } catch (error) {
        console.error('Error refreshing news:', error);
        alert('Failed to refresh news: ' + error.message + '\n\nMake sure the GitHub Actions workflow has run recently to update news.json');
    } finally {
        // Remove spinning animation after delay
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
        newsLastFetched = new Date();
        
        console.log('Loaded', newsArticles.length, 'news articles');
        renderNewsPulldown(newsArticles);
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('news-pulldown').innerHTML = `
            <div class="loading">
                News data unavailable.<br>
                <small>Click Refresh button or wait for next workflow run.</small>
            </div>
        `;
    }
}

// Render news with explicit AI in Higher Education section
function renderNewsPulldown(articles) {
    const container = document.getElementById('news-pulldown');
    
    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles curated yet. Click Refresh or wait for workflow.</div>';
        return;
    }
    
    // EXPLICIT categorization - check theme and category fields
    const aiBusiness = articles.filter(a => 
        a.category === 'ai-business' || 
        a.theme === 'AI + Business' ||
        (a.theme && a.theme.includes('Business'))
    );
    
    const aiEducation = articles.filter(a => 
        a.category === 'ai-education' || 
        a.theme === 'AI + Higher Ed' ||
        (a.theme && a.theme.includes('Higher Ed')) ||
        (a.theme && a.theme.includes('Education'))
    );
    
    const aiTechnology = articles.filter(a => 
        a.category === 'ai-tech' || 
        a.theme === 'AI Technology' ||
        (a.theme && a.theme.includes('Technology'))
    );
    
    // Everything else goes to General
    const aiGeneral = articles.filter(a => 
        !aiBusiness.includes(a) && 
        !aiEducation.includes(a) && 
        !aiTechnology.includes(a)
    );
    
    console.log('Article counts:', {
        'AI + Business': aiBusiness.length,
        'AI in Higher Education': aiEducation.length,
        'AI Technology': aiTechnology.length,
        'AI General': aiGeneral.length
    });
    
    const sections = [
        { name: 'AI + Business', icon: 'fas fa-briefcase', articles: aiBusiness, class: 'ai-business' },
        { name: 'AI in Higher Education', icon: 'fas fa-graduation-cap', articles: aiEducation, class: 'ai-education' },
        { name: 'AI Technology', icon: 'fas fa-microchip', articles: aiTechnology, class: 'ai-tech' },
        { name: 'AI General', icon: 'fas fa-robot', articles: aiGeneral, class: '' }
    ].filter(s => s.articles.length > 0);
    
    if (sections.length === 0) {
        container.innerHTML = '<div class="loading">No articles found. Click Refresh.</div>';
        return;
    }
    
    const html = sections.map((section, index) => `
        <div class="pulldown-item ${index === 0 ? 'active' : ''}">
            <div class="pulldown-header" onclick="toggleNewsPulldown(this)">
                <div class="pulldown-title">
                    <i class="${section.icon}"></i>
                    ${section.name}
                    <span class="pulldown-count">${section.articles.length}</span>
                </div>
                <i class="fas fa-chevron-down pulldown-icon"></i>
            </div>
            <div class="pulldown-content">
                <div class="articles-list">
                    ${section.articles.map((article) => `
                        <div class="article-item ${section.class}">
                            <div class="article-title" onclick="window.open('${article.url}', '_blank')">
                                ${article.title}
                            </div>
                            <div class="article-meta">
                                <span class="article-source">${article.source}</span> • 
                                <span class="article-date">${formatDate(article.date)}</span>
                            </div>
                            <div class="article-synopsis">${article.synopsis ? article.synopsis.substring(0, 400) + (article.synopsis.length > 400 ? '...' : '') : 'No synopsis available'}</div>
                            ${article.theme ? `<span class="article-tag ${section.class}">${article.theme}</span>` : ''}
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
    let text = new Date().toLocaleString();
    if (newsLastFetched) {
        text += ` (News: ${newsLastFetched.toLocaleTimeString()})`;
    }
    document.getElementById('lastUpdated').textContent = text;
}