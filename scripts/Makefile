# Makefile for Requify project with organized folder structure

.PHONY: help install test lint run clean build dev prod stop logs

# Colors for pretty output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

# Project paths
PROJECT_ROOT := $(shell pwd)/..
BACKEND_DIR := $(PROJECT_ROOT)/backend
FRONTEND_DIR := $(PROJECT_ROOT)/frontend
DEPLOY_DIR := $(PROJECT_ROOT)/deploy
CONFIG_DIR := $(PROJECT_ROOT)/config
DATA_DIR := $(PROJECT_ROOT)/data
DOCS_DIR := $(PROJECT_ROOT)/docs

help:	## Show this help message
	@echo "$(GREEN)Requify Development Commands$(RESET)"
	@echo "$(YELLOW)Project Structure:$(RESET)"
	@echo "  backend/     - FastAPI backend"
	@echo "  frontend/    - React frontend"
	@echo "  deploy/      - Docker & deployment configs"
	@echo "  config/      - Configuration files"
	@echo "  scripts/     - Build & utility scripts"
	@echo "  docs/        - Documentation"
	@echo "  data/        - Data storage (logs, uploads, etc.)"
	@echo ""
	@echo "$(YELLOW)Available Commands:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# =============================================================================
# Local Development (without Docker)
# =============================================================================

install:	## Install backend dependencies
	cd $(BACKEND_DIR) && poetry install --with dev

install-frontend:	## Install frontend dependencies
	cd $(FRONTEND_DIR) && npm install

test:	## Run backend tests
	cd $(BACKEND_DIR) && poetry run pytest -v

test-cov:	## Run tests with coverage
	cd $(BACKEND_DIR) && poetry run pytest --cov=app --cov-report=html --cov-report=term

test-frontend:	## Run frontend tests
	cd $(FRONTEND_DIR) && npm test

lint:	## Run backend linting
	cd $(BACKEND_DIR) && poetry run black app/
	cd $(BACKEND_DIR) && poetry run isort app/
	cd $(BACKEND_DIR) && poetry run flake8 app/
	cd $(BACKEND_DIR) && poetry run mypy app/

lint-frontend:	## Run frontend linting
	cd $(FRONTEND_DIR) && npm run lint

format:	## Format backend code
	cd $(BACKEND_DIR) && poetry run black app/
	cd $(BACKEND_DIR) && poetry run isort app/

format-frontend:	## Format frontend code
	cd $(FRONTEND_DIR) && npm run format

run-backend:	## Run backend locally
	cd $(BACKEND_DIR) && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-frontend:	## Run frontend locally
	cd $(FRONTEND_DIR) && npm run dev

clean:	## Clean cache files
	find $(BACKEND_DIR) -type f -name "*.pyc" -delete
	find $(BACKEND_DIR) -type d -name "__pycache__" -delete
	find $(BACKEND_DIR) -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf $(BACKEND_DIR)/.coverage $(BACKEND_DIR)/htmlcov/ $(BACKEND_DIR)/.pytest_cache/
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/.vite

# =============================================================================
# Docker Development
# =============================================================================

dev:	## Start development environment with Docker
	@echo "$(GREEN)🚀 Starting development environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Development environment started!$(RESET)"
	@echo "$(YELLOW)Backend:$(RESET)  http://localhost:8000"
	@echo "$(YELLOW)Frontend:$(RESET) http://localhost:3000"
	@echo "$(YELLOW)API Docs:$(RESET) http://localhost:8000/docs"
	@echo "$(YELLOW)Adminer:$(RESET)  http://localhost:8080"
	@echo "$(YELLOW)MailHog:$(RESET)  http://localhost:8025"

dev-build:	## Rebuild and start development environment
	@echo "$(YELLOW)🔨 Rebuilding development environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml up -d --build

dev-logs:	## Show development logs
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml logs -f

dev-shell-backend:	## Open shell in backend container
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend bash

dev-shell-frontend:	## Open shell in frontend container
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec frontend sh

dev-shell-db:	## Open PostgreSQL shell
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d requify-db

dev-stop:	## Stop development environment
	@echo "$(RED)🛑 Stopping development environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml down

dev-clean:	## Stop and remove development containers with volumes
	@echo "$(RED)🧹 Cleaning development environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

# =============================================================================
# Docker Production
# =============================================================================

prod:	## Start production environment
	@echo "$(GREEN)🚀 Starting production environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production environment started!$(RESET)"

prod-build:	## Build and start production environment
	@echo "$(YELLOW)🔨 Building production environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.prod.yml up -d --build

prod-logs:	## Show production logs
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.prod.yml logs -f

prod-stop:	## Stop production environment
	@echo "$(RED)🛑 Stopping production environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.prod.yml down

prod-clean:	## Stop and remove production containers
	@echo "$(RED)🧹 Cleaning production environment...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.prod.yml down --remove-orphans

# =============================================================================
# Database Operations
# =============================================================================

db-migrate:	## Run database migrations
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend alembic upgrade head

db-migration:	## Create new migration (use: make db-migration message="description")
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend alembic revision --autogenerate -m "$(message)"

db-seed:	## Seed database with initial data
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend python -m scripts.seed_db

db-backup:	## Backup database
	@echo "$(YELLOW)📦 Creating database backup...$(RESET)"
	mkdir -p $(DATA_DIR)/backups
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres requify-db > $(DATA_DIR)/backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup created in data/backups/ directory$(RESET)"

