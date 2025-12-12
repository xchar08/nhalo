// ============================================================================
// FILE: src/lib/feed/rss-aggregator.ts
// ============================================================================
import Parser from 'rss-parser';
import { GLOBAL_SOURCES, type ResearchSource } from '../config/knowledge-base';

// Initialize Parser
const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
    }
});

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
    category: string;
    region: string;
    institution?: string;
}

/**
 * HELPER: Safe String Conversion
 * Handles cases where XML parser returns objects like { $: { ... } } instead of strings
 */
function safeString(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    // Handle XML object wrappers
    if (typeof val === 'object') {
        if (val._) return String(val._); // Text content often in '_'
        if (val.toString) return val.toString();
        return JSON.stringify(val); // Last resort
    }
    return String(val);
}

function guessFeedUrl(url: string): string {
    if (url.match(/(\.xml|\.rss|feed|atom)$/i)) return url;
    const clean = url.replace(/\/$/, '');
    if (clean.includes('blog')) return `${clean}/feed`;
    return `${clean}/feed`; 
}

function getAllSources() {
    const overrides = TRUSTED_OVERRIDES.map(s => ({
        ...s,
        category: 'media' as const,
        region: 'GLOBAL' as const,
        institution: undefined,
        isOverride: true
    }));

    const kbSources = GLOBAL_SOURCES.map(s => {
        const hasOverride = overrides.find(o => 
            o.name === s.name || o.url.includes(s.url)
        );
        if (hasOverride) return null; 

        return {
            id: s.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: s.name,
            url: guessFeedUrl(s.url),
            category: s.category,
            region: s.region,
            institution: s.institution,
            isOverride: false
        };
    }).filter(Boolean) as any[]; 

    return [...overrides, ...kbSources];
}

export async function aggregateFeeds(): Promise<FeedItem[]> {
    const allSources = getAllSources();
    const allItems: FeedItem[] = [];
    
    console.log(`[RSS] Fetching from ${allSources.length} sources...`);

    const promises = allSources.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            
            if (!feed.items || feed.items.length === 0) return [];

            return feed.items.slice(0, 5).map(item => {
                // FORCE SANITIZATION on every field to prevent XML objects leaking
                const rawId = item.guid || item.link || Math.random().toString(36).substring(7);
                const rawTitle = item.title || 'Untitled';
                const rawLink = item.link || '';
                const rawDate = item.pubDate || new Date().toISOString();
                const rawSnippet = item.contentSnippet || item.content || item.summary || '';

                return {
                    id: safeString(rawId),
                    title: safeString(rawTitle),
                    link: safeString(rawLink),
                    pubDate: safeString(rawDate),
                    contentSnippet: safeString(rawSnippet).slice(0, 200) + '...',
                    source: source.name,
                    isoDate: item.isoDate || new Date(safeString(rawDate)).toISOString(),
                    category: source.category,
                    region: source.region,
                    institution: source.institution
                };
            });

        } catch (e) {
            return [];
        }
    });

    const results = await Promise.allSettled(promises);
    
    results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allItems.push(...result.value);
        }
    });

    allItems.sort((a, b) => {
        const dateA = new Date(a.isoDate).getTime();
        const dateB = new Date(b.isoDate).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

    const seenLinks = new Set();
    const uniqueItems: FeedItem[] = [];
    
    for (const item of allItems) {
        if (!seenLinks.has(item.link)) {
            seenLinks.add(item.link);
            uniqueItems.push(item);
        }
    }

    // FINAL SAFETY: Deep Clone to remove any hidden prototypes
    return JSON.parse(JSON.stringify(uniqueItems));
}
