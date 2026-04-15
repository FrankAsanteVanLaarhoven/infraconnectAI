"use client";

import { useCallback, useRef, useState, useEffect } from 'react';

export function useSfx() {
  const audioCtx = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize lazily to prevent browser auto-play block issues
  const initCtx = () => {
    if (!audioCtx.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
          audioCtx.current = new AudioContextClass();
      }
    }
    // Browser resumes context if suspended
    if (audioCtx.current && audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
    }
  };

  const playClick = useCallback(() => {
    if (isMuted) return;
    initCtx();
    
    if (audioCtx.current) {
      const t = audioCtx.current.currentTime;
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      
      // NASA UI aesthetic: sharp high frequency sine sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
      
      // Sharp decay
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }, [isMuted]);

  const playHov = useCallback(() => {
    if (isMuted) return;
    initCtx();
    if (audioCtx.current) {
      const t = audioCtx.current.currentTime;
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.connect(gain); gain.connect(audioCtx.current.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return { playClick, playHov, isMuted, toggleMute };
}
