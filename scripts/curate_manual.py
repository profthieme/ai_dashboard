#!/usr/bin/env python3
"""
Dashboard Article Curation Script

Usage: 
  1. Provide article URLs or search topics in the chat
  2. This script formats them for the dashboard
  3. Commits to GitHub for auto-deployment

Run from ai_dashboard repo root.
"""

import json
from datetime import datetime
from pathlib import Path

def curate_article(url, title=None, synopsis=None, source=None, theme="AI + Business", category="ai-business"):
    """
    Create a curated article entry.
    
    Args:
        url: Article URL
        title: Article title (will fetch if not provided)
        synopsis: 2-4 sentence summary (will extract if not provided)
        source: Publication name (e.g., "Harvard Business Review")
        theme: Display theme ("AI + Business", "AI in Higher Education", "AI Technology", "AI General")
        category: Internal category ("ai-business", "ai-education", "ai-tech")
    """
    return {
        "title": title or "Title from URL",
        "url": url,
        "source": source or "Source",
        "date": datetime.utcnow().isoformat() + "Z",
        "synopsis": synopsis or "Synopsis needed",
        "theme": theme,
        "category": category,
        "curated_at": datetime.utcnow().isoformat() + "Z",
        "curated_by": "manual"
    }

def create_news_json(articles, output_path="data/news.json"):
    """Save articles to news.json format."""
    
    data = {
        "articles": articles,
        "last_updated": datetime.utcnow().isoformat(),
        "total_count": len(articles),
        "curated_by": "manual",
        "curation_notes": "Manually curated articles"
    }
    
    # Ensure directory exists
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Created {output_path} with {len(articles)} articles")
    print(f"  Categories: {len([a for a in articles if a['category']=='ai-business'])} Business, "
          f"{len([a for a in articles if a['category']=='ai-education'])} Education, "
          f"{len([a for a in articles if a['category']=='ai-tech'])} Tech")
    
    return data

def commit_and_push(message="Curated articles for dashboard"):
    """Commit and push to GitHub."""
    import subprocess
    
    # Stage changes
    subprocess.run(["git", "add", "data/news.json"], check=True)
    
    # Commit
    subprocess.run(["git", "commit", "-m", message], check=True)
    
    # Push
    subprocess.run(["git", "push"], check=True)
    
    print("✓ Committed and pushed to GitHub")
    print("  Dashboard will update in 1-2 minutes at: https://profthieme.github.io/ai_dashboard/")

if __name__ == "__main__":
    # Example usage - replace with your curated articles
    articles = [
        curate_article(
            url="https://example.com/article1",
            title="Example Article Title",
            synopsis="This is a 2-3 sentence summary of the article.",
            source="Example Source",
            theme="AI + Business",
            category="ai-business"
        )
    ]
    
    create_news_json(articles)
    # commit_and_push("Example curation")