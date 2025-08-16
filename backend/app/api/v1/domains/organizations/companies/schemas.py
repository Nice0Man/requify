"""
Companies Management Schemas.

Pydantic models для операций с компаниями.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import Field, EmailStr, ConfigDict

from app.api.v1.common.schemas import BaseSchema


# === Company Enums ===


class CompanyStatus(str, Enum):
    """Статусы компании."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    INACTIVE = "inactive"


class SubscriptionPlan(str, Enum):
    """Планы подписки."""

    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class CompanySize(str, Enum):
    """Размеры компании."""

    STARTUP = "startup"  # 1-10
    SMALL = "small"  # 11-50
    MEDIUM = "medium"  # 51-200
    LARGE = "large"  # 201-1000
    ENTERPRISE = "enterprise"  # 1000+


# === Company Request Schemas ===


class CompanyCreateRequest(BaseSchema):
    """Schema for creating a new company."""

    name: str = Field(
        ..., min_length=1, max_length=255, description="Название компании"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание компании"
    )
    website: Optional[str] = Field(
        None, max_length=255, description="Веб-сайт компании"
    )
    industry: Optional[str] = Field(None, max_length=100, description="Отрасль")
    size: CompanySize = Field(CompanySize.STARTUP, description="Размер компании")

    # Дополнительные поля для создания
    initial_admin_email: EmailStr = Field(
        ..., description="Email первого администратора"
    )
    subscription_plan: SubscriptionPlan = Field(
        SubscriptionPlan.FREE, description="План подписки"
    )


class CompanyUpdateRequest(BaseSchema):
    """Schema for updating company information."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Название компании"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание компании"
    )
    website: Optional[str] = Field(
        None, max_length=255, description="Веб-сайт компании"
    )
    industry: Optional[str] = Field(None, max_length=100, description="Отрасль")
    size: Optional[CompanySize] = Field(None, description="Размер компании")


# === Company Response Schemas ===


class CompanyResponse(BaseSchema):
    """Basic company information."""

    id: int = Field(..., description="ID компании")
    name: str = Field(..., description="Название компании")
    description: Optional[str] = Field(None, description="Описание компании")
    website: Optional[str] = Field(None, description="Веб-сайт компании")
    industry: Optional[str] = Field(None, description="Отрасль")
    size: CompanySize = Field(..., description="Размер компании")
    status: CompanyStatus = Field(..., description="Статус компании")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата последнего обновления")


class CompanyDetailResponse(CompanyResponse):
    """Detailed company information."""

    # Статистика
    employees_count: int = Field(0, description="Количество сотрудников")
    projects_count: int = Field(0, description="Количество проектов")
    departments_count: int = Field(0, description="Количество департаментов")
    teams_count: int = Field(0, description="Количество команд")

    # Подписка
    subscription_plan: SubscriptionPlan = Field(..., description="План подписки")
    subscription_expires_at: Optional[datetime] = Field(
        None, description="Дата окончания подписки"
    )


class CompanyListResponse(BaseSchema):
    """Response for company list with pagination."""

    companies: List[CompanyResponse] = Field(..., description="Список компаний")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


class CompanyOperationResponse(BaseSchema):
    """Response for company operations."""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение операции")
    company_id: int = Field(..., description="ID компании")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время операции"
    )


# === Company Settings Schemas ===


class CompanySettingsRequest(BaseSchema):
    """Schema for company settings."""

    timezone: Optional[str] = Field(None, description="Часовой пояс")
    language: Optional[str] = Field(None, description="Язык по умолчанию")
    date_format: Optional[str] = Field(None, description="Формат даты")
    currency: Optional[str] = Field(None, description="Валюта")

    # Security settings
    password_policy_enabled: Optional[bool] = Field(
        None, description="Включена ли политика паролей"
    )
    two_factor_required: Optional[bool] = Field(
        None, description="Обязательная двухфакторная аутентификация"
    )
    session_timeout_minutes: Optional[int] = Field(
        None, ge=5, le=1440, description="Таймаут сессии в минутах"
    )

    # Feature flags
    projects_enabled: Optional[bool] = Field(None, description="Включены ли проекты")
    requirements_enabled: Optional[bool] = Field(
        None, description="Включены ли требования"
    )
    testing_enabled: Optional[bool] = Field(
        None, description="Включено ли тестирование"
    )
    analytics_enabled: Optional[bool] = Field(None, description="Включена ли аналитика")


class CompanySettingsResponse(BaseSchema):
    """Company settings response."""

    id: int = Field(..., description="ID настроек")
    company_id: int = Field(..., description="ID компании")
    timezone: str = Field(..., description="Часовой пояс")
    language: str = Field(..., description="Язык по умолчанию")
    date_format: str = Field(..., description="Формат даты")
    currency: str = Field(..., description="Валюта")

    # Security settings
    password_policy_enabled: bool = Field(..., description="Политика паролей")
    two_factor_required: bool = Field(..., description="Двухфакторная аутентификация")
    session_timeout_minutes: int = Field(..., description="Таймаут сессии")

    # Feature flags
    projects_enabled: bool = Field(..., description="Проекты")
    requirements_enabled: bool = Field(..., description="Требования")
    testing_enabled: bool = Field(..., description="Тестирование")
    analytics_enabled: bool = Field(..., description="Аналитика")

    created_at: datetime = Field(..., description="Дата создания")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")


# === Company Contact Schemas ===


class CompanyContactRequest(BaseSchema):
    """Schema for company contact information."""

    email: Optional[EmailStr] = Field(None, description="Контактный email")
    phone: Optional[str] = Field(None, max_length=20, description="Контактный телефон")
    address: Optional[str] = Field(None, max_length=500, description="Адрес")
    city: Optional[str] = Field(None, max_length=100, description="Город")
    country: Optional[str] = Field(None, max_length=100, description="Страна")
    postal_code: Optional[str] = Field(
        None, max_length=20, description="Почтовый индекс"
    )


class CompanyContactResponse(BaseSchema):
    """Company contact information response."""

    id: int = Field(..., description="ID контактной информации")
    company_id: int = Field(..., description="ID компании")
    email: Optional[str] = Field(None, description="Контактный email")
    phone: Optional[str] = Field(None, description="Контактный телефон")
    address: Optional[str] = Field(None, description="Адрес")
    city: Optional[str] = Field(None, description="Город")
    country: Optional[str] = Field(None, description="Страна")
    postal_code: Optional[str] = Field(None, description="Почтовый индекс")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")


# === Company Branding Schemas ===


class CompanyBrandingRequest(BaseSchema):
    """Schema for company branding information."""

    logo_url: Optional[str] = Field(None, description="URL логотипа")
    primary_color: Optional[str] = Field(None, description="Основной цвет")
    secondary_color: Optional[str] = Field(None, description="Вторичный цвет")
    accent_color: Optional[str] = Field(None, description="Акцентный цвет")
    font_family: Optional[str] = Field(None, description="Семейство шрифтов")


class CompanyBrandingResponse(BaseSchema):
    """Company branding information response."""

    id: int = Field(..., description="ID брендинга")
    company_id: int = Field(..., description="ID компании")
    logo_url: Optional[str] = Field(None, description="URL логотипа")
    primary_color: Optional[str] = Field(None, description="Основной цвет")
    secondary_color: Optional[str] = Field(None, description="Вторичный цвет")
    accent_color: Optional[str] = Field(None, description="Акцентный цвет")
    font_family: Optional[str] = Field(None, description="Семейство шрифтов")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")
