import { GovernanceEngine } from '../src/lib/governance/engine';

async function launchAutonomousLoop() {
  console.log(`\n===========================================================`);
  console.log(` Autonomous Swarm Governor - ACTIVE DEPLOYMENT `);
  console.log(` Interval: 60 Seconds | SOTA Verifications: ENABLED `);
  console.log(`===========================================================\n`);

  const engine = new GovernanceEngine();
  
  // Natively poll the swarm arrays infinitely while the process remains active in PM2
  setInterval(async () => {
    try {
        console.log(`[SWARM_GOVERNOR] [${new Date().toISOString()}] Executing Substrate Validation & Promotion cycle...`);
        const result = await engine.runPolicyCycle(true); // 'true' forces autonomous action write-backs
        
        if (result.actionsApplied.length > 0) {
            console.log(`   > ${result.actionsApplied.length} actions applied autonomously this cycle.`);
            result.actionsApplied.forEach(action => {
                console.log(`     - [LOG] ${action}`);
            });
        }
    } catch (e: any) {
        console.error(`[SWARM_GOVERNOR] [FATAL ERROR] Anomaly intercepted during active cycle:`, e.message);
    }
  }, 60000); // 60 seconds
}

// Keep the process alive indefinitely
launchAutonomousLoop().catch(console.error);

process.on('SIGINT', () => {
    console.log('[SWARM_GOVERNOR] Intercepted SIGINT. Gracefully detaching from Swarm.');
    process.exit(0);
});
