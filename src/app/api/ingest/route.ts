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
  paper: `You are extracting structured knowledge from a research paper for a VLA robotics knowledge base.
Extract:
1. CLAIMS: 3-5 key claims made by the paper (one sentence each)
2. METHODS: Technical methods/algorithms introduced
3. RELEVANCE: How this relates to safe VLA models, constrained learning, or hospital robotics
4. CONTRADICTIONS: Any claims that might conflict with standard practice
5. ENTITIES: Named models, datasets, metrics, institutions mentioned
Return as structured markdown with these exact headings.`,

  ros2_log: `You are extracting structured knowledge from a ROS2 log for a robotics memory base.
Extract:
1. TOPICS: Active ROS2 topics and their message types
2. LATENCIES: Any timing or latency data observed
3. ERRORS: Error messages or warnings
4. DECISIONS: Any configuration decisions implied by the log
5. ENTITIES: Node names, hardware components, environments mentioned
Return as structured markdown with these exact headings.`,

  sim_telemetry: `You are extracting structured knowledge from a simulation run log for a SafeVLA project.
Extract:
1. METRICS: Numerical performance metrics (success rate, deadline compliance, etc.)
2. CONSTRAINT_VIOLATIONS: Any safety constraint violations observed
3. EDGE_CASES: Unusual scenarios encountered
4. SIM_REAL_DELTA: Any notes on sim-to-real transferability
5. LESSONS: Key takeaways for the real robot deployment
Return as structured markdown with these exact headings.`,

  meeting_note: `You are extracting structured knowledge from a supervision meeting note.
Extract:
1. DECISIONS: Decisions made during the meeting
2. ACTION_ITEMS: Tasks assigned (with owner if mentioned)
3. OPEN_QUESTIONS: Unresolved questions raised
4. THESIS_UPDATES: Any changes to research direction or thesis framing
5. DEADLINES: Any dates or deadlines mentioned
Return as structured markdown with these exact headings.`,

  url: `You are extracting structured knowledge from a web article for a robotics knowledge base.
Extract:
1. SUMMARY: 2-3 sentence summary of the article
2. KEY_POINTS: 3-5 key points
3. RELEVANCE: How this relates to VLA models, safe robotics, or hospital automation
4. ENTITIES: People, organisations, products, papers mentioned
Return as structured markdown with these exact headings.`,

  generic: `You are extracting structured knowledge from a document for a robotics memory base.
Extract:
1. SUMMARY: What this document is about
2. KEY_POINTS: Most important information
3. ENTITIES: Named things (people, systems, concepts) mentioned
4. DECISIONS: Any decisions or conclusions stated
Return as structured markdown with these exact headings.`,
}

async function extractKnowledge(content: string, type: IngestSourceType, title: string): Promise<string> {
  try {
    const { default: zai } = await import('z-ai-web-dev-sdk')
    const completion = await zai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPTS[type] },
        {
          role: 'user',
          content: `Title: ${title}\n\nContent:\n${content.slice(0, 6000)}`,
        },
      ],
      max_tokens: 1200,
      temperature: 0.1,
    })
    return completion.choices[0]?.message?.content ?? fallbackExtraction(content, title)
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
    const rawNode = await prisma.memoryNode.create({
      data: {
        title: `[RAW] ${title}`,
        content: content.slice(0, 10000),
        level: 'L0',
        plane: 'memory',
        category: `raw-${type}`,
        status: 'scratch',
        tags: JSON.stringify([type, 'raw', 'ingest', ...tags]),
        healthScore: 0.5,
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
