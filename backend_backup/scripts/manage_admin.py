#!/usr/bin/env python3
"""
Скрипт для управления администраторами системы.

Позволяет:
- Создать системного администратора
- Назначить роль администратора существующему пользователю
- Показать список администраторов
- Инициализировать систему ролей
"""

import asyncio
import argparse
import sys
from typing import Optional
from pathlib import Path

# Добавляем путь к проекту
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import get_async_session_generator
from app.models.user import User
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.services.role_initialization_service import role_initialization_service
from app.utils.logger import logger


async def create_admin_user(
    email: str,
    password: str,
    name: Optional[str] = None,
    username: Optional[str] = None,
) -> bool:
    """Создать нового администратора."""
    try:
        db_gen = get_async_session_generator()
        db = await anext(db_gen)

        try:
            # Проверяем, существует ли пользователь
            stmt = select(User).where(User.email == email)
            result = await db.execute(stmt)
            existing_user = result.scalar_one_or_none()

            if existing_user:
                logger.warning(f"Пользователь {email} уже существует")
                return False

            # Создаем пользователя
            new_user = User(
                email=email,
                username=username or email.split("@")[0],
                name=name or "System Administrator",
                password_hash=get_password_hash(password),
                is_active=True,
                is_email_verified=True,
                status="active",
            )

            db.add(new_user)
            await db.flush()

            # Назначаем роль системного администратора
            success = await role_initialization_service.assign_system_admin_role(
                db=db, user_email=email
            )

            if success:
                await db.commit()
                logger.info(f"Администратор {email} успешно создан")
                return True
            else:
                await db.rollback()
                logger.error(f"Не удалось назначить роль администратора для {email}")
                return False
        finally:
            await db.close()

    except Exception as e:
        logger.error(f"Ошибка создания администратора: {str(e)}", exc_info=True)
        return False


async def assign_admin_role(email: str) -> bool:
    """Назначить роль администратора существующему пользователю."""
    try:
        db_gen = get_async_session_generator()
        db = await anext(db_gen)

        try:
            success = await role_initialization_service.assign_system_admin_role(
                db=db, user_email=email
            )

            if success:
                logger.info(f"Роль администратора назначена пользователю {email}")
                return True
            else:
                logger.error(f"Не удалось назначить роль администратора для {email}")
                return False
        finally:
            await db.close()

    except Exception as e:
        logger.error(f"Ошибка назначения роли: {str(e)}", exc_info=True)
        return False


async def list_admins() -> None:
    """Показать список системных администраторов."""
    try:
        db_gen = get_async_session_generator()
        db = await anext(db_gen)

        try:
            # Получаем роль системного администратора
            role_stmt = select(EnhancedRole).where(
                EnhancedRole.name == "system_administrator"
            )
            role_result = await db.execute(role_stmt)
            admin_role = role_result.scalar_one_or_none()

            if not admin_role:
                logger.warning("Роль системного администратора не найдена")
                return

            # Получаем всех пользователей с этой ролью
            assignments_stmt = select(UserRoleAssignment).where(
                UserRoleAssignment.role_id == admin_role.id,
                UserRoleAssignment.is_active == True,
                UserRoleAssignment.company_id.is_(None),
                UserRoleAssignment.department_id.is_(None),
                UserRoleAssignment.team_id.is_(None),
                UserRoleAssignment.project_id.is_(None),
            )
            assignments_result = await db.execute(assignments_stmt)
            assignments = assignments_result.scalars().all()

            if not assignments:
                logger.info("Системные администраторы не найдены")
                return

            logger.info(f"Найдено {len(assignments)} системных администраторов:")

            for assignment in assignments:
                user_stmt = select(User).where(User.id == assignment.user_id)
                user_result = await db.execute(user_stmt)
                user = user_result.scalar_one_or_none()

                if user:
                    status = "✓ Активен" if user.is_active else "✗ Неактивен"
                    logger.info(f"  - {user.email} ({user.name}) - {status}")
        finally:
            await db.close()

    except Exception as e:
        logger.error(
            f"Ошибка получения списка администраторов: {str(e)}", exc_info=True
        )


async def initialize_role_system(force: bool = False) -> bool:
    """Инициализировать систему ролей."""
    try:
        db_gen = get_async_session_generator()
        db = await anext(db_gen)

        try:
            stats = await role_initialization_service.initialize_role_system(
                db=db, force_recreate=force
            )

            logger.info(f"Инициализация системы ролей завершена: {stats}")
            return True
        finally:
            await db.close()

    except Exception as e:
        logger.error(f"Ошибка инициализации системы ролей: {str(e)}", exc_info=True)
        return False


async def main():
    """Главная функция."""
    parser = argparse.ArgumentParser(description="Управление администраторами системы")
    subparsers = parser.add_subparsers(dest="command", help="Доступные команды")

    # Команда создания администратора
    create_parser = subparsers.add_parser(
        "create", help="Создать нового администратора"
    )
    create_parser.add_argument("email", help="Email администратора")
    create_parser.add_argument("password", help="Пароль администратора")
    create_parser.add_argument("--name", help="Имя администратора")
    create_parser.add_argument("--username", help="Имя пользователя")

    # Команда назначения роли
    assign_parser = subparsers.add_parser(
        "assign", help="Назначить роль администратора существующему пользователю"
    )
    assign_parser.add_argument("email", help="Email пользователя")

    # Команда списка администраторов
    list_parser = subparsers.add_parser("list", help="Показать список администраторов")

    # Команда инициализации
    init_parser = subparsers.add_parser("init", help="Инициализировать систему ролей")
    init_parser.add_argument(
        "--force", action="store_true", help="Принудительно пересоздать иерархию"
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    logger.info(f"Выполнение команды: {args.command}")

    try:
        if args.command == "create":
            success = await create_admin_user(
                email=args.email,
                password=args.password,
                name=args.name,
                username=args.username,
            )
            sys.exit(0 if success else 1)

        elif args.command == "assign":
            success = await assign_admin_role(args.email)
            sys.exit(0 if success else 1)

        elif args.command == "list":
            await list_admins()

        elif args.command == "init":
            success = await initialize_role_system(force=args.force)
            sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        logger.info("Операция прервана пользователем")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Неожиданная ошибка: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
