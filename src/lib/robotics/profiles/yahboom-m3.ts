import { RobotHardwareProfile } from "../types/HardwareSchema";

export const YAHBOOM_M3_PROFILE: RobotHardwareProfile = {
  id: "yahboom-m3-pro",
  name: "ROSMASTER M3 Pro",
  baudRate: 115200,
  kinematics: {
    dof: 6,
    payloadLimitGrams: 410,
    maxRadiusCm: 30,
    repeatabilityMm: 0.5,
    servoType: "15KG*5+6KG*1 Serial Bus",
  },
  perception: {
    lidarType: "Dual TOF T-mini Plus",
    lidarCount: 2,
    hz: 4000,
    rangeMinM: 0.05,
    rangeMaxM: 12,
  },
  vision: {
    cameraType: "DABAI DCW2 Structured Light",
    depthMaxM: 5,
    rgbResolution: "1920x1080",
    rgbFps: 30,
    fovH: 91,
    fovV: 62,
  },
  control: {
    mcu: "STM32H743VGT6",
    imu: "9-Axis ICM20948",
    batteryCapacity: "9600mAh",
    computeNode: "Jetson Orin NX SUPER 16GB",
    computeTops: 157,
  },
  voice: {
    module: "MEMS High-Sensitivity Cavity Speaker",
    snrDb: 64,
    pickupDistanceM: 5,
  },
  dimensions: {
    lengthMm: 279.97,
    widthMm: 212.4,
    heightMm: 571.57,
    weightGrams: 4120,
  },
  software: {
    os: "Ubuntu 22.04 LTS",
    rosDistribution: "ROS2 Humble",
    runtimeHrs: 6.4,
  },
  inputs: {
    available: ["Mapping APP (iOS/Android)", "PC Terminal SSH", "Wireless Gamepad"],
    active: "API Control Plane Orchestrator",
  },
  chassis: {
    material: "Oxidized sandblasted aluminum alloy",
    driveType: "4x Mecanum 360° Omnidirectional",
    suspension: "Rear Pendulum Suspension",
  }
};
