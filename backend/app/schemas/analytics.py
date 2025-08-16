"""
Схемы для аналитики и статистики.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import Field, field_validator, model_validator
from sqlmodel import SQLModel

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    TimestampedBase,
    FieldLimits,
    StandardDescriptions,
)
from .common import (
    PriorityEnum,
    StatusEnum,
    DateRangeFilter,
    MetadataSchema,
    CountStatistic,
    TimeSeriesPoint,
    TimeSeriesStatistic,
)


# === Перечисления ===


class MetricTypeEnum(str, Enum):
    """Типы метрик"""

    COUNT = "count"
    PERCENTAGE = "percentage"
    AVERAGE = "average"
    SUM = "sum"
    RATIO = "ratio"
    DURATION = "duration"


class PeriodEnum(str, Enum):
    """Периоды для аналитики"""

    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class ChartTypeEnum(str, Enum):
    """Типы графиков"""

    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    DONUT = "donut"
    AREA = "area"
    SCATTER = "scatter"


class TrendEnum(str, Enum):
    """Типы трендов"""

    UP = "up"
    DOWN = "down"
    STABLE = "stable"
    UNKNOWN = "unknown"


# === Базовые схемы ===


class AnalyticsBase(BaseSchema):
    """Базовая схема для аналитики"""

    name: str = Field(
        ..., max_length=FieldLimits.MEDIUM_STRING_MAX, description="Название метрики"
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    metric_type: MetricTypeEnum = Field(..., description="Тип метрики")
    period: PeriodEnum = Field(..., description="Период агрегации")
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)


class MetricValue(BaseSchema):
    """Значение метрики"""

    value: Union[int, float] = Field(..., description="Значение метрики")
    timestamp: datetime = Field(..., description="Временная метка")
    period_start: Optional[datetime] = Field(None, description="Начало периода")
    period_end: Optional[datetime] = Field(None, description="Конец периода")
    metric_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные данные", alias="metadata"
    )


class DashboardMetric(BaseSchema):
    """Метрика для дашборда"""

    id: str = Field(..., description="Идентификатор метрики")
    title: str = Field(
        ..., max_length=FieldLimits.MEDIUM_STRING_MAX, description="Заголовок"
    )
    value: Union[int, float] = Field(..., description="Текущее значение")
    previous_value: Optional[Union[int, float]] = Field(
        None, description="Предыдущее значение"
    )
    change_percent: Optional[float] = Field(None, description="Изменение в процентах")
    trend: TrendEnum = Field(TrendEnum.UNKNOWN, description="Тренд")
    unit: Optional[str] = Field(None, max_length=20, description="Единица измерения")
    chart_type: ChartTypeEnum = Field(ChartTypeEnum.LINE, description="Тип графика")
    priority: PriorityEnum = Field(
        PriorityEnum.MEDIUM, description="Приоритет отображения"
    )


class ChartData(BaseSchema):
    """Данные для графика"""

    labels: List[str] = Field(default_factory=list, description="Подписи")
    datasets: List[Dict[str, Any]] = Field(
        default_factory=list, description="Наборы данных"
    )
    chart_type: ChartTypeEnum = Field(ChartTypeEnum.LINE, description="Тип графика")
    options: Optional[Dict[str, Any]] = Field(None, description="Настройки графика")


# === Схемы создания ===


class AnalyticsCreate(AnalyticsBase, CreateSchema):
    """Схема создания аналитики"""

    project_id: Optional[int] = Field(None, description=StandardDescriptions.PROJECT_ID)
    company_id: Optional[int] = Field(None, description=StandardDescriptions.COMPANY_ID)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия"""
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class MetricValueCreate(BaseSchema):
    """Схема создания значения метрики"""

    analytics_id: int = Field(..., description="ID аналитики")
    value: Union[int, float] = Field(..., description="Значение метрики")
    timestamp: Optional[datetime] = Field(None, description="Временная метка")
    period_start: Optional[datetime] = Field(None, description="Начало периода")
    period_end: Optional[datetime] = Field(None, description="Конец периода")
    metric_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные данные", alias="metadata"
    )

    @field_validator("value")
    @classmethod
    def validate_value(cls, v: Union[int, float]) -> Union[int, float]:
        """Валидация значения"""
        if v < 0:
            raise ValueError("Value cannot be negative")
        return v

    @model_validator(mode="after")
    def validate_period(self):
        """Валидация периода"""
        if self.period_start and self.period_end:
            if self.period_start >= self.period_end:
                raise ValueError("Period start must be before period end")
        return self


# === Схемы обновления ===


