'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useMemoryStore } from '@/store/memory-store';

interface AgentNode {
  id: string;
  lat: number;
  lng: number;
  status: string;
}

export function IntelligenceGlobe() {
  const [agents, setAgents] = useState<AgentNode[]>([]);
  const [rotation, setRotation] = useState(0);
  const selectedNodeId = useMemoryStore(s => s.selectedNodeId);
  const controls = useAnimation();

  // Load agent coordinates
  useEffect(() => {
    fetch('/api/fleet/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []));
  }, []);

  // Passive rotation
  useEffect(() => {
    const timer = setInterval(() => setRotation(r => (r + 0.2) % 360), 50);
    return () => clearInterval(timer);
  }, []);

  // 3D Projection Logic (High-performance SVG)
  const projection = useMemo(() => {
    const radius = 120;
    return agents.map(agent => {
      // Adjusted longitude for rotation
      const adjLng = (agent.lng + rotation) * (Math.PI / 180);
      const latRad = agent.lat * (Math.PI / 180);

      // Spherical to Cartesian
      const x = radius * Math.cos(latRad) * Math.sin(adjLng);
      const y = radius * Math.sin(-latRad);
      const z = radius * Math.cos(latRad) * Math.cos(adjLng);

      // Is the node on the front side?
      const visible = z > 0;
      const opacity = Math.max(0.1, z / radius);

      return { ...agent, x, y, z, visible, opacity };
    });
  }, [agents, rotation]);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
      {/* ── Cinematic Scanlines Layer ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <svg viewBox="-200 -200 400 400" className="w-[80%] h-[80%] drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        {/* Globe Wireframe Arcs */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Longitude Arcs */}
        {[0, 30, 60, 90, 120, 150].map(deg => (
          <ellipse
            key={`lat-${deg}`}
            cx="0" cy="0" rx={120} ry={Math.abs(120 * Math.cos(deg * Math.PI / 180))}
            fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5"
            transform={`rotate(${rotation})`}
          />
        ))}

        {/* Horizontal Rings */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const r = Math.abs(120 * Math.cos(lat * Math.PI / 180));
          const y = 120 * Math.sin(lat * Math.PI / 180);
          return (
            <ellipse
              key={`lng-${lat}`}
              cx="0" cy={y} rx={r} ry={r * 0.15}
              fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5"
            />
          );
        })}

        {/* Global Sphere Outline */}
        <circle cx="0" cy="0" r="120" fill="transparent" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />

        {/* Presence Nodes */}
        {projection.map(node => (
          <motion.g key={node.id} initial={{ opacity: 0.1 }} animate={{ opacity: node.visible ? 1 : 0.1 }}>
            <circle
              cx={node.x} cy={node.y}
              r={node.id === selectedNodeId ? 4 : 2}
              fill={node.id === selectedNodeId ? "#06b6d4" : "rgba(6,182,212,0.6)"}
              className={node.id === selectedNodeId ? "animate-pulse" : ""}
              filter={node.id === selectedNodeId ? "url(#glow)" : ""}
            />
            {node.id === selectedNodeId && node.visible && (
              <>
                <circle cx={node.x} cy={node.y} r="8" fill="none" stroke="#06b6d4" strokeWidth="0.5" className="animate-ping" />
                <path d={`M ${node.x} ${node.y} Q 0 0 0 0`} stroke="rgba(6,182,212,0.4)" strokeWidth="1" strokeDasharray="4 2" fill="none" />
              </>
            )}
          </motion.g>
        ))}
      </svg>

      {/* ── Metadata Overlay ── */}
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/40">Global Intelligence Atlas</div>
         <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/60 uppercase">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
               {agents.length} Nodes Active
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/60 uppercase">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
               Sub-orbital Sync
            </div>
         </div>
      </div>
    </div>
  );
}
