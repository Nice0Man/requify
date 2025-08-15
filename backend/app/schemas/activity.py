"""
Activity Schemas.

Схемы для работы с активностью пользователей.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ActivityBase(BaseModel):
    """Базовая схема для активности."""

    activity_type: str = Field(..., description="Тип активности")
    target_type: str = Field(..., description="Тип объекта")
    target_id: str = Field(..., description="ID объекта")
    activity_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные данные"
    )
    project_id: Optional[int] = Field(None, description="ID проекта")


class ActivityCreate(ActivityBase):
    """Схема для создания активности."""

    user_id: int = Field(..., description="ID пользователя")


class ActivityUpdate(BaseModel):
    """Схема для обновления активности."""

    activity_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные данные"
    )


class ActivityResponse(ActivityBase):
    """Схема ответа с данными активности."""

    id: int = Field(..., description="ID активности")
    user_id: int = Field(..., description="ID пользователя")
    created_at: datetime = Field(..., description="Время создания")
    updated_at: Optional[datetime] = Field(None, description="Время обновления")

    class Config:
        from_attributes = True


class ActivityListResponse(BaseModel):
    """Схема ответа со списком активностей."""

    activities: list[ActivityResponse] = Field(..., description="Список активностей")
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
    daily_activity: list[Dict[str, Any]] = Field(..., description="Активность по дням")


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
    activity_metadata: Dict[str, Any] = Field(default_factory=dict, description="Метаданные", alias="metadata")


class ActivityFeedResponse(BaseModel):
    """Схема ответа с лентой активности."""

    activities: list[ActivityFeedItem] = Field(..., description="Лента активности")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Номер страницы")
    pages: int = Field(..., description="Общее количество страниц")
    size: int = Field(..., description="Размер страницы")
