"""
Analytics Reports Schemas.

Pydantic models для операций с аналитическими отчетами.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Analytics Report Enums ===


class AnalyticsReportType(str, Enum):
    """Типы аналитических отчетов."""

    BUSINESS_INTELLIGENCE = "business_intelligence"
    TREND_ANALYSIS = "trend_analysis"
    PERFORMANCE_ANALYSIS = "performance_analysis"
    USER_BEHAVIOR = "user_behavior"
    PROJECT_ANALYTICS = "project_analytics"
    QUALITY_ANALYTICS = "quality_analytics"
    FINANCIAL_REPORT = "financial_report"
    CUSTOM_ANALYTICS = "custom_analytics"


class ReportFormat(str, Enum):
    """Форматы отчетов."""

    PDF = "pdf"
    EXCEL = "excel"
    POWERPOINT = "powerpoint"
    HTML = "html"
    JSON = "json"
    CSV = "csv"


class ReportStatus(str, Enum):
    """Статусы отчетов."""

    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    SCHEDULED = "scheduled"


class ScheduleFrequency(str, Enum):
    """Частота расписания отчетов."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


# === Analytics Report Request Schemas ===


class AnalyticsReportRequest(BaseSchema):
    """Analytics report generation request."""

    report_type: AnalyticsReportType = Field(
        ..., description="Тип аналитического отчета"
    )
    format: ReportFormat = Field(ReportFormat.PDF, description="Формат отчета")
    period: str = Field("last_30_days", description="Период анализа")
    parameters: Dict[str, Any] = Field({}, description="Параметры отчета")
    filters: Dict[str, Any] = Field({}, description="Фильтры данных")
    include_charts: bool = Field(True, description="Включить графики")
    include_raw_data: bool = Field(False, description="Включить сырые данные")
    email_recipients: List[str] = Field([], description="Email получателей")


# === Analytics Report Response Schemas ===


class AnalyticsReportResponse(BaseSchema):
    """Analytics report information."""

    id: str = Field(..., description="ID отчета")
    name: str = Field(..., description="Название отчета")
    report_type: AnalyticsReportType = Field(..., description="Тип отчета")
    format: ReportFormat = Field(..., description="Формат")
    status: ReportStatus = Field(..., description="Статус")
    period: str = Field(..., description="Период анализа")
    file_size_bytes: int = Field(0, description="Размер файла")
    generated_by: int = Field(..., description="ID создателя")
    generated_at: datetime = Field(..., description="Дата генерации")
    download_url: Optional[str] = Field(None, description="URL для скачивания")
    expires_at: Optional[datetime] = Field(None, description="Дата истечения")


class ReportListResponse(BaseSchema):
    """Response for analytics reports list."""

    reports: List[AnalyticsReportResponse] = Field(..., description="Список отчетов")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


class ReportGenerationResponse(BaseSchema):
    """Report generation response."""

    success: bool = Field(..., description="Успешность генерации")
    report_id: str = Field(..., description="ID отчета")
    download_url: str = Field(..., description="URL для скачивания")
    format: ReportFormat = Field(..., description="Формат отчета")
    file_size_bytes: int = Field(0, description="Размер файла")
    estimated_completion: Optional[datetime] = Field(
        None, description="Ожидаемое время завершения"
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время генерации"
    )


# === Business Intelligence Schemas ===


class BIMetric(BaseSchema):
    """Business Intelligence metric."""

    name: str = Field(..., description="Название метрики")
    value: float = Field(..., description="Значение")
    unit: str = Field(..., description="Единица измерения")
    trend: str = Field(..., description="Тренд")
    change_percentage: float = Field(..., description="Изменение в процентах")
    benchmark: Optional[float] = Field(None, description="Эталонное значение")


class BISection(BaseSchema):
    """Business Intelligence section."""

    section_name: str = Field(..., description="Название секции")
    metrics: List[BIMetric] = Field(..., description="Метрики секции")
    insights: List[str] = Field([], description="Инсайты")
    recommendations: List[str] = Field([], description="Рекомендации")


class BusinessIntelligenceResponse(BaseSchema):
    """Business Intelligence report response."""

    report_id: str = Field(..., description="ID отчета")
    period: str = Field(..., description="Период анализа")
    executive_summary: str = Field(..., description="Краткое резюме")
    sections: List[BISection] = Field(..., description="Секции отчета")
    key_findings: List[str] = Field(..., description="Ключевые находки")
    action_items: List[str] = Field(..., description="Рекомендуемые действия")
    generated_at: datetime = Field(..., description="Дата генерации")


# === Trend Analysis Schemas ===


class TrendDataPoint(BaseSchema):
    """Trend analysis data point."""

    date: datetime = Field(..., description="Дата точки")
    value: float = Field(..., description="Значение")
    predicted: bool = Field(False, description="Прогнозное значение")


class TrendMetric(BaseSchema):
    """Trend metric analysis."""

    metric_name: str = Field(..., description="Название метрики")
    data_points: List[TrendDataPoint] = Field(..., description="Точки данных")
    trend_direction: str = Field(..., description="Направление тренда")
    growth_rate: Optional[float] = Field(None, description="Темп роста")
    correlation_factors: List[str] = Field([], description="Факторы корреляции")
    forecast: Optional[List[TrendDataPoint]] = Field(None, description="Прогноз")


