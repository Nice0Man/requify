# Стандартизированная архитектура Dependencies

## 🎯 Обзор

Полностью стандартизированная система dependency injection для FastAPI с единообразным API, автоматической backward compatibility и лучшими практиками.

## 🏗️ Архитектура

### Базовые компоненты

```
dependencies/
├── core/                    # Базовые зависимости
│   ├── auth.py             # Аутентификация
│   └── database.py         # База данных
├── permissions/            # Permission-based dependencies  
│   ├── _base.py           # Базовые классы и миксины
│   ├── _interface.py      # Интерфейсы и конфигурации
│   ├── _standard.py       # Стандартизированные реализации
│   ├── factory.py         # Фабрика для создания dependencies
│   ├── base.py            # Legacy совместимость
│   ├── auth.py            # Аутентификация permissions
│   ├── users.py           # Пользователи
│   ├── projects.py        # Проекты
│   ├── requirements.py    # Требования
│   ├── releases.py        # Релизы
│   ├── testing.py         # Тестирование
│   ├── admin.py           # Администрирование
│   ├── dashboard.py       # Dashboard
│   ├── roles.py           # Роли
│   ├── company.py         # Компании
│   └── teams.py           # Команды
├── specialized/            # Специализированные зависимости
│   ├── auth0.py           # Auth0 интеграция
│   ├── validation.py      # Валидация
│   └── analytics.py       # Аналитика
└── utils/                  # Утилитарные зависимости
    ├── caching.py         # Кэширование
    └── helpers.py         # Вспомогательные функции
```

## 📝 Стандарты

### 1. Permission Classes

Все permission классы наследуются от `StandardPermissionClass`:

```python
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS

class UserPermissions(StandardPermissionClass):
    """Стандартизированные permissions для пользователей."""
    
    # Конфигурация домена (ОБЯЗАТЕЛЬНО)
    DOMAIN_CONFIG = DOMAIN_CONFIGS["User"]
    
    # Специфичные методы (опционально)
    @staticmethod
    def invite() -> Callable:
        return PermissionDependencyFactory.create_simple(
            Permission.INVITE_USERS, ["user:invite"]
        )
```

### 2. Стандартные методы

Каждый permission класс автоматически получает:

- `read()` - чтение данных
- `write()` - запись данных (создание + обновление) 
- `create()` - создание новых сущностей
- `update()` - обновление существующих сущностей
- `delete()` - удаление сущностей
- `admin()` - административные операции

### 3. Экспорты

Каждый permission класс автоматически предоставляет:

```python
# Backward compatibility (автоматические)
get_users_read_user = UserPermissions.get_legacy_functions()["get_user_read_user"]

# Modern exports (автоматические)
user_read_required = UserPermissions.get_exports()["userpermissions_read"]

# Специфичные (ручные)
user_invite_required = UserPermissions.invite()
```

### 4. Конфигурации доменов

Определены в `_interface.py`:

```python
DOMAIN_CONFIGS = {
    "User": PermissionConfig(
        domain_name="User",
        base_permission=Permission.VIEW_COMPANY_USERS,
        scopes_prefix="user",
        special_permissions={
            "read": Permission.VIEW_COMPANY_USERS,
            "write": Permission.MANAGE_COMPANY_USERS,
            "delete": Permission.REMOVE_USERS,
            # ...
        }
    ),
    # ... другие домены
}
```

## 🚀 Использование

### В Endpoints

```python
from app.api.dependencies import UserPermissions, ProjectPermissions

@router.get("/users/")
async def get_users(
    current_user: User = Depends(UserPermissions.read())
):
    pass

@router.post("/users/") 
async def create_user(
    current_user: User = Depends(UserPermissions.create())
):
    pass

@router.post("/users/invite")
async def invite_user(
    current_user: User = Depends(UserPermissions.invite())
):
    pass
```

### Convenience Exports

```python
from app.api.dependencies import (
    user_read_required,
    project_write_required,
    admin_analytics_required
)

@router.get("/users/")
async def get_users(current_user: User = Depends(user_read_required)):
    pass
```

