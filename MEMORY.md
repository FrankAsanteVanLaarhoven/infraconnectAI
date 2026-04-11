# MEMORY.md
# MEMDEVOS — Memory DevOps Schema v2.0
# Place this file at the root of any project to declare it a MEMDEVOS workspace.
# Agents (Claude Code, Codex, Cursor, Windsurf) read this file at session start.

## Project
name: MEMDEVOS
version: 2.0.0
description: Memory-governed agent workspace with tiered knowledge and skill contracts.

---

## Memory Architecture

This workspace uses a three-stratum memory model. Every node has a `level` and a `status`.
The agent must respect these tiers and their promotion rules at all times.

### Strata

| Level | Name     | Status values          | TTL policy              | Agent behaviour                        |
|-------|----------|------------------------|-------------------------|----------------------------------------|
| L0    | Raw      | scratch                | 7 days (logs/telemetry) | Read-only after creation. Never cite as authoritative. |
| L1    | Wiki     | wiki                   | 90 days (wiki), 30 days (tactical logs) | Read + cite. Update when new evidence arrives. |
| L2    | Canon    | canon                  | No auto-expiry          | Read + cite. NEVER modify without explicit human review. |
| —     | Archived | archived               | Permanent               | Do not read or cite.                   |

### Promotion Rules (enforced by GovernanceEngine)

```
scratch  ──(score ≥ 0.60)──▶  wiki
wiki     ──(score ≥ 0.85, zero conflicts)──▶  canon
any      ──(score < 0.25 OR TTL expired)──▶  archived
```

Promotions are queued in the Governance panel. Human approval required for wiki → canon.
scratch → wiki can be auto-promoted by the governance engine.

---

## Folder Structure

```
memory/
├── raw/                  # L0 — immutable source material
│   ├── papers/
│   ├── logs/             # ROS2 bags, sim telemetry
│   ├── meetings/
│   └── telemetry/
├── wiki/                 # L1 — structured, reviewed knowledge
│   ├── entities/         # Named systems, hardware, people
│   ├── concepts/         # Algorithms, methods, frameworks
│   ├── decisions/        # ADRs and experiment findings
│   └── projects/         # Per-project summaries
├── canon/                # L2 — validated, normative standards
│   ├── standards/        # Coding standards, safety specs
│   ├── playbooks/        # How-to guides
│   └── patterns/         # Reusable architectural patterns
├── scratch/              # Active WIP — auto-pruned after 7 days
├── governance/
│   ├── policies.md       # Active governance policies
│   ├── health.json       # Latest health score snapshot
│   └── feedback/
│       ├── approved.json
│       └── rejected.json
├── index.md              # Auto-generated catalog (do not edit manually)
└── log.md                # Append-only ingest and activity log
```

---

## Node Frontmatter Schema

Every wiki and canon markdown file must include YAML frontmatter:

```yaml
***
id: uid>
title: "Human-readable title"
level: l0 | l1 | l2
plane: execution | memory | governance
category: <string>           # e.g. navigation, manipulation, safety, system
status: scratch | wiki | canon | archived
tags: [tag1, tag2]
healthScore: 0.0–1.0         # Set by GovernanceEngine — do not edit manually
conflictCount: 0             # Number of unresolved conflicts
referenceCount: 0            # Times referenced in skill runs
lastValidated: ISO-8601      # Date agent or human last verified this
expiresAt: ISO-8601 | null   # null = no auto-expiry
createdAt: ISO-8601
updatedAt: ISO-8601
***
```

---

## Skill Contracts

Every skill invocation is bound by a memory contract. The agent MUST respect these.

| Skill                     | Reads                              | Writes                          | Hard Constraints                                     |
|---------------------------|------------------------------------|---------------------------------|------------------------------------------------------|
| `/spec`                   | L2 canon, wiki/decisions           | wiki/projects, log.md           | May not modify canon                                 |
| `/plan`                   | L2 canon, wiki/entities            | scratch/<proj>-plan.md          | Must read canon standards before planning            |
| `/build`                  | scratch plan, wiki/entities        | scratch/<proj>-wip.md, raw/telemetry | May not write to canon directly                 |
| `/test`                   | wiki/projects, canon/standards     | raw/telemetry, wiki/decisions   | Test findings must be recorded before marking done   |
| `/review`                 | all above + feedback/rejected.json | wiki/decisions, canon/patterns  | Must check rejected.json to avoid repeat mistakes    |
| `/code-simplify`          | wiki/entities, canon/patterns      | wiki/decisions                  | Behaviour must be unchanged — tests must pass        |
| `/ship`                   | canon/standards/release.md         | canon/<proj>-released.md        | Release criteria doc must exist before shipping      |
| `/vla-safety-verification`| L2 canon, api/constraints          | wiki/decisions, api/violations  | ALL hard constraints evaluated. Any hard FAIL blocks |
| `/sim-to-real-validation` | api/experiments, api/sim-real      | api/sim-real/deltas             | Paired sim+real runs required. Delta ≤ 0.15          |
| `/constraint-audit`       | api/constraints, L2 canon          | wiki/decisions/audit            | Every domain needs ≥1 hard constraint                |
| `/deadline-certification` | api/experiments (real only)        | L2 canon (cert node)            | P95 ≤ 160ms. Real hardware only. ≥50 samples         |

