import { WebSocketServer } from 'ws';

function startRosBridge() {
  const port = 9090;
  const wss = new WebSocketServer({ port });

  console.log(`[ROS_BRIDGE] Mock WebSocket Server started on port ${port}`);

  wss.on('connection', (ws) => {
    console.log('[ROS_BRIDGE] Client connected to ROS Bridge locally');

    const interval = setInterval(() => {
      // Simulate real-time mock telemetry on /joint_states
      const msg = {
        op: 'publish',
        topic: '/joint_states',
        msg: {
          name: ['joint1', 'joint2', 'joint3', 'joint4'],
          position: [
            Math.sin(Date.now() / 1000),
            Math.cos(Date.now() / 1000),
            Math.sin(Date.now() / 2000),
            Math.cos(Date.now() / 2000)
          ]
        }
      };

      if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify(msg));
      }
    }, 1000);

    // Provide a mocked drone pose
    const poseInterval = setInterval(() => {
      const pose = {
        op: 'publish',
        topic: '/robot_pose',
        msg: {
          position: {
            x: Math.sin(Date.now() / 5000) * 2,
            y: Math.cos(Date.now() / 5000) * 2,
            z: 0
          },
          orientation: { x: 0, y: 0, z: 0, w: 1 }
        }
      };
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(pose));
      }
    }, 1000);

    ws.on('message', (message) => {
      console.log('[ROS_BRIDGE] Received:', message.toString());
    });

    ws.on('close', () => {
      console.log('[ROS_BRIDGE] Client disconnected');
      clearInterval(interval);
      clearInterval(poseInterval);
    });
  });
}

startRosBridge();
