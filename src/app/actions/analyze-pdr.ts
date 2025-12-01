// ============================================================================
// FILE: src/app/actions/analyze-pdr.ts
// ============================================================================
'use server';

import { ResearchAgent } from '@/lib/agents/research-agent'; // Corrected import path
import { Claim } from '@/types/research';

/**
 * Server Action: Entry point for PDR analysis.
 * Decomposes text into claims and parallelizes the agent workflow.
 */

export async function analyzePdrAction(pdrText: string, deepMode: boolean = false) {
  if (!pdrText.trim()) return { success: false, error: "Empty text" };

  console.log(`[Analyze] Starting PDR Analysis. DeepMode: ${deepMode}`);

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

  // 2. Parallel Execution with Batching
  const BATCH_SIZE = 3;
  const results: Claim[] = [];
  
  for (let i = 0; i < claims.length; i += BATCH_SIZE) {
    const batch = claims.slice(i, i + BATCH_SIZE);
    
    // Run agents in parallel for this batch
    const batchPromises = batch.map(async (claim) => {
      try {
        // Pass deepMode to the agent constructor
        const agent = new ResearchAgent(claim, { deepSearch: deepMode });
        return await agent.run();
      } catch (e) {
        console.error("Agent failed for claim:", claim.id, e);
        return claim; 
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return {
    success: true,
    claims: results,
    stats: {
      totalClaims: claims.length,
      processed: results.length
    }
  };
}
