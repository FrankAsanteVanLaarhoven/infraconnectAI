import { Handle, Position } from '@xyflow/react';
import { Database, Activity } from 'lucide-react';

export function ConnectorNode({ data }: { data: { label: string; status?: string } }) {
  const isConnected = data.status === 'connected';

  return (
    <div className="w-64 rounded-sm bg-[#0a0b0c] border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Target input handle (sometimes connectors receive settings) */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-500 border-none" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-300" />
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest">{data.label}</span>
        </div>
        {isConnected && <Activity className="w-3 h-3 text-slate-300" />}
      </div>

      {/* Body: Zero-Friction Status */}
      <div className="px-4 py-4 relative">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Sync State</span>
          <span className={`text-[10px] uppercase font-mono tracking-wider ${isConnected ? 'text-slate-300' : 'text-yellow-500'}`}>
            {isConnected ? 'STREAMING' : 'DISCOVERING'}
          </span>
        </div>

        {/* Fake telemetry bar */}
        <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
          <div className={`h-full bg-slate-800 transition-all ${isConnected ? 'w-full ' : 'w-1/3 opacity-50'}`} />
        </div>
        
        {!isConnected && (
            <p className="mt-3 text-[9px] text-slate-500 font-mono">Agent auto-discovering schema. No API keys required.</p>
        )}
      </div>

      {/* Output handle (streams data outward) */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-800 border-none right-[-6px]" />
    </div>
  );
}
