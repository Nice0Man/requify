from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .requirement import Requirement


class RequirementPriority(Base):
    """
    Справочник приоритетов требований (critical, high, medium, low)
    """

    __tablename__ = "requirement_priorities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # Отношения
    requirements: Mapped[list["Requirement"]] = relationship(
        "Requirement", back_populates="priority"
    )
