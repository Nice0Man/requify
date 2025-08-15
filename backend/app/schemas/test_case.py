"""
Схемы для тестовых случаев и связанных сущностей.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

from .base import BaseSchema, ResponseSchema, CreateSchema, UpdateSchema, FieldLimits


# Enums для тестовых случаев
class TestCaseStatusEnum(str, Enum):
    """Статусы тестового случая."""
    DRAFT = "draft"
    READY = "ready"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class TestCasePriorityEnum(str, Enum):
    """Приоритеты тестового случая."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TestCaseTypeEnum(str, Enum):
    """Типы тестовых случаев."""
    FUNCTIONAL = "functional"
    INTEGRATION = "integration"
    UNIT = "unit"
    PERFORMANCE = "performance"
    SECURITY = "security"
    USABILITY = "usability"
    REGRESSION = "regression"
    SMOKE = "smoke"


class ExecutionStatusEnum(str, Enum):
    """Статусы выполнения тестового случая."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


# Base schemas
class TestCaseBase(BaseSchema):
    """Базовая схема тестового случая."""

    name: str = Field(
        ...,
        max_length=255,
        description="Название тестового случая",
    )
    description: Optional[str] = Field(
        None, description="Описание тестового случая"
    )
    type: TestCaseTypeEnum = Field(
        default=TestCaseTypeEnum.FUNCTIONAL,
        description="Тип тестового случая"
    )
    status: TestCaseStatusEnum = Field(
        default=TestCaseStatusEnum.DRAFT,
        description="Статус тестового случая"
    )
    priority: TestCasePriorityEnum = Field(
        default=TestCasePriorityEnum.MEDIUM,
        description="Приоритет тестового случая"
    )
    preconditions: Optional[str] = Field(
        None, description="Предварительные условия"
    )
    test_steps: Optional[str] = Field(
        None, description="Шаги выполнения теста"
    )
    expected_result: Optional[str] = Field(
        None, description="Ожидаемый результат"
    )
    test_data: Optional[Dict[str, Any]] = Field(
        None, description="Тестовые данные в формате JSON"
    )
    tags: Optional[List[str]] = Field(
        None, description="Теги для категоризации"
    )
    estimated_duration: Optional[int] = Field(
        None, ge=0, description="Ожидаемая длительность выполнения (минуты)"
    )
    is_active: bool = Field(
        default=True, description="Активный тестовый случай"
    )
    is_automated: bool = Field(
        default=False, description="Автоматизированный тест"
    )
    automation_script: Optional[str] = Field(
        None, description="Скрипт автоматизации"
    )
    version: str = Field(
        default="1.0.0", max_length=20, description="Версия тестового случая"
    )
    
    # Связи
    project_id: Optional[int] = Field(None, description="ID проекта")
    requirement_id: Optional[int] = Field(None, description="ID требования")
    test_plan_id: Optional[int] = Field(None, description="ID плана тестирования")
    parent_id: Optional[int] = Field(None, description="ID родительского тестового случая")


class TestCaseCreate(TestCaseBase):
    """Схема для создания тестового случая."""
    author_id: int = Field(..., description="ID автора")


class TestCaseUpdate(BaseSchema):
    """Схема для обновления тестового случая."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    type: Optional[TestCaseTypeEnum] = Field(None)
    status: Optional[TestCaseStatusEnum] = Field(None)
    priority: Optional[TestCasePriorityEnum] = Field(None)
    preconditions: Optional[str] = Field(None)
    test_steps: Optional[str] = Field(None)
    expected_result: Optional[str] = Field(None)
    test_data: Optional[Dict[str, Any]] = Field(None)
    tags: Optional[List[str]] = Field(None)
    estimated_duration: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = Field(None)
    is_automated: Optional[bool] = Field(None)
    automation_script: Optional[str] = Field(None)
    project_id: Optional[int] = Field(None)
    requirement_id: Optional[int] = Field(None)
    test_plan_id: Optional[int] = Field(None)


class TestCaseResponse(ResponseSchema, TestCaseBase):
    """Схема ответа для тестового случая."""
    author_id: int = Field(..., description="ID автора")
    executions_count: Optional[int] = Field(0, description="Количество выполнений")
    success_rate: Optional[float] = Field(0.0, description="Процент успешных выполнений")


