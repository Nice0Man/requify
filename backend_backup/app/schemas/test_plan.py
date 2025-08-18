from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TestPlanBase(BaseSchema):
    """Базовая схема тестового плана."""

    name: str = Field(
        ...,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Название тестового плана",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание тестового плана"
    )
    status: str = Field(
        default="active",
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Статус тестового плана",
    )


class TestPlanCreate(CreateSchema, TestPlanBase, ProjectRelatedSchema):
    """Схема для создания тестового плана."""

    pass


class TestPlanUpdate(UpdateSchema):
    """Схема для обновления тестового плана."""

    name: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Название тестового плана",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание тестового плана"
    )
    status: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Статус тестового плана",
    )


class TestPlan(ResponseSchema, TestPlanBase, ProjectRelatedSchema):
    """Схема тестового плана для ответов API."""

    pass
