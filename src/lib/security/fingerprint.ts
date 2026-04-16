/**
 * Agentic Fingerprinting
 * 
 * Generates and verifies unique cryptographic identities for 
 * autonomous agents in the InfraConnect Swarm.
 */

import { createHmac } from 'crypto';

const SWARM_SECRET = process.env.SWARM_SECRET || 'infraconnect_neural_secret_2026';

export interface AgentFingerprint {
  id: string;
  role: string;
  timestamp: number;
  hash: string;
}

export function generateAgentFingerprint(role: string): AgentFingerprint {
  const timestamp = Date.now();
  const id = `agent-${role.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}`;
  
  const hmac = createHmac('sha256', SWARM_SECRET);
  hmac.update(`${id}:${role}:${timestamp}`);
  const hash = hmac.digest('hex');

  return {
    id,
    role,
    timestamp,
    hash
  };
}

export function verifyAgentTask(fingerprint: AgentFingerprint): boolean {
  const hmac = createHmac('sha256', SWARM_SECRET);
  hmac.update(`${fingerprint.id}:${fingerprint.role}:${fingerprint.timestamp}`);
  const expectedHash = hmac.digest('hex');
  
  return fingerprint.hash === expectedHash;
}

export function getShortFingerprint(hash: string): string {
  return hash.substring(0, 8).toUpperCase();
}
