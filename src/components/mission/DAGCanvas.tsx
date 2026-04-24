"use client";

import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCallback, useEffect } from "react";
import { publish, subscribe } from "@/lib/core/bus";

import ActionNode from "./nodes/ActionNode";
import DecisionNode from "./nodes/DecisionNode";

const nodeTypes = {
  action: ActionNode,
  decision: DecisionNode,
};

const initialNodes = [
  { id: "1", position: { x: 250, y: 50 }, data: { label: "Detect" }, type: "action" },
  { id: "2", position: { x: 250, y: 150 }, data: { label: "Plan" }, type: "decision" },
  { id: "3", position: { x: 250, y: 250 }, data: { label: "Act" }, type: "action" },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: '#4CC9F0' } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: '#4CC9F0' } },
];

export default function DAGCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const runMission = () => {
    publish("mission.execute", {
      nodes,
      edges,
    });
  };

  // Synchronous visual execution highlighting seamlessly mapping bounding telemetry nodes logically seamlessly
  useEffect(() => {
    const unbind = subscribe("mission.node.start", (e: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === e.node.id
            ? { ...n, style: { border: "1px solid #EAB308", boxShadow: "0 0 20px rgba(234,179,8,0.3)" } }
            : { ...n, style: {} }
        )
      );
    });
    
    // Complete visual resets natively securely tracking array nodes
    const unbindDone = subscribe("system.calibration_run", () => {
      setNodes((nds) => nds.map((n) => ({...n, style: {}})));
    });

    return () => {
        unbind();
        unbindDone();
    };
  }, [setNodes]);

  return (
    <div className="w-full h-full bg-[#050607] relative">
      
      <div className="absolute top-4 left-4 text-xs text-[#4CC9F0] z-10 uppercase tracking-widest font-bold">
           Execution Graph
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background gap={20} color="#1A1F24" />
        <Controls className="!bg-[#0B0F12] !border-[#1A1F24] !fill-white" />
      </ReactFlow>

      {/* Manual Interactive Exec Override limits mapped locally explicitly natively */}
      <button
        onClick={runMission}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#4CC9F0] text-black font-bold uppercase tracking-widest px-8 py-3 text-xs hover:scale-105 transition-transform z-10"
      >
        Execute Run
      </button>

    </div>
  );
}
