# Requify Backend Makefile
# Автоматизация задач для разработки backend

.PHONY: help install install-dev update clean lint format test test-unit test-integration test-cov security build run dev migrate migrate-upgrade migrate-downgrade create-migration docs docker-build docker-run

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation and dependencies
install: ## Install production dependencies
	poetry install --only=main

install-dev: ## Install all dependencies (including dev)
	poetry install

update: ## Update dependencies
	poetry update

# Cleaning
clean: ## Clean cache and build artifacts
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf build/ dist/ htmlcov/ .coverage coverage.xml *.egg-info
	find . -name "*.pyc" -delete 2>/dev/null || true

# Code quality and formatting
lint: ## Run all linting tools (Black, isort, Flake8, Pylint)
	@echo "🔍 Running code quality checks..."
	@echo "📝 Checking code formatting with Black..."
	poetry run black --check --diff .
	@echo "📦 Checking import sorting with isort..."
	poetry run isort --check-only --diff .
	@echo "🎯 Running Flake8 style checks..."
	poetry run flake8 --config=setup.cfg .
	@echo "🔎 Running Pylint static analysis..."
	poetry run pylint app/ --rcfile=.pylintrc --output-format=text --reports=no --score=no || true

format: ## Auto-format code with Black and isort
	@echo "🎨 Formatting code..."
	poetry run black .
	poetry run isort .
	@echo "✅ Code formatting completed!"

format-check: ## Check code formatting without changing files
	@echo "🔍 Checking code formatting..."
	poetry run black --check .
	poetry run isort --check-only .

# Testing
test: clean test-unit test-integration ## Run all tests (unit + integration)

test-unit: ## Run unit tests only
	@echo "🧪 Running unit tests..."
	poetry run pytest tests/ -v --tb=short --cov=app --cov-report=term-missing --cov-report=html --cov-report=xml -m "unit" --maxfail=5

test-integration: ## Run integration tests only
	@echo "🔗 Running integration tests..."
	poetry run pytest tests/ -v --tb=short --cov=app --cov-append --cov-report=term-missing --cov-report=html --cov-report=xml -m "integration" --maxfail=3

test-api: ## Run API tests only
	@echo "🌐 Running API tests..."
	poetry run pytest tests/ -v --tb=short --cov=app --cov-report=term-missing -m "api"

test-cov: ## Run tests with detailed coverage report
	@echo "📊 Running tests with coverage..."
	poetry run pytest tests/ --cov=app --cov-report=html --cov-report=xml --cov-report=term-missing --cov-fail-under=80

test-fast: ## Run tests without coverage (faster)
	@echo "⚡ Running fast tests..."
	poetry run pytest tests/ -v --tb=short -x

test-verbose: ## Run tests with verbose output
	@echo "🔍 Running verbose tests..."
	poetry run pytest tests/ -vvv --tb=long

# Security
security: ## Run security vulnerability scan
	@echo "🔒 Running security scan..."
	poetry run safety check --json --output safety-report.json || true
	@echo "📋 Security report saved to safety-report.json"

# Build
build: ## Build package
	@echo "📦 Building package..."
	poetry build

# Development server
run: ## Run development server
	@echo "🚀 Starting development server..."
	poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev: ## Run development server with hot reload
	@echo "🔥 Starting development server with hot reload..."
	poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug

# Database migrations
migrate: migrate-upgrade ## Alias for migrate-upgrade

migrate-upgrade: ## Run database migrations (upgrade)
	@echo "📈 Running database migrations..."
	poetry run alembic upgrade head

migrate-downgrade: ## Downgrade database migration
	@echo "📉 Downgrading database migration..."
	poetry run alembic downgrade -1

create-migration: ## Create new migration (use: make create-migration message="description")
	@echo "📝 Creating new migration..."
	poetry run alembic revision --autogenerate -m "$(message)"

migrate-history: ## Show migration history
	@echo "📋 Migration history:"
	poetry run alembic history

migrate-current: ## Show current migration
	@echo "📍 Current migration:"
	poetry run alembic current

# Documentation
docs: ## Generate API documentation
	@echo "📚 Generating documentation..."
	@echo "Documentation will be available at http://localhost:8000/docs when server is running"

# Docker commands
docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker build -t requify-backend .

docker-run: ## Run Docker container
	@echo "🐳 Running Docker container..."
	docker run -p 8000:8000 requify-backend

# CI/CD simulation
ci-lint: ## Run CI linting checks (same as CI)
	@echo "🔍 Running CI linting checks..."
	poetry run black --check --diff .
	poetry run isort --check-only --diff .
	poetry run flake8 --config=setup.cfg .
	poetry run pylint app/ --rcfile=.pylintrc --output-format=text --reports=no --score=no || true

ci-test: ## Run CI tests (same as CI)
	@echo "🧪 Running CI tests..."
	poetry run pytest tests/ -v --tb=short --cov=app --cov-report=xml --cov-report=html --cov-report=term-missing --cov-fail-under=80 -m "unit" --maxfail=5
	poetry run pytest tests/ -v --tb=short --cov=app --cov-append --cov-report=xml --cov-report=html --cov-report=term-missing -m "integration" --maxfail=3 || true

ci: ci-lint ci-test security build ## Run full CI pipeline locally

# Environment setup
setup-dev: install-dev ## Setup development environment
	@echo "🛠️  Setting up development environment..."
	@echo "✅ Development environment ready!"
	@echo "💡 Run 'make help' to see available commands"

# Quick development workflow
quick-check: format-check lint test-fast ## Quick development check (format, lint, fast tests)

# Pre-commit checks (recommended before committing)
pre-commit: format lint test-unit ## Run pre-commit checks

# Full validation (recommended before pushing)
full-check: clean format lint test security build ## Run complete validation

# Status and info
status: ## Show project status
	@echo "📊 Project Status:"
	@echo "Python version: $(shell python --version)"
	@echo "Poetry version: $(shell poetry --version)"
	@echo "Dependencies status:"
	@poetry show --tree | head -10
	@echo "Git status:"
	@git status --porcelain | head -10

# Performance tests (if available)
test-perf: ## Run performance tests
	@echo "⚡ Running performance tests..."
	poetry run pytest tests/ -v -m "slow" --tb=short

# Database utilities
db-reset: ## Reset database (drop and recreate)
	@echo "🗑️  Resetting database..."
	@echo "This will drop and recreate the database!"
	@read -p "Are you sure? [y/N] " -n 1 -r; echo; if [[ $$REPLY =~ ^[Yy]$$ ]]; then poetry run alembic downgrade base && poetry run alembic upgrade head; fi

db-seed: ## Seed database with test data
	@echo "🌱 Seeding database..."
	poetry run python scripts/seed_data.py

# Environment files
env-copy: ## Copy environment example file
	@echo "📋 Copying environment file..."
	cp env.example .env
	@echo "✅ Please edit .env file with your settings"

# Logs
logs-clear: ## Clear log files
	@echo "🗑️  Clearing logs..."
	find logs/ -name "*.log" -delete 2>/dev/null || true
	@echo "✅ Logs cleared"

# All-in-one commands for different scenarios
fresh-start: clean install-dev migrate ## Fresh start (clean, install, migrate)

deploy-check: clean format lint test security build ## Pre-deployment validation

dev-setup: install-dev env-copy ## Initial development setup
