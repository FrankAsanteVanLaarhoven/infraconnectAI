'use client';

import { useState, useRef, useCallback } from 'react';
import { useMemoryStore } from '@/store/memory-store';
import { cn } from '@/lib/utils';
import { Search, Command, Mic, MicOff, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IntentResult, SkillName } from '@/lib/memory/types';
import { SKILL_LABELS } from '@/lib/memory/types';

const QUICK_ACTIONS = [
  { label: '/spec', desc: 'Specification', action: 'run_skill', skill: 'spec' as SkillName },
  { label: '/plan', desc: 'Planning', action: 'run_skill', skill: 'plan' as SkillName },
  { label: '/build', desc: 'Build', action: 'run_skill', skill: 'build' as SkillName },
  { label: '/test', desc: 'Testing', action: 'run_skill', skill: 'test' as SkillName },
  { label: '/review', desc: 'Review', action: 'run_skill', skill: 'review' as SkillName },
  { label: '/ship', desc: 'Release', action: 'run_skill', skill: 'ship' as SkillName },
];

interface IntentBarProps {
  onIntent: (result: IntentResult) => void;
  isProcessing?: boolean;
}

export function IntentBar({ onIntent, isProcessing }: IntentBarProps) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { openPanel, togglePanel } = useMemoryStore();

  const processIntent = useCallback((text: string) => {
    const t = text.trim().toLowerCase();

    // Slash command
    if (t.startsWith('/')) {
      const cmd = t.slice(1).split(/\s+/)[0] as SkillName;
      if (SKILL_LABELS[cmd]) {
        const project = t.split(/\s+/).slice(1).join(' ');
        onIntent({
          action: 'run_skill',
          skill: cmd,
          params: project ? { project } : undefined,
          display: `${SKILL_LABELS[cmd]}${project ? ` → ${project}` : ''}`,
        });
        setQuery('');
        setShowSuggestions(false);
        return;
      }
    }

    // Panel commands
    const panelMap: Record<string, string> = {
      'health': 'health',
      'dashboard': 'overview',
      'overview': 'overview',
      'skills': 'skills',
      'explorer': 'explorer',
      'memory': 'explorer',
      'governance': 'governance',
      'policies': 'governance',
      'search': 'search',
      'activity': 'activity',
    };
    for (const [keyword, panel] of Object.entries(panelMap)) {
      if (t.includes(keyword)) {
        onIntent({ action: 'open_panel', panel, display: `Opening ${panel}` });
        setQuery('');
        setShowSuggestions(false);
        return;
      }
    }

    // Search
    if (t.length > 2) {
      onIntent({ action: 'search', query: text, display: `Searching: "${text}"` });
      setQuery('');
      setShowSuggestions(false);
      return;
    }

    onIntent({ action: 'unknown', display: `Unknown intent: "${text}"` });
    setQuery('');
    setShowSuggestions(false);
  }, [onIntent]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) processIntent(query);
  }, [query, processIntent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          const res = await fetch('/api/voice', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.text) {
            setQuery(data.text);
            processIntent(data.text);
          }
        } catch {
          setQuery('[voice recognition unavailable]');
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setQuery('[microphone access denied]');
    }
  }, [isRecording, processIntent]);

  const filteredActions = query.startsWith('/')
    ? QUICK_ACTIONS.filter(a => a.label.includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed top-0 inset-x-0 z-50 glass-strong border-b border-glass-border">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="glass rounded-xl flex items-center gap-2 px-4 h-12 transition-all duration-300 focus-within:glass-glow">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(query.length > 0 || true)}
              onKeyDown={handleKeyDown}
              placeholder="State your intent — /spec, /plan, /build, /test, /review, /ship, or describe what you need..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none font-mono"
              disabled={isProcessing}
            />
            {isProcessing && <Loader2 className="w-4 h-4 text-matrix animate-spin shrink-0" />}
            <button
              type="button"
              onClick={toggleRecording}
              className={cn(
                'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300',
                isRecording
                  ? 'bg-destructive/20 text-destructive animate-pulse'
                  : 'text-muted-foreground hover:text-matrix hover:bg-matrix/10'
              )}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-50"
              >
                {filteredActions.length > 0 ? (
                  <div className="py-1">
                    {filteredActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          onIntent({
                            action: 'run_skill',
                            skill: action.skill,
                            display: `${action.desc}`,
                          });
                          setQuery('');
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-matrix/10 text-left transition-colors"
                      >
                        <code className="text-mono-sm text-matrix font-semibold">{action.label}</code>
                        <span className="text-sm text-muted-foreground">{action.desc}</span>
                        <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground/50" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Type a <span className="text-matrix font-mono">/command</span> or describe what you need
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Sparkles className="w-3 h-3 text-matrix/60" />
                      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                        Ephemeral UI — adapts to your intent
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
