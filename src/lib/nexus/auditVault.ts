/**
 * Sovereign Audit Vault
 * 
 * Manages the immutable ledger of mission-critical events.
 * Provides a "Chronological Proof" for legal and operational forensics.
 */

import { db } from "@/lib/db";

export type AuditCategory = 'TACTICAL' | 'SECURITY' | 'REVENUE' | 'GOVERNANCE' | 'HARDWARE';

export interface AuditEvent {
  id: string;
  type: string;
  category: AuditCategory;
  title: string;
  action: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  correlationId?: string;
  actor: string;
}

export async function queryAuditVault(filters?: {
  category?: AuditCategory;
  severity?: string;
  limit?: number;
}) {
  const events = await db.domainEvent.findMany({
    where: {
      ...(filters?.category && { eventType: { contains: filters.category.toLowerCase() } })
    },
    orderBy: { timestamp: 'desc' },
    take: filters?.limit || 50
  });

  return events.map(e => {
    const payload = typeof e.payload === 'string' ? JSON.parse(e.payload) : e.payload;
    
    // Categorization Heuristic
    let category: AuditCategory = 'TACTICAL';
    if (e.eventType.includes('security')) category = 'SECURITY';
    if (e.eventType.includes('governance')) category = 'GOVERNANCE';
    if (e.eventType.includes('revenue')) category = 'REVENUE';
    if (e.eventType.includes('telemetry')) category = 'HARDWARE';

    return {
      id: e.id,
      type: e.eventType,
      category,
      title: payload.taskName || payload.title || e.eventType,
      action: payload.action || payload.decision || 'SYSTEM_EXECUTION',
      timestamp: e.timestamp.toISOString(),
      severity: (payload.severity || 'LOW').toUpperCase() as any,
      correlationId: e.correlationId,
      actor: e.actorId || 'SYSTEM'
    };
  });
}

export async function getCausationChain(correlationId: string) {
  return db.domainEvent.findMany({
    where: { correlationId },
    orderBy: { timestamp: 'asc' }
  });
}
