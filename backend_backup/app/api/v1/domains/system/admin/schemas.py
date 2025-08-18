"""
System Administration Schemas.

Схемы для административных операций системы.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import Field, EmailStr

from app.api.v1.common.schemas import BaseSchema, CreateSchema


# === User Administration Schemas ===


class AdminUserListItem(BaseSchema):
    """Схема для элемента списка пользователей для админов."""

    id: int = Field(..., description="ID пользователя")
    username: str = Field(..., description="Имя пользователя")
    email: EmailStr = Field(..., description="Email")
    is_active: bool = Field(..., description="Активен ли пользователь")
    email_verified: bool = Field(..., description="Подтвержден ли email")
    created_at: datetime = Field(..., description="Дата создания")
    last_login: Optional[datetime] = Field(None, description="Последний вход")
    company_name: Optional[str] = Field(None, description="Название компании")
    role_names: List[str] = Field(default_factory=list, description="Роли пользователя")

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseSchema):
    """Схема для списка пользователей для админов."""

    users: List[AdminUserListItem] = Field(..., description="Список пользователей")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    pages: int = Field(..., description="Общее количество страниц")


class UserStatsResponse(BaseSchema):
    """Схема для статистики пользователей."""

    total_users: int = Field(..., description="Общее количество пользователей")
    active_users: int = Field(..., description="Активные пользователи")
    verified_users: int = Field(..., description="Пользователи с подтвержденным email")
    users_last_30_days: int = Field(..., description="Новых пользователей за 30 дней")
    users_last_7_days: int = Field(..., description="Новых пользователей за 7 дней")
    users_today: int = Field(..., description="Новых пользователей сегодня")


# === Company Administration Schemas ===


class AdminCompanyListItem(BaseSchema):
    """Схема для элемента списка компаний для админов."""

    id: int = Field(..., description="ID компании")
    name: str = Field(..., description="Название компании")
    is_active: bool = Field(..., description="Активна ли компания")
    created_at: datetime = Field(..., description="Дата создания")
    users_count: int = Field(..., description="Количество пользователей")
    projects_count: int = Field(..., description="Количество проектов")
    subscription_plan: Optional[str] = Field(None, description="План подписки")

    class Config:
        from_attributes = True


class AdminCompanyListResponse(BaseSchema):
    """Схема для списка компаний для админов."""

    companies: List[AdminCompanyListItem] = Field(..., description="Список компаний")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    pages: int = Field(..., description="Общее количество страниц")


class CompanyStatsResponse(BaseSchema):
    """Схема для статистики компаний."""

    total_companies: int = Field(..., description="Общее количество компаний")
    active_companies: int = Field(..., description="Активные компании")
    companies_last_30_days: int = Field(..., description="Новых компаний за 30 дней")
    companies_last_7_days: int = Field(..., description="Новых компаний за 7 дней")
    companies_today: int = Field(..., description="Новых компаний сегодня")


# === User Action Schemas ===


class UserActionRequest(CreateSchema):
    """Схема для действий с пользователем."""

    user_id: int = Field(..., description="ID пользователя")
    action: str = Field(
        ..., description="Действие (activate, deactivate, verify_email)"
    )
    reason: Optional[str] = Field(None, description="Причина действия")


class UserActionResponse(BaseSchema):
    """Схема для ответа на действие с пользователем."""

    success: bool = Field(..., description="Успешно ли выполнено действие")
    message: str = Field(..., description="Сообщение о результате")
    user_id: int = Field(..., description="ID пользователя")
    action: str = Field(..., description="Выполненное действие")


# === Admin Filter Schemas ===


class AdminUsersFilterRequest(BaseSchema):
    """Схема для фильтрации пользователей."""

    search: Optional[str] = Field(None, description="Поиск по имени или email")
    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    email_verified: Optional[bool] = Field(
        None, description="Фильтр по верификации email"
    )
    company_id: Optional[int] = Field(None, description="Фильтр по компании")
    created_from: Optional[datetime] = Field(None, description="Дата создания от")
    created_to: Optional[datetime] = Field(None, description="Дата создания до")
    page: int = Field(default=1, ge=1, description="Номер страницы")
    size: int = Field(default=20, ge=1, le=100, description="Размер страницы")


class AdminCompaniesFilterRequest(BaseSchema):
    """Схема для фильтрации компаний."""

    search: Optional[str] = Field(None, description="Поиск по названию")
    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    subscription_plan: Optional[str] = Field(
        None, description="Фильтр по плану подписки"
    )
    created_from: Optional[datetime] = Field(None, description="Дата создания от")
    created_to: Optional[datetime] = Field(None, description="Дата создания до")
    page: int = Field(default=1, ge=1, description="Номер страницы")
    size: int = Field(default=20, ge=1, le=100, description="Размер страницы")
