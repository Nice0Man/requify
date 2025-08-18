"""
Точка входа для выполнения скриптов как модуля.

Использование:
    python -m scripts <script_name> [args]

Доступные скрипты:
    - seed_db: Заполнение базы данных тестовыми данными
    - create_admin: Создание администратора
    - migrations: Управление миграциями
    - db_utils: Утилиты для работы с БД
"""

import sys
from pathlib import Path

# Добавляем корневую директорию в path
sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Главная функция для выполнения скриптов."""
    if len(sys.argv) < 2:
        print("Использование: python -m scripts <script_name> [args]")
        print("\nДоступные скрипты:")
        print("  seed_db [seed|clear]    - Заполнение/очистка базы данных")
        print("  create_admin           - Создание администратора")
        print("  migrations             - Управление миграциями")
        print("  db_utils [create|drop|backup|restore] - Утилиты БД")
        sys.exit(1)

    script_name = sys.argv[1]
    # Удаляем имя скрипта из аргументов
    sys.argv = [sys.argv[0]] + sys.argv[2:]

    if script_name == "seed_db":
        from scripts.seed_db import main as seed_main
        import asyncio

        asyncio.run(seed_main())
    elif script_name == "create_admin":
        from scripts.create_admin import main as admin_main
        import asyncio
        import inspect

        if inspect.iscoroutinefunction(admin_main):
            asyncio.run(admin_main())
        else:
            admin_main()
    elif script_name == "migrations":
        from scripts.migrations import main as migrations_main

        migrations_main()
    elif script_name == "db_utils":
        from scripts.db_utils import main as db_utils_main

        db_utils_main()
    else:
        print(f"Неизвестный скрипт: {script_name}")
        sys.exit(1)


if __name__ == "__main__":
    main()
