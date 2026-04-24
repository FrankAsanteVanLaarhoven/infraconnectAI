import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/db';

const execAsync = promisify(exec);

/**
 * Isaac Lab Docker Launcher
 * 
 * Production-grade launcher that spins up Isaac Lab containers
 * via Docker exec or K8s Job for GPU-accelerated physics simulation.
 * 
 * Container image: nvcr.io/nvidia/isaac-lab:latest
 * Requires: NVIDIA GPU + Docker with --gpus all support
 */

export class IsaacLabLauncher {
  
  /**
   * Launch an Isaac Lab training run via Docker.
   */
  async launchRun(params: {
    sceneUsd: string;
    numEnvs: number;
    domainRandomization: Record<string, any>;
    experimentId: string;
  }) {
    const run = await db.isaacLabRun.create({
      data: {
        experimentId: params.experimentId,
        sceneUsd: params.sceneUsd,
        numEnvs: params.numEnvs,
        domainRandomization: params.domainRandomization,
        status: 'QUEUED',
      },
    });

    try {
      // Build Docker command with GPU support
      const containerName = `isaac-run-${run.id.slice(-8)}`;
      const cmd = [
        'docker run --gpus all -d',
        `--name ${containerName}`,
        '-v $(pwd)/isaac_assets:/isaac_assets',
        `-e NUM_ENVS=${params.numEnvs}`,
        `-e SCENE_USD=${params.sceneUsd}`,
        `-e RUN_ID=${run.id}`,
        `-e REDIS_URL=${process.env.REDIS_URL || 'redis://host.docker.internal:6379'}`,
        `-e TENANT_ID=${process.env.TENANT_ID || 'SYSTEM_ROOT'}`,
        'nvcr.io/nvidia/isaac-lab:latest',
        `python scripts/train.py --headless --num_envs ${params.numEnvs}`,
      ].join(' \\\n  ');

      console.log(`[ISAAC_LAUNCHER] Launching container: ${containerName}`);
      
      const { stdout } = await execAsync(cmd);
      const containerId = stdout.trim();

      await db.isaacLabRun.update({
        where: { id: run.id },
        data: { status: 'RUNNING', startedAt: new Date() },
      });

      console.log(`[ISAAC_LAUNCHER] Container ${containerId.slice(0, 12)} started for run ${run.id}`);
      return run.id;
    } catch (error: any) {
      console.error(`[ISAAC_LAUNCHER] Failed to launch Docker container:`, error.message);
      
      await db.isaacLabRun.update({
        where: { id: run.id },
        data: { status: 'FAILED_PHYSICS' },
      });

      throw new Error(`Isaac Lab launch failed: ${error.message}`);
    }
  }

  /**
   * Stop a running Isaac Lab container.
   */
  async stopRun(runId: string) {
    const containerName = `isaac-run-${runId.slice(-8)}`;
    try {
      await execAsync(`docker stop ${containerName}`);
      await execAsync(`docker rm ${containerName}`);
      console.log(`[ISAAC_LAUNCHER] Container ${containerName} stopped and removed`);
    } catch (e: any) {
      console.warn(`[ISAAC_LAUNCHER] Could not stop container ${containerName}:`, e.message);
    }
  }

  /**
   * Check container health status.
   */
  async getContainerStatus(runId: string): Promise<'running' | 'exited' | 'not_found'> {
    const containerName = `isaac-run-${runId.slice(-8)}`;
    try {
      const { stdout } = await execAsync(`docker inspect --format='{{.State.Status}}' ${containerName}`);
      return stdout.trim() as 'running' | 'exited';
    } catch {
      return 'not_found';
    }
  }
}

export const isaacLabLauncher = new IsaacLabLauncher();
