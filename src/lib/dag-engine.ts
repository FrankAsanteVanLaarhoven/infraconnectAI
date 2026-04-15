// Semantic Parsing Engine
// Converts natural language intent into Directed Acyclic Graph (DAG) Topologies

export interface DAGNodePayload {
  id: string;
  type: 'connector' | 'ai';
  label: string;
  extraData?: Record<string, any>;
  xPosOffset: number; // relative placement multiplier
}

export interface DAGEdgePayload {
  sourceId: string;
  targetId: string;
}

export interface IntentTopology {
  intent: string;
  nodes: DAGNodePayload[];
  edges: DAGEdgePayload[];
}

export const parseIntent = (query: string): IntentTopology | null => {
  const normalized = query.toLowerCase().trim();
  
  if (normalized.length < 5) return null;

  // Intent 1: "Sync postgres to semantic pipeline" or "Connect legacy as400 to AI index"
  if (normalized.includes('sync') || normalized.includes('connect') || normalized.includes('stream')) {
    
    const isPostgres = normalized.includes('postgres') || normalized.includes('sql');
    const isAS400 = normalized.includes('as400') || normalized.includes('legacy') || normalized.includes('erp');
    const isKafka = normalized.includes('stream') || normalized.includes('kafka') || normalized.includes('event');
    
    // Determine Destination
    const toEmbedding = normalized.includes('semantic') || normalized.includes('embed') || normalized.includes('index') || normalized.includes('ai');
    
    const nodes: DAGNodePayload[] = [];
    const edges: DAGEdgePayload[] = [];

    // Source Node
    const sourceId = `src-${crypto.randomUUID().slice(0, 8)}`;
    if (isPostgres) {
      nodes.push({ id: sourceId, type: 'connector', label: 'PostgreSQL DB', extraData: { status: 'discovering' }, xPosOffset: 0 });
    } else if (isAS400) {
      nodes.push({ id: sourceId, type: 'connector', label: 'Legacy AS400 ERP', extraData: { status: 'discovering' }, xPosOffset: 0 });
    } else {
      nodes.push({ id: sourceId, type: 'connector', label: 'Generic Data Source', extraData: { status: 'discovering' }, xPosOffset: 0 });
    }

    // Bus Node (Auto-injected by orchestration OS)
    const busId = `bus-${crypto.randomUUID().slice(0, 8)}`;
    nodes.push({ id: busId, type: 'connector', label: 'Kafka Event Bus', extraData: { status: 'connected' }, xPosOffset: 1 });
    edges.push({ sourceId: sourceId, targetId: busId });

    // Destination Node
    const destId = `dest-${crypto.randomUUID().slice(0, 8)}`;
    if (toEmbedding) {
      nodes.push({ id: destId, type: 'ai', label: 'Semantic Normalization', extraData: { mode: 'embedding' }, xPosOffset: 2 });
    } else {
      nodes.push({ id: destId, type: 'connector', label: 'Destination Warehouse', extraData: { status: 'connected' }, xPosOffset: 2 });
    }
    edges.push({ sourceId: busId, targetId: destId });

    return {
      intent: query,
      nodes,
      edges
    };
  }

  return null;
};
