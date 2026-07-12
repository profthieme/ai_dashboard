# Dashboard Upgrade Notes (VS Code Edition)

## What changed

| File | Status | Notes |
| ---- | ------ | ----- |
| `index.html` | Replaced | New structure: title bar, quick links grid, news editor with tabs, weather terminal, upload and settings modals. |
| `styles.css` | Replaced | Full VS Code Dark+ theme (background #1e1e1e, Dark+ syntax palette, blue #007acc status bar). |
| `app.js` | Replaced | New logic. Your quick links (Personal / Work / Weather groups with local images) and full weather display are already carried over; nothing to paste. |
| `data/news_business.json` | New | AI + Business subsection (starts empty). |
| `data/news_highered.json` | New | AI + Higher Ed subsection (starts empty). |
| `data/news_other.json` | New | Other News subsection (starts empty). |
| `ai_article_curation_prompt.md` | Replaced | Now outputs one strict-JSON code block the dashboard imports directly. |

Nothing else in the repo needs to change. The `images/` folder, `data/weather.json`, the weather workflow, and the deploy workflow are untouched.

## Deploy

1. Copy the files above into the repo.
2. `git add -A && git commit -m "VS Code dashboard redesign" && git push`
3. Wait a minute or two for GitHub Pages, then hard-refresh (Ctrl+F5).

## The new curation workflow

1. Run `ai_article_curation_prompt.md` in Claude (or any AI tool with web search).
2. Copy the JSON code block it returns.
3. On the dashboard, open the Curated News section and click **Upload**.
4. Paste the JSON (or choose a saved `.json` file) and click **Parse & preview**.
5. Edit titles and synopses inline, reassign articles between sections with the dropdown, or remove items.
6. Choose **Append** (merges with what is already posted, deduplicated by URL) or **Replace section(s)**.
7. Click **Post to dashboard** to commit via the GitHub API, or **Download JSON** to commit the files yourself.

The upload modal accepts three shapes:
- the full prompt output (`{"sections": {...}}`), which fills all three subsections in one paste;
- a bare array of articles, which goes into whichever tab was active when you clicked Upload;
- a single-section object (`{"articles": [...]}`), same routing as an array.

## One-click posting: GitHub token setup

To use **Post to dashboard**, create a fine-grained personal access token:

1. GitHub > Settings > Developer settings > Fine-grained tokens > Generate new token.
2. Resource owner: profthieme. Repository access: **Only select repositories** > `ai_dashboard`.
3. Permissions: **Contents: Read and write**. Nothing else.
4. Set an expiration you are comfortable with (90 days is reasonable).
5. On the dashboard, click the gear icon in the Curated News header, paste the token, Save.

The token lives only in that browser's localStorage. Since the Pages site is public, keep the token scoped exactly as above; anyone with the token could write to this one repo, and nothing else. If you would rather not store a token at all, the **Download JSON** path works with zero credentials.

## Things carried over, with caveats

- **Refresh button**: removed, as requested. Loading the page always fetches the latest committed data (cache-busted).
- **Automated curation**: the old `curate-news.yml` schedule still writes `data/news.json`. The dashboard only falls back to that file when all three new section files are missing, so the automation will not overwrite your manual posts. You can disable the schedule in `.github/workflows/curate-news.yml` whenever you like.
- **Podcast buttons**: your current app.js has no podcast code, so these are a fresh addition (checkbox per article, NotebookLM and Open Notebook buttons in the editor footer). `sendToOpenNotebook()` uses a minimal `POST /api/sources` call with `CONFIG.openNotebook` settings; adjust if your Open Notebook API differs. A page served over HTTPS cannot call `http://localhost:5055` (mixed content), so the NotebookLM copy-URLs flow is the reliable one from the live site. Ignore or delete these buttons if you do not want them.
- **Quick links**: your Personal / Work / Weather groups and local images are preserved exactly. Images display at 48px on a white tile chip (40px on phones); labels appear only on hover or keyboard focus. If an image fails to load, a generic link icon shows instead.
- **Weather**: the full tile display (high/low, rain today/month/total, UV risk level, cardinal wind direction, pressure trend, indoor readings) is ported into the terminal styling, using the same weather.json fields.

## Data format for the three section files

```json
{
  "section": "ai_business",
  "label": "AI + Business",
  "last_updated": "2026-07-11T15:00:00Z",
  "curated_by": "manual_upload",
  "total_count": 2,
  "articles": [
    {
      "title": "...",
      "url": "https://...",
      "source": "...",
      "date": "2026-07-10",
      "synopsis": "...",
      "tags": ["Business"],
      "verification": "Date and link verified."
    }
  ]
}
```

Legacy fields (`publisher`, `date_parsed`, `summary`, `theme`, `category`) are still understood on import, so older exports remain usable.
