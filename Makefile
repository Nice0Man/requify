# Makefile for Requify project
# Automated Requirements Management System

# Variables
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = requify
ENV_FILE = .env

# No colors for output

.PHONY: help setup build up down restart logs clean test migrate init-db seed-db backup restore

# Help - description of available commands
help:
	@echo "Requify - Requirements Management System"
	@echo "Available commands:"
	@echo ""
	@echo "Main commands:"
	@echo "  make setup          - Initial project setup"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make status         - Show services status"
	@echo ""
	@echo "Database:"
	@echo "  make migrate        - Run Alembic migrations"
	@echo "  make migrate-create - Create new migration"
	@echo "  make migrate-down   - Rollback migration"
	@echo "  make init-db        - Initialize database"
	@echo "  make seed-db        - Populate with test data"
	@echo "  make reset-db       - Reset and recreate DB"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Run in development mode (with Adminer)"
	@echo "  make test           - Run tests"
	@echo "  make test-cov       - Run tests with coverage"
	@echo "  make lint           - Code linting check"
	@echo "  make format         - Code formatting"
	@echo ""
	@echo "Logs and monitoring:"
	@echo "  make logs           - View logs of all services"
	@echo "  make logs-app       - View application logs"
	@echo "  make logs-db        - View database logs"
	@echo "  make logs-nginx     - View Nginx logs"
	@echo ""
	@echo "Backup:"
	@echo "  make backup         - Create database backup"
	@echo "  make restore        - Restore from backup"
	@echo "  make clean          - Clean unused resources"
	@echo ""
	@echo "Production:"
	@echo "  make prod           - Run in production mode"
	@echo "  make deploy         - Deploy application"

# Initial project setup
setup:
	@echo "Setting up Requify project..."
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Copying env.example to .env..."; \
		cp env.example $(ENV_FILE); \
		echo "✓ .env file created"; \
	else \
		echo "✓ .env file already exists"; \
	fi
	@echo "Creating necessary directories..."
	@if not exist logs mkdir logs
	@if not exist uploads mkdir uploads
	@if not exist static mkdir static
	@if not exist backups mkdir backups
	@if not exist monitoring mkdir monitoring
	@if not exist monitoring\data mkdir monitoring\data
	@echo "✓ Directories created"
	@echo "✓ Project setup complete! Now run 'make build && make up'"

# Build Docker images
build:
	@echo "Building Docker images..."
	@docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "✓ Images built"

# Fast build (with cache)
build-fast:
	@echo "Fast building Docker images..."
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "✓ Images built"

# Start all services
up:
	@echo "Starting Requify services..."
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "✓ Services started"
	@echo "Checking status..."
	@timeout /t 5 /nobreak > nul 2>&1 || ping 127.0.0.1 -n 6 > nul
	@make status

# Run in development mode (with Adminer)
dev:
	@echo "Starting in development mode..."
	@docker-compose -f $(COMPOSE_FILE) --profile dev up -d
	@echo "✓ Development mode active"
	@echo "Available services:"
	@echo "  - Application: http://localhost:8000"
	@echo "  - API documentation: http://localhost:8000/docs"
	@echo "  - Adminer: http://localhost:8080"
	@echo "  - Nginx: http://localhost"

# Stop all services
down:
	@echo "Stopping services..."
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "✓ Services stopped"

# Stop with volumes removal
down-volumes:
	@echo "WARNING: Stopping services and removing data..."
	@echo "This will delete all data! Press Ctrl+C to cancel or any key to continue..."
	@pause > nul
	@docker-compose -f $(COMPOSE_FILE) down -v
	@echo "✓ Services stopped, data removed"

# Restart all services
restart:
	@echo "Restarting services..."
	@docker-compose -f $(COMPOSE_FILE) restart
	@echo "✓ Services restarted"

# Restart specific service
restart-app:
	@docker-compose -f $(COMPOSE_FILE) restart app

restart-db:
	@docker-compose -f $(COMPOSE_FILE) restart postgres

restart-nginx:
	@docker-compose -f $(COMPOSE_FILE) restart nginx

# Services status
status:
	@echo "Services status:"
	@docker-compose -f $(COMPOSE_FILE) ps

# Logs of all services
logs:
	@docker-compose -f $(COMPOSE_FILE) logs -f > logs/all.log 2>&1	
	@echo "Logs of all services saved to logs/all.log"
	@echo "--------------------------------"
	cat logs/all.log

# Logs of specific services
logs-app:
	@docker-compose -f $(COMPOSE_FILE) logs -f app  > logs/app.log 2>&1
	@echo "Logs of app service saved to logs/app.log"
	@echo "--------------------------------"
	cat logs/app.log

