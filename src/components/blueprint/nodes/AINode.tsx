import { Handle, Position } from '@xyflow/react';
import { BrainCircuit, Sparkles } from 'lucide-react';

export function AINode({ data }: { data: { label: string; mode?: string } }) {
  const isEmbed = data.mode === 'embedding';

  return (
    <div className="w-72 rounded-lg bg-[#0d0a15] border border-purple-900/50 shadow-[0_0_25px_rgba(147,51,234,0.15)] relative overflow-hidden group">
      {/* Target input handle (Receives raw events from Bus or Connector) */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] border-none left-[-6px]" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-900/30 flex items-center justify-between bg-black/60">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest">{data.label}</span>
        </div>
        <Sparkles className="w-3 h-3 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Body: Zero-Friction Status */}
      <div className="px-4 py-4 relative">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Engine Mode</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400">
            {isEmbed ? 'VECTORIZE' : 'SEMANTIC GRAPH'}
          </span>
        </div>
        
        <p className="mt-1 text-[10px] text-slate-400 font-mono tracking-tight leading-relaxed">
          {isEmbed ? "Translating raw topology streams into high-dimensional embeddings." : "Mapping relationships into Neo4j Semantic Knowledge Graph."}
        </p>
      </div>

      {/* Output handle (streams AI-ready data outward) */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] border-none right-[-6px]" />
    </div>
  );
}
