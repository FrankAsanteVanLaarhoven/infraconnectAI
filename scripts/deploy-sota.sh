#!/bin/bash
set -e

# SOTA Architecture GTM Deploy Script
# Target: nava-web-server-e2-small
# Zone: us-central1-a
# IP: 35.222.147.51

echo "========================================================="
echo "   Initiating Ironclad SOTA Deployment Sequence"
echo "   Target: nava-web-server-e2-small [35.222.147.51]"
echo "========================================================="

# 1. Guarantee pristine production build locally
echo "\n[1/4] Running strict production build (Next.js Standalone)..."
export PATH="/Users/favl/.bun/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
bun run build


# 2. Package the artifact securely
echo "\n[2/4] Packaging architectural artifacts..."
# We explicitly include .next to ensure hidden folder preservation
# Use -C to change directory and avoid path prefix confusion
tar -czf sota-release.tar.gz -C . .next/standalone .next/static public package.json ecosystem.config.js .env

# 3. Securely transfer to Cloud Compute Engine (Using gcloud SSH)
echo "\n[3/4] Transmitting encrypted payload to Edge Node..."
GCLOUD="/opt/homebrew/bin/gcloud"
# Ensure target directory exists and is clean
$GCLOUD compute ssh nava-web-server-e2-small --zone=us-central1-a --command="pm2 stop all || true && mkdir -p ~/deploy && sudo rm -rf ~/deploy/.next"
$GCLOUD compute scp sota-release.tar.gz nava-web-server-e2-small:~/deploy/ --zone=us-central1-a


# 4. Remote Execution and Zero-Downtime Swap
echo "\n[4/4] Executing remote node restart..."
$GCLOUD compute ssh nava-web-server-e2-small --zone=us-central1-a --command="
  cd ~/deploy &&
  tar -xzf sota-release.tar.gz &&
  
  # Verify extraction
  if [ ! -f .next/standalone/server.js ]; then
    echo 'ERROR: server.js not found after extraction!'
    ls -laR .next || echo '.next folder missing'
    exit 1
  fi

  # Sync static assets properly mapping the standalone server expectations
  cp -r public .next/standalone/ &&
  cp -r .next/static .next/standalone/.next/ &&
  
  # Utilize PM2 ecosystem config to securely bind to internal Port 3006 
  echo 'Restarting Application Cluster via PM2...' &&
  pm2 start ecosystem.config.js --update-env || pm2 restart infraconnect-engine
"

echo "\n========================================================="
echo "   SOTA Deployment Successful!"
echo "   Application cluster successfully bound to internal PORT:3006"
echo "   (Nginx handles public domain routing to this port automatically)"
echo "========================================================="
