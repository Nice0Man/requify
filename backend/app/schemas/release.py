<<<<<<< HEAD
import re
from datetime import UTC, datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator
=======
"""
Схемы для модели Release.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import field_validator, model_validator
from enum import Enum
import re
>>>>>>> dev-backend

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    StatisticsSchema,
    UserRelatedSchema,
    ProjectRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)
from .common import SearchRequest, DateRangeFilter


# === Перечисления ===


class ReleaseStatus(str, Enum):
    """Статусы релизов"""

    PLANNED = "planned"
    IN_DEVELOPMENT = "in_development"
    TESTING = "testing"
    REVIEW = "review"
    READY = "ready"
    RELEASED = "released"
    CANCELLED = "cancelled"
    HOTFIX = "hotfix"


class ReleaseType(str, Enum):
    """Типы релизов"""

    MAJOR = "major"
    MINOR = "minor"
    PATCH = "patch"
    HOTFIX = "hotfix"
    BETA = "beta"
    ALPHA = "alpha"
    RC = "rc"  # Release Candidate


class ReleasePriority(str, Enum):
    """Приоритеты релизов"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# === Базовые схемы ===


class ReleaseBase(ProjectRelatedSchema, ValidationMixin):
    """
    Базовая схема релиза.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " релиза",
    )
    version: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.VERSION_MAX,
        description="Версия релиза в формате SemVer",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " релиза",
    )
    status: ReleaseStatus = Field(ReleaseStatus.PLANNED, description="Статус релиза")
    release_type: Optional[ReleaseType] = Field(None, description="Тип релиза")
    priority: ReleasePriority = Field(
        ReleasePriority.MEDIUM, description="Приоритет релиза"
    )
    planned_date: Optional[datetime] = Field(
        None, description="Планируемая дата релиза"
    )
    release_date: Optional[datetime] = Field(
        None, description="Фактическая дата релиза"
    )
    changelog: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Список изменений"
    )
    release_notes: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Заметки к релизу"
    )
    is_prerelease: bool = Field(
        False, description="Является ли предварительным релизом"
    )
    is_draft: bool = Field(False, description="Черновик релиза")
    tags: Optional[List[str]] = Field(default_factory=list, description="Теги релиза")
    repository_tag: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Тег в репозитории"
    )
    build_number: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Номер сборки"
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия релиза"""
        v = cls.validate_non_empty_string(v, "name")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Release name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("version")
    @classmethod
    def validate_version(cls, v: str) -> str:
        """Валидация версии релиза в формате SemVer"""
        v = cls.validate_non_empty_string(v, "version")

        # Паттерны для проверки версии (SemVer)
        version_patterns = [
            r"^\d+\.\d+\.\d+$",  # 1.0.0
            r"^v\d+\.\d+\.\d+$",  # v1.0.0
            r"^\d+\.\d+$",  # 1.0
            r"^v\d+\.\d+$",  # v1.0
            r"^\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",  # 1.0.0-alpha, 1.0.0-beta.1
            r"^v\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",  # v1.0.0-alpha, v1.0.0-rc.1
        ]

        if not any(re.match(pattern, v) for pattern in version_patterns):
            raise ValueError(
                "Invalid version format. Use SemVer format like 1.0.0, v1.0.0, 1.0.0-alpha, etc."
            )

        return v

    @field_validator("description", "changelog", "release_notes")
    @classmethod
    def validate_text_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация текстовых полей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.TEXT_MAX:
                raise ValueError(
                    f"Text field cannot exceed {FieldLimits.TEXT_MAX} characters"
                )
        return v

    @field_validator("planned_date", "release_date")
    @classmethod
    def validate_dates(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Валидация дат релиза"""
        if v is not None:
            now = datetime.now()

            # Дата не может быть слишком далеко в прошлом (5 лет)
            min_date = now.replace(year=now.year - 5)
            if v < min_date:
                raise ValueError("Date cannot be more than 5 years in the past")

            # Дата не может быть слишком далеко в будущем (10 лет)
            max_date = now.replace(year=now.year + 10)
            if v > max_date:
                raise ValueError("Date cannot be more than 10 years in the future")

        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> List[str]:
        """Валидация тегов"""
        if v is None:
            return []

        validated_tags = []
        for tag in v:
            if isinstance(tag, str) and tag.strip():
                clean_tag = tag.strip().lower()
                if len(clean_tag) <= 30 and clean_tag not in validated_tags:
                    validated_tags.append(clean_tag)

        return validated_tags[:15]  # Максимум 15 тегов

    @field_validator("repository_tag", "build_number")
    @classmethod
    def validate_technical_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация технических полей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            # Проверяем на допустимые символы для тегов/номеров сборки
            if not re.match(r"^[a-zA-Z0-9\-\._]+$", v):
                raise ValueError(
                    "Field can only contain letters, numbers, hyphens, dots and underscores"
                )
        return v

    @model_validator(mode="after")
    def validate_date_consistency(self):
        """Валидация согласованности дат"""
        if self.planned_date and self.release_date:
            if self.release_date < self.planned_date:
                # Предупреждение, но не ошибка - релиз может быть выпущен раньше
                pass

        # Проверяем соответствие статуса и дат
        if self.status == ReleaseStatus.RELEASED and not self.release_date:
            raise ValueError("Released status requires release_date to be set")

        if self.release_date and self.status == ReleaseStatus.PLANNED:
            raise ValueError("Planned status cannot have release_date set")

        return self


# === CRUD схемы ===


class ReleaseCreate(ReleaseBase, CreateSchema, UserRelatedSchema):
    """
    Схема для создания релиза.
    Включает связи с проектом и пользователем.
    """

    based_on_release_id: Optional[int] = Field(
        None, gt=0, description="ID релиза, на основе которого создается новый"
    )

    @field_validator("based_on_release_id")
    @classmethod
    def validate_based_on_release_id(cls, v: Optional[int]) -> Optional[int]:
        """Валидация ID базового релиза"""
        if v is not None and v <= 0:
            raise ValueError(
                "Based on release ID must be a positive integer when provided"
            )
        return v


class ReleaseUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления релиза.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " релиза",
    )
    version: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.VERSION_MAX,
        description="Версия релиза в формате SemVer",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " релиза",
    )
    status: Optional[ReleaseStatus] = Field(None, description="Статус релиза")
    release_type: Optional[ReleaseType] = Field(None, description="Тип релиза")
    priority: Optional[ReleasePriority] = Field(None, description="Приоритет релиза")
    planned_date: Optional[datetime] = Field(
        None, description="Планируемая дата релиза"
    )
    release_date: Optional[datetime] = Field(
        None, description="Фактическая дата релиза"
    )
    changelog: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Список изменений"
    )
    release_notes: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Заметки к релизу"
    )
    is_prerelease: Optional[bool] = Field(
        None, description="Является ли предварительным релизом"
    )
    is_draft: Optional[bool] = Field(None, description="Черновик релиза")
    tags: Optional[List[str]] = Field(None, description="Теги релиза")
    repository_tag: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Тег в репозитории"
    )
    build_number: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Номер сборки"
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
            raise ValueError(
                f"Release name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("version")
    @classmethod
    def validate_version(cls, v: Optional[str]) -> Optional[str]:
        """Валидация версии при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "version")

        version_patterns = [
            r"^\d+\.\d+\.\d+$",
            r"^v\d+\.\d+\.\d+$",
            r"^\d+\.\d+$",
            r"^v\d+\.\d+$",
            r"^\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",
            r"^v\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",
        ]

        if not any(re.match(pattern, v) for pattern in version_patterns):
            raise ValueError(
                "Invalid version format. Use SemVer format like 1.0.0, v1.0.0, 1.0.0-alpha, etc."
            )

        return v

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class ReleaseResponse(ReleaseBase, ResponseSchema, UserRelatedSchema):
    """
    Схема ответа для релиза.
    Включает все данные из БД включая связи.
    """

    based_on_release_id: Optional[int] = None


