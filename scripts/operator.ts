#!/usr/bin/env tsx
/**
 * InfraConnect Operator CLI
 * Usage: npx tsx scripts/operator.ts cycle
 */
export {};

const BASE_URL = process.env.InfraConnect_URL ?? 'http://localhost:3006';
const SECRET = process.env.OPERATOR_SECRET_KEY ?? 'sota_operator_secret';

const command = process.argv[2];

async function runCycle() {
  console.log(`[operator] Triggering Sales Cycle at ${BASE_URL}...`);
  try {
    const res = await fetch(`${BASE_URL}/api/operator/cycle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET}`
      }
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Cycle complete.`);
      console.log(`   Processed: ${data.processedCount}`);
      data.results.forEach((r: any) => {
        console.log(`   · ${r.status === 'sent' ? '✓' : '✗'} ${r.email} ${r.error ? `(${r.error})` : ''}`);
      });
    } else {
      console.error(`❌ Cycle failed: ${data.error}`);
    }
  } catch (err) {
    console.error(`❌ Error connecting to server: ${err}`);
  }
}

async function main() {
  switch (command) {
    case 'cycle':
      await runCycle();
      break;
    default:
      console.log(`
InfraConnect Sales Operator CLI
Usage: npx tsx scripts/operator.ts <command>

Commands:
  cycle                Trigger the autonomous follow-up cycle
      `);
      break;
  }
}

main();
