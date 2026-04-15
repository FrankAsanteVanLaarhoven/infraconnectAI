"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Info, Zap } from "lucide-react";

interface Anomaly {
  id: string;
  severity: string;
  type: string;
  description: string;
  createdAt: string;
  resolved: boolean;
  node: { alias: string; robotId: string };
}

const severityIcon: Record<string, React.ReactNode> = {
  info: <Info className="h-3 w-3 text-blue-400" />,
  warn: <AlertTriangle className="h-3 w-3 text-amber-400" />,
  critical: <Zap className="h-3 w-3 text-red-400" />,
};

export function AnomalyFeed({ pollIntervalMs = 5000 }: { pollIntervalMs?: number }) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = useCallback(async () => {
    try {
      const res = await fetch("/api/fleet/anomalies?resolved=false");
      const data = await res.json();
      setAnomalies(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchAnomalies, pollIntervalMs]);

  async function resolve(id: string) {
    await fetch("/api/fleet/anomalies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAnomalies();
  }

  if (loading) return <div className="text-xs text-muted-foreground p-4">Loading feed...</div>;

  return (
    <ScrollArea className="h-[420px] rounded-md border border-border">
      <div className="p-2 space-y-1">
        {anomalies.length === 0 && (
          <p className="text-xs text-muted-foreground p-4 text-center">No active anomalies</p>
        )}
        {anomalies.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 group"
          >
            <div className="mt-0.5">{severityIcon[a.severity]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-semibold text-foreground truncate">
                  {a.node.alias}
                </span>
                <Badge variant="outline" className="text-[10px] px-1 font-mono">
                  {a.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{a.description}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </div>
            <button
              onClick={() => resolve(a.id)}
              className="text-[10px] text-muted-foreground hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              resolve
            </button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
