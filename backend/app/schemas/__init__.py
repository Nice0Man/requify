"""
Автоматический импорт всех схем Pydantic из папки schemas.
"""

import os
import importlib
from pathlib import Path

# Получаем путь к текущей директории
current_dir = Path(__file__).parent

# Список для хранения всех экспортируемых элементов
__all__ = []

# Проходим по всем файлам .py в директории schemas
for file_path in current_dir.glob("*.py"):
    # Пропускаем __init__.py и файлы, начинающиеся с подчеркивания
    if file_path.name.startswith("__") or file_path.name.startswith("_"):
        continue

    # Получаем имя модуля без расширения
    module_name = file_path.stem

    try:
        # Импортируем модуль
        module = importlib.import_module(f".{module_name}", package=__name__)

        # Если в модуле есть __all__, используем его
        if hasattr(module, "__all__"):
            for item in module.__all__:
                if hasattr(module, item):
                    globals()[item] = getattr(module, item)
                    __all__.append(item)
        else:
            # Иначе импортируем все публичные атрибуты (не начинающиеся с _)
            for attr_name in dir(module):
                if not attr_name.startswith("_"):
                    attr = getattr(module, attr_name)
                    # Проверяем, что это класс (схема Pydantic обычно является классом)
                    if isinstance(attr, type):
                        globals()[attr_name] = attr
                        __all__.append(attr_name)

    except ImportError as e:
        # Если модуль не удается импортировать, выводим предупреждение
        print(f"Warning: Could not import {module_name}: {e}")
        continue

# Сортируем __all__ для лучшей читаемости
__all__.sort()
