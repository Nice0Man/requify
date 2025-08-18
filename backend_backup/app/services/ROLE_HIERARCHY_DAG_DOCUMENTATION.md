# Система иерархии ролей на основе DAG

## Обзор

Новая система иерархии ролей реализует направленный ациклический граф (DAG) для управления наследованием разрешений между ролями. Это позволяет создавать сложные иерархии ролей с поддержкой множественного наследования при гарантии отсутствия циклических зависимостей.

## Ключевые компоненты

### 1. Модели данных

#### RoleHierarchy
Основная модель для представления связей наследования между ролями:

```python
class RoleHierarchy(Base, TimestampedMixin):
    parent_role_id: int  # ID родительской роли (наследуемая)
    child_role_id: int   # ID дочерней роли (наследующая)
    inheritance_type: InheritanceType  # Тип наследования
    priority: int        # Приоритет при множественном наследовании
    conditions: Dict     # Условия наследования (JSON)
    is_active: bool      # Активна ли связь
```

#### InheritanceType
Типы наследования разрешений:

- **FULL** - Полное наследование всех разрешений родителя
- **PARTIAL** - Частичное наследование (только указанные разрешения)
- **OVERRIDE** - Переопределение разрешений родителя
- **RESTRICT** - Ограничение разрешений родителя (исключение указанных)

#### RoleHierarchyCache
Кеш для предвычисленных данных иерархии:

```python
class RoleHierarchyCache(Base):
    role_id: int
    cache_type: str      # ancestors, descendants, permissions
    cache_data: Dict     # Кешированные данные
    expires_at: datetime # Срок истечения кеша
```

### 2. Алгоритмы DAG

#### RoleDAG
Класс для представления и работы с графом ролей:

```python
class RoleDAG:
    def has_cycle() -> bool
    def find_cycle() -> Optional[List[int]]
    def topological_sort() -> List[int]
    def get_ancestors(role_id: int) -> Set[int]
    def get_descendants(role_id: int) -> Set[int]
    def compute_effective_permissions(role_id: int) -> Set[str]
```

**Основные алгоритмы:**

1. **Обнаружение циклов** - DFS с состояниями (белый, серый, черный)
2. **Топологическая сортировка** - Алгоритм Кана
3. **Поиск предков/потомков** - Рекурсивный DFS
4. **Вычисление эффективных разрешений** - Обход по топологическому порядку

### 3. Сервисы

#### RoleHierarchyService
Основной сервис для управления иерархией ролей:

```python
class RoleHierarchyService(BaseService):
    async def build_role_dag(db) -> RoleDAG
    async def validate_inheritance(db, parent_id, child_id) -> bool
    async def create_inheritance(db, parent_id, child_id, ...) -> RoleHierarchy
    async def get_role_effective_permissions(db, role_id) -> Set[str]
    async def get_role_ancestors(db, role_id) -> List[int]
    async def get_role_descendants(db, role_id) -> List[int]
```

**Особенности:**
- Кеширование DAG на 15 минут
- Валидация перед созданием связей
- Автоматическая инвалидация кеша при изменениях
- Обработка ошибок и логирование

#### Обновленный RoleService
Интегрирован с новой системой иерархии:

```python
# Новые методы в RoleService:
async def create_role_inheritance(...)
async def remove_role_inheritance(...)
async def get_role_ancestors(...)
async def get_role_descendants(...)
async def get_role_effective_permissions(...)
async def validate_role_inheritance(...)
async def find_inheritance_path(...)
async def get_hierarchy_conflicts(...)
```

### 4. API Endpoints

#### /api/v1/identity/role-hierarchy/

```http
POST   /create                    # Создать связь наследования
DELETE /{parent_id}/{child_id}    # Удалить связь наследования
GET    /role/{id}/ancestors       # Получить предков роли
GET    /role/{id}/descendants     # Получить потомков роли
GET    /role/{id}/info           # Информация о наследовании роли
GET    /path/{from}/{to}         # Найти путь наследования
POST   /validate                 # Валидировать связь
GET    /conflicts               # Получить конфликты
GET    /stats                   # Статистика иерархии
POST   /bulk-create             # Массовое создание связей
```

