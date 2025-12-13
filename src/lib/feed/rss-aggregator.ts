// ============================================================================
// FILE: src/lib/feed/rss-aggregator.ts
// ============================================================================
import Parser from 'rss-parser';
import { GLOBAL_SOURCES, getRssSeeds, type ResearchSource } from '../config/knowledge-base';

// Initialize Parser
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml; q=0.1',
  },
});

const TRUSTED_OVERRIDES = [
  { id: 'nature', name: 'Nature Research', url: 'http://feeds.nature.com/nature/rss/current' },
  { id: 'arxiv_ai', name: 'arXiv (AI)', url: 'http://export.arxiv.org/rss/cs.AI' },
  { id: 'arxiv_cl', name: 'arXiv (Computation)', url: 'http://export.arxiv.org/rss/cs.CL' },
  { id: 'techcrunch', name: 'TechCrunch (AI)', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
  { id: 'yc', name: 'Hacker News', url: 'https://hnrss.org/newest?points=100' },
  { id: 'wired', name: 'Wired AI', url: 'https://www.wired.com/feed/category/ai/latest/rss' },
  { id: 'venturebeat', name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/feed/' },
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
 */
function safeString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val._) return String(val._);
    if (val.toString) return val.toString();
    return JSON.stringify(val);
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
  const overrides = TRUSTED_OVERRIDES.map((s) => ({
    ...s,
    category: 'media' as const,
    region: 'GLOBAL' as const,
    institution: undefined as string | undefined,
    isOverride: true,
  }));

  // 1) explicit RSS seeds from KB
  const explicitRss = getRssSeeds().map((s) => ({
    id: `kb_${s.id}`,
    name: s.name,
    url: s.rssUrl,
    category: s.category,
    region: s.region,
    institution: s.institution,
    isOverride: false,
  }));

  // 2) optional: guessed RSS for KB sources WITHOUT rss[]
  const guessed = GLOBAL_SOURCES.filter((s) => !(s.rss && s.rss.length > 0)).map((s) => ({
    id: s.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: s.name,
    url: guessFeedUrl(s.url),
    category: s.category,
    region: s.region,
    institution: s.institution,
    isOverride: false,
  }));

  // Dedup by URL
  const merged = [...overrides, ...explicitRss, ...guessed];
  const unique = Array.from(new Map(merged.map((m) => [m.url, m])).values());
  return unique;
}

export async function aggregateFeeds(): Promise<FeedItem[]> {
  const allSources = getAllSources();
  const allItems: FeedItem[] = [];

  console.log(`[RSS] Fetching from ${allSources.length} sources...`);

  const promises = allSources.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      if (!feed.items || feed.items.length === 0) return [];

      return feed.items.slice(0, 5).map((item) => {
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
          contentSnippet: safeString(rawSnippet).slice(0, 220) + '...',
          source: source.name,
          isoDate: item.isoDate || new Date(safeString(rawDate)).toISOString(),
          category: source.category,
          region: source.region,
          institution: source.institution,
        };
      });
    } catch {
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  results.forEach((result) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allItems.push(...result.value);
    }
  });

  allItems.sort((a, b) => {
    const dateA = new Date(a.isoDate).getTime();
    const dateB = new Date(b.isoDate).getTime();
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  });

  const seenLinks = new Set<string>();
  const uniqueItems: FeedItem[] = [];
  for (const item of allItems) {
    if (!item.link) continue;
    if (!seenLinks.has(item.link)) {
      seenLinks.add(item.link);
      uniqueItems.push(item);
    }
  }

  return JSON.parse(JSON.stringify(uniqueItems));
}
