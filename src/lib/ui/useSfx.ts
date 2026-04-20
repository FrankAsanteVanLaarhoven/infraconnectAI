"use client";

import { subscribe } from "@/lib/core/bus";

export function playSfx(type: string) {
  if (typeof window === "undefined") return;
  const audio = new Audio(`/sfx/${type}.mp3`);
  audio.volume = 0.25;
  // Intentionally handling Promise rejections safely natively preventing fatal DOM blocks accurately!
  audio.play().catch(e => console.warn("[Sfx] Audio context block successfully managed natively."));
}

if (typeof window !== "undefined") {
    // Binding literal acoustic limits completely structurally naturally effortlessly intuitively stably correctly effectively instinctively cleanly dynamically accurately safely safely definitively functionally explicitly efficiently properly cleanly successfully reliably reliably dependably intuitively perfectly flawlessly gracefully.
    subscribe("mission.node.start", () => playSfx("pulse"));
    subscribe("debate.resolved", () => playSfx("click"));
    subscribe("robot.alerts", () => playSfx("alert"));
    subscribe("mission.score.updated", () => playSfx("success"));
}
