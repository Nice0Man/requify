"""
Test Case model for testing management system.

Модель тестового случая для управления тестированием.
"""

from datetime import UTC, datetime
from typing import List, Optional, TYPE_CHECKING
from enum import Enum

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
    Enum as SQLEnum,
    Boolean,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .project import Project
    from .requirement import Requirement
    from .user import User
    from .test_plan import TestPlan
    from .test_execution import TestExecution


class TestCaseStatus(str, Enum):
    """Статусы тестового случая."""

    DRAFT = "draft"  # Черновик
    READY = "ready"  # Готов к выполнению
    ACTIVE = "active"  # Активный
    DEPRECATED = "deprecated"  # Устарел
    ARCHIVED = "archived"  # Архивирован


class TestCasePriority(str, Enum):
    """Приоритеты тестового случая."""

    LOW = "low"  # Низкий
    MEDIUM = "medium"  # Средний
    HIGH = "high"  # Высокий
    CRITICAL = "critical"  # Критический


class TestCaseType(str, Enum):
    """Типы тестовых случаев."""

    FUNCTIONAL = "functional"  # Функциональное тестирование
    INTEGRATION = "integration"  # Интеграционное тестирование
    UNIT = "unit"  # Модульное тестирование
    PERFORMANCE = "performance"  # Тестирование производительности
    SECURITY = "security"  # Тестирование безопасности
    USABILITY = "usability"  # Тестирование удобства использования
    REGRESSION = "regression"  # Регрессионное тестирование
    SMOKE = "smoke"  # Дымовое тестирование


