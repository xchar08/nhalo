// ============================================================================
// FILE: src/types/research.ts
// ============================================================================

// Domain types for segmentation and classification
export type ResearchDomain = 'research' | 'medical' | 'political' | 'mixed';

export type ClaimType = 
  | 'definition' 
  | 'empirical' 
  | 'math' 
  | 'policy' 
  | 'hypothesis' 
  | 'opinion';

export type VerdictType = 'supported' | 'debated' | 'refuted' | 'unknown';

// Core Claim Entity
export interface Claim {
  id: string;
  projectId: string;
  text: string; // The atomic sentence/assertion
  domain: ResearchDomain;
  type: ClaimType;
  verdict: VerdictType;
  
  // Aggregated confidence score (0-1)
  confidence: number;
  
  // Associated ontology tags (hierarchical metadata)
  tags: string[]; 
  
  // IDs of documents linked to this claim
  linkedDocumentIds: string[];
  
  // Detailed evidence analysis
  evidence: EvidenceItem[];
  
  // Bias triangulation status
  biasStatus: 'balanced' | 'one_sided' | 'contentious';
}

// Evidence derived from a specific document chunk
export interface EvidenceItem {
  documentId: string;
  chunkId: string;
  
  // RENAMED from 'text' to 'snippet' to match agent usage
  snippet: string; 
  
  url: string;
  title: string;
  
  // Confidence metrics specific to this piece of evidence
  confidenceScore: number; 
  
  // Relationship to claim
  supportStatus: 'pro' | 'con' | 'neutral'; // Changed 'contra' to 'con' to match common agent logic
}

// Document Entity (Source)
export interface DocumentSource {
  id: string;
  url: string;
  title: string;
  domain: ResearchDomain;
  biasRating?: string; // e.g., "left-center", "pro-science"
  
  // Math density metric for LaTeX parsing triggers
  containsMath: boolean;
  mathDensity: number;
  
  // Global trust score of the domain (static mapping)
  sourceTrustScore: number;
  
  metadata: Record<string, unknown>;
}

// Document Chunk (Embedding Unit)
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[]; // Vector representation
  containsMath: boolean;
}
