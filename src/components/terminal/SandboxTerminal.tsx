"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { io, Socket } from "socket.io-client";
import { Terminal as TerminalIcon, Maximize2, Minimize2, Power } from "lucide-react";
import "@xterm/xterm/css/xterm.css";

export function SandboxTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize Socket
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3007";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'Fira Code', 'Menlo', monospace",
      fontSize: 14,
      theme: {
        background: "#050505",
        foreground: "#f8fafc",
        cursor: "#3b82f6",
        cursorAccent: "#050505",
        selectionBackground: "rgba(59, 130, 246, 0.3)",
        black: "#000000",
        red: "#ef4444",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#8b5cf6",
        cyan: "#06b6d4",
        white: "#f8fafc",
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);
    
    try {
      const webglAddon = new WebglAddon();
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn("WebGL addon failed to load, falling back to canvas", e);
    }

    fitAddon.fit();

    // Socket Event Bindings
    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("terminal:spawn");
      newSocket.emit("terminal:resize", { cols: term.cols, rows: term.rows });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      term.write("\r\n\x1b[31m[CORE CONNECTION LOST]\x1b[0m\r\n");
    });

    newSocket.on("terminal:data", (data: string) => {
      term.write(data);
    });

    term.onData((data) => {
      newSocket.emit("terminal:input", data);
    });

    // Listen for CodeEditor execution requests
    const handleExecute = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        newSocket.emit("terminal:input", customEvent.detail);
      }
    };
    window.addEventListener("terminal:execute", handleExecute);

    // Handle Resize
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && xtermRef.current && isConnected) {
        fitAddonRef.current.fit();
        newSocket.emit("terminal:resize", { 
          cols: xtermRef.current.cols, 
          rows: xtermRef.current.rows 
        });
      }
    });
    
    resizeObserver.observe(terminalRef.current);

    return () => {
      window.removeEventListener("terminal:execute", handleExecute);
      resizeObserver.disconnect();
      newSocket.disconnect();
      term.dispose();
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (fitAddonRef.current && xtermRef.current && socket) {
        fitAddonRef.current.fit();
        socket.emit("terminal:resize", { 
          cols: xtermRef.current.cols, 
          rows: xtermRef.current.rows 
        });
      }
    }, 100); // Give DOM time to update
  };

  const restartTerminal = () => {
    if (socket && xtermRef.current) {
      xtermRef.current.clear();
      // Disconnecting and reconnecting forces a respawn
      socket.disconnect();
      setTimeout(() => socket.connect(), 500);
    }
  };

  return (
    <div className={`flex flex-col bg-[#050505] border border-slate-800 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[100] shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'w-full h-full relative'}`}>
      {/* Terminal Header */}
      <div className="flex justify-between items-center bg-[#0a0b0c] p-2 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-cyan-500" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">CORE Sandbox Environment</span>
          <div className="flex items-center gap-1 ml-4 border border-slate-800 px-2 py-0.5 bg-black/50 rounded-sm">
            <div className={`w-1.5 h-1.5 rounded-sm ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            <span className="text-[9px] uppercase tracking-widest text-slate-400">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={restartTerminal} className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-slate-800 transition-colors rounded-sm" title="Reboot Session">
             <Power className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button onClick={toggleFullscreen} className="p-1.5 text-slate-500 hover:text-cyan-500 hover:bg-slate-800 transition-colors rounded-sm" title="Toggle Focus Mode">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      
      {/* Terminal Canvas */}
      <div className="flex-1 p-2 bg-[#050505] relative overflow-hidden">
        <div ref={terminalRef} className="w-full h-full" />
        
        {/* Cinematic overlays */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_100%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
      </div>
    </div>
  );
}
