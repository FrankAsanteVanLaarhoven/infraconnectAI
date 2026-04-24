/**
 * Physics Scorer
 * 
 * Computes physics realism, sensor fidelity, and language grounding scores
 * for Isaac Lab simulation episodes. Uses deterministic heuristics —
 * no LLM dependency. Designed for real-time evaluation during training.
 * 
 * In production, these scores come from Isaac Sim ground truth comparisons.
 * This module provides the scoring interface and composite calculation.
 */

export interface EpisodeRawMetrics {
  // Physics signals
  collisionCount: number;
  penetrationDepth: number;     // max object penetration in meters
  frictionVariance: number;     // variance from expected friction coefficients
  jointTorqueError: number;     // mean absolute error vs reference
  gravityConsistency: number;   // 0-1 (1 = perfect Newtonian)

  // Sensor signals
  depthMSE: number;             // depth sensor mean squared error vs ground truth
  lidarDropRate: number;        // percentage of dropped LiDAR points
  cameraBlurScore: number;      // 0-1 (1 = sharp)
  imuDrift: number;             // degrees/minute of IMU drift

  // VLA signals
  instructionFollowed: boolean;
  graspSuccess: boolean;
  navigationAccuracy: number;   // meters from target
  taskCompletionRatio: number;  // 0-1
}

export interface ScoredEpisode {
  physicsRealism: number;       // 0-1
  sensorFidelity: number;       // 0-1
  languageGrounding: number;    // 0-1
  actionSuccess: number;        // 0-1
  overallQuality: number;       // weighted composite 0-1
}

const PHYSICS_WEIGHTS = {
  collision: 0.15,
  penetration: 0.20,
  friction: 0.20,
  torque: 0.25,
  gravity: 0.20,
} as const;

const SENSOR_WEIGHTS = {
  depth: 0.30,
  lidar: 0.25,
  camera: 0.25,
  imu: 0.20,
} as const;

const COMPOSITE_WEIGHTS = {
  physicsRealism: 0.30,
  sensorFidelity: 0.25,
  languageGrounding: 0.20,
  actionSuccess: 0.15,
  lossInverse: 0.10,
} as const;

export class PhysicsScorer {

  /**
   * Score physics realism from raw simulation metrics.
   */
  scorePhysicsRealism(metrics: Partial<EpisodeRawMetrics>): number {
    const collision = this.clamp(1 - (metrics.collisionCount ?? 0) / 50);
    const penetration = this.clamp(1 - (metrics.penetrationDepth ?? 0) / 0.05);
    const friction = this.clamp(1 - (metrics.frictionVariance ?? 0) / 0.3);
    const torque = this.clamp(1 - (metrics.jointTorqueError ?? 0) / 10);
    const gravity = metrics.gravityConsistency ?? 0.95;

    return (
      collision * PHYSICS_WEIGHTS.collision +
      penetration * PHYSICS_WEIGHTS.penetration +
      friction * PHYSICS_WEIGHTS.friction +
      torque * PHYSICS_WEIGHTS.torque +
      gravity * PHYSICS_WEIGHTS.gravity
    );
  }

  /**
   * Score sensor fidelity from raw sensor accuracy metrics.
   */
  scoreSensorFidelity(metrics: Partial<EpisodeRawMetrics>): number {
    const depth = this.clamp(1 - (metrics.depthMSE ?? 0) / 0.01);
    const lidar = this.clamp(1 - (metrics.lidarDropRate ?? 0));
    const camera = metrics.cameraBlurScore ?? 0.9;
    const imu = this.clamp(1 - (metrics.imuDrift ?? 0) / 5);

    return (
      depth * SENSOR_WEIGHTS.depth +
      lidar * SENSOR_WEIGHTS.lidar +
      camera * SENSOR_WEIGHTS.camera +
      imu * SENSOR_WEIGHTS.imu
    );
  }

  /**
   * Score VLA language grounding and task alignment.
   */
  scoreLanguageGrounding(metrics: Partial<EpisodeRawMetrics>): number {
    const followed = metrics.instructionFollowed ? 1.0 : 0.0;
    const grasp = metrics.graspSuccess ? 1.0 : 0.0;
    const navAcc = this.clamp(1 - (metrics.navigationAccuracy ?? 0) / 2.0);
    const completion = metrics.taskCompletionRatio ?? 0;

    return followed * 0.30 + grasp * 0.25 + navAcc * 0.20 + completion * 0.25;
  }

  /**
   * Score action success rate.
   */
  scoreActionSuccess(metrics: Partial<EpisodeRawMetrics>): number {
    const grasp = metrics.graspSuccess ? 1.0 : 0.0;
    const navAcc = this.clamp(1 - (metrics.navigationAccuracy ?? 0) / 2.0);
    const completion = metrics.taskCompletionRatio ?? 0;

    return grasp * 0.35 + navAcc * 0.30 + completion * 0.35;
  }

  /**
   * Calculate weighted composite quality score from individual signals.
   */
  calculateComposite(
    physicsRealism: number,
    sensorFidelity: number,
    languageGrounding: number,
    actionSuccess: number,
    modelLoss: number = 1.0
  ): number {
    const lossInverse = this.clamp(1 - Math.min(modelLoss / 3.0, 1));

    return (
      physicsRealism * COMPOSITE_WEIGHTS.physicsRealism +
      sensorFidelity * COMPOSITE_WEIGHTS.sensorFidelity +
      languageGrounding * COMPOSITE_WEIGHTS.languageGrounding +
      actionSuccess * COMPOSITE_WEIGHTS.actionSuccess +
      lossInverse * COMPOSITE_WEIGHTS.lossInverse
    );
  }

  /**
   * Full scoring pipeline from raw metrics.
   */
  scoreEpisode(metrics: Partial<EpisodeRawMetrics>, modelLoss: number = 1.0): ScoredEpisode {
    const physicsRealism = this.scorePhysicsRealism(metrics);
    const sensorFidelity = this.scoreSensorFidelity(metrics);
    const languageGrounding = this.scoreLanguageGrounding(metrics);
    const actionSuccess = this.scoreActionSuccess(metrics);
    const overallQuality = this.calculateComposite(
      physicsRealism, sensorFidelity, languageGrounding, actionSuccess, modelLoss
    );

    return { physicsRealism, sensorFidelity, languageGrounding, actionSuccess, overallQuality };
  }

  private clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, value));
  }
}

export const physicsScorer = new PhysicsScorer();
