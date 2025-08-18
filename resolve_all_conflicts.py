#!/usr/bin/env python3
"""
МОЩНЫЙ скрипт для полного разрешения всех merge конфликтов.
Использует агрессивную стратегию очистки.
"""

import os
import re
import sys
from pathlib import Path

def resolve_conflict_in_file(file_path: Path) -> bool:
    """
    Агрессивно разрешает все merge конфликты в файле.
    Стратегия: приоритет HEAD версии, сохранение уникальных элементов.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError) as e:
        print(f"⚠️  Skipping {file_path}: {e}")
        return False

    if "" not in content:
        return False

    print(f"🔧 Resolving conflicts in {file_path}")

    # Удаляем все merge маркеры и выбираем HEAD версию
    patterns = [
        # Стандартный конфликт с содержимым в обеих секциях
        (r"\n(.*?)\n\n(.*?)\n", r"\1"),
        # HEAD пустая, dev-backend содержит код
        (r"\n\n(.*?)\n", r"\1"),
        # dev-backend пустая, HEAD содержит код
        (r"\n(.*?)\n\n", r"\1"),
        # Полностью пустой конфликт
        (r"\n\n", ""),
        # Конфликты только с маркерами
        (r"\n", ""),
        (r"\n\n", "\n"),
        (r"\n", ""),
        # Одиночные маркеры на отдельных строках
        (r"^$", "", re.MULTILINE),
        (r"^$", "", re.MULTILINE),
        (r"^$", "", re.MULTILINE),
    ]

    original_content = content

    for pattern, replacement, *flags in patterns:
        flags = flags[0] if flags else 0
        content = re.sub(pattern, replacement, content, flags=re.DOTALL | flags)

    # Дополнительная очистка лишних пустых строк
    content = re.sub(r"\n\n\n+", "\n\n", content)
    content = content.strip() + "\n"

    if content != original_content:
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Resolved conflicts in {file_path}")
            return True
        except PermissionError as e:
            print(f"❌ Cannot write to {file_path}: {e}")
            return False

    return False

def main():
    """Основная функция для разрешения всех конфликтов."""
    print("🚀 STARTING AGGRESSIVE CONFLICT RESOLUTION")
    print("=" * 60)

    # Находим все Python файлы
    python_files = list(Path(".").rglob("*.py"))
    total_files = len(python_files)
    resolved_count = 0

    print(f"📊 Found {total_files} Python files to check")

    for file_path in python_files:
        if resolve_conflict_in_file(file_path):
            resolved_count += 1

    print("=" * 60)
    print(f"✅ COMPLETED: Resolved conflicts in {resolved_count} files")

    if resolved_count > 0:
        print("\n🔍 Verifying resolution...")
        # Проверяем, остались ли конфликты
        remaining_conflicts = []
        for file_path in python_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                if (
                    "" in content
                    or "" in content
                    or "" in content
                ):
                    remaining_conflicts.append(file_path)
            except:
                continue

        if remaining_conflicts:
            print(f"⚠️  {len(remaining_conflicts)} files still have conflicts:")
            for file_path in remaining_conflicts[:10]:  # Показываем первые 10
                print(f"   - {file_path}")
            if len(remaining_conflicts) > 10:
                print(f"   ... and {len(remaining_conflicts) - 10} more")
        else:
            print("🎉 ALL CONFLICTS RESOLVED!")

    return resolved_count

if __name__ == "__main__":
    sys.exit(0 if main() > 0 else 1)
