import { parseURDF, type ParsedURDF } from './parser';

export interface ImportedRobot {
  success: boolean;
  robotName: string;
  simConfig: SimulationConfig;
  parsed: ParsedURDF;
  message: string;
}

export interface SimulationConfig {
  robotName: string;
  urdfPath: string;
  joints: {
    name: string;
    type: string;
    parent: string;
    child: string;
    limit?: { lower: number; upper: number };
  }[];
  totalMass: number;
  jointLimits: Record<string, { lower: number; upper: number }>;
  collisionMeshes: string[];
  dof: number;
  jointChain: string[];
  isaacLabConfig: {
    assetOptions: {
      assetFileName: string;
      fixBaseLink: boolean;
    };
    actuatorModel: string;
    articulationRoot: string;
  };
}

export class URDFImporter {
  /**
   * Import a URDF file and generate Isaac Lab compatible simulation config
   */
  async importURDF(urdfContent: string, robotName: string): Promise<ImportedRobot> {
    const parsed = await parseURDF(urdfContent);

    // Generate Isaac Lab compatible configuration
    const simConfig: SimulationConfig = {
      robotName,
      urdfPath: `/robots/${robotName.toLowerCase().replace(/\s+/g, '_')}.urdf`,
      joints: parsed.joints.map((j) => ({
        name: j.name,
        type: j.type,
        parent: j.parent,
        child: j.child,
        limit: parsed.jointLimits[j.name],
      })),
      totalMass: parsed.totalMass,
      jointLimits: parsed.jointLimits,
      collisionMeshes: parsed.collisionMeshes,
      dof: parsed.revoluteJoints.length,
      jointChain: parsed.jointChain,
      isaacLabConfig: {
        assetOptions: {
          assetFileName: `/robots/${robotName.toLowerCase().replace(/\s+/g, '_')}.urdf`,
          fixBaseLink: true,
        },
        actuatorModel: 'implicit_mimic',
        articulationRoot: parsed.jointChain[0]
          ? parsed.links.find((l) => l.name === parsed.joints[0]?.parent)?.name || 'base_link'
          : 'base_link',
      },
    };

    // Fix self-reference
    simConfig.isaacLabConfig.assetOptions.assetFileName = simConfig.urdfPath;

    return {
      success: true,
      robotName,
      simConfig,
      parsed,
      message: `Robot "${robotName}" imported successfully — ${parsed.joints.length} joints (${parsed.revoluteJoints.length} DOF), ${parsed.links.length} links, ${parsed.totalMass} kg total mass`,
    };
  }

  /**
   * Validate a URDF string before full import
   */
  async validateURDF(urdfContent: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
      estimatedJoints: number;
      estimatedLinks: number;
      hasMeshes: boolean;
    };
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!urdfContent || urdfContent.trim().length === 0) {
      errors.push('Empty URDF content');
      return {
        valid: false,
        errors,
        warnings,
        stats: { estimatedJoints: 0, estimatedLinks: 0, hasMeshes: false },
      };
    }

    if (!urdfContent.includes('<robot')) {
      errors.push('No <robot> root element found');
      return {
        valid: false,
        errors,
        warnings,
        stats: { estimatedJoints: 0, estimatedLinks: 0, hasMeshes: false },
      };
    }

    const jointCount = (urdfContent.match(/<joint\s/g) || []).length;
    const linkCount = (urdfContent.match(/<link\s/g) || []).length;
    const hasMeshes = urdfContent.includes('.obj') || urdfContent.includes('.stl');

    if (jointCount === 0) {
      warnings.push('No joints found — robot may be static');
    }

    if (linkCount === 0) {
      errors.push('No links found — invalid URDF structure');
    }

    if (hasMeshes) {
      warnings.push('URDF references mesh files — ensure they are available in the simulation environment');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: { estimatedJoints: jointCount, estimatedLinks: linkCount, hasMeshes },
    };
  }
}

export const urdfImporter = new URDFImporter();
