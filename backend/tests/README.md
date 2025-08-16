# Тесты совместимости моделей и схем

Комплексная система тестирования для проверки совместимости между SQLAlchemy моделями и Pydantic схемами в проекте Requify.

## 🎯 Цель

Обеспечить полную совместимость между:
- SQLAlchemy моделями (models/)
- Pydantic схемами (schemas/)
- API сериализацией/десериализацией
- Валидацией данных

## 📁 Структура тестов

```
tests/
├── conftest.py                           # Общие фикстуры и конфигурация
├── pytest.ini                            # Настройки pytest
├── requirements-test.txt                  # Зависимости для тестирования
├── test_runner.py                         # Скрипт запуска тестов
├── test_models_schemas_compatibility.py   # Основные тесты совместимости
├── test_schema_validation_edge_cases.py   # Тесты крайних случаев
├── test_database_performance.py           # Тесты производительности
└── README.md                             # Этот файл
```

## 🧪 Типы тестов

### 1. Тесты совместимости моделей и схем
**Файл:** `test_models_schemas_compatibility.py`

- ✅ Соответствие полей между моделями и схемами
- ✅ Корректная сериализация/десериализация
- ✅ Валидация данных
- ✅ Работа с ORM отношениями
- ✅ Обработка сложных типов данных (JSON, datetime, decimal)

### 2. Тесты крайних случаев валидации
**Файл:** `test_schema_validation_edge_cases.py`

- ⚠️ Неправильные форматы email
- ⚠️ Запрещенные домены email  
- ⚠️ Зарезервированные имена пользователей
- ⚠️ Слабые пароли
- ⚠️ Граничные значения полей
- ⚠️ Unicode и специальные символы

### 3. Тесты производительности
**Файл:** `test_database_performance.py`

- 🚀 Производительность CRUD операций
- 🚀 Массовая сериализация
- 🚀 Оптимизация запросов (N+1 проблема)
- 🚀 Пагинация
- 🚀 Использование памяти
- 🚀 Конкурентный доступ

## 🚀 Быстрый старт

### Установка зависимостей

```bash
# Установка тестовых зависимостей
pip install -r tests/requirements-test.txt

# Или через poetry (если используется)
poetry install --with test
```

### Запуск тестов

#### Основные команды

```bash
# Все тесты совместимости
python tests/test_runner.py compatibility

# Тесты производительности  
python tests/test_runner.py performance

# Тесты крайних случаев
python tests/test_runner.py edge_cases

# Все тесты
python tests/test_runner.py all

# Только быстрые тесты (для CI/CD)
python tests/test_runner.py fast
```

#### Прямой запуск через pytest

```bash
# Тесты совместимости с покрытием кода
pytest tests/test_models_schemas_compatibility.py -v --cov=app.models --cov=app.schemas

# Тесты производительности с подробным выводом
pytest tests/test_database_performance.py -v -s --durations=0

# Тесты крайних случаев
pytest tests/test_schema_validation_edge_cases.py -v

# Все тесты с HTML отчетом
pytest tests/ --html=test_report.html --self-contained-html
```

### Маркеры тестов

```bash
# Только unit тесты
pytest -m unit

# Только тесты производительности
pytest -m performance  

# Только тесты совместимости
pytest -m compatibility

# Исключить медленные тесты
pytest -m "not slow"
```

## 📊 Отчеты и метрики

### Генерация отчетов

```bash
# Подробный HTML отчет
python tests/test_runner.py report

# Отчет покрытия кода
pytest --cov=app --cov-report=html:htmlcov/

# JSON отчет для интеграции
pytest --json-report --json-report-file=test_report.json
```

### Метрики производительности

Тесты автоматически проверяют:

- **Время создания пользователей:** < 2 секунды для 1000 записей
- **Скорость запросов:** < 0.5 секунды для 500 записей  
- **Сериализация:** < 1 секунды для 500 объектов
- **Использование памяти:** < 100MB для 2000 пользователей

