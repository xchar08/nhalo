'use client';

import {
  Command,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import GalaxyLogo from '@/components/visualizer/GalaxyLogo';

interface ResearchInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleAnalyze: () => void;
  isAnalyzing: boolean;
  deepMode: boolean;
  setDeepMode: (mode: boolean) => void;
  breadth: number;
  setBreadth: (breadth: number) => void;
}

export default function ResearchInput({
  inputText,
  setInputText,
  handleAnalyze,
  isAnalyzing,
  deepMode,
  setDeepMode,
  breadth,
  setBreadth,
}: ResearchInputProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 print:hidden">
      <div className="absolute top-12 left-12 -translate-x-12 -translate-y-12 w-[800px] h-[800px] opacity-40 pointer-events-none">
        <GalaxyLogo />
      </div>

      <div className="w-full max-w-2xl relative z-30">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-tighter text-white mb-4 drop-shadow-2xl">Halo Research</h1>
        </div>

        <div className="relative bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden group glass-panel">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <Command size={10} />
              <span>SYSTEM_READY</span>
            </div>
          </div>

          <textarea
            className="w-full h-48 bg-black/60 text-gray-100 p-6 focus:outline-none font-mono text-sm resize-none glass-input"
            placeholder="Enter project spec..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex flex-wrap gap-4 justify-between items-center px-4 py-3 bg-white/5 border-t border-white/5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDeepMode(!deepMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-mono uppercase border transition-all ${
                  deepMode ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'
                }`}
              >
                <Layers size={12} />
                {deepMode ? 'Deep ON' : 'Deep OFF'}
              </button>

              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                <span>BREADTH: {breadth}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={breadth}
                  onChange={(e) => setBreadth(parseInt(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim()}
              className={`flex items-center gap-2 px-5 py-2 rounded text-xs font-bold font-mono transition-all disabled:opacity-50 ${
                !inputText.trim()
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles size={12} className="animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>EXECUTE</span>
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
