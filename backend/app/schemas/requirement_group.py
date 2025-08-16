"""
Схемы для модели RequirementGroup (группы требований).
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RequirementGroupBase(BaseModel):
    """Базовая схема группы требований."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Название группы требований"
    )


class RequirementGroupCreate(RequirementGroupBase):
    """Схема для создания группы требований."""

    project_id: int = Field(..., gt=0, description="ID проекта")


class RequirementGroupUpdate(BaseModel):
    """Схема для обновления группы требований."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Название группы требований"
    )


class RequirementGroupInDBBase(RequirementGroupBase):
    """Базовая схема группы требований с данными из БД."""

    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RequirementGroup(RequirementGroupInDBBase):
    """Схема группы требований для ответов API."""

    pass


class RequirementGroupWithVersions(RequirementGroup):
    """Схема группы требований с информацией о версиях."""

    versions_count: int = 0
    latest_version: Optional[int] = None


class RequirementGroupInDB(RequirementGroupInDBBase):
    """Схема группы требований в БД."""

    pass
