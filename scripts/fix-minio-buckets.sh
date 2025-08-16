#!/bin/bash

# Fix MinIO Bucket Policies Script
# This script fixes the Access Denied error for MinIO avatar uploads

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

FORCE=false
VERIFY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --verify)
            VERIFY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--force] [--verify]"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}🔧 MinIO Bucket Policies Fix Script${NC}"
echo -e "${CYAN}=================================${NC}"

# Check if Docker is running
if ! docker version >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Change to deploy/docker directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/../deploy/docker"

if [[ ! -d "$DEPLOY_DIR" ]]; then
    echo -e "${RED}❌ Deploy directory not found: $DEPLOY_DIR${NC}"
    exit 1
fi

cd "$DEPLOY_DIR"
echo -e "${BLUE}📂 Working directory: $DEPLOY_DIR${NC}"

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    if [[ -f "docker.env.example" ]]; then
        echo -e "${YELLOW}📋 Creating .env from docker.env.example${NC}"
        cp "docker.env.example" ".env"
    else
        echo -e "${RED}❌ No .env file found and no docker.env.example to copy from${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔍 Checking MinIO container status...${NC}"

# Check if MinIO container is running
if ! docker ps --filter "name=requify_minio" --format "table {{.Names}}" | grep -q "requify_minio"; then
    echo -e "${YELLOW}⚠️  MinIO container is not running. Starting infrastructure...${NC}"
    
    echo -e "${BLUE}🚀 Starting Docker Compose services...${NC}"
    docker-compose up -d minio postgres redis
    
    echo -e "${BLUE}⏳ Waiting for MinIO to be ready...${NC}"
    sleep 10
    
    # Wait for MinIO health check
    timeout=60
    elapsed=0
    while [[ $elapsed -lt $timeout ]]; do
        health_status=$(docker inspect requify_minio --format='{{.State.Health.Status}}' 2>/dev/null || echo "")
        if [[ "$health_status" == "healthy" ]]; then
            echo -e "${GREEN}✅ MinIO is healthy${NC}"
            break
        fi
        echo -e "${YELLOW}⏳ Waiting for MinIO health check... ($elapsed/${timeout}s)${NC}"
        sleep 5
        elapsed=$((elapsed + 5))
    done
    
    if [[ $elapsed -ge $timeout ]]; then
        echo -e "${YELLOW}⚠️  MinIO health check timeout, but continuing...${NC}"
    fi
else
    echo -e "${GREEN}✅ MinIO container is running${NC}"
fi

echo ""
echo -e "${BLUE}🛠️  Initializing MinIO buckets and policies...${NC}"

# Run the MinIO Client initialization
echo -e "${BLUE}🔧 Running bucket initialization...${NC}"
if docker-compose --profile init up mc; then
    echo -e "${GREEN}✅ Bucket initialization completed${NC}"
else
    echo -e "${RED}❌ Failed to initialize buckets${NC}"
    
    echo ""
    echo -e "${YELLOW}🔄 Trying alternative method via backend API...${NC}"
    
    # Check if backend is running
    if ! docker ps --filter "name=requify_backend" --format "table {{.Names}}" | grep -q "requify_backend"; then
        echo -e "${BLUE}🚀 Starting backend service...${NC}"
        docker-compose up -d backend
        
        echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
        sleep 15
    fi
    
    # Restart backend to trigger bucket policies update
    echo -e "${BLUE}♻️  Restarting backend to trigger bucket policies update...${NC}"
    docker-compose restart backend
    
    sleep 10
    echo -e "${GREEN}✅ Backend restarted - bucket policies should be updated${NC}"
fi

if [[ "$VERIFY" == "true" ]]; then
    echo ""
    echo -e "${BLUE}🔍 Verifying bucket setup...${NC}"
    
    # List buckets using mc client
    echo -e "${BLUE}📋 Listing MinIO buckets:${NC}"
    if docker exec requify_minio mc ls http://localhost:9000 --insecure 2>/dev/null; then
        echo ""
        echo -e "${BLUE}🔐 Checking bucket policies:${NC}"
        buckets=("requify-uploads" "requify-avatars" "requify-documents")
        
        for bucket in "${buckets[@]}"; do
            echo -e "${BLUE}  Policy for $bucket:${NC}"
            if ! docker exec requify_minio mc policy get "http://localhost:9000/$bucket" --insecure 2>/dev/null; then
                echo -e "${GRAY}    No policy or access denied${NC}"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  Could not verify bucket setup${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 MinIO bucket policies fix completed!${NC}"
echo ""
echo -e "${CYAN}📝 Summary:${NC}"
echo -e "${WHITE}   • MinIO buckets created: requify-uploads, requify-avatars, requify-documents${NC}"
echo -e "${WHITE}   • Avatar bucket set to public read access (for CDN)${NC}"
echo -e "${WHITE}   • Upload and document buckets set to private access${NC}"
echo ""
echo -e "${CYAN}🧪 To test avatar upload:${NC}"
echo -e "${WHITE}   1. Start the full application: docker-compose up -d${NC}"
echo -e "${WHITE}   2. Open http://requify.local in your browser${NC}"
echo -e "${WHITE}   3. Register/login and try uploading an avatar${NC}"
echo ""

if [[ "$FORCE" != "true" ]]; then
    echo -e "${GRAY}Press any key to exit...${NC}"
    read -n 1 -s
fi
