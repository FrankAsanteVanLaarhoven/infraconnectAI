import { GovernanceEngine } from '../src/lib/governance/engine'
import { db as prisma } from '../src/lib/db'

async function verify() {
  console.log('--- Governance Verification ---')
  const engine = new GovernanceEngine()
  
  // 1. Initial count
  const initialNodes = await prisma.memoryNode.count()
  console.log(`Initial nodes in DB: ${initialNodes}`)

  // 2. Run Autonomous Cycle
  console.log('Executing autonomous cycle...')
  const result = await engine.runPolicyCycle(true)
  
  console.log('Cycle Results:')
  console.log(`- Nodes Scored: ${result.totalNodes}`)
  console.log(`- Promotion Candidates: ${result.promotionCandidates.length}`)
  console.log(`- Actions Applied: ${result.actionsApplied.length}`)
  result.actionsApplied.forEach(a => console.log(`  > ${a}`))

  // 3. Verify Projection
  const projection = await prisma.governanceProjection.findUnique({ where: { id: 'singleton' }})
  if (projection) {
    console.log('Projection Updated Successfully:')
    console.log(`- Canon: ${projection.canonCount}`)
    console.log(`- Wiki: ${projection.wikiCount}`)
    console.log(`- Scratch: ${projection.scratchCount}`)
  } else {
    console.error('Projection not found!')
  }

  // 4. Verify Logs
  const logs = await prisma.aiAuditLog.findMany({
    where: { user: 'system:governance' },
    orderBy: { timestamp: 'desc' },
    take: 5
  })
  console.log(`Activity Logs created: ${logs.length}`)
  logs.forEach(l => console.log(`  [${l.action}] ${l.input}`))
}

verify().catch(console.error)
