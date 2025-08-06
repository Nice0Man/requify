# План миграции схем к лучшим практикам SQLModel

## Обзор

Данный документ описывает план поэтапной миграции существующих схем Pydantic к улучшенной архитектуре на основе SQLModel и современных паттернов FastAPI.

## Текущие проблемы

### 1. Архитектурные проблемы
- **Дублирование кода**: Модели SQLAlchemy и схемы Pydantic дублируют друг друга
- **Отсутствие унификации**: Нет единого подхода к определению схем
- **Нарушение DRY**: Множество похожих схем без переиспользования кода

### 2. Организационные проблемы
- **Гигантский __init__.py**: 845 строк импортов
- **Избыточность схем**: Например, для Comment 7+ различных классов
- **Отсутствие стандартов**: Нет единых паттернов именования и структуры

### 3. Функциональные проблемы
- **Слабая типизация**: Недостаточное использование Generic types
- **Отсутствие валидации**: Мало кастомных валидаторов
- **Плохая документация**: Недостаточно описаний для API

## Предлагаемое решение

### 1. Базовые классы (`schemas/base.py`)

Создана система базовых классов:

```python
# Основные базовые классы
BaseSchema           # Общие настройки
TimestampedBase      # Поля created_at, updated_at
CreateSchema         # Для создания записей
UpdateSchema         # Для обновления записей  
ResponseSchema       # Для ответов API
ListResponseSchema   # Для списков с пагинацией
StatisticsSchema     # Для статистики

# Специфичные базовые классы
UserRelatedSchema    # Связь с пользователем
CompanyRelatedSchema # Связь с компанией
ProjectRelatedSchema # Связь с проектом
```

### 2. Общие схемы (`schemas/common.py`)

Универсальные схемы для переиспользования:

```python
# Перечисления
StatusEnum, PriorityEnum, SortOrderEnum

# Ответы API
HealthCheckResponse, MessageResponse, ErrorResponse

# Пагинация и поиск
PaginationRequest, SearchRequest, DateRangeFilter

# Операции
BulkOperation, BulkOperationResult

# Файлы и уведомления
FileInfo, NotificationBase, SettingBase
```

### 3. Улучшенные схемы (`schemas/comment_v2.py`)

Пример правильной организации схем:

```python
# Базовая схема с валидацией
CommentBase(BaseSchema, ValidationMixin)

# CRUD схемы
CommentCreate(CommentBase, CreateSchema, UserRelatedSchema)
CommentUpdate(UpdateSchema, ValidationMixin)  
CommentResponse(CommentBase, ResponseSchema, UserRelatedSchema)

# Расширенные схемы
CommentWithAuthor, CommentDetailed

# Списки
CommentListResponse(ListResponseSchema[CommentWithAuthor])

# Поиск и фильтрация
CommentSearchRequest, CommentFilter

# Статистика
CommentStatistics, CommentAuthorStatistics

# Массовые операции
CommentBulkCreate, CommentBulkUpdate, CommentBulkDelete
```

## План миграции

### Этап 1: Подготовка (1-2 дня)

1. **Создание базовой инфраструктуры**
   - ✅ Создать `schemas/base.py`
   - ✅ Создать `schemas/common.py`
   - ✅ Создать пример `schemas/comment_v2.py`

2. **Настройка инструментов**
   - Обновить линтеры для проверки новых стандартов
   - Создать шаблоны для генерации схем
   - Настроить автотесты для валидации схем

### Этап 2: Миграция простых схем (2-3 дня)

Начать с простых схем, которые легко мигрировать:

1. **Reference data schemas**
   - `requirement_types.py`
   - `requirement_priorities.py`  
   - `requirement_statuses.py`
   - `relationship_types.py`

2. **Simple entity schemas**
   - `comment.py` → `comment_v2.py`
   - `test_case.py`
   - `test_result.py`
   - `relationship.py`

### Этап 3: Миграция средних схем (3-4 дня)

Схемы со средней сложностью:

1. **Core entity schemas**
   - `requirement.py`
   - `project.py`
   - `release.py`
   - `team.py`

2. **Support schemas**
   - `report.py`
   - `trace_matrix.py`
   - `spec.py`

### Этап 4: Миграция сложных схем (4-5 дней)

Самые сложные схемы с множеством связей:

1. **User-related schemas**
   - `user.py`
   - `user_profile.py`
   - `auth.py`

2. **Company schemas**
   - `company.py`
   - `company_settings.py`
   - `company_branding.py`
   - `company_subscription.py`
   - `department.py`

3. **Complex schemas**
   - `dashboard.py`
   - `enhanced_role.py`
   - `settings.py`

