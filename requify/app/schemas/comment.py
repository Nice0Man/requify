"""
Схемы для модели Comment.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CommentBase(BaseModel):
    """Базовая схема комментария."""

    content: str = Field(
        ..., min_length=1, max_length=5000, description="Содержание комментария"
    )


class CommentCreate(CommentBase):
    """Схема для создания комментария."""

    requirement_id: int = Field(..., gt=0, description="ID требования")
    author_id: Optional[int] = Field(None, gt=0, description="ID автора")


class CommentCreateForRequirement(BaseModel):
    """Схема для создания комментария к конкретному требованию (без requirement_id)."""

    content: str = Field(
        ..., min_length=1, max_length=5000, description="Содержание комментария"
    )


class CommentUpdate(BaseModel):
    """Схема для обновления комментария."""

    content: Optional[str] = Field(
        None, min_length=1, max_length=5000, description="Содержание комментария"
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
    requirement_title: Optional[str] = None


class CommentInDB(CommentInDBBase):
    """Схема комментария в БД."""

    pass


class CommentStatistics(BaseModel):
    """Схема статистики комментариев."""

    total_comments: int = Field(..., ge=0, description="Общее количество комментариев")
    comments_today: int = Field(
        ..., ge=0, description="Количество комментариев за сегодня"
    )
    comments_this_week: int = Field(
        ..., ge=0, description="Количество комментариев за неделю"
    )
    comments_this_month: int = Field(
        ..., ge=0, description="Количество комментариев за месяц"
    )
    most_active_authors: List[str] = Field(
        default_factory=list, description="Самые активные авторы"
    )
    most_commented_requirements: List[str] = Field(
        default_factory=list, description="Наиболее комментируемые требования"
    )
    average_comments_per_requirement: float = Field(
        ..., ge=0, description="Среднее количество комментариев на требование"
    )
    generated_at: str = Field(..., description="Время генерации статистики")

    class Config:
        from_attributes = True
