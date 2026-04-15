"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { 
  User, 
  Video, 
  VideoOff, 
  X, 
  Maximize2, 
  Minimize2, 
  FlipHorizontal,
  Settings2,
  Mic,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass/GlassPanel';

interface CameraPresenterProps {
  onClose: () => void;
}

export function CameraPresenter({ onClose }: CameraPresenterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("CAMERA_ACCESS_DENIED");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  if (!isMounted) return null;

  return (
    <Rnd
      default={{
        x: window.innerWidth - 340,
        y: window.innerHeight - 240,
        width: 320,
        height: 180,
      }}
      minWidth={160}
      minHeight={90}
      lockAspectRatio={16/9}
      bounds="window"
      className="z-[999]"
      dragHandleClassName="presenter-drag-handle"
    >
      <div className="group relative w-full h-full">
        
        {/* SOTA BORDER & GLOW */}
        <div className="absolute -inset-[1px] bg-cyan-500/30 rounded-xl blur-[2px] opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <GlassCard className="w-full h-full bg-black/80 border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col pt-0">
           
           {/* Top Meta Bar (Drag Handle) */}
           <div className="presenter-drag-handle h-6 flex items-center justify-between px-3 bg-cyan-950/20 border-b border-cyan-500/20 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                 <span className="text-[8px] font-black font-mono uppercase text-cyan-500 tracking-widest">Presenter_Uplink // Live</span>
              </div>
              <div className="flex items-center gap-1">
                 <button onClick={() => setIsMirrored(!isMirrored)} className="p-1 hover:text-cyan-400 text-slate-500 transition-colors">
                    <FlipHorizontal className="w-2.5 h-2.5" />
                 </button>
                 <button onClick={onClose} className="p-1 hover:text-red-500 text-slate-500 transition-colors">
                    <X className="w-2.5 h-2.5" />
                 </button>
              </div>
           </div>

           {/* Video Feed Area */}
           <div className="flex-1 relative bg-slate-900/40 flex items-center justify-center overflow-hidden">
              {error ? (
                <div className="flex flex-col items-center gap-3 text-center px-6">
                   <VideoOff className="w-8 h-8 text-red-500/50" />
                   <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">
                      Camera_Access_Denied<br/>Manual_Override_Required
                   </p>
                </div>
              ) : !stream ? (
                <div className="flex flex-col items-center gap-3">
                   <Activity className="w-6 h-6 text-cyan-500/30 animate-spin" />
                   <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Syncing_Stream...</span>
                </div>
              ) : (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-500",
                    isMirrored && "scale-x-[-1]"
                  )}
                />
              )}

              {/* Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20" />
              
              {/* Corner Metadata */}
              <div className="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
                 <div className="text-[7px] font-mono text-cyan-500/70 uppercase">ID: PRESENT_01</div>
                 <div className="text-[7px] font-mono text-cyan-500/40 uppercase tabular-nums">1080P // 60FPS</div>
              </div>

              {/* SOTA Lens HUD */}
              <div className="absolute inset-0 border border-cyan-500/10 pointer-events-none">
                 <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-500/30" />
                 <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-500/30" />
              </div>
           </div>

        </GlassCard>
      </div>
    </Rnd>
  );
}