## 🔧 Конфигурация

### pytest.ini
Основные настройки в `pytest.ini`:

```ini
[pytest]
markers =
    unit: Unit tests (fast, isolated)
    integration: Integration tests (slower, with database)
    performance: Performance and load tests (slow)
    compatibility: Model-schema compatibility tests

addopts = 
    --strict-markers
    --verbose
    --cov=app
    --cov-fail-under=80
```

### Переменные окружения

```bash
# Режим тестирования
export TESTING=true

# Тестовая база данных
export TEST_DATABASE_URL="sqlite:///:memory:"

# Отключение логов в тестах
export LOG_LEVEL=ERROR
```

## 📋 Фикстуры

### Основные фикстуры

- `test_db_session` - изолированная сессия БД для каждого теста
- `sample_user_data` - базовые данные пользователя
- `sample_company_data` - базовые данные компании
- `test_data_factory` - фабрика для создания тестовых данных

### Параметризованные фикстуры

- `user_count` - количество пользователей (10, 50, 100)
- `db_type` - тип БД для тестов (sqlite, memory)

## 🐛 Отладка тестов

### Запуск отдельного теста

```bash
# Конкретный тест
pytest tests/test_models_schemas_compatibility.py::TestModelSchemaFieldCompatibility::test_user_model_base_schema_fields_match -v -s

# Тест с отладкой
pytest tests/test_models_schemas_compatibility.py::TestUserSerializationPerformance::test_user_serialization_performance -v -s --pdb
```

### Логирование в тестах

```python
import logging
logger = logging.getLogger(__name__)

def test_something():
    logger.info("Начало теста")
    # тест
    logger.info("Завершение теста")
```

## 📈 CI/CD интеграция

### GitHub Actions пример

```yaml
- name: Run compatibility tests
  run: |
    python tests/test_runner.py fast
    python tests/test_runner.py compatibility --no-verbose

- name: Upload coverage reports
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage.xml
```

### Проверки качества

- **Покрытие кода:** минимум 80%
- **Производительность:** все benchmarks должны пройти
- **Валидация:** все edge cases покрыты

## 🔍 Что проверяют тесты

### Модели ↔ Схемы

- [x] Все поля модели есть в соответствующих схемах
- [x] Типы данных совпадают
- [x] Ограничения валидации корректны
- [x] Отношения ORM работают правильно

### Сериализация

- [x] ORM объекты корректно преобразуются в схемы
- [x] JSON сериализация работает
- [x] Datetime, Decimal, JSON поля обрабатываются
- [x] None значения корректно сериализуются

### Производительность

- [x] CRUD операции выполняются быстро
- [x] Нет проблемы N+1 запросов
- [x] Пагинация эффективна
- [x] Память используется разумно

### Валидация

- [x] Неправильные данные отклоняются
- [x] Граничные случаи обработаны
- [x] Сообщения об ошибках информативны
- [x] Unicode и спецсимволы поддерживаются

## 🤝 Участие в разработке

### Добавление новых тестов

1. Выберите подходящий файл тестов
2. Добавьте тест в соответствующий класс
3. Используйте существующие фикстуры
4. Добавьте маркеры для категоризации
5. Запустите тесты и проверьте покрытие

### Создание фикстур

```python
@pytest.fixture
def my_test_data():
    """Описание фикстуры."""
    return {"key": "value"}
```

### Маркировка тестов

```python
@pytest.mark.unit
@pytest.mark.compatibility
def test_something():
    """Тест совместимости."""
    pass
```

## 📚 Полезные ссылки

- [Pytest документация](https://docs.pytest.org/)
- [SQLModel тестирование](https://sqlmodel.tiangolo.com/tutorial/fastapi/tests/)
- [Pydantic валидация](https://docs.pydantic.dev/latest/concepts/validators/)
- [SQLAlchemy тестирование](https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)

---

**Создано для проекта Requify**  
Версия: 1.0  
Дата: 2025-01-08
