"""
Схемы для модели CompanySubscription.
"""

from typing import Optional
from pydantic import BaseModel, field_validator
from datetime import datetime
from decimal import Decimal
from enum import Enum


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


class CompanySubscriptionBase(BaseModel):
    """Базовая схема для подписки компании"""

    # Основная информация о подписке
    plan: SubscriptionPlan
    status: SubscriptionStatus = SubscriptionStatus.TRIAL
    billing_period: BillingPeriod = BillingPeriod.MONTHLY

    # Даты
    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None

    # Финансовая информация
    monthly_price: Optional[Decimal] = None
    yearly_price: Optional[Decimal] = None
    currency: str = "USD"
    discount_percent: Optional[int] = None

    # Лимиты ресурсов
    max_users: Optional[int] = None
    max_projects: Optional[int] = None
    max_departments: Optional[int] = None
    max_teams: Optional[int] = None
    max_storage_gb: Optional[int] = None
    max_api_calls_per_month: Optional[int] = None
    max_integrations: Optional[int] = None

    # Возможности
    can_export_data: bool = False
    can_use_api: bool = False
    can_use_integrations: bool = False
    can_use_advanced_analytics: bool = False
    can_use_custom_branding: bool = False
    priority_support: bool = False

    # Автопродление
    auto_renew: bool = True
    payment_method_id: Optional[str] = None

    # Биллинговая информация
    billing_contact_email: Optional[str] = None
    invoice_prefix: Optional[str] = None
    tax_rate: Optional[Decimal] = None


class CompanySubscriptionCreate(CompanySubscriptionBase):
    """Схема для создания подписки"""

    @field_validator("max_users")
    def validate_max_users(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Max users must be positive")
        return v

    @field_validator("max_projects")
    def validate_max_projects(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Max projects must be positive")
        return v

    @field_validator("discount_percent")
    def validate_discount_percent(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Discount percent must be between 0 and 100")
        return v

    @field_validator("tax_rate")
    def validate_tax_rate(cls, v):
        if v is not None and (v < 0 or v > 1):
            raise ValueError("Tax rate must be between 0 and 1")
        return v


class CompanySubscriptionUpdate(BaseModel):
    """Схема для обновления подписки"""

    plan: Optional[SubscriptionPlan] = None
    status: Optional[SubscriptionStatus] = None
    billing_period: Optional[BillingPeriod] = None

    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None

    monthly_price: Optional[Decimal] = None
    yearly_price: Optional[Decimal] = None
    currency: Optional[str] = None
    discount_percent: Optional[int] = None

    max_users: Optional[int] = None
    max_projects: Optional[int] = None
    max_departments: Optional[int] = None
    max_teams: Optional[int] = None
    max_storage_gb: Optional[int] = None
    max_api_calls_per_month: Optional[int] = None
    max_integrations: Optional[int] = None

    can_export_data: Optional[bool] = None
    can_use_api: Optional[bool] = None
    can_use_integrations: Optional[bool] = None
    can_use_advanced_analytics: Optional[bool] = None
    can_use_custom_branding: Optional[bool] = None
    priority_support: Optional[bool] = None

    auto_renew: Optional[bool] = None
    payment_method_id: Optional[str] = None
    billing_contact_email: Optional[str] = None
    invoice_prefix: Optional[str] = None
    tax_rate: Optional[Decimal] = None


class CompanySubscriptionInDB(CompanySubscriptionBase):
    """Схема для данных из базы данных"""

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanySubscriptionResponse(CompanySubscriptionInDB):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    is_trial_active: Optional[bool] = None
    is_subscription_active: Optional[bool] = None
    days_until_trial_end: Optional[int] = None
    days_until_renewal: Optional[int] = None
    is_trial_expired: Optional[bool] = None
    current_price: Optional[Decimal] = None

    # Статистика использования
    current_user_count: Optional[int] = None
    current_project_count: Optional[int] = None
    current_department_count: Optional[int] = None
    current_team_count: Optional[int] = None
    storage_used_gb: Optional[float] = None
    api_calls_this_month: Optional[int] = None

    # Процент использования лимитов
    users_usage_percent: Optional[float] = None
    projects_usage_percent: Optional[float] = None
    storage_usage_percent: Optional[float] = None
    api_usage_percent: Optional[float] = None


class SubscriptionPlanDetails(BaseModel):
    """Детали плана подписки"""

    plan: SubscriptionPlan
    name: str
    description: str
    monthly_price: Decimal
    yearly_price: Decimal
    currency: str

    # Лимиты
    max_users: Optional[int]
    max_projects: Optional[int]
    max_departments: Optional[int]
    max_teams: Optional[int]
    max_storage_gb: Optional[int]
    max_api_calls_per_month: Optional[int]
    max_integrations: Optional[int]

    # Возможности
    features: list[str]
    can_export_data: bool
    can_use_api: bool
    can_use_integrations: bool
    can_use_advanced_analytics: bool
    can_use_custom_branding: bool
    priority_support: bool

    # Популярность
    is_popular: bool = False
    is_recommended: bool = False


class SubscriptionUsageStats(BaseModel):
    """Статистика использования подписки"""

    subscription_id: int
    company_id: int

    # Текущее использование
    current_users: int
    current_projects: int
    current_departments: int
    current_teams: int
    storage_used_gb: float
    api_calls_this_month: int
    integrations_count: int

    # Лимиты
    max_users: Optional[int]
    max_projects: Optional[int]
    max_departments: Optional[int]
    max_teams: Optional[int]
    max_storage_gb: Optional[int]
    max_api_calls_per_month: Optional[int]
    max_integrations: Optional[int]

    # Процент использования
    users_usage_percent: float
    projects_usage_percent: float
    departments_usage_percent: float
    teams_usage_percent: float
    storage_usage_percent: float
    api_usage_percent: float

    # Предупреждения
    warnings: list[str] = []
    is_over_limit: bool = False


class SubscriptionBillingInfo(BaseModel):
    """Информация о биллинге подписки"""

    subscription_id: int
    company_id: int

    # Текущий план
    plan: SubscriptionPlan
    billing_period: BillingPeriod
    status: SubscriptionStatus

    # Даты
    subscription_start_date: datetime
    subscription_end_date: Optional[datetime]
    next_billing_date: Optional[datetime]

    # Финансы
    current_price: Decimal
    currency: str
    discount_percent: Optional[int]
    tax_rate: Optional[Decimal]

    # История биллинга
    last_payment_date: Optional[datetime] = None
    last_payment_amount: Optional[Decimal] = None
    total_paid: Optional[Decimal] = None

    # Автопродление
    auto_renew: bool
    payment_method_id: Optional[str]
    billing_contact_email: Optional[str]
