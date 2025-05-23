from datetime import datetime, UTC
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """
    Базовая схема пользователя.
    """

    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    is_active: bool = True
    is_admin: bool = False


class UserCreate(UserBase):
    """
    Схема для создания пользователя.
    """

    password: str = Field(..., min_length=8)


class UserUpdate(UserBase):
    """
    Схема для обновления пользователя.
    """

    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


class UserInDBBase(UserBase):
    """
    Базовая схема пользователя с данными из БД.
    """

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """
    Схема для возврата пользователя API.
    """

    pass


class UserInDB(UserInDBBase):
    """
    Схема пользователя в БД.
    """

    hashed_password: str
