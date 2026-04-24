'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  Command,
  Mic,
  MicOff,
  ChevronRight,
  Sparkles,
  Loader2,
  Volume2,
  VolumeX,
  Terminal,
  Layers,
  Activity,
  Shield,
  Brain,
  BarChart3,
  Radio,
  PanelLeftOpen,
  Clock,
  MonitorPlay,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { IntentResult, SkillName } from '@/lib/memory/types';
import { SKILL_LABELS } from '@/lib/memory/types';

// ── Slash Commands ──────────────────────────────────────────────────────────

const SLASH_COMMANDS = [
  { label: '/spec', desc: 'Generate a specification', action: 'run_skill' as const, skill: 'spec' as SkillName, icon: Terminal },
  { label: '/plan', desc: 'Create an execution plan', action: 'run_skill' as const, skill: 'plan' as SkillName, icon: Layers },
  { label: '/build', desc: 'Execute build tasks', action: 'run_skill' as const, skill: 'build' as SkillName, icon: Terminal },
  { label: '/test', desc: 'Run tests & validate', action: 'run_skill' as const, skill: 'test' as SkillName, icon: Activity },
  { label: '/review', desc: 'Review & promote knowledge', action: 'run_skill' as const, skill: 'review' as SkillName, icon: Shield },
  { label: '/ship', desc: 'Release as canonical', action: 'run_skill' as const, skill: 'ship' as SkillName, icon: BarChart3 },
];

// ── Panel Shortcuts ─────────────────────────────────────────────────────────

const PANEL_SHORTCUTS = [
  { label: 'Overview', desc: 'System dashboard', action: 'open_panel' as const, panel: 'overview', icon: BarChart3 },
  { label: 'Health', desc: 'Memory health metrics', action: 'open_panel' as const, panel: 'health', icon: Activity },
  { label: 'Skills', desc: 'Skill lifecycle pipeline', action: 'open_panel' as const, panel: 'skills', icon: Terminal },
  { label: 'Explorer', desc: 'Memory node browser', action: 'open_panel' as const, panel: 'explorer', icon: Layers },
  { label: 'Governance', desc: 'Policies & promotion', action: 'open_panel' as const, panel: 'governance', icon: Shield },
  { label: 'Search', desc: 'Hybrid semantic search', action: 'open_panel' as const, panel: 'search', icon: Search },
  { label: 'Activity', desc: 'Chronological event log', action: 'open_panel' as const, panel: 'activity', icon: Radio },
  { label: 'Agent Bus', desc: 'Real-time message bus', action: 'open_panel' as const, panel: 'agentbus', icon: Radio },
  { label: 'Theatre', desc: 'Cinematic demo mode', action: 'navigate' as const, icon: MonitorPlay },
];

// ── Waveform Bars Component ─────────────────────────────────────────────────

