import enum
from datetime import datetime, UTC
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class TestStatus(str, enum.Enum):
    """
    Статусы тестирования.
    """

    NOT_STARTED = "not_started"  # Не начато
    IN_PROGRESS = "in_progress"  # В процессе
    PASSED = "passed"  # Успешно пройдено
    FAILED = "failed"  # Провалено
    BLOCKED = "blocked"  # Заблокировано


class TestResult(Base):
    """
    Модель результатов тестирования требования.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    status: Mapped[TestStatus] = mapped_column(
        Enum(TestStatus), default=TestStatus.NOT_STARTED, nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
        nullable=False,
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    external_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Внешние ключи
    requirement_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement.id"), nullable=False
    )
    tester_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )

    # Отношения
    requirement: Mapped["Requirement"] = relationship(
        "Requirement", back_populates="test_results"
    )
    tester: Mapped[Optional["User"]] = relationship("User")
