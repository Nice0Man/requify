import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RequirementStatus(str, enum.Enum):
    """
    Статусы требований.
    """

    DRAFT = "draft"  # Черновик
    PENDING = "pending"  # На рассмотрении
    APPROVED = "approved"  # Утверждено
    IN_PROGRESS = "in_progress"  # В разработке
    TESTING = "testing"  # На тестировании
    COMPLETED = "completed"  # Завершено
    ARCHIVED = "archived"  # Архивировано


class RequirementPriority(str, enum.Enum):
    """
    Приоритеты требований.
    """

    LOW = "low"  # Низкий
    MEDIUM = "medium"  # Средний
    HIGH = "high"  # Высокий
    CRITICAL = "critical"  # Критический


class Requirement(Base):
    """
    Модель требования.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[RequirementStatus] = mapped_column(
        Enum(RequirementStatus), default=RequirementStatus.DRAFT, nullable=False
    )
    priority: Mapped[RequirementPriority] = mapped_column(
        Enum(RequirementPriority), default=RequirementPriority.MEDIUM, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Внешние ключи
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project.id"), nullable=False
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    release_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("release.id"), nullable=True
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="requirements")
    creator: Mapped["User"] = relationship("User")
    release: Mapped[Optional["Release"]] = relationship(
        "Release", back_populates="requirements"
    )
    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult", back_populates="requirement", cascade="all, delete-orphan"
    )
