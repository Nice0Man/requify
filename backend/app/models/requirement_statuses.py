from typing import TYPE_CHECKING

<<<<<<< HEAD
from sqlalchemy import ARRAY, Boolean, Integer, String, Text
=======
from sqlalchemy import Integer, String, Text, Boolean, JSON
>>>>>>> dev-backend
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .requirement import Requirement


class RequirementStatus(Base):
    """
    Справочник статусов требований (draft, approved, implemented, rejected)
    """

    __tablename__ = "requirement_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    color: Mapped[str] = mapped_column(String(20), nullable=True)
    is_final: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    workflow_transitions: Mapped[list[int]] = mapped_column(
        JSON, nullable=True, default=list
    )

    # Отношения
    requirements: Mapped[list["Requirement"]] = relationship(
        "Requirement", back_populates="status"
    )
