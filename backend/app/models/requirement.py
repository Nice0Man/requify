import enum
import uuid
from datetime import UTC, datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, Index, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement_types import RequirementType
    from .requirement_priorities import RequirementPriority
    from .requirement_statuses import RequirementStatus
    from .project import Project
    from .user import User
    from .release import Release
    from .spec import Spec
    from .comment import Comment
    from .relationship import Relationship
    from .test_result import TestResult
    from .dashboard import DashboardNotification, DashboardActivity


class Requirement(Base, TimestampedMixin):
    """
    Модель требования.

    Представляет отдельное требование в рамках проекта.
    Содержит информацию о типе, приоритете, статусе и связях с другими сущностями.
    """

    __tablename__ = "requirements"
    __table_args__ = (
        Index("ix_requirements_project_status", "project_id", "status_id"),
        Index("ix_requirements_author_created", "author_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Заголовок требования"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Подробное описание требования"
    )
    deadline: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Срок выполнения требования"
    )
    progress: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="Прогресс выполнения требования (0.0-100.0)",
    )

    # Внешние ключи для справочников
    type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("requirement_types.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Тип требования",
    )
    priority_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("requirement_priorities.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Приоритет требования",
    )
    status_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("requirement_statuses.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Статус требования",
    )

    # Внешние ключи для связанных сущностей
    project_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="Проект, к которому относится требование",
    )
    author_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Автор требования",
    )
    last_modified_by: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Последний редактор требования",
    )
    release_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("releases.id", ondelete="SET NULL"),
        nullable=True,
        comment="Релиз, в котором реализуется требование",
    )
    spec_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("specs.id", ondelete="SET NULL"),
        nullable=True,
        comment="Спецификация, к которой относится требование",
    )

    # Отношения
    type: Mapped["RequirementType"] = relationship(
        "RequirementType", back_populates="requirements", lazy="select"
    )
    priority: Mapped["RequirementPriority"] = relationship(
        "RequirementPriority", back_populates="requirements", lazy="select"
    )
    status: Mapped["RequirementStatus"] = relationship(
        "RequirementStatus", back_populates="requirements", lazy="select"
    )

    project: Mapped["Project"] = relationship(
        "Project", back_populates="requirements", lazy="select"
    )
    author: Mapped["User"] = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="authored_requirements",
        lazy="select",
    )
    last_modifier: Mapped["User"] = relationship(
        "User",
        foreign_keys=[last_modified_by],
        back_populates="modified_requirements",
        lazy="select",
    )
    release: Mapped[Optional["Release"]] = relationship(
        "Release", back_populates="requirements", lazy="select"
    )
    spec: Mapped[Optional["Spec"]] = relationship(
        "Spec", back_populates="requirements", lazy="select"
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment",
        back_populates="requirement",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Отношения для связей между требованиями
    source_relationships: Mapped[List["Relationship"]] = relationship(
        "Relationship",
        foreign_keys="Relationship.source_id",
        back_populates="source",
        cascade="all, delete-orphan",
        lazy="select",
    )

    target_relationships: Mapped[List["Relationship"]] = relationship(
        "Relationship",
        foreign_keys="Relationship.target_id",
        back_populates="target",
        cascade="all, delete-orphan",
        lazy="select",
    )

    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult",
        back_populates="requirement",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Dashboard relationships
    notifications: Mapped[List["DashboardNotification"]] = relationship(
        "DashboardNotification",
        back_populates="requirement",
        lazy="select",
        cascade="all, delete-orphan",
    )

    activities: Mapped[List["DashboardActivity"]] = relationship(
        "DashboardActivity",
        back_populates="requirement",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Computed properties for schema compatibility
    @property
    def type_name(self) -> Optional[str]:
        """Название типа требования."""
        return self.type.name if self.type else None

    @property
    def priority_name(self) -> Optional[str]:
        """Название приоритета требования."""
        return self.priority.name if self.priority else None

    @property
    def status_name(self) -> Optional[str]:
        """Название статуса требования."""
        return self.status.name if self.status else None

    @property
    def project_name(self) -> Optional[str]:
        """Название проекта."""
        return self.project.name if self.project else None

    @property
    def author_name(self) -> Optional[str]:
        """Имя автора требования."""
        if self.author:
            return f"{self.author.first_name} {self.author.last_name}".strip()
        return None

    @property
    def last_modifier_name(self) -> Optional[str]:
        """Имя последнего редактора требования."""
        if self.last_modifier:
            return f"{self.last_modifier.first_name} {self.last_modifier.last_name}".strip()
        return None

    @property
    def release_version(self) -> Optional[str]:
        """Версия релиза."""
        return self.release.version if self.release else None

    @property
    def spec_name(self) -> Optional[str]:
        """Название спецификации."""
        return self.spec.name if self.spec else None
