"""
Схемы для токенов аутентификации.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional
from uuid import UUID
from sqlmodel import Field

from .base import BaseSchema


class Token(BaseSchema):
    """
    Схема токена аутентификации.
    """

    access_token: str = Field(..., description="Токен доступа")
    token_type: str = Field(..., description="Тип токена")


class TokenPayload(BaseSchema):
    """
    Схема полезной нагрузки JWT токена.
    """

    sub: Optional[UUID] = Field(None, description="Subject (ID пользователя)")
    exp: Optional[int] = Field(None, description="Время истечения токена")
