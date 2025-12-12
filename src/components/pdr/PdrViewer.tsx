// ============================================================================
// FILE: src/components/pdr/PdrViewer.tsx
// ============================================================================
'use client';
import React, { useState } from 'react';
import { Claim, EvidenceItem } from '@/types/research';
import { CheckCircle2, HelpCircle, XCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

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
        <ClaimCard key={claim.id} claim={claim} />
      ))}
    </div>
  );
};

const ClaimCard = ({ claim }: { claim: Claim }) => {
  const [expanded, setExpanded] = useState(false);
  const evidence = claim.evidence || [];
  const visibleEvidence = evidence.slice(0, 3);
  const hiddenEvidence = evidence.slice(3);

  // Calculate colors based on verdict/confidence
  const statusColor = 
    claim.verdict === 'supported' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    claim.verdict === 'refuted' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
    'text-amber-400 border-amber-500/30 bg-amber-500/10';

  return (
    <div className="border-b border-white/10 p-4 hover:bg-white/5 transition-colors group relative overflow-hidden">
      
      {/* BACKGROUND GLOW based on confidence (The "Cool Factor") */}
      <div 
        className="absolute top-0 right-0 w-1 h-full transition-all duration-1000"
        style={{ 
            backgroundColor: claim.verdict === 'supported' ? '#34d399' : claim.verdict === 'refuted' ? '#f87171' : '#fbbf24',
            opacity: claim.confidence * 0.8,
            boxShadow: `0 0 ${claim.confidence * 20}px ${claim.verdict === 'supported' ? '#34d399' : claim.verdict === 'refuted' ? '#f87171' : '#fbbf24'}`
        }}
      />

      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="mt-0.5 shrink-0">
          {claim.verdict === 'supported' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {claim.verdict === 'refuted' && <XCircle size={16} className="text-red-400" />}
          {(claim.verdict === 'debated' || claim.verdict === 'unknown') && <HelpCircle size={16} className="text-amber-400" />}
        </div>
        
        <div className="flex-1">
          <h4 className="text-xs font-medium text-gray-200 leading-relaxed font-mono">
            {claim.text}
          </h4>
          
          <div className="flex items-center gap-3 mt-3">
             {/* VERDICT BADGE */}
            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border ${statusColor}`}>
              {claim.verdict}
            </span>

            {/* TRUST METER VISUALIZATION */}
            <div className="flex items-center gap-2 flex-1 max-w-[120px]" title={`Confidence: ${Math.round(claim.confidence * 100)}%`}>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                            claim.confidence > 0.8 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 
                            claim.confidence > 0.5 ? 'bg-amber-400' : 
                            'bg-red-500'
                        }`}
                        style={{ width: `${Math.round(claim.confidence * 100)}%` }}
                    />
                </div>
                <span className="text-[9px] font-mono text-gray-500 w-8 text-right">
                    {Math.round(claim.confidence * 100)}%
                </span>
            </div>
          </div>
        </div>
      </div>

      {evidence.length > 0 && (
        <div className="pl-7 mt-2 border-l border-white/10 ml-2 space-y-2">
          {visibleEvidence.map((ev, i) => <EvidenceRow key={i} ev={ev} />)}
          {hiddenEvidence.length > 0 && expanded && (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                {hiddenEvidence.map((ev, i) => <EvidenceRow key={i + 3} ev={ev} />)}
             </div>
          )}
          {hiddenEvidence.length > 0 && (
             <button 
                onClick={() => setExpanded(!expanded)}
                className="text-[9px] text-gray-500 hover:text-cyan-400 pl-1 pt-1 flex items-center gap-1 transition-colors"
             >
                {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                {expanded ? 'Show Less' : `${hiddenEvidence.length} more sources...`}
             </button>
          )}
        </div>
      )}
    </div>
  );
};

const EvidenceRow = ({ ev }: { ev: EvidenceItem }) => (
  <div className="bg-black/20 p-2 rounded border border-white/5 text-[10px] hover:bg-black/40 transition-colors group/ev">
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
      {/* Small Confidence Dot for Source */}
      <div className="flex items-center gap-1" title="Source Relevancy">
        <div className={`w-1.5 h-1.5 rounded-full ${ev.confidenceScore > 0.7 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
        <span className="text-gray-600">{Math.round(ev.confidenceScore * 100)}%</span>
      </div>
    </div>
    <p className="text-gray-400 leading-snug line-clamp-2 group-hover/ev:text-gray-300 transition-colors">
      {ev.snippet} 
    </p>
  </div>
);

export default PdrViewer;
