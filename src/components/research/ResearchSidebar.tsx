'use client';

import { History, Trash2 } from 'lucide-react';
import { ResearchProject } from '@/app/actions/history';

interface ResearchSidebarProps {
  history: ResearchProject[];
  loadHistoryItem: (query: string) => void;
  handleDeleteItem: (e: React.MouseEvent, id: string) => void;
  handleWipeHistory: () => void;
  showWipeConfirm: boolean;
  setShowWipeConfirm: (show: boolean) => void;
}

export default function ResearchSidebar({
  history,
  loadHistoryItem,
  handleDeleteItem,
  handleWipeHistory,
  showWipeConfirm,
  setShowWipeConfirm,
}: ResearchSidebarProps) {
  return (
    <div className="w-64 h-full border-r border-white/10 bg-black/40 backdrop-blur-sm hidden lg:flex flex-col z-40 relative print:hidden glass-panel">
      <div className="p-4 border-b border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <History size={12} /> Project History
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {history.map((h) => (
          <div
            key={h.id}
            onClick={() => loadHistoryItem(h.query)}
            className="group w-full flex items-center justify-between p-2 rounded text-xs text-gray-400 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="truncate flex-1 font-mono pr-2">{h.query.slice(0, 22)}...</div>
            <button
              onClick={(e) => handleDeleteItem(e, h.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="p-3 border-t border-white/10">
          {!showWipeConfirm ? (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-500 hover:text-red-400 py-2 transition-colors"
            >
              <Trash2 size={10} /> WIPE HISTORY
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 bg-black/50 text-gray-400 text-[10px] py-2 rounded hover:bg-black/70 transition-colors"
              >
                NO
              </button>
              <button
                onClick={handleWipeHistory}
                className="flex-1 bg-red-900/40 text-red-200 text-[10px] py-2 rounded hover:bg-red-900/60 transition-colors"
              >
                YES
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
