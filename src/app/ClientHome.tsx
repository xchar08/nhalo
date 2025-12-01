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
import { analyzePdrAction } from './actions/analyze-pdr';
import { getUserHistory, saveResearchSession, deleteResearchSession, wipeUserHistory, ResearchProject } from './actions/history';
import { Claim } from '@/types/research';
import { GraphNode, GraphLink } from '@/types/graph';
import { Sparkles, ArrowRight, Command, History, LogIn, User, Layers, Trash2, AlertTriangle, X, Check } from 'lucide-react'; 
import { createClient } from '@/lib/supabase/client'; 
import { useRouter } from 'next/navigation';

export default function ClientHome() {
  const [mode, setMode] = useState<'input' | 'analysis'>('input');
  const [inputText, setInputText] = useState('');
  const [deepMode, setDeepMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [history, setHistory] = useState<ResearchProject[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Wipe Confirmation State
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
      const result = await analyzePdrAction(inputText, deepMode);
      if (result.success && result.claims && result.claims.length > 0) {
        setClaims(result.claims);
        setMode('analysis'); 
      }
    } catch (e) {
      console.error("Analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistoryItem = (query: string) => {
      setInputText(query);
      setMode('input');
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      // Optimistic update
      setHistory(prev => prev.filter(h => h.id !== id));
      await deleteResearchSession(id);
  };

  const handleWipeHistory = async () => {
      setShowWipeConfirm(false);
      setHistory([]); // Clear UI immediately
      await wipeUserHistory();
  };

  const { nodes, links } = useMemo(() => {
    if (claims.length === 0) return { nodes: [], links: [] };
    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];
    const addedDocIds = new Set<string>();
    
    claims.forEach(claim => {
      graphNodes.push({
        id: claim.id, 
        label: claim.text.slice(0, 25) + '...', 
        confidence: claim.confidence || 0.5,
        isStarred: false, isRead: true, domain: claim.domain, tags: claim.tags, degree: claim.evidence.length, type: 'claim'
      });
      claim.evidence.forEach(ev => {
        const nodeId = ev.url || ev.documentId; 
        if (!addedDocIds.has(nodeId)) {
          graphNodes.push({
            id: nodeId, label: ev.title || ev.url.slice(0, 20), confidence: ev.confidenceScore || 0.5,
            isStarred: false, isRead: false, domain: claim.domain, tags: [], degree: 1, type: 'document'
          });
          addedDocIds.add(nodeId);
        }
        graphLinks.push({ source: claim.id, target: nodeId, strength: ev.confidenceScore || 0.5 });
      });
    });
    return { nodes: graphNodes, links: graphLinks };
  }, [claims]);

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden font-sans relative bg-[#020203]">
      <StarField />
      
      <header className="h-14 flex shrink-0 items-center px-6 justify-between z-50 relative border-b border-white/5 bg-[#020203]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => setMode('input')}>
           <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
           <h1 className="font-bold text-xs tracking-[0.25em] text-gray-100">
             HALO <span className="text-gray-600 mx-1">///</span> RESEARCH
           </h1>
        </div>
        
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <User size={10} />
                    <span>{user.email}</span>
                </div>
            ) : (
                <button 
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded hover:bg-cyan-900/30 transition-colors"
                >
                    <LogIn size={10} />
                    <span>LOGIN TO SAVE</span>
                </button>
            )}
        </div>
      </header>

      <div className="flex-1 relative w-full h-full z-10 overflow-hidden flex">
        
        {user && mode === 'input' && (
            <div className="w-64 h-full border-r border-white/10 bg-black/40 backdrop-blur-sm hidden lg:flex flex-col z-40 relative">
                <div className="p-4 border-b border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <History size={12} /> Project History
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {history.map((h) => (
                        <div 
                            key={h.id}
                            className="group w-full flex items-center justify-between p-2 rounded text-xs text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
                            onClick={() => loadHistoryItem(h.query)}
                        >
                            <div className="truncate flex-1 font-mono pr-2">
                                {h.query.slice(0, 22)}{h.query.length > 22 ? '...' : ''}
                                <div className="text-[9px] text-gray-600 mt-0.5">{new Date(h.created_at).toLocaleDateString()}</div>
                            </div>
                            
                            <button
                                onClick={(e) => handleDeleteItem(e, h.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-600 hover:text-red-400 hover:bg-white/10 rounded transition-all"
                                title="Delete"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="p-4 text-center text-[10px] text-gray-600 italic">No past research found.</div>
                    )}
                </div>

                {/* WIPE HISTORY SECTION */}
                {history.length > 0 && (
                    <div className="p-3 border-t border-white/10">
                        {!showWipeConfirm ? (
                            <button 
                                onClick={() => setShowWipeConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-500 hover:text-red-400 hover:bg-red-950/20 py-2 rounded transition-all font-mono"
                            >
                                <Trash2 size={10} /> WIPE HISTORY
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2 bg-red-950/10 p-2 rounded border border-red-900/30">
                                <div className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                                    <AlertTriangle size={10} /> Are you sure?
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowWipeConfirm(false)}
                                        className="flex-1 flex items-center justify-center py-1 bg-black/50 text-gray-400 text-[10px] rounded hover:text-white"
                                    >
                                        <X size={10} /> NO
                                    </button>
                                    <button 
                                        onClick={handleWipeHistory}
                                        className="flex-1 flex items-center justify-center py-1 bg-red-900/40 text-red-200 text-[10px] rounded hover:bg-red-800/60"
                                    >
                                        <Check size={10} /> YES
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        <div className="flex-1 relative h-full overflow-hidden">
            
            {mode === 'input' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 pointer-events-none">
                <GalaxyLogo />
                </div>

                <div className="w-full max-w-2xl relative z-30">
                    <div className="text-center mb-12">
                        <h1 className="text-6xl font-bold tracking-tighter text-white mb-4 drop-shadow-2xl">Halo Research</h1>
                        <div className="flex items-center justify-center gap-4 text-xs font-mono text-cyan-500/70 tracking-widest uppercase">
                            <span>Illuminating Intelligence</span>
                            <span className="w-1 h-1 bg-current rounded-full"/>
                            <span>Graph Reasoning</span>
                        </div>
                    </div>

                    <div className="relative bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                                <Command size={10} />
                                <span>SYSTEM_READY</span>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-48 bg-black/60 text-gray-100 p-6 focus:outline-none font-mono text-sm resize-none leading-relaxed placeholder:text-gray-600"
                            placeholder="// Enter project spec, research claims, or paste a PDR..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            spellCheck={false}
                        />
                        <div className="flex justify-between items-center px-4 py-3 bg-white/5 border-t border-white/5">
                            
                            <button 
                                onClick={() => setDeepMode(!deepMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all ${
                                    deepMode 
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                                    : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <Layers size={12} />
                                {deepMode ? 'Deep Research: ON' : 'Deep Research: OFF'}
                            </button>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !inputText}
                                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-200 text-black text-xs font-bold font-mono rounded transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? <Sparkles size={12} className="animate-spin" /> : <>EXECUTE <ArrowRight size={12} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {mode === 'analysis' && (
                <div className="absolute inset-0 flex w-full h-full bg-black">
                    <div className="w-[50%] h-full border-r border-white/10 bg-black/40 relative shrink-0">
                        <ForceGraph key={claims.length} nodes={nodes} links={links} onNodeSelect={(n) => console.log(n)} />
                        <button onClick={() => setMode('input')} className="absolute top-4 left-4 bg-black/50 border border-white/10 text-white px-3 py-1 rounded text-xs hover:bg-white/10">← BACK</button>
                    </div>
                    <div className="w-[25%] h-full border-r border-white/10 bg-[#030305]/80 backdrop-blur-sm flex flex-col shrink-0">
                         <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analysis Stream</span>
                         </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative"><PdrViewer claims={claims} /></div>
                    </div>
                    <div className="w-[25%] h-full bg-[#020203] flex flex-col shrink-0"><SmartDigest /></div>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
