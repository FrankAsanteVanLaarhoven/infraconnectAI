import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export type IngestSourceType =
  | 'paper'        // arXiv PDF or markdown
  | 'ros2_log'     // ROS2 bag summary or topic dump
  | 'sim_telemetry'// Isaac Sim run log
  | 'meeting_note' // supervision meeting notes
  | 'url'          // web article via Obsidian clipper or raw text
  | 'generic'      // catch-all

interface IngestRequest {
  content: string       // raw text content of the source
  title: string
  type: IngestSourceType
  url?: string
  tags?: string[]
}

// Domain-specific extraction prompts
const EXTRACTION_PROMPTS: Record<IngestSourceType, string> = {
  paper: `You are extracting structured knowledge from a technical specification or research paper for an industrial agent orchestration knowledge base.
Extract:
1. CLAIMS: 3-5 key claims made by the paper (one sentence each)
2. METHODS: Technical methods/algorithms introduced
3. RELEVANCE: How this relates to Memory DevOps, agent consistency, or enterprise infrastructure
4. CONTRADICTIONS: Any claims that might conflict with established canonical patterns
5. ENTITIES: Named models, datasets, metrics, institutions mentioned
Return as structured markdown with these exact headings.`,

  ros2_log: `You are extracting structured knowledge from an operational log for a Memory DevOps base.
Extract:
1. TOPICS: Active event topics and their message types
2. LATENCIES: Any timing or latency data observed in the orchestration loop
3. ERRORS: Error messages or warnings
4. DECISIONS: Any configuration decisions implied by the log
5. ENTITIES: Node names, agent IDs, virtual hardware components, environments mentioned
Return as structured markdown with these exact headings.`,

  sim_telemetry: `You are extracting structured knowledge from an agent behavior trace for a Future DevOps project.
Extract:
1. METRICS: Numerical performance metrics (validation rate, pattern match, etc.)
2. CONSTRAINT_VIOLATIONS: Any behavioral or security violations observed
3. EDGE_CASES: Unusual scenarios encountered in the build-log
4. RECOVERY_PATH: Notes on auto-recovery or cycle recovery success
5. LESSONS: Key takeaways for the canonical promotion loop
Return as structured markdown with these exact headings.`,

  meeting_note: `You are extracting structured knowledge from a project orchestration meeting note.
Extract:
1. DECISIONS: Mission decisions made during the meeting
2. ACTION_ITEMS: Tasks assigned for agent execution
3. OPEN_QUESTIONS: Unresolved questions for the human-in-the-loop
4. ARCHITECTURE_UPDATES: Any changes to the Future IDE or mission control framing
5. DEADLINES: Any dates or milestones mentioned
Return as structured markdown with these exact headings.`,

  url: `You are extracting structured knowledge from an enterprise article for an industrial agent orchestration knowledge base.
Extract:
1. SUMMARY: 2-3 sentence summary of the article
2. KEY_POINTS: 3-5 key points
3. RELEVANCE: How this relates to Memory DevOps, agent orchestration, or industrial automation
4. ENTITIES: People, organizations, products, patterns mentioned
Return as structured markdown with these exact headings.`,

  generic: `You are extracting structured knowledge from a document for a mission control memory base.
Extract:
1. SUMMARY: What this document is about
2. KEY_POINTS: Most important information
3. ENTITIES: Named things (people, systems, concepts) mentioned
4. DECISIONS: Any decisions or conclusions stated
Return as structured markdown with these exact headings.`,
}

async function extractKnowledge(content: string, type: IngestSourceType, title: string): Promise<string> {
  try {
    // Unbranded LLM Provider implementation
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `${EXTRACTION_PROMPTS[type]}\n\nTitle: ${title}\n\nContent:\n${content.slice(0, 6000)}`
    const result = await model.generateContent(prompt)
    
    return result.response.text() ?? fallbackExtraction(content, title)
  } catch {
    return fallbackExtraction(content, title)
  }
}

function fallbackExtraction(content: string, title: string): string {
  // Keyword-based extraction when LLM unavailable
  const lines = content.split('\n').filter((l) => l.trim())
  const firstPara = lines.slice(0, 3).join(' ')
  return `## SUMMARY\n${firstPara}\n\n## KEY_POINTS\n${lines
    .slice(0, 8)
    .map((l) => `- ${l.slice(0, 120)}`)
    .join('\n')}\n\n## ENTITIES\nExtracted from: ${title}`
}

