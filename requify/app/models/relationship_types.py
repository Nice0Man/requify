from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .relationship import Relationship


class RelationshipType(Base):
    """
    Справочник типов связей между требованиями (depends, implements, conflicts)
    """

    __tablename__ = "relationship_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # Отношения
    relationships: Mapped[list["Relationship"]] = relationship(
        "Relationship", back_populates="type"
    )
