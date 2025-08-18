"""
SQLAlchemy модели.
Полностью обновлено для 4NF архитектуры с многопользовательской поддержкой.
"""

import os
import importlib
from typing import List


# Автоматический импорт всех моделей из папки models
def _import_all_models():
    """
    Автоматически импортирует все модели из текущей директории.
    Исключает служебные файлы и __init__.py
    """
    current_dir = os.path.dirname(__file__)
    model_files = []

    # Получаем все Python файлы в директории
    for filename in os.listdir(current_dir):
        if (
            filename.endswith(".py")
            and not filename.startswith("__")
            and filename != "__init__.py"
        ):
            module_name = filename[:-3]  # убираем .py
            model_files.append(module_name)

    # Импортируем модули и собираем все экспортируемые объекты
    all_exports = []
    globals_dict = globals()

    # Определяем порядок импорта по уровням зависимостей
    # Уровень 1: Базовые модели без FK или справочники
    level1 = ["base", "mixins", "constants"]

    # Уровень 2: User должен быть первым!
    level2 = ["user"]

    # Уровень 2.5: Справочники
    level2_5 = [
        "requirement_types",
        "requirement_priorities",
        "requirement_statuses",
        "relationship_types",
    ]

    # Уровень 3: Модели с FK на базовые сущности
    level3 = ["company", "refresh_token", "user_settings", "user_profile"]

    # Уровень 4: Организационные структуры
    level4 = [
        "department",
        "team",
        "team_member",
        "company_contact",
        "company_subscription",
        "company_settings",
        "company_branding",
    ]

    # Уровень 5: Проекты и связанные сущности
    level5 = ["project", "spec", "requirement_group", "requirement_group_version"]

    # Уровень 6: Требования и релизы (зависят от проектов)
    level6 = ["requirement", "release", "specification", "relationship"]

    # Уровень 7: Комментарии, тестирование, дашборд
    level7 = ["comment", "test_result", "test_case", "dashboard"]

    # Уровень 8: Продвинутые системы
    level8 = ["enhanced_role_system", "user_role_assignments"]

    # Уровень 9: Иерархия ролей (DAG)
    level9 = ["role_hierarchy"]

    # Собираем все уровни в правильном порядке
    ordered_modules = (
        level1
        + level2
        + level2_5
        + level3
        + level4
        + level5
        + level6
        + level7
        + level8
        + level9
    )

    # Добавляем оставшиеся модули, которые не указаны явно
    remaining_modules = [m for m in model_files if m not in ordered_modules]
    ordered_modules.extend(sorted(remaining_modules))

    for module_name in ordered_modules:
        if module_name not in model_files:
            continue  # Пропускаем несуществующие модули

        try:
            module = importlib.import_module(f".{module_name}", package=__name__)

            # Получаем все публичные атрибуты модуля
            for attr_name in dir(module):
                if not attr_name.startswith("_"):
                    attr = getattr(module, attr_name)
                    # Проверяем, что это класс или важная константа
                    if hasattr(attr, "__module__") and attr.__module__.startswith(
                        "app.models"
                    ):
                        globals_dict[attr_name] = attr
                        all_exports.append(attr_name)
        except ImportError as e:
            print(f"Warning: Could not import model from {module_name}: {e}")

    return all_exports


# Выполняем автоматический импорт
__all__ = _import_all_models()

# Удаляем дубликаты и сортируем
__all__ = sorted(list(set(__all__)))

# Инициализируем отношения иерархии ролей после импорта всех моделей
try:
    from .role_hierarchy_init import initialize_role_hierarchy_relationships

    initialize_role_hierarchy_relationships()
except ImportError:
    # Если модуль иерархии ролей не найден, продолжаем без ошибки
    pass
