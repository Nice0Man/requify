"""
Миксины для моделей пользователя.
Разделение по принципу единственной ответственности.
ОБНОВЛЕНО: ProfileMixin удален, профиль вынесен в UserProfile модель.
"""

from datetime import UTC, datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Index
from sqlalchemy.orm import Mapped, mapped_column


class AuthMixin:
    """Миксин для аутентификации и базовых данных пользователя"""

    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="Уникальное имя пользователя"
    )
    email: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, comment="Email адрес пользователя"
    )
    hashed_password: Mapped[str] = mapped_column(
        String(128), nullable=False, comment="Хэшированный пароль"
    )

    # Auth0 integration
    auth0_id: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True, comment="Auth0 user ID для интеграции"
    )


class PermissionsMixin:
    """Миксин для ролей и разрешений (базовый уровень)"""

    # Статус и права доступа
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли пользователь"
    )

class EmailVerificationMixin:
    """Миксин для подтверждения email"""

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Подтвержден ли email пользователя",
    )
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время подтверждения email"
    )


class ActivityMixin:
    """Миксин для отслеживания активности пользователя"""

    # Временные метки активности
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время последнего входа в систему"
    )


class UserIndexesMixin:
    """Миксин для определения индексов User модели"""

    __table_args__ = (
        Index("ix_users_email_unique", "email", unique=True),
        Index("ix_users_username_unique", "username", unique=True),
        Index("ix_users_auth0_id_unique", "auth0_id", unique=True),
        Index("ix_users_is_active", "is_active"),
        Index("ix_users_last_login", "last_login"),
        Index("ix_users_email_verified", "email_verified"),
        Index("ix_users_company_id", "company_id"),  # Новый индекс для компании
    )
