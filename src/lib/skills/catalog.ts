// src/lib/skills/catalog.ts
// Bundled SKILL.md content from addyosmani/agent-skills@0.5.0
// These are loaded at runtime as LLM system prompts

export const SKILL_CATALOG: Record<string, string> = {
  spec: `
# Spec-Driven Development
Write a structured specification before writing any code. The spec is the shared source of truth — it defines what we're building, why, and how we'll know it's done.

## Gated Workflow
SPECIFY → PLAN → TASKS → IMPLEMENT
Each phase requires human review before advancing.

## Phase 1: Specify
Surface assumptions immediately. Write a spec covering:
1. Objective — what we're building and why
2. Commands — full executable commands with flags
3. Project Structure — where source lives, where tests go
4. Code Style — one real snippet beats three paragraphs
5. Testing Strategy — framework, locations, coverage expectations
6. Boundaries — Always/Ask First/Never tiers

## Phase 2: Plan
Identify components and dependencies. Determine implementation order. Note risks and mitigation. Define verification checkpoints.

## Phase 3: Tasks
Break into discrete tasks: each completable in one session, with explicit acceptance criteria and a verification step.

## Phase 4: Implement
Execute tasks one at a time. Update spec when decisions change. Commit spec alongside code.

## Anti-Rationalization
- "This is simple, I don't need a spec" → Simple tasks still need acceptance criteria
- "I'll write the spec after" → That's documentation, not specification
- "Requirements will change anyway" → The spec is a living document

## Verification
Before proceeding: spec covers all six areas, human approved, success criteria are testable, boundaries defined.
`,

  plan: `
# Planning and Task Breakdown
Decompose specs into small, verifiable tasks with acceptance criteria and dependency ordering.

## Process
1. Read the spec fully before generating any tasks
2. Identify all components and their dependencies
3. Determine dependency order — what must exist before what
4. Break into tasks of ≤5 files each
5. Write acceptance criteria for every task
6. Write verification step (test command, build check, manual verification)
7. Present the plan for human review before starting

## Task Template
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm]
  - Files: [Which files will be touched]

## Anti-Rationalization
- "I can keep the plan in my head" → Written plans catch ordering mistakes before they compound
- "Plans slow down implementation" → Unplanned implementation creates rework

## Verification
Tasks are ordered by dependency, each has acceptance criteria, human has reviewed the plan.
`,

  build: `
# Incremental Implementation
Thin vertical slices — implement, test, verify, commit. One slice at a time.

## Process
1. Take one task from the plan
2. Write the test first (see test-driven-development)
3. Implement the minimum code to pass the test
4. Verify: run tests, run build, run type check
5. Commit the passing slice
6. Move to the next task

## Rules
- Never implement more than one slice before testing
- Feature flags for anything that touches production paths
- Safe defaults — new code must not break existing behaviour
- If a slice requires changing >5 files, split it

## Anti-Rationalization
- "I'll test at the end" → Untested code is unfinished code
- "This change is small, I don't need a feature flag" → Small changes cause large incidents

## Verification
Each slice: tests pass, build passes, type check passes, committed.
`,

  test: `
# Test-Driven Development
Red-Green-Refactor. Tests are proof, not overhead.

## Test Pyramid
- 80% Unit tests — fast, isolated, test one thing
- 15% Integration tests — test component interactions  
- 5% E2E tests — test critical user paths end-to-end

## Red-Green-Refactor
1. RED: Write a failing test that describes the behaviour
2. GREEN: Write the minimum code to pass it
3. REFACTOR: Clean up without changing behaviour
4. Repeat

## Test Naming
[unit under test]_[scenario]_[expected outcome]
e.g. getUserById_whenUserDoesNotExist_returnsNull

## DAMP over DRY
Tests should be Descriptive and Meaningful Phrases. A test that is easy to read is more valuable than one that avoids repetition.

## Beyonce Rule
If you break it, you own it. Add a test for every bug you fix.

## Anti-Rationalization
- "I'll add tests later" → Later never comes; test debt compounds
- "The code is too simple to test" → Simple code with no tests becomes complex code with no tests

## Verification
All tests pass, coverage meets target, no tests were deleted to make the suite pass.
`,

  review: `
# Code Review and Quality
Five-axis review. Change sizing ~100 lines. Severity labels.

## Five Axes of Review
1. Correctness — does it do what it says?
2. Security — does it introduce vulnerabilities?
3. Performance — does it degrade under load?
4. Maintainability — will the next engineer understand this?
5. Test coverage — is the behaviour proven?

## Severity Labels
- Nit: cosmetic, no blocking
- Optional: improvement, author's call
- FYI: informational, no action needed
- Must fix: blocks merge, correctness or security issue

## Change Sizing
Target ~100 lines per review. >300 lines is a review smell — split the PR.

## Anti-Rationalization
- "I'll review it myself, it's fine" → Self-review misses what you already believe to be true
- "The tests pass, so it's good" → Tests prove behaviour, not correctness of design

## Verification
All five axes assessed, all Must-fix comments resolved, change size is reasonable.
`,

  'code-simplify': `
# Code Simplification
Chesterton's Fence — understand before removing. Clarity over cleverness.

## Rule of 500
Any function longer than 500 lines is a candidate for extraction. Any file longer than 500 lines needs a plan.

## Chesterton's Fence
Before removing or simplifying code, understand why it exists. Complex code is often complex for a reason.

## Process
1. Read the code and understand its purpose
2. Identify complexity: nesting depth, function length, unclear names
3. Propose simplifications with a before/after comparison
4. Run the full test suite after every simplification
5. Commit each simplification separately

## Anti-Rationalization
- "I'll rewrite this from scratch" → Rewrites lose edge-case knowledge
- "This is clearly wrong code" → Chesterton's Fence — it may be wrong for important reasons

## Verification
Behaviour unchanged (tests pass), code is shorter or clearer, no functionality removed.
`,

  ship: `
# Shipping and Launch
Pre-launch checklists. Staged rollouts. Rollback procedures.

## Pre-Launch Checklist
- [ ] All tests pass in CI
- [ ] Type check passes
- [ ] Security checklist reviewed
- [ ] Performance baseline measured
- [ ] Rollback procedure documented
- [ ] Monitoring and alerting configured
- [ ] Feature flag in place if applicable
- [ ] Documentation updated

## Staged Rollout
1% → 10% → 25% → 50% → 100%
Define rollback criteria at each stage.

## Rollback Criteria
Document before launch: what metrics trigger an immediate rollback?

## Anti-Rationalization
- "We can fix it after launch" → Post-launch fixes affect real users
- "The staging environment is good enough" → Staging never fully replicates production

## Verification
Checklist complete, rollback procedure tested, monitoring confirms healthy metrics at each rollout stage.
`,

  hardware_audit: `
# Edge Hardware Audit
Collect low-level system metrics directly from the connected agent.

## Workflow
1. INGEST → READ CPU/RAM → READ SENSORS → LOG RECENT FAILURES
2. Surface any temperature or voltage anomalies.
3. Compare against canonical hardware standards.

## Verification
- CPU/RAM metrics retrieved
- Sensor state validated
- Audit log entry created
`,

  safety_stop: `
# System Safety Stop
Emergency isolation of edge hardware subsystems.

## Workflow
1. STOP ALL MOVEMENTS → ISOLATE MOTORS → LOG INCIDENT → NOTIFY OPS
2. This skill takes precedence over all other active tasks.

## Verification
- Hardware cutoff confirmed
- Subsystems isolated
- P0 incident recorded
`,
}

// Maps InfraConnect SkillName to catalog key
export const SKILL_NAME_MAP: Record<string, string> = {
  spec: 'spec',
  plan: 'plan',
  build: 'build',
  test: 'test',
  review: 'review',
  'code-simplify': 'code-simplify',
  ship: 'ship',
  hardware_audit: 'hardware_audit',
  safety_stop: 'safety_stop',
}
