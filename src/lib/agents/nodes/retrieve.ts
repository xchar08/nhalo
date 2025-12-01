// ============================================================================
// FILE: src/lib/agents/nodes/retrieve.ts
// ============================================================================
import { Claim, DocumentSource } from '@/types/research';
import { searchWeb, crawlUrl } from '@/lib/crawlers/free-crawler'; 
import { isPrioritySource } from '@/lib/config/knowledge-base'; 

interface RetrieveState {
  claim: Claim;
  sources: DocumentSource[];
  iteration: number;
  searchQueries: string[];
  config?: { deepSearch: boolean }; // Added config to interface
}

export async function retrieveForClaim(state: RetrieveState): Promise<Partial<RetrieveState>> {
  const { claim, iteration, searchQueries, config } = state;
  const isDeepMode = config?.deepSearch || false; // Check flag
  
  console.log(`[DEBUG][Retrieve] ========== RETRIEVE START ==========`);
  console.log(`[DEBUG][Retrieve] Deep Mode: ${isDeepMode}`);
  
  const newSources: DocumentSource[] = [];
  const queriesToRun = searchQueries.length > 0 ? searchQueries : [claim.text];

  // Limit iterations based on mode (Deep = 3 queries, Fast = 1 query)
  const queryLimit = isDeepMode ? 3 : 1;

  for (const query of queriesToRun.slice(0, queryLimit)) {
    console.log(`[DEBUG][Retrieve] Query: "${query.slice(0, 50)}..."`);
    
    try {
      const searchResults = await searchWeb(query);
      
      // Limit results based on mode
      const resultLimit = isDeepMode ? 8 : 3;

      for (let i = 0; i < Math.min(resultLimit, searchResults.length); i++) {
        const result = searchResults[i];
        
        let trustScore = calculateTrustScore(result.url);
        if (isPrioritySource(result.url)) {
             trustScore += 0.3; 
             console.log(`[Retrieve] 🌟 PRIORITY SOURCE: ${result.url}`);
        }
        trustScore = Math.min(1.0, trustScore);

        const source: DocumentSource = {
          id: crypto.randomUUID(),
          url: result.url,
          title: result.title || result.url,
          domain: claim.domain,
          containsMath: false,
          mathDensity: 0,
          sourceTrustScore: trustScore,
          metadata: {
            rawMarkdown: result.snippet,
            snippet: result.snippet,
            crawledAt: new Date().toISOString()
          }
        };
        
        // ============================================================
        // RECURSIVE DEPTH LOGIC (Only if deepMode is ON)
        // ============================================================
        if (isDeepMode && trustScore > 0.8 && iteration < 2 && !result.url.endsWith('.pdf')) {
             console.log(`[Retrieve] 🔍 RECURSIVE CRAWL: ${result.url}`);
             try {
                const deepContent = await crawlUrl(result.url);
                if (deepContent.markdown && deepContent.markdown.length > 500) {
                    source.metadata.rawMarkdown = deepContent.markdown;
                    console.log(`[Retrieve] ✅ Captured full content (${deepContent.markdown.length} chars)`);
                }
             } catch (err) {
                console.warn(`[Retrieve] Failed to crawl ${result.url}:`, err);
             }
        }

        newSources.push(source);
      }
    } catch (e) {
      console.error(`[DEBUG][Retrieve] Query failed:`, e);
    }
  }

  const uniqueSources = Array.from(
    new Map(newSources.map(s => [s.url, s])).values()
  );

  return { sources: uniqueSources };
}

function calculateTrustScore(url: string): number {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.gov') || lowerUrl.includes('.edu')) return 0.85;
  if (lowerUrl.includes('arxiv.org') || lowerUrl.includes('nature.com')) return 0.90;
  return 0.5;
}
