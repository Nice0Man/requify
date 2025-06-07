import enum
import uuid
from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Requirement(Base):
    """
    Модель требования.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Внешние ключи для справочников
    type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement_types.id"), nullable=False
    )
    priority_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement_priorities.id"), nullable=False
    )
    status_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement_statuses.id"), nullable=False
    )

    # Внешние ключи для связанных сущностей
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("project.id"), nullable=False
    )
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    last_modified_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    release_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("release.id"), nullable=True
    )
    spec_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("spec.id"), nullable=True
    )

    # Временные метки
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
        nullable=False,
    )

    # Отношения
    type: Mapped["RequirementType"] = relationship(
        "RequirementType", back_populates="requirements"
    )
    priority: Mapped["RequirementPriority"] = relationship(
        "RequirementPriority", back_populates="requirements"
    )
    status: Mapped["RequirementStatus"] = relationship(
        "RequirementStatus", back_populates="requirements"
    )

    project: Mapped["Project"] = relationship("Project", back_populates="requirements")
    author: Mapped["User"] = relationship(
        "User", foreign_keys=[author_id], back_populates="authored_requirements"
    )
    last_modifier: Mapped["User"] = relationship(
        "User", foreign_keys=[last_modified_by], back_populates="modified_requirements"
    )
    release: Mapped[Optional["Release"]] = relationship(
        "Release", back_populates="requirements"
    )
    spec: Mapped[Optional["Spec"]] = relationship("Spec", back_populates="requirements")

    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="requirement", cascade="all, delete-orphan"
    )

    # Отношения для связей между требованиями
    source_relationships: Mapped[List["Relationship"]] = relationship(
        "Relationship",
        foreign_keys="Relationship.source_id",
        back_populates="source",
        cascade="all, delete-orphan",
    )

    target_relationships: Mapped[List["Relationship"]] = relationship(
        "Relationship",
        foreign_keys="Relationship.target_id",
        back_populates="target",
        cascade="all, delete-orphan",
    )
