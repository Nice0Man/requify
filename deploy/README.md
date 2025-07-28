# Requify Infrastructure Deployment

Эта папка содержит всю инфраструктурную конфигурацию для развертывания проекта Requify с полной поддержкой CDN, MinIO storage и hot reload для разработки.

## 🚀 Быстрый старт

### Windows (PowerShell)
```powershell
# Запуск всей development среды одной командой
.\scripts\start-dev.ps1
```

### Linux/macOS
```bash
# Используйте Makefile для удобного управления
cd deploy
make dev
```

### Ручной запуск
```bash
# 1. Перейдите в deploy папку
cd deploy

# 2. Создайте необходимые директории и конфигурации
make setup

# 3. Запустите сервисы
make up

# 4. Проверьте статус
make status
```

## 📁 Структура папки

```
deploy/
├── docker/                     # Docker конфигурации
│   ├── docker-compose.yml      # Основная конфигурация (ИСПРАВЛЕНО)
│   ├── backend/                # Backend Dockerfile
│   │   ├── Dockerfile.dev      # Development backend (ИСПРАВЛЕНО)
│   │   └── Dockerfile.prod     # Production backend
│   ├── frontend/               # Frontend Dockerfile  
│   │   ├── Dockerfile.dev      # Development frontend (ИСПРАВЛЕНО)
│   │   └── Dockerfile.prod     # Production frontend
│   └── .env                    # Environment file (автосоздается)
├── nginx/                      # NGINX конфигурации
│   ├── nginx.conf              # Основная конфигурация с CDN
│   ├── dev.conf                # Конфигурация для разработки
│   └── prod.conf               # Конфигурация для продакшена
├── env/                        # Переменные окружения
│   └── cdn.env                 # CDN специфичные настройки
├── docker.env.example          # НОВЫЙ: Основная конфигурация (ИСПРАВЛЕНО)
├── Makefile                    # НОВЫЙ: Команды управления (ИСПРАВЛЕНО)
├── README.md                   # Этот файл (ОБНОВЛЕН)
└── scripts/                    # Скрипты управления (будут перенесены)
```

## 🔧 Исправленные проблемы

### ✅ Исправления в Docker Compose
- **Добавлен frontend сервис** с hot reload
- **Исправлены build contexts** (теперь корректно указывают на root проекта)
- **Исправлены Dockerfile пути** для backend и frontend
- **Исправлены volume mounts** для hot reload разработки
- **Добавлены зависимости** между сервисами
- **Исправлены пути к nginx конфигурации**

### ✅ Исправления в Dockerfile
- **Backend**: Правильная установка зависимостей через Poetry
- **Frontend**: Корректная установка npm зависимостей с dev пакетами
- **Исправлены пути к файлам** в контексте билда
- **Добавлены environment variables** для разработки

### ✅ Новые возможности
- **Hot reload** для backend и frontend
- **Автоматическое создание** data директорий
- **Автоматическая настройка** environment файлов
- **Comprehensive health checks** для всех сервисов
- **PowerShell скрипт** для Windows разработчиков
- **Makefile** для Linux/macOS разработчиков

## 🛠️ Конфигурационные файлы

### 1. docker.env.example → docker/.env
**ИСПРАВЛЕНО**: Теперь включает все необходимые настройки для полной разработки.

```env
# Основные сервисы
POSTGRES_DB=requify-db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# MinIO & CDN
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=minioadmin123
CDN_ENABLED=true

# Application services  
APP_CONFIG__FILE_STORAGE__USE_MINIO=true
APP_CONFIG__FILE_STORAGE__CDN_ENABLED=true
```

### 2. backend/env.example → backend/.env
Автоматически копируется при запуске, содержит настройки для FastAPI приложения.

## 🐳 Сервисы

| Сервис | Порт | Статус | Описание |
|--------|------|--------|----------|
| **frontend** | 3000 | ✅ ИСПРАВЛЕНО | React приложение с hot reload |
| **app** | 8000 | ✅ ИСПРАВЛЕНО | FastAPI backend с hot reload |
| **nginx** | 80, 443 | ✅ ИСПРАВЛЕНО | Reverse proxy + CDN |
| **postgres** | 5432 | ✅ OK | Основная база данных |
| **redis** | 6379 | ✅ OK | Основной Redis |
| **minio** | 9000, 9001 | ✅ OK | Object storage |
| **redis-cdn** | - | ✅ OK | Redis для CDN метаданных |

## 📊 Управление через Makefile

