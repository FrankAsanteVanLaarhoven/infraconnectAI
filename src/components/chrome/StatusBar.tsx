'use client';

import { useMemoryStore } from '@/store/memory-store';
import { useTheme } from 'next-themes';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const { nodes, skillRuns, activePanels, health } = useMemoryStore();
  const [time, setTime] = useState('');
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-glass-border">
      <div className="flex items-center justify-between h-8 px-4 text-[11px] font-mono tracking-wider">
        {/* Left cluster */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {connected ? (
              <Wifi className="w-3 h-3 text-matrix" />
            ) : (
              <WifiOff className="w-3 h-3 text-destructive" />
            )}
            <span className={connected ? 'text-matrix' : 'text-destructive'}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </span>
          <span className="hidden sm:inline">
            <span className="text-muted-foreground/60">NODES</span>{' '}
            <span className="text-foreground">{nodes.length}</span>
          </span>
          <span className="hidden sm:inline">
            <span className="text-muted-foreground/60">RUNS</span>{' '}
            <span className="text-foreground">{skillRuns.filter(r => r.status === 'completed').length}</span>
          </span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="hidden md:flex items-center gap-1.5">
            <span className="text-muted-foreground/60">PANELS</span>{' '}
            <span className="text-foreground">{activePanels.length}</span>
          </span>
          {health && (
            <span className="hidden md:flex items-center gap-1.5">
              <span className="text-muted-foreground/60">HEALTH</span>{' '}
              <span className={health.overall >= 0.8 ? 'text-matrix' : health.overall >= 0.5 ? 'text-yellow-500' : 'text-destructive'}>
                {(health.overall * 100).toFixed(0)}%
              </span>
            </span>
          )}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="text-premium text-[10px] tracking-widest text-matrix/60">
            InfraConnect
          </span>
          <span className="text-foreground tabular-nums">{time}</span>
        </div>
      </div>
    </footer>
  );
}
