// ============================================================================
// FILE: src/components/pdr/PdrViewer.tsx
// ============================================================================
import React from 'react';
import { Claim, EvidenceItem } from '@/types/research';
import { CheckCircle2, HelpCircle, XCircle, ExternalLink, ChevronRight, FileText } from 'lucide-react';

interface PdrViewerProps {
  claims: Claim[];
}

const PdrViewer: React.FC<PdrViewerProps> = ({ claims }) => {
  if (!claims || claims.length === 0) {
    return <div className="p-4 text-xs text-gray-500 italic text-center">No active analysis stream.</div>;
  }

  return (
    <div className="w-full pb-20">
      {claims.map((claim) => (
        <div key={claim.id} className="border-b border-white/10 p-4 hover:bg-white/5 transition-colors group">
          {/* Header: Verdict & Claim */}
          <div className="flex items-start gap-3 mb-3">
            <div className="mt-0.5 shrink-0">
               {claim.verdict === 'supported' && <CheckCircle2 size={16} className="text-green-400" />}
               {claim.verdict === 'refuted' && <XCircle size={16} className="text-red-400" />}
               {(claim.verdict === 'debated' || claim.verdict === 'unknown') && <HelpCircle size={16} className="text-amber-400" />}
            </div>
            
            <div className="flex-1">
               <h4 className="text-xs font-medium text-gray-200 leading-relaxed font-mono">
                 {claim.text}
               </h4>
               <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${
                      claim.verdict === 'supported' ? 'border-green-900 text-green-400 bg-green-900/20' :
                      claim.verdict === 'refuted' ? 'border-red-900 text-red-400 bg-red-900/20' :
                      'border-amber-900 text-amber-400 bg-amber-900/20'
                  }`}>
                    {claim.verdict}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono">
                    CONFIDENCE: {Math.round(claim.confidence * 100)}%
                  </span>
               </div>
            </div>
          </div>

          {/* Evidence List */}
          {claim.evidence && claim.evidence.length > 0 && (
            <div className="pl-7 mt-2 border-l border-white/10 ml-2 space-y-2">
              {claim.evidence.slice(0, 3).map((ev: EvidenceItem, i: number) => (
                <div key={i} className="bg-black/20 p-2 rounded border border-white/5 text-[10px]">
                   <div className="flex justify-between items-start mb-1">
                      <a 
                        href={ev.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-500 hover:underline flex items-center gap-1 truncate max-w-[80%]"
                      >
                        <FileText size={8} />
                        {ev.title || ev.url}
                      </a>
                      <span className="text-gray-600">{Math.round(ev.confidenceScore * 100)}%</span>
                   </div>
                   {/* UPDATED: Using 'snippet' instead of 'text' */}
                   <p className="text-gray-400 leading-snug line-clamp-2">
                      {ev.snippet} 
                   </p>
                </div>
              ))}
              {claim.evidence.length > 3 && (
                  <div className="text-[9px] text-gray-600 pl-1 pt-1 flex items-center gap-1">
                     <ChevronRight size={8} /> {claim.evidence.length - 3} more sources...
                  </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PdrViewer;
