# 🔧 Решение проблемы Auth0 конфигурации

## 🚨 Проблема

При аутентификации через Auth0 возникала ошибка:
```
GET https://dev-requify.eu.auth0.com/authorize?client_id=demo-requify-client-id... 404 (Not Found)
```

## 🔍 Анализ проблемы

1. **Несоответствие доменов**: В ошибке `dev-requify.eu.auth0.com`, а в конфиге `dev-example.auth0.com`
2. **Разные Client ID**: В ошибке `demo-requify-client-id`, в конфиге `demo-client-id`
3. **Отсутствие единой конфигурации** между фронтендом и бэкендом
4. **Попытка использования несуществующего Auth0 tenant**

## ✅ Решение

### 1. Единая конфигурация для development

**Backend (`backend/env.development`):**
```bash
# Auth0 ОТКЛЮЧЕН в development - используется стандартная аутентификация
APP_CONFIG__AUTH0__ENABLED=false
APP_CONFIG__AUTH0__DOMAIN=localhost
APP_CONFIG__AUTH0__CLIENT_ID=demo-local-client-id
APP_CONFIG__AUTH0__CLIENT_SECRET=demo-local-client-secret
APP_CONFIG__AUTH0__AUDIENCE=https://api.requify.com
```

**Frontend (Docker compose):**
```bash
# Auth0 демо-режим
REACT_APP_AUTH0_DOMAIN=localhost
REACT_APP_AUTH0_CLIENT_ID=demo-local-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.requify.com
```

### 2. Конфигурация для production

Создан файл `backend/env.production.auth0` для реального Auth0 tenant:
```bash
APP_CONFIG__AUTH0__ENABLED=true
APP_CONFIG__AUTH0__DOMAIN=your-tenant.auth0.com
APP_CONFIG__AUTH0__CLIENT_ID=your-real-client-id
APP_CONFIG__AUTH0__CLIENT_SECRET=your-real-client-secret
APP_CONFIG__AUTH0__AUDIENCE=https://api.requify.com
```

### 3. Makefile команды

Добавлены новые команды для управления Auth0:
- `make auth0-demo` - Настройка демо-режима
- `make auth0-status` - Проверка статуса конфигурации
- `make auth0-setup` - Инструкции по настройке

### 4. Документация

Создан файл `frontend/AUTH0_SETUP_INSTRUCTIONS.md` с подробными инструкциями.

## 🚀 Быстрый запуск

### Для локальной разработки (без Auth0)

```bash
# 1. Запуск в демо-режиме
make dev

# 2. Проверка статуса
make auth0-status

# 3. Настройка демо-режима (опционально)
make auth0-demo
```

Приложение будет работать со стандартной аутентификацией (email/password).

### Для настройки реального Auth0

```bash
# 1. Получить инструкции
make auth0-setup

# 2. Создать .env.local во frontend/
cat > frontend/.env.local << 'EOF'
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-real-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.requify.com
VITE_API_BASE_URL=http://localhost:8000/api/v1
NODE_ENV=development
EOF

# 3. Обновить backend конфигурацию
# Скопировать backend/env.production.auth0 в backend/env.development
# и заменить значения на реальные

# 4. Перезапустить сервисы
make restart-frontend
make restart-backend
```

## 🔧 Настройка реального Auth0 tenant

### 1. Создание аккаунта
1. Зайдите на [Auth0.com](https://auth0.com)
2. Создайте бесплатный аккаунт
3. Создайте новый Tenant

### 2. Создание приложения
1. **Applications** → **Create Application**
2. Выберите **Single Page Application**
3. Выберите **React**

### 3. Настройка приложения
В настройках приложения:

**Application URIs:**
```
Allowed Callback URLs:
http://localhost:3000, https://yourdomain.com

Allowed Logout URLs:  
http://localhost:3000, https://yourdomain.com

Allowed Web Origins:
http://localhost:3000, https://yourdomain.com
```

### 4. Создание API
1. **APIs** → **Create API**
2. **Name**: `Requify API`
3. **Identifier**: `https://api.requify.com`
4. **Signing Algorithm**: `RS256`

### 5. Обновление конфигурации

**Frontend (.env.local):**
```bash
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-app-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.requify.com
```

**Backend (env файл):**
```bash
APP_CONFIG__AUTH0__ENABLED=true
APP_CONFIG__AUTH0__DOMAIN=your-tenant.auth0.com
APP_CONFIG__AUTH0__CLIENT_ID=your-app-client-id
APP_CONFIG__AUTH0__CLIENT_SECRET=your-app-client-secret
APP_CONFIG__AUTH0__AUDIENCE=https://api.requify.com
```

## 🔍 Проверка работы

### 1. Статус сервисов
```bash
make auth0-status
```

### 2. API проверка
```bash
curl http://localhost:8000/api/v1/auth/oauth2/auth0/status
```

Ответ для демо-режима:
```json
{
  "enabled": false,
  "domain": null,
  "audience": null
}
```

### 3. Frontend проверка
В консоли браузера не должно быть ошибок Auth0.

## 🚨 Устранение проблем

### Ошибка 404 при авторизации
- Проверьте правильность `DOMAIN` в конфиге
- Убедитесь, что tenant существует в Auth0
- Проверьте Callback URLs в настройках Auth0

### CORS ошибки
- Проверьте Allowed Web Origins в Auth0
- Убедитесь, что CORS настроен в бэкенде

### Токен невалидный
- Проверьте `AUDIENCE` в фронтенде и бэкенде
- Убедитесь, что API настроен в Auth0 с правильным Identifier

## 📋 Чек-лист для продакшена

- [ ] Создан реальный Auth0 tenant
- [ ] Настроены Callback URLs для продакшен домена
- [ ] Обновлены переменные окружения
- [ ] Проверена работа аутентификации
- [ ] Настроены социальные провайдеры (опционально)
- [ ] Настроены роли и разрешения
- [ ] Проведено тестирование безопасности

## 📁 Файлы конфигурации

- `backend/env.development` - Development с Auth0 отключен
- `backend/env.production.auth0` - Production с Auth0 включен  
- `frontend/AUTH0_SETUP_INSTRUCTIONS.md` - Подробные инструкции
- `deploy/docker/docker-compose.dev.yml` - Docker конфигурация
- `scripts/Makefile` - Команды для управления

## 💡 Рекомендации

1. **Для разработки**: Используйте демо-режим без Auth0
2. **Для продакшена**: Настройте реальный Auth0 tenant
3. **Безопасность**: Используйте переменные окружения, не коммитьте секреты
4. **Тестирование**: Проверьте все сценарии аутентификации 