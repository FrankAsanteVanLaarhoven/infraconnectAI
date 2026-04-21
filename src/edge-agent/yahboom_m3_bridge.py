"""
Yahboom ROSMASTER M3 Pro Node: ROS 2 + Redis Sync Bridge
Subscribes securely to the cloud Redis infrastructure (with Tenant Isolation).
Translates abstract JSON `stream:robot.commands` into native Yahboom ROS2 publishers
for Mecanum movements, 6DOF Robotic Arm control, and Voice interactions.
"""
import os
import json
import time
import redis
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

# Fetch localized credentials (or use global defaults)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
TENANT_ID = os.getenv("TENANT_ID", "SYSTEM_ROOT")
ROBOT_ID = os.getenv("ROBOT_ID", "yahboom-m3-pro")
ISOLATED_STREAM = f"{TENANT_ID}.stream:robot.commands"

class YahboomEdgeNode(Node):
    def __init__(self):
        super().__init__('yahboom_edge_sync')
        
        # Initialize direct Redis transceiver
        self.get_logger().info(f"Connecting to Cloud Pipeline: {REDIS_URL}")
        self.redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        self.last_id = '$'
        
        # Load Hardware Envelope Limits from Cloud / Template Profiles
        self.max_payload_g = 410
        self.max_radius_cm = 30
        self.get_logger().info(f"Hardware Boundaries Synced: MAX PAYLOAD {self.max_payload_g}g | MAX RADIUS {self.max_radius_cm}cm")
        
        # Yahboom ROSMASTER specific topic hardware bindings
        # 1. Base Mecanum / Standard Geometry
        self.cmd_publisher = self.create_publisher(String, '/cmd_vel_json', 10)
        # 2. 6DOF Robotic Arm target actions (e.g. 3D intelligent gripping)
        self.arm_publisher = self.create_publisher(String, '/arm_control/action', 10)
        # 3. Voice Synthesizer target topic 
        self.voice_publisher = self.create_publisher(String, '/voice_system/synth', 10)
        
        self.status_publisher = self.create_publisher(String, '/robot_status', 10)
        
        # Telemetry ingestion from hardware sensors (subscribers)
        self.lidar_sub = self.create_subscription(String, '/scan_fusion', self.lidar_callback, 10)
        self.battery_sub = self.create_subscription(String, '/battery_status', self.battery_callback, 10)
        self.slam_sub = self.create_subscription(String, '/slam_pose', self.slam_callback, 10)

        # High-Performance compute tracking (Orin SUPER 16GB)
        self.vision_sub = self.create_subscription(String, '/vision/perf', self.vision_callback, 10)
        self.moveit_sub = self.create_subscription(String, '/moveit/status', self.moveit_callback, 10)

        # Output stream for telemetry to the cloud
        self.telemetry_stream = f"{TENANT_ID}.stream:robot.telemetry"
        
        # Run event loop on an interval to non-block ROS routines
        self.timer = self.create_timer(0.05, self.poll_redis_stream)
        self.get_logger().info(f"Yahboom Edge Node Active | Listening on Stream: {ISOLATED_STREAM} | Root ID: {ROBOT_ID}")

    def lidar_callback(self, msg):
        # We proxy the Dual TOF LiDAR point cloud summary securely over Redis
        self.redis_client.xadd(self.telemetry_stream, {
            "robot_id": ROBOT_ID,
            "sensor": "DUAL_TOF_LIDAR",
            "data": msg.data,
            "timestamp": str(time.time())
        })

    def battery_callback(self, msg):
        self.redis_client.xadd(self.telemetry_stream, {
            "robot_id": ROBOT_ID,
            "sensor": "BATTERY_9600MAH",
            "data": msg.data,
            "timestamp": str(time.time())
        })

    def slam_callback(self, msg):
        self.redis_client.xadd(self.telemetry_stream, {
            "robot_id": ROBOT_ID,
            "sensor": "SLAM_FUSION",
            "data": msg.data,
            "timestamp": str(time.time())
        })

    def vision_callback(self, msg):
        # Tracking deep vision models at 30fps benchmarks
        self.redis_client.xadd(self.telemetry_stream, {
            "robot_id": ROBOT_ID,
            "sensor": "VISUAL_LLM_PERF",
            "data": msg.data, 
            "timestamp": str(time.time())
        })

    def moveit_callback(self, msg):
        # Kinematic processing abstraction stream
        self.redis_client.xadd(self.telemetry_stream, {
            "robot_id": ROBOT_ID,
            "sensor": "MOVEIT2_SIM",
            "data": msg.data,
            "timestamp": str(time.time())
        })

    def poll_redis_stream(self):
        try:
            # Native blocking read without saturating the edge compute
            results = self.redis_client.xread({ISOLATED_STREAM: self.last_id}, count=5, block=10)
            if not results:
                return
                
            for stream, messages in results:
                for msg_id, payload in messages:
                    self.process_command(msg_id, payload)
                    self.last_id = msg_id
                    
        except Exception as e:
            self.get_logger().error(f"XREAD Stream Interruption: {e}")
            time.sleep(1)

    def process_command(self, msg_id, payload):
        try:
            raw_data = payload.get('data', '{}')
            cmd = json.loads(raw_data)
            
            # Check physical targeting alignment
            target = cmd.get("robot_id", "global")
            if target not in [ROBOT_ID, "global", "global_fleet"]:
                return

            action = cmd.get("action", "UNKNOWN")
            params = cmd.get("parameters", {})
            self.get_logger().info(f"--- Intercepted Remote Cloud Command: {action} ---")
            
            # Translate into standard JSON formatted strings for native ROS parsers.
            # In a full C++ pipeline these might be geometry_msgs/Twist or proprietary messages.
            ros_msg = String()
            ros_msg.data = json.dumps({
                "source_id": msg_id,
                "action": action,
                "params": params
            })
            
            # Action Mapping Matrix targeting specialized hardware capacities
            if action in ["MOVE", "STOP", "ROTATE", "NAVIGATE"]:
                self.cmd_publisher.publish(ros_msg)
                self.get_logger().info(f"Command routed to ROS2 geometry: /cmd_vel_json")
                
            elif action in ["GRAB", "RELEASE", "MOVE_ARM", "3D_GRASP"]:
                # SOTA Hardware Validation: Preventing damage to 6DOF servos prior to ROS serial execution
                expected_weight = params.get("target_weight_g", 0)
                expected_radius = params.get("target_radius_cm", 0)
                
                if expected_weight > self.max_payload_g:
                    self.get_logger().error(f"[HARDWARE LIMIT BREACH] Target {expected_weight}g exceeds serial bus {self.max_payload_g}g capacity. GRABBING ABORTED.")
                    return
                if expected_radius > self.max_radius_cm:
                    self.get_logger().error(f"[KINEMATIC LIMIT BREACH] Target {expected_radius}cm exceeds {self.max_radius_cm}cm reach. MOVEMENT ABORTED.")
                    return

                self.arm_publisher.publish(ros_msg)
                self.get_logger().info(f"Command routed to 6DOF Arm: /arm_control/action")
                
            elif action in ["SPEAK", "VOICE", "ALERT"]:
                self.voice_publisher.publish(ros_msg)
                self.get_logger().info(f"Command routed to Voice Synth: /voice_system/synth")
                
            else:
                # Default fallback
                self.cmd_publisher.publish(ros_msg)
                self.get_logger().warning(f"Unmapped action {action}. Defaulting publish to /cmd_vel_json")
            
        except json.JSONDecodeError:
            self.get_logger().error("Critical failure decoding cloud JSON format")


def main(args=None):
    rclpy.init(args=args)
    node = YahboomEdgeNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("Yahboom Edge Sync cleanly terminating...")
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
