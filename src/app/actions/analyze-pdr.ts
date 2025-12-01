// ============================================================================
// FILE: src/app/actions/analyze-pdr.ts
// ============================================================================
'use server';

import { ResearchAgent } from '@/lib/agents/research-agent';
import { Claim } from '@/types/research';
import { aggregateFeeds } from '@/lib/feed/rss-aggregator';

/**
 * Analyzes a Project Definition Record (PDR) or any text input.
 * It segments the text into claims, runs research agents in parallel,
 * and compiles a unified report.
 * 
 * @param pdrText - The raw text input to analyze
 * @param deepMode - Whether to enable recursive crawling (slower but deeper)
 * @param breadth - How many search results to process per query
 */
export async function analyzePdrAction(pdrText: string, deepMode: boolean = false, breadth: number = 3) {
  if (!pdrText.trim()) return { success: false, error: "Empty text" };

  console.log(`[Analyze] Starting PDR Analysis. DeepMode: ${deepMode}, Breadth: ${breadth}`);

  // 1. Segmentation: Split text into actionable claims
  // Splitting by newlines or sentence endings, filtering out short/comment lines
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

  if (claims.length === 0) {
      return { success: false, error: "No valid claims found in text." };
  }

  // 2. Execution: Run agents for each claim
  const results: Claim[] = [];
  let fullReportMarkdown = `# Research Report\n**Query:** ${pdrText}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n`;
  const allSources: any[] = [];

  // We process claims sequentially or in small batches to avoid overwhelming the crawler/search tool
  // For simplicity in this "free" version, we do them sequentially to stay under rate limits easily
  for (const claim of claims) {
      try {
        const agent = new ResearchAgent(claim, { deepSearch: deepMode, breadth });
        const { claim: resultClaim, report } = await agent.run();
        
        results.push(resultClaim);
        
        // Append to the unified markdown report
        fullReportMarkdown += `\n${report}\n\n---\n`;
        
        // Collect sources for the "Source Registry" view
        if (resultClaim.evidence) {
            allSources.push(...resultClaim.evidence.map(e => ({
                url: e.url,
                title: e.title || e.url,
                snippet: e.snippet,
                score: e.confidenceScore
            })));
        }
      } catch (e) {
        console.error("Agent failed for claim:", claim.id, e);
        results.push(claim); // Push original claim if failed
      }
  }
  
  // Deduplicate sources based on URL
  const uniqueSources = Array.from(
      new Map(allSources.map(s => [s.url, s])).values()
  );

  return {
    success: true,
    claims: results,
    unifiedReport: fullReportMarkdown,
    sources: uniqueSources,
    stats: {
      totalClaims: claims.length,
      processed: results.length
    }
  };
}

/**
 * Fetches a live feed of knowledge from configured RSS sources.
 * Uses the server-side RSS aggregator to pull real-time data.
 */
export async function getKnowledgeFeed() {
    try {
        console.log("[Feed] Aggregating RSS feeds...");
        const feedItems = await aggregateFeeds();
        
        return { 
            success: true, 
            feed: feedItems,
            timestamp: new Date().toISOString()
        };
    } catch (e) {
        console.error("Feed aggregation failed:", e);
        return { success: false, feed: [], error: "Failed to load feed" };
    }
}
