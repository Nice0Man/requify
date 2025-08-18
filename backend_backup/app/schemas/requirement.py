"""
Схемы для модели Requirement.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import UTC, datetime
from typing import Optional

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
from .common import PriorityEnum, StatusEnum, SearchRequest, DateRangeFilter

# === Перечисления ===


class RequirementComplexity(str, Enum):
    """Сложность требования"""

    TRIVIAL = "trivial"
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"
    VERY_COMPLEX = "very_complex"


class RequirementSource(str, Enum):
    """Источник требования"""

    STAKEHOLDER = "stakeholder"
    BUSINESS_ANALYST = "business_analyst"
    CUSTOMER = "customer"
    REGULATORY = "regulatory"
    TECHNICAL = "technical"
    INTERNAL = "internal"


# === Базовые схемы ===


class RequirementBase(ProjectRelatedSchema, ValidationMixin):
    """
    Базовая схема требования.
    Содержит основные поля без служебных данных.
    """

    title: str = Field(
        ...,
        min_length=3,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.TITLE + " требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " требования",
    )
    deadline: Optional[datetime] = Field(
        None, description="Дедлайн выполнения требования"
    )
    progress: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Прогресс выполнения требования (0.0-100.0)",
    )
    complexity: Optional[RequirementComplexity] = Field(
        None, description="Сложность требования"
    )
    source: Optional[RequirementSource] = Field(None, description="Источник требования")
    acceptance_criteria: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Критерии приемки"
    )
    business_value: Optional[int] = Field(
        None, ge=1, le=10, description="Бизнес-ценность (1-10)"
    )
    effort_estimate: Optional[float] = Field(
        None, ge=0, description="Оценка трудозатрат в часах"
    )
    tags: Optional[List[str]] = Field(
        default_factory=list, description="Теги для категоризации"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Валидация заголовка требования"""
        v = cls.validate_non_empty_string(v, "title")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(f"Title contains forbidden characters: {forbidden_chars}")

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания требования"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.TEXT_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.TEXT_MAX} characters"
                )
        return v

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Валидация дедлайна"""
        if v is not None:
            now = datetime.now()

            # Дедлайн не может быть в прошлом (с учетом часового пояса)
            if v < now:
                raise ValueError("Deadline cannot be in the past")

            # Дедлайн не может быть слишком далеко в будущем
            max_future = now.replace(year=now.year + 10)
            if v > max_future:
                raise ValueError("Deadline cannot be more than 10 years in the future")
        return v

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v: float) -> float:
        """Валидация прогресса"""
        if v < 0.0:
            raise ValueError("Progress cannot be negative")
        if v > 100.0:
            raise ValueError("Progress cannot exceed 100%")
        return round(v, 2)

    @field_validator("acceptance_criteria")
    @classmethod
    def validate_acceptance_criteria(cls, v: Optional[str]) -> Optional[str]:
        """Валидация критериев приемки"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.TEXT_MAX:
                raise ValueError(
                    f"Acceptance criteria cannot exceed {FieldLimits.TEXT_MAX} characters"
                )
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
                if len(clean_tag) <= 50 and clean_tag not in validated_tags:
                    validated_tags.append(clean_tag)

        return validated_tags[:10]  # Максимум 10 тегов


# === CRUD схемы ===


class RequirementCreate(RequirementBase, CreateSchema, UserRelatedSchema):
    """
    Схема для создания требования.
    Включает связи с другими сущностями.
    """

    type_id: int = Field(..., gt=0, description="ID типа требования")
    priority_id: int = Field(..., gt=0, description="ID приоритета требования")
    status_id: int = Field(..., gt=0, description="ID статуса требования")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
    spec_id: Optional[int] = Field(None, gt=0, description="ID спецификации")
    parent_requirement_id: Optional[int] = Field(
        None, gt=0, description="ID родительского требования"
    )

    @field_validator("type_id", "priority_id", "status_id", "project_id")
    @classmethod
    def validate_required_ids(cls, v: int) -> int:
        """Валидация обязательных ID"""
        if v <= 0:
            raise ValueError("ID must be a positive integer")
        return v

    @field_validator("release_id", "spec_id", "parent_requirement_id")
    @classmethod
    def validate_optional_ids(cls, v: Optional[int]) -> Optional[int]:
        """Валидация опциональных ID"""
        if v is not None and v <= 0:
            raise ValueError("ID must be a positive integer when provided")
        return v


class RequirementUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления требования.
    Все поля опциональны для частичных обновлений.
    """

    title: Optional[str] = Field(
        None,
        min_length=3,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.TITLE + " требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " требования",
    )
    deadline: Optional[datetime] = Field(
        None, description="Дедлайн выполнения требования"
    )
    progress: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Прогресс выполнения требования"
    )
    complexity: Optional[RequirementComplexity] = Field(
        None, description="Сложность требования"
    )
    source: Optional[RequirementSource] = Field(None, description="Источник требования")
    acceptance_criteria: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Критерии приемки"
    )
    business_value: Optional[int] = Field(
        None, ge=1, le=10, description="Бизнес-ценность"
    )
    effort_estimate: Optional[float] = Field(
        None, ge=0, description="Оценка трудозатрат в часах"
    )
    tags: Optional[List[str]] = Field(None, description="Теги для категоризации")
    type_id: Optional[int] = Field(None, gt=0, description="ID типа требования")
    priority_id: Optional[int] = Field(None, gt=0, description="ID приоритета")
    status_id: Optional[int] = Field(None, gt=0, description="ID статуса")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
    spec_id: Optional[int] = Field(None, gt=0, description="ID спецификации")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Валидация заголовка при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "title")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Title contains forbidden characters: {forbidden_chars}"
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


class RequirementResponse(RequirementBase, ResponseSchema, UserRelatedSchema):
    """
    Схема ответа для требования.
    Включает все данные из БД включая связи.
    """

    type_id: int
    priority_id: int
    status_id: int
    release_id: Optional[int] = None
    spec_id: Optional[int] = None
    parent_requirement_id: Optional[int] = None


# === Расширенные схемы ===


class RequirementWithRelations(RequirementResponse):
    """
    Схема требования с информацией о связанных сущностях.
    """

    type_name: Optional[str] = Field(None, description="Название типа требования")
    priority_name: Optional[str] = Field(None, description="Название приоритета")
    status_name: Optional[str] = Field(None, description="Название статуса")
    project_name: Optional[str] = Field(None, description="Название проекта")
    release_version: Optional[str] = Field(None, description="Версия релиза")
    spec_name: Optional[str] = Field(None, description="Название спецификации")
    author_name: Optional[str] = Field(None, description="Имя автора")
    assignee_name: Optional[str] = Field(None, description="Имя ответственного")


class RequirementDetailed(RequirementWithRelations):
    """
    Детальная схема требования с полной информацией.
    """

    children_count: int = Field(0, ge=0, description="Количество дочерних требований")
    comments_count: int = Field(0, ge=0, description="Количество комментариев")
    relationships_count: int = Field(0, ge=0, description="Количество связей")
    test_cases_count: int = Field(0, ge=0, description="Количество тест-кейсов")

    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_change_status: bool = Field(False, description="Можно ли изменить статус")


# === Списки и пагинация ===


class RequirementListResponse(ListResponseSchema[RequirementWithRelations]):
    """Список требований с пагинацией"""

    pass


class RequirementDetailedListResponse(ListResponseSchema[RequirementDetailed]):
    """Детальный список требований с пагинацией"""

    pass


# === Поиск и фильтрация ===


class RequirementSearchRequest(SearchRequest):
    """
    Запрос поиска требований.
    """

    project_ids: Optional[List[int]] = Field(None, description="Список ID проектов")
    type_ids: Optional[List[int]] = Field(
        None, description="Список ID типов требований"
    )
    priority_ids: Optional[List[int]] = Field(None, description="Список ID приоритетов")
    status_ids: Optional[List[int]] = Field(None, description="Список ID статусов")
    release_ids: Optional[List[int]] = Field(None, description="Список ID релизов")
    author_ids: Optional[List[int]] = Field(None, description="Список ID авторов")
    complexity: Optional[RequirementComplexity] = Field(
        None, description="Фильтр по сложности"
    )
    source: Optional[RequirementSource] = Field(None, description="Фильтр по источнику")
    has_deadline: Optional[bool] = Field(None, description="Есть ли дедлайн")
    overdue: Optional[bool] = Field(None, description="Просроченные требования")


class RequirementFilter(BaseSchema):
    """
    Расширенный фильтр для требований.
    """

    progress_min: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Минимальный прогресс"
    )
    progress_max: Optional[float] = Field(
        None, ge=0.0, le=100.0, description="Максимальный прогресс"
    )
    business_value_min: Optional[int] = Field(
        None, ge=1, le=10, description="Минимальная бизнес-ценность"
    )
    business_value_max: Optional[int] = Field(
        None, ge=1, le=10, description="Максимальная бизнес-ценность"
    )
    effort_min: Optional[float] = Field(
        None, ge=0, description="Минимальная оценка трудозатрат"
    )
    effort_max: Optional[float] = Field(
        None, ge=0, description="Максимальная оценка трудозатрат"
    )
    tags: Optional[List[str]] = Field(None, description="Фильтр по тегам")
    date_range: Optional[DateRangeFilter] = Field(
        None, description="Фильтр по диапазону дат"
    )


# === Статистика ===


class RequirementStatistics(StatisticsSchema):
    """
    Схема статистики требований.
    """

    total_requirements: int = Field(0, ge=0, description="Общее количество требований")
    completed_requirements: int = Field(0, ge=0, description="Завершенных требований")
    in_progress_requirements: int = Field(0, ge=0, description="В работе")
    overdue_requirements: int = Field(0, ge=0, description="Просроченных требований")

    average_progress: float = Field(0.0, ge=0, le=100, description="Средний прогресс")
    average_business_value: float = Field(
        0.0, ge=0, description="Средняя бизнес-ценность"
    )
    average_effort: float = Field(0.0, ge=0, description="Средние трудозатраты")

    by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по статусам"
    )
    by_priority: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по приоритетам"
    )
    by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по типам"
    )
    by_complexity: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по сложности"
    )
    by_source: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по источникам"
    )

    progress_over_time: List[Dict[str, Any]] = Field(
        default_factory=list, description="Прогресс по времени"
    )
    most_used_tags: List[Dict[str, Any]] = Field(
        default_factory=list, description="Самые популярные теги"
    )


# === Связи между требованиями ===


class RequirementRelationship(BaseSchema):
    """
    Схема связи между требованиями.
    """

    source_requirement_id: int = Field(..., description="ID исходного требования")
    target_requirement_id: int = Field(..., description="ID целевого требования")
    relationship_type_id: int = Field(..., description="ID типа связи")
    description: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Описание связи"
    )


class RequirementRelationshipResponse(RequirementRelationship, ResponseSchema):
    """Схема ответа для связи требований"""

    source_requirement_title: Optional[str] = None
    target_requirement_title: Optional[str] = None
    relationship_type_name: Optional[str] = None


# === Массовые операции ===


class RequirementBulkUpdate(BaseSchema):
    """
    Схема для массового обновления требований.
    """

    requirement_ids: List[int] = Field(
        ..., min_length=1, description="Список ID требований"
    )
    update_data: RequirementUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class RequirementBulkStatusChange(BaseSchema):
    """
    Схема для массового изменения статуса требований.
    """

    requirement_ids: List[int] = Field(
        ..., min_length=1, description="Список ID требований"
    )
    new_status_id: int = Field(..., gt=0, description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )


# === Экспорт и импорт ===


class RequirementExportRequest(BaseSchema):
    """
    Запрос на экспорт требований.
    """

    format: str = Field(
        "xlsx", regex="^(xlsx|csv|pdf|json)$", description="Формат экспорта"
    )
    filter: Optional[RequirementFilter] = Field(None, description="Фильтр для экспорта")
    include_relationships: bool = Field(
        False, description="Включить связи между требованиями"
    )
    include_comments: bool = Field(False, description="Включить комментарии")
    include_history: bool = Field(False, description="Включить историю изменений")


# === Константы и утилиты ===


class RequirementConfig:
    """
    Конфигурация схем требований.
    """

    # Схемы для различных контекстов
    MINIMAL = RequirementResponse
    STANDARD = RequirementWithRelations
    DETAILED = RequirementDetailed
    LIST = RequirementListResponse
    SEARCH = RequirementSearchRequest

    # Ограничения
    MAX_TAGS_PER_REQUIREMENT = 10
    MAX_TAG_LENGTH = 50
    MAX_PROGRESS_DECIMAL_PLACES = 2
    MAX_FUTURE_YEARS = 10


# === Псевдонимы для обратной совместимости ===

Requirement = RequirementResponse  # Базовое требование
RequirementWithDetails = RequirementDetailed  # Требование с деталями
