"""
Quality Reports Schemas.

Pydantic models для операций с отчетами качества.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Report Enums ===


class ReportType(str, Enum):
    """Типы отчетов."""

    TEST_SUMMARY = "test_summary"
    COVERAGE = "coverage"
    QUALITY_METRICS = "quality_metrics"
    DEFECT_ANALYSIS = "defect_analysis"
    AUTOMATION_RATE = "automation_rate"
    PERFORMANCE = "performance"
    CUSTOM = "custom"


class ReportFormat(str, Enum):
    """Форматы отчетов."""

    PDF = "pdf"
    EXCEL = "excel"
    HTML = "html"
    JSON = "json"
    CSV = "csv"


class ReportStatus(str, Enum):
    """Статусы отчетов."""

    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


# === Report Request Schemas ===


class TestReportRequest(BaseSchema):
    """Schema for test report generation request."""

    report_type: ReportType = Field(..., description="Тип отчета")
    project_id: Optional[int] = Field(None, description="ID проекта")
    format: ReportFormat = Field(ReportFormat.PDF, description="Формат отчета")
    parameters: Dict[str, Any] = Field({}, description="Параметры отчета")
    include_charts: bool = Field(True, description="Включить графики")
    include_recommendations: bool = Field(True, description="Включить рекомендации")
    email_recipients: List[str] = Field([], description="Email получателей")


# === Report Response Schemas ===


class ReportGenerationResponse(BaseSchema):
    """Response for report generation."""

    success: bool = Field(..., description="Успешность генерации")
    report_id: str = Field(..., description="ID отчета")
    download_url: str = Field(..., description="URL для скачивания")
    format: ReportFormat = Field(..., description="Формат отчета")
    file_size_bytes: int = Field(0, description="Размер файла")
    pages_count: int = Field(0, description="Количество страниц")
    estimated_completion: Optional[datetime] = Field(
        None, description="Ожидаемое время завершения"
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время генерации"
    )


class ReportInfo(BaseSchema):
    """Basic report information."""

    id: str = Field(..., description="ID отчета")
    name: str = Field(..., description="Название отчета")
    report_type: ReportType = Field(..., description="Тип отчета")
    format: ReportFormat = Field(..., description="Формат")
    status: ReportStatus = Field(..., description="Статус")
    project_id: Optional[int] = Field(None, description="ID проекта")
    file_size_bytes: int = Field(0, description="Размер файла")
    generated_by: int = Field(..., description="ID создателя")
    generated_at: datetime = Field(..., description="Дата генерации")
    expires_at: Optional[datetime] = Field(None, description="Дата истечения")


class ReportListResponse(BaseSchema):
    """Response for report list with pagination."""

    reports: List[ReportInfo] = Field(..., description="Список отчетов")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


# === Quality Metrics Schemas ===


class TestExecutionMetrics(BaseSchema):
    """Test execution metrics."""

    total_tests: int = Field(..., description="Общее количество тестов")
    passed_tests: int = Field(..., description="Пройденные тесты")
    failed_tests: int = Field(..., description="Проваленные тесты")
    blocked_tests: int = Field(..., description="Заблокированные тесты")
    skipped_tests: int = Field(..., description="Пропущенные тесты")
    pass_rate: float = Field(..., description="Процент прохождения")
    execution_time_avg: float = Field(..., description="Среднее время выполнения")


class DefectMetrics(BaseSchema):
    """Defect metrics."""

    total_defects: int = Field(..., description="Общее количество дефектов")
    open_defects: int = Field(..., description="Открытые дефекты")
    resolved_defects: int = Field(..., description="Решенные дефекты")
    critical_defects: int = Field(..., description="Критические дефекты")
    defect_density: float = Field(..., description="Плотность дефектов")
    resolution_time_avg: float = Field(..., description="Среднее время решения")


class CoverageMetrics(BaseSchema):
    """Coverage metrics."""

    requirements_coverage: float = Field(..., description="Покрытие требований")
    code_coverage: float = Field(..., description="Покрытие кода")
    functional_coverage: float = Field(..., description="Функциональное покрытие")
    test_case_coverage: float = Field(..., description="Покрытие тест-кейсами")


class QualityMetricsResponse(BaseSchema):
    """Quality metrics response."""

    project_id: Optional[int] = Field(None, description="ID проекта")
    period: str = Field(..., description="Период отчета")
    test_execution: TestExecutionMetrics = Field(
        ..., description="Метрики выполнения тестов"
    )
    defects: DefectMetrics = Field(..., description="Метрики дефектов")
    coverage: CoverageMetrics = Field(..., description="Метрики покрытия")
    quality_score: float = Field(..., description="Общий показатель качества")
    trends: Dict[str, List[float]] = Field({}, description="Тренды метрик")
    generated_at: datetime = Field(..., description="Дата генерации")


# === Coverage Report Schemas ===


class CoverageItem(BaseSchema):
    """Coverage item details."""

    item_id: int = Field(..., description="ID элемента")
    item_name: str = Field(..., description="Название элемента")
    item_type: str = Field(..., description="Тип элемента")
    coverage_percentage: float = Field(..., description="Процент покрытия")
    test_cases_count: int = Field(..., description="Количество тест-кейсов")
    last_tested: Optional[datetime] = Field(
        None, description="Дата последнего тестирования"
    )


class CoverageReportResponse(BaseSchema):
    """Coverage report response."""

    project_id: Optional[int] = Field(None, description="ID проекта")
    coverage_type: str = Field(..., description="Тип покрытия")
    overall_coverage: float = Field(..., description="Общее покрытие")
    coverage_items: List[CoverageItem] = Field(..., description="Детали покрытия")
    uncovered_items: List[CoverageItem] = Field(..., description="Непокрытые элементы")
    coverage_trends: List[Dict[str, Any]] = Field([], description="Тренды покрытия")
    recommendations: List[str] = Field([], description="Рекомендации")
    generated_at: datetime = Field(..., description="Дата генерации")


# === Defect Analysis Schemas ===


class DefectCategory(BaseSchema):
    """Defect category information."""

    category: str = Field(..., description="Категория дефекта")
    count: int = Field(..., description="Количество")
    percentage: float = Field(..., description="Процент от общего количества")
    avg_resolution_time: float = Field(..., description="Среднее время решения")


class DefectTrend(BaseSchema):
    """Defect trend data."""

    date: datetime = Field(..., description="Дата")
    opened: int = Field(..., description="Открыто дефектов")
    resolved: int = Field(..., description="Решено дефектов")
    cumulative: int = Field(..., description="Накопительное количество")


class DefectAnalysisResponse(BaseSchema):
    """Defect analysis response."""

    project_id: Optional[int] = Field(None, description="ID проекта")
    period: str = Field(..., description="Период анализа")
    total_defects: int = Field(..., description="Общее количество дефектов")
    defects_by_severity: List[DefectCategory] = Field(
        ..., description="Дефекты по серьезности"
    )
    defects_by_category: List[DefectCategory] = Field(
        ..., description="Дефекты по категориям"
    )
    defects_by_component: List[DefectCategory] = Field(
        ..., description="Дефекты по компонентам"
    )
    trend_data: List[DefectTrend] = Field(..., description="Тренды дефектов")
    resolution_metrics: Dict[str, float] = Field({}, description="Метрики решения")
    hotspots: List[str] = Field([], description="Проблемные области")
    recommendations: List[str] = Field([], description="Рекомендации")
    generated_at: datetime = Field(..., description="Дата генерации")


# === Automation Metrics Schemas ===


class AutomationMetrics(BaseSchema):
    """Automation metrics."""

    total_test_cases: int = Field(..., description="Общее количество тест-кейсов")
    automated_test_cases: int = Field(..., description="Автоматизированные тест-кейсы")
    automation_rate: float = Field(..., description="Уровень автоматизации")
    manual_execution_time: float = Field(..., description="Время ручного выполнения")
    automated_execution_time: float = Field(
        ..., description="Время автоматизированного выполнения"
    )
    time_savings: float = Field(..., description="Экономия времени")
    roi_percentage: float = Field(..., description="ROI автоматизации")


class AutomationReportResponse(BaseSchema):
    """Automation report response."""

    project_id: Optional[int] = Field(None, description="ID проекта")
    period: str = Field(..., description="Период отчета")
    automation_metrics: AutomationMetrics = Field(
        ..., description="Метрики автоматизации"
    )
    automation_trends: List[Dict[str, Any]] = Field(
        [], description="Тренды автоматизации"
    )
    recommendations: List[str] = Field([], description="Рекомендации по автоматизации")
    generated_at: datetime = Field(..., description="Дата генерации")


# === Custom Report Schemas ===


class CustomReportParameter(BaseSchema):
    """Custom report parameter."""

    name: str = Field(..., description="Название параметра")
    value: Any = Field(..., description="Значение параметра")
    data_type: str = Field(..., description="Тип данных")


class CustomReportDefinition(BaseSchema):
    """Custom report definition."""

    name: str = Field(..., description="Название отчета")
    description: Optional[str] = Field(None, description="Описание отчета")
    report_type: ReportType = Field(..., description="Тип отчета")
    parameters: List[CustomReportParameter] = Field([], description="Параметры отчета")
    template_id: Optional[int] = Field(None, description="ID шаблона")
    is_scheduled: bool = Field(False, description="Запланированный отчет")
    schedule_cron: Optional[str] = Field(None, description="Расписание в формате cron")


# === Report Templates Schemas ===


class ReportTemplate(BaseSchema):
    """Report template information."""

    id: int = Field(..., description="ID шаблона")
    name: str = Field(..., description="Название шаблона")
    description: Optional[str] = Field(None, description="Описание шаблона")
    report_type: ReportType = Field(..., description="Тип отчета")
    template_content: str = Field(..., description="Содержимое шаблона")
    is_default: bool = Field(False, description="Шаблон по умолчанию")
    created_by: int = Field(..., description="ID создателя")
    created_at: datetime = Field(..., description="Дата создания")


class TemplateListResponse(BaseSchema):
    """Response for template list."""

    templates: List[ReportTemplate] = Field(..., description="Список шаблонов")
    total: int = Field(..., description="Общее количество")
