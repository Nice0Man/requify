from datetime import datetime
from typing import Any, Dict, List, Optional
import re

from pydantic import Field, field_validator, model_validator

from app.schemas.base import (
    BaseSchema,
    ResponseSchema,
    CreateSchema,
    UpdateSchema,
    ListResponseSchema,
    SearchSchema,
    ValidationMixin,
    UserRelatedSchema,
    StatisticsSchema,
)

from app.schemas.base import FieldLimits, StandardDescriptions
from app.schemas.common import DateRangeFilter
from app.models.specification import SpecificationStatus, SpecificationType


# === Базовая схема ===


class SpecificationBase(BaseSchema):
    """
    Базовая схема спецификации с общими полями.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " спецификации",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " спецификации",
    )
    status: SpecificationStatus = Field(
        SpecificationStatus.DRAFT, description="Статус спецификации"
    )
    specification_type: SpecificationType = Field(
        SpecificationType.FUNCTIONAL, description="Тип спецификации"
    )
    version: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.VERSION_MAX,
        description="Версия спецификации в формате SemVer",
    )
    document_template: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Шаблон документа",
    )
    content: Optional[str] = Field(
        None, max_length=FieldLimits.LARGE_TEXT_MAX, description="Содержимое спецификации"
    )
    notes: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Заметки к спецификации"
    )
    is_template: Optional[bool] = Field(
        False, description="Является ли шаблоном спецификации"
    )
    is_published: Optional[bool] = Field(
        False, description="Опубликована ли спецификация"
    )
    tags: Optional[List[str]] = Field(None, description="Теги спецификации")
    document_path: Optional[str] = Field(
        None, max_length=FieldLimits.LONG_STRING_MAX, description="Путь к документу"
    )
    is_active: Optional[bool] = Field(True, description=StandardDescriptions.IS_ACTIVE)

    # Связи с другими сущностями
    project_id: int = Field(..., gt=0, description="ID проекта")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия спецификации"""
        v = cls.validate_non_empty_string(v, "name")

        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Specification name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("version")
    @classmethod
    def validate_version(cls, v: str) -> str:
        """Валидация версии спецификации"""
        v = cls.validate_non_empty_string(v, "version")

        version_patterns = [
            r"^\d+\.\d+\.\d+$",  # 1.0.0
            r"^v\d+\.\d+\.\d+$",  # v1.0.0
            r"^\d+\.\d+$",  # 1.0
            r"^v\d+\.\d+$",  # v1.0
            r"^\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",  # 1.0.0-alpha
            r"^v\d+\.\d+\.\d+-[a-zA-Z0-9\-\.]+$",  # v1.0.0-alpha
        ]

        if not any(re.match(pattern, v) for pattern in version_patterns):
            raise ValueError(
                "Invalid version format. Use SemVer format like 1.0.0, v1.0.0, 1.0.0-alpha, etc."
            )

        return v

    @field_validator("description", "content", "notes")
    @classmethod
    def validate_text_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация текстовых полей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
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

    @field_validator("document_template", "document_path")
    @classmethod
    def validate_path_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация полей путей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            # Проверяем на недопустимые символы в путях
            forbidden_chars = ["<", ">", "|", "?", "*"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Path contains forbidden characters: {forbidden_chars}"
                )
        return v

    @model_validator(mode="after")
    def validate_specification_model(self) -> "SpecificationBase":
        """Валидация модели спецификации"""
        # Проверяем соответствие статуса и публикации
        if self.status == SpecificationStatus.PUBLISHED and not self.is_published:
            raise ValueError("Published status requires is_published to be True")

        if self.is_published and self.status == SpecificationStatus.DRAFT:
            raise ValueError("Draft status cannot be published")

        return self


# === CRUD схемы ===


class SpecificationCreate(SpecificationBase, CreateSchema, UserRelatedSchema):
    """
    Схема для создания спецификации.
    Включает связи с проектом и пользователем.
    """

    based_on_specification_id: Optional[int] = Field(
        None, gt=0, description="ID спецификации, на основе которой создается новая"
    )

    @field_validator("based_on_specification_id")
    @classmethod
    def validate_based_on_specification_id(cls, v: Optional[int]) -> Optional[int]:
        """Валидация ID базовой спецификации"""
        if v is not None and v <= 0:
            raise ValueError(
                "Based on specification ID must be a positive integer when provided"
            )
        return v


class SpecificationUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления спецификации.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " спецификации",
    )
    version: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.VERSION_MAX,
        description="Версия спецификации в формате SemVer",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " спецификации",
    )
    status: Optional[SpecificationStatus] = Field(None, description="Статус спецификации")
    specification_type: Optional[SpecificationType] = Field(None, description="Тип спецификации")
    document_template: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Шаблон документа",
    )
    content: Optional[str] = Field(
        None, max_length=FieldLimits.LARGE_TEXT_MAX, description="Содержимое спецификации"
    )
    notes: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Заметки к спецификации"
    )
    is_template: Optional[bool] = Field(
        None, description="Является ли шаблоном спецификации"
    )
    is_published: Optional[bool] = Field(
        None, description="Опубликована ли спецификация"
    )
    tags: Optional[List[str]] = Field(None, description="Теги спецификации")
    document_path: Optional[str] = Field(
        None, max_length=FieldLimits.LONG_STRING_MAX, description="Путь к документу"
    )
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
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
                    f"Specification name contains forbidden characters: {forbidden_chars}"
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

    @field_validator("description", "content", "notes")
    @classmethod
    def validate_text_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация текстовых полей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
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

    @field_validator("document_template", "document_path")
    @classmethod
    def validate_path_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация полей путей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            # Проверяем на недопустимые символы в путях
            forbidden_chars = ["<", ">", "|", "?", "*"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Path contains forbidden characters: {forbidden_chars}"
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


class SpecificationResponse(SpecificationBase, ResponseSchema, UserRelatedSchema):
    """
    Схема ответа для спецификации.
    Включает все данные из БД включая связи.
    """

    based_on_specification_id: Optional[int] = None


# === Расширенные схемы ===


class SpecificationWithRelations(SpecificationResponse):
    """
    Схема спецификации с информацией о связанных сущностях.
    """

    project_name: Optional[str] = Field(None, description="Название проекта")
    project_code: Optional[str] = Field(None, description="Код проекта")
    release_name: Optional[str] = Field(None, description="Название релиза")
    release_version: Optional[str] = Field(None, description="Версия релиза")
    owner_name: Optional[str] = Field(None, description="Имя создателя спецификации")
    based_on_specification_name: Optional[str] = Field(
        None, description="Название базовой спецификации"
    )


class SpecificationDetailed(SpecificationWithRelations):
    """
    Детальная схема спецификации с полной информацией.
    """

    requirements_count: int = Field(0, ge=0, description="Количество требований")
    document_size: Optional[int] = Field(None, ge=0, description="Размер документа в байтах")
    generation_date: Optional[datetime] = Field(
        None, description="Дата генерации документа"
    )

    # Статистика по типам требований
    requirements_by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение требований по типам"
    )

    # Статистика по статусам требований
    requirements_by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение требований по статусам"
    )

    # Связанные спецификации
    related_specifications: List[Dict[str, Any]] = Field(
        default_factory=list, description="Связанные спецификации"
    )

    # Активность
    last_activity_date: Optional[datetime] = Field(
        None, description="Дата последней активности"
    )

    # Права доступа для текущего пользователя
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_publish: bool = Field(False, description="Можно ли опубликовать")
    can_generate_document: bool = Field(False, description="Можно ли генерировать документ")


# === Списки и пагинация ===


class SpecificationListResponse(ListResponseSchema[SpecificationWithRelations]):
    """Список спецификаций с пагинацией"""

    pass


class SpecificationDetailedListResponse(ListResponseSchema[SpecificationDetailed]):
    """Детальный список спецификаций с пагинацией"""

    pass


# === Поиск и фильтрация ===


