import React from 'react';
import { NexusSidebar } from '@/components/nexus/NexusSidebar';

export default function NexusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen h-screen bg-[#020202] text-slate-300 overflow-hidden font-mono selection:bg-cyan-500/30">
      <NexusSidebar />
      <div className="flex-1 relative h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
