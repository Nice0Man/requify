"""
Analytics Metrics Schemas.

Pydantic models для операций с метриками аналитики.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Metrics Enums ===


class MetricType(str, Enum):
    """Типы метрик."""

    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"
    RATE = "rate"
    PERCENTAGE = "percentage"


class MetricCategory(str, Enum):
    """Категории метрик."""

    BUSINESS = "business"
    TECHNICAL = "technical"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    USER_EXPERIENCE = "user_experience"
    FINANCIAL = "financial"
    OPERATIONAL = "operational"


class AggregationType(str, Enum):
    """Типы агрегации."""

    SUM = "sum"
    AVERAGE = "average"
    COUNT = "count"
    MIN = "min"
    MAX = "max"
    MEDIAN = "median"
    PERCENTILE = "percentile"


class MetricStatus(str, Enum):
    """Статусы метрик."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    DRAFT = "draft"


# === Metric Definition Schemas ===


class MetricDefinitionRequest(BaseSchema):
    """Metric definition request."""

    name: str = Field(..., min_length=1, max_length=255, description="Название метрики")
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание метрики"
    )
    metric_type: MetricType = Field(..., description="Тип метрики")
    category: MetricCategory = Field(..., description="Категория метрики")
    unit: str = Field(..., description="Единица измерения")
    calculation_formula: Optional[str] = Field(None, description="Формула расчета")
    data_source: str = Field(..., description="Источник данных")
    collection_interval: int = Field(300, description="Интервал сбора в секундах")
    is_active: bool = Field(True, description="Активна ли метрика")
    tags: List[str] = Field([], description="Теги метрики")


class MetricDefinitionResponse(BaseSchema):
    """Metric definition response."""

    id: int = Field(..., description="ID метрики")
    name: str = Field(..., description="Название метрики")
    description: Optional[str] = Field(None, description="Описание")
    metric_type: MetricType = Field(..., description="Тип метрики")
    category: MetricCategory = Field(..., description="Категория")
    unit: str = Field(..., description="Единица измерения")
    calculation_formula: Optional[str] = Field(None, description="Формула расчета")
    data_source: str = Field(..., description="Источник данных")
    collection_interval: int = Field(..., description="Интервал сбора")
    is_active: bool = Field(..., description="Активна ли метрика")
    tags: List[str] = Field(..., description="Теги")
    created_by: int = Field(..., description="ID создателя")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")


class MetricListResponse(BaseSchema):
    """Response for metrics list."""

    metrics: List[MetricDefinitionResponse] = Field(..., description="Список метрик")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


# === Metric Value Schemas ===


class MetricValueRequest(BaseSchema):
    """Metric value request."""

    metric_id: int = Field(..., description="ID метрики")
    value: Union[float, int] = Field(..., description="Значение метрики")
    timestamp: Optional[datetime] = Field(None, description="Временная метка")
    dimensions: Dict[str, str] = Field({}, description="Измерения метрики")
    metric_metadata: Dict[str, Any] = Field(
        {}, description="Дополнительные метаданные", alias="metadata"
    )


class MetricValueResponse(BaseSchema):
    """Metric value response."""

    id: int = Field(..., description="ID значения")
    metric_id: int = Field(..., description="ID метрики")
    metric_name: str = Field(..., description="Название метрики")
    value: Union[float, int] = Field(..., description="Значение")
    timestamp: datetime = Field(..., description="Временная метка")
    dimensions: Dict[str, str] = Field(..., description="Измерения")
    metric_metadata: Dict[str, Any] = Field(
        ..., description="Метаданные", alias="metadata"
    )
    collected_at: datetime = Field(..., description="Время сбора")


# === Metric Aggregation Schemas ===


class MetricAggregationRequest(BaseSchema):
    """Metric aggregation request."""

    metric_ids: List[int] = Field(..., description="ID метрик для агрегации")
    aggregation_type: AggregationType = Field(..., description="Тип агрегации")
    time_range: str = Field("last_24_hours", description="Временной диапазон")
    group_by: List[str] = Field([], description="Группировка по измерениям")
    filters: Dict[str, Any] = Field({}, description="Фильтры")
    interval: Optional[str] = Field(None, description="Интервал группировки времени")


