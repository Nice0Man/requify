"""
Схемы для модели UserProfile.
Следует принципам Feature-Sliced Design (FSD) и использует базовые классы.
"""

from typing import Optional, List, Dict
from datetime import datetime
import re

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    TimestampedBase,
    FieldLimits,
    StandardDescriptions,
)
from sqlmodel import Field
from pydantic import field_validator, HttpUrl


class UserProfileBase(BaseSchema):
    """Базовая схема для профиля пользователя"""

    # Персональная информация
    first_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Имя пользователя"
    )
    last_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Фамилия пользователя",
    )
    middle_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Отчество пользователя",
    )
    display_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Отображаемое имя"
    )

    # Контактная информация
    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Номер телефона"
    )
    phone_verified: bool = Field(False, description="Подтвержден ли телефон")

    # Профессиональная информация
    position: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Должность"
    )
    department: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Отдел"
    )
    employee_id: Optional[str] = Field(
        None, max_length=FieldLimits.CODE_MAX, description="Табельный номер сотрудника"
    )
    hire_date: Optional[datetime] = Field(None, description="Дата трудоустройства")

    # Дополнительная информация
    bio: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Краткая биография"
    )
    avatar_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL аватара"
    )

    # Локализация
    timezone: str = Field(
        "Europe/Moscow", max_length=FieldLimits.CODE_MAX, description="Часовой пояс"
    )
    language: str = Field(
        "ru", max_length=FieldLimits.CODE_MAX, description="Язык интерфейса"
    )

    @field_validator("first_name", "last_name", "middle_name")
    @classmethod
    def validate_names(cls, v):
        if v and len(v.strip()) < 1:
            raise ValueError("Name must be at least 1 character long")
        if v:
            return v.strip()
        return v

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Display name must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v:
            # Простая валидация телефона
            phone_clean = re.sub(r"[^\d+]", "", v)
            if len(phone_clean) < 10:
                raise ValueError("Phone number must be at least 10 digits")
            return phone_clean
        return v

    @field_validator("position", "department")
    @classmethod
    def validate_work_fields(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Work field must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v):
        if v and len(v.strip()) < 1:
            raise ValueError("Employee ID cannot be empty")
        if v:
            return v.strip()
        return v

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v):
        if v and len(v) > FieldLimits.TEXT_MAX:
            raise ValueError(f"Bio must be less than {FieldLimits.TEXT_MAX} characters")
        return v

    @field_validator("timezone")
    @classmethod
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
    @classmethod
    def validate_language(cls, v):
        allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v


class UserProfileCreate(CreateSchema, UserProfileBase):
    """Схема для создания профиля пользователя"""

    pass


class UserProfileUpdate(UpdateSchema):
    """Схема для обновления профиля пользователя"""

    # Все поля опциональны для обновления
    first_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Имя пользователя"
    )
    last_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Фамилия пользователя",
    )
    middle_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Отчество пользователя",
    )
    display_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Отображаемое имя"
    )

    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Номер телефона"
    )
    phone_verified: Optional[bool] = Field(None, description="Подтвержден ли телефон")

    position: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Должность"
    )
    department: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Отдел"
    )
    employee_id: Optional[str] = Field(
        None, max_length=FieldLimits.CODE_MAX, description="Табельный номер сотрудника"
    )
    hire_date: Optional[datetime] = Field(None, description="Дата трудоустройства")

    bio: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Краткая биография"
    )
    avatar_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL аватара"
    )

    timezone: Optional[str] = Field(
        None, max_length=FieldLimits.CODE_MAX, description="Часовой пояс"
    )
    language: Optional[str] = Field(
        None, max_length=FieldLimits.CODE_MAX, description="Язык интерфейса"
    )

    # Применяем те же валидаторы
    @field_validator("first_name", "last_name", "middle_name")
    @classmethod
    def validate_names(cls, v):
        if v is not None and len(v.strip()) < 1:
            raise ValueError("Name must be at least 1 character long")
        if v:
            return v.strip()
        return v

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Display name must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            phone_clean = re.sub(r"[^\d+]", "", v)
            if len(phone_clean) < 10:
                raise ValueError("Phone number must be at least 10 digits")
            return phone_clean
        return v

    @field_validator("position", "department")
    @classmethod
    def validate_work_fields(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Work field must be at least 2 characters long")
        if v:
            return v.strip()
        return v

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v):
        if v is not None and len(v) > FieldLimits.TEXT_MAX:
            raise ValueError(f"Bio must be less than {FieldLimits.TEXT_MAX} characters")
        return v

    @field_validator("timezone")
    @classmethod
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
    @classmethod
    def validate_language(cls, v):
        if v is not None:
            allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
            if v not in allowed_languages:
                raise ValueError(
                    f"Language must be one of: {', '.join(allowed_languages)}"
                )
        return v


class UserProfileInDB(TimestampedBase, UserProfileBase):
    """Схема для данных из базы данных"""

    id: int = Field(description=StandardDescriptions.ID)
    user_id: int = Field(description=StandardDescriptions.USER_ID)
    profile_completed: bool = Field(False, description="Заполнен ли профиль полностью")
    profile_completion_percentage: int = Field(
        0, ge=0, le=100, description="Процент заполненности профиля"
    )


