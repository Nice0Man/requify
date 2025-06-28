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
from sqlalchemy import text
from app.core.config import settings
from app.db.db_helper import get_async_session, main_db_helper
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.release import Release
from app.models.requirement_types import RequirementType
from app.models.requirement_priorities import RequirementPriority
from app.models.requirement_statuses import RequirementStatus
from app.crud import user as crud_user
from app.crud import project as crud_project
from app.crud import requirement as crud_requirement
from app.crud import release as crud_release
from app.schemas.user import UserCreate
from app.schemas.project import ProjectCreate
from app.schemas.requirement import RequirementCreate
from app.schemas.release import ReleaseCreate


async def create_reference_data(db: AsyncSession):
    """Создать справочные данные (типы, приоритеты, статусы требований)."""
    print("🔄 Создание справочных данных...")

    # Типы требований
    types_data = [
        {"name": "Функциональное", "description": "Функциональные требования системы"},
        {"name": "Нефункциональное", "description": "Требования к производительности, безопасности, удобству использования"},
        {"name": "Бизнес-требование", "description": "Бизнес-правила и процессы"},
        {"name": "Техническое", "description": "Технические ограничения и требования"},
    ]

    created_types = []
    for type_data in types_data:
        # Проверяем, существует ли тип
        existing_type = await db.execute(
            text("SELECT * FROM requirement_types WHERE name = :name"),
            {"name": type_data["name"]}
        )
        if not existing_type.first():
            req_type = RequirementType(**type_data)
            db.add(req_type)
            await db.flush()
            created_types.append(req_type)
        else:
            # Получаем существующий тип
            result = await db.execute(
                text("SELECT * FROM requirement_types WHERE name = :name"),
                {"name": type_data["name"]}
            )
            row = result.first()
            existing_type = RequirementType(id=row[0], name=row[1], description=row[2])
            created_types.append(existing_type)

    # Приоритеты требований
    priorities_data = [
        {"name": "Критический"},
        {"name": "Высокий"},
        {"name": "Средний"},
        {"name": "Низкий"},
    ]

    created_priorities = []
    for priority_data in priorities_data:
        # Проверяем, существует ли приоритет
        existing_priority = await db.execute(
            text("SELECT * FROM requirement_priorities WHERE name = :name"),
            {"name": priority_data["name"]}
        )
        if not existing_priority.first():
            req_priority = RequirementPriority(name=priority_data["name"])
            db.add(req_priority)
            await db.flush()
            created_priorities.append(req_priority)
        else:
            # Получаем существующий приоритет
            result = await db.execute(
                text("SELECT * FROM requirement_priorities WHERE name = :name"),
                {"name": priority_data["name"]}
            )
            row = result.first()
            existing_priority = RequirementPriority(id=row[0], name=row[1])
            created_priorities.append(existing_priority)

    # Статусы требований
    statuses_data = [
        {"name": "Черновик"},
        {"name": "На рассмотрении"},
        {"name": "Утверждено"},
        {"name": "В разработке"},
        {"name": "Реализовано"},
        {"name": "Тестируется"},
        {"name": "Готово"},
        {"name": "Отклонено"},
    ]

    created_statuses = []
    for status_data in statuses_data:
        # Проверяем, существует ли статус
        existing_status = await db.execute(
            text("SELECT * FROM requirement_statuses WHERE name = :name"),
            {"name": status_data["name"]}
        )
        if not existing_status.first():
            req_status = RequirementStatus(name=status_data["name"])
            db.add(req_status)
            await db.flush()
            created_statuses.append(req_status)
        else:
            # Получаем существующий статус
            result = await db.execute(
                text("SELECT * FROM requirement_statuses WHERE name = :name"),
                {"name": status_data["name"]}
            )
            row = result.first()
            existing_status = RequirementStatus(id=row[0], name=row[1])
            created_statuses.append(existing_status)

    print(f"✅ Создано {len(created_types)} типов, {len(created_priorities)} приоритетов, {len(created_statuses)} статусов")
    return {
        "types": created_types,
        "priorities": created_priorities,
        "statuses": created_statuses
    }


