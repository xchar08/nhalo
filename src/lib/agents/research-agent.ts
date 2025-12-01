// ============================================================================
// FILE: src/lib/agents/research-agent.ts
// ============================================================================
import { Claim, DocumentSource, EvidenceItem } from '@/types/research';
import { retrieveForClaim } from './nodes/retrieve';
import { gradeEvidence } from './nodes/grade';
import { triangulateBias } from './nodes/triangulation';

/**
 * Configuration for the Research Agent
 */
export interface AgentConfig {
  deepSearch: boolean;
}

/**
 * C.4 Agentic RAG Workflow State
 * Coordinates the lifecycle of a single claim's research process.
 */
export interface AgentState {
  claim: Claim;
  sources: DocumentSource[];
  evidence: EvidenceItem[];
  
  // Workflow Control
  iteration: number;
  maxIterations: number;
  searchQueries: string[]; // Current active queries
  isComplete: boolean;
  config: AgentConfig; // NEW: Configuration passed down
}

export class ResearchAgent {
  private state: AgentState;

  constructor(claim: Claim, config: AgentConfig = { deepSearch: false }) {
    this.state = {
      claim,
      sources: [],
      evidence: [],
      iteration: 0,
      // Dynamic Loop Limit: 3 for Deep Mode, 1 for Fast Mode
      maxIterations: config.deepSearch ? 3 : 1, 
      searchQueries: [], 
      isComplete: false,
      config
    };
  }

  /**
   * Main execution loop
   */
  public async run(): Promise<Claim> {
    try {
      console.log(`[Agent] Starting run. DeepMode: ${this.state.config.deepSearch}`);
      
      while (!this.state.isComplete && this.state.iteration < this.state.maxIterations) {
        this.state.iteration++;
        await this.step();
      }
      
      // Final Synthesis
      return this.finalize();
      
    } catch (error) {
      console.error(`[Agent] Workflow crashed for claim ${this.state.claim.id}:`, error);
      return { ...this.state.claim, verdict: 'unknown' };
    }
  }

  private async step() {
    console.log(`[Agent] Step ${this.state.iteration}/${this.state.maxIterations}`);

    // 1. RETRIEVE
    // Pass 'config' so retrieve.ts knows if it should crawl recursively
    const retrieveResult = await retrieveForClaim({
      claim: this.state.claim,
      sources: this.state.sources,
      iteration: this.state.iteration,
      searchQueries: this.state.searchQueries,
      config: this.state.config // PASS CONFIG DOWN
    });
    
    // Merge new sources (deduplicate by URL)
    if (retrieveResult.sources) {
      const newIds = new Set(retrieveResult.sources.map(s => s.url));
      const current = this.state.sources.filter(s => !newIds.has(s.url));
      this.state.sources = [...current, ...retrieveResult.sources];
    }

    // 2. GRADE
    // Only grade if we found sources
    if (this.state.sources.length > 0) {
        const gradeResult = await gradeEvidence({
            claim: this.state.claim,
            sources: this.state.sources,
            evidence: [], // Always re-grade freshly
            needsRefinement: false,
            refinedQueries: []
        });
        
        this.state.evidence = gradeResult.evidence || [];

        // 3. CHECK TRIANGULATION (only if we have good evidence)
        let newBiasStatus: 'balanced' | 'one_sided' | 'contentious' = this.state.claim.biasStatus;

        if (this.state.evidence.length > 0 && !gradeResult.needsRefinement) {
            const result = await triangulateBias({
                claim: this.state.claim,
                evidence: this.state.evidence,
                biasStatus: 'balanced'
            });
            
            if (result.biasStatus) {
                newBiasStatus = result.biasStatus;
            }
        }

        // 4. DECIDE NEXT STEP
        if (gradeResult.needsRefinement && this.state.iteration < this.state.maxIterations) {
            // Loop back with better queries
            this.state.searchQueries = gradeResult.refinedQueries || [];
            console.log(`[Agent] Looping refinement: ${this.state.searchQueries.join(', ')}`);
        } else {
            // Done or out of turns
            this.state.isComplete = true;
            this.state.claim.biasStatus = newBiasStatus;
        }
    } else {
        // No sources found, try to refine queries or exit
        if (this.state.iteration < this.state.maxIterations) {
             // Basic fallback: try simpler query
             console.log("[Agent] No sources found. Retrying with simplified query.");
        } else {
            this.state.isComplete = true;
        }
    }
  }

  private finalize(): Claim {
    // Determine final verdict based on top evidence
    const topEvidence = this.state.evidence[0];
    let verdict: Claim['verdict'] = 'unknown';
    let confidence = 0;

    if (topEvidence) {
      confidence = topEvidence.confidenceScore;
      if (confidence > 0.7) {
        verdict = topEvidence.supportStatus === 'pro' ? 'supported' : 'refuted';
      } else if (confidence > 0.4) {
        verdict = 'debated';
      }
    }

    return {
      ...this.state.claim,
      verdict,
      confidence,
      // Return top 10 evidence items for the frontend
      evidence: this.state.evidence.slice(0, 10), 
      linkedDocumentIds: [...new Set(this.state.evidence.map(e => e.documentId))]
    };
  }
}
