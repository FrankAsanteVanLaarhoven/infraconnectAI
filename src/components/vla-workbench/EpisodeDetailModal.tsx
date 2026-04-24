'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { EpisodeData } from '@/stores/vlaWorkbenchStore';

/**
 * EpisodeDetailModal — Split view episode analysis.
 * Left: 3D wireframe replay with trajectory visualization.
 * Right: Multimodal analysis with score breakdown and actions.
 */

interface EpisodeDetailModalProps {
  episode: EpisodeData | null;
  isOpen: boolean;
  onClose: () => void;
  onPrune: (episodeId: string) => void;
  onPromote: (episodeId: string) => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-white/50">{label}</span>
        <span className="text-white/80 font-mono">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-sm bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-sm ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function TrajectoryVisualization() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate a simulated robot trajectory
  const points: [number, number, number][] = [];
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    points.push([
      Math.sin(t * Math.PI * 2) * 2,
      0.1,
      Math.cos(t * Math.PI * 2) * 2 + t * 3,
    ]);
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <Grid args={[10, 10]} cellSize={0.5} cellColor="#1a1a2e" sectionColor="#16213e" fadeDistance={15} />
      <Line points={points} color="#06b6d4" lineWidth={2} />
      {/* Robot position marker */}
      <mesh position={[points[points.length - 1][0], 0.3, points[points.length - 1][2]]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#06b6d4" wireframe />
      </mesh>
      {/* Target position */}
      <mesh position={[0, 0.2, 4]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
    </group>
  );
}

export default function EpisodeDetailModal({ episode, isOpen, onClose, onPrune, onPromote }: EpisodeDetailModalProps) {
  if (!episode) return null;

  const isHighQuality = episode.overallQualityScore >= 0.90;
  const isLowQuality = episode.overallQualityScore < 0.55;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[600px] rounded-none border border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/40">EPISODE</span>
                <span className="text-sm font-bold text-white/90">#{episode.episodeIndex}</span>
                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
                  episode.isPruned ? 'bg-red-500/20 text-red-400' :
                  isHighQuality ? 'bg-slate-800 text-slate-300' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {episode.isPruned ? 'PRUNED' : isHighQuality ? 'HIGH QUALITY' : 'REVIEW'}
                </span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors text-lg">✕</button>
            </div>

            {/* Split View */}
            <div className="flex h-[calc(100%-52px)]">
              {/* Left — 3D Replay */}
              <div className="w-1/2 border-r border-white/5 relative">
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-1 rounded bg-black/60 text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
                    3D Trajectory Replay
                  </span>
                </div>
                <Canvas camera={{ position: [4, 3, 6], fov: 50 }}>
                  <TrajectoryVisualization />
                  <OrbitControls enableDamping dampingFactor={0.05} />
                </Canvas>
              </div>

              {/* Right — Multimodal Analysis */}
              <div className="w-1/2 p-5 overflow-y-auto custom-scrollbar">
                <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Multimodal Analysis</h4>

                {/* Score Breakdown */}
                <div className="space-y-3 mb-5">
                  <ScoreBar label="Physics Realism" value={episode.physicsRealism} color="bg-cyan-400" />
                  <ScoreBar label="Sensor Fidelity" value={episode.sensorFidelity} color="bg-violet-400" />
                  <ScoreBar label="Language Grounding" value={episode.languageGrounding} color="bg-pink-400" />
                  <ScoreBar label="Action Success" value={episode.actionSuccess} color="bg-slate-800" />
                  <ScoreBar label="Cleanlab Confidence" value={episode.cleanlabConfidence} color="bg-amber-400" />
                </div>

                {/* Overall Score */}
                <div className="rounded-sm border border-white/10 bg-white/[0.02] p-4 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Overall Quality</span>
                    <span className={`text-2xl font-bold ${
                      isHighQuality ? 'text-slate-300' : isLowQuality ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {(episode.overallQualityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40">Model Loss</span>
                    <span className={`text-sm font-mono ${episode.modelLoss > 2.5 ? 'text-red-400' : 'text-white/60'}`}>
                      {episode.modelLoss.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Prune reason if applicable */}
                {episode.pruneReason && (
                  <div className="rounded-sm border border-red-500/20 bg-red-500/5 p-3 mb-5">
                    <p className="text-[10px] uppercase text-red-400 mb-1 font-bold">Prune Reason</p>
                    <p className="text-xs text-white/60">{episode.pruneReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {!episode.isPruned && (
                    <button
                      onClick={() => onPrune(episode.id)}
                      className="flex-1 py-2 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors"
                    >
                      Prune Episode
                    </button>
                  )}
                  {isHighQuality && !episode.memoryNodeId && (
                    <button
                      onClick={() => onPromote(episode.id)}
                      className="flex-1 py-2 rounded-sm bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                    >
                      Promote to Canon
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
