# Modular Dependency System

Новая модульная система dependencies, следующая принципам SOLID и лучшим практикам архитектуры.

## Архитектура

### Принципы SOLID

1. **Single Responsibility Principle (SRP)**
   - Каждый модуль отвечает за один аспект dependency injection
   - Четкое разделение обязанностей между core, permissions, specialized и utils

2. **Open/Closed Principle (OCP)**
   - Система открыта для расширения через новые permission domains
   - Закрыта для модификации базовых компонентов

3. **Liskov Substitution Principle (LSP)**
   - Все permission dependencies взаимозаменяемы
   - Единый интерфейс для всех типов dependencies

4. **Interface Segregation Principle (ISP)**
   - Разделение на специфичные интерфейсы (read, write, delete)
   - Клиенты зависят только от нужных им методов

5. **Dependency Inversion Principle (DIP)**
   - Зависимость от абстракций, а не конкретных реализаций
   - Использование Factory pattern для создания dependencies

## Структура

```
app/api/dependencies/
├── __init__.py                 # Главный экспорт всех dependencies
├── core/                       # Базовые dependencies
│   ├── auth.py                # Аутентификация и авторизация
│   └── database.py            # Управление БД сессиями
├── permissions/               # Permission-based dependencies
│   ├── base.py               # Базовые классы и абстракции
│   ├── factory.py            # Фабрика для создания dependencies
│   ├── users.py              # Управление пользователями
│   ├── projects.py           # Управление проектами
│   ├── requirements.py       # Управление требованиями
│   ├── releases.py           # Управление релизами
│   ├── testing.py            # Тестирование
│   ├── admin.py              # Администрирование
│   └── auth.py               # Аутентификация permissions
├── specialized/              # Специализированные dependencies
│   ├── auth0.py             # Интеграция с Auth0
│   ├── validation.py        # Валидация данных
│   └── analytics.py         # Аналитика и отчеты
└── utils/                   # Утилиты
    ├── caching.py          # Кеширование dependencies
    └── helpers.py          # Вспомогательные функции
```

## Использование

### Базовые Dependencies

```python
from app.api.dependencies import get_db, get_current_user, SessionDep

@router.get("/items/")
async def get_items(
    db: SessionDep,
    current_user: User = Depends(get_current_user)
):
    return await crud.item.get_multi(db)
```

### Permission-based Dependencies

```python
from app.api.dependencies import UserPermissions

@router.post("/users/")
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(UserPermissions.write()),
    db: SessionDep
):
    return await crud.user.create(db, obj_in=user_data)
```

### Кеширование

```python
from app.api.dependencies.utils.caching import cache_medium

@cache_medium(ttl_seconds=300)
async def get_expensive_data(db: SessionDep) -> List[Dict]:
    return await crud.expensive_query(db)
```

### Валидация

```python
from app.api.dependencies.specialized.validation import ValidationDependencies

@router.get("/users/")
async def get_users(
    pagination: Dict = Depends(ValidationDependencies.valid_pagination()),
    search: Optional[str] = Depends(ValidationDependencies.valid_search_query())
):
    return await crud.user.get_multi(db, **pagination, search=search)
```

### Аналитика

```python
from app.api.dependencies.specialized.analytics import AnalyticsDependencies

@router.get("/analytics/users")
async def get_user_analytics(
    time_range: Dict = Depends(AnalyticsDependencies.time_range_params()),
    aggregation: Dict = Depends(AnalyticsDependencies.aggregation_params()),
    current_user: User = Depends(AdminPermissions.analytics())
):
    return await analytics_service.get_user_stats(time_range, aggregation)
```

## Миграция

### Из старой системы

```python
# Старый способ (deprecated)
from app.api.deps import get_users_write_user

# Новый способ
from app.api.dependencies import UserPermissions
# или
from app.api.dependencies.permissions.users import user_write_required
```

### Совместимость

Старый `app.api.deps` модуль поддерживается для обратной совместимости, но выдает предупреждения о deprecated использовании.

## Создание новых Dependencies

### 1. Простой Permission Dependency

```python
# В соответствующем domain файле (например, app/api/dependencies/permissions/my_domain.py)
from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory

class MyDomainPermissions:
    @staticmethod
    def read() -> Callable:
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_MY_DOMAIN,
            ["view_my_domain"]
        )
```

### 2. Кастомный Permission Checker

```python
from .base import PermissionChecker

class MyCustomChecker(PermissionChecker):
    def check_permission(self, user: User, permission: Permission, context: dict = None) -> bool:
        # Кастомная логика проверки
        return custom_logic(user, permission, context)
    
    def get_permission_error(self, permission: Permission) -> HTTPException:
        return HTTPException(
            status_code=403,
            detail=f"Custom error for {permission.value}"
        )
```

### 3. Specialized Dependency

```python
# В app/api/dependencies/specialized/my_integration.py
from typing import Optional
from fastapi import Depends

async def my_integration_dependency(
    token: str = Header(...),
    db: SessionDep
) -> Optional[MyIntegrationData]:
    # Логика интеграции
    return await my_integration_service.process(token, db)
```

## Тестирование

```python
import pytest
from app.api.dependencies import UserPermissions
from app.core.constants import Permission

@pytest.mark.asyncio
async def test_user_permission_dependency():
    dependency = UserPermissions.write()
    
    # Тест с валидным пользователем
    user = MockUser(permissions=[Permission.MANAGE_COMPANY_USERS])
    result = await dependency(current_user=user)
    assert result == user
    
    # Тест с невалидным пользователем
    user = MockUser(permissions=[])
    with pytest.raises(HTTPException):
        await dependency(current_user=user)
```

## Performance

- **Кеширование**: Автоматическое кеширование для дорогих operations
- **Factory Pattern**: Переиспользование созданных dependencies
- **LRU Cache**: Для stateless dependencies
- **Lazy Loading**: Dependencies создаются только при необходимости

## Мониторинг

Все dependencies автоматически логируют:
- Время выполнения
- Ошибки доступа
- Использование кеша
- Статистика permission checks

## Best Practices

1. **Используйте подходящий тип dependency** для каждой задачи
2. **Группируйте связанные permissions** в доменные модули
3. **Применяйте кеширование** для дорогих операций
4. **Тестируйте permission logic** отдельно от бизнес-логики
5. **Документируйте кастомные dependencies** с примерами использования
