// ============================================================================
// FILE: src/lib/crawlers/free-crawler.ts
// ============================================================================
import * as cheerio from 'cheerio';
import pdfParse from '@cedrugs/pdf-parse';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface CrawlResult {
  url: string;
  title: string;
  markdown: string;
  depth: number;
  contentType?: string;
}

const SERPER_KEY = process.env.SERPER_API_KEY;

const MAX_DEPTH = 1;
const MAX_PAGES_PER_QUERY = 5;

// ---------------------------
// URL helpers
// ---------------------------
function normalizeUrl(u: string) {
  return (u || '').trim();
}

function isBadUrl(url: string) {
  const u = normalizeUrl(url);
  if (!u) return true;
  if (u === '#error') return true;
  if (u.startsWith('#')) return true;
  if (u.startsWith('mailto:')) return true;
  if (!/^https?:\/\//i.test(u)) return true;
  return false;
}

function extLower(url: string) {
  const u = url.toLowerCase();
  const q = u.split('?')[0].split('#')[0];
  const idx = q.lastIndexOf('.');
  return idx >= 0 ? q.slice(idx + 1) : '';
}

function isLikelyBinary(url: string) {
  const ext = extLower(url);
  return ext === 'pdf' || ext === 'docx' || ext === 'pptx';
}

function safeTextSlice(s: string, max = 15000) {
  return (s || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isMediumUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === 'medium.com';
  } catch {
    return false;
  }
}

function isAllowedMediumPath(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'medium.com') return false;

    const p = u.pathname.toLowerCase();
    if (p.startsWith('/m/signin')) return false;
    if (p.startsWith('/membership')) return false;
    if (p.startsWith('/me/')) return false;
    if (p.startsWith('/search')) return false;

    if (p.startsWith('/@')) return true;
    if (p.startsWith('/p/')) return true;

    // Allow publication/article slugs as well (subject to other trap checks)
    if (p.length > 1 && !p.includes('/signin') && !p.includes('/signup') && !p.includes('/login')) return true;

    return false;
  } catch {
    return false;
  }
}

function stripTrackingParams(url: string) {
  try {
    const u = new URL(url);
    u.hash = '';

    const dropPrefixes = ['utm_', 'source', 'feature', 'channel', 'stage'];
    const dropExact = new Set([
      'ref',
      'referrer',
      'redirect',
      'redirect_to',
      'redirect_uri',
      'return_to',
      'callback_action',
      'operation',
      'fbclid',
      'gclid',
      'mc_cid',
      'mc_eid',
    ]);

    for (const key of Array.from(u.searchParams.keys())) {
      const lower = key.toLowerCase();
      if (dropExact.has(lower)) u.searchParams.delete(key);
      else if (dropPrefixes.some((p) => lower.startsWith(p))) u.searchParams.delete(key);
    }

    // Medium: safest to drop query after stripping tracking
    if (u.hostname === 'medium.com') u.search = '';

    return u.toString();
  } catch {
    return url;
  }
}

function isTrapUrl(url: string) {
  const u = url.toLowerCase();

  // global redirector trap
  if (u.startsWith('https://rsci.app.link/')) return true;

  // Medium special-case: allow content, block signin/redirect traps
  if (isMediumUrl(url)) {
    if (!isAllowedMediumPath(url)) return true;
    if (u.includes('source=post_page')) return true;
    return false;
  }

  // generic auth/redirect traps
  if (u.includes('return_to=')) return true;
  if (u.includes('redirect=')) return true;
  if (u.includes('redirect_to=')) return true;
  if (u.includes('callback_action=')) return true;
  if (u.includes('/login')) return true;
  if (u.includes('/signin')) return true;
  if (u.includes('/signup')) return true;

  // open-in-app / tracking spam
  if (u.includes('openinapp') || u.includes('source=post_page')) return true;

  return false;
}

function isSameOrigin(a: URL, b: URL) {
  return a.hostname.toLowerCase() === b.hostname.toLowerCase();
}

