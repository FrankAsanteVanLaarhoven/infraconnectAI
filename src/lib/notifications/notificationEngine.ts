/**
 * Sovereign Notification Engine
 * 
 * Orchestrates tactical alerts across:
 * - UI (Toasts / State)
 * - Tactical Email (Resend)
 * - Audit Logs
 */

import { sendBreachAlert } from './breach-alert';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertCategory = 'SECURITY' | 'COGNITIVE' | 'TELEMETRY' | 'MARKET';

export interface TacticalAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
}

// In-memory bus for UI toasts (Simulated for this phase)
const activeAlerts: TacticalAlert[] = [];

export async function broadcastAlert(alert: Omit<TacticalAlert, 'id' | 'timestamp'>) {
  const id = `alert-${crypto.randomUUID().slice(0, 8)}`;
  const timestamp = new Date().toISOString();
  const fullAlert: TacticalAlert = { ...alert, id, timestamp };

  console.log(`[BROADCAST] [${alert.category}] ${alert.title}: ${alert.message}`);

  // 1. Audit Log (Simulated)
  activeAlerts.push(fullAlert);

  // 2. Tactical Email (Only for HIGH/CRITICAL)
  if (alert.severity === 'HIGH' || alert.severity === 'CRITICAL') {
    await sendBreachAlert({
      email: 'founder@infraconnect.ai', // Default founder email
      type: alert.category === 'SECURITY' ? 'NEW_DEVICE' : 'LIMIT_BLOCKED',
      fingerprint: id,
      ip: 'SYSTEM_INTERNAL'
    });
  }

  // 3. UI Notification (In a real app, this would use WebSockets or a shared state hook)
  // For this demo, components will poll or use a global event listener.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('infraconnect:notification', { detail: fullAlert }));
  }

  return fullAlert;
}

export function getActiveAlerts() {
  return activeAlerts;
}
