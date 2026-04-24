'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CurationEvent } from '@/stores/vlaWorkbenchStore';

/**
 * LiveCurationFeed — Real-time scrolling feed of curation decisions.
 * Shows agent attribution, confidence bars, and action badges.
 */

interface LiveCurationFeedProps {
  events: CurationEvent[];
}

const ACTION_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  PRUNE:             { bg: 'bg-red-500/10',     text: 'text-red-400',     icon: '✂' },
  KEEP:              { bg: 'bg-slate-800',  text: 'text-slate-300', icon: '✓' },
  AUGMENT:           { bg: 'bg-blue-500/10',     text: 'text-blue-400',    icon: '⊕' },
  FLAG_HUMAN_REVIEW: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   icon: '⚠' },
  PROMOTE_TO_CANON:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  icon: '★' },
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 0.85 ? 'bg-slate-800' : value >= 0.65 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 rounded-sm bg-white/5 overflow-hidden">
        <div className={`h-full rounded-sm ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-[9px] font-mono text-white/40">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function LiveCurationFeed({ events }: LiveCurationFeedProps) {
  return (
    <div className="rounded-none border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-sm bg-slate-800" />
          <h3 className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Live Curation Feed</h3>
        </div>
        <span className="text-[10px] text-white/30">{events.length} events</span>
      </div>

      {/* Event list */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {events.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-white/30 text-xs">Waiting for curation events...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event, i) => {
              const style = ACTION_STYLES[event.action] || ACTION_STYLES.KEEP;
              const episodeIds = (() => { try { return JSON.parse(event.episodeIds); } catch { return []; } })();

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  transition={{ duration: 0.3, delay: i === 0 ? 0.1 : 0 }}
                  className="px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Action icon */}
                      <span className={`flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center text-xs ${style.bg} ${style.text}`}>
                        {style.icon}
                      </span>

                      <div className="min-w-0 flex-1">
                        {/* Action + Agent */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase ${style.text}`}>
                            {event.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[9px] text-white/20">by</span>
                          <span className="text-[9px] font-mono text-white/40">{event.agent}</span>
                        </div>

                        {/* Reason */}
                        <p className="text-[11px] text-white/50 leading-snug truncate">{event.reason}</p>

                        {/* Episodes + Confidence */}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] text-white/25">
                            {episodeIds.length} ep{episodeIds.length !== 1 ? 's' : ''}
                          </span>
                          <ConfidenceBar value={event.confidence} />
                        </div>
                      </div>
                    </div>

                    {/* Time */}
                    <span className="text-[9px] text-white/20 flex-shrink-0">{timeAgo(event.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
