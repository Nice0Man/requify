from sqlalchemy.orm import Session

from requify.app.core.config import settings
from requify.app.models.base import Base
from requify.app.db.session import engine
from requify.app.models.user import User
from requify.app.schemas.user import UserCreate
from requify.app.services.users import create_user


def init_db(db: Session) -> None:
    """
    Инициализация базы данных.
    Создание всех таблиц и первого администратора.
    """
    # Создание всех таблиц
    Base.metadata.create_all(bind=engine)

    # Создание первого администратора, если он не существует
    user = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_ADMIN_EMAIL,
            password=settings.FIRST_ADMIN_PASSWORD,
            full_name=settings.FIRST_ADMIN_NAME,
            is_admin=True,
        )
        create_user(db, obj_in=user_in)
