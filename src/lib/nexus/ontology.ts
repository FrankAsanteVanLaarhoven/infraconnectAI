/**
 * INFRA-SIGHT Ontology Matrix
 * The Semantic Bridge between Physical Assets and Digital AI Agents.
 * Enables AI integration across existing workflows by providing "World Meaning".
 */

export interface OntologyObject {
  urn: string;            // Uniform Resource Name: e.g., 'urn:asset:node:core-01'
  displayName: string;
  category: 'ASSET' | 'AGENT' | 'CODEBASE' | 'TERMINAL' | 'NETWORK';
  physicalMapping?: {
    location?: string;
    machineId?: string;
    ipv4?: string;
  };
  digitalTwinId?: string; // Links to the Swarm Agent handling this object
  status: 'SYNCHRONIZED' | 'DRIFT_DETECTED' | 'DISCONNECTED';
  lastHeard: string;
}

export const ONTOLOGY_REGISTRY: OntologyObject[] = [
  {
    urn: 'urn:asset:node:frank-station',
    displayName: 'Operator Workstation (Primary)',
    category: 'ASSET',
    physicalMapping: {
      location: 'Darwin-arm64',
      machineId: 'FR-WS-25'
    },
    digitalTwinId: 'agent-obs-01',
    status: 'SYNCHRONIZED',
    lastHeard: new Date().toISOString()
  },
  {
    urn: 'urn:asset:terminal:vs-code',
    displayName: 'VS Code Integrated IDE',
    category: 'TERMINAL',
    physicalMapping: {
      location: '/usr/local/bin/code'
    },
    digitalTwinId: 'agent-dev-01',
    status: 'SYNCHRONIZED',
    lastHeard: new Date().toISOString()
  },
  {
    urn: 'urn:asset:network:edge-01',
    displayName: 'Sovereign Edge Node',
    category: 'NETWORK',
    status: 'SYNCHRONIZED',
    lastHeard: new Date().toISOString()
  }
];

/**
 * Palantir-grade Virtual Tables
 * These are the backing data pools for the Ontology.
 */
export interface VirtualTable {
    id: string;
    name: string;
    strata: 'BRONZE' | 'SILVER' | 'GOLD';
    description: string;
    rowCount: number;
    lastRefresh: string;
    schema: string[];
}

export const VIRTUAL_TABLE_REGISTRY: VirtualTable[] = [
    {
        id: 'vt_raw_telemetry',
        name: 'Node Raw Telemetry',
        strata: 'BRONZE',
        description: 'Raw logs from physical workstation discovery and edge heartbeat.',
        rowCount: 14205,
        lastRefresh: new Date().toISOString(),
        schema: ['timestamp', 'nodeId', 'ipv4', 'cpu_load', 'memory_usage']
    },
    {
        id: 'vt_clean_metrics',
        name: 'Validated Metric Stream',
        strata: 'SILVER',
        description: 'Deduplicated and normalized system health indicators.',
        rowCount: 8412,
        lastRefresh: new Date().toISOString(),
        schema: ['timestamp', 'nodeId', 'health_score', 'anomaly_detected']
    },
    {
        id: 'vt_ontological_truth',
        name: 'Ontology Truth Table',
        strata: 'GOLD',
        description: 'High-fidelity modeled entities for AI Swarm consumption.',
        rowCount: 42,
        lastRefresh: new Date().toISOString(),
        schema: ['urn', 'displayName', 'category', 'status', 'digitalTwinId']
    }
];

/**
 * Resolves a semantic query into an Ontology URN.
 * This allows the Swarm to understand "Forward / Backward" logic.
 */
export function resolveSemanticTarget(query: string): OntologyObject | undefined {
  const q = query.toLowerCase();
  return ONTOLOGY_REGISTRY.find(obj => 
    obj.displayName.toLowerCase().includes(q) || 
    obj.urn.toLowerCase().includes(q)
  );
}

/**
 * Performs a "Forward Modeling" delta on an Ontology object.
 * Predicts how a mission will affect the object's status.
 */
export function modelForward(urn: string, delta: any): Partial<OntologyObject> {
    // SOTA logic for predictive drift
    return {
        status: 'SYNCHRONIZED', // Placeholder for simulation result
        lastHeard: new Date().toISOString()
    };
}
