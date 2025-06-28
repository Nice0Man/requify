from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement import Requirement
    from .comment import Comment
    from .requirement_group_version import RequirementGroupVersion
    from .test_result import TestResult
    from .refresh_token import RefreshToken


class User(Base, TimestampedMixin):
    """
    Модель пользователя системы.

    Представляет пользователя с его ролями, созданными требованиями,
    комментариями и другими связанными сущностями.
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email_unique", "email", unique=True),
        Index("ix_users_username_unique", "username", unique=True),
        Index("ix_users_role_created", "role", "created_at"),
        Index("ix_users_is_active", "is_active"),
        Index("ix_users_last_login", "last_login"),
        Index("ix_users_email_verified", "email_verified"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="Уникальное имя пользователя"
    )
    email: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, comment="Email адрес пользователя"
    )
    hashed_password: Mapped[str] = mapped_column(
        String(128), nullable=False, comment="Хэшированный пароль"
    )

    # Профиль пользователя
    name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Полное имя пользователя"
    )
    first_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Имя пользователя"
    )
    last_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Фамилия пользователя"
    )
    department: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Отдел пользователя"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Телефон пользователя"
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="user",
        comment="Роль пользователя (admin, manager, analyst, developer, tester, user)",
    )

    # Статус и права доступа
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли пользователь"
    )
    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Является ли пользователь суперпользователем",
    )
    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Подтвержден ли email пользователя",
    )
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время подтверждения email"
    )

    # Временные метки активности
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время последнего входа в систему"
    )

    # Отношения
    authored_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        foreign_keys="Requirement.author_id",
        back_populates="author",
        lazy="select",
    )

    modified_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        foreign_keys="Requirement.last_modified_by",
        back_populates="last_modifier",
        lazy="select",
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="author", lazy="select"
    )

    group_versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion",
        foreign_keys="RequirementGroupVersion.created_by",
        back_populates="created_by_user",
        lazy="select",
    )

    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult", back_populates="tester", lazy="select"
    )

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        "RefreshToken",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
