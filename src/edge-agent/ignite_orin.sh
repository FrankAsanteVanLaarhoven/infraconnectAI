#!/bin/bash
# ==========================================
# InfraconnectAI Edge Ignition Script
# Architecture: Nvidia Jetson Orin NX (ARM64)
# ==========================================

echo "=========================================="
echo "🚀 Igniting Physical Edge Chassis Bounds"
echo "=========================================="

# Ensure environment variables exist before booting
if [ ! -f .env.edge ]; then
  echo "❌ Error: `.env.edge` file is missing!"
  echo "Please copy `.env.template` to `.env.edge` and fill in your Railway WebSockets URL."
  exit 1
fi

echo "[1/3] Validating Docker Nvidia Runtime Environments..."
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed on this Jetson device."
    exit 1
fi

echo "[2/3] Building ROS2 ARM64 L4T Emulation Layer..."
docker compose -f docker-compose.orin.yml build

echo "[3/3] Launching Edge Daemon Silently..."
docker compose -f docker-compose.orin.yml up -d

echo "=========================================="
echo "✅ Edge Agent Deployed."
echo "Hardware is now autonomously communicating with Railway."
echo "Check connection logs with: docker logs -f infraconnect-edge-daemon"
echo "=========================================="
