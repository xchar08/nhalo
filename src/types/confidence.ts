// ============================================================================
// FILE: src/types/confidence.ts
// ============================================================================

// Raw inputs for calculating the confidence score
export interface ConfidenceComponents {
    // Cosine similarity between claim and document chunk (0-1)
    vectorSimilarity: number;
    
    // Normalized degree or PageRank of the doc in the local graph (0-1)
    citationScore: number;
    
    // Static trust mapping for the domain (e.g., PubMed=0.95) (0-1)
    sourceTrust: number;
    
    // Optional LLM verification grade (0-1)
    llmGrade?: number;
  }
  
  // Detailed breakdown of the final calculation
  export interface ConfidenceReport {
    baseScore: number;  // 0.4*sim + 0.3*cit + 0.3*trust
    finalScore: number; // Adjusted by LLM grade if present
    components: ConfidenceComponents;
  }
  
  // Configuration for the scoring algorithm
  export const CONFIDENCE_WEIGHTS = {
    similarity: 0.4,
    citation: 0.3,
    trust: 0.3,
    baseWeight: 0.7, // Weight of base score when mixing with LLM grade
    llmWeight: 0.3,  // Weight of LLM grade
  };
  