db-restore:	## Restore database from backup (use: make db-restore file=backup.sql)
	@echo "$(YELLOW)📥 Restoring database from $(file)...$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d requify-db < $(DATA_DIR)/backups/$(file)
	@echo "$(GREEN)✅ Database restored$(RESET)"

# =============================================================================
# Testing in Docker
# =============================================================================

test-docker:	## Run backend tests in Docker
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend pytest -v

test-frontend-docker:	## Run frontend tests in Docker
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec frontend npm test

test-integration:	## Run integration tests
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend pytest tests/integration/ -v

test-api:	## Run API tests using PowerShell script
	@echo "$(YELLOW)🧪 Running API tests...$(RESET)"
	cd $(PROJECT_ROOT) && powershell -ExecutionPolicy Bypass -File scripts/test_api_endpoints.ps1

# =============================================================================
# Monitoring & Maintenance
# =============================================================================

logs:	## Show logs for all services
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml logs -f --tail=100

logs-backend:	## Show backend logs
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml logs -f backend

logs-frontend:	## Show frontend logs
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml logs -f frontend

logs-db:	## Show database logs
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml logs -f postgres

status:	## Show status of all containers
	@echo "$(GREEN)📊 Container Status:$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml ps

health:	## Check health of all services
	@echo "$(GREEN)🏥 Health Check:$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec backend curl -f http://localhost:8000/health || echo "Backend: $(RED)❌ Unhealthy$(RESET)"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec frontend curl -f http://localhost || echo "Frontend: $(RED)❌ Unhealthy$(RESET)"

stats:	## Show container resource usage
	docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# =============================================================================
# Security & Maintenance
# =============================================================================

security-scan:	## Scan for security vulnerabilities
	@echo "$(YELLOW)🔍 Scanning for security vulnerabilities...$(RESET)"
	cd $(BACKEND_DIR) && poetry run safety check
	docker run --rm -v $(PROJECT_ROOT):/app -w /app aquasec/trivy:latest fs .

update-deps:	## Update dependencies
	@echo "$(YELLOW)📦 Updating dependencies...$(RESET)"
	cd $(BACKEND_DIR) && poetry update
	cd $(FRONTEND_DIR) && npm update
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml pull

cleanup:	## Remove unused Docker resources
	@echo "$(YELLOW)🧹 Cleaning up Docker resources...$(RESET)"
	docker system prune -f
	docker volume prune -f
	docker image prune -f

# =============================================================================
# Quick Development Workflows
# =============================================================================

fresh-start:	## Clean start development environment
	make dev-clean
	make dev-build
	make db-migrate
	make db-seed

reset-db:	## Reset database with fresh data
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"requify-db\";"
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "CREATE DATABASE \"requify-db\";"
	make db-migrate
	make db-seed

# =============================================================================
# Build Operations
# =============================================================================

build-backend:	## Build backend Docker image
	cd $(PROJECT_ROOT) && docker build -f deploy/docker/backend/Dockerfile.prod -t requify-backend:latest .

build-frontend:	## Build frontend Docker image
	cd $(PROJECT_ROOT) && docker build -f deploy/docker/frontend/Dockerfile.prod -t requify-frontend:latest .

build-all:	## Build all Docker images
	make build-backend
	make build-frontend

# =============================================================================
# Documentation
# =============================================================================

docs-serve:	## Serve documentation locally
	@echo "$(GREEN)📚 Serving documentation...$(RESET)"
	@echo "$(YELLOW)Available docs:$(RESET)"
	@echo "  - $(DOCS_DIR)/README.md"
	@echo "  - $(DOCS_DIR)/DOCKER_GUIDE.md"
	@echo "  - $(DOCS_DIR)/analysis_report_requify_tz.md"

# =============================================================================
# CI/CD Commands
# =============================================================================

ci-test:	## Run tests for CI/CD
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml up -d postgres redis
	sleep 10
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml run --rm backend pytest -v --cov=app
	cd $(DEPLOY_DIR)/docker && docker compose -f docker-compose.dev.yml down

ci-build:	## Build images for CI/CD
	make build-all

ci-lint:	## Run all linting for CI/CD
	make lint
	make lint-frontend

# =============================================================================
# Environment Setup
# =============================================================================

setup-dev:	## Setup development environment
	@echo "$(GREEN)🔧 Setting up development environment...$(RESET)"
	mkdir -p $(DATA_DIR)/{logs,uploads,backups,static}
	cp $(DEPLOY_DIR)/env/.env.dev.example $(PROJECT_ROOT)/.env
	@echo "$(GREEN)✅ Development environment setup complete!$(RESET)"
	@echo "$(YELLOW)Next steps:$(RESET)"
	@echo "1. Edit .env file with your settings"
	@echo "2. Run: make dev"
	@echo "3. Run: make db-migrate && make db-seed"

setup-prod:	## Setup production environment
	@echo "$(GREEN)🔧 Setting up production environment...$(RESET)"
	mkdir -p $(DATA_DIR)/{logs,uploads,backups,static}
	cp $(DEPLOY_DIR)/env/.env.prod.example $(PROJECT_ROOT)/.env.prod
	@echo "$(GREEN)✅ Production environment setup complete!$(RESET)"
	@echo "$(RED)⚠️  IMPORTANT:$(RESET) Edit .env.prod and change all passwords!" 