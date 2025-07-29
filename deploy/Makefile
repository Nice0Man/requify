# Requify Infrastructure Makefile
# Provides convenient commands for managing the development environment

.PHONY: help setup build up down logs clean test restart status health dev prod nginx-reload nginx-test dns-setup dns-cleanup dns-test dns-status

# Configuration
COMPOSE_BASE = docker/docker-compose.base.yml
COMPOSE_DEV = docker/docker-compose.override.yml  
COMPOSE_PROD = docker/docker-compose.prod.yml
PROJECT_NAME = requify

# Default target
help:
	@echo "Requify Development Environment Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  setup          - Initial setup (create dirs, copy env files)"
	@echo "  build          - Build all Docker images"
	@echo "  build-prod     - Build production images"
	@echo ""
	@echo "Development Environment:"
	@echo "  dev            - Start development environment"
	@echo "  dev-build      - Build and start development environment"
	@echo "  dev-down       - Stop development environment"
	@echo ""
	@echo "Production Environment:"
	@echo "  prod           - Start production environment"  
	@echo "  prod-build     - Build and start production environment"
	@echo "  prod-down      - Stop production environment"
	@echo ""
	@echo "Service Management:"
	@echo "  up             - Start all services (development)"
	@echo "  down           - Stop all services"
	@echo "  restart        - Restart all services"
	@echo "  status         - Show service status"
	@echo "  health         - Check service health"
	@echo ""
	@echo "Nginx Management:"
	@echo "  nginx-reload   - Reload nginx configuration"
	@echo "  nginx-test     - Test nginx configuration"
	@echo "  nginx-logs     - Show nginx logs"
	@echo ""
	@echo "DNS Management:"
	@echo "  dns-setup      - Setup local DNS (requires admin rights)"
	@echo "  dns-cleanup    - Cleanup local DNS settings"
	@echo "  dns-test       - Test DNS resolution"
	@echo "  dns-status     - Show DNS status"
	@echo ""
	@echo "Development Tools:"
	@echo "  logs           - Show all logs (CTRL+C to exit)"
	@echo "  logs-app       - Show backend logs"
	@echo "  logs-web       - Show frontend logs"
	@echo "  logs-nginx     - Show nginx logs"
	@echo ""
	@echo "Database:"
	@echo "  db-shell       - Open PostgreSQL shell"
	@echo "  db-migrate     - Run database migrations"
	@echo "  db-migration   - Create new database migration (use: make db-migration message='your message')"
	@echo "  db-seed        - Seed database with initial data"
	@echo "  db-reset       - Reset database"
	@echo ""
	@echo "Testing:"
	@echo "  test           - Run all tests"
	@echo "  test-backend   - Run backend tests"
	@echo "  test-frontend  - Run frontend tests"
	@echo ""
	@echo "Utilities:"
	@echo "  clean          - Clean up containers and volumes"
	@echo "  info           - Show system information"

# =============================================================================
# DNS Management
# =============================================================================

dns-setup:	## Setup local DNS domains (requires admin/sudo)
	@echo "Setting up local DNS for Requify..."
	@if [ "$(OS)" = "Windows_NT" ]; then \
		echo "Run PowerShell as Administrator and execute:"; \
		echo "cd $(PWD)/scripts && ./setup-dns.ps1"; \
	else \
		echo "Running DNS setup script..."; \
		cd scripts && sudo bash setup-dns.sh setup; \
	fi

dns-cleanup:	## Cleanup local DNS settings
	@echo "Cleaning up local DNS settings..."
	@if [ "$(OS)" = "Windows_NT" ]; then \
		echo "Run PowerShell as Administrator and execute:"; \
		echo "cd $(PWD)/scripts && ./setup-dns.ps1 cleanup"; \
	else \
		cd scripts && sudo bash setup-dns.sh cleanup; \
	fi

dns-test:	## Test DNS resolution
	@echo "Testing DNS resolution..."
	@echo "Testing requify.local..."
	@nslookup requify.local || echo "ERROR: requify.local not resolved"
	@echo "Testing api.requify.local..."
	@nslookup api.requify.local || echo "ERROR: api.requify.local not resolved"
	@echo "Testing cdn.requify.local..."
	@nslookup cdn.requify.local || echo "ERROR: cdn.requify.local not resolved"

