export type EventType = 
  | 'memory.node.created'
  | 'memory.node.promoted'
  | 'runtime.intercepted'
  | 'telemetry.signal.imported'
  | 'cognitive.session.started'
  | 'cognitive.memory.pushed';

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

export interface TelemetryImportedEvent extends BaseEvent {
  eventType: 'telemetry.signal.imported';
  aggregateType: 'telemetry_signal';
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

export type DomainEvent = TelemetryImportedEvent | MemoryNodeCreatedEvent | RuntimeInterceptedEvent;

// COMMANDS
export interface SyncTelemetryCommand {
  command: 'SyncTelemetryTrace';
  payload: {
    filePath: string;
    overrideExisting: boolean;
  };
}
