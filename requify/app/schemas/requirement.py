"""
Схемы для модели Requirement.
"""

from datetime import datetime, UTC
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

# Удаляем импорт enum'ов, так как теперь используем ID


class RequirementBase(BaseModel):
    """Базовая схема требования."""

    title: str = Field(
        ..., min_length=3, max_length=200, description="Заголовок требования"
    )
    description: Optional[str] = Field(None, description="Описание требования")
    deadline: Optional[datetime] = None


class RequirementCreate(RequirementBase):
    """Схема для создания требования."""

    type_id: int = Field(..., gt=0, description="ID типа требования")
    priority_id: int = Field(..., gt=0, description="ID приоритета требования")
    status_id: int = Field(..., gt=0, description="ID статуса требования")
    project_id: int = Field(..., gt=0, description="ID проекта")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
    spec_id: Optional[int] = Field(None, gt=0, description="ID спецификации")


class RequirementUpdate(BaseModel):
    """Схема для обновления требования."""

    title: Optional[str] = Field(
        None, min_length=3, max_length=200, description="Заголовок требования"
    )
    description: Optional[str] = Field(None, description="Описание требования")
    type_id: Optional[int] = Field(None, gt=0, description="ID типа требования")
    priority_id: Optional[int] = Field(
        None, gt=0, description="ID приоритета требования"
    )
    status_id: Optional[int] = Field(None, gt=0, description="ID статуса требования")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
    spec_id: Optional[int] = Field(None, gt=0, description="ID спецификации")


class RequirementInDBBase(RequirementBase):
    """Базовая схема требования с данными из БД."""

    id: int
    type_id: int
    priority_id: int
    status_id: int
    project_id: int
    author_id: int
    last_modified_by: int
    release_id: Optional[int] = None
    spec_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Requirement(RequirementInDBBase):
    """Схема требования для ответов API."""

    pass


class RequirementWithDetails(Requirement):
    """Схема требования с подробной информацией."""

    type_name: Optional[str] = None
    priority_name: Optional[str] = None
    status_name: Optional[str] = None
    project_name: Optional[str] = None
    author_name: Optional[str] = None
    last_modifier_name: Optional[str] = None
    release_version: Optional[str] = None
    spec_name: Optional[str] = None


class RequirementWithTestResults(Requirement):
    """Схема требования с результатами тестирования."""

    latest_test_status: Optional[str] = None
    test_count: int = 0
    tests_passed: int = 0


class RequirementInDB(RequirementInDBBase):
    """Схема требования в БД."""

    pass
