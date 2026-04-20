export type ActionCalibration = {
  action: string;
  sim_result: any;
  real_result: any;
  error: number;
};

export function calibrate(sim: number, real: number) {
  return {
    scale: real / (sim || 1)
  };
}
