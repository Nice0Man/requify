"""
Схемы для модели Company.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
Поддерживает декомпозированную модель Company (4NF).
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import field_validator, model_validator
from enum import Enum
import re

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    StatisticsSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)
from .common import SearchRequest, DateRangeFilter


# === Перечисления ===


class CompanyType(str, Enum):
    """Типы компаний"""

    STARTUP = "startup"
    SMALL_BUSINESS = "small_business"
    MEDIUM_BUSINESS = "medium_business"
    ENTERPRISE = "enterprise"
    NON_PROFIT = "non_profit"
    GOVERNMENT = "government"
    EDUCATIONAL = "educational"
    CONSULTING = "consulting"
    AGENCY = "agency"
    FREELANCER = "freelancer"


class CompanyStatus(str, Enum):
    """Статусы компаний"""

    TRIAL = "trial"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    PENDING_VERIFICATION = "pending_verification"
    BLOCKED = "blocked"


class CompanySize(str, Enum):
    """Размеры компаний по количеству сотрудников"""

    MICRO = "micro"  # 1-9 сотрудников
    SMALL = "small"  # 10-49 сотрудников
    MEDIUM = "medium"  # 50-249 сотрудников
    LARGE = "large"  # 250-999 сотрудников
    ENTERPRISE = "enterprise"  # 1000+ сотрудников


class SubscriptionPlan(str, Enum):
    """Планы подписки"""

    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class IndustryType(str, Enum):
    """Отрасли деятельности"""

    TECHNOLOGY = "technology"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    RETAIL = "retail"
    MANUFACTURING = "manufacturing"
    CONSTRUCTION = "construction"
    CONSULTING = "consulting"
    MEDIA = "media"
    REAL_ESTATE = "real_estate"
    GOVERNMENT = "government"
    NON_PROFIT = "non_profit"
    OTHER = "other"


# === Базовые схемы ===


class CompanyBase(BaseSchema, ValidationMixin):
    """
    Базовая схема компании.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " компании",
    )
    slug: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="URL-slug компании (автогенерация из названия)",
    )
    legal_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Юридическое название компании",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " компании",
    )
    company_type: CompanyType = Field(
        CompanyType.SMALL_BUSINESS, description="Тип компании"
    )
    industry: Optional[IndustryType] = Field(None, description="Отрасль деятельности")
    size_category: Optional[CompanySize] = Field(
        None, description="Категория размера компании"
    )
    employee_count: Optional[int] = Field(
        None,
        ge=0,
        le=FieldLimits.COMPANY_MAX_EMPLOYEES,
        description="Количество сотрудников",
    )
    status: CompanyStatus = Field(CompanyStatus.TRIAL, description="Статус компании")
    website: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="Веб-сайт компании"
    )
    email: Optional[str] = Field(
        None, max_length=FieldLimits.EMAIL_MAX, description="Контактный email"
    )
    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Контактный телефон"
    )
    founded_year: Optional[int] = Field(
        None, ge=1800, le=2030, description="Год основания"
    )
    headquarters: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Местоположение штаб-квартиры",
    )
    timezone: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Часовой пояс компании",
    )
    settings: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Настройки компании"
    )
    company_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Дополнительные метаданные", alias="metadata"
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия компании"""
        v = cls.validate_non_empty_string(v, "name")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\\", "/"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Company name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        """Валидация slug компании"""
        if v is not None:
            v = v.strip().lower()
            if not v:
                return None

            # Slug должен содержать только строчные буквы, цифры и дефисы
            if not re.match(r"^[a-z0-9-]+$", v):
                raise ValueError(
                    "Slug can only contain lowercase letters, numbers and hyphens"
                )

            # Не должен начинаться или заканчиваться дефисом
            if v.startswith("-") or v.endswith("-"):
                raise ValueError("Slug cannot start or end with hyphen")

            # Не должен содержать двойные дефисы
            if "--" in v:
                raise ValueError("Slug cannot contain consecutive hyphens")

        return v

    @field_validator("legal_name")
    @classmethod
    def validate_legal_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация юридического названия"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.SHORT_STRING_MAX:
                raise ValueError(
                    f"Legal name cannot exceed {FieldLimits.SHORT_STRING_MAX} characters"
                )
        return v

    @field_validator("website")
    @classmethod
    def validate_website(cls, v: Optional[str]) -> Optional[str]:
        """Валидация веб-сайта"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Простая проверка URL
            if not v.startswith(("http://", "https://")):
                v = "https://" + v

            # Проверяем базовый формат URL
            url_pattern = re.compile(
                r"^https?://"  # http:// or https://
                r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
                r"localhost|"  # localhost...
                r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
                r"(?::\d+)?"  # optional port
                r"(?:/?|[/?]\S+)$",
                re.IGNORECASE,
            )

            if not url_pattern.match(v):
                raise ValueError("Invalid website URL format")

        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Валидация контактного email"""
        if v is not None:
            v = v.strip().lower()
            if not v:
                return None

            # Простая проверка email
            email_pattern = re.compile(
                r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            )
            if not email_pattern.match(v):
                raise ValueError("Invalid email format")

        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Валидация телефона"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Удаляем все кроме цифр, плюса и дефисов
            cleaned = re.sub(r"[^\d\+\-\(\)\s]", "", v)
            if len(cleaned) < 7:
                raise ValueError("Phone number is too short")

        return v

    @model_validator(mode="after")
    def validate_size_consistency(self):
        """Валидация согласованности размера компании"""
        if self.employee_count is not None and self.size_category is not None:
            # Проверяем соответствие количества сотрудников категории размера
            size_ranges = {
                CompanySize.MICRO: (1, 9),
                CompanySize.SMALL: (10, 49),
                CompanySize.MEDIUM: (50, 249),
                CompanySize.LARGE: (250, 999),
                CompanySize.ENTERPRISE: (1000, float("inf")),
            }

            min_count, max_count = size_ranges.get(
                self.size_category, (0, float("inf"))
            )
            if not (min_count <= self.employee_count <= max_count):
                raise ValueError(
                    f"Employee count {self.employee_count} doesn't match size category {self.size_category}"
                )

        return self


# === CRUD схемы ===


class CompanyCreate(CompanyBase, CreateSchema):
    """
    Схема для создания компании.
    """

    # Обязательные поля при создании
    name: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.COMPANY_NAME_MAX,
        description=StandardDescriptions.NAME + " компании",
    )

    # Дополнительные поля для создания
    owner_id: Optional[int] = Field(
        None,
        gt=0,
        description="ID владельца компании (автоматически текущий пользователь)",
    )

    # Настройки подписки
    subscription_plan: Optional[SubscriptionPlan] = Field(
        SubscriptionPlan.FREE, description="Начальный план подписки"
    )
    trial_ends_at: Optional[datetime] = Field(
        None, description="Дата окончания пробного периода"
    )

    @field_validator("owner_id")
    @classmethod
    def validate_owner_id(cls, v: Optional[int]) -> Optional[int]:
        """Валидация ID владельца"""
        if v is not None and v <= 0:
            raise ValueError("Owner ID must be a positive integer")
        return v


class CompanyUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления компании.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=FieldLimits.COMPANY_NAME_MAX,
        description=StandardDescriptions.NAME + " компании",
    )
    slug: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="URL-slug компании"
    )
    legal_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Юридическое название",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    company_type: Optional[CompanyType] = Field(None, description="Тип компании")
    industry: Optional[IndustryType] = Field(None, description="Отрасль деятельности")
    size_category: Optional[CompanySize] = Field(None, description="Категория размера")
    employee_count: Optional[int] = Field(
        None,
        ge=0,
        le=FieldLimits.COMPANY_MAX_EMPLOYEES,
        description="Количество сотрудников",
    )
    status: Optional[CompanyStatus] = Field(None, description="Статус компании")
    website: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="Веб-сайт"
    )
    email: Optional[str] = Field(
        None, max_length=FieldLimits.EMAIL_MAX, description="Контактный email"
    )
    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Контактный телефон"
    )
    founded_year: Optional[int] = Field(
        None, ge=1800, le=2030, description="Год основания"
    )
    headquarters: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Местоположение штаб-квартиры",
    )
    timezone: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Часовой пояс"
    )
    settings: Optional[Dict[str, Any]] = Field(None, description="Настройки компании")
    company_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные метаданные", alias="metadata"
    )
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class CompanyResponse(CompanyBase, ResponseSchema):
    """
    Схема ответа для компании.
    Включает все данные из БД включая связи.
    """

    owner_id: Optional[int] = None


# === Расширенные схемы ===


class CompanyWithRelations(CompanyResponse):
    """
    Схема компании с информацией о связанных сущностях.
    """

    owner_name: Optional[str] = Field(None, description="Имя владельца компании")
    owner_email: Optional[str] = Field(None, description="Email владельца")


class CompanyDetailed(CompanyWithRelations):
    """
    Детальная схема компании с полной информацией.
    """

    # Статистика
    users_count: int = Field(0, ge=0, description="Количество пользователей")
    projects_count: int = Field(0, ge=0, description="Количество проектов")
    departments_count: int = Field(0, ge=0, description="Количество отделов")
    teams_count: int = Field(0, ge=0, description="Количество команд")

    # Активность
    active_projects_count: int = Field(0, ge=0, description="Активных проектов")
    total_requirements_count: int = Field(
        0, ge=0, description="Общее количество требований"
    )
    completed_requirements_count: int = Field(
        0, ge=0, description="Выполненных требований"
    )

    # Подписка
    subscription_plan: Optional[SubscriptionPlan] = Field(
        None, description="План подписки"
    )
    subscription_status: Optional[str] = Field(None, description="Статус подписки")
    trial_ends_at: Optional[datetime] = Field(
        None, description="Дата окончания пробного периода"
    )
    is_trial_expired: bool = Field(False, description="Истек ли пробный период")

    # Лимиты и использование
    users_limit: Optional[int] = Field(None, description="Лимит пользователей")
    projects_limit: Optional[int] = Field(None, description="Лимит проектов")
    storage_used_mb: int = Field(0, ge=0, description="Использовано хранилища (МБ)")
    storage_limit_mb: Optional[int] = Field(None, description="Лимит хранилища (МБ)")

    # Последняя активность
    last_activity_at: Optional[datetime] = Field(
        None, description="Дата последней активности"
    )

    # Права доступа для текущего пользователя
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_manage_users: bool = Field(
        False, description="Можно ли управлять пользователями"
    )
    can_manage_billing: bool = Field(False, description="Можно ли управлять биллингом")


# === Списки и пагинация ===


class CompanyListResponse(ListResponseSchema[CompanyWithRelations]):
    """Список компаний с пагинацией"""

    pass


class CompanyDetailedListResponse(ListResponseSchema[CompanyDetailed]):
    """Детальный список компаний с пагинацией"""

    pass


class CompanyPublicResponse(BaseSchema):
    """
    Публичная схема компании (ограниченная информация).
    """

    id: int = Field(..., description=StandardDescriptions.ID)
    name: str = Field(..., description=StandardDescriptions.NAME)
    slug: Optional[str] = Field(None, description="URL-slug")
    description: Optional[str] = Field(
        None, description=StandardDescriptions.DESCRIPTION
    )
    company_type: CompanyType = Field(..., description="Тип компании")
    industry: Optional[IndustryType] = Field(None, description="Отрасль")
    website: Optional[str] = Field(None, description="Веб-сайт")
    founded_year: Optional[int] = Field(None, description="Год основания")
    headquarters: Optional[str] = Field(None, description="Местоположение")
    is_active: bool = Field(..., description=StandardDescriptions.IS_ACTIVE)


# === Поиск и фильтрация ===


class CompanySearchRequest(SearchRequest):
    """
    Запрос поиска компаний.
    """

    types: Optional[List[CompanyType]] = Field(
        None, description="Фильтр по типам компаний"
    )
    statuses: Optional[List[CompanyStatus]] = Field(
        None, description="Фильтр по статусам"
    )
    industries: Optional[List[IndustryType]] = Field(
        None, description="Фильтр по отраслям"
    )
    size_categories: Optional[List[CompanySize]] = Field(
        None, description="Фильтр по размерам"
    )
    subscription_plans: Optional[List[SubscriptionPlan]] = Field(
        None, description="Фильтр по планам подписки"
    )
    is_active: Optional[bool] = Field(None, description="Активные компании")
    has_trial: Optional[bool] = Field(None, description="Компании с пробным периодом")


class CompanyFilter(BaseSchema):
    """
    Расширенный фильтр для компаний.
    """

    employee_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество сотрудников"
    )
    employee_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество сотрудников"
    )
    founded_year_min: Optional[int] = Field(
        None, ge=1800, description="Минимальный год основания"
    )
    founded_year_max: Optional[int] = Field(
        None, le=2030, description="Максимальный год основания"
    )
    users_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество пользователей"
    )
    users_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество пользователей"
    )
    projects_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество проектов"
    )
    projects_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество проектов"
    )
    has_website: Optional[bool] = Field(None, description="Есть ли веб-сайт")
    has_phone: Optional[bool] = Field(None, description="Есть ли телефон")
    date_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат создания"
    )
    last_activity_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат последней активности"
    )


# === Подписка и биллинг ===


class CompanySubscription(BaseSchema):
    """
    Схема подписки компании.
    """

    plan: SubscriptionPlan = Field(..., description="План подписки")
    status: str = Field(..., description="Статус подписки")
    starts_at: datetime = Field(..., description="Дата начала подписки")
    ends_at: Optional[datetime] = Field(None, description="Дата окончания подписки")
    trial_ends_at: Optional[datetime] = Field(
        None, description="Дата окончания пробного периода"
    )
    auto_renew: bool = Field(True, description="Автоматическое продление")

    # Лимиты плана
    users_limit: Optional[int] = Field(None, description="Лимит пользователей")
    projects_limit: Optional[int] = Field(None, description="Лимит проектов")
    storage_limit_mb: Optional[int] = Field(None, description="Лимит хранилища (МБ)")

    # Использование
    users_used: int = Field(0, ge=0, description="Использовано пользователей")
    projects_used: int = Field(0, ge=0, description="Использовано проектов")
    storage_used_mb: int = Field(0, ge=0, description="Использовано хранилища (МБ)")


class CompanySubscriptionUpdate(BaseSchema):
    """
    Схема обновления подписки компании.
    """

    plan: SubscriptionPlan = Field(..., description="Новый план подписки")
    auto_renew: Optional[bool] = Field(None, description="Автоматическое продление")
    upgrade_immediately: bool = Field(
        True, description="Применить изменения немедленно"
    )


# === Статистика ===


class CompanyStatistics(StatisticsSchema):
    """
    Схема статистики компаний.
    """

    total_companies: int = Field(0, ge=0, description="Общее количество компаний")
    active_companies: int = Field(0, ge=0, description="Активных компаний")
    trial_companies: int = Field(0, ge=0, description="Компаний на пробном периоде")
    paid_companies: int = Field(0, ge=0, description="Платящих компаний")

    by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по типам"
    )
    by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по статусам"
    )
    by_industry: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по отраслям"
    )
    by_size: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по размерам"
    )
    by_subscription_plan: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по планам подписки"
    )

    registration_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды регистрации"
    )
    activity_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды активности"
    )
    subscription_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды подписок"
    )


# === Управление ===


class CompanyStatusChange(BaseSchema):
    """
    Схема изменения статуса компании.
    """

    new_status: CompanyStatus = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )
    notify_users: bool = Field(True, description="Уведомить пользователей об изменении")
    effective_date: Optional[datetime] = Field(
        None, description="Дата вступления в силу (если не сейчас)"
    )


class CompanyTransfer(BaseSchema):
    """
    Схема передачи компании другому владельцу.
    """

    new_owner_id: int = Field(..., gt=0, description="ID нового владельца")
    transfer_reason: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Причина передачи"
    )
    notify_users: bool = Field(
        True, description="Уведомить пользователей о смене владельца"
    )


# === Массовые операции ===


class CompanyBulkUpdate(BaseSchema):
    """
    Схема для массового обновления компаний.
    """

    company_ids: List[int] = Field(..., min_length=1, description="Список ID компаний")
    update_data: CompanyUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class CompanyBulkStatusChange(BaseSchema):
    """
    Схема для массового изменения статуса компаний.
    """

    company_ids: List[int] = Field(..., min_length=1, description="Список ID компаний")
    new_status: CompanyStatus = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )
    notify_users: bool = Field(True, description="Уведомить пользователей")


# === Экспорт и импорт ===


class CompanyExportRequest(BaseSchema):
    """
    Запрос на экспорт компаний.
    """

    format: str = Field(
        "xlsx", regex="^(xlsx|csv|pdf|json)$", description="Формат экспорта"
    )
    filter: Optional[CompanyFilter] = Field(None, description="Фильтр для экспорта")
    include_users: bool = Field(
        False, description="Включить информацию о пользователях"
    )
    include_projects: bool = Field(False, description="Включить информацию о проектах")
    include_statistics: bool = Field(False, description="Включить статистику")
    include_subscription: bool = Field(
        False, description="Включить информацию о подписке"
    )


# === Валидация ===


class CompanyValidationResult(BaseSchema):
    """
    Результат валидации данных компании.
    """

    is_valid: bool = Field(..., description="Валидны ли данные")
    errors: List[str] = Field(default_factory=list, description="Список ошибок")
    warnings: List[str] = Field(
        default_factory=list, description="Список предупреждений"
    )
    suggestions: List[str] = Field(
        default_factory=list, description="Список рекомендаций"
    )


# === Константы и утилиты ===


class CompanyConfig:
    """
    Конфигурация схем компаний.
    """

    # Схемы для различных контекстов
    MINIMAL = CompanyResponse
    STANDARD = CompanyWithRelations
    DETAILED = CompanyDetailed
    PUBLIC = CompanyPublicResponse
    LIST = CompanyListResponse
    SEARCH = CompanySearchRequest

    # Лимиты по планам подписки
    PLAN_LIMITS = {
        SubscriptionPlan.FREE: {
            "users": 5,
            "projects": 3,
            "storage_mb": 100,
            "trial_days": 14,
        },
        SubscriptionPlan.BASIC: {
            "users": 25,
            "projects": 10,
            "storage_mb": 1000,
            "trial_days": 0,
        },
        SubscriptionPlan.PROFESSIONAL: {
            "users": 100,
            "projects": 50,
            "storage_mb": 10000,
            "trial_days": 0,
        },
        SubscriptionPlan.ENTERPRISE: {
            "users": None,  # Unlimited
            "projects": None,  # Unlimited
            "storage_mb": None,  # Unlimited
            "trial_days": 0,
        },
    }

    # Размеры компаний
    SIZE_RANGES = {
        CompanySize.MICRO: (1, 9),
        CompanySize.SMALL: (10, 49),
        CompanySize.MEDIUM: (50, 249),
        CompanySize.LARGE: (250, 999),
        CompanySize.ENTERPRISE: (1000, float("inf")),
    }

    # Отрасли со значениями по умолчанию
    INDUSTRY_DEFAULTS = {
        IndustryType.TECHNOLOGY: {
            "size_category": CompanySize.SMALL,
            "company_type": CompanyType.STARTUP,
        },
        IndustryType.FINANCE: {
            "size_category": CompanySize.MEDIUM,
            "company_type": CompanyType.ENTERPRISE,
        },
        IndustryType.HEALTHCARE: {
            "size_category": CompanySize.MEDIUM,
            "company_type": CompanyType.ENTERPRISE,
        },
    }


# === Псевдонимы для обратной совместимости ===

CompanyStats = CompanyStatistics  # Статистика компании
CompanyWithStats = CompanyDetailed  # Компания со статистикой
CompanyTypeEnum = CompanyType  # Enum типа компании
CompanyStatusEnum = CompanyStatus  # Enum статуса компании
