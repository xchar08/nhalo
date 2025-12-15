'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // <--- NEW IMPORT
import { createApiKeyAction, renameApiKeyAction } from '@/app/actions/api-keys';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Copy, Plus, Key, AlertTriangle, Check, Loader2, Edit2, X, Save, ArrowLeft } from 'lucide-react'; // <--- ADDED ArrowLeft

interface ApiKey {
  id: string;
  label: string;
  last_used_at: string | null;
  created_at: string;
  key_hash: string;
}

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const supabase = createClient();
    const { data } = await supabase
      .from('api_keys')
      .select('id, label, last_used_at, created_at, key_hash')
      .order('created_at', { ascending: false });
      
    if (data) setKeys(data as ApiKey[]);
    setLoading(false);
  }

  async function handleCreate() {
    setGenerating(true);
    setNewKey(null);

    // Pass empty string if empty, backend handles "Untitled Key X"
    try {
      const res = await createApiKeyAction(labelInput);

      if (res.success && res.apiKey) {
        setNewKey(res.apiKey);
        setLabelInput('');
        fetchKeys();
      } else {
        alert('Failed to create key: ' + (res.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error connecting to server.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? Any apps using this key will break immediately.')) return;
    setKeys(prev => prev.filter(k => k.id !== id));
    const supabase = createClient();
    await supabase.from('api_keys').delete().eq('id', id);
  }

  function startEditing(k: ApiKey) {
    setEditingId(k.id);
    setEditLabel(k.label);
  }

  async function saveEdit(id: string) {
    if (!editLabel.trim()) return;
    
    // Optimistic update
    setKeys(prev => prev.map(k => k.id === id ? { ...k, label: editLabel } : k));
    setEditingId(null);

    const res = await renameApiKeyAction(id, editLabel);
    if (!res.success) {
      alert("Failed to rename key");
      fetchKeys(); // Revert on fail
    }
  }

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-[#050505] border border-white/10 rounded-xl p-6 text-gray-200 shadow-2xl">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Key className="text-cyan-400" size={20} /> API Keys
        </h2>
        {/* BACK BUTTON */}
        <Link 
          href="/" 
          className="text-xs font-medium text-gray-500 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded hover:bg-white/5"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-6 border-b border-white/5 pb-4">
        Generate keys to access the Halo Research API.
      </p>

      {/* NEW KEY ALERT */}
      {newKey && (
        <div className="mb-8 p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wide">
            <AlertTriangle size={16} /> Save this key now!
          </div>
          <p className="text-xs text-emerald-200/70 mb-3">
            This token will <strong>never</strong> be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/50 border border-emerald-500/30 p-3 rounded font-mono text-emerald-300 text-sm break-all shadow-inner">
              {newKey}
            </code>
            <button onClick={copyToClipboard} className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* CREATE INPUT */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          placeholder="Key Label (Optional)"
          className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={handleCreate}
          disabled={generating}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900/50 disabled:text-gray-400 text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-2 min-w-[130px] justify-center"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Create Key</>}
        </button>
      </div>

      {/* KEY LIST */}
      <div className="space-y-3">
        {loading && <div className="text-center text-gray-500 py-4"><Loader2 className="animate-spin inline" /></div>}
        
        {!loading && keys.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8 border border-dashed border-white/10 rounded-lg">
            No API keys found.
          </div>
        )}

        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg group hover:bg-white/[0.04] transition-all">
            <div className="flex-1">
              {editingId === k.id ? (
                <div className="flex items-center gap-2 mb-1">
                  <input 
                    className="bg-black border border-white/20 rounded px-2 py-1 text-sm text-white focus:border-cyan-500 outline-none"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(k.id)} className="text-emerald-400 hover:text-emerald-300"><Save size={14}/></button>
                  <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><X size={14}/></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="font-bold text-gray-200 text-sm">{k.label}</div>
                  <button 
                    onClick={() => startEditing(k)} 
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-cyan-400 transition-opacity"
                    title="Rename"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              
              <div className="font-mono text-[11px] text-gray-500 mt-1 flex items-center gap-3">
                <span className="bg-white/5 px-1.5 rounded">sk_halo_...{k.key_hash ? k.key_hash.slice(-4) : '****'}</span>
                <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <button onClick={() => handleDelete(k.id)} className="text-gray-600 hover:text-red-400 p-2 hover:bg-white/5 rounded">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
