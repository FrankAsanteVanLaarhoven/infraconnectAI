import { z } from "zod";

// -------------------------------------------------------------
// UNIFIED DATA MODEL: EDGE LAYER SCHEMAS
// -------------------------------------------------------------

export const SpatialDataSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  pitch: z.number(),
  yaw: z.number(),
  roll: z.number(),
  mapId: z.string().optional()
});

export const PerceptionConfidenceSchema = z.object({
  objectDetection: z.number().min(0).max(1),
  lidarIntegrity: z.number().min(0).max(1),
  cameraOcclusion: z.boolean(),
  activeModels: z.array(z.string())
});

export const RobotTelemetrySchema = z.object({
  robotId: z.string(),
  timestamp: z.number(),
  status: z.enum(["ONLINE", "OFFLINE", "DEGRADED", "EMERGENCY_STOP", "MAINTENANCE"]),
  batteryLevel: z.number().min(0).max(100),
  spatialInfo: SpatialDataSchema,
  perception: PerceptionConfidenceSchema,
  edgeComputeLoad: z.number().min(0).max(1), // GPU utilization %
  networkLatency: z.number() // Ping in ms
});

export type RobotTelemetry = z.infer<typeof RobotTelemetrySchema>;

// -------------------------------------------------------------
// KAFKA MOCK INGRESS (BUFFER PROTOCOLS)
// -------------------------------------------------------------

export const TelemetryBatchSchema = z.object({
  batchId: z.string(),
  receivedAt: z.number(),
  payloads: z.array(RobotTelemetrySchema)
});

export type TelemetryBatch = z.infer<typeof TelemetryBatchSchema>;

/**
 * Mock representation of a streaming Data Fabric ingestion port.
 * In a production CORE environment, this would strictly pipe into a Pulsar/Kafka stream.
 */
export class EdgeTelemetryBuffer {
  private buffer: RobotTelemetry[] = [];
  private batchSize: number = 50;

  constructor(batchSize?: number) {
    if (batchSize) this.batchSize = batchSize;
  }

  public ingest(payload: any): void {
    const parsed = RobotTelemetrySchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("[EdgeTelemetryBuffer] Ingestion rejected via schema validation:", parsed.error);
      return;
    }
    
    this.buffer.push(parsed.data);

    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }

  private flush(): void {
    const batch: TelemetryBatch = {
      batchId: crypto.randomUUID(),
      receivedAt: Date.now(),
      payloads: [...this.buffer]
    };
    
    // In production, this emits to a message queue or Flink processor
    // For this simulation, we'll route to the global event bus
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kafka-stream:batch-flush', { detail: batch }));
    }

    this.buffer = [];
  }
}