class AggregatedMetric(BaseSchema):
    """Aggregated metric result."""

    metric_id: int = Field(..., description="ID метрики")
    metric_name: str = Field(..., description="Название метрики")
    aggregated_value: Union[float, int] = Field(
        ..., description="Агрегированное значение"
    )
    aggregation_type: AggregationType = Field(..., description="Тип агрегации")
    data_points_count: int = Field(..., description="Количество точек данных")
    time_range: str = Field(..., description="Временной диапазон")
    dimensions: Dict[str, str] = Field({}, description="Измерения группировки")


class MetricAggregationResponse(BaseSchema):
    """Metric aggregation response."""

    request_id: str = Field(..., description="ID запроса")
    aggregated_metrics: List[AggregatedMetric] = Field(
        ..., description="Агрегированные метрики"
    )
    total_data_points: int = Field(..., description="Общее количество точек данных")
    calculation_time_ms: int = Field(..., description="Время расчета в миллисекундах")
    generated_at: datetime = Field(..., description="Время генерации")


# === Custom Metrics Schemas ===


class CustomMetricRequest(BaseSchema):
    """Custom metric creation request."""

    name: str = Field(..., description="Название пользовательской метрики")
    description: Optional[str] = Field(None, description="Описание")
    base_metrics: List[int] = Field(..., description="Базовые метрики для расчета")
    calculation_expression: str = Field(..., description="Выражение для расчета")
    unit: str = Field(..., description="Единица измерения")
    category: MetricCategory = Field(..., description="Категория")
    update_frequency: int = Field(3600, description="Частота обновления в секундах")
    is_public: bool = Field(False, description="Публичная ли метрика")


class CustomMetricResponse(BaseSchema):
    """Custom metric response."""

    id: int = Field(..., description="ID пользовательской метрики")
    name: str = Field(..., description="Название")
    description: Optional[str] = Field(None, description="Описание")
    base_metrics: List[int] = Field(..., description="Базовые метрики")
    calculation_expression: str = Field(..., description="Выражение расчета")
    unit: str = Field(..., description="Единица измерения")
    category: MetricCategory = Field(..., description="Категория")
    update_frequency: int = Field(..., description="Частота обновления")
    is_public: bool = Field(..., description="Публичная ли метрика")
    last_calculated: Optional[datetime] = Field(
        None, description="Время последнего расчета"
    )
    current_value: Optional[Union[float, int]] = Field(
        None, description="Текущее значение"
    )
    created_by: int = Field(..., description="ID создателя")
    created_at: datetime = Field(..., description="Дата создания")


# === Metric Monitoring Schemas ===


class MetricAlert(BaseSchema):
    """Metric alert configuration."""

    metric_id: int = Field(..., description="ID метрики")
    alert_name: str = Field(..., description="Название алерта")
    condition: str = Field(..., description="Условие срабатывания")
    threshold_value: Union[float, int] = Field(..., description="Пороговое значение")
    comparison_operator: str = Field(..., description="Оператор сравнения")
    notification_channels: List[str] = Field(..., description="Каналы уведомлений")
    is_active: bool = Field(True, description="Активен ли алерт")


class MetricThreshold(BaseSchema):
    """Metric threshold definition."""

    metric_id: int = Field(..., description="ID метрики")
    warning_threshold: Optional[Union[float, int]] = Field(
        None, description="Порог предупреждения"
    )
    critical_threshold: Optional[Union[float, int]] = Field(
        None, description="Критический порог"
    )
    target_value: Optional[Union[float, int]] = Field(
        None, description="Целевое значение"
    )
    acceptable_range_min: Optional[Union[float, int]] = Field(
        None, description="Минимум допустимого диапазона"
    )
    acceptable_range_max: Optional[Union[float, int]] = Field(
        None, description="Максимум допустимого диапазона"
    )


