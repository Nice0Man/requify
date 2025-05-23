from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Release(Base):
    """
    Модель релиза.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("project.id"), nullable=False
    )
    version: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="SemVer format"
    )
    release_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="releases")

    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="release"
    )
