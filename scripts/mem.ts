#!/usr/bin/env tsx
// scripts/mem.ts
// InfraConnect CLI — mem <command> [options]
// Usage: npx tsx scripts/mem.ts <command> //
// Commands:
//   mem init              Scaffold memory folder structure + MEMORY.md
//   mem ingest <file>     Ingest a file or URL into memory
//   mem lint              Run health checks on the workspace
//   mem promote <id>      Promote a node to the next level
//   mem search <query>    Search memory nodes
//   mem status            Show system health summary
//   mem cycle             Trigger a governance cycle

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = process.env.InfraConnect_URL ?? 'http://localhost:3006'
const args = process.argv.slice(2)
const command = args[0]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`\x1b[32m[mem]\x1b[0m ${msg}`) }
function warn(msg: string) { console.log(`\x1b[33m[mem]\x1b[0m ${msg}`) }
function err(msg: string)  { console.log(`\x1b[31m[mem]\x1b[0m ${msg}`) }

async function api(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`API ${method} ${path} → ${res.status}: ${txt}`)
  }
  return res.json()
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdInit() {
  const dirs = [
    'memory/raw/papers', 'memory/raw/logs', 'memory/raw/meetings', 'memory/raw/telemetry',
    'memory/wiki/entities', 'memory/wiki/concepts', 'memory/wiki/decisions', 'memory/wiki/projects',
    'memory/canon/standards', 'memory/canon/playbooks', 'memory/canon/patterns',
    'memory/scratch',
    'memory/governance/feedback',
  ]
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      log(`Created ${dir}/`)
    }
  }

  // Write starter index.md
  if (!existsSync('memory/index.md')) {
    writeFileSync('memory/index.md', `# Memory Index\n*Auto-maintained by InfraConnect. Do not edit manually.*\n\n## L2 Canon\n\n## L1 Wiki\n\n## L0 Raw\n`)
    log('Created memory/index.md')
  }

  // Write starter log.md
  if (!existsSync('memory/log.md')) {
    writeFileSync('memory/log.md', `# Memory Log\n*Append-only. Each entry: ## [YYYY-MM-DD] action | description*\n\n## ${new Date().toISOString().slice(0,10)} init | InfraConnect workspace initialised\n`)
    log('Created memory/log.md')
  }

  // Write MEMORY.md if missing
  if (!existsSync('MEMORY.md')) {
    warn('MEMORY.md not found — copy the schema spec from docs/MEMORY.md to project root')
  }

  log('✅ InfraConnect workspace initialised. Run `mem status` to check system health.')
}

