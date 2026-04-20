export type DAGNode = {
    id: string;
    action: string;
    status: "pending" | "running" | "done";
};

export type MissionDAG = {
    id: string;
    goal: string;
    nodes: DAGNode[];
    edges: { from: string; to: string }[];
};

export type IntentTopologyNode = {
  id: string;
  type: 'connector' | 'ai' | 'hardware';
  label: string;
  xPosOffset: number;
  extraData?: any;
};

export type IntentTopologyEdge = {
  sourceId: string;
  targetId: string;
};

export type IntentTopology = {
  nodes: IntentTopologyNode[];
  edges: IntentTopologyEdge[];
};

export function parseIntent(query: string): IntentTopology | null {
  if (!query || query.length < 5) return null;
  if (query.startsWith('>') || query.startsWith('!')) return null;

  if (query.toLowerCase().includes('postgres') || query.toLowerCase().includes('database') || query.toLowerCase().includes('sql')) {
    return {
      nodes: [
        { id: '1', type: 'connector', label: 'Postgres DB', xPosOffset: 0 },
        { id: '2', type: 'ai', label: 'Semantic Mapper', xPosOffset: 1 },
        { id: '3', type: 'connector', label: 'Platform Event Bus', xPosOffset: 2 }
      ],
      edges: [
        { sourceId: '1', targetId: '2' },
        { sourceId: '2', targetId: '3' }
      ]
    };
  }

  return {
    nodes: [
      { id: 'start', type: 'hardware', label: 'Edge Source', xPosOffset: 0 },
      { id: 'proc', type: 'ai', label: 'Processor', xPosOffset: 1 },
      { id: 'dest', type: 'connector', label: 'Destination', xPosOffset: 2 }
    ],
    edges: [
      { sourceId: 'start', targetId: 'proc' },
      { sourceId: 'proc', targetId: 'dest' }
    ]
  };
}
