# 🐳 Руководство по разработке с Docker для Requify

## 📖 Обзор

Этот документ описывает лучшие практики разработки с контейнерами для проекта Requify, включая настройку среды разработки и продакшена.

## 🏗️ Архитектура

### Компоненты системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vue)   │    │   (FastAPI)     │    │   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌─────────────────┐
                        │     Nginx       │
                        │  (Reverse Proxy)│
                        │   Port: 80/443  │
                        └─────────────────┘
```

### Окружения

- **Development** (`docker-compose.dev.yml`) - для разработки с hot reload
- **Production** (`docker-compose.prod.yml`) - для продакшна с оптимизациями

## 🚀 Быстрый старт

### Первоначальная настройка

```bash
# 1. Клонируйте репозиторий
git clone <repository-url>
cd requify

# 2. Скопируйте конфигурационные файлы
cp env.dev.example .env

# 3. Запустите среду разработки
make dev

# 4. Инициализируйте базу данных
make db-migrate
make db-seed
```

Приложение будет доступно по адресам:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Adminer**: http://localhost:8080
- **MailHog**: http://localhost:8025

## 📋 Команды Makefile

### 🔧 Разработка

```bash
# Запуск среды разработки
make dev                    # Запустить все сервисы
make dev-build             # Пересобрать и запустить
make dev-logs              # Показать логи
make dev-stop              # Остановить сервисы
make dev-clean             # Остановить и удалить данные

# Работа с контейнерами
make dev-shell-backend     # Войти в контейнер backend
make dev-shell-frontend    # Войти в контейнер frontend
make dev-shell-db          # Войти в PostgreSQL
```

### 🗄️ База данных

```bash
make db-migrate            # Применить миграции
make db-migration message="описание"  # Создать миграцию
make db-seed               # Заполнить тестовыми данными
make db-backup             # Создать резервную копию
make db-restore file=backup.sql  # Восстановить из бэкапа
make reset-db              # Сбросить БД и заполнить заново
```

### 🧪 Тестирование

```bash
make test-docker           # Запустить тесты в контейнере
make test-integration      # Интеграционные тесты
make test-api              # API тесты через PowerShell
```

### 📊 Мониторинг

```bash
make logs                  # Логи всех сервисов
make logs-backend          # Логи backend
make logs-frontend         # Логи frontend
make status                # Статус контейнеров
make health                # Проверка здоровья сервисов
make stats                 # Использование ресурсов
```

### 🚀 Продакшн

```bash
make prod                  # Запустить продакшн
make prod-build            # Собрать и запустить
make prod-logs             # Логи продакшна
make prod-stop             # Остановить продакшн
```

## 📁 Структура файлов

```
requify/
├── docker-compose.dev.yml      # Разработка
├── docker-compose.prod.yml     # Продакшн
├── Dockerfile.backend.dev      # Backend для разработки
├── Dockerfile.backend.prod     # Backend для продакшна
├── Dockerfile.frontend.dev     # Frontend для разработки
├── Dockerfile.frontend.prod    # Frontend для продакшна
├── nginx/
│   ├── dev.conf               # Nginx для разработки
│   └── prod.conf              # Nginx для продакшна
├── env.dev.example            # Пример конфигурации для разработки
├── env.prod.example           # Пример конфигурации для продакшна
└── Makefile                   # Команды автоматизации
```

## ⚙️ Конфигурация

### Переменные окружения

#### Разработка (env.dev.example)
- Hot reload включен
- Debug режим активен
- MailHog для тестирования email
- Swagger UI доступен

#### Продакшн (env.prod.example)
- SSL/TLS настроен
- Безопасные пароли
- Мониторинг включен
- Swagger UI отключен

### Порты по умолчанию

| Сервис | Разработка | Продакшн |
|--------|------------|----------|
| Frontend | 3000 | 80/443 |
| Backend | 8000 | 8000 (internal) |
| PostgreSQL | 5432 | 5432 (internal) |
| Redis | 6379 | 6379 (internal) |
| Adminer | 8080 | - |
| MailHog | 8025 | - |
| Prometheus | - | 9090 |
| Grafana | - | 3001 |

## 🔧 Настройка разработки

### 1. Hot Reload

Файлы автоматически обновляются при изменении:

**Backend:**
```yaml
volumes:
  - ./requify:/app/requify:ro
develop:
  watch:
    - action: sync
      path: ./requify
      target: /app/requify
```

**Frontend:**
```yaml
volumes:
  - ./frontend:/app:delegated
  - /app/node_modules
```

### 2. Отладка

**Backend отладка с debugpy:**
```python
# В коде добавьте:
import debugpy
debugpy.listen(("0.0.0.0", 5678))
debugpy.wait_for_client()
```

Подключитесь к порту 5678 из VS Code.

### 3. Тестирование email

MailHog перехватывает все исходящие email:
- Web UI: http://localhost:8025
- SMTP: localhost:1025

## 🛡️ Безопасность

### Разработка
- Базовые заголовки безопасности
- CORS настроен для localhost
- Простые пароли для удобства

### Продакшн
- SSL/TLS обязателен
- Строгие заголовки безопасности
- Rate limiting
- Сильные пароли
- Отключен Swagger UI

## 📈 Мониторинг

### Prometheus + Grafana (продакшн)

```bash
# Запустить с мониторингом
make prod

# Доступ к метрикам
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
```

### Логирование

```bash
# Структурированные логи
make logs-backend | jq .

# Логи в реальном времени
make dev-logs
```

## 🚀 Деплой

### CI/CD команды

```bash
# Тестирование для CI
make ci-test

# Сборка образов
make ci-build

# Деплой
docker tag requify-backend:latest your-registry/requify-backend:latest
docker push your-registry/requify-backend:latest
```

### Продакшн чеклист

1. ✅ Смените все пароли в `env.prod.example`
2. ✅ Настройте SSL сертификаты
3. ✅ Проверьте конфигурацию Nginx
4. ✅ Настройте резервное копирование
5. ✅ Проверьте мониторинг
6. ✅ Протестируйте восстановление

## 🔄 Рабочие процессы

### Ежедневная разработка

```bash
# Утром
make dev                    # Запустить среду
make dev-logs              # Проверить логи

# Разработка
# Код автоматически обновляется

# Тестирование
make test-docker           # Запустить тесты
make test-api              # Проверить API

# Вечером
make dev-stop              # Остановить (опционально)
```

### Работа с данными

```bash
# Сбросить БД для чистого старта
make reset-db

# Бэкап перед экспериментами
make db-backup

# Восстановить при необходимости
make db-restore file=backup_20231201_120000.sql
```

## 🆘 Устранение неполадок

### Общие проблемы

**Контейнеры не запускаются:**
```bash
make dev-clean              # Очистить всё
make dev-build             # Пересобрать
```

**База данных недоступна:**
```bash
make dev-shell-db          # Проверить подключение
make db-migrate            # Применить миграции
```

**Фронтенд не обновляется:**
```bash
# В Windows включите polling
export CHOKIDAR_USEPOLLING=true
make dev-build
```

**Память заканчивается:**
```bash
make cleanup               # Очистить Docker ресурсы
docker system df          # Проверить использование
```

### Логи и диагностика

```bash
# Детальные логи
make logs-backend | tail -100

# Статус сервисов
make status
make health

# Использование ресурсов
make stats
```

## 📚 Дополнительные ресурсы

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [FastAPI in Containers](https://fastapi.tiangolo.com/deployment/docker/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Tuning](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)

---

**Помощь:** Если у вас возникли вопросы, создайте issue в репозитории или обратитесь к команде разработки. 