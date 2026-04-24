import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { agentRegistry } from '@/lib/agent-ops/AgentRegistry'
import { TelemetryAggregator } from '@/lib/telemetry/Aggregator'
import { serverHub } from '@/lib/agent-ops/ServerHub'
import { ManifestBuilder } from '@/lib/skills/ManifestBuilder'

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const agentKey = req.headers.get('x-agent-key')

  // Validate agent key
  if (!agentKey) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { socket, response } = (req as any).socket.server.upgrade(req)

  // Register with shared registry
  agentRegistry.registerAgent(agentId, socket)

  // --- CORE Capability Sync ---
  const manifest = ManifestBuilder.buildEdgeManifest()
  socket.send(JSON.stringify({ type: 'skill_sync', data: { manifest } }))

  socket.addEventListener('message', async (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data)

      switch (msg.type) {
        case 'heartbeat':
          await prisma.agentRegistration.update({
            where: { id: agentId },
            data: { lastHeartbeat: new Date(), status: 'live' },
          }).catch(() => {})
          serverHub.broadcast('heartbeat', { agentId, ...msg.data })
          break

        case 'telemetry':
          await prisma.agentTelemetry.create({
            data: {
              agentId,
              tick:      BigInt(msg.data.tick ?? 0),
              modality:  msg.data.modality,
              payload:   msg.data.payload,
              latencyMs: msg.data.latencyMs,
              deployTier: msg.data.deployTier ?? 'edge',
            },
          }).catch(() => {})
          await TelemetryAggregator.ingest(agentId, 'telemetry', msg.data)
          broadcastToDashboard(agentId, msg)
          break

        case 'incident':
          await prisma.agentIncident.create({
            data: {
              agentId,
              severity:    'p0',
              category:    'constraint_violation',
              description: JSON.stringify(msg.data),
            },
          }).catch(() => {})
          await TelemetryAggregator.ingest(agentId, 'incident', msg.data)
          broadcastToDashboard(agentId, { ...msg, priority: 'critical' })
          break

        case 'skill_report':
          agentRegistry.emit(`skill_report:${msg.data.runId}`, msg.data)
          serverHub.broadcast('skill_report', { agentId, ...msg.data })
          break
          
        case 'buffered':
          await prisma.agentTelemetry.create({
            data: {
              agentId,
              tick:       BigInt(msg.data.tick ?? 0),
              modality:   msg.data.modality,
              payload:    msg.data.payload,
              deployTier: 'edge',
            },
          }).catch(() => {})
          await TelemetryAggregator.ingest(agentId, 'buffered', msg.data)
          break
      }
    } catch (e) {
      console.error('[AGENT_WS_MSG_ERR]', e)
    }
  })

  socket.addEventListener('close', async () => {
    agentRegistry.unregisterAgent(agentId)
    await prisma.agentRegistration.update({
      where: { id: agentId },
      data: { status: 'offline' },
    }).catch(() => {})
    serverHub.broadcast('heartbeat', { agentId, status: 'offline' })
  })

  return response
}

function broadcastToDashboard(agentId: string, msg: any) {
  serverHub.broadcast(msg.type || 'message', { agentId, ...msg.data })
}
