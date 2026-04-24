import { Handle, Position } from '@xyflow/react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function HardwareNode({ data }: { data: { label: string; robotId: string; svr?: number; dmr?: number; status?: string } }) {
  const isOptimal = (data.svr || 0) < 0.05;

  return (
    <div className="w-72 rounded-sm bg-[#0a0f14] border border-cyan-900/40 relative overflow-hidden group">
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500 border-none left-[-6px]" />
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-900/20 bg-cyan-950/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-[10px] font-black text-slate-200 uppercase tracking-widest">{data.label}</span>
        </div>
        <div className={`w-2 h-2 rounded-sm ${isOptimal ? 'bg-cyan-500 ' : 'bg-red-500 '}`} />
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[8px] text-slate-600 font-black uppercase">Asset ID</span>
          <span className="text-[9px] text-slate-300 font-mono">{data.robotId}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <p className="text-[7px] text-slate-600 font-black uppercase mb-1">Stability (SVR)</p>
              <div className="flex items-center gap-1.5">
                 <ShieldCheck className={`w-3 h-3 ${isOptimal ? 'text-cyan-500' : 'text-red-500'}`} />
                 <span className="text-[10px] font-black text-white">{(100 - (data.svr || 0) * 100).toFixed(2)}%</span>
              </div>
           </div>
           <div>
              <p className="text-[7px] text-slate-600 font-black uppercase mb-1">Latency (DMR)</p>
              <div className="flex items-center gap-1.5">
                 <Zap className="w-3 h-3 text-cyan-700" />
                 <span className="text-[10px] font-black text-cyan-800">{(data.dmr || 0.002).toFixed(3)}ms</span>
              </div>
           </div>
        </div>

        {/* Real-time pulse bar */}
        <div className="h-0.5 w-full bg-slate-900 rounded-sm overflow-hidden">
           <motion.div 
             animate={{ width: ['20%', '100%', '20%'] }}
             transition={{ repeat: Infinity, duration: 3 }}
             className="h-full bg-cyan-500"
           />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-500 border-none right-[-6px]" />
    </div>
  );
}
