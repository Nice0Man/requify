"""
Схемы для модели TestResult.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class TestStatus(str, Enum):
    """Статусы тестирования."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TestResultBase(BaseSchema):
    """Базовая схема результата тестирования."""

    status: TestStatus = Field(
        default=TestStatus.NOT_STARTED, description="Статус тестирования"
    )
    notes: Optional[str] = Field(None, description="Заметки по тестированию")
    started_at: Optional[datetime] = Field(
        None, description="Время начала тестирования"
    )
    completed_at: Optional[datetime] = Field(
        None, description="Время завершения тестирования"
    )
    external_id: Optional[str] = Field(
        None, max_length=50, description="Внешний ID тестирования"
    )


class TestResultCreate(CreateSchema, TestResultBase):
    """Схема для создания результата тестирования."""

    requirement_id: int = Field(..., gt=0, description="ID требования")
    tester_id: Optional[int] = Field(None, gt=0, description="ID тестировщика")


class TestResultUpdate(UpdateSchema):
    """Схема для обновления результата тестирования."""

    status: Optional[TestStatus] = Field(None, description="Статус тестирования")
    notes: Optional[str] = Field(None, description="Заметки по тестированию")
    started_at: Optional[datetime] = Field(
        None, description="Время начала тестирования"
    )
    completed_at: Optional[datetime] = Field(
        None, description="Время завершения тестирования"
    )
    external_id: Optional[str] = Field(
        None, max_length=50, description="Внешний ID тестирования"
    )
    tester_id: Optional[int] = Field(None, gt=0, description="ID тестировщика")


class TestResult(ResponseSchema, TestResultBase):
    """Схема результата тестирования для ответов API."""

    requirement_id: int = Field(..., description="ID требования")
    tester_id: Optional[int] = Field(None, description="ID тестировщика")


class TestResultWithDetails(TestResult):
    """Схема результата тестирования с подробной информацией."""

    requirement_title: Optional[str] = Field(None, description="Заголовок требования")
    tester_name: Optional[str] = Field(None, description="Имя тестировщика")
