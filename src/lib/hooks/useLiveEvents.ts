import { useEffect } from "react";
import { InfraEvent } from "../events/schema";

export function useLiveEvents(onEvent: (e: InfraEvent) => void) {
  useEffect(() => {
    // Connect to our Server-Sent Events endpoint
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (msg) => {
      try {
        const event: InfraEvent = JSON.parse(msg.data);
        onEvent(event);
      } catch (e) {
        console.error("[USE_LIVE_EVENTS] Failed to parse message:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("[USE_LIVE_EVENTS] Stream error or disconnected. EventSource will auto-reconnect.");
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, [onEvent]);
}
