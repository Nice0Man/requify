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
    from .requirement_group import RequirementGroup
    from .user import User
    from .dashboard import DashboardNotification, DashboardActivity


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
    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Владелец проекта",
    )

    # Отношения
    owner: Mapped["User"] = relationship(
        "User", back_populates="owned_projects", lazy="select"
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

    requirement_groups: Mapped[List["RequirementGroup"]] = relationship(
        "RequirementGroup",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Dashboard relationships
    notifications: Mapped[List["DashboardNotification"]] = relationship(
        "DashboardNotification",
        back_populates="project",
        lazy="select",
        cascade="all, delete-orphan",
    )

    activities: Mapped[List["DashboardActivity"]] = relationship(
        "DashboardActivity",
        back_populates="project",
        lazy="select",
        cascade="all, delete-orphan",
    )
