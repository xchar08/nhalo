// ============================================================================
// FILE: src/types/graph.ts
// ============================================================================
import { ResearchDomain } from './research';

export type GraphDomain = ResearchDomain | 'other' | 'external' | 'branch';

export interface GraphNode {
  id: string;
  label: string;

  confidence: number;
  degree: number;

  isStarred: boolean;
  isRead: boolean;

  domain: GraphDomain;
  tags: string[];

  originalId?: string;
  type: 'claim' | 'document';

  // Optional branch metadata
  branchId?: string;
  parentNodeId?: string;
  seedUrl?: string;
  meta?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  strength: number;

  branchId?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