dns-status:	## Show DNS container status
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) ps dnsmasq
	@echo ""
	@echo "DNS Logs:"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs dnsmasq --tail=10 

# =============================================================================
# Development Environment
# =============================================================================

dev:	## Start development environment with automatic setup
	@echo "Starting Requify Development Environment"
	@echo "========================================"
	@echo ""
	@echo "Pre-flight checks..."
	@docker --version >nul 2>&1 || (echo "ERROR: Docker not found! Please install Docker" && exit 1)
	@docker compose version >nul 2>&1 || (echo "ERROR: Docker Compose not found!" && exit 1)
	@echo "OK: Docker"
	@echo "Checking configurations..."
	@if not exist "docker\.env" ( \
		echo "Creating docker/.env from example..." && \
		copy docker.env.example docker\.env >nul \
	)
	@if not exist "..\backend\README.md" ( \
		echo "Creating backend/README.md..." && \
		echo # Requify Backend > ..\backend\README.md \
	)
	@echo "OK: Configurations"
	@echo "Testing nginx configuration..."
	@if exist "nginx\nginx.local.conf" ( \
		echo "OK: Using local DNS configuration" \
	) else ( \
		echo "WARNING: Using standard configuration" \
	)
	@echo "Creating directories..."
	@if not exist "..\data\logs" mkdir ..\data\logs >nul 2>&1
	@if not exist "..\data\uploads" mkdir ..\data\uploads >nul 2>&1
	@if not exist "..\data\backups" mkdir ..\data\backups >nul 2>&1
	@if not exist "..\data\static" mkdir ..\data\static >nul 2>&1
	@if not exist "docker\dnsmasq" mkdir docker\dnsmasq >nul 2>&1
	@if not exist "docker\scripts" mkdir docker\scripts >nul 2>&1
	@echo "OK: Directories"
	@echo "Stopping existing containers..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) down >nul 2>&1 || echo >nul
	@echo "OK: Cleanup"
	@echo ""
	@echo "Starting services..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) up -d
	@echo ""
	@echo "Waiting for services to start..."
	@timeout /t 10 >nul 2>&1 || sleep 10
	@echo ""
	@echo "Service Status:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) ps
	@echo ""
	@echo "Development environment is starting!"
	@echo ""
	@echo "Available Services:"
	@echo "   Frontend:     http://localhost:3000"
	@echo "   Backend API:  http://localhost:8000"
	@echo "   API Docs:     http://localhost:8000/docs"
	@echo "   Database:     http://localhost:8080 (Adminer)"
	@echo "   Mail:         http://localhost:8025 (MailHog)"
	@echo "   Storage:      http://localhost:9001 (MinIO)"
	@echo ""
	@echo "DNS Domains (if configured):"
	@echo "   Main:         http://requify.local"
	@echo "   API:          http://api.requify.local"
	@echo "   CDN:          http://cdn.requify.local"
	@echo "   Admin:        http://admin.requify.local"
	@echo "   Docs:         http://docs.requify.local"
	@echo ""
	@echo "Setup DNS: make dns-setup (requires admin rights)"
	@echo "Status: make status"
	@echo "Logs: make logs"

dev-build:	## Build and start development environment
	@echo "Building and starting development environment..."
	@$(MAKE) dev-down
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) build --no-cache
	@$(MAKE) dev

dev-down:	## Stop development environment
	@echo "Stopping development environment..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) down
	@echo "Development environment stopped"

# =============================================================================
# Production Environment  
# =============================================================================

