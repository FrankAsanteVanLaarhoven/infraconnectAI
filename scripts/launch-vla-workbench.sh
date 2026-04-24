#!/bin/bash
set -e

echo "🚀 Launching VLA Workbench (InfraConnect AI v3.0)..."

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# 1. Check dependencies
echo -e "${CYAN}Checking dependencies...${NC}"
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "Bun is required"; exit 1; }

# 2. Apply database changes
echo -e "${CYAN}Applying Prisma schema...${NC}"
bunx prisma db push --skip-generate

# 3. Seed VLA demo data
echo -e "${CYAN}Seeding VLA demo data...${NC}"
bunx prisma db seed -- --name vla

# 4. Start Isaac Lab container (if not running)
if ! docker ps | grep -q isaac-lab; then
  echo -e "${CYAN}Starting Isaac Lab container...${NC}"
  docker-compose -f docker-compose.isaac.yml up -d
else
  echo -e "${GREEN}Isaac Lab container already running.${NC}"
fi

# 5. Start the main application
echo -e "${CYAN}Starting InfraConnect AI...${NC}"
bun run dev &

# Wait for server to be ready
sleep 4

# 6. Open browser
if command -v open >/dev/null 2>&1; then
  open http://localhost:3006/vla-workbench
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open http://localhost:3006/vla-workbench
else
  echo -e "${GREEN}Open manually: http://localhost:3006/vla-workbench${NC}"
fi

echo -e "\n${GREEN}✅ VLA Workbench is live!${NC}"
echo -e "   URL: ${CYAN}http://localhost:3006/vla-workbench${NC}"
echo -e "   Isaac Lab: ${CYAN}http://localhost:8888${NC} (Jupyter)"
echo ""
echo "Press Ctrl+C to stop everything."

# Keep script running
wait