async function cmdIngest(filePath: string) {
  if (!filePath) { err('Usage: mem ingest <file-path-or-url>'); process.exit(1) }

  let content: string
  let title: string
  let type = 'generic'

  if (filePath.startsWith('http')) {
    warn('URL ingest — fetching content...')
    const res = await fetch(filePath)
    content = await res.text()
    // Strip HTML tags for basic text extraction
    content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000)
    title = filePath.split('/').pop() ?? filePath
    type = 'url'
  } else if (existsSync(filePath)) {
    content = readFileSync(filePath, 'utf-8')
    title = filePath.split('/').pop()?.replace(/\.[^.]+$/, '') ?? filePath
    // Infer type from path
    if (filePath.includes('ros2') || filePath.includes('.bag') || filePath.includes('topic'))
      type = 'ros2_log'
    else if (filePath.includes('isaac') || filePath.includes('sim') || filePath.includes('telemetry'))
      type = 'sim_telemetry'
    else if (filePath.includes('meeting') || filePath.includes('supervision'))
      type = 'meeting_note'
    else if (filePath.endsWith('.pdf') || filePath.includes('paper') || filePath.includes('arxiv'))
      type = 'paper'
  } else {
    err(`File not found: ${filePath}`)
    process.exit(1)
  }

  log(`Ingesting [${type}] "${title}"...`)
  try {
    const result = await api('/api/ingest', 'POST', { content, title, type })
    log(`✅ Raw node:  ${result.rawNodeId}`)
    log(`✅ Wiki node: ${result.wikiNodeId}`)
    if (result.conflictCount > 0) {
      warn(`⚠️  ${result.conflictCount} conflict(s) detected — review in Governance panel`)
    }
    console.log('\nExtracted knowledge preview:')
    console.log(result.extracted?.slice(0, 600) || '<missing>')
    if (result.extracted?.length > 600) console.log('\n[...truncated]')
  } catch (e) {
    err(`Ingest failed: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}

async function cmdLint() {
  log('Running memory lint checks...')
  const issues: Array<{ level: 'error' | 'warn'; msg: string }> = []

  try {
    const { nodes } = await api('/api/memory?status=wiki,canon&take=500')
    const { constraints } = await api('/api/constraints')
    const { ingests } = await api('/api/ingest').catch(() => ({ ingests: [] }))

    const now = Date.now()
    const day90 = 90 * 24 * 60 * 60 * 1000
    const day7  = 7  * 24 * 60 * 60 * 1000

    // Rule 1: L2 nodes validated within 90 days
    for (const n of (nodes || []).filter((n: { level: string }) => n.level === 'l2')) {
      if (!n.lastValidated || now - new Date(n.lastValidated).getTime() > day90) {
        issues.push({ level: 'warn', msg: `L2 node not validated in >90d: "${n.title.slice(0,60)}"` })
      }
    }

    // Rule 2: No L1/L2 with conflictCount > 2 without resolution
    for (const n of (nodes || [])) {
      if (n.conflictCount > 2) {
        issues.push({ level: 'error', msg: `${n.conflictCount} unresolved conflicts: "${n.title.slice(0,60)}"` })
      }
    }

    // Rule 3: Every completed skill run has a memoryWritten node
    const { runs } = await api('/api/skills?status=completed&take=50').catch(() => ({ runs: [] }))
    for (const r of (runs || [])) {
      const written = r.memoryWritten ? JSON.parse(r.memoryWritten) : []
      if (written.length === 0) {
        issues.push({ level: 'warn', msg: `Skill run /${r.skill} (${r.id.slice(-8)}) has no memoryWritten nodes` })
      }
    }

    // Rule 4: Scratch nodes older than 7 days
    const { nodes: scratch } = await api('/api/memory?status=scratch&take=100').catch(() => ({ nodes: [] }))
    for (const n of (scratch || [])) {
      if (now - new Date(n.createdAt).getTime() > day7) {
        issues.push({ level: 'warn', msg: `Stale scratch node (>${7}d): "${n.title.slice(0,60)}"` })
      }
    }

    // Rule 5: Safety constraints — no UNTESTED hard constraints
    for (const c of (constraints || [])) {
      if (c.severity === 'hard' && !c.lastTestedAt) {
        issues.push({ level: 'error', msg: `Hard constraint UNTESTED: "${c.name}" — blocks deployment` })
      }
    }

    // Rule 6: All four VLA domains have at least one hard constraint
    const REQUIRED_DOMAINS = ['navigation', 'manipulation', 'perception', 'system']
    const coveredDomains = new Set(
      (constraints || []).filter((c: { severity: string }) => c.severity === 'hard').map((c: { domain: string }) => c.domain)
    )
    for (const domain of REQUIRED_DOMAINS) {
      if (!coveredDomains.has(domain)) {
        issues.push({ level: 'error', msg: `No hard constraint for domain: "${domain}"` })
      }
    }

    // Rule 7: index.md coverage
    if (existsSync('memory/index.md')) {
      const indexContent = readFileSync('memory/index.md', 'utf-8')
      const wikiCanonNodes = (nodes || []).filter((n: { status: string }) =>
        n.status === 'wiki' || n.status === 'canon'
      )
      const uncatalogued = wikiCanonNodes.filter(
        (n: { id: string }) => !indexContent.includes(n.id)
      )
      if (uncatalogued.length > 0) {
        issues.push({ level: 'warn', msg: `${uncatalogued.length} nodes not catalogued in index.md` })
      }
    } else {
      issues.push({ level: 'warn', msg: 'memory/index.md not found — run `mem init`' })
    }

    // Report
    console.log('')
    if (issues.length === 0) {
      log('✅ All lint checks passed. Memory workspace is healthy.')
    } else {
      const errors = issues.filter(i => i.level === 'error')
      const warnings = issues.filter(i => i.level === 'warn')
      if (errors.length > 0) {
        err(`\n${errors.length} error(s) found:`)
        errors.forEach(i => err(`  ✗ ${i.msg}`))
      }
      if (warnings.length > 0) {
        warn(`\n${warnings.length} warning(s):`)
        warnings.forEach(i => warn(`  ⚠ ${i.msg}`))
      }
      if (errors.length > 0) process.exit(1)
    }
  } catch (e) {
    err(`Lint failed — is InfraConnect running at ${BASE_URL}?`)
    err(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}

async function cmdPromote(nodeId: string) {
  if (!nodeId) { err('Usage: mem promote <node-id>'); process.exit(1) }
  log(`Promoting node ${nodeId}...`)
  try {
    const nodes = await api(`/api/memory?id=${nodeId}`)
    const node = Array.isArray(nodes) ? nodes[0] : nodes
    if (!node) { err(`Node not found: ${nodeId}`); process.exit(1) }

    const toStatus = node.status === 'scratch' ? 'wiki'  : 'canon'
    const toLevel  = node.level  === 'l0'      ? 'l1'    : 'l2'

    const result = await api('/api/governance', 'POST', {
      action: 'promote',
      nodeId,
      toStatus,
      toLevel,
    })
    log(`✅ Promoted "${result.title || node.title}" → ${toLevel} / ${toStatus}`)
  } catch (e) {
    err(`Promote failed: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}

async function cmdSearch(query: string) {
  if (!query) { err('Usage: mem search <query>'); process.exit(1) }
  log(`Searching: "${query}"`)
  try {
    const result = await api(`/api/memory?search=${encodeURIComponent(query)}&take=10`)
    const nodes = result.nodes ?? result
    if (!nodes?.length) { warn('No results found.'); return }
    console.log('')
    for (const n of nodes) {
      const lvl = n.level?.toUpperCase() ?? '??'
      const color = lvl === 'L2' ? '\x1b[32m' : lvl === 'L1' ? '\x1b[34m' : '\x1b[90m'
      console.log(`${color}[${lvl}]\x1b[0m ${n.title}`)
      console.log(`       \x1b[90m${n.status} · ${n.category} · health: ${(n.healthScore ?? 0).toFixed(2)} · id: ${n.id}\x1b[0m`)
      console.log(`       ${(n.content || '').slice(0, 120).replace(/\n/g, ' ')}...\n`)
    }
  } catch (e) {
    err(`Search failed: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}

async function cmdStatus() {
  log('Fetching system status...')
  try {
    const [health, govData, vlaDash] = await Promise.all([
      api('/api/health'),
      api('/api/governance').catch(() => ({})),
      api('/api/vla-dashboard').catch(() => null),
    ])

    console.log('\n\x1b[1m─── InfraConnect Status ───────────────────────────────\x1b[0m')
    console.log(`\n  Overall health:      \x1b[${health.overall > 0.7 ? '32' : health.overall > 0.4 ? '33' : '31'}m${(health.overall * 100 || 0).toFixed(0)}%\x1b[0m`)
    console.log(`  L0 (raw):            ${(health.byLevel?.l0?.avgHealth * 100 ?? 0).toFixed(0)}%`)
    console.log(`  L1 (wiki):           ${(health.byLevel?.l1?.avgHealth * 100 ?? 0).toFixed(0)}%`)
    console.log(`  L2 (canon):          ${(health.byLevel?.l2?.avgHealth * 100 ?? 0).toFixed(0)}%`)
    console.log(`\n  Nodes total:         ${govData.nodes?.length ?? '?'}`)
    console.log(`  Promotion queue:     ${govData.promotionCandidates?.length ?? 0}`)
    console.log(`  Decay candidates:    ${govData.decayCandidates?.length ?? 0}`)
    console.log(`  Conflict nodes:      ${govData.conflictNodes?.length ?? 0}`)

    if (vlaDash) {
      const sh = vlaDash.systemHealth
      console.log('\n\x1b[1m─── VLA Safety ────────────────────────────────────\x1b[0m')
      console.log(`\n  Deployment gate:     ${sh.hardConstraintsAtRisk === 0 && sh.deadlineCertified ? '\x1b[32mREADY\x1b[0m' : '\x1b[31mBLOCKED\x1b[0m'}`)
      console.log(`  Active constraints:  ${sh.activeConstraints}`)
      console.log(`  At risk (>3 viol):   ${sh.hardConstraintsAtRisk}`)
      console.log(`  Violations (24h):    ${sh.totalViolations24h}`)
      console.log(`  Deadline certified:  ${sh.deadlineCertified ? '\x1b[32myes\x1b[0m' : '\x1b[31mno\x1b[0m'}`)
      console.log(`  Constraint coverage: ${(sh.constraintCoverage * 100).toFixed(0)}%`)
      console.log(`  Sim→real readiness:  ${(sh.transferReadiness * 100).toFixed(0)}%`)
    }
    console.log('\n\x1b[1m───────────────────────────────────────────────────\x1b[0m\n')
  } catch (e) {
    err(`Status failed — is InfraConnect running at ${BASE_URL}?`)
    err(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}

async function cmdCycle() {
  log('Triggering governance cycle...')
  try {
    const result = await api('/api/governance', 'POST', { action: 'run_cycle' })
    log(`✅ Cycle complete`)
    log(`   Nodes scored:    ${result.totalNodes}`)
    log(`   Promotions:      ${result.promotionCandidates?.length ?? 0}`)
    log(`   Archived:        ${result.actionsApplied?.length ?? 0}`)
    log(`   Conflict pairs:  ${result.conflictPairs?.length ?? 0}`)
    log(`   Overall health:  ${(result.healthSummary?.overall * 100 ?? 0).toFixed(0)}%`)
    if (result.actionsApplied?.length > 0) {
      console.log('\nActions applied:')
      result.actionsApplied.forEach((a: string) => warn(`  · ${a}`))
    }
  } catch (e) {
    err(`Cycle failed: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}

function cmdHelp() {
  console.log(`
\x1b[1mInfraConnect CLI — mem <command>\x1b[0m

  \x1b[32mmem init\x1b[0m                     Scaffold memory folder structure
  \x1b[32mmem ingest <file|url>\x1b[0m        Ingest source into memory (L0→L1)
  \x1b[32mmem lint\x1b[0m                     Run all health and compliance checks
  \x1b[32mmem promote <node-id>\x1b[0m        Promote node to next stratum
  \x1b[32mmem search <query>\x1b[0m           Search memory nodes (BM25)
  \x1b[32mmem status\x1b[0m                   Show system health + VLA safety summary
  \x1b[32mmem cycle\x1b[0m                    Trigger governance cycle immediately

\x1b[90mEnvironment:
  InfraConnect_URL  Base URL of running InfraConnect instance (default: http://localhost:3006)\x1b[0m
`)
}

// ─── Router ───────────────────────────────────────────────────────────────────

;(async () => {
  switch (command) {
    case 'init':    await cmdInit(); break
    case 'ingest':  await cmdIngest(args[1]); break
    case 'lint':    await cmdLint(); break
    case 'promote': await cmdPromote(args[1]); break
    case 'search':  await cmdSearch(args.slice(1).join(' ')); break
    case 'status':  await cmdStatus(); break
    case 'cycle':   await cmdCycle(); break
    default:        cmdHelp(); break
  }
})()
