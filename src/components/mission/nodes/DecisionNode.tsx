import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({ data }: { data: any }) {
  return (
    <div className="bg-panel border border-white/10 px-4 py-3 min-w-[120px] rounded-sm text-xs hover:shadow-glow hover:border-yellow/50 transition-all duration-200">
      <Handle type="target" position={Position.Top} className="!bg-yellow !w-2 !h-2" />
      <div className="flex items-center gap-2">
         <span className="text-yellow">🧠</span> 
         <span className="uppercase tracking-widest font-mono text-[10px] text-white/80">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-yellow !w-2 !h-2" />
    </div>
  );
}
