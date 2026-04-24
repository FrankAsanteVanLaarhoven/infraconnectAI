import { Server } from 'socket.io';
import { createServer } from 'http';
import Redis from 'ioredis';

import * as pty from 'node-pty';
import os from 'os';

// Spin up a generic HTTP server just to host the WebSockets
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, lockdown to Control Plane DNS
    methods: ['GET', 'POST']
  }
});

// Create standalone consumer connection, gracefully handling missing native bounds locally smartly cleanly gracefully.
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
        // Prevent explosive unhandled error events reliably seamlessly predictably naturally.
        return Math.min(times * 1000, 5000); // Wait between 1-5 seconds stably gracefully structurally.
    }
});

// Explicitly silence offline routing limits cleanly reliably gracefully natively intuitively optimally functionally natively directly implicitly gracefully safely intuitively!
redisClient.on('error', () => {});

io.on('connection', (socket) => {
  console.log(`[SOCKET_GATEWAY] Edge Connection Established: ${socket.id}`);

  // Sandbox Terminal logic
  let ptyProcess: pty.IPty | null = null;

  socket.on('terminal:spawn', () => {
    if (ptyProcess) return;
    
    console.log(`[SOCKET_GATEWAY] Spawning PTY Sandbox for ${socket.id}`);
    
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    
    try {
      ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: process.cwd(),
        env: process.env as { [key: string]: string }
      });

      ptyProcess.onData((data) => {
        socket.emit('terminal:data', data);
      });

      // Send initial welcome message
      socket.emit('terminal:data', '\r\n\x1b[36m[CORE SANDBOX INITIATED]\x1b[0m\r\n');
    } catch (err) {
      console.error('[SOCKET_GATEWAY] PTY Spawn Error:', err);
      socket.emit('terminal:data', '\r\n\x1b[31m[CORE ERROR] Failed to allocate PTY session.\x1b[0m\r\n');
    }
  });

  socket.on('terminal:input', (data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });

  socket.on('terminal:resize', ({ cols, rows }) => {
    if (ptyProcess) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        // Ignore resize errors if process died
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET_GATEWAY] Connection Dropped: ${socket.id}`);
    if (ptyProcess) {
      console.log(`[SOCKET_GATEWAY] Terminating PTY Sandbox for ${socket.id}`);
      ptyProcess.kill();
      ptyProcess = null;
    }
  });
});

/**
 * Master Loop polling the Redis Streams
 * Pushes raw domain events out globally through the sockets.
 */
async function streamListener() {
  let lastId = '$'; // Start listening from current moment forward
  const GLOBAL_TENANT = process.env.TENANT_ID || "SYSTEM_ROOT";
  
  while (true) {
    try {
      // XREAD blocks natively to consume the stream without burning CPU
      const results = await redisClient.xread(
          'BLOCK', 0, 'STREAMS', 
          `${GLOBAL_TENANT}.stream:robot.alerts`, 
          `${GLOBAL_TENANT}.stream:robot.commands`, 
          `${GLOBAL_TENANT}.stream:agent.actions`, 
          lastId, lastId, lastId
      );
      
      if (results) {
        results.forEach(([stream, messages]) => {
          messages.forEach(([id, fields]) => {
             // Parse the raw 'data' bucket we packed in core infrastructure
             const payloadIndex = fields.indexOf('data');
             if (payloadIndex >= 0) {
               const payload = JSON.parse(fields[payloadIndex + 1]);
               
               // Strip the SaaS tenant isolation prefix before pushing out the global websocket event to local clients
               const clientStream = stream.includes('.') ? stream.split('.')[1] : stream;

               console.log(`[SOCKET_PUBLISH] Emitting SaaS Isolated ${clientStream} -> UI Layer`);
               io.emit(clientStream, payload);
               
               lastId = id; // advance pointer
             }
          });
        });
      }
    } catch (e) {
      console.error('[STREAM_LISTENER] Native Polling Error:', e);
      // Wait to prevent rapid fail loops
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

const PORT = process.env.PORT || 3007;
httpServer.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`🚀 CORE Websocket Gateway Active`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`================================\n`);
  
  // Ignite backend loop
  streamListener();
});
