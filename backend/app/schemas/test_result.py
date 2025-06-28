"""
Схемы для модели TestResult.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class TestStatus(str, Enum):
    """Статусы тестирования."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TestResultBase(BaseModel):
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


class TestResultCreate(TestResultBase):
    """Схема для создания результата тестирования."""

    requirement_id: int = Field(..., gt=0, description="ID требования")
    tester_id: Optional[int] = Field(None, gt=0, description="ID тестировщика")


class TestResultUpdate(BaseModel):
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


class TestResultInDBBase(TestResultBase):
    """Базовая схема результата тестирования с данными из БД."""

    id: int
    requirement_id: int
    tester_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestResult(TestResultInDBBase):
    """Схема результата тестирования для ответов API."""

    pass


class TestResultWithDetails(TestResult):
    """Схема результата тестирования с подробной информацией."""

    requirement_title: Optional[str] = None
    tester_name: Optional[str] = None


class TestResultInDB(TestResultInDBBase):
    """Схема результата тестирования в БД."""

    pass
