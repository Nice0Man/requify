from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .project import Project
    from .requirement import Requirement


class Release(Base):
    """
    Модель релиза.
    """

    __tablename__ = "releases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Название релиза"
    )
    version: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="SemVer format"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание релиза"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="planned", comment="Статус релиза"
    )
    planned_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Планируемая дата релиза"
    )
    release_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Фактическая дата релиза"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC).replace(tzinfo=None), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        onupdate=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=False,
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="releases")

    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="release"
    )
