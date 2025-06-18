from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class TestCaseBase(BaseModel):
    """Базовая схема тестового случая."""

    name: str = Field(..., description="Название тестового случая")
    description: Optional[str] = Field(None, description="Описание тестового случая")
    test_plan_id: int = Field(..., gt=0, description="ID тестового плана")
    status: str = Field(default="active", description="Статус тестового случая")


class TestCaseCreate(TestCaseBase):
    """Схема для создания тестового случая."""

    pass


class TestCaseUpdate(BaseModel):
    """Схема для обновления тестового случая."""

    name: Optional[str] = Field(None, description="Название тестового случая")
    description: Optional[str] = Field(None, description="Описание тестового случая")
    status: Optional[str] = Field(None, description="Статус тестового случая")


class TestCaseInDBBase(TestCaseBase):
    """Базовая схема тестового случая с данными из БД."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestCase(TestCaseInDBBase):
    """Схема тестового случая для ответов API."""

    pass


class TestCaseInDB(TestCaseInDBBase):
    """Схема тестового случая в БД."""

    pass


class TestExecution(BaseModel):
    """Схема выполнения тестового случая."""

    id: int
    test_case_id: int
    status: str
    started_at: datetime
    completed_at: datetime
    duration: Optional[int] = None
    logs: Optional[str] = None


class TestingSummary(BaseModel):
    """Схема сводных данных по тестированию."""

    total_tests: int
    passed_tests: int
    failed_tests: int
    errors: Optional[List[str]] = None
