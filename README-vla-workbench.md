# VLA Workbench — InfraConnect AI v3.0

**Physical AI Training & Data Curation Platform**  
Built inside InfraConnect AI for enterprise-grade Vision-Language-Action (VLA) model development.

---

## Overview

The **VLA Workbench** is a unified interface that combines:

- **Isaac Lab** high-fidelity GPU simulation
- **Live Data Curation** (WeightsLab + Cleanlab fusion)
- **Physics-Aware Quality Scoring**
- **Real-time 3D Episode Replay**
- **Human-in-the-Loop Governance**
- **Seamless Sim-to-Real Transfer**

All within your existing zero-trust, cryptographically audited InfraConnect AI platform.

---

## Key Features

- Live physics + data quality monitoring
- Automatic pruning of low-quality / noisy episodes
- 3D physics replay of problematic episodes
- Cleanlab integration (real API + intelligent fallback)
- One-click promotion to Physics Canon memory layer
- Full cryptographic audit trail of all curation decisions
- Works on both cloud and edge (Jetson Orin)

---

## Quick Start (Development)

```bash
# 1. Apply new Prisma models
bunx prisma db push

# 2. Seed demo VLA data
bunx prisma db seed -- --name vla

# 3. Start the platform
bun run dev
```

Visit: `http://localhost:3006/vla-workbench`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VLA Workbench UI                         │
│  (Next.js + React Three Fiber + Recharts + Framer Motion)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    API Layer (44+ routes)                   │
│  /api/isaac-lab/*  |  /api/data-curation/*  |  /api/memory  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              Live Curation Engine + Physics Fabric          │
│   (Cleanlab + Physics Scoring + Dynamic Pruning)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│         Isaac Lab (Docker / K8s)  +  Edge ROS 2 Agents      │
│              (NVIDIA Isaac Sim + PhysX)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Instructions

### Option A: Local Development (Recommended for Testing)

```bash
# Start Isaac Lab container
docker-compose -f docker-compose.isaac.yml up -d

# Start InfraConnect AI
bun run dev
```

### Option B: Cloud Deployment (Production)

**1. Control Plane (Vercel)**
- Deploy `infraconnectAI` to Vercel (already configured)
- Add environment variables:
  ```env
  CLEANLAB_API_KEY=your_key
  ISAAC_LAB_URL=https://your-isaac-cluster.internal
  ```

**2. Isaac Lab on Kubernetes (Recommended)**

Create `k8s/isaac-lab-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: isaac-lab
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: isaac-lab
        image: nvcr.io/nvidia/isaac-lab:latest
        resources:
          limits:
            nvidia.com/gpu: 4
        env:
        - name: NUM_ENVS
          value: "2048"
```

Apply with:
```bash
kubectl apply -f k8s/isaac-lab-deployment.yaml
```

**3. Edge Deployment (NVIDIA Jetson Orin)**

```bash
# On Jetson
docker-compose -f docker-compose.orin.yml up -d

# Run lightweight Isaac Sim viewer + bridge
python3 src/edge-agent/isaac-sim-bridge.py
```

---

## Environment Variables

| Variable                  | Description                          | Required |
|---------------------------|--------------------------------------|----------|
| `CLEANLAB_API_KEY`        | Cleanlab API key                     | No (fallback works) |
| `WANDB_API_KEY`           | Weights & Biases integration         | Recommended |
| `ISAAC_LAB_URL`           | Remote Isaac Lab cluster URL         | Production |
| `TENANT_ID`               | Multi-tenant isolation               | Yes |
| `ROBOT_ID`                | Edge hardware identifier             | Edge only |

---

## Troubleshooting

**Isaac Lab container won't start**
- Ensure NVIDIA Container Toolkit is installed
- Check GPU visibility: `nvidia-smi`

**No episodes appearing**
- Run `bunx prisma db seed -- --name vla`
- Check Redis Streams are running

**Low physics scores**
- Increase domain randomization variance in launch parameters
- Review sensor simulation settings in Isaac Sim

---

## Next Steps / Roadmap

- [ ] Multi-robot fleet training support
- [ ] Automated sim-to-real transfer scoring
- [ ] Integration with NVIDIA GR00T & OpenVLA
- [ ] On-device fine-tuning on Jetson

---

**Built with ❤️ inside InfraConnect AI**  
Enterprise Physical AI, done right.
