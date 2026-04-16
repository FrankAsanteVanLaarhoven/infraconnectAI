/**
 * Swarm Telemetry Engine
 * 
 * Generates and processes high-frequency vitals for the 
 * Adaptive Swarm and Neural Grid.
 */

export interface SwarmVitals {
  cognitiveLoad: number; // 0-100
  governanceDrift: number; // 0-1 (closer to 1 is high drift)
  predictiveHealth: number; // 0-100
  activeAgents: number;
  unverifiedTasks: number;
}

export function generateSwarmVitals(): SwarmVitals {
  // Simulate enterprise load pressure
  const hour = new Date().getHours();
  const isBusinessHours = hour > 8 && hour < 18;
  
  const cognitiveLoad = isBusinessHours 
    ? 65 + (Math.random() * 20) 
    : 15 + (Math.random() * 15);
    
  const governanceDrift = 0.02 + (Math.random() * 0.05);
  const predictiveHealth = 98.4 - (governanceDrift * 10);
  
  return {
    cognitiveLoad,
    governanceDrift,
    predictiveHealth,
    activeAgents: 12 + Math.floor(Math.random() * 4),
    unverifiedTasks: 0
  };
}

export function getHealthStatus(vitals: SwarmVitals): 'STABLE' | 'DEGRADED' | 'CRITICAL' {
  if (vitals.cognitiveLoad > 90 || vitals.predictiveHealth < 70) return 'CRITICAL';
  if (vitals.cognitiveLoad > 75 || vitals.governanceDrift > 0.1) return 'DEGRADED';
  return 'STABLE';
}
