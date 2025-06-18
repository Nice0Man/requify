"""
Схемы для модели Relationship (связи между требованиями).
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RelationshipBase(BaseModel):
    """Базовая схема связи между требованиями."""

    source_id: int = Field(..., gt=0, description="ID исходного требования")
    target_id: int = Field(..., gt=0, description="ID целевого требования")
    type_id: int = Field(..., gt=0, description="ID типа связи")


class RelationshipCreate(RelationshipBase):
    """Схема для создания связи между требованиями."""

    pass


class RelationshipUpdate(BaseModel):
    """Схема для обновления связи между требованиями."""

    type_id: Optional[int] = Field(None, gt=0, description="ID типа связи")


class RelationshipInDBBase(RelationshipBase):
    """Базовая схема связи с данными из БД."""

    created_at: datetime

    class Config:
        from_attributes = True


class Relationship(RelationshipInDBBase):
    """Схема связи для ответов API."""

    pass


class RelationshipWithDetails(Relationship):
    """Схема связи с подробной информацией."""

    source_title: Optional[str] = None
    target_title: Optional[str] = None
    type_name: Optional[str] = None


class RelationshipInDB(RelationshipInDBBase):
    """Схема связи в БД."""

    pass
