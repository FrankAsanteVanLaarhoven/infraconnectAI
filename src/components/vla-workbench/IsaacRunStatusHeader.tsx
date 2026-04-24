'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVlaWorkbenchStore } from '@/store/vlaWorkbenchStore';
import { Badge } from '@/components/ui/badge';

interface RunData {
  id: string;
  status: string;
  physicsScoreAvg: number;
  dataQualityScoreAvg: number;
  numEnvs: number;
  _count: { episodes: number };
}

export function IsaacRunStatusHeader({ runId }: { runId: string | null }) {
  const [run, setRun] = useState<RunData | null>(null);
  const { setIsTraining } = useVlaWorkbenchStore();

  useEffect(() => {
    if (!runId) return;

    const fetchRun = async () => {
      const res = await fetch(`/api/isaac-lab/runs?status=RUNNING`);
      const data = await res.json();
      const current = data.runs.find((r: any) => r.id === runId);
      if (current) setRun(current);
    };

    fetchRun();
    const interval = setInterval(fetchRun, 3000);
    return () => clearInterval(interval);
  }, [runId]);

  const handleControl = async (action: 'pause' | 'resume' | 'stop') => {
    if (!runId) return;

    await fetch(`/api/isaac-lab/runs/${runId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });

    if (action === 'pause') setIsTraining(false);
    if (action === 'resume') setIsTraining(true);
  };

  if (!run) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-white/50">No active Isaac Lab run</div>
        <div className="mt-2 text-xs text-white/40">Launch a new training session from the controls</div>
      </div>
    );
  }

  const statusColor = 
    run.status === 'RUNNING' ? 'bg-slate-800' :
    run.status.includes('PAUSED') ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-[1px] text-white/50">ACTIVE RUN</div>
            <div className="font-mono text-lg text-white/90">#{run.id.slice(0, 8)}</div>
          </div>
          <Badge className={`${statusColor} text-black font-medium`}>
            {run.status}
          </Badge>
        </div>
      </div>

      {/* Live Gauges */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Physics Score</span>
            <span className="font-mono">{(run.physicsScoreAvg * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              animate={{ width: `${run.physicsScoreAvg * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Data Quality</span>
            <span className="font-mono">{(run.dataQualityScoreAvg * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
              animate={{ width: `${run.dataQualityScoreAvg * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-xs">
        <div className="rounded-none border border-white/10 bg-white/5 py-3">
          <div className="text-white/50">Environments</div>
          <div className="font-mono text-2xl font-semibold">{run.numEnvs}</div>
        </div>
        <div className="rounded-none border border-white/10 bg-white/5 py-3">
          <div className="text-white/50">Episodes</div>
          <div className="font-mono text-2xl font-semibold">{run._count.episodes}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 pt-2">
        {run.status === 'RUNNING' ? (
          <Button 
            onClick={() => handleControl('pause')} 
            variant="outline" 
            className="flex-1 gap-2 border-amber-500/50 hover:bg-amber-950"
          >
            <Pause className="h-4 w-4" /> Pause
          </Button>
        ) : (
          <Button 
            onClick={() => handleControl('resume')} 
            className="flex-1 gap-2 bg-slate-800 hover:bg-slate-800"
          >
            <Play className="h-4 w-4" /> Resume
          </Button>
        )}

        <Button 
          onClick={() => handleControl('stop')} 
          variant="destructive" 
          className="flex-1 gap-2"
        >
          <Square className="h-4 w-4" /> Stop
        </Button>
      </div>
    </div>
  );
}