async def create_sample_users(db: AsyncSession):
    """Создать примеры пользователей."""
    print("🔄 Создание пользователей...")

    users_data = [
        {
            "username": "admin",
            "email": "admin@example.com",
            "name": "Администратор",
            "role": "admin",
            "password": "SecurePass123!",
            "is_active": True,
            "is_superuser": True,
        },
        {
            "username": "manager",
            "email": "manager@example.com",
            "name": "Менеджер проекта",
            "role": "manager",
            "password": "ProjectLead456#",
            "is_active": True,
            "is_superuser": False,
        },
        {
            "username": "developer",
            "email": "developer@example.com",
            "name": "Разработчик",
            "role": "developer",
            "password": "CodeMaster789$",
            "is_active": True,
            "is_superuser": False,
        },
        {
            "username": "tester",
            "email": "tester@example.com",
            "name": "Тестировщик",
            "role": "tester",
            "password": "QualityCheck101%",
            "is_active": True,
            "is_superuser": False,
        },
    ]

    # Создание пользователей через ORM
    created_users = []
    for user_data in users_data:
        # Проверяем, существует ли пользователь
        existing_user = await crud_user.get_by_email(db, email=user_data["email"])
        if not existing_user:
            user_create = UserCreate(**user_data)
            user = await crud_user.create(db, obj_in=user_create)
            created_users.append(user)
        else:
            print(f"Пользователь {user_data['email']} уже существует")
            created_users.append(existing_user)

    print(f"✅ Создано {len(created_users)} пользователей")
    return created_users


async def create_sample_projects(db: AsyncSession, owner_user: User):
    """Создать примеры проектов."""
    print("🔄 Создание проектов...")

    projects_data = [
        {
            "name": "Система управления требованиями",
            "code": "RMS",
            "description": "Основной проект для управления требованиями и тестированием",
            "status": "active",
        },
        {
            "name": "Мобильное приложение",
            "code": "MOBILE",
            "description": "Проект разработки мобильного приложения",
            "status": "planning",
        },
        {
            "name": "Интеграция с внешними системами",
            "code": "INTEGRATION",
            "description": "Проект интеграции с АСУТс и другими системами",
            "status": "active",
        },
    ]

    # Создание проектов через ORM
    created_projects = []
    for project_data in projects_data:
        # Проверяем, существует ли проект
        existing_project = await crud_project.get_by_code(db, code=project_data["code"])
        if not existing_project:
            project_create = ProjectCreate(**project_data)
            project = await crud_project.create(db, obj_in=project_create)
            created_projects.append(project)
        else:
            print(f"Проект {project_data['code']} уже существует")
            created_projects.append(existing_project)

    print(f"✅ Создано {len(created_projects)} проектов")
    return created_projects


