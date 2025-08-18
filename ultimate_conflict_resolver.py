#!/usr/bin/env python3
"""
ULTIMATE скрипт для разрешения ALL merge конфликтов.
Полностью агрессивный подход - просто удаляет все маркеры.
"""

import os
import re
from pathlib import Path

def clean_file(file_path: Path) -> bool:
    """Полная очистка файла от всех merge маркеров."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except:
        return False
    
    # Проверяем наличие любых merge маркеров
    has_conflicts = any(marker in content for marker in [
        "", "", ""
    ])
    
    if not has_conflicts:
        return False
    
    print(f"🔧 Cleaning {file_path}")
    
    # Агрессивная очистка - удаляем ВСЕ маркеры и выбираем HEAD части
    lines = content.split('\n')
    cleaned_lines = []
    in_conflict = False
    in_dev_section = False
    
    for line in lines:
        if line.strip() == "":
            in_conflict = True
            in_dev_section = False
            continue
        elif line.strip() == "":
            in_dev_section = True
            continue
        elif line.strip() == "":
            in_conflict = False
            in_dev_section = False
            continue
        
        # Добавляем строку только если мы не в dev секции
        if not in_conflict or not in_dev_section:
            cleaned_lines.append(line)
    
    cleaned_content = '\n'.join(cleaned_lines)
    
    # Дополнительная очистка оставшихся маркеров (если остались)
    patterns = [
        r".*?\n?",
        r".*?\n?", 
        r".*?\n?",
    ]
    
    for pattern in patterns:
        cleaned_content = re.sub(pattern, "", cleaned_content, flags=re.MULTILINE)
    
    # Очищаем лишние пустые строки
    cleaned_content = re.sub(r'\n\n\n+', '\n\n', cleaned_content)
    cleaned_content = cleaned_content.strip() + '\n'
    
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(cleaned_content)
        print(f"✅ Cleaned {file_path}")
        return True
    except:
        return False

def main():
    """Основная функция."""
    print("🚀 ULTIMATE CONFLICT RESOLUTION")
    print("=" * 50)
    
    # Находим ВСЕ файлы рекурсивно
    all_files = []
    for ext in ['*.py', '*.yml', '*.yaml', '*.md', '*.txt', '*.json']:
        all_files.extend(Path('.').rglob(ext))
    
    total_files = len(all_files)
    cleaned_count = 0
    
    print(f"📊 Checking {total_files} files")
    
    for file_path in all_files:
        if clean_file(file_path):
            cleaned_count += 1
    
    print("=" * 50)
    print(f"✅ CLEANED {cleaned_count} files")
    
    # Финальная проверка
    remaining = 0
    for file_path in all_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            if any(marker in content for marker in ["", "", ""]):
                remaining += 1
                if remaining <= 5:  # Показываем только первые 5
                    print(f"⚠️  Still has conflicts: {file_path}")
        except:
            continue
    
    if remaining == 0:
        print("🎉 ALL CONFLICTS COMPLETELY RESOLVED!")
    else:
        print(f"⚠️  {remaining} files still have conflicts")
    
    return cleaned_count

if __name__ == "__main__":
    main()
