'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

/**
 * PhysicsHealthRadar — 6-axis radar chart showing episode quality dimensions.
 * Extends the governance health model with physics-specific signals.
 */

interface PhysicsHealthRadarProps {
  physicsRealism: number;
  sensorFidelity: number;
  languageGrounding: number;
  actionSuccess: number;
  dataQuality: number;
  modelConfidence: number; // Inverse of normalized loss
}

export default function PhysicsHealthRadar(props: PhysicsHealthRadarProps) {
  const data = [
    { axis: 'Physics', value: props.physicsRealism * 100, fullMark: 100 },
    { axis: 'Sensors', value: props.sensorFidelity * 100, fullMark: 100 },
    { axis: 'Language', value: props.languageGrounding * 100, fullMark: 100 },
    { axis: 'Actions', value: props.actionSuccess * 100, fullMark: 100 },
    { axis: 'Data Quality', value: props.dataQuality * 100, fullMark: 100 },
    { axis: 'Confidence', value: props.modelConfidence * 100, fullMark: 100 },
  ];

  const avgScore = (
    props.physicsRealism + props.sensorFidelity + props.languageGrounding +
    props.actionSuccess + props.dataQuality + props.modelConfidence
  ) / 6;

  const scoreColor = avgScore >= 0.75 ? '#22c55e' : avgScore >= 0.55 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Physics Health Radar</h3>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: scoreColor }} />
          <span className="text-xs font-bold text-white/80">{(avgScore * 100).toFixed(0)}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%">
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Quality"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
