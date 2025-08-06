"""
Схемы для модели Project.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import field_validator, model_validator
from enum import Enum
import re

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    StatisticsSchema,
    UserRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)
from .common import SearchRequest, DateRangeFilter


# === Перечисления ===


class ProjectStatus(str, Enum):
    """Статусы проектов"""

    PLANNING = "planning"
    ACTIVE = "active"
    DEVELOPMENT = "development"
    TESTING = "testing"
    REVIEW = "review"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"


class ProjectPriority(str, Enum):
    """Приоритеты проектов"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ProjectType(str, Enum):
    """Типы проектов"""

    SOFTWARE = "software"
    RESEARCH = "research"
    INFRASTRUCTURE = "infrastructure"
    MAINTENANCE = "maintenance"
    MIGRATION = "migration"
    INTEGRATION = "integration"


class ProjectMethodology(str, Enum):
    """Методологии разработки"""

    AGILE = "agile"
    WATERFALL = "waterfall"
    SCRUM = "scrum"
    KANBAN = "kanban"
    LEAN = "lean"
    HYBRID = "hybrid"


# === Базовые схемы ===


class ProjectBase(BaseSchema, ValidationMixin):
    """
    Базовая схема проекта.
    Содержит основные поля без служебных данных.
    """

    code: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.CODE_MAX,
        description="Уникальный код проекта",
    )
    name: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " проекта",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " проекта",
    )
    status: ProjectStatus = Field(ProjectStatus.PLANNING, description="Статус проекта")
    priority: Optional[ProjectPriority] = Field(
        ProjectPriority.MEDIUM, description="Приоритет проекта"
    )
    project_type: Optional[ProjectType] = Field(None, description="Тип проекта")
    methodology: Optional[ProjectMethodology] = Field(
        None, description="Методология разработки"
    )
    start_date: Optional[datetime] = Field(None, description="Дата начала проекта")
    end_date: Optional[datetime] = Field(
        None, description="Планируемая дата завершения"
    )
    budget: Optional[float] = Field(None, ge=0, description="Бюджет проекта")
    progress: float = Field(
        default=0.0, ge=0.0, le=100.0, description="Общий прогресс проекта (%)"
    )
    is_public: bool = Field(
        False, description="Доступен ли проект для публичного просмотра"
    )
    tags: Optional[List[str]] = Field(default_factory=list, description="Теги проекта")
    repository_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL репозитория"
    )
    documentation_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL документации"
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        """Валидация кода проекта"""
        v = cls.validate_non_empty_string(v, "code")
        v = v.upper().strip()

        # Код проекта должен содержать только буквы, цифры и дефисы
        if not re.match(r"^[A-Z0-9\-_]{2,}$", v):
            raise ValueError(
                "Project code can only contain letters, numbers, hyphens and underscores (min 2 chars)"
            )

        # Код не должен начинаться или заканчиваться дефисом/подчеркиванием
        if v.startswith(("-", "_")) or v.endswith(("-", "_")):
            raise ValueError(
                "Project code cannot start or end with hyphen or underscore"
            )

        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия проекта"""
        v = cls.validate_non_empty_string(v, "name")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Project name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания проекта"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.TEXT_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.TEXT_MAX} characters"
                )
        return v

    @field_validator("start_date", "end_date")
    @classmethod
    def validate_dates(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Валидация дат проекта"""
        if v is not None:
            # Проверяем, что дата не слишком далеко в прошлом или будущем
            now = datetime.now()
            min_date = now.replace(year=now.year - 20)
            max_date = now.replace(year=now.year + 20)

            if v < min_date or v > max_date:
                raise ValueError("Date must be within reasonable range (±20 years)")

        return v

    @field_validator("repository_url", "documentation_url")
    @classmethod
    def validate_urls(cls, v: Optional[str]) -> Optional[str]:
        """Валидация URL"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Базовая проверка URL
            if not re.match(r"^https?://[^\s]+$", v):
                raise ValueError("Invalid URL format")

            if len(v) > FieldLimits.URL_MAX:
                raise ValueError(f"URL cannot exceed {FieldLimits.URL_MAX} characters")

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

        return validated_tags[:20]  # Максимум 20 тегов

    @model_validator(mode="after")
    def validate_date_range(self):
        """Валидация диапазона дат"""
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                raise ValueError("End date must be after start date")

        return self


# === CRUD схемы ===


class ProjectCreate(ProjectBase, CreateSchema, UserRelatedSchema):
    """
    Схема для создания проекта.
    Включает связи с пользователями и компанией.
    """

    company_id: Optional[int] = Field(None, gt=0, description="ID компании")
    team_lead_id: Optional[int] = Field(
        None, gt=0, description="ID руководителя команды"
    )

    @field_validator("company_id", "team_lead_id")
    @classmethod
    def validate_optional_ids(cls, v: Optional[int]) -> Optional[int]:
        """Валидация опциональных ID"""
        if v is not None and v <= 0:
            raise ValueError("ID must be a positive integer when provided")
        return v


class ProjectUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления проекта.
    Все поля опциональны для частичных обновлений.
    """

    code: Optional[str] = Field(
        None,
        min_length=2,
        max_length=FieldLimits.CODE_MAX,
        description="Уникальный код проекта",
    )
    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " проекта",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " проекта",
    )
    status: Optional[ProjectStatus] = Field(None, description="Статус проекта")
    priority: Optional[ProjectPriority] = Field(None, description="Приоритет проекта")
    project_type: Optional[ProjectType] = Field(None, description="Тип проекта")
    methodology: Optional[ProjectMethodology] = Field(
        None, description="Методология разработки"
    )
    start_date: Optional[datetime] = Field(None, description="Дата начала проекта")
    end_date: Optional[datetime] = Field(
        None, description="Планируемая дата завершения"
    )
    budget: Optional[float] = Field(None, ge=0, description="Бюджет проекта")
    progress: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Общий прогресс проекта (%)"
    )
    is_public: Optional[bool] = Field(
        None, description="Доступен ли проект для публичного просмотра"
    )
    tags: Optional[List[str]] = Field(None, description="Теги проекта")
    repository_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL репозитория"
    )
    documentation_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL документации"
    )
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)
    company_id: Optional[int] = Field(None, gt=0, description="ID компании")
    team_lead_id: Optional[int] = Field(
        None, gt=0, description="ID руководителя команды"
    )

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: Optional[str]) -> Optional[str]:
        """Валидация кода проекта при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "code")
            v = v.upper().strip()

            if not re.match(r"^[A-Z0-9\-_]{2,}$", v):
                raise ValueError(
                    "Project code can only contain letters, numbers, hyphens and underscores"
                )

            if v.startswith(("-", "_")) or v.endswith(("-", "_")):
                raise ValueError(
                    "Project code cannot start or end with hyphen or underscore"
                )

        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "name")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Project name contains forbidden characters: {forbidden_chars}"
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


class ProjectResponse(ProjectBase, ResponseSchema, UserRelatedSchema):
    """
    Схема ответа для проекта.
    Включает все данные из БД включая связи.
    """

    company_id: Optional[int] = None
    team_lead_id: Optional[int] = None


# === Расширенные схемы ===


class ProjectWithRelations(ProjectResponse):
    """
    Схема проекта с информацией о связанных сущностях.
    """

    company_name: Optional[str] = Field(None, description="Название компании")
    team_lead_name: Optional[str] = Field(None, description="Имя руководителя команды")
    owner_name: Optional[str] = Field(None, description="Имя владельца проекта")


class ProjectDetailed(ProjectWithRelations):
    """
    Детальная схема проекта с полной информацией.
    """

    requirements_count: int = Field(0, ge=0, description="Количество требований")
    releases_count: int = Field(0, ge=0, description="Количество релизов")
    team_members_count: int = Field(
        0, ge=0, description="Количество участников команды"
    )
    completed_requirements: int = Field(0, ge=0, description="Выполненных требований")

    # Статистика по статусам требований
    requirements_by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение требований по статусам"
    )

    # Последняя активность
    last_activity_date: Optional[datetime] = Field(
        None, description="Дата последней активности"
    )

    # Права доступа для текущего пользователя
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_manage_team: bool = Field(False, description="Можно ли управлять командой")
    can_create_requirements: bool = Field(
        False, description="Можно ли создавать требования"
    )


# === Списки и пагинация ===


class ProjectListResponse(ListResponseSchema[ProjectWithRelations]):
    """Список проектов с пагинацией"""

    pass


class ProjectDetailedListResponse(ListResponseSchema[ProjectDetailed]):
    """Детальный список проектов с пагинацией"""

    pass


# === Поиск и фильтрация ===


class ProjectSearchRequest(SearchRequest):
    """
    Запрос поиска проектов.
    """

    statuses: Optional[List[ProjectStatus]] = Field(
        None, description="Фильтр по статусам"
    )
    priorities: Optional[List[ProjectPriority]] = Field(
        None, description="Фильтр по приоритетам"
    )
    types: Optional[List[ProjectType]] = Field(
        None, description="Фильтр по типам проектов"
    )
    methodologies: Optional[List[ProjectMethodology]] = Field(
        None, description="Фильтр по методологиям"
    )
    company_ids: Optional[List[int]] = Field(None, description="Фильтр по компаниям")
    owner_ids: Optional[List[int]] = Field(None, description="Фильтр по владельцам")
    team_lead_ids: Optional[List[int]] = Field(
        None, description="Фильтр по руководителям команд"
    )
    is_public: Optional[bool] = Field(None, description="Публичные/приватные проекты")
    is_active: Optional[bool] = Field(None, description="Активные/неактивные проекты")
    tags: Optional[List[str]] = Field(None, description="Фильтр по тегам")


class ProjectFilter(BaseSchema):
    """
    Расширенный фильтр для проектов.
    """

    progress_min: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Минимальный прогресс"
    )
    progress_max: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Максимальный прогресс"
    )
    budget_min: Optional[float] = Field(None, ge=0, description="Минимальный бюджет")
    budget_max: Optional[float] = Field(None, ge=0, description="Максимальный бюджет")
    requirements_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество требований"
    )
    requirements_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество требований"
    )
    team_size_min: Optional[int] = Field(
        None, ge=0, description="Минимальный размер команды"
    )
    team_size_max: Optional[int] = Field(
        None, ge=0, description="Максимальный размер команды"
    )
    date_range: Optional[DateRangeFilter] = Field(
        None, description="Фильтр по диапазону дат"
    )


# === Статистика ===


class ProjectStatistics(StatisticsSchema):
    """
    Схема статистики проектов.
    """

    total_projects: int = Field(0, ge=0, description="Общее количество проектов")
    active_projects: int = Field(0, ge=0, description="Активных проектов")
    completed_projects: int = Field(0, ge=0, description="Завершенных проектов")
    overdue_projects: int = Field(0, ge=0, description="Просроченных проектов")

    average_progress: float = Field(0.0, ge=0, le=100, description="Средний прогресс")
    total_budget: float = Field(0.0, ge=0, description="Общий бюджет")
    average_team_size: float = Field(0.0, ge=0, description="Средний размер команды")

    by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по статусам"
    )
    by_priority: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по приоритетам"
    )
    by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по типам"
    )
    by_methodology: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по методологиям"
    )

    progress_over_time: List[Dict[str, Any]] = Field(
        default_factory=list, description="Прогресс проектов по времени"
    )
    budget_utilization: List[Dict[str, Any]] = Field(
        default_factory=list, description="Использование бюджета"
    )
    most_used_tags: List[Dict[str, Any]] = Field(
        default_factory=list, description="Самые популярные теги"
    )


# === Управление командой ===


class ProjectTeamMember(BaseSchema):
    """
    Схема участника команды проекта.
    """

    user_id: int = Field(..., gt=0, description="ID пользователя")
    role: str = Field(..., description="Роль в проекте")
    permissions: List[str] = Field(default_factory=list, description="Права доступа")
    joined_at: Optional[datetime] = Field(
        None, description="Дата присоединения к проекту"
    )
    is_active: bool = Field(True, description="Активен ли участник")


class ProjectTeamMemberResponse(ProjectTeamMember, ResponseSchema):
    """Схема ответа для участника команды"""

    user_name: Optional[str] = Field(None, description="Имя пользователя")
    user_email: Optional[str] = Field(None, description="Email пользователя")


class ProjectTeamUpdate(BaseSchema):
    """
    Схема для обновления команды проекта.
    """

    members: List[ProjectTeamMember] = Field(
        ..., description="Список участников команды"
    )


# === Массовые операции ===


class ProjectBulkUpdate(BaseSchema):
    """
    Схема для массового обновления проектов.
    """

    project_ids: List[int] = Field(..., min_length=1, description="Список ID проектов")
    update_data: ProjectUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class ProjectBulkStatusChange(BaseSchema):
    """
    Схема для массового изменения статуса проектов.
    """

    project_ids: List[int] = Field(..., min_length=1, description="Список ID проектов")
    new_status: ProjectStatus = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )


# === Экспорт и импорт ===


class ProjectExportRequest(BaseSchema):
    """
    Запрос на экспорт проектов.
    """

    format: str = Field(
        "xlsx", regex="^(xlsx|csv|pdf|json)$", description="Формат экспорта"
    )
    filter: Optional[ProjectFilter] = Field(None, description="Фильтр для экспорта")
    include_requirements: bool = Field(False, description="Включить требования")
    include_team: bool = Field(False, description="Включить состав команды")
    include_statistics: bool = Field(False, description="Включить статистику")


# === Архивирование ===


class ProjectArchiveRequest(BaseSchema):
    """
    Запрос на архивирование проекта.
    """

    reason: str = Field(
        ...,
        min_length=10,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина архивирования",
    )
    preserve_data: bool = Field(True, description="Сохранить данные проекта")
    notify_team: bool = Field(True, description="Уведомить команду")


# === Константы и утилиты ===


class ProjectConfig:
    """
    Конфигурация схем проектов.
    """

    # Схемы для различных контекстов
    MINIMAL = ProjectResponse
    STANDARD = ProjectWithRelations
    DETAILED = ProjectDetailed
    LIST = ProjectListResponse
    SEARCH = ProjectSearchRequest

    # Ограничения
    MAX_TAGS_PER_PROJECT = 20
    MAX_TAG_LENGTH = 30
    MAX_PROJECT_CODE_LENGTH = 20
    MAX_TEAM_MEMBERS = 100

    # Стандартные роли в проекте
    STANDARD_ROLES = [
        "owner",
        "admin",
        "team_lead",
        "developer",
        "analyst",
        "tester",
        "designer",
        "observer",
    ]

    # Стандартные права доступа
    STANDARD_PERMISSIONS = [
        "read",
        "write",
        "delete",
        "manage_team",
        "manage_requirements",
        "manage_releases",
        "view_statistics",
        "export_data",
    ]


# === Псевдонимы для обратной совместимости ===

Project = ProjectResponse  # Базовый проект
ProjectWithStats = ProjectDetailed  # Проект со статистикой
