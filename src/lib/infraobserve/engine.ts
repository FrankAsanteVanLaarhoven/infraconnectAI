type MetricCallback = (data: any) => void;

/**
 * InfraObserve Engine — Live observability & metrics system
 * Fully standalone — uses in-process event bus instead of external Redis
 */
export class InfraObserveEngine {
  private static instance: InfraObserveEngine;
  private listeners: Map<string, Set<MetricCallback>> = new Map();
  private metricsHistory: Map<string, any[]> = new Map();

  static getInstance(): InfraObserveEngine {
    if (!InfraObserveEngine.instance) {
      InfraObserveEngine.instance = new InfraObserveEngine();
    }
    return InfraObserveEngine.instance;
  }

  /**
   * Publish live metrics for a run
   */
  async publishLiveMetrics(runId: string, metrics: Record<string, number>) {
    const payload = {
      runId,
      timestamp: Date.now(),
      ...metrics,
    };

    // Store in history (keep last 1000 per run)
    const history = this.metricsHistory.get(runId) ?? [];
    history.push(payload);
    if (history.length > 1000) history.shift();
    this.metricsHistory.set(runId, history);

    // Notify subscribers
    this.emit('metrics', payload);
    this.emit(`metrics:${runId}`, payload);

    return payload;
  }

  /**
   * Publish an episode update event
   */
  async publishEpisodeUpdate(runId: string, episode: any) {
    const payload = {
      runId,
      timestamp: Date.now(),
      ...episode,
    };

    this.emit('episode', payload);
    this.emit(`episode:${runId}`, payload);

    return payload;
  }

  /**
   * Publish a curation decision event
   */
  async publishCurationEvent(runId: string, decision: any) {
    const payload = {
      runId,
      timestamp: Date.now(),
      ...decision,
    };

    this.emit('curation', payload);
    this.emit(`curation:${runId}`, payload);

    return payload;
  }

  /**
   * Get metrics history for a run
   */
  getMetricsHistory(runId: string, limit = 100) {
    const history = this.metricsHistory.get(runId) ?? [];
    return history.slice(-limit);
  }

  /**
   * Get aggregated run stats
   */
  getRunStats(runId: string) {
    const history = this.metricsHistory.get(runId) ?? [];
    if (history.length === 0) return null;

    const latest = history[history.length - 1];
    const avgOf = (key: string) =>
      history.reduce((sum: number, h: any) => sum + (h[key] ?? 0), 0) / history.length;

    return {
      latest,
      avgTotalEpisodes: avgOf('totalEpisodes'),
      avgPrunedCount: avgOf('prunedCount'),
      avgConfidence: avgOf('avgConfidence'),
      dataPoints: history.length,
    };
  }

  // Simple event bus
  on(event: string, callback: MetricCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }
}

export const infraObserveEngine = InfraObserveEngine.getInstance();
