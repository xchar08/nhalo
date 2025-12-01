// ============================================================================
// FILE: src/lib/feed/rss-aggregator.ts
// ============================================================================
import Parser from 'rss-parser';

const parser = new Parser();

// Configuration of Trusted Feeds
const FEED_SOURCES = [
    { id: 'nature', name: 'Nature Research', url: 'http://feeds.nature.com/nature/rss/current' },
    { id: 'arxiv_ai', name: 'arXiv (AI)', url: 'http://export.arxiv.org/rss/cs.AI' },
    { id: 'arxiv_cl', name: 'arXiv (Computation)', url: 'http://export.arxiv.org/rss/cs.CL' },
    { id: 'techcrunch', name: 'TechCrunch (AI)', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
    { id: 'yc', name: 'Hacker News', url: 'https://hnrss.org/newest?points=100' } // Filtered HN for quality
];

export interface FeedItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    isoDate: string;
}

export async function aggregateFeeds(): Promise<FeedItem[]> {
    const allItems: FeedItem[] = [];
    
    // Fetch in parallel
    const promises = FEED_SOURCES.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            
            // Normalize items
            const normalized = feed.items.map(item => ({
                id: item.guid || item.link || Math.random().toString(),
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate || new Date().toISOString(),
                contentSnippet: (item.contentSnippet || item.content || '').slice(0, 200) + '...',
                source: source.name,
                isoDate: item.isoDate || new Date(item.pubDate || Date.now()).toISOString()
            }));

            return normalized.slice(0, 5); // Take top 5 from each to keep it fast
        } catch (e) {
            console.error(`Failed to fetch feed: ${source.name}`, e);
            return [];
        }
    });

    const results = await Promise.all(promises);
    
    // Flatten
    results.forEach(items => allItems.push(...items));

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());

    return allItems;
}
