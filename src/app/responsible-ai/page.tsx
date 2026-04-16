export default function ResponsibleAIPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono selection:bg-blue-500/30 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,transparent_0%,#050505_100%)] opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 pb-32">
        <header className="mb-20">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 rounded-full">
            Autonomous Trust Standard
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-indigo-400 uppercase leading-tight">
            Responsible AI
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed font-mono tracking-tight max-w-3xl">
            InfraConnect is built on a foundation of safety and accountability. We ensure every action is verified, controlled, and auditable.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-[#0A0F1A]/50 border border-emerald-900/30 p-8 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-widest mb-4">Human-in-the-loop</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Execution requires manual authorization for high-stakes actions. AI as an assistant, humans as the authority.
            </p>
          </div>
          <div className="bg-[#0A0F1A]/50 border border-emerald-900/30 p-8 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-widest mb-4">Deterministic guardrails</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hard constraints on system capabilities. Proactive enforcement ensures AI operates within strict operational bounds.
            </p>
          </div>
          <div className="bg-[#0A0F1A]/50 border border-emerald-900/30 p-8 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-widest mb-4">Full auditability</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every decision trace is logged and sealed. Tamper-proof logs provide total transparency into autonomous behavior.
            </p>
          </div>
        </section>

        <section className="glass-frost p-12 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Our Commitment to Safety</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="space-y-6">
               <p className="text-slate-300 leading-relaxed">
                 We believe infrastructure should be intelligent, but never unpredictable. Our architecture is designed to prevent autonomous drift and ensure systemic stability.
               </p>
               <ul className="space-y-4 font-mono text-xs text-slate-400">
                 <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Automated bias detection in memory nodes</li>
                 <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Context-isolated decision environments</li>
                 <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Real-time safety kernel monitoring</li>
               </ul>
             </div>
             <div className="bg-black/40 border border-white/5 p-6 rounded-lg font-mono text-[10px] text-emerald-500/70">
                <div className="mb-2 border-b border-emerald-900/30 pb-2 flex justify-between">
                  <span>SAFETY_LOG_STREAM</span>
                  <span className="animate-pulse">● LIVE</span>
                </div>
                <div>[09:22:15] CHECKING_GUARDRAIL_CONSTRAINT... OK</div>
                <div>[09:22:16] VERIFYING_OPERATOR_PRESENCE... OK</div>
                <div>[09:22:18] DECISION_TRACE_COMMITTED_TO_ELASTIC</div>
                <div>[09:23:01] HEARTBEAT_STABLE</div>
             </div>
           </div>
        </section>
      </main>
    </div>
  );
}

