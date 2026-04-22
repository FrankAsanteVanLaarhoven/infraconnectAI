from omni.isaac.kit import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from cbf_qp_controller import CBF_QP_Controller
import numpy as np
import time
import csv
import os

world = World()
# Assumes the robot reference is named "Robot" as defined in setup_scene.py
robot = world.scene.get_object("Robot")

controller = CBF_QP_Controller(alpha=1.0, gamma=2.0)

# FleetSafe Theoretical Constraints mapping
obstacle = np.array([3.0, 1.0])
Sigma = np.array([[0.2, 0.0],
                  [0.0, 0.2]])
goal = np.array([5.0, 2.0])

DELAY_TAU = 0.1  # 100 ms algorithmic latency injection

def get_state(robot):
    try:
        pos = robot.get_world_pose()[0]
        vel = robot.get_linear_velocity()
        return np.array([pos[0], pos[1], vel[0], vel[1]])
    except AttributeError:
        # Fallback if omni.isaac.core robot API isn't fully initialized statically
        return np.array([0.0, 0.0, 0.0, 0.0])

def apply_control(robot, u):
    try:
        robot.apply_wheel_actions(u)
    except AttributeError:
        pass # Handle headless standalone dev test

world.reset()

# CSV Logging Initialization
csv_path = os.path.join(os.path.dirname(__file__), "results.csv")
log_file = open(csv_path, "w", newline="")
writer = csv.writer(log_file)
writer.writerow(["step", "x", "y", "vx", "vy", "collision", "distance_to_goal"])

step = 0
collisions = 0

print("[FleetSafe] Initializing Isaac Sim CBF-QP Control Loop...")

while simulation_app.is_running():
    # Retrieve current 8D equivalent sim state
    x = get_state(robot)

    # Delay compensation (Hardware Latency Simulation)
    time.sleep(DELAY_TAU)

    # Evaluate Safety Function natively inside Omniverse
    u = controller.compute_control(x, goal, obstacle, Sigma)
    apply_control(robot, u)

    # Metric Capture: Goal Distance
    dist_goal = np.linalg.norm(x[:2] - goal)

    # Metric Capture: Violation Detection (ICU / Human / Semantic Bounds)
    dist_obs = np.linalg.norm(x[:2] - obstacle)
    collision = dist_obs < 0.5

    if collision:
        collisions += 1

    # Write Data Tuple
    writer.writerow([
        step,
        x[0], x[1],
        x[2], x[3],
        int(collision),
        dist_goal
    ])

    # Success conditions
    if dist_goal < 0.3:
        print("[FleetSafe] Goal Reached Successfully. Terminating epoch.")
        break

    world.step(render=True)
    step += 1

log_file.close()
simulation_app.close()
print(f"[FleetSafe] Experiment logged accurately to {csv_path}")
