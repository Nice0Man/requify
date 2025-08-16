"""
Схемы для модели RequirementType (типы требований).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
<<<<<<< HEAD
from typing import Optional

from pydantic import BaseModel, Field, field_validator
=======
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import field_validator
from enum import Enum

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
from .common import StatusEnum
>>>>>>> dev-backend


# === Перечисления ===


class RequirementTypeEnum(str, Enum):
    """Стандартные типы требований"""

    FUNCTIONAL = "functional"
    NON_FUNCTIONAL = "non_functional"
    BUSINESS = "business"
    TECHNICAL = "technical"
    LEGAL = "legal"
    PERFORMANCE = "performance"
    SECURITY = "security"
    USABILITY = "usability"
    INTERFACE = "interface"
    DATA = "data"
    CONSTRAINT = "constraint"


# === Базовые схемы ===


class RequirementTypeBase(BaseSchema, ValidationMixin):
    """
    Базовая схема типа требования.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " типа требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " типа требования",
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия типа требования"""
        v = cls.validate_non_empty_string(v, "name")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Requirement type name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания типа требования"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.LONG_STRING_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.LONG_STRING_MAX} characters"
                )
        return v


# === CRUD схемы ===


class RequirementTypeCreate(RequirementTypeBase, CreateSchema):
    """
    Схема для создания типа требования.
    Наследует все поля от базовой схемы.
    """

    pass


class RequirementTypeUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления типа требования.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " типа требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " типа требования",
    )
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "name")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Requirement type name contains forbidden characters: {forbidden_chars}"
                )
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания при обновлении"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.LONG_STRING_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.LONG_STRING_MAX} characters"
                )
        return v


class RequirementTypeResponse(RequirementTypeBase, ResponseSchema):
    """
    Схема ответа для типа требования.
    Включает все данные из БД включая id и временные метки.
    """

    pass


# === Списки и пагинация ===


class RequirementTypeListResponse(ListResponseSchema[RequirementTypeResponse]):
    """Список типов требований с пагинацией"""

    pass


# === Статистика ===


class RequirementTypeStatistics(StatisticsSchema):
    """
    Схема статистики типов требований.
    """

    total_types: int = Field(0, ge=0, description="Общее количество типов")
    active_types: int = Field(0, ge=0, description="Активных типов")
    inactive_types: int = Field(0, ge=0, description="Неактивных типов")

    most_used_types: List[Dict[str, Any]] = Field(
        default_factory=list, description="Самые используемые типы"
    )

    usage_by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Использование по типам"
    )


# === Поиск и фильтрация ===


class RequirementTypeFilter(BaseSchema):
    """
    Фильтр для типов требований.
    """

    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    name_contains: Optional[str] = Field(
        None, min_length=1, description="Поиск по содержанию в названии"
    )
    standard_types_only: Optional[bool] = Field(
        None, description="Только стандартные типы"
    )


# === Массовые операции ===


class RequirementTypeBulkCreate(BaseSchema):
    """
    Схема для массового создания типов требований.
    """

    types: List[RequirementTypeCreate] = Field(
        ..., min_length=1, max_length=50, description="Список типов для создания"
    )


class RequirementTypeBulkUpdate(BaseSchema):
    """
    Схема для массового обновления типов требований.
    """

    type_ids: List[int] = Field(..., min_length=1, description="Список ID типов")
    update_data: RequirementTypeUpdate = Field(..., description="Данные для обновления")


# === Константы и утилиты ===


class RequirementTypeConfig:
    """
    Конфигурация схем типов требований.
    """

    # Стандартные типы для инициализации
    STANDARD_TYPES = [
        {
            "name": "Functional",
            "description": "Функциональные требования к системе",
            "is_active": True,
        },
        {
            "name": "Non-Functional",
            "description": "Нефункциональные требования к системе",
            "is_active": True,
        },
        {"name": "Business", "description": "Бизнес-требования", "is_active": True},
        {
            "name": "Technical",
            "description": "Технические требования",
            "is_active": True,
        },
        {
            "name": "Security",
            "description": "Требования безопасности",
            "is_active": True,
        },
        {
            "name": "Performance",
            "description": "Требования к производительности",
            "is_active": True,
        },
        {
            "name": "Usability",
            "description": "Требования к удобству использования",
            "is_active": True,
        },
    ]

    # Схемы для различных контекстов
    MINIMAL = RequirementTypeResponse
    DETAILED = RequirementTypeResponse
    LIST = RequirementTypeListResponse


# === Псевдонимы для обратной совместимости ===

RequirementType = RequirementTypeResponse  # Базовый тип требования
