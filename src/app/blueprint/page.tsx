'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, Zap, Cpu, Network } from 'lucide-react';
import { ConnectorNode } from '@/components/blueprint/nodes/ConnectorNode';
import { AINode } from '@/components/blueprint/nodes/AINode';
import { HardwareNode } from '@/components/blueprint/nodes/HardwareNode';
import { Omnibar } from '@/components/ui/omnibar';
import { IntentTopology } from '@/lib/dag-engine';
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';

export default function BlueprintCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopology() {
      try {
        const res = await fetch('/api/nexus/blueprint');
        const json = await res.json();
        setNodes(json.nodes);
        setEdges(json.edges);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopology();
    const interval = setInterval(fetchTopology, 30000); // 30s re-discovery
    return () => clearInterval(interval);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({ connector: ConnectorNode, ai: AINode, hardware: HardwareNode }), []);

  const addNode = (type: string, label: string, extraData: any = {}) => {
    const newNode = {
      id: crypto.randomUUID(),
      type,
      position: { x: 50, y: Math.random() * 300 + 50 },
      data: { label, ...extraData },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSemanticIntent = (topology: IntentTopology) => {
    const newNodes = topology.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: 50 + (n.xPosOffset * 300), y: Math.random() * 100 + 100 },
      data: { label: n.label, ...n.extraData }
    }));
    
    const newEdges = topology.edges.map((e) => ({
      id: `edge-${crypto.randomUUID()}`,
      source: e.sourceId,
      target: e.targetId,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  };

  const simulateInstall = () => {
    setIsInstalling(true);
    setLogs(["[SYSTEM] curl -fsSL https://connect.infraconnect.ai/install.sh | bash"]);
    
    // Auto-discover stream simulation
    const steps = [
      "[INSTALL] Agent downloaded (v1.0.0-beta)",
      "[AUTH] SPIFFE/Hardware identity bound",
      "[TRANSPORT] Established mTLS WebSocket tunnel",
      "[INFO] Universal Protocol Engine Initialized",
      "[DISCOVERY] Scanning infrastructure for resources...",
      "[DISCOVERY] Discovered 1 Postgres Instance (Local)",
      "[DISCOVERY] Found 12 Tables synced to Platform."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLogs((prev) => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsInstalling(false);
          // Auto-inject discovered database into canvas
          addNode('connector', 'Core Prod DB (Local)', { status: 'connected' });
          setLogs([]);
        }, 1500);
      }
    }, 700);
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white">
      {/* Sidebar Library */}
      <aside className="w-80 border-r border-slate-800 bg-[#0a0b0c] p-4 flex flex-col gap-4 z-10 relative">
        <div className="mb-6 flex -ml-1">
           <InfraConnectLogo size="sm" variant="flat" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-5 h-5 text-blue-400" />
          <h2 className="font-mono font-bold tracking-widest text-sm text-slate-200 uppercase">Blueprints</h2>
        </div>
        
        <div 
          onClick={() => addNode('connector', 'Customer Postgres', { status: 'discovering' })}
          className="bg-[#111214] border border-slate-800 rounded p-3 flex items-center justify-between cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono">PostgreSQL</span>
          </div>
          <span className="text-[9px] font-mono bg-slate-800 px-1 rounded text-slate-400">Agent</span>
        </div>
        
        <div 
          onClick={() => addNode('connector', 'Event Stream', { status: 'connected' })}
          className="bg-[#111214] border border-slate-800 rounded p-3 flex items-center justify-between cursor-pointer hover:border-slate-600 transition-colors"
        >
           <div className="flex items-center gap-3">
             <Zap className="w-4 h-4 text-yellow-400" />
             <span className="text-xs font-mono">Kafka / NATS</span>
           </div>
           <span className="text-[9px] font-mono bg-slate-800 px-1 rounded text-slate-400">Bus</span>
        </div>
        
        <div 
          onClick={() => addNode('ai', 'Normalization Engine', { mode: 'embedding' })}
          className="bg-[#111214] border border-slate-800 rounded p-3 flex items-center justify-between cursor-pointer hover:border-slate-600 transition-colors"
        >
           <div className="flex items-center gap-3">
             <Cpu className="w-4 h-4 text-purple-400" />
             <span className="text-xs font-mono">Semantic Pipeline</span>
           </div>
           <span className="text-[9px] font-mono bg-slate-800 px-1 rounded text-slate-400">AI</span>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
           <button 
             onClick={simulateInstall}
             disabled={isInstalling}
             className="w-full bg-slate-100 text-black uppercase tracking-widest text-[10px] font-bold py-3 hover:bg-white disabled:opacity-50"
           >
             Deploy Edge Node (GEN)
           </button>
        </div>

        {/* Live Install Logs Overlay */}
        {isInstalling && (
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md p-4 z-20 flex flex-col pt-12">
            <h3 className="text-green-400 font-mono text-[10px] uppercase mb-4 animate-pulse">Live Uplink Stream</h3>
            <div className="flex-1 font-mono text-[10px] text-slate-400 space-y-2 overflow-y-auto w-[250px]">
              {logs.map((log, i) => (
                <div key={i} className={i === logs.length - 1 ? 'text-white' : ''}>{log}</div>
              ))}
              <div className="w-2 h-4 bg-white animate-pulse inline-block align-middle ml-1" />
            </div>
          </div>
        )}
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          colorMode="dark"
          fitView
        >
          <Controls />
          <Background color="#334155" size={1} gap={24} />
        </ReactFlow>
        <Omnibar onExecuteTopology={handleSemanticIntent} />
      </main>
    </div>
  );
}
