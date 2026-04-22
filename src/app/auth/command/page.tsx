"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Terminal as TermIcon } from 'lucide-react';
import { MatrixRain } from '@/components/ui/matrix-rain';

export default function CommandAuth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const router = useRouter();

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setError('');

    // Generate a browser-safe fingerprint
    const fingerprint = typeof window !== 'undefined' ? window.navigator.userAgent : 'UNKNOWN';

    // Simulate elite latency for the cinematic handshake
    setTimeout(async () => {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
          fingerprint
        });

        if (result?.error) {
          // Clinical Error Mapping
          if (result.error.includes("DEVICE_LOCK_ACTIVE")) {
            setError('CRITICAL: DEVICE_LIMIT_REACHED. AUTHORIZE VIA SECURE HUB.');
          } else if (result.error.includes("ECONNREFUSED") || result.error.includes("database")) {
            setError('WARNING: DB_PROTOCOL_TIMEOUT. OPERATING IN AUTONOMOUS_FALLBACK.');
            // Note: In fallback mode, the backend actually returns success if passwords match
          } else {
            setError(`ACCESS_DENIED: ${result.error.toUpperCase()}`);
          }
          setAuthenticating(false);
        } else {
          router.push('/nexus');
        }
      } catch (err: any) {
        setError(`SYSTEM_EXCEPTION: ${err.message?.toUpperCase()}`);
        setAuthenticating(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-green-500 font-mono flex flex-col items-center justify-center relative overflow-hidden">
      <MatrixRain color="#10b981" className="opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-lg bg-black/80 border border-green-900/50 p-8 shadow-[0_0_50px_rgba(16,185,129,0.05)] border-l-4 border-l-green-600"
      >
        <div className="flex items-center justify-between border-b border-green-900/50 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-xs tracking-[0.3em] font-black text-slate-300">SYSTEM OVERRIDE</span>
          </div>
          <span className="text-[10px] text-green-700">AWAITING CREDENTIALS...</span>
        </div>

        <div className="space-y-4 text-xs mb-8">
           <p className="text-slate-400">CONNECTING TO SECURE NODE [192.168.0.1:443]...</p>
           <p className="text-slate-400">ESTABLISHING ENCRYPTED HANDSHAKE... <span className="text-green-500">OK</span></p>
           {error && (
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 bg-red-950/30 p-2 mt-4 truncate">
               [!] {error}
             </motion.p>
           )}
           {authenticating && (
             <p className="text-amber-500 animate-pulse mt-4">[PROCESSING] VERIFYING IDENTITY SIGNATURE...</p>
           )}
        </div>

        <form onSubmit={handleTerminalSubmit} className="space-y-4">
          <div className="flex items-center group relative bg-black border border-green-900/30 focus-within:border-green-500 transition-colors">
             <span className="px-4 text-green-600">IDENTIFIER_</span>
             <input 
               type="text"
               autoFocus
               disabled={authenticating}
               value={username}
               onChange={e => setUsername(e.target.value)}
               className="w-full bg-transparent p-3 outline-none text-green-400 placeholder:text-green-900/30"
               placeholder="admin"
             />
          </div>
          
          <div className="flex items-center group relative bg-black border border-green-900/30 focus-within:border-green-500 transition-colors">
             <span className="px-4 text-green-600">PASSCODE_</span>
             <input 
               type="password"
               disabled={authenticating}
               value={password}
               onChange={e => setPassword(e.target.value)}
               className="w-full bg-transparent p-3 outline-none text-green-400 placeholder:text-green-900/30 font-sans tracking-widest"
               placeholder="••••••••"
             />
          </div>

          <button 
            type="submit" 
            disabled={authenticating || !username || !password}
            className="w-full mt-6 bg-green-900/20 hover:bg-green-600/20 text-green-500 border border-green-800 p-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TermIcon className="w-4 h-4" /> EXECUTE CLEARANCE
          </button>
        </form>
      </motion.div>
    </div>
  );
}
