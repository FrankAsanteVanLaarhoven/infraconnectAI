"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Sparkles, Terminal, Shield, Cpu, Code2, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MODELS = [
  "Gemini 3.1 Pro",
  "Gemini 3.0",
  "Gemini 3.1 Flash",
  "Gemini Veo 3.0",
];

export function CopilotChat() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { modelId: selectedModel },
    initialMessages: [
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
    ]
  });

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#030303] border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0b0c] border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">
            Sovereign Copilot
          </span>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-sm text-[9px] text-slate-400 transition-colors uppercase font-mono tracking-widest"
            >
              {selectedModel} <ChevronDown className="w-3 h-3" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 w-40 bg-[#0a0b0c] border border-slate-800 shadow-xl z-50">
                {MODELS.map(model => (
                  <button
                    key={model}
                    onClick={() => { setSelectedModel(model); setIsDropdownOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-[10px] uppercase font-mono tracking-widest text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
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
                    : "bg-[#0a0b0c] border border-emerald-900/30 text-slate-300 whitespace-pre-wrap"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="flex-shrink-0 mt-1">
                <Avatar className="h-6 w-6 border border-slate-800">
                  <AvatarImage src="/brand/logo-symbol.png" />
                  <AvatarFallback className="bg-emerald-950 text-emerald-500">AI</AvatarFallback>
                </Avatar>
              </div>
              <div className="p-3 text-sm font-mono bg-[#0a0b0c] border border-emerald-900/30 text-slate-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a0b0c] border-t border-slate-800 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Code2 className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={`Ask ${selectedModel} or request code...`}
            className="w-full bg-[#050505] border border-slate-800 text-slate-300 text-sm font-mono py-3 pl-10 pr-12 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-5 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.2)_0%,transparent_100%)]" />
    </div>
  );
}