function WaveformBars() {
  const bars = 4;
  return (
    <div className="flex items-center gap-[2px] h-4 ml-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-sm bg-destructive"
          animate={{
            height: [6, 14, 8, 16, 10, 6],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Command Palette Item ────────────────────────────────────────────────────

interface PaletteItem {
  id: string;
  label: string;
  desc: string;
  section: 'commands' | 'panels' | 'recent';
  icon: React.ComponentType<{ className?: string }>;
  execute: () => void;
}

// ── Main Component ──────────────────────────────────────────────────────────

interface IntentBarProps {
  onIntent: (result: IntentResult) => void;
  isProcessing?: boolean;
}

export function IntentBar({ onIntent, isProcessing }: IntentBarProps) {
  const router = useRouter();
  // ── State ────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const ttsMutedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recentActionsRef = useRef<Array<{ label: string; desc: string; result: IntentResult }>>([]);
  const paletteOverlayRef = useRef<HTMLDivElement>(null);

  // ── Sync mute ref ────────────────────────────────────────────────────────
  useEffect(() => {
    ttsMutedRef.current = isTtsMuted;
  }, [isTtsMuted]);

  // ── TTS Playback ─────────────────────────────────────────────────────────
  const playTts = useCallback(async (text: string) => {
    if (ttsMutedRef.current || !text || text.length < 3) return;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.success && data.audio) {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;
        setIsPlayingTts(true);

        audio.onended = () => {
          setIsPlayingTts(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingTts(false);
          audioRef.current = null;
        };

        await audio.play();
      }
    } catch {
      // TTS failure is non-critical, silently ignore
    }
  }, []);

  // ── Slash Command Parser (instant, no LLM) ───────────────────────────────
  const parseSlashCommand = useCallback((text: string): IntentResult | null => {
    const t = text.trim().toLowerCase();
    if (!t.startsWith('/')) return null;

    const cmd = t.slice(1).split(/\s+/)[0] as SkillName;
    if (!SKILL_LABELS[cmd]) return null;

    const project = t.split(/\s+/).slice(1).join(' ');
    return {
      action: 'run_skill',
      skill: cmd,
      params: project ? { project } : undefined,
      display: `${SKILL_LABELS[cmd]}${project ? ` → ${project}` : ''}`,
    };
  }, []);

  // ── LLM Intent Parser ────────────────────────────────────────────────────
  const parseIntentWithLlm = useCallback(async (text: string): Promise<IntentResult | null> => {
    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.action) {
        return {
          action: data.action,
          panel: data.panel,
          skill: data.skill,
          query: data.query,
          params: data.params,
          display: data.display || `Intent: ${data.action}`,
        } as IntentResult;
      }
    } catch (err) {
      toast.error('Intent parsing failed', {
        description: err instanceof Error ? err.message : 'Could not reach intent engine',
        duration: 3000,
      });
    }
    return null;
  }, []);

  // ── Process Intent (main entry point) ────────────────────────────────────
  const processIntent = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setQuery('');
    setShowSuggestions(false);
    setShowPalette(false);
    setPaletteQuery('');
    setIsParsing(true);

    try {
      let result: IntentResult | null = null;

      // 1. Try slash command first (instant)
      result = parseSlashCommand(trimmed);

      // 2. If not a slash command and >= 3 chars, use LLM
      if (!result && trimmed.length >= 3) {
        result = await parseIntentWithLlm(trimmed);
      }

      // 3. Fallback for short text or failed LLM
      if (!result) {
        if (trimmed.length < 3) {
          result = { action: 'unknown', display: `Query too short: "${trimmed}"` };
        } else {
          result = { action: 'search', query: trimmed, display: `Searching: "${trimmed}"` };
        }
      }

      // Track recent action
      recentActionsRef.current = [
        { label: result.display, desc: result.action, result },
        ...recentActionsRef.current.slice(0, 5),
      ];

      // Fire callback
      onIntent(result);

      // Play TTS response
      await playTts(result.display);
    } finally {
      setIsParsing(false);
    }
  }, [onIntent, parseSlashCommand, parseIntentWithLlm, playTts]);

  // ── Form Submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isParsing) {
      processIntent(query);
    }
  }, [query, processIntent, isParsing]);

  // ── Voice Recording ──────────────────────────────────────────────────────
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
        stream.getTracks().forEach((t) => t.stop());
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
            // Brief delay so user sees the transcribed text
            await new Promise((r) => setTimeout(r, 300));
            processIntent(data.text);
          } else {
            toast.error('Voice recognition failed', { duration: 3000 });
          }
        } catch {
          toast.error('Voice service unavailable', { duration: 3000 });
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied', { duration: 3000 });
    }
  }, [isRecording, processIntent]);

  // ── Command Palette: Build items list ────────────────────────────────────
  const buildPaletteItems = useCallback((): PaletteItem[] => {
    const items: PaletteItem[] = [];

    // Slash commands
    SLASH_COMMANDS.forEach((cmd) => {
      items.push({
        id: `cmd-${cmd.label}`,
        label: cmd.label,
        desc: cmd.desc,
        section: 'commands',
        icon: cmd.icon,
        execute: () => {
          onIntent({
            action: cmd.action,
            skill: cmd.skill,
            display: `${SKILL_LABELS[cmd.skill]}`,
          });
        },
      });
    });

    // Panels
    PANEL_SHORTCUTS.forEach((panel) => {
      items.push({
        id: `panel-${panel.label}`,
        label: panel.label,
        desc: panel.desc,
        section: 'panels',
        icon: panel.icon,
        execute: () => {
          onIntent({
            action: panel.action,
            panel: panel.panel,
            display: `Opening ${panel.label}`,
          });
        },
      });
    });

    // Recent actions
    recentActionsRef.current.forEach((recent, idx) => {
      items.push({
        id: `recent-${idx}`,
        label: recent.label,
        desc: recent.desc,
        section: 'recent',
        icon: Clock,
        execute: () => {
          onIntent(recent.result);
        },
      });
    });

    // Theatre Mode (Special)
    items.push({
      id: 'special-theatre',
      label: 'Theatre Mode',
      desc: 'Launch cinematic system demonstration',
      section: 'commands',
      icon: MonitorPlay,
      execute: () => {
        router.push('/theatre');
      },
    });

    return items;
  }, [onIntent, router]);

  const paletteItems = buildPaletteItems();

  // Filter items by palette query
  const filteredPaletteItems = paletteQuery.trim()
    ? paletteItems.filter(
        (item) =>
          item.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(paletteQuery.toLowerCase())
      )
    : paletteItems;

  // Group filtered items
  const groupedItems = {
    commands: filteredPaletteItems.filter((i) => i.section === 'commands'),
    panels: filteredPaletteItems.filter((i) => i.section === 'panels'),
    recent: filteredPaletteItems.filter((i) => i.section === 'recent'),
  };

  // ── Command Palette: Keyboard ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((prev) => !prev);
        setPaletteQuery('');
        setPaletteIndex(0);
      }

      // Escape closes palette or suggestions
      if (e.key === 'Escape') {
        if (showPalette) {
          setShowPalette(false);
          setPaletteQuery('');
          inputRef.current?.focus();
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPalette]);

  // ── Command Palette: Focus input when opened ─────────────────────────────
  useEffect(() => {
    if (showPalette) {
      // Small delay to allow animation to start
      requestAnimationFrame(() => {
        paletteInputRef.current?.focus();
      });
    }
  }, [showPalette]);

  // ── Command Palette: Keyboard navigation ─────────────────────────────────
  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPaletteIndex((prev) => Math.min(prev + 1, filteredPaletteItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPaletteIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredPaletteItems[paletteIndex];
        if (item) {
          item.execute();
          playTts(`Executed: ${item.label}`);
          setShowPalette(false);
          setPaletteQuery('');
          setPaletteIndex(0);
        }
      }
    },
    [filteredPaletteItems, paletteIndex, playTts]
  );

  // ── Command Palette: Click outside to close ──────────────────────────────
  useEffect(() => {
    if (!showPalette) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (paletteOverlayRef.current && !paletteOverlayRef.current.contains(e.target as Node)) {
        setShowPalette(false);
        setPaletteQuery('');
        setPaletteIndex(0);
        inputRef.current?.focus();
      }
    };

    // Delay adding listener to prevent immediate close from Cmd+K
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPalette]);

  // ── Suggestions for main input ───────────────────────────────────────────
  const filteredSlashCommands = query.startsWith('/')
    ? SLASH_COMMANDS.filter((cmd) => cmd.label.includes(query.toLowerCase()))
    : [];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ═══════ Fixed Top Bar ═══════ */}
      <header className="fixed top-0 inset-x-0 z-50 glass-strong border-b border-glass-border">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3">
          {/* ── Left: Branding ── */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Brain className="w-4 h-4 text-matrix" />
            <span className="text-premium text-[11px] text-gradient-matrix font-semibold select-none">
              InfraConnect
            </span>
          </div>

          {/* ── Center: Main Input ── */}
          <form onSubmit={handleSubmit} className="relative flex-1">
            <div
              className={cn(
                'glass rounded-sm flex items-center gap-2 px-3 sm:px-4 h-11 transition-all duration-300',
                'focus-within:glass-glow focus-within:border-matrix/30',
                isRecording && 'ring-2 ring-destructive/40'
              )}
            >
              <Search className="w-4 h-4 text-muted-foreground/60 shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(query.length > 0 || true)}
                placeholder="State your intent — /spec, /plan, describe what you need..."
                className={cn(
                  'flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50',
                  'outline-none font-mono tracking-wide min-w-0'
                )}
                disabled={isParsing || isProcessing}
                aria-label="Intent input"
              />

              {/* Parsing spinner */}
              {(isParsing || isProcessing) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-4 h-4 text-matrix animate-spin shrink-0" />
                </motion.div>
              )}
            </div>

            {/* ── Suggestions Dropdown ── */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-0 right-0 mt-2 glass-strong glass-glow-strong rounded-sm overflow-hidden z-50 origin-top"
                >
                  {filteredSlashCommands.length > 0 ? (
                    <div className="py-1.5 max-h-72 overflow-y-auto">
                      <div className="px-3 py-1.5">
                        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                          Skill Commands
                        </span>
                      </div>
                      {filteredSlashCommands.map((action) => {
                        const IconComp = action.icon;
                        return (
                          <button
                            key={action.label}
                            onClick={() => {
                              processIntent(action.label);
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150',
                              'hover:bg-matrix/10 active:bg-matrix/15'
                            )}
                          >
                            <IconComp className="w-3.5 h-3.5 text-matrix/70 shrink-0" />
                            <code className="text-mono-sm text-matrix font-semibold shrink-0">
                              {action.label}
                            </code>
                            <span className="text-xs text-muted-foreground/70 truncate">
                              {action.desc}
                            </span>
                            <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground/30 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  ) : query.length > 0 && !query.startsWith('/') ? (
                    <div className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-matrix/50" />
                        <span className="text-xs text-muted-foreground/60 font-medium">
                          Press Enter to parse intent via LLM
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/40">
                        Natural language is automatically analyzed and routed to the appropriate panel or skill
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground/60 mb-2">
                        Type a <span className="text-matrix font-mono font-semibold">/command</span> or describe what you need
                      </p>
                      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/40">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded border border-glass-border text-mono-xs bg-background/50">
                            ⌘K
                          </kbd>
                          Command palette
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded border border-glass-border text-mono-xs bg-background/50">
                            /
                          </kbd>
                          Slash commands
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mic button with waveform */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  'shrink-0 flex items-center justify-center w-9 h-9 rounded-sm transition-all duration-300',
                  isRecording
                    ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                    : 'text-muted-foreground/60 hover:text-matrix hover:bg-matrix/10'
                )}
                title={isRecording ? 'Stop recording' : 'Voice input'}
                aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div
                      key="mic-off"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center"
                    >
                      <MicOff className="w-4 h-4" />
                      <WaveformBars />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Mic className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* TTS Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !isTtsMuted;
                setIsTtsMuted(next);
                toast[next ? 'info' : 'success'](
                  next ? 'Voice responses muted' : 'Voice responses enabled',
                  { duration: 1500 }
                );
              }}
              className={cn(
                'shrink-0 flex items-center justify-center w-9 h-9 rounded-sm transition-all duration-300',
                isTtsMuted
                  ? 'text-muted-foreground/40 hover:text-muted-foreground/60'
                  : isPlayingTts
                    ? 'text-matrix '
                    : 'text-muted-foreground/60 hover:text-matrix hover:bg-matrix/10'
              )}
              title={isTtsMuted ? 'Unmute voice responses' : 'Mute voice responses'}
              aria-label={isTtsMuted ? 'Unmute voice responses' : 'Mute voice responses'}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isTtsMuted ? 'muted' : 'unmuted'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  {isTtsMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Theatre Mode Toggle */}
            <button
              type="button"
              onClick={() => router.push('/theatre')}
              className={cn(
                'hidden md:flex shrink-0 items-center justify-center w-9 h-9 rounded-sm transition-all duration-300',
                'text-muted-foreground/60 hover:text-amber-500 hover:bg-amber-500/10'
              )}
              title="Theatre Mode (Demo)"
              aria-label="Launch Theatre Mode"
            >
              <MonitorPlay className="w-4 h-4" />
            </button>

            {/* Keyboard shortcut hint */}
            <button
              type="button"
              onClick={() => {
                setShowPalette(true);
                setPaletteQuery('');
                setPaletteIndex(0);
              }}
              className={cn(
                'hidden sm:flex shrink-0 items-center justify-center gap-1',
                'h-8 px-2 rounded-sm border border-glass-border',
                'text-muted-foreground/40 text-mono-xs',
                'hover:text-muted-foreground/70 hover:border-matrix/20 hover:bg-matrix/5',
                'transition-all duration-200 cursor-pointer'
              )}
              title="Command palette (⌘K)"
              aria-label="Open command palette"
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ Command Palette Overlay ═══════ */}
      <AnimatePresence>
        {showPalette && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[200] bg-background/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Palette Container */}
            <motion.div
              ref={paletteOverlayRef}
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="command-palette glass-strong glass-glow-strong"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              {/* Palette Search */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-glass-border">
                <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                <input
                  ref={paletteInputRef}
                  type="text"
                  value={paletteQuery}
                  onChange={(e) => {
                    setPaletteQuery(e.target.value);
                    setPaletteIndex(0);
                  }}
                  onKeyDown={handlePaletteKeyDown}
                  placeholder="Type a command or panel name..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none font-mono tracking-wide"
                  aria-label="Search commands"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-mono-xs text-muted-foreground/40 border border-glass-border rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>

              {/* Palette Items */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredPaletteItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <Sparkles className="w-5 h-5 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground/50">No matching commands</p>
                  </div>
                ) : (
                  <>
                    {/* Slash Commands Section */}
                    {groupedItems.commands.length > 0 && (
                      <div className="mb-1">
                        <div className="px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-semibold">
                            Skill Commands
                          </span>
                        </div>
                        {groupedItems.commands.map((item) => {
                          const IconComp = item.icon;
                          const globalIndex = filteredPaletteItems.indexOf(item);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                item.execute();
                                playTts(`Executed: ${item.label}`);
                                setShowPalette(false);
                                setPaletteQuery('');
                                setPaletteIndex(0);
                              }}
                              onMouseEnter={() => setPaletteIndex(globalIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100',
                                paletteIndex === globalIndex
                                  ? 'bg-matrix/15 text-foreground'
                                  : 'text-muted-foreground hover:bg-matrix/8 hover:text-foreground'
                              )}
                            >
                              <IconComp className="w-3.5 h-3.5 text-matrix/70 shrink-0" />
                              <code className="text-mono-sm text-matrix font-semibold shrink-0">
                                {item.label}
                              </code>
                              <span className="text-xs truncate">{item.desc}</span>
                              <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground/20 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Panels Section */}
                    {groupedItems.panels.length > 0 && (
                      <div className="mb-1">
                        <div className="px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-semibold">
                            Panels
                          </span>
                        </div>
                        {groupedItems.panels.map((item) => {
                          const IconComp = item.icon;
                          const globalIndex = filteredPaletteItems.indexOf(item);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                item.execute();
                                playTts(`Opening ${item.label}`);
                                setShowPalette(false);
                                setPaletteQuery('');
                                setPaletteIndex(0);
                              }}
                              onMouseEnter={() => setPaletteIndex(globalIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100',
                                paletteIndex === globalIndex
                                  ? 'bg-matrix/15 text-foreground'
                                  : 'text-muted-foreground hover:bg-matrix/8 hover:text-foreground'
                              )}
                            >
                              <IconComp className="w-3.5 h-3.5 text-matrix/70 shrink-0" />
                              <span className="text-sm font-medium shrink-0">{item.label}</span>
                              <span className="text-xs text-muted-foreground/50 truncate">
                                {item.desc}
                              </span>
                              <PanelLeftOpen className="w-3 h-3 ml-auto text-muted-foreground/20 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Recent Actions Section */}
                    {groupedItems.recent.length > 0 && (
                      <div className="mb-1">
                        <div className="px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-semibold">
                            Recent
                          </span>
                        </div>
                        {groupedItems.recent.map((item) => {
                          const globalIndex = filteredPaletteItems.indexOf(item);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                item.execute();
                                setShowPalette(false);
                                setPaletteQuery('');
                                setPaletteIndex(0);
                              }}
                              onMouseEnter={() => setPaletteIndex(globalIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100',
                                paletteIndex === globalIndex
                                  ? 'bg-matrix/15 text-foreground'
                                  : 'text-muted-foreground hover:bg-matrix/8 hover:text-foreground'
                              )}
                            >
                              <Clock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                              <span className="text-xs font-mono truncate">{item.label}</span>
                              <span className="text-mono-xs text-muted-foreground/40 ml-auto shrink-0">
                                {item.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Palette Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-glass-border text-[10px] text-muted-foreground/30">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-glass-border text-mono-xs">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-glass-border text-mono-xs">↵</kbd>
                    Execute
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  InfraConnect
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


