#!/bin/bash

# Requify CDN Stop Script
# Stops MinIO CDN container and cleans up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🛑 Stopping Requify CDN Infrastructure...${NC}"

# Navigate to deploy directory
cd "$ROOT_DIR/deploy/docker"

# Stop containers
echo -e "${YELLOW}⏹️  Stopping CDN containers...${NC}"
docker-compose -f docker-compose.cdn.yml down

# Optional: Remove volumes (uncomment if needed)
# echo -e "${YELLOW}🗑️  Removing volumes...${NC}"
# docker-compose -f docker-compose.cdn.yml down -v

# Show final status
echo -e "${GREEN}✅ CDN Infrastructure stopped successfully!${NC}"

echo -e "\n${BLUE}💾 Data preserved in:${NC}"
echo -e "  • MinIO Data:     $ROOT_DIR/data/minio"
echo -e "  • Redis Data:     $ROOT_DIR/data/redis-cdn" 
echo -e "  • NGINX Cache:    $ROOT_DIR/data/nginx-cache"
echo -e "  • NGINX Logs:     $ROOT_DIR/data/nginx-logs"

echo -e "\n${YELLOW}💡 To completely remove data, run:${NC}"
echo -e "  sudo rm -rf $ROOT_DIR/data/"

echo -e "\n${GREEN}🔄 To restart CDN, run:${NC}"
echo -e "  ./scripts/start-cdn.sh" 