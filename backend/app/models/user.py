from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Integer, String, Index, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin
from .mixins import AuthMixin, PermissionsMixin, EmailVerificationMixin, ActivityMixin

if TYPE_CHECKING:
    from .company import Company
    from .user_profile import UserProfile
    from .project import Project
    from .requirement import Requirement
    from .comment import Comment
    from .team import Team
    from .team_member import TeamMember
    from .enhanced_role_system import UserRoleAssignment
    from .dashboard import (
        UserDashboardPreferences,
        DashboardNotification,
        DashboardActivity,
        DashboardWidget,
    )
    from .requirement_group_version import RequirementGroupVersion
    from .test_result import TestResult
    from .user_settings import UserSettings, UserSettingsHistory
    from .refresh_token import RefreshToken


class User(Base, AuthMixin, PermissionsMixin, EmailVerificationMixin, ActivityMixin, TimestampedMixin):
    """
    Основная модель пользователя системы.

    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email", unique=True),
        Index("ix_users_username", "username", unique=True),
        Index("ix_users_company_id", "company_id"),
        Index("ix_users_is_active", "is_active"),
        Index("ix_users_status", "status"),
        Index("ix_users_is_email_verified", "is_email_verified"),
        Index("ix_users_last_login_at", "last_login_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Дополнительные поля (не из mixins)
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Имя пользователя"
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

    # Участие в командах
    team_memberships: Mapped[List["TeamMember"]] = relationship(
        "TeamMember", back_populates="user", lazy="select", cascade="all, delete-orphan"
    )

    # Dashboard-related relationships
    dashboard_preferences: Mapped[Optional["UserDashboardPreferences"]] = relationship(
        "UserDashboardPreferences",
        back_populates="user",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    notifications: Mapped[List["DashboardNotification"]] = relationship(
        "DashboardNotification",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    activities: Mapped[List["DashboardActivity"]] = relationship(
        "DashboardActivity",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    dashboard_widgets: Mapped[List["DashboardWidget"]] = relationship(
        "DashboardWidget",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Additional relationships
    group_versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion", back_populates="created_by_user", lazy="select"
    )

    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult", back_populates="tester", lazy="select"
    )

    # Settings and tokens
    settings: Mapped[Optional["UserSettings"]] = relationship(
        "UserSettings",
        back_populates="user",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        "RefreshToken",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Settings history
    settings_history: Mapped[List["UserSettingsHistory"]] = relationship(
        "UserSettingsHistory", lazy="select", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"
