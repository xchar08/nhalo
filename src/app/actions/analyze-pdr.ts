// ============================================================================
// FILE: src/app/actions/analyze-pdr.ts
// ============================================================================
'use server';

import { ResearchAgent } from '@/lib/agents/research-agent';
import { Claim } from '@/types/research';
import { aggregateFeeds } from '@/lib/feed/rss-aggregator';
import { searchWeb, deepCrawl } from '@/lib/crawlers/free-crawler'; 
import { fastSummarize, answerWithContext } from '@/lib/ai/fast-summarizer';

// Store session context in memory (for this demo)
let SESSION_CONTEXT: string = ""; 
// Cache for Feed to avoid re-fetching on every chat message
let FEED_CACHE: any[] = [];

/**
 * Helper: Concurrency Limiter
 * Ensures we don't hit 429 Rate Limits by running only N promises at once.
 */
async function mapAsync<T, U>(array: T[], limit: number, fn: (item: T) => Promise<U>): Promise<U[]> {
    const results: Promise<U>[] = [];
    const executing: Promise<void>[] = [];
    for (const item of array) {
        const p = Promise.resolve().then(() => fn(item));
        results.push(p);
        const e: Promise<void> = p.then(() => { executing.splice(executing.indexOf(e), 1); });
        executing.push(e);
        if (executing.length >= limit) await Promise.race(executing);
    }
    return Promise.all(results);
}

function generateSubQueries(originalQuery: string): string[] {
    return [
        originalQuery,
        `${originalQuery} github technical implementation`,
        `${originalQuery} reviews and comparisons`,
        `${originalQuery} documentation tutorial`
    ];
}

async function discoverRelevantTech(claimText: string): Promise<string> {
    const keywords = claimText
        .replace(/\b(the|a|an|is|are|was|were|will|be|to|for|of|in|on|at|by|with)\b/gi, '')
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .slice(0, 6) 
        .join(' ');
    const query = `latest research tools github state of the art for ${keywords} ${new Date().getFullYear()}`;
    try {
        const results = await searchWeb(query);
        if (!results || results.length === 0) return "";
        const findings = results.slice(0, 2).map(r => 
            `- 🔹 **[${r.title}](${r.url})**: ${r.snippet}`
        ).join('\n');
        return `\n\n### 🚀 Recommended Tech Stack\n${findings}`;
    } catch (e) { return ""; }
}

export async function analyzePdrAction(pdrText: string, deepMode: boolean = false, breadth: number = 3) {
  if (!pdrText.trim()) return { success: false, error: "Empty text" };

  console.log(`[Analyze] Starting Deep Analysis. DeepMode: ${deepMode}, Breadth: ${breadth}`);
  SESSION_CONTEXT = ""; 

  // 1. Segmentation
  const rawSentences = pdrText
    .split(/(?<=[.?!])\s+|\n+/) 
    .map(s => s.trim())
    .filter(s => s.length > 25 && !s.startsWith('//')); 

  const claims: Claim[] = rawSentences.map((text, i) => ({
    id: `claim-${Date.now()}-${i}`,
    projectId: 'demo-project',
    text,
    domain: 'research', 
    type: 'empirical',
    verdict: 'unknown',
    confidence: 0,
    tags: [],
    linkedDocumentIds: [],
    evidence: [],
    biasStatus: 'balanced'
  }));

  if (claims.length === 0) return { success: false, error: "No valid claims found." };

  const results: Claim[] = [];
  let fullReportMarkdown = `# Research Report\n**Query:** ${pdrText.slice(0, 150)}...\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n`;
  const allSources: any[] = [];
  
  let fullResearchContext = `Original Request: ${pdrText}\n\n`;

  for (const claim of claims) {
      try {
        // A. Expand Query & Search
        const queries = deepMode ? generateSubQueries(claim.text) : [claim.text];
        
        const searchPromises = queries.map(q => searchWeb(q));
        const searchResultsNested = await Promise.all(searchPromises);
        const searchResults = searchResultsNested.flat();
        
        // Deduplicate
        const uniqueUrls = [...new Set(searchResults.map(r => r.url))].slice(0, deepMode ? 4 : 2);
        
        // B. Deep Crawl & Summarize
        const crawlPromises = uniqueUrls.map(url => deepCrawl(url, 0));
        const crawlResults = (await Promise.all(crawlPromises)).flat();
        
        // THROTTLED SUMMARIZATION (Max 3 concurrent requests to prevent 429)
        const summaries = await mapAsync(crawlResults, 3, async (p) => {
             await new Promise(r => setTimeout(r, 100)); // Slight delay
             return fastSummarize(p.markdown, claim.text);
        });
        
        const richContext = summaries.join("\n\n");
        fullResearchContext += `\n\n### Claim: ${claim.text}\n${richContext}`;

        // C. Run Agent
        const agentResult = await new ResearchAgent(claim, { deepSearch: deepMode, breadth }).run();
        const techDiscovery = await discoverRelevantTech(claim.text);

        const { claim: resultClaim, report } = agentResult;
        
        results.push(resultClaim);
        
        const deepInsightSection = deepMode && summaries.length > 0 
            ? `\n\n**🧠 Deep Research Insights:**\n${summaries.slice(0, 3).join('\n')}` 
            : "";

        fullReportMarkdown += `\n${report}${deepInsightSection}${techDiscovery}\n\n---\n`;
        
        if (resultClaim.evidence) {
            allSources.push(...resultClaim.evidence.map(e => ({
                url: e.url, title: e.title || e.url, snippet: e.snippet, score: e.confidenceScore
            })));
        }
      } catch (e) {
        console.error("Agent failed for claim:", claim.id, e);
        results.push(claim);
      }
  }

  SESSION_CONTEXT = fullResearchContext;
  
  const uniqueSources = Array.from(new Map(allSources.map(s => [s.url, s])).values());

  return {
    success: true,
    claims: results,
    unifiedReport: fullReportMarkdown,
    sources: uniqueSources,
    stats: { totalClaims: claims.length, processed: results.length }
  };
}

