#!/usr/bin/env python3
"""
News Curation Script for GitHub Actions
Fetches and curates news articles from various sources
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# Try to import required libraries
try:
    import requests
    from bs4 import BeautifulSoup
    import feedparser
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Installing required packages...")
    os.system('pip install requests beautifulsoup4 feedparser')
    import requests
    from bs4 import BeautifulSoup
    import feedparser


# Configuration - RSS feeds and sources to monitor
SOURCES = {
    'ai-business': [
        {
            'name': 'MIT Technology Review - AI',
            'url': 'https://www.technologyreview.com/feed/',
            'keywords': ['artificial intelligence', 'AI', 'machine learning', 'LLM']
        },
        {
            'name': 'Harvard Business Review - AI',
            'url': 'https://hbr.org/topic/subject/artificial-intelligence?feed=topic',
            'keywords': ['artificial intelligence', 'AI', 'machine learning']
        },
        {
            'name': 'VentureBeat AI',
            'url': 'https://venturebeat.com/category/ai/feed/',
            'keywords': ['AI', 'artificial intelligence', 'enterprise AI']
        }
    ],
    'ai-education': [
        {
            'name': 'Chronicle of Higher Education - Technology',
            'url': 'https://www.chronicle.com/section/technology/123/rss',
            'keywords': ['AI', 'artificial intelligence', 'technology', 'digital']
        },
        {
            'name': 'Inside Higher Ed - Technology',
            'url': 'https://www.insidehighered.com/rss/technology.xml',
            'keywords': ['AI', 'artificial intelligence', 'technology']
        }
    ],
    'ai-tech': [
        {
            'name': 'ArXiv AI',
            'url': 'http://export.arxiv.org/rss/cs.AI',
            'keywords': ['transformer', 'LLM', 'generative', 'foundation model']
        },
        {
            'name': 'Towards Data Science',
            'url': 'https://pub.towardsdatascience.com/feed',
            'keywords': ['AI', 'machine learning', 'deep learning']
        }
    ]
}


def fetch_rss_feed(url):
    """Fetch and parse an RSS feed"""
    try:
        feed = feedparser.parse(url)
        return feed.entries
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


def extract_article_content(url):
    """Try to extract article content from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to find article body
        article = soup.find('article') or soup.find('div', class_='article-body') or soup.find('main')
        
        if article:
            paragraphs = article.find_all('p')
            content = ' '.join([p.get_text() for p in paragraphs[:5]])
            return content[:1000]  # Limit length
        
        return None
    except Exception as e:
        print(f"Error extracting content from {url}: {e}")
        return None


def categorize_article(title, description, keywords_list):
    """Determine which category an article belongs to"""
    text = f"{title} {description}".lower()
    
    for category, sources in SOURCES.items():
        for source in sources:
            if any(keyword.lower() in text for keyword in source['keywords']):
                # Return the broader category
                if 'business' in category:
                    return 'AI + Business'
                elif 'education' in category:
                    return 'AI + Higher Ed'
                else:
                    return 'AI Technology'
    
    return 'AI General'


def curate_articles():
    """Main curation logic"""
    all_articles = []
    
    for category, sources in SOURCES.items():
        print(f"Processing category: {category}")
        
        for source in sources:
            print(f"  Fetching: {source['name']}")
            entries = fetch_rss_feed(source['url'])
            
            for entry in entries[:5]:  # Limit to 5 most recent per source
                # Extract article data
                title = entry.get('title', 'No title')
                url = entry.get('link', '')
                published = entry.get('published', entry.get('updated', ''))
                description = entry.get('description', entry.get('summary', ''))
                
                # Skip if no URL
                if not url:
                    continue
                
                # Generate synopsis from description
                synopsis = description[:300] if description else ''
                if not synopsis and 'content' in entry:
                    synopsis = str(entry.content[0].get('value', ''))[:300]
                
                # Categorize
                theme = categorize_article(title, synopsis, source['keywords'])
                
                article = {
                    'title': title,
                    'url': url,
                    'source': source['name'],
                    'date': published,
                    'synopsis': synopsis.replace('\n', ' ').strip(),
                    'theme': theme,
                    'category': category,
                    'fetched_at': datetime.utcnow().isoformat()
                }
                
                all_articles.append(article)
    
    # Sort by date (most recent first)
    all_articles.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    # Limit to 50 articles total
    curated = all_articles[:50]
    
    return curated


def save_to_json(articles, output_path):
    """Save curated articles to JSON file"""
    data = {
        'articles': articles,
        'last_updated': datetime.utcnow().isoformat(),
        'total_count': len(articles)
    }
    
    # Ensure directory exists
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(articles)} articles to {output_path}")


def main():
    """Main entry point"""
    print("Starting news curation...")
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    
    # Curate articles
    articles = curate_articles()
    
    if not articles:
        print("Warning: No articles curated!")
        # Create empty data file
        save_to_json([], 'data/news.json')
        return
    
    # Save to JSON
    save_to_json(articles, 'data/news.json')
    
    # Print summary
    print("\n=== Curation Summary ===")
    print(f"Total articles: {len(articles)}")
    
    # Count by theme
    themes = {}
    for article in articles:
        theme = article.get('theme', 'Unknown')
        themes[theme] = themes.get(theme, 0) + 1
    
    print("\nBy theme:")
    for theme, count in sorted(themes.items()):
        print(f"  {theme}: {count}")
    
    print("\nCuration complete!")


if __name__ == '__main__':
    main()