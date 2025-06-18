import enum
import uuid
from datetime import UTC, datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement_type import RequirementType
    from .requirement_priority import RequirementPriority
    from .requirement_status import RequirementStatus
    from .project import Project
    from .user import User
    from .release import Release
    from .spec import Spec
    from .comment import Comment
    from .relationship import Relationship
    from .test_result import TestResult


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