## Примеры использования

### 1. Создание простой иерархии

```python
# Admin наследует от Manager, Manager от User
await role_service.create_role_inheritance(
    db=db,
    parent_role_id=user_role.id,     # User
    child_role_id=manager_role.id,   # Manager наследует от User
    inheritance_type=InheritanceType.FULL
)

await role_service.create_role_inheritance(
    db=db,
    parent_role_id=manager_role.id,  # Manager  
    child_role_id=admin_role.id,     # Admin наследует от Manager
    inheritance_type=InheritanceType.FULL
)
```

**Результат:**
- User: ["read"]
- Manager: ["read", "manage"] (собственные + унаследованные)
- Admin: ["read", "manage", "admin"] (все унаследованные + собственные)

### 2. Частичное наследование

```python
await role_service.create_role_inheritance(
    db=db,
    parent_role_id=admin_role.id,
    child_role_id=moderator_role.id,
    inheritance_type=InheritanceType.PARTIAL,
    conditions={
        "inherited_permissions": ["read", "manage"]  # Только эти разрешения
    }
)
```

### 3. Множественное наследование

```python
# ProjectManager наследует от Manager и TeamLead
await role_service.create_role_inheritance(
    db=db,
    parent_role_id=manager_role.id,
    child_role_id=project_manager_role.id,
    inheritance_type=InheritanceType.FULL,
    priority=1  # Высокий приоритет
)

await role_service.create_role_inheritance(
    db=db,
    parent_role_id=team_lead_role.id,
    child_role_id=project_manager_role.id,
    inheritance_type=InheritanceType.FULL,
    priority=2  # Низкий приоритет
)
```

### 4. Получение эффективных разрешений

```python
# Получить все разрешения роли с учетом наследования
effective_perms = await role_service.get_role_effective_permissions(
    db=db,
    role_id=admin_role.id
)

# Получить разрешения пользователя
user_perms = await role_service.get_user_permissions(
    db=db,
    user=current_user,
    context_id=project.id
)
```

## Безопасность и валидация

### 1. Предотвращение циклов

Система автоматически проверяет и предотвращает создание циклических зависимостей:

```python
# Это вызовет CyclicDependencyError
try:
    await role_service.create_role_inheritance(
        db=db,
        parent_role_id=child_role.id,    # Потомок
        child_role_id=parent_role.id     # Предок
    )
except CyclicDependencyError as e:
    print(f"Цикл обнаружен: {e}")
```

### 2. Валидация связей

```python
is_valid, errors = await role_service.validate_role_inheritance(
    db=db,
    parent_role_id=parent_id,
    child_role_id=child_id
)

if not is_valid:
    print(f"Ошибки валидации: {errors}")
```

### 3. Обнаружение конфликтов

```python
conflicts = await role_service.get_hierarchy_conflicts(db=db)
for conflict in conflicts:
    print(f"Конфликт: {conflict['type']} - {conflict['description']}")
```

## Производительность

### 1. Кеширование

- **DAG кеш**: Весь граф кешируется на 15 минут
- **Разрешения кеш**: Эффективные разрешения кешируются на 1 час
- **Автоинвалидация**: Кеш сбрасывается при изменениях

### 2. Оптимизации

- Использование топологической сортировки для эффективного вычисления наследования
- Индексы базы данных для быстрого поиска связей
- Ленивая загрузка данных
- Пакетная обработка операций

### 3. Мониторинг

```python
# Получить статистику иерархии
stats = await role_service.get_hierarchy_stats(db=db)
print(f"Общее количество ролей: {stats.total_roles}")
print(f"Активных связей: {stats.active_relationships}")
print(f"Максимальная глубина: {stats.max_depth}")
print(f"Потенциальных конфликтов: {len(stats.potential_conflicts)}")
```

