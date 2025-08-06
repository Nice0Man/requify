# Comprehensive Model Testing Suite

Этот набор тестов обеспечивает полное покрытие всех моделей SQLAlchemy в проекте, включая relationships, валидацию, бизнес-логику и производительность.

## 📋 Структура тестов

### 🔧 Основные файлы тестов

1. **`test_models_comprehensive.py`** - Основные тесты всех моделей
   - Базовые операции CRUD
   - Relationships и back_populates
   - Constraints и валидация
   - Cascade delete поведение
   - Интеграционные тесты

2. **`test_models_advanced.py`** - Продвинутые тесты
   - Сложные модели компании (Settings, Branding, Subscription)
   - Enhanced Role System
   - Производительность и оптимизация
   - Bulk операции

3. **`test_models_specialized.py`** - Специализированные тесты
   - Mixins и базовые классы
   - Constants и Enums
   - Reference data модели
   - User Profile и Settings
   - Dashboard модели
   - Edge cases

4. **`conftest.py`** - Конфигурация pytest
   - Fixtures для баз данных
   - Factory для тестовых данных
   - Утилиты для тестирования

## 🚀 Запуск тестов

### Все тесты моделей

```bash
# Запустить все тесты моделей
pytest tests/test_models_*.py -v

# Запустить с подробным выводом
pytest tests/test_models_*.py -v -s

# Запустить с покрытием кода
pytest tests/test_models_*.py --cov=app.models --cov-report=html
```

### Специфические группы тестов

```bash
# Только основные тесты
pytest tests/test_models_comprehensive.py -v

# Только продвинутые тесты
pytest tests/test_models_advanced.py -v

# Только специализированные тесты
pytest tests/test_models_specialized.py -v
```

### По маркерам

```bash
# Только тесты relationships
pytest -m relationships -v

# Только интеграционные тесты
pytest -m integration -v

# Только тесты производительности
pytest -m performance -v

# Только тесты бизнес-логики
pytest -m business_logic -v

# Исключить медленные тесты
pytest -m "not slow" -v

# Только edge cases
pytest -m edge_cases -v
```

### Специфические модели

```bash
# Тесты User модели
pytest tests/test_models_comprehensive.py::TestUserModel -v

# Тесты Company моделей
pytest tests/test_models_advanced.py::TestCompanySettingsModel -v

# Тесты Dashboard моделей
pytest tests/test_models_comprehensive.py::TestDashboardModels -v

# Тесты Enhanced Role System
pytest tests/test_models_advanced.py::TestEnhancedRoleSystemAdvanced -v
```

### Параллельный запуск

```bash
# Запуск в 4 процесса (требует pytest-xdist)
pytest tests/test_models_*.py -n 4

# Автоматическое определение количества процессов
pytest tests/test_models_*.py -n auto
```

## 📊 Покрытие тестами

### Проверенные модели

✅ **Основные модели:**
- `User` - пользователи системы
- `Company` - компании
- `Department` - департаменты
- `Team` - команды
- `TeamMember` - участники команд
- `Project` - проекты
- `Requirement` - требования
- `Comment` - комментарии
- `Release` - релизы
- `Spec` - спецификации

✅ **Reference Data модели:**
- `RequirementType` - типы требований
- `RequirementPriority` - приоритеты требований
- `RequirementStatus` - статусы требований
- `RelationshipType` - типы связей

✅ **Расширенные модели:**
- `UserProfile` - профили пользователей
- `UserSettings` - настройки пользователей
- `RefreshToken` - токены обновления
- `Relationship` - связи между требованиями
- `RequirementGroup` - группы требований
- `RequirementGroupVersion` - версии групп
- `TestResult` - результаты тестирования

✅ **Dashboard модели:**
- `UserDashboardPreferences` - настройки дашборда
- `DashboardNotification` - уведомления
- `DashboardActivity` - активность
- `DashboardWidget` - виджеты

✅ **Company модели:**
- `CompanySettings` - настройки компании
- `CompanyBranding` - брендинг компании
- `CompanyContact` - контакты компании
- `CompanySubscription` - подписки компании

✅ **Enhanced Role System:**
- `EnhancedRole` - расширенные роли
- `UserRoleAssignment` - назначения ролей

