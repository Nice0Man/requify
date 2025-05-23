from datetime import datetime, UTC

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Comment(Base):
    """
    Модель комментария к требованию.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    requirement_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement.id"), nullable=False
    )
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    requirement: Mapped["Requirement"] = relationship(
        "Requirement", back_populates="comments"
    )

    author: Mapped["User"] = relationship("User", back_populates="comments")
