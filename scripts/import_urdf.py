from omni.isaac.kit import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.urdf import _urdf
from pxr import Usd
import os

# Resolves to project root dynamically
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
urdf_path = os.path.join(project_root, "public/robots/yahboom_m3_pro.urdf")
usd_path = os.path.join(project_root, "public/robots/usd/yahboom_m3_pro.usd")

# Ensure USD target directory exists
os.makedirs(os.path.dirname(usd_path), exist_ok=True)

# Import URDF directly natively into NVIDIA Isaac Sim USD format (Universal Scene Description)
_urdf.acquire_urdf_interface().import_robot(
    urdf_path,
    usd_path,
    fix_base=False,
    make_default_prim=True
)

print(f"[Isaac Sim] URDF imported successfully to: {usd_path}")

simulation_app.close()