prod:	## Start production environment with automatic setup
	@echo "Starting Requify Production Environment"
	@echo "======================================"
	@echo ""
	@echo "Pre-flight checks..."
	@docker --version >nul 2>&1 || (echo "ERROR: Docker not found! Please install Docker" && exit 1)
	@docker compose version >nul 2>&1 || (echo "ERROR: Docker Compose not found!" && exit 1)
	@echo "OK: Docker"
	@echo "Checking production configurations..."
	@if not exist "docker\.env.prod" ( \
		echo "Creating docker/.env.prod from example..." && \
		copy docker\.env docker\.env.prod >nul 2>&1 || copy docker.env.example docker\.env.prod >nul && \
		echo "WARNING: Please review docker/.env.prod for production settings" \
	)
	@if not exist "..\backend\README.md" ( \
		echo "Creating backend/README.md..." && \
		echo # Requify Backend > ..\backend\README.md \
	)
	@echo "OK: Configurations"
	@echo "Testing nginx production configuration..."
	@if exist "nginx\nginx.prod.conf" ( \
		echo "OK: Using production configuration" \
	) else ( \
		echo "WARNING: Production config not found, using standard" \
	)
	@echo "Creating production directories..."
	@if not exist "..\data\logs" mkdir ..\data\logs >nul 2>&1
	@if not exist "..\data\uploads" mkdir ..\data\uploads >nul 2>&1
	@if not exist "..\data\backups" mkdir ..\data\backups >nul 2>&1
	@if not exist "..\data\static" mkdir ..\data\static >nul 2>&1
	@if not exist "..\data\ssl" mkdir ..\data\ssl >nul 2>&1
	@if not exist "..\data\monitoring" mkdir ..\data\monitoring >nul 2>&1
	@echo "OK: Directories"
	@echo "Checking SSL certificates..."
	@if exist "..\data\ssl\cert.pem" if exist "..\data\ssl\key.pem" ( \
		echo "OK: SSL certificates found" \
	) else ( \
		echo "WARNING: SSL certificates not found in ../data/ssl/" && \
		echo "   For HTTPS, place cert.pem and key.pem in ../data/ssl/" \
	)
	@echo "Stopping existing containers..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down >nul 2>&1 || echo >nul
	@echo "OK: Cleanup"
	@echo ""
	@echo "Starting production services..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) up -d
	@echo ""
	@echo "Waiting for services to start..."
	@timeout /t 15 >nul 2>&1 || sleep 15
	@echo ""
	@echo "Production Service Status:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) ps
	@echo ""
	@echo "Production environment is running!"
	@echo ""
	@echo "Production Services:"
	@echo "   Website:      http://localhost"
	@echo "   API:          http://localhost/api/"
	@echo "   CDN:          http://localhost/cdn/"
	@echo "   Monitoring:   http://localhost:3001 (if enabled)"
	@echo ""
	@echo "Important Production Notes:"
	@echo "   - Review environment variables in docker/.env.prod"
	@echo "   - Setup SSL certificates for HTTPS"
	@echo "   - Configure domain DNS for production domains"
	@echo "   - Review security settings"
	@echo ""
	@echo "Monitor: make status"
	@echo "Logs: make logs"

prod-build:	## Build and start production environment
	@echo "Building and starting production environment..."
	@$(MAKE) prod-down
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) build --no-cache
	@$(MAKE) prod

prod-down:	## Stop production environment
	@echo "Stopping production environment..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down
	@echo "Production environment stopped"

# Legacy aliases (development by default)
up: dev	## Alias for dev
down: dev-down	## Alias for dev-down

# =============================================================================
# Build Commands
# =============================================================================

build:	## Build development images
	@echo "Building development images..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) build

build-prod:	## Build production images
	@echo "Building production images..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) build --no-cache

setup:	## Initial setup (create dirs, copy env files, setup DNS)
	@echo "Setting up Requify development environment..."
	@echo "Creating required directories..."
	@mkdir -p ../data/logs ../data/uploads ../data/backups ../data/static
	@mkdir -p docker/dnsmasq docker/scripts
	@echo ""
	@echo "Copying environment files..."
	@if [ ! -f "docker/.env" ]; then cp docker.env.example docker/.env; fi
	@if [ ! -f "nginx/.env" ]; then cp nginx/.env.example nginx/.env 2>/dev/null || true; fi
	@echo ""
	@echo "Setting up file permissions..."
	@chmod +x scripts/setup-dns.sh 2>/dev/null || true
	@chmod +x scripts/setup-dns.ps1 2>/dev/null || true
	@echo ""
	@echo "Basic setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Setup local DNS (requires admin rights):"
	@echo "   make dns-setup"
	@echo ""
	@echo "2. Start development environment:"
	@echo "   make dev"
	@echo ""
	@echo "3. Test the setup:"
	@echo "   make dns-test"

