from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RequirementStatus(Base):
    """
    Справочник статусов требований (draft, approved, implemented, rejected)
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # Отношения
    requirements: Mapped[list["Requirement"]] = relationship(
        "Requirement", back_populates="status"
    )
