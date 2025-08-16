"""
Схемы для модели RelationshipType (типы связей между требованиями).
"""

from typing import Optional

from pydantic import BaseModel, Field


class RelationshipTypeBase(BaseModel):
    """Базовая схема типа связи."""

    name: str = Field(
        ..., min_length=1, max_length=50, description="Название типа связи"
    )


class RelationshipTypeCreate(RelationshipTypeBase):
    """Схема для создания типа связи."""

    pass


class RelationshipTypeUpdate(BaseModel):
    """Схема для обновления типа связи."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Название типа связи"
    )


class RelationshipTypeInDBBase(RelationshipTypeBase):
    """Базовая схема типа связи с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RelationshipType(RelationshipTypeInDBBase):
    """Схема типа связи для ответов API."""

    pass


class RelationshipTypeInDB(RelationshipTypeInDBBase):
    """Схема типа связи в БД."""

    pass