# === Расширенные схемы ===


class ReleaseWithRelations(ReleaseResponse):
    """
    Схема релиза с информацией о связанных сущностях.
    """

    project_name: Optional[str] = Field(None, description="Название проекта")
    project_code: Optional[str] = Field(None, description="Код проекта")
    owner_name: Optional[str] = Field(None, description="Имя создателя релиза")
    based_on_release_name: Optional[str] = Field(
        None, description="Название базового релиза"
    )


class ReleaseDetailed(ReleaseWithRelations):
    """
    Детальная схема релиза с полной информацией.
    """

    requirements_count: int = Field(0, ge=0, description="Количество требований")
    completed_requirements: int = Field(0, ge=0, description="Выполненных требований")
    progress_percentage: float = Field(
        0.0, ge=0, le=100, description="Процент готовности"
    )

    # Статистика по статусам требований
    requirements_by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение требований по статусам"
    )

    # Связанные релизы
    dependent_releases: List[Dict[str, Any]] = Field(
        default_factory=list, description="Зависимые релизы"
    )

    # Активность
    last_activity_date: Optional[datetime] = Field(
        None, description="Дата последней активности"
    )

    # Права доступа для текущего пользователя
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_publish: bool = Field(False, description="Можно ли опубликовать")
    can_rollback: bool = Field(False, description="Можно ли откатить")


