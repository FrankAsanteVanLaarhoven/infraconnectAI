from omni.isaac.kit import SimulationApp
simulation_app = SimulationApp({"headless": False})

import omni
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.objects import FixedCuboid
from omni.isaac.sensor import Camera
import os

world = World(stage_units_in_meters=1.0)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Add the parsed Yahboom Robot USD
robot_usd = os.path.join(project_root, "public/robots/usd/yahboom_m3_pro.usd")
add_reference_to_stage(usd_path=robot_usd, prim_path="/World/Robot")

# Add standard Ground Plane
world.scene.add_default_ground_plane()

# Add simple walls mapping to the Hospital ICU setup referenced in FleetSafe
wall = FixedCuboid(
    prim_path="/World/ICU_Wall",
    position=[2, 0, 0.5],
    scale=[0.1, 4, 1]
)
world.scene.add(wall)

# Add Pharmacy extraction goal node
goal = FixedCuboid(
    prim_path="/World/Pharmacy_Goal",
    position=[5, 2, 0.1],
    scale=[0.2, 0.2, 0.2]
)
world.scene.add(goal)

# Setup VLA RGB Edge camera configuration
camera = Camera(
    prim_path="/World/Robot/camera",
    position=[0.2, 0.0, 0.3],
    resolution=(640, 480),
    frequency=30
)
camera.initialize()

print("[Isaac Sim] Setup Semantic Hospital Topology with ROS2 Nodes")
world.reset()

while simulation_app.is_running():
    world.step(render=True)

simulation_app.close()
