"""
Схемы для модели RequirementGroupVersion (версии групп требований).
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class RequirementGroupVersionBase(BaseModel):
    """Базовая схема версии группы требований."""

    version: int = Field(..., ge=1, description="Номер версии")
    snapshot_data: Dict[str, Any] = Field(
        ..., description="Снимок группы требований и связей"
    )


class RequirementGroupVersionCreate(RequirementGroupVersionBase):
    """Схема для создания версии группы требований."""

    group_id: int = Field(..., gt=0, description="ID группы требований")


class RequirementGroupVersionUpdate(BaseModel):
    """Схема для обновления версии группы требований."""

    snapshot_data: Optional[Dict[str, Any]] = Field(
        None, description="Снимок группы требований и связей"
    )


class RequirementGroupVersionInDBBase(RequirementGroupVersionBase):
    """Базовая схема версии группы требований с данными из БД."""

    id: int
    group_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class RequirementGroupVersion(RequirementGroupVersionInDBBase):
    """Схема версии группы требований для ответов API."""

    pass


class RequirementGroupVersionWithDetails(RequirementGroupVersion):
    """Схема версии группы требований с подробной информацией."""

    group_name: Optional[str] = None
    created_by_name: Optional[str] = None


class RequirementGroupVersionInDB(RequirementGroupVersionInDBBase):
    """Схема версии группы требований в БД."""

    pass
