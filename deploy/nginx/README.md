# Nginx Configuration for Requify CDN

Эта конфигурация nginx обеспечивает:

- **CDN с защитой по ключам** для приватного контента
- **Публичные маршруты** для аватаров и статических файлов  
- **API Gateway** для backend с rate limiting
- **Frontend SPA** с поддержкой роутинга
- **Усиленная безопасность** с современными заголовками

## Структура маршрутов

### Frontend (по умолчанию)
- `GET /` - React SPA приложение
- Поддержка client-side роутинга
- Rate limit: 30-50 запросов/сек

### API Backend  
- `POST|GET|PUT|DELETE /api/*` - API endpoints
- CORS поддержка с preflight
- Rate limit: 20-30 запросов/сек
- Строгие ограничения для `/api/v1/auth/` (2 запроса/мин)

### CDN Routes

#### Публичный контент (без защиты)
- `GET /cdn/avatars/*` - Аватары пользователей
- `GET /cdn/static/*` - CSS, JS, шрифты
- `GET /cdn/public/*` - Общедоступные файлы
- Агрессивное кэширование (до 90 дней)

#### Защищенный контент (требует ключ)
- `GET /cdn/documents/*` - Приватные документы  
- `GET /cdn/private/*` - Защищенные файлы
- `GET /cdn/uploads/*` - Загруженные файлы пользователей

**Формат запроса:** `GET /cdn/documents/file.pdf?key=your_access_key`

## Настройка CDN ключей

### 1. Создание ключей доступа

Скопируйте `.env.example` в `.env` и настройте ключи:

```bash
cp .env.example .env
```

### 2. Конфигурация ключей в nginx.conf

```nginx
map $arg_key $valid_cdn_key {
    default 0;
    "your_production_key_32_chars" 1;
    "another_secure_key_here_2024" 1;
}
```

### 3. Проверка доступа

```bash
# Доступ разрешен
curl "https://your-domain.com/cdn/documents/file.pdf?key=your_production_key_32_chars"

# Доступ запрещен  
curl "https://your-domain.com/cdn/documents/file.pdf"
# Ответ: 403 {"error":"Access Denied","message":"Valid CDN key required"}
```

## Развертывание

### Development
```bash
cd deploy
make dev-up
```

### Production 
```bash
cd deploy  
make prod-up
```

### SSL сертификаты

Для продакшн среды разместите SSL сертификаты:
- `deploy/nginx/ssl/cert.pem` - SSL сертификат
- `deploy/nginx/ssl/key.pem` - Приватный ключ

Или используйте Let's Encrypt:
```bash
make ssl-setup
```

## Мониторинг

### Статус кэша CDN
```bash
curl http://localhost/cdn-status
```

### Логи
- Основные логи: `/var/log/nginx/access.log`
- CDN логи: `/var/log/nginx/cdn_access.log`  
- Ошибки: `/var/log/nginx/error.log`

### Метрики производительности

Nginx логирует время ответа и статус кэша:
```
cache_status=$upstream_cache_status 
rt=$request_time 
uct="$upstream_connect_time"
```

## Безопасность

### Заголовки безопасности
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`  
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

### Rate Limiting
- API: 20-30 req/s
- CDN защищенный: 3 req/s  
- CDN публичный: 50-100 req/s
- Frontend: 30-50 req/s

### Connection Limiting
- Максимум 50 соединений на IP
- Максимум 2000 соединений на сервер

## Кэширование

### CDN Cache
- Размер: 10GB (продакшн) / 2GB (dev)
- Время жизни: 240 минут неактивности
- Ключ кэша включает CDN ключ для защищенного контента

### Static Cache  
- Размер: 5GB (продакшн) / 1GB (dev)
- CSS/JS: 90 дней
- Шрифты: 1 год
- Изображения: 30 дней

## Конфигурационные файлы

- `nginx.conf` - Development/staging конфигурация
- `nginx.prod.conf` - Production конфигурация с SSL и усиленной безопасностью
- `cdn.conf` - Специализированная CDN-only конфигурация (опционально)

## Troubleshooting

### Проблемы с CDN ключами
1. Проверьте формат ключа (32+ символа)
2. Убедитесь что ключ добавлен в `map $arg_key $valid_cdn_key`
3. Перезагрузите nginx: `nginx -s reload`

### Проблемы с кэшированием
1. Очистка кэша: `rm -rf /var/cache/nginx/*`
2. Проверка статуса: `curl http://localhost/cdn-status`
3. Мониторинг заголовка `X-Cache-Status`

### SSL проблемы
1. Проверьте пути к сертификатам
2. Убедитесь в корректности прав доступа (600)
3. Проверьте валидность сертификата: `openssl x509 -in cert.pem -text -noout`

## Масштабирование

### Добавление upstream серверов
```nginx
upstream requify_backend {
    least_conn;
    server backend1:8000 max_fails=3 fail_timeout=30s weight=1;
    server backend2:8000 max_fails=3 fail_timeout=30s weight=1;
    keepalive 64;
}
```

### Настройка для высокой нагрузки
1. Увеличьте `worker_connections`
2. Оптимизируйте `proxy_cache_path` размеры
3. Настройте `worker_rlimit_nofile`
4. Включите HTTP/2 для HTTPS

## API для управления

### Получение статуса CDN
```http
GET /cdn-status
Authorization: Admin
```

### Очистка кэша (через API backend)
```http  
POST /api/v1/admin/cache/clear
Authorization: Bearer <admin_token>
```

Эта конфигурация обеспечивает production-ready setup с высокой производительностью, безопасностью и масштабируемостью.