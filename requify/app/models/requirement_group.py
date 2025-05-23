from datetime import datetime, UTC
from typing import List

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RequirementGroup(Base):
    """
    Модель группы требований.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("project.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    project: Mapped["Project"] = relationship(
        "Project", back_populates="requirement_groups"
    )

    versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion", back_populates="group", cascade="all, delete-orphan"
    )