## Миграция с плоской системы

### 1. Подготовка

```sql
-- Создание новых таблиц (выполняется миграцией Alembic)
-- role_hierarchy
-- role_hierarchy_cache
```

### 2. Миграция данных

```python
# Пример миграции существующих ролей
async def migrate_existing_roles(db: AsyncSession):
    # Получаем все роли
    roles = await enhanced_role.get_multi(db)
    
    # Создаем базовую иерархию на основе role_level
    for role in roles:
        if role.role_level > 0:
            # Находим родительскую роль с меньшим уровнем
            parent_roles = [r for r in roles if r.role_level == role.role_level - 1]
            if parent_roles:
                parent = parent_roles[0]  # Берем первую подходящую
                await role_service.create_role_inheritance(
                    db=db,
                    parent_role_id=parent.id,
                    child_role_id=role.id,
                    inheritance_type=InheritanceType.FULL
                )
```

### 3. Обратная совместимость

Старые методы продолжают работать, но используют новую систему под капотом:

```python
# Этот код продолжает работать без изменений
user_permissions = await role_service.get_user_permissions(db, user)

# Но теперь учитывает иерархию ролей
```

## Мониторинг и отладка

### 1. Логирование

Все операции с иерархией ролей логируются:

```python
# В сервисе автоматически логируются:
# - Создание/удаление связей
# - Обнаружение циклов
# - Ошибки валидации
# - Статистика производительности
```

### 2. Метрики

```python
# Доступные метрики через API:
GET /api/v1/identity/role-hierarchy/stats

{
    "total_roles": 50,
    "total_relationships": 75,
    "active_relationships": 70,
    "inheritance_types_distribution": {
        "full": 60,
        "partial": 10,
        "restrict": 5
    },
    "max_depth": 5,
    "roles_with_multiple_parents": 8,
    "orphaned_roles": 2,
    "potential_conflicts": []
}
```

### 3. Отладочные инструменты

```python
# Поиск пути между ролями
path = await role_service.find_inheritance_path(
    db=db,
    source_role_id=1,
    target_role_id=5
)

if path:
    print(f"Путь найден: {path['path']}")
    print(f"Эффективные разрешения: {path['effective_permissions']}")
else:
    print("Путь наследования не найден")
```

## Лучшие практики

### 1. Проектирование иерархии

- **Принцип наименьших привилегий**: Роли должны иметь минимально необходимые разрешения
- **Логическая группировка**: Группируйте роли по функциональности или области ответственности
- **Избегайте глубокой вложенности**: Рекомендуемая максимальная глубина - 5-7 уровней
- **Документируйте бизнес-логику**: Каждая связь должна иметь понятное обоснование

### 2. Управление производительностью

- **Используйте кеширование**: Включайте кеш для часто запрашиваемых данных
- **Мониторьте конфликты**: Регулярно проверяйте и устраняйте конфликты
- **Оптимизируйте запросы**: Используйте пакетные операции для массовых изменений

### 3. Безопасность

- **Валидируйте изменения**: Всегда проверяйте корректность перед применением
- **Аудируйте операции**: Ведите журнал всех изменений в иерархии
- **Тестируйте сценарии**: Покрывайте тестами критические пути наследования

## Заключение

Новая система иерархии ролей на основе DAG предоставляет мощный и гибкий механизм для управления разрешениями в сложных приложениях. Она обеспечивает:

- ✅ **Безопасность** - предотвращение циклических зависимостей
- ✅ **Гибкость** - поддержка различных типов наследования
- ✅ **Производительность** - эффективные алгоритмы и кеширование
- ✅ **Масштабируемость** - поддержка сложных иерархий
- ✅ **Надежность** - валидация и обработка ошибок
- ✅ **Мониторинг** - инструменты для отладки и анализа

Система готова к использованию в производственной среде и полностью совместима с существующим кодом.
