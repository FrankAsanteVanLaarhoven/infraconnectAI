/**
 * Sovereign Model Registry
 * 
 * Manages versioned, cryptographically signed model payloads for edge execution.
 * Enforces rollback capabilities when nodes degrade.
 */

export interface RegisteredModel {
  id: string; // e.g. sim2real-v4.2.0
  signature: string; // SHA-256 for secure enclave validation
  sizeMb: number;
  approvedForRoles: string[]; // e.g. ['INSPECTION_DRONE', 'FLEET_ROBOT']
  isDeprecated: boolean;
}

export class ModelRegistry {
  private static instance: ModelRegistry;
  private catalog: Map<string, RegisteredModel> = new Map();

  static getInstance() {
    if (!ModelRegistry.instance) ModelRegistry.instance = new ModelRegistry();
    return ModelRegistry.instance;
  }

  constructor() {
    // Bootstrap initial registry state
    this.registerModel({
      id: 'sim2real-v4.2.0',
      signature: 'sha256:d9b23b1af3...f3',
      sizeMb: 850,
      approvedForRoles: ['INSPECTION_DRONE', 'FLEET_ROBOT'],
      isDeprecated: false
    });

    this.registerModel({
      id: 'sim2real-v4.1.0', // Safe rollback version
      signature: 'sha256:a1b2c3d4e5...f6',
      sizeMb: 840,
      approvedForRoles: ['INSPECTION_DRONE', 'FLEET_ROBOT'],
      isDeprecated: true // Only to be used in explicit hardware rollbacks
    });
  }

  registerModel(model: RegisteredModel) {
    this.catalog.set(model.id, model);
  }

  fetchLatestApprovedModel(role: string): RegisteredModel | null {
    const valid = Array.from(this.catalog.values()).filter(m => !m.isDeprecated && m.approvedForRoles.includes(role));
    return valid.length > 0 ? valid[0] : null;
  }

  getRollbackModel(role: string): RegisteredModel | null {
    // In an anomaly, fetch the last known stable version even if deprecated
    const stable = Array.from(this.catalog.values()).filter(m => m.approvedForRoles.includes(role));
    return stable.length > 1 ? stable[1] : null;
  }

  validateSignature(modelId: string, providedHash: string): boolean {
    const model = this.catalog.get(modelId);
    if (!model) return false;
    return model.signature === providedHash;
  }
}

export const registry = ModelRegistry.getInstance();