function looksLikeContentPath(host: string, path: string) {
  const p = (path || '').toLowerCase();

  if (p === '/' || p === '') return false;

  const badPrefixes = [
    '/search',
    '/tag',
    '/tags',
    '/topic',
    '/topics',
    '/category',
    '/categories',
    '/archive',
    '/archives',
    '/author',
    '/authors',
    '/user',
    '/users',
    '/profile',
    '/profiles',
    '/account',
    '/settings',
    '/help',
    '/support',
    '/contact',
    '/about',
    '/privacy',
    '/terms',
    '/login',
    '/logout',
    '/signin',
    '/signup',
    '/register',
    '/feed',
    '/rss',
  ];
  if (badPrefixes.some((x) => p.startsWith(x))) return false;

  // Reddit: only allow post pages; block subreddit index, user pages, etc.
  if (host === 'www.reddit.com' || host === 'reddit.com' || host.endsWith('.reddit.com')) {
    if (!/^\/r\/[^/]+\/comments\/[^/]+\/[^/]+\/?$/i.test(path)) return false;
  }

  // Medium: allowed path is handled elsewhere; do not overfilter here
  return true;
}

// ---------------------------
// Console muting helper
// ---------------------------
async function withMutedConsole<T>(
  fn: () => Promise<T>,
  opts?: { muteWarnIncludes?: string[]; muteLogIncludes?: string[] }
): Promise<T> {
  const muteWarnIncludes = opts?.muteWarnIncludes ?? [];
  const muteLogIncludes = opts?.muteLogIncludes ?? [];

  const originalWarn = console.warn;
  const originalLog = console.log;

  console.warn = (...args: any[]) => {
    const msg = String(args?.[0] ?? '');
    if (muteWarnIncludes.some((s) => msg.includes(s))) return;
    originalWarn(...args);
  };

  console.log = (...args: any[]) => {
    const msg = String(args?.[0] ?? '');
    if (muteLogIncludes.some((s) => msg.includes(s))) return;
    originalLog(...args);
  };

  try {
    return await fn();
  } finally {
    console.warn = originalWarn;
    console.log = originalLog;
  }
}

// ---------------------------
// Search providers
// ---------------------------
async function searchSerper(query: string): Promise<SearchResult[]> {
  if (!SERPER_KEY) return [];

  console.log(`[Crawler] Using Serper.dev for: "${query}"`);
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 6 }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Serper API error: ${response.status}`);

    const data = await response.json();
    if (!data?.organic) return [];

    return data.organic
      .map((item: any) => ({
        title: String(item.title || ''),
        url: stripTrackingParams(String(item.link || '')),
        snippet: String(item.snippet || ''),
      }))
      .filter((r: SearchResult) => !isBadUrl(r.url) && !isTrapUrl(r.url));
  } catch (e: any) {
    // Graceful handling for Network/DNS errors
    if (e.cause?.code === 'ENOTFOUND') {
      console.warn(`[Crawler] Network error: Cannot reach Google Serper. Check internet connection.`);
      return [];
    }
    console.error('[Crawler] Serper failed:', e);
    return [];
  }
}

async function searchDuckDuckGoLite(query: string): Promise<SearchResult[]> {
  console.log(`[Crawler] Using DDG Lite for: "${query}"`);
  try {
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`DDG Lite status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.result-link').each((_, elem) => {
      const anchor = $(elem);
      const title = anchor.text().trim();
      const rawUrl = stripTrackingParams(anchor.attr('href')?.trim() || '');
      const snippet = anchor.closest('tr').next().find('.result-snippet').text().trim();

      if (!title || !rawUrl) return;
      if (rawUrl.includes('duckduckgo.com') || rawUrl.includes('ad_provider')) return;
      if (isBadUrl(rawUrl) || isTrapUrl(rawUrl)) return;

      results.push({ title, url: rawUrl, snippet });
    });

    return results.slice(0, 6);
  } catch (e: any) {
    // Graceful handling for Network/DNS errors
    if (e.cause?.code === 'ENOTFOUND') {
      console.warn(`[Crawler] Network error: Cannot reach DuckDuckGo. Check internet connection.`);
      return [];
    }
    console.error('[Crawler] DDG Lite failed:', e);
    return [];
  }
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  if (SERPER_KEY) {
    const results = await searchSerper(query);
    if (results.length > 0) return results;
  }
  return searchDuckDuckGoLite(query);
}

