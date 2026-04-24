"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Crosshair, Lock } from "lucide-react"

export default function TrustPanel({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [decision, setDecision] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [verified, setVerified] = useState(false)

  // Subscribing to the demo/live system window events
  useEffect(() => {
    const handleDecision = (e: any) => {
      setDecision(e.detail)
      setVerified(false) // Reset verification on new decision
    }

    const handleLog = (e: any) => {
      setLogs(prev => [e.detail, ...prev])
    }

    const handleVerification = (e: any) => {
      setVerified(e.detail)
    }

    window.addEventListener("ai_decision", handleDecision)
    window.addEventListener("audit_log", handleLog)
    window.addEventListener("verification_status", handleVerification)

    return () => {
      window.removeEventListener("ai_decision", handleDecision)
      window.removeEventListener("audit_log", handleLog)
      window.removeEventListener("verification_status", handleVerification)
    }
  }, [])

  // Do not render unless there is something historically meaningful to show, unless we are embedding it as a live mock.
  if (!isEmbedded && (!decision && logs.length === 0)) return null;

  return (
    <div className={
      isEmbedded 
      ? "relative w-full h-auto min-h-[300px] max-h-[500px] bg-[#050505]/95 backdrop-blur-xl border border-slate-800 rounded-none shadow-2xl flex flex-col font-mono animate-in slide-in-from-bottom duration-500 overflow-hidden" 
      : "fixed right-6 top-32 w-[340px] h-auto max-h-[500px] z-[9900] bg-[#050505]/95 backdrop-blur-xl border border-slate-800 rounded-none shadow-2xl flex flex-col font-mono animate-in slide-in-from-right duration-500 overflow-hidden"
    }>

      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-black/40">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-between">
          Trust Panel
          <Lock className="w-3 h-3 text-slate-500" />
        </div>
        <div className={`text-[10px] mt-1.5 flex items-center gap-1.5 uppercase tracking-wider font-bold ${verified ? 'text-slate-300' : 'text-slate-500 '}`}>
          <div className={`w-1.5 h-1.5 rounded-sm ${verified ? 'bg-slate-800 ' : 'bg-slate-500'}`} />
          {verified ? "✔ Verified" : "Verification Pending..."}
        </div>
      </div>

      {/* AI Decision */}
      <div className="p-4 border-b border-slate-800 relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Crosshair className="w-16 h-16 text-slate-500" />
        </div>
        
        <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold tracking-widest">AI Decision</div>

        {decision ? (
          <div className="animate-in fade-in duration-500 relative z-10">
            <div className="text-sm text-slate-200 font-bold mb-3">
              {decision.action}
            </div>

            {decision.reasoning && (
              <ul className="text-[10px] text-slate-400 space-y-1 mb-4">
                {decision.reasoning.map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-blue-500 mt-[-1px]">›</span> {r}
                  </li>
                ))}
              </ul>
            )}

            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex justify-between items-center">
              <span>Confidence</span>
              <span>{(decision.confidence * 100).toFixed(0)}%</span>
            </div>
            {/* Animated Confidence Bar */}
            <div className="w-full h-1 bg-slate-900 rounded mt-2 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${decision.confidence * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-600 uppercase tracking-widest">Awaiting directive</div>
        )}
      </div>

      {/* Audit Logs */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[160px] custom-scrollbar">
        <div className="text-[10px] uppercase text-slate-500 mb-3 font-bold tracking-widest">Audit Trail</div>
        
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="text-[10px] text-slate-400 bg-slate-900/50 border border-slate-800/80 p-2 rounded-sm animate-in slide-in-from-left-2 duration-300">
              <div className="text-slate-200 font-bold mb-1">{log.action}</div>
              <div className="text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-[10px] text-slate-600 border border-dashed border-slate-800 p-2 rounded text-center">Empty log sequence</div>
          )}
        </div>
      </div>

      {/* Verification Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[10px] uppercase text-slate-500 mb-1 font-bold tracking-widest">Cryptographic Layer</div>
        
        <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${verified ? 'text-slate-300' : 'text-slate-500'}`}>
          <ShieldCheck className="w-4 h-4" />
          {verified ? "Hash Validated" : "Pending Origin Check"}
        </div>
        <div className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">
          {verified ? "Anchored to secure log chain" : "Awaiting sync completion"}
        </div>
      </div>
    </div>
  )
}
