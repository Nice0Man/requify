"""
Схемы для модели UserProfile.
"""

from typing import Optional, List, Dict
from pydantic import BaseModel, field_validator, HttpUrl
from datetime import datetime
import re


class UserProfileBase(BaseModel):
    """Базовая схема для профиля пользователя"""

    # Персональная информация
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    display_name: Optional[str] = None

    # Контактная информация
    phone: Optional[str] = None
    phone_verified: bool = False

    # Профессиональная информация
    position: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    hire_date: Optional[datetime] = None

    # Дополнительная информация
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    # Локализация
    timezone: str = "Europe/Moscow"
    language: str = "ru"

    @field_validator("first_name", "last_name", "middle_name")
    def validate_names(cls, v):
        if v and len(v.strip()) < 1:
            raise ValueError("Name must be at least 1 character long")
        if v:
            return v.strip()
        return v

    @field_validator("display_name")
    def validate_display_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Display name must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("phone")
    def validate_phone(cls, v):
        if v:
            # Простая валидация телефона
            phone_clean = re.sub(r"[^\d+]", "", v)
            if len(phone_clean) < 10:
                raise ValueError("Phone number must be at least 10 digits")
            return phone_clean
        return v

    @field_validator("position", "department")
    def validate_work_fields(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Work field must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("employee_id")
    def validate_employee_id(cls, v):
        if v and len(v.strip()) < 1:
            raise ValueError("Employee ID cannot be empty")
        if v:
            return v.strip()
        return v

    @field_validator("bio")
    def validate_bio(cls, v):
        if v and len(v) > 1000:
            raise ValueError("Bio must be less than 1000 characters")
        return v

    @field_validator("timezone")
    def validate_timezone(cls, v):
        # Список основных часовых поясов
        valid_timezones = [
            "Europe/Moscow",
            "Europe/London",
            "Europe/Berlin",
            "America/New_York",
            "America/Los_Angeles",
            "Asia/Tokyo",
            "Asia/Shanghai",
            "Australia/Sydney",
            "UTC",
        ]
        if v not in valid_timezones:
            raise ValueError(f"Timezone must be one of: {', '.join(valid_timezones)}")
        return v

    @field_validator("language")
    def validate_language(cls, v):
        allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v


class UserProfileCreate(UserProfileBase):
    """Схема для создания профиля пользователя"""

    pass


class UserProfileUpdate(BaseModel):
    """Схема для обновления профиля пользователя"""

    # Все поля опциональны для обновления
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    display_name: Optional[str] = None

    phone: Optional[str] = None
    phone_verified: Optional[bool] = None

    position: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    hire_date: Optional[datetime] = None

    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    timezone: Optional[str] = None
    language: Optional[str] = None

    # Применяем те же валидаторы
    @field_validator("first_name", "last_name", "middle_name")
    def validate_names(cls, v):
        if v is not None and len(v.strip()) < 1:
            raise ValueError("Name must be at least 1 character long")
        if v:
            return v.strip()
        return v

    @field_validator("display_name")
    def validate_display_name(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Display name must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("phone")
    def validate_phone(cls, v):
        if v is not None:
            phone_clean = re.sub(r"[^\d+]", "", v)
            if len(phone_clean) < 10:
                raise ValueError("Phone number must be at least 10 digits")
            return phone_clean
        return v

    @field_validator("position", "department")
    def validate_work_fields(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Work field must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("bio")
    def validate_bio(cls, v):
        if v is not None and len(v) > 1000:
            raise ValueError("Bio must be less than 1000 characters")
        return v

    @field_validator("timezone")
    def validate_timezone(cls, v):
        if v is not None:
            valid_timezones = [
                "Europe/Moscow",
                "Europe/London",
                "Europe/Berlin",
                "America/New_York",
                "America/Los_Angeles",
                "Asia/Tokyo",
                "Asia/Shanghai",
                "Australia/Sydney",
                "UTC",
            ]
            if v not in valid_timezones:
                raise ValueError(
                    f"Timezone must be one of: {', '.join(valid_timezones)}"
                )
        return v

    @field_validator("language")
    def validate_language(cls, v):
        if v is not None:
            allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
            if v not in allowed_languages:
                raise ValueError(
                    f"Language must be one of: {', '.join(allowed_languages)}"
                )
        return v


class UserProfileInDB(UserProfileBase):
    """Схема для данных из базы данных"""

    id: int
    user_id: int
    profile_completed: bool
    profile_completion_percentage: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(UserProfileInDB):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    full_name: Optional[str] = None
    short_name: Optional[str] = None
    avatar_or_default: Optional[str] = None


class UserProfilePublic(BaseModel):
    """Публичная схема профиля (для других пользователей)"""

    id: int
    user_id: int
    display_name: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    position: Optional[str]
    department: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]

    # Вычисляемые поля
    full_name: Optional[str] = None
    short_name: Optional[str] = None
    avatar_or_default: Optional[str] = None


class UserProfileSummary(BaseModel):
    """Краткая схема профиля для списков"""

    user_id: int
    display_name: Optional[str]
    full_name: Optional[str] = None
    short_name: Optional[str] = None
    position: Optional[str]
    department: Optional[str]
    avatar_or_default: Optional[str] = None
    profile_completion_percentage: int


class UserProfileCompletion(BaseModel):
    """Схема для статуса заполненности профиля"""

    profile_completed: bool
    profile_completion_percentage: int
    missing_fields: List[str] = []
    recommendations: List[str] = []


class UserProfileStats(BaseModel):
    """Схема для статистики профилей"""

    total_profiles: int
    completed_profiles: int
    completion_rate: float
    average_completion_percentage: float
    most_common_positions: List[str] = []
    most_common_departments: List[str] = []
    language_distribution: Dict[str, int] = {}
    timezone_distribution: Dict[str, int] = {}


class ContactInfo(BaseModel):
    """Схема для контактной информации"""

    phone: Optional[str] = None
    phone_verified: bool = False


class WorkInfo(BaseModel):
    """Схема для рабочей информации"""

    position: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    hire_date: Optional[datetime] = None


class PersonalInfo(BaseModel):
    """Схема для персональной информации"""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None


class LocalizationSettings(BaseModel):
    """Схема для настроек локализации"""

    timezone: str = "Europe/Moscow"
    language: str = "ru"

    @field_validator("timezone")
    def validate_timezone(cls, v):
        valid_timezones = [
            "Europe/Moscow",
            "Europe/London",
            "Europe/Berlin",
            "America/New_York",
            "America/Los_Angeles",
            "Asia/Tokyo",
            "Asia/Shanghai",
            "Australia/Sydney",
            "UTC",
        ]
        if v not in valid_timezones:
            raise ValueError(f"Timezone must be one of: {', '.join(valid_timezones)}")
        return v

    @field_validator("language")
    def validate_language(cls, v):
        allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v


class ProfileValidation(BaseModel):
    """Схема для валидации профиля"""

    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    completion_suggestions: List[str] = []
