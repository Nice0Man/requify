# Makefile для проекта Requify
# Автоматизированная система управления требованиями

# Переменные
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = requify
ENV_FILE = .env

# Цвета для вывода
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

.PHONY: help setup build up down restart logs clean test migrate init-db seed-db backup restore

# Помощь - описание доступных команд
help:
	@echo "$(BLUE)Requify - Система управления требованиями$(NC)"
	@echo "$(BLUE)Доступные команды:$(NC)"
	@echo ""
	@echo "$(GREEN)Основные команды:$(NC)"
	@echo "  make setup          - Первоначальная настройка проекта"
	@echo "  make build          - Сборка Docker образов"
	@echo "  make up             - Запуск всех сервисов"
	@echo "  make down           - Остановка всех сервисов"
	@echo "  make restart        - Перезапуск всех сервисов"
	@echo "  make status         - Показать статус сервисов"
	@echo ""
	@echo "$(GREEN)База данных:$(NC)"
	@echo "  make migrate        - Запуск миграций Alembic"
	@echo "  make migrate-create - Создание новой миграции"
	@echo "  make migrate-down   - Откат миграции"
	@echo "  make init-db        - Инициализация базы данных"
	@echo "  make seed-db        - Заполнение тестовыми данными"
	@echo "  make reset-db       - Сброс и пересоздание БД"
	@echo ""
	@echo "$(GREEN)Разработка:$(NC)"
	@echo "  make dev            - Запуск в режиме разработки (с Adminer)"
	@echo "  make test           - Запуск тестов"
	@echo "  make test-cov       - Запуск тестов с покрытием"
	@echo "  make lint           - Проверка кода линтерами"
	@echo "  make format         - Форматирование кода"
	@echo ""
	@echo "$(GREEN)Логи и мониторинг:$(NC)"
	@echo "  make logs           - Просмотр логов всех сервисов"
	@echo "  make logs-app       - Просмотр логов приложения"
	@echo "  make logs-db        - Просмотр логов БД"
	@echo "  make logs-nginx     - Просмотр логов Nginx"
	@echo ""
	@echo "$(GREEN)Резервное копирование:$(NC)"
	@echo "  make backup         - Создание бэкапа БД"
	@echo "  make restore        - Восстановление из бэкапа"
	@echo "  make clean          - Очистка неиспользуемых ресурсов"
	@echo ""
	@echo "$(GREEN)Продакшен:$(NC)"
	@echo "  make prod           - Запуск в продакшен режиме"
	@echo "  make deploy         - Деплой приложения"

# Первоначальная настройка проекта
setup:
	@echo "$(BLUE)Настройка проекта Requify...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)Копирование env.example в .env...$(NC)"; \
		cp env.example $(ENV_FILE); \
		echo "$(GREEN)✓ .env файл создан$(NC)"; \
	else \
		echo "$(GREEN)✓ .env файл уже существует$(NC)"; \
	fi
	@echo "$(YELLOW)Создание необходимых директорий...$(NC)"
	@mkdir -p logs uploads static backups monitoring/data
	@chmod 755 logs uploads static backups
	@echo "$(GREEN)✓ Директории созданы$(NC)"
	@echo "$(GREEN)✓ Проект настроен! Теперь выполните 'make build && make up'$(NC)"

# Сборка Docker образов
build:
	@echo "$(BLUE)Сборка Docker образов...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✓ Образы собраны$(NC)"

# Быстрая сборка (с кэшем)
build-fast:
	@echo "$(BLUE)Быстрая сборка Docker образов...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✓ Образы собраны$(NC)"

# Запуск всех сервисов
up:
	@echo "$(BLUE)Запуск сервисов Requify...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Сервисы запущены$(NC)"
	@echo "$(BLUE)Проверка состояния...$(NC)"
	@sleep 5
	@make status

# Запуск в режиме разработки (с Adminer)
dev:
	@echo "$(BLUE)Запуск в режиме разработки...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) --profile dev up -d
	@echo "$(GREEN)✓ Режим разработки активен$(NC)"
	@echo "$(BLUE)Доступные сервисы:$(NC)"
	@echo "  - Приложение: http://localhost:8000"
	@echo "  - API документация: http://localhost:8000/docs"
	@echo "  - Adminer: http://localhost:8080"
	@echo "  - Nginx: http://localhost"

# Остановка всех сервисов
down:
	@echo "$(BLUE)Остановка сервисов...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✓ Сервисы остановлены$(NC)"

# Остановка с удалением volumes
down-volumes:
	@echo "$(RED)Остановка сервисов и удаление данных...$(NC)"
	@read -p "Вы уверены? Все данные будут удалены! (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)✓ Сервисы остановлены, данные удалены$(NC)"

# Перезапуск всех сервисов
restart:
	@echo "$(BLUE)Перезапуск сервисов...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✓ Сервисы перезапущены$(NC)"

# Перезапуск конкретного сервиса
restart-app:
	@docker-compose -f $(COMPOSE_FILE) restart app

restart-db:
	@docker-compose -f $(COMPOSE_FILE) restart postgres

restart-nginx:
	@docker-compose -f $(COMPOSE_FILE) restart nginx

# Статус сервисов
status:
	@echo "$(BLUE)Статус сервисов:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps

# Логи всех сервисов
logs:
	@docker-compose -f $(COMPOSE_FILE) logs -f

