'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });
import { useMemoryStore } from '@/store/memory-store';
import { motion } from 'framer-motion';
import { Loader2, Globe, Activity, Zap } from 'lucide-react';

interface GraphData {
  nodes: any[];
  links: any[];
}

export function NeuralTopology() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();

  const selectedNodeId = useMemoryStore(s => s.selectedNodeId);

  useEffect(() => {
    fetch('/api/fleet/topology')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  // Performance Optimization: Bloom & Lighting
  useEffect(() => {
    if (fgRef.current) {
      const fg = fgRef.current;
      fg.d3Force('link').distance(100);
      fg.d3Force('charge').strength(-150);
    }
  }, [data]);

  if (loading) return (
     <div className="flex flex-col items-center justify-center p-12 bg-black/40 backdrop-blur rounded-2xl border border-white/5 h-[400px]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/40">Initializing Neural Layout</div>
     </div>
  );

  return (
    <div className="relative w-full h-[400px] bg-black/40 backdrop-blur rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="absolute top-4 left-6 z-10 space-y-1">
        <div className="flex items-center gap-2">
           <Zap className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300">Neural Topology Map</h3>
        </div>
        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em]">Logical Infrastructure Visualization</p>
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={data || { nodes: [], links: [] }}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        nodeLabel="name"
        nodeColor={(node: any) => {
          if (node.id === selectedNodeId) return '#22d3ee'; // Cyan focus
          if (node.type === 'core') return '#0ea5e9'; // Blue core
          if (node.type === 'engine') return '#8b5cf6'; // Purple engine
          return '#475569'; // Gray agent
        }}
        nodeOpacity={0.9}
        nodeResolution={24}
        linkWidth={1}
        linkColor={(link: any) => link.type === 'command' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(14, 165, 233, 0.2)'}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.01}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleResolution={8}
        onNodeClick={(node: any) => {
          // Sync with platform state
          useMemoryStore.getState().selectNode(node.id);
        }}
      />

      {/* ── Legend ── */}
      <div className="absolute bottom-4 right-6 pt-2 border-t border-white/5 flex gap-4">
         <LegendItem color="bg-cyan-500" label="Active Focus" />
         <LegendItem color="bg-blue-500" label="Control Plane" />
         <LegendItem color="bg-purple-500" label="Governance" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase font-black">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}
