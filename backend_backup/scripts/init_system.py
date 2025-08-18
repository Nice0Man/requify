#!/usr/bin/env python3
"""
Скрипт полной инициализации системы при развертывании.

Выполняет:
1. Создание таблиц базы данных
2. Инициализацию системы ролей и иерархии
3. Создание первого администратора
4. Валидацию системы
"""

import asyncio
import sys
from pathlib import Path

# Добавляем путь к проекту
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import sync_db_session, async_session_factory
from app.db.init_db import init_db, init_role_hierarchy
from app.services.role_initialization_service import role_initialization_service
from app.utils.logger import logger


async def full_system_initialization():
    """Полная инициализация системы."""
    logger.info("Начинаем полную инициализацию системы...")

    try:
        # 1. Инициализация базы данных (синхронная)
        logger.info("1. Инициализация базы данных...")
        with sync_db_session() as db:
            init_db(db)
        logger.info("✓ База данных инициализирована")

        # 2. Инициализация системы ролей (асинхронная)
        logger.info("2. Инициализация системы ролей...")
        async with async_session_factory() as db:
            await init_role_hierarchy(db)
        logger.info("✓ Система ролей инициализирована")

        # 3. Валидация системы
        logger.info("3. Валидация системы...")
        async with async_session_factory() as db:
            validation_result = await _validate_system(db)

            if validation_result["is_valid"]:
                logger.info("✓ Система валидна")
            else:
                logger.warning(f"⚠ Обнаружены проблемы: {validation_result['issues']}")

        # 4. Финальная проверка
        logger.info("4. Финальная проверка...")
        system_health = await _check_system_health()

        if system_health["healthy"]:
            logger.info("✓ Система готова к работе")
            logger.info(f"📊 Статистика: {system_health['stats']}")
        else:
            logger.error(f"✗ Система не готова: {system_health['issues']}")
            return False

        logger.info("🎉 Полная инициализация системы завершена успешно!")
        return True

    except Exception as e:
        logger.error(f"💥 Ошибка инициализации системы: {str(e)}", exc_info=True)
        return False


async def _validate_system(db: AsyncSession) -> dict:
    """Валидация системы."""
    issues = []

    try:
        # Проверяем систему ролей
        from app.services.role_hierarchy_service import role_hierarchy_service

        # Строим DAG для проверки циклов
        dag = await role_hierarchy_service.build_role_dag(db, force_refresh=True)

        if dag.has_cycle():
            issues.append("Обнаружены циклы в иерархии ролей")

        # Проверяем количество ролей
        role_count = len(dag.nodes)
        if role_count < 8:  # Ожидаем минимум 8 базовых ролей
            issues.append(f"Недостаточно ролей в системе: {role_count} < 8")

        # Проверяем иерархию
        hierarchy_count = len(dag.adjacency_list)
        if hierarchy_count < 5:  # Ожидаем минимум 5 связей
            issues.append(f"Недостаточно связей в иерархии: {hierarchy_count} < 5")

    except Exception as e:
        issues.append(f"Ошибка валидации системы ролей: {str(e)}")

    return {"is_valid": len(issues) == 0, "issues": issues}


