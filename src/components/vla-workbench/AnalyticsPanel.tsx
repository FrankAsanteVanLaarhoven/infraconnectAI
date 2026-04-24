'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useVlaWorkbenchStore } from '@/stores/vlaWorkbenchStore';
import { safeJson } from '@/lib/safe-json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Download,
  GitCompareArrows,
  BarChart3,
  Radar as RadarIcon,
  PieChart as PieIcon,
} from 'lucide-react';

type ChartTab = 'trends' | 'comparison' | 'radar' | 'distribution';

interface RunSummary {
  id: string;
  shortId: string;
  status: string;
  totalEpisodes: number;
  avgPhysics: number;
  avgQuality: number;
  createdAt: string;
}

export function AnalyticsPanel() {
  const { currentRunId } = useVlaWorkbenchStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [physicsHealth, setPhysicsHealth] = useState<any>(null);
  const [batchAnalysis, setBatchAnalysis] = useState<any>(null);
  const [allRuns, setAllRuns] = useState<RunSummary[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ChartTab>('trends');
  const [compareLoading, setCompareLoading] = useState(false);

  // Loading is derived from whether we have data for the current run
  const loading = currentRunId ? !metrics : false;

  // Fetch single run metrics + all runs summary (polled)
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!currentRunId) return;
      try {
        const res = await fetch(`/api/isaac-lab/analytics?runId=${currentRunId}`);
        if (!res.ok) return;
        const data = await safeJson<{ type?: string; data?: any; physicsHealth?: any; batchAnalysis?: any }>(res);
        if (!cancelled && data?.type === 'single') {
          setMetrics(data.data);
          setPhysicsHealth(data.physicsHealth);
          setBatchAnalysis(data.batchAnalysis);
        }
      } catch {}
    };

    const fetchAllRunsOnce = async () => {
      try {
        const res = await fetch('/api/isaac-lab/analytics');
        if (!res.ok) return;
        const data = await safeJson<{ type?: string; data?: RunSummary[] }>(res);
        if (!cancelled && data?.type === 'all-runs') {
          setAllRuns(data.data || []);
        }
      } catch {}
    };

    fetchData();
    fetchAllRunsOnce();
    const interval = setInterval(fetchData, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentRunId]);

  // Run comparison
  const handleCompare = async () => {
    if (selectedCompareIds.length < 2) return;
    setCompareLoading(true);
    try {
      const res = await fetch(
        `/api/isaac-lab/analytics?compare=${selectedCompareIds.join(',')}`
      );
      if (!res.ok) return;
      const data = await safeJson<{ type?: string; data?: any[] }>(res);
      if (data?.type === 'comparison') {
        setComparisonData(data.data || []);
        setActiveTab('comparison');
      }
    } catch {}
    setCompareLoading(false);
  };

  const toggleCompareRun = (id: string) => {
    setSelectedCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    if (!metrics?.lossTrend) return;
    const csv = [
      'step,loss,physics_score,quality_score',
      ...metrics.lossTrend.map((l: any, i: number) =>
        `${l.step},${l.loss},${metrics.physicsTrend[i]?.score || 0},${metrics.physicsTrend[i]?.quality || 0}`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${currentRunId?.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-1">
        <div className="flex gap-3 border-b border-zinc-800/60 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || !currentRunId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <BarChart3 className="mb-4 h-12 w-12" />
        <div className="text-lg font-medium">No Run Selected</div>
        <div className="text-sm">Select a run from the dropdown to view analytics</div>
      </div>
    );
  }

  const chartTabs: { id: ChartTab; label: string; icon: typeof Activity }[] = [
    { id: 'trends', label: 'Trends', icon: Activity },
    { id: 'comparison', label: 'Run Comparison', icon: GitCompareArrows },
    { id: 'radar', label: 'Radar', icon: RadarIcon },
    { id: 'distribution', label: 'Distribution', icon: PieIcon },
  ];

  const qualityDist = metrics.qualityDistribution || {};
  const totalDist = qualityDist.excellent + qualityDist.good + qualityDist.low + qualityDist.critical || 1;
  const distData = [
    { name: 'Excellent', value: qualityDist.excellent || 0, pct: ((qualityDist.excellent || 0) / totalDist * 100).toFixed(1), color: '#22d3ee' },
    { name: 'Good', value: qualityDist.good || 0, pct: ((qualityDist.good || 0) / totalDist * 100).toFixed(1), color: '#a855f7' },
    { name: 'Low', value: qualityDist.low || 0, pct: ((qualityDist.low || 0) / totalDist * 100).toFixed(1), color: '#f59e0b' },
    { name: 'Critical', value: qualityDist.critical || 0, pct: ((qualityDist.critical || 0) / totalDist * 100).toFixed(1), color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
        <div className="flex gap-1 overflow-x-auto">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'text-zinc-500 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="ghost" size="sm" className="gap-1.5 text-xs text-white/60">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total Episodes', value: metrics.totalEpisodes, icon: null },
          { label: 'Avg Physics', value: `${(metrics.avgPhysicsScore * 100).toFixed(1)}%`, trend: metrics.avgPhysicsScore > 0.7 ? 'up' : 'down' },
          { label: 'Avg Quality', value: `${(metrics.avgQualityScore * 100).toFixed(1)}%`, trend: metrics.avgQualityScore > 0.7 ? 'up' : 'down' },
          { label: 'Avg Loss', value: metrics.avgLoss.toFixed(4), trend: metrics.avgLoss < 0.5 ? 'up' : 'down' },
          { label: 'Kept', value: metrics.keptCount, icon: null },
          { label: 'Pruned', value: metrics.prunedCount, icon: null },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {stat.label}
              </span>
              {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
              {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Loss Curve */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Loss Curve</div>
                <div className="text-[11px] text-zinc-500">Weighted MSE per episode</div>
              </div>
              <Badge variant="outline" className="border-cyan-500/30 text-[10px] text-cyan-400">
                LIVE
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={metrics.lossTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="step" tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <YAxis tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="loss"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fill="url(#lossGrad)"
                  dot={false}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Physics & Quality Overlay */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-4">
              <div className="text-sm font-medium">Physics & Quality Trends</div>
              <div className="text-[11px] text-zinc-500">Per-episode scoring overlay</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={metrics.physicsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="step" tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <YAxis domain={[0.3, 1]} tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={false}
                  name="Physics"
                  animationDuration={300}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 3"
                  name="Quality"
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sensor Fidelity Trend */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-4">
              <div className="text-sm font-medium">Sensor Fidelity</div>
              <div className="text-[11px] text-zinc-500">Camera, lidar, IMU signal consistency</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={metrics.sensorTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="step" tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <YAxis domain={[0.5, 1]} tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <defs>
                  <linearGradient id="sensorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="sensor"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#sensorGrad)"
                  dot={false}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Action Success Trend */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-4">
              <div className="text-sm font-medium">Action Success Rate</div>
              <div className="text-[11px] text-zinc-500">Task completion per episode</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={metrics.actionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="step" tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="action"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* COMPARISON TAB */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Run Selector */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-3 text-sm font-medium">Select Runs to Compare</div>
            <div className="flex flex-wrap gap-2">
              {allRuns.map((run) => (
                <button
                  key={run.id}
                  onClick={() => toggleCompareRun(run.id)}
                  className={`rounded-xl border px-3 py-2 text-xs transition-all ${
                    selectedCompareIds.includes(run.id)
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                      : 'border-zinc-800/60 text-zinc-500 hover:border-white/20'
                  }`}
                >
                  <span className="font-mono">#{run.shortId}</span>
                  <span className="ml-1.5 text-white/30">
                    ({run.totalEpisodes} ep)
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleCompare}
                disabled={selectedCompareIds.length < 2 || compareLoading}
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-cyan-600 to-purple-600 text-xs"
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                {compareLoading ? 'Comparing...' : `Compare ${selectedCompareIds.length} Runs`}
              </Button>
              {selectedCompareIds.length < 2 && (
                <span className="text-[11px] text-white/30">
                  Select at least 2 runs
                </span>
              )}
            </div>
          </div>

          {/* Comparison Chart */}
          {comparisonData.length > 0 && (
            <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
              <div className="mb-4 text-sm font-medium">Physics & Quality Comparison</div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="runId" tick={{ fontSize: 11 }} stroke="#ffffff30" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#ffffff30" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="avgPhysicsScore" fill="#22d3ee" name="Avg Physics" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgQualityScore" fill="#a855f7" name="Avg Quality" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {comparisonData.length > 0 && (
            <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
              <div className="mb-4 text-sm font-medium">Loss Comparison</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="runId" tick={{ fontSize: 11 }} stroke="#ffffff30" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#ffffff30" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="avgLoss" fill="#ef4444" name="Avg Loss" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* RADAR TAB */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-6">
            <ResponsiveContainer width={420} height={400}>
              <RadarChart data={metrics.radarData || []}>
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: '#ffffff80' }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 9 }}
                  stroke="#ffffff20"
                />
                <Radar
                  name="Current Run"
                  dataKey="value"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar metric breakdown */}
          <div className="flex flex-col justify-center gap-4">
            <div className="text-sm font-medium">6-Signal Health Breakdown</div>
            {(metrics.radarData || []).map((item: any, i: number) => {
              const colors = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
              const color = colors[i] || '#22d3ee';
              return (
                <div key={item.metric}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-white/60">{item.metric}</span>
                    <span className="font-mono font-medium" style={{ color }}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DISTRIBUTION TAB */}
      {activeTab === 'distribution' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quality Distribution Bar */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-4">
              <div className="text-sm font-medium">Quality Distribution</div>
              <div className="text-[11px] text-zinc-500">
                Based on InfraClean confidence scores
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={distData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="#ffffff50"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, _name: string, props: any) => [
                    `${value} (${props.payload.pct}%)`,
                    'Episodes',
                  ]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence Histogram */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5">
            <div className="mb-4">
              <div className="text-sm font-medium">Confidence Score Histogram</div>
              <div className="text-[11px] text-zinc-500">
                Distribution of per-episode InfraClean confidence
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(() => {
                  const bins = [
                    { range: '0.0–0.2', min: 0, max: 0.2 },
                    { range: '0.2–0.4', min: 0.2, max: 0.4 },
                    { range: '0.4–0.6', min: 0.4, max: 0.6 },
                    { range: '0.6–0.8', min: 0.6, max: 0.8 },
                    { range: '0.8–1.0', min: 0.8, max: 1.01 },
                  ];
                  return bins.map((b) => ({
                    range: b.range,
                    count: (metrics.confidenceDistribution || []).filter(
                      (c: number) => c >= b.min && c < b.max
                    ).length,
                  }));
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <YAxis tick={{ fontSize: 10 }} stroke="#ffffff30" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#histGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Batch Analysis Summary */}
          {batchAnalysis && (
            <div className="col-span-1 rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5 lg:col-span-2">
              <div className="mb-4 text-sm font-medium">InfraClean Batch Analysis</div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-zinc-800/60 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {batchAnalysis.cleanCount}
                  </div>
                  <div className="text-[10px] text-zinc-500">Clean Episodes</div>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {batchAnalysis.noisyCount}
                  </div>
                  <div className="text-[10px] text-zinc-500">Noisy Episodes</div>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {(batchAnalysis.avgConfidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-zinc-500">Avg Confidence</div>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {batchAnalysis.qualityDistribution?.excellent || 0}
                  </div>
                  <div className="text-[10px] text-zinc-500">Excellent Quality</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
