"""
Notification Schemas.

Схемы для работы с уведомлениями пользователей.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    """Базовая схема для уведомления."""

    notification_type: str = Field(..., description="Тип уведомления")
    title: str = Field(..., description="Заголовок уведомления")
    message: str = Field(..., description="Текст уведомления")
    data: Optional[Dict[str, Any]] = Field(None, description="Дополнительные данные")


class NotificationCreate(NotificationBase):
    """Схема для создания уведомления."""

    user_id: int = Field(..., description="ID получателя")


class NotificationUpdate(BaseModel):
    """Схема для обновления уведомления."""

    is_read: Optional[bool] = Field(None, description="Статус прочтения")
    data: Optional[Dict[str, Any]] = Field(None, description="Дополнительные данные")


class NotificationResponse(NotificationBase):
    """Схема ответа с данными уведомления."""

    id: int = Field(..., description="ID уведомления")
    read: bool = Field(..., description="Прочитано ли уведомление")
    created_at: datetime = Field(..., description="Время создания")

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Схема ответа со списком уведомлений."""

    notifications: list[NotificationResponse] = Field(
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