✅ **Mixins и базовые классы:**
- `TimestampedMixin` - временные метки
- `Base` - базовая модель
- Constants и Enums

## 🧪 Типы тестов

### 1. Unit Tests
- Создание и валидация моделей
- Основные атрибуты и методы
- Constraints и unique индексы
- Enum и constants значения

### 2. Relationship Tests  
- Back_populates связи
- Foreign key constraints
- Cascade операции
- Lazy loading

### 3. Business Logic Tests
- Методы моделей
- Computed properties
- Валидация данных
- State management

### 4. Integration Tests
- Полные workflow сценарии
- Cross-model взаимодействия
- Транзакционная целостность
- Complex queries

### 5. Performance Tests
- Bulk операции
- Eager loading оптимизация
- N+1 query prevention
- Query performance

### 6. Edge Cases
- Null values handling
- Unicode data
- Large text fields
- Concurrent access simulation
- Error conditions

## 🔧 Конфигурация

### pytest.ini
Файл содержит настройки для:
- Автоматические маркеры
- Фильтрация warning'ов
- Логирование
- Test discovery

### conftest.py
Предоставляет:
- Database fixtures с in-memory SQLite
- Transaction isolation
- Test data factories
- Common fixtures
- Utility functions

## 📈 Метрики и отчетность

### Coverage Report
```bash
# HTML отчет о покрытии
pytest tests/test_models_*.py --cov=app.models --cov-report=html

# Терминальный отчет
pytest tests/test_models_*.py --cov=app.models --cov-report=term-missing

# XML отчет для CI/CD
pytest tests/test_models_*.py --cov=app.models --cov-report=xml
```

### Performance Profiling
```bash
# Профилирование производительности
pytest tests/test_models_advanced.py::TestModelPerformance --profile

# Memory usage
pytest tests/test_models_*.py --memory-profiler
```

## 🐛 Debugging

### Включить SQL логи
```bash
# Показать все SQL запросы
pytest tests/test_models_comprehensive.py::TestUserModel::test_user_creation -v -s --log-cli-level=DEBUG
```

### Остановка на первой ошибке
```bash
pytest tests/test_models_*.py -x
```

### Запуск конкретного failing теста
```bash
pytest tests/test_models_comprehensive.py::TestUserModel::test_user_unique_email -v -s --pdb
```

## 📝 Примеры команд

### Быстрая проверка основных моделей
```bash
pytest tests/test_models_comprehensive.py -k "test_creation" -v
```

### Проверка relationships
```bash
pytest tests/test_models_comprehensive.py -k "relationship" -v
```

### Полная интеграционная проверка
```bash
pytest tests/test_models_specialized.py::TestComprehensiveIntegration::test_full_system_integration -v -s
```

### CI/CD команда
```bash
pytest tests/test_models_*.py --cov=app.models --cov-report=xml --junitxml=test-results.xml -v
```

## 🎯 Best Practices

1. **Изоляция тестов** - каждый тест использует чистую базу
2. **Factory pattern** - создание тестовых данных через factories
3. **Fixture reuse** - переиспользование общих fixtures
4. **Clear naming** - понятные имена тестов и fixtures
5. **Comprehensive coverage** - покрытие всех edge cases
6. **Performance awareness** - тесты производительности
7. **Real-world scenarios** - тесты реальных workflow

## 🔍 Troubleshooting

### Общие проблемы

1. **Foreign key constraint errors**
   - Проверить правильность создания связанных объектов
   - Убедиться в правильном порядке создания

2. **Relationship не загружается**
   - Проверить back_populates настройки
   - Убедиться в правильности foreign_keys

3. **Тесты падают с IntegrityError**
   - Проверить unique constraints
   - Использовать уникальные значения в тестах

4. **Медленные тесты**
   - Использовать in-memory SQLite
   - Оптимизировать количество тестовых данных
   - Применять маркер @pytest.mark.slow

### Полезные команды для отладки

```bash
# Показать все fixtures
pytest --fixtures

# Показать структуру тестов
pytest --collect-only

# Запустить с максимальной детализацией
pytest tests/test_models_comprehensive.py -vvv -s --tb=long

# Запустить только failed тесты
pytest --lf
```

---

**Автор:** AI Assistant  
**Дата создания:** 2024  
**Версия:** 1.0  
**Статус:** Ready for Production Testing