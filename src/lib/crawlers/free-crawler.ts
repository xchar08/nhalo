// ============================================================================
// FILE: src/lib/crawlers/free-crawler.ts
// ============================================================================
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Environment variables should be loaded automatically in Next.js
const SERPER_KEY = process.env.SERPER_API_KEY;

/**
 * PRODUCTION METHOD 1: Serper.dev (Google Search API)
 * Best for production. Requires API key in .env.local
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
 * PRODUCTION METHOD 2: DuckDuckGo JSON API (No HTML Scraping)
 * Much more stable than HTML scraping.
 * Endpoint: https://api.duckduckgo.com/ (Instant Answer) or unofficial JSON endpoints
 */
async function searchDuckDuckGoJSON(query: string): Promise<SearchResult[]> {
    console.log(`[Crawler] Using DDG Lite for: "${query}"`);
    try {
        // We use the 'lite' version which is meant for low-bandwidth and easier to parse
        // It is less likely to block than the main JS-heavy site.
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

        // DDG Lite structure is table-based and very stable
        $('.result-link').each((i, elem) => {
            const anchor = $(elem);
            const title = anchor.text().trim();
            const rawUrl = anchor.attr('href');
            
            // The snippet is usually in the next row's .result-snippet class
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
 * Prioritizes API keys, then falls back to robust scraping.
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  // 1. Try Serper API (Official)
  if (SERPER_KEY) {
      const results = await searchSerper(query);
      if (results.length > 0) return results;
  }

  // 2. Fallback to DDG Lite (Robust Scraping)
  const ddgResults = await searchDuckDuckGoJSON(query);
  if (ddgResults.length > 0) return ddgResults;

  // 3. If all else fails, return error object (No Mock Data)
  return [{
      title: "SEARCH FAILED",
      url: "#error",
      snippet: `Could not retrieve results for "${query}". Please check your internet connection or configure a SERPER_API_KEY in .env.local for reliable production usage.`
  }];
}

export async function crawlUrl(url: string) {
  // ... (Keep existing robust crawlUrl logic) ...
  console.log(`[Crawler] Crawling: ${url}`);
  if (url.startsWith('#error')) return { markdown: "" };

  try {
    const res = await fetch(url, { 
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' 
        },
        signal: AbortSignal.timeout(8000), // 8s timeout per crawl
        next: { revalidate: 3600 }
    });
    
    if (!res.ok) return { markdown: "" };
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    $('script, style, nav, footer, iframe, svg, noscript, header, aside, .ads, .advertisement').remove();
    
    let text = "";
    // Prefer article content
    const article = $('article, [role="main"], .main-content, #main-content, .post-content');
    if (article.length > 0) {
        text = article.text();
    } else {
        $('p, h1, h2, h3, h4, li').each((_, el) => {
            text += $(el).text().trim() + " ";
        });
    }

    text = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
    return { markdown: text };
  } catch (e) {
    console.error(`[Crawler] Crawl failed for ${url}:`, e);
    return { markdown: "" };
  }
}

export async function recursiveBranchCrawl(url: string, query: string, depth: number, limit: number) { return []; }
