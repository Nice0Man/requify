from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    """
    Схема токена аутентификации.
    """

    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Схема полезной нагрузки JWT токена.
    """

    sub: Optional[UUID] = None
    exp: Optional[int] = None
