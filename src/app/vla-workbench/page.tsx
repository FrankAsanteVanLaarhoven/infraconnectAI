'use client';

import { useEffect } from 'react';
import { VlaWorkbenchLayout } from '@/components/vla-workbench/VlaWorkbenchLayout';
import { useVlaWorkbenchStore } from '@/stores/vlaWorkbenchStore';
import { useSocket } from '@/hooks/useSocket';

export default function VLAWorkbenchPage() {
  const { currentRunId, setCurrentRun } = useVlaWorkbenchStore();
  const socket = useSocket();

  useEffect(() => {
    // Auto-select latest Isaac run on load
    if (!currentRunId) {
      fetch('/api/isaac-lab/runs?status=RUNNING')
        .then(res => res.json())
        .then(data => {
          if (data.runs?.length > 0) {
            setCurrentRun(data.runs[0].id);
          }
        })
        .catch(() => {}); // Graceful fallback if API not ready
    }

    // Listen for live curation events
    socket?.on('physics.curation', (data: any) => {
      if (data.runId === currentRunId) {
        console.log('[VLA_WORKBENCH] Live curation update received');
      }
    });

    return () => { socket?.off('physics.curation'); };
  }, [currentRunId, setCurrentRun, socket]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <VlaWorkbenchLayout />
    </div>
  );
}
