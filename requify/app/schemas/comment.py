"""
Схемы для модели Comment.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CommentBase(BaseModel):
    """Базовая схема комментария."""

    text: str = Field(
        ..., min_length=1, max_length=5000, description="Текст комментария"
    )


class CommentCreate(CommentBase):
    """Схема для создания комментария."""

    requirement_id: int = Field(..., gt=0, description="ID требования")


class CommentUpdate(BaseModel):
    """Схема для обновления комментария."""

    text: Optional[str] = Field(
        None, min_length=1, max_length=5000, description="Текст комментария"
    )


class CommentInDBBase(CommentBase):
    """Базовая схема комментария с данными из БД."""

    id: int
    requirement_id: int
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Comment(CommentInDBBase):
    """Схема комментария для ответов API."""

    pass


class CommentWithAuthor(Comment):
    """Схема комментария с информацией об авторе."""

    author_name: Optional[str] = None
    author_email: Optional[str] = None


class CommentInDB(CommentInDBBase):
    """Схема комментария в БД."""

    pass
