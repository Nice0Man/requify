"""
Analytics Dashboard Schemas.

Pydantic models для операций с аналитическим дашбордом.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Dashboard Enums ===


class DashboardLayout(str, Enum):
    """Типы компоновки дашборда."""

    GRID = "grid"
    MASONRY = "masonry"
    FLEXIBLE = "flexible"
    FIXED = "fixed"


class DashboardTheme(str, Enum):
    """Темы дашборда."""

    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"


class WidgetType(str, Enum):
    """Типы виджетов дашборда."""

    CHART = "chart"
    METRIC = "metric"
    TABLE = "table"
    COUNTER = "counter"
    PROGRESS = "progress"
    LIST = "list"
    CALENDAR = "calendar"
    MAP = "map"


class MetricType(str, Enum):
    """Типы метрик."""

    PROJECTS = "projects"
    REQUIREMENTS = "requirements"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    USERS = "users"
    ACTIVITY = "activity"


class ExportFormat(str, Enum):
    """Форматы экспорта."""

    PDF = "pdf"
    EXCEL = "excel"
    PNG = "png"
    JSON = "json"


# === Dashboard Overview Schemas ===


class ProjectMetric(BaseSchema):
    """Project metric data."""

    total_projects: int = Field(..., description="Общее количество проектов")
    active_projects: int = Field(..., description="Активные проекты")
    completed_projects: int = Field(..., description="Завершенные проекты")
    overdue_projects: int = Field(..., description="Просроченные проекты")
    completion_rate: float = Field(..., description="Процент завершения")


class RequirementMetric(BaseSchema):
    """Requirement metric data."""

    total_requirements: int = Field(..., description="Общее количество требований")
    approved_requirements: int = Field(..., description="Утвержденные требования")
    pending_requirements: int = Field(..., description="Ожидающие требования")
    coverage_percentage: float = Field(..., description="Процент покрытия")


class QualityMetric(BaseSchema):
    """Quality metric data."""

    total_tests: int = Field(..., description="Общее количество тестов")
    passed_tests: int = Field(..., description="Пройденные тесты")
    failed_tests: int = Field(..., description="Проваленные тесты")
    test_coverage: float = Field(..., description="Покрытие тестами")
    defect_density: float = Field(..., description="Плотность дефектов")


class DashboardOverviewResponse(BaseSchema):
    """Dashboard overview response."""

    user_id: int = Field(..., description="ID пользователя")
    period: str = Field(..., description="Период данных")
    project_id: Optional[int] = Field(None, description="ID проекта фильтра")
    
    # Метрики
    project_metrics: ProjectMetric = Field(..., description="Метрики проектов")
    requirement_metrics: RequirementMetric = Field(..., description="Метрики требований")
    quality_metrics: QualityMetric = Field(..., description="Метрики качества")
    
    # Дополнительные данные
    overview_data: Dict[str, Any] = Field({}, description="Дополнительные данные обзора")
    generated_at: datetime = Field(..., description="Время генерации")


# === Dashboard Metrics Schemas ===


class MetricValue(BaseSchema):
    """Individual metric value."""

    name: str = Field(..., description="Название метрики")
    value: float = Field(..., description="Значение метрики")
    unit: str = Field(..., description="Единица измерения")
    change_percentage: Optional[float] = Field(None, description="Изменение в процентах")
    trend: Optional[str] = Field(None, description="Тренд: up, down, stable")


class DashboardMetricsResponse(BaseSchema):
    """Dashboard metrics response."""

    user_id: int = Field(..., description="ID пользователя")
    period: str = Field(..., description="Период метрик")
    project_id: Optional[int] = Field(None, description="ID проекта")
    metric_types: List[str] = Field(..., description="Типы запрошенных метрик")
    
    metrics: Dict[str, List[MetricValue]] = Field(..., description="Метрики по категориям")
    generated_at: datetime = Field(..., description="Время генерации")


# === Dashboard KPI Schemas ===


class KPIValue(BaseSchema):
    """KPI value with target and actual."""

    name: str = Field(..., description="Название KPI")
    actual_value: float = Field(..., description="Фактическое значение")
    target_value: Optional[float] = Field(None, description="Целевое значение")
    achievement_percentage: Optional[float] = Field(None, description="Процент достижения")
    status: str = Field(..., description="Статус: on_track, at_risk, off_track")
    trend_data: Optional[List[float]] = Field(None, description="Данные тренда")


class DashboardKPIResponse(BaseSchema):
    """Dashboard KPI response."""

    user_id: int = Field(..., description="ID пользователя")
    period: str = Field(..., description="Период KPI")
    kpi_categories: List[str] = Field(..., description="Категории KPI")
    
    kpis: Dict[str, List[KPIValue]] = Field(..., description="KPI по категориям")
    include_trends: bool = Field(..., description="Включены ли тренды")
    generated_at: datetime = Field(..., description="Время генерации")


# === Dashboard Widget Schemas ===


class WidgetPosition(BaseSchema):
    """Widget position on dashboard."""

    x: int = Field(..., description="Позиция X")
    y: int = Field(..., description="Позиция Y")
    width: int = Field(..., description="Ширина")
    height: int = Field(..., description="Высота")


class WidgetConfig(BaseSchema):
    """Widget configuration."""

    title: str = Field(..., description="Заголовок виджета")
    data_source: str = Field(..., description="Источник данных")
    refresh_interval: int = Field(30, description="Интервал обновления в секундах")
    filters: Dict[str, Any] = Field({}, description="Фильтры виджета")
    display_options: Dict[str, Any] = Field({}, description="Опции отображения")


class DashboardWidgetResponse(BaseSchema):
    """Dashboard widget response."""

    id: int = Field(..., description="ID виджета")
    name: str = Field(..., description="Название виджета")
    widget_type: WidgetType = Field(..., description="Тип виджета")
    position: WidgetPosition = Field(..., description="Позиция виджета")
    size: WidgetPosition = Field(..., description="Размер виджета")
    config: WidgetConfig = Field(..., description="Конфигурация виджета")
    is_active: bool = Field(..., description="Активен ли виджет")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")


# === Dashboard Configuration Schemas ===


class DashboardConfigRequest(BaseSchema):
    """Dashboard configuration request."""

    name: Optional[str] = Field(None, description="Название виджета")
    widget_type: Optional[WidgetType] = Field(None, description="Тип виджета")
    position: Optional[WidgetPosition] = Field(None, description="Позиция")
    size: Optional[WidgetPosition] = Field(None, description="Размер")
    config: Optional[WidgetConfig] = Field(None, description="Конфигурация")
    
    # Dashboard configuration fields
    layout: Optional[DashboardLayout] = Field(None, description="Компоновка дашборда")
    theme: Optional[DashboardTheme] = Field(None, description="Тема дашборда")
    refresh_interval: Optional[int] = Field(None, ge=5, le=300, description="Интервал обновления")
    filters: Optional[Dict[str, Any]] = Field(None, description="Глобальные фильтры")
    widgets_order: Optional[List[int]] = Field(None, description="Порядок виджетов")
    preferences: Optional[Dict[str, Any]] = Field(None, description="Пользовательские настройки")


class DashboardConfigResponse(BaseSchema):
    """Dashboard configuration response."""

    user_id: int = Field(..., description="ID пользователя")
    layout: DashboardLayout = Field(..., description="Компоновка дашборда")
    theme: DashboardTheme = Field(..., description="Тема дашборда")
    refresh_interval: int = Field(..., description="Интервал обновления")
    filters: Dict[str, Any] = Field(..., description="Глобальные фильтры")
    widgets_order: List[int] = Field(..., description="Порядок виджетов")
    preferences: Dict[str, Any] = Field(..., description="Пользовательские настройки")


# === Dashboard Filter Schemas ===


class DashboardFilterRequest(BaseSchema):
    """Dashboard filter request."""

    period: Optional[str] = Field(None, description="Временной период")
    project_ids: Optional[List[int]] = Field(None, description="ID проектов")
    user_ids: Optional[List[int]] = Field(None, description="ID пользователей")
    status_filters: Optional[List[str]] = Field(None, description="Фильтры по статусу")
    custom_filters: Optional[Dict[str, Any]] = Field(None, description="Пользовательские фильтры")


# === Dashboard Export Schemas ===


class DashboardExportRequest(BaseSchema):
    """Dashboard export request."""

    widget_ids: List[int] = Field(..., description="ID виджетов для экспорта")
    format: ExportFormat = Field(..., description="Формат экспорта")
    period: str = Field("last_30_days", description="Период данных")
    include_charts: bool = Field(True, description="Включить графики")
    include_raw_data: bool = Field(False, description="Включить сырые данные")


class DashboardExportResponse(BaseSchema):
    """Dashboard export response."""

    success: bool = Field(..., description="Успешность экспорта")
    export_id: str = Field(..., description="ID экспорта")
    download_url: str = Field(..., description="URL для скачивания")
    format: ExportFormat = Field(..., description="Формат файла")
    file_size_bytes: int = Field(..., description="Размер файла")
    expires_at: Optional[datetime] = Field(None, description="Время истечения ссылки")
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время генерации"
    )


# === Dashboard Operation Schemas ===


class DashboardOperationResponse(BaseSchema):
    """Dashboard operation response."""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение операции")
    widget_id: Optional[int] = Field(None, description="ID виджета")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время операции"
    )


# === Real-time Update Schemas ===


class WidgetUpdate(BaseSchema):
    """Widget update data."""

    widget_id: int = Field(..., description="ID виджета")
    data: Dict[str, Any] = Field(..., description="Обновленные данные")
    last_updated: datetime = Field(..., description="Время последнего обновления")
    status: str = Field(..., description="Статус обновления")


class RealtimeUpdatesResponse(BaseSchema):
    """Real-time updates response."""

    user_id: int = Field(..., description="ID пользователя")
    updates: List[WidgetUpdate] = Field(..., description="Обновления виджетов")
    server_time: datetime = Field(
        default_factory=datetime.utcnow, description="Серверное время"
    )
    has_more_updates: bool = Field(False, description="Есть ли еще обновления")
