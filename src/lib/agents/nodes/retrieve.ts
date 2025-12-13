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
  config?: {
    deepSearch: boolean;
    breadth: number;
  };
}

function isBadUrl(url: string | undefined | null): boolean {
  const u = (url || '').trim();
  if (!u) return true;
  if (u === '#error') return true;
  if (u.startsWith('mailto:')) return true;
  if (u.startsWith('#')) return true;

  // enforce http(s) only
  if (!/^https?:\/\//i.test(u)) return true;

  return false;
}

export async function retrieveForClaim(state: RetrieveState): Promise<Partial<RetrieveState>> {
  const { claim, iteration, searchQueries, config } = state;

  const isDeepMode = config?.deepSearch || false;
  const breadth = config?.breadth || 3;

  console.log(`[DEBUG][Retrieve] ========== RETRIEVE START (Breadth: ${breadth}) ==========`);

  const newSources: DocumentSource[] = [];
  const queriesToRun = searchQueries.length > 0 ? searchQueries : [claim.text];

  // In Deep Mode, run more queries. In Fast Mode, just 1.
  const queryLimit = isDeepMode ? 3 : 1;

  for (const query of queriesToRun.slice(0, queryLimit)) {
    console.log(`[DEBUG][Retrieve] Query: "${query.slice(0, 50)}..."`);

    try {
      const searchResults = await searchWeb(query);

      // Limit the number of results processed per query
      for (let i = 0; i < Math.min(breadth, searchResults.length); i++) {
        const result = searchResults[i];
        if (isBadUrl(result?.url)) continue;

        const url = result.url.trim();

        let trustScore = calculateTrustScore(url);

        // Priority boost only if URL is valid
        if (!isBadUrl(url) && isPrioritySource(url)) {
          trustScore += 0.3;
          console.log(`[Retrieve] PRIORITY SOURCE: ${url}`);
        }
        trustScore = Math.min(1.0, trustScore);

        const source: DocumentSource = {
          id: crypto.randomUUID(),
          url,
          title: result.title || url,
          domain: claim.domain,
          containsMath: false,
          mathDensity: 0,
          sourceTrustScore: trustScore,
          metadata: {
            rawMarkdown: result.snippet,
            snippet: result.snippet,
            crawledAt: new Date().toISOString(),
          },
        };

        // Recursive logic (only for good URLs)
        if (isDeepMode && trustScore > 0.8 && iteration < 2 && !url.endsWith('.pdf')) {
          console.log(`[Retrieve] RECURSIVE CRAWL: ${url}`);
          try {
            const deepContent = await crawlUrl(url);
            if (deepContent.markdown && deepContent.markdown.length > 500) {
              source.metadata.rawMarkdown = deepContent.markdown;
              console.log(`[Retrieve] Captured full content (${deepContent.markdown.length} chars)`);
            }
          } catch (err) {
            console.warn(`[Retrieve] Failed to crawl ${url}:`, err);
          }
        }

        newSources.push(source);
      }
    } catch (e) {
      console.error(`[DEBUG][Retrieve] Query failed:`, e);
    }
  }

  const uniqueSources = Array.from(new Map(newSources.map((s) => [s.url, s])).values());
  return { sources: uniqueSources };
}

function calculateTrustScore(url: string): number {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.gov') || lowerUrl.includes('.edu')) return 0.85;
  if (lowerUrl.includes('arxiv.org') || lowerUrl.includes('nature.com')) return 0.9;
  return 0.5;
}
