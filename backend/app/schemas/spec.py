"""
Схемы для модели Spec (спецификации).
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class SpecBase(BaseModel):
    """Базовая схема спецификации."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Название спецификации"
    )
    description: Optional[str] = Field(
        None, description="Описание спецификации"
    )
    version: str = Field(
        "1.0", description="Версия спецификации"
    )
    format: str = Field(
        "pdf", description="Формат документа"
    )
    language: str = Field(
        "ru", description="Язык спецификации"
    )

    @field_validator("version")
    def validate_version(cls, v):
        """Валидация версии спецификации"""
        if not v or not v.strip():
            raise ValueError("Specification version cannot be empty")
        # Простая проверка формата версии
        import re
        if not re.match(r'^\d+\.\d+(\.\d+)?(-\w+)?$', v.strip()):
            raise ValueError("Invalid version format. Use formats like 1.0, 1.0.0, 1.0.0-alpha")
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


class SpecCreate(SpecBase):
    """Схема для создания спецификации."""

    project_id: int = Field(..., gt=0, description="ID проекта")
    content: Optional[Dict[str, Any]] = Field(
        None, description="Содержимое спецификации в JSON формате"
    )
    status: str = Field(
        "draft", description="Статус спецификации"
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


class SpecUpdate(BaseModel):
    """Схема для обновления спецификации."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Название спецификации"
    )
    description: Optional[str] = Field(
        None, description="Описание спецификации"
    )
    version: Optional[str] = Field(
        None, description="Версия спецификации"
    )
    content: Optional[Dict[str, Any]] = Field(
        None, description="Содержимое спецификации в JSON формате"
    )
    format: Optional[str] = Field(
        None, description="Формат документа"
    )
    language: Optional[str] = Field(
        None, description="Язык спецификации"
    )
    status: Optional[str] = Field(
        None, description="Статус спецификации"
    )
    template_id: Optional[int] = Field(
        None, gt=0, description="ID шаблона спецификации"
    )


class SpecInDBBase(SpecBase):
    """Базовая схема спецификации с данными из БД."""

    id: int
    project_id: int
    content: Optional[Dict[str, Any]] = None
    status: str = "draft"
    template_id: Optional[int] = None
    generated_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Spec(SpecInDBBase):
    """Схема спецификации для ответов API."""

    pass


class SpecWithRequirements(Spec):
    """Схема спецификации с информацией о требованиях."""

    requirements_count: int = 0

    @field_validator("requirements_count")
    def validate_requirements_count(cls, v):
        """Валидация количества требований"""
        if v < 0:
            raise ValueError("Requirements count cannot be negative")
        return v


class SpecInDB(SpecInDBBase):
    """Схема спецификации в БД."""

    pass


class SpecDetailed(Spec):
    """Детальная схема спецификации с дополнительной информацией."""
    
    project_name: Optional[str] = None
    generated_by_name: Optional[str] = None
    requirements_count: int = 0
    
    @field_validator("requirements_count")
    def validate_requirements_count(cls, v):
        """Валидация количества требований"""
        if v < 0:
            raise ValueError("Requirements count cannot be negative")
        return v
