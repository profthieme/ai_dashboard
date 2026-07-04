# Personal Dashboard

A customizable dashboard with weather data, curated news, and quick links.

## Features

- **Weather Display**: Shows real-time data from your Ambient Weather station
- **Curated News**: Daily curated articles about AI in business, education, and technology
- **Quick Links**: One-click access to your frequently-used websites
- **Podcast Generation**: Select articles and generate podcast episodes via NotebookLM or Open Notebook

## Setup Instructions

### Step 1: Create a GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top-right corner
3. Select **"New repository"**
4. Repository name: `ai_dashboard` (or any name you prefer)
5. Set visibility to **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README
7. Click **"Create repository"**

### Step 2: Upload Your Dashboard Files

In your new repository:

1. Click **"uploading an existing file"**
2. Drag and drop these files from your `dashboard` folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `.github/` (entire folder)
   - `scripts/` (entire folder)
   - `data/` (entire folder)
3. Click **"Commit changes"**

### Step 3: Enable GitHub Pages

1. In your repository, click the **"Settings"** tab
2. Click **"Pages"** in the left sidebar
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
4. Click **"Save"**

Your site will be live at: `https://YOUR_USERNAME.github.io/ai_dashboard/`

### Step 4: Add Your Ambient Weather API Credentials

1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

   **Secret 1:**
   - Name: `AMBIENT_API_KEY`
   - Value: Your Ambient Weather API key
   
   **Secret 2:**
   - Name: `AMBIENT_MAC_ADDRESS`
   - Value: Your weather station's MAC address (find it in your Ambient Weather account settings)

4. Click **"Add secret"** for each

### Step 5: Customize Your Quick Links

Edit `app.js` and modify the `quickLinks` array:

```javascript
quickLinks: [
    { name: 'Gmail', url: 'https://gmail.com', icon: 'fas fa-envelope' },
    { name: 'Your Site', url: 'https://example.com', icon: 'fas fa-link' },
    // Add more links...
]
```

Icon options: Browse https://fontawesome.com/icons for available icons

### Step 6: Trigger Your First Data Fetch

1. Go to your repository's **"Actions"** tab
2. Click on **"Fetch Weather Data"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for it to complete (green checkmark)
5. Repeat for **"Curate News Articles"** workflow

### Step 7: Test Your Dashboard

1. Go to your GitHub Pages URL: `https://YOUR_USERNAME.github.io/ai_dashboard/`
2. You should see:
   - Weather data from your station
   - Curated news articles
   - Your quick links

## How It Works

### Weather Data
- GitHub Actions runs every hour
- Fetches data from Ambient Weather API using your API key
- Saves to `data/weather.json`
- Your dashboard reads this file and displays the data

### News Curation
- GitHub Actions runs daily at 6 AM UTC
- Fetches RSS feeds from various sources
- Categorizes articles by theme
- Saves to `data/news.json`
- Dashboard displays articles with filter options

### Podcast Generation
- Select articles using checkboxes
- Click "Generate Podcast"
- Choose between:
  - **NotebookLM**: Opens Google NotebookLM with article URLs
  - **Open Notebook**: Sends to your local Open Notebook instance

## GitHub Actions Workflows

| Workflow | Schedule | Purpose |
|----------|----------|---------|
| `fetch-weather.yml` | Every hour | Updates weather data |
| `curate-news.yml` | Daily at 6 AM UTC | Curates news articles |
| `deploy-pages.yml` | On every push | Deploys to GitHub Pages |

## Troubleshooting

### Weather shows "Data unavailable"
- Check that your GitHub Secrets are correct
- Manually run the "Fetch Weather Data" workflow
- Check the workflow logs for errors

### News shows "Not available yet"
- Manually run the "Curate News Articles" workflow
- Check workflow logs for errors
- Some RSS feeds may be temporarily unavailable

### Page not loading
- Wait 2-3 minutes after deployment (GitHub Pages propagation)
- Check browser console for errors (F12 → Console)
- Ensure all files were uploaded correctly

## Customization

### Change Update Frequency

Edit the `cron` schedules in `.github/workflows/fetch-weather.yml`:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
```

Cron syntax: `minute hour day month weekday`

Examples:
- Every 30 minutes: `*/30 * * * *`
- Every 6 hours: `0 */6 * * *`
- Daily at 9 AM: `0 9 * * *`

### Add More News Sources

Edit `scripts/curate_news.py` and add to the `SOURCES` dictionary:

```python
'a_new_category': [
    {
        'name': 'Source Name',
        'url': 'https://example.com/feed.xml',
        'keywords': ['keyword1', 'keyword2']
    }
]
```

## Costs

- **GitHub Pages**: Free (unlimited public repositories)
- **GitHub Actions**: Free tier includes 2,000 minutes/month
- **Estimated usage**: ~300 minutes/month (well within free tier)

## License

This project is open source and available for personal use.