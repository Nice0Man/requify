from datetime import UTC, datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement_types import RequirementType
    from .requirement_priorities import RequirementPriority
    from .requirement_statuses import RequirementStatus
    from .project import Project
    from .user import User
    from .comment import Comment


class Requirement(Base, TimestampedMixin):
    """
    Модель требования.
    
    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "requirements"
    __table_args__ = (
        Index("ix_requirements_project_id", "project_id"),
        Index("ix_requirements_author_id", "author_id"),
        Index("ix_requirements_type_id", "type_id"),
        Index("ix_requirements_status_id", "status_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    # Основные поля
    title: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Заголовок требования"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание требования"
    )
    
    # Связи
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID проекта",
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Автор требования",
    )
    type_id: Mapped[int] = mapped_column(
        ForeignKey("requirement_types.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Тип требования",
    )
    priority_id: Mapped[int] = mapped_column(
        ForeignKey("requirement_priorities.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Приоритет требования",
    )
    status_id: Mapped[int] = mapped_column(
        ForeignKey("requirement_statuses.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Статус требования",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    project: Mapped["Project"] = relationship(
        "Project", back_populates="requirements", lazy="select"
    )

    author: Mapped["User"] = relationship(
        "User", back_populates="authored_requirements", lazy="select"
    )

    type: Mapped["RequirementType"] = relationship(
        "RequirementType", lazy="select"
    )

    priority: Mapped["RequirementPriority"] = relationship(
        "RequirementPriority", lazy="select"
    )

    status: Mapped["RequirementStatus"] = relationship(
        "RequirementStatus", lazy="select"
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="requirement", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Requirement(id={self.id}, title='{self.title}', project_id={self.project_id})>"