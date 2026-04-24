'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Activity,
  BarChart3,
  TrendingUp,
  Cpu,
  Zap,
  Eye,
  Brain,
  Radio,
  Crosshair,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useVlaWorkbenchStore } from '@/stores/vlaWorkbenchStore';
import { safeJson } from '@/lib/safe-json';

export function OverviewPanel() {
  const { currentRunId } = useVlaWorkbenchStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      if (!currentRunId) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/isaac-lab/analytics?runId=${currentRunId}`);
        if (!res.ok) return;
        const data = await safeJson<any>(res);
        if (!cancelled && data) {
          setAnalytics(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentRunId]);

  if (!currentRunId || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30">
        <BarChart3 className="mb-3 h-10 w-10" />
        <div>Run analytics will appear here</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  const h = analytics.physicsHealth;
  const ba = analytics.batchAnalysis;
  const qd = ba?.qualityDistribution;

  const statCards = [
    {
      icon: Shield,
      label: 'InfraPhysics',
      value: `${((analytics.physicsScore ?? 0) * 100).toFixed(1)}%`,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/5',
      border: 'border-cyan-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Avg Confidence',
      value: `${((ba?.avgConfidence ?? 0) * 100).toFixed(1)}%`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/10',
    },
    {
      icon: Zap,
      label: 'Data Clean',
      value: `${((ba?.cleanCount ?? 0))}`,
      color: 'text-purple-400',
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/10',
    },
    {
      icon: Activity,
      label: 'Noisy',
      value: `${ba?.noisyCount ?? 0}`,
      color: 'text-red-400',
      bg: 'bg-red-500/5',
      border: 'border-red-500/10',
    },
  ];

  const signalCards = [
    { icon: Eye, label: 'Physics Realism', value: h.avgPhysicsRealism, color: 'bg-cyan-400' },
    { icon: Radio, label: 'Sensor Fidelity', value: h.avgSensorFidelity, color: 'bg-emerald-400' },
    { icon: Brain, label: 'Language Grounding', value: h.avgLanguageGrounding, color: 'bg-purple-400' },
    { icon: Crosshair, label: 'Action Success', value: h.avgActionSuccess, color: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border ${stat.border} ${stat.bg} p-4`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div className="mt-2 font-mono text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* 6-Signal Health */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/60">
          <Cpu className="h-4 w-4" />
          6-Signal Health Breakdown
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {signalCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800/60 bg-[#0a0a0a] p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
                <div className="flex items-center gap-1 font-mono text-sm font-semibold text-white">
                  {(s.value * 100).toFixed(1)}%
                  {s.value >= 0.75 ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  ) : s.value < 0.5 ? (
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                  ) : null}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${s.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Distribution */}
      {qd && (
        <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
          <h3 className="mb-4 text-sm font-medium text-zinc-500">Quality Distribution</h3>
          <div className="flex h-6 overflow-hidden rounded-full bg-white/5">
            {qd.excellent > 0 && (
              <motion.div
                className="bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(qd.excellent / (h.totalEpisodes || 1)) * 100}%` }}
                title={`Excellent: ${qd.excellent}`}
              />
            )}
            {qd.good > 0 && (
              <motion.div
                className="bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${(qd.good / (h.totalEpisodes || 1)) * 100}%` }}
                title={`Good: ${qd.good}`}
              />
            )}
            {qd.low > 0 && (
              <motion.div
                className="bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${(qd.low / (h.totalEpisodes || 1)) * 100}%` }}
                title={`Low: ${qd.low}`}
              />
            )}
            {qd.critical > 0 && (
              <motion.div
                className="bg-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${(qd.critical / (h.totalEpisodes || 1)) * 100}%` }}
                title={`Critical: ${qd.critical}`}
              />
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: 'Excellent', count: qd.excellent, color: 'bg-emerald-500' },
              { label: 'Good', count: qd.good, color: 'bg-cyan-500' },
              { label: 'Low', count: qd.low, color: 'bg-amber-500' },
              { label: 'Critical', count: qd.critical, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-white/50">{item.label}</span>
                </div>
                <div className="mt-0.5 font-mono font-semibold text-white">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Series Mini Chart */}
      {analytics.timeSeries?.length > 0 && (
        <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
          <h3 className="mb-4 text-sm font-medium text-zinc-500">Training Progress</h3>
          <div className="flex items-end gap-1 h-32">
            {analytics.timeSeries.map((ts: any, i: number) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                <motion.div
                  className="w-full rounded-t-sm bg-gradient-to-t from-cyan-500/30 to-cyan-400/70"
                  initial={{ height: 0 }}
                  animate={{ height: `${ts.avgConfidence * 100}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  title={`Chunk ${ts.chunk}: ${ts.avgConfidence?.toFixed(2)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/20">
            <span>Start</span>
            <span>{analytics.timeSeries.length} chunks</span>
            <span>Latest</span>
          </div>
        </div>
      )}
    </div>
  );
}
