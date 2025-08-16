"""
Comment Schemas.

Схемы для работы с комментариями.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CommentAuthor(BaseModel):
    """Схема автора комментария."""

    id: int = Field(..., description="ID автора")
    email: str = Field(..., description="Email автора")
    full_name: Optional[str] = Field(None, description="Полное имя автора")


class CommentRequirement(BaseModel):
    """Схема требования для комментария."""

    id: int = Field(..., description="ID требования")
    title: str = Field(..., description="Заголовок требования")
    project_id: int = Field(..., description="ID проекта")


class CommentBase(BaseModel):
    """Базовая схема комментария."""

    content: str = Field(..., description="Содержание комментария")


class CommentCreateRequest(CommentBase):
    """Схема запроса на создание комментария."""

    requirement_id: int = Field(..., description="ID требования")


class CommentUpdateRequest(CommentBase):
    """Схема запроса на обновление комментария."""

    pass


class CommentResponse(CommentBase):
    """Схема ответа с данными комментария."""

    id: int = Field(..., description="ID комментария")
    requirement_id: int = Field(..., description="ID требования")
    author_id: int = Field(..., description="ID автора")
    author: CommentAuthor = Field(..., description="Автор комментария")
    requirement: Optional[CommentRequirement] = Field(None, description="Требование")
    created_at: datetime = Field(..., description="Время создания")
    updated_at: Optional[datetime] = Field(None, description="Время обновления")

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """Схема ответа со списком комментариев."""

    comments: List[CommentResponse] = Field(..., description="Список комментариев")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Номер страницы")
    pages: int = Field(..., description="Общее количество страниц")
    size: int = Field(..., description="Размер страницы")


class CommentSearchRequest(BaseModel):
    """Схема запроса для поиска комментариев."""

    query: str = Field(..., description="Поисковый запрос")
    requirement_id: Optional[int] = Field(None, description="Фильтр по требованию")
    author_id: Optional[int] = Field(None, description="Фильтр по автору")


class CommentStatisticsResponse(BaseModel):
    """Схема ответа со статистикой комментариев."""

    total_comments: int = Field(..., description="Общее количество комментариев")
    user_comments: int = Field(..., description="Комментарии пользователя")
    requirement_id: Optional[int] = Field(
        None, description="ID требования для фильтрации"
    )
