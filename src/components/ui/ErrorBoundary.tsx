"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.name || 'unnamed'}] caught error:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/40 border border-red-900/40 rounded-xl m-4 text-center backdrop-blur-xl">
           <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-full mb-4">
             <ShieldAlert className="w-8 h-8 text-red-500" />
           </div>
           <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2">Module Exception Detected</h3>
           <p className="text-[10px] text-slate-500 uppercase tracking-widest max-w-[200px] mb-6">
             The component [{this.props.name || 'unknown'}] failed to mount securely. Runtime safety intercept triggered.
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="flex items-center gap-2 px-4 py-2 bg-red-950/20 border border-red-500/40 text-red-500 rounded text-[10px] font-black uppercase hover:bg-red-500/20 transition-all"
           >
             <RefreshCw className="w-3 h-3" /> Execute Hard Reset
           </button>
        </div>
      );
    }

    return this.props.children;
  }
}
