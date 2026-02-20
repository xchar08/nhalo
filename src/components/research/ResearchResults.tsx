'use client';

import {
  Share,
  Download,
  Copy,
  FileText,
  ExternalLink,
  Globe,
  Newspaper,
  Rss,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import ForceGraph from '@/components/visualizer/ForceGraph';
import { PdrViewer } from '@/components/pdr/PdrViewer';
import SmartDigest from '@/components/feed/SmartDigest';
import { GraphNode, GraphLink } from '@/types/graph';
import { Claim } from '@/types/research';

// Dynamic import for the editor to avoid SSR issues with latex.js
const LatexEditor = dynamic(() => import('./LatexEditor'), { ssr: false });

interface ResearchResultsProps {
  viewTab: 'graph' | 'report' | 'sources';
  graphNodes: GraphNode[];
  graphLinks: GraphLink[];
  onNodeSelect?: (node: GraphNode) => void;
  unifiedReport: string;
  rawSources: any[];
  handleExport: (format: 'markdown' | 'html' | 'pdf') => void;
  claims: Claim[];
  jobId?: string;
  onDiveDeeper: (claim: Claim) => void;
}

export default function ResearchResults({
  viewTab,
  graphNodes,
  graphLinks,
  onNodeSelect,
  unifiedReport,
  rawSources,
  handleExport,
  claims,
  jobId,
  onDiveDeeper,
}: ResearchResultsProps) {
  
  const [showLatexEditor, setShowLatexEditor] = useState(false);
  const [latexSource, setLatexSource] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchLatex = async () => {
     if (!jobId) return;
     try {
       const { downloadResearchReportAction } = await import('@/app/actions/report-actions');
       const res = await downloadResearchReportAction(jobId, 'job');
       if (res.success && res.latex) {
         setLatexSource(res.latex);
         setShowLatexEditor(true);
       } else {
         alert('Failed to load LaTeX source');
       }
     } catch (e) {
       console.error(e);
       alert('Error loading report');
     }
  };

  return (
    <div className="absolute inset-0 flex w-full h-full bg-black print:bg-white print:relative print:block print:h-auto">
      
      {/* Main Content Area */}
      <div className="flex-1 h-full relative bg-black/40 print:hidden flex flex-col overflow-hidden border-r border-white/10">
        
        {viewTab === 'graph' && (
           <div className="w-full h-full relative">
             <div className="absolute top-4 left-4 z-10 glass-panel p-2 rounded text-[10px] text-gray-400 max-w-md pointer-events-none">
               <p>Scroll to Zoom • Drag to Pan • Click Nodes to Expand</p>
             </div>
             <ForceGraph 
               nodes={graphNodes} 
               links={graphLinks} 
               onNodeSelect={onNodeSelect} 
             />
           </div>
        )}

        {viewTab === 'report' && (
          <div className="w-full h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                 <h2 className="text-2xl font-bold text-white">Research Report</h2>
                 <div className="flex gap-2 print:hidden relative">
                    <div className="relative">
                      <button
                         onClick={() => setShowExportMenu(!showExportMenu)}
                         className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors border border-white/10"
                      >
                        <Download size={12} /> Export <ChevronDown size={12} />
                      </button>
                      
                      {showExportMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                          <div className="absolute right-0 mt-2 w-32 bg-[#252525] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                            <button onClick={() => { handleExport('markdown'); setShowExportMenu(false); }} className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors">Markdown (.md)</button>
                            <button onClick={() => { handleExport('html'); setShowExportMenu(false); }} className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors">HTML Export</button>
                            <button onClick={() => { handleExport('pdf'); setShowExportMenu(false); }} className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors">PDF (Print)</button>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                       onClick={fetchLatex}
                       disabled={!jobId}
                       className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-900/20 hover:bg-cyan-900/40 text-xs text-cyan-200 transition-colors border border-cyan-500/30 disabled:opacity-50"
                    >
                      <FileText size={12} /> Edit LaTeX
                    </button>
                 </div>
              </div>

              <div className="prose prose-invert prose-cyan max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {unifiedReport || '_Generating report..._'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {viewTab === 'sources' && (
          <div className="w-full h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Globe size={18} /> Source Registry
              </h2>
              {rawSources.length === 0 && (
                <div className="text-gray-500 italic">No sources cited yet.</div>
              )}
              {rawSources.map((s: any, i: number) => (
                <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <a 
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-gray-200 mb-1 hover:text-cyan-400 block transition-colors"
                      >
                        {s.title || 'Untitled Source'}
                      </a>
                      <div className="text-xs text-cyan-400 font-mono mb-2 truncate max-w-xl opacity-70">{s.url}</div>
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{s.snippet || s.content}</p>
                       <div className="mt-2 text-[10px] bg-white/5 inline-block px-2 py-0.5 rounded text-gray-500">
                          Score: {Math.round((s.score ?? 0) * 100)}%
                       </div>
                    </div>
                    {s.url && (
                      <a 
                        href={s.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-black/40 rounded hover:text-white text-gray-400 transition-colors shrink-0"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stream (25%) */}
      <div className="w-[25%] h-full border-r border-white/10 bg-[#030305]/80 flex flex-col shrink-0 print:hidden glass-panel border-y-0 border-r-0 rounded-none">
         <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase">Analysis Stream</span>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <PdrViewer 
              claims={claims} 
              onDiveDeeper={onDiveDeeper} 
              jobId={jobId} 
            />
         </div>
      </div>

      {/* Feed (25%) */}
      <div className="w-[25%] h-full bg-[#020203] flex flex-col shrink-0 print:hidden glass-panel border-y-0 border-r-0 rounded-none">
         <SmartDigest />
      </div>

      {/* LaTeX Editor Modal */}
      {showLatexEditor && (
        <LatexEditor 
          initialLatex={latexSource} 
          onClose={() => setShowLatexEditor(false)} 
        />
      )}

    </div>
  );
}

