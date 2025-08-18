"""
System Metrics and Statistics Schemas.

Схемы для метрик и статистики системы.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
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


class TimeRange(str, Enum):
    """Временные диапазоны для метрик."""

    HOUR = "1h"
    DAY = "1d"
    WEEK = "1w"
    MONTH = "1m"
    QUARTER = "3m"
    YEAR = "1y"


# === System Metrics Schemas ===


class SystemMetricsResponse(BaseSchema):
    """Схема для системных метрик."""

    # Performance metrics
    response_time_avg: float = Field(..., description="Среднее время отклика в мс")
    response_time_p95: float = Field(..., description="95-й перцентиль времени отклика")
    response_time_p99: float = Field(..., description="99-й перцентиль времени отклика")
    requests_per_second: float = Field(..., description="Запросов в секунду")
    error_rate: float = Field(..., description="Процент ошибок")

    # Resource usage
    cpu_usage: float = Field(..., description="Использование CPU в процентах")
    memory_usage: float = Field(..., description="Использование памяти в процентах")
    memory_total: int = Field(..., description="Общая память в байтах")
    memory_available: int = Field(..., description="Доступная память в байтах")
    disk_usage: float = Field(..., description="Использование диска в процентах")
    disk_total: int = Field(..., description="Общий размер диска в байтах")
    disk_free: int = Field(..., description="Свободное место на диске в байтах")

    # Network
    network_bytes_sent: int = Field(..., description="Отправлено байт по сети")
    network_bytes_recv: int = Field(..., description="Получено байт по сети")
    active_connections: int = Field(..., description="Активные сетевые соединения")

    # Database
    db_connections_active: int = Field(..., description="Активные подключения к БД")
    db_connections_idle: int = Field(..., description="Неактивные подключения к БД")
    db_queries_per_second: float = Field(..., description="Запросов к БД в секунду")
    db_slow_queries: int = Field(..., description="Медленных запросов к БД")
    db_size: int = Field(..., description="Размер базы данных в байтах")

    # Cache metrics (if Redis available)
    cache_hit_rate: Optional[float] = Field(None, description="Процент попаданий в кеш")
    cache_memory_usage: Optional[int] = Field(
        None, description="Использование памяти кешем"
    )
    cache_operations_per_second: Optional[float] = Field(
        None, description="Операций кеша в секунду"
    )


class MetricDataPoint(BaseSchema):
    """Схема для точки данных метрики."""

    timestamp: datetime = Field(..., description="Время измерения")
    value: float = Field(..., description="Значение метрики")
    labels: Optional[Dict[str, str]] = Field(None, description="Метки метрики")


class MetricSeries(BaseSchema):
    """Схема для временного ряда метрики."""

    name: str = Field(..., description="Название метрики")
    type: MetricType = Field(..., description="Тип метрики")
    description: Optional[str] = Field(None, description="Описание метрики")
    unit: Optional[str] = Field(None, description="Единица измерения")
    data_points: List[MetricDataPoint] = Field(..., description="Точки данных")


class MetricsResponse(BaseSchema):
    """Схема для ответа с метриками."""

    series: List[MetricSeries] = Field(..., description="Временные ряды метрик")
    time_range: TimeRange = Field(..., description="Временной диапазон")
    resolution: str = Field(..., description="Разрешение данных (1m, 5m, 1h, etc.)")
    generated_at: datetime = Field(..., description="Время генерации")


class MetricsRequest(BaseSchema):
    """Схема для запроса метрик."""

    metric_names: Optional[List[str]] = Field(
        None, description="Названия метрик (все если None)"
    )
    time_range: TimeRange = Field(
        default=TimeRange.HOUR, description="Временной диапазон"
    )
    resolution: Optional[str] = Field(None, description="Разрешение данных")
    start_time: Optional[datetime] = Field(None, description="Начальное время")
    end_time: Optional[datetime] = Field(None, description="Конечное время")
    labels: Optional[Dict[str, str]] = Field(None, description="Фильтр по меткам")


# === Application Metrics Schemas ===


class ApplicationMetrics(BaseSchema):
    """Схема для метрик приложения."""

    # User activity
    active_users_1h: int = Field(..., description="Активные пользователи за час")
    active_users_24h: int = Field(..., description="Активные пользователи за сутки")
    new_registrations_24h: int = Field(..., description="Новых регистраций за сутки")
    total_sessions: int = Field(..., description="Общее количество сессий")

    # Business metrics
    total_users: int = Field(..., description="Общее количество пользователей")
    total_companies: int = Field(..., description="Общее количество компаний")
    total_projects: int = Field(..., description="Общее количество проектов")
    total_requirements: int = Field(..., description="Общее количество требований")

    # Content metrics
    files_uploaded_24h: int = Field(..., description="Файлов загружено за сутки")
    total_file_size: int = Field(..., description="Общий размер файлов в байтах")
    comments_created_24h: int = Field(..., description="Комментариев создано за сутки")

    # API metrics
    api_requests_24h: int = Field(..., description="API запросов за сутки")
    api_errors_24h: int = Field(..., description="API ошибок за сутки")
    average_api_response_time: float = Field(
        ..., description="Среднее время отклика API в мс"
    )


# === Error Metrics Schemas ===


class ErrorMetrics(BaseSchema):
    """Схема для метрик ошибок."""

    # HTTP errors
    errors_4xx_24h: int = Field(..., description="4xx ошибок за сутки")
    errors_5xx_24h: int = Field(..., description="5xx ошибок за сутки")

    # Application errors
    exceptions_24h: int = Field(..., description="Исключений за сутки")
    critical_errors_24h: int = Field(..., description="Критических ошибок за сутки")

    # Top errors
    top_error_types: List[Dict[str, Any]] = Field(..., description="Топ типов ошибок")
    top_error_endpoints: List[Dict[str, Any]] = Field(
        ..., description="Топ эндпоинтов с ошибками"
    )


class ErrorDetail(BaseSchema):
    """Схема для детали ошибки."""

    error_type: str = Field(..., description="Тип ошибки")
    message: str = Field(..., description="Сообщение об ошибке")
    count: int = Field(..., description="Количество вхождений")
    last_occurrence: datetime = Field(..., description="Последнее вхождение")
    endpoint: Optional[str] = Field(None, description="Эндпоинт где произошла ошибка")
    status_code: Optional[int] = Field(None, description="HTTP статус код")


class ErrorDetailsResponse(BaseSchema):
    """Схема для ответа с деталями ошибок."""

    errors: List[ErrorDetail] = Field(..., description="Список ошибок")
    total: int = Field(..., description="Общее количество типов ошибок")
    time_range: TimeRange = Field(..., description="Временной диапазон")


# === Performance Metrics Schemas ===


class PerformanceMetrics(BaseSchema):
    """Схема для метрик производительности."""

    # Response times
    avg_response_time: float = Field(..., description="Среднее время отклика в мс")
    p50_response_time: float = Field(..., description="50-й перцентиль времени отклика")
    p90_response_time: float = Field(..., description="90-й перцентиль времени отклика")
    p95_response_time: float = Field(..., description="95-й перцентиль времени отклика")
    p99_response_time: float = Field(..., description="99-й перцентиль времени отклика")

    # Throughput
    requests_per_second: float = Field(..., description="Запросов в секунду")
    requests_per_minute: float = Field(..., description="Запросов в минуту")

    # Database performance
    avg_db_query_time: float = Field(..., description="Среднее время запроса к БД в мс")
    slow_queries_count: int = Field(..., description="Количество медленных запросов")

    # Slowest endpoints
    slowest_endpoints: List[Dict[str, Any]] = Field(
        ..., description="Самые медленные эндпоинты"
    )


# === Custom Metrics Schemas ===


class CustomMetricDefinition(BaseSchema):
    """Схема для определения пользовательской метрики."""

    name: str = Field(..., description="Название метрики")
    type: MetricType = Field(..., description="Тип метрики")
    description: Optional[str] = Field(None, description="Описание")
    unit: Optional[str] = Field(None, description="Единица измерения")
    labels: List[str] = Field(default_factory=list, description="Доступные метки")


class CustomMetricsListResponse(BaseSchema):
    """Схема для списка пользовательских метрик."""

    metrics: List[CustomMetricDefinition] = Field(..., description="Список метрик")
    total: int = Field(..., description="Общее количество метрик")
