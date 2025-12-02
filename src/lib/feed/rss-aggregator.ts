// ============================================================================
// FILE: src/lib/feed/rss-aggregator.ts
// ============================================================================
import Parser from 'rss-parser';
import { GLOBAL_SOURCES, type ResearchSource } from '../config/knowledge-base';

// Initialize Parser with custom headers to avoid 403 Forbidden errors
const parser = new Parser({
    timeout: 10000, // 10s timeout per feed
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
    }
});

// 1. Manual High-Quality Overrides (These are known good RSS URLs)
// We prioritize these over the generic knowledge base URLs.
const TRUSTED_OVERRIDES = [
    { id: 'nature', name: 'Nature Research', url: 'http://feeds.nature.com/nature/rss/current' },
    { id: 'arxiv_ai', name: 'arXiv (AI)', url: 'http://export.arxiv.org/rss/cs.AI' },
    { id: 'arxiv_cl', name: 'arXiv (Computation)', url: 'http://export.arxiv.org/rss/cs.CL' },
    { id: 'techcrunch', name: 'TechCrunch (AI)', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
    { id: 'yc', name: 'Hacker News', url: 'https://hnrss.org/newest?points=100' },
    { id: 'wired', name: 'Wired AI', url: 'https://www.wired.com/feed/category/ai/latest/rss' },
    { id: 'venturebeat', name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/feed/' }
];

export interface FeedItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    isoDate: string;
    // Extended metadata
    category: string;
    region: string;
    institution?: string;
}

/**
 * Helper: Attempts to convert a landing page URL into a likely RSS feed URL.
 * Since many KB sources are just "https://site.com", we guess standard feed paths.
 */
function guessFeedUrl(url: string): string {
    // If it already looks like a file or feed, return it
    if (url.match(/(\.xml|\.rss|feed|atom)$/i)) return url;
    
    // Strip trailing slashes
    const clean = url.replace(/\/$/, '');
    
    // Heuristic: 
    // - Blogs usually live at /blog/feed or /feed
    // - News sites often use /rss
    if (clean.includes('blog')) return `${clean}/feed`;
    
    return `${clean}/feed`; // Default guess
}

/**
 * Merges Trusted Overrides with the Global Knowledge Base
 */
function getAllSources() {
    // 1. Convert Trusted Overrides to common format
    const overrides = TRUSTED_OVERRIDES.map(s => ({
        ...s,
        category: 'media' as const,
        region: 'GLOBAL' as const,
        institution: undefined,
        isOverride: true
    }));

    // 2. Process Knowledge Base
    const kbSources = GLOBAL_SOURCES.map(s => {
        // Check if we have an override for this source already
        const hasOverride = overrides.find(o => 
            o.name === s.name || o.url.includes(s.url)
        );

        if (hasOverride) return null; // Skip to avoid duplicates

        return {
            id: s.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: s.name,
            url: guessFeedUrl(s.url), // Auto-append '/feed'
            category: s.category,
            region: s.region,
            institution: s.institution,
            isOverride: false
        };
    }).filter(Boolean) as any[]; // Filter out nulls

    return [...overrides, ...kbSources];
}

export async function aggregateFeeds(): Promise<FeedItem[]> {
    const allSources = getAllSources();
    const allItems: FeedItem[] = [];
    
    console.log(`[RSS] Fetching from ${allSources.length} sources...`);

    // Fetch all feeds in parallel
    // Note: In production, you might want to use p-limit to batch these if >100
    const promises = allSources.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            
            if (!feed.items || feed.items.length === 0) return [];

            // Normalize items
            return feed.items.slice(0, 5).map(item => ({
                id: item.guid || item.link || Math.random().toString(36).substring(7),
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate || new Date().toISOString(),
                contentSnippet: (item.contentSnippet || item.content || item.summary || '').slice(0, 200) + '...',
                source: source.name,
                isoDate: item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()),
                // Metadata from Knowledge Base
                category: source.category,
                region: source.region,
                institution: source.institution
            }));

        } catch (e) {
            // Silent fail allows the aggregator to continue even if 50% of sources fail
            // console.warn(`[RSS] Failed: ${source.name} (${source.url})`);
            return [];
        }
    });

    const results = await Promise.allSettled(promises);
    
    // Aggregate successful results
    results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allItems.push(...result.value);
        }
    });

    // Sort by date (newest first)
    // We filter out invalid dates that might parse as NaN
    allItems.sort((a, b) => {
        const dateA = new Date(a.isoDate).getTime();
        const dateB = new Date(b.isoDate).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

    // Deduplicate items by link (some aggregators pick up the same press release)
    const seenLinks = new Set();
    const uniqueItems: FeedItem[] = [];
    
    for (const item of allItems) {
        if (!seenLinks.has(item.link)) {
            seenLinks.add(item.link);
            uniqueItems.push(item);
        }
    }

    return uniqueItems;
}
