"""
Session Management Schemas.

Схемы для управления сессиями пользователей.
"""

from datetime import datetime
from typing import Optional

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Session Schemas ===


class ActiveSession(BaseSchema):
    """Схема для активной сессии пользователя."""

    id: int = Field(..., description="ID сессии")
    created_at: datetime = Field(..., description="Время создания")
    last_used_at: Optional[datetime] = Field(
        None, description="Время последнего использования"
    )
    expires_at: datetime = Field(..., description="Время истечения")
    ip_address: Optional[str] = Field(None, description="IP адрес")
    user_agent: Optional[str] = Field(None, description="User agent")
    device_type: Optional[str] = Field(None, description="Тип устройства")
    location: Optional[str] = Field(None, description="Местоположение")
    is_current: bool = Field(default=False, description="Текущая ли это сессия")

    class Config:
        from_attributes = True


class SessionListResponse(BaseSchema):
    """Схема для списка активных сессий."""

    sessions: list[ActiveSession] = Field(..., description="Список активных сессий")
    total: int = Field(..., description="Общее количество сессий")
    current_session_id: Optional[int] = Field(None, description="ID текущей сессии")


# === Session Management Schemas ===


class RevokeSessionRequest(BaseSchema):
    """Схема для отзыва сессии."""

    session_id: Optional[int] = Field(None, description="ID сессии для отзыва")
    revoke_all: bool = Field(default=False, description="Отозвать все сессии")
    except_current: bool = Field(
        default=True, description="Исключить текущую сессию при отзыве всех"
    )


class RevokeSessionResponse(BaseSchema):
    """Схема для ответа при отзыве сессий."""

    message: str = Field(..., description="Сообщение о результате")
    revoked_sessions: int = Field(..., description="Количество отозванных сессий")
