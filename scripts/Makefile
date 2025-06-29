# Makefile for Requify project - Windows Compatible

.PHONY: help commands install test lint run clean build dev prod stop logs

help:	## Show this help message
	@echo "==============================================="
	@echo "          Requify Development Commands"
	@echo "==============================================="
	@echo ""
	@echo "Project Structure:"
	@echo "  backend/     - FastAPI backend"
	@echo "  frontend/    - React frontend"
	@echo "  deploy/      - Docker & deployment configs"
	@echo "  config/      - Configuration files"
	@echo "  scripts/     - Build & utility scripts"
	@echo "  docs/        - Documentation"
	@echo "  data/        - Data storage"
	@echo ""
	@echo "Available Commands:"
	@echo "==================="
	@echo ""
	@echo "DEVELOPMENT:"
	@echo "  dev                - Start development environment"
	@echo "  dev-build          - Rebuild and start development environment"
	@echo "  dev-stop           - Stop development environment"
	@echo "  dev-clean          - Stop and remove development containers with volumes"
	@echo "  dev-logs           - Show development logs"
	@echo "  restart-frontend   - Restart frontend service"
	@echo "  restart-backend    - Restart backend service"
	@echo ""
	@echo "DATABASE:"
	@echo "  db-migrate         - Run database migrations"
	@echo "  db-migration       - Create new migration (use: make db-migration message='your message')"
	@echo "  db-seed            - Seed database with initial data"
	@echo "  db-clear           - Clear all data from database"
	@echo ""
	@echo "TESTING:"
	@echo "  test               - Run backend tests locally"
	@echo "  test-frontend      - Run frontend tests locally"
	@echo "  test-docker        - Run backend tests in Docker"
	@echo "  test-frontend-docker - Run frontend tests in Docker"
	@echo ""
	@echo "LINTING:"
	@echo "  lint               - Run backend linting"
	@echo "  lint-frontend      - Run frontend linting"
	@echo ""
	@echo "INSTALLATION:"
	@echo "  install            - Install backend dependencies"
	@echo "  install-frontend   - Install frontend dependencies"
	@echo ""
	@echo "LOCAL DEVELOPMENT:"
	@echo "  run-backend        - Run backend locally (without Docker)"
	@echo "  run-frontend       - Run frontend locally (without Docker)"
	@echo ""
	@echo "PRODUCTION:"
	@echo "  prod               - Start production environment"
	@echo "  prod-build         - Build and start production environment"
	@echo "  prod-stop          - Stop production environment"
	@echo ""
	@echo "MONITORING:"
	@echo "  logs               - Show logs for all services"
	@echo "  logs-backend       - Show backend logs"
	@echo "  logs-frontend      - Show frontend logs"
	@echo "  status             - Show status of all containers"
	@echo ""
	@echo "EMAIL & SMTP:"
	@echo "  email-setup        - Interactive SMTP configuration setup"
	@echo "  email-dev          - Start development environment with MailHog"
	@echo "  email-test         - Test email configuration"
	@echo "  email-mailhog      - Test MailHog email setup"
	@echo ""
	@echo "UTILITIES:"
	@echo "  shell-backend      - Open shell in backend container"
	@echo "  shell-frontend     - Open shell in frontend container"
	@echo "  shell-db           - Open PostgreSQL shell"
	@echo "  clean              - Clean Docker resources"
	@echo "  setup              - Setup development environment"
	@echo "  fresh              - Fresh start development environment"
	@echo ""
	@echo "==============================================="
	@echo "Common Workflows:"
	@echo "  First time:    make setup && make email-dev && make db-migrate"
	@echo "  Daily dev:     make email-dev"
	@echo "  Email testing: make email-dev && make email-test"
	@echo "  Fresh start:   make fresh"
	@echo "  Stop all:      make dev-stop"
	@echo "==============================================="

commands: help	## Alias for help command

# =============================================================================
# Local Development (without Docker)
# =============================================================================

install:	## Install backend dependencies
	cd ../backend && poetry install --with dev

install-frontend:	## Install frontend dependencies
	cd ../frontend && npm install

test:	## Run backend tests
	cd ../backend && poetry run pytest -v

test-frontend:	## Run frontend tests
	cd ../frontend && npm test

lint:	## Run backend linting
	cd ../backend && poetry run black app/
	cd ../backend && poetry run isort app/

lint-frontend:	## Run frontend linting
	cd ../frontend && npm run lint

run-backend:	## Run backend locally
	cd ../backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-frontend:	## Run frontend locally
	cd ../frontend && npm run dev

# =============================================================================
# Docker Development
# =============================================================================