# === Списки и пагинация ===


class ReleaseListResponse(ListResponseSchema[ReleaseWithRelations]):
    """Список релизов с пагинацией"""

    pass


class ReleaseDetailedListResponse(ListResponseSchema[ReleaseDetailed]):
    """Детальный список релизов с пагинацией"""

    pass


# === Поиск и фильтрация ===


class ReleaseSearchRequest(SearchRequest):
    """
    Запрос поиска релизов.
    """

    project_ids: Optional[List[int]] = Field(None, description="Фильтр по проектам")
    statuses: Optional[List[ReleaseStatus]] = Field(
        None, description="Фильтр по статусам"
    )
    types: Optional[List[ReleaseType]] = Field(None, description="Фильтр по типам")
    priorities: Optional[List[ReleasePriority]] = Field(
        None, description="Фильтр по приоритетам"
    )
    owner_ids: Optional[List[int]] = Field(None, description="Фильтр по создателям")
    is_prerelease: Optional[bool] = Field(None, description="Предварительные релизы")
    is_draft: Optional[bool] = Field(None, description="Черновики")
    is_active: Optional[bool] = Field(None, description="Активные релизы")
    tags: Optional[List[str]] = Field(None, description="Фильтр по тегам")
    version_pattern: Optional[str] = Field(
        None, description="Паттерн версии (регулярное выражение)"
    )


class ReleaseFilter(BaseSchema):
    """
    Расширенный фильтр для релизов.
    """

    progress_min: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Минимальный прогресс"
    )
    progress_max: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Максимальный прогресс"
    )
    requirements_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество требований"
    )
    requirements_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество требований"
    )
    planned_date_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон планируемых дат"
    )
    release_date_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат релиза"
    )
    overdue_only: Optional[bool] = Field(None, description="Только просроченные релизы")


# === Статистика ===


class ReleaseStatistics(StatisticsSchema):
    """
    Схема статистики релизов.
    """

    total_releases: int = Field(0, ge=0, description="Общее количество релизов")
    released_count: int = Field(0, ge=0, description="Выпущенных релизов")
    in_development_count: int = Field(0, ge=0, description="В разработке")
    overdue_count: int = Field(0, ge=0, description="Просроченных релизов")

    average_progress: float = Field(0.0, ge=0, le=100, description="Средний прогресс")
    average_requirements_per_release: float = Field(
        0.0, ge=0, description="Среднее количество требований"
    )
    average_development_time: float = Field(
        0.0, ge=0, description="Среднее время разработки (дни)"
    )

    by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по статусам"
    )
    by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по типам"
    )
    by_priority: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по приоритетам"
    )
    by_project: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по проектам"
    )

    release_frequency: List[Dict[str, Any]] = Field(
        default_factory=list, description="Частота релизов по времени"
    )
    velocity_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды скорости разработки"
    )
    most_used_tags: List[Dict[str, Any]] = Field(
        default_factory=list, description="Самые популярные теги"
    )


# === Операции с релизами ===