class UserProfileResponse(ResponseSchema):
    """Схема для ответа API"""

    # Поля из UserProfileBase
    first_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Имя пользователя"
    )
    last_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Фамилия пользователя",
    )
    middle_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Отчество пользователя",
    )
    display_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Отображаемое имя"
    )
    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Номер телефона"
    )
    phone_verified: bool = Field(False, description="Подтвержден ли телефон")
    position: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Должность"
    )
    department: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Отдел"
    )
    employee_id: Optional[str] = Field(
        None, max_length=FieldLimits.CODE_MAX, description="Табельный номер сотрудника"
    )
    hire_date: Optional[datetime] = Field(None, description="Дата трудоустройства")
    bio: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Краткая биография"
    )
    avatar_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL аватара"
    )
    timezone: str = Field(
        "Europe/Moscow", max_length=FieldLimits.CODE_MAX, description="Часовой пояс"
    )
    language: str = Field(
        "ru", max_length=FieldLimits.CODE_MAX, description="Язык интерфейса"
    )

    # Поля из UserProfileInDB
    user_id: int = Field(description=StandardDescriptions.USER_ID)
    profile_completed: bool = Field(False, description="Заполнен ли профиль полностью")
    profile_completion_percentage: int = Field(
        0, ge=0, le=100, description="Процент заполненности профиля"
    )

    # Добавляем вычисляемые поля
    full_name: Optional[str] = Field(None, description="Полное имя (ФИО)")
    short_name: Optional[str] = Field(None, description="Краткое имя (Фамилия И.О.)")
    avatar_or_default: Optional[str] = Field(
        None, description="URL аватара или дефолтного изображения"
    )


class UserProfilePublic(BaseSchema):
    """Публичная схема профиля (для других пользователей)"""

    id: int = Field(description=StandardDescriptions.ID)
    user_id: int = Field(description=StandardDescriptions.USER_ID)
    display_name: Optional[str] = Field(None, description="Отображаемое имя")
    first_name: Optional[str] = Field(None, description="Имя")
    last_name: Optional[str] = Field(None, description="Фамилия")
    position: Optional[str] = Field(None, description="Должность")
    department: Optional[str] = Field(None, description="Отдел")
    bio: Optional[str] = Field(None, description="Краткая биография")
    avatar_url: Optional[str] = Field(None, description="URL аватара")

    # Вычисляемые поля
    full_name: Optional[str] = Field(None, description="Полное имя")
    short_name: Optional[str] = Field(None, description="Краткое имя")
    avatar_or_default: Optional[str] = Field(
        None, description="URL аватара или дефолтного"
    )


class UserProfileSummary(BaseSchema):
    """Краткая схема профиля для списков"""

    user_id: int = Field(description=StandardDescriptions.USER_ID)
    display_name: Optional[str] = Field(None, description="Отображаемое имя")
    full_name: Optional[str] = Field(None, description="Полное имя")
    short_name: Optional[str] = Field(None, description="Краткое имя")
    position: Optional[str] = Field(None, description="Должность")
    department: Optional[str] = Field(None, description="Отдел")
    avatar_or_default: Optional[str] = Field(None, description="URL аватара")
    profile_completion_percentage: int = Field(
        ge=0, le=100, description="Процент заполненности профиля"
    )


class UserProfileCompletion(BaseSchema):
    """Схема для статуса заполненности профиля"""

    profile_completed: bool = Field(description="Заполнен ли профиль полностью")
    profile_completion_percentage: int = Field(
        ge=0, le=100, description="Процент заполненности профиля"
    )
    missing_fields: List[str] = Field(
        default_factory=list, description="Список незаполненных полей"
    )
    recommendations: List[str] = Field(
        default_factory=list, description="Рекомендации по заполнению"
    )


class UserProfileStats(BaseSchema):
    """Схема для статистики профилей"""

    total_profiles: int = Field(ge=0, description="Общее количество профилей")
    completed_profiles: int = Field(ge=0, description="Количество заполненных профилей")
    completion_rate: float = Field(
        ge=0, le=1, description="Процент заполненных профилей"
    )
    average_completion_percentage: float = Field(
        ge=0, le=100, description="Средний процент заполненности"
    )
    most_common_positions: List[str] = Field(
        default_factory=list, description="Наиболее частые должности"
    )
    most_common_departments: List[str] = Field(
        default_factory=list, description="Наиболее частые отделы"
    )
    language_distribution: Dict[str, int] = Field(
        default_factory=dict, description="Распределение по языкам"
    )
    timezone_distribution: Dict[str, int] = Field(
        default_factory=dict, description="Распределение по часовым поясам"
    )


class ContactInfo(BaseSchema):
    """Схема для контактной информации"""

    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Номер телефона"
    )
    phone_verified: bool = Field(False, description="Подтвержден ли телефон")


class WorkInfo(BaseSchema):
    """Схема для рабочей информации"""

    position: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Должность"
    )
    department: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Отдел"
    )
    employee_id: Optional[str] = Field(
        None, max_length=FieldLimits.CODE_MAX, description="Табельный номер"
    )
    hire_date: Optional[datetime] = Field(None, description="Дата трудоустройства")


class PersonalInfo(BaseSchema):
    """Схема для персональной информации"""

    first_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Имя"
    )
    last_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Фамилия"
    )
    middle_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Отчество"
    )
    display_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Отображаемое имя"
    )
    bio: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Краткая биография"
    )


class LocalizationSettings(BaseSchema):
    """Схема для настроек локализации"""

    timezone: str = Field(
        "Europe/Moscow", max_length=FieldLimits.CODE_MAX, description="Часовой пояс"
    )
    language: str = Field(
        "ru", max_length=FieldLimits.CODE_MAX, description="Язык интерфейса"
    )

    @field_validator("timezone")
    @classmethod
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
    @classmethod
    def validate_language(cls, v):
        allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v


class ProfileValidation(BaseSchema):
    """Схема для валидации профиля"""

    is_valid: bool = Field(description="Валиден ли профиль")
    errors: List[str] = Field(
        default_factory=list, description="Список ошибок валидации"
    )
    warnings: List[str] = Field(
        default_factory=list, description="Список предупреждений"
    )
    completion_suggestions: List[str] = Field(
        default_factory=list, description="Предложения по заполнению профиля"
    )
