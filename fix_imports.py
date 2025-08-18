#!/usr/bin/env python3
"""
Скрипт для автоматического исправления отсутствующих импортов в SQLAlchemy модели.
"""

import re
from pathlib import Path

# Карта типов SQLAlchemy к их импортам
SQLALCHEMY_IMPORTS = {
    'JSON': 'from sqlalchemy import JSON',
    'ForeignKey': 'from sqlalchemy import ForeignKey',
    'DECIMAL': 'from sqlalchemy import DECIMAL',
    'TIMESTAMP': 'from sqlalchemy import TIMESTAMP',
    'UUID': 'from sqlalchemy import UUID',
    'LargeBinary': 'from sqlalchemy import LargeBinary',
    'UniqueConstraint': 'from sqlalchemy import UniqueConstraint',
    'CheckConstraint': 'from sqlalchemy import CheckConstraint',
    'Index': 'from sqlalchemy import Index',
}

def fix_imports_in_file(file_path: Path) -> bool:
    """Исправляет импорты в одном файле."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    changed = False
    lines = content.split('\n')
    
    # Находим строку с основными импортами SQLAlchemy
    import_line_idx = None
    for i, line in enumerate(lines):
        if line.startswith('from sqlalchemy import') and not 'orm' in line:
            import_line_idx = i
            break
    
    if import_line_idx is None:
        return False
    
    # Проверяем, какие типы используются в файле
    needed_imports = set()
    for type_name in SQLALCHEMY_IMPORTS:
        if type_name in content and type_name not in lines[import_line_idx]:
            needed_imports.add(type_name)
    
    if not needed_imports:
        return False
    
    # Получаем текущие импорты
    import_line = lines[import_line_idx]
    # Извлекаем список импортов между 'import' и конца строки
    import_part = import_line.split('from sqlalchemy import ')[1]
    current_imports = [imp.strip() for imp in import_part.split(',')]
    
    # Добавляем недостающие импорты
    all_imports = sorted(set(current_imports + list(needed_imports)))
    new_import_line = f"from sqlalchemy import {', '.join(all_imports)}"
    
    lines[import_line_idx] = new_import_line
    
    new_content = '\n'.join(lines)
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Fixed imports in {file_path}: {', '.join(needed_imports)}")
        return True
    except:
        return False

def main():
    """Основная функция."""
    print("🔧 Fixing SQLAlchemy imports...")
    
    # Находим все Python файлы в models
    model_files = list(Path('app/models').rglob('*.py'))
    fixed_count = 0
    
    for file_path in model_files:
        if fix_imports_in_file(file_path):
            fixed_count += 1
    
    print(f"✅ Fixed imports in {fixed_count} files")

if __name__ == "__main__":
    main()
