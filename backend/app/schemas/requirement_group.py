"""
Схемы для модели RequirementGroup (группы требований).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
<<<<<<< HEAD
from typing import List, Optional

from pydantic import BaseModel, Field
=======
from typing import Optional, List
from sqlmodel import Field

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ProjectRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)
>>>>>>> dev-backend


class RequirementGroupBase(BaseSchema, ValidationMixin):
    """Базовая схема группы требований."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Название группы требований",
    )


class RequirementGroupCreate(CreateSchema, RequirementGroupBase, ProjectRelatedSchema):
    """Схема для создания группы требований."""

    pass


class RequirementGroupUpdate(UpdateSchema):
    """Схема для обновления группы требований."""

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Название группы требований",
    )


class RequirementGroup(ResponseSchema, RequirementGroupBase, ProjectRelatedSchema):
    """Схема группы требований для ответов API."""

    pass


class RequirementGroupWithVersions(RequirementGroup):
    """Схема группы требований с информацией о версиях."""

    versions_count: int = Field(0, ge=0, description="Количество версий")
    latest_version: Optional[int] = Field(None, ge=1, description="Последняя версия")
