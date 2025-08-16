# MinIO Access Denied Fix - Решение проблемы доступа к bucket'ам

## Проблема

При загрузке аватаров пользователей возникает ошибка:

```xml
<Error>
<Code>AccessDenied</Code>
<Message>Access Denied.</Message>
<Key>users/1/2025/08/11/avatars_256x256_8445406f-9c53-4cca-81f8-4a06a217e4d7.png</Key>
<BucketName>requify-avatars</BucketName>
<Resource>/requify-avatars/users/1/2025/08/11/avatars_256x256_8445406f-9c53-4cca-81f8-4a06a217e4d7.png</Resource>
</Error>
```

## Причина

Проблема связана с тем, что MinIO bucket'ы создаются без правильных политик доступа. В частности:

1. **Bucket `requify-avatars`** должен иметь публичный доступ на чтение (для CDN)
2. **Bucket'ы `requify-uploads` и `requify-documents`** должны быть приватными
3. При создании bucket'ов через Python MinIO client не устанавливались политики доступа

## Решение

### 1. Автоматическое исправление (Рекомендуется)

#### Windows (PowerShell):
```powershell
.\scripts\fix-minio-buckets.ps1
```

#### Linux/macOS (Bash):
```bash
./scripts/fix-minio-buckets.sh
```

### 2. Ручное исправление

#### Вариант А: Через административный API

1. Запустите приложение:
   ```bash
   cd deploy/docker
   docker-compose up -d
   ```

2. Войдите в систему как администратор

3. Выполните POST запрос к эндпоинту:
   ```
   POST /api/v1/system/admin/file-service/fix-bucket-policies
   ```

#### Вариант Б: Через MinIO Client

1. Запустите инициализацию bucket'ов:
   ```bash
   cd deploy/docker
   docker-compose --profile init up mc
   ```

2. Или выполните команды вручную:
   ```bash
   # Подключение к MinIO
   docker exec -it requify_minio mc config host add myminio http://localhost:9000 admin minioadmin123

   # Создание bucket'ов
   docker exec -it requify_minio mc mb myminio/requify-avatars
   docker exec -it requify_minio mc mb myminio/requify-uploads  
   docker exec -it requify_minio mc mb myminio/requify-documents

   # Установка политик
   docker exec -it requify_minio mc policy set download myminio/requify-avatars
   docker exec -it requify_minio mc policy set none myminio/requify-uploads
   docker exec -it requify_minio mc policy set none myminio/requify-documents
   ```

### 3. Проверка исправления

1. Проверьте статус bucket'ов:
   ```bash
   docker exec requify_minio mc ls myminio/
   ```

2. Проверьте политики:
   ```bash
   docker exec requify_minio mc policy get myminio/requify-avatars
   docker exec requify_minio mc policy get myminio/requify-uploads
   docker exec requify_minio mc policy get myminio/requify-documents
   ```

3. Протестируйте загрузку аватара в веб-интерфейсе

## Технические изменения

### 1. Улучшенный File Service

В `backend/app/services/file_service.py` добавлены:

- **`_set_bucket_policy()`** - устанавливает политики доступа для bucket'ов
- **`force_bucket_policies_update()`** - принудительное обновление политик
- **Улучшенный `_ensure_buckets_exist()`** - создание bucket'ов с правильными политиками

### 2. Административные эндпоинты

В `backend/app/api/v1/domains/system/admin/router.py` добавлены:

- **`GET /system/admin/file-service/health`** - статус файлового сервиса
- **`POST /system/admin/file-service/fix-bucket-policies`** - исправление политик

### 3. Инициализация Docker

Добавлены файлы:

- **`deploy/docker/minio/init-buckets.sh`** - скрипт инициализации bucket'ов
- **`deploy/docker/docker-compose.init.yml`** - профиль для инициализации
- **`scripts/fix-minio-buckets.ps1`** - PowerShell скрипт исправления
- **`scripts/fix-minio-buckets.sh`** - Bash скрипт исправления

## Политики доступа

### Bucket: `requify-avatars`
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"AWS": "*"},
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::requify-avatars/*"]
        }
    ]
}
```

### Bucket: `requify-uploads` и `requify-documents`
```json
{
    "Version": "2012-10-17",
    "Statement": []
}
```

## Предотвращение проблемы в будущем

1. **При первом запуске** всегда используйте:
   ```bash
   docker-compose --profile init up mc
   ```

2. **FileService автоматически** проверяет и создает bucket'ы при инициализации

3. **Административные инструменты** доступны через API для диагностики и исправления

## Диагностика

### Проверка подключения к MinIO:
```bash
curl -f http://localhost:9000/minio/health/live
```

### Проверка статуса через API:
```bash
curl -X GET "http://localhost:8000/api/v1/system/admin/file-service/health" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Логи файлового сервиса:
```bash
docker logs requify_backend | grep -i minio
```

## Заключение

Данное исправление обеспечивает:

✅ **Правильные политики доступа** для всех MinIO bucket'ов  
✅ **Публичный доступ** к аватарам для CDN  
✅ **Приватный доступ** к загрузкам и документам  
✅ **Автоматическое восстановление** при проблемах  
✅ **Административные инструменты** для диагностики  
✅ **Скрипты автоматизации** для быстрого исправления  

После применения исправления загрузка аватаров должна работать корректно без ошибок `Access Denied`.
