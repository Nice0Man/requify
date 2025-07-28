# CDN Setup with MinIO and NGINX

Этот документ описывает настройку CDN (Content Delivery Network) для проекта Requify с использованием MinIO для хранения объектов и NGINX в качестве кэширующего прокси.

## Архитектура

```
Frontend/API → NGINX (CDN Proxy) → MinIO (Object Storage)
                    ↓
                Redis (Cache Metadata)
```

## Компоненты

### 1. MinIO Object Storage

- **Образ**: `minio/minio:latest`
- **Порты**:
  - `9000`: MinIO API
  - `9001`: MinIO Console (Web UI)
- **Buckets**:
  - `requify-avatars`: Аватары пользователей
  - `requify-uploads`: Общие загрузки
  - `requify-documents`: Документы (требуют авторизации)

### 2. NGINX CDN Proxy

- **Функции**:
  - Кэширование статических файлов
  - Сжатие изображений
  - Rate limiting
  - CORS headers
  - Cache headers optimization

### 3. Redis CDN Cache

- **Назначение**: Кэширование метаданных CDN
- **Конфигурация**: 256MB memory limit, LRU eviction

## Установка и запуск

### Быстрый старт

```bash
# Запуск основной инфраструктуры
docker-compose up -d

# Инициализация MinIO buckets (разовая операция)
docker-compose --profile init up mc
```

### Полная конфигурация

1. **Настройка переменных окружения**:

```bash
# Скопируйте пример конфигурации
cp deploy/env/cdn.env.example deploy/env/cdn.env

# Отредактируйте настройки
nano deploy/env/cdn.env
```

2. **Запуск сервисов**:

```bash
cd deploy/docker
docker-compose up -d postgres redis minio redis-cdn
```

3. **Инициализация buckets**:

```bash
docker-compose --profile init up mc
```

4. **Запуск приложения**:

```bash
docker-compose up -d app nginx
```

## URL endpoints

### Публичные CDN endpoints

- **Аватары**: `http://localhost/avatars/{path}`

  - Высокий уровень кэширования (1 час)
  - Автоматическое сжатие изображений
  - Множественные размеры (128x128, 256x256, 512x512)

- **Общие загрузки**: `http://localhost/cdn/uploads/{path}`

  - Средний уровень кэширования (30 минут)
  - Публичный доступ

- **Документы**: `http://localhost/cdn/documents/{path}`
  - Низкий уровень кэширования (5 минут)
  - Требует авторизации (TODO)

### Служебные endpoints

- **Cache Status**: `http://localhost/cache-status`
- **MinIO Console**: `http://localhost:9001`
- **MinIO API**: `http://localhost:9000`
- **File Service Health**: `http://localhost/api/v1/users/file-service/health`

## Конфигурация

### Backend Configuration

```python
# backend/app/core/config.py
class FileStorageConfig(BaseModel):
    use_minio: bool = True
    minio_endpoint: str = "minio:9000"
    cdn_enabled: bool = True
    cdn_base_url: str = "http://localhost"
    cdn_avatar_path: str = "/avatars"
```

### NGINX Configuration

Основные блоки в `deploy/nginx/nginx.conf`:

```nginx
# CDN Cache
proxy_cache_path /var/cache/nginx/cdn levels=1:2 keys_zone=cdn_cache:100m;

# MinIO Upstream
upstream minio_backend {
    server minio:9000 max_fails=3 fail_timeout=30s;
}

# Avatar CDN Route
location /avatars/ {
    proxy_pass http://minio_backend/requify-avatars/;
    proxy_cache cdn_cache;
    proxy_cache_valid 200 304 1h;
}
```

### Docker Configuration

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"

  nginx:
    volumes:
      - nginx_cache:/var/cache/nginx
```

## Мониторинг и отладка

### Проверка статуса сервисов

```bash
# Статус контейнеров
docker-compose ps

# Логи MinIO
docker-compose logs minio

# Логи NGINX
docker-compose logs nginx

# Логи приложения
docker-compose logs app
```

### Проверка здоровья CDN

```bash
# Health check файлового сервиса
curl http://localhost/api/v1/users/file-service/health

# Статус кэша NGINX
curl http://localhost/cache-status

# Проверка MinIO
curl http://localhost:9000/minio/health/live
```

### Тестирование загрузки файлов

```bash
# Загрузка аватара через API
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg" \
  http://localhost/api/v1/users/me/avatar

# Проверка доступности аватара через CDN
curl -I http://localhost/avatars/users/1/2025/01/28/avatars_256x256_uuid.jpg
```

## Производительность

### Cache optimization

- **Аватары**: Cache-Control: public, max-age=3600 (1 час)
- **Uploads**: Cache-Control: public, max-age=1800 (30 минут)
- **Documents**: Cache-Control: private, max-age=300 (5 минут)

### Rate limiting

- **API**: 10 запросов/сек
- **Assets**: 50 запросов/сек
- **Avatars**: 100 запросов/сек

### Image optimization

- Автоматическое изменение размера: 128x128, 256x256, 512x512
- JPEG качество: 85%
- Сжатие: GZIP для текстовых файлов

## Безопасность

### CORS Configuration

```nginx
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
```

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### File Validation

- Проверка типов файлов
- Ограничения размера (2MB для аватаров, 10MB для других файлов)
- Антивирусная проверка (опционально)

## Масштабирование

### Production recommendations

1. **Использование внешнего MinIO кластера**
2. **Настройка SSL/TLS сертификатов**
3. **Интеграция с CloudFlare или AWS CloudFront**
4. **Мониторинг с Prometheus/Grafana**

### Backup strategy

```bash
# Backup MinIO data
docker run --rm -v requify_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data

# Restore MinIO data
docker run --rm -v requify_minio_data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /
```

## Troubleshooting

### Частые проблемы

1. **MinIO не стартует**:

   - Проверьте права доступа к директории данных
   - Убедитесь, что порты 9000/9001 свободны

2. **NGINX 502 Bad Gateway**:

   - Проверьте, что MinIO запущен и доступен
   - Проверьте upstream конфигурацию

3. **Файлы не кэшируются**:

   - Проверьте права на директорию `/var/cache/nginx`
   - Убедитесь, что proxy_cache_path настроен правильно

4. **CORS ошибки**:
   - Проверьте CORS заголовки в NGINX конфигурации
   - Убедитесь, что preflight запросы обрабатываются

### Полезные команды

```bash
# Очистка кэша NGINX
docker exec requify_nginx rm -rf /var/cache/nginx/cdn/*

# Перезагрузка NGINX конфигурации
docker exec requify_nginx nginx -s reload

# Просмотр MinIO логов
docker exec requify_minio cat /opt/minio/log/minio.log

# Проверка содержимого bucket
docker exec requify_mc mc ls myminio/requify-avatars
```

## API Integration

### FileService methods

```python
from app.services.file_service import file_service

# Загрузка аватара
avatar_url = await file_service.upload_avatar(file, user_id, db)

# Проверка здоровья
health = file_service.get_health_status()

# Удаление аватара
success = await file_service.delete_avatar(avatar_url)
```

### Frontend integration

```typescript
// Загрузка файла
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/v1/users/me/avatar", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

// Отображение аватара
const avatarUrl = `/avatars/users/${userId}/avatar_256x256_uuid.jpg`;
```

---

**Примечание**: Эта конфигурация предназначена для разработки. Для продакшена рекомендуется использовать HTTPS, внешние сертификаты и дополнительные меры безопасности.
