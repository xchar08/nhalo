// ============================================================================
// FILE: src/app/actions/analyze-pdr.ts
// ============================================================================
'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { ResearchAgent } from '@/lib/agents/research-agent';
import type { EvidenceItem, Claim } from '@/types/research';
import { aggregateFeeds } from '@/lib/feed/rss-aggregator';
import { searchWeb, deepCrawl } from '@/lib/crawlers/free-crawler';
import { 
  fastSummarize, 
  answerWithContext, 
  writeBetterReport,
  generateResearchPlan 
} from '@/lib/ai/fast-summarizer';
import { getAcademicSeedTargets } from '@/lib/config/academic-seeds';
import { createClient } from '@/lib/supabase/server';
import { autoTagJob } from '@/lib/agents/auto-tagger';

// ---------------------------
// Helpers
// ---------------------------

async function mapAsync<T, R>(array: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: Promise<R>[] = [];
  const executing: Promise<R>[] = [];

  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);

    const e: Promise<R> = p.then(() => executing.splice(executing.indexOf(e), 1) as any);
    executing.push(e);

    if (executing.length >= limit) await Promise.race(executing);
  }

  return Promise.all(results);
}



function generateSubQueries(originalQuery: string): string[] {
  return [
    originalQuery,
    `${originalQuery} technical details`,
    `${originalQuery} documentation OR benchmarks`,
    `${originalQuery} limitations`,
    `${originalQuery} site:.edu OR site:arxiv.org`,
    `${originalQuery} "research paper" OR "study" FILETYPE:pdf`,
  ];
}

async function distillEvidenceForClaim(claimText: string, evidence: EvidenceItem[], summaries: string) {
  const context = [
    `CLAIM:\n${claimText}`,
    `EVIDENCE_COUNT: ${evidence?.length ?? 0}`,
    `EVIDENCE (titles+urls+snippets):\n${
      (evidence || [])
        .slice(0, 12)
        .map(
          (e, i) =>
            `(${i + 1}) ${e.title || 'Untitled'} | ${e.url}\n${String(e.snippet || '').slice(0, 400)}`
        )
        .join('\n\n')
    }`,
    `SUMMARIES:\n${summaries.slice(0, 18000)}`,
  ].join('\n\n');

  return writeBetterReport(
    `Distill the claim into:
- Verdict recommendation (supported/refuted/debated/unknown) with short rationale
- 3 strongest supporting points (bullet)
- 3 strongest counterpoints/risks (bullet)
- What information would change the verdict (bullet)
- Suggested follow-up sources (bullet, with type: docs/paper/benchmark/vendor/blog)

Return in Markdown, compact.`,
    context
  );
}

async function generateExecutiveReport(projectText: string, perClaimDistilled: string, sources: any[]) {
  const context = [
    `ORIGINAL_REQUEST:\n${projectText}`,
    `DISTILLED_CLAIMS:\n${perClaimDistilled}`,
    `SOURCES (top):\n${sources
      .slice(0, 25)
      .map((s: any, i: number) => `(${i + 1}) ${s.title || s.url} | ${s.url} | score=${s.score ?? 'n/a'}`)
      .join('\n')}`,
  ].join('\n\n');

  // Chunk 1: Abstract & Intro
  const part1 = await writeBetterReport(
    `Write PART 1 of a Scientific Research Paper.
Required sections (in this order):
1) Title (Just the text, no markdown header)
2) Abstract (A concise summary of the entire problem and solution)
3) Introduction (Context, Problem Statement, Research Objectives)

Format: Markdown. Use # for Title, ## for Abstract/Intro.
Constraint: Cite sources inline using [number] format (e.g. [1]) matching the provided source list.`,
    context
  );

  // Chunk 2: Deep Facet Analysis (The Core)
  const part2 = await writeBetterReport(
    `Write PART 2: Deep Facet Analysis.
Identify 3-4 key technical facets of the project (e.g. Frontend Architecture, AI Strategy, Backend/Infrastructure, Compliance).
For EACH facet, write a subsection (## Facet Name) containing:
- **Status/Evaluation**: Current state vs ideal state.
- **Technology Recommendation**: Specific tools/libraries (e.g. Next.js, Supabase, LangChain) with justification.
- **Success Metrics**: A Markdown Table defining 3 key metrics (Metric | Target | Measurement).

Constraints:
- Be extremely specific with technology names.
- Use Markdown tables for metrics.
- Cite sources inline using [number] format (e.g. [1]) matching the provided source list.`,
    context
  );

  // Chunk 3: Findings, Risks & Conclusion
  const part3 = await writeBetterReport(
    `Write PART 3: Findings & Conclusion.
Required sections:
4) Findings & Verdicts (Markdown Table: Claim | Verdict | Confidence | Rational)
5) Risk Analysis (Technical, Deployment, Cost)
6) Conclusion (Final recommendation and next steps)

Format: Markdown.
Constraint: Cite sources inline using [number] format (e.g. [1]) matching the provided source list.`,
    context
  );

  return [part1, part2, part3].join('\n\n');
}