// ---------------------------
// Fetch helpers
// ---------------------------
async function fetchArrayBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);

    const contentType = res.headers.get('content-type') || '';
    const ab = await res.arrayBuffer();
    return { buffer: Buffer.from(ab), contentType };
  } catch (e: any) {
    if (e.cause?.code === 'ENOTFOUND') {
        // Silent fail for deep crawl items is usually better than spamming logs
        // console.warn(`[Crawler] Failed to reach ${url} (DNS/Network)`);
    }
    throw e;
  }
}

async function fetchHtml(url: string): Promise<{ html: string; title: string; contentType: string }> {
  try {
    const res = await fetch(url, {
        headers: {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
    });

    if (!res.ok) throw new Error(`HTML fetch failed ${res.status}`);

    const contentType = res.headers.get('content-type') || '';
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text() || url;
    return { html, title, contentType };
  } catch (e: any) {
    if (e.cause?.code === 'ENOTFOUND') {
        // console.warn(`[Crawler] Failed to reach ${url} (DNS/Network)`);
    }
    throw e;
  }
}

// ---------------------------
// Extractors
// ---------------------------
async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await withMutedConsole(
    async () => (pdfParse(buffer) as any),
    { muteWarnIncludes: ['TT: undefined function'], muteLogIncludes: ['TT: undefined function'] }
  );

  const text = safeTextSlice(String(data?.text || ''));
  if (text.length < 80) return '';
  return text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = safeTextSlice(result.value || '');
  if (text.length < 40) return '';
  return text;
}

async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      return na - nb;
    });

  if (slideFiles.length === 0) return '';

  const parser = new XMLParser({
    ignoreAttributes: true,
    removeNSPrefix: true,
    parseTagValue: true,
    trimValues: true,
  });

  const texts: string[] = [];

  const walk = (node: any) => {
    if (node == null) return;
    if (typeof node === 'string') return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (typeof node === 'object') {
      if (typeof node.t === 'string') {
        const s = node.t.trim();
        if (s) texts.push(s);
      }
      for (const k of Object.keys(node)) walk(node[k]);
    }
  };

  for (const slideName of slideFiles) {
    const xml = await zip.file(slideName)!.async('text');
    const obj = parser.parse(xml);
    walk(obj);
    texts.push('\n');
  }

  const text = safeTextSlice(texts.join(' ').replace(/\s+\n\s+/g, '\n'));
  if (text.length < 40) return '';
  return text;
}

// ---------------------------
// HTML helpers
// ---------------------------
function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, iframe, svg, noscript, header, aside, .ads, .advertisement').remove();

  let text = '';
  const article = $('article, [role="main"], .main-content, #main-content, .post-content');

  if (article.length > 0) {
    text = article.text();
  } else {
    $('p, h1, h2, h3, h4, li').each((_, el) => {
      text += $(el).text().trim() + ' ';
    });
  }

  return safeTextSlice(text);
}

function extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links: string[] = [];
  let base: URL;

  try {
    base = new URL(baseUrl);
  } catch {
    return [];
  }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;

    try {
      const abs = new URL(href, base);
      abs.hash = '';

      const absoluteUrl = stripTrackingParams(abs.toString());
      if (isBadUrl(absoluteUrl) || isTrapUrl(absoluteUrl)) return;

      const u = new URL(absoluteUrl);
      const host = u.hostname.toLowerCase();

      // Block obvious social/utility domains
      if (
        host.includes('twitter.com') ||
        host.includes('x.com') ||
        host.includes('facebook.com') ||
        host.includes('linkedin.com') ||
        host.includes('instagram.com')
      ) {
        return;
      }

      // Don’t recurse off-site; huge junk reduction
      if (!isSameOrigin(u, base)) return;

      // Skip sitemaps/xml
      if (absoluteUrl.includes('sitemap') || absoluteUrl.toLowerCase().endsWith('.xml')) return;

      // Skip non-content paths
      if (!looksLikeContentPath(host, u.pathname)) return;

      links.push(absoluteUrl);
    } catch {
      // ignore malformed URLs
    }
  });

  return [...new Set(links)].slice(0, 3);
}

