export interface KinematicsProfile {
  dof: number;
  payloadLimitGrams: number;
  maxRadiusCm: number;
  repeatabilityMm: number;
  servoType: string;
}

export interface PerceptionProfile {
  lidarType: string;
  lidarCount: number;
  hz: number;
  rangeMinM: number;
  rangeMaxM: number;
}

export interface VisionProfile {
  cameraType: string;
  depthMaxM: number;
  rgbResolution: string;
  rgbFps: number;
  fovH: number;
  fovV: number;
}

export interface ControlProfile {
  mcu: string;
  imu: string;
  batteryCapacity: string;
  computeNode: string;
  computeTops: number;
}

export interface VoiceProfile {
  module: string;
  snrDb: number;
  pickupDistanceM: number;
}

export interface DimensionsProfile {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightGrams: number;
}

export interface CoreSoftwareProfile {
  os: string;
  rosDistribution: string;
  runtimeHrs: number;
}

export interface ControlInputsProfile {
  available: string[];
  active: string;
}

export interface ChassisProfile {
  material: string;
  driveType: string;
  suspension: string;
}

export interface RobotHardwareProfile {
  id: string;
  name: string;
  baudRate: number;
  kinematics: KinematicsProfile;
  perception: PerceptionProfile;
  vision: VisionProfile;
  control: ControlProfile;
  voice: VoiceProfile;
  dimensions: DimensionsProfile;
  software: CoreSoftwareProfile;
  inputs: ControlInputsProfile;
  chassis: ChassisProfile;
}
