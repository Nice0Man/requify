# =============================================================================
# Adaptive Makefile for Requify Project (Windows & UNIX)
# =============================================================================

.PHONY: help install setup db-up db-down db-create db-drop db-reset db-migrate db-upgrade db-downgrade db-revision test test-db clean dev-server check-env

# =============================================================================
# OS DETECTION AND VARIABLES
# =============================================================================

# Detect operating system
ifeq ($(OS),Windows_NT)
    detected_OS := Windows
    SHELL := cmd
    PYTHON := python
        PIP := pip    ALEMBIC := alembic    DOCKER_COMPOSE := docker-compose    DB_CONTAINER := requify-postgres    DB_TEST_CONTAINER := requify-postgres-test        # Windows commands
    COPY_FILE = copy
    MKDIR = if not exist $(1) mkdir $(1)
    RMDIR = if exist $(1) rmdir /s /q $(1) 2>nul
    DEL_FILE = if exist $(1) del $(1) 2>nul
    SLEEP = timeout /t $(1) /nobreak >nul
    PAUSE = pause >nul
    NULL_REDIRECT = >nul 2>&1
    EXISTS_CHECK = if not exist $(1)
    PROMPT = set /p $(1)="$(2): "
    ECHO = @echo
    
    # File operations
    CREATE_ENV = $(COPY_FILE) env.example .env
    CREATE_DIRS = $(call MKDIR,logs) & $(call MKDIR,uploads)
    CLEAN_PYCS = for /r . %%f in (*.pyc) do del "%%f" 2>nul
    CLEAN_PYCACHE = for /d /r . %%d in (__pycache__) do rmdir /s /q "%%d" 2>nul
    
else
    detected_OS := $(shell uname -s)
    SHELL := /bin/bash
    PYTHON := python3
    PIP := pip3
        ALEMBIC := alembic    DOCKER_COMPOSE := docker-compose    DB_CONTAINER := requify-postgres    DB_TEST_CONTAINER := requify-postgres-test
    
    # UNIX commands
    COPY_FILE = cp
    MKDIR = mkdir -p $(1)
    RMDIR = rm -rf $(1)
    DEL_FILE = rm -f $(1)
    SLEEP = sleep $(1)
    PAUSE = read -p "Press any key to continue..."
    NULL_REDIRECT = >/dev/null 2>&1
    EXISTS_CHECK = if [ ! -f $(1) ]; then
    PROMPT = read -p "$(2): " $(1)
    ECHO = @echo
    
    # File operations
    CREATE_ENV = cp env.example .env
    CREATE_DIRS = mkdir -p logs uploads
    CLEAN_PYCS = find . -type f -name "*.pyc" -delete
    CLEAN_PYCACHE = find . -type d -name "__pycache__" -delete
endif

# =============================================================================
# MAIN COMMANDS
# =============================================================================

help: ## Show this help message	$(ECHO) "Requify Project Makefile ($(detected_OS))"	$(ECHO) ""	$(ECHO) "Available commands:"	$(ECHO) "  setup              Full project setup"	$(ECHO) "  install            Install dependencies"	$(ECHO) "  db-up              Start PostgreSQL container"	$(ECHO) "  db-down            Stop PostgreSQL container"	$(ECHO) "  db-status          Check PostgreSQL status"	$(ECHO) "  db-logs            Show PostgreSQL logs"	$(ECHO) "  db-shell           Connect to PostgreSQL via psql"	$(ECHO) "  db-migrate         Apply migrations (sync)"	$(ECHO) "  db-migrate-async   Apply migrations (async)"	$(ECHO) "  db-revision        Create new migration (sync)"	$(ECHO) "  db-revision-async  Create new migration (async)"	$(ECHO) "  db-history         Show migration history"	$(ECHO) "  db-history-async   Show async migration history"	$(ECHO) "  db-current         Show current migration"	$(ECHO) "  db-current-async   Show current async migration"	$(ECHO) "  dev-server         Start development server"	$(ECHO) "  dev-full           Full development setup"	$(ECHO) "  check-db           Check database connection"	$(ECHO) "  check-async-db     Check async database connection"	$(ECHO) "  use-sqlite         Switch to SQLite for Windows development"	$(ECHO) "  use-postgres       Switch to PostgreSQL configuration"	$(ECHO) "  show-db-config     Show current database configuration"	$(ECHO) "  test               Run tests"	$(ECHO) "  clean              Clean temporary files"	$(ECHO) "  backup-db          Create database backup"	$(ECHO) "  docker-up          Start all Docker services"	$(ECHO) "  docker-down        Stop all Docker services"

