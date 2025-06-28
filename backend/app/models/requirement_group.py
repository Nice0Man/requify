from datetime import UTC, datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .project import Project
    from .requirement_group_version import RequirementGroupVersion


class RequirementGroup(Base):
    """
    Модель группы требований.
    """

    __tablename__ = "requirement_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC).replace(tzinfo=None), nullable=False
    )

    # Отношения
    project: Mapped["Project"] = relationship(
        "Project", back_populates="requirement_groups"
    )

    versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion", back_populates="group", cascade="all, delete-orphan"
    )
