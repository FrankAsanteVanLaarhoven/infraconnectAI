import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Commits a semantic execution payload to the Postgres Persistence matrix.
 */
export async function storeMemory(type: "incident" | "decision" | "sim_vs_real_gap", payload: any) {
    try {
        const tenantId = process.env.TENANT_ID || "SYSTEM_ROOT";
        
        await prisma.memory.create({
            data: {
                tenantId,
                type,
                content: payload
            }
        });
        console.log(`[MEMORY] Flushed persistent intelligence gap: ${type}`);
    } catch(e) {
        console.error("[MEMORY] Write lock failed", e);
    }
}

/**
 * Searches the historical schema context mapping recent topological precedents.
 * In a native PGVector schema, this wraps OpenAI's `text-embedding` mapping directly against cosine similarity `ORDER BY embedding <-> query`. 
 */
export async function recallMemory(contextQuery: string, limit: number = 3) {
    const tenantId = process.env.TENANT_ID || "SYSTEM_ROOT";
    
    // Abstract fallback (Since vector mappings are structurally volatile here)
    const precedents = await prisma.memory.findMany({
        where: { tenantId },
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    return precedents.map(p => p.content);
}