```bash
# Основные команды
make help          # Показать все доступные команды
make dev           # Быстрый старт development среды
make up            # Запустить все сервисы
make down          # Остановить все сервисы
make status        # Показать статус сервисов
make health        # Проверить здоровье сервисов

# Разработка
make logs          # Показать все логи
make logs-app      # Логи backend
make logs-web      # Логи frontend
make shell-app     # Открыть shell в backend контейнере
make shell-web     # Открыть shell в frontend контейнере

# База данных
make db-shell      # Открыть PostgreSQL shell
make db-migrate    # Выполнить миграции
make backup-db     # Создать backup базы данных

# Обслуживание
make clean         # Очистить остановленные контейнеры
make test          # Запустить тесты
make monitor       # Мониторинг ресурсов контейнеров
```

## 🌐 URL endpoints

### Основные сервисы
- **Frontend**: http://localhost:3000 ✅ (с hot reload)
- **Backend API**: http://localhost:8000 ✅ (с hot reload)
- **API Docs**: http://localhost:8000/docs
- **NGINX Proxy**: http://localhost:80

### CDN endpoints
- **Аватары**: http://localhost/avatars/* (кэш: 1 час)
- **Uploads**: http://localhost/cdn/uploads/* (кэш: 30 минут)
- **Documents**: http://localhost/cdn/documents/* (кэш: 5 минут)

### Административные
- **MinIO Console**: http://localhost:9001 (admin/minioadmin123)
- **Cache Status**: http://localhost/cache-status

## ⚡ Hot Reload разработка

### Backend (FastAPI)
- **Путь**: `./backend/` автоматически монтируется в контейнер
- **Команда**: `uvicorn app.main:app --reload`
- **Изменения**: автоматически перезагружаются при сохранении

### Frontend (React/Vite)
- **Путь**: `./frontend/` автоматически монтируется в контейнер  
- **Команда**: `npm run dev --host 0.0.0.0`
- **Изменения**: автоматически перезагружаются в браузере

## 🔍 Отладка и мониторинг

### Проверка health статуса
```bash
make health
```

### Мониторинг логов
```bash
# Все сервисы
make logs

# Конкретный сервис
make logs-app     # Backend
make logs-web     # Frontend  
make logs-nginx   # NGINX
```

### Проверка контейнеров
```bash
make status
make monitor      # Использование ресурсов
```

### Debugging контейнеров
```bash
# Backend shell
make shell-app
cd /app && python -c "import app; print('Backend OK')"

# Frontend shell  
make shell-web
npm list          # Проверить установленные пакеты
```

## 🚨 Troubleshooting

### 1. "Frontend/Backend не запускается"
```bash
# Проверьте логи
make logs-app
make logs-web

# Пересоберите образы
make build

# Полная перезагрузка
make down && make up
```

### 2. "Dependency ошибки"
```bash
# Backend: Poetry ошибки
make shell-app
poetry install --with dev

# Frontend: npm ошибки  
make shell-web
npm ci --include=dev
```

### 3. "Порты заняты"
```bash
# Windows
netstat -an | findstr :3000
netstat -an | findstr :8000

# Linux/macOS
lsof -i :3000
lsof -i :8000
```

### 4. "Docker build ошибки"
```bash
# Очистить кэш и пересобрать
make clean
make build

# Полная очистка (ОСТОРОЖНО!)
make prune
```

## 🎯 Development Tips

### Быстрые команды
```bash
# Перезапуск конкретного сервиса
cd deploy/docker
docker-compose restart app        # Backend
docker-compose restart frontend   # Frontend
docker-compose restart nginx      # NGINX

# Просмотр конфигурации
docker-compose config

# Проверка переменных окружения в контейнере
docker exec requify_app env | grep APP_CONFIG
```

### Database operations
```bash
# Подключение к базе
make db-shell

# Запуск миграций
make db-migrate

# Создание backup
make backup-db
```

### Работа с MinIO
```bash
# Доступ к MinIO Console
open http://localhost:9001

# Инициализация buckets
make init-minio

# Проверка buckets через API
curl http://localhost:9000/
```

## 📝 Production deployment

Для продакшена используйте:
```bash
# Production build
make prod-build

# Конфигурация продакшена
cp docker.env.example docker/.env.prod
# Отредактируйте .env.prod для продакшена

# Запуск в продакшене
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🎉 Готово!

После исправлений у вас должна быть полностью рабочая development среда с:
- ✅ Автоматической установкой всех зависимостей
- ✅ Hot reload для frontend и backend
- ✅ Полной CDN функциональностью  
- ✅ Удобными командами управления
- ✅ Comprehensive health checks
- ✅ Proper volume mounting
- ✅ Automated environment setup

**Запуск одной командой**: `.\scripts\start-dev.ps1` (Windows) или `make dev` (Linux/macOS) 