// ---------------------------
// User-scoped (UI)
// ---------------------------

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function getLatestResearchContextText(): Promise<string | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('research_contexts')
    .select('context')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.context ?? null;
}

export async function analyzePdrAction(pdrText: string, deepMode: boolean = false, breadth: number = 3) {
  if (!pdrText.trim()) return { success: false, error: 'Empty text' };
  const { supabase, user } = await requireUser();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const academicSeeds = getAcademicSeedTargets();

  const { data: sessionRow, error: sessionErr } = await supabase
    .from('research_sessions')
    .insert({
      user_id: user.id,
      query: pdrText,
      metadata: { claim_count: null, status: 'queued' },
    })
    .select()
    .single();

  if (sessionErr) throw sessionErr;

  const { data: jobRow, error: jobErr } = await supabase
    .from('research_jobs')
    .insert({
      user_id: user.id,
      session_id: sessionRow.id,
      status: 'queued',
      deep_mode: deepMode,
      breadth,
      input_text: pdrText,
      result: {},
    })
    .select()
    .single();

  if (jobErr) throw jobErr;

  return { success: true, queued: true, jobId: String(jobRow.id), sessionId: String(sessionRow.id) };
}

export async function getResearchJobAction(jobId: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('research_jobs')
    .select('id,status,result,error,session_id,updated_at,created_at')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { success: false, error: 'Job not found' };

  return { success: true, job: data };
}

export async function askResearchContextAction(question: string) {
  const ctx = await getLatestResearchContextText();
  if (!ctx) return { success: false, answer: 'No research context available.' };
  const answer = await answerWithContext(question, ctx);
  return { success: true, answer };
}

// ---------------------------
// Admin-scoped (cron/worker)
// ---------------------------

function requireAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return { url, serviceKey };
}

function createAdminSupabase() {
  const { url, serviceKey } = requireAdminEnv();
  return createAdminClient(url, serviceKey);
}