class TrendAnalysisResponse(BaseSchema):
    """Trend analysis report response."""

    report_id: str = Field(..., description="ID отчета")
    analysis_period: str = Field(..., description="Период анализа")
    metrics: List[TrendMetric] = Field(..., description="Анализируемые метрики")
    overall_trends: List[str] = Field(..., description="Общие тренды")
    anomalies: List[str] = Field([], description="Выявленные аномалии")
    predictions: Dict[str, Any] = Field({}, description="Прогнозы")
    confidence_level: float = Field(..., description="Уровень доверия")
    generated_at: datetime = Field(..., description="Дата генерации")


# === Report Templates Schemas ===


class ReportTemplateParameter(BaseSchema):
    """Report template parameter."""

    name: str = Field(..., description="Название параметра")
    type: str = Field(..., description="Тип параметра")
    required: bool = Field(..., description="Обязательный параметр")
    default_value: Optional[Any] = Field(None, description="Значение по умолчанию")
    description: str = Field(..., description="Описание параметра")


class ReportTemplateResponse(BaseSchema):
    """Report template information."""

    id: int = Field(..., description="ID шаблона")
    name: str = Field(..., description="Название шаблона")
    description: str = Field(..., description="Описание шаблона")
    report_type: AnalyticsReportType = Field(..., description="Тип отчета")
    parameters: List[ReportTemplateParameter] = Field(
        ..., description="Параметры шаблона"
    )
    is_default: bool = Field(False, description="Шаблон по умолчанию")
    created_by: int = Field(..., description="ID создателя")
    created_at: datetime = Field(..., description="Дата создания")


# === Report Scheduling Schemas ===


class ReportScheduleRequest(BaseSchema):
    """Report schedule request."""

    report_type: AnalyticsReportType = Field(..., description="Тип отчета")
    frequency: ScheduleFrequency = Field(..., description="Частота генерации")
    parameters: Dict[str, Any] = Field({}, description="Параметры отчета")
    format: ReportFormat = Field(ReportFormat.PDF, description="Формат отчета")
    email_recipients: List[str] = Field(..., description="Email получателей")
    start_date: datetime = Field(..., description="Дата начала расписания")
    end_date: Optional[datetime] = Field(None, description="Дата окончания")
    is_active: bool = Field(True, description="Активно ли расписание")


class ReportScheduleResponse(BaseSchema):
    """Report schedule response."""

    id: int = Field(..., description="ID расписания")
    report_type: AnalyticsReportType = Field(..., description="Тип отчета")
    frequency: ScheduleFrequency = Field(..., description="Частота")
    next_execution: datetime = Field(..., description="Следующее выполнение")
    last_execution: Optional[datetime] = Field(None, description="Последнее выполнение")
    email_recipients: List[str] = Field(..., description="Получатели")
    is_active: bool = Field(..., description="Активно ли расписание")
    created_by: int = Field(..., description="ID создателя")
    created_at: datetime = Field(..., description="Дата создания")


# === Performance Analytics Schemas ===


class PerformanceMetric(BaseSchema):
    """Performance metric data."""

    metric_name: str = Field(..., description="Название метрики")
    current_value: float = Field(..., description="Текущее значение")
    previous_value: Optional[float] = Field(None, description="Предыдущее значение")
    target_value: Optional[float] = Field(None, description="Целевое значение")
    performance_rating: str = Field(..., description="Рейтинг производительности")
    bottlenecks: List[str] = Field([], description="Узкие места")


class PerformanceAnalysisResponse(BaseSchema):
    """Performance analysis response."""

    report_id: str = Field(..., description="ID отчета")
    analysis_period: str = Field(..., description="Период анализа")
    performance_metrics: List[PerformanceMetric] = Field(
        ..., description="Метрики производительности"
    )
    overall_performance_score: float = Field(
        ..., description="Общий балл производительности"
    )
    improvement_areas: List[str] = Field(..., description="Области для улучшения")
    optimization_recommendations: List[str] = Field(
        ..., description="Рекомендации по оптимизации"
    )
    generated_at: datetime = Field(..., description="Дата генерации")


# === Custom Analytics Schemas ===


class CustomAnalyticsRequest(BaseSchema):
    """Custom analytics request."""

    analysis_name: str = Field(..., description="Название анализа")
    data_sources: List[str] = Field(..., description="Источники данных")
    metrics: List[str] = Field(..., description="Метрики для анализа")
    dimensions: List[str] = Field(..., description="Измерения")
    filters: Dict[str, Any] = Field({}, description="Фильтры")
    aggregation_type: str = Field("sum", description="Тип агрегации")
    period: str = Field("last_30_days", description="Период")


class CustomAnalyticsResponse(BaseSchema):
    """Custom analytics response."""

    analysis_name: str = Field(..., description="Название анализа")
    results: Dict[str, Any] = Field(..., description="Результаты анализа")
    analytics_metadata: Dict[str, Any] = Field(
        ..., description="Метаданные", alias="metadata"
    )
    generated_at: datetime = Field(..., description="Дата генерации")


# === Report Export Schemas ===


class ReportExportRequest(BaseSchema):
    """Report export request."""

    report_ids: List[str] = Field(..., description="ID отчетов для экспорта")
    export_format: ReportFormat = Field(..., description="Формат экспорта")
    include_metadata: bool = Field(True, description="Включить метаданные")
    compress_files: bool = Field(True, description="Сжать файлы")


class ReportExportResponse(BaseSchema):
    """Report export response."""

    success: bool = Field(..., description="Успешность экспорта")
    export_id: str = Field(..., description="ID экспорта")
    download_url: str = Field(..., description="URL для скачивания")
    total_reports: int = Field(..., description="Количество отчетов")
    file_size_bytes: int = Field(..., description="Размер файла")
    expires_at: datetime = Field(..., description="Время истечения")
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время генерации"
    )
