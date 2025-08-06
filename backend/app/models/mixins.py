"""
Миксины для моделей пользователя.
Разделение по принципу единственной ответственности.
ОБНОВЛЕНО: ProfileMixin удален, профиль вынесен в UserProfile модель.
"""

from datetime import UTC, datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Index, Enum, JSON, Integer
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

    # Status field
    status: Mapped[str] = mapped_column(
        String(20), default="active", nullable=False, comment="Статус пользователя"
    )

    # Authentication provider
    auth_provider: Mapped[str] = mapped_column(
        String(20), default="local", nullable=False, comment="Провайдер аутентификации"
    )
    auth_provider_id: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True, comment="ID пользователя у внешнего провайдера"
    )

    # Security fields
    login_attempts: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, comment="Количество неудачных попыток входа"
    )
    locked_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Заблокирован до (после множественных неудачных попыток)"
    )
    password_changed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата последней смены пароля"
    )
    
    # User agreements
    terms_accepted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата принятия условий использования"
    )
    privacy_policy_accepted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата принятия политики конфиденциальности"
    )
    
    # User data
    preferences: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Пользовательские настройки"
    )
    user_metadata: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Дополнительные метаданные"
    )


class PermissionsMixin:
    """Миксин для ролей и разрешений (базовый уровень)"""

    # Статус и права доступа
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли пользователь"
    )


class EmailVerificationMixin:
    """Миксин для подтверждения email"""

    is_email_verified: Mapped[bool] = mapped_column(
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
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время последнего входа в систему"
    )


class UserIndexesMixin:
    """Миксин для определения индексов User модели"""

    __table_args__ = (
        Index("ix_users_email_unique", "email", unique=True),
        Index("ix_users_username_unique", "username", unique=True),
        Index("ix_users_auth_provider_id_unique", "auth_provider_id", unique=True),
        Index("ix_users_is_active", "is_active"),
        Index("ix_users_status", "status"),
        Index("ix_users_auth_provider", "auth_provider"),
        Index("ix_users_last_login_at", "last_login_at"),
        Index("ix_users_is_email_verified", "is_email_verified"),
        Index("ix_users_company_id", "company_id"),
        Index("ix_users_login_attempts", "login_attempts"),
    )
