import { XMLParser } from 'fast-xml-parser';

export interface URDFJoint {
  name: string;
  type: string;
  parent: string;
  child: string;
  origin?: {
    xyz?: string;
    rpy?: string;
  };
  limit?: {
    lower: number;
    upper: number;
    effort: number;
    velocity: number;
  };
  axis?: string;
}

export interface URDFLink {
  name: string;
  mass: number;
  inertia?: {
    ixx: number;
    ixy: number;
    ixz: number;
    iyy: number;
    iyz: number;
    izz: number;
  };
  visual?: {
    geometry?: {
      type: string;
      size?: string;
      filename?: string;
      radius?: string;
      length?: string;
    };
    material?: {
      color?: string;
    };
  };
  collision?: {
    geometry?: {
      type: string;
      size?: string;
      filename?: string;
      radius?: string;
      length?: string;
    };
  };
}

export interface ParsedURDF {
  robotName: string;
  joints: URDFJoint[];
  links: URDFLink[];
  totalMass: number;
  jointLimits: Record<string, { lower: number; upper: number }>;
  collisionMeshes: string[];
  revoluteJoints: URDFJoint[];
  fixedJoints: URDFJoint[];
  jointChain: string[];
}

/**
 * Parse a URDF XML string into a structured representation
 */
export async function parseURDF(urdfContent: string): Promise<ParsedURDF> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) => tagName === 'joint' || tagName === 'link',
  });

  const result = parser.parse(urdfContent);
  const robot = result.robot;

  if (!robot) {
    throw new Error('Invalid URDF: no <robot> root element found');
  }

  const robotName = robot['@_name'] || 'unnamed_robot';

  // Parse joints
  const rawJoints = Array.isArray(robot.joint) ? robot.joint : robot.joint ? [robot.joint] : [];
  const joints: URDFJoint[] = rawJoints
    .filter((j: any) => j['@_type'] !== undefined)
    .map((j: any) => ({
      name: j['@_name'] || '',
      type: j['@_type'] || 'fixed',
      parent: j.parent?.['@_link'] || '',
      child: j.child?.['@_link'] || '',
      origin: j.origin
        ? {
            xyz: j.origin['@_xyz'],
            rpy: j.origin['@_rpy'],
          }
        : undefined,
      limit: j.limit
        ? {
            lower: parseFloat(j.limit['@_lower'] || '-3.14'),
            upper: parseFloat(j.limit['@_upper'] || '3.14'),
            effort: parseFloat(j.limit['@_effort'] || '100'),
            velocity: parseFloat(j.limit['@_velocity'] || '1.0'),
          }
        : undefined,
      axis: j.axis?.['@_xyz'],
    }));

  // Parse links
  const rawLinks = Array.isArray(robot.link) ? robot.link : robot.link ? [robot.link] : [];
  const links: URDFLink[] = rawLinks.map((l: any) => {
    const mass = parseFloat(l.inertial?.mass?.['@_value'] || '0');
    const inertia = l.inertial?.inertia
      ? {
          ixx: parseFloat(l.inertial.inertia['@_ixx'] || '0'),
          ixy: parseFloat(l.inertial.inertia['@_ixy'] || '0'),
          ixz: parseFloat(l.inertial.inertia['@_ixz'] || '0'),
          iyy: parseFloat(l.inertial.inertia['@_iyy'] || '0'),
          iyz: parseFloat(l.inertial.inertia['@_iyz'] || '0'),
          izz: parseFloat(l.inertial.inertia['@_izz'] || '0'),
        }
      : undefined;

    const visual = l.visual
      ? {
          geometry: l.visual.geometry
            ? {
                type: l.visual.geometry.mesh
                  ? 'mesh'
                  : l.visual.geometry.cylinder
                    ? 'cylinder'
                    : l.visual.geometry.sphere
                      ? 'sphere'
                      : l.visual.geometry.box
                        ? 'box'
                        : 'unknown',
                filename: l.visual.geometry.mesh?.['@_filename'],
                size: l.visual.geometry.box?.['@_size'],
                radius: l.visual.geometry.cylinder?.['@_radius'] || l.visual.geometry.sphere?.['@_radius'],
                length: l.visual.geometry.cylinder?.['@_length'],
              }
            : undefined,
          material: l.visual.material
            ? { color: l.visual.material.color?.['@_rgba'] }
            : undefined,
        }
      : undefined;

    const collision = l.collision
      ? {
          geometry: l.collision.geometry
            ? {
                type: l.collision.geometry.mesh
                  ? 'mesh'
                  : l.collision.geometry.cylinder
                    ? 'cylinder'
                    : l.collision.geometry.sphere
                      ? 'sphere'
                      : l.collision.geometry.box
                        ? 'box'
                        : 'unknown',
                filename: l.collision.geometry.mesh?.['@_filename'],
                size: l.collision.geometry.box?.['@_size'],
                radius:
                  l.collision.geometry.cylinder?.['@_radius'] ||
                  l.collision.geometry.sphere?.['@_radius'],
                length: l.collision.geometry.cylinder?.['@_length'],
              }
            : undefined,
        }
      : undefined;

    return {
      name: l['@_name'] || '',
      mass,
      inertia,
      visual,
      collision,
    };
  });

  const totalMass = links.reduce((sum, l) => sum + l.mass, 0);

  // Build joint limits map
  const jointLimits: Record<string, { lower: number; upper: number }> = {};
  for (const j of joints) {
    if (j.limit) {
      jointLimits[j.name] = { lower: j.limit.lower, upper: j.limit.upper };
    }
  }

  // Collision meshes
  const collisionMeshes: string[] = links
    .filter((l) => l.collision?.geometry?.filename)
    .map((l) => l.collision!.geometry!.filename!);

  const revoluteJoints = joints.filter(
    (j) => j.type === 'revolute' || j.type === 'continuous' || j.type === 'prismatic'
  );
  const fixedJoints = joints.filter((j) => j.type === 'fixed');

  // Build joint chain (kinematic tree)
  const jointChain: string[] = [];
  const linkSet = new Set(links.map((l) => l.name));
  const visited = new Set<string>();
  let current = joints.find((j) => !linkSet.has(j.parent));
  if (!current && joints.length > 0) current = joints[0];

  while (current && !visited.has(current.name)) {
    visited.add(current.name);
    jointChain.push(current.name);
    current = joints.find((j) => j.parent === current!.child && !visited.has(j.name));
  }

  return {
    robotName,
    joints,
    links,
    totalMass: parseFloat(totalMass.toFixed(3)),
    jointLimits,
    collisionMeshes,
    revoluteJoints,
    fixedJoints,
    jointChain,
  };
}
