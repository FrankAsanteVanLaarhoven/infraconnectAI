"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MatrixRainProps {
  className?: string;
  color?: string; // Hex color for the character rain
}

export function MatrixRain({ 
  className,
  color = "#334155" // Slate-700 / dark tactical by default
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Characters - mixed alphanumeric, katakana, and symbols for high-tech aesthetic
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+ΞΔΦΨλμπ".split("");
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);

    const drops: { y: number; dir: number }[] = [];
    for (let x = 0; x < columns; x++) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const initialY = dir > 0 ? (Math.random() * -100) : ((height / fontSize) + Math.random() * 100);
      drops[x] = { y: initialY, dir };
    }

    const draw = () => {
      // Semi-transparent black background to create tail effect
      ctx.fillStyle = "rgba(5, 5, 5, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const drop = drops[i];
        const y = drop.y * fontSize;

        // Optionally, make the leading character brighter
        if (Math.random() > 0.95) {
            ctx.fillStyle = "#94a3b8"; // Lighter steel/slate for occasional bright tech flares
        } else {
            ctx.fillStyle = color;
        }

        ctx.fillText(text, x, y);

        // Reset drop randomly to bounds
        if (drop.dir > 0) {
          if (y > height && Math.random() > 0.975) {
            drop.y = 0;
          }
          drop.y++;
        } else {
          if (y < 0 && Math.random() > 0.975) {
            drop.y = height / fontSize;
          }
          drop.y--;
        }
      }
    };

    let animationId: number;
    // Lower frequency to keep it subtle rather than overwhelming (33ms = ~30fps)
    const interval = setInterval(() => {
        animationId = requestAnimationFrame(draw);
    }, 45);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops.length = 0;
      for (let x = 0; x < columns; x++) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const initialY = dir > 0 ? (Math.random() * -100) : ((height / fontSize) + Math.random() * 100);
        drops[x] = { y: initialY, dir };
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      className={cn("absolute inset-0 pointer-events-none opacity-40 z-0", className)} 
    />
  );
}