### Этап 5: Обновление __init__.py и очистка (1 день)

1. **Новый __init__.py**
   - Заменить текущий __init__.py на новую версию
   - Организовать импорты по группам
   - Добавить константы конфигурации

2. **Очистка**
   - Удалить старые схемы после миграции
   - Обновить импорты в других модулях
   - Запустить тесты

### Этап 6: Документация и тестирование (1-2 дня)

1. **Документация**
   - Создать руководство по использованию новых схем
   - Обновить API документацию
   - Добавить примеры использования

2. **Тестирование**
   - Создать тесты для базовых классов
   - Проверить совместимость с существующим кодом
   - Провести нагрузочное тестирование

## Паттерны и соглашения

### 1. Именование классов

```python
# Базовые схемы
{Entity}Base           # Базовая схема сущности

# CRUD схемы  
{Entity}Create         # Создание
{Entity}Update         # Обновление
{Entity}Response       # Ответ API

# Расширенные схемы
{Entity}With{Related}  # С связанными данными
{Entity}Detailed       # Детальная информация
{Entity}ListResponse   # Список с пагинацией

# Специальные схемы
{Entity}SearchRequest  # Поиск
{Entity}Filter         # Фильтрация
{Entity}Statistics     # Статистика
{Entity}Bulk{Action}   # Массовые операции
```

### 2. Структура файлов схем

```python
"""
Docstring модуля
"""

# Импорты
from typing import ...
from sqlmodel import ...
from .base import ...

# === Базовые схемы ===
class EntityBase(BaseSchema):
    pass

# === CRUD схемы ===
class EntityCreate(EntityBase, CreateSchema):
    pass

class EntityUpdate(UpdateSchema):
    pass

class EntityResponse(EntityBase, ResponseSchema):
    pass

# === Расширенные схемы ===
class EntityWithRelated(EntityResponse):
    pass

# === Списки и пагинация ===
class EntityListResponse(ListResponseSchema[EntityResponse]):
    pass

# === Поиск и фильтрация ===
class EntitySearchRequest(SearchRequest):
    pass

# === Статистика ===
class EntityStatistics(StatisticsSchema):
    pass

# === Массовые операции ===
class EntityBulkCreate(BaseSchema):
    pass

# === Конфигурация ===
class EntityConfig:
    pass
```

### 3. Валидация

```python
from .base import ValidationMixin

class EntityBase(BaseSchema, ValidationMixin):
    name: str = Field(...)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return cls.validate_non_empty_string(v, "name")
```

### 4. Документация полей

```python
from .base import StandardDescriptions, FieldLimits

class EntityBase(BaseSchema):
    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME
    )
```

## Преимущества новой архитектуры

### 1. Технические преимущества
- **DRY принцип**: Устранение дублирования кода
- **Типизация**: Лучшая поддержка Generic types
- **Валидация**: Унифицированные валидаторы
- **Производительность**: Оптимизированные схемы

### 2. Архитектурные преимущества  
- **Модульность**: Четкое разделение ответственности
- **Расширяемость**: Легко добавлять новые схемы
- **Читаемость**: Понятная структура кода
- **Тестируемость**: Проще писать тесты

### 3. Операционные преимущества
- **Документация**: Автоматическая генерация OpenAPI
- **Отладка**: Лучшие сообщения об ошибках
- **Поддержка**: Упрощенное сопровождение
- **Разработка**: Ускорение создания новых API

## Риски и митигация

### 1. Риски
- **Breaking changes**: Возможна несовместимость
- **Время миграции**: Много работы по переписыванию
- **Регрессии**: Возможны ошибки при миграции

### 2. Митигация
- **Поэтапная миграция**: По одной схеме за раз
- **Версионирование**: Параллельное существование old/new
- **Тестирование**: Тщательная проверка каждого этапа
- **Откат**: Возможность быстрого отката изменений

## Результат

После миграции получим:

1. **Сокращение кода**: ~50% меньше строк в схемах
2. **Улучшение производительности**: Быстрее валидация
3. **Лучшая документация**: Автоматические описания API
4. **Упрощение разработки**: Стандартные паттерны
5. **Повышение надежности**: Больше валидации и проверок

## Следующие шаги

1. **Получить одобрение** на план миграции
2. **Создать ветку** для разработки новых схем  
3. **Начать с Этапа 1**: Подготовка инфраструктуры
4. **Постепенно мигрировать** схемы по плану
5. **Тестировать на каждом этапе**
6. **Обновить документацию**

---

**Автор**: AI Assistant  
**Дата**: 2025-01-31  
**Версия**: 1.0