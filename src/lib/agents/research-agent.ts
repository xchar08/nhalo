// ============================================================================
// FILE: src/lib/agents/research-agent.ts
// ============================================================================
import { Claim, DocumentSource, EvidenceItem } from '@/types/research';
import { retrieveForClaim } from './nodes/retrieve';
import { gradeEvidence } from './nodes/grade';
import { triangulateBias } from './nodes/triangulation';

export interface AgentConfig {
  deepSearch: boolean;
  breadth: number; // NEW
}

export interface AgentState {
  claim: Claim;
  sources: DocumentSource[];
  evidence: EvidenceItem[];
  iteration: number;
  maxIterations: number;
  searchQueries: string[]; 
  isComplete: boolean;
  config: AgentConfig; 
}

export class ResearchAgent {
  private state: AgentState;

  constructor(claim: Claim, config: AgentConfig = { deepSearch: false, breadth: 3 }) {
    this.state = {
      claim,
      sources: [],
      evidence: [],
      iteration: 0,
      maxIterations: config.deepSearch ? 3 : 1, 
      searchQueries: [], 
      isComplete: false,
      config
    };
  }

  public async run(): Promise<{ claim: Claim, report: string }> {
    try {
      console.log(`[Agent] Starting run. DeepMode: ${this.state.config.deepSearch}, Breadth: ${this.state.config.breadth}`);
      
      while (!this.state.isComplete && this.state.iteration < this.state.maxIterations) {
        this.state.iteration++;
        await this.step();
      }
      
      const finalClaim = this.finalize();
      const report = this.generateReport(finalClaim);
      
      return { claim: finalClaim, report };
      
    } catch (error) {
      console.error(`[Agent] Workflow crashed for claim ${this.state.claim.id}:`, error);
      return { 
          claim: { ...this.state.claim, verdict: 'unknown' }, 
          report: "Error generating report." 
      };
    }
  }

  private async step() {
    // 1. RETRIEVE
    const retrieveResult = await retrieveForClaim({
      claim: this.state.claim,
      sources: this.state.sources,
      iteration: this.state.iteration,
      searchQueries: this.state.searchQueries,
      config: this.state.config 
    });
    
    if (retrieveResult.sources) {
      const newIds = new Set(retrieveResult.sources.map(s => s.url));
      const current = this.state.sources.filter(s => !newIds.has(s.url));
      this.state.sources = [...current, ...retrieveResult.sources];
    }

    // 2. GRADE
    if (this.state.sources.length > 0) {
        const gradeResult = await gradeEvidence({
            claim: this.state.claim,
            sources: this.state.sources,
            evidence: [], 
            needsRefinement: false,
            refinedQueries: []
        });
        
        this.state.evidence = gradeResult.evidence || [];

        // 3. TRIANGULATE
        if (this.state.evidence.length > 0 && !gradeResult.needsRefinement) {
            const result = await triangulateBias({
                claim: this.state.claim,
                evidence: this.state.evidence,
                biasStatus: 'balanced'
            });
            if (result.biasStatus) this.state.claim.biasStatus = result.biasStatus;
        }

        // 4. NEXT STEP
        if (gradeResult.needsRefinement && this.state.iteration < this.state.maxIterations) {
            this.state.searchQueries = gradeResult.refinedQueries || [];
        } else {
            this.state.isComplete = true;
        }
    } else {
        if (this.state.iteration >= this.state.maxIterations) this.state.isComplete = true;
    }
  }

  private finalize(): Claim {
    const topEvidence = this.state.evidence[0];
    let verdict: Claim['verdict'] = 'unknown';
    let confidence = 0;

    if (topEvidence) {
      confidence = topEvidence.confidenceScore;
      if (confidence > 0.7) verdict = topEvidence.supportStatus === 'pro' ? 'supported' : 'refuted';
      else if (confidence > 0.4) verdict = 'debated';
    }

    return {
      ...this.state.claim,
      verdict,
      confidence,
      evidence: this.state.evidence.slice(0, 10), 
      linkedDocumentIds: [...new Set(this.state.evidence.map(e => e.documentId))]
    };
  }

  private generateReport(claim: Claim): string {
    const date = new Date().toLocaleDateString();
    const evidenceList = claim.evidence.map(e => 
        `- **[${Math.round(e.confidenceScore * 100)}% Confidence]** ${e.snippet.slice(0, 150)}... (Source: ${e.url})`
    ).join('\n');

    return `
### Claim Analysis: "${claim.text.slice(0, 50)}..."
**Verdict:** ${claim.verdict.toUpperCase()} (${Math.round(claim.confidence * 100)}% Confidence)

**Key Evidence:**
${evidenceList || "No direct evidence found."}
    `.trim();
  }
}
