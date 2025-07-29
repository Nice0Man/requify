# 🔐 Настройка Auth0 OAuth2 для Requify

Данное руководство поможет настроить Auth0 OAuth2 аутентификацию для системы управления требованиями Requify.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Настройка Auth0 Dashboard](#настройка-auth0-dashboard)
3. [Настройка Backend](#настройка-backend)
4. [Настройка Frontend](#настройка-frontend)
5. [Тестирование](#тестирование)
6. [Устранение неполадок](#устранение-неполадок)

## 🎯 Обзор

Auth0 OAuth2 интеграция позволяет:

- **Единый вход (SSO)** - пользователи могут войти через корпоративные аккаунты
- **Социальная аутентификация** - вход через Google, GitHub, Microsoft и др.
- **Многофакторная аутентификация (MFA)** - дополнительная безопасность
- **Централизованное управление пользователями** - через Auth0 Dashboard
- **Автоматическое создание пользователей** - при первом входе через Auth0

## 🚀 Настройка Auth0 Dashboard

### 1. Создание Auth0 аккаунта

1. Перейдите на [auth0.com](https://auth0.com) и зарегистрируйтесь
2. Создайте новый tenant (например, `requify-dev`)
3. Выберите регион (рекомендуется ближайший к вашим пользователям)

### 2. Создание приложения

1. В Auth0 Dashboard перейдите в **Applications**
2. Нажмите **Create Application**
3. Выберите имя: `Requify App`
4. Выберите тип: **Single Page Web Applications**
5. Нажмите **Create**

### 3. Настройка приложения

В настройках созданного приложения:

#### Settings Tab:
```
Domain: your-tenant.auth0.com
Client ID: [скопируйте для .env]
Client Secret: [скопируйте для .env]
```

#### Allowed Callback URLs:
```
http://localhost:3000/callback,
http://localhost:3000,
https://your-domain.com/callback,
https://your-domain.com
```

#### Allowed Logout URLs:
```
http://localhost:3000,
https://your-domain.com
```

#### Allowed Web Origins:
```
http://localhost:3000,
https://your-domain.com
```

#### Allowed Origins (CORS):
```
http://localhost:3000,
https://your-domain.com
```

### 4. Создание API

1. Перейдите в **APIs**
2. Нажмите **Create API**
3. Заполните:
   - **Name**: `Requify API`
   - **Identifier**: `https://api.requify.com`
   - **Signing Algorithm**: `RS256`

### 5. Настройка Machine to Machine Application

Для backend интеграции:

1. Перейдите в **Applications**
2. Найдите автоматически созданное M2M приложение для вашего API
3. Скопируйте **Client ID** и **Client Secret**
4. Выдайте необходимые scopes в разделе **APIs**

## ⚙️ Настройка Backend

### 1. Переменные окружения

Добавьте в `.env` файл:

```bash
# Auth0 OAuth2 Configuration
APP_CONFIG__AUTH0__ENABLED=true
APP_CONFIG__AUTH0__DOMAIN=your-tenant.auth0.com
APP_CONFIG__AUTH0__CLIENT_ID=your-spa-client-id
APP_CONFIG__AUTH0__CLIENT_SECRET=your-spa-client-secret
APP_CONFIG__AUTH0__AUDIENCE=https://api.requify.com
APP_CONFIG__AUTH0__MANAGEMENT_CLIENT_ID=your-m2m-client-id
APP_CONFIG__AUTH0__MANAGEMENT_CLIENT_SECRET=your-m2m-client-secret
```

### 2. Установка зависимостей

```bash
cd backend
poetry add auth0-python pyjwt[cryptography] jwcrypto
```

### 3. Перезапуск сервисов

```bash
# Через Docker
cd deploy/docker
docker compose -f docker-compose.dev.yml restart backend

# Или локально
cd backend
poetry install
python -m app.main
```

### 4. Проверка API эндпоинтов

Backend предоставляет следующие Auth0 эндпоинты:

- `POST /api/v1/auth/oauth2/auth0` - обработка Auth0 токенов
- `GET /api/v1/auth/oauth2/auth0/userinfo` - информация о пользователе
- `GET /api/v1/auth/oauth2/auth0/status` - статус конфигурации Auth0

## 🎨 Настройка Frontend

### 1. Переменные окружения

Создайте `.env.local` в папке frontend:

```bash
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-spa-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.requify.com
```

### 2. Конфигурация Auth0Provider

Файл уже настроен в `frontend/src/app/providers/Auth0Provider.tsx`:

```typescript
import { Auth0Provider } from '@auth0/auth0-react';
import { AUTH0_CONFIG } from '../config/auth0.config';

export const Auth0ProviderWrapper = ({ children }) => {
  return (
    <Auth0Provider
      domain={AUTH0_CONFIG.domain}
      clientId={AUTH0_CONFIG.clientId}
      audience={AUTH0_CONFIG.audience}
      redirectUri={window.location.origin}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
};
```

### 3. Интеграция с системой

Используйте хук `useAuth` для работы с аутентификацией:

```typescript
import { useAuth } from '@/features/auth/model/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Auth0</button>
      )}
    </div>
  );
};
```

## 🧪 Тестирование

### 1. Проверка конфигурации

```bash
# Проверьте статус Auth0
curl http://localhost:8000/api/v1/auth/oauth2/auth0/status
```

Ожидаемый ответ:
```json
{
  "enabled": true,
  "domain": "your-tenant.auth0.com",
  "audience": "https://api.requify.com"
}
```

### 2. Тестирование входа

1. Откройте http://localhost:3000
2. Нажмите кнопку "Login"
3. Войдите через Auth0
4. Проверьте создание пользователя в базе данных

### 3. Проверка токенов

```bash
# Получите токен из браузера (Developer Tools -> Application -> Local Storage)
curl -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
     http://localhost:8000/api/v1/auth/oauth2/auth0/userinfo
```

## 🔧 Устранение неполадок

### Ошибка "Auth0 is not configured"

**Проблема**: Backend не может найти настройки Auth0

**Решение**:
1. Проверьте переменные окружения в `.env`
2. Убедитесь что `APP_CONFIG__AUTH0__ENABLED=true`
3. Перезапустите backend сервис

### Ошибка "Invalid Auth0 token"

**Проблема**: Токен от Auth0 не проходит валидацию

**Решение**:
1. Проверьте что `audience` в конфигурации совпадает с API Identifier в Auth0
2. Убедитесь что домен правильный
3. Проверьте что токен не истек

### Ошибка CORS

**Проблема**: Браузер блокирует запросы

**Решение**:
1. Добавьте домен фронтенда в **Allowed Web Origins** в Auth0
2. Проверьте CORS настройки в backend (`cors_origins` в config.py)

### Пользователь не создается автоматически

**Проблема**: При входе через Auth0 пользователь не создается в системе

**Решение**:
1. Проверьте логи backend на ошибки
2. Убедитесь что поле `auth0_id` добавлено в модель User
3. Примените миграции базы данных

### Производительные проблемы

**Проблема**: Медленная работа с Auth0

**Решение**:
1. Включите кэширование токенов: `cacheLocation="localstorage"`
2. Используйте refresh токены: `useRefreshTokens={true}`
3. Настройте правильные expiration времена в Auth0

## 📚 Дополнительные ресурсы

- [Auth0 Documentation](https://auth0.com/docs)
- [Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)
- [Auth0 Python SDK](https://auth0.com/docs/libraries/auth0-python)
- [JWT.io](https://jwt.io) - для отладки токенов

## 🔒 Безопасность

### Рекомендации:

1. **Используйте HTTPS** в production
2. **Настройте MFA** для административных аккаунтов
3. **Регулярно ротируйте секреты**
4. **Мониторьте подозрительную активность** в Auth0 логах
5. **Настройте правила** для дополнительной безопасности

### Секреты в production:

- Используйте переменные окружения
- Не коммитьте секреты в git
- Используйте системы управления секретами (AWS Secrets Manager, Azure Key Vault)

---

**Важно**: Эта интеграция предоставляет гибкую систему аутентификации, которая может работать как с Auth0, так и без него (fallback на обычную JWT аутентификацию). 