# =============================================================================
# Service Management
# =============================================================================

restart:	## Restart all services
	@echo "Restarting all services..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) restart

restart-backend:	## Restart backend
	@echo "Restarting backend..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) restart backend

restart-frontend:	## Restart frontend
	@echo "Restarting frontend..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) restart frontend

status:	## Show service status
	@echo "Service Status:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) ps

health:	## Check service health
	@echo "Health Checks:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

shell-backend:	## Open backend shell
	@echo "Opening backend shell..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend bash

shell-frontend:	## Open frontend shell
	@echo "Opening frontend shell..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec frontend bash

shell-postgres:	## Open postgres shell
	@echo "Opening postgres shell..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec postgres bash

shell-redis:	## Open redis shell
	@echo "Opening redis shell..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec redis bash
# =============================================================================
# Nginx Management  
# =============================================================================

nginx-reload:	## Reload nginx configuration
	@echo "Reloading nginx configuration..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec nginx nginx -s reload

nginx-test:	## Test nginx configuration
	@echo "Testing nginx configuration..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec nginx nginx -t

nginx-logs:	## Show nginx logs
	@echo "Nginx logs:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs nginx --tail=50 -f

# =============================================================================
# Logging
# =============================================================================

logs:	## Show all logs
	@echo "All service logs:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f

logs-app:	## Show backend logs
	@echo "Backend logs:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs backend --tail=50 -f

logs-web:	## Show frontend logs
	@echo "Frontend logs:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs frontend --tail=50 -f

logs-nginx:	## Show nginx logs
	@echo "Nginx logs:"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs nginx --tail=50 -f

# =============================================================================
# Database Operations
# =============================================================================

db-shell:	## Open PostgreSQL shell
	@echo "Opening PostgreSQL shell..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec postgres psql -U postgres -d requify-db

db-migrate:	## Run database migrations
	@echo "Running database migrations..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend alembic upgrade head

db-migration:	## Create new database migration
	@echo "Creating new database migration $(message)"
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend alembic revision --autogenerate -m "$(message)"

db-seed:	## Seed database with initial data
	@echo "Seeding database with initial data..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend python -m scripts.seed_db seed

db-clear:	## Clear database
	@echo "Clearing database..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend python -m scripts.seed_db clear

db-reset:	## Reset database
	@echo "Resetting database..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend alembic downgrade base
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend alembic upgrade head

# =============================================================================
# Testing
# =============================================================================

test:	## Run all tests
	@echo "Running all tests..."
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

test-backend:	## Run backend tests  
	@echo "Running backend tests..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec backend pytest

test-frontend:	## Run frontend tests
	@echo "Running frontend tests..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec frontend npm test

# =============================================================================
# Cleanup
# =============================================================================

clean:	## Clean up containers and volumes
	@echo "Cleaning up Docker resources..."
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) down -v --remove-orphans
	@docker system prune -f
	@echo "Cleanup completed"

# =============================================================================
# System Information
# =============================================================================

info:	## Show system information
	@echo "System Information:"
	@echo "=================="
	@echo "Docker Version:"
	@docker --version
	@echo ""
	@echo "Docker Compose Version:"
	@docker compose version
	@echo ""
	@echo "Project Configuration:"
	@echo "  Project Name: $(PROJECT_NAME)"
	@echo "  Base Compose: $(COMPOSE_BASE)"
	@echo "  Dev Compose:  $(COMPOSE_DEV)"
	@echo "  Prod Compose: $(COMPOSE_PROD)"
	@echo ""
	@echo "File Locations:"
	@echo "  deploy/docker/docker-compose.base.yml    - Base services"
	@echo "  deploy/docker/docker-compose.override.yml - Development overrides"
	@echo "  deploy/docker/docker-compose.prod.yml    - Production overrides"
	@echo "  deploy/nginx/nginx.conf                   - Development nginx config"  
	@echo "  deploy/nginx/nginx.prod.conf              - Production nginx config" 