async function findConflicts(newContent: string, existingNodes: Array<{ id: string; title: string; content: string }>): Promise<string[]> {
  // Simple keyword-based conflict detection
  // Real impl would use embeddings for semantic similarity
  const conflictIds: string[] = []
  const newWords = new Set(newContent.toLowerCase().split(/\W+/).filter((w) => w.length > 5))

  for (const node of existingNodes) {
    const nodeWords = new Set(node.content.toLowerCase().split(/\W+/).filter((w) => w.length > 5))
    const overlap = [...newWords].filter((w) => nodeWords.has(w)).length
    const overlapRatio = overlap / Math.max(newWords.size, 1)

    // High overlap but look for contradiction markers
    if (overlapRatio > 0.4) {
      const contradictionMarkers = ['however', 'contrary', 'unlike', 'but', 'instead', 'disagree', 'contradict']
      const hasContradiction = contradictionMarkers.some((m) => newContent.toLowerCase().includes(m))
      if (hasContradiction) conflictIds.push(node.id)
    }
  }
  return conflictIds
}

export async function POST(req: Request) {
  try {
    const body: IngestRequest = await req.json()
    const { content, title, type = 'generic', url, tags = [] } = body

    if (!content || !title) {
      return NextResponse.json({ error: 'content and title required' }, { status: 400 })
    }

    // 1. Save raw L0 scratch node
    const shortId = Math.random().toString(36).substring(2, 8)
    const rawNode = await prisma.memoryNode.create({
      data: {
        shortId,
        slug: `raw-${type}-${shortId}`,
        title: `[RAW] ${title}`,
        content: content.slice(0, 10000),
        level: 'L0',
        plane: 'memory',
        kind: 'artifact',
        state: 'draft',
        tags: [type, 'raw', 'ingest', ...tags],
        createdBy: 'system',
        ...(url ? { content: `Source: ${url}\n\n${content.slice(0, 10000)}` } : {}),
      },
    })

    // 2. Extract structured knowledge
    const extracted = await extractKnowledge(content, type, title)

    // 3. Check for conflicts with existing L1/L2 nodes
    const existingNodes = await prisma.memoryNode.findMany({
      where: { status: { in: ['wiki', 'canon'] } },
      select: { id: true, title: true, content: true },
      take: 50,
    })
    const conflictIds = await findConflicts(extracted, existingNodes)

    // 4. Create L1 wiki node with extracted knowledge
    const wikiNode = await prisma.memoryNode.create({
      data: {
        title: `[INGEST] ${title}`,
        content: extracted,
        level: 'L1',
        plane: 'memory',
        category: type,
        status: 'wiki',
        parentId: rawNode.id,
        tags: JSON.stringify([type, 'ingest', 'auto-extracted', ...tags]),
        healthScore: conflictIds.length > 0 ? 0.5 : 0.75,
        conflictCount: conflictIds.length,
        referenceCount: 0,
        lastValidated: new Date(),
        expiresAt: type === 'ros2_log' || type === 'sim_telemetry'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30-day TTL for logs
          : null,
      },
    })

    // 5. Update reference counts on nodes whose entities were mentioned
    if (conflictIds.length > 0) {
      await prisma.memoryNode.updateMany({
        where: { id: { in: conflictIds } },
        data: { conflictCount: { increment: 1 } },
      })
    }

    // 6. Log activity
    await prisma.activityLog.create({
      data: {
        action: 'create',
        target: wikiNode.id,
        detail: `Ingested [${type}]: ${title}`,
        metadata: JSON.stringify({
          rawNodeId: rawNode.id,
          wikiNodeId: wikiNode.id,
          conflictIds,
          type,
        }),
      },
    })

    // 7. Publish to Agent Bus
    fetch('http://localhost:3005/emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'memory.ingest.completed',
        payload: { rawNodeId: rawNode.id, wikiNodeId: wikiNode.id, title, type, conflictCount: conflictIds.length },
      }),
    }).catch(() => {})

    return NextResponse.json({
      rawNodeId: rawNode.id,
      wikiNodeId: wikiNode.id,
      extracted,
      conflictIds,
      conflictCount: conflictIds.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ingest failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return recent ingest history
  const recent = await prisma.activityLog.findMany({
    where: { action: 'create', detail: { startsWith: 'Ingested' } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ ingests: recent })
}
