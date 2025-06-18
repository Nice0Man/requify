"""
Схемы для модели RequirementPriority (приоритеты требований).
"""

from typing import Optional
from pydantic import BaseModel, Field


class RequirementPriorityBase(BaseModel):
    """Базовая схема приоритета требования."""

    name: str = Field(
        ..., min_length=1, max_length=50, description="Название приоритета"
    )


class RequirementPriorityCreate(RequirementPriorityBase):
    """Схема для создания приоритета требования."""

    pass


class RequirementPriorityUpdate(BaseModel):
    """Схема для обновления приоритета требования."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Название приоритета"
    )


class RequirementPriorityInDBBase(RequirementPriorityBase):
    """Базовая схема приоритета требования с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RequirementPriority(RequirementPriorityInDBBase):
    """Схема приоритета требования для ответов API."""

    pass


class RequirementPriorityInDB(RequirementPriorityInDBBase):
    """Схема приоритета требования в БД."""

    pass
