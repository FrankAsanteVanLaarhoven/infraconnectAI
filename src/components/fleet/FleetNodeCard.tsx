"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import { tacticalBus } from "@/lib/events/bus";

interface Anomaly {
  id: string;
  severity: string;
  type: string;
  description: string;
  createdAt: string;
}

interface FleetNode {
  id: string;
  robotId: string;
  alias: string;
  status: string;
  lastSeen: string;
  memoryBytes: string;
  anomalyCount: number;
  anomalies: Anomaly[];
}

const statusColor: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-red-500",
  degraded: "bg-amber-500",
};

const severityVariant: Record<string, "default" | "destructive" | "secondary"> = {
  info: "secondary",
  warn: "default",
  critical: "destructive",
};

export function FleetNodeCard({ node }: { node: FleetNode }) {
  const [stability, setStability] = useState<any>(null);
  const memMB = (Number(BigInt(node.memoryBytes)) / 1024 / 1024).toFixed(1);

  useEffect(() => {
    async function fetchStability() {
      try {
        const res = await fetch('/api/fleet/stability');
        const json = await res.json();
        const myMetric = json.metrics?.find((m: any) => m.nodeId === node.id);
        if (myMetric) setStability(myMetric);
      } catch (err) {}
    }
    fetchStability();
    const inv = setInterval(fetchStability, 5000);
    
    // Tactical Event Bus Subscriptions for live-flashing hardware anomalies
    const unsub = tacticalBus.subscribe('MISSION_DISARM', () => {
      setStability((prev: any) => ({ ...prev, overrideActive: true, svr: 0.99 }));
    });
    
    return () => {
        clearInterval(inv);
        unsub();
    };
  }, [node.id]);

  const overrideActive = stability?.overrideActive;
  const cardBorder = overrideActive ? "border-red-500 animate-pulse bg-red-950/20" : "border-border hover:border-primary/50 transition-colors";
  const displayStatus = overrideActive ? "degraded" : node.status;

  return (
    <Card className={`border ${cardBorder}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">{node.alias}</CardTitle>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${statusColor[displayStatus] ?? "bg-gray-400"}`}
            />
            <span className={`text-xs capitalize ${overrideActive ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{overrideActive ? 'LOCKED' : displayStatus}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-mono">{node.robotId}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Memory</p>
            <p className="font-semibold">{memMB} MB</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stability Index</p>
            <div className="flex items-center gap-1.5">
               <span className={`font-semibold ${stability?.svr > 0.05 ? 'text-red-500' : 'text-cyan-500'}`}>
                 {stability ? `${((1 - stability.svr) * 100).toFixed(1)}%` : '---'}
               </span>
               {stability?.overrideActive ? <ShieldAlert className="w-3 h-3 text-red-500" /> : <ShieldCheck className="w-3 h-3 text-cyan-500" />}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">SVR Benchmark</p>
            <p className="font-semibold text-slate-300">{stability ? `${(stability.svr * 100).toFixed(3)}%` : '---'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last seen</p>
            <p className="font-semibold">
              {formatDistanceToNow(new Date(node.lastSeen), { addSuffix: true })}
            </p>
          </div>
        </div>

        {node.anomalies.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Recent anomalies</p>
            {node.anomalies.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/50"
              >
                <Badge variant={severityVariant[a.severity] ?? "secondary"} className="text-[10px] px-1">
                  {a.severity}
                </Badge>
                <span className="truncate font-mono">{a.description}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
