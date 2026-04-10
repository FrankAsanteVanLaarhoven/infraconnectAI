'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';

/* ── Character set: katakana + technical symbols ── */
const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\┃━╋╳⊗⊕△▽◈⬡';

/* ── Depth layer configuration ── */
interface DepthLayer {
  fontSize: number;
  speedMultiplier: number;
  baseOpacity: number;
  resetThreshold: number;
  colorFn: (isDark: boolean, extra: number, colNorm: number) => string;
  trailColorFn: (isDark: boolean, colNorm: number) => string;
  trailFade: number;
  fillAlpha: number;
}

const LAYERS: DepthLayer[] = [
  {
    /* Background layer: small, slow, dim */
    fontSize: 11,
    speedMultiplier: 0.4,
    baseOpacity: 0.18,
    resetThreshold: 0.985,
    colorFn: (isDark, extra, colNorm) =>
      isDark
        ? `rgba(0, ${160 + Math.floor(colNorm * 40)}, ${40 + Math.floor(colNorm * 25)}, ${0.25 + extra * 0.35})`
        : `rgba(22, ${120 + Math.floor(colNorm * 30)}, ${55 + Math.floor(colNorm * 20)}, ${0.10 + extra * 0.15})`,
    trailColorFn: (isDark, colNorm) =>
      isDark
        ? `rgba(0, ${120 + Math.floor(colNorm * 30)}, ${30 + Math.floor(colNorm * 15)}, 0.06)`
        : `rgba(22, ${100 + Math.floor(colNorm * 20)}, ${45 + Math.floor(colNorm * 10)}, 0.03)`,
    trailFade: 0.04,
    fillAlpha: 0.03,
  },
  {
    /* Midground layer: standard, the "main" rain */
    fontSize: 14,
    speedMultiplier: 1.0,
    baseOpacity: 0.6,
    resetThreshold: 0.975,
    colorFn: (isDark, extra, colNorm) =>
      isDark
        ? `rgba(0, ${200 + Math.floor(colNorm * 55)}, ${50 + Math.floor(colNorm * 30)}, ${0.6 + extra * 0.4})`
        : `rgba(22, ${140 + Math.floor(colNorm * 40)}, ${65 + Math.floor(colNorm * 25)}, ${0.25 + extra * 0.2})`,
    trailColorFn: (isDark, colNorm) =>
      isDark
        ? `rgba(0, ${160 + Math.floor(colNorm * 40)}, ${40 + Math.floor(colNorm * 20)}, 0.12)`
        : `rgba(22, ${120 + Math.floor(colNorm * 30)}, ${55 + Math.floor(colNorm * 15)}, 0.06)`,
    trailFade: 0.07,
    fillAlpha: 0.06,
  },
  {
    /* Foreground layer: larger, faster, brightest */
    fontSize: 17,
    speedMultiplier: 1.6,
    baseOpacity: 0.85,
    resetThreshold: 0.965,
    colorFn: (isDark, extra, colNorm) =>
      isDark
        ? `rgba(${10 + Math.floor(colNorm * 20)}, ${230 + Math.floor(colNorm * 25)}, ${80 + Math.floor(colNorm * 40)}, ${0.8 + extra * 0.2})`
        : `rgba(22, ${160 + Math.floor(colNorm * 40)}, ${75 + Math.floor(colNorm * 30)}, ${0.35 + extra * 0.2})`,
    trailColorFn: (isDark, colNorm) =>
      isDark
        ? `rgba(0, ${180 + Math.floor(colNorm * 40)}, ${50 + Math.floor(colNorm * 25)}, 0.18)`
        : `rgba(22, ${130 + Math.floor(colNorm * 30)}, ${60 + Math.floor(colNorm * 20)}, 0.09)`,
    trailFade: 0.10,
    fillAlpha: 0.08,
  },
];

/* ── Column state ── */
interface ColumnState {
  y: number;
  layer: number;          // index into LAYERS
  glitchTimer: number;    // frames remaining for glitch
  glitchShift: number;    // horizontal px shift
  lastChar: string;       // for occasional redraw
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<ColumnState[]>([]);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const { resolvedTheme } = useTheme();

  /* ── Initialise columns with random depth assignment ── */
  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    /* Assign columns: each layer gets ~30/40/30 split */
    const midFontSize = LAYERS[1].fontSize;
    const totalCols = Math.floor(w / midFontSize);
    const cols: ColumnState[] = [];

