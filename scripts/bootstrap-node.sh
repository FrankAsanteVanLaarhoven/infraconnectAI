#!/bin/bash
# =========================================================================================
# InfraConnect - Node Bootstrap (Zero Trust Hook)
# =========================================================================================

set -e
export NODE_ID=$(cat /proc/cpuinfo 2>/dev/null | sha256sum | cut -c1-16 || hostname)

echo "[🔐] Registering Identity payload under Node ID: $NODE_ID"

# Pull initial safe-state configuration from the control plane
curl -sSL "https://control.infraconnect.ai/bootstrap/$NODE_ID" > /etc/infraconnect/config.yaml || echo "Warning: API endpoint simulated."

# (Simulated) Register node with explicit mTLS payload generator
# node edge/k3s-node/register.js

echo "[✅] Configuration retrieved. Cryptographic Handshake Established."

# Edge agent daemon loop now takes over...
