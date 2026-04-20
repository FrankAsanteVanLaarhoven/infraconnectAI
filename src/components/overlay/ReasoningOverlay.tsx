"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/core/bus";

export default function ReasoningOverlay() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const unbind = subscribe("reasoning.generated", (e: any) => {
      setLogs((prev) => [
        ...prev.slice(-3),
        { text: e.explanation, id: Date.now() },
      ]);
    });
    return unbind;
  }, []);

  return (
    <div className="absolute bottom-6 left-6 w-80 space-y-2 z-40">
      {logs.map((l) => (
        <div
          key={l.id}
          className="bg-black/80 border border-cyan/30 text-xs p-3 animate-fadeIn shadow-glow flex items-start gap-3"
        >
          <div className="text-cyan text-lg">🧠</div>
          <div className="text-white/80 font-mono tracking-wide leading-relaxed">{l.text}</div>
        </div>
      ))}
    </div>
  );
}