class SpecificationSearchSchema(SearchSchema):
    """
    Запрос поиска спецификаций.
    """

    project_ids: Optional[List[int]] = Field(None, description="Фильтр по проектам")
    statuses: Optional[List[SpecificationStatus]] = Field(
        None, description="Фильтр по статусам"
    )
    types: Optional[List[SpecificationType]] = Field(None, description="Фильтр по типам")
    owner_ids: Optional[List[int]] = Field(None, description="Фильтр по создателям")
    is_template: Optional[bool] = Field(None, description="Шаблоны спецификаций")
    is_published: Optional[bool] = Field(None, description="Опубликованные спецификации")
    is_active: Optional[bool] = Field(None, description="Активные спецификации")
    tags: Optional[List[str]] = Field(None, description="Фильтр по тегам")
    version_pattern: Optional[str] = Field(
        None, description="Паттерн версии (регулярное выражение)"
    )


class SpecificationFilter(BaseSchema):
    """
    Расширенный фильтр для спецификаций.
    """

    requirements_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество требований"
    )
    requirements_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество требований"
    )
    document_size_min: Optional[int] = Field(
        None, ge=0, description="Минимальный размер документа"
    )
    document_size_max: Optional[int] = Field(
        None, ge=0, description="Максимальный размер документа"
    )
    generation_date_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат генерации"
    )


# === Статистика ===


class SpecificationStatistics(StatisticsSchema):
    """
    Схема статистики спецификаций.
    """

    total_specifications: int = Field(0, ge=0, description="Общее количество спецификаций")
    published_count: int = Field(0, ge=0, description="Опубликованных спецификаций")
    draft_count: int = Field(0, ge=0, description="Черновиков")
    template_count: int = Field(0, ge=0, description="Шаблонов")
    by_type: Dict[str, int] = Field(default_factory=dict, description="По типам")
    by_status: Dict[str, int] = Field(default_factory=dict, description="По статусам")
    total_requirements: int = Field(0, ge=0, description="Общее количество требований")
    avg_requirements_per_spec: float = Field(
        0.0, ge=0.0, description="Среднее количество требований на спецификацию"
    )


# === Массовые операции ===


class SpecificationBulkUpdate(BaseSchema):
    """
    Схема для массового обновления спецификаций.
    """

    specification_ids: List[int] = Field(..., min_length=1, description="Список ID спецификаций")
    update_data: SpecificationUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class SpecificationBulkStatusChange(BaseSchema):
    """
    Схема для массового изменения статуса спецификаций.
    """

    specification_ids: List[int] = Field(..., min_length=1, description="Список ID спецификаций")
    new_status: SpecificationStatus = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )


# === Генерация документов ===


class SpecificationDocumentRequest(BaseSchema):
    """
    Запрос на генерацию документа спецификации.
    """

    format: str = Field(
        "docx", pattern="^(docx|pdf|html|md)$", description="Формат документа"
    )
    include_requirements: bool = Field(True, description="Включить требования")
    include_diagrams: bool = Field(False, description="Включить диаграммы")
    include_changelog: bool = Field(False, description="Включить историю изменений")
    template_id: Optional[int] = Field(None, gt=0, description="ID шаблона")


# === Экспорт и импорт ===


class SpecificationExportRequest(BaseSchema):
    """
    Запрос на экспорт спецификаций.
    """

    format: str = Field(
        "xlsx", pattern="^(xlsx|csv|pdf|json|docx)$", description="Формат экспорта"
    )
    filter: Optional[SpecificationFilter] = Field(None, description="Фильтр для экспорта")
    include_requirements: bool = Field(False, description="Включить требования")
    include_content: bool = Field(True, description="Включить содержимое")
    include_statistics: bool = Field(False, description="Включить статистику")


# === Константы и утилиты ===


class SpecificationConfig:
    """
    Конфигурация схем спецификаций.
    """

    # Схемы для различных контекстов
    MINIMAL = SpecificationResponse
    STANDARD = SpecificationWithRelations
    DETAILED = SpecificationDetailed

    # Поддерживаемые форматы документов
    DOCUMENT_FORMATS = ["docx", "pdf", "html", "md"]

    # Поддерживаемые форматы экспорта
    EXPORT_FORMATS = ["xlsx", "csv", "pdf", "json", "docx"]
