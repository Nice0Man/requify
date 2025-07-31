"""
Схемы для модели CompanyContact.
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class CompanyContactBase(BaseModel):
    """Базовая схема для контактных данных компании"""

    # Основные контакты
    primary_email: Optional[EmailStr] = None
    secondary_email: Optional[EmailStr] = None
    support_email: Optional[EmailStr] = None
    billing_email: Optional[EmailStr] = None

    # Телефоны
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    mobile_phone: Optional[str] = None
    fax: Optional[str] = None

    # Адрес
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None

    # Веб-присутствие
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None

    # Временная зона и рабочие часы
    timezone: Optional[str] = None
    business_hours_start: Optional[str] = None
    business_hours_end: Optional[str] = None
    business_days: Optional[List[str]] = None

    @field_validator("business_days")
    def validate_business_days(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v.split(",")
        return v


class CompanyContactCreate(CompanyContactBase):
    """Схема для создания контактных данных компании"""

    pass


class CompanyContactUpdate(BaseModel):
    """Схема для обновления контактных данных компании"""

    # Основные контакты
    primary_email: Optional[EmailStr] = None
    secondary_email: Optional[EmailStr] = None
    support_email: Optional[EmailStr] = None
    billing_email: Optional[EmailStr] = None

    # Телефоны
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    mobile_phone: Optional[str] = None
    fax: Optional[str] = None

    # Адрес
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None

    # Веб-присутствие
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None

    # Временная зона и рабочие часы
    timezone: Optional[str] = None
    business_hours_start: Optional[str] = None
    business_hours_end: Optional[str] = None
    business_days: Optional[List[str]] = None


class CompanyContactInDB(CompanyContactBase):
    """Схема для данных из базы данных"""

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyContactResponse(CompanyContactInDB):
    """Схема для ответа API"""

    pass
