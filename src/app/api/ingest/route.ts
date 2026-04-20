import { NextResponse } from 'next/server';
import { kafkaClient } from '@/lib/kafka/client';

export const runtime = 'nodejs'; // Required for kafkajs TCP connections

/**
 * Universal Inbound Gateway -> Kafka
 * Handles Robot Edge Telemetry & Inter-Service communications.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic = 'telemetry.raw', eventType = 'UNKNOWN', payload } = body;

    if (!payload) {
      return NextResponse.json({ error: 'Payload missing' }, { status: 400 });
    }

    // Fire & Forget into the Kafka Backbone
    await kafkaClient.produceEvent(topic, eventType, payload);

    return NextResponse.json({ 
      success: true, 
      status: `Ingested ${eventType} to topic ${topic}` 
    }, { status: 202 });

  } catch (error) {
    console.error('[API_INGEST] Kafka Error:', error);
    return NextResponse.json({ error: 'Internal Ingestion Engine Failure' }, { status: 500 });
  }
}
