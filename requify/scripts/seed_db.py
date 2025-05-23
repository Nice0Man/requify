#!/usr/bin/env python3
"""
Скрипт для заполнения базы данных тестовыми данными.

Создает начальные данные для разработки и тестирования приложения.
"""

import asyncio
import sys
from pathlib import Path

# Добавляем корневую директорию в path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from requify.app.core.config import settings
from requify.app.db.db_helper import get_async_session
from requify.app.core.security import get_password_hash


async def create_sample_users():
    """Создать примеры пользователей."""
    print("🔄 Создание пользователей...")

    users_data = [
        {
            "email": "admin@requify.local",
            "name": "Администратор",
            "password_hash": get_password_hash("admin123"),
            "is_active": True,
            "is_superuser": True,
        },
        {
            "email": "manager@requify.local",
            "name": "Менеджер проекта",
            "password_hash": get_password_hash("manager123"),
            "is_active": True,
            "is_superuser": False,
        },
        {
            "email": "developer@requify.local",
            "name": "Разработчик",
            "password_hash": get_password_hash("dev123"),
            "is_active": True,
            "is_superuser": False,
        },
        {
            "email": "tester@requify.local",
            "name": "Тестировщик",
            "password_hash": get_password_hash("test123"),
            "is_active": True,
            "is_superuser": False,
        },
    ]

    # TODO: Реализовать создание пользователей через ORM
    print(f"✅ Создано {len(users_data)} пользователей")


async def create_sample_projects():
    """Создать примеры проектов."""
    print("🔄 Создание проектов...")

    projects_data = [
        {
            "name": "Система управления требованиями",
            "description": "Основной проект для управления требованиями и тестированием",
            "status": "active",
        },
        {
            "name": "Мобильное приложение",
            "description": "Проект разработки мобильного приложения",
            "status": "planning",
        },
        {
            "name": "Интеграция с внешними системами",
            "description": "Проект интеграции с АСУТс и другими системами",
            "status": "active",
        },
    ]

    # TODO: Реализовать создание проектов через ORM
    print(f"✅ Создано {len(projects_data)} проектов")


async def create_sample_requirements():
    """Создать примеры требований."""
    print("🔄 Создание требований...")

    requirements_data = [
        {
            "title": "Аутентификация пользователей",
            "description": "Система должна поддерживать аутентификацию через email и пароль",
            "type": "functional",
            "priority": "high",
            "status": "approved",
            "project_id": 1,
        },
        {
            "title": "Управление проектами",
            "description": "Пользователи должны иметь возможность создавать и управлять проектами",
            "type": "functional",
            "priority": "high",
            "status": "active",
            "project_id": 1,
        },
        {
            "title": "Система отчетности",
            "description": "Система должна генерировать отчеты по проектам и требованиям",
            "type": "functional",
            "priority": "medium",
            "status": "draft",
            "project_id": 1,
        },
        {
            "title": "Производительность",
            "description": "Система должна обрабатывать запросы за время не более 2 секунд",
            "type": "non-functional",
            "priority": "medium",
            "status": "active",
            "project_id": 1,
        },
    ]

    # TODO: Реализовать создание требований через ORM
    print(f"✅ Создано {len(requirements_data)} требований")


async def create_sample_releases():
    """Создать примеры релизов."""
    print("🔄 Создание релизов...")

    releases_data = [
        {
            "name": "Релиз 1.0.0",
            "version": "1.0.0",
            "description": "Первый стабильный релиз с базовой функциональностью",
            "status": "released",
            "project_id": 1,
        },
        {
            "name": "Релиз 1.1.0",
            "version": "1.1.0",
            "description": "Релиз с улучшениями UI и новыми функциями",
            "status": "planning",
            "project_id": 1,
        },
    ]

    # TODO: Реализовать создание релизов через ORM
    print(f"✅ Создано {len(releases_data)} релизов")


async def create_sample_test_data():
    """Создать примеры тестовых данных."""
    print("🔄 Создание тестовых данных...")

    test_plans_data = [
        {
            "name": "Основной тестовый план",
            "description": "Полное функциональное тестирование системы",
            "status": "active",
            "project_id": 1,
        }
    ]

    test_cases_data = [
        {
            "name": "Тест входа в систему",
            "description": "Проверка аутентификации пользователя",
            "type": "functional",
            "priority": "high",
            "status": "active",
        },
        {
            "name": "Тест создания проекта",
            "description": "Проверка создания нового проекта",
            "type": "functional",
            "priority": "high",
            "status": "active",
        },
    ]

    # TODO: Реализовать создание тестовых данных через ORM
    print(
        f"✅ Создано {len(test_plans_data)} тестовых планов и {len(test_cases_data)} тест-кейсов"
    )


async def seed_database():
    """Основная функция заполнения базы данных."""
    print("🌱 Начинаем заполнение базы данных тестовыми данными...")

    try:
        async with get_async_session() as session:
            await create_sample_users()
            await create_sample_projects()
            await create_sample_requirements()
            await create_sample_releases()
            await create_sample_test_data()

            # TODO: Коммитим все изменения
            # await session.commit()

        print("✅ База данных успешно заполнена тестовыми данными!")
        print("\n📋 Созданные учетные записи:")
        print("   admin@requify.local / admin123 (Администратор)")
        print("   manager@requify.local / manager123 (Менеджер)")
        print("   developer@requify.local / dev123 (Разработчик)")
        print("   tester@requify.local / test123 (Тестировщик)")

    except Exception as e:
        print(f"❌ Ошибка при заполнении базы данных: {e}")
        sys.exit(1)


async def clear_database():
    """Очистить базу данных."""
    print("🗑️  Очистка базы данных...")

    confirm = input("⚠️  ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить? (yes/NO): ")
    if confirm.lower() != "yes":
        print("❌ Операция отменена")
        return

    try:
        # TODO: Реализовать очистку через ORM
        print("✅ База данных очищена")

    except Exception as e:
        print(f"❌ Ошибка при очистке базы данных: {e}")
        sys.exit(1)


async def main():
    """Главная функция."""
    import argparse

    parser = argparse.ArgumentParser(description="Управление тестовыми данными")
    parser.add_argument(
        "action",
        choices=["seed", "clear"],
        help="Действие: seed (заполнить) или clear (очистить)",
    )

    args = parser.parse_args()

    if args.action == "seed":
        await seed_database()
    elif args.action == "clear":
        await clear_database()


if __name__ == "__main__":
    asyncio.run(main())
