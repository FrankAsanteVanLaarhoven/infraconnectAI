const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const leads = await prisma.lead.findMany({ take: 1 });
    console.log("SUCCESS. Leads:", leads.length);
  } catch (e) {
    console.error("FAILED:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