install: ## Install dependencies
	$(ECHO) "Installing dependencies..."
	poetry install
	$(ECHO) "Dependencies installed successfully!"

setup: install ## Full project setup
	$(ECHO) "Setting up project..."
ifeq ($(detected_OS),Windows)
	@if not exist .env ($(CREATE_ENV)) else echo ".env file already exists"
	@$(CREATE_DIRS)
else
	@if [ ! -f .env ]; then $(CREATE_ENV); else echo ".env file already exists"; fi
	@$(CREATE_DIRS)
endif
	$(ECHO) "Project setup complete!"

check-env: ## Check for .env file
ifeq ($(detected_OS),Windows)
	@if not exist .env (echo ".env file not found! Run 'make setup'" && exit 1)
else
	@if [ ! -f .env ]; then echo ".env file not found! Run 'make setup'"; exit 1; fi
endif

# =============================================================================
# DATABASE MANAGEMENT
# =============================================================================

db-up: ## Start PostgreSQL container
	$(ECHO) "Starting PostgreSQL..."
	$(DOCKER_COMPOSE) up -d db
	$(ECHO) "Waiting for database to be ready..."
ifeq ($(detected_OS),Windows)
	@$(call SLEEP,10)
else
	@$(call SLEEP,10)
endif
	$(ECHO) "PostgreSQL is up and ready!"

db-down: ## Stop PostgreSQL container
	$(ECHO) "Stopping PostgreSQL..."
	$(DOCKER_COMPOSE) down
	$(ECHO) "PostgreSQL stopped!"

db-status: ## Check PostgreSQL status
	$(ECHO) "PostgreSQL status:"
	@$(DOCKER_COMPOSE) ps db

db-logs: ## Show PostgreSQL logs
	$(ECHO) "PostgreSQL logs:"
	$(DOCKER_COMPOSE) logs -f db

db-shell: ## Connect to PostgreSQL via psql
	$(ECHO) "Connecting to PostgreSQL..."
	$(DOCKER_COMPOSE) exec db psql -U postgres -d requify

db-create: db-up ## Create database (if not exists)
	$(ECHO) "Creating database..."
	@$(DOCKER_COMPOSE) exec db psql -U postgres -c "SELECT 1;" $(NULL_REDIRECT) || echo "Database ready"
	$(ECHO) "Database ready!"

db-drop: ## Drop database
	$(ECHO) "WARNING: This will delete all data!"
ifeq ($(detected_OS),Windows)
	$(ECHO) "Are you sure? Press Ctrl+C to cancel, or any key to continue..."
	@$(PAUSE)
else
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
endif
	$(DOCKER_COMPOSE) exec db psql -U postgres -c "DROP DATABASE IF EXISTS requify;"
	$(ECHO) "Database dropped!"

db-reset: db-drop db-create db-migrate ## Reset database
	$(ECHO) "Database reset complete!"

# =============================================================================
# DATABASE MIGRATIONS
# =============================================================================

db-migrate: check-env ## Apply migrations
	$(ECHO) "Applying migrations..."
	cd requify && $(ALEMBIC) upgrade head
	$(ECHO) "Migrations applied successfully!"

db-upgrade: db-migrate ## Alias for db-migrate

db-downgrade: check-env ## Rollback one migration
	$(ECHO) "Rolling back last migration..."
	cd requify && $(ALEMBIC) downgrade -1
	$(ECHO) "Migration rolled back!"

db-revision: check-env ## Create new migration
	$(ECHO) "Creating new migration..."
ifeq ($(detected_OS),Windows)
	@$(call PROMPT,message,Enter migration description)
	@cd requify && $(ALEMBIC) revision --autogenerate -m "%message%"
