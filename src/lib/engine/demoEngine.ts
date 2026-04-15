export type DemoStep = {
  id: string;
  duration: number; // Duration of the action itself
  action: () => Promise<void> | void;
  pauseAfter?: number; // Cinematic pause before next step
};

export class DemoEngine {
  private steps: DemoStep[] = [];
  private isRunning = false;
  private abortController: AbortController | null = null;
  public SNAPSHOT_MODE = false;

  constructor(options?: { snapshotMode?: boolean }) {
    if (options?.snapshotMode) {
      this.SNAPSHOT_MODE = true;
    }
  }

  add(step: DemoStep) {
    this.steps.push(step);
  }

  async start() {
    this.isRunning = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      for (const step of this.steps) {
        if (signal.aborted) break;

        // In snapshot mode, we execute actions but skip delays to immediately reach final state.
        await step.action();

        if (!this.SNAPSHOT_MODE) {
          await this.wait(step.duration, signal);
          if (step.pauseAfter) {
            await this.wait(step.pauseAfter, signal);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Demo timeline interrupted:", err);
      }
    } finally {
      this.isRunning = false;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }
}
