from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
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
    version: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="SemVer format"
    )
    release_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC).replace(tzinfo=None), nullable=False
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="releases")

    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="release"
    )
