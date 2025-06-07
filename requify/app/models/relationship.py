from datetime import datetime, UTC

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Relationship(Base):
    """
    Модель связи между требованиями.
    """

    # Используем составной первичный ключ из трех полей
    source_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement.id"), primary_key=True
    )
    target_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement.id"), primary_key=True
    )
    type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("relationship_types.id"), primary_key=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    source: Mapped["Requirement"] = relationship(
        "Requirement", foreign_keys=[source_id], back_populates="source_relationships"
    )

    target: Mapped["Requirement"] = relationship(
        "Requirement", foreign_keys=[target_id], back_populates="target_relationships"
    )

    type: Mapped["RelationshipType"] = relationship(
        "RelationshipType", back_populates="relationships"
    )
