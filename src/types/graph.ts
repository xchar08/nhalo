// ============================================================================
// FILE: src/types/graph.ts
// ============================================================================
import { ResearchDomain } from './research';

// Visualizer-specific node interface
// Implements the minimal attributes required for the ForceGraph/Cosmograph
export interface GraphNode {
  id: string;
  label: string; // Usually document title or truncated claim text
  
  // Metrics for visual encoding
  confidence: number; // 0–1, maps to radius and brightness
  degree: number;     // Number of connections, used for initial layout gravity
  
  // State flags
  isStarred: boolean; // Acts as gravity well if true
  isRead: boolean;    // Determines the red-tint overlay
  
  // Categorical data for coloring
  domain: ResearchDomain | 'other'; 
  tags: string[];
  
  // Optional reference to original data
  originalId?: string;
  type: 'claim' | 'document';
}

export interface GraphLink {
  source: string; // Node ID
  target: string; // Node ID
  strength: number; // 0-1, derived from semantic similarity
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
