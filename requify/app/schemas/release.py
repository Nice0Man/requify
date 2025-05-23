from datetime import datetime, UTC
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from requify.app.models.release import ReleaseStatus


class ReleaseBase(BaseModel):
    """
    Базовая схема релиза.
    """

    name: str = Field(..., min_length=2, max_length=100)
    version: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    status: ReleaseStatus = ReleaseStatus.PLANNED
    planned_date: Optional[datetime] = None
    release_date: Optional[datetime] = None


class ReleaseCreate(ReleaseBase):
    """
    Схема для создания релиза.
    """

    project_id: UUID


class ReleaseUpdate(BaseModel):
    """
    Схема для обновления релиза.
    """

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    version: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    status: Optional[ReleaseStatus] = None
    planned_date: Optional[datetime] = None
    release_date: Optional[datetime] = None


class ReleaseInDBBase(ReleaseBase):
    """
    Базовая схема релиза с данными из БД.
    """

    id: UUID
    project_id: UUID
    creator_id: UUID
    created_at: datetime
    updated_at: datetime

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
