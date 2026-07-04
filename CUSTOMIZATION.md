# Customization Guide

## Quick Links Configuration

Open `app.js` and find the `CONFIG.quickLinks` array (around line 5):

```javascript
const CONFIG = {
    quickLinks: [
        { name: 'Gmail', url: 'https://gmail.com', icon: 'fas fa-envelope' },
        { name: 'Google Scholar', url: 'https://scholar.google.com', icon: 'fas fa-graduation-cap' },
        // Add your links here...
    ],
    // ...
};
```

### Available Icon Options

Using FontAwesome 6.5.1. Browse all icons: https://fontawesome.com/icons

**Common categories:**

**Education:**
- `fas fa-graduation-cap` - Graduation cap
- `fas fa-book` - Book
- `fas fa-book-open` - Open book
- `fas fa-chalkboard-teacher` - Chalkboard
- `fas fa-laptop-code` - Laptop with code

**Communication:**
- `fas fa-envelope` - Email
- `fas fa-comment` - Comment
- `fas fa-phone` - Phone
- `fas fa-video` - Video

**Technology:**
- `fas fa-laptop` - Laptop
- `fas fa-desktop` - Desktop
- `fas fa-cloud` - Cloud
- `fas fa-database` - Database
- `fab fa-github` - GitHub logo
- `fab fa-google` - Google logo

**Weather:**
- `fas fa-cloud-sun` - Cloud with sun
- `fas fa-sun` - Sun
- `fas fa-cloud-rain` - Cloud with rain
- `fas fa-snowflake` - Snowflake

**Business:**
- `fas fa-briefcase` - Briefcase
- `fas fa-chart-line` - Chart line
- `fas fa-coins` - Coins
- `fas fa-handshake` - Handshake

### Example Custom Links

```javascript
quickLinks: [
    // Email & Communication
    { name: 'Gmail', url: 'https://gmail.com', icon: 'fas fa-envelope' },
    { name: 'Outlook', url: 'https://outlook.live.com', icon: 'fas fa-envelope-open' },
    
    // Research & Academic
    { name: 'Google Scholar', url: 'https://scholar.google.com', icon: 'fas fa-graduation-cap' },
    { name: 'JSTOR', url: 'https://jstor.org', icon: 'fas fa-book' },
    { name: 'ResearchGate', url: 'https://researchgate.net', icon: 'fas fa-users' },
    
    // News & Publications
    { name: 'HBR', url: 'https://hbr.org', icon: 'fas fa-newspaper' },
    { name: 'Chronicle', url: 'https://chronicle.com', icon: 'fas fa-newspaper' },
    { name: 'Inside Higher Ed', url: 'https://insidehighered.com', icon: 'fas fa-graduation-cap' },
    
    // AI & Tech
    { name: 'ArXiv', url: 'https://arxiv.org', icon: 'fas fa-file-alt' },
    { name: 'Hugging Face', url: 'https://huggingface.co', icon: 'fas fa-robot' },
    { name: 'AI Files', url: 'https://aifiles.substack.com', icon: 'fas fa-rss' },
    
    // Tools
    { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
    { name: 'Notion', url: 'https://notion.so', icon: 'fas fa-sticky-note' },
    { name: 'Open Notebook', url: 'http://localhost:5055', icon: 'fas fa-microphone' },
    
    // Weather
    { name: 'Ambient Weather', url: 'https://ambientweather.net', icon: 'fas fa-cloud-sun' },
    { name: 'Weather.com', url: 'https://weather.com', icon: 'fas fa-cloud' },
    
    // Personal Sites
    { name: 'My Website', url: 'https://your-domain.com', icon: 'fas fa-home' },
    { name: 'Portfolio', url: 'https://your-portfolio.com', icon: 'fas fa-id-card' }
]
```

## Weather Station Configuration

### Ambient Weather API Setup

1. **Get Your API Key:**
   - Login to https://ambientweather.net
   - Click your profile icon → "Manage Account"
   - Scroll to "Generate API Key"
   - Click "Generate" if you don't have one
   - Copy the API key

2. **Find Your MAC Address:**
   - Same "Manage Account" page
   - Look under "My Devices"
   - Find your weather station
   - MAC address looks like: `aa:bb:cc:dd:ee:ff`

3. **Add to GitHub Secrets:**
   - Repository Settings → Secrets and variables → Actions
   - Add: `AMBIENT_API_KEY` = your API key
   - Add: `AMBIENT_MAC_ADDRESS` = your station MAC

## News Sources Configuration

Edit `scripts/curate_news.py` to customize news sources.

