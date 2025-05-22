import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReleaseStatus(str, enum.Enum):
    """
    Статусы релизов.
    """

    PLANNED = "planned"  # Планируется
    IN_PROGRESS = "in_progress"  # В разработке
    TESTING = "testing"  # На тестировании
    COMPLETED = "completed"  # Завершен
    ARCHIVED = "archived"  # Архивирован


class Release(Base):
    """
    Модель релиза.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[ReleaseStatus] = mapped_column(
        Enum(ReleaseStatus), default=ReleaseStatus.PLANNED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    planned_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    release_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Внешние ключи
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project.id"), nullable=False
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="releases")
    creator: Mapped["User"] = relationship("User")
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="release"
    )
