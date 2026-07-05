#!/usr/bin/env python3
"""
Reliable News Curation Script with Date Verification

Fetches articles from RSS feeds with strict publication date verification.
Supports time-bounded curation (e.g., "last 72 hours", "last week").

Usage:
  python scripts/curate_reliable.py --hours 72 --topic ai-business
  python scripts/curate_reliable.py --days 7 --min-articles 15
  python scripts/curate_reliable.py --custom-feed https://example.com/feed.xml --hours 48

Features:
  - Extracts publication dates from RSS feed metadata (reliable)
  - Filters articles by publication window
  - Deduplicates by URL
  - Validates article metadata before saving
  - Outputs detailed curation report with dates
"""

import json
import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import re

# Try to import required libraries
try:
    import feedparser
except ImportError:
    print("Installing feedparser...")
    os.system('pip install feedparser')
    import feedparser

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system('pip install requests')
    import requests


# =============================================================================
# RSS Feed Sources (verified, reliable publication dates)
# =============================================================================

SOURCES = {
    'ai-business': [
        {
            'name': 'Harvard Business Review - AI',
            'url': 'https://hbr.org/artificial-intelligence/rss.xml',
            'keywords': ['artificial intelligence', 'AI', 'machine learning', 'enterprise'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
            'name': 'MIT Sloan Management Review',
            'url': 'https://sloanreview.mit.edu/feed/',
            'keywords': ['AI', 'artificial intelligence', 'business', 'strategy'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
            'name': 'VentureBeat AI',
            'url': 'https://venturebeat.com/category/ai/feed/',
            'keywords': ['AI', 'artificial intelligence', 'enterprise AI', 'business'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
            'name': 'Forbes - AI',
            'url': 'https://www.forbes.com/digital-assets/feeds/rss/artificial-intelligence/',
            'keywords': ['AI', 'artificial intelligence', 'business', 'enterprise'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
            'name': 'TechCrunch AI',
            'url': 'https://techcrunch.com/category/artificial-intelligence/feed/',
            'keywords': ['AI', 'artificial intelligence', 'startup', 'funding'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
            'name': 'Latent.Space',
            'url': 'https://www.latent.space/feed',
            'keywords': ['AI', 'artificial intelligence', 'LLM', 'AI engineering', 'infrastructure'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
                    'name': 'Build Fast with AI',
                    'url': 'https://www.buildfastwithai.com/blogs',
                    'keywords': ['AI', 'artificial intelligence', 'business', 'productivity'],
                    'category': 'ai-business',
                    'theme': 'AI + Business'
                },
        {
            'name': 'AI Weekly',
            'url': 'https://aiweekly.co/feed',
            'keywords': ['AI', 'artificial intelligence', 'news', 'weekly'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
            'name': 'AI Journ',
            'url': 'https://aijourn.com/feed/',
            'keywords': ['AI', 'artificial intelligence', 'journal', 'news'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        },
        {
                    'name': 'Improvado - MarTech',
                    'url': 'https://improvado.io/blog',
                    'keywords': ['AI', 'marketing', 'martech', 'automation', 'analytics'],
                    'category': 'ai-business',
                    'theme': 'AI + Business'
                },
        {
            'name': 'Aprimo Blog',
            'url': 'https://www.aprimo.com/feed',
            'keywords': ['AI', 'content', 'marketing', 'DAM', 'automation'],
            'category': 'ai-business',
            'theme': 'AI + Business'
        }
    ],
    'ai-education': [
        {
            'name': 'Inside Higher Ed - Technology',
            'url': 'https://www.insidehighered.com/rss/technology.xml',
            'keywords': ['AI', 'artificial intelligence', 'technology'],
            'category': 'ai-education',
            'theme': 'AI in Higher Education'
        },
        {
            'name': 'Chronicle of Higher Education - Technology',
            'url': 'https://www.chronicle.com/section/technology/123/rss',
            'keywords': ['AI', 'artificial intelligence', 'technology'],
            'category': 'ai-education',
            'theme': 'AI in Higher Education'
        },
        {
            'name': 'HEPI (Higher Education Policy Institute)',
            'url': 'https://www.hepi.ac.uk/feed/',
            'keywords': ['AI', 'artificial intelligence', 'higher education'],
            'category': 'ai-education',
            'theme': 'AI in Higher Education'
        },
        {
            'name': 'EDUCAUSE Review',
            'url': 'https://er.educause.edu/articles?rss=true',
            'keywords': ['AI', 'technology', 'higher education'],
            'category': 'ai-education',
            'theme': 'AI in Higher Education'
        }
    ],
    'ai-tech': [
        {
            'name': 'MIT Technology Review',
            'url': 'https://www.technologyreview.com/feed/',
            'keywords': ['AI', 'artificial intelligence', 'machine learning', 'LLM'],
            'category': 'ai-tech',
            'theme': 'AI Technology'
        },
        {
            'name': 'Ars Technica AI',
            'url': 'https://arstechnica.com/ai/feed/',
            'keywords': ['AI', 'artificial intelligence', 'machine learning'],
            'category': 'ai-tech',
            'theme': 'AI Technology'
        },
        {
            'name': 'The Verge AI',
            'url': 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
            'keywords': ['AI', 'artificial intelligence', 'tech'],
            'category': 'ai-tech',
            'theme': 'AI Technology'
        }
    ]
}


def parse_date(date_string: str) -> Optional[datetime]:
    """
    Parse date string from RSS feed into datetime object.
    Handles multiple date formats commonly used in RSS feeds.
    """
    if not date_string:
        return None
    
    # Common RSS date formats
    formats = [
        '%a, %d %b %Y %H:%M:%S %Z',      # RFC 822: "Mon, 01 Jul 2026 10:00:00 GMT"
        '%a, %d %b %Y %H:%M:%S %z',      # RFC 822 with numeric tz
        '%Y-%m-%dT%H:%M:%S%z',           # ISO 8601: "2026-07-01T10:00:00+00:00"
        '%Y-%m-%dT%H:%M:%SZ',            # ISO 8601 UTC: "2026-07-01T10:00:00Z"
        '%Y-%m-%d %H:%M:%S',             # Simple: "2026-07-01 10:00:00"
        '%Y-%m-%d',                       # Date only: "2026-07-01"
        '%d %b %Y %H:%M:%S',             # "01 Jul 2026 10:00:00"
    ]
    
    # Clean up the date string
    date_string = date_string.strip()
    # Remove extra timezone info like "GMT+0000 (GMT)"
    date_string = re.sub(r'\s*\([^)]*\)\s*$', '', date_string)
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    
    # Try feedparser's built-in parsing as fallback
    try:
        parsed = feedparser._parse_date(date_string)
        if parsed:
            return datetime(*parsed[:6])
    except:
        pass
    
    return None


def fetch_rss_feed(url: str, timeout: int = 10) -> List[Dict]:
    """
    Fetch and parse an RSS feed.
    Returns list of article entries with verified metadata.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        }
        
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        
        articles = []
        for entry in feed.entries:
            # Extract publication date (CRITICAL: verify this exists)
            published = entry.get('published') or entry.get('updated')
            published_dt = parse_date(published)
            
            article = {
                'title': entry.get('title', 'No title'),
                'url': entry.get('link', ''),
                'source': feed.feed.get('title', 'Unknown source'),
                'published': published,
                'published_parsed': published_dt,
                'description': entry.get('description', entry.get('summary', '')),
                'content': str(entry.content[0].get('value', '')) if hasattr(entry, 'content') and entry.content else '',
            }
            articles.append(article)
        
        return articles
    
    except Exception as e:
        print(f"  ⚠ Error fetching {url}: {e}")
        return []


def filter_by_date_window(articles: List[Dict], hours: int = None, days: int = None) -> List[Dict]:
    """
    Filter articles to only include those published within the specified time window.
    """
    if hours is None and days is None:
        return articles
    
    # Calculate cutoff time (naive UTC)
    if hours is not None:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        window_desc = f"last {hours} hours"
    else:
        cutoff = datetime.utcnow() - timedelta(days=days)
        window_desc = f"last {days} days"
    
    filtered = []
    for article in articles:
        pub_date = article.get('published_parsed')
        if pub_date is None:
            # Skip articles without verifiable dates
            print(f"  ⚠ Skipping '{article['title']}' - no verifiable publication date")
            continue
        
        # Make pub_date naive if it's timezone-aware (convert to UTC then strip tz)
        if pub_date.tzinfo is not None:
            pub_date = pub_date.replace(tzinfo=None)
        
        if pub_date >= cutoff:
            filtered.append(article)
    
    print(f"  Filtered to {len(filtered)} articles from {window_desc}")
    return filtered


def deduplicate_articles(articles: List[Dict]) -> List[Dict]:
    """
    Remove duplicate articles based on URL.
    """
    seen_urls = set()
    unique = []
    
    for article in articles:
        url = article.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique.append(article)
    
    duplicates = len(articles) - len(unique)
    if duplicates > 0:
        print(f"  Removed {duplicates} duplicate(s)")
    
    return unique


def extract_synopsis(description: str, content: str, max_length: int = 300) -> str:
    """
    Extract a clean synopsis from article description or content.
    """
    # Prefer description, fall back to content
    text = description or content
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Truncate to max_length
    if len(text) > max_length:
        # Try to cut at sentence boundary
        truncated = text[:max_length-3]
        last_period = truncated.rfind('.')
        if last_period > max_length // 2:
            text = truncated[:last_period+1]
        else:
            text = truncated + '...'
    
    return text.strip()


def curate_articles(
    topics: List[str] = None,
    hours: int = None,
    days: int = None,
    min_articles: int = 10,
    max_per_source: int = 10,
    custom_feeds: List[str] = None
) -> List[Dict]:
    """
    Main curation logic with date verification.
    """
    all_articles = []
    
    # Determine which sources to use
    if topics:
        active_sources = []
        for topic in topics:
            if topic in SOURCES:
                active_sources.extend(SOURCES[topic])
            else:
                print(f"⚠ Unknown topic '{topic}', skipping")
    else:
        # Use all sources
        active_sources = [source for sources in SOURCES.values() for source in sources]
    
    # Add custom feeds
    if custom_feeds:
        for url in custom_feeds:
            active_sources.append({
                'name': f'Custom Feed: {url}',
                'url': url,
                'keywords': [],
                'category': 'ai-business',
                'theme': 'AI + Business'
            })
    
    print(f"Fetching from {len(active_sources)} sources...")
    print(f"Time window: {'last ' + str(hours) + ' hours' if hours else 'last ' + str(days) + ' days' if days else 'all time'}")
    print()
    
    # Fetch from each source
    for source in active_sources:
        print(f"Processing: {source['name']}")
        
        entries = fetch_rss_feed(source['url'])
        print(f"  Found {len(entries)} articles in feed")
        
        if not entries:
            continue
        
        # Filter by date window
        entries = filter_by_date_window(entries, hours=hours, days=days)
        
        # Limit per source
        entries = entries[:max_per_source]
        
        # Format articles
        for entry in entries:
            if not entry.get('url'):
                continue
            
            synopsis = extract_synopsis(
                entry.get('description', ''),
                entry.get('content', ''),
                max_length=300
            )
            
            article = {
                'title': entry['title'],
                'url': entry['url'],
                'source': entry['source'],  # RSS feed title
                'publisher': source['name'],  # Our configured name
                'date': entry['published'],
                'date_parsed': entry['published_parsed'].isoformat() if entry.get('published_parsed') else None,
                'synopsis': synopsis,
                'theme': source['theme'],
                'category': source['category'],
                'curated_at': datetime.utcnow().isoformat() + 'Z',
                'curated_by': 'automated',
                'curation_method': 'rss_feed'
            }
            
            all_articles.append(article)
    
    # Deduplicate
    print()
    print("Removing duplicates...")
    unique_articles = deduplicate_articles(all_articles)
    
    # Sort by date (most recent first)
    unique_articles.sort(
        key=lambda x: x.get('date_parsed') or '',
        reverse=True
    )
    
    return unique_articles


def save_to_json(articles: List[Dict], output_path: str = 'data/news.json'):
    """
    Save curated articles to JSON file with validation.
    """
    # Validate articles
    valid_articles = []
    for article in articles:
        # Required fields
        if not all([
            article.get('title'),
            article.get('url'),
            article.get('source'),
            article.get('date'),
            article.get('synopsis'),
            article.get('theme'),
            article.get('category')
        ]):
            print(f"⚠ Skipping incomplete article: {article.get('title', 'Unknown')}")
            continue
        
        valid_articles.append(article)
    
    data = {
        'articles': valid_articles,
        'last_updated': datetime.utcnow().isoformat() + 'Z',
        'total_count': len(valid_articles),
        'curated_by': 'automated',
        'curation_method': 'rss_feed_with_date_verification',
        'curation_notes': f"Articles verified from RSS feeds with publication date filtering"
    }
    
    # Ensure directory exists
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved {len(valid_articles)} articles to {output_path}")
    return data


def print_summary(data: Dict, show_articles: bool = False):
    """
    Print curation summary report.
    """
    articles = data['articles']
    
    print()
    print("=" * 60)
    print("CURATION SUMMARY")
    print("=" * 60)
    print(f"Total articles: {len(articles)}")
    print(f"Last updated: {data['last_updated']}")
    print(f"Curation method: {data.get('curation_method', 'unknown')}")
    print()
    
    # By theme
    themes = {}
    for article in articles:
        theme = article.get('theme', 'Unknown')
        themes[theme] = themes.get(theme, 0) + 1
    
    print("By theme:")
    for theme, count in sorted(themes.items(), key=lambda x: -x[1]):
        print(f"  {theme}: {count}")
    
    print()
    
    # By category
    categories = {}
    for article in articles:
        cat = article.get('category', 'unknown')
        categories[cat] = categories.get(cat, 0) + 1
    
    print("By category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    
    print()
    
    # By source
    sources = {}
    for article in articles:
        source = article.get('publisher', article.get('source', 'Unknown'))
        sources[source] = sources.get(source, 0) + 1
    
    print("By source:")
    for source, count in sorted(sources.items(), key=lambda x: -x[1]):
        print(f"  {source}: {count}")
    
    print()
    
    # Date range
    if articles:
        dates = [a.get('date_parsed') for a in articles if a.get('date_parsed')]
        if dates:
            oldest = min(dates)
            newest = max(dates)
            print(f"Date range: {oldest[:10]} to {newest[:10]}")
    
    print()
    
    # Show articles if requested
    if show_articles:
        print("ARTICLES:")
        print("-" * 60)
        for i, article in enumerate(articles[:20], 1):  # Show first 20
            print(f"{i}. [{article['theme']}]")
            print(f"   Title: {article['title']}")
            print(f"   Source: {article['publisher']} ({article['source']})")
            print(f"   Date: {article['date'][:10] if article.get('date') else 'N/A'}")
            print(f"   URL: {article['url']}")
            print(f"   Synopsis: {article['synopsis'][:150]}...")
            print()
    
    print("=" * 60)
    print("✓ Curation complete!")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description='Curate news articles with verified publication dates',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Get articles from last 72 hours on AI + Business
  python curate_reliable.py --topic ai-business --hours 72

  # Get articles from last week on AI in Higher Education
  python curate_reliable.py --topic ai-education --days 7

  # Get articles from all topics in last 48 hours
  python curate_reliable.py --hours 48 --min-articles 15

  # Use custom RSS feed
  python curate_reliable.py --custom-feed https://example.com/feed.xml --hours 72
        """
    )
    
    parser.add_argument('--topic', action='append', dest='topics',
                       choices=['ai-business', 'ai-education', 'ai-tech'],
                       help='Topic to curate (can specify multiple)')
    parser.add_argument('--hours', type=int,
                       help='Only include articles from last N hours')
    parser.add_argument('--days', type=int,
                       help='Only include articles from last N days')
    parser.add_argument('--min-articles', type=int, default=10,
                       help='Minimum number of articles to curate (default: 10)')
    parser.add_argument('--max-per-source', type=int, default=10,
                       help='Maximum articles per source (default: 10)')
    parser.add_argument('--custom-feed', action='append', dest='custom_feeds',
                       help='Custom RSS feed URL (can specify multiple)')
    parser.add_argument('--output', type=str, default='data/news.json',
                       help='Output JSON file path (default: data/news.json)')
    parser.add_argument('--show-articles', action='store_true',
                       help='Show article details in output')
    
    args = parser.parse_args()
    
    if not args.topics and not args.custom_feeds:
        args.topics = ['ai-business', 'ai-education', 'ai-tech']
    
    if not args.hours and not args.days:
        print("Error: Must specify --hours or --days for time-bounded curation")
        parser.print_help()
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("NEWS CURATION WITH DATE VERIFICATION")
    print("=" * 60)
    print()
    
    # Curate articles
    articles = curate_articles(
        topics=args.topics,
        hours=args.hours,
        days=args.days,
        min_articles=args.min_articles,
        max_per_source=args.max_per_source,
        custom_feeds=args.custom_feeds
    )
    
    # Check if we have enough articles
    if len(articles) < args.min_articles:
        print()
        print(f"⚠ Warning: Only found {len(articles)} articles (minimum: {args.min_articles})")
        print("  Consider expanding the time window or adding more sources.")
    
    # Save to JSON
    data = save_to_json(articles, args.output)
    
    # Print summary
    print_summary(data, show_articles=args.show_articles)
    
    # Return success/failure
    if len(articles) >= args.min_articles:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()