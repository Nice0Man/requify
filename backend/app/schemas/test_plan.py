from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TestPlanBase(BaseModel):
    """Базовая схема тестового плана."""

    name: str = Field(..., description="Название тестового плана")
    description: Optional[str] = Field(None, description="Описание тестового плана")
    project_id: int = Field(..., gt=0, description="ID проекта")
    status: str = Field(default="active", description="Статус тестового плана")


class TestPlanCreate(TestPlanBase):
    """Схема для создания тестового плана."""

    pass


class TestPlanUpdate(BaseModel):
    """Схема для обновления тестового плана."""

    name: Optional[str] = Field(None, description="Название тестового плана")
    description: Optional[str] = Field(None, description="Описание тестового плана")
    status: Optional[str] = Field(None, description="Статус тестового плана")


class TestPlanInDBBase(TestPlanBase):
    """Базовая схема тестового плана с данными из БД."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestPlan(TestPlanInDBBase):
    """Схема тестового плана для ответов API."""

    pass


class TestPlanInDB(TestPlanInDBBase):
    """Схема тестового плана в БД."""

    pass