dev:	## Start development environment with Docker
	@echo "Starting development environment..."
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Backend:  http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"

dev-build:	## Rebuild and start development environment
	@echo "Rebuilding development environment..."
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml up -d --build

dev-logs:	## Show development logs
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml logs -f

dev-stop:	## Stop development environment
	@echo "Stopping development environment..."
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml down

dev-clean:	## Stop and remove development containers with volumes
	@echo "Cleaning development environment..."
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml down -v --remove-orphans

restart-frontend:	## Restart frontend service
	@echo "Restarting frontend service..."
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml restart frontend

restart-backend:	## Restart backend service
	@echo "Restarting backend service..."
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml restart backend

# =============================================================================
# Docker Production
# =============================================================================

prod:	## Start production environment
	@echo "Starting production environment..."
	cd ../deploy/docker && docker compose -f docker-compose.prod.yml up -d

prod-build:	## Build and start production environment
	@echo "Building production environment..."
	cd ../deploy/docker && docker compose -f docker-compose.prod.yml up -d --build

prod-stop:	## Stop production environment
	cd ../deploy/docker && docker compose -f docker-compose.prod.yml down

# =============================================================================
# Database Operations
# =============================================================================

db-migrate:	## Run database migrations
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec backend alembic upgrade head

db-migration:	## Create new migration
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec backend alembic revision --autogenerate -m "$(message)"

db-seed:	## Seed database with initial data
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec backend python -m scripts.seed_db seed

db-clear:	## Clear all data from database
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec backend python -m scripts.seed_db clear

# =============================================================================
# Testing in Docker
# =============================================================================

test-docker:	## Run backend tests in Docker
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec backend pytest -v

test-frontend-docker:	## Run frontend tests in Docker
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec frontend npm test

# =============================================================================
# Monitoring & Maintenance
# =============================================================================

logs:	## Show logs for all services
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml logs -f --tail=100

logs-backend:	## Show backend logs
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml logs -f backend

logs-frontend:	## Show frontend logs
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml logs -f frontend

status:	## Show status of all containers
	@echo "=== Container Status ==="
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "=== Service Health ==="
	@echo "Backend API:    http://localhost:8000"
	@echo "Frontend:       http://localhost:3000"
	@echo "API Docs:       http://localhost:8000/docs"
	@echo "Database Admin: http://localhost:8080"
	@echo "Mail Testing:   http://localhost:8025"

# =============================================================================
# Utility Commands
# =============================================================================

shell-backend:	## Open shell in backend container
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec backend bash

shell-frontend:	## Open shell in frontend container
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec frontend sh

shell-db:	## Open PostgreSQL shell
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d requify-db

clean:	## Clean Docker resources
	docker system prune -f

setup:	## Setup development environment
	@echo "Setting up development environment..."
	@if not exist "../data" mkdir "../data"
	@if not exist "../data/logs" mkdir "../data/logs"
	@if not exist "../data/uploads" mkdir "../data/uploads"
	@if not exist "../data/backups" mkdir "../data/backups"
	@if not exist "../data/static" mkdir "../data/static"
	@echo "Setup complete!"
	@echo "Run: make dev"
	@echo "Then: make db-migrate && make db-seed"

fresh:	## Fresh start development environment
	$(MAKE) dev-clean
	$(MAKE) dev-build
	$(MAKE) db-migrate
	$(MAKE) db-seed 

# =============================================================================
# Email & SMTP Configuration
# =============================================================================

email-setup:	## Interactive SMTP configuration setup
	@echo "Starting interactive SMTP setup..."
	@bash setup-smtp.sh

email-dev:	## Start development environment with MailHog email testing
	@echo "Starting development environment with MailHog email testing..."
	@if [ -f "start-with-email.ps1" ]; then \
		powershell -ExecutionPolicy Bypass -File start-with-email.ps1; \
	elif [ -f "start-with-email.sh" ]; then \
		bash start-with-email.sh; \
	else \
		echo "Email start script not found. Using regular dev environment..."; \
		$(MAKE) dev; \
	fi

email-test:	## Test current email configuration
	@echo "Testing email configuration..."
	cd ../backend && python test_email.py

email-mailhog:	## Test MailHog email setup specifically
	@echo "Testing MailHog email configuration..."
	cd ../backend && python test_mailhog.py

email-status:	## Show email service status and configuration
	@echo "=== Email Service Status ==="
	@echo "MailHog Web UI: http://localhost:8025"
	@echo "Backend API:    http://localhost:8000"
	@echo ""
	@echo "=== Container Status ==="
	cd ../deploy/docker && docker compose -f docker-compose.dev.yml ps 