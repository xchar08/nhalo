// ============================================================================
// FILE: src/lib/feed/rss-aggregator.ts
// ============================================================================
import Parser from 'rss-parser';
import { GLOBAL_SOURCES, ResearchSource } from '../config/knowledge-base';

const parser = new Parser({
    timeout: 5000, // Timeout after 5s to prevent hanging on bad sources
    headers: {
        'User-Agent': 'Research-Aggregator/1.0',
    }
});

// 1. Existing High-Quality Feeds (Hardcoded overrides)
const TRUSTED_FEEDS = [
    { id: 'nature', name: 'Nature Research', url: 'http://feeds.nature.com/nature/rss/current', category: 'journal' },
    { id: 'arxiv_ai', name: 'arXiv (AI)', url: 'http://export.arxiv.org/rss/cs.AI', category: 'preprint' },
    { id: 'arxiv_cl', name: 'arXiv (Computation)', url: 'http://export.arxiv.org/rss/cs.CL', category: 'preprint' },
    { id: 'techcrunch', name: 'TechCrunch (AI)', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'media' },
    { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'media' },
    { id: 'yc', name: 'Hacker News', url: 'https://hnrss.org/newest?points=100', category: 'social' } 
];

export interface FeedItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    isoDate: string;
    // New fields from Knowledge Base
    category?: string;
    region?: string;
    institution?: string;
}

/**
 * Helper: Heuristic to guess an RSS endpoint from a landing page URL.
 * Most knowledge-base URLs are landing pages (e.g., ai.stanford.edu), 
 * which will fail in an RSS parser. We try to guess the feed URL.
 */
function getProposedRssUrl(url: string): string {
    // If it already looks like a feed, return it
    if (url.includes('.xml') || url.includes('rss') || url.includes('feed')) {
        return url;
    }
    
    // Clean trailing slash
    const cleanUrl = url.replace(/\/$/, '');

    // Common WordPress/Ghost/CMS feed patterns
    // You might want to make this smarter or scrape the HTML for <link rel="alternate"> tags in the future
    return `${cleanUrl}/feed`; 
}

export async function aggregateFeeds(): Promise<FeedItem[]> {
    const allItems: FeedItem[] = [];

    // 2. Map Knowledge Base sources to Feed objects
    // We exclude sources that are already in TRUSTED_FEEDS to avoid duplicates
    const kbSources = GLOBAL_SOURCES.filter(k => 
        !TRUSTED_FEEDS.some(t => t.url.includes(k.url) || t.name === k.name)
    ).map(source => ({
        id: source.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: source.name,
        url: getProposedRssUrl(source.url), // Attempt to auto-fix the URL
        category: source.category,
        region: source.region,
        institution: source.institution
    }));

    // Combine both lists
    const combinedSources = [...TRUSTED_FEEDS, ...kbSources];

    console.log(`Attempting to fetch from ${combinedSources.length} sources...`);

    // Fetch in parallel
    // Note: With 100+ sources, you might want to use p-limit to batch these 
    // instead of firing 100 network requests simultaneously.
    const promises = combinedSources.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            
            // Normalize items
            const normalized: FeedItem[] = feed.items.map(item => ({
                id: item.guid || item.link || Math.random().toString(),
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate || new Date().toISOString(),
                contentSnippet: (item.contentSnippet || item.content || '').slice(0, 200) + '...',
                source: source.name,
                isoDate: item.isoDate || new Date(item.pubDate || Date.now()).toISOString(),
                // Add metadata
                category: (source as any).category || 'general',
                region: (source as any).region || 'GLOBAL',
                institution: (source as any).institution
            }));

            return normalized.slice(0, 5); // Take top 5 from each
        } catch (e) {
            // Silent fail is necessary here because many knowledge-base URLs won't have valid RSS feeds
            // console.warn(`Skipping ${source.name} (${source.url}): No valid RSS feed found.`);
            return [];
        }
    });

    const results = await Promise.all(promises);
    
    // Flatten
    results.forEach(items => allItems.push(...items));

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());

    // Remove duplicates (sometimes different feeds pick up the same global news)
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.link, item])).values());

    return uniqueItems;
}
