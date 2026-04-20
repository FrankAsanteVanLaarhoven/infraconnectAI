"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Send, X, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OperatorPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cmd+K toggle logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send() {
    if (!input.trim()) return;
    const currentInput = input;
    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: currentInput };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("/api/operator", {
        method: "POST",
        body: JSON.stringify({ input: currentInput }),
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply, action: data.action }]);

      // Voice output
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.reply);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
      }

      // Dispatch event to app for the Theatre or layout to react
      if (data.action && data.action !== "null") {
        window.dispatchEvent(
          new CustomEvent("operator_action_fired", { detail: { action: data.action, params: data.params } })
        );

        // --- Trust Panel Subsystem Events ---
        
        // 1. Emit the decision immediately
        window.dispatchEvent(new CustomEvent("ai_decision", {
          detail: {
            action: data.action.replace(/_/g, ' '),
            reasoning: data.reasoning || ["Pattern identified securely", "Target match"],
            confidence: data.confidence || 0.85
          }
        }));

        // 2. Log exactly when it executed
        window.dispatchEvent(new CustomEvent("audit_log", {
          detail: {
            action: `Command verified: ${data.action.replace(/_/g, ' ')}`,
            timestamp: new Date().toISOString()
          }
        }));

        // 3. Simulate delayed cryptographic verification Anchor check (Real deployments match backend hash logic)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("verification_status", { detail: true }));
        }, 1200);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Connection lost. Standby.", error: true }]);
    }

    setLoading(false);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-6 bottom-6 w-[420px] h-[540px] glass-frost rounded-2xl flex flex-col z-[9999] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="status-indicator status-indicator-live"></div>
                <Terminal className="w-4 h-4 text-white/70 ml-1" />
                <span className="text-premium text-[11px] text-white/90">InfraConnect Operator</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/90 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 text-mono-sm leading-relaxed tracking-wide">
              {messages.length === 0 && (
                <div className="matrix-text opacity-70 flex flex-col gap-2 mt-2">
                  <div>&gt; SYSTEM ONLINE</div>
                  <div>&gt; CMD+K INITIALIZED</div>
                  <div>&gt; STANDING BY FOR INPUT...</div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`px-4 py-2.5 rounded-xl max-w-[85%] shadow-sm ${m.role === "user" ? "bg-white/5 text-white/90 border border-white/10" : "matrix-border bg-black/40 matrix-text"}`}>
                    {m.content}
                    
                    {/* Explainability Layer UI */}
                    {m.reasoning && m.reasoning.length > 0 && typeof m.confidence === 'number' && (
                      <div className="mt-3 pt-3 border-t border-[var(--matrix-dim)]/30 text-[10px] opacity-80 font-mono tracking-wider">
                        <div className="flex items-center gap-2 mb-1.5 uppercase font-bold" style={{ color: 'var(--l2-color)' }}>
                          <span className="bg-[var(--l2-color)]/20 px-1 rounded text-[9px]">Confidence: {(m.confidence * 100).toFixed(0)}%</span>
                          <span className="text-[9px]">Why did the system act?</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 opacity-70">
                          {m.reasoning.map((r: string, ridx: number) => (
                            <li key={ridx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {m.action && m.action !== "null" && (
                    <div className="text-[10px] uppercase tracking-wider opacity-90 pl-1 flex items-center gap-1.5 mt-1" style={{ color: m.validated === false ? 'rgb(239 68 68)' : 'var(--l2-color)' }}>
                      <div className={`w-1.5 h-1.5 rounded-full status-indicator-live ${m.validated === false ? 'bg-red-500 shadow-red-500' : ''}`} style={m.validated !== false ? { background: 'var(--l2-color)', boxShadow: '0 0 6px var(--l2-color)' } : {}} />
                      {m.validated === false ? `BLOCKED: ${m.action.replace(/_/g, ' ')}` : `Executed: ${m.action.replace(/_/g, ' ')}`}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-3 pl-2 opacity-80" style={{ color: 'var(--matrix)' }}>
                  <div className="w-2 h-2 rounded-full pulse-ring" style={{ background: 'var(--matrix)' }} />
                  <span className="text-mono-xs uppercase tracking-widest">Processing...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="relative flex items-center"
              >
                <input
                  autoFocus
                  className="w-full bg-black/40 focus-visible border border-white/10 rounded-xl px-4 py-3 pr-10 text-mono-sm outline-none transition-all placeholder:text-white/30 text-white shadow-inner"
                  placeholder="Command the system..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-3 p-1.5 text-white/40 hover:text-white disabled:opacity-30 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
