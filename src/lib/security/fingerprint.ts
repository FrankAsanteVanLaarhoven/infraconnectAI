"use client";

import { useEffect, useState } from "react";

/**
 * Sovereign UDS (Unique Device Signature) Utility
 * Collects high-fidelity hardware and browser parameters to generate a stable, hardened footprint.
 * Used for Phase 18: Sovereign Device Guard.
 */

export async function generateFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "ss_server_runtime";

  // Collect entropy points
  const entropy = {
    screen: {
      w: window.screen.width,
      h: window.screen.height,
      d: window.screen.colorDepth,
    },
    navigator: {
      ua: navigator.userAgent,
      l: navigator.language,
      hc: navigator.hardwareConcurrency,
      dm: (navigator as any).deviceMemory || 0,
      p: navigator.platform,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    webgl: (() => {
      try {
        const canvas = document.createElement("canvas");
        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext;
        if (!gl) return "no_webgl";
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "gl_masked";
      } catch {
        return "gl_error";
      }
    })(),
    canvas: (() => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return "no_canvas";
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("INFRA-SIGHT-FINGERPRINT", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("INFRA-SIGHT-FINGERPRINT", 4, 17);
        return canvas.toDataURL();
      } catch {
        return "canvas_error";
      }
    })(),
  };

  const str = JSON.stringify(entropy);
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Prefix with UDS (Unique Device Signature)
  return `UDS_${hashHex.substring(0, 24).toUpperCase()}`;
}

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  return fingerprint;
}
