import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SandboxTerminal } from "@/components/terminal/SandboxTerminal";
import { CopilotChat } from "@/components/sandbox/CopilotChat";
import { InfraConnectLogo } from "@/components/ui/InfraConnectLogo";
import Link from "next/link";
import { ShieldAlert, Terminal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function SandboxPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/sandbox");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] selection:bg-slate-700/50 flex flex-col font-mono relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05)_0%,transparent_60%)]" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05)_0%,transparent_60%)]" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-50" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-4 px-6 border-b border-slate-800/80 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <InfraConnectLogo variant="minimal" />
          </Link>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs uppercase tracking-widest font-black">AI Mission Control</span>
            <Badge variant="outline" className="border-emerald-900/50 text-emerald-400 bg-emerald-900/10 text-[9px] ml-2 animate-pulse">ANTIGRAVITY_MODE</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end text-[9px] uppercase tracking-widest text-slate-500">
            <span>Operator: {(session.user as any)?.name || 'Unknown'}</span>
            <span className="text-red-400">Clearance: {(session.user as any)?.role || 'USER'}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area: Split View */}
      <main className="flex-1 p-6 flex flex-col z-10 relative">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Sovereign Sandbox</h1>
            <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">
              AI Copilot <span className="mx-2 text-slate-600">|</span> Direct PTY Access. <span className="text-red-400">Warning: Actions execute directly on the host node.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase text-slate-500 border border-slate-800 p-2 bg-black/30">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Security Logging Active
          </div>
        </div>

        <div className="flex-1 w-full relative flex gap-6 h-full">
          {/* Left Pane: AI Copilot */}
          <div className="w-1/3 h-[calc(100vh-180px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <CopilotChat />
          </div>
          
          {/* Right Pane: Sandbox Terminal */}
          <div className="w-2/3 h-[calc(100vh-180px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <SandboxTerminal />
          </div>
        </div>
      </main>
    </div>
  );
}
