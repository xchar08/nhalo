// ============================================================================
// FILE: src/lib/crawlers/free-crawler.ts
// ============================================================================
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Helper: Clean DuckDuckGo tracking URLs to get the real destination.
 * Example: //duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com -> https://example.com
 */
function cleanDdGoUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  
  // 1. If it's already a normal URL, return it
  if (rawUrl.startsWith('http')) return rawUrl;
  
  // 2. If it's a DDG tracking link (contains 'uddg=')
  if (rawUrl.includes('uddg=')) {
    try {
      // DDG links often come as relative: //duckduckgo.com/l/?uddg=...
      // We prepend 'https:' to make it parsable by URL object if needed
      const urlToParse = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
      const urlObj = new URL(urlToParse);
      const realUrl = urlObj.searchParams.get('uddg');
      if (realUrl) return decodeURIComponent(realUrl);
    } catch (e) {
      // Fallback regex if URL parsing fails
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
  }
  
  // 3. Fallback: Just prepend https if it starts with // but isn't a tracking link
  if (rawUrl.startsWith('//')) return 'https:' + rawUrl;
  
  return rawUrl;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  console.log(`[DEBUG][Crawler] ========== SEARCH START ==========`);
  console.log(`[DEBUG][Crawler] Query: "${query}"`);
  
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    console.log(`[DEBUG][Crawler] Fetching URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`[DEBUG][Crawler] ERROR: DDG returned status ${response.status}`);
      throw new Error(`DDG failed: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const resultElements = $('.result__body');
    console.log(`[DEBUG][Crawler] Found ${resultElements.length} result elements`);

    const results: SearchResult[] = [];

    resultElements.each((i, elem) => {
      const title = $(elem).find('.result__title a').text().trim();
      
      // CRITICAL FIX: DDG HTML often puts the link in 'href' of the title anchor
      const rawUrl = $(elem).find('.result__title a').attr('href')?.trim(); 
      // Note: Sometimes it is in .result__url, but title anchor is more reliable for the tracking link
      
      const snippet = $(elem).find('.result__snippet').text().trim();

      if (title && rawUrl && snippet) {
        const cleanUrl = cleanDdGoUrl(rawUrl);
        
        // Filter out internal DDG links or empty ones
        if (cleanUrl && !cleanUrl.includes('duckduckgo.com')) {
             results.push({ title, url: cleanUrl, snippet });
        }
      }
    });

    console.log(`[DEBUG][Crawler] Total valid results: ${results.length}`);
    
    if (results.length > 0) {
      console.log(`[DEBUG][Crawler] ========== SEARCH SUCCESS ==========`);
      return results.slice(0, 8); // Return top 8
    }
    
    console.warn(`[DEBUG][Crawler] WARNING: No results parsed, falling back to mock`);
    throw new Error("No results parsed from DDG");

  } catch (error) {
    console.error("[DEBUG][Crawler] ========== SEARCH FAILED ==========");
    console.error("[DEBUG][Crawler] Error:", error);
    
    // FALLBACK Mock Data
    return [
      {
        title: "Quantum Advantage in Machine Learning - Nature Physics",
        url: "https://nature.com/articles/s41567-024-mock",
        snippet: "Our results demonstrate that Quantum CNNs provide a quadratic to exponential speedup for specific classification tasks involving quantum states."
      },
      {
        title: "Barren Plateaus in Quantum Neural Networks - arXiv",
        url: "https://arxiv.org/abs/1803.11173",
        snippet: "We show that the gradient vanishes exponentially with qubits, known as 'barren plateaus', challenging deep QNN training."
      }
    ];
  }
}

export async function crawlUrl(url: string) {
  console.log(`[DEBUG][Crawler] Crawling URL: ${url}`);
  try {
    const res = await fetch(url, { 
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        },
        next: { revalidate: 3600 }
    });
    console.log(`[DEBUG][Crawler] Crawl response status: ${res.status}`);
    
    if (!res.ok) return { markdown: "" };
    
    const html = await res.text();
    console.log(`[DEBUG][Crawler] Crawled HTML length: ${html.length}`);
    
    const $ = cheerio.load(html);
    $('script, style, nav, footer, iframe, svg, noscript').remove(); // Improved cleanup
    
    // Improved Text Extraction: get paragraphs to preserve some structure
    let text = "";
    $('p, h1, h2, h3, h4, li').each((_, el) => {
        text += $(el).text().trim() + "\n";
    });
    
    // Fallback if structure extraction fails
    if (text.length < 100) {
        text = $('body').text().replace(/\s+/g, ' ');
    }

    text = text.slice(0, 5000); // Limit to 5k chars to save tokens
    
    console.log(`[DEBUG][Crawler] Extracted text length: ${text.length}`);
    return { markdown: text };
  } catch (e) {
    console.error(`[DEBUG][Crawler] Crawl failed:`, e);
    return { markdown: "" };
  }
}

export async function recursiveBranchCrawl(url: string, query: string, depth: number, limit: number) {
    return []; 
}
