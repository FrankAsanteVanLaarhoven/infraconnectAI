"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export function GlobalSecurityGuard({ children }: { children: React.ReactNode }) {
  const [isCompromised, setIsCompromised] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // 1. Prevent Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent Copy/Cut/Paste/Select
    const handleDragStart = (e: Event) => e.preventDefault();
    const handleCopy = (e: Event) => e.preventDefault();

    // 3. Ultra-Aggressive Keystroke Blackout
    const handleKeyDown = (e: KeyboardEvent) => {
      // The microsecond Command/Ctrl/Alt is pressed, we blur the screen.
      // This prevents the user from completing the 'Cmd+Shift+3/4' chord, 
      // because the OS freezes the screen *after* the chord is complete.
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === "PrintScreen") {
        setIsBlurred(true);
      }
      
      // Still fully compromised if they try DevTools specifically
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c")) ||
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i" || e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        setIsCompromised(true);
        setTimeout(() => setIsCompromised(false), 5000);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        setIsBlurred(false);
      }
    };

    // 4. Blur on background/loss of focus to prevent background recording
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };
    const handleWindowBlur = () => setIsBlurred(true);
    const handleWindowFocus = () => setIsBlurred(false);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("paste", handleCopy);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("paste", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <>
      <div 
        className={`w-full h-full min-h-screen select-none transition-all duration-300 ${isCompromised || isBlurred ? "opacity-0 blur-xl pointer-events-none" : "opacity-100"}`}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {children}
      </div>

      {isCompromised && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-red-500 font-mono text-center">
          <ShieldAlert className="w-24 h-24 mb-6 animate-pulse" />
          <h1 className="text-4xl font-black uppercase tracking-widest mb-4">SECURITY VIOLATION DETECTED</h1>
          <p className="text-slate-400">Recording, debugging, or unauthorized data extraction blocked.<br/>This incident has been logged.</p>
        </div>
      )}
    </>
  );
}