async def create_sample_requirements(
    db: AsyncSession, projects: list[Project], author: User, reference_data: dict
):
    """Создать примеры требований."""
    print("🔄 Создание требований...")

    if not projects:
        print("❌ Нет проектов для создания требований")
        return []

    if not reference_data.get("types") or not reference_data.get("priorities") or not reference_data.get("statuses"):
        print("❌ Нет справочных данных для создания требований")
        return []

    main_project = projects[0]  # Используем первый проект

    # Получаем ID для разных типов требований
    functional_type = next((t for t in reference_data["types"] if t.name == "Функциональное"), reference_data["types"][0])
    nonfunctional_type = next((t for t in reference_data["types"] if t.name == "Нефункциональное"), reference_data["types"][0])
    
    # Получаем ID для разных приоритетов
    high_priority = next((p for p in reference_data["priorities"] if p.name == "Высокий"), reference_data["priorities"][0])
    medium_priority = next((p for p in reference_data["priorities"] if p.name == "Средний"), reference_data["priorities"][0])
    
    # Получаем ID для статуса "Черновик"
    draft_status = next((s for s in reference_data["statuses"] if s.name == "Черновик"), reference_data["statuses"][0])

    requirements_data = [
        {
            "title": "Аутентификация пользователей",
            "description": "Система должна поддерживать аутентификацию через email и пароль",
            "project_id": main_project.id,
            "type_id": functional_type.id,
            "priority_id": high_priority.id,
            "status_id": draft_status.id,
        },
        {
            "title": "Управление проектами",
            "description": "Пользователи должны иметь возможность создавать и управлять проектами",
            "project_id": main_project.id,
            "type_id": functional_type.id,
            "priority_id": high_priority.id,
            "status_id": draft_status.id,
        },
        {
            "title": "Система отчетности",
            "description": "Система должна генерировать отчеты по проектам и требованиям",
            "project_id": main_project.id,
            "type_id": functional_type.id,
            "priority_id": medium_priority.id,
            "status_id": draft_status.id,
        },
        {
            "title": "Производительность",
            "description": "Система должна обрабатывать запросы за время не более 2 секунд",
            "project_id": main_project.id,
            "type_id": nonfunctional_type.id,
            "priority_id": high_priority.id,
            "status_id": draft_status.id,
        },
    ]

    # Создание требований через ORM
    created_requirements = []
    for req_data in requirements_data:
        # Проверяем, существует ли требование (простая проверка по количеству)
        existing_reqs = await crud_requirement.get_by_project(
            db, project_id=req_data["project_id"]
        )
        existing_titles = [req.title for req in existing_reqs]

        if req_data["title"] not in existing_titles:
            requirement_create = RequirementCreate(**req_data)
            requirement = await crud_requirement.create(
                db, obj_in=requirement_create, author_id=author.id
            )
            created_requirements.append(requirement)
        else:
            print(f"Требование '{req_data['title']}' уже существует")
            # Находим существующее требование
            existing_req = next(
                req for req in existing_reqs if req.title == req_data["title"]
            )
            created_requirements.append(existing_req)

    print(f"✅ Создано {len(created_requirements)} требований")
    return created_requirements


async def create_sample_releases(db: AsyncSession, projects: list[Project]):
    """Создать примеры релизов."""
    print("🔄 Создание релизов...")

    if not projects:
        print("❌ Нет проектов для создания релизов")
        return []

    main_project = projects[0]  # Используем первый проект

    releases_data = [
        {
            "name": "Релиз 1.0.0",
            "version": "1.0.0",
            "description": "Первый стабильный релиз с базовой функциональностью",
            "project_id": main_project.id,
        },
        {
            "name": "Релиз 1.1.0",
            "version": "1.1.0",
            "description": "Релиз с улучшениями UI и новыми функциями",
            "project_id": main_project.id,
        },
    ]

    # Создание релизов через ORM
    created_releases = []
    for release_data in releases_data:
        # Проверяем, существует ли релиз по версии и проекту
        existing_releases = await crud_release.get_by_project(
            db, project_id=release_data["project_id"]
        )
        existing_versions = [rel.version for rel in existing_releases]

        if release_data["version"] not in existing_versions:
            release_create = ReleaseCreate(**release_data)
            release = await crud_release.create(db, obj_in=release_create)
            created_releases.append(release)
        else:
            print(f"Релиз {release_data['version']} уже существует")
            # Находим существующий релиз
            existing_release = next(
                rel
                for rel in existing_releases
                if rel.version == release_data["version"]
            )
            created_releases.append(existing_release)

    print(f"✅ Создано {len(created_releases)} релизов")
    return created_releases


