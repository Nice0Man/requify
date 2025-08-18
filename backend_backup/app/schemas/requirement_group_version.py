"""
Схемы для модели RequirementGroupVersion (версии групп требований).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class RequirementGroupVersionBase(BaseSchema):
    """Базовая схема версии группы требований."""

    version: int = Field(..., ge=1, description="Номер версии")
    snapshot_data: Dict[str, Any] = Field(
        ..., description="Снимок группы требований и связей"
    )


class RequirementGroupVersionCreate(CreateSchema, RequirementGroupVersionBase):
    """Схема для создания версии группы требований."""

    group_id: int = Field(..., gt=0, description="ID группы требований")


class RequirementGroupVersionUpdate(UpdateSchema):
    """Схема для обновления версии группы требований."""

    snapshot_data: Optional[Dict[str, Any]] = Field(
        None, description="Снимок группы требований и связей"
    )


class RequirementGroupVersion(ResponseSchema, RequirementGroupVersionBase):
    """Схема версии группы требований для ответов API."""

    group_id: int = Field(..., description="ID группы требований")
    created_by: int = Field(..., description=StandardDescriptions.CREATED_BY)


class RequirementGroupVersionWithDetails(RequirementGroupVersion):
    """Схема версии группы требований с подробной информацией."""

    group_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Название группы"
    )
    created_by_name: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Имя создателя"
    )
