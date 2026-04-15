export interface ModalityConfig {
  id:            string
  label:         string
  ingestRateHz:  number    // target sample rate
  maxLatencyMs:  number    // alert if exceeded
  constraints:   string[]  // constraint IDs that apply to this modality
  cloudStore:    boolean   // whether full payload goes to cloud or just summary
  edgeProcess:   boolean   // whether edge node processes locally before sending
}

export const MODALITY_REGISTRY: ModalityConfig[] = [
  {
    id: 'rgb',
    label: 'RGB Camera',
    ingestRateHz: 30,
    maxLatencyMs: 100,
    constraints: ['semantic_zone_respect', 'person_detection_confidence'],
    cloudStore: false,       // only send embeddings/summaries, not raw frames
    edgeProcess: true,       // Agent Ops high-fidelity vision processing happens on edge
  },
  {
    id: 'depth',
    label: 'Depth / LiDAR',
    ingestRateHz: 10,
    maxLatencyMs: 50,
    constraints: ['min_obstacle_clearance'],
    cloudStore: false,
    edgeProcess: true,
  },
  {
    id: 'force',
    label: 'Force-Torque Sensor',
    ingestRateHz: 1000,      // high freq — edge only, summary to cloud
    maxLatencyMs: 5,
    constraints: ['grasp_force_limit'],
    cloudStore: false,
    edgeProcess: true,
  },
  {
    id: 'imu',
    label: 'IMU / Velocity',
    ingestRateHz: 100,
    maxLatencyMs: 10,
    constraints: ['max_velocity', 'deadline_control_loop'],
    cloudStore: false,
    edgeProcess: true,
  },
  {
    id: 'audio',
    label: 'Microphone / Speech',
    ingestRateHz: 16000,     // 16kHz raw — transcribe at edge, send text to cloud
    maxLatencyMs: 500,
    constraints: [],
    cloudStore: true,        // transcriptions stored for Cognitive Core interaction tracking
    edgeProcess: true,
  },
  {
    id: 'language',
    label: 'LLM Token Stream',
    ingestRateHz: 1,         // per-turn
    maxLatencyMs: 3000,
    constraints: ['policy_compliance'],
    cloudStore: true,        // full turn stored in MemoryNode L0
    edgeProcess: false,
  },
  {
    id: 'thermal',
    label: 'Thermal Camera',
    ingestRateHz: 5,
    maxLatencyMs: 200,
    constraints: ['human_proximity_thermal'],
    cloudStore: false,
    edgeProcess: true,
  },
]
