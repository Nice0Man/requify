#!/usr/bin/env python3
"""
Утилиты для работы с базой данных.

Этот модуль предоставляет дополнительные инструменты для управления БД,
включая создание/удаление баз данных, создание резервных копий и восстановление.
"""

import argparse
import asyncio
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# Добавляем корневую директорию в path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

from requify.app.core.config import settings


class DatabaseUtilities:
    """Утилиты для работы с базой данных (Single Responsibility Principle)"""

    def __init__(self):
        self.db_config = settings.db
        self.admin_url = f"postgresql+psycopg2://{self.db_config.user}:{self.db_config.password}@{self.db_config.host}:{self.db_config.port}/postgres"

    def create_database(self, db_name: Optional[str] = None) -> None:
        """Создает базу данных"""
        db_name = db_name or self.db_config.name

        try:
            # Подключаемся к БД postgres для создания новой БД
            engine = create_engine(self.admin_url, isolation_level="AUTOCOMMIT")

            with engine.connect() as conn:
                # Проверяем, существует ли уже БД
                result = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                    {"db_name": db_name},
                )

                if result.fetchone():
                    print(f"⚠️  База данных '{db_name}' уже существует")
                    return

                # Создаем БД
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                print(f"✅ База данных '{db_name}' создана успешно")

        except Exception as e:
            print(f"❌ Ошибка создания базы данных: {e}")
            sys.exit(1)

    def drop_database(self, db_name: Optional[str] = None) -> None:
        """Удаляет базу данных"""
        db_name = db_name or self.db_config.name

        confirm = input(
            f"⚠️  ВНИМАНИЕ! Это удалит базу данных '{db_name}'. Продолжить? (yes/NO): "
        )
        if confirm.lower() != "yes":
            print("❌ Операция отменена")
            return

        try:
            # Подключаемся к БД postgres для удаления БД
            engine = create_engine(self.admin_url, isolation_level="AUTOCOMMIT")

            with engine.connect() as conn:
                # Закрываем все соединения с БД
                conn.execute(
                    text(
                        """
                        SELECT pg_terminate_backend(pid)
                        FROM pg_stat_activity
                        WHERE datname = :db_name AND pid <> pg_backend_pid()
                    """
                    ),
                    {"db_name": db_name},
                )

                # Удаляем БД
                conn.execute(text(f'DROP DATABASE IF EXISTS "{db_name}"'))
                print(f"✅ База данных '{db_name}' удалена успешно")

        except Exception as e:
            print(f"❌ Ошибка удаления базы данных: {e}")
            sys.exit(1)

    def backup_database(
        self, backup_path: Optional[str] = None, db_name: Optional[str] = None
    ) -> None:
        """Создает резервную копию базы данных"""
        db_name = db_name or self.db_config.name

        if not backup_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"backup_{db_name}_{timestamp}.sql"

        # Параметры подключения для pg_dump
        env = os.environ.copy()
        env["PGPASSWORD"] = self.db_config.password

        cmd = [
            "pg_dump",
            "-h",
            self.db_config.host,
            "-p",
            str(self.db_config.port),
            "-U",
            self.db_config.user,
            "-d",
            db_name,
            "-f",
            backup_path,
            "--verbose",
            "--no-password",
        ]

        try:
            print(f"🔄 Создание резервной копии БД '{db_name}'...")
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)

            if result.returncode == 0:
                print(f"✅ Резервная копия создана: {backup_path}")
            else:
                print(f"❌ Ошибка создания резервной копии: {result.stderr}")
                sys.exit(1)

        except FileNotFoundError:
            print("❌ pg_dump не найден. Убедитесь, что PostgreSQL client установлен")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Ошибка создания резервной копии: {e}")
            sys.exit(1)

    def restore_database(self, backup_path: str, db_name: Optional[str] = None) -> None:
        """Восстанавливает базу данных из резервной копии"""
        db_name = db_name or self.db_config.name

        if not Path(backup_path).exists():
            print(f"❌ Файл резервной копии не найден: {backup_path}")
            sys.exit(1)

        confirm = input(
            f"⚠️  ВНИМАНИЕ! Это перезапишет БД '{db_name}'. Продолжить? (yes/NO): "
        )
        if confirm.lower() != "yes":
            print("❌ Операция отменена")
            return

        # Параметры подключения для psql
        env = os.environ.copy()
        env["PGPASSWORD"] = self.db_config.password

        cmd = [
            "psql",
            "-h",
            self.db_config.host,
            "-p",
            str(self.db_config.port),
            "-U",
            self.db_config.user,
            "-d",
            db_name,
            "-f",
            backup_path,
            "--quiet",
        ]

        try:
            print(f"🔄 Восстановление БД '{db_name}' из {backup_path}...")
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)

            if result.returncode == 0:
                print(f"✅ База данных восстановлена успешно")
            else:
                print(f"❌ Ошибка восстановления: {result.stderr}")
                sys.exit(1)

        except FileNotFoundError:
            print("❌ psql не найден. Убедитесь, что PostgreSQL client установлен")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Ошибка восстановления: {e}")
            sys.exit(1)

    def check_connection(self, db_name: Optional[str] = None) -> None:
        """Проверяет подключение к базе данных"""
        db_name = db_name or self.db_config.name

        try:
            db_url = f"postgresql+psycopg2://{self.db_config.user}:{self.db_config.password}@{self.db_config.host}:{self.db_config.port}/{db_name}"
            engine = create_engine(db_url)

            with engine.connect() as conn:
                result = conn.execute(text("SELECT version()"))
                version = result.fetchone()[0]

                print(f"✅ Соединение с БД '{db_name}' установлено")
                print(f"📊 Версия PostgreSQL: {version.split(',')[0]}")

                # Дополнительная информация
                result = conn.execute(text("SELECT current_database(), current_user"))
                db_info = result.fetchone()
                print(f"📊 Текущая БД: {db_info[0]}")
                print(f"📊 Пользователь: {db_info[1]}")

        except OperationalError as e:
            print(f"❌ Ошибка подключения к БД '{db_name}': {e}")
            print("🔧 Убедитесь, что:")
            print("   - PostgreSQL запущен")
            print(f"   - База данных '{db_name}' существует")
            print("   - Настройки подключения корректны")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Неожиданная ошибка: {e}")
            sys.exit(1)

    def list_databases(self) -> None:
        """Показывает список баз данных"""
        try:
            engine = create_engine(self.admin_url)

            with engine.connect() as conn:
                result = conn.execute(
                    text(
                        """
                    SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
                    FROM pg_database 
                    WHERE datistemplate = false
                    ORDER BY datname
                """
                    )
                )

                print("📊 Список баз данных:")
                print("=" * 40)
                for row in result:
                    marker = "🎯" if row[0] == self.db_config.name else "  "
                    print(f"{marker} {row[0]} ({row[1]})")

        except Exception as e:
            print(f"❌ Ошибка получения списка БД: {e}")
            sys.exit(1)


