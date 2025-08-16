"""
Activity Schemas.

Схемы для работы с активностью пользователей в collaboration домене.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class ActivityTypeEnum(str, Enum):
    """Типы активности."""

    COMMENT_CREATED = "comment_created"
    COMMENT_UPDATED = "comment_updated"
    COMMENT_DELETED = "comment_deleted"
    RELATIONSHIP_CREATED = "relationship_created"
    RELATIONSHIP_DELETED = "relationship_deleted"
    REQUIREMENT_CREATED = "requirement_created"
    REQUIREMENT_UPDATED = "requirement_updated"
    REQUIREMENT_STATUS_CHANGED = "requirement_status_changed"
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"


class ActivityFeedItem(BaseModel):
    """Элемент ленты активности."""

    id: str = Field(..., description="ID активности")
    type: str = Field(..., description="Тип активности")
    timestamp: datetime = Field(..., description="Время активности")
    user_id: int = Field(..., description="ID пользователя")
    user_name: str = Field(..., description="Имя пользователя")
    target_type: str = Field(..., description="Тип объекта")
    target_id: int = Field(..., description="ID объекта")
    target_title: str = Field(..., description="Заголовок объекта")
    project_id: Optional[int] = Field(None, description="ID проекта")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Метаданные")


class ActivityFeedResponse(BaseModel):
    """Схема ответа с лентой активности."""

    activities: List[ActivityFeedItem] = Field(..., description="Лента активности")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Номер страницы")
    pages: int = Field(..., description="Общее количество страниц")
    size: int = Field(..., description="Размер страницы")


class ActivityStatisticsResponse(BaseModel):
    """Схема ответа со статистикой активности."""

    user_id: int = Field(..., description="ID пользователя")
    project_id: Optional[int] = Field(None, description="ID проекта")
    period_days: int = Field(..., description="Период в днях")
    total_activity: int = Field(..., description="Общее количество активностей")
    total_comments: int = Field(..., description="Количество комментариев")
    total_requirements: int = Field(..., description="Количество требований")
    daily_activity: List[Dict[str, Any]] = Field(..., description="Активность по дням")


class ActivityFilterRequest(BaseModel):
    """Схема запроса для фильтрации активности."""

    activity_types: Optional[List[ActivityTypeEnum]] = Field(
        None, description="Типы активности"
    )
    start_date: Optional[datetime] = Field(None, description="Начальная дата")
    end_date: Optional[datetime] = Field(None, description="Конечная дата")
    project_id: Optional[int] = Field(None, description="ID проекта")
