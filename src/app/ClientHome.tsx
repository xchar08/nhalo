// ============================================================================
// FILE: src/app/ClientHome.tsx
// ============================================================================
'use client';

import { useState, useMemo, useEffect } from 'react';
import ForceGraph from '@/components/visualizer/ForceGraph';
import PdrViewer from '@/components/pdr/PdrViewer';
import SmartDigest from '@/components/feed/SmartDigest';
import StarField from '@/components/visualizer/StarField';
import GalaxyLogo from '@/components/visualizer/GalaxyLogo';
import { analyzePdrAction, getKnowledgeFeed } from './actions/analyze-pdr';
import { getUserHistory, saveResearchSession, deleteResearchSession, wipeUserHistory, ResearchProject } from './actions/history';
import { Claim } from '@/types/research';
import { GraphNode, GraphLink } from '@/types/graph';
import { Sparkles, ArrowRight, Command, History, LogIn, User, Layers, Trash2, AlertTriangle, X, Check, FileText, Globe, Share, Download, Newspaper, Cpu } from 'lucide-react'; 
import { createClient } from '@/lib/supabase/client'; 
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 

export default function ClientHome() {
  const [mode, setMode] = useState<'input' | 'analysis' | 'feed'>('input');
  const [inputText, setInputText] = useState('');
  const [deepMode, setDeepMode] = useState(false);
  const [breadth, setBreadth] = useState(3); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [unifiedReport, setUnifiedReport] = useState("");
  const [rawSources, setRawSources] = useState<any[]>([]);
  const [knowledgeFeed, setKnowledgeFeed] = useState<any[]>([]);
  const [viewTab, setViewTab] = useState<'graph' | 'report' | 'sources'>('graph');
  const [history, setHistory] = useState<ResearchProject[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const res = await getUserHistory();
        if (res.success) setHistory(res.projects);
      }
    };
    init();
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    if (user) {
        await saveResearchSession(inputText);
        const res = await getUserHistory();
        if (res.success) setHistory(res.projects);
    }
    try {
      const result = await analyzePdrAction(inputText, deepMode, breadth);
      if (result.success) {
        setClaims(result.claims || []);
        setUnifiedReport(result.unifiedReport || "");
        setRawSources(result.sources || []);
        setMode('analysis'); 
        setViewTab('graph');
      }
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  const loadHistoryItem = (q: string) => { setInputText(q); setMode('input'); };
  const handleDeleteItem = async (e: any, id: string) => { e.stopPropagation(); setHistory(p => p.filter(h => h.id !== id)); await deleteResearchSession(id); };
  const handleWipeHistory = async () => { setShowWipeConfirm(false); setHistory([]); await wipeUserHistory(); };

  const loadFeed = async () => {
      setMode('feed');
      if (knowledgeFeed.length === 0) {
          const res = await getKnowledgeFeed();
          if (res.success) setKnowledgeFeed(res.feed);
      }
  };

  const handleExport = (format: 'markdown' | 'html' | 'pdf') => {
      if (format === 'pdf') { window.print(); return; }
      const content = format === 'markdown' ? unifiedReport : `<html><body><pre>${unifiedReport}</pre></body></html>`;
      const blob = new Blob([content], { type: format === 'html' ? 'text/html' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-report.${format === 'markdown' ? 'md' : 'html'}`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const { nodes, links } = useMemo(() => {
    if (claims.length === 0) return { nodes: [], links: [] };
    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];
    const addedDocIds = new Set<string>();
    claims.forEach(claim => {
      graphNodes.push({ id: claim.id, label: claim.text.slice(0, 25) + '...', confidence: claim.confidence || 0.5, isStarred: false, isRead: true, domain: claim.domain, tags: claim.tags, degree: claim.evidence.length, type: 'claim' });
      claim.evidence.forEach(ev => {
        const nodeId = ev.url || ev.documentId; 
        if (!addedDocIds.has(nodeId)) {
          graphNodes.push({ id: nodeId, label: ev.title || ev.url.slice(0, 20), confidence: ev.confidenceScore || 0.5, isStarred: false, isRead: false, domain: claim.domain, tags: [], degree: 1, type: 'document' });
          addedDocIds.add(nodeId);
        }
        graphLinks.push({ source: claim.id, target: nodeId, strength: ev.confidenceScore || 0.5 });
      });
    });
    return { nodes: graphNodes, links: graphLinks };
  }, [claims]);

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden font-sans relative bg-[#020203] print:bg-white print:h-auto print:overflow-visible">
      <StarField />
      
      {/* HEADER - HIDDEN IN PRINT */}
      <header className="h-14 flex shrink-0 items-center px-6 justify-between z-50 relative border-b border-white/5 bg-[#020203]/80 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => setMode('input')}>
           <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
           <h1 className="font-bold text-xs tracking-[0.25em] text-gray-100">HALO /// RESEARCH</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10">
                <button onClick={() => setMode('input')} className={`px-3 py-1 text-[10px] rounded ${mode === 'input' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>RESEARCH</button>
                <button onClick={loadFeed} className={`px-3 py-1 text-[10px] rounded ${mode === 'feed' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>KNOWLEDGE FEED</button>
                {claims.length > 0 && <button onClick={() => setMode('analysis')} className={`px-3 py-1 text-[10px] rounded ${mode === 'analysis' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>ANALYSIS</button>}
            </div>
            {mode === 'analysis' && (
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/10">
                    <button onClick={() => setViewTab('graph')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${viewTab === 'graph' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>GRAPH</button>
                    <button onClick={() => setViewTab('report')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${viewTab === 'report' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>REPORT</button>
                    <button onClick={() => setViewTab('sources')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${viewTab === 'sources' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>SOURCES</button>
                </div>
            )}
        </div>
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10"><User size={10} /> <span>{user.email}</span></div>
            ) : (
                <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded"><LogIn size={10} /> <span>LOGIN</span></button>
            )}
        </div>
      </header>

      <div className="flex-1 relative w-full h-full z-10 overflow-hidden flex print:h-auto print:overflow-visible">
        
        {/* SIDEBAR - HIDDEN IN PRINT */}
        {user && mode === 'input' && (
             <div className="w-64 h-full border-r border-white/10 bg-black/40 backdrop-blur-sm hidden lg:flex flex-col z-40 relative print:hidden">
                <div className="p-4 border-b border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><History size={12} /> Project History</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {history.map(h => (
                        <div key={h.id} onClick={() => loadHistoryItem(h.query)} className="group w-full flex items-center justify-between p-2 rounded text-xs text-gray-400 hover:bg-white/5 cursor-pointer">
                            <div className="truncate flex-1 font-mono pr-2">{h.query.slice(0, 22)}...</div>
                            <button onClick={(e) => handleDeleteItem(e, h.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"><Trash2 size={10} /></button>
                        </div>
                    ))}
                </div>
                {history.length > 0 && (
                    <div className="p-3 border-t border-white/10">
                         {!showWipeConfirm ? (
                            <button onClick={() => setShowWipeConfirm(true)} className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-500 hover:text-red-400 py-2"><Trash2 size={10} /> WIPE HISTORY</button>
                         ) : (
                            <div className="flex gap-2"><button onClick={() => setShowWipeConfirm(false)} className="flex-1 bg-black/50 text-gray-400 text-[10px]">NO</button><button onClick={handleWipeHistory} className="flex-1 bg-red-900/40 text-red-200 text-[10px]">YES</button></div>
                         )}
                    </div>
                )}
             </div>
        )}

        <div className="flex-1 relative h-full overflow-hidden print:h-auto print:overflow-visible">
            
            {/* INPUT MODE */}
            {mode === 'input' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 print:hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 pointer-events-none"><GalaxyLogo /></div>
                <div className="w-full max-w-2xl relative z-30">
                    <div className="text-center mb-12"><h1 className="text-6xl font-bold tracking-tighter text-white mb-4 drop-shadow-2xl">Halo Research</h1></div>
                    <div className="relative bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden group">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5"><div className="flex items-center gap-2 text-[10px] font-mono text-gray-400"><Command size={10} /> <span>SYSTEM_READY</span></div></div>
                        <textarea className="w-full h-48 bg-black/60 text-gray-100 p-6 focus:outline-none font-mono text-sm resize-none" placeholder="// Enter project spec..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                        <div className="flex flex-wrap gap-4 justify-between items-center px-4 py-3 bg-white/5 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setDeepMode(!deepMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-mono uppercase border transition-all ${deepMode ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-transparent border-white/10 text-gray-500'}`}><Layers size={12} /> {deepMode ? 'Deep: ON' : 'Deep: OFF'}</button>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400"><span>BREADTH: {breadth}</span><input type="range" min="1" max="10" value={breadth} onChange={(e) => setBreadth(parseInt(e.target.value))} className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500" /></div>
                            </div>
                            <button onClick={handleAnalyze} disabled={isAnalyzing || !inputText} className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-200 text-black text-xs font-bold font-mono rounded disabled:opacity-50">{isAnalyzing ? <Sparkles size={12} className="animate-spin" /> : <>EXECUTE <ArrowRight size={12} /></>}</button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* FEED MODE */}
            {mode === 'feed' && (
                 <div className="absolute inset-0 overflow-y-auto bg-[#0a0a0a] p-12 flex justify-center">
                    <div className="max-w-4xl w-full">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><Newspaper className="text-cyan-400"/> Global Knowledge Feed</h2>
                        <div className="grid gap-4">
                            {knowledgeFeed.map((item, i) => (
                                <div key={i} className="p-6 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <a href={item.link} target="_blank" rel="noreferrer" className="text-lg font-bold text-gray-100 hover:text-cyan-400 transition-colors">{item.title || 'Untitled Entry'}</a>
                                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.contentSnippet}</p>
                                    <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-500 font-mono uppercase">
                                        <span>SOURCE: {item.link ? new URL(item.link).hostname.replace('www.', '') : 'RSS'}</span>
                                    </div>
                                </div>
                            ))}
                            {knowledgeFeed.length === 0 && <div className="text-center text-gray-500 py-20">Loading trusted sources...</div>}
                        </div>
                    </div>
                 </div>
            )}

            {/* ANALYSIS MODE */}
            {mode === 'analysis' && (
                <div className="absolute inset-0 flex w-full h-full bg-black print:bg-white print:relative print:block print:h-auto">

                    {/* Graph/Stream HIDDEN IN PRINT */}
                    {viewTab === 'graph' && (
                        <>
                        <div className="w-[50%] h-full border-r border-white/10 bg-black/40 relative shrink-0 print:hidden"><ForceGraph key={claims.length} nodes={nodes} links={links} onNodeSelect={(n) => console.log(n)} /></div>
                        <div className="w-[25%] h-full border-r border-white/10 bg-[#030305]/80 flex flex-col shrink-0 print:hidden">
                            <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0"><span className="text-[10px] font-bold text-gray-400 uppercase">Analysis Stream</span></div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar"><PdrViewer claims={claims} /></div>
                        </div>
                        <div className="w-[25%] h-full bg-[#020203] flex flex-col shrink-0 print:hidden"><SmartDigest /></div>
                        </>
                    )}

                    {viewTab === 'report' && (
                        <div className="w-full h-full overflow-y-auto bg-[#0a0a0a] p-12 flex justify-center print:bg-white print:p-0 print:overflow-visible">
                            <div className="max-w-3xl w-full print:max-w-none">
                                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 print:border-black/20">
                                    <h2 className="text-2xl font-bold text-white print:text-black">Research Report</h2>
                                    <div className="flex gap-2 print:hidden">
                                        <button onClick={() => handleExport('markdown')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300"><Download size={12} /> MD</button>
                                        <button onClick={() => handleExport('html')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300"><Download size={12} /> HTML</button>
                                        <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs"><FileText size={12} /> PDF</button>
                                    </div>
                                </div>
                                
                                {/* MARKDOWN RENDERING WITH CUSTOM TECH CARDS */}
                                <div className="prose prose-invert prose-sm max-w-none print:prose-black">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            a: (props) => <a {...props} className="text-cyan-400 hover:underline print:text-blue-600 print:no-underline" target="_blank" rel="noopener noreferrer" />,
                                            code: (props) => {
                                                const { children, className, ...rest } = props;
                                                const isInline = !String(children).includes('\n');
                                                return isInline 
                                                    ? <code {...rest} className="bg-white/10 px-1 py-0.5 rounded text-cyan-300 text-[0.9em] font-mono print:bg-gray-100 print:text-black">{children}</code>
                                                    : <code {...rest} className="block bg-black/40 p-4 rounded border border-white/10 overflow-x-auto text-xs font-mono my-2 text-gray-300 print:bg-gray-50 print:text-black print:border-gray-200">{children}</code>;
                                            },
                                            h1: (props) => <h1 {...props} className="text-3xl font-bold text-white mb-4 border-b border-white/10 pb-2 print:text-black print:border-black" />,
                                            h2: (props) => <h2 {...props} className="text-2xl font-bold text-gray-100 mt-8 mb-3 print:text-black" />,
                                            h3: (props) => <h3 {...props} className="text-xl font-bold text-gray-200 mt-6 mb-2 print:text-black" />,
                                            p: (props) => <p {...props} className="text-gray-300 leading-relaxed mb-4 print:text-black" />,
                                            
                                            // FIXED CUSTOM LI RENDERER
                                            li: (props) => {
                                                const { children, ...rest } = props;
                                                const content = String(children);
                                                
                                                // Check if this list item contains our special marker
                                                if (content.includes('🔹')) {
                                                    return (
                                                        <li className="list-none my-3">
                                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/40 transition-all print:bg-blue-50 print:border-blue-200">
                                                                <Cpu className="w-4 h-4 text-cyan-400 mt-1 shrink-0 print:text-blue-600" />
                                                                <div className="text-sm text-gray-200 print:text-gray-800 leading-relaxed">
                                                                    {children}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    );
                                                }
                                                return <li {...rest} className="text-gray-300 print:text-black">{children}</li>;
                                            },
                                            ul: (props) => <ul {...props} className="list-disc list-inside text-gray-300 space-y-1 mb-4 ml-4 print:text-black" />,
                                            ol: (props) => <ol {...props} className="list-decimal list-inside text-gray-300 space-y-1 mb-4 ml-4 print:text-black" />,
                                            blockquote: (props) => <blockquote {...props} className="border-l-2 border-cyan-500 pl-4 italic text-gray-400 my-4 print:text-gray-700 print:border-blue-500" />
                                        }}
                                    >
                                        {unifiedReport}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewTab === 'sources' && (
                        <div className="w-full h-full overflow-y-auto bg-[#0a0a0a] p-12 flex justify-center print:hidden">
                            <div className="max-w-4xl w-full">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Globe size={18}/> Source Registry</h2>
                                <div className="grid gap-4">
                                    {rawSources.map((s, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded border border-white/5 hover:border-cyan-500/30 transition-colors">
                                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm font-bold break-all flex items-center gap-2">{s.title} <Share size={10}/></a>
                                            <div className="text-xs text-gray-500 font-mono mt-1">{s.url}</div>
                                            <div className="text-sm text-gray-300 mt-2 leading-relaxed">{s.snippet}</div>
                                            <div className="mt-2 flex gap-2"><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">Score: {Math.round(s.score * 100)}%</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