### Add a New Category

```python
SOURCES = {
    'your-category': [  # e.g., 'ai-marketing'
        {
            'name': 'Source Name',  # e.g., 'Marketing AI Institute'
            'url': 'https://example.com/feed.xml',  # RSS feed URL
            'keywords': ['keyword1', 'keyword2']  # Words to look for
        }
    ],
    # ... other categories
}
```

### Find RSS Feed URLs

Most websites have RSS feeds at:
- `https://example.com/feed`
- `https://example.com/rss`
- `https://example.com/feed.xml`
- `https://example.com/rss.xml`

Or look for the RSS icon (📶) on the website.

**Common RSS feed URLs:**

```python
# AI & Technology
'https://openai.com/blog/rss'
'https://www.anthropic.com/rss/updates'
'https://venturebeat.com/category/ai/feed/'

# Business & Education
'https://hbr.org/feed'
'https://www.chronicle.com/section/technology/123/rss'
'https://www.insidehighered.com/rss/technology.xml'

# Academic
'http://export.arxiv.org/rss/cs.AI'  # ArXiv AI papers
'https://pub.towardsdatascience.com/feed'
```

## Styling Customization

Edit `styles.css` to change colors, fonts, or layout.

### Change Color Scheme

Find the gradient in `body` style (around line 9):

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Change these colors */
}
```

**Popular gradients:**
```css
/* Blue to Purple */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Sunset */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Ocean */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Forest */
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);

/* Minimal (single color) */
background: #f5f6fa;
```

### Change Font

```css
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    /* Or add Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet"> */
}
```

## Workflow Schedule Customization

### Weather Update Frequency

Edit `.github/workflows/fetch-weather.yml`:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Change this line
```

**Cron syntax:** `minute hour day month weekday`

**Examples:**
```yaml
# Every 15 minutes
- cron: '*/15 * * * *'

# Every 30 minutes
- cron: '*/30 * * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Only during daytime (7 AM - 10 PM)
- cron: '0 7-22 * * *'

# Weekdays only, every hour
- cron: '0 * * * 1-5'
```

### News Curation Schedule

Edit `.github/workflows/curate-news.yml`:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC daily
```

**Examples:**
```yaml
# Twice daily (6 AM and 6 PM UTC)
- cron: '0 6,18 * * *'

# Every 12 hours
- cron: '0 */12 * * *'

# Weekdays only at 7 AM UTC
- cron: '0 7 * * 1-5'

# Sundays at noon
- cron: '0 12 * * 0'
```

## Podcast Integration

### Open Notebook Configuration

If you're using Open Notebook on your desktop:

1. **Verify Open Notebook is running**
   - Should be accessible at `http://localhost:5055`
   - Or `http://host.docker.internal:5055`

2. **Get your notebook ID**
   - Default in the code: `notebook:ai-research`
   - Change in `app.js` line 168

3. **Create notebook in Open Notebook**
   - Name it "AI Research"
   - The notebook ID will be shown in the URL or API

### NotebookLM Integration

NotebookLM doesn't have a public API, so the current implementation:
- Shows you a popup with selected article URLs
- Opens NotebookLM in a new tab
- You manually copy/paste or add the sources

## Advanced: Learning Your Preferences

The dashboard tracks which articles you select for podcast generation. This data could be used to:

1. **Improve curation** - Prioritize similar articles
2. **Personalize themes** - Focus on your interests
3. **Filter sources** - Prefer sources you select often

To implement this, you'd need to:
1. Add a backend database (e.g., SQLite, Firebase)
2. Log selections when "Generate Podcast" is clicked
3. Adjust curation algorithm based on history

**Current limitation:** GitHub Pages is static-only, so preference tracking requires:
- A separate backend service (e.g., Firebase, Supabase - both have free tiers)
- Or store in browser localStorage (works but device-specific)

## Troubleshooting Tips

### Console Errors

Open browser DevTools (F12) and check Console tab for JavaScript errors.

Common issues:
```
CORS Error: Data files can't be loaded
→ Ensure files are on GitHub Pages, not local
→ Data files must be committed to Git

"weather.json not found"
→ Run the fetch-weather workflow manually
→ Wait 1-2 minutes after workflow completes

"NotebookLM" popup doesn't appear
→ Check browser popup blocker settings
```

### Workflow Failures

Check GitHub Actions logs:
1. Go to "Actions" tab
2. Click failed workflow run
3. Read the error message
4. Common fixes:
   - Invalid API key → Check Secrets
   - JSON parsing error → Check API response format
   - Timeout → RSS feed might be down