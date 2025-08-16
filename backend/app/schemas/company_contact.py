"""
Схемы для модели CompanyContact.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional, List
from sqlmodel import Field
from pydantic import EmailStr, field_validator
from datetime import datetime

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


class CompanyContactBase(BaseSchema, ValidationMixin):
    """Базовая схема для контактных данных компании"""

    # Основные контакты
    primary_email: Optional[EmailStr] = Field(None, description="Основной email")
    secondary_email: Optional[EmailStr] = Field(
        None, description="Дополнительный email"
    )
    support_email: Optional[EmailStr] = Field(None, description="Email поддержки")
    billing_email: Optional[EmailStr] = Field(None, description="Email для биллинга")

    # Телефоны
    primary_phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Основной телефон"
    )
    secondary_phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Дополнительный телефон"
    )
    mobile_phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Мобильный телефон"
    )
    fax: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Факс"
    )

    # Адрес
    address_line_1: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Адрес строка 1"
    )
    address_line_2: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Адрес строка 2"
    )
    city: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Город"
    )
    state_province: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Область/штат"
    )
    postal_code: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Почтовый индекс"
    )
    country: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Страна"
    )
    country_code: Optional[str] = Field(None, max_length=3, description="Код страны")

    # Веб-присутствие
    website: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="Веб-сайт"
    )
    linkedin_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="LinkedIn URL"
    )
    twitter_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="Twitter URL"
    )
    facebook_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="Facebook URL"
    )

    # Временная зона и рабочие часы
    timezone: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Часовой пояс"
    )
    business_hours_start: Optional[str] = Field(
        None, max_length=10, description="Начало рабочего дня"
    )
    business_hours_end: Optional[str] = Field(
        None, max_length=10, description="Конец рабочего дня"
    )
    business_days: Optional[List[str]] = Field(None, description="Рабочие дни")

    @field_validator("business_days")
    def validate_business_days(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v.split(",")
        return v


class CompanyContactCreate(CreateSchema, CompanyContactBase):
    """Схема для создания контактных данных компании"""

    pass


class CompanyContactUpdate(UpdateSchema):
    """Схема для обновления контактных данных компании"""

    # Все поля опциональны для Update
    primary_email: Optional[EmailStr] = None
    secondary_email: Optional[EmailStr] = None
    support_email: Optional[EmailStr] = None
    billing_email: Optional[EmailStr] = None

    primary_phone: Optional[str] = Field(None, max_length=FieldLimits.PHONE_MAX)
    secondary_phone: Optional[str] = Field(None, max_length=FieldLimits.PHONE_MAX)
    mobile_phone: Optional[str] = Field(None, max_length=FieldLimits.PHONE_MAX)
    fax: Optional[str] = Field(None, max_length=FieldLimits.PHONE_MAX)

    address_line_1: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX
    )
    address_line_2: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX
    )
    city: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    state_province: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    postal_code: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    country: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    country_code: Optional[str] = Field(None, max_length=3)

    website: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    linkedin_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    twitter_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    facebook_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)

    timezone: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    business_hours_start: Optional[str] = Field(None, max_length=10)
    business_hours_end: Optional[str] = Field(None, max_length=10)
    business_days: Optional[List[str]] = None


class CompanyContactResponse(ResponseSchema, CompanyContactBase, CompanyRelatedSchema):
    """Схема для ответа API"""

    pass
