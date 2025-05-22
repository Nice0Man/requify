from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.test_result import TestStatus


class TestResultBase(BaseModel):
    """
    Базовая схема результата тестирования.
    """

    status: TestStatus = TestStatus.NOT_STARTED
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    external_id: Optional[str] = Field(None, max_length=50)


class TestResultCreate(TestResultBase):
    """
    Схема для создания результата тестирования.
    """

    requirement_id: UUID
    tester_id: Optional[UUID] = None


class TestResultUpdate(BaseModel):
    """
    Схема для обновления результата тестирования.
    """

    status: Optional[TestStatus] = None
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    external_id: Optional[str] = Field(None, max_length=50)
    tester_id: Optional[UUID] = None


class TestResultInDBBase(TestResultBase):
    """
    Базовая схема результата тестирования с данными из БД.
    """

    id: UUID
    requirement_id: UUID
    tester_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestResult(TestResultInDBBase):
    """
    Схема результата тестирования для API.
    """

    pass