async def create_sample_test_data(db: AsyncSession, projects: list[Project]):
    """Создать примеры тестовых данных."""
    print("🔄 Создание тестовых данных...")

    if not projects:
        print("❌ Нет проектов для создания тестовых данных")
        return []

    main_project = projects[0]  # Используем первый проект

    # Примечание: пока что создаем фиктивные данные, так как тестовые планы и кейсы
    # могут потребовать отдельных моделей и CRUD операций
    test_plans_data = [
        {
            "name": "Основной тестовый план",
            "description": "Полное функциональное тестирование системы",
            "project_id": main_project.id,
        }
    ]

    test_cases_data = [
        {
            "name": "Тест входа в систему",
            "description": "Проверка аутентификации пользователя",
        },
        {
            "name": "Тест создания проекта",
            "description": "Проверка создания нового проекта",
        },
    ]

    # Создание тестовых данных через ORM
    # В реальной реализации здесь будут использоваться соответствующие CRUD операции
    # для создания тестовых планов и кейсов
    print(
        f"✅ Подготовлено {len(test_plans_data)} тестовых планов и {len(test_cases_data)} тест-кейсов"
    )
    return test_plans_data + test_cases_data


async def seed_database():
    """Основная функция заполнения базы данных."""
    print("🌱 Начинаем заполнение базы данных тестовыми данными...")

    try:
        # Получаем сессию напрямую через async generator
        session_gen = get_async_session()
        session = await session_gen.__anext__()

        try:
            # Создаем справочные данные
            reference_data = await create_reference_data(session)

            # Создаем пользователей
            users = await create_sample_users(session)
            admin_user = users[0] if users else None

            if not admin_user:
                print("❌ Не удалось создать администратора")
                return

            # Создаем проекты
            projects = await create_sample_projects(session, admin_user)

            # Создаем требования
            requirements = await create_sample_requirements(
                session, projects, admin_user, reference_data
            )

            # Создаем релизы
            releases = await create_sample_releases(session, projects)

            # Создаем тестовые данные
            test_data = await create_sample_test_data(session, projects)

            # Коммитим все изменения
            await session.commit()

            print("✅ База данных успешно заполнена тестовыми данными!")
            print("\n📋 Созданные учетные записи:")
            print("   admin@example.com / SecurePass123! (Администратор)")
            print("   manager@example.com / ProjectLead456# (Менеджер)")
            print("   developer@example.com / CodeMaster789$ (Разработчик)")
            print("   tester@example.com / QualityCheck101% (Тестировщик)")

        finally:
            await session.close()

    except Exception as e:
        print(f"❌ Ошибка при заполнении базы данных: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


async def clear_database():
    """Очистить базу данных."""
    print("🗑️  Очистка базы данных...")

    confirm = input("⚠️  ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить? (yes/NO): ")
    if confirm.lower() != "yes":
        print("❌ Операция отменена")
        return

    try:
        # Получаем сессию напрямую через async generator
        session_gen = get_async_session()
        session = await session_gen.__anext__()

        try:
            # Очищаем данные в правильном порядке (с учетом внешних ключей)
            from app.models.requirement import Requirement
            from app.models.release import Release
            from app.models.project import Project
            from app.models.user import User
            from app.models.comment import Comment
            from app.models.test_result import TestResult
            from app.models.refresh_token import RefreshToken

            print("🔄 Удаление связанных данных...")

            # Удаляем в правильном порядке (сначала зависимые таблицы)
            await session.execute(text("DELETE FROM comments"))
            await session.execute(text("DELETE FROM test_results"))
            await session.execute(text("DELETE FROM requirements"))
            await session.execute(text("DELETE FROM releases"))
            await session.execute(text("DELETE FROM projects"))
            await session.execute(text("DELETE FROM refresh_tokens"))
            await session.execute(text("DELETE FROM users"))
            
            # Удаляем справочные данные
            await session.execute(text("DELETE FROM requirement_types"))
            await session.execute(text("DELETE FROM requirement_priorities"))
            await session.execute(text("DELETE FROM requirement_statuses"))

            await session.commit()

        finally:
            await session.close()

        print("✅ База данных очищена")

    except Exception as e:
        print(f"❌ Ошибка при очистке базы данных: {e}")
        import traceback

        traceback.print_exc()
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