export async function runResearchJobAdmin(jobId: string) {
  const admin = createAdminSupabase();
  const { data: job, error: jobFetchErr } = await admin.from('research_jobs').select('*').eq('id', jobId).maybeSingle();

  if (jobFetchErr) throw jobFetchErr;
  if (!job) return { success: false, error: 'Job not found' };

  if (job.status === 'succeeded') return { success: true, alreadyDone: true, jobId };

  const { error: runErr } = await admin.from('research_jobs').update({ status: 'running', error: null }).eq('id', jobId);
  if (runErr) throw runErr;

  const pdrText = String(job.input_text || '').trim();
  const deepMode = Boolean(job.deep_mode);
  const breadth = Number(job.breadth || 3);
  const sessionId = job.session_id ? String(job.session_id) : null;
  const userId = String(job.user_id || '');

  try {
    // --- STEP 1: PLAN (Agentic) ---
    const plannedQueries = await generateResearchPlan(pdrText);

    let claims: Claim[] = plannedQueries.map((text, i) => ({
      id: `claim-${Date.now()}-${i}`,
      projectId: sessionId ?? 'unknown',
      text, 
      domain: 'research',
      type: 'empirical',
      verdict: 'unknown',
      confidence: 0,
      tags: [],
      linkedDocumentIds: [],
      evidence: [],
      biasStatus: 'balanced',
    }));

    if (claims.length === 0) {
      if (!pdrText) {
        // ... (error handling)
         const resultPayload = {
          claims: [],
          unifiedReport: 'No input text provided.',
          sources: [],
          stats: { totalClaims: 0, processed: 0 },
          sessionId,
        };
        await admin.from('research_jobs').update({ status: 'succeeded', result: resultPayload, error: null }).eq('id', jobId);
        return { success: true, jobId, result: resultPayload };
      }

      // Fallback
      claims = [
        {
          id: `claim-${Date.now()}-fallback`,
          projectId: sessionId ?? 'unknown',
          text: pdrText,
          domain: 'research',
          type: 'empirical',
          verdict: 'unknown',
          confidence: 0,
          tags: ['fallback-claim'],
          linkedDocumentIds: [],
          evidence: [],
          biasStatus: 'balanced',
        },
      ];
    }

    const results: Claim[] = [];
    const allSources: any[] = [];
    let fullResearchContext = `Original Request: ${pdrText}\n\n`;
    const distilledBlocks: string[] = [];

    // --- STEP 2: EXECUTE PARALLEL (Free Tier Mode) ---
    // STRICTLY 1 at a time to minimize rate limit hits
    await mapAsync(claims, 1, async (claim) => {
      try {
        const queries = deepMode ? generateSubQueries(claim.text) : [claim.text];
        const searchResultsNested = await Promise.all(queries.map((q) => searchWeb(q)));
        const searchResults = searchResultsNested.flat();

        const uniqueUrls = [...new Set(searchResults.map((r) => r.url))]
          .filter((u) => !!u && u !== '#error' && !u.includes('youtube.com')) 
          .slice(0, deepMode ? Math.min(20, breadth * 3) : breadth);

        if (uniqueUrls.length === 0) {
            console.warn(`[Analyze] No results for claim: "${claim.text}". Potential Network/DNS Error.`);
            results.push({ ...claim, verdict: 'unknown', confidence: 0 });
            distilledBlocks.push(`## Claim: ${claim.text}\n- **Status**: Search failed (Network Error or No Results).`);
            return;
        }

        // Deep Crawl with enhanced depth if deepMode
        const crawlResults = (await Promise.all(
            uniqueUrls.map((url) => deepCrawl(
                url, 
                0, 
                deepMode ? 2 : 1, // Max Depth: 2 if deep, 1 otherwise
                deepMode ? 8 : 4  // Max Pages: 8 if deep, 4 otherwise
            ))
        )).flat();

        // --- FREE TIER OPTIMIZATION ---
        // 1. Concurrency: 1 (Sequential)
        // 2. Delay: 1000ms (1 second) sleep between LLM calls
        const summaries = await mapAsync(crawlResults, 1, async (p) => {
          await new Promise((r) => setTimeout(r, 1000)); // Sleep to respect rate limits
          return fastSummarize(p.markdown, claim.text);
        });

        const richContext = summaries.join('\n\n');
        fullResearchContext += `\n\n### Claim: ${claim.text}\n${richContext}`;

        // Agent run
        const agentResult = await new ResearchAgent(claim, { deepSearch: deepMode, breadth }).run();
        
        // Manually hydrate evidence if agent returns empty (fallback)
        if (!agentResult.claim.evidence || agentResult.claim.evidence.length === 0) {
           agentResult.claim.evidence = crawlResults.map((c, i) => ({
             url: c.url,
             title: c.title,
             snippet: summaries[i],
             confidenceScore: 0.7,
             documentId: `doc-${i}`,
             chunkId: `chunk-${i}`,
             supportStatus: 'neutral'
           } as EvidenceItem));
        }

        const { claim: resultClaim } = agentResult;
        results.push(resultClaim);

        if (resultClaim.evidence) {
          allSources.push(
            ...resultClaim.evidence.map((e) => ({
              url: e.url,
              title: e.title || e.url,
              snippet: e.snippet,
              score: e.confidenceScore,
            }))
          );

          const distilled = await distillEvidenceForClaim(claim.text, resultClaim.evidence || [], richContext);
          distilledBlocks.push(`## Claim: ${claim.text}\n${distilled}\n`);
        }
      } catch (e) {
        console.error('Agent failed for claim:', claim.id, e);
        results.push(claim);
        distilledBlocks.push(`## Claim: ${claim.text}\n- Distillation failed; insufficient evidence gathered.\n`);
      }
    });

    // ... (rest of function)
    const uniqueSources = Array.from(new Map(allSources.map((s) => [s.url, s])).values());
    const unifiedReport = await generateExecutiveReport(pdrText, distilledBlocks.join('\n\n'), uniqueSources);

    // Auto-tag
    await autoTagJob(jobId, unifiedReport).catch((err) => {
      console.error('Auto-tagging failed:', err);
    });

    if (sessionId && userId) {
      await admin.from('research_contexts').insert({
        user_id: userId,
        session_id: sessionId,
        prompt: pdrText,
        context: fullResearchContext,
      });

      await admin
        .from('research_sessions')
        .update({ metadata: { claim_count: results.length, status: 'succeeded' } })
        .eq('id', sessionId);
    }

    const resultPayload = {
      claims: results,
      unifiedReport,
      sources: uniqueSources,
      stats: { totalClaims: claims.length, processed: results.length },
      sessionId,
    };

    const { error: doneErr } = await admin
      .from('research_jobs')
      .update({ status: 'succeeded', result: resultPayload, error: null })
      .eq('id', jobId);

    if (doneErr) throw doneErr;

    return { success: true, jobId, result: resultPayload };
  } catch (err: any) {
    const message = String(err?.message || err || 'Unknown error');
    await createAdminSupabase().from('research_jobs').update({ status: 'failed', error: message }).eq('id', jobId);

    if (sessionId) {
      await createAdminSupabase()
        .from('research_sessions')
        .update({ metadata: { status: 'failed', error: message } })
        .eq('id', sessionId);
    }

    return { success: false, jobId, error: message };
  }
}

