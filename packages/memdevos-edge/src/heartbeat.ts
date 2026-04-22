class HeartbeatManager {
  private timer: NodeJS.Timeout | null = null

  start(agentId: string, intervalMs: number, onTick: (health: any) => void) {
    if (this.timer) clearInterval(this.timer)

    this.timer = setInterval(() => {
      const health = {
        cpuLoad:   Math.random() * 20, // Mock
        memoryUsage: 45,               // Mock
        uptimeSec: process.uptime(),
        version:   'CORE-0.2.0'
      }
      onTick(health)
    }, intervalMs)

    console.log(`[Heartbeat] Started at ${intervalMs}ms interval`)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }
}

export const heartbeat = new HeartbeatManager()
