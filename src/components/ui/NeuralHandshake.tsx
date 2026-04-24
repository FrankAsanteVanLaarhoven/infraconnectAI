"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralHandshakeProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const NeuralHandshake: React.FC<NeuralHandshakeProps> = ({ isVisible, onComplete }) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Neural Mesh Background */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
          />

          {/* Glowing Aperture */}
          <motion.div 
            initial={{ width: 0, height: 2 }}
            animate={{ width: "100%", height: 2 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-cyan-500 z-10"
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-20 flex flex-col items-center"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-2 h-2 rounded-sm bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black text-white tracking-[0.8em] uppercase">Neural Uplink Synchronizing</span>
            </div>
            <div className="text-[8px] text-cyan-400 font-mono tracking-widest opacity-60">LAYER HANDSHAKE // 0xCC77A // STABLE</div>
          </motion.div>

          {/* Random Neural Particles */}
          {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ 
                 x: (Math.random() - 0.5) * 1000, 
                 y: (Math.random() - 0.5) * 600, 
                 opacity: 0,
                 scale: 0
               }}
               animate={{ 
                 opacity: [0, 1, 0],
                 scale: [0, 1, 0],
                 x: (Math.random() - 0.5) * 1200,
                 y: (Math.random() - 0.5) * 800
               }}
               transition={{ 
                 duration: 1.5, 
                 repeat: Infinity, 
                 delay: Math.random() * 0.5 
               }}
               className="absolute w-1 h-1 bg-cyan-400 rounded-sm blur-[1px]"
             />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
