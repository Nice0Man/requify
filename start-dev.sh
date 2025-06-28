#!/bin/bash

# Requify Development Environment Startup Script
# This script starts the development environment with proper nginx configuration

echo "🚀 Starting Requify Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Set environment variables
export COMPOSE_PROJECT_NAME=requify-dev
export FRONTEND_PORT=3000
export BACKEND_PORT=8000
export NGINX_PORT=80

echo "📋 Configuration:"
echo "   Frontend: http://localhost:${FRONTEND_PORT}"
echo "   Backend: http://localhost:${BACKEND_PORT}"
echo "   Nginx Gateway: http://localhost:${NGINX_PORT}"
echo "   API Documentation: http://localhost/docs"
echo "   API Schema: http://localhost/openapi.json"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
cd deploy/docker
docker-compose -f docker-compose.dev.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
    echo "✅ Backend is ready at http://localhost:${BACKEND_PORT}"
else
    echo "⚠️  Backend is not ready yet"
fi

# Check frontend
if curl -s http://localhost:${FRONTEND_PORT} > /dev/null; then
    echo "✅ Frontend is ready at http://localhost:${FRONTEND_PORT}"
else
    echo "⚠️  Frontend is not ready yet"
fi

# Check nginx
if curl -s http://localhost:${NGINX_PORT}/health > /dev/null; then
    echo "✅ Nginx gateway is ready at http://localhost:${NGINX_PORT}"
else
    echo "⚠️  Nginx gateway is not ready yet"
fi

echo ""
echo "🎉 Requify development environment is starting up!"
echo ""
echo "📍 Access points:"
echo "   🌐 Main App: http://localhost"
echo "   📚 API Docs: http://localhost/docs"
echo "   📋 API Spec: http://localhost/openapi.json"
echo "   🔧 Frontend: http://localhost:3000 (direct)"
echo "   ⚡ Backend: http://localhost:8000 (direct)"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker-compose -f docker-compose.dev.yml down" 