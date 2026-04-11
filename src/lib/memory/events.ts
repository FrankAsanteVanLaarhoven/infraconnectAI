export type EventType = 
  | 'memory.node.created'
  | 'memory.node.promoted'
  | 'runtime.intercepted'
  | 'capx.episode.imported'
  | 'persona.session.started'
  | 'persona.l0.pushed';

export interface BaseEvent {
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  timestamp: string;
  causationId?: string;
  correlationId?: string;
  actor: {
    type: 'user' | 'system' | 'agent' | 'runtime';
    id: string;
  };
  schemaVersion: number;
}

export interface CapxImportedEvent extends BaseEvent {
  eventType: 'capx.episode.imported';
  aggregateType: 'capx_episode';
  payload: {
    success: boolean;
    policyViolations: number;
    recoveryCount: number;
    durationSec?: number;
    simToReal?: boolean;
    taskName: string;
    abstraction: string;
  };
}

export interface MemoryNodeCreatedEvent extends BaseEvent {
  eventType: 'memory.node.created';
  aggregateType: 'memory_node';
  payload: {
    title: string;
    content: string;
    level: string;
    plane: string;
    category: string;
    tags: string[];
  };
}

export interface RuntimeInterceptedEvent extends BaseEvent {
  eventType: 'runtime.intercepted';
  aggregateType: 'runtime_intercept';
  payload: {
    skillRunId: string;
    target: string;
    decision: 'permit' | 'deny';
    matchedRuleIds: string[];
    reason?: string;
  };
}

export type DomainEvent = CapxImportedEvent | MemoryNodeCreatedEvent | RuntimeInterceptedEvent;

// COMMANDS
export interface ImportCapxCommand {
  command: 'ImportCapxTrace';
  payload: {
    filePath: string;
    overrideExisting: boolean;
  };
}
