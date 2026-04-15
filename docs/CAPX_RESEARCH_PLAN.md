# InfraConnect AI: Governed Autonomy Research Evaluation Plan

This document outlines the evaluation architecture and publication narrative for positioning InfraConnect AI as the state-of-the-art (SOTA) governed autonomy stack, anchored by the CaP-X benchmark.

## 1. The Core Scientific Claim
Current frontier agents (like native LLM-based autonomous systems) fail at long-horizon embodied tasks not because they cannot generate code, but because they lack **governed memory** and **runtime policy scopes**. 

**The Claim:** By stratifying memory into L0 (Execution/Sensory), L1 (Tactical/Wiki), and L2 (Canon/Governance) planes, and strictly enforcing intercepts via NemoClaw, InfraConnect AI substantially improves zero-shot transfer, task success rates across distinct abstraction levels (S2-S4), and autonomous recovery compared to standard prompt-based agents.

## 2. Benchmark Substrate: Integrating CaP-X
CaP-X defines the arena: 100+ manipulation tasks across Libero, Robosuite, and Behavior. To ground our SOTA claim, InfraConnect AI will execute a formal **Ablation Study** using CaP-X scenarios as the substrate.

### Methodological Setup
*   **Domain Selection:** We will select 20 heavily constrained tasks from the CaP-X library (e.g., rigid body manipulation avoiding kinematic singularities).
*   **The Baseline (System A):** CaP-Agent (Standard Code Generation VM). No memory tiering, no NemoClaw intercepts.
*   **The Target (System B - InfraConnect AI):** CaP-Agent wrapped inside the InfraConnect AI execution shell.
    *   L2 Canon enforcing movement safety guardrails via *NemoClaw*.
    *   L0/L1 Memory capturing failed execution logs to fuel *Autonomous Auto-Recovery*.
    *   PersonaPlex acting as the *Adaptive Teaming Loop* for multi-turn human correction.

## 3. Dataflow Architecture for Evaluation
To make this publishable, the "Upload Traces" feature in the CaP-X panel must map to a rigorous schema. 

**The Telemetry Pipeline:**
1.  **Ingestion:** CaP-X execution trace logs (JSON standard) are uploaded via the dashboard.
2.  **Parser:** The backend converts the trace into `/api/memory` L0 nodes (representing the raw sensory output and error logs of the run).
3.  **Conflict & Governance Validation:** NemoClaw scans the imported trajectory against `L2-STRICT` canon policies.
4.  **Metric Computation:** The CaP-X Benchmark Panel computes the resulting UI metrics:
    *   `Task Success`: derived from the final state of the trace.
    *   `Policy Violations`: Count of `nemoclaw_block` events.
    *   `Auto-Recovery Rate`: The percentage of L0 error states that were resolved by promoting a localized `L1 Wiki` tactic.

## 4. The Publication Narrative
The resulting paper (target: CoRL, ICRA, or NeurIPS Datasets & Benchmarks) will be structured as follows:

*   **Abstract:** Standard coding agents degrade on long embodied horizons. We introduce InfraConnect AI, an operating system for agents that enforces policy and stratifies memory.
*   **Architecture:** Formal specification of the Execution (NemoClaw), Orchestration, Governance, and Interaction (PersonaPlex) planes.
*   **Experiments:** Validating on the CaP-X benchmark. We demonstrate that memory stratification (L0->L1->L2) improves zero-shot transfer by `[X]%` at the `S4` abstraction tier. 
*   **Ablation Studies:** What happens when we turn off NemoClaw? Policy violations spike. What happens when we disable L1 Wiki? Auto-recovery drops to baseline.
*   **Conclusion:** The future of embodied AI requires governed autonomy stacks, not just better foundational models.

## 5. Next Execution Steps (Backend Validation)
To achieve this empirically:
1.  **Define the Schema:** Formalize the `CapXTrace` JSON format.
2.  **Mock a True Trace:** Generate an authentic-looking JSON execution run from `LIBERO_PRO_012` to test the import function.
3.  **Wire the Importer:** Build the ingestion route (`/api/capx/import`) that writes directly into Prisma and dispatches `system.capx` log events to the Agent Bus.
