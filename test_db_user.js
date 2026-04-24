const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const lead = await prisma.enterpriseLead.findFirst({
    where: { clientIdentifier: 'frank@lacoupefutur.com' }
  });
  console.log("LEAD:", lead);
}
main().catch(console.error).finally(() => prisma.$disconnect());
