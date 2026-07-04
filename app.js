// Configuration - customize these for your needs
const CONFIG = {
    // Add your frequently-used websites here
    quickLinks: [
        { name: 'Gmail', url: 'https://gmail.com', icon: 'fas fa-envelope' },
        { name: 'Google Scholar', url: 'https://scholar.google.com', icon: 'fas fa-graduation-cap' },
        { name: 'HBR', url: 'https://hbr.org', icon: 'fas fa-book' },
        { name: 'Chronicle', url: 'https://chronicle.com', icon: 'fas fa-newspaper' },
        { name: 'ArXiv', url: 'https://arxiv.org', icon: 'fas fa-file-alt' },
        { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
        { name: 'Open Notebook', url: 'http://localhost:5055', icon: 'fas fa-microphone' },
        { name: 'Ambient Weather', url: 'https://ambientweather.net', icon: 'fas fa-cloud-sun' }
    ],
    
    // GitHub Pages data URLs (update these after deploying)
    weatherDataUrl: './data/weather.json',
    newsDataUrl: './data/news.json',
    
    // Open Notebook API endpoint (for desktop)
    openNotebookApi: 'http://host.docker.internal:5055'
};

// State
let newsArticles = [];
let selectedArticles = new Set();

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    initQuickLinks();
    await loadWeatherData();
    await loadNewsData();
    setupEventListeners();
    updateLastUpdated();
});

