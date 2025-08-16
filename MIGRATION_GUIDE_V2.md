# Руководство по миграции на API v2

## Обзор

Это руководство поможет вам мигрировать с API v1 на новую современную архитектуру API v2 с улучшенной организацией, типизацией и RBAC.

## Быстрый старт

### 1. Обновление базовых URL

**До (v1):**
```
GET /api/v1/users/me
POST /api/v1/auth/login
GET /api/v1/projects/
```

**После (v2):**
```
GET /api/v2/identity/users/me
POST /api/v2/auth/login
GET /api/v2/projects/
```

### 2. Подключение к существующему приложению

```python
# backend/app/main.py
from app.main_v2_integration import setup_v2_integration

# Интеграция v2 API в существующее приложение
app = setup_v2_integration(app)
```

### 3. Проверка работоспособности

```bash
# Проверить доступные версии API
curl http://localhost:8000/api/versions

# Тестировать v2 endpoint
curl http://localhost:8000/api/v2/auth/
```

## Детальная миграция по доменам

### 🔐 Authentication Domain

**Маппинг endpoints:**
| v1 | v2 | Изменения |
|----|----|-----------| 
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` | ✅ Без изменений |
| `POST /api/v1/auth/register` | `POST /api/v2/auth/register` | ✅ Без изменений |
| `POST /api/v1/auth/refresh` | `POST /api/v2/auth/refresh` | ✅ Без изменений |
| `GET /api/v1/auth/sessions` | `GET /api/v2/auth/sessions` | ✅ Без изменений |

**Изменения в схемах:**
```typescript
// v1
interface LoginRequest {
  username: string;
  password: string;
}

