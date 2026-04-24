'use client';

import { useEffect, useState } from 'react';
// Using a local mock store since the exact store path may not exist or might fail
// import { useVlaWorkbenchStore } from '@/store/vlaWorkbenchStore';
import { ros2TelemetryEngine } from '@/lib/infrarobotics/telemetry';
import { Cpu, Activity, Zap, ShieldAlert, ThermometerSun } from 'lucide-react';

export function ROS2TelemetryDashboard() {
  // const { currentRobotId } = useVlaWorkbenchStore();
  const currentRobotId = 'yahboom-m3-pro-01'; // Mocked for immediate visibility
  const [jointStates, setJointStates] = useState<any>(null);
  const [battery, setBattery] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    if (!currentRobotId) return;

    const fetchData = async () => {
      const joints = await ros2TelemetryEngine.getLiveJointStates(currentRobotId);
      const bat = await ros2TelemetryEngine.getBatteryAndThermal(currentRobotId);
      const anoms = await ros2TelemetryEngine.detectAnomalies(currentRobotId);

      setJointStates(joints);
      setBattery(bat);
      setAnomalies(anoms);
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // 1Hz update
    return () => clearInterval(interval);
  }, [currentRobotId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 font-mono">
      {/* Joint States */}
      <div className="bg-black border border-white/5 rounded-sm p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Activity className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
          <Cpu className="w-4 h-4 text-slate-400" />
          <div className="text-xs tracking-widest uppercase text-slate-300">Live Joint States</div>
        </div>
        
        {jointStates ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Effort (N·m)</div>
              <div className="text-xs text-slate-300 flex flex-col gap-1">
                {jointStates.data?.effort?.map((e: number, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-slate-500">J{i}</span>
                    <span className={e > 40 ? "text-red-400" : "text-slate-300"}>{e.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Position (Rad)</div>
              <div className="text-xs text-slate-300 flex flex-col gap-1">
                {jointStates.data?.position?.map((p: number, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-slate-500">J{i}</span>
                    <span>{p.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-600 text-xs">Awaiting telemetry...</div>
        )}
      </div>

      {/* Battery & Thermal */}
      <div className="bg-black border border-white/5 rounded-sm p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Zap className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
          <ThermometerSun className="w-4 h-4 text-slate-400" />
          <div className="text-xs tracking-widest uppercase text-slate-300">Power & Thermal</div>
        </div>

        {battery ? (
          <div className="space-y-6 mt-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Core Power</span>
                <span className="text-lg text-slate-200">{battery.data?.percentage}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-slate-400 transition-all duration-1000" 
                  style={{ width: `${battery.data?.percentage || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Thermal Load</span>
                <span className={`text-lg ${battery.data?.temperature > 40 ? 'text-red-400' : 'text-slate-200'}`}>
                  {battery.data?.temperature}°C
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-none overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${battery.data?.temperature > 40 ? 'bg-red-500' : 'bg-slate-400'}`} 
                  style={{ width: `${Math.min(((battery.data?.temperature || 0) / 80) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-600 text-xs">No telemetry established</div>
        )}
      </div>

      {/* Anomalies */}
      <div className="lg:col-span-2 bg-black border border-white/5 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <div className="text-xs tracking-widest uppercase text-slate-500">Anomaly Detection Array</div>
        </div>

        {anomalies.length > 0 ? (
          <div className="grid gap-2">
            {anomalies.map((a, i) => (
              <div key={i} className="bg-red-950/20 border border-red-900/30 p-3 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs text-red-200">{a.message}</span>
                </div>
                <span className="text-[10px] text-red-500/50 uppercase tracking-widest">{a.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center border border-dashed border-white/5 rounded-sm">
            <span className="text-[10px] text-slate-600 tracking-widest uppercase">No Active Anomalies Detected</span>
          </div>
        )}
      </div>
    </div>
  );
}
