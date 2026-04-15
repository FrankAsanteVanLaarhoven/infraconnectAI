# InfraConnect AI: V2 Event-Sourced Architecture (Rust, Go, Tauri)

This document dictates the complete implementation package for migrating InfraConnect AI from a Next.js API monolith to a high-performance, event-sourced, "iron cloud" foundation using **Rust (Core & Tauri), Go (Ingestion & Stream), and PostgreSQL**.

## 1. System Topology

### Layer 1: The Engine (Rust + Tauri)
*   **Role:** Desktop/edge daemon and core command validation. Runs locally to intercept OS-level file actions, Docker commands, and shell executions. 
*   **Tauri App:** Wraps the Next.js frontend into a native macOS/Windows application, bypassing browser sandbox limits for direct NemoClaw filesystem integration.
*   **Rust Core:** Validates state commands synchronously (`CreateNode`, `RunSkill`, `RequestRuntimeAction`), ensuring invariants before dispatching domain events.

### Layer 2: The Firehose (Go)
*   **Role:** High-throughput event ingestion, routing, and projection rebuilding.
*   **Go Service:** Subscribes to the core event stream (via NATS JetStream or Postgres WAL). It normalizes high-volume telemetry—such as **CaP-X benchmark traces** and **PersonaPlex duplex audio streams**—and materializes them into read-optimized SQL projection tables.

### Layer 3: Persistence (PostgreSQL)
*   `events`: The single, append-only source of truth.
*   `memory_nodes`: Extracted domain model.
*   `capx_episodes`: Projection table optimized for fast UI dashboard queries.

---

## 2. Event Schema & Postgres Layout

### Core Event Table Definition (Postgres)
```sql
CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    causation_id VARCHAR(255),
    correlation_id VARCHAR(255),
    actor JSONB NOT NULL,
    payload JSONB NOT NULL,
    schema_version INT NOT NULL DEFAULT 1
);

-- Indexing for rapid stream reconstruction
CREATE INDEX idx_events_aggregate ON events(aggregate_type, aggregate_id);
CREATE INDEX idx_events_correlation ON events(correlation_id);
```

### Unified Node Ontology
Nodes are no longer fragmented across UI tabs. They are strictly typed:
```typescript
type MemoryLevel = "L0" | "L1" | "L2";
type Plane = "execution" | "memory" | "governance";
type NodeKind = "artifact" | "decision" | "concept" | "project" | "policy" | "playbook" | "standard" | "entity" | "experiment" | "trace";
```

---

## 3. Command and Event Deltas

We split intention from fact.

**Command (Rust Core): `ImportCapxTrace`**
```json
{
  "command": "ImportCapxTrace",
  "payload": {
    "trace_file_path": "/var/capx/runs/run_019.json",
    "override_existing": true
  }
}
```

**Emitted Fact (Appended to DB): `capx.episode.imported`**
```json
{
  "event_id": "e4b9-...",
  "event_type": "capx.episode.imported",
  "aggregate_type": "capx_episode",
  "aggregate_id": "capx-libero-pro-012",
  "correlation_id": "benchmark_run_batch_7",
  "actor": { "type": "system", "id": "go-ingestion-worker" },
  "payload": {
      "success": true,
      "policy_violations": 0,
      "recovery_count": 1
  }
}
```

---

## 4. CaP-X Trace Ingestion Data Model

To answer your direct question, here is the exact data payload model that the Go ingestion engine will expect when a trace is uploaded via the UI.

```json
{
  "episode_id": "capx-libero-pro-012",
  "benchmark": "CaP-X",
  "suite": "LIBERO-PRO",
  "task_name": "cube_stack_avoid_singularity",
  "abstraction_layer": "S4",
  "agent": {
      "type": "cap-agent-nemoclaw",
      "model": "gpt-4o",
      "orchestrator_version": "infraconnect-v2.1"
  },
  "terminal_state": {
      "success": true,
      "sim_to_real_transferred": null,
      "duration_sec": 42.1
  },
  "governance_telemetry": {
      "policy_violations_blocked": 0,
      "nemo_claw_intercepts": 14,
      "autonomous_recoveries": 1
  },
  "execution_nodes": [
      {
         "node_id": "L0-trace-step-1",
         "action_intended": "move_ee_to(0.5, 0.2, 0.1)",
         "nemo_decision": "permit",
         "matched_rule_ids": ["canon-safe-workspace-1.0"]
      }
  ],
  "generated_code_ref": "artifact://capx-libero-pro-012-code"
}
```

### Processing Pipeline:
1. **Upload Trigger:** Operator clicks "Import Traces" in the UI.
2. **Go Ingestion Stream:** Takes the raw trace, parses the `execution_nodes` array, and commands the system to emit `memory.node.created` (Level `L0`, Plane `Execution`) events for the individual logs.
3. **Rust Worker:** Reads those `L0` entries, checks if `policy_violations_blocked` > 0 or `autonomous_recoveries` > 0, and updates the `HealthSnapshot` projection to reflect the new Conflict Density and Success rates.

---

## 5. Next Steps for Implementation

The architectural blueprint is locked. I am ready to begin scaffolding this in the repository:

1.  **Initialize Tauri + Rust Core:** Wrap the Next.js app inside a Tauri shell. Create the `src-tauri` directory with the native command handlers.
2.  **Scaffold Go Firehose:** Set up a `workers/go-ingestion` directory for the trace parsing engine.
3.  **Database Migration:** Write the new Postgres Prisma/SQL schema containing the `events` table and the `capx_episodes` projection.
