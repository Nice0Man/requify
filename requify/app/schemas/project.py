from datetime import datetime, UTC
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """
    Базовая схема проекта.
    """

    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    is_active: bool = True
    external_id: Optional[str] = Field(None, max_length=50)


class ProjectCreate(ProjectBase):
    """
    Схема для создания проекта.
    """

    pass


class ProjectUpdate(ProjectBase):
    """
    Схема для обновления проекта.
    """

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    is_active: Optional[bool] = None


class ProjectInDBBase(ProjectBase):
    """
    Базовая схема проекта с данными из БД.
    """

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDBBase):
    """
    Схема проекта для API.
    """

    pass


class ProjectWithStats(Project):
    """
    Схема проекта с дополнительной статистикой.
    """

    total_requirements: int
    requirements_completed: int
    active_releases: int
