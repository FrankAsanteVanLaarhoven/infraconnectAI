'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useVlaWorkbenchStore } from '@/store/vlaWorkbenchStore';

interface Episode {
  id: string;
  episodeIndex: number;
  physicsRealism: number;
  overallQualityScore: number;
  cleanlabConfidence: number;
  isPruned: boolean;
  modelLoss: number;
}

export function EpisodeGrid({ onEpisodeClick }: { onEpisodeClick: (episode: Episode) => void }) {
  const { currentRunId } = useVlaWorkbenchStore();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentRunId) return;

    const fetchEpisodes = async () => {
      const res = await fetch(`/api/isaac-lab/episodes?runId=${currentRunId}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setLoading(false);
    };

    fetchEpisodes();
    const interval = setInterval(fetchEpisodes, 4000); // live refresh
    return () => clearInterval(interval);
  }, [currentRunId]);

  if (loading) {
    return <div className="text-center py-12 text-white/50">Loading episodes...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {episodes.map((ep, index) => (
        <motion.div
          key={ep.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => onEpisodeClick(ep)}
          className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:border-cyan-400/50 hover:bg-white/10"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-xs text-white/50">EPISODE #{ep.episodeIndex}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {(ep.overallQualityScore * 100).toFixed(0)}%
              </div>
            </div>
            <Badge
              variant={ep.isPruned ? "destructive" : "default"}
              className={ep.isPruned ? "bg-red-950 text-red-400" : "bg-slate-800 text-slate-300"}
            >
              {ep.isPruned ? "PRUNED" : "KEPT"}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-white/50">Physics</div>
              <div className="font-mono text-lg">{(ep.physicsRealism * 100).toFixed(0)}</div>
            </div>
            <div>
              <div className="text-white/50">Cleanlab</div>
              <div className="font-mono text-lg">{(ep.cleanlabConfidence * 100).toFixed(0)}</div>
            </div>
            <div>
              <div className="text-white/50">Loss</div>
              <div className="font-mono text-lg text-orange-400">{ep.modelLoss.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-sm bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" 
              style={{ width: `${ep.overallQualityScore * 100}%` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