# Test Plan schemas
class TestPlanBase(BaseSchema):
    """Базовая схема плана тестирования."""
    
    name: str = Field(..., max_length=255, description="Название плана тестирования")
    description: Optional[str] = Field(None, description="Описание плана тестирования")
    status: str = Field(default="draft", max_length=50, description="Статус плана")
    planned_start_date: Optional[datetime] = Field(None, description="Планируемая дата начала")
    planned_end_date: Optional[datetime] = Field(None, description="Планируемая дата окончания")
    actual_start_date: Optional[datetime] = Field(None, description="Фактическая дата начала")
    actual_end_date: Optional[datetime] = Field(None, description="Фактическая дата окончания")
    project_id: int = Field(..., description="ID проекта")


class TestPlanCreate(TestPlanBase):
    """Схема для создания плана тестирования."""
    author_id: int = Field(..., description="ID автора")


class TestPlanUpdate(BaseSchema):
    """Схема для обновления плана тестирования."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    status: Optional[str] = Field(None, max_length=50)
    planned_start_date: Optional[datetime] = Field(None)
    planned_end_date: Optional[datetime] = Field(None)
    actual_start_date: Optional[datetime] = Field(None)
    actual_end_date: Optional[datetime] = Field(None)


class TestPlanResponse(ResponseSchema, TestPlanBase):
    """Схема ответа для плана тестирования."""
    author_id: int = Field(..., description="ID автора")
    test_cases_count: Optional[int] = Field(0, description="Количество тестовых случаев")


# Test Execution schemas
class TestExecutionBase(BaseSchema):
    """Базовая схема выполнения тестового случая."""
    
    status: ExecutionStatusEnum = Field(
        default=ExecutionStatusEnum.NOT_STARTED,
        description="Статус выполнения"
    )
    started_at: Optional[datetime] = Field(None, description="Время начала выполнения")
    completed_at: Optional[datetime] = Field(None, description="Время завершения выполнения")
    actual_result: Optional[str] = Field(None, description="Фактический результат")
    notes: Optional[str] = Field(None, description="Заметки по выполнению")
    defects_found: Optional[List[str]] = Field(None, description="Найденные дефекты")
    duration_minutes: Optional[int] = Field(None, ge=0, description="Длительность выполнения в минутах")
    test_case_id: int = Field(..., description="ID тестового случая")


class TestExecutionCreate(TestExecutionBase):
    """Схема для создания выполнения тестового случая."""
    executor_id: int = Field(..., description="ID исполнителя")


class TestExecutionUpdate(BaseSchema):
    """Схема для обновления выполнения тестового случая."""
    status: Optional[ExecutionStatusEnum] = Field(None)
    started_at: Optional[datetime] = Field(None)
    completed_at: Optional[datetime] = Field(None)
    actual_result: Optional[str] = Field(None)
    notes: Optional[str] = Field(None)
    defects_found: Optional[List[str]] = Field(None)
    duration_minutes: Optional[int] = Field(None, ge=0)


class TestExecutionResponse(ResponseSchema, TestExecutionBase):
    """Схема ответа для выполнения тестового случая."""
    executor_id: int = Field(..., description="ID исполнителя")
    duration_formatted: Optional[str] = Field(None, description="Отформатированная длительность")


# Statistics schemas
class TestCaseStatistics(BaseSchema):
    """Статистика тестовых случаев."""
    
    total: int = Field(default=0, ge=0, description="Общее количество")
    by_status: Dict[str, int] = Field(default_factory=dict, description="По статусам")
    by_type: Dict[str, int] = Field(default_factory=dict, description="По типам")
    by_priority: Dict[str, int] = Field(default_factory=dict, description="По приоритетам")
    automated_count: int = Field(default=0, ge=0, description="Количество автоматизированных")
    automation_percentage: float = Field(default=0.0, ge=0, le=100, description="Процент автоматизации")


# List response schemas
class TestCaseListResponse(BaseSchema):
    """Схема списка тестовых случаев."""
    
    items: List[TestCaseResponse] = Field(default_factory=list)
    total: int = Field(default=0, ge=0)
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1)
    statistics: Optional[TestCaseStatistics] = Field(None)


class TestPlanListResponse(BaseSchema):
    """Схема списка планов тестирования."""
    
    items: List[TestPlanResponse] = Field(default_factory=list)
    total: int = Field(default=0, ge=0)
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1)


class TestExecutionListResponse(BaseSchema):
    """Схема списка выполнений тестовых случаев."""
    
    items: List[TestExecutionResponse] = Field(default_factory=list)
    total: int = Field(default=0, ge=0)
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1)
