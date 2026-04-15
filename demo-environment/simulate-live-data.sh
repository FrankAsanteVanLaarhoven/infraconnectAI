#!/bin/bash
# ===============================================
# Grok Cinematic Demo "Live Data" Simulator
# Run this in a background terminal during the pitch
# ===============================================

echo "🎬 Starting Live Data Simulation hook..."
echo "Targeting Grok Demo Postgres container..."

while true; do
  # Calculate a random delay between 5 to 15 seconds to feel organic
  DELAY=$(( ( RANDOM % 10 )  + 5 ))
  
  # Trigger the 'failed payments' Wow Moment
  docker exec grok_demo_db psql -U grokadmin -d demo -c "UPDATE payments SET status='failed' WHERE id = ((RANDOM()*5)+1)::int;" > /dev/null 2>&1
  
  # Trigger 'error logs' escalation
  docker exec grok_demo_db psql -U grokadmin -d demo -c "INSERT INTO logs (service, error, timestamp) VALUES ('payment_gateway', 'API_TIMEOUT: target host unreachable', NOW());" > /dev/null 2>&1

  echo "⚡ Live anomaly injected. Waiting ${DELAY}s..."
  sleep $DELAY
done
