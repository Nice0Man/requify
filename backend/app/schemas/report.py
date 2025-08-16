"""
Схемы для отчетов и генерации документов.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    """Базовая схема отчета."""

    status: str = Field(..., description="Статус генерации отчета")
    format: str = Field(..., description="Формат отчета")
    generated_at: str = Field(..., description="Время генерации")


class ReportCreate(ReportBase):
    """Схема для создания отчета."""

    generated_by: str = Field(..., description="Email пользователя, создавшего отчет")
    config: Dict[str, Any] = Field(
        default_factory=dict, description="Конфигурация отчета"
    )


class ReportUpdate(BaseModel):
    """Схема для обновления отчета."""

    status: Optional[str] = Field(None, description="Статус отчета")
    file_path: Optional[str] = Field(None, description="Путь к файлу отчета")
    file_size: Optional[int] = Field(None, ge=0, description="Размер файла в байтах")


class ReportInDBBase(ReportBase):
    """Базовая схема отчета с данными из БД."""

    id: int
    generated_by: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    download_url: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Report(BaseModel):
    """Схема отчета для ответов API."""

    id: Optional[int] = None
    status: str = Field(..., description="Статус генерации отчета")
    format: str = Field(..., description="Формат отчета")
    generated_at: str = Field(..., description="Время генерации")
    generated_by: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    download_url: Optional[str] = None

    # Дополнительные поля для конкретных типов отчетов
    spec_id: Optional[int] = None
    spec_name: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None


class ReportWithDetails(Report):
    """Схема отчета с подробной информацией."""

    requirements_count: Optional[int] = None
    pages_count: Optional[int] = None
    generation_time_ms: Optional[int] = None


class ReportInDB(ReportInDBBase):
    """Схема отчета в БД."""

    pass


# Схемы для конфигурации отчетов


class ReportFilter(BaseModel):
    """Фильтры для отчетов."""

    project_ids: Optional[List[int]] = None
    requirement_types: Optional[List[int]] = None
    requirement_statuses: Optional[List[int]] = None
    requirement_priorities: Optional[List[int]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    author_ids: Optional[List[int]] = None


class ReportConfig(BaseModel):
    """Конфигурация отчета."""

    type: str = Field(..., description="Тип отчета")
    format: str = Field(..., description="Формат отчета")
    filters: Optional[ReportFilter] = None
    include_details: bool = Field(default=True, description="Включать детали")
    include_statistics: bool = Field(default=True, description="Включать статистику")
    include_charts: bool = Field(default=False, description="Включать графики")
    group_by: Optional[str] = Field(None, description="Группировка данных")
    sort_by: Optional[str] = Field(None, description="Сортировка данных")
    template: Optional[str] = Field(None, description="Шаблон отчета")


# Перечисления для типов отчетов


class ReportType:
    """Типы отчетов."""

    SPECIFICATION = "specification"
    REQUIREMENTS = "requirements"
    PROJECT_SUMMARY = "project_summary"
    PROGRESS = "progress"
    TESTING = "testing"
    AUDIT = "audit"
    TRACE_MATRIX = "trace_matrix"


class ReportFormat:
    """Форматы отчетов."""

    HTML = "html"
    PDF = "pdf"
    DOCX = "docx"
    XLSX = "xlsx"
    JSON = "json"
    CSV = "csv"
