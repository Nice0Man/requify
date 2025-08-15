from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.base import Base
from app.db.session import engine
from app.models.user import User
from app.schemas.user import UserCreate
from app.crud.user import user as user_crud
from app.db.seeding import seed_enhanced_roles
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

    # Seed enhanced roles system
    logger.info("Starting enhanced roles seeding...")
    try:
        stats = seed_enhanced_roles(db)
        logger.info(f"Enhanced roles seeding completed: {stats}")

        # Assign system admin role to admin user
        from app.db.seeding import assign_system_admin_role

        if assign_system_admin_role(db, settings.admin.email):
            logger.info("System admin role assigned successfully")
        else:
            logger.warning("Failed to assign system admin role")
    except Exception as e:
        logger.error(f"Enhanced roles seeding failed: {e}")
        # Don't fail the entire initialization if seeding fails
        pass
