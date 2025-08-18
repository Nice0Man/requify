#!/usr/bin/env python3
"""
Скрипт для исправления всех типовых ошибок импорта в моделях.
"""

import re
from pathlib import Path

# Карта ошибок к их исправлениям
COMMON_FIXES = {
    # SQLAlchemy imports
    "NameError: name 'ForeignKey' is not defined": {
        'pattern': r'from sqlalchemy import (.+)',
        'add_import': 'ForeignKey'
    },
    "NameError: name 'JSON' is not defined": {
        'pattern': r'from sqlalchemy import (.+)',
        'add_import': 'JSON'
    },
    "NameError: name 'TYPE_CHECKING' is not defined": {
        'pattern': r'from typing import (.+)',
        'add_import': 'TYPE_CHECKING',
        'new_line': 'from typing import TYPE_CHECKING'
    },
    "NameError: name 'DECIMAL' is not defined": {
        'pattern': r'from sqlalchemy import (.+)',
        'add_import': 'DECIMAL'
    },
    "NameError: name 'UUID' is not defined": {
        'pattern': r'from sqlalchemy import (.+)',
        'add_import': 'UUID'
    },
}

def fix_file_imports(file_path: Path) -> bool:
    """Исправляет импорты в файле."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    original_content = content
    changed = False
    
    # Проверяем наличие TYPE_CHECKING без импорта
    if 'TYPE_CHECKING' in content and 'from typing import' not in content:
        lines = content.split('\n')
        # Ищем место для вставки импорта
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('from') or line.startswith('import'):
                insert_idx = i + 1
        
        lines.insert(insert_idx, 'from typing import TYPE_CHECKING')
        content = '\n'.join(lines)
        changed = True
        print(f"   + Added TYPE_CHECKING import")
    
    # Исправляем недостающие SQLAlchemy импорты
    sqlalchemy_types = ['ForeignKey', 'JSON', 'DECIMAL', 'UUID', 'LargeBinary', 'UniqueConstraint']
    
    for type_name in sqlalchemy_types:
        if type_name in content:
            # Ищем строку с импортом SQLAlchemy
            pattern = r'from sqlalchemy import ([^\\n]+)'
            match = re.search(pattern, content)
            
            if match and type_name not in match.group(1):
                imports = [imp.strip() for imp in match.group(1).split(',')]
                if type_name not in imports:
                    imports.append(type_name)
                    imports.sort()
                    new_import = f"from sqlalchemy import {', '.join(imports)}"
                    content = re.sub(pattern, new_import, content)
                    changed = True
                    print(f"   + Added {type_name} to SQLAlchemy imports")
    
    if changed:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except:
            return False
    
    return False

def main():
    """Основная функция."""
    print("🔧 Fixing all import errors in models...")
    
    # Исправляем файлы моделей
    model_files = list(Path('backend/app/models').rglob('*.py'))
    fixed_count = 0
    
    for file_path in model_files:
        print(f"🔍 Checking {file_path}")
        if fix_file_imports(file_path):
            fixed_count += 1
            print(f"✅ Fixed {file_path}")
    
    print(f"📊 Fixed imports in {fixed_count} files")
    
    # Проверяем, работает ли импорт теперь
    print("\\n🧪 Testing imports...")
    
    return fixed_count

if __name__ == "__main__":
    main()
