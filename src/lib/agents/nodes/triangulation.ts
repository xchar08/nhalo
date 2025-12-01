// ============================================================================
// FILE: src/lib/agents/nodes/triangulation.ts
// ============================================================================
import { Claim, EvidenceItem } from '@/types/research';

/**
 * State machine node: 'triangulate_bias'
 * Checks for political/medical bias and ensures balanced sourcing.
 * Implements C.4 Bias Triangulation.
 */

interface TriangulationState {
  claim: Claim;
  evidence: EvidenceItem[];
  biasStatus: 'balanced' | 'one_sided' | 'contentious';
}

export async function triangulateBias(state: TriangulationState): Promise<Partial<TriangulationState>> {
  const { claim, evidence } = state;

  // Only triangulate for sensitive domains
  if (claim.domain !== 'political' && claim.domain !== 'medical') {
    return { biasStatus: 'balanced' }; // Default safe
  }

  // 1. Analyze Source Distribution
  // We assume the evidence items have the URL. In a real app, we'd join with the Document table
  // to get the pre-computed 'biasRating' field.
  
  let leftCount = 0;
  let rightCount = 0;
  let neutralCount = 0;

  // Mock bias lookup based on URL keywords
  for (const item of evidence) {
    const url = item.url.toLowerCase();
    if (url.includes('cnn') || url.includes('msnbc') || url.includes('guardian')) leftCount++;
    else if (url.includes('fox') || url.includes('breitbart') || url.includes('dailywire')) rightCount++;
    else neutralCount++;
  }

  const total = leftCount + rightCount + neutralCount;
  if (total === 0) return { biasStatus: 'contentious' }; // No data = risky

  // 2. Determine Status
  // If > 70% of sources are from one side (excluding neutral), it's one-sided.
  const partisanTotal = leftCount + rightCount;
  let status: 'balanced' | 'one_sided' | 'contentious' = 'balanced';

  if (partisanTotal > 0) {
    const leftRatio = leftCount / partisanTotal;
    if (leftRatio > 0.8 || leftRatio < 0.2) {
      status = 'one_sided';
    } else if (Math.abs(leftRatio - 0.5) < 0.2) {
      // Nearly 50/50 split often means "contentious" topic
      status = 'contentious';
    }
  }

  // 3. (Optional) If one_sided, the agent workflow would trigger a new 'retrieve' loop 
  // specifically targeting the missing perspective. 
  // For this file, we just report the status.

  console.log(`[Triangulation] Claim: "${claim.text.slice(0, 20)}..." Status: ${status} (L:${leftCount} R:${rightCount})`);

  return {
    biasStatus: status
  };
}