logs-db:
	@docker-compose -f $(COMPOSE_FILE) logs -f postgres > logs/db.log 2>&1
	@echo "Logs of db service saved to logs/db.log"		
	@echo "--------------------------------"
	cat logs/db.log

logs-nginx:
	@docker-compose -f $(COMPOSE_FILE) logs -f nginx > logs/nginx.log 2>&1
	@echo "Logs of nginx service saved to logs/nginx.log"
	@echo "--------------------------------"
	cat logs/nginx.log
	
logs-redis:
	@docker-compose -f $(COMPOSE_FILE) logs -f redis > logs/redis.log 2>&1	
	@echo "Logs of redis service saved to logs/redis.log"	
	@echo "--------------------------------"
	cat logs/redis.log
# Connect to containers
shell-app:
	@docker-compose -f $(COMPOSE_FILE) exec app bash

shell-db:
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -d requify-db

shell-redis:
	@docker-compose -f $(COMPOSE_FILE) exec redis redis-cli

# Database migrations
migrate:
	@echo "Running migrations..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic upgrade head
	@echo "✓ Migrations applied"

# Create new migration
migrate-create:
	@echo "Enter migration description and press Enter:"
	@set /p message= && docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic revision --autogenerate -m "%message%"

# Rollback migration
migrate-down:
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic downgrade -1

# Migration information
migrate-history:
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic history

migrate-current:
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic current

# Database initialization
init-db:
	@echo "Initializing database..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run python -m requify.scripts.db_utils init
	@echo "✓ Database initialized"

# Populate with test data
seed-db:
	@echo "Populating database with test data..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run python -m requify.scripts.seed_db
	@echo "✓ Test data loaded"

# Reset and recreate DB
reset-db:
	@echo "WARNING: Resetting database..."
	@echo "This will delete all database data! Press Ctrl+C to cancel or any key to continue..."
	@pause > nul
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"requify-db\";"
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -c "CREATE DATABASE \"requify-db\";"
	@make migrate
	@make seed-db
	@echo "✓ Database recreated"

# Testing
test:
	@echo "Running tests..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run pytest

test-cov:
	@echo "Running tests with coverage..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run pytest --cov=requify --cov-report=html --cov-report=term

# Linters and formatting
lint:
	@echo "Checking code with linters..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run black --check .
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run isort --check-only .
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run flake8 .

format:
	@echo "Formatting code..."
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run black .
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run isort .
	@echo "✓ Code formatted"

# Backup
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U postgres requify-db | gzip > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "✓ Backup created in backups/ folder"

# Restore from backup
restore:
	@echo "Restoring from backup..."
	@echo "Available backups:"
	@dir backups\
	@echo "Enter backup file name and press Enter:"
	@set /p backup_file= && gunzip -c backups\%backup_file% | docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U postgres requify-db

# Clean unused resources
clean:
	@echo "Cleaning unused resources..."
	@docker system prune -f
	@docker volume prune -f
	@docker image prune -f
	@echo "✓ Cleanup completed"

# Production mode
prod:
	@echo "Starting in production mode..."
	@docker-compose -f $(COMPOSE_FILE) -f docker-compose.prod.yml up -d
	@echo "✓ Production mode active"

# Deploy application
deploy:
	@echo "Deploying application..."
	@make build
	@make down
	@make up
	@make migrate
	@echo "✓ Deployment completed"

# Health check
health:
	@echo "Checking services health..."
	@curl -f http://localhost:8000/health || echo "Application unavailable"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_isready -U postgres || echo "PostgreSQL unavailable"
	@docker-compose -f $(COMPOSE_FILE) exec redis redis-cli ping || echo "Redis unavailable"

# Resource monitoring
monitor:
	@docker stats $(PROJECT_NAME)_postgres $(PROJECT_NAME)_app $(PROJECT_NAME)_nginx $(PROJECT_NAME)_redis

# Install development dependencies locally
install-dev:
	@echo "Installing development dependencies..."
	@poetry install
	@echo "✓ Dependencies installed"

# Run application locally (without Docker)
run-local:
	@echo "Running application locally..."
	@poetry run uvicorn requify.app.main:app --reload --host 0.0.0.0 --port 8000

# Project information
info:
	@echo "Requify Project Information"
	@echo "Version: 0.1.0"
	@echo "Ports:"
	@echo "  - Application: 8000"
	@echo "  - PostgreSQL: 5432"
	@echo "  - PostgreSQL (test): 5433"
	@echo "  - Redis: 6379"
	@echo "  - Nginx: 80, 443"
	@echo "  - Adminer: 8080" 