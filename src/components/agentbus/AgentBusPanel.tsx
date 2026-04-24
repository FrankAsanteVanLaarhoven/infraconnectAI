'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Plus, Minus, Send, Wifi, WifiOff, Loader2, Hash, Clock,
  ArrowDown, Zap, Activity, Users, BookOpen, Plug
} from 'lucide-react';

/* ───────────────────────── Types ───────────────────────── */

interface BusMessage {
  id: string;
  topic: string;
  sender: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface HealthStats {
  uptime: number;
  connections: number;
  topics: number;
  subscriptions: number;
  messageHistory: number;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

/* ───────────────────────── Constants ───────────────────────── */

const DEFAULT_TOPICS = ['memory.#', 'skill.#', 'governance.#', 'system.#'];
const MAX_MESSAGES = 100;

const TOPIC_COLORS: Record<string, { badge: string; text: string; dot: string }> = {
  memory: { badge: 'bg-matrix/15 text-matrix', text: 'text-matrix', dot: 'bg-matrix' },
  skill: { badge: 'bg-execution/15 text-execution', text: 'text-execution', dot: 'bg-execution' },
  governance: { badge: 'bg-governance/15 text-governance', text: 'text-governance', dot: 'bg-governance' },
  system: { badge: 'bg-muted/15 text-muted-foreground', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  agent: { badge: 'bg-yellow-500/15 text-yellow-500', text: 'text-yellow-500', dot: 'bg-yellow-500' },
};

function getTopicColor(topic: string) {
  const prefix = topic.split('.')[0];
  return TOPIC_COLORS[prefix] ?? { badge: 'bg-muted/10 text-muted-foreground', text: 'text-muted-foreground', dot: 'bg-muted-foreground' };
}

/* ───────────────────────── Component ───────────────────────── */

export function AgentBusPanel() {
  const { activityLog } = useMemoryStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamContainerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [subscriptions, setSubscriptions] = useState<string[]>(DEFAULT_TOPICS);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [pubTopic, setPubTopic] = useState('');
  const [pubPayload, setPubPayload] = useState('{\n  "type": "event",\n  "data": "hello"\n}');
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Map true activity logs to the Bus interface
  const messages: BusMessage[] = useMemo(() => {
    return activityLog.map(log => ({
        id: log.id,
        topic: `system.${log.action}`,
        sender: 'infraconnect-core',
        payload: { target: log.target, detail: log.detail, ...(log.metadata || {}) },
        timestamp: log.createdAt
    }));
  }, [activityLog]);

  useEffect(() => {
     setStats({
        uptime: Math.floor(process.uptime ? process.uptime() : 12400),
        connections: 1,
        topics: 14,
        subscriptions: subscriptions.length,
        messageHistory: activityLog.length,
     });
  }, [activityLog.length, subscriptions.length]);

  /* ──────── Auto-scroll ──────── */

  useEffect(() => {
    if (!userScrolledUp && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolledUp]);

  const handleStreamScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setUserScrolledUp(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUserScrolledUp(false);
  }, []);

  const handleSubscribe = useCallback(() => {
    const topic = newTopic.trim();
    if (!topic) return;
    if (subscriptions.includes(topic)) return;
    setSubscriptions(prev => [...prev, topic]);
    setNewTopic('');
  }, [newTopic, subscriptions]);

  const handleUnsubscribe = useCallback((topic: string) => {
    setSubscriptions(prev => prev.filter(t => t !== topic));
  }, []);

  const handlePublish = useCallback(() => {
    const topic = pubTopic.trim();
    if (!topic) return;
    try {
      JSON.parse(pubPayload);
      setPubTopic('');
      setPubPayload('{\n  "type": "event",\n  "data": "hello"\n}');
    } catch {
      // Invalid JSON — silently ignore
    }
  }, [pubTopic, pubPayload]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubscribe();
  }, [handleSubscribe]);

  /* ──────── Helpers ──────── */

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const truncateSender = (s: string) => s.length > 12 ? s.slice(0, 12) + '…' : s;
  const truncatePayload = (p: Record<string, unknown>) => {
    const str = JSON.stringify(p);
    return str.length > 80 ? str.slice(0, 80) + '…' : str;
  };

  /* ──────── Render ──────── */

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col gap-3 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Radio className="w-4 h-4 text-matrix" />
          Agent Bus
        </h3>
        <span className="flex items-center gap-1.5">
          <span className={cn(
            'w-2 h-2 rounded-sm shrink-0',
            status === 'connected' && 'bg-matrix shadow-[0_0_6px_var(--matrix-glow)] ',
            status === 'reconnecting' && 'bg-yellow-500 ',
            status === 'disconnected' && 'bg-red-500/60',
          )} />
          <span className={cn(
            'text-mono-xs',
            status === 'connected' && 'text-matrix',
            status === 'reconnecting' && 'text-yellow-500',
            status === 'disconnected' && 'text-red-400/60',
          )}>
            {status === 'connected' ? 'LIVE' : status === 'reconnecting' ? 'RECONNECTING' : 'OFFLINE'}
          </span>
        </span>
      </div>

      {/* ── Stats Row ── */}
      {stats && (
        <div className="grid grid-cols-4 gap-1.5 shrink-0">
          {[
            { icon: Clock, label: 'UP', value: formatUptime(stats.uptime), color: 'text-matrix' },
            { icon: Users, label: 'CONN', value: String(stats.connections), color: 'text-execution' },
            { icon: BookOpen, label: 'TOPICS', value: String(stats.topics), color: 'text-governance' },
            { icon: Plug, label: 'SUBS', value: String(stats.subscriptions), color: 'text-yellow-500' },
          ].map((s) => (
            <div key={s.label} className="glass-subtle rounded-sm p-2 text-center">
              <div className={cn('text-xs font-semibold tabular-nums', s.color)}>{s.value}</div>
              <div className="text-[9px] text-muted-foreground/50 tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Message Stream ── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            Message Stream
          </h4>
          <span className="text-mono-xs text-muted-foreground/40 tabular-nums">{messages.length}</span>
        </div>
        <div
          ref={streamContainerRef}
          onScroll={handleStreamScroll}
          className="flex-1 min-h-0 overflow-y-auto space-y-1 rounded-sm"
          style={{ maxHeight: '320px' }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const tc = getTopicColor(msg.topic);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -12, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 6, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-subtle rounded-md px-2.5 py-1.5 hover:glass-hover transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {/* Topic badge */}
                    <span className={cn('inline-flex items-center gap-1 text-mono-xs font-medium px-1.5 py-0.5 rounded-md shrink-0', tc.badge)}>
                      <Hash className="w-2.5 h-2.5" />
                      {msg.topic}
                    </span>
                    {/* Sender */}
                    <span className="text-mono-xs text-muted-foreground/60 truncate">{truncateSender(msg.sender)}</span>
                    {/* Timestamp */}
                    <span className="text-mono-xs text-muted-foreground/30 ml-auto shrink-0 tabular-nums">{formatTime(msg.timestamp)}</span>
                  </div>
                  {/* Payload preview */}
                  <div className="text-[11px] font-mono text-muted-foreground/70 leading-tight truncate">
                    {truncatePayload(msg.payload)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
          {messages.length === 0 && (
            <div className="flex items-center justify-center py-8 text-mono-xs text-muted-foreground/30">
              Waiting for messages…
            </div>
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {userScrolledUp && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-16 right-4 w-7 h-7 rounded-sm glass-strong flex items-center justify-center text-matrix hover:glass-glow transition-all duration-200 shadow-lg z-10"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* ── Topic Subscriptions ── */}
      <div className="shrink-0 space-y-1.5">
        <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" />
          Subscriptions
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {subscriptions.map((topic) => {
            const tc = getTopicColor(topic);
            return (
              <motion.span
                key={topic}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'inline-flex items-center gap-1 text-mono-xs font-medium px-2 py-1 rounded-md cursor-default group/sub',
                  tc.badge
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-sm', tc.dot)} />
                {topic}
                <button
                  onClick={() => handleUnsubscribe(topic)}
                  className="ml-0.5 opacity-0 group-hover/sub:opacity-100 hover:text-red-400 transition-all duration-150"
                  aria-label={`Unsubscribe from ${topic}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
              </motion.span>
            );
          })}
          {/* Add new topic input */}
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="topic.#"
              className="w-20 text-mono-xs bg-transparent border border-glass-border rounded-md px-2 py-1 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-matrix/30 focus:border-matrix/50 transition-all duration-200"
            />
            <button
              onClick={handleSubscribe}
              disabled={!newTopic.trim() || status !== 'connected'}
              className="w-6 h-6 rounded-md glass-subtle flex items-center justify-center text-muted-foreground hover:text-matrix hover:glass-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Subscribe to topic"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Publish Form ── */}
      <div className="shrink-0 space-y-1.5">
        <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
          <Send className="w-3 h-3" />
          Publish
        </h4>
        <div className="glass-subtle rounded-sm p-2.5 space-y-2">
          {/* Topic input */}
          <input
            type="text"
            value={pubTopic}
            onChange={(e) => setPubTopic(e.target.value)}
            placeholder="memory.events"
            className="w-full text-mono-xs bg-transparent border border-glass-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-matrix/30 focus:border-matrix/50 transition-all duration-200"
          />
          {/* Payload textarea */}
          <textarea
            value={pubPayload}
            onChange={(e) => setPubPayload(e.target.value)}
            rows={3}
            placeholder='{"type": "event"}'
            className="w-full text-mono-xs bg-transparent border border-glass-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-matrix/30 focus:border-matrix/50 transition-all duration-200 resize-none font-mono leading-relaxed"
          />
          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={!pubTopic.trim() || status !== 'connected'}
            className="w-full flex items-center justify-center gap-2 text-mono-xs font-medium px-3 py-1.5 rounded-md bg-matrix/10 text-matrix hover:bg-matrix/20 hover:shadow-[0_0_12px_var(--matrix-glow)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-matrix/10 transition-all duration-300"
          >
            <Zap className="w-3 h-3" />
            PUBLISH
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
