from datetime import datetime, UTC
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ReleaseBase(BaseModel):
    """
    Базовая схема релиза.
    """

    name: str = Field(..., min_length=2, max_length=100)
    version: str = Field(
        ..., min_length=1, max_length=50, description="Версия релиза в формате SemVer"
    )
    description: Optional[str] = None
    planned_date: Optional[datetime] = None
    release_date: Optional[datetime] = None


class ReleaseCreate(ReleaseBase):
    """
    Схема для создания релиза.
    """

    project_id: int = Field(..., gt=0, description="ID проекта")
    status: str = Field("planned", description="Статус релиза")
    release_date: Optional[datetime] = Field(None, description="Дата релиза")


class ReleaseUpdate(BaseModel):
    """
    Схема для обновления релиза.
    """

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    version: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Версия релиза в формате SemVer"
    )
    description: Optional[str] = None
    status: Optional[str] = Field(None, description="Статус релиза")
    planned_date: Optional[datetime] = None
    release_date: Optional[datetime] = Field(None, description="Дата релиза")


class ReleaseInDBBase(ReleaseBase):
    """
    Базовая схема релиза с данными из БД.
    """

    id: int
    project_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    release_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class Release(ReleaseInDBBase):
    """
    Схема релиза для API.
    """

    pass


class ReleaseWithRequirements(Release):
    """
    Схема релиза с требованиями.
    """

    total_requirements: int = 0
    completed_requirements: int = 0
    requirements_in_testing: int = 0


class ReleaseWithDetails(Release):
    """
    Схема релиза с подробной информацией.
    """

    project_name: Optional[str] = None


class ReleaseInDB(ReleaseInDBBase):
    """
    Схема релиза в БД.
    """

    pass
