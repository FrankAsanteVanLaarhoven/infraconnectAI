"use client";

import { useState } from "react";
import { publish } from "@/lib/core/bus";
import { runDemo } from "@/lib/demo/engine";

export default function Omnibar() {
  const [cmd, setCmd] = useState("");

  const run = () => {
    if (cmd.trim() === "> demo") {
        runDemo();
    } else if (cmd.startsWith(">")) {
        publish("command.execute", { raw: cmd });
    } else {
        publish("mission.plan", { goal: cmd });
    }
    setCmd("");
  };

  return (
    <div className="absolute top-0 left-0 w-full h-12 bg-black/80 border-b border-[var(--border)] flex items-center px-6 z-50">
      <span className="text-zinc-400 font-mono mr-4 font-bold tracking-widest uppercase text-xs">Omnibar_</span>
      <input
        value={cmd}
        onChange={(e) => setCmd(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run()}
        placeholder="Type a mission or > command..."
        className="w-full bg-transparent outline-none text-sm text-zinc-300 font-mono tracking-wide placeholder:text-zinc-600"
      />
    </div>
  );
}
