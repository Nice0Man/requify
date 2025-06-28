#!/bin/bash

# =============================================================================
# Start Requify Development Environment with Email Support
# =============================================================================

set -e

echo "🚀 Starting Requify Development Environment with Email Support"
echo "=============================================================="
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Navigate to the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/deploy/docker"

cd "$DOCKER_DIR"

echo "📁 Working directory: $DOCKER_DIR"
echo

# Check if development compose file exists
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ docker-compose.dev.yml not found in $DOCKER_DIR"
    exit 1
fi

echo "🔧 Starting services..."
echo "This will start:"
echo "  - PostgreSQL database"
echo "  - Redis cache"
echo "  - Backend API"
echo "  - Frontend"
echo "  - Nginx reverse proxy"
echo "  - MailHog email testing server"
echo "  - Adminer database management"
echo

# Start the services
docker-compose -f docker-compose.dev.yml up -d

echo
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo
echo "📊 Service Status:"
echo "=================="

services=("requify-postgres-dev" "requify-redis-dev" "requify-backend-dev" "requify-frontend-dev" "requify-nginx-dev" "requify_mailhog_dev" "requify_adminer_dev")

for service in "${services[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "$service"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
    fi
done

echo
echo "🌐 Service URLs:"
echo "==============="
echo "📱 Frontend:           http://localhost:3000"
echo "🔧 Backend API:        http://localhost:8000"
echo "📖 API Documentation:  http://localhost:8000/docs"
echo "📧 MailHog Web UI:     http://localhost:8025"
echo "🗄️  Adminer (DB):      http://localhost:8080"
echo "🔄 Nginx Proxy:        http://localhost:80"
echo

echo "📧 Email Configuration:"
echo "======================="
echo "SMTP Server: mailhog:1025 (internal)"
echo "Web Interface: http://localhost:8025"
echo "All emails sent by the application will be captured by MailHog"
echo

echo "🧪 Testing Email Setup:"
echo "======================="
echo "1. Register a new user or request password reset"
echo "2. Check MailHog web interface at http://localhost:8025"
echo "3. You should see the email in MailHog's inbox"
echo

echo "🛑 To stop all services:"
echo "docker-compose -f docker-compose.dev.yml down"
echo

echo "📝 To view logs:"
echo "docker-compose -f docker-compose.dev.yml logs -f [service-name]"
echo

echo "✅ Development environment started successfully!" 