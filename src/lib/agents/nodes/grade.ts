// ============================================================================
// FILE: src/lib/agents/nodes/grade.ts
// ============================================================================
import { Claim, EvidenceItem, DocumentSource } from '@/types/research';

interface GradeState {
  claim: Claim;
  sources: DocumentSource[];
  evidence: EvidenceItem[];
  needsRefinement: boolean;
  refinedQueries: string[];
}

export async function gradeEvidence(state: GradeState): Promise<Partial<GradeState>> {
  console.log(`[DEBUG][Grade] ========== GRADE START ==========`);
  console.log(`[DEBUG][Grade] Claim: "${state.claim.text.slice(0, 50)}..."`);
  console.log(`[DEBUG][Grade] Sources to grade: ${state.sources.length}`);
  
  const { claim, sources } = state;
  const scoredEvidence: EvidenceItem[] = [];

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    console.log(`[DEBUG][Grade] --- Grading source ${i}: ${source.url.slice(0, 50)} ---`);
    
    const content = (source.metadata.rawMarkdown as string) || (source.metadata.snippet as string) || "";
    console.log(`[DEBUG][Grade] Content length: ${content.length}`);
    console.log(`[DEBUG][Grade] Content preview: "${content.slice(0, 100)}..."`);
    
    if (content.length < 10) {
      console.log(`[DEBUG][Grade] SKIPPED: Content too short`);
      continue;
    }

    const relevance = calculateRelevance(claim.text, content);
    console.log(`[DEBUG][Grade] Relevance score: ${relevance}`);
    
    const trustScore = source.sourceTrustScore || 0.5;
    console.log(`[DEBUG][Grade] Trust score: ${trustScore}`);
    
    let finalConfidence = (0.6 * relevance) + (0.4 * trustScore);
    if (finalConfidence < 0.25) finalConfidence = 0.25;
    
    console.log(`[DEBUG][Grade] Final confidence: ${finalConfidence}`);

    const evidence: EvidenceItem = {
      documentId: source.id,
      chunkId: crypto.randomUUID(),
      text: content.slice(0, 250),
      url: source.url,
      title: source.title || source.url,
      confidenceScore: parseFloat(finalConfidence.toFixed(2)),
      supportStatus: relevance > 0.5 ? 'pro' : 'neutral'
    };
    
    scoredEvidence.push(evidence);
    console.log(`[DEBUG][Grade] Added evidence with confidence ${evidence.confidenceScore}`);
  }

  scoredEvidence.sort((a, b) => b.confidenceScore - a.confidenceScore);
  
  console.log(`[DEBUG][Grade] Total evidence items: ${scoredEvidence.length}`);
  console.log(`[DEBUG][Grade] ========== GRADE END ==========`);

  return {
    evidence: scoredEvidence,
    needsRefinement: scoredEvidence.length === 0,
    refinedQueries: []
  };
}

function calculateRelevance(claim: string, content: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const claimTerms = clean(claim);
  const contentTerms = clean(content);
  
  if (claimTerms.length === 0 || contentTerms.length === 0) return 0;

  let matches = 0;
  claimTerms.forEach(term => {
    if (contentTerms.some(ct => ct.includes(term))) matches++;
  });

  const relevance = Math.min(1, matches / claimTerms.length);
  return relevance;
}