---

## Session Bootstrap Protocol

At the start of every agent session the agent MUST call `POST /api/bootstrap` with the
task intent before taking any other action. The response provides:

1. **Canon context** (L2) — non-negotiable standards and policies (budget: 2000 tokens)
2. **Wiki context** (L1) — domain-relevant decisions and entities (budget: 3000 tokens)
3. **WIP context** (L0) — active work in progress for continuity (budget: 500 tokens)
4. **Skill contract** — the contract for the skill being invoked
5. **Health warnings** — any stale or missing knowledge to be aware of

The `bootstrapMarkdown` field in the response is the ready-to-use system prompt prefix.

---

## Governance Policies (defaults)

| Policy          | Type      | Rule                                                       | Active |
|-----------------|-----------|------------------------------------------------------------|--------|
| TTL-scratch     | decay     | L0 scratch nodes expire after 7 days                       | true   |
| TTL-tactical    | decay     | L1 nodes tagged 'ros2_log' or 'sim_telemetry' expire 30d   | true   |
| TTL-wiki        | decay     | L1 wiki nodes not validated in 90d demoted to archived     | true   |
| Auto-promote    | promotion | L0 score ≥ 0.60 → queue for wiki promotion                 | true   |
| Canon-gate      | promotion | L1 score ≥ 0.85 AND conflictCount = 0 → queue for canon   | true   |
| Conflict-flag   | conflict  | Jaccard similarity > 0.55 within same category → flag      | true   |
| Redundancy-warn | redundancy| 3+ nodes in same category with >60% overlap → suggest merge| true   |

Governance cycle runs every 6 hours via the Agent Bus scheduler.
Manual trigger: `POST /api/governance { "action": "run_cycle" }`

---

## Health Score Components

The 6-signal health score drives all governance decisions:

| Signal      | Weight | Description                                      |
|-------------|--------|--------------------------------------------------|
| recency     | 0.20   | Time since lastValidated (decays from 1.0→0.1)  |
| frequency   | 0.20   | referenceCount in skill runs (0→1.0)             |
| importance  | 0.25   | Level weight: L2=1.0, L1=0.7, L0=0.3            |
| conflict    | 0.15   | Inverse: 0 conflicts=1.0, many conflicts=0.1     |
| redundancy  | 0.10   | Uniqueness vs peers: unique=1.0, redundant=0.0   |
| coverage    | 0.10   | Category present in canon: yes=1.0, no=0.4       |

---

## Agent Adapter Files

This workspace generates the following adapter files from canon context.
Do not edit these manually — they are regenerated on every governance cycle.

| File                              | Tool           | Auto-generated |
|-----------------------------------|----------------|----------------|
| `CLAUDE.md`                       | Claude Code    | ✅             |
| `AGENTS.md`                       | OpenAI Codex   | ✅             |
| `.cursorrules`                    | Cursor         | ✅             |
| `.windsurfrules`                  | Windsurf       | ✅             |
| `.github/copilot-instructions.md` | GitHub Copilot | ✅             |

---

## MCP Server

MEMDEVOS exposes an MCP server for direct LLM tool use:

```
Endpoint:  http://localhost:3004 (Socket.IO)
HTTP emit: http://localhost:3005/emit (POST)
Bootstrap: http://localhost:3000/api/bootstrap (POST)
Search:    http://localhost:3000/api/memory?search=<query> (GET)
```

---

## Lint Rules (enforced by `mem lint`)

- [ ] Every L2 node has a valid `lastValidated` within 90 days
- [ ] Every L1 decision node references at least one source (parentId or url in content)
- [ ] No L1/L2 node has `conflictCount > 2` without a resolution plan in content
- [ ] index.md covers all nodes (auto-check via node count vs index entries)
- [ ] log.md has an entry for every node created in the last 7 days
- [ ] No active hard safety constraint has `lastTestedAt = null`
- [ ] No `scratch/` node is older than 7 days
- [ ] Every skill run with status `completed` has at least one `memoryWritten` node
