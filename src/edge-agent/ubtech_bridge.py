"""
UBTECH Humanoid Edge Sync Bridge
Translates Vercel Cloud Commands into UBTECH Local Execution Protocols
"""
import os
import json
import time
import redis
import logging

# Check for proprietary UBTECH servo libraries
try:
    import ubtech
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False
    print("WARNING: UBTECH proprietary libraries not found. Running in simulation/mock mode.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UBTECH-Bridge")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
TENANT_ID = os.getenv("TENANT_ID", "SYSTEM_ROOT")
ROBOT_ID = os.getenv("ROBOT_ID", "ubtech-walker-01")
ISOLATED_STREAM = f"{TENANT_ID}.stream:robot.commands"

class UBTECHEdgeNode:
    def __init__(self):
        logger.info(f"Connecting to Cloud Pipeline: {REDIS_URL}")
        self.redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        self.last_id = '$'
        
        if SDK_AVAILABLE:
            # Connect to UBTECH onboard control interface
            self.robot = ubtech.Robot()
            self.robot.connect()
            logger.info("UBTECH Physical API Initialized.")
        else:
            self.robot = None

    def listen(self):
        logger.info(f"UBTECH Robot Active | Listening on Stream: {ISOLATED_STREAM} | Root ID: {ROBOT_ID}")
        while True:
            try:
                results = self.redis_client.xread({ISOLATED_STREAM: self.last_id}, count=5, block=10)
                if not results:
                    continue
                    
                for stream, messages in results:
                    for msg_id, payload in messages:
                        self.process_command(msg_id, payload)
                        self.last_id = msg_id
                        
            except Exception as e:
                logger.error(f"XREAD Stream Interruption: {e}")
                time.sleep(2)

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
            
            if action == "WALK":
                speed = params.get("vx", 0.0)
                logger.info(f"Triggering UBTECH stride protocol: speed={speed}")
                if self.robot: self.robot.walk(speed=speed)
                
            elif action == "MOVE_ARM":
                left_angle = params.get("left_arm", 0.0)
                right_angle = params.get("right_arm", 0.0)
                logger.info(f"Triggering UBTECH Servos: L={left_angle}, R={right_angle}")
                if self.robot: self.robot.set_arms(left=left_angle, right=right_angle)
                
            elif action == "STOP":
                logger.info("Triggering UBTECH Emergency Halt")
                if self.robot: self.robot.stop()
            
            else:
                logger.warning(f"Unmapped Humanoid Action: {action}")
                
        except json.JSONDecodeError:
            logger.error("Critical failure decoding cloud JSON format")


if __name__ == '__main__':
    node = UBTECHEdgeNode()
    try:
        node.listen()
    except KeyboardInterrupt:
        logger.info("UBTECH Sync cleanly terminating...")
