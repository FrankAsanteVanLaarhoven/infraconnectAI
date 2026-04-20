import { Handle, Position } from "@xyflow/react";

export default function ActionNode({ data }: { data: any }) {
  return (
    <div className="bg-panel border border-white/10 px-4 py-3 min-w-[120px] rounded-sm text-xs hover:shadow-glow hover:border-cyan/50 transition-all duration-200">
      <Handle type="target" position={Position.Top} className="!bg-cyan !w-2 !h-2" />
      <div className="flex items-center gap-2">
         <span className="text-cyan">⚙</span> 
         <span className="uppercase tracking-widest font-mono text-[10px] text-white/80">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan !w-2 !h-2" />
    </div>
  );
}
