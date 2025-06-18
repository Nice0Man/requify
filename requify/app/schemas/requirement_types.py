"""
Схемы для модели RequirementType (типы требований).
"""

from typing import Optional
from pydantic import BaseModel, Field


class RequirementTypeBase(BaseModel):
    """Базовая схема типа требования."""

    name: str = Field(
        ..., min_length=1, max_length=50, description="Название типа требования"
    )


class RequirementTypeCreate(RequirementTypeBase):
    """Схема для создания типа требования."""

    pass


class RequirementTypeUpdate(BaseModel):
    """Схема для обновления типа требования."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Название типа требования"
    )


class RequirementTypeInDBBase(RequirementTypeBase):
    """Базовая схема типа требования с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RequirementType(RequirementTypeInDBBase):
    """Схема типа требования для ответов API."""

    pass


class RequirementTypeInDB(RequirementTypeInDBBase):
    """Схема типа требования в БД."""

    pass