def main():
    """Главная функция CLI"""
    parser = argparse.ArgumentParser(
        description="Утилиты для работы с базой данных",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Примеры использования:
  %(prog)s create-db
  %(prog)s create-db --name test_db
  %(prog)s drop-db
  %(prog)s backup
  %(prog)s backup --path /path/to/backup.sql
  %(prog)s restore /path/to/backup.sql
  %(prog)s check
  %(prog)s list
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Доступные команды")

    # Команда create-db
    create_parser = subparsers.add_parser("create-db", help="Создать базу данных")
    create_parser.add_argument("--name", help="Имя базы данных")

    # Команда drop-db
    drop_parser = subparsers.add_parser("drop-db", help="Удалить базу данных")
    drop_parser.add_argument("--name", help="Имя базы данных")

    # Команда backup
    backup_parser = subparsers.add_parser("backup", help="Создать резервную копию")
    backup_parser.add_argument("--path", help="Путь к файлу резервной копии")
    backup_parser.add_argument("--name", help="Имя базы данных")

    # Команда restore
    restore_parser = subparsers.add_parser(
        "restore", help="Восстановить из резервной копии"
    )
    restore_parser.add_argument("backup_path", help="Путь к файлу резервной копии")
    restore_parser.add_argument("--name", help="Имя базы данных")

    # Команда check
    check_parser = subparsers.add_parser("check", help="Проверить подключение")
    check_parser.add_argument("--name", help="Имя базы данных")

    # Команда list
    subparsers.add_parser("list", help="Показать список баз данных")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    utils = DatabaseUtilities()

    if args.command == "create-db":
        utils.create_database(args.name)
    elif args.command == "drop-db":
        utils.drop_database(args.name)
    elif args.command == "backup":
        utils.backup_database(args.path, args.name)
    elif args.command == "restore":
        utils.restore_database(args.backup_path, args.name)
    elif args.command == "check":
        utils.check_connection(args.name)
    elif args.command == "list":
        utils.list_databases()


if __name__ == "__main__":
    main()
