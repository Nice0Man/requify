from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RelationshipType(Base):
    """
    Справочник типов связей между требованиями (depends, implements, conflicts)
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # Отношения
    relationships: Mapped[list["Relationship"]] = relationship(
        "Relationship", back_populates="type"
    )
