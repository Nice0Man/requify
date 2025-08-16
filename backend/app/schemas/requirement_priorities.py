"""
Схемы для модели RequirementPriority (приоритеты требований).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
<<<<<<< HEAD
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator
=======
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import field_validator, model_validator
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
from .common import PriorityEnum
>>>>>>> dev-backend


# === Перечисления ===


class RequirementPriorityLevel(str, Enum):
    """Стандартные уровни приоритетов требований"""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    MINIMAL = "minimal"


# === Базовые схемы ===


class RequirementPriorityBase(BaseSchema, ValidationMixin):
    """
    Базовая схема приоритета требования.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " приоритета требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " приоритета требования",
    )
    level: int = Field(
        ...,
        ge=FieldLimits.PRIORITY_MIN,
        le=FieldLimits.PRIORITY_MAX,
        description="Уровень приоритета (1-10, где 1 - самый высокий)",
    )
    color: Optional[str] = Field(
        None,
        regex="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Цвет приоритета в формате hex",
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия приоритета требования"""
        v = cls.validate_non_empty_string(v, "name")

        # Базовая валидация для безопасности
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError("Priority name contains forbidden characters")

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания приоритета требования"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.LONG_STRING_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.LONG_STRING_MAX} characters"
                )
        return v

    @model_validator(mode="after")
    def validate_priority_consistency(self):
        """Валидация соответствия названия и уровня приоритета"""
        name = self.name.lower()

        # Соответствие названий и уровней приоритета
        priority_levels = {
            "critical": [1, 2],
            "high": [3, 4],
            "medium": [5, 6],
            "low": [7, 8],
            "minimal": [9, 10],
        }

        for priority_name, levels in priority_levels.items():
            if priority_name in name and self.level not in levels:
                raise ValueError(
                    f'Priority level {self.level} does not match priority name "{name}". '
                    f'Expected levels for "{priority_name}": {levels}'
                )

        return self


# === CRUD схемы ===


class RequirementPriorityCreate(RequirementPriorityBase, CreateSchema):
    """
    Схема для создания приоритета требования.
    Наследует все поля от базовой схемы.
    """

    pass


class RequirementPriorityUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления приоритета требования.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " приоритета требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " приоритета требования",
    )
    level: Optional[int] = Field(
        None,
        ge=FieldLimits.PRIORITY_MIN,
        le=FieldLimits.PRIORITY_MAX,
        description="Уровень приоритета (1-10, где 1 - самый высокий)",
    )
    color: Optional[str] = Field(
        None,
        regex="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Цвет приоритета в формате hex",
    )
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "name")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError("Priority name contains forbidden characters")
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


class RequirementPriorityResponse(RequirementPriorityBase, ResponseSchema):
    """
    Схема ответа для приоритета требования.
    Включает все данные из БД включая id и временные метки.
    """

    pass


# === Списки и пагинация ===


class RequirementPriorityListResponse(ListResponseSchema[RequirementPriorityResponse]):
    """Список приоритетов требований с пагинацией"""

    pass


# === Статистика ===


class RequirementPriorityStatistics(StatisticsSchema):
    """
    Схема статистики приоритетов требований.
    """

    total_priorities: int = Field(0, ge=0, description="Общее количество приоритетов")
    active_priorities: int = Field(0, ge=0, description="Активных приоритетов")
    inactive_priorities: int = Field(0, ge=0, description="Неактивных приоритетов")

    usage_by_level: List[Dict[str, Any]] = Field(
        default_factory=list, description="Использование по уровням приоритета"
    )

    distribution: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение требований по приоритетам"
    )


# === Поиск и фильтрация ===


class RequirementPriorityFilter(BaseSchema):
    """
    Фильтр для приоритетов требований.
    """

    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    level_min: Optional[int] = Field(
        None, ge=FieldLimits.PRIORITY_MIN, description="Минимальный уровень приоритета"
    )
    level_max: Optional[int] = Field(
        None, le=FieldLimits.PRIORITY_MAX, description="Максимальный уровень приоритета"
    )
    name_contains: Optional[str] = Field(
        None, min_length=1, description="Поиск по содержанию в названии"
    )


# === Массовые операции ===


class RequirementPriorityBulkCreate(BaseSchema):
    """
    Схема для массового создания приоритетов требований.
    """

    priorities: List[RequirementPriorityCreate] = Field(
        ..., min_length=1, max_length=20, description="Список приоритетов для создания"
    )


# === Константы и утилиты ===


class RequirementPriorityConfig:
    """
    Конфигурация схем приоритетов требований.
    """

    # Стандартные приоритеты для инициализации
    STANDARD_PRIORITIES = [
        {
            "name": "Critical",
            "description": "Критически важные требования",
            "level": 1,
            "color": "#dc2626",
            "is_active": True,
        },
        {
            "name": "High",
            "description": "Высокоприоритетные требования",
            "level": 3,
            "color": "#ea580c",
            "is_active": True,
        },
        {
            "name": "Medium",
            "description": "Среднеприоритетные требования",
            "level": 5,
            "color": "#d97706",
            "is_active": True,
        },
        {
            "name": "Low",
            "description": "Низкоприоритетные требования",
            "level": 7,
            "color": "#65a30d",
            "is_active": True,
        },
        {
            "name": "Minimal",
            "description": "Минимальные требования",
            "level": 9,
            "color": "#6b7280",
            "is_active": True,
        },
    ]

    # Схемы для различных контекстов
    MINIMAL = RequirementPriorityResponse
    DETAILED = RequirementPriorityResponse
    LIST = RequirementPriorityListResponse


# === Псевдонимы для обратной совместимости ===

RequirementPriority = RequirementPriorityResponse  # Базовый приоритет требования
