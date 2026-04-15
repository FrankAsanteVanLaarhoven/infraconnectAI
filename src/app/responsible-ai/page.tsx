export default function ResponsibleAIPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono selection:bg-blue-500/30 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,transparent_0%,#050505_100%)] opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 pb-32">
        <header className="mb-20 animate-fade-in-up">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 rounded-full">
            Autonomous Trust Standard
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-indigo-400 uppercase">
            Responsible AI at InfraConnect
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed font-mono tracking-tight max-w-3xl">
            Built for Control, Not Guesswork. InfraConnect uses AI to assist decisions—not replace them. 
            All system actions remain verifiable, permissioned, and entirely under your explicit control.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider border-b border-white/10 pb-4">Operator Principles</h2>
            <ul className="space-y-8">
              <li>
                <h3 className="text-lg font-bold text-emerald-300">1. Grounded Intelligence</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  AI responses are strictly derived from verified system context. If data is not available, the system will explicitly state so. Zero hallucinations.
                </p>
              </li>
              <li>
                <h3 className="text-lg font-bold text-emerald-300">2. Controlled Autonomy</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  AI can suggest and automate low-risk actions. Critical commercial actions <i>always</i> require human execution and MFA verification.
                </p>
              </li>
              <li>
                <h3 className="text-lg font-bold text-emerald-300">3. Full Transparency</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Every AI decision is logged with Inputs, Outputs, System Confidence, and Contextual Reasoning into your tamper-proof Data Controller suite.
                </p>
              </li>
            </ul>
          </div>

          <div>
             <div className="glass-frost p-8 rounded-xl border border-emerald-900/40 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 {/* Visual decoration */}
                 <div className="w-32 h-32 border border-emerald-500 rounded-full animate-ping" style={{animationDuration: '4s'}} />
               </div>
               
               <h3 className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-4">Human-in-the-Loop By Default</h3>
               <p className="text-sm text-slate-300 mb-6">InfraConnect enforces strict human approval gateways for:</p>
               
               <ul className="space-y-3 font-mono text-xs">
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Pricing & Commercial Operations
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Automated External Communications
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Broad IAM Role Modification
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Infrastructure Telemetry Analysis <span className="text-[9px] text-slate-500 uppercase tracking-widest ml-auto">White-listed</span>
                 </li>
               </ul>
             </div>
          </div>
        </section>

        <section className="mb-20 animate-fade-in-up" style={{animationDelay: '200ms'}}>
          <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider border-b border-white/10 pb-4">Data Processing & Compliance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0A0F1A]/80 border border-slate-800 p-6 rounded-lg">
              <h4 className="text-indigo-400 font-bold mb-2">GDPR Ready</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                You remain the Data Controller. InfraConnect operates purely as a Processor. Native APIs support instant Data Export and Right to Erasure workflows.
              </p>
            </div>
            <div className="bg-[#0A0F1A]/80 border border-slate-800 p-6 rounded-lg">
              <h4 className="text-indigo-400 font-bold mb-2">Edge Minimization</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Processing occurs deeply embedded inside your perimeter. Telemetry payload extraction is configurable (Metadata Only vs Full Text).
              </p>
            </div>
            <div className="bg-[#0A0F1A]/80 border border-slate-800 p-6 rounded-lg">
              <h4 className="text-indigo-400 font-bold mb-2">Instant Kill Switches</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Total control rests with your security operations center. Cryptographic identities for Edge agents can be revoked arbitrarily, killing tunnels.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
