// ============================================================================
// FILE: src/lib/crawlers/free-crawler.ts
// ============================================================================
import * as cheerio from 'cheerio';

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
}

const SERPER_KEY = process.env.SERPER_API_KEY;
const MAX_DEPTH = 1; // Limit depth to 1 for speed
const MAX_PAGES_PER_QUERY = 5; // Safety limit

/**
 * PRODUCTION METHOD 1: Serper.dev (Google Search API)
 */
async function searchSerper(query: string): Promise<SearchResult[]> {
    if (!SERPER_KEY) return [];
    
    console.log(`[Crawler] Using Serper.dev for: "${query}"`);
    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 6 })
        });
        
        if (!response.ok) throw new Error(`Serper API error: ${response.status}`);
        
        const data = await response.json();
        if (!data.organic) return [];
        
        return data.organic.map((item: any) => ({
            title: item.title,
            url: item.link,
            snippet: item.snippet || ""
        }));
    } catch (e) {
        console.error("[Crawler] Serper failed:", e);
        return [];
    }
}

/**
 * PRODUCTION METHOD 2: DuckDuckGo JSON API
 */
async function searchDuckDuckGoJSON(query: string): Promise<SearchResult[]> {
    console.log(`[Crawler] Using DDG Lite for: "${query}"`);
    try {
        const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml'
             },
             next: { revalidate: 60 }
        });

        if (!response.ok) throw new Error(`DDG Lite status: ${response.status}`);
        
        const html = await response.text();
        const $ = cheerio.load(html);
        const results: SearchResult[] = [];

        $('.result-link').each((i, elem) => {
            const anchor = $(elem);
            const title = anchor.text().trim();
            const rawUrl = anchor.attr('href');
            const snippet = anchor.closest('tr').next().find('.result-snippet').text().trim();

            if (title && rawUrl) {
                 if (!rawUrl.includes('duckduckgo.com') && !rawUrl.includes('ad_provider')) {
                     results.push({ title, url: rawUrl, snippet });
                 }
            }
        });

        return results.slice(0, 6);
    } catch (e) {
        console.error("[Crawler] DDG Lite failed:", e);
        return [];
    }
}

/**
 * Main Search Function
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  if (SERPER_KEY) {
      const results = await searchSerper(query);
      if (results.length > 0) return results;
  }
  const ddgResults = await searchDuckDuckGoJSON(query);
  if (ddgResults.length > 0) return ddgResults;

  return [{
      title: "SEARCH FAILED",
      url: "#error",
      snippet: `Could not retrieve results for "${query}". Please check connection.`
  }];
}

/**
 * Helper: Extract links from a page
 */
function extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            try {
                const absoluteUrl = new URL(href, baseUrl).toString();
                
                // FILTER GARBAGE URLs
                if (
                    !absoluteUrl.includes('twitter.com') && 
                    !absoluteUrl.includes('facebook.com') &&
                    !absoluteUrl.includes('linkedin.com') &&
                    !absoluteUrl.includes('sitemap') && // No Sitemaps
                    !absoluteUrl.endsWith('.xml') &&
                    !absoluteUrl.endsWith('.pdf') &&
                    !absoluteUrl.endsWith('.zip')
                ) {
                    links.push(absoluteUrl);
                }
            } catch (e) {}
        }
    });
    return [...new Set(links)].slice(0, 3); // Limit to 3 child links
}

/**
 * POWER CRAWLER: Deep Recursive Crawling
 */
export async function deepCrawl(url: string, currentDepth: number = 0, visited: Set<string> = new Set()): Promise<CrawlResult[]> {
  if (currentDepth > MAX_DEPTH || visited.has(url) || visited.size > MAX_PAGES_PER_QUERY) return [];
  
  // Early exit for bad URLs
  if (url.startsWith('#error') || url.includes('sitemap') || url.endsWith('.xml')) return [];

  visited.add(url);
  console.log(`[DeepCrawl] Depth ${currentDepth}: ${url}`);

  try {
    const res = await fetch(url, { 
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
        next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    // Check content type (don't parse binary/PDF)
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Cleanup
    $('script, style, nav, footer, iframe, svg, noscript, header, aside, .ads, .advertisement').remove();
    
    let text = "";
    const article = $('article, [role="main"], .main-content, #main-content, .post-content');
    if (article.length > 0) {
        text = article.text();
    } else {
        $('p, h1, h2, h3, h4, li').each((_, el) => {
             text += $(el).text().trim() + " ";
        });
    }
    text = text.replace(/\s+/g, ' ').trim().slice(0, 15000); 

    const result: CrawlResult = {
        url,
        title: $('title').text() || url,
        markdown: text,
        depth: currentDepth
    };

    const results = [result];

    // Recursive Step
    if (currentDepth < MAX_DEPTH) {
        const links = extractLinks($, url);
        // Parallel crawl of children
        const childPromises = links.map(link => deepCrawl(link, currentDepth + 1, visited));
        const childResults = await Promise.all(childPromises);
        childResults.forEach(r => results.push(...r));
    }

    return results;
  } catch (e) {
    // Fail silently for crawl errors (don't crash the agent)
    // console.error(`[DeepCrawl] Failed for ${url}:`, e); 
    return [];
  }
}

export async function crawlUrl(url: string) {
    const res = await deepCrawl(url, MAX_DEPTH); 
    return { markdown: res[0]?.markdown || "" };
}

export async function recursiveBranchCrawl(url: string, query: string, depth: number, limit: number) {
    return deepCrawl(url, 0); 
}
