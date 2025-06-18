"""
Схемы для модели User.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class UserBase(BaseModel):
    """Базовая схема пользователя."""

    username: str = Field(
        ..., min_length=2, max_length=50, description="Имя пользователя"
    )
    email: EmailStr = Field(..., description="Email пользователя")
    role: str = Field(..., min_length=1, max_length=20, description="Роль пользователя")


class UserCreate(UserBase):
    """Схема для создания пользователя."""

    password: str = Field(..., min_length=8, description="Пароль пользователя")


class UserUpdate(BaseModel):
    """Схема для обновления пользователя."""

    username: Optional[str] = Field(
        None, min_length=2, max_length=50, description="Имя пользователя"
    )
    email: Optional[EmailStr] = Field(None, description="Email пользователя")
    role: Optional[str] = Field(
        None, min_length=1, max_length=20, description="Роль пользователя"
    )
    password: Optional[str] = Field(
        None, min_length=8, description="Пароль пользователя"
    )


class UserInDBBase(UserBase):
    """Базовая схема пользователя с данными из БД."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """Схема пользователя для ответов API."""

    pass


class UserWithStats(User):
    """Схема пользователя со статистикой."""

    authored_requirements_count: int = 0
    modified_requirements_count: int = 0
    comments_count: int = 0


class UserInDB(UserInDBBase):
    """Схема пользователя в БД."""

    hashed_password: str = Field(..., description="Хэшированный пароль")
