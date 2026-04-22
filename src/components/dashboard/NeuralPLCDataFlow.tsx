'use client'

import { useEffect, useRef, useState } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Cpu, Zap, Activity } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false })

/**
 * ─── Neural PLC Interface Node Generator ─────────────────────────────────────
 * Generates a mock topology combining CORE PLC Safety Interlocks 
 * with industrial agent logic engines.
 */
function generatePLCNeuralData() {
  const nodes = [
    // PLC Hardware Layer
    { id: 'PLC_MASTER', group: 'plc', val: 5, label: 'Master Permissive Latch' },
    { id: 'PLC_ESTOP', group: 'plc', val: 3, label: 'E-Stop Relay' },
    { id: 'PLC_GATE_1', group: 'plc', val: 2, label: 'Safety Gate Left' },
    { id: 'PLC_GATE_2', group: 'plc', val: 2, label: 'Safety Gate Right' },
    { id: 'PLC_FAULT_MONITOR', group: 'plc', val: 4, label: 'Feedback Fault Monitor' },
    { id: 'PLC_OUTPUT', group: 'plc', val: 6, label: 'Hardware OSSR' },

    // Core Agent Logic Layer
    { id: 'NN_VISION', group: 'neural', val: 4, label: 'Vision Synthesis Model' },
    { id: 'NN_PROPRIOCEPTION', group: 'neural', val: 3, label: 'State Encoding' },
    { id: 'NN_TRANSFORMER', group: 'neural', val: 8, label: 'Agent Action Transformer' },
    { id: 'NN_GRASP_INFERENCE', group: 'neural', val: 5, label: 'Task Regressor' },
    { id: 'NN_POLICY', group: 'neural', val: 7, label: 'Control Policy' },

    // Agent Bus / Telemetry
    { id: 'BUS_STREAM', group: 'bus', val: 2, label: 'Agent Message Bus' },
    { id: 'EVAL_GATE', group: 'bus', val: 3, label: 'Safe-Execution Eval' },
  ]

  const links = [
    // PLC Safety Interlock Logic
    { source: 'PLC_ESTOP', target: 'PLC_FAULT_MONITOR' },
    { source: 'PLC_GATE_1', target: 'PLC_FAULT_MONITOR' },
    { source: 'PLC_GATE_2', target: 'PLC_FAULT_MONITOR' },
    { source: 'PLC_FAULT_MONITOR', target: 'PLC_MASTER' },
    { source: 'PLC_MASTER', target: 'PLC_OUTPUT' },

    // Neural Inferencing Flow
    { source: 'NN_VISION', target: 'NN_TRANSFORMER' },
    { source: 'NN_PROPRIOCEPTION', target: 'NN_TRANSFORMER' },
    { source: 'NN_TRANSFORMER', target: 'NN_GRASP_INFERENCE' },
    { source: 'NN_GRASP_INFERENCE', target: 'NN_POLICY' },
    { source: 'NN_TRANSFORMER', target: 'NN_POLICY' },

    // Hybrid Coupling: Neural + PLC Output interlock
    { source: 'NN_POLICY', target: 'EVAL_GATE' },
    { source: 'BUS_STREAM', target: 'EVAL_GATE' },
    { source: 'PLC_OUTPUT', target: 'EVAL_GATE' }, // PLC hardware must permit final exec
  ]

  return { nodes, links }
}

export function NeuralPLCDataFlow() {
  const fgRef = useRef<any>(null)
  const [data, setData] = useState<any>({ nodes: [], links: [] })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // defer to avoid synchronous setState warning
    setTimeout(() => {
      setData(generatePLCNeuralData() as any)
    }, 0)
  }, [])

  // Auto-resize observer
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        })
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Slowly rotate the camera to give a "live CORE" feel
  useEffect(() => {
    let angle = 0
    let raf: number
    const rotateCamera = () => {
      if (fgRef.current) {
        fgRef.current.cameraPosition({
          x: 200 * Math.sin(angle),
          z: 200 * Math.cos(angle),
          y: Math.sin(angle) * 50
        })
        angle += 0.003
      }
      raf = requestAnimationFrame(rotateCamera)
    }
    rotateCamera()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <GlassPanel glow className="flex flex-col h-full min-h-[400px]">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Cpu className="w-4 h-4 text-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
          Neural-PLC Topology
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-muted-foreground/80">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            PLC Logic
          </span>
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-muted-foreground/80">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            Agent Logic
          </span>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 w-full relative bg-foreground/5 rounded-xl overflow-hidden border border-border/20">
        {/* Pulsing indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/20">
          <Activity className="w-3.5 h-3.5 text-foreground animate-pulse" />
          <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-300">Agent Logic Engine</h3>
        </div>

        {dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel="label"
            nodeRelSize={4}
            nodeColor={(node) => {
              if (node.group === 'plc') return '#ffffff'
              if (node.group === 'neural') return '#60a5fa' // nice CORE blue
              return '#9ca3af' // bus
            }}
            nodeResolution={16}
            linkOpacity={0.3}
            linkColor={() => '#ffffff'}
            linkDirectionalParticles={3}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={d => 0.005 + Math.random() * 0.005}
            linkDirectionalParticleColor={() => '#ffffff'}
            backgroundColor="rgba(0,0,0,0)"
            showNavInfo={false}
          />
        )}
      </div>
    </GlassPanel>
  )
}