    for (let i = 0; i < totalCols; i++) {
      /* Weighted random layer selection */
      const r = Math.random();
      const layer = r < 0.30 ? 0 : r < 0.70 ? 1 : 2;
      const layerCfg = LAYERS[layer];
      cols.push({
        y: Math.floor(Math.random() * h / layerCfg.fontSize) * -1,
        layer,
        glitchTimer: 0,
        glitchShift: 0,
        lastChar: CHARS[Math.floor(Math.random() * CHARS.length)],
      });
    }

    columnsRef.current = cols;
  }, []);

  /* ── Track mouse ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    init();
    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [init, handleMouseMove, handleMouseLeave]);

  /* ── Main animation loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const draw = () => {
      /* Skip frames when tab is hidden */
      if (document.hidden) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const isDark = resolvedTheme === 'dark';
      const cols = columnsRef.current;
      const midFontSize = LAYERS[1].fontSize;
      const mouse = mouseRef.current;

      /* ── Fade overlay (creates trail effect) ── */
      ctx.fillStyle = isDark
        ? `rgba(8, 12, 10, 0.06)`
        : `rgba(245, 248, 246, 0.05)`;
      ctx.fillRect(0, 0, w, h);

      /* ── Noise / grain overlay ── */
      const noiseCount = Math.floor(w * h * 0.0003);
      for (let n = 0; n < noiseCount; n++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        const na = isDark ? Math.random() * 0.06 : Math.random() * 0.04;
        ctx.fillStyle = isDark
          ? `rgba(0, 255, 65, ${na})`
          : `rgba(22, 163, 74, ${na})`;
        ctx.fillRect(nx, ny, 1, 1);
      }

      /* ── Draw columns ── */
      cols.forEach((col, i) => {
        const layerCfg = LAYERS[col.layer];
        const fs = layerCfg.fontSize;
        const x = i * midFontSize;
        const colNorm = i / cols.length; // 0..1 for colour variation

        /* Advance column at layer speed */
        if (col.y < 0) {
          col.y++;
          return;
        }

        /* ── Glitch logic ── */
        if (col.glitchTimer > 0) {
          col.glitchTimer--;
          if (col.glitchTimer === 0) {
            col.glitchShift = 0;
          }
        } else if (Math.random() < 0.001) {
          /* Trigger glitch: 0.1% chance per frame per column */
          col.glitchTimer = 3 + Math.floor(Math.random() * 5);
          col.glitchShift = (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2));
        }

        /* ── Mouse proximity glow ── */
        const charCenterY = col.y * fs;
        const dx = x - mouse.x;
        const dy = charCenterY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximityRadius = 150;
        const proximity = dist < proximityRadius ? 1 - dist / proximityRadius : 0;

        /* ── Pick character ── */
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        /* ── Lead character (bright head) ── */
        ctx.font = `${fs}px "Courier New", monospace`;
        const offsetX = col.glitchShift;
        const leadAlpha = Math.min(1, layerCfg.baseOpacity + proximity * 0.5);
        ctx.fillStyle = layerCfg.colorFn(isDark, proximity, colNorm);
        ctx.globalAlpha = leadAlpha;
        ctx.fillText(char, x + offsetX, col.y * fs);

        /* ── Trail character (previous row, dimmer) ── */
        const trailChar = col.lastChar;
        ctx.fillStyle = layerCfg.trailColorFn(isDark, colNorm);
        ctx.globalAlpha = layerCfg.baseOpacity * 0.4 + proximity * 0.15;
        ctx.fillText(trailChar, x + offsetX, (col.y - 1) * fs);

        /* ── Mouse glow halo ── */
        if (proximity > 0.3) {
          ctx.globalAlpha = (proximity - 0.3) * 0.15;
          ctx.fillStyle = isDark
            ? `rgba(0, 255, 100, 1)`
            : `rgba(22, 163, 74, 1)`;
          ctx.fillText(char, x, col.y * fs);
        }

        ctx.globalAlpha = 1;

        /* ── Reset column when it falls off screen ── */
        if (col.y * fs > h && Math.random() > layerCfg.resetThreshold) {
          col.y = 0;
          col.glitchTimer = 0;
          col.glitchShift = 0;
        }

        col.lastChar = char;
        col.y++;
      });

      /* ── Scanline pass (very subtle) ── */
      for (let sy = 0; sy < h; sy += 3) {
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.01)';
        ctx.fillRect(0, sy, w, 1);
      }

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
