from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
<<<<<<< HEAD
from app.db.session import engine
from app.models.base import Base
=======
from app.models.base import Base
from app.db.session import engine, async_engine
>>>>>>> dev-backend
from app.models.user import User
from app.schemas.user import UserCreate
from app.crud.user import user as user_crud
from app.db.seeding import seed_enhanced_roles
from app.services.role_initialization_service import role_initialization_service
from app.utils.logger import logger


def init_db(db: Session) -> None:
    """
    Инициализация базы данных.
    Создание всех таблиц и первого администратора.
    """
    logger.info("Starting database initialization...")

    # Создание всех таблиц
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

    # Создание первого администратора, если он не существует
    user = db.query(User).filter(User.email == settings.admin.email).first()
    if not user:
        # Create admin user manually using sync session
        from app.core.security import get_password_hash

        admin_user = User(
            email=settings.admin.email,
            username="admin",
            name=settings.admin.name,
            password_hash=get_password_hash(settings.admin.password),
            is_active=True,
            is_email_verified=True,
            status="active",
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info(f"First admin user created: {settings.admin.email}")
    else:
        logger.info(f"Admin user already exists: {settings.admin.email}")

    # Seed enhanced roles system (legacy approach)
    logger.info("Starting legacy enhanced roles seeding...")
    try:
        stats = seed_enhanced_roles(db)
        logger.info(f"Legacy enhanced roles seeding completed: {stats}")

        # Assign system admin role to admin user (legacy)
        from app.db.seeding import assign_system_admin_role

        if assign_system_admin_role(db, settings.admin.email):
            logger.info("System admin role assigned successfully (legacy)")
        else:
            logger.warning("Failed to assign system admin role (legacy)")
    except Exception as e:
        logger.error(f"Legacy enhanced roles seeding failed: {e}")
        # Don't fail the entire initialization if seeding fails
        pass


async def init_role_hierarchy(db: AsyncSession) -> None:
    """
    Асинхронная инициализация системы иерархии ролей.
    """
    logger.info("Starting role hierarchy initialization...")

    try:
        # Инициализируем систему ролей с иерархией
        stats = await role_initialization_service.initialize_role_system(
            db=db, force_recreate=False  # Не пересоздаваем существующие связи
        )

        logger.info(f"Role hierarchy initialization completed: {stats}")

        # Назначаем роль системного администратора
        admin_assigned = await role_initialization_service.assign_system_admin_role(
            db=db, user_email=settings.admin.email
        )

        if admin_assigned:
            logger.info(f"System admin role assigned to {settings.admin.email}")
        else:
            logger.warning(
                f"Failed to assign system admin role to {settings.admin.email}"
            )

        await db.commit()

    except Exception as e:
        logger.error(f"Role hierarchy initialization failed: {str(e)}", exc_info=True)
        await db.rollback()
        # Don't fail the entire initialization if role hierarchy fails
        pass