export async function askResearchContextAction(question: string) {
    if (!SESSION_CONTEXT) return { success: false, answer: "No research context available." };
    const answer = await answerWithContext(question, SESSION_CONTEXT);
    return { success: true, answer };
}

/**
 * Ask questions specifically about the Knowledge Feed (NEW)
 */
export async function askFeedContextAction(question: string) {
    try {
        // Use cached feed if available to save time, otherwise fetch
        let feed = FEED_CACHE;
        if (feed.length === 0) {
             const res = await getKnowledgeFeed();
             feed = res.feed || [];
        }

        // Build Context from Feed Items (Top 20)
        const feedContext = feed.slice(0, 20).map((item: any) => 
            `Title: ${item.title}\nSource: ${item.source}\nSnippet: ${item.contentSnippet}\nLink: ${item.link}\n---`
        ).join('\n');

        const answer = await answerWithContext(question, `RECENT AI NEWS FEED:\n${feedContext}`);
        
        return { success: true, answer };
    } catch (e) {
        console.error("Feed Chat Failed:", e);
        return { success: false, answer: "Failed to analyze feed." };
    }
}

/**
 * Fetches a live feed of knowledge.
 * SANITIZED for Client Component consumption to fix serialization errors.
 */
export async function getKnowledgeFeed() {
    try {
        console.log("[Feed] Aggregating RSS feeds...");
        const rawFeedItems = await aggregateFeeds();
        
        // 1. Explicitly Map to Plain Strings
        const feedItems = rawFeedItems.map(item => ({
            id: String(item.id), 
            title: String(item.title || "Untitled"),
            link: String(item.link || "#"),
            contentSnippet: String(item.contentSnippet || ""),
            source: String(item.source || "Unknown"),
            isoDate: String(item.isoDate || new Date().toISOString()),
            category: String(item.category || "general"),
            region: String(item.region || "GLOBAL"),
            institution: item.institution ? String(item.institution) : undefined
        }));
        
        // 2. Nuclear Option: Serialization Round-Trip
        // This strips any hidden non-serializable getters/setters from the RSS parser objects
        const plainFeed = JSON.parse(JSON.stringify(feedItems));
        
        // Update Cache for Chat Context
        FEED_CACHE = plainFeed;

        return { 
            success: true, 
            feed: plainFeed, 
            timestamp: new Date().toISOString() 
        };
    } catch (e) {
        console.error("Feed aggregation failed:", e);
        return { success: false, feed: [], error: "Failed to load feed" };
    }
}
