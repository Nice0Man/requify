"""
Схемы для модели Spec (спецификации).
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SpecBase(BaseModel):
    """Базовая схема спецификации."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Название спецификации"
    )


class SpecCreate(SpecBase):
    """Схема для создания спецификации."""

    project_id: int = Field(..., gt=0, description="ID проекта")
    template_id: Optional[int] = Field(
        None, gt=0, description="ID шаблона спецификации"
    )


class SpecUpdate(BaseModel):
    """Схема для обновления спецификации."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Название спецификации"
    )
    template_id: Optional[int] = Field(
        None, gt=0, description="ID шаблона спецификации"
    )


class SpecInDBBase(SpecBase):
    """Базовая схема спецификации с данными из БД."""

    id: int
    project_id: int
    template_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Spec(SpecInDBBase):
    """Схема спецификации для ответов API."""

    pass


class SpecWithRequirements(Spec):
    """Схема спецификации с информацией о требованиях."""

    requirements_count: int = 0


class SpecInDB(SpecInDBBase):
    """Схема спецификации в БД."""

    pass
