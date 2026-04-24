'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IsaacRunStatusHeader } from './IsaacRunStatusHeader';
import { EpisodeGrid } from './EpisodeGrid';
import { LiveCurationPanel } from './LiveCurationPanel';
import TrainingControls from './TrainingControls';
import EpisodeDetailModal from './EpisodeDetailModal';
import PhysicsHealthRadar from './PhysicsHealthRadar';
import { useVlaWorkbenchStore } from '@/stores/vlaWorkbenchStore';
import { GlassCard } from '@/components/glass/GlassPanel';
import { ROS2TelemetryDashboard } from './ROS2TelemetryDashboard';
import { RVizWebViewer } from './RVizWebViewer';
import { URDFImporterModal } from './URDFImporterModal';
import { AnalyticsPanel } from './AnalyticsPanel';
import { EnginesPanel } from './EnginesPanel';
import { OverviewPanel } from './OverviewPanel';
import { DynamicGridWorkspace } from './DynamicGridWorkspace';

/**
 * VlaWorkbenchLayout — Full-screen three-column layout for the VLA Workbench.
 * Left sidebar: Run status. Center: Episode grid + curation feed. Right: Physics radar.
 */

export function VlaWorkbenchLayout() {
  const {
    runs, currentRunId, currentRun,
    episodes, selectedEpisode, episodeModalOpen,
    curationEvents, filters,
    isLoadingEpisodes,
    setRuns, setCurrentRun, setEpisodes,
    selectEpisode, setEpisodeModalOpen,
    setCurationEvents, setFilters,
    setLoadingRuns, setLoadingEpisodes,
  } = useVlaWorkbenchStore();

  const [showModal, setShowModal] = useState(false);
  const [showURDFModal, setShowURDFModal] = useState(false);
  // Data fetching
  const fetchRuns = useCallback(async () => {
    setLoadingRuns(true);
    try {
      const res = await fetch('/api/isaac-lab/runs');
      const data = await res.json();
      if (data.success) {
        setRuns(data.runs);
        if (!currentRunId && data.runs.length > 0) {
          setCurrentRun(data.runs[0].id);
        }
      }
    } catch (e) {
      console.error('[VLA] Failed to fetch runs:', e);
    }
    setLoadingRuns(false);
  }, [setRuns, setCurrentRun, currentRunId, setLoadingRuns]);

  const fetchEpisodes = useCallback(async () => {
    if (!currentRunId) return;
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`/api/isaac-lab/episodes?runId=${currentRunId}&limit=100`);
      const data = await res.json();
      if (data.success) setEpisodes(data.episodes);
    } catch (e) {
      console.error('[VLA] Failed to fetch episodes:', e);
    }
    setLoadingEpisodes(false);
  }, [currentRunId, setEpisodes, setLoadingEpisodes]);

  const fetchCurationEvents = useCallback(async () => {
    if (!currentRunId) return;
    try {
      const res = await fetch(`/api/data-curation/events?runId=${currentRunId}&limit=50`);
      const data = await res.json();
      if (data.success) setCurationEvents(data.events);
    } catch (e) {
      console.error('[VLA] Failed to fetch curation events:', e);
    }
  }, [currentRunId, setCurationEvents]);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);
  useEffect(() => { fetchEpisodes(); fetchCurationEvents(); }, [fetchEpisodes, fetchCurationEvents]);

  // Auto-refresh for running sims
  useEffect(() => {
    if (!currentRun || currentRun.status !== 'RUNNING') return;
    const interval = setInterval(() => {
      fetchRuns();
      fetchEpisodes();
      fetchCurationEvents();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentRun, fetchRuns, fetchEpisodes, fetchCurationEvents]);

  const handleEpisodeClick = (episode: any) => {
    selectEpisode(episode);
    setShowModal(true);
  };

  const handlePauseRun = async () => {
    if (!currentRunId) return;
    await fetch(`/api/isaac-lab/${currentRunId}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pause', reason: 'Manual operator pause' }),
    });
    fetchRuns();
  };

  const handleResumeRun = async () => {
    if (!currentRunId) return;
    await fetch(`/api/isaac-lab/${currentRunId}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resume' }),
    });
    fetchRuns();
  };

  // Aggregate scores for radar
  const avgScores = episodes.length > 0 ? {
    physicsRealism: episodes.reduce((s, e) => s + e.physicsRealism, 0) / episodes.length,
    sensorFidelity: episodes.reduce((s, e) => s + e.sensorFidelity, 0) / episodes.length,
    languageGrounding: episodes.reduce((s, e) => s + e.languageGrounding, 0) / episodes.length,
    actionSuccess: episodes.reduce((s, e) => s + e.actionSuccess, 0) / episodes.length,
    dataQuality: episodes.reduce((s, e) => s + e.overallQualityScore, 0) / episodes.length,
    modelConfidence: episodes.reduce((s, e) => s + Math.max(0, 1 - e.modelLoss / 3), 0) / episodes.length,
  } : { physicsRealism: 0, sensorFidelity: 0, languageGrounding: 0, actionSuccess: 0, dataQuality: 0, modelConfidence: 0 };

  return (
    <div className="flex h-screen flex-col bg-black text-white selection:bg-amber-500/30 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
      
      {/* Top Navigation Bar */}
      <div className="relative z-10 flex h-16 items-center justify-between border-b border-zinc-800/60 bg-black px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-[#0a0a0a]">
               <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
            <h1 className="font-mono text-xl font-semibold tracking-tighter">infra<span className="text-zinc-500">connect</span></h1>
          </div>
          <div className="rounded-full border border-zinc-800 bg-[#0a0a0a] px-3 py-1 text-[10px] font-mono text-zinc-400">
            WORKBENCH v3.0
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TrainingControls
            onRefresh={() => { fetchRuns(); fetchEpisodes(); fetchCurationEvents(); }}
            isRunning={currentRun?.status === 'RUNNING'}
          />
          <button 
            onClick={() => setShowURDFModal(true)} 
            className="rounded-full border border-zinc-800 bg-[#0a0a0a] px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Import Robot
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar — Run Status */}
        <div className="w-80 border-r border-zinc-800/60 bg-black/40 p-4 overflow-y-auto custom-scrollbar">
          <IsaacRunStatusHeader
            {...{run: currentRun ? {
              ...currentRun,
              numEnvs: currentRun.numEnvs || 4,
              sceneUsd: currentRun.sceneUsd || '',
            } : null} as any}
            onPause={handlePauseRun}
            onResume={handleResumeRun}
          />

          {/* Run Selector */}
          {runs.length > 1 && (
            <div className="mt-4 space-y-1">
              <p className="text-[10px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">All Runs</p>
              {runs.map(run => (
                <button
                  key={run.id}
                  onClick={() => setCurrentRun(run.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    currentRunId === run.id
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-500 hover:bg-zinc-900/50 border border-transparent'
                  }`}
                >
                  <span className="font-mono">{run.id.slice(-8).toUpperCase()}</span>
                  <span className="ml-2 text-[10px] text-zinc-600">{run.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-transparent p-6">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#0a0a0a]">
            {/* Header / Actions */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 p-4">
              <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-widest font-bold">Dynamic Workspace</h2>
              
              {/* Add Widget Dropdown */}
              <div className="relative group/dropdown">
                <button className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
                  <span className="text-emerald-500">+</span> Add Panel
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-zinc-800 bg-black p-1 shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50">
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('overview', 'Overview')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">Overview</button>
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('episodes', 'Live Episodes')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">Live Episodes</button>
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('curation', 'Live Curation')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">Live Curation</button>
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('analytics', 'Analytics')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">Analytics</button>
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('engines', 'Engines')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">Engines</button>
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('ros2', 'ROS2 Telemetry')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">ROS2 Telemetry</button>
                  <button onClick={() => useVlaWorkbenchStore.getState().addPanel('rviz', 'RViz View')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white rounded">RViz View</button>
                  <div className="my-1 border-t border-zinc-800"></div>
                  <button onClick={() => useVlaWorkbenchStore.getState().resetLayout()} className="w-full text-left px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-950 hover:text-red-300 rounded">Reset Default Layout</button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
               <DynamicGridWorkspace />
            </div>
          </div>
          {/* Bottom Live Panel */}
          <div className="h-72 border-t border-white/10 bg-black/60 p-4">
            <LiveCurationPanel {...{events: curationEvents} as any} />
          </div>
        </div>

        {/* Right Sidebar — Physics Health */}
        <div className="w-80 border-l border-white/10 bg-black/40 p-4 overflow-y-auto custom-scrollbar">
          <PhysicsHealthRadar {...avgScores} />

          {/* Quick Stats */}
          <GlassCard className="mt-4 p-4">
            <p className="text-[9px] uppercase tracking-wider text-white/30 mb-3">Transfer Gate Status</p>
            <div className="space-y-2">
              {currentRun ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Physics Gate</span>
                    <span className={currentRun.physicsScoreAvg >= 0.70 ? 'text-slate-300' : 'text-red-400'}>
                      {currentRun.physicsScoreAvg >= 0.70 ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Data Quality Gate</span>
                    <span className={currentRun.dataQualityScoreAvg >= 0.65 ? 'text-slate-300' : 'text-red-400'}>
                      {currentRun.dataQualityScoreAvg >= 0.65 ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Prune Ratio</span>
                    <span className={
                      currentRun.totalEpisodes > 0 && (currentRun.prunedCount / currentRun.totalEpisodes) < 0.20
                        ? 'text-slate-300' : 'text-amber-400'
                    }>
                      {currentRun.totalEpisodes > 0
                        ? `${((currentRun.prunedCount / currentRun.totalEpisodes) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/30">No run selected</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
      {/* Episode Detail Modal */}
      <EpisodeDetailModal
        episode={selectedEpisode}
        isOpen={showModal}
        onClose={() => { setShowModal(false); selectEpisode(null); }}
        onPrune={async (id) => { console.log('Prune:', id); fetchEpisodes(); }}
        onPromote={async (id) => { console.log('Promote:', id); fetchEpisodes(); }}
      />

      {/* URDF Importer Modal */}
      <URDFImporterModal 
        open={showURDFModal} 
        onClose={() => setShowURDFModal(false)} 
      />
    </div>
  );
}