// ---------------------------
// The rest of your actions
// ---------------------------

export async function askBranchContextAction(branchId: string, question: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('research_branches')
    .select('context')
    .eq('user_id', user.id)
    .eq('branch_id', branchId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.context) return { success: false, answer: 'No branch context available.' };

  const answer = await answerWithContext(question, data.context);
  return { success: true, answer };
}

export async function diveDeeperAction(params: {
  branchId: string;
  parentNodeId: string;
  seedType: 'claim' | 'document';
  seedText: string;
  seedUrl?: string;
  depth: number;
  breadth: number;
  deepMode?: boolean;
  sessionId?: string;
}) {
  const { supabase, user } = await requireUser();
  const { branchId, parentNodeId, seedType, seedText, seedUrl } = params;

  const depth = Math.max(0, Math.min(3, params.depth));
  const breadth = Math.max(1, Math.min(12, params.breadth));
  const deepMode = params.deepMode ?? true;

  const queries = deepMode ? generateSubQueries(seedText) : [seedText];
  const searchResultsNested = await Promise.all(queries.map((q) => searchWeb(q)));
  const searchResults = searchResultsNested.flat();

  const urls = [...new Set(searchResults.map((r) => r.url))]
    .filter((u) => !!u && u !== '#error')
    .slice(0, deepMode ? Math.min(20, breadth * 2) : breadth);

  const prioritizedUrls = seedUrl ? [seedUrl, ...urls.filter((u) => u !== seedUrl)] : urls;

  const crawlResults = (await Promise.all(prioritizedUrls.map((u) => deepCrawl(u, 0, depth, 6)))).flat();

  // --- FREE TIER OPTIMIZATION ---
  const summaries = await mapAsync(crawlResults, 1, async (p) => {
    await new Promise((r) => setTimeout(r, 1000));
    return fastSummarize(p.markdown, seedText);
  });
  
  // ... (rest of function)
  const branchContext = [
    `BRANCH_ID: ${branchId}`,
    `PARENT_NODE: ${parentNodeId}`,
    `SEED_TYPE: ${seedType}`,
    `SEED_TEXT: ${seedText}`,
    `SEED_URL: ${seedUrl ?? '(none)'}`,
    `SUMMARIES:\n${summaries.join('\n\n')}`,
  ].join('\n\n');

  const branchReport = await writeBetterReport(
    `Summarize what this deep dive adds beyond the parent node.
Return:
- 5 key findings
- 3 risks/unknowns
- 3 recommended next URLs to read (choose from provided URLs if possible)`,
    branchContext
  );

  const { error: upsertErr } = await supabase
    .from('research_branches')
    .upsert(
      {
        user_id: user.id,
        session_id: params.sessionId ?? null,
        branch_id: branchId,
        parent_node_id: parentNodeId,
        seed_type: seedType,
        seed_text: seedText,
        seed_url: seedUrl ?? null,
        depth,
        breadth,
        context: branchContext,
        report: branchReport,
      },
      { onConflict: 'user_id,branch_id' }
    );

  if (upsertErr) throw upsertErr;

  const docNodes = prioritizedUrls.slice(0, Math.min(prioritizedUrls.length, 12)).map((u) => ({
    id: `doc:${branchId}:${u}`,
    label: u.replace(/^https?:\/\//, '').slice(0, 28) + '…',
    confidence: 0.5,
    isStarred: false,
    isRead: false,
    domain: 'external',
    tags: [],
    degree: 1,
    type: 'document' as const,
    branchId,
    parentNodeId,
    seedUrl: u,
    meta: { url: u },
  }));

  const branchRoot = {
    id: `branch:${branchId}`,
    label: `Dive deeper: ${seedText.slice(0, 22)}…`,
    confidence: 0.75,
    isStarred: true,
    isRead: true,
    domain: 'branch',
    tags: ['dive-deeper'],
    degree: docNodes.length,
    type: 'claim' as const,
    branchId,
    parentNodeId,
    seedUrl: params.seedUrl, // fix to include seedUrl in node
  };

  const links = [
    { source: parentNodeId, target: branchRoot.id, strength: 0.9, branchId },
    ...docNodes.map((n) => ({ source: branchRoot.id, target: n.id, strength: 0.5, branchId })),
  ];

  return { success: true, branchId, parentNodeId, branchReport, graphDelta: { nodes: [branchRoot, ...docNodes], links } };
}

export async function getKnowledgeFeed() {
  try {
    const rawFeedItems = await aggregateFeeds().catch((e) => {
      console.error('aggregateFeeds failed', e);
      return [];
    });

    const feedItems = rawFeedItems.map((item: any) => ({
      id: String(item.id ?? item.link ?? globalThis.crypto?.randomUUID?.() ?? Date.now() - Math.random()),
      title: String(item.title || 'Untitled'),
      link: String(item.link || '#'),
      contentSnippet: String(item.contentSnippet || ''),
      source: String(item.source || 'Unknown'),
      isoDate: String(item.isoDate || new Date().toISOString()),
      category: String(item.category || 'general'),
      region: String(item.region || 'GLOBAL'),
      institution: item.institution ? String(item.institution) : undefined,
    }));

    const plainFeed = JSON.parse(JSON.stringify(feedItems));
    return { success: true, feed: plainFeed, timestamp: new Date().toISOString() };
  } catch (e) {
    console.error('Feed aggregation failed (outer)', e);
    return { success: false, feed: [], error: 'Failed to load feed' };
  }
}

export async function askFeedContextAction(question: string) {
  try {
    const res: any = await getKnowledgeFeed();
    const feed = res?.feed as any[];

    const todayISO = new Date().toISOString().slice(0, 10);

    const feedContext = feed
      .slice(0, 50) // Increased from 30 to 50
      .map((item) => {
        const date = item?.isoDate ? new Date(item.isoDate).toISOString() : 'unknown-date';
        return `Date: ${date}\nTitle: ${String(item?.title ?? '')}\nSource: ${String(item?.source ?? '')}\nSnippet: ${String(item?.contentSnippet ?? '')}\nLink: ${String(item?.link ?? '')}\n---`;
      })
      .join('\n');

    const systemHint = [
      'You are a News Assistant.',
      `If the user asks what happened "today", interpret "today" as ${todayISO}.`,
      `Prefer items whose Date starts with ${todayISO}.`,
      'If there are no items from today, say so and list the most recent items with their dates.',
    ].join('\n');

    const answer = await answerWithContext(question, `${systemHint}\n\nNEWS FEED:\n${feedContext}`);
    return { success: true, answer };
  } catch (e) {
    console.error('Feed Chat Failed', e);
    return { success: false, answer: 'Failed to analyze feed.' };
  }
}


// Called by Worker for Deep Dives (if needed for background processing)
export async function runDeepDiveAdmin(branchId: string) {
  const admin = createAdminSupabase();

  const { data: branch } = await admin.from('research_branches').select('*').eq('branch_id', branchId).single();
  if (!branch) return { success: false, error: 'Branch not found' };

  const { seed_text, seed_url, depth, breadth, parent_node_id } = branch;

  const queries = [seed_text];
  const searchResultsNested = await Promise.all(queries.map((q) => searchWeb(q)));
  const searchResults = searchResultsNested.flat();

  const urls = [...new Set(searchResults.map((r) => r.url))]
    .filter((u) => !!u && u !== '#error')
    .slice(0, Math.min(10, breadth * 2));

  const prioritizedUrls = seed_url ? [seed_url, ...urls.filter((u) => u !== seed_url)] : urls;
  const crawlResults = (await Promise.all(prioritizedUrls.map((u) => deepCrawl(u, 0, depth, 6)))).flat();

  const summaries = await mapAsync(crawlResults, 3, async (p) => {
    await new Promise((r) => setTimeout(r, 150));
    return fastSummarize(p.markdown, seed_text);
  });

  const branchContext = [
    `BRANCH_ID: ${branchId}`,
    `PARENT_NODE: ${parent_node_id}`,
    `SEED_TEXT: ${seed_text}`,
    `SUMMARIES:\n${summaries.join('\n\n')}`,
  ].join('\n\n');

  const branchReport = await writeBetterReport(
    `Summarize what this deep dive adds beyond the parent node.
Return:
- 5 key findings
- 3 risks/unknowns
- 3 recommended next URLs to read`,
    branchContext
  );

  await admin
    .from('research_branches')
    .update({
      report: branchReport,
      context: branchContext
    })
    .eq('branch_id', branchId);

  return { success: true, branchReport };
}
