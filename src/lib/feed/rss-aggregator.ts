// ============================================================================
// FILE: src/lib/feed/rss-aggregator.ts
// ============================================================================
import Parser from 'rss-parser';
import { GLOBAL_SOURCES, getRssSeeds, type ResearchSource } from '../config/knowledge-base';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml; q=0.1',
  },
});

const TRUSTED_OVERRIDES: Array<{
  id: string;
  name: string;
  url: string;
  category?: ResearchSource['category'];
  region?: ResearchSource['region'];
  institution?: string;
}> = [
  { id: 'nature', name: 'Nature Research', url: 'http://feeds.nature.com/nature/rss/current' },
  { id: 'science', name: 'Science Magazine', url: 'https://www.science.org/rss/news_current.xml' },
  { id: 'arxivai', name: 'arXiv AI', url: 'http://export.arxiv.org/rss/cs.AI' },
  { id: 'arxivcl', name: 'arXiv Computation', url: 'http://export.arxiv.org/rss/cs.CL' },
  { id: 'arxivlg', name: 'arXiv ML', url: 'http://export.arxiv.org/rss/cs.LG' },
  { id: 'techcrunch', name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
  { id: 'yc', name: 'Hacker News', url: 'https://hnrss.org/newest?points=100' },
  { id: 'wired', name: 'Wired AI', url: 'https://www.wired.com/feed/category/ai/latest/rss' },
  { id: 'venturebeat', name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/feed/' },
  { id: 'googleresearch', name: 'Google Research', url: 'http://feeds.feedburner.com/blogspot/gjzCe' },
  { id: 'openai', name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
  { id: 'microsoft', name: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/feed/' },
  { id: 'nvidia', name: 'NVIDIA Blog', url: 'https://blogs.nvidia.com/feed/' },
  { id: 'aws', name: 'AWS ML Blog', url: 'https://aws.amazon.com/blogs/machine-learning/feed/' },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { id: 'distill', name: 'Distill', url: 'https://distill.pub/rss.xml' },
  { id: 'bair', name: 'Berkeley AI Research', url: 'https://bair.berkeley.edu/blog/feed.xml' },
  { id: 'stanfordhai', name: 'Stanford HAI', url: 'https://hai.stanford.edu/news/rss' },
  { id: 'deepmind', name: 'Google DeepMind', url: 'https://deepmind.google/discover/blog/rss.xml' },
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

function safeString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    // common rss-parser shapes
    if ((val as any).href) return String((val as any).href);
    if ((val as any).url) return String((val as any).url);
    if (typeof (val as any).toString === 'function') return (val as any).toString();
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function guessFeedUrl(url: string): string {
  if (url.match(/(\.xml|rss|feed|atom)/i)) return url;
  const clean = url.replace(/\/$/, '');
  if (clean.includes('blog')) return `${clean}/feed`;
  return `${clean}/feed`;
}

function getAllSources() {
  const overrides = TRUSTED_OVERRIDES.map((s) => ({
    ...s,
    category: s.category ?? 'media',
    region: s.region ?? 'GLOBAL',
    institution: s.institution as string | undefined,
    isOverride: true,
  }));

  const explicitRss = getRssSeeds().map((kbs) => ({
    id: kbs.id,
    name: kbs.name,
    url: kbs.rssUrl,
    category: kbs.category,
    region: kbs.region,
    institution: kbs.institution,
    isOverride: false,
  }));

  const guessed = GLOBAL_SOURCES.filter((s) => !s.rss || s.rss.length === 0).map((s) => ({
    id: s.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: s.name,
    url: guessFeedUrl(s.url),
    category: s.category,
    region: s.region,
    institution: s.institution,
    isOverride: false,
  }));

  const merged = [...overrides, ...explicitRss, ...guessed];
  const unique = Array.from(new Map(merged.map((m) => [m.url, m])).values());
  return unique;
}

function toIsoDate(pub: string, isoMaybe: any): string {
  // Prefer feed-provided isoDate when it parses; otherwise derive from pubDate; else now().
  const isoCandidate = safeString(isoMaybe);
  const d1 = isoCandidate ? new Date(isoCandidate) : null;
  if (d1 && !Number.isNaN(d1.getTime())) return d1.toISOString();

  const d2 = pub ? new Date(pub) : null;
  if (d2 && !Number.isNaN(d2.getTime())) return d2.toISOString();

  return new Date().toISOString();
}

export async function aggregateFeeds(): Promise<FeedItem[]> {
  const allSources = getAllSources();
  const allItems: FeedItem[] = [];

  console.log(`[RSS] Fetching from ${allSources.length} sources...`);

  const promises = allSources.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      if (!feed.items || feed.items.length === 0) return [];

      return feed.items.slice(0, 5).map((item: any) => {
        const rawId = item.guid || item.link || Math.random().toString(36).substring(7);
        const rawTitle = item.title || 'Untitled';
        const rawLink = item.link || '';
        const rawDate = item.pubDate || new Date().toISOString();
        const rawSnippet = item.contentSnippet || item.content || item.summary || '';

        const pubDate = safeString(rawDate);
        const isoDate = toIsoDate(pubDate, item.isoDate);

        return {
          id: safeString(rawId),
          title: safeString(rawTitle),
          link: safeString(rawLink),
          pubDate,
          contentSnippet: safeString(rawSnippet).slice(0, 220) + (safeString(rawSnippet).length > 220 ? '…' : ''),
          source: source.name,
          isoDate,
          category: source.category,
          region: source.region,
          institution: source.institution,
        } satisfies FeedItem;
      });
    } catch {
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  results.forEach((result) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) allItems.push(...result.value);
  });

  allItems.sort((a, b) => {
    const dateA = new Date(a.isoDate).getTime();
    const dateB = new Date(b.isoDate).getTime();
    if (Number.isNaN(dateB)) return 0;
    if (Number.isNaN(dateA)) return 0;
    return dateB - dateA;
  });

  const seenLinks = new Set<string>();
  const uniqueItems: FeedItem[] = [];
  for (const item of allItems) {
    if (!item.link) continue;
    if (seenLinks.has(item.link)) continue;
    seenLinks.add(item.link);
    uniqueItems.push(item);
  }

  return JSON.parse(JSON.stringify(uniqueItems));
}