class TestCase(Base, TimestampedMixin):
    """
    Модель тестового случая.

    Представляет отдельный тестовый сценарий с детальным описанием
    шагов выполнения и ожидаемых результатов.
    """

    __tablename__ = "test_cases"
    __table_args__ = (
        Index("ix_test_cases_project_id", "project_id"),
        Index("ix_test_cases_requirement_id", "requirement_id"),
        Index("ix_test_cases_test_plan_id", "test_plan_id"),
        Index("ix_test_cases_author_id", "author_id"),
        Index("ix_test_cases_status", "status"),
        Index("ix_test_cases_priority", "priority"),
        Index("ix_test_cases_type", "type"),
        Index("ix_test_cases_is_active", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Название тестового случая"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание тестового случая"
    )

    # Метаданные теста
    type: Mapped[TestCaseType] = mapped_column(
        SQLEnum(TestCaseType),
        nullable=False,
        default=TestCaseType.FUNCTIONAL,
        comment="Тип тестового случая",
    )
    status: Mapped[TestCaseStatus] = mapped_column(
        SQLEnum(TestCaseStatus),
        nullable=False,
        default=TestCaseStatus.DRAFT,
        comment="Статус тестового случая",
    )
    priority: Mapped[TestCasePriority] = mapped_column(
        SQLEnum(TestCasePriority),
        nullable=False,
        default=TestCasePriority.MEDIUM,
        comment="Приоритет тестового случая",
    )

    # Детали тестирования
    preconditions: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Предварительные условия"
    )
    test_steps: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Шаги выполнения теста"
    )
    expected_result: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Ожидаемый результат"
    )
    test_data: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Тестовые данные в формате JSON"
    )

    # Дополнительные поля
    tags: Mapped[Optional[List[str]]] = mapped_column(
        JSON, nullable=True, comment="Теги для категоризации"
    )
    external_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Внешний ID (из другой системы)"
    )

    # Временные ограничения и метрики
    estimated_duration: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Ожидаемая длительность выполнения (минуты)"
    )

    # Флаги
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="Активный тестовый случай"
    )
    is_automated: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, comment="Автоматизированный тест"
    )
    automation_script: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Скрипт автоматизации"
    )

    # Связи
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID проекта",
    )
    requirement_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("requirements.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID связанного требования",
    )
    test_plan_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("test_plans.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID тестового плана",
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Автор тестового случая",
    )

    # Поля для версионирования
    version: Mapped[str] = mapped_column(
        String(20), nullable=False, default="1.0.0", comment="Версия тестового случая"
    )
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("test_cases.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID родительского тестового случая (для версионирования)",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="test_cases", lazy="select"
    )

    requirement: Mapped[Optional["Requirement"]] = relationship(
        "Requirement", back_populates="test_cases", lazy="select"
    )

    test_plan: Mapped[Optional["TestPlan"]] = relationship(
        "TestPlan", back_populates="test_cases", lazy="select"
    )

    author: Mapped["User"] = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="authored_test_cases",
        lazy="select",
    )

    # Самосвязь для версионирования
    parent: Mapped[Optional["TestCase"]] = relationship(
        "TestCase", remote_side=[id], backref="children", lazy="select"
    )

    # Выполнения тестового случая
    executions: Mapped[List["TestExecution"]] = relationship(
        "TestExecution",
        back_populates="test_case",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # =============================================================================
    # Методы
    # =============================================================================

    def __repr__(self) -> str:
        return f"<TestCase(id={self.id}, name='{self.name}', type={self.type}, status={self.status})>"

    @property
    def is_ready_for_execution(self) -> bool:
        """Проверка готовности тестового случая к выполнению."""
        return (
            self.status in [TestCaseStatus.READY, TestCaseStatus.ACTIVE]
            and self.is_active
            and bool(self.test_steps)
            and bool(self.expected_result)
        )

    @property
    def is_automated_test(self) -> bool:
        """Проверка, является ли тест автоматизированным."""
        return self.is_automated and bool(self.automation_script)

    @property
    def executions_count(self) -> int:
        """Количество выполнений тестового случая."""
        return len(self.executions) if self.executions else 0

    def can_be_executed(self) -> bool:
        """Проверка возможности выполнения тестового случая."""
        return self.is_ready_for_execution and self.project_id is not None

    def get_latest_execution(self) -> Optional["TestExecution"]:
        """Получить последнее выполнение тестового случая."""
        if not self.executions:
            return None
        return max(self.executions, key=lambda x: x.created_at)

    def get_success_rate(self) -> float:
        """Получить процент успешных выполнений."""
        if not self.executions:
            return 0.0

        from .test_result import TestStatus

        successful = sum(
            1 for execution in self.executions if execution.status == TestStatus.PASSED
        )
        return (successful / len(self.executions)) * 100.0


# =============================================================================
# Модель для планов тестирования (если еще не существует)
# =============================================================================


class TestPlan(Base, TimestampedMixin):
    """
    Модель плана тестирования.

    Группирует тестовые случаи в логические наборы для выполнения.
    """

    __tablename__ = "test_plans"
    __table_args__ = (
        Index("ix_test_plans_project_id", "project_id"),
        Index("ix_test_plans_author_id", "author_id"),
        Index("ix_test_plans_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Название плана тестирования"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание плана тестирования"
    )

    # Статус и метаданные
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="draft", comment="Статус плана"
    )

    # Временные рамки
    planned_start_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Планируемая дата начала"
    )
    planned_end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Планируемая дата окончания"
    )
    actual_start_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Фактическая дата начала"
    )
    actual_end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Фактическая дата окончания"
    )

    # Связи
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID проекта",
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Автор плана тестирования",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    project: Mapped["Project"] = relationship(
        "Project", back_populates="test_plans", lazy="select"
    )

    author: Mapped["User"] = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="authored_test_plans",
        lazy="select",
    )

    test_cases: Mapped[List["TestCase"]] = relationship(
        "TestCase",
        back_populates="test_plan",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<TestPlan(id={self.id}, name='{self.name}', status={self.status})>"


# =============================================================================
# Модель для выполнения тестов
# =============================================================================


class ExecutionStatus(str, Enum):
    """Статусы выполнения тестового случая."""

    NOT_STARTED = "not_started"  # Не начато
    IN_PROGRESS = "in_progress"  # В процессе
    PASSED = "passed"  # Успешно
    FAILED = "failed"  # Провалено
    BLOCKED = "blocked"  # Заблокировано
    SKIPPED = "skipped"  # Пропущено


class TestExecution(Base, TimestampedMixin):
    """
    Модель выполнения тестового случая.

    Представляет конкретный запуск тестового случая с результатами.
    """

    __tablename__ = "test_executions"
    __table_args__ = (
        Index("ix_test_executions_test_case_id", "test_case_id"),
        Index("ix_test_executions_executor_id", "executor_id"),
        Index("ix_test_executions_status", "status"),
        Index("ix_test_executions_started_at", "started_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Статус и результат
    status: Mapped[ExecutionStatus] = mapped_column(
        SQLEnum(ExecutionStatus),
        nullable=False,
        default=ExecutionStatus.NOT_STARTED,
        comment="Статус выполнения",
    )

    # Временные метки
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Время начала выполнения"
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Время завершения выполнения"
    )

    # Результаты
    actual_result: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Фактический результат"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Заметки по выполнению"
    )

    # Дефекты и проблемы
    defects_found: Mapped[Optional[List[str]]] = mapped_column(
        JSON, nullable=True, comment="Найденные дефекты"
    )

    # Метрики
    duration_minutes: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Длительность выполнения в минутах"
    )

    # Связи
    test_case_id: Mapped[int] = mapped_column(
        ForeignKey("test_cases.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID тестового случая",
    )
    executor_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="ID исполнителя теста",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    test_case: Mapped["TestCase"] = relationship(
        "TestCase", back_populates="executions", lazy="select"
    )

    executor: Mapped["User"] = relationship(
        "User",
        foreign_keys=[executor_id],
        back_populates="executed_tests",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<TestExecution(id={self.id}, test_case_id={self.test_case_id}, status={self.status})>"

    @property
    def is_completed(self) -> bool:
        """Проверка завершенности выполнения."""
        return self.status in [
            ExecutionStatus.PASSED,
            ExecutionStatus.FAILED,
            ExecutionStatus.BLOCKED,
            ExecutionStatus.SKIPPED,
        ]

    @property
    def duration_formatted(self) -> str:
        """Отформатированная длительность выполнения."""
        if not self.duration_minutes:
            return "Не указано"

        hours = self.duration_minutes // 60
        minutes = self.duration_minutes % 60

        if hours > 0:
            return f"{hours}ч {minutes}м"
        return f"{minutes}м"
