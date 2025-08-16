"""
Quality Specifications Schemas.

Pydantic models для операций со спецификациями.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Specification Enums ===


class SpecificationStatus(str, Enum):
    """Статусы спецификаций."""

    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    DEPRECATED = "deprecated"


class DocumentFormat(str, Enum):
    """Форматы документов."""

    PDF = "pdf"
    DOCX = "docx"
    HTML = "html"
    MARKDOWN = "markdown"
    XLSX = "xlsx"


class SpecificationType(str, Enum):
    """Типы спецификаций."""

    FUNCTIONAL = "functional"
    TECHNICAL = "technical"
    API = "api"
    USER_INTERFACE = "user_interface"
    SYSTEM_ARCHITECTURE = "system_architecture"
    TEST = "test"
    SECURITY = "security"


# === Specification Request Schemas ===


class SpecificationCreateRequest(BaseSchema):
    """Schema for creating a specification."""

    title: str = Field(
        ..., min_length=1, max_length=255, description="Заголовок спецификации"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание спецификации"
    )
    project_id: int = Field(..., description="ID проекта")
    content: str = Field(..., description="Содержимое спецификации")
    specification_type: SpecificationType = Field(
        SpecificationType.FUNCTIONAL, description="Тип спецификации"
    )
    template_id: Optional[int] = Field(None, description="ID шаблона")


class SpecificationUpdateRequest(BaseSchema):
    """Schema for updating a specification."""

    title: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Заголовок"
    )
    description: Optional[str] = Field(None, max_length=1000, description="Описание")
    content: Optional[str] = Field(None, description="Содержимое")
    status: Optional[SpecificationStatus] = Field(None, description="Статус")
    specification_type: Optional[SpecificationType] = Field(None, description="Тип")


# === Specification Response Schemas ===


class SpecificationResponse(BaseSchema):
    """Basic specification information."""

    id: int = Field(..., description="ID спецификации")
    title: str = Field(..., description="Заголовок")
    description: Optional[str] = Field(None, description="Описание")
    project_id: int = Field(..., description="ID проекта")
    status: SpecificationStatus = Field(..., description="Статус")
    version: str = Field(..., description="Версия")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")


class SpecificationDetailResponse(SpecificationResponse):
    """Detailed specification information."""

    content: str = Field(..., description="Содержимое спецификации")
    specification_type: SpecificationType = Field(..., description="Тип спецификации")
    created_by: int = Field(..., description="ID создателя")

    # Статистика
    requirements_count: int = Field(0, description="Количество покрытых требований")
    coverage_percentage: float = Field(0.0, description="Процент покрытия требований")
    last_generated_at: Optional[datetime] = Field(
        None, description="Дата последней генерации"
    )


class SpecificationListResponse(BaseSchema):
    """Response for specification list with pagination."""

    specifications: List[SpecificationResponse] = Field(
        ..., description="Список спецификаций"
    )
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


class SpecificationOperationResponse(BaseSchema):
    """Response for specification operations."""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение операции")
    specification_id: int = Field(..., description="ID спецификации")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время операции"
    )


# === Document Generation Schemas ===


class DocumentGenerationRequest(BaseSchema):
    """Schema for document generation request."""

    format: DocumentFormat = Field(..., description="Формат документа")
    template_id: Optional[int] = Field(None, description="ID шаблона")
    include_requirements: bool = Field(True, description="Включить требования")
    include_test_cases: bool = Field(False, description="Включить тест-кейсы")
    include_cover_page: bool = Field(True, description="Включить титульную страницу")
    include_toc: bool = Field(True, description="Включить оглавление")


class DocumentGenerationResponse(BaseSchema):
    """Response for document generation."""

    success: bool = Field(..., description="Успешность генерации")
    document_id: str = Field(..., description="ID сгенерированного документа")
    download_url: str = Field(..., description="URL для скачивания")
    format: DocumentFormat = Field(..., description="Формат документа")
    file_size_bytes: int = Field(0, description="Размер файла в байтах")
    pages_count: int = Field(0, description="Количество страниц")
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время генерации"
    )


# === Coverage Analysis Schemas ===


class RequirementCoverage(BaseSchema):
    """Requirement coverage information."""

    requirement_id: int = Field(..., description="ID требования")
    requirement_title: str = Field(..., description="Заголовок требования")
    is_covered: bool = Field(..., description="Покрыто ли требование")
    coverage_level: str = Field(..., description="Уровень покрытия")
    section_references: List[str] = Field([], description="Ссылки на разделы")


class CoverageAnalysisResponse(BaseSchema):
    """Coverage analysis response."""

    specification_id: int = Field(..., description="ID спецификации")
    total_requirements: int = Field(..., description="Общее количество требований")
    covered_requirements: int = Field(..., description="Покрытые требования")
    coverage_percentage: float = Field(..., description="Процент покрытия")
    requirements_coverage: List[RequirementCoverage] = Field(
        ..., description="Детали покрытия"
    )
    gaps_identified: List[str] = Field([], description="Выявленные пробелы")
    recommendations: List[str] = Field([], description="Рекомендации")


# === Template Schemas ===


class SpecificationTemplate(BaseSchema):
    """Specification template information."""

    id: int = Field(..., description="ID шаблона")
    name: str = Field(..., description="Название шаблона")
    description: Optional[str] = Field(None, description="Описание шаблона")
    specification_type: SpecificationType = Field(..., description="Тип спецификации")
    template_content: str = Field(..., description="Содержимое шаблона")
    is_default: bool = Field(False, description="Шаблон по умолчанию")
    created_at: datetime = Field(..., description="Дата создания")


class TemplateListResponse(BaseSchema):
    """Response for template list."""

    templates: List[SpecificationTemplate] = Field(..., description="Список шаблонов")
    total: int = Field(..., description="Общее количество")


# === Version Control Schemas ===


class SpecificationVersion(BaseSchema):
    """Specification version information."""

    id: int = Field(..., description="ID версии")
    specification_id: int = Field(..., description="ID спецификации")
    version_number: str = Field(..., description="Номер версии")
    change_summary: str = Field(..., description="Краткое описание изменений")
    content_snapshot: str = Field(..., description="Снимок содержимого")
    created_by: int = Field(..., description="ID создателя версии")
    created_at: datetime = Field(..., description="Дата создания")


class VersionHistoryResponse(BaseSchema):
    """Version history response."""

    specification_id: int = Field(..., description="ID спецификации")
    current_version: str = Field(..., description="Текущая версия")
    versions: List[SpecificationVersion] = Field(..., description="История версий")
    total_versions: int = Field(..., description="Общее количество версий")


# === Export/Import Schemas ===


class SpecificationExportRequest(BaseSchema):
    """Schema for specification export."""

    specification_ids: List[int] = Field(
        ..., description="IDs спецификаций для экспорта"
    )
    format: DocumentFormat = Field(..., description="Формат экспорта")
    include_metadata: bool = Field(True, description="Включить метаданные")
    include_version_history: bool = Field(False, description="Включить историю версий")


class SpecificationImportRequest(BaseSchema):
    """Schema for specification import."""

    project_id: int = Field(..., description="ID проекта для импорта")
    file_url: str = Field(..., description="URL файла для импорта")
    format: DocumentFormat = Field(..., description="Формат файла")
    merge_strategy: str = Field("create_new", description="Стратегия слияния")


class ImportResultResponse(BaseSchema):
    """Import result response."""

    success: bool = Field(..., description="Успешность импорта")
    imported_specifications: List[int] = Field(
        [], description="IDs импортированных спецификаций"
    )
    warnings: List[str] = Field([], description="Предупреждения")
    errors: List[str] = Field([], description="Ошибки")
    total_imported: int = Field(0, description="Количество импортированных")
