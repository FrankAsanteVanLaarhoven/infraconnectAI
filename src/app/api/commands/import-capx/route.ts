import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ImportCapxCommand, CapxImportedEvent } from '@/lib/memory/events';

export async function POST(req: Request) {
  try {
    const command: ImportCapxCommand = await req.json();

    if (command.command !== 'ImportCapxTrace') {
      return NextResponse.json({ error: 'Unsupported command type' }, { status: 400 });
    }

    // Command Validation Layer:
    // Ensure the file path is scoped and exists (mock logic for now).
    if (!command.payload.filePath.startsWith('/var/capx')) {
      return NextResponse.json({ error: 'Permission denied: Invalid path scope.' }, { status: 403 });
    }

    const eventId = uuidv4();
    const aggregateId = `capx-libero-${Date.now()}`;

    const eventPayload: CapxImportedEvent = {
      eventId,
      eventType: 'capx.episode.imported',
      aggregateType: 'capx_episode',
      aggregateId,
      timestamp: new Date().toISOString(),
      correlationId: `run-${Date.now()}`,
      actor: { type: 'system', id: 'core' },
      schemaVersion: 1,
      payload: {
        success: true,
        policyViolations: 0,
        recoveryCount: 1,
        durationSec: 42.1,
        simToReal: null,
        taskName: 'cube_stack_avoid_singularity',
        abstraction: 'S4'
      }
    };

    // 1. Commit Event (Single Source of Truth)
    await db.event.create({
      data: {
        eventId: eventPayload.eventId,
        eventType: eventPayload.eventType,
        aggregateType: eventPayload.aggregateType,
        aggregateId: eventPayload.aggregateId,
        causationId: eventPayload.causationId,
        correlationId: eventPayload.correlationId,
        actor: JSON.stringify(eventPayload.actor),
        payload: JSON.stringify(eventPayload.payload),
        schemaVersion: eventPayload.schemaVersion
      }
    });

    // NOTE: In the fully decoupled architecture, the Go worker listens to 'events' table
    // and updates the CapxEpisode projection. For synchronous local UX simulation, we update the projection here.
    
    await db.capxEpisode.upsert({
      where: { episodeId: aggregateId },
      update: {
        success: eventPayload.payload.success,
        violations: eventPayload.payload.policyViolations,
        recoveryCount: eventPayload.payload.recoveryCount,
        lastImportedAt: new Date()
      },
      create: {
        episodeId: aggregateId,
        benchmark: 'CaP-X',
        suite: 'LIBERO-PRO',
        taskName: eventPayload.payload.taskName,
        abstraction: eventPayload.payload.abstraction,
        success: eventPayload.payload.success,
        violations: eventPayload.payload.policyViolations,
        recoveryCount: eventPayload.payload.recoveryCount,
        durationSec: eventPayload.payload.durationSec,
      }
    });

    return NextResponse.json({ success: true, eventId });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Command failed' }, { status: 500 });
  }
}
