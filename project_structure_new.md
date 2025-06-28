# 🏗️ Новая структура проекта Requify

## 📁 Организованная структура

```
requify/
├── 📂 backend/                    # Backend приложение (FastAPI)
│   ├── app/                       # Основное приложение
│   ├── alembic/                   # Миграции БД
│   ├── scripts/                   # Backend скрипты
│   └── tests/                     # Тесты backend
│
├── 📂 frontend/                   # Frontend приложение (React)
│   ├── src/                       # Исходный код
│   ├── public/                    # Статические файлы
│   ├── package.json               # Зависимости
│   └── vite.config.js             # Конфигурация Vite
│
├── 📂 deploy/                     # Развертывание и конфигурация
│   ├── docker/                    # Docker файлы
│   │   ├── backend/
│   │   │   ├── Dockerfile.dev
│   │   │   └── Dockerfile.prod
│   │   ├── frontend/
│   │   │   ├── Dockerfile.dev
│   │   │   └── Dockerfile.prod
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   └── docker-compose.yml
│   ├── nginx/                     # Nginx конфигурации
│   │   ├── dev.conf
│   │   ├── prod.conf
│   │   └── nginx.conf
│   └── env/                       # Environment файлы
│       ├── .env.dev.example
│       ├── .env.prod.example
│       └── .env.example
│
├── 📂 config/                     # Конфигурационные файлы
│   ├── alembic.ini               # Alembic конфигурация
│   ├── redis.conf                # Redis конфигурация
│   ├── pytest.ini               # Pytest конфигурация
│   └── pyproject.toml            # Python проект конфигурация
│
├── 📂 scripts/                    # Скрипты и утилиты
│   ├── Makefile                  # Основные команды
│   ├── test_api_endpoints.ps1    # API тестирование
│   └── init-db.sql               # Инициализация БД
│
├── 📂 docs/                       # Документация
│   ├── analysis_report_requify_tz.md
│   ├── DOCKER_GUIDE.md
│   ├── project_structure.md
│   ├── README.md
│   └── ТЗ Requify.docx
│
├── 📂 data/                       # Данные и storage
│   ├── backups/                  # Резервные копии БД
│   ├── logs/                     # Логи приложения
│   ├── uploads/                  # Загруженные файлы
│   └── static/                   # Статические файлы
│
├── 📂 monitoring/                 # Мониторинг и метрики
│   ├── prometheus.yml
│   └── grafana/
│
├── 📂 .vscode/                   # VS Code настройки
├── .gitignore                    # Git ignore файл
└── poetry.lock                   # Заблокированные зависимости
```

## 🎯 Преимущества новой структуры

### 1. **Логическое разделение**
- **backend/** - весь код бэкенда
- **frontend/** - весь код фронтенда  
- **deploy/** - все что касается деплоя
- **config/** - конфигурационные файлы
- **scripts/** - утилиты и скрипты
- **docs/** - документация
- **data/** - данные и storage

### 2. **Улучшенная навигация**
- Четкое разделение по назначению
- Легко найти нужные файлы
- Удобно для новых разработчиков

### 3. **Гибкость развития**
- Можно легко добавить новые сервисы
- Простое масштабирование
- Возможность независимого деплоя

### 4. **CI/CD готовность**
- Структура готова для pipeline
- Четкие пути для сборки
- Изолированные конфигурации

## 🔄 Изменения в файлах

### Обновленные пути:
- `requify/` → `backend/`
- `requify.front/` → `frontend/`
- `Dockerfile.*` → `deploy/docker/*/`
- `docker-compose.*` → `deploy/docker/`
- `nginx/` → `deploy/nginx/`
- `env.*` → `deploy/env/`
- `*.md` → `docs/`
- storage папки → `data/`

### Makefile обновления:
- Новые пути к Docker файлам
- Обновленные volumes mapping
- Исправленные команды build

### Docker Compose обновления:
- Новые build context пути
- Обновленные volumes
- Исправленные Dockerfile пути 