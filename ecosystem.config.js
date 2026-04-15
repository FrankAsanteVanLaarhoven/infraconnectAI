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
        HOSTNAME: "127.0.0.1"
      }
    }
  ]
};
