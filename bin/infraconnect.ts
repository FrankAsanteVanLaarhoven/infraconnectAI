#!/usr/bin/env bun
import { Command } from 'commander';

const program = new Command();
const API_BASE = process.env.InfraConnect_API_URL || 'http://localhost:3000/api';
const ADMIN_KEY = process.env.InfraConnect_KEY || 'auth_dev_key';

program
  .name('infraconnect')
  .description('SOTA CLI for InfraConnect AI Mission Control')
  .version('1.0.0');

// ── Fleet Command ──────────────────────────────────────────────────────────
program
  .command('fleet')
  .description('List all active agents and their health status')
  .action(async () => {
    console.log('\n[InfraConnect] Querying Global Fleet Status...');
    try {
      const res = await fetch(`${API_BASE}/fleet/agents`);
      const { agents } = await res.json();
      
      console.table(agents.map((a: any) => ({
        ID: a.id,
        Name: a.displayName,
        Tier: a.deployTier.toUpperCase(),
        Status: a.status.toUpperCase(),
        Incidents: a._count.incidents,
        Telemetry: a._count.telemetry
      })));
    } catch (err) {
      console.error('[CLI_ERR] Failed to reach Control Plane cluster.');
    }
  });

// ── Skill Run Command ──────────────────────────────────────────────────────
program
  .command('run <skill>')
  .description('Dispatch a mission-critical skill to the edge')
  .option('-a, --agent <id>', 'Target agent ID')
  .action(async (skill, options) => {
    console.log(`\n[InfraConnect] Dispatching skill: ${skill}...`);
    try {
      const res = await fetch(`${API_BASE}/nemoclaw/run`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_KEY}`,
          'x-iam-clearance': 'L5-GodMode'
        },
        body: JSON.stringify({
          skillId: skill,
          agentId: options.agent || 'command-agent-01',
          taskSummary: `CLI_DISPATCH: ${skill}`
        })
      });
      const data = await res.json();
      if (data.blocked) {
        console.log(`\x1b[31m[REJECTED]\x1b[0m Policy Violation: ${data.reason}`);
      } else {
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Skill ${skill} executed successfully.`);
        console.log(`Report: ${data.report?.output || 'No output recorded.'}`);
      }
    } catch (err) {
      console.error('[CLI_ERR] Dispatch failure.');
    }
  });

// ── Governance Cycle Command ──────────────────────────────────────────────
program
  .command('cycle')
  .description('Trigger an immediate autonomous governance cycle')
  .action(async () => {
    console.log('\n[InfraConnect] Triggering Governance Cycle...');
    try {
      const res = await fetch(`${API_BASE}/governance/cycle`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ADMIN_KEY}` }
      });
      if (res.ok) {
        console.log('\x1b[1m[EXECUTED]\x1b[0m Governance cycle successfully propagated to all stratum levels.');
      } else {
        console.log('\x1b[31m[FAILED]\x1b[0m Governance cycle rejected by Control Plane.');
      }
    } catch (err) {
      console.error('[CLI_ERR] Cycle propagation failure.');
    }
  });

program.parse();