### Backward Compatibility

```python
from app.api.dependencies import get_users_read_user

@router.get("/users/")
async def get_users(current_user: User = Depends(get_users_read_user)):
    pass
```

## 📊 Доступные Permission Classes

| Класс | Домен | Специфичные методы |
|-------|-------|-------------------|
| `AuthPermissions` | Аутентификация | `basic()`, `profile_access()` |
| `UserPermissions` | Пользователи | `invite()`, `profile_access()` |
| `ProjectPermissions` | Проекты | `archive()` |
| `RequirementPermissions` | Требования | `approve()` |
| `ReleasePermissions` | Релизы | `publish()` |
| `TestingPermissions` | Тестирование | `execute()`, `manage_plans()` |
| `AdminPermissions` | Администрирование | `system()`, `search()`, `analytics()` |
| `DashboardPermissions` | Dashboard | `stats()`, `export()` |
| `RolePermissions` | Роли | `assign()`, `revoke()` |
| `CompanyPermissions` | Компании | `settings()`, `branding()`, `subscription()`, `contact()` |
| `TeamPermissions` | Команды | `manage_members()`, `lead()` |

## 🔧 Расширение

### Добавление нового домена

1. Создайте конфигурацию в `_interface.py`:
```python
DOMAIN_CONFIGS["NewDomain"] = PermissionConfig(
    domain_name="NewDomain",
    base_permission=Permission.VIEW_PROJECT,
    scopes_prefix="newdomain",
    special_permissions={
        "read": Permission.VIEW_PROJECT,
        "write": Permission.MANAGE_PROJECT,
    }
)
```

2. Создайте permission класс:
```python
class NewDomainPermissions(StandardPermissionClass):
    DOMAIN_CONFIG = DOMAIN_CONFIGS["NewDomain"]
    
    @staticmethod
    def special_method() -> Callable:
        return PermissionDependencyFactory.create_simple(
            Permission.SPECIAL, ["newdomain:special"]
        )
```

3. Добавьте в `__init__.py`:
```python
from .permissions.newdomain import NewDomainPermissions

__all__.append("NewDomainPermissions")
```

### Добавление специального метода

```python
class ExistingPermissions(StandardPermissionClass):
    # ... existing code ...
    
    @staticmethod
    def new_method() -> Callable:
        """Новый специфичный метод."""
        return PermissionDependencyFactory.create_simple(
            Permission.NEW_PERMISSION, ["domain:new"]
        )
```

## ✅ Преимущества стандартизации

1. **Единообразие**: Все permission классы следуют одному паттерну
2. **Автоматизация**: Backward compatibility генерируется автоматически
3. **Масштабируемость**: Легко добавлять новые домены
4. **Типобезопасность**: Строгая типизация всех dependencies
5. **Документация**: Автоматическая генерация docstrings
6. **Тестируемость**: Единообразный интерфейс упрощает тестирование
7. **Производительность**: Кэширование dependencies в factory
8. **Обратная совместимость**: Полная совместимость с legacy кодом

## 🔍 Примеры миграции

### До стандартизации
```python
# Разные паттерны в разных файлах
class UserPermissions:
    @staticmethod
    def read():
        return PermissionDependencyFactory.create_simple(...)

def get_users_read_user():
    # Manual backward compatibility
    pass

user_read = UserPermissions.read()
```

### После стандартизации
```python
# Единый стандарт для всех доменов
class UserPermissions(StandardPermissionClass):
    DOMAIN_CONFIG = DOMAIN_CONFIGS["User"]
    
    # Все стандартные методы наследуются автоматически
    # Backward compatibility генерируется автоматически
    # Exports создаются автоматически
```

## 📚 Дополнительная документация

- `_base.py` - базовые классы и миксины
- `_interface.py` - интерфейсы и конфигурации
- `_standard.py` - стандартизированные реализации
- `factory.py` - фабрика для создания dependencies

Вся система следует принципам SOLID и лучшим практикам FastAPI.
