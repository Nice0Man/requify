"""
Схемы для работы с компаниями согласно Feature-Sliced Design.
Базируются на декомпозированной модели Company (4NF).
"""

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict

if TYPE_CHECKING:
    from ..models.company import CompanyType, CompanyStatus


class CompanyTypeEnum(str, Enum):
    """Типы компаний для API"""

    STARTUP = "startup"
    SMALL_BUSINESS = "small_business"
    MEDIUM_BUSINESS = "medium_business"
    ENTERPRISE = "enterprise"
    NON_PROFIT = "non_profit"
    GOVERNMENT = "government"
    EDUCATIONAL = "educational"


class CompanyStatusEnum(str, Enum):
    """Статусы компаний для API"""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
    TRIAL = "trial"
    ARCHIVED = "archived"


# =============================================================================
# Base Schemas (Core Company Data)
# =============================================================================


class CompanyBase(BaseModel):
    """Базовая схема компании (атомарные данные)"""

    name: str = Field(..., min_length=3, max_length=200)
    slug: Optional[str] = Field(None, max_length=100)
    legal_name: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = Field(None, max_length=1000)
    type: CompanyTypeEnum = CompanyTypeEnum.SMALL_BUSINESS
    industry: Optional[str] = Field(None, max_length=100)
    size_category: Optional[str] = Field(None, max_length=50)
    employee_count: Optional[int] = Field(None, ge=0)
    status: CompanyStatusEnum = CompanyStatusEnum.TRIAL
    is_active: bool = True


class CompanyCreate(CompanyBase):
    """Схема создания компании"""

    name: str = Field(..., min_length=3, max_length=200)

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v):
        if v is not None:
            import re

            if not re.match(r"^[a-z0-9-]+$", v):
                raise ValueError(
                    "Slug должен содержать только строчные буквы, цифры и дефисы"
                )
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError("Name must be at least 3 characters long")
        return v.strip()


class CompanyUpdate(BaseModel):
    """Схема обновления компании"""

    name: Optional[str] = Field(None, min_length=3, max_length=200)
    slug: Optional[str] = Field(None, max_length=100)
    legal_name: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = Field(None, max_length=1000)
    type: Optional[CompanyTypeEnum] = None
    industry: Optional[str] = Field(None, max_length=100)
    size_category: Optional[str] = Field(None, max_length=50)
    employee_count: Optional[int] = Field(None, ge=0)
    status: Optional[CompanyStatusEnum] = None
    is_active: Optional[bool] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if v is not None and len(v.strip()) < 3:
            raise ValueError("Name must be at least 3 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v):
        if v is not None:
            import re

            if not re.match(r"^[a-z0-9-]+$", v):
                raise ValueError(
                    "Slug должен содержать только строчные буквы, цифры и дефисы"
                )
        return v


# =============================================================================
# Nested Schemas for Decomposed Data (Simplified Response Versions)
# =============================================================================


class CompanyContactResponse(BaseModel):
    """Схема контактной информации компании"""

    model_config = ConfigDict(from_attributes=True)

    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None


class CompanySubscriptionResponse(BaseModel):
    """Схема подписки компании"""

    model_config = ConfigDict(from_attributes=True)

    plan: Optional[str] = None
    status: Optional[str] = None
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    max_users: Optional[int] = None
    max_projects: Optional[int] = None
    max_departments: Optional[int] = None


class CompanySettingsResponse(BaseModel):
    """Схема настроек компании"""

    model_config = ConfigDict(from_attributes=True)

    domain: Optional[str] = None
    allow_domain_signup: bool = False
    enable_sso: bool = False
    require_mfa: bool = False
    enable_api_access: bool = False


class CompanyBrandingResponse(BaseModel):
    """Схема брендинга компании"""

    model_config = ConfigDict(from_attributes=True)

    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    custom_css: Optional[str] = None


# =============================================================================
# Full Response Schemas
# =============================================================================


class CompanyResponse(CompanyBase):
    """Полная схема компании для ответа"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

    # Вложенные данные (опционально)
    contact: Optional[CompanyContactResponse] = None
    subscription: Optional[CompanySubscriptionResponse] = None
    settings: Optional[CompanySettingsResponse] = None
    branding: Optional[CompanyBrandingResponse] = None

    # Computed properties
    current_user_count: Optional[int] = None
    current_project_count: Optional[int] = None
    current_department_count: Optional[int] = None
    is_trial_expired: Optional[bool] = None
    days_until_trial_end: Optional[int] = None


class CompanyListResponse(BaseModel):
    """Схема для списка компаний"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    type: CompanyTypeEnum
    status: CompanyStatusEnum
    is_active: bool
    created_at: datetime

    # Базовая статистика
    current_user_count: Optional[int] = None
    current_project_count: Optional[int] = None


class CompanyPublicResponse(BaseModel):
    """Публичная схема компании (ограниченная информация)"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    type: CompanyTypeEnum
    industry: Optional[str] = None
    is_active: bool


# =============================================================================
# Search and Filter Schemas
# =============================================================================


class CompanyFilter(BaseModel):
    """Схема фильтрации компаний"""

    name: Optional[str] = None
    type: Optional[CompanyTypeEnum] = None
    status: Optional[CompanyStatusEnum] = None
    industry: Optional[str] = None
    is_active: Optional[bool] = None
    min_employee_count: Optional[int] = Field(None, ge=0)
    max_employee_count: Optional[int] = Field(None, ge=0)


class CompanyStats(BaseModel):
    """Схема статистики компании"""

    total_users: int = 0
    total_projects: int = 0
    total_departments: int = 0
    active_projects: int = 0
    completed_projects: int = 0
    pending_requirements: int = 0
    active_releases: int = 0
    total_requirements: int = 0
    completed_requirements: int = 0
    in_progress_requirements: int = 0
    total_releases: int = 0
    completed_releases: int = 0
    total_test_cases: int = 0
    passed_test_cases: int = 0
    failed_test_cases: int = 0
    storage_used_mb: int = 0
    last_activity_date: Optional[datetime] = None

    # Информация о подписке
    subscription: Optional[CompanySubscriptionResponse] = None


class CompanyWithStats(CompanyResponse):
    """Схема компании с дополнительной статистикой"""

    model_config = ConfigDict(from_attributes=True)

    stats: CompanyStats


class CompanySearchRequest(BaseModel):
    """Схема для поискового запроса"""

    query: str = Field(..., min_length=2, max_length=100)
    type: Optional[CompanyTypeEnum] = None
    status: Optional[CompanyStatusEnum] = None
    industry: Optional[str] = None
    is_active: Optional[bool] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=100)


class CompanyValidation(BaseModel):
    """Схема для валидации данных компании"""

    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []


# =============================================================================
# Administrative Schemas
# =============================================================================


class CompanyStatusUpdate(BaseModel):
    """Схема для обновления статуса компании"""

    status: CompanyStatusEnum
    reason: Optional[str] = Field(None, max_length=500)


class CompanyActivation(BaseModel):
    """Схема для активации/деактивации компании"""

    is_active: bool
    reason: Optional[str] = Field(None, max_length=500)


class CompanySummary(BaseModel):
    """Краткая сводка по компании"""

    id: int
    name: str
    slug: str
    type: CompanyTypeEnum
    status: CompanyStatusEnum
    user_count: int
    project_count: int
    created_at: datetime
    last_activity: Optional[datetime] = None
