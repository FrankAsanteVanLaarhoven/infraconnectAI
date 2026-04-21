"""
Enterprise Edge Node: ROS 2 + Redis Sync Bridge
Subscribes securely to the cloud Redis infrastructure (with Tenant Isolation).
Translates abstract JSON `stream:robot.commands` into raw ROS2 publisher actions.
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

class EdgeSyncNode(Node):
    def __init__(self):
        super().__init__('infraconnect_edge_sync')
        
        # Initialize direct Redis transceiver
        self.get_logger().info(f"Connecting to Cloud Pipeline: {REDIS_URL}")
        self.redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        self.last_id = '$'
        
        # Local ROS2 standard publishers
        self.cmd_publisher = self.create_publisher(String, '/cmd_vel_json', 10)
        self.status_publisher = self.create_publisher(String, '/robot_status', 10)
        
        # Run event loop on an interval to non-block ROS routines
        self.timer = self.create_timer(0.05, self.poll_redis_stream)
        self.get_logger().info(f"Edge Node Active | Listening on Stream: {ISOLATED_STREAM} | Root ID: {ROBOT_ID}")

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
            self.get_logger().info(f"--- Intercepted Remote Cloud Command: {action} ---")
            
            # Re-compile into localized physical primitives
            ros_msg = String()
            ros_msg.data = json.dumps({
                "source_id": msg_id,
                "action": action,
                "params": cmd.get("parameters", {})
            })
            
            # Dispatch to hardware execution matrix
            self.cmd_publisher.publish(ros_msg)
            self.get_logger().info(f"Command routed to ROS2 geometry: /cmd_vel_json")
            
        except json.JSONDecodeError:
            self.get_logger().error("Critical failure decoding cloud JSON format")


def main(args=None):
    rclpy.init(args=args)
    node = EdgeSyncNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("Edge Sync cleanly terminating...")
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
