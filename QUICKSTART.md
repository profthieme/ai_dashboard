# Quick Start Guide - Dashboard Setup

## What Has Been Created

Your dashboard is ready in: `C:\Users\jefft\hermes-work\dashboard\`

Files created:
- `index.html` - Main dashboard page
- `styles.css` - Styling and layout
- `app.js` - Interactive functionality
- `.github/workflows/` - Automation scripts
- `scripts/curate_news.py` - News curation logic
- `data/` - Data files (auto-populated)
- `README.md` - Full documentation

## Next Steps (In Order)

### 1. Create GitHub Repository
```
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: ai_dashboard
4. Set to Public
5. Create (don't initialize with README)
```

### 2. Upload Files to GitHub

**Option A: Using GitHub Web Interface (Easiest)**
```
1. On your new repository page, click "uploading an existing file"
2. Drag ALL files from C:\Users\jefft\hermes-work\dashboard\ into the browser
3. Click "Commit changes"
```

**Option B: Using Git Command Line**
```bash
cd C:/Users/jefft/hermes-work/dashboard
git init
git remote add origin https://github.com/YOUR_USERNAME/ai_dashboard.git
git add .
git commit -m "Initial dashboard"
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages
```
1. Go to repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: main / (root)
4. Click Save
5. Wait 2-3 minutes
6. Your site will be at: `https://YOUR_USERNAME.github.io/ai_dashboard/`
```

### 4. Add API Secrets
```
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"

Secret #1:
- Name: AMBIENT_API_KEY
- Value: [your Ambient Weather API key]

Secret #2:
- Name: AMBIENT_MAC_ADDRESS
- Value: [your station MAC address]

3. Click "Add secret" for each
```

**Where to find your Ambient Weather credentials:**
1. Login to https://ambientweather.net
2. Click your account icon → "Manage Account"
3. Scroll to "API Key" section
4. Copy the API Key and MAC Address

### 5. Trigger First Data Fetch
```
1. Go to "Actions" tab in your repository
2. Click "Fetch Weather Data" workflow
3. Click "Run workflow" → green "Run workflow" button
4. Wait for green checkmark (may take 1-2 minutes)
5. Repeat for "Curate News Articles" workflow
```

### 6. View Your Dashboard
```
Open: `https://YOUR_USERNAME.github.io/ai_dashboard/`
```

## Testing Checklist

- [ ] Weather data appears on dashboard
- [ ] News articles appear (after curation workflow runs)
- [ ] Quick links work
- [ ] Article checkboxes select/deselect properly
- [ ] Podcast generation button appears when articles selected

## Common Issues

### "404 Page Not Found"
```
- Wait 2-3 minutes after enabling GitHub Pages
- Check that all files were uploaded (especially index.html)
- Verify GitHub Pages is enabled in Settings → Pages
```

### Weather shows "Data unavailable"
```
- Check Secrets are correctly set (no spaces!)
- Manually run "Fetch Weather Data" workflow
- Check workflow logs for specific errors
```

### No news articles showing
```
- Manually run "Curate News Articles" workflow
- Check workflow logs - some RSS feeds may be temporarily down
- Wait for workflow to complete成功 (green checkmark)
```

### Can't select articles for podcast
```
- This is expected until news data is populated
- Run the curation workflow manually first
```

## Customization Tips

### Change Quick Links
Edit `app.js` → find `CONFIG.quickLinks` array → modify/add links

### Add More News Sources
Edit `scripts/curate_news.py` → find `SOURCES` dictionary → add new feeds

### Update More Frequently
Edit `.github/workflows/fetch-weather.yml` → change cron schedule
- Every 30 min: `*/30 * * * *`
- Every 6 hours: `0 */6 * * *`

## GitHub Actions Minutes Usage

Free tier includes 2,000 minutes/month. Your dashboard uses:
- Weather workflow: ~1 min/hour × 24 = 24 min/day = 720 min/month
- News workflow: ~2 min/day = 60 min/month
- Deployment: ~1 min per deploy

**Total estimated: ~800 minutes/month** (well within free tier)

## Need Help?

1. Check the full README.md for detailed documentation
2. Check GitHub Actions logs for workflow errors
3. Browser console (F12) for JavaScript errors

## What's Special About This Setup

✅ **Completely FREE** - No hosting costs
✅ **API Key Secure** - Stored in GitHub Secrets, never exposed
✅ **Auto-Updates** - Weather hourly, news daily
✅ **Accessible Anywhere** - GitHub Pages works on any device
✅ **Podcast Integration** - Works with your Open Notebook desktop setup
✅ **Learning System** - Tracks which articles you select for podcasts