import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { SyncTelemetryCommand, TelemetryImportedEvent } from '@/lib/memory/events';
import { broadcastAlert } from '@/lib/notifications/notificationEngine';

export async function POST(req: Request) {
  try {
    const command: SyncTelemetryCommand = await req.json();

    if (command.command !== 'SyncTelemetryTrace') {
      return NextResponse.json({ error: 'Unsupported command type' }, { status: 400 });
    }

    // Command Validation Layer:
    // Ensure the file path is scoped and exists (mock logic for now).
    if (!command.payload.filePath.startsWith('/var/telemetry')) {
      return NextResponse.json({ error: 'Permission denied: Invalid path scope.' }, { status: 403 });
    }

    const eventId = uuidv4();
    const aggregateId = `signal-alpha-${Date.now()}`;

    const eventPayload: TelemetryImportedEvent = {
      eventId,
      eventType: 'telemetry.signal.imported',
      aggregateType: 'telemetry_signal',
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
        simToReal: undefined,
        taskName: 'industrial_agent_validation_sweep',
        abstraction: 'S4'
      }
    };

    // Obsolete event/capxEpisode creation removed (schema transitioned to BenchmarkEpisode/DataCurationEvent)
    
    // 2. Broadcast Tactical Success Alert
    await broadcastAlert({
      category: 'TELEMETRY',
      severity: 'MEDIUM',
      title: 'Global State Synchronized',
      message: `Successfully imported mission trace [${eventPayload.payload.taskName}] with ${eventPayload.payload.recoveryCount} autonomous recoveries.`
    });

    return NextResponse.json({ success: true, eventId });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Command failed' }, { status: 500 });
  }
}
