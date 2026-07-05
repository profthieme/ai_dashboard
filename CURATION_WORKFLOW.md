# Reliable News Curation Workflow

## Overview

This workflow cures news articles from RSS feeds with **verified publication dates**. Unlike web searches that return undated or old content, RSS feeds provide structured metadata with reliable publication timestamps.

## Key Features

✅ **Date Verification**: Every article's publication date is extracted and validated  
✅ **Time-Bounded Filtering**: Specify exact windows (e.g., "last 72 hours", "last week")  
✅ **Deduplication**: Removes duplicate articles across sources  
✅ **Source Diversity**: Fetches from multiple credible sources per topic  
✅ **Validation**: Checks all required fields before saving  
✅ **Detailed Reporting**: Shows date ranges, sources, and article counts  

## Quick Start

### Curation Commands

```bash
# Navigate to dashboard repo
cd ~/hermes-work/ai_dashboard

# AI + Business articles from last 72 hours
python scripts/curate_reliable.py --topic ai-business --hours 72

# AI in Higher Education from last week
python scripts/curate_reliable.py --topic ai-education --days 7

# All topics from last 48 hours
python scripts/curate_reliable.py --hours 48

# Custom RSS feed
python scripts/curate_reliable.py --custom-feed https://example.com/feed.xml --hours 72
```

### Windows Batch Script

```bash
# From ai_dashboard/scripts folder
scripts\curate_last_72h.bat ai-business
scripts\curate_last_72h.bat ai-education
scripts\curate_last_72h.bat all
```

## Available Topics

| Topic | Category | Sources |
|-------|----------|---------|
| `ai-business` | AI + Business | HBR, MIT Sloan, VentureBeat, Forbes, TechCrunch |
| `ai-education` | AI in Higher Education | Inside Higher Ed, Chronicle, HEPI, EDUCAUSE |
| `ai-tech` | AI Technology | MIT Tech Review, Ars Technica, The Verge |

## Command-Line Options

```
--topic TOPIC         Topic to curate (ai-business, ai-education, ai-tech)
                      Can specify multiple: --topic ai-business --topic ai-tech
--hours N             Only include articles from last N hours
--days N              Only include articles from last N days
--min-articles N      Minimum articles to curate (default: 10)
--max-per-source N    Max articles per source (default: 10)
--custom-feed URL     Custom RSS feed URL (can specify multiple)
--output PATH         Output JSON file (default: data/news.json)
--show-articles       Display article details in output
```

## Example Sessions

### Example 1: 15+ Articles from Last 72 Hours (AI + Business)

```bash
cd ~/hermes-work/ai_dashboard
python scripts/curate_reliable.py --topic ai-business --hours 72 --min-articles 15
```

**Expected output:**
```
============================================================
NEWS CURATION WITH DATE VERIFICATION
============================================================

Fetching from 5 sources...
Time window: last 72 hours

Processing: Harvard Business Review - AI
  Found 8 articles in feed
  Filtered to 5 articles from last 72 hours
Processing: MIT Sloan Management Review
  Found 12 articles in feed
  Filtered to 8 articles from last 72 hours
...

Removing duplicates...
✓ Saved 18 articles to data/news.json

============================================================
CURATION SUMMARY
============================================================
Total articles: 18
Last updated: 2026-07-05T14:00:00Z
Curation method: rss_feed_with_date_verification

By theme:
  AI + Business: 18

By source:
  TechCrunch AI: 7
  VentureBeat AI: 5
  MIT Sloan: 4
  HBR: 2

Date range: 2026-07-03 to 2026-07-05

✓ Curation complete!
```

### Example 2: All Topics, Last Week

```bash
python scripts/curate_reliable.py --days 7 --show-articles
```

This fetches from all 12 sources across all topics and shows full article details.

### Example 3: Custom Feed + Multiple Topics

```bash
python scripts/curate_reliable.py \
  --topic ai-business \
  --topic ai-education \
  --custom-feed https://www.nature.com/news/ai.rss \
  --hours 168 \
  --min-articles 20
```

## Output Format

Articles are saved to `data/news.json`:

```json
{
  "articles": [
    {
      "title": "Article Title",
      "url": "https://example.com/article",
      "source": "RSS Feed Name",
      "publisher": "Configured Source Name",
      "date": "Sun, 05 Jul 2026 10:00:00 GMT",
      "date_parsed": "2026-07-05T10:00:00",
      "synopsis": "2-3 sentence summary...",
      "theme": "AI + Business",
      "category": "ai-business",
      "curated_at": "2026-07-05T14:00:00Z",
      "curated_by": "automated",
      "curation_method": "rss_feed"
    }
  ],
  "last_updated": "2026-07-05T14:00:00Z",
  "total_count": 15,
  "curated_by": "automated",
  "curation_method": "rss_feed_with_date_verification",
  "curation_notes": "Articles verified from RSS feeds with publication date filtering"
}
```

