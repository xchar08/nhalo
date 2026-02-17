'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

// Components
import StarField from '@/components/visualizer/StarField';
import ResearchHeader from '@/components/research/ResearchHeader';
import ResearchSidebar from '@/components/research/ResearchSidebar';
import ResearchInput from '@/components/research/ResearchInput';
import ResearchResults from '@/components/research/ResearchResults';
import ResearchChat from '@/components/research/ResearchChat';

// Icons & UI (Minimal direct usage now)
import { Newspaper, Rss, Copy } from 'lucide-react';

// Actions
import {
  analyzePdrAction,
  getResearchJobAction,
  getKnowledgeFeed,
  diveDeeperAction,
} from '@/app/actions/analyze-pdr';

import {
  getUserHistory,
  saveResearchSession,
  deleteResearchSession,
  wipeUserHistory,
  type ResearchProject,
} from '@/app/actions/history';

// Types
import type { Claim } from '@/types/research';
import type { GraphNode, GraphLink } from '@/types/graph';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Types for Dive Modal
type DiveModalState =
  | { open: false }
  | {
      open: true;
      seedType: 'claim' | 'document';
      seedText: string;
      seedUrl?: string;
      parentNodeId?: string;
    };

function makeBranchId() {
  return `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// Browser Notification Helper
function browserNotify(title: string, body: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, { body });
  } catch {
    // ignore
  }
}

async function ensureBrowserNotifyPermission() {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch {
      // ignore
    }
  }
}

export default function ClientHome() {
  const [mode, setMode] = useState<'input' | 'analysis' | 'feed'>('input');
  const [inputText, setInputText] = useState('');
  const [deepMode, setDeepMode] = useState(false);
  const [breadth, setBreadth] = useState(3);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [unifiedReport, setUnifiedReport] = useState('');
  const [rawSources, setRawSources] = useState<any[]>([]);
  const [knowledgeFeed, setKnowledgeFeed] = useState<any[]>([]);

  // State to track current job ID
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const [viewTab, setViewTab] = useState<'graph' | 'report' | 'sources'>('graph');
  const [history, setHistory] = useState<ResearchProject[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Session linkage for dive branches
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Dive deeper state
  const [diveModal, setDiveModal] = useState<DiveModalState>({ open: false });
  const [diveDepth, setDiveDepth] = useState(1);
  const [diveBreadth, setDiveBreadth] = useState(6);
  const [busy, setBusy] = useState(false);

  // Branch ids list for chat selector
  const [branchIds, setBranchIds] = useState<string[]>([]);

  // Graph state
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphLinks, setGraphLinks] = useState<GraphLink[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);

      if (data.session?.user) {
        const res: any = await getUserHistory();
        if (res?.success) setHistory(res.projects);
      }
    };

    init();
  }, [supabase]);

  function buildGraphFromClaims(claimsInput: Claim[]) {
    const rootBranch = 'root';
    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];

    (claimsInput || []).forEach((c: any) => {
      const claimNodeId = `claim:${c.id}`;
      const claimText = String(c.text || '');

      newNodes.push({
        id: claimNodeId,
        label: claimText.slice(0, 45) + (claimText.length > 45 ? '…' : ''),
        confidence: c.confidence ?? 0.5,
        isStarred: (c.confidence ?? 0) > 0.8,
        isRead: true,
        domain: (c.domain as any) || 'research',
        tags: c.tags || [],
        degree: (c.evidence || []).length,
        type: 'claim',
        branchId: rootBranch,
      });

      (c.evidence || []).forEach((ev: any) => {
        const url = String(ev.url || '');
        if (!url) return;

        const docId = url; // URL as stable dedupe key
        const labelBase = String(ev.title || url);

        newNodes.push({
          id: docId,
          label: labelBase.slice(0, 40) + (labelBase.length > 40 ? '…' : ''),
          confidence: ev.confidenceScore ?? 0.5,
          isStarred: false,
          isRead: false,
          domain: (c.domain as any) || 'external',
          tags: ['evidence'],
          degree: 1,
          type: 'document',
          branchId: rootBranch,
          parentNodeId: claimNodeId,
          seedUrl: url,
          meta: {
            url,
            title: ev.title || null,
            snippet: ev.snippet || null,
          },
        });

        newLinks.push({
          source: claimNodeId,
          target: docId,
          strength: ev.confidenceScore ?? 0.5,
          branchId: rootBranch,
        });
      });
    });

    const uniqNodes = Array.from(new Map(newNodes.map((n) => [n.id, n])).values());
    setGraphNodes(uniqNodes);
    setGraphLinks(newLinks);
  }

  async function pollJobUntilDone(jobId: string) {
    const start = Date.now();
    const timeoutMs = 2_400_000; 

    while (Date.now() - start < timeoutMs) {
      const res: any = await getResearchJobAction(jobId);

      if (res?.success && res.job) {
        const job = res.job;

        if (job.status === 'succeeded') {
          const payload = job.result || {};
          const nextClaims = payload.claims || [];
          const nextReport = payload.unifiedReport || '';
          const nextSources = payload.sources || [];

          setClaims(nextClaims);
          setUnifiedReport(nextReport);
          setRawSources(nextSources);

          buildGraphFromClaims(nextClaims);

          // Notify success
          browserNotify('Research Complete', 'Your comprehensive report is ready.');

          setMode('analysis');
          setViewTab('graph');
          return;
        }

        if (job.status === 'failed') {
          throw new Error(job.error || 'Job failed');
        }
      }

      await new Promise((r) => setTimeout(r, 1200));
    }

    throw new Error('Timed out waiting for job to finish');
  }

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    ensureBrowserNotifyPermission().catch(() => {});

    try {
      if (user) {
        await saveResearchSession(inputText);
        const resHist: any = await getUserHistory();
        if (resHist?.success) setHistory(resHist.projects);
      }

      const queued: any = await analyzePdrAction(inputText, deepMode, breadth);

      if (!queued?.success || !queued.jobId) {
        throw new Error(queued?.error || 'Failed to queue job');
      }

      setClaims([]);
      setUnifiedReport('');
      setRawSources([]);
      setGraphNodes([]);
      setGraphLinks([]);
      setBranchIds([]);
      setSessionId(queued.sessionId ?? null);
      
      setCurrentJobId(queued.jobId);

      try {
        await fetch('/api/research-jobs/kick', { method: 'POST' });
      } catch (e) {
        console.warn('Kick failed (cron will still process):', e);
      }

      await pollJobUntilDone(String(queued.jobId));
    } catch (e: any) {
      console.error(e);
      browserNotify('Research Failed', String(e?.message || 'Unknown error'));

      setMode('analysis');
      setViewTab('report');
      setUnifiedReport(`Job failed: ${String(e?.message || e)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistoryItem = (q: string) => {
    setInputText(q);
    setMode('input');
  };

  const handleDeleteItem = async (e: any, id: string) => {
    e.stopPropagation();
    setHistory((p) => p.filter((h) => h.id !== id));
    await deleteResearchSession(id);
  };

  const handleWipeHistory = async () => {
    setShowWipeConfirm(false);
    setHistory([]);
    await wipeUserHistory();
  };

  const loadFeed = async () => {
    setMode('feed');
    if (knowledgeFeed.length === 0) {
      const res: any = await getKnowledgeFeed();
      if (res?.success) setKnowledgeFeed(res.feed);
    }
  };

  const handleExport = (format: 'markdown' | 'html' | 'pdf') => {
    if (format === 'pdf') {
      window.print();
      return;
    }

    const content = format === 'markdown' ? unifiedReport : `<html><body><pre>${unifiedReport}</pre></body></html>`;
    const blob = new Blob([content], { type: format === 'html' ? 'text/html' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report.${format === 'markdown' ? 'md' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Callbacks for Graph interactions
  const openDiveModalFromNode = useCallback((node: GraphNode) => {
    if (node.type === 'document') {
      const url = node.seedUrl || (node.meta?.url ? String(node.meta.url) : undefined);
      setDiveModal({
        open: true,
        seedType: 'document',
        seedText: node.label,
        seedUrl: url,
        parentNodeId: node.id,
      });
      return;
    }

    setDiveModal({
      open: true,
      seedType: 'claim',
      seedText: node.label,
      parentNodeId: node.id,
    });
  }, []);

  const openDiveModalFromClaim = useCallback((claim: Claim) => {
    setDiveModal({
      open: true,
      seedType: 'claim',
      seedText: claim.text,
      parentNodeId: `claim:${claim.id}`,
    });
  }, []);

  async function doDive() {
    if (!diveModal.open) return;

    setBusy(true);

    try {
      const branchId = makeBranchId();
      const res: any = await diveDeeperAction({
        branchId,
        parentNodeId: diveModal.parentNodeId!, // Valid because diveModal.open is true
        seedType: diveModal.seedType,
        seedText: diveModal.seedText,
        seedUrl: diveModal.seedUrl,
        depth: diveDepth,
        breadth: diveBreadth,
        sessionId: sessionId ?? undefined,
      });

      if (!res?.success) return;

      const deltaNodes: GraphNode[] = res.graphDelta?.nodes || [];
      const deltaLinks: GraphLink[] = res.graphDelta?.links || [];

      // Ensure doc nodes have meta.url for consistent tooltip/open behavior
      const normalizedDeltaNodes: GraphNode[] = (deltaNodes || []).map((n: any) => {
        if (n?.type !== 'document') return n;

        const url =
          n.seedUrl ||
          (n.meta?.url ? String(n.meta.url) : null) ||
          (String(n.id || '').startsWith('http') ? String(n.id) : null);

        return {
          ...n,
          seedUrl: url || n.seedUrl,
          meta: {
            ...(n.meta || {}),
            url: url || (n.meta?.url ?? null),
            title: n.meta?.title ?? null,
            snippet: n.meta?.snippet ?? null,
          },
        };
      });

      setGraphNodes((prev) => Array.from(new Map([...prev, ...normalizedDeltaNodes].map((n) => [n.id, n])).values()));
      setGraphLinks((prev) => [...prev, ...deltaLinks]);

      setBranchIds((prev) => (prev.includes(branchId) ? prev : [branchId, ...prev]));

      setUnifiedReport((prev) => `${prev}\n\n---\n\n## Dive Deeper Branch ${branchId}\n\n${res.branchReport}`);
      browserNotify('Deep Dive Complete', 'New insights have been added to your graph.');
      setDiveModal({ open: false });
    } catch (e) {
      console.error(e);
      browserNotify('Dive Failed', 'Could not complete the deep dive.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden font-sans relative bg-[#020203] print:bg-white print:h-auto print:overflow-visible">
      <StarField />

      <ResearchHeader 
        mode={mode} 
        setMode={setMode} 
        user={user} 
        hasClaims={claims.length > 0} 
        viewTab={viewTab} 
        setViewTab={setViewTab} 
        loadFeed={loadFeed}
      />

      <div className="flex-1 relative w-full h-full z-10 overflow-hidden flex print:h-auto print:overflow-visible">
        {/* SIDEBAR */}
        {user && mode === 'input' && (
          <ResearchSidebar 
            history={history}
            loadHistoryItem={loadHistoryItem}
            handleDeleteItem={handleDeleteItem}
            handleWipeHistory={handleWipeHistory}
            showWipeConfirm={showWipeConfirm}
            setShowWipeConfirm={setShowWipeConfirm}
          />
        )}

        {/* INPUT MODE */}
        {mode === 'input' && (
          <ResearchInput 
            inputText={inputText}
            setInputText={setInputText}
            handleAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            deepMode={deepMode}
            setDeepMode={setDeepMode}
            breadth={breadth}
            setBreadth={setBreadth}
          />
        )}

        {/* FEED MODE */}
        {mode === 'feed' && (
          <div className="absolute inset-0 overflow-y-auto bg-[#0a0a0a] p-12 flex justify-center">
            <ResearchChat mode="feed" />
            <div className="max-w-4xl w-full">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Newspaper className="text-cyan-400" /> Global Knowledge Feed
              </h2>

              <div className="flex items-center gap-3 py-4">
                <a
                  href="/feed/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium text-sm transition-all hover:scale-105"
                >
                  <Rss className="w-4 h-4" /> RSS Feed
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/feed/rss.xml`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition-all hover:scale-105"
                >
                  <Copy className="w-4 h-4" /> Copy URL
                </button>
              </div>

              <div className="grid gap-4">
                {knowledgeFeed.map((item: any, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-bold text-gray-100 hover:text-cyan-400 transition-colors"
                    >
                      {item.title || 'Untitled Entry'}
                    </a>

                    {item.isoDate && (
                      <div className="text-[10px] text-gray-500 font-mono mt-2 uppercase">
                        {new Date(item.isoDate).toLocaleString()}
                      </div>
                    )}

                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.contentSnippet}</p>
                  </div>
                ))}

                {knowledgeFeed.length === 0 && <div className="text-center text-gray-500 py-20">Loading trusted sources...</div>}
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS MODE */}
        {mode === 'analysis' && (
          <>
            <ResearchChat mode="analysis" branchIds={branchIds} />
            <ResearchResults 
              viewTab={viewTab}
              graphNodes={graphNodes}
              graphLinks={graphLinks}
              onNodeSelect={openDiveModalFromNode}
              unifiedReport={unifiedReport}
              rawSources={rawSources}
              handleExport={handleExport}
              claims={claims}
              jobId={currentJobId || undefined}
              onDiveDeeper={openDiveModalFromClaim}
            />
          </>
        )}
      </div>

      {/* DIVE DEEPER MODAL */}
      {diveModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[100] print:hidden backdrop-blur-sm">
          <div className="w-full max-w-lg border border-white/10 bg-zinc-950/90 rounded-xl p-6 glass-panel">
            <div className="text-sm text-white font-semibold mb-2">Dive deeper</div>
            <div className="text-xs text-white/70 mb-5 line-clamp-3 bg-white/5 p-2 rounded">{diveModal.seedText}</div>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs text-white/70 flex flex-col gap-1">
                Depth
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={diveDepth}
                  onChange={(e) => setDiveDepth(Number(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white glass-input"
                />
              </label>

              <label className="text-xs text-white/70 flex flex-col gap-1">
                Breadth
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={diveBreadth}
                  onChange={(e) => setDiveBreadth(Number(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white glass-input"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDiveModal({ open: false })}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={doDive}
                className="px-4 py-2 rounded-lg bg-cyan-600/30 border border-cyan-400/20 text-cyan-200 text-sm disabled:opacity-50 hover:bg-cyan-600/50 transition-colors font-semibold shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              >
                {busy ? 'Working…' : 'Run dive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
