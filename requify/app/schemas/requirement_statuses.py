"""
Схемы для модели RequirementStatus (статусы требований).
"""

from typing import Optional
from pydantic import BaseModel, Field


class RequirementStatusBase(BaseModel):
    """Базовая схема статуса требования."""

    name: str = Field(..., min_length=1, max_length=50, description="Название статуса")


class RequirementStatusCreate(RequirementStatusBase):
    """Схема для создания статуса требования."""

    pass


class RequirementStatusUpdate(BaseModel):
    """Схема для обновления статуса требования."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Название статуса"
    )


class RequirementStatusInDBBase(RequirementStatusBase):
    """Базовая схема статуса требования с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RequirementStatus(RequirementStatusInDBBase):
    """Схема статуса требования для ответов API."""

    pass


class RequirementStatusInDB(RequirementStatusInDBBase):
    """Схема статуса требования в БД."""

    pass
