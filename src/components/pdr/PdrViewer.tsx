// ============================================================================
// FILE: src/components/pdr/PdrViewer.tsx
// ============================================================================
'use client';

import { useState } from 'react';
import { Claim } from '@/types/research';
import { ChevronRight, ExternalLink, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

interface PdrViewerProps {
  claims: Claim[];
}

export default function PdrViewer({ claims }: PdrViewerProps) {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'supported': return <ShieldCheck size={14} className="text-cyan-400" />;
      case 'refuted': return <ShieldAlert size={14} className="text-red-400" />;
      default: return <ShieldQuestion size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="w-full pb-10">
      {claims.map((claim) => {
        const isSelected = selectedClaimId === claim.id;
        
        return (
          <div 
            key={claim.id}
            className={`border-b border-white/5 transition-colors ${isSelected ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
          >
            {/* Claim Header (Click to Expand) */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setSelectedClaimId(isSelected ? null : claim.id)}
            >
              <div className="flex items-start gap-3">
                 <div className="mt-0.5">{getVerdictIcon(claim.verdict)}</div>
                 <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed font-light">{claim.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className={`text-[10px] font-bold tracking-wider uppercase ${
                          claim.verdict === 'supported' ? 'text-cyan-500' : 
                          claim.verdict === 'refuted' ? 'text-red-500' : 'text-gray-500'
                       }`}>
                         {claim.verdict}
                       </span>
                       <span className="text-[10px] font-mono text-gray-600">
                         {Math.round(claim.confidence * 100)}% CONFIDENCE
                       </span>
                    </div>
                 </div>
                 <ChevronRight size={14} className={`text-gray-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Evidence Drawer */}
            {isSelected && (
              <div className="bg-black/40 px-4 pb-4 space-y-2 border-t border-white/5 shadow-inner">
                 <div className="sticky top-0 bg-[#0c0c0c] z-10 py-2 border-b border-white/5 mb-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase">Supporting Evidence</h4>
                 </div>
                 
                 {claim.evidence.map((ev) => (
                    <a 
                      key={ev.documentId}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                         <h5 className="text-xs font-medium text-cyan-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                           {ev.title || ev.url}
                         </h5>
                         <ExternalLink size={10} className="text-gray-600 group-hover:text-cyan-400" />
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mb-2">
                        {ev.text}
                      </p>
                      <div className="flex items-center gap-2">
                        {/* Visual Confidence Bar */}
                        <div className="flex-1 h-1 bg-black rounded-full overflow-hidden">
                           <div 
                             className={`h-full ${ev.supportStatus === 'pro' ? 'bg-cyan-500' : 'bg-amber-500'}`} 
                             style={{ width: `${ev.confidenceScore * 100}%` }} 
                           />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500">{Math.round(ev.confidenceScore * 100)}%</span>
                      </div>
                    </a>
                 ))}

                 {claim.evidence.length === 0 && (
                   <div className="text-xs text-gray-600 italic py-4 text-center">
                     No direct evidence found via open web search.
                   </div>
                 )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
