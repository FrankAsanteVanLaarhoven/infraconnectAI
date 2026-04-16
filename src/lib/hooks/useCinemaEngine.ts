import { useAnimation, AnimationControls } from "framer-motion";

/**
 * Mappings of Backend Events to specific UI Action Sequences
 */
export const animationMap: Record<string, string> = {
  NODE_CONNECTED: "act1_intro",
  TELEMETRY: "act2_pulse",
  ANOMALY_DETECTED: "act3_alert",
  DEPLOY_STARTED: "act4_build",
  DEPLOY_COMPLETE: "act5_resolve",
  TRUST_LOCK: "trust_lock"
};

/**
 * The Exact Framer Motion Keyframes driving the Cinematic UI Pipeline
 */
export const cinemaSequences: Record<string, any> = {
  act1_intro: {
    opacity: [0, 1],
    scale: [0.96, 1],
    filter: ["blur(12px)", "blur(0px)"],
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } // cinematic easeOutExpo
  },
  
  act2_pulse: {
    scale: [1, 1.02, 1],
    opacity: [0.85, 1, 0.85],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  
  act3_alert: {
    boxShadow: [
      "0 0 0px rgba(255,120,0,0)",
      "0 0 20px rgba(255,120,0,0.8)",
      "0 0 0px rgba(255,120,0,0)"
    ],
    scale: [1, 1.04, 1],
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  },

  act4_build: {
    x: [0, 40, 0],
    opacity: [0.7, 1],
    transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } // easeOutCubic
  },

  act5_resolve: {
    scale: [1.02, 1],
    opacity: [0.9, 1],
    filter: ["brightness(1.2)", "brightness(1)"],
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  },

  trust_lock: {
    scale: [1, 1.08, 1],
    rotate: [0, 2, -2, 0],
    transition: { duration: 0.4, ease: "easeInOut" }
  }
};

/**
 * Controller Hook linking Framer Motion to the Event Schema
 */
export function useCinemaEngine() {
  const controls = useAnimation();

  // Used for global orchestration where a component drives a complex scene graph
  const playSequence = async (sequenceKey: string) => {
    const sequence = cinemaSequences[sequenceKey];
    if (sequence) {
      await controls.start(sequence);
    }
  };

  // Maps physical events to the generic sequences above
  const triggerEventBeat = async (eventType: string) => {
    const key = animationMap[eventType];
    if (key) {
      await playSequence(key);
    }
  };

  return { controls, playSequence, triggerEventBeat, sequences: cinemaSequences };
}

/**
 * Helper: Simulates audio synchronization.
 * In a native environment, this uses HTML5 Audio Context.
 */
export function playCinematicSound(eventType: string) {
  // In reality: const audio = new Audio('/sounds/' + sound)
  console.log(`[AUDIO_SYNC] Triggering contextual sound layer for event ${eventType}`);
  
  if (eventType === "DEPLOY_STARTED") {
    // playSound("build-up.mp3");
  } else if (eventType === "DEPLOY_COMPLETE") {
    // Exact 200ms delay for cinematic resolution after visual lock
    setTimeout(() => {
       // playSound("resolve.mp3");
       console.log(`[AUDIO_SYNC] Fired 'resolve.mp3' (200ms delay curve)`);
    }, 200);
  } else if (eventType === "TRUST_LOCK") {
    // playSound("lock-click.mp3");
  }
}