## Commit and Deploy

After curation, commit to GitHub:

```bash
cd ~/hermes-work/ai_dashboard

# Quick commit
git add data/news.json
git commit -m "Curated: $(python -c \"import json; d=json.load(open('data/news.json')); print(f\"{d['total_count']} articles, {d['last_updated'][:10]}\")\")"
git push
```

**Dashboard updates automatically** at: https://profthieme.github.io/ai_dashboard/

## Troubleshooting

### "Only found X articles (minimum: Y)"

**Cause**: Not enough articles in the time window.

**Solutions**:
1. Expand the time window: `--hours 168` (1 week) instead of `--hours 72`
2. Add more sources: Edit `scripts/curate_reliable.py` and add RSS feeds
3. Use multiple topics: `--topic ai-business --topic ai-tech`
4. Lower the minimum: `--min-articles 5`

### RSS Feed Errors (404)

Some feeds may change URLs. Update the `SOURCES` dict in `scripts/curate_reliable.py`:

```python
{
    'name': 'Source Name',
    'url': 'https://new-feed-url.com/rss',
    'keywords': [...],
    'category': 'ai-business',
    'theme': 'AI + Business'
}
```

### Articles Missing Dates

Articles without verifiable publication dates are automatically skipped. This is intentional — we prioritize accuracy over completeness.

## Adding New RSS Feeds

To add a new source:

1. Find the RSS feed URL (look for RSS icon, `/feed`, `/rss.xml`, `/atom.xml`)
2. Test with: `curl -I https://feed-url.com`
3. Add to `SOURCES` dict in `scripts/curate_reliable.py`:

```python
{
    'name': 'New Source Name',
    'url': 'https://example.com/feed.xml',
    'keywords': ['keyword1', 'keyword2'],
    'category': 'ai-business',  # or 'ai-education' or 'ai-tech'
    'theme': 'AI + Business'    # Display theme
}
```

### Common RSS Feed Patterns

- HBR: `https://hbr.org/[topic]/rss.xml`
- MIT Tech Review: `https://www.technologyreview.com/feed/`
- VentureBeat: `https://venturebeat.com/[category]/feed/`
- Forbes: `https://www.forbes.com/digital-assets/feeds/rss/[topic]/`
- TechCrunch: `https://techcrunch.com/category/[topic]/feed/`
- Inside Higher Ed: `https://www.insidehighered.com/rss/[topic].xml`
- Chronicle: `https://www.chronicle.com/section/[topic]/123/rss`

## Validation

After curation, verify the output:

```bash
# Check JSON structure
python -c "import json; d=json.load(open('data/news.json')); print(f'Valid: {len(d[\"articles\"])} articles')"

# Check date range
python -c "import json; d=json.load(open('data/news.json')); dates=[a['date_parsed'] for a in d['articles'] if a.get('date_parsed')]; print(f'Date range: {min(dates)[:10]} to {max(dates)[:10]}')"

# Check source diversity
python -c "import json; d=json.load(open('data/news.json')); sources=set(a['publisher'] for a in d['articles']); print(f'Sources: {len(sources)} unique')"
```

## Comparison: RSS vs Web Search

| Feature | RSS Curation | Web Search |
|---------|-------------|------------|
| **Publication dates** | ✅ Verified from metadata | ❌ Often missing/unreliable |
| **Time filtering** | ✅ Precise (hours/days) | ❌ Approximate only |
| **Source credibility** | ✅ Curated feeds | ⚠️ Mixed quality |
| **Duplication** | ✅ Automatic dedup | ❌ Manual checking needed |
| **Synopses** | ✅ From feed description | ⚠️ Requires scraping |
| **Recency** | ✅ Real-time updates | ⚠️ Indexing delays |

## Best Practices

1. **Always specify a time window** (`--hours` or `--days`) — never curate without date filtering
2. **Use multiple sources** — at least 3-5 per topic for diversity
3. **Verify before committing** — check the summary report for date ranges and sources
4. **Regular curation** — run weekly to keep dashboard fresh
5. **Monitor feed health** — if a source consistently returns 0 articles, check the feed URL

## Integration with GitHub Actions

The existing deploy workflow automatically publishes changes:

```yaml
# .github/workflows/deploy-pages.yml
on:
  push:
    branches: [main]
    paths: ['data/**']  # Triggers on news.json updates
```

After pushing, the dashboard updates within 1-2 minutes.

---

**Created**: 2026-07-05  
**Last Updated**: 2026-07-05  
**Script**: `scripts/curate_reliable.py`