// Initialize quick links
function initQuickLinks() {
    const linksContainer = document.getElementById('quick-links');
    linksContainer.innerHTML = CONFIG.quickLinks.map(link => `
        <a href="${link.url}" target="_blank" class="link-item">
            <i class="${link.icon}"></i>
            <span class="link-name">${link.name}</span>
        </a>
    `).join('');
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
    
    // Helper function to format numbers safely
    const fmt = (val, decimals = 1) => {
        if (val === undefined || val === null || isNaN(val)) return 'N/A';
        return decimals === 0 ? val.toFixed(0) : val.toFixed(decimals);
    };
    
    // Helper function to get change from yesterday (if available in historical data)
    // For now, we'll show "—" since weather.json doesn't include yesterday's data
    const change = (val, suffix = '') => {
        if (val === undefined || val === null) return '—';
        const sign = val >= 0 ? '+' : '';
        return `${sign}${fmt(val, 1)}${suffix}`;
    };
    
    // Get cardinal direction from degrees
    const getCardinal = (deg) => {
        if (deg === undefined || deg === null) return 'N/A';
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(deg / 22.5) % 16;
        return dirs[index];
    };
    
    // Get UV risk level and badge
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
    
    // Build tiles HTML
    const tiles = [];
    
    // 1. Outdoor Temperature Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-thermometer-half"></i> Outdoor</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row with-subtext">
                    <span class="stat-label">Temperature</span>
                    <span class="stat-value primary">${fmt(data.tempf, 1)}<span class="stat-unit">°F</span></span>
                </div>
                <div class="stat-change">From Yesterday: ${change(data.tempfYesterday, '°F')}</div>
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
                <div class="stat-row">
                    <span class="stat-label">From Yesterday</span>
                    <span class="stat-value">${change(data.dewPointYesterday, '°F')}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Feels Like (Heat Index)</span>
                    <span class="stat-value">${fmt(data.feelsLike, 1)}<span class="stat-unit">°F</span></span>
                </div>
            </div>
        </div>
    `);
    
    // 2. Indoor Temperature Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-home"></i> Indoor</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Temperature</span>
                    <span class="stat-value primary">${fmt(data.tempinf, 1)}<span class="stat-unit">°F</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Humidity</span>
                    <span class="stat-value">${fmt(data.humidityin, 0)}<span class="stat-unit">%</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Feels Like</span>
                    <span class="stat-value">${fmt(data.feelsLikein, 1)}<span class="stat-unit">°F</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Dew Point</span>
                    <span class="stat-value">${fmt(data.dewPointin, 1)}<span class="stat-unit">°F</span></span>
                </div>
            </div>
        </div>
    `);
    
    // 3. Wind Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-wind"></i> Wind</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
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
                    <span class="stat-label">Max Daily Gust</span>
                    <span class="stat-value">${fmt(data.maxdailygust, 1)}<span class="stat-unit">mph</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Direction</span>
                    <span class="stat-value">${data.winddir ? `${data.winddir}°` : 'N/A'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">${getCardinal(data.winddir)}</span>
                    <span class="stat-value">${data.winddir ? `From ${getCardinal(data.winddir)}` : 'N/A'}</span>
                </div>
            </div>
        </div>
    `);
    
    // 4. Rainfall Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-cloud-rain"></i> Rainfall</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Rate</span>
                    <span class="stat-value">${fmt(data.hourlyrainin, 2)}<span class="stat-unit">in/hr</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Daily</span>
                    <span class="stat-value">${fmt(data.dailyrainin, 2)}<span class="stat-unit">in</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Weekly</span>
                    <span class="stat-value">${fmt(data.weeklyrainin, 2)}<span class="stat-unit">in</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Event</span>
                    <span class="stat-value">${fmt(data.eventrainin, 2)}<span class="stat-unit">in</span></span>
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
    
    // 5. Pressure Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-tachometer-alt"></i> Pressure</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Relative</span>
                    <span class="stat-value primary">${fmt(data.baromrelin, 2)}<span class="stat-unit">inHg</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Absolute</span>
                    <span class="stat-value">${fmt(data.baromabsin, 2)}<span class="stat-unit">inHg</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Rate</span>
                    <span class="stat-value">${fmt(data.baromrelinRate ?? data.baromrelin, 2)}<span class="stat-unit">inHg/hr</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Trend</span>
                    <span class="stat-value">${(data.baromrelin ?? 0) > 30.0 ? '↑ Rising' : (data.baromrelin ?? 0) < 29.8 ? '↓ Falling' : '→ Steady'}</span>
                </div>
            </div>
        </div>
    `);
    
    // 6. Humidity Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-tint"></i> Humidity</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row">
                    <span class="stat-label">Outdoor</span>
                    <span class="stat-value primary">${fmt(data.humidity, 0)}<span class="stat-unit">%</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">From Yesterday</span>
                    <span class="stat-value">${change(data.humidityYesterday, '%')}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Indoor</span>
                    <span class="stat-value">${fmt(data.humidityin, 0)}<span class="stat-unit">%</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Dew Point (Outdoor)</span>
                    <span class="stat-value">${fmt(data.dewPoint, 1)}<span class="stat-unit">°F</span></span>
                </div>
            </div>
        </div>
    `);
    
    // 7. UV Index Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-sun"></i> UV Index</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row with-subtext">
                    <span class="stat-label">Current UV</span>
                    <span class="stat-value primary">${fmt(data.uv, 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">${uvData.level} RISK</span>
                    <span class="stat-value"><span class="alert-badge ${uvData.class}">${uvData.level}</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">UV Scale</span>
                    <div class="uv-risk">${uvDots.join('')}</div>
                </div>
                <div class="stat-row">
                    <span class="stat-label" style="font-size:0.7rem">Safe sun exposure time varies by skin type</span>
                </div>
            </div>
        </div>
    `);
    
    // 8. Solar Radiation Tile
    tiles.push(`
        <div class="weather-tile">
            <div class="tile-banner">
                <h3><i class="fas fa-sun"></i> Solar Radiation</h3>
                <a href="#" class="tile-link"><i class="fas fa-chart-line"></i></a>
            </div>
            <div class="tile-stats">
                <div class="stat-row with-subtext">
                    <span class="stat-label">Current</span>
                    <span class="stat-value primary">${fmt(data.solarradiation, 0)}<span class="stat-unit">W/m²</span></span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Description</span>
                    <span class="stat-value">${data.solarradiation > 800 ? 'Very High' : data.solarradiation > 500 ? 'High' : data.solarradiation > 200 ? 'Moderate' : 'Low'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">UV Correlation</span>
                    <span class="stat-value">${data.uv ? 'Strong' : 'N/A'}</span>
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
        renderNews(newsArticles);
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('news-list').innerHTML = `
            <div class="loading">
                <p>News data not available yet.</p>
                <p style="font-size: 0.85rem; margin-top: 10px;">The GitHub Actions workflow will populate this soon.</p>
            </div>
        `;
    }
}

// Render news articles
function renderNews(articles) {
    const container = document.getElementById('news-list');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles curated yet. Check back later!</div>';
        return;
    }
    
    container.innerHTML = articles.map((article, index) => `
        <div class="news-item" data-index="${index}">
            <div class="news-checkbox">
                <input type="checkbox" id="article-${index}" data-index="${index}">
            </div>
            <div class="news-content">
                <div class="news-title">${article.title}</div>
                <div class="news-meta">
                    <span class="news-source">${article.source}</span> • 
                    <span class="news-date">${formatDate(article.date)}</span>
                </div>
                <div class="news-synopsis">${article.synopsis}</div>
                ${article.theme ? `<span class="news-tag">${article.theme}</span>` : ''}
            </div>
        </div>
    `).join('');
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

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterNews(e.target.dataset.filter);
        });
    });
    
    // Article selection
    document.getElementById('news-list').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const index = parseInt(e.target.dataset.index);
            const newsItem = e.target.closest('.news-item');
            
            if (e.target.checked) {
                selectedArticles.add(index);
                newsItem.classList.add('selected');
            } else {
                selectedArticles.delete(index);
                newsItem.classList.remove('selected');
            }
            
            updatePodcastControls();
        }
    });
    
    // Podcast generation button
    document.getElementById('generate-podcast').addEventListener('click', handlePodcastGeneration);
}

// Filter news by category
function filterNews(filter) {
    if (filter === 'all') {
        renderNews(newsArticles);
    } else {
        const filtered = newsArticles.filter(article => 
            article.theme?.toLowerCase().includes(filter.split('-')[0])
        );
        renderNews(filtered);
    }
}

// Update podcast controls visibility
function updatePodcastControls() {
    const controls = document.getElementById('podcast-controls');
    const countSpan = document.getElementById('selected-count');
    
    if (selectedArticles.size > 0) {
        controls.style.display = 'block';
        countSpan.textContent = selectedArticles.size;
    } else {
        controls.style.display = 'none';
    }
}

// Handle podcast generation
async function handlePodcastGeneration() {
    const selectedService = document.querySelector('input[name="podcast-service"]:checked').value;
    const selectedItems = Array.from(selectedArticles).map(i => newsArticles[i]);
    
    if (selectedItems.length === 0) {
        alert('Please select at least one article');
        return;
    }
    
    const button = document.getElementById('generate-podcast');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        if (selectedService === 'open-notebook') {
            await generateWithOpenNotebook(selectedItems);
        } else {
            await generateWithNotebookLM(selectedItems);
        }
    } catch (error) {
        console.error('Podcast generation failed:', error);
        alert('Podcast generation failed: ' + error.message);
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-microphone"></i> Generate Podcast';
    }
}

// Generate podcast with Open Notebook
async function generateWithOpenNotebook(articles) {
    // This would integrate with your local Open Notebook instance
    // For now, show instructions
    const urls = articles.map(a => a.url).join('\n');
    
    // Create a note in Open Notebook with the selected articles
    const notebookPayload = {
        notebook_id: 'notebook:ai-research', // You'll need to get the actual ID
        title: `Podcast Materials - ${new Date().toLocaleDateString()}`,
        content: `Selected Articles:\\n\\n` + articles.map(a => 
            `- ${a.title}\\n  URL: ${a.url}\\n  Source: ${a.source}\\n`
        ).join('\\n')
    };
    
    try {
        const response = await fetch(`${CONFIG.openNotebookApi}/api/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notebookPayload)
        });
        
        if (response.ok) {
            alert('Articles added to Open Notebook! You can now generate a podcast from the Open Notebook interface.');
            // Optionally trigger podcast generation
        } else {
            throw new Error('Failed to add to Open Notebook');
        }
    } catch (error) {
        console.error('Open Notebook error:', error);
        // Fallback: show URLs for manual copy
        const urls = articles.map(a => `${a.title}\\n${a.url}`).join('\\n\\n');
        prompt('Copy these URLs to Open Notebook:', urls);
    }
}

// Generate podcast with NotebookLM
async function generateWithNotebookLM(articles) {
    // NotebookLM doesn't have a public API, so we'll provide instructions
    const urls = articles.map(a => a.url).join('\\n');
    const text = articles.map(a => `- ${a.title}\\n  ${a.url}`).join('\\n');
    
    const message = `To generate a podcast with NotebookLM:\\n\\n1. Go to https://notebooklm.google.com\\n2. Create a new notebook\\n3. Add these sources:\\n\\n${text}\\n\\n4. Use the "Audio Overview" feature to generate a podcast`;
    
    alert(message);
    
    // Open NotebookLM in a new tab
    window.open('https://notebooklm.google.com', '_blank');
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleString();
}