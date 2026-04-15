export type TelemetryFrame = {
  agentId:    string
  modality:   string
  payload:    any
  ts:         number
  priority?:  'p0' | 'p1'
  latencyMs?: number
}

class TelemetryBuffer {
  private queue: TelemetryFrame[] = []
  private readonly MAX_SIZE = 1000

  push(frame: TelemetryFrame) {
    this.queue.push(frame)
    if (this.queue.length > this.MAX_SIZE) {
      // Evict oldest (L0 ephemeral behavior)
      this.queue.shift()
    }
  }

  drain(): TelemetryFrame[] {
    const batch = [...this.queue]
    this.queue = []
    return batch
  }

  get size() {
    return this.queue.length
  }
}

export const telemetryBuffer = new TelemetryBuffer()
