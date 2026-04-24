"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setErrorMsg("Access Denied: Invalid email or access code.");
      } else {
        setErrorMsg(`Access Denied: ${errorParam}`);
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setErrorMsg('');

    const fingerprint = typeof window !== 'undefined' ? window.navigator.userAgent : 'UNKNOWN';

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: email,
        password: accessCode,
        fingerprint
      });

      if (result?.error) {
        setErrorMsg("Access Denied: Invalid email or access code. Ensure you have been approved.");
        setAuthenticating(false);
      } else {
        setLoginSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(`System Exception: ${err.message || "Failed to authenticate."}`);
      setAuthenticating(false);
    }
  };

  const getPanelNeon = () => {
    if (loginSuccess) return 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]';
    if (errorMsg) return 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]';
    if (authenticating) return 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)]';
    return 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]';
  };

  return (
    <div className="z-10 w-full max-w-md p-8">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
           <KeyRound className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Access Control Portal</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Enter your approved work email and the 12-digit secure access code you received via email.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-[#0a0a0a] border-2 rounded-2xl p-6 relative overflow-hidden transition-all duration-700 ${getPanelNeon()}`}
      >
        <form onSubmit={handleLogin} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Work Email
            </label>
            <input 
              type="email"
              autoFocus
              required
              disabled={authenticating}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-700"
              placeholder="you@company.com"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5" /> Access Code
            </label>
            <input 
              type="password"
              required
              disabled={authenticating}
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm text-emerald-400 font-mono tracking-widest focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-700"
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-xs text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={authenticating || !email || !accessCode}
            className="w-full mt-4 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg p-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {authenticating ? (
              <span className="animate-pulse">Verifying Credentials...</span>
            ) : (
              <>
                Log In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800/60 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600 leading-relaxed">
            Access is strictly limited to approved personnel. All authentication attempts are logged and monitored by the Sovereign Guard system.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-slate-300 font-sans flex flex-col items-center justify-center relative overflow-hidden selection:bg-cyan-500/30">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />
      <Suspense fallback={<div className="z-10 text-white animate-pulse">Initializing Interface...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