# === Metric Analysis Schemas ===


class MetricTrendAnalysis(BaseSchema):
    """Metric trend analysis."""

    metric_id: int = Field(..., description="ID метрики")
    trend_direction: str = Field(..., description="Направление тренда")
    trend_strength: float = Field(..., description="Сила тренда (0-1)")
    growth_rate: Optional[float] = Field(None, description="Темп роста")
    seasonal_pattern: bool = Field(..., description="Есть ли сезонность")
    anomalies_detected: int = Field(..., description="Количество обнаруженных аномалий")
    forecast_confidence: float = Field(..., description="Доверие к прогнозу")


class MetricCorrelationAnalysis(BaseSchema):
    """Metric correlation analysis."""

    metric_id_1: int = Field(..., description="ID первой метрики")
    metric_id_2: int = Field(..., description="ID второй метрики")
    correlation_coefficient: float = Field(..., description="Коэффициент корреляции")
    correlation_strength: str = Field(..., description="Сила корреляции")
    statistical_significance: float = Field(
        ..., description="Статистическая значимость"
    )


class MetricAnalysisResponse(BaseSchema):
    """Metric analysis response."""

    analysis_id: str = Field(..., description="ID анализа")
    metric_ids: List[int] = Field(..., description="Анализируемые метрики")
    analysis_period: str = Field(..., description="Период анализа")
    trend_analyses: List[MetricTrendAnalysis] = Field(
        ..., description="Анализы трендов"
    )
    correlation_analyses: List[MetricCorrelationAnalysis] = Field(
        ..., description="Анализы корреляций"
    )
    insights: List[str] = Field(..., description="Выявленные инсайты")
    recommendations: List[str] = Field(..., description="Рекомендации")
    generated_at: datetime = Field(..., description="Время генерации")


# === Metric Operation Schemas ===


class MetricOperationResponse(BaseSchema):
    """Metric operation response."""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение операции")
    metric_id: Optional[int] = Field(None, description="ID метрики")
    operation_type: str = Field(..., description="Тип операции")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время операции"
    )


# === Metric Export Schemas ===


class MetricExportRequest(BaseSchema):
    """Metric export request."""

    metric_ids: List[int] = Field(..., description="ID метрик для экспорта")
    time_range: str = Field(..., description="Временной диапазон")
    format: str = Field("csv", description="Формат экспорта")
    include_metadata: bool = Field(True, description="Включить метаданные")
    aggregation_interval: Optional[str] = Field(None, description="Интервал агрегации")


class MetricExportResponse(BaseSchema):
    """Metric export response."""

    export_id: str = Field(..., description="ID экспорта")
    download_url: str = Field(..., description="URL для скачивания")
    file_size_bytes: int = Field(..., description="Размер файла")
    records_count: int = Field(..., description="Количество записей")
    format: str = Field(..., description="Формат файла")
    expires_at: datetime = Field(..., description="Время истечения ссылки")
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время генерации"
    )


# === Real-time Metrics Schemas ===


class RealtimeMetricUpdate(BaseSchema):
    """Real-time metric update."""

    metric_id: int = Field(..., description="ID метрики")
    current_value: Union[float, int] = Field(..., description="Текущее значение")
    previous_value: Optional[Union[float, int]] = Field(
        None, description="Предыдущее значение"
    )
    change_percentage: Optional[float] = Field(
        None, description="Изменение в процентах"
    )
    status: str = Field(..., description="Статус метрики")
    last_updated: datetime = Field(..., description="Время последнего обновления")


class RealtimeMetricsResponse(BaseSchema):
    """Real-time metrics response."""

    metrics_updates: List[RealtimeMetricUpdate] = Field(
        ..., description="Обновления метрик"
    )
    server_timestamp: datetime = Field(..., description="Серверное время")
    update_sequence: int = Field(..., description="Номер последовательности обновлений")
    has_more_updates: bool = Field(False, description="Есть ли еще обновления")
