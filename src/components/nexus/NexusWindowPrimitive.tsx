"use client";

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Move } from 'lucide-react';
import { useMotionValue, useTransform, useSpring } from 'framer-motion';

interface NexusWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultPos?: { x: number, y: number, width: number, height: number };
  onClose?: (id: string) => void;
  onLayoutChange?: (id: string, layout: { x: number, y: number, width: number, height: number, isCollapsed: boolean }) => void;
  onFocus?: (id: string) => void;
  zIndex?: number;
  isCollapsed?: boolean;
  layoutMode?: 'MANUAL' | 'GRID';
  hideHeader?: boolean;
}

/**
 * NexusWindowPrimitive
 * A production-grade windowing component for high-fidelity workspaces.
 * Supporting DND, Resizing, Collapsing, and Deletion with layout persistence.
 */
export function NexusWindowPrimitive({ 
  id, 
  title, 
  icon, 
  children, 
  defaultPos, 
  onClose, 
  onLayoutChange,
  onFocus,
  zIndex = 40,
  isCollapsed: controlledCollapsed = false,
  layoutMode = 'MANUAL',
  hideHeader = false
}: NexusWindowProps) {
  const [isCollapsed, setIsCollapsed] = useState(controlledCollapsed);
  const [size, setSize] = useState({ width: defaultPos?.width || 320, height: defaultPos?.height || 240 });
  const [position, setPosition] = useState({ x: defaultPos?.x || 0, y: defaultPos?.y || 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Spatial Depth Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [0, size.height], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, size.width], [-5, 5]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(size.width / 2);
    mouseY.set(size.height / 2);
    setIsHovered(false);
  };

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onLayoutChange?.(id, { ...position, ...size, isCollapsed: newState });
  };

  const WindowContent = (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: isCollapsed ? 0 : rotateX, rotateY: isCollapsed ? 0 : rotateY, transformStyle: "preserve-3d" }}
      className={`w-full h-full flex flex-col ${hideHeader ? 'bg-transparent border-none' : 'bg-black/85 backdrop-blur-3xl border ' + (isCollapsed ? 'border-slate-800' : 'border-slate-700/50')} rounded-2xl overflow-hidden relative shadow-[0_22px_70px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(255,255,255,0.05)_inset] transition-all duration-500`}
    >
      {/* Spatial Glass Base */}
        
        {/* Holographic Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Specular Glare (Reactive) */}
        <motion.div 
           style={{ 
             opacity: isHovered ? 0.3 : 0,
             x: useTransform(mouseX, [0, size.width], [20, -20]),
             y: useTransform(mouseY, [0, size.height], [20, -20])
           }}
           className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-[5]"
        />

        {/* Cinematic Header */}
        {!hideHeader && (
          <div className={`flex items-center justify-between px-5 h-11 bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/[0.02] select-none group z-10 ${layoutMode === 'MANUAL' ? 'nexus-drag-handle cursor-grab active:cursor-grabbing' : ''}`}>
            <div className="flex items-center gap-3.5">
               <div className="text-slate-500 transition-all duration-300 group-hover:text-cyan-400 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                 {icon || <Move className="w-3.5 h-3.5" />}
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] group-hover:text-white transition-colors leading-none">
                    {title}
                  </span>
                  <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Operational Matrix v2.5
                  </span>
               </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button 
                onClick={handleCollapse}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-all border border-transparent hover:border-white/10"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              </button>
              <button 
                onClick={() => onClose?.(id)}
                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden relative z-10">
             {!hideHeader && (
               <motion.div 
                 style={{ translateZ: 20 }}
                 className="absolute inset-0 bg-gradient-to-tr from-cyan-500/[0.03] to-transparent pointer-events-none" 
               />
             )}
             <div className="w-full h-full relative z-[11]">{children}</div>
          </div>
        )}
        
        {/* Neural Glow: Active Hub Indicator */}
        {!hideHeader && (
           <div className={`absolute bottom-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-[1px] transition-opacity duration-700 ${isCollapsed ? 'opacity-20' : 'opacity-100'}`} />
        )}
        
        {/* Spatial Corner Elements */}
        {!hideHeader && !isCollapsed && (
          <>
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/5 pointer-events-none rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/5 pointer-events-none rounded-bl-2xl" />
          </>
        )}
      </motion.div>
  );

  if (layoutMode === 'GRID') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onMouseDown={() => onFocus?.(id)}
        className={`w-full ${isCollapsed ? 'h-10' : 'h-full'} pointer-events-auto`}
        style={{ zIndex, perspective: 1000 }}
      >
        {WindowContent}
      </motion.div>
    );
  }

  return (
    <Rnd
      size={isCollapsed ? { width: size.width, height: 40 } : { width: size.width, height: size.height }}
      position={position}
      bounds="window"
      dragHandleClassName="nexus-drag-handle"
      enableResizing={!isCollapsed}
      minWidth={240}
      minHeight={100}
      onDragStart={() => onFocus?.(id)}
      onResizeStart={() => onFocus?.(id)}
      onDragStop={(e, d) => {
        const newPos = { x: d.x, y: d.y };
        setPosition(newPos);
        onLayoutChange?.(id, { ...newPos, ...size, isCollapsed });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
        setSize(newSize);
        setPosition(pos);
        onLayoutChange?.(id, { ...pos, ...newSize, isCollapsed });
      }}
      style={{ zIndex, perspective: 1000 }}
      className="p-1 pointer-events-auto"
    >
      <div onMouseDown={() => onFocus?.(id)} className="w-full h-full">
        {WindowContent}
      </div>
    </Rnd>
  );
}
