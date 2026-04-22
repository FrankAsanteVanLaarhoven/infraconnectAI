import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { TelemetryEvent, AlertEvent } from "@/domain/events";
import { useTimelineStore } from "@/stores/timelineStore";

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [agentActions, setAgentActions] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect explicitly to the dedicated websocket backend running on port 3007
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3007", { 
        transports: ["polling", "websocket"] 
    });

    socket.on("connect", () => {
       setIsConnected(true);
       console.log('[USE_TELEMETRY] Secure websocket line active');
    });

    socket.on("disconnect", () => {
       setIsConnected(false);
    });

    // Capture standard telemetry stream
    socket.on("stream:robot.telemetry", (msg: TelemetryEvent) => {
      setTelemetry((prev) => [msg, ...prev.slice(0, 49)]); // keep last 50
      useTimelineStore.getState().addEvent("stream:robot.telemetry", msg);
    });

    // Capture critical alerts separately
    socket.on("stream:robot.alerts", (msg: AlertEvent) => {
      setAlerts((prev) => [msg, ...prev.slice(0, 19)]); // keep last 20
      useTimelineStore.getState().addEvent("stream:robot.alerts", msg);
    });

    // Capture standalone agent decisions
    socket.on("stream:agent.actions", (msg: any) => {
      setAgentActions((prev) => [msg, ...prev.slice(0, 9)]); // keep last 10
      useTimelineStore.getState().addEvent("stream:agent.actions", msg);
    });

    return () => {
        try {
            if (socket.connected) {
                socket.disconnect();
            } else {
                socket.close();
            }
        } catch (e) {}
    };
  }, []);

  return { telemetry, alerts, agentActions, isConnected };
}
