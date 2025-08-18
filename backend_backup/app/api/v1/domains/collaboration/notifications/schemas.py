"""
Notification Schemas for Collaboration Domain.

Схемы для работы с уведомлениями в collaboration домене.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    """Схема ответа с данными уведомления."""

    id: int = Field(..., description="ID уведомления")
    type: str = Field(..., description="Тип уведомления")
    title: str = Field(..., description="Заголовок уведомления")
    message: str = Field(..., description="Текст уведомления")
    read: bool = Field(..., description="Прочитано ли уведомление")
    created_at: datetime = Field(..., description="Время создания")
    data: Dict[str, Any] = Field(
        default_factory=dict, description="Дополнительные данные"
    )

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Схема ответа со списком уведомлений."""

    notifications: List[NotificationResponse] = Field(
        ..., description="Список уведомлений"
    )
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Номер страницы")
    pages: int = Field(..., description="Общее количество страниц")
    size: int = Field(..., description="Размер страницы")


class MarkNotificationReadRequest(BaseModel):
    """Схема запроса для изменения статуса прочтения."""

    read: bool = Field(..., description="Новый статус прочтения")


class NotificationUnreadCountResponse(BaseModel):
    """Схема ответа с количеством непрочитанных уведомлений."""

    unread_count: int = Field(..., description="Количество непрочитанных уведомлений")
    user_id: int = Field(..., description="ID пользователя")
