const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const accessCode = '5555-4444-3333';
  const updated = await prisma.enterpriseLead.update({
    where: { id: 'cmod2pwl10001oh2wvpxegyij' },
    data: {
      status: 'cleared',
      accessCode: accessCode
    }
  });
  console.log("UPDATED LEAD:", updated);
}
main().catch(console.error).finally(() => prisma.$disconnect());
