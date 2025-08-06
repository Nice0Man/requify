from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Integer, String, Text, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .requirement import Requirement


class Comment(Base, TimestampedMixin):
    """
    Модель комментария.

    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "comments"
    __table_args__ = (
        Index("ix_comments_requirement_id", "requirement_id"),
        Index("ix_comments_author_id", "author_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    content: Mapped[str] = mapped_column(
        Text, nullable=False, comment="Содержание комментария"
    )

    # Связи
    requirement_id: Mapped[int] = mapped_column(
        ForeignKey("requirements.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID требования",
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Автор комментария",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    requirement: Mapped["Requirement"] = relationship(
        "Requirement", back_populates="comments", lazy="select"
    )

    author: Mapped["User"] = relationship(
        "User", back_populates="comments", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Comment(id={self.id}, requirement_id={self.requirement_id}, author_id={self.author_id})>"
