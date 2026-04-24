"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, GraduationCap, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Activity } from "lucide-react";
import { YAHBOOM_M3_PROFILE } from "../../lib/robotics/profiles/yahboom-m3";
import { AcademyPanel } from "./AcademyPanel";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { URDFRobot } from "../control-plane/3d/URDFRobot";
import * as THREE from "three";

// Re-engineered Fiber loop integrating the high-fidelity native fallback URDF
function SimulationScene({ robotState }: { robotState: any }) {
    const ringRef = useRef<THREE.Mesh>(null);
    const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state, delta) => {
       // Circular Abstract LiDAR pulse
       if (ringRef.current && ringMatRef.current) {
          ringRef.current.scale.x += delta * 4;
          ringRef.current.scale.y += delta * 4;
          ringMatRef.current.opacity -= delta * 0.8;
          if (ringRef.current.scale.x > 3.5) {
             ringRef.current.scale.set(0.1, 0.1, 1);
             ringMatRef.current.opacity = 0.6;
          }
       }
    });

    return (
       <group>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} />
          <Grid infiniteGrid fadeDistance={40} sectionColor="#06b6d4" cellColor="#1A1D21" />
          
          <group 
             position={[robotState.translation.x, robotState.translation.y, robotState.translation.z]}
             rotation={[robotState.rotation.x, robotState.rotation.y, robotState.rotation.z]}
          >
             <URDFRobot {...{joints: robotState.joints} as any} />

             {/* Semantic LiDAR Point Cloud Wave Overlay */}
             <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.65, 0]}>
                <ringGeometry args={[0.5, 0.55, 64]} />
                <meshBasicMaterial ref={ringMatRef} color="#14b8a6" transparent opacity={0.6} side={THREE.DoubleSide} />
             </mesh>
          </group>
       </group>
    );
}