class AnalyticsUpdate(UpdateSchema):
    """Схема обновления аналитики"""

    name: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Название метрики"
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    metric_type: Optional[MetricTypeEnum] = Field(None, description="Тип метрики")
    period: Optional[PeriodEnum] = Field(None, description="Период агрегации")
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия"""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty")
        return v


class MetricValueUpdate(BaseSchema):
    """Схема обновления значения метрики"""

    value: Optional[Union[int, float]] = Field(None, description="Значение метрики")
    timestamp: Optional[datetime] = Field(None, description="Временная метка")
    period_start: Optional[datetime] = Field(None, description="Начало периода")
    period_end: Optional[datetime] = Field(None, description="Конец периода")
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные данные"
    )

    @field_validator("value")
    @classmethod
    def validate_value(
        cls, v: Optional[Union[int, float]]
    ) -> Optional[Union[int, float]]:
        """Валидация значения"""
        if v is not None and v < 0:
            raise ValueError("Value cannot be negative")
        return v


# === Схемы ответов ===


class AnalyticsResponse(AnalyticsBase, ResponseSchema, TimestampedBase):
    """Схема ответа аналитики"""

    project_id: Optional[int] = Field(None, description=StandardDescriptions.PROJECT_ID)
    company_id: Optional[int] = Field(None, description=StandardDescriptions.COMPANY_ID)
    created_by: Optional[int] = Field(None, description=StandardDescriptions.CREATED_BY)
    updated_by: Optional[int] = Field(None, description=StandardDescriptions.UPDATED_BY)
    metrics_count: Optional[int] = Field(None, ge=0, description="Количество метрик")


class MetricValueResponse(MetricValue, ResponseSchema, TimestampedBase):
    """Схема ответа значения метрики"""

    analytics_id: int = Field(..., description="ID аналитики")


class DashboardStatsResponse(BaseSchema):
    """Схема ответа статистики дашборда"""

    metrics: List[DashboardMetric] = Field(default_factory=list, description="Метрики")
    charts: List[ChartData] = Field(default_factory=list, description="Графики")
    summary: Dict[str, Any] = Field(
        default_factory=dict, description="Сводная информация"
    )
    last_updated: datetime = Field(
        default_factory=datetime.now, description="Последнее обновление"
    )


class AnalyticsListResponse(ListResponseSchema[AnalyticsResponse]):
    """Схема списка аналитики"""

    pass


class MetricValueListResponse(ListResponseSchema[MetricValueResponse]):
    """Схема списка значений метрик"""

    pass


# === Схемы фильтров ===


class AnalyticsFilter(DateRangeFilter):
    """Фильтр для аналитики"""

    metric_type: Optional[MetricTypeEnum] = Field(None, description="Тип метрики")
    period: Optional[PeriodEnum] = Field(None, description="Период")
    is_active: Optional[bool] = Field(None, description="Только активные")
    project_id: Optional[int] = Field(None, description=StandardDescriptions.PROJECT_ID)
    company_id: Optional[int] = Field(None, description=StandardDescriptions.COMPANY_ID)


class MetricValueFilter(DateRangeFilter):
    """Фильтр для значений метрик"""

    analytics_id: Optional[int] = Field(None, description="ID аналитики")
    min_value: Optional[Union[int, float]] = Field(
        None, description="Минимальное значение"
    )
    max_value: Optional[Union[int, float]] = Field(
        None, description="Максимальное значение"
    )

    @model_validator(mode="after")
    def validate_value_range(self):
        """Валидация диапазона значений"""
        if (
            self.min_value is not None
            and self.max_value is not None
            and self.min_value >= self.max_value
        ):
            raise ValueError("Min value must be less than max value")
        return self


# === Схемы запросов ===


class DashboardStatsRequest(BaseSchema):
    """Запрос статистики дашборда"""

    period: PeriodEnum = Field(PeriodEnum.DAY, description="Период")
    project_ids: Optional[List[int]] = Field(None, description="ID проектов")
    metric_types: Optional[List[MetricTypeEnum]] = Field(
        None, description="Типы метрик"
    )
    include_charts: bool = Field(True, description="Включить графики")

    @field_validator("project_ids")
    @classmethod
    def validate_project_ids(cls, v: Optional[List[int]]) -> Optional[List[int]]:
        """Валидация списка ID проектов"""
        if v is not None:
            # Удаляем дубликаты и сортируем
            v = sorted(list(set(v)))
            if len(v) > 100:  # Ограничение на количество проектов
                raise ValueError("Too many projects selected (max 100)")
        return v


class TimeSeriesRequest(BaseSchema):
    """Запрос временного ряда"""

    analytics_id: int = Field(..., description="ID аналитики")
    period: PeriodEnum = Field(PeriodEnum.DAY, description="Период агрегации")
    date_from: datetime = Field(..., description="Дата начала")
    date_to: datetime = Field(..., description="Дата окончания")
    aggregation: Optional[str] = Field("avg", description="Тип агрегации")

    @model_validator(mode="after")
    def validate_date_range(self):
        """Валидация диапазона дат"""
        if self.date_from >= self.date_to:
            raise ValueError("Date from must be before date to")

        # Ограничение на максимальный период
        max_days = 365
        if (self.date_to - self.date_from).days > max_days:
            raise ValueError(f"Date range cannot exceed {max_days} days")

        return self


# === Схемы агрегации ===


class AggregatedMetric(BaseSchema):
    """Агрегированная метрика"""

    period: str = Field(..., description="Период")
    count: int = Field(0, ge=0, description="Количество записей")
    sum_value: Union[int, float] = Field(0, description="Сумма значений")
    avg_value: Optional[float] = Field(None, description="Среднее значение")
    min_value: Optional[Union[int, float]] = Field(
        None, description="Минимальное значение"
    )
    max_value: Optional[Union[int, float]] = Field(
        None, description="Максимальное значение"
    )


class AnalyticsSummary(BaseSchema):
    """Сводка по аналитике"""

    total_metrics: int = Field(0, ge=0, description="Общее количество метрик")
    active_metrics: int = Field(0, ge=0, description="Активные метрики")
    total_values: int = Field(0, ge=0, description="Общее количество значений")
    date_range: Optional[DateRangeFilter] = Field(None, description="Диапазон дат")
    by_type: List[CountStatistic] = Field(default_factory=list, description="По типам")
    by_period: List[CountStatistic] = Field(
        default_factory=list, description="По периодам"
    )