# Логи конкретных сервисов
logs-app:
	@docker-compose -f $(COMPOSE_FILE) logs -f app

logs-db:
	@docker-compose -f $(COMPOSE_FILE) logs -f postgres

logs-nginx:
	@docker-compose -f $(COMPOSE_FILE) logs -f nginx

logs-redis:
	@docker-compose -f $(COMPOSE_FILE) logs -f redis

# Подключение к контейнерам
shell-app:
	@docker-compose -f $(COMPOSE_FILE) exec app bash

shell-db:
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -d requify-db

shell-redis:
	@docker-compose -f $(COMPOSE_FILE) exec redis redis-cli

# Миграции базы данных
migrate:
	@echo "$(BLUE)Запуск миграций...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic upgrade head
	@echo "$(GREEN)✓ Миграции применены$(NC)"

# Создание новой миграции
migrate-create:
	@read -p "Введите описание миграции: " message; \
	docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic revision --autogenerate -m "$$message"

# Откат миграции
migrate-down:
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic downgrade -1

# Информация о миграциях
migrate-history:
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic history

migrate-current:
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run alembic current

# Инициализация базы данных
init-db:
	@echo "$(BLUE)Инициализация базы данных...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run python -m requify.scripts.db_utils init
	@echo "$(GREEN)✓ База данных инициализирована$(NC)"

# Заполнение тестовыми данными
seed-db:
	@echo "$(BLUE)Заполнение базы тестовыми данными...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run python -m requify.scripts.seed_db
	@echo "$(GREEN)✓ Тестовые данные загружены$(NC)"

# Сброс и пересоздание БД
reset-db:
	@echo "$(RED)Сброс базы данных...$(NC)"
	@read -p "Вы уверены? Все данные будут удалены! (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"requify-db\";"
	@docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -c "CREATE DATABASE \"requify-db\";"
	@make migrate
	@make seed-db
	@echo "$(GREEN)✓ База данных пересоздана$(NC)"

# Тестирование
test:
	@echo "$(BLUE)Запуск тестов...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run pytest

test-cov:
	@echo "$(BLUE)Запуск тестов с покрытием...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run pytest --cov=requify --cov-report=html --cov-report=term

# Линтеры и форматирование
lint:
	@echo "$(BLUE)Проверка кода линтерами...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run black --check .
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run isort --check-only .
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run flake8 .

format:
	@echo "$(BLUE)Форматирование кода...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run black .
	@docker-compose -f $(COMPOSE_FILE) exec app poetry run isort .
	@echo "$(GREEN)✓ Код отформатирован$(NC)"

# Резервное копирование
backup:
	@echo "$(BLUE)Создание резервной копии...$(NC)"
	@mkdir -p backups
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U postgres requify-db | gzip > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "$(GREEN)✓ Резервная копия создана в папке backups/$(NC)"

# Восстановление из резервной копии
restore:
	@echo "$(BLUE)Восстановление из резервной копии...$(NC)"
	@echo "Доступные резервные копии:"
	@ls -la backups/
	@read -p "Введите имя файла резервной копии: " backup_file; \
	gunzip -c backups/$$backup_file | docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U postgres requify-db

# Очистка неиспользуемых ресурсов
clean:
	@echo "$(BLUE)Очистка неиспользуемых ресурсов...$(NC)"
	@docker system prune -f
	@docker volume prune -f
	@docker image prune -f
	@echo "$(GREEN)✓ Очистка завершена$(NC)"

# Продакшен режим
prod:
	@echo "$(BLUE)Запуск в продакшен режиме...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Продакшен режим активен$(NC)"

# Деплой приложения
deploy:
	@echo "$(BLUE)Деплой приложения...$(NC)"
	@make build
	@make down
	@make up
	@make migrate
	@echo "$(GREEN)✓ Деплой завершен$(NC)"

# Проверка здоровья
health:
	@echo "$(BLUE)Проверка состояния сервисов...$(NC)"
	@curl -f http://localhost:8000/health || echo "$(RED)Приложение недоступно$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_isready -U postgres || echo "$(RED)PostgreSQL недоступен$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec redis redis-cli ping || echo "$(RED)Redis недоступен$(NC)"

# Мониторинг ресурсов
monitor:
	@docker stats $(PROJECT_NAME)_postgres $(PROJECT_NAME)_app $(PROJECT_NAME)_nginx $(PROJECT_NAME)_redis

# Установка зависимостей для разработки локально
install-dev:
	@echo "$(BLUE)Установка зависимостей для разработки...$(NC)"
	@poetry install
	@echo "$(GREEN)✓ Зависимости установлены$(NC)"

# Запуск приложения локально (без Docker)
run-local:
	@echo "$(BLUE)Запуск приложения локально...$(NC)"
	@poetry run uvicorn requify.app.main:app --reload --host 0.0.0.0 --port 8000

# Информация о проекте
info:
	@echo "$(BLUE)Информация о проекте Requify$(NC)"
	@echo "Версия: 0.1.0"
	@echo "Порты:"
	@echo "  - Приложение: 8000"
	@echo "  - PostgreSQL: 5432"
	@echo "  - PostgreSQL (тест): 5433"
	@echo "  - Redis: 6379"
	@echo "  - Nginx: 80, 443"
	@echo "  - Adminer: 8080" 