// ---------------------------
// Public crawl API
// ---------------------------
export async function deepCrawl(
  url: string,
  currentDepth: number = 0,
  maxDepth: number = MAX_DEPTH,
  maxPages: number = MAX_PAGES_PER_QUERY,
  visited: Set<string> = new Set()
): Promise<CrawlResult[]> {
  url = stripTrackingParams(normalizeUrl(url));

  if (currentDepth > maxDepth) return [];
  // Use a shared visited set to track global limit across recursion?
  // Actually, 'visited' is passed by reference, so checking size works for global limit if we share the set.
  if (visited.has(url)) return [];
  if (visited.size >= maxPages) return [];

  if (isBadUrl(url) || isTrapUrl(url)) return [];
  if (url.includes('sitemap') || url.endsWith('.xml')) return [];

  visited.add(url);
  console.log(`[DeepCrawl] Depth ${currentDepth}/${maxDepth} (Limit ${maxPages}): ${url}`);

  // Binary first
  if (isLikelyBinary(url)) {
    try {
      const { buffer, contentType } = await fetchArrayBuffer(url);
      const ext = extLower(url);

      if (contentType.includes('application/pdf') || ext === 'pdf') {
        const text = await extractPdfText(buffer);
        if (!text) return [];
        return [{ url, title: url, markdown: text, depth: currentDepth, contentType }];
      }

      if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || ext === 'docx') {
        const text = await extractDocxText(buffer);
        if (!text) return [];
        return [{ url, title: url, markdown: text, depth: currentDepth, contentType }];
      }

      if (contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') || ext === 'pptx') {
        const text = await extractPptxText(buffer);
        if (!text) return [];
        return [{ url, title: url, markdown: text, depth: currentDepth, contentType }];
      }

      return [];
    } catch {
      return [];
    }
  }

  // HTML route (with PDF fallback)
  try {
    const { html, title, contentType } = await fetchHtml(url);

    // Some endpoints say HTML but deliver PDF bytes
    if (contentType.includes('application/pdf')) {
      try {
        const { buffer } = await fetchArrayBuffer(url);
        const text = await extractPdfText(buffer);
        if (!text) return [];
        return [{ url, title, markdown: text, depth: currentDepth, contentType }];
      } catch {
        return [];
      }
    }

    if (!contentType.includes('text/html')) return [];

    const text = htmlToText(html);
    const result: CrawlResult = { url, title, markdown: text, depth: currentDepth, contentType };
    const results: CrawlResult[] = [result];

    if (currentDepth < maxDepth) {
      const $ = cheerio.load(html);
      const links = extractLinks($, url);
      // We pass the SAME visited set to enforce global page limit
      const childResults = await Promise.all(
        links.map((link) => deepCrawl(link, currentDepth + 1, maxDepth, maxPages, visited))
      );
      childResults.forEach((arr) => results.push(...arr));
    }

    return results;
  } catch {
    return [];
  }
}

export async function crawlUrl(url: string) {
  const res = await deepCrawl(url, 0, MAX_DEPTH, MAX_PAGES_PER_QUERY);
  return { markdown: res[0]?.markdown || '' };
}

export async function recursiveBranchCrawl(url: string, _query: string, depth: number, limit: number) {
  // Respect the depth and limit parameters
  const effectiveDepth = depth > 0 ? depth : 1;
  const effectiveLimit = limit > 0 ? limit : 5;
  return deepCrawl(url, 0, effectiveDepth, effectiveLimit);
}
