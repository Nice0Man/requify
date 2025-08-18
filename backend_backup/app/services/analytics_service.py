"""
Сервис для аналитики и формирования отчетов.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import Optional, List, Dict, Any, Union
from abc import ABC, abstractmethod
from datetime import datetime, date, timedelta
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, select

from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase, TestExecution
from app.schemas.analytics import (
    DashboardStatsResponse,
    MetricValueResponse,
    ChartData,
)
from .base import BaseService, ServiceError


class AnalyticsServiceError(ServiceError):
    """Ошибки сервиса аналитики."""

    pass


class MetricType(Enum):
    """Типы метрик."""

    COUNT = "count"
    PERCENTAGE = "percentage"
    AVERAGE = "average"


class IMetricCalculator(ABC):
    """Интерфейс калькулятора метрик."""

    @abstractmethod
    async def calculate(
        self, db: AsyncSession, filters: Dict[str, Any] = None
    ) -> Union[int, float]:
        pass

    @abstractmethod
    def get_metric_type(self) -> MetricType:
        pass


class ProjectCountCalculator(IMetricCalculator):
    """Калькулятор количества проектов."""

    async def calculate(self, db: AsyncSession, filters: Dict[str, Any] = None) -> int:
        query_filters = []

        if filters:
            if filters.get("user_id"):
                query_filters.append(Project.created_by == filters["user_id"])
            if filters.get("date_from"):
                query_filters.append(Project.created_at >= filters["date_from"])
            if filters.get("date_to"):
                query_filters.append(Project.created_at <= filters["date_to"])

        query = select(func.count(Project.id))
        if query_filters:
            query = query.where(and_(*query_filters))

        result = await db.execute(query)
        return result.scalar() or 0

    def get_metric_type(self) -> MetricType:
        return MetricType.COUNT


class RequirementCountCalculator(IMetricCalculator):
    """Калькулятор количества требований."""

    async def calculate(self, db: AsyncSession, filters: Dict[str, Any] = None) -> int:
        query_filters = []

        if filters:
            if filters.get("project_id"):
                query_filters.append(Requirement.project_id == filters["project_id"])
            if filters.get("user_id"):
                query_filters.append(Requirement.created_by == filters["user_id"])

        query = select(func.count(Requirement.id))
        if query_filters:
            query = query.where(and_(*query_filters))

        result = await db.execute(query)
        return result.scalar() or 0

    def get_metric_type(self) -> MetricType:
        return MetricType.COUNT


class TestCoverageCalculator(IMetricCalculator):
    """Калькулятор покрытия тестами."""

    async def calculate(
        self, db: AsyncSession, filters: Dict[str, Any] = None
    ) -> float:
        # Общее количество требований
        total_req_query = select(func.count(Requirement.id))
        if filters and filters.get("project_id"):
            total_req_query = total_req_query.where(
                Requirement.project_id == filters["project_id"]
            )

        total_result = await db.execute(total_req_query)
        total_requirements = total_result.scalar() or 0

        if total_requirements == 0:
            return 0.0

        # Количество требований с тестами
        tested_req_query = select(
            func.count(func.distinct(Requirement.id))
        ).select_from(
            Requirement.join(TestCase, Requirement.id == TestCase.requirement_id)
        )
        if filters and filters.get("project_id"):
            tested_req_query = tested_req_query.where(
                Requirement.project_id == filters["project_id"]
            )

        tested_result = await db.execute(tested_req_query)
        tested_requirements = tested_result.scalar() or 0

        return (tested_requirements / total_requirements) * 100

    def get_metric_type(self) -> MetricType:
        return MetricType.PERCENTAGE


class AnalyticsService(BaseService):
    """
    Основной сервис аналитики.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные калькуляторы метрик)
    - Factory (создание отчетов)
    """

    def __init__(self):
        self._metric_calculators = {}
        super().__init__()

    def get_service_name(self) -> str:
        return "AnalyticsService"

    def _setup(self):
        """Инициализация сервиса с регистрацией калькуляторов."""
        if not self._initialized:
            self.register_metric_calculator("projects", ProjectCountCalculator())
            self.register_metric_calculator(
                "requirements", RequirementCountCalculator()
            )
            self.register_metric_calculator("test_coverage", TestCoverageCalculator())
            super()._setup()

    def register_metric_calculator(self, name: str, calculator: IMetricCalculator):
        """Регистрация калькулятора метрик."""
        self._metric_calculators[name] = calculator
        self._log_operation("register_metric_calculator", {"calculator": name})

    async def get_dashboard_stats(
        self,
        db: AsyncSession,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> DashboardStatsResponse:
        """Получение основной статистики для дашборда."""
        try:
            self._log_operation(
                "get_dashboard_stats",
                {
                    "user_id": user_id,
                    "project_id": project_id,
                    "date_from": date_from,
                    "date_to": date_to,
                },
            )

            # Установка периода по умолчанию
            if not date_to:
                date_to = date.today()
            if not date_from:
                date_from = date_to - timedelta(days=30)

            filters = {
                "user_id": user_id,
                "project_id": project_id,
                "date_from": date_from,
                "date_to": date_to,
            }

            # Вычисление метрик
            projects_calc = self._metric_calculators["projects"]
            requirements_calc = self._metric_calculators["requirements"]
            coverage_calc = self._metric_calculators["test_coverage"]

            total_projects = await projects_calc.calculate(db, filters)
            total_requirements = await requirements_calc.calculate(db, filters)
            test_coverage = await coverage_calc.calculate(db, filters)

            return DashboardStatsResponse(
                total_projects=MetricValueResponse(
                    value=total_projects, type="count", label="Total Projects"
                ),
                total_requirements=MetricValueResponse(
                    value=total_requirements, type="count", label="Total Requirements"
                ),
                test_coverage=MetricValueResponse(
                    value=test_coverage, type="percentage", label="Test Coverage"
                ),
                success_rate=MetricValueResponse(
                    value=0, type="percentage", label="Success Rate"
                ),
                period_start=date_from,
                period_end=date_to,
            )

        except Exception as e:
            raise self._handle_error(e, "get_dashboard_stats")

    async def calculate_metric(
        self, db: AsyncSession, metric_name: str, filters: Dict[str, Any] = None
    ) -> MetricValueResponse:
        """Вычислить конкретную метрику."""
        try:
            self._log_operation(
                "calculate_metric", {"metric_name": metric_name, "filters": filters}
            )

            calculator = self._metric_calculators.get(metric_name)
            if not calculator:
                raise AnalyticsServiceError(
                    f"Metric calculator '{metric_name}' not found"
                )

            value = await calculator.calculate(db, filters or {})

            return MetricValueResponse(
                value=value,
                type=calculator.get_metric_type().value,
                label=metric_name.replace("_", " ").title(),
            )

        except Exception as e:
            raise self._handle_error(e, "calculate_metric")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("analytics", AnalyticsService)

# Singleton instance
analytics_service = AnalyticsService()
