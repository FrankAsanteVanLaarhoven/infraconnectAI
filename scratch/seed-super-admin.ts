import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING SUPER ADMIN MISSION CONTROL DATA ---');

  // 1. Create Fleet Nodes
  const nodes = [
    { robotId: 'node-us-east-01', alias: 'Edge-Washington', region: 'US-EAST', status: 'online', latitude: 38.9072, longitude: -77.0369, memoryBytes: BigInt(32 * 1024 * 1024 * 1024) },
    { robotId: 'node-eu-west-01', alias: 'Edge-London', region: 'EU-WEST', status: 'online', latitude: 51.5074, longitude: -0.1278, memoryBytes: BigInt(64 * 1024 * 1024 * 1024) },
    { robotId: 'node-ap-south-01', alias: 'Edge-Tokyo', region: 'AP-SOUTH', status: 'online', latitude: 35.6762, longitude: 139.6503, memoryBytes: BigInt(128 * 1024 * 1024 * 1024) },
    { robotId: 'node-latam-01', alias: 'Edge-Sao-Paulo', region: 'LATAM', status: 'maintenance', latitude: -23.5505, longitude: -46.6333, memoryBytes: BigInt(16 * 1024 * 1024 * 1024) },
    { robotId: 'node-me-01', alias: 'Edge-Dubai', region: 'MIDDLE-EAST', status: 'online', latitude: 25.2048, longitude: 55.2708, memoryBytes: BigInt(64 * 1024 * 1024 * 1024) },
  ];

  for (const node of nodes) {
    await prisma.fleetNode.upsert({
      where: { robotId: node.robotId },
      update: node,
      create: node,
    });
  }

  // 2. Create Anomalies
  const anomalies = [
    { type: 'NETWORK_LATENCY', severity: 'medium', description: 'BGP routing instability detected in EU-WEST sector. 15% packet loss observed.' },
    { type: 'UNAUTHORIZED_ACCESS', severity: 'high', description: 'Multiple failed brute-force attempts on node-us-east-01 from restricted IP range.' },
    { type: 'RESOURCE_EXHAUSTION', severity: 'low', description: 'Edge-Tokyo node approaching 90% memory utilization.' },
  ];

  for (const anom of anomalies) {
    await prisma.anomaly.create({
      data: anom
    });
  }

  // 3. Create Audit Logs
  const logs = [
    { user: 'admin@infraconnect.ai', action: 'FLEET_SYNC_INITIATED', resource: 'node-us-east-01', input: 'Triggering global hash verification protocol.' },
    { user: 'system', action: 'SECURITY_PATCH_DEPLOYED', resource: 'ALL_NODES', input: 'Critical kernel update pushed to entire edge fleet.' },
  ];

  for (const log of logs) {
    await prisma.aiAuditLog.create({
      data: {
        ...log,
        validated: true,
        executed: true,
        confidence: 1.0,
        reasoning: { type: 'automated', priority: 'high' }
      }
    });
  }

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