else
	@read -p "Enter migration description: " message; \
	cd requify && $(ALEMBIC) revision --autogenerate -m "$$message"
endif
	$(ECHO) "Migration created!"

db-history: check-env ## Show migration history
	$(ECHO) "Migration history:"
	cd requify && $(ALEMBIC) history

db-current: check-env ## Show current migration
	$(ECHO) "Current migration:"
	cd requify && $(ALEMBIC) current

# =============================================================================
# TESTING
# =============================================================================

test-db-up: ## Start test database
	$(ECHO) "Starting test database..."
	$(DOCKER_COMPOSE) exec db psql -U postgres -c "CREATE DATABASE IF NOT EXISTS requify_test;" $(NULL_REDIRECT) || echo "Test DB ready"

test-db-clean: ## Clean test database
	$(ECHO) "Cleaning test database..."
	$(DOCKER_COMPOSE) exec db psql -U postgres -c "DROP DATABASE IF EXISTS requify_test;" $(NULL_REDIRECT) || echo "Test DB cleaned"
	$(DOCKER_COMPOSE) exec db psql -U postgres -c "CREATE DATABASE requify_test;" $(NULL_REDIRECT) || echo "Test DB created"

test: check-env test-db-up ## Run tests
	$(ECHO) "Running tests..."
	$(PYTHON) -m pytest tests/ -v
	$(ECHO) "Tests completed!"

test-coverage: check-env test-db-up ## Run tests with coverage
	$(ECHO) "Running tests with coverage..."
	$(PYTHON) -m pytest tests/ --cov=requify --cov-report=html --cov-report=term
	$(ECHO) "Coverage report generated in htmlcov/"

# =============================================================================
# DEVELOPMENT
# =============================================================================

dev-server: check-env db-up ## Start development server
	$(ECHO) "Starting development server..."
	cd requify && uvicorn requify.app.main:app --reload --host 0.0.0.0 --port 8000

dev-full: setup db-up db-migrate dev-server ## Full development setup

lint: ## Run linters
	$(ECHO) "Running code checks..."
	black requify/ --check
	isort requify/ --check-only
	flake8 requify/
	$(ECHO) "Code checks completed!"

format: ## Format code
	$(ECHO) "Formatting code..."
	black requify/
	isort requify/
	$(ECHO) "Code formatted!"

# =============================================================================
# UTILITIES
# =============================================================================

clean: ## Clean temporary files
	$(ECHO) "Cleaning temporary files..."
ifeq ($(detected_OS),Windows)
	@$(CLEAN_PYCS)
	@$(CLEAN_PYCACHE)
	@$(call RMDIR,.pytest_cache)
	@$(call RMDIR,htmlcov)
	@$(call DEL_FILE,.coverage)
else
	@$(CLEAN_PYCS)
	@$(CLEAN_PYCACHE)
	@$(call RMDIR,.pytest_cache)
	@$(call RMDIR,htmlcov)
	@$(call DEL_FILE,.coverage)
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
endif
	$(ECHO) "Cleanup complete!"

backup-db: ## Create database backup
	$(ECHO) "Creating database backup..."
ifeq ($(detected_OS),Windows)
	@$(call MKDIR,backups)
	$(DOCKER_COMPOSE) exec -T db pg_dump -U postgres requify > backups\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.sql
else
	@$(call MKDIR,backups)
	$(DOCKER_COMPOSE) exec -T db pg_dump -U postgres requify > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
endif
	$(ECHO) "Backup created in backups/"

restore-db: ## Restore database from backup
	$(ECHO) "Restoring database..."
ifeq ($(detected_OS),Windows)
	@$(call PROMPT,backup_file,Enter backup file path)
	@if exist "%backup_file%" ($(DOCKER_COMPOSE) exec -T db psql -U postgres requify < "%backup_file%" && echo "Database restored!") else (echo "File not found!" && exit 1)
else
	@read -p "Enter backup file path: " backup_file; \
	if [ -f "$$backup_file" ]; then \
		$(DOCKER_COMPOSE) exec -T db psql -U postgres requify < "$$backup_file"; \
		echo "Database restored!"; \
	else \
		echo "File not found!"; \
		exit 1; \
	fi
