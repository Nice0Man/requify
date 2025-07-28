# Requify Infrastructure Makefile
# Provides convenient commands for managing the development environment

.PHONY: help setup build up down logs clean test restart status health

# Default target
help:
	@echo "🚀 Requify Development Environment Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  setup      - Initial setup (create dirs, copy env files)"
	@echo "  build      - Build all Docker images"
	@echo ""
	@echo "Service Management:"
	@echo "  up         - Start all services"
	@echo "  down       - Stop all services"
	@echo "  restart    - Restart all services"
	@echo "  status     - Show service status"
	@echo "  health     - Check service health"
	@echo ""
	@echo "Development:"
	@echo "  logs       - Show all logs (CTRL+C to exit)"
	@echo "  logs-app   - Show backend logs"
	@echo "  logs-web   - Show frontend logs"
	@echo "  logs-nginx - Show nginx logs"
	@echo ""
	@echo "Database:"
	@echo "  db-shell   - Open PostgreSQL shell"
	@echo "  db-migrate - Run database migrations"
	@echo "  db-reset   - Reset database (WARNING: destroys data)"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean      - Clean up containers and images"
	@echo "  prune      - Clean system (containers, networks, volumes)"
	@echo "  test       - Run tests"

# Setup development environment
setup:
	@echo "📁 Creating data directories..."
	@mkdir -p ../data/{postgres,postgres-test,redis,redis-cdn,minio,nginx-cache,nginx-logs,logs,uploads,static}
	@echo "📋 Setting up environment files..."
	@cp -n docker.env.example docker/.env 2>/dev/null || echo "docker/.env already exists"
	@cp -n ../backend/env.example ../backend/.env 2>/dev/null || echo "backend/.env already exists"
	@echo "✅ Setup complete!"

# Build all images
build:
	@echo "🔨 Building application images..."
	@cd docker && docker-compose build --no-cache

# Start all services
up: setup
	@echo "🚀 Starting development environment..."
	@cd docker && docker-compose up -d
	@echo "⏳ Waiting for services to start..."
	@sleep 10
	@$(MAKE) health

# Stop all services
down:
	@echo "🛑 Stopping all services..."
	@cd docker && docker-compose down

# Restart all services
restart: down up

# Show service status
status:
	@echo "📊 Service Status:"
	@cd docker && docker-compose ps

# Health check
health:
	@echo "🔍 Checking service health..."
	@echo "Database:"
	@docker exec requify_postgres pg_isready -U postgres -d requify-db || echo "❌ PostgreSQL not ready"
	@echo "Redis:"
	@docker exec requify_redis redis-cli ping || echo "❌ Redis not ready"
	@echo "Backend API:"
	@curl -s http://localhost:8000/health > /dev/null && echo "✅ Backend ready" || echo "❌ Backend not ready"
	@echo "Frontend:"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend ready" || echo "❌ Frontend not ready"
	@echo "MinIO:"
	@curl -s http://localhost:9000/minio/health/live > /dev/null && echo "✅ MinIO ready" || echo "❌ MinIO not ready"

# Show logs
logs:
	@cd docker && docker-compose logs -f

logs-app:
	@cd docker && docker-compose logs -f app

logs-web:
	@cd docker && docker-compose logs -f frontend

logs-nginx:
	@cd docker && docker-compose logs -f nginx

# Database operations
db-shell:
	@echo "🐘 Opening PostgreSQL shell (password: postgres)..."
	@docker exec -it requify_postgres psql -U postgres -d requify-db

db-migrate:
	@echo "🔄 Running database migrations..."
	@docker exec requify_app alembic upgrade head

db-reset:
	@echo "⚠️  This will destroy all data. Are you sure? [y/N]"
	@read answer && [ "$$answer" = "y" ] || exit 1
	@cd docker && docker-compose down -v
	@docker volume rm requify_postgres_data requify_postgres_test_data || true
	@$(MAKE) up

# Testing
test:
	@echo "🧪 Running tests..."
	@docker exec requify_app pytest

test-coverage:
	@echo "📊 Running tests with coverage..."
	@docker exec requify_app pytest --cov=app --cov-report=html

# Cleanup
clean:
	@echo "🧹 Cleaning up stopped containers..."
	@docker container prune -f
	@docker image prune -f

prune:
	@echo "⚠️  This will remove all unused containers, networks, and volumes!"
	@echo "Are you sure? [y/N]"
	@read answer && [ "$$answer" = "y" ] || exit 1
	@docker system prune -a --volumes -f

# Development helpers
shell-app:
	@echo "🐚 Opening backend shell..."
	@docker exec -it requify_app bash

shell-web:
	@echo "🐚 Opening frontend shell..."
	@docker exec -it requify_frontend sh

# Quick development commands
dev: setup up
	@echo "🎯 Development environment is ready!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# Production build
prod-build:
	@echo "🏭 Building production images..."
	@cd docker && docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Initialize MinIO buckets
init-minio:
	@echo "🪣 Initializing MinIO buckets..."
	@cd docker && docker-compose --profile init up mc

# Backup database
backup-db:
	@echo "💾 Creating database backup..."
	@mkdir -p ../data/backups
	@docker exec requify_postgres pg_dump -U postgres requify-db > ../data/backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup saved to data/backups/"

# Monitor resources
monitor:
	@echo "📈 Monitoring container resources..."
	@docker stats

# Update all base images
update:
	@echo "🔄 Updating base images..."
	@cd docker && docker-compose pull
	@$(MAKE) build
	@echo "✅ Images updated!" 