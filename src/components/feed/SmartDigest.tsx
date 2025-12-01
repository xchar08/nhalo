// ============================================================================
// FILE: src/components/feed/SmartDigest.tsx
// ============================================================================
'use client';

import { useEffect, useState } from 'react';
import { getSmartDigestAction } from '@/app/actions/feed'; 
import { DigestItem } from '@/lib/feed/digest'; 
import { Terminal, AlertCircle } from 'lucide-react';

export default function SmartDigest() {
  const [items, setItems] = useState<DigestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        const res = await getSmartDigestAction();
        
        if (res.success) {
            setItems(res.digest);
            setError(null);
        } else {
            // Handle auth failure or server error
            if (res.error === 'Unauthorized') {
                // Optional: Redirect to login or show specific message
                console.log("User not logged in");
            }
            setError(res.error || "Failed to load feed");
        }
      } catch (e) {
        console.error("Feed error", e);
        setError("Connection failed");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDigest();
  }, []);

  return (
    <div className="w-full border-l border-white/10 bg-[#020203] flex flex-col h-full font-mono text-xs">
      
      {/* Sidebar Header */}
      <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-[#0a0a0a] shrink-0">
        <Terminal size={14} className="text-blue-500" />
        <span className="font-bold text-gray-300 uppercase tracking-wider">Agent Feed</span>
        <div className="ml-auto flex gap-1">
           <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        <div className="absolute left-5 top-4 bottom-4 w-px bg-white/5"></div>

        {loading ? (
          <div className="pl-6 text-gray-500 animate-pulse">Syncing stream...</div>
        ) : error ? (
          <div className="pl-6 text-red-500 flex flex-col gap-1">
             <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={12} />
                <span>STREAM_ERROR</span>
             </div>
             <span className="opacity-70">{error}</span>
          </div>
        ) : items.length === 0 ? (
           <div className="pl-6 text-gray-600">
             <span className="text-blue-900 font-bold block mb-1">IDLE</span>
             No active background updates.
           </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="relative pl-6 group cursor-pointer">
              <div className="absolute left-[3px] top-0.5 w-1.5 h-1.5 rounded-full bg-blue-900 group-hover:bg-blue-400 transition-colors border border-black"></div>
              
              <div className="mb-1 flex justify-between items-center">
                 <span className="text-blue-400 font-bold">UPDATE_RECEIVED</span>
                 <span className="text-[10px] text-gray-700">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              <div className="text-gray-400 mb-2 group-hover:text-gray-200 transition-colors font-bold">
                {item.topic}
              </div>
              
              <div className="p-2 bg-white/5 rounded border border-white/5 text-gray-500 text-[10px] leading-relaxed">
                {`> ${item.summary}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