export function RobotViewer() {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [showAcademy, setShowAcademy] = useState(false);
  
  // UI State toggles
  const [telemetryExpanded, setTelemetryExpanded] = useState(true);
  const [interconnectExpanded, setInterconnectExpanded] = useState(true);

  // Unified interactive kinematic state
  const [robotState, setRobotState] = useState({
      translation: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      joints: { base: 0, link1: 0, link2: 0, link3: 0 }
  });

  useEffect(() => {
    // Hardware bridge mock pipeline
    setTimeout(() => setStatus("connected"), 800);
  }, []);

  const drive = (axis: 'z' | 'rot', amount: number) => {
     setRobotState(prev => {
        const rot = prev.rotation.y;
        if (axis === 'rot') {
           return { ...prev, rotation: { ...prev.rotation, y: prev.rotation.y + amount } };
        }
        // Basic trigonometric forward/backward drive
        return {
           ...prev,
           translation: {
              ...prev.translation,
              x: prev.translation.x + Math.sin(rot) * amount,
              z: prev.translation.z + Math.cos(rot) * amount
           }
        }
     });
  };

  const updateJoint = (joint: 'base' | 'link1' | 'link2' | 'link3', val: number) => {
     setRobotState(prev => ({
        ...prev,
        joints: { ...prev.joints, [joint]: val }
     }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#030405] rounded-sm border border-white/10 overflow-hidden relative group">
      
      {/* Primary WebGL Fiber Interactive Mount */}
      <div className="flex-1 w-full h-full relative z-0">
          <Canvas camera={{ position: [5, 4, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
              <color attach="background" args={['#050607']} />
              <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
              <SimulationScene robotState={robotState} />
          </Canvas>
      </div>

      {/* Simulation Overlay Banner */}
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 backdrop-blur rounded border border-white/10 pointer-events-auto">
            {status === "connecting" ? (
                <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
            ) : status === "connected" ? (
                <div className="w-2 h-2 rounded-sm bg-slate-800" />
            ) : (
                <div className="w-2 h-2 rounded-sm bg-red-500" />
            )}
            <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">
              OMNIVERSE ISAAC SIM // WEBGL PROJECTION
            </span>
        </div>
        <div className="flex gap-2 pointer-events-auto">
            <span className="text-[10px] px-2 py-1 bg-cyan-900/40 text-cyan-400 font-mono rounded border border-cyan-500/30 uppercase">
                INTERACTIVE MODE
            </span>
        </div>
      </div>
    
      {/* Interconnect Protocol Overlay (Collapsible) */}
      <div className="absolute top-12 left-4 w-64 bg-black/80 border border-white/10 rounded font-mono text-[10px] shadow-lg backdrop-blur z-10">
         <div 
             className="p-3 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/5"
             onClick={() => setInterconnectExpanded(!interconnectExpanded)}
         >
            <span className="text-white/40">INTERCONNECT PROTOCOL</span>
            <div className="flex gap-2 items-center">
                <span className="text-slate-300">ACTIVE</span>
                {interconnectExpanded ? <ChevronUp className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
            </div>
         </div>
         {interconnectExpanded && (
             <div className="p-3 flex flex-col gap-1 text-cyan-400">
                <div><span className="text-white/60">DRIVE SOURCE:</span> {YAHBOOM_M3_PROFILE.inputs.active}</div>
                <div><span className="text-white/60">AVAILABLE BACKUP:</span> {YAHBOOM_M3_PROFILE.inputs.available.join(" | ")}</div>
             </div>
         )}
      </div>

      <div className="absolute top-12 right-4 flex items-center gap-2 z-10">
        <button 
           onClick={() => setShowAcademy(true)}
           className="px-3 py-1 flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] rounded hover:bg-slate-800 transition-colors pointer-events-auto"
        >
           <GraduationCap className="h-3 w-3" />
           AGENT LEARNING ACADEMY
        </button>
      </div>

      {showAcademy && (
          <AcademyPanel onClose={() => setShowAcademy(false)} />
      )}

      {/* Telemetry Target Lock Overlay (Collapsible) */}
      <div className="absolute bottom-4 left-4 w-80 bg-black/80 border border-white/10 rounded font-mono text-[10px] shadow-lg backdrop-blur z-10 pointer-events-auto">
          <div 
              className="p-3 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/5"
              onClick={() => setTelemetryExpanded(!telemetryExpanded)}
          >
              <div className="text-white/40">M3 PRO TELEMETRY (EDGE-NODE)</div>
              {telemetryExpanded ? <ChevronUp className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
          </div>
          
          {telemetryExpanded && (
              <div className="p-3 flex flex-col gap-1 text-cyan-400">
                  <div><span className="text-white/60">TARGET:</span> {YAHBOOM_M3_PROFILE.name}</div>
                  <div><span className="text-white/60">BATTERY:</span> {YAHBOOM_M3_PROFILE.control.batteryCapacity} PACK [<span className="text-slate-300 font-bold">100%</span>]</div>
                  <div><span className="text-white/60">LATENCY:</span> 2s (DECISION) | 4s (TASK LOAD)</div>
                  <div><span className="text-white/60">PIPELINE:</span> OpenCV / MediaPipe TRACKING [{YAHBOOM_M3_PROFILE.vision.rgbFps}fps]</div>
                  <div><span className="text-white/60">MODELS:</span> LLM / VOICE / VISUAL LLM [RAG ACTIVE]</div>
                  
                  {/* Diagnostics Extension Panel */}
                  <div className="grid grid-cols-2 gap-x-4 mt-2 pt-2 border-t border-white/5 text-[9px]">
                    <div><span className="text-white/60">MCU BOUND:</span> {YAHBOOM_M3_PROFILE.control.mcu}</div>
                    <div><span className="text-white/60">IMU SYNC:</span> {YAHBOOM_M3_PROFILE.control.imu}</div>
                    <div><span className="text-white/60">ARM DOF:</span> {YAHBOOM_M3_PROFILE.kinematics.dof}-Axis / {YAHBOOM_M3_PROFILE.kinematics.servoType}</div>
                    <div><span className="text-white/60">PAYLOAD:</span> max {YAHBOOM_M3_PROFILE.kinematics.payloadLimitGrams}g @ {YAHBOOM_M3_PROFILE.kinematics.maxRadiusCm}cm</div>
                    <div><span className="text-white/60">LIDAR:</span> {YAHBOOM_M3_PROFILE.perception.lidarCount}x {YAHBOOM_M3_PROFILE.perception.lidarType}</div>
                    <div><span className="text-white/60">LIDAR RNG:</span> {YAHBOOM_M3_PROFILE.perception.rangeMinM}m - {YAHBOOM_M3_PROFILE.perception.rangeMaxM}m</div>
                    <div><span className="text-white/60">CAMERA:</span> {YAHBOOM_M3_PROFILE.vision.cameraType}</div>
                    <div><span className="text-white/60">SUSPENSION:</span> {YAHBOOM_M3_PROFILE.chassis.suspension}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 mt-2 pt-2 border-t border-white/5">
                    <div><span className="text-white/60">POS X:</span> {robotState.translation.x.toFixed(3)}</div>
                    <div><span className="text-white/60">POS Z:</span> {robotState.translation.z.toFixed(3)}</div>
                  </div>
              </div>
          )}
      </div>

      {/* Universal Control Center Desktop Module */}
      <div className="absolute bottom-4 right-4 bg-black/80 border border-white/10 rounded-sm p-4 shadow-2xl backdrop-blur-md z-10 pointer-events-auto flex flex-col gap-4 min-w-[320px]">
         <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-cyan-400 font-mono text-xs font-bold flex items-center gap-2">
                <Activity className="w-3 h-3 text-slate-300" /> REAL-TIME CONTROL CENTER
            </h3>
            <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded uppercase tracking-wider font-mono">Kinematics Priority</span>
         </div>

         <div className="flex gap-6 relative">
            {/* D-Pad Base Movement Array */}
            <div className="flex flex-col items-center gap-1 justify-center flex-1 py-2">
               <button onClick={() => drive('z', 0.2)} className="bg-white/5 hover:bg-slate-800 p-2 rounded text-white/50 hover:text-slate-300 transition-colors border border-white/5">
                  <ArrowUp className="w-4 h-4" />
               </button>
               <div className="flex gap-1">
                  <button onClick={() => drive('rot', 0.2)} className="bg-white/5 hover:bg-slate-800 p-2 rounded text-white/50 hover:text-slate-300 transition-colors border border-white/5">
                     <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => drive('z', -0.2)} className="bg-white/5 hover:bg-slate-800 p-2 rounded text-white/50 hover:text-slate-300 transition-colors border border-white/5">
                     <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => drive('rot', -0.2)} className="bg-white/5 hover:bg-slate-800 p-2 rounded text-white/50 hover:text-slate-300 transition-colors border border-white/5">
                     <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
               <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1 text-center font-bold">Mecanum Drive</span>
            </div>

            <div className="w-[1px] bg-white/10" />

            {/* 6DOF Robotic Arm Joint Sliders */}
            <div className="flex-1 flex flex-col gap-2 relative">
               <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-400"><span>ARM PAN</span> <span>{robotState.joints.base.toFixed(2)}rad</span></div>
                  <input type="range" min={-Math.PI} max={Math.PI} step={0.1} value={robotState.joints.base} onChange={(e) => updateJoint('base', parseFloat(e.target.value))} className="w-full accent-cyan-500 h-1 bg-white/10 appearance-none rounded-sm" />
               </div>
               <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-400"><span>SHOULDER</span> <span>{robotState.joints.link1.toFixed(2)}rad</span></div>
                  <input type="range" min={-Math.PI/2} max={Math.PI/2} step={0.1} value={robotState.joints.link1} onChange={(e) => updateJoint('link1', parseFloat(e.target.value))} className="w-full accent-cyan-500 h-1 bg-white/10 appearance-none rounded-sm" />
               </div>
               <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-400"><span>ELBOW</span> <span>{robotState.joints.link2.toFixed(2)}rad</span></div>
                  <input type="range" min={-Math.PI/2} max={Math.PI/2} step={0.1} value={robotState.joints.link2} onChange={(e) => updateJoint('link2', parseFloat(e.target.value))} className="w-full accent-cyan-500 h-1 bg-white/10 appearance-none rounded-sm" />
               </div>
               <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-400"><span>GRIPPER TILT</span> <span>{robotState.joints.link3.toFixed(2)}rad</span></div>
                  <input type="range" min={-Math.PI/2} max={Math.PI/2} step={0.1} value={robotState.joints.link3} onChange={(e) => updateJoint('link3', parseFloat(e.target.value))} className="w-full accent-cyan-500 h-1 bg-white/10 appearance-none rounded-sm" />
               </div>
            </div>
         </div>

         {/* Core Capabilities */}
         <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/10">
            <button className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] font-mono p-1 rounded transition-colors text-center font-bold tracking-widest uppercase">Start SLAM</button>
            <button className="bg-slate-800 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono p-1 rounded transition-colors text-center font-bold tracking-widest uppercase">DCW2 FUSION</button>
         </div>
      </div>
    </div>
  );
}
