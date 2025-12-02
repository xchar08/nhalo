// ============================================================================
// FILE: src/app/actions/analyze-pdr.ts
// ============================================================================
'use server';

import { ResearchAgent } from '@/lib/agents/research-agent';
import { Claim } from '@/types/research';
import { aggregateFeeds } from '@/lib/feed/rss-aggregator';
import { searchWeb } from '@/lib/crawlers/free-crawler'; 

/**
 * Helper: Discovery Search
 */
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
    } catch (e) {
        return ""; 
    }
}

/**
 * Analyzes a Project Definition Record (PDR) or any text input.
 */
export async function analyzePdrAction(pdrText: string, deepMode: boolean = false, breadth: number = 3) {
  if (!pdrText.trim()) return { success: false, error: "Empty text" };

  console.log(`[Analyze] Starting PDR Analysis. DeepMode: ${deepMode}, Breadth: ${breadth}`);

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

  if (claims.length === 0) {
      return { success: false, error: "No valid claims found in text." };
  }

  // 2. Execution
  const results: Claim[] = [];
  let fullReportMarkdown = `# Research Report\n**Query:** ${pdrText.slice(0, 150)}...\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n`;
  const allSources: any[] = [];

  for (const claim of claims) {
      try {
        const [agentResult, techDiscovery] = await Promise.all([
            new ResearchAgent(claim, { deepSearch: deepMode, breadth }).run(),
            discoverRelevantTech(claim.text)
        ]);

        const { claim: resultClaim, report } = agentResult;
        
        results.push(resultClaim);
        
        fullReportMarkdown += `\n${report}${techDiscovery}\n\n---\n`;
        
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
        results.push(claim);
      }
  }
  
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
 * Fetches a live feed of knowledge.
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