async def _check_system_health() -> dict:
    """Проверка здоровья системы."""
    stats = {}
    issues = []

    try:
        async with async_session_factory() as db:
            from sqlalchemy import select, func
            from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
            from app.models.role_hierarchy import RoleHierarchy
            from app.models.user import User

            # Статистика ролей
            roles_stmt = select(func.count(EnhancedRole.id)).where(
                EnhancedRole.is_active == True
            )
            roles_result = await db.execute(roles_stmt)
            stats["active_roles"] = roles_result.scalar()

            # Статистика иерархии
            hierarchy_stmt = select(func.count(RoleHierarchy.id)).where(
                RoleHierarchy.is_active == True
            )
            hierarchy_result = await db.execute(hierarchy_stmt)
            stats["hierarchy_links"] = hierarchy_result.scalar()

            # Статистика пользователей
            users_stmt = select(func.count(User.id)).where(User.is_active == True)
            users_result = await db.execute(users_stmt)
            stats["active_users"] = users_result.scalar()

            # Статистика назначений ролей
            assignments_stmt = select(func.count(UserRoleAssignment.id)).where(
                UserRoleAssignment.is_active == True
            )
            assignments_result = await db.execute(assignments_stmt)
            stats["role_assignments"] = assignments_result.scalar()

            # Проверяем наличие администратора
            admin_role_stmt = select(EnhancedRole).where(
                EnhancedRole.name == "system_administrator"
            )
            admin_role_result = await db.execute(admin_role_stmt)
            admin_role = admin_role_result.scalar_one_or_none()

            if admin_role:
                admin_assignments_stmt = select(
                    func.count(UserRoleAssignment.id)
                ).where(
                    UserRoleAssignment.role_id == admin_role.id,
                    UserRoleAssignment.is_active == True,
                )
                admin_assignments_result = await db.execute(admin_assignments_stmt)
                stats["system_admins"] = admin_assignments_result.scalar()

                if stats["system_admins"] == 0:
                    issues.append("Нет активных системных администраторов")
            else:
                issues.append("Роль системного администратора не найдена")
                stats["system_admins"] = 0

            # Минимальные требования
            if stats["active_roles"] < 8:
                issues.append(
                    f"Недостаточно активных ролей: {stats['active_roles']} < 8"
                )

            if stats["hierarchy_links"] < 5:
                issues.append(
                    f"Недостаточно связей в иерархии: {stats['hierarchy_links']} < 5"
                )

            if stats["active_users"] == 0:
                issues.append("Нет активных пользователей в системе")

    except Exception as e:
        issues.append(f"Ошибка проверки здоровья системы: {str(e)}")

    return {"healthy": len(issues) == 0, "issues": issues, "stats": stats}


def print_usage():
    """Вывести информацию об использовании."""
    print(
        """
Скрипт инициализации системы Requify

Использование:
    python scripts/init_system.py

Что делает скрипт:
1. Создает таблицы базы данных
2. Инициализирует систему ролей и иерархию
3. Создает первого администратора
4. Проверяет корректность системы

Переменные окружения:
    ADMIN_EMAIL    - Email первого администратора
    ADMIN_PASSWORD - Пароль первого администратора
    ADMIN_NAME     - Имя первого администратора

Примеры:
    # Инициализация с переменными окружения
    ADMIN_EMAIL=admin@company.com ADMIN_PASSWORD=secret123 python scripts/init_system.py
    
    # После инициализации можно управлять администраторами
    python scripts/manage_admin.py list
    python scripts/manage_admin.py create new_admin@company.com password123
"""
    )


async def main():
    """Главная функция."""
    if len(sys.argv) > 1 and sys.argv[1] in ["-h", "--help", "help"]:
        print_usage()
        return

    logger.info("=" * 60)
    logger.info("🚀 ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ REQUIFY")
    logger.info("=" * 60)

    # Проверяем настройки
    logger.info(f"📧 Admin email: {settings.admin.email}")
    logger.info(f"🏢 Environment: {settings.run.env}")
    logger.info(f"🐛 Debug mode: {settings.run.debug}")

    try:
        success = await full_system_initialization()

        if success:
            logger.info("=" * 60)
            logger.info("✅ ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА УСПЕШНО")
            logger.info("=" * 60)
            logger.info(f"🔑 Администратор: {settings.admin.email}")
            logger.info(f"🌐 Система готова к работе!")
            logger.info("")
            logger.info("📖 Полезные команды:")
            logger.info(
                "   python scripts/manage_admin.py list         # Список администраторов"
            )
            logger.info(
                "   python scripts/manage_admin.py create ...   # Создать администратора"
            )
            logger.info(
                "   python scripts/manage_admin.py init         # Переинициализация ролей"
            )
            sys.exit(0)
        else:
            logger.error("=" * 60)
            logger.error("❌ ИНИЦИАЛИЗАЦИЯ НЕ УДАЛАСЬ")
            logger.error("=" * 60)
            logger.error("🔧 Проверьте логи выше для диагностики проблем")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("\n⏹️  Инициализация прервана пользователем")
        sys.exit(1)
    except Exception as e:
        logger.error(f"💥 Критическая ошибка: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
