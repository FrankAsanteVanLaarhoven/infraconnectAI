'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\';

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const fontSize = 14;
    const colCount = Math.floor(window.innerWidth / fontSize);
    columnsRef.current = Array.from({ length: colCount }, () =>
      Math.floor(Math.random() * window.innerHeight / fontSize) * -1
    );
  }, []);

  useEffect(() => {
    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, [init]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 14;
    const isDark = resolvedTheme === 'dark';
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = isDark
        ? 'rgba(8, 12, 10, 0.08)'
        : 'rgba(245, 248, 246, 0.06)';
      ctx.fillRect(0, 0, w, h);

      columnsRef.current.forEach((y, i) => {
        if (y < 0) {
          columnsRef.current[i]++;
          return;
        }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;

        // Lead character (bright)
        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.fillStyle = isDark
          ? 'rgba(0, 255, 65, 0.9)'
          : 'rgba(22, 163, 74, 0.35)';
        ctx.fillText(char, x, y * fontSize);

        // Trail characters (dimmer)
        const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = isDark
          ? 'rgba(0, 200, 50, 0.15)'
          : 'rgba(22, 163, 74, 0.08)';
        ctx.fillText(trailChar, x, (y - 1) * fontSize);

        if (y * fontSize > h && Math.random() > 0.975) {
          columnsRef.current[i] = 0;
        }
        columnsRef.current[i]++;
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
