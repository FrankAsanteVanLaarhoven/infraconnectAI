import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Resilient Prisma Instantiation
let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query'],
  });
} catch (error) {
  console.warn("[PRISMA_INIT_FAIL] Database client could not be initialized. Entering restricted mode.");
  // Return a dummy object that throws descriptive errors if called, 
  // but doesn't crash the module import.
  prisma = new Proxy({} as PrismaClient, {
    get: (_, prop) => {
      if (prop === '$connect' || prop === '$on' || prop === '$disconnect') return () => Promise.resolve();
      return () => { throw new Error("DB_OFFLINE: Prisma client generation missing or database unreachable."); };
    }
  });
}

export const db = prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}