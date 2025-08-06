"""
Схемы для модели CompanySubscription.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional, List
from sqlmodel import Field
from pydantic import field_validator
from datetime import datetime
from decimal import Decimal
from enum import Enum

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    CompanyRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class SubscriptionStatus(str, Enum):
    """Статусы подписки"""

    TRIAL = "trial"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"


class SubscriptionPlan(str, Enum):
    """Планы подписки"""

    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    UNLIMITED = "unlimited"


class BillingPeriod(str, Enum):
    """Периоды биллинга"""

    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"


class CompanySubscriptionBase(BaseSchema, ValidationMixin):
    """Базовая схема для подписки компании"""

    # Основная информация о подписке
    plan: SubscriptionPlan = Field(..., description="План подписки")
    status: SubscriptionStatus = Field(
        default=SubscriptionStatus.TRIAL, description="Статус подписки"
    )
    billing_period: BillingPeriod = Field(
        default=BillingPeriod.MONTHLY, description="Период биллинга"
    )

    # Даты
    trial_start_date: Optional[datetime] = Field(
        None, description="Начало пробного периода"
    )
    trial_end_date: Optional[datetime] = Field(
        None, description="Окончание пробного периода"
    )
    subscription_start_date: Optional[datetime] = Field(
        None, description="Начало подписки"
    )
    subscription_end_date: Optional[datetime] = Field(
        None, description="Окончание подписки"
    )
    next_billing_date: Optional[datetime] = Field(
        None, description="Следующее списание"
    )

    # Финансовая информация
    monthly_price: Optional[Decimal] = Field(None, ge=0, description="Месячная цена")
    yearly_price: Optional[Decimal] = Field(None, ge=0, description="Годовая цена")
    currency: str = Field("USD", max_length=3, description="Валюта")
    discount_percent: Optional[int] = Field(
        None, ge=0, le=100, description="Процент скидки"
    )

    # Лимиты ресурсов
    max_users: Optional[int] = Field(None, ge=0, description="Максимум пользователей")
    max_projects: Optional[int] = Field(None, ge=0, description="Максимум проектов")
    max_departments: Optional[int] = Field(
        None, ge=0, description="Максимум департаментов"
    )
    max_teams: Optional[int] = Field(None, ge=0, description="Максимум команд")
    max_storage_gb: Optional[int] = Field(
        None, ge=0, description="Максимум хранилища (ГБ)"
    )
    max_api_calls_per_month: Optional[int] = Field(
        None, ge=0, description="Максимум API вызовов в месяц"
    )
    max_integrations: Optional[int] = Field(
        None, ge=0, description="Максимум интеграций"
    )

    # Возможности
    can_export_data: bool = Field(False, description="Может экспортировать данные")
    can_use_api: bool = Field(False, description="Может использовать API")
    can_use_integrations: bool = Field(
        False, description="Может использовать интеграции"
    )
    can_use_advanced_analytics: bool = Field(
        False, description="Может использовать аналитику"
    )
    can_use_custom_branding: bool = Field(
        False, description="Может использовать брендинг"
    )
    priority_support: bool = Field(False, description="Приоритетная поддержка")

    # Автопродление
    auto_renew: bool = Field(True, description="Автопродление")
    payment_method_id: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="ID метода оплаты"
    )

    # Биллинговая информация
    billing_contact_email: Optional[str] = Field(
        None, max_length=FieldLimits.EMAIL_MAX, description="Email для биллинга"
    )
    invoice_prefix: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Префикс счетов"
    )
    tax_rate: Optional[Decimal] = Field(
        None, ge=0, le=1, description="Налоговая ставка"
    )


class CompanySubscriptionCreate(CreateSchema, CompanySubscriptionBase):
    """Схема для создания подписки"""

    pass


class CompanySubscriptionUpdate(UpdateSchema):
    """Схема для обновления подписки"""

    plan: Optional[SubscriptionPlan] = None
    status: Optional[SubscriptionStatus] = None
    billing_period: Optional[BillingPeriod] = None

    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None

    monthly_price: Optional[Decimal] = Field(None, ge=0)
    yearly_price: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    discount_percent: Optional[int] = Field(None, ge=0, le=100)

    max_users: Optional[int] = Field(None, ge=0)
    max_projects: Optional[int] = Field(None, ge=0)
    max_departments: Optional[int] = Field(None, ge=0)
    max_teams: Optional[int] = Field(None, ge=0)
    max_storage_gb: Optional[int] = Field(None, ge=0)
    max_api_calls_per_month: Optional[int] = Field(None, ge=0)
    max_integrations: Optional[int] = Field(None, ge=0)

    can_export_data: Optional[bool] = None
    can_use_api: Optional[bool] = None
    can_use_integrations: Optional[bool] = None
    can_use_advanced_analytics: Optional[bool] = None
    can_use_custom_branding: Optional[bool] = None
    priority_support: Optional[bool] = None

    auto_renew: Optional[bool] = None
    payment_method_id: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX
    )
    billing_contact_email: Optional[str] = Field(None, max_length=FieldLimits.EMAIL_MAX)
    invoice_prefix: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=1)


class CompanySubscriptionResponse(
    ResponseSchema, CompanySubscriptionBase, CompanyRelatedSchema
):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    is_trial_active: Optional[bool] = Field(
        None, description="Активен ли пробный период"
    )
    is_subscription_active: Optional[bool] = Field(
        None, description="Активна ли подписка"
    )
    days_until_trial_end: Optional[int] = Field(
        None, description="Дней до окончания пробного периода"
    )
    days_until_renewal: Optional[int] = Field(None, description="Дней до продления")
    is_trial_expired: Optional[bool] = Field(
        None, description="Истек ли пробный период"
    )
    current_price: Optional[Decimal] = Field(None, description="Текущая цена")

    # Статистика использования
    current_user_count: Optional[int] = Field(
        None, ge=0, description="Текущее количество пользователей"
    )
    current_project_count: Optional[int] = Field(
        None, ge=0, description="Текущее количество проектов"
    )
    current_department_count: Optional[int] = Field(
        None, ge=0, description="Текущее количество департаментов"
    )
    current_team_count: Optional[int] = Field(
        None, ge=0, description="Текущее количество команд"
    )
    storage_used_gb: Optional[float] = Field(
        None, ge=0, description="Использовано хранилища (ГБ)"
    )
    api_calls_this_month: Optional[int] = Field(
        None, ge=0, description="API вызовов в этом месяце"
    )

    # Процент использования лимитов
    users_usage_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Процент использования пользователей"
    )
    projects_usage_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Процент использования проектов"
    )
    storage_usage_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Процент использования хранилища"
    )
    api_usage_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Процент использования API"
    )


class SubscriptionPlanDetails(BaseSchema):
    """Детали плана подписки"""

    plan: SubscriptionPlan = Field(..., description="План подписки")
    name: str = Field(
        ...,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME,
    )
    description: str = Field(
        ...,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    monthly_price: Decimal = Field(..., ge=0, description="Месячная цена")
    yearly_price: Decimal = Field(..., ge=0, description="Годовая цена")
    currency: str = Field(..., max_length=3, description="Валюта")

    # Лимиты
    max_users: Optional[int] = Field(None, ge=0, description="Максимум пользователей")
    max_projects: Optional[int] = Field(None, ge=0, description="Максимум проектов")
    max_departments: Optional[int] = Field(
        None, ge=0, description="Максимум департаментов"
    )
    max_teams: Optional[int] = Field(None, ge=0, description="Максимум команд")
    max_storage_gb: Optional[int] = Field(
        None, ge=0, description="Максимум хранилища (ГБ)"
    )
    max_api_calls_per_month: Optional[int] = Field(
        None, ge=0, description="Максимум API вызовов в месяц"
    )
    max_integrations: Optional[int] = Field(
        None, ge=0, description="Максимум интеграций"
    )

    # Возможности
    features: List[str] = Field(default_factory=list, description="Список возможностей")
    can_export_data: bool = Field(False, description="Может экспортировать данные")
    can_use_api: bool = Field(False, description="Может использовать API")
    can_use_integrations: bool = Field(
        False, description="Может использовать интеграции"
    )
    can_use_advanced_analytics: bool = Field(
        False, description="Может использовать аналитику"
    )
    can_use_custom_branding: bool = Field(
        False, description="Может использовать брендинг"
    )
    priority_support: bool = Field(False, description="Приоритетная поддержка")

    # Популярность
    is_popular: bool = Field(False, description="Популярный план")
    is_recommended: bool = Field(False, description="Рекомендуемый план")


class SubscriptionUsageStats(BaseSchema):
    """Статистика использования подписки"""

    subscription_id: int = Field(..., gt=0, description="ID подписки")
    company_id: int = Field(..., gt=0, description=StandardDescriptions.COMPANY_ID)

    # Текущее использование
    current_users: int = Field(0, ge=0, description="Текущие пользователи")
    current_projects: int = Field(0, ge=0, description="Текущие проекты")
    current_departments: int = Field(0, ge=0, description="Текущие департаменты")
    current_teams: int = Field(0, ge=0, description="Текущие команды")
    storage_used_gb: float = Field(0.0, ge=0, description="Использовано хранилища (ГБ)")
    api_calls_this_month: int = Field(0, ge=0, description="API вызовов в этом месяце")
    integrations_count: int = Field(0, ge=0, description="Количество интеграций")

    # Лимиты
    max_users: Optional[int] = Field(None, ge=0, description="Максимум пользователей")
    max_projects: Optional[int] = Field(None, ge=0, description="Максимум проектов")
    max_departments: Optional[int] = Field(
        None, ge=0, description="Максимум департаментов"
    )
    max_teams: Optional[int] = Field(None, ge=0, description="Максимум команд")
    max_storage_gb: Optional[int] = Field(
        None, ge=0, description="Максимум хранилища (ГБ)"
    )
    max_api_calls_per_month: Optional[int] = Field(
        None, ge=0, description="Максимум API вызовов в месяц"
    )
    max_integrations: Optional[int] = Field(
        None, ge=0, description="Максимум интеграций"
    )

    # Процент использования
    users_usage_percent: float = Field(
        0.0, ge=0, le=100, description="Процент использования пользователей"
    )
    projects_usage_percent: float = Field(
        0.0, ge=0, le=100, description="Процент использования проектов"
    )
    departments_usage_percent: float = Field(
        0.0, ge=0, le=100, description="Процент использования департаментов"
    )
    teams_usage_percent: float = Field(
        0.0, ge=0, le=100, description="Процент использования команд"
    )
    storage_usage_percent: float = Field(
        0.0, ge=0, le=100, description="Процент использования хранилища"
    )
    api_usage_percent: float = Field(
        0.0, ge=0, le=100, description="Процент использования API"
    )

    # Предупреждения
    warnings: List[str] = Field(default_factory=list, description="Предупреждения")
    is_over_limit: bool = Field(False, description="Превышен лимит")


class SubscriptionBillingInfo(BaseSchema):
    """Информация о биллинге подписки"""

    subscription_id: int = Field(..., gt=0, description="ID подписки")
    company_id: int = Field(..., gt=0, description=StandardDescriptions.COMPANY_ID)

    # Текущий план
    plan: SubscriptionPlan = Field(..., description="План подписки")
    billing_period: BillingPeriod = Field(..., description="Период биллинга")
    status: SubscriptionStatus = Field(..., description="Статус подписки")

    # Даты
    subscription_start_date: datetime = Field(..., description="Начало подписки")
    subscription_end_date: Optional[datetime] = Field(
        None, description="Окончание подписки"
    )
    next_billing_date: Optional[datetime] = Field(
        None, description="Следующее списание"
    )

    # Финансы
    current_price: Decimal = Field(..., ge=0, description="Текущая цена")
    currency: str = Field(..., max_length=3, description="Валюта")
    discount_percent: Optional[int] = Field(
        None, ge=0, le=100, description="Процент скидки"
    )
    tax_rate: Optional[Decimal] = Field(
        None, ge=0, le=1, description="Налоговая ставка"
    )

    # История биллинга
    last_payment_date: Optional[datetime] = Field(
        None, description="Дата последнего платежа"
    )
    last_payment_amount: Optional[Decimal] = Field(
        None, ge=0, description="Сумма последнего платежа"
    )
    total_paid: Optional[Decimal] = Field(None, ge=0, description="Общая сумма оплат")

    # Автопродление
    auto_renew: bool = Field(True, description="Автопродление")
    payment_method_id: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="ID метода оплаты"
    )
    billing_contact_email: Optional[str] = Field(
        None, max_length=FieldLimits.EMAIL_MAX, description="Email для биллинга"
    )
