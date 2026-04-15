"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  Search, 
  Brain, 
  Activity,
  Terminal,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass/GlassPanel';

interface PersonaplexBarProps {
  onGenerate: (prompt: string) => void;
  isGenerating?: boolean;
}

const Waveform = () => (
  <div className="flex items-center gap-[2px] h-4 px-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div
        key={i}
        className="w-[2px] bg-cyan-500 rounded-full"
        animate={{ height: [4, 12, 6, 14, 4] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
  </div>
);

export function PersonaplexBar({ onGenerate, isGenerating }: PersonaplexBarProps) {
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isGenerating) return;
    
    setIsThinking(true);
    onGenerate(query);
    setQuery('');
    
    // Simulate thinking state to align with agent logic
    setTimeout(() => setIsThinking(false), 800);
  };

  const toggleVoice = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsVoiceActive(true);
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setVoiceTranscript(transcript);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
      if (voiceTranscript) {
        setQuery(voiceTranscript);
        setVoiceTranscript('');
      }
    };

    recognition.start();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 z-50">
      <GlassCard className="relative p-1 bg-black/40 border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-visible group">
        
        {/* Background glow when active */}
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-0 transition-opacity duration-500",
          (query.length > 0 || isGenerating || isThinking) && "opacity-100"
        )} />

        <form onSubmit={handleSubmit} className="relative flex items-center h-12 bg-slate-900/40 rounded-xl border border-white/5 focus-within:border-cyan-500/30 transition-all overflow-hidden px-4">
          
          <div className="personaplex-drag-handle flex items-center gap-3 pr-2 border-r border-white/5 mr-4 cursor-grab active:cursor-grabbing">
            <Brain className={cn("w-4 h-4 transition-colors", isThinking ? "text-cyan-400 animate-pulse" : "text-slate-500")} />
            <span className="text-[9px] uppercase font-black text-slate-600 tracking-[0.2em] hidden sm:block">Personaplex_Agent</span>
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={isVoiceActive && voiceTranscript ? voiceTranscript : query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isVoiceActive ? "Listening for intent..." : "Type or speak to generate tactical modules..."}
              className={cn(
                "w-full bg-transparent border-none outline-none font-mono text-xs text-white placeholder:text-slate-600 tracking-wide",
                isVoiceActive && "text-cyan-400"
              )}
              disabled={isGenerating || isThinking}
            />
            
            {/* Thinking Indicator */}
            <AnimatePresence>
              {(isGenerating || isThinking) && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-md border border-cyan-500/20"
                >
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-[8px] font-black uppercase text-cyan-300 tracking-widest">Generating_Assets</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {isVoiceActive && <Waveform />}
            
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                "p-2 rounded-lg transition-all",
                isVoiceActive ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-cyan-400 hover:bg-white/5"
              )}
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!query.trim() || isGenerating || isThinking}
              className={cn(
                "p-2 rounded-lg transition-all",
                query.trim() ? "text-cyan-400 hover:bg-cyan-500/10" : "text-slate-800"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Shortcuts / Status tag below */}
        <div className="absolute -bottom-6 left-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-slate-700 font-black uppercase tracking-widest">Tactical_Shortcuts:</span>
            <div className="flex gap-2">
               {['/spec', '/scan', '/intel'].map(cmd => (
                 <button 
                  key={cmd}
                  onClick={() => setQuery(cmd + ' ')}
                  className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[7px] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all font-bold uppercase"
                 >
                   {cmd}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
