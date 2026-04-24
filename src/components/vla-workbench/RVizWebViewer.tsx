'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Activity } from 'lucide-react';

export function RVizWebViewer() {
  return (
    <div className="w-full h-full min-h-[400px] bg-black rounded-sm overflow-hidden border border-white/5 relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <span className="text-[10px] text-slate-400 tracking-widest uppercase font-mono">RViz Spatial Tracker</span>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <Activity className="w-4 h-4 text-slate-600" />
      </div>

      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* RViz style grid - darker for premium feel */}
        <Grid 
          args={[20, 20]} 
          cellSize={0.5} 
          cellColor="#1a1a1a" 
          sectionColor="#2a2a2a" 
          fadeDistance={30}
        />

        {/* Placeholder for robot model + TF tree (subdued color) */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.6]} />
          <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.2} />
        </mesh>

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going under the grid
        />
      </Canvas>

      {/* Overlays to simulate UI depth */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="text-[10px] text-slate-600 font-mono">TF_TREE: ACTIVE</div>
        <div className="text-[10px] text-slate-600 font-mono">MAP: /map (LOCAL)</div>
      </div>
    </div>
  );
}
