from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional, List
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, Integer, Index, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .project import Project
    from .specification import Specification

class ReleaseStatus(PyEnum):
    """Статусы релиза"""

    PLANNED = "planned"
    IN_DEVELOPMENT = "in_development"
    TESTING = "testing"
    REVIEW = "review"
    READY = "ready"
    RELEASED = "released"
    CANCELLED = "cancelled"
    HOTFIX = "hotfix"

class Release(Base, TimestampedMixin):
    """
    Модель релиза.

    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "releases"
    __table_args__ = (
        Index("ix_releases_project_id", "project_id"),
        Index("ix_releases_version", "version"),
        Index("ix_releases_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    version: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Версия релиза"
    )
    name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Название релиза"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1000), nullable=True, comment="Описание релиза"
    )
    status: Mapped[str] = mapped_column(
        Enum(ReleaseStatus),
        default=ReleaseStatus.PLANNED,
        nullable=False,
        comment="Статус релиза",
    )

    # Даты
    planned_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Планируемая дата релиза"
    )
    released_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Фактическая дата релиза"
    )

    # Связи
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID проекта",
    )

    #     # Отношения
    # 
    project: Mapped["Project"] = relationship(
        "Project", back_populates="releases", lazy="select"
    )

    specifications: Mapped[List["Specification"]] = relationship(
        "Specification",
        back_populates="release",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Release(id={self.id}, version='{self.version}', project_id={self.project_id})>"