// v2 (расширенная)
interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;      // НОВОЕ
  device_info?: object;       // НОВОЕ
}
```

### 👤 Identity Management Domain

**Маппинг endpoints:**
| v1 | v2 | Изменения |
|----|----|-----------| 
| `GET /api/v1/users/` | `GET /api/v2/identity/users` | 🔄 Новый путь |
| `GET /api/v1/users/me` | `GET /api/v2/identity/users/me` | 🔄 Новый путь |
| `GET /api/v1/users/profiles/me` | `GET /api/v2/identity/profiles/me` | 🔄 Новый путь |
| `GET /api/v1/roles/` | `GET /api/v2/identity/roles` | 🔄 Новый путь |

**Новые возможности:**
- ✨ Расширенная информация профиля
- ✨ Контекстные разрешения ролей
- ✨ Иерархические проверки доступа

### 🏢 Organizations Domain

**Маппинг endpoints:**
| v1 | v2 | Изменения |
|----|----|-----------| 
| `GET /api/v1/companies/` | `GET /api/v2/organizations/companies` | 🔄 Новый путь |
| `GET /api/v1/departments/` | `GET /api/v2/organizations/departments` | 🔄 Новый путь |
| `GET /api/v1/teams/` | `GET /api/v2/organizations/teams` | 🔄 Новый путь |

### 📊 Projects Domain

**Маппинг endpoints:**
| v1 | v2 | Изменения |
|----|----|-----------| 
| `GET /api/v1/projects/` | `GET /api/v2/projects/` | ✅ Без изменений |
| `GET /api/v1/requirements/` | `GET /api/v2/projects/{id}/requirements` | 🔄 Иерархическая структура |
| `GET /api/v1/releases/` | `GET /api/v2/projects/{id}/releases` | 🔄 Иерархическая структура |

**Важные изменения:**
- Requirements и Releases теперь вложены в проекты
- Улучшенная контекстная проверка разрешений
- Новые endpoints для аналитики проектов

### 📊 Analytics Domain

**Маппинг endpoints:**
| v1 | v2 | Изменения |
|----|----|-----------| 
| `GET /api/v1/dashboard/` | `GET /api/v2/analytics/dashboard/` | 🔄 Новый домен |
| `GET /api/v1/dashboard/stats` | `GET /api/v2/analytics/dashboard/overview` | 🔄 Переименование |

## Изменения в зависимостях

### Новые типизированные зависимости

**v1:**
```python
@router.get("/users/")
async def get_users(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
```

**v2:**
```python
from app.api.v2.dependencies import DatabaseDep, CurrentActiveUserDep

@router.get("/users/")
async def get_users(
    db: DatabaseDep,
    current_user: CurrentActiveUserDep,
):
```

### Улучшенная система разрешений

**v1:**
```python
@router.get("/projects/{project_id}")
@requires_permission("view_project")
async def get_project(project_id: int):
```

**v2:**
```python
@router.get("/projects/{project_id}")
async def get_project(
    project_id: int,
    _: CurrentActiveUserDep = Depends(ProjectPermissions.read())
):
```

## Обратная совместимость

### Поддержка dual API

Система поддерживает одновременную работу v1 и v2:

```python
# v1 endpoints (deprecated)
app.include_router(v1_api_router, prefix="/api/v1", deprecated=True)

# v2 endpoints (modern)
app.include_router(v2_api_router, prefix="/api/v2")
```

### Deprecation Headers

Все v1 endpoints возвращают headers:
```
X-API-Deprecated: true
X-API-Sunset: 2024-12-31
X-API-Migration-Guide: /docs/migration-v2
Link: <http://api.example.com/v2/endpoint>; rel="successor-version"
```

### Автоматические редиректы

```bash
# Принудительное использование v2
curl -H "X-Force-API-Version: 2" http://localhost:8000/api/v1/auth/login
# → Автоматический редирект на /api/v2/auth/login
```

## Миграция клиентских приложений

### JavaScript/TypeScript

**v1 клиент:**
```typescript
// Старый API client
const apiClient = {
  baseURL: '/api/v1',
  
  async getUsers() {
    return fetch(`${this.baseURL}/users/`);
  }
};
```

**v2 клиент:**
```typescript
// Новый API client с доменами
const apiClient = {
  baseURL: '/api/v2',
  
  identity: {
    async getUsers() {
      return fetch(`${this.baseURL}/identity/users`);
    }
  },
  
  projects: {
    async getProjects() {
      return fetch(`${this.baseURL}/projects/`);
    }
  }
};
```

### Python клиент

**v1:**
```python
import requests

class RequifyAPI:
    def __init__(self):
        self.base_url = "http://api.example.com/api/v1"
    
    def get_users(self):
        return requests.get(f"{self.base_url}/users/")
```

**v2:**
```python
import requests

class RequifyAPIv2:
    def __init__(self):
        self.base_url = "http://api.example.com/api/v2"
    
    @property
    def identity(self):
        return IdentityAPI(self.base_url)

class IdentityAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def get_users(self):
        return requests.get(f"{self.base_url}/identity/users")
```

## Тестирование миграции

### Автоматические тесты

```python
# tests/test_migration.py
import pytest
from fastapi.testclient import TestClient

def test_v1_v2_compatibility():
    """Тест совместимости v1 и v2 API."""
    
    # v1 должен работать и возвращать deprecation headers
    response_v1 = client.get("/api/v1/users/me")
    assert response_v1.status_code == 200
    assert "X-API-Deprecated" in response_v1.headers
    
    # v2 должен работать с новой структурой
    response_v2 = client.get("/api/v2/identity/users/me")
    assert response_v2.status_code == 200
    assert "X-API-Version" in response_v2.headers

def test_endpoint_mapping():
    """Тест маппинга endpoints между версиями."""
    mappings = [
        ("/api/v1/users/me", "/api/v2/identity/users/me"),
        ("/api/v1/projects/", "/api/v2/projects/"),
        ("/api/v1/companies/", "/api/v2/organizations/companies"),
    ]
    
    for v1_endpoint, v2_endpoint in mappings:
        v1_response = client.get(v1_endpoint)
        v2_response = client.get(v2_endpoint)
        
        # Оба должны работать
        assert v1_response.status_code == 200
        assert v2_response.status_code == 200
```

### Мониторинг миграции

```python
# monitoring/migration_metrics.py
from collections import defaultdict

class MigrationMetrics:
    def __init__(self):
        self.v1_usage = defaultdict(int)
        self.v2_usage = defaultdict(int)
    
    def track_request(self, path: str):
        if path.startswith("/api/v1/"):
            self.v1_usage[path] += 1
        elif path.startswith("/api/v2/"):
            self.v2_usage[path] += 1
    
    def get_migration_progress(self):
        total_v1 = sum(self.v1_usage.values())
        total_v2 = sum(self.v2_usage.values())
        total = total_v1 + total_v2
        
        if total == 0:
            return 0
        
        return (total_v2 / total) * 100
```

## Временные рамки миграции

### Фаза 1: Dual API (текущая)
- ✅ v1 и v2 API работают параллельно
- ✅ v1 помечен как deprecated
- ✅ Документация доступна для обеих версий

### Фаза 2: Поощрение миграции (следующие 3 месяца)
- 📧 Email уведомления разработчикам
- 📊 Метрики использования API
- 🔔 Warning headers в v1 ответах

### Фаза 3: Sunset v1 (через 6 месяцев)
- ⚠️ v1 API начинает возвращать 410 Gone
- 🔄 Автоматические редиректы на v2
- 📞 Поддержка для проблемных случаев

### Фаза 4: Удаление v1 (через 12 месяцев)
- ❌ Полное отключение v1 API
- 🎯 Только v2 API в production

## Получение помощи

### Документация
- 📖 [API v2 Docs](/docs#tag/API-v2-(Modern))
- 📖 [Детальная RBAC матрица](./RBAC_PERMISSION_MATRIX.md)
- 📖 [Примеры использования](./API_EXAMPLES.md)

### Поддержка
- 💬 GitHub Issues для технических вопросов
- 📧 Email поддержка для срочных случаев
- 🤝 1-on-1 сессии для сложных миграций

### Инструменты миграции
- 🔧 [API Migration Tool](./tools/migrate_api_calls.py)
- 🧪 [Compatibility Tester](./tools/test_api_compatibility.py)
- 📊 [Usage Analytics](./tools/analyze_api_usage.py)

## Часто задаваемые вопросы

### Q: Можно ли использовать v1 и v2 одновременно?
A: Да, система поддерживает dual API режим. Вы можете мигрировать постепенно.

### Q: Изменились ли схемы данных?
A: Большинство схем остались совместимыми. v2 добавляет новые поля, но не удаляет существующие.

### Q: Нужно ли обновлять токены авторизации?
A: Нет, JWT токены работают с обеими версиями API.

### Q: Что делать с кастомными интеграциями?
A: Используйте маппинг таблицу выше или обратитесь в поддержку для индивидуальной помощи.

### Q: Когда v1 перестанет работать?
A: v1 будет полностью отключен через 12 месяцев (см. временные рамки выше).

---

**Успешной миграции! 🚀**
