from datetime import UTC, datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Integer, String, Text, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .constants import ProjectStatus
from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement import Requirement
    from .release import Release
    from .spec import Spec
    from .specification import Specification
    from .requirement_group import RequirementGroup
    from .test_case import TestCase, TestPlan
    from .user import User
    from .team import Team
    from .company import Company
    from .department import Department
    from .dashboard import DashboardNotification, DashboardActivity
    from .activity import Activity


class Project(Base, TimestampedMixin):
    """
    Модель проекта.

    Представляет отдельный проект с его требованиями, релизами,
    спецификациями и группами требований.
    """

    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_status_created", "status", "created_at"),
        Index("ix_projects_code_unique", "code", unique=True),
        Index("ix_projects_company_id", "company_id"),
        Index("ix_projects_department_id", "department_id"),
        Index("ix_projects_team_id", "team_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="Уникальный код проекта"
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Название проекта"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание проекта"
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default=ProjectStatus.DRAFT,
        comment="Статус проекта",
        nullable=False,
    )

    # =============================================================================
    # Организационная принадлежность
    # =============================================================================

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании (для партиционирования данных)",
    )
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID департамента (проект принадлежит департаменту)",
    )

    # =============================================================================
    # Управление проектом
    # =============================================================================

    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Владелец проекта",
    )
    team_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("teams.id", ondelete="SET NULL"),
        nullable=True,
        comment="Основная команда проекта (может быть NULL)",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    # Организационные связи
    company: Mapped["Company"] = relationship(
        "Company", back_populates="projects", lazy="select"
    )
    department: Mapped["Department"] = relationship(
        "Department", back_populates="projects", lazy="select"
    )

    # Управление
    owner: Mapped["User"] = relationship(
        "User", back_populates="owned_projects", lazy="select"
    )
    team: Mapped[Optional["Team"]] = relationship(
        "Team", back_populates="projects", lazy="select"
    )

    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    releases: Mapped[List["Release"]] = relationship(
        "Release", back_populates="project", cascade="all, delete-orphan", lazy="select"
    )

    specs: Mapped[List["Spec"]] = relationship(
        "Spec", back_populates="project", cascade="all, delete-orphan", lazy="select"
    )

    specifications: Mapped[List["Specification"]] = relationship(
        "Specification", back_populates="project", cascade="all, delete-orphan", lazy="select"
    )

    requirement_groups: Mapped[List["RequirementGroup"]] = relationship(
        "RequirementGroup",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Testing relationships
    test_cases: Mapped[List["TestCase"]] = relationship(
        "TestCase", back_populates="project", cascade="all, delete-orphan", lazy="select"
    )

    test_plans: Mapped[List["TestPlan"]] = relationship(
        "TestPlan", back_populates="project", cascade="all, delete-orphan", lazy="select"
    )

    # Dashboard relationships
    notifications: Mapped[List["DashboardNotification"]] = relationship(
        "DashboardNotification",
        back_populates="project",
        lazy="select",
        cascade="all, delete-orphan",
    )

    dashboard_activities: Mapped[List["DashboardActivity"]] = relationship(
        "DashboardActivity",
        back_populates="project",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Collaboration relationships
    activities: Mapped[List["Activity"]] = relationship(
        "Activity",
        back_populates="project",
        lazy="select",
        cascade="all, delete-orphan",
    )

    @property
    def dashboard_notifications(self):
        """Alias for notifications for backward compatibility."""
        return self.notifications
