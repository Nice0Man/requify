from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Spec(Base):
    """
    Модель спецификации.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("project.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    template_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Шаблон спецификации"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="specs")

    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="spec"
    )
