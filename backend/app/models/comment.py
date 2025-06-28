from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .requirement import Requirement
    from .user import User


class Comment(Base):
    """
    Модель комментария к требованию.
    """

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    requirement_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirements.id"), nullable=False
    )
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC).replace(tzinfo=None), nullable=False
    )

    # Отношения
    requirement: Mapped["Requirement"] = relationship(
        "Requirement", back_populates="comments"
    )

    author: Mapped["User"] = relationship("User", back_populates="comments")