endif

docker-build: ## Build Docker image
	$(ECHO) "Building Docker image..."
	docker build -t requify:latest .
	$(ECHO) "Docker image built!"

docker-up: ## Start all Docker services
	$(ECHO) "Starting all services..."
	$(DOCKER_COMPOSE) up -d
	$(ECHO) "All services started!"

docker-down: ## Stop all Docker services
	$(ECHO) "Stopping all services..."
	$(DOCKER_COMPOSE) down
	$(ECHO) "All services stopped!"

# =============================================================================
# CONNECTION CHECKS
# =============================================================================

check-db: check-env ## Check database connection
	$(ECHO) "Checking database connection..."
	cd requify && $(PYTHON) -c "from requify.app.db.session import check_db_connection; print('Connection successful' if check_db_connection() else 'Connection failed')"

check-async-db: check-env ## Check async database connection
	$(ECHO) "Checking async database connection..."
	cd requify && $(PYTHON) -c "import asyncio; from requify.app.db.session import check_async_db_connection; print('Async connection successful' if asyncio.run(check_async_db_connection()) else 'Async connection failed')"

# =============================================================================
# OS-SPECIFIC DEBUG INFO
# =============================================================================

debug-os: ## Show OS detection information
	$(ECHO) "=== OS Detection Debug ==="
	$(ECHO) "Detected OS: $(detected_OS)"
	$(ECHO) "Shell: $(SHELL)"
	$(ECHO) "Python: $(PYTHON)"
	$(ECHO) "Docker Compose: $(DOCKER_COMPOSE)"
ifeq ($(detected_OS),Windows)
	$(ECHO) "Using Windows commands"
else
	$(ECHO) "Using UNIX commands"
endif

# =============================================================================
# DATABASE TYPE SWITCHING (Windows/UNIX)
# =============================================================================

use-sqlite: ## Switch to SQLite for Windows development
	$(ECHO) "Switching to SQLite configuration..."
ifeq ($(detected_OS),Windows)
	@$(COPY_FILE) env.windows.example .env
else
	@cp env.windows.example .env
endif
	$(ECHO) "SQLite configuration activated!"
	$(ECHO) "This avoids asyncpg issues on Windows"

use-postgres: ## Switch to PostgreSQL configuration
	$(ECHO) "Switching to PostgreSQL configuration..."
ifeq ($(detected_OS),Windows)
	@$(COPY_FILE) env.example .env
else
	@cp env.example .env
endif
	$(ECHO) "PostgreSQL configuration activated!"
	$(ECHO) "Make sure PostgreSQL is running with 'make db-up'"

show-db-config: ## Show current database configuration
	$(ECHO) "Current database configuration:"
	cd requify && $(PYTHON) -c "from requify.app.core.config import settings; print(f'DATABASE_URI: {settings.DATABASE_URI}'); print(f'ASYNC_DATABASE_URI: {settings.ASYNC_DATABASE_URI}')"

# =============================================================================
# ASYNC MIGRATION SUPPORT
# =============================================================================

db-migrate-async: check-env ## Apply migrations using async engine
	$(ECHO) "Applying async migrations..."
	cd requify && $(PYTHON) -m requify.app.db.async_migrations upgrade
	$(ECHO) "Async migrations applied successfully!"

db-revision-async: check-env ## Create new migration with async support
	$(ECHO) "Creating new async migration..."
ifeq ($(detected_OS),Windows)
	@$(call PROMPT,message,Enter migration description)
	@cd requify && $(PYTHON) -m requify.app.db.async_migrations revision --autogenerate -m "%message%"
else
	@read -p "Enter migration description: " message; \
	cd requify && $(PYTHON) -m requify.app.db.async_migrations revision --autogenerate -m "$$message"
endif
	$(ECHO) "Async migration created!"

db-history-async: check-env ## Show async migration history
	$(ECHO) "Async migration history:"
	cd requify && $(PYTHON) -m requify.app.db.async_migrations history

db-current-async: check-env ## Show current async migration
	$(ECHO) "Current async migration:"
	cd requify && $(PYTHON) -m requify.app.db.async_migrations current

# Default command
.DEFAULT_GOAL := help