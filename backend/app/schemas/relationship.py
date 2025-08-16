"""
Схемы для модели Relationship (связи между требованиями).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class RelationshipBase(BaseSchema):
    """Базовая схема связи между требованиями."""

    source_id: int = Field(..., gt=0, description="ID исходного требования")
    target_id: int = Field(..., gt=0, description="ID целевого требования")
    type_id: int = Field(..., gt=0, description="ID типа связи")
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание связи"
    )


class RelationshipCreate(CreateSchema, RelationshipBase):
    """Схема для создания связи между требованиями."""

    pass


class RelationshipCreateForRequirement(CreateSchema):
    """Схема для создания связи для конкретного требования (без source_id)."""

    target_id: int = Field(..., gt=0, description="ID целевого требования")
    type_id: int = Field(..., gt=0, description="ID типа связи")
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание связи"
    )


class RelationshipUpdate(UpdateSchema):
    """Схема для обновления связи между требованиями."""

    type_id: Optional[int] = Field(None, gt=0, description="ID типа связи")
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание связи"
    )


class Relationship(ResponseSchema, RelationshipBase):
    """Схема связи для ответов API."""

    pass


class RelationshipWithDetails(Relationship):
    """Схема связи с подробной информацией."""

    source_title: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Заголовок исходного требования",
    )
    target_title: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Заголовок целевого требования",
    )
    type_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Название типа связи"
    )
