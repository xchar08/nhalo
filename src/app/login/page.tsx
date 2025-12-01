// ============================================================================
// FILE: src/app/login/page.tsx
// ============================================================================
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Command, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Try to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/'); // Redirect to home on success
      router.refresh();
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
        alert(error.message);
    } else {
        alert("Check your email for the confirmation link!");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-[#020203] flex items-center justify-center font-mono text-gray-200">
      <div className="w-full max-w-md p-8 border border-white/10 bg-black/50 rounded-xl backdrop-blur-sm shadow-2xl relative overflow-hidden">
         
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
         
         <div className="text-center mb-8">
             <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 text-blue-400">
                 <Command size={20} />
             </div>
             <h1 className="text-xl font-bold tracking-widest text-white uppercase">Access Terminal</h1>
             <p className="text-xs text-gray-500 mt-2">Authorized Personnel Only</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Identity</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="user@halo.ai"
                />
            </div>
            
            <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Passcode</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="••••••••"
                />
            </div>

            <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <>Initialize <ArrowRight size={14} /></>}
                </button>
                
                <button 
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 p-3 rounded text-xs font-bold uppercase tracking-wider transition-all"
                >
                    Register
                </button>
            </div>
         </form>
      </div>
    </div>
  );
}
