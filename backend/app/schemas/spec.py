"""
Схемы для модели Spec (спецификации).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import Field
from pydantic import field_validator

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ProjectRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class SpecBase(BaseSchema, ValidationMixin):
    """Базовая схема спецификации."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Название спецификации",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание спецификации"
    )
    version: str = Field(
        "1.0", max_length=FieldLimits.VERSION_MAX, description="Версия спецификации"
    )
    format: str = Field(
        "pdf", max_length=FieldLimits.SHORT_STRING_MAX, description="Формат документа"
    )
    language: str = Field("ru", max_length=10, description="Язык спецификации")

    @field_validator("version")
    def validate_version(cls, v):
        """Валидация версии спецификации"""
        if not v or not v.strip():
            raise ValueError("Specification version cannot be empty")
        # Простая проверка формата версии
        import re

        if not re.match(r"^\d+\.\d+(\.\d+)?(-\w+)?$", v.strip()):
            raise ValueError(
                "Invalid version format. Use formats like 1.0, 1.0.0, 1.0.0-alpha"
            )
        return v.strip()

    @field_validator("format")
    def validate_format(cls, v):
        """Валидация формата документа"""
        allowed_formats = ["pdf", "html", "docx", "markdown"]
        if v not in allowed_formats:
            raise ValueError(f"Format must be one of: {allowed_formats}")
        return v

    @field_validator("language")
    def validate_language(cls, v):
        """Валидация языка спецификации"""
        allowed_languages = ["ru", "en"]
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {allowed_languages}")
        return v


class SpecCreate(CreateSchema, SpecBase, ProjectRelatedSchema):
    """Схема для создания спецификации."""

    content: Optional[Dict[str, Any]] = Field(
        None, description="Содержимое спецификации в JSON формате"
    )
    status: str = Field(
        "draft",
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Статус спецификации",
    )
    template_id: Optional[int] = Field(
        None, gt=0, description="ID шаблона спецификации"
    )
    generated_by: Optional[int] = Field(
        None, gt=0, description="ID пользователя, создавшего спецификацию"
    )

    @field_validator("status")
    def validate_status(cls, v):
        """Валидация статуса спецификации"""
        allowed_statuses = ["draft", "generated", "published", "archived"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {allowed_statuses}")
        return v


class SpecUpdate(UpdateSchema):
    """Схема для обновления спецификации."""

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Название спецификации",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание спецификации"
    )
    version: Optional[str] = Field(
        None, max_length=FieldLimits.VERSION_MAX, description="Версия спецификации"
    )
    content: Optional[Dict[str, Any]] = Field(
        None, description="Содержимое спецификации в JSON формате"
    )
    format: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Формат документа"
    )
    language: Optional[str] = Field(
        None, max_length=10, description="Язык спецификации"
    )
    status: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Статус спецификации"
    )
    template_id: Optional[int] = Field(
        None, gt=0, description="ID шаблона спецификации"
    )


class Spec(ResponseSchema, SpecBase, ProjectRelatedSchema):
    """Схема спецификации для ответов API."""

    content: Optional[Dict[str, Any]] = Field(
        None, description="Содержимое спецификации"
    )
    status: str = Field(..., description="Статус спецификации")
    template_id: Optional[int] = Field(None, description="ID шаблона")
    generated_by: Optional[int] = Field(None, description="ID создателя")


class SpecWithRequirements(Spec):
    """Схема спецификации с информацией о требованиях."""

    requirements_count: int = Field(0, ge=0, description="Количество требований")


class SpecDetailed(Spec):
    """Детальная схема спецификации с дополнительной информацией."""

    project_name: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Название проекта"
    )
    generated_by_name: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Имя создателя"
    )
    requirements_count: int = Field(0, ge=0, description="Количество требований")


# === Псевдонимы для обратной совместимости ===

SpecificationGenerationResponse = SpecDetailed  # Ответ генерации спецификации
SpecificationGenerationOptions = SpecCreate  # Опции генерации спецификации
