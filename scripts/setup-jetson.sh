#!/bin/bash
# =========================================================================================
# InfraConnect - Edge Bootstrapper (Production Grade)
# 
# One-line installer for physical Jetson (Tegra) Orin NX robotics nodes.
# Usage: curl -sSL https://deploy.infraconnect.ai/robot | bash
# =========================================================================================

set -e
echo "🚀 InfraConnect Edge Bootstrap"

# 1. System update
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Install k3s (Lightweight Kubernetes)
curl -sfL https://get.k3s.io | sh -

# 4. Install NVIDIA runtime for Edge GPU processing
sudo apt install -y nvidia-container-runtime

# Enable GPU support in Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 5. Install ROS2 (Humble for Jetson real-time loops)
sudo apt install -y ros-humble-desktop
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc

# 6. Install MQTT client for telemetry backhaul
sudo apt install -y mosquitto-clients

echo "✅ Node installed. Registering..."

# Pull InfraConnect Agent
docker pull infraconnect/edge-agent:latest

# Start agent connected to native network space (avoiding overlay limits)
docker run -d \
  --network host \
  --privileged \
  --name infraconnect-agent \
  infraconnect/edge-agent:latest

# Fire Zero-Trust Auto Registration
bash scripts/bootstrap-node.sh
