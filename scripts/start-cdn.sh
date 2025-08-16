#!/bin/bash

# Requify CDN Startup Script
# Initializes and starts MinIO CDN container with NGINX proxy

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

echo -e "${BLUE}🚀 Starting Requify CDN Infrastructure...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found. Please install docker-compose.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating data directories...${NC}"
mkdir -p "$ROOT_DIR/data/minio"
mkdir -p "$ROOT_DIR/data/redis-cdn"
mkdir -p "$ROOT_DIR/data/nginx-cache"
mkdir -p "$ROOT_DIR/data/nginx-logs"

# Set proper permissions
chmod -R 755 "$ROOT_DIR/data"

# Load environment variables
if [ -f "$ROOT_DIR/deploy/env/cdn.env" ]; then
    echo -e "${YELLOW}📋 Loading CDN environment variables...${NC}"
    export $(cat "$ROOT_DIR/deploy/env/cdn.env" | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  CDN environment file not found, using defaults...${NC}"
fi

# Navigate to deploy directory
cd "$ROOT_DIR/deploy/docker"

# Stop existing containers if running
echo -e "${YELLOW}🛑 Stopping existing CDN containers...${NC}"
docker-compose -f docker-compose.cdn.yml down 2>/dev/null || true

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest Docker images...${NC}"
docker-compose -f docker-compose.cdn.yml pull

# Start CDN infrastructure
echo -e "${YELLOW}🔄 Starting CDN containers...${NC}"
docker-compose -f docker-compose.cdn.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Check MinIO health
echo -e "${BLUE}🔍 Checking MinIO status...${NC}"
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MinIO is ready!${NC}"
        break
    fi
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ MinIO failed to start within $timeout seconds${NC}"
    exit 1
fi

# Check NGINX CDN health
echo -e "${BLUE}🔍 Checking NGINX CDN status...${NC}"
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ NGINX CDN is ready!${NC}"
        break
    fi
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ NGINX CDN failed to start within $timeout seconds${NC}"
    exit 1
fi

# Check Redis CDN
echo -e "${BLUE}🔍 Checking Redis CDN status...${NC}"
if docker exec requify-redis-cdn redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis CDN is ready!${NC}"
else
    echo -e "${RED}❌ Redis CDN is not responding${NC}"
fi

# Display status
echo -e "\n${GREEN}🎉 CDN Infrastructure Started Successfully!${NC}"
echo -e "\n${BLUE}📋 Service URLs:${NC}"
echo -e "  • MinIO Console:  http://localhost:9001"
echo -e "  • MinIO API:      http://localhost:9000"
echo -e "  • CDN Proxy:      http://localhost:8080"
echo -e "  • Cache Status:   http://localhost:8080/cache-status"

echo -e "\n${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.cdn.yml ps

echo -e "\n${BLUE}💾 Storage Info:${NC}"
echo -e "  • MinIO Data:     $ROOT_DIR/data/minio"
echo -e "  • Redis Data:     $ROOT_DIR/data/redis-cdn"
echo -e "  • NGINX Cache:    $ROOT_DIR/data/nginx-cache"
echo -e "  • NGINX Logs:     $ROOT_DIR/data/nginx-logs"

echo -e "\n${YELLOW}💡 Next Steps:${NC}"
echo -e "  1. Configure your application to use CDN_BASE_URL: http://localhost:8080"
echo -e "  2. Upload files will be accessible via: http://localhost:8080/avatars/"
echo -e "  3. Monitor logs: docker-compose -f docker-compose.cdn.yml logs -f"
echo -e "  4. Stop CDN: ./scripts/stop-cdn.sh"

echo -e "\n${GREEN}✨ Ready for file uploads and CDN delivery!${NC}" 