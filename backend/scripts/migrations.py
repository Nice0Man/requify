#!/usr/bin/env python3
"""
Скрипт для управления миграциями базы данных.

Этот скрипт предоставляет удобный интерфейс для работы с Alembic миграциями
и соответствует принципам SOLID.

Использование:
    python -m scripts.migrations --help
    python -m scripts.migrations create "Добавление таблицы пользователей"
    python -m scripts.migrations upgrade
    python -m scripts.migrations downgrade
    python -m scripts.migrations history
    python -m scripts.migrations current
    python -m scripts.migrations reset
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path
from typing import Optional

# Добавляем корневую директорию в path
sys.path.insert(0, str(Path(__file__).parent.parent))

from alembic import command, script
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

from app.core.config import settings
from app.db.base import Base


class MigrationManager:
    """Менеджер миграций для работы с Alembic (Single Responsibility Principle)"""

    def __init__(self):
        self.config = self._get_alembic_config()
        self.engine = create_engine(
            settings.db.sync_url,
            echo=False,
            connect_args={"options": "-c client_encoding=utf8"},
        )

    def _get_alembic_config(self) -> Config:
        """Получает конфигурацию Alembic"""
        # Путь к alembic.ini в корне проекта (на уровень выше requify)
        alembic_cfg_path = Path(__file__).parent.parent.parent / "alembic.ini"

        if not alembic_cfg_path.exists():
            raise FileNotFoundError(f"Файл alembic.ini не найден: {alembic_cfg_path}")

        config = Config(str(alembic_cfg_path))
        # Устанавливаем URL подключения
        config.set_main_option("sqlalchemy.url", settings.db.sync_url)
        return config

    def _check_database_connection(self) -> bool:
        """Проверяет подключение к базе данных"""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Соединение с базой данных установлено")
            return True
        except OperationalError as e:
            print(f"❌ Ошибка подключения к базе данных: {e}")
            print("🔧 Убедитесь, что:")
            print("   - PostgreSQL контейнер запущен: docker-compose up -d db")
            print(f"   - База данных '{settings.db.name}' существует")
            print("   - Настройки в .env файле корректны")
            return False

    def create_migration(self, message: str, autogenerate: bool = True) -> None:
        """Создает новую миграцию"""
        if not self._check_database_connection():
            return

        try:
            print(f"🔄 Создание миграции: {message}")

            if autogenerate:
                command.revision(
                    self.config,
                    message=message,
                    autogenerate=True,
                )
            else:
                command.revision(
                    self.config,
                    message=message,
                )

            print("✅ Миграция создана успешно")
        except Exception as e:
            print(f"❌ Ошибка создания миграции: {e}")
            sys.exit(1)

    def upgrade(self, revision: str = "head") -> None:
        """Применяет миграции"""
        if not self._check_database_connection():
            return

        try:
            print(f"🔄 Применение миграций до версии: {revision}")
            command.upgrade(self.config, revision)
            print("✅ Миграции применены успешно")
        except Exception as e:
            print(f"❌ Ошибка применения миграций: {e}")
            sys.exit(1)

    def downgrade(self, revision: str = "-1") -> None:
        """Откатывает миграции"""
        if not self._check_database_connection():
            return

        try:
            print(f"🔄 Откат миграций до версии: {revision}")
            command.downgrade(self.config, revision)
            print("✅ Откат миграций выполнен успешно")
        except Exception as e:
            print(f"❌ Ошибка отката миграций: {e}")
            sys.exit(1)

    def show_history(self) -> None:
        """Показывает историю миграций"""
        try:
            print("📋 История миграций:")
            command.history(self.config)
        except Exception as e:
            print(f"❌ Ошибка получения истории: {e}")

    def show_current(self) -> None:
        """Показывает текущую версию базы данных"""
        if not self._check_database_connection():
            return

        try:
            print("📊 Текущая версия базы данных:")
            command.current(self.config)
        except Exception as e:
            print(f"❌ Ошибка получения текущей версии: {e}")

    def show_heads(self) -> None:
        """Показывает последние версии миграций"""
        try:
            print("🎯 Последние версии миграций:")
            command.heads(self.config)
        except Exception as e:
            print(f"❌ Ошибка получения последних версий: {e}")

    def reset_database(self) -> None:
        """Полный сброс базы данных (ОПАСНО!)"""
        confirm = input(
            "⚠️  ВНИМАНИЕ! Это удалит ВСЕ данные в базе. Продолжить? (yes/NO): "
        )
        if confirm.lower() != "yes":
            print("❌ Операция отменена")
            return

        if not self._check_database_connection():
            return

        try:
            print("🔄 Сброс базы данных...")

            # Удаляем все таблицы
            Base.metadata.drop_all(bind=self.engine)
            print("🗑️  Все таблицы удалены")

            # Удаляем таблицу alembic_version
            with self.engine.connect() as conn:
                conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
                conn.commit()

            print("✅ База данных сброшена")
            print("💡 Теперь выполните: python -m scripts.migrations upgrade")

        except Exception as e:
            print(f"❌ Ошибка сброса базы данных: {e}")
            sys.exit(1)

    def init_database(self) -> None:
        """Инициализация базы данных с начальными данными"""
        if not self._check_database_connection():
            return

        try:
            print("🔄 Инициализация базы данных...")

            # Применяем все миграции
            self.upgrade()

            print("✅ База данных инициализирована")

        except Exception as e:
            print(f"❌ Ошибка инициализации: {e}")
            sys.exit(1)

    def check_migrations(self) -> None:
        """Проверяет состояние миграций"""
        if not self._check_database_connection():
            return

        try:
            with self.engine.connect() as conn:
                context = MigrationContext.configure(conn)
                current_rev = context.get_current_revision()

                script_dir = script.ScriptDirectory.from_config(self.config)
                head_rev = script_dir.get_current_head()

                print(f"📊 Текущая версия БД: {current_rev or 'не установлена'}")
                print(f"📊 Последняя миграция: {head_rev or 'отсутствует'}")

                if current_rev == head_rev:
                    print("✅ База данных актуальна")
                elif current_rev is None:
                    print("⚠️  База данных не инициализирована")
                else:
                    print("⚠️  Необходимо применить миграции")

        except Exception as e:
            print(f"❌ Ошибка проверки миграций: {e}")


def main():
    """Главная функция CLI"""
    parser = argparse.ArgumentParser(
        description="Управление миграциями базы данных",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Примеры использования:
  %(prog)s create "Добавление таблицы пользователей"
  %(prog)s create "Изменение структуры проектов" --no-autogenerate
  %(prog)s upgrade
  %(prog)s upgrade +2
  %(prog)s downgrade
  %(prog)s downgrade -2
  %(prog)s history
  %(prog)s current
  %(prog)s check
  %(prog)s reset
  %(prog)s init
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Доступные команды")

    # Команда create
    create_parser = subparsers.add_parser("create", help="Создать новую миграцию")
    create_parser.add_argument("message", help="Описание миграции")
    create_parser.add_argument(
        "--no-autogenerate",
        action="store_true",
        help="Создать пустую миграцию без автогенерации",
    )

    # Команда upgrade
    upgrade_parser = subparsers.add_parser("upgrade", help="Применить миграции")
    upgrade_parser.add_argument(
        "revision",
        nargs="?",
        default="head",
        help="Версия до которой применить (по умолчанию: head)",
    )

    # Команда downgrade
    downgrade_parser = subparsers.add_parser("downgrade", help="Откатить миграции")
    downgrade_parser.add_argument(
        "revision",
        nargs="?",
        default="-1",
        help="Версия до которой откатить (по умолчанию: -1)",
    )

    # Остальные команды
    subparsers.add_parser("history", help="Показать историю миграций")
    subparsers.add_parser("current", help="Показать текущую версию")
    subparsers.add_parser("heads", help="Показать последние версии")
    subparsers.add_parser("check", help="Проверить состояние миграций")
    subparsers.add_parser("reset", help="Сбросить базу данных (ОПАСНО!)")
    subparsers.add_parser("init", help="Инициализировать базу данных")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    manager = MigrationManager()

    if args.command == "create":
        manager.create_migration(args.message, autogenerate=not args.no_autogenerate)
    elif args.command == "upgrade":
        manager.upgrade(args.revision)
    elif args.command == "downgrade":
        manager.downgrade(args.revision)
    elif args.command == "history":
        manager.show_history()
    elif args.command == "current":
        manager.show_current()
    elif args.command == "heads":
        manager.show_heads()
    elif args.command == "check":
        manager.check_migrations()
    elif args.command == "reset":
        manager.reset_database()
    elif args.command == "init":
        manager.init_database()


if __name__ == "__main__":
    main()