class ReleasePublishRequest(BaseSchema):
    """
    Запрос на публикацию релиза.
    """

    release_date: Optional[datetime] = Field(
        None, description="Дата релиза (по умолчанию - текущая)"
    )
    notify_stakeholders: bool = Field(
        True, description="Уведомить заинтересованных лиц"
    )
    generate_changelog: bool = Field(
        True, description="Автоматически сгенерировать changelog"
    )
    create_repository_tag: bool = Field(True, description="Создать тег в репозитории")


class ReleaseRollbackRequest(BaseSchema):
    """
    Запрос на откат релиза.
    """

    reason: str = Field(
        ...,
        min_length=10,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина отката",
    )
    rollback_to_version: Optional[str] = Field(None, description="Версия для отката")
    notify_stakeholders: bool = Field(
        True, description="Уведомить заинтересованных лиц"
    )


class ReleaseMergeRequest(BaseSchema):
    """
    Запрос на слияние релизов.
    """

    source_release_id: int = Field(..., gt=0, description="Исходный релиз")
    target_release_id: int = Field(..., gt=0, description="Целевой релиз")
    merge_strategy: str = Field(
        "requirements_only",
        regex="^(requirements_only|full_merge|selective)$",
        description="Стратегия слияния",
    )
    reason: str = Field(
        ...,
        min_length=10,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина слияния",
    )


# === Массовые операции ===


class ReleaseBulkUpdate(BaseSchema):
    """
    Схема для массового обновления релизов.
    """

    release_ids: List[int] = Field(..., min_length=1, description="Список ID релизов")
    update_data: ReleaseUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class ReleaseBulkStatusChange(BaseSchema):
    """
    Схема для массового изменения статуса релизов.
    """

    release_ids: List[int] = Field(..., min_length=1, description="Список ID релизов")
    new_status: ReleaseStatus = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )


# === Экспорт и импорт ===


class ReleaseExportRequest(BaseSchema):
    """
    Запрос на экспорт релизов.
    """

    format: str = Field(
        "xlsx", regex="^(xlsx|csv|pdf|json|changelog)$", description="Формат экспорта"
    )
    filter: Optional[ReleaseFilter] = Field(None, description="Фильтр для экспорта")
    include_requirements: bool = Field(False, description="Включить требования")
    include_changelog: bool = Field(True, description="Включить changelog")
    include_statistics: bool = Field(False, description="Включить статистику")


# === Константы и утилиты ===


class ReleaseConfig:
    """
    Конфигурация схем релизов.
    """

    # Схемы для различных контекстов
    MINIMAL = ReleaseResponse
    STANDARD = ReleaseWithRelations
    DETAILED = ReleaseDetailed
    LIST = ReleaseListResponse
    SEARCH = ReleaseSearchRequest

    # Ограничения
    MAX_TAGS_PER_RELEASE = 15
    MAX_TAG_LENGTH = 30
    MAX_VERSION_LENGTH = 50

    # Паттерны версий
    SEMVER_PATTERNS = [
        r"^\d+\.\d+\.\d+$",  # 1.0.0
        r"^v\d+\.\d+\.\d+$",  # v1.0.0
        r"^\d+\.\d+$",  # 1.0
        r"^v\d+\.\d+$",  # v1.0
        r"^\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",  # 1.0.0-alpha.1
        r"^v\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",  # v1.0.0-rc.1
    ]

    # Стандартные типы релизов для автоопределения
    VERSION_TYPE_MAPPING = {
        "major": r"^\d+\.0\.0",
        "minor": r"^\d+\.\d+\.0",
        "patch": r"^\d+\.\d+\.\d+$",
        "alpha": r".*-alpha",
        "beta": r".*-beta",
        "rc": r".*-rc",
        "hotfix": r".*hotfix.*",
    }


# === Псевдонимы для обратной совместимости ===

Release = ReleaseResponse  # Базовый релиз
ReleaseFromRequirementsCreate = ReleaseCreate  # Создание релиза из требований
ReleaseCreationSummary = ReleaseWithRelations  # Сводка создания релиза
ReleaseWithLinkedRequirements = ReleaseDetailed  # Релиз со связанными требованиями
RequirementSummary = ReleaseWithRelations  # Сводка требований (временный псевдоним)
