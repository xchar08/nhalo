'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  askResearchContextAction,
  askFeedContextAction,
  askBranchContextAction,
} from '@/app/actions/analyze-pdr';

interface ResearchChatProps {
  mode: 'analysis' | 'feed';
  branchIds?: string[];
}

export default function ResearchChat({ mode, branchIds }: ResearchChatProps) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('latest');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      let res: any;

      if (mode === 'feed') {
        res = await askFeedContextAction(query);
      } else {
        if (activeContext.startsWith('branch:')) {
          const branchId = activeContext.replace('branch:', '');
          res = await askBranchContextAction(branchId, query);
        } else {
          res = await askResearchContextAction(query);
        }
      }

      if (res?.success) setAnswer(res.answer);
      else setAnswer(`Error: ${res?.answer || res?.error || 'Unknown failure'}`);
    } catch {
      setAnswer('Failed to contact agent.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg z-50 transition-all hover:scale-110"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] z-50 flex flex-col items-end animate-in slide-in-from-bottom-5 fade-in duration-200">
      <button onClick={() => setIsOpen(false)} className="mb-2 mr-2 text-xs text-gray-500 hover:text-white transition-colors">
        Close Chat
      </button>

      <div className="w-full bg-[#050505] border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-4 glass-panel">
        <div className="flex items-center justify-between gap-2 text-cyan-400 text-xs font-mono uppercase border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Bot size={14} />
            <span>{mode === 'feed' ? 'News Assistant' : 'Research Assistant'}</span>
          </div>

          {mode === 'analysis' && (
            <select
              value={activeContext}
              onChange={(e) => setActiveContext(e.target.value)}
              className="bg-black border border-white/10 text-gray-200 text-[10px] rounded px-2 py-1 focus:outline-none focus:border-cyan-500/50"
              title="Select chat context"
            >
              <option value="latest">Latest Context</option>
              <option value="rootContext">Root Context</option>
              {(branchIds || []).map((b) => (
                <option key={b} value={`branch:${b}`}>
                  Context {b.slice(0, 14)}
                </option>
              ))}
            </select>
          )}
        </div>

        {answer && (
          <div className="bg-white/5 p-3 rounded text-sm text-gray-300 max-h-[220px] overflow-y-auto leading-relaxed border border-white/5 custom-scrollbar">
            {answer}
          </div>
        )}

        <form onSubmit={handleAsk} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'feed' ? 'Ask about latest news...' : 'Ask about the findings...'}
            disabled={loading}
            className="w-full bg-black border border-white/10 text-gray-100 pl-4 pr-10 py-2.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-gray-600 glass-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 p-1 text-cyan-500 hover:text-white disabled:opacity-50 transition-colors"
          >
            {loading ? <Sparkles size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
}
