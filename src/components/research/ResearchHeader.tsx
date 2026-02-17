'use client';

import {
  LogIn,
  User,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResearchHeaderProps {
  mode: 'input' | 'analysis' | 'feed';
  setMode: (mode: 'input' | 'analysis' | 'feed') => void;
  user: any;
  hasClaims: boolean;
  viewTab: 'graph' | 'report' | 'sources';
  setViewTab: (tab: 'graph' | 'report' | 'sources') => void;
  loadFeed: () => void;
}

export default function ResearchHeader({
  mode,
  setMode,
  user,
  hasClaims,
  viewTab,
  setViewTab,
  loadFeed,
}: ResearchHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-14 flex shrink-0 items-center px-6 justify-between z-50 relative border-b border-white/5 bg-[#020203]/80 backdrop-blur-md print:hidden">
      <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => setMode('input')}>
        <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
        <h1 className="font-bold text-xs tracking-[0.25em] text-gray-100">HALO RESEARCH</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10 glass-panel">
          <button
            onClick={() => setMode('input')}
            className={`px-3 py-1 text-[10px] rounded transition-colors ${
              mode === 'input' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            RESEARCH
          </button>
          <button
            onClick={loadFeed}
            className={`px-3 py-1 text-[10px] rounded transition-colors ${
              mode === 'feed' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            KNOWLEDGE FEED
          </button>
          {hasClaims && (
            <button
              onClick={() => setMode('analysis')}
              className={`px-3 py-1 text-[10px] rounded transition-colors ${
                mode === 'analysis' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              ANALYSIS
            </button>
          )}
        </div>

        {mode === 'analysis' && (
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/10 glass-panel">
            <button
              onClick={() => setViewTab('graph')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                viewTab === 'graph' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              GRAPH
            </button>
            <button
              onClick={() => setViewTab('report')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                viewTab === 'report' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              REPORT
            </button>
            <button
              onClick={() => setViewTab('sources')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                  viewTab === 'sources' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              SOURCES
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 text-[10px] font-mono text-gray-400 hover:text-white transition-colors"
              title="Settings & API Keys"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">SETTINGS</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <User size={10} />
              <span>{user.email}</span>
            </div>
          </>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded hover:bg-cyan-900/40 transition-colors"
          >
            <LogIn size={10} />
            <span>LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
}
