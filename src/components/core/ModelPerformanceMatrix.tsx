'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Activity, Terminal, BrainCircuit, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { toast } from 'sonner'

interface MLExperiment {
  id: string;
  modelName: string;
  runTag: string;
  svrRate: number;
  rewardCurves: any;
  completedAt: string;
}

export function ModelPerformanceMatrix() {
  const [experiments, setExperiments] = useState<MLExperiment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExperiments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mlops')
      const data = await res.json()
      if (data.success && data.experiments) {
        setExperiments(data.experiments)
      }
    } catch (e) {
      toast.error('Failed to sync MLOps telemetry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiments()
  }, [])

  // Mock some realistic RL reward curves if the DB doesn't have any yet
  const mockRewardData = [
    { episode: 0, reward: -100, svr: 0.8 },
    { episode: 50, reward: -50, svr: 0.6 },
    { episode: 100, reward: 20, svr: 0.4 },
    { episode: 150, reward: 85, svr: 0.2 },
    { episode: 200, reward: 140, svr: 0.05 },
    { episode: 250, reward: 190, svr: 0.01 },
    { episode: 300, reward: 210, svr: 0.0 },
  ]

  const activeData = experiments[0]?.rewardCurves || mockRewardData;

  return (
    <GlassPanel glow className="col-span-full xl:col-span-2 flex flex-col pt-5 min-h-[400px]">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-cyan-400">
          <BrainCircuit className="w-4 h-4 text-cyan-500" />
          MLOps Experiment Studio
        </h3>
        <button onClick={fetchExperiments} className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-400 flex items-center gap-2 transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          {loading ? 'Syncing...' : 'Live Telemetry Sync'}
        </button>
      </div>

      <div className="flex-1 space-y-4">
        
        {/* Metric Overlay */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20 text-center">
            <span className="text-xl font-mono text-cyan-400 font-light mb-1 block">
              {experiments.length > 0 ? experiments[0].modelName : 'VLA-1.0-RC'}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">Active Model</span>
          </div>
          <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20 text-center">
            <span className="text-xl font-mono text-green-400 font-light mb-1 block">
              {experiments.length > 0 ? ((1 - experiments[0].svrRate) * 100).toFixed(1) + '%' : '99.0%'}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">Safety Compliance</span>
          </div>
          <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20 text-center">
            <span className="text-xl font-mono text-cyan-400 font-light mb-1 block">
              {experiments.length > 0 ? experiments[0].runTag : 'SIM-EVAL-Alpha'}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">Run Tag</span>
          </div>
          <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20 text-center">
            <span className="text-xl font-mono text-orange-400 font-light mb-1 block">
              {activeData.length}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">Episodes Logged</span>
          </div>
        </div>

        {/* Recharts Visualization */}
        <div className="bg-black/60 p-4 rounded-lg border border-cyan-500/20 h-64 relative">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-4 border-b border-cyan-500/20 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><Terminal className="w-3 h-3 text-cyan-500" /> rl/reward/convergence/</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-full" /> Reward</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full" /> SVR Rate</span>
            </div>
          </h4>
          
          <div className="absolute inset-0 top-12 px-2 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22d3ee" opacity={0.1} />
                <XAxis dataKey="episode" stroke="#475569" fontSize={10} tickFormatter={(val) => `Ep ${val}`} />
                <YAxis yAxisId="left" stroke="#22d3ee" fontSize={10}  />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  labelStyle={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="reward" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#0891b2' }} />
                <Line yAxisId="right" type="monotone" dataKey="svr" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </GlassPanel>
  )
}
