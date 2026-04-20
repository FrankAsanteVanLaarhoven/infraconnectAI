import Redis from 'ioredis';
import { SystemStreamMap } from '../../domain/events';

/**
 * Singleton Redis connection manager built strictly for the Control Plane.
 * Utilizing Redis Streams (XADD) as a lean Kafka Alternative.
 */
class StreamProducer {
  private static instance: StreamProducer;
  private client: Redis;
  private tenantId: string;

  private constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.tenantId = process.env.TENANT_ID || "SYSTEM_ROOT";
    
    // Safety check connection wrapper
    this.client.on('error', (err) => {
        console.error('[REDIS_INFRA] Connection stream interrupted.', err);
    });
  }

  public static getInstance(): StreamProducer {
    if (!StreamProducer.instance) {
      StreamProducer.instance = new StreamProducer();
    }
    return StreamProducer.instance;
  }

  /**
   * Universal Publish Event Method utilizing Redis Streams
   * Translates strongly typed Domain Maps into raw `XADD` payloads.
   */
  public async publish<K extends keyof SystemStreamMap>(
    stream: K, 
    payload: SystemStreamMap[K]
  ) {
    try {
      // Core streaming mechanism bypassing flat JSON keys for true Kafka-esque behavior
      const isolatedStream = `${this.tenantId}.${stream}`;
      await this.client.xadd(
        isolatedStream, 
        "*", // Let Redis assign ID
        "data", 
        JSON.stringify(payload)
      );
    } catch (e) {
      console.error(`[STREAM_PRODUCER] Failed to emit to root ${stream}`, e);
    }
  }
}

// Preserve globally in Next.js development runs to prevent port exhaustion
declare global {
  var _streamProducer: StreamProducer | undefined;
}

export const streamProducer = global._streamProducer || StreamProducer.getInstance();

if (process.env.NODE_ENV !== 'production') {
  global._streamProducer = streamProducer;
}
