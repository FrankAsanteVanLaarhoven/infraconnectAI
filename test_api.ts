const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Testing FleetNode:");
    const nodes = await prisma.fleetNode.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      take: 2
    });
    console.log("Nodes:", nodes.length);

    console.log("Testing AgentIncident:");
    const intercepts = await prisma.agentIncident.findMany({
      where: { resolvedAt: null },
      orderBy: { ts: 'desc' },
      take: 2
    });
    console.log("Intercepts:", intercepts.length);

    console.log("Testing EnterpriseLead:");
    const crmMails = await prisma.enterpriseLead.count({
      where: { status: 'queued' }
    });
    console.log("CRMs:", crmMails);
}

main().catch(console.error).finally(() => prisma.$disconnect());
