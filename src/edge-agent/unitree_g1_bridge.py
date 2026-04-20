"""
Unitree G1 Humanoid Edge Sync Bridge
Translates Vercel Cloud Commands into Native Unitree SDK2 High-Level Locomotion
"""
import os
import json
import time
import redis
import logging

# Ensure `unitree_sdk2py` is pip installed on the onboard G1 compute
try:
    from unitree_sdk2py.core.channel import ChannelFactoryInitialize
    from unitree_sdk2py.go2.sport.sport_client import SportClient
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False
    print("WARNING: unitree_sdk2py not found. Running in simulation/mock mode.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UnitreeG1-Bridge")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
TENANT_ID = os.getenv("TENANT_ID", "SYSTEM_ROOT")
ROBOT_ID = os.getenv("ROBOT_ID", "unitree-g1-alpha")
ISOLATED_STREAM = f"{TENANT_ID}.stream:robot.commands"

class UnitreeG1EdgeNode:
    def __init__(self):
        logger.info(f"Connecting to Cloud Pipeline: {REDIS_URL}")
        self.redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        self.last_id = '$'
        
        if SDK_AVAILABLE:
            # Initialize Unitree CycloneDDS local interface (requires eth0 binding on the physical G1)
            ChannelFactoryInitialize(0, "eth0")
            self.locomotion = SportClient()
            self.locomotion.SetTimeout(10.0)
            self.locomotion.Init()
            logger.info("Unitree SDK2 Initialized natively on physical DDS bounds.")
        else:
            self.locomotion = None

    def listen(self):
        logger.info(f"Unitree G1 Active | Listening on Stream: {ISOLATED_STREAM} | Root ID: {ROBOT_ID}")
        while True:
            try:
                results = self.redis_client.xread({ISOLATED_STREAM: self.last_id}, count=5, block=10)
                if not results:
                    continue
                    
                for stream, messages in results:
                    for msg_id, payload in messages:
                        self.process_command(msg_id, payload)
                        self.last_id = msg_id
                        
            except redis.ConnectionError as e:
                logger.error(f"Redic Cloud Interruption: {e}")
                time.sleep(2)
            except Exception as e:
                logger.error(f"XREAD Stream Interruption: {e}")

    def process_command(self, msg_id, payload):
        try:
            raw_data = payload.get('data', '{}')
            cmd = json.loads(raw_data)
            
            target = cmd.get("robot_id", "global")
            if target not in [ROBOT_ID, "global", "global_fleet"]:
                return

            action = cmd.get("action", "UNKNOWN")
            params = cmd.get("parameters", {})
            logger.info(f"--- Intercepted Remote Cloud Command: {action} ---")
            
            # Map semantic commands to physical Humanoid executions
            if action == "STAND_UP":
                logger.info("Executing Unitree HighCmd: RecoveryStand")
                if self.locomotion: self.locomotion.RecoveryStand()
                
            elif action == "WALK":
                vx = params.get("vx", 0.0)
                vy = params.get("vy", 0.0)
                vyaw = params.get("vyaw", 0.0)
                logger.info(f"Executing Unitree HighCmd: Walk vx={vx}, vy={vy}, vyaw={vyaw}")
                if self.locomotion: self.locomotion.Move(vx, vy, vyaw)
                
            elif action == "DANCE":
                logger.info("Executing Unitree G1 Special Sequence")
                if self.locomotion: self.locomotion.Dance1()
                
            elif action == "STOP":
                logger.info("Executing Unitree HighCmd: StopMove")
                if self.locomotion: self.locomotion.StopMove()
            
            else:
                logger.warning(f"Unmapped Humanoid Action: {action}")
                
        except json.JSONDecodeError:
            logger.error("Critical failure decoding cloud JSON format")


if __name__ == '__main__':
    node = UnitreeG1EdgeNode()
    try:
        node.listen()
    except KeyboardInterrupt:
        logger.info("Unitree G1 Sync cleanly terminating...")
