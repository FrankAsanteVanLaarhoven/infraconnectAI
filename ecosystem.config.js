module.exports = {
  apps: [
    {
      name: "infraconnect-engine",
      script: "./.next/standalone/server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        // Force the application to bridge to port 3006 securely
        PORT: 3006,
        HOSTNAME: "0.0.0.0"
      }
    },
    {
      name: "hardware-watchdog",
      script: "bun",
      args: "run ./scripts/watchdog_daemon.ts",
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        PORT: 3006 // Directly target the local edge proxy
      }
    },
    {
      name: "swarm-governor",
      script: "bun",
      args: "run ./scripts/autonomous_governance_loop.ts",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M"
    }
  ]
};
