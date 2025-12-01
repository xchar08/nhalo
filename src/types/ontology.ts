// ============================================================================
// FILE: src/types/ontology.ts
// ============================================================================

export interface OntologyNode {
    id: string;
    label: string;
    description: string; // Used for embedding generation
    
    // Hierarchy
    parentIds: string[];
    childIds: string[];
    
    // Expansion
    synonyms: string[];
    
    // Vector cache (optional, handled usually in DB/Vector store)
    embedding?: number[];
  }
  
  // Result of the auto-tagging process
  export interface TagResult {
    nodeId: string;
    label: string;
    similarity: number; // Cosine similarity score
    path: string[];     // e.g., ["Machine Learning", "Deep Learning"]
  }
  