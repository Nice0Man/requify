from datetime import datetime, UTC
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from requify.app.models.requirement import RequirementPriority, RequirementStatus


class RequirementBase(BaseModel):
    """
    Базовая схема требования.
    """

    title: str = Field(..., min_length=3, max_length=200)
    description: str
    priority: RequirementPriority = RequirementPriority.MEDIUM
    status: RequirementStatus = RequirementStatus.DRAFT
    deadline: Optional[datetime] = None


class RequirementCreate(RequirementBase):
    """
    Схема для создания требования.
    """

    project_id: UUID
    release_id: Optional[UUID] = None


class RequirementUpdate(BaseModel):
    """
    Схема для обновления требования.
    """

    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    priority: Optional[RequirementPriority] = None
    status: Optional[RequirementStatus] = None
    deadline: Optional[datetime] = None
    release_id: Optional[UUID] = None


class RequirementInDBBase(RequirementBase):
    """
    Базовая схема требования с данными из БД.
    """

    id: UUID
    project_id: UUID
    creator_id: UUID
    release_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Requirement(RequirementInDBBase):
    """
    Схема требования для API.
    """

    pass


class RequirementWithTestResults(Requirement):
    """
    Схема требования с результатами тестирования.
    """

    latest_test_status: Optional[str] = None
    test_count: int = 0
    tests_passed: int = 0
