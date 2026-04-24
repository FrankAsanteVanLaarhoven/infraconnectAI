'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface CurationEvent {
  id: string;
  episodeIds: string[];
  action: string;
  reason: string;
  confidence: number;
  createdAt: string;
}

export function LiveCurationPanel({ runId }: { runId: string | null }) {
  const [events, setEvents] = useState<CurationEvent[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!runId) return;

    const fetchEvents = async () => {
      const res = await fetch(`/api/data-curation/events?runId=${runId}`);
      const data = await res.json();
      setEvents(data.events || []);
    };

    fetchEvents();

    // Live updates via Socket.IO
    socket?.on('physics.curation', (data: any) => {
      if (data.runId === runId) {
        setEvents(prev => [data, ...prev].slice(0, 12));
      }
    });

    return () => { socket?.off('physics.curation'); };
  }, [runId, socket]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
        <div className="h-2 w-2 rounded-sm bg-slate-800" />
        LIVE CURATION FEED
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
        {events.length === 0 && (
          <div className="py-8 text-center text-white/40 text-sm">No curation events yet. Training in progress...</div>
        )}

        {events.map((event, idx) => (
          <div key={idx} className="flex items-start gap-4 rounded-none border border-white/10 bg-white/5 p-4 text-sm">
            <div className="mt-1">
              {event.action === 'PRUNE' ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <Clock className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={event.action === 'PRUNE' ? 'destructive' : 'secondary'}>
                  {event.action}
                </Badge>
                <span className="font-mono text-xs text-white/50">
                  {new Date(event.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-white/80">{event.reason}</div>
              <div className="mt-1 text-xs text-white/50">
                Confidence: {(event.confidence * 100).toFixed(1)}% • Episodes: {event.episodeIds.length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
