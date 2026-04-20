#!/bin/bash

# InfraConnect Core K3s Scaling Engine Tracker

# 1. Install pure Docker containers natively across the hardware host limits
apt update
apt install -y docker.io

# 2. Extract edge execution framework bounds mathematically locking API payloads natively
curl -sfL https://get.k3s.io | sh -

# 3. Native scaling Kubernetes configuration loops
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# 4. Helm execution routing explicitly parsing YAML schemas
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 5. Extract structural constraints securely
echo "Executing K8s mapping limits natively..."
kubectl create namespace infraconnect
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/ws.yaml

echo "Control Plane Secure."
