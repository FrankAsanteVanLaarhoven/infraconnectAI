export type Experience = {
  state: any;
  action: any;
  reward: number;
  next_state: any;
  done: boolean;
  source: "sim" | "real";
};

export type PolicyVersion = {
    version: string;
    deployed_to: string[];
    performance: {
        success_rate: number;
    }
}
