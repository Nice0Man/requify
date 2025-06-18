from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Integer, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement import Requirement
    from .release import Release
    from .spec import Spec
    from .requirement_group import RequirementGroup


class Project(Base, TimestampedMixin):
    """
    Модель проекта.
    
    Представляет отдельный проект с его требованиями, релизами, 
    спецификациями и группами требований.
    """
        
    __tablename__ = "projects"
    __table_args__ = (
        Index('ix_projects_status_created', 'status', 'created_at'),
        Index('ix_projects_code_unique', 'code', unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        nullable=False, 
        comment="Уникальный код проекта"
    )
    name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False,
        comment="Название проекта"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, 
        nullable=True,
        comment="Описание проекта"
    )
    status: Mapped[str] = mapped_column(
        String(50), 
        nullable=False,
        comment="Статус проекта (active, completed, archived)"
    )

    # Отношения
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", 
        back_populates="project", 
        cascade="all, delete-orphan",
        lazy="select"
    )

    releases: Mapped[List["Release"]] = relationship(
        "Release", 
        back_populates="project", 
        cascade="all, delete-orphan",
        lazy="select"
    )

    specs: Mapped[List["Spec"]] = relationship(
        "Spec", 
        back_populates="project", 
        cascade="all, delete-orphan",
        lazy="select"
    )

    requirement_groups: Mapped[List["RequirementGroup"]] = relationship(
        "RequirementGroup", 
        back_populates="project", 
        cascade="all, delete-orphan",
        lazy="select"
    )
