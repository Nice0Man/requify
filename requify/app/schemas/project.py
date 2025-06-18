"""
Схемы для модели Project.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Базовая схема проекта."""

    code: str = Field(..., min_length=1, max_length=50, description="Кодировка проекта")
    name: str = Field(..., min_length=2, max_length=100, description="Название проекта")
    description: Optional[str] = Field(None, description="Описание проекта")
    status: str = Field(..., min_length=1, max_length=50, description="Статус проекта")


class ProjectCreate(ProjectBase):
    """Схема для создания проекта."""

    pass


class ProjectUpdate(BaseModel):
    """Схема для обновления проекта."""

    code: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Кодировка проекта"
    )
    name: Optional[str] = Field(
        None, min_length=2, max_length=100, description="Название проекта"
    )
    description: Optional[str] = Field(None, description="Описание проекта")
    status: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Статус проекта"
    )


class ProjectInDBBase(ProjectBase):
    """Базовая схема проекта с данными из БД."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDBBase):
    """Схема проекта для ответов API."""

    pass


class ProjectWithStats(Project):
    """Схема проекта с дополнительной статистикой."""

    total_requirements: int = 0
    requirements_completed: int = 0
    active_releases: int = 0
    specs_count: int = 0
    requirement_groups_count: int = 0


class ProjectInDB(ProjectInDBBase):
    """Схема проекта в БД."""

    pass
