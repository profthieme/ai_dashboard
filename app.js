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
        renderWeather(data);
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

// Render weather data
function renderWeather(data) {
    const container = document.getElementById('weather-data');
    
    // Ambient Weather API field names (from weather.json)
    const stats = [
        { label: 'Temperature', value: data.tempf?.toFixed(1) || data.temp_f?.toFixed(1) || 'N/A', unit: '°F', icon: 'thermometer-half' },
        { label: 'Feels Like', value: data.feelsLike?.toFixed(1) || 'N/A', unit: '°F', icon: 'TemperatureHigh' },
        { label: 'Humidity', value: data.humidity?.toFixed(0) || 'N/A', unit: '%', icon: 'tint' },
        { label: 'Barometer', value: data.baromrelin?.toFixed(2) || 'N/A', unit: 'inHg', icon: 'gauge-high' },
        { label: 'Wind Speed', value: data.windspeedmph?.toFixed(1) || 'N/A', unit: 'mph', icon: 'wind' },
        { label: 'Wind Dir', value: data.winddir ? `${data.winddir}°` : data.winddirdeg ? `${data.winddirdeg}°` : 'N/A', unit: '', icon: 'compass' },
        { label: 'UV Index', value: data.uv?.toFixed(1) || 'N/A', unit: '', icon: 'sun' },
        { label: 'Solar Rad', value: data.solarradiation?.toFixed(0) || 'N/A', unit: 'W/m²', icon: 'sun' },
        { label: 'Daily Rain', value: data.dailyrainin?.toFixed(2) || 'N/A', unit: 'in', icon: 'cloud-rain' }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="weather-stat">
            <div class="label"><i class="fas fa-${stat.icon}"></i> ${stat.label}</div>
            <div class="value">${stat.value}<span class="unit">${stat.unit}</span></div>
        </div>
    `).join('');
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
        content: `Selected Articles:\n\n` + articles.map(a => 
            `- ${a.title}\n  URL: ${a.url}\n  Source: ${a.source}\n`
        ).join('\n')
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
        const urls = articles.map(a => `${a.title}\n${a.url}`).join('\n\n');
        prompt('Copy these URLs to Open Notebook:', urls);
    }
}

// Generate podcast with NotebookLM
async function generateWithNotebookLM(articles) {
    // NotebookLM doesn't have a public API, so we'll provide instructions
    const urls = articles.map(a => a.url).join('\n');
    const text = articles.map(a => `- ${a.title}\n  ${a.url}`).join('\n');
    
    const message = `To generate a podcast with NotebookLM:\n\n1. Go to https://notebooklm.google.com\n2. Create a new notebook\n3. Add these sources:\n\n${text}\n\n4. Use the "Audio Overview" feature to generate a podcast`;
    
    alert(message);
    
    // Open NotebookLM in a new tab
    window.open('https://notebooklm.google.com', '_blank');
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleString();
}