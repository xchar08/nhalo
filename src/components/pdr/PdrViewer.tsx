'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronRight, ExternalLink, Search, Tag } from 'lucide-react';
import { Claim } from '@/types/research'; // Import the original type
import { createClient } from '@/lib/supabase/client';

// NEW: Interface for Ontology Tag
interface OntologyTag {
  id: string;
  label: string;
  type: 'concept' | 'entity';
  category: string;
  confidence: number;
}

// FIX: Safely extend Claim type to include 'analysis' without breaking 'verdict'
type ExtendedClaim = Claim & {
  analysis?: string;
};

interface Props {
  claims: Claim[];
  onDiveDeeper?: (claim: Claim) => void;
  jobId?: string; 
}

// FIX: Changed from 'export default function' to 'export function'
export function PdrViewer({ claims, onDiveDeeper, jobId }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // NEW: State for tags
  const [tags, setTags] = useState<OntologyTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!jobId) {
      setTags([]);
      return;
    }

    async function fetchTags() {
      setLoadingTags(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('taggings')
        .select(`confidence, concepts (label, scheme), entities (name, type)`)
        .eq('target_id', jobId);

      if (error) {
        console.error('Error fetching tags:', error);
        setLoadingTags(false);
        return;
      }

      const fetchedTags: OntologyTag[] = (data || []).map((row: any, i: number) => {
        if (row.concepts) {
          return {
            id: `concept-${i}`,
            label: row.concepts.label,
            type: 'concept',
            category: row.concepts.scheme,
            confidence: row.confidence
          };
        } else if (row.entities) {
          return {
            id: `entity-${i}`,
            label: row.entities.name,
            type: 'entity',
            category: row.entities.type,
            confidence: row.confidence
          };
        }
        return null;
      }).filter(Boolean) as OntologyTag[];

      setTags(fetchedTags);
      setLoadingTags(false);
    }

    fetchTags();
  }, [jobId]);

  const getTagColor = (tag: OntologyTag) => {
    if (tag.type === 'entity') return 'bg-purple-900/40 text-purple-200 border-purple-500/30';
    if (tag.category === 'health') return 'bg-rose-900/40 text-rose-200 border-rose-500/30';
    if (tag.category === 'tech') return 'bg-blue-900/40 text-blue-200 border-blue-500/30';
    if (tag.category === 'politics') return 'bg-orange-900/40 text-orange-200 border-orange-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-600';
  };

  return (
    <div className="flex flex-col gap-2 p-4 pb-20 text-gray-200">
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 border-b border-white/10 pb-4">
           {tags.map(tag => (
             <span key={tag.id} className={`text-[10px] px-2 py-0.5 rounded border ${getTagColor(tag)} uppercase tracking-wider flex items-center gap-1`}>
               <Tag size={10} className="opacity-50" />
               {tag.label}
             </span>
           ))}
        </div>
      )}

      {(claims || []).map((rawClaim, i) => {
        // Cast to ExtendedClaim to access 'analysis' without error
        const c = rawClaim as ExtendedClaim;
        
        const claimId = c.id || `claim-${i}`;
        const isExp = expanded[claimId] || false;
        const confidence = Math.round((c.confidence || 0) * 100);

        return (
          <div
            key={claimId}
            className="flex flex-col bg-white/5 border border-white/5 rounded hover:border-white/20 transition-all overflow-hidden"
          >
            <div
              className="flex gap-3 p-3 cursor-pointer items-start"
              onClick={() => toggle(claimId)}
            >
              <div className="mt-1 text-gray-500">
                {isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              
              <div className="flex-1">
                <div className="text-xs text-gray-200 leading-snug font-medium">
                  {c.text}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold
                    ${c.verdict === 'supported' ? 'bg-emerald-500/20 text-emerald-400' : 
                      c.verdict === 'refuted' ? 'bg-red-500/20 text-red-400' : 
                      'bg-yellow-500/20 text-yellow-400'}`
                  }>
                    {c.verdict || 'Unknown'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    CONF: {confidence}%
                  </div>
                </div>
              </div>
            </div>

            {isExp && (
              <div className="bg-black/20 p-3 border-t border-white/5 animate-in slide-in-from-top-2 duration-150">
                {c.analysis && (
                   <div className="prose prose-invert prose-xs max-w-none text-gray-400 mb-3">
                     <ReactMarkdown>{c.analysis}</ReactMarkdown>
                   </div>
                )}

                <div className="space-y-2">
                   {(c.evidence || []).map((ev: any, j: number) => (
                     <a 
                       key={j} 
                       href={ev.url} 
                       target="_blank"
                       rel="noreferrer"
                       className="block p-2 rounded bg-white/5 hover:bg-white/10 transition-colors group"
                     >
                        <div className="text-[10px] text-cyan-400 font-bold truncate group-hover:underline flex items-center gap-1">
                           {ev.title || 'Source'} <ExternalLink size={8} />
                        </div>
                        <div className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">
                           {ev.snippet}
                        </div>
                     </a>
                   ))}
                </div>

                {onDiveDeeper && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiveDeeper(c);
                    }}
                    className="mt-3 w-full py-1.5 flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/20 transition-all"
                  >
                    <Search size={10} />
                    VERIFY DEEPER
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {claims.length === 0 && (
         <div className="text-center text-xs text-gray-600 py-10 italic">
           No claims extracted yet...
         </div>
      )}
    </div>
  );
}

// Also keep default export just in case other files use it
export default PdrViewer;
