from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Integer, String, Index, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company
    from .user_profile import UserProfile
    from .project import Project
    from .requirement import Requirement
    from .comment import Comment
    from .team import Team
    from .enhanced_role_system import UserRoleAssignment


class User(Base, TimestampedMixin):
    """
    Основная модель пользователя системы.
    
    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email", unique=True),
        Index("ix_users_company_id", "company_id"),
        Index("ix_users_is_active", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    # Основные поля
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, comment="Email пользователя"
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Хеш пароля"
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Имя пользователя"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли пользователь"
    )
    
    # Связь с компанией
    company_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID компании пользователя",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    company: Mapped[Optional["Company"]] = relationship(
        "Company", back_populates="users", lazy="select"
    )

    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="user",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Роли пользователя
    role_assignments: Mapped[List["UserRoleAssignment"]] = relationship(
        "UserRoleAssignment",
        foreign_keys="UserRoleAssignment.user_id",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Проекты в собственности
    owned_projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="owner", lazy="select"
    )

    # Требования автора
    authored_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="author", lazy="select"
    )

    # Комментарии
    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="author", lazy="select"
    )

    # Команды в собственности
    owned_teams: Mapped[List["Team"]] = relationship(
        "Team", back_populates="owner", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"