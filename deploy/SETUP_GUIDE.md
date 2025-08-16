# Requify DNS Setup Guide

Полное руководство по настройке локальной DNS инфраструктуры для Requify

## Обзор

Новая DNS система обеспечивает:
- **Локальные домены**: requify.local, api.requify.local, cdn.requify.local
- **Автоматическая маршрутизация** между сервисами
- **CDN с защитой ключами**
- **Кроссплатформенная поддержка** (Windows/Linux/macOS)

## Доступные домены

| Домен | Назначение | Порт |
|-------|------------|------|
| `requify.local` | Frontend (React) | 80 |
| `api.requify.local` | Backend API (FastAPI) | 80 |
| `cdn.requify.local` | CDN (MinIO) | 80 |
| `admin.requify.local` | Admin Panel (Adminer) | 80 |
| `docs.requify.local` | API Documentation | 80 |

## Установка и настройка

### 1. Первоначальная настройка

```bash
cd deploy

# Создание директорий и конфигураций
make setup
```

### 2. Настройка DNS

#### Windows (PowerShell от имени администратора):
```powershell
cd deploy/scripts
./setup-dns.ps1
```

#### Linux/macOS:
```bash
cd deploy/scripts
sudo bash setup-dns.sh
```

### 3. Запуск development среды

```bash
cd deploy
make dev
```

### 4. Проверка работы

```bash
make dns-test
```

## Структура файлов

```
deploy/
├── docker/
│   ├── dnsmasq/
│   │   ├── Dockerfile              # DNS сервер
│   │   └── dnsmasq.conf           # Конфигурация DNS
│   ├── docker-compose.base.yml    # Базовая конфигурация + DNS
│   ├── docker-compose.override.yml # Development настройки
│   └── docker-compose.prod.yml    # Production настройки
├── nginx/
│   ├── nginx.conf                 # Стандартная конфигурация
│   └── nginx.local.conf          # DNS конфигурация с поддоменами
├── scripts/
│   ├── setup-dns.sh              # DNS setup для Linux/macOS
│   └── setup-dns.ps1             # DNS setup для Windows
├── env/
│   └── dns.env.example           # Пример DNS конфигурации
└── Makefile                      # Команды управления
```

## Docker Compose сервисы

### Новые сервисы:
- **dnsmasq**: DNS сервер для локальных доменов
- **nginx**: Обновлен для поддержки поддоменов

### Обновленные сервисы:
- **nginx**: Переключен на `nginx.local.conf`
- **backend/frontend**: Правильная маршрутизация через поддомены

## Команды управления

### DNS управление:
```bash
make dns-setup      # Настройка локальных доменов
make dns-cleanup    # Очистка DNS настроек  
make dns-test       # Тестирование DNS
make dns-status     # Статус DNS контейнера
```

### Development команды:
```bash
make dev           # Запуск с DNS поддержкой
make dev-build     # Пересборка + запуск
make dev-down      # Остановка
make status        # Статус всех контейнеров
```

### Nginx команды:
```bash
make nginx-reload  # Перезагрузка nginx
make nginx-test    # Тестирование конфигурации
make nginx-logs    # Просмотр логов
```

## Тестирование

### 1. DNS резолюция:
```bash
# Windows (PowerShell)
Resolve-DnsName requify.local
Resolve-DnsName api.requify.local

# Linux/macOS
nslookup requify.local
nslookup api.requify.local
```

### 2. HTTP доступность:
```bash
# PowerShell
Invoke-WebRequest http://requify.local/health
Invoke-WebRequest http://api.requify.local/health

# Bash
curl http://requify.local/health
curl http://api.requify.local/health
```

### 3. CDN с ключом:
```bash
curl "http://cdn.requify.local/protected/test.jpg?key=requify_dev_key_2024"
```

## CDN защита

### Публичные маршруты (без ключа):
- `/public/`
- `/avatars/`
- `/static/`

### Защищенные маршруты (требуют ключ):
- `/protected/` - требует параметр `?key=`

### Ключи разработки:
- `requify_dev_key_2024`
- `requify_local_access_key`

## Устранение неполадок

### DNS не разрешается:
1. Проверьте права администратора
2. Запустите `make dns-cleanup` затем `make dns-setup`
3. Очистите DNS кэш:
   - Windows: `ipconfig /flushdns`
   - Linux: `sudo systemctl restart systemd-resolved`
   - macOS: `sudo dscacheutil -flushcache`

### Контейнеры не запускаются:
1. Проверьте Docker: `docker --version`
2. Освободите порты 53, 80: `make dev-down`
3. Пересоберите: `make dev-build`

### Nginx ошибки:
1. Тестируйте конфигурацию: `make nginx-test`
2. Проверьте логи: `make nginx-logs`
3. Перезагрузите: `make nginx-reload`

## Переключение между режимами

### Development (с DNS):
```bash
make dev                # Поддомены через nginx.local.conf
```

### Production:
```bash
make prod               # Стандартная конфигурация nginx.prod.conf
```

### Локальная разработка (без Docker):
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Конфигурация

### DNS настройки (`deploy/docker/dnsmasq/dnsmasq.conf`):
```bash
# Локальные домены
address=/requify.local/127.0.0.1
address=/api.requify.local/127.0.0.1
address=/cdn.requify.local/127.0.0.1

# Upstream DNS
server=8.8.8.8
server=1.1.1.1
```

### Nginx маршрутизация (`deploy/nginx/nginx.local.conf`):
- `api.requify.local` → `backend:8000`
- `cdn.requify.local` → `minio:9000` 
- `requify.local` → `frontend:3000`

## Готово!

После настройки вы можете использовать:

- **Frontend**: http://requify.local
- **API**: http://api.requify.local  
- **CDN**: http://cdn.requify.local
- **Admin**: http://admin.requify.local
- **Docs**: http://docs.requify.local

Вся инфраструктура готова для продуктивной разработки!