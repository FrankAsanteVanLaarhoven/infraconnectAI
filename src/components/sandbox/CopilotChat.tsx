"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Terminal, Shield, Cpu, Code2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "system",
      content: "CORE Copilot Initialized. Antigravity protocols engaged.",
    },
    {
      id: "welcome",
      role: "assistant",
      content: "Hello Operator. I am your Sovereign AI Copilot. How can I assist you with the cluster or sandbox today?",
    }
  ]);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've received your request: "${userMessage.content}". This environment operates inside a secured namespace. You can use the terminal to the right to execute commands natively.`,
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0b0c] border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">
            Sovereign Copilot
          </span>
          <div className="px-2 py-0.5 border border-emerald-900/50 bg-emerald-900/20 rounded-full text-[9px] text-emerald-400 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            READY
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-600" />
          <Shield className="w-4 h-4 text-slate-600" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              
              {/* Avatar */}
              {msg.role !== "system" && (
                <div className="flex-shrink-0 mt-1">
                  <Avatar className="h-6 w-6 border border-slate-800">
                    <AvatarImage src={msg.role === "assistant" ? "/brand/logo-symbol.png" : undefined} />
                    <AvatarFallback className={msg.role === "assistant" ? "bg-emerald-950 text-emerald-500" : "bg-slate-900 text-slate-400"}>
                      {msg.role === "assistant" ? "AI" : "OP"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`p-3 text-sm font-mono tracking-wide leading-relaxed ${
                  msg.role === "user"
                    ? "bg-slate-900 border border-slate-800 text-slate-200"
                    : msg.role === "system"
                    ? "bg-transparent text-xs text-slate-500 uppercase tracking-widest text-center w-full my-2"
                    : "bg-[#0a0b0c] border border-emerald-900/30 text-slate-300"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a0b0c] border-t border-slate-800 z-10 relative">
        {/* Glow effect behind input */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent pointer-events-none" />
        
        <form onSubmit={handleSend} className="relative flex items-center">
          <Code2 className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot or request code..."
            className="w-full bg-[#050505] border border-slate-800 text-slate-300 text-sm font-mono py-3 pl-10 pr-12 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Background Aesthetic */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-5 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.2)_0%,transparent_100%)]" />
    </div>
  );
}
