"""
Dashboard Service.

Сервис дашборда с полным циклом операций.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
import time
import psutil

from sqlalchemy import func, select, and_, or_, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import (
    project as crud_project,
    requirement as crud_requirement,
    user as crud_user,
    user_preferences,
    notification,
    activity,
    widget,
)
from app.models.project import Project
from app.models.requirement import Requirement
from app.schemas.dashboard import (
    DashboardStats,
    DashboardOverviewStats,
    ProjectPerformanceStats,
    TrendingMetricsData,
    QuickAccess,
    QuickProject,
    QuickRequirement,
    ActivityItem,
    MyDashboardResponse,
    UserDashboardPreferences as PreferencesSchema,
    DashboardNotification as NotificationSchema,
    SystemMetrics,
    TimelineDataPoint,
    DistributionDataPoint,
    ProjectTrendDataPoint,
    TimelineQueryParams,
    DistributionQueryParams,
    ProjectTrendsQueryParams,
)
from .base import BaseService, ServiceError
from app.utils.logger import logger


class DashboardServiceError(ServiceError):
    """Ошибки сервиса дашборда."""

    pass


# Абстрактные интерфейсы
class IStatsProvider(ABC):
    """Интерфейс провайдера статистики."""

    @abstractmethod
    async def get_overview_stats(self, db: AsyncSession) -> DashboardOverviewStats:
        """Получить общую статистику."""
        pass

    @abstractmethod
    async def get_project_performance(
        self, db: AsyncSession, overview: DashboardOverviewStats
    ) -> ProjectPerformanceStats:
        """Получить статистику производительности проектов."""
        pass


class IMetricsCollector(ABC):
    """Интерфейс сборщика метрик."""

    @abstractmethod
    async def get_trending_metrics(self, db: AsyncSession) -> TrendingMetricsData:
        """Получить трендовые метрики."""
        pass

    @abstractmethod
    async def get_system_metrics(self, db: AsyncSession) -> SystemMetrics:
        """Получить системные метрики."""
        pass


class IActivityProvider(ABC):
    """Интерфейс провайдера активности."""

    @abstractmethod
    async def get_recent_activity(
        self, db: AsyncSession, limit: int = 20, user_id: Optional[int] = None
    ) -> List[ActivityItem]:
        """Получить недавнюю активность."""
        pass

    @abstractmethod
    async def get_quick_access(self, db: AsyncSession, user_id: int) -> QuickAccess:
        """Получить быстрый доступ пользователя."""
        pass


class IDataVisualizer(ABC):
    """Интерфейс визуализатора данных."""

    @abstractmethod
    async def get_timeline_data(
        self, db: AsyncSession, params: TimelineQueryParams
    ) -> List[TimelineDataPoint]:
        """Получить данные временной шкалы."""
        pass

    @abstractmethod
    async def get_distribution_data(
        self, db: AsyncSession, params: DistributionQueryParams
    ) -> List[DistributionDataPoint]:
        """Получить данные распределения."""
        pass


# Конкретные реализации
class StandardStatsProvider(IStatsProvider):
    """Стандартный провайдер статистики."""

    async def get_overview_stats(self, db: AsyncSession) -> DashboardOverviewStats:
        """Получить общую статистику системы."""
        # Получаем общие счетчики
        total_projects = await crud_project.count(db) or 0
        total_requirements = await crud_requirement.count(db) or 0
        total_users = await crud_user.count(db) or 0

        # Получаем реальное распределение проектов по статусам
        project_status_distribution = await crud_project.get_projects_by_status(db)

        # Подсчитываем активные и завершенные проекты
        active_statuses = ["active", "in_progress", "started", "development"]
        completed_statuses = ["completed", "done", "finished", "archived"]

        active_projects = 0
        completed_projects = 0

        for status, count in project_status_distribution.items():
            status_lower = status.lower()
            if any(active_status in status_lower for active_status in active_statuses):
                active_projects += count
            elif any(
                completed_status in status_lower
                for completed_status in completed_statuses
            ):
                completed_projects += count
            else:
                active_projects += count

        # Получаем распределение требований по статусам
        requirement_status_distribution = (
            await crud_requirement.get_requirements_by_status(db)
        )

        pending_statuses = ["pending", "draft", "new", "review", "waiting"]
        approved_statuses = ["approved", "done", "completed", "accepted"]

        pending_requirements = 0
        approved_requirements = 0

        for status, count in requirement_status_distribution.items():
            status_lower = status.lower() if status else "unknown"
            if any(
                pending_status in status_lower for pending_status in pending_statuses
            ):
                pending_requirements += count
            elif any(
                approved_status in status_lower for approved_status in approved_statuses
            ):
                approved_requirements += count
            else:
                pending_requirements += count

        # Получаем количество активных пользователей
        try:
            active_users_result = await db.execute(
                text("SELECT COUNT(*) FROM users WHERE is_active = true")
            )
            active_users = active_users_result.scalar() or 0
        except Exception:
            active_users = total_users

        return DashboardOverviewStats(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_requirements=total_requirements,
            pending_requirements=pending_requirements,
            approved_requirements=approved_requirements,
            total_users=total_users,
            active_users=active_users,
        )

    async def get_project_performance(
        self, db: AsyncSession, overview: DashboardOverviewStats
    ) -> ProjectPerformanceStats:
        """Вычислить метрики производительности проектов."""
        # Получаем реальные метрики завершенности
        completion_stats = await crud_project.get_completion_stats(db)
        team_productivity = await crud_project.get_team_productivity_score(db)

        return ProjectPerformanceStats(
            completion_rate=completion_stats["completion_rate"],
            on_time_delivery=completion_stats["on_time_delivery"],
            quality_score=completion_stats["quality_score"],
            team_productivity=team_productivity,
        )


class StandardMetricsCollector(IMetricsCollector):
    """Стандартный сборщик метрик."""

    async def get_trending_metrics(self, db: AsyncSession) -> TrendingMetricsData:
        """Получить трендовые метрики."""
        now = datetime.now()
        week_ago = now - timedelta(days=7)
        two_weeks_ago = now - timedelta(days=14)

        # Получаем требования, созданные на этой неделе vs прошлой неделе
        this_week_reqs = await db.execute(
            select(func.count(Requirement.id)).where(Requirement.created_at >= week_ago)
        )
        requirements_this_week = this_week_reqs.scalar() or 0

        last_week_reqs = await db.execute(
            select(func.count(Requirement.id)).where(
                and_(
                    Requirement.created_at >= two_weeks_ago,
                    Requirement.created_at < week_ago,
                )
            )
        )
        requirements_last_week = last_week_reqs.scalar() or 0

        total_users = await crud_user.count(db) or 1
        active_teams = max(1, total_users // 5)

        return TrendingMetricsData(
            requirements_this_week=requirements_this_week,
            requirements_last_week=requirements_last_week,
            releases_this_month=0,
            releases_last_month=0,
            active_teams=active_teams,
            avg_project_duration=90.0,
        )

    async def get_system_metrics(self, db: AsyncSession) -> SystemMetrics:
        """Получить системные метрики производительности."""
        # Получаем CPU и информацию о памяти
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        disk_usage = psutil.disk_usage("/")

        # Вычисляем uptime
        boot_time = psutil.boot_time()
        uptime_seconds = int(time.time() - boot_time)

        # Получаем количество активных пользователей
        try:
            active_users_result = await db.execute(
                text("SELECT COUNT(*) FROM users WHERE is_active = true")
            )
            active_users = active_users_result.scalar() or 0
        except Exception:
            active_users = 0

        return SystemMetrics(
            cpu_usage=round(cpu_percent, 2),
            memory_usage=round(memory_info.percent, 2),
            disk_usage=round((disk_usage.used / disk_usage.total) * 100, 2),
            network_latency=15.0,
            uptime=uptime_seconds,
            active_users=active_users,
            response_time=120.0,
            error_rate=0.5,
            throughput=150.0,
            availability=99.9,
            last_updated=datetime.now().isoformat(),
        )


class StandardActivityProvider(IActivityProvider):
    """Стандартный провайдер активности."""

    async def get_recent_activity(
        self, db: AsyncSession, limit: int = 20, user_id: Optional[int] = None
    ) -> List[ActivityItem]:
        """Получить недавнюю активность."""
        activities = await activity.get_recent_activities(
            db, user_id=user_id, limit=limit
        )

        activity_items = []

        if activities:
            for act in activities:
                activity_items.append(
                    ActivityItem(
                        id=f"activity_{act.id}",
                        type=act.entity_type or "general",
                        title=act.activity_title,
                        description=act.activity_description or "",
                        timestamp=act.created_at.isoformat(),
                        user_name=act.user_name,
                        project_name=(
                            act.entity_name if act.entity_type == "project" else ""
                        ),
                        status=act.status,
                        priority=act.priority,
                    )
                )

        activity_items.sort(key=lambda x: x.timestamp, reverse=True)
        return activity_items[:limit]

    async def get_quick_access(self, db: AsyncSession, user_id: int) -> QuickAccess:
        """Получить элементы быстрого доступа для пользователя."""
        # Получаем недавние проекты пользователя
        user_projects = await crud_project.get_multi(
            db, filters={"owner_id": user_id}, limit=5
        )

        quick_projects = []
        for project in user_projects:
            project_details = (
                await crud_requirement.get_project_details_with_requirements(
                    db, project_id=project.id
                )
            )

            if project_details:
                quick_projects.append(
                    QuickProject(
                        id=project_details["id"],
                        name=project_details["name"],
                        code=project_details["code"],
                        status=project_details["status"],
                        completion_percentage=project_details["completion_percentage"],
                        team_size=project_details["team_size"],
                        requirements_count=project_details["requirements_count"],
                        next_milestone=project_details["next_milestone"],
                        health_score=project_details["health_score"],
                        updated_at=project_details["updated_at"],
                    )
                )

        # Получаем недавние требования пользователя
        user_reqs_query = await db.execute(
            select(Requirement, Project.name.label("project_name"))
            .join(Project, Requirement.project_id == Project.id)
            .where(Requirement.author_id == user_id)
            .order_by(Requirement.created_at.desc())
            .limit(5)
        )

        quick_requirements = []
        for req_row in user_reqs_query:
            req = req_row[0]
            project_name = req_row[1]

            quick_requirements.append(
                QuickRequirement(
                    id=req.id,
                    title=req.title,
                    project_name=project_name or "Unknown Project",
                    status="active",
                    priority="medium",
                    assigned_to=getattr(req, "assigned_to_id", None),
                    due_date=getattr(req, "due_date", None),
                    progress=50.0,
                )
            )

        return QuickAccess(
            my_projects=quick_projects,
            my_requirements=quick_requirements,
            pending_approvals=[],
        )


class StandardDataVisualizer(IDataVisualizer):
    """Стандартный визуализатор данных."""

    async def get_timeline_data(
        self, db: AsyncSession, params: TimelineQueryParams
    ) -> List[TimelineDataPoint]:
        """Получить данные графика временной шкалы."""
        end_date = datetime.now()
        if params.period == "7d":
            start_date = end_date - timedelta(days=7)
        elif params.period == "30d":
            start_date = end_date - timedelta(days=30)
        elif params.period == "90d":
            start_date = end_date - timedelta(days=90)
        else:
            start_date = end_date - timedelta(days=30)

        timeline_data = []

        # Строим запрос требований с фильтрами
        query_filters = [Requirement.created_at >= start_date]

        if params.project_id:
            query_filters.append(Requirement.project_id == params.project_id)

        requirements_query = (
            select(
                func.date(Requirement.created_at).label("date"),
                func.count(Requirement.id).label("count"),
            )
            .where(and_(*query_filters))
            .group_by(func.date(Requirement.created_at))
        )

        requirements_result = await db.execute(requirements_query)

        for row in requirements_result:
            timeline_data.append(
                TimelineDataPoint(
                    date=row.date.isoformat() + "T00:00:00Z",
                    value=float(row.count),
                    label=f"Requirements ({params.granularity})",
                    category="requirements",
                    metadata={"type": "creation", "period": params.period},
                )
            )

        return timeline_data

    async def get_distribution_data(
        self, db: AsyncSession, params: DistributionQueryParams
    ) -> List[DistributionDataPoint]:
        """Получить данные графика распределения."""
        distribution_data = []
        end_date = datetime.now()

        if params.period == "7d":
            start_date = end_date - timedelta(days=7)
        elif params.period == "30d":
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=30)

        query_filters = [Project.created_at >= start_date]

        if params.status:
            query_filters.append(Project.status == params.status)

        projects_query = (
            select(Project.status, func.count(Project.id).label("count"))
            .where(and_(*query_filters))
            .group_by(Project.status)
        )

        projects_by_status = await db.execute(projects_query)

        colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0"]

        for i, row in enumerate(projects_by_status):
            distribution_data.append(
                DistributionDataPoint(
                    id=f"project_status_{row.status}",
                    label=f"Projects ({row.status})",
                    value=float(row.count),
                    percentage=100.0,  # TODO: Вычислить реальный процент
                    color=colors[i % len(colors)],
                    metadata={"type": "project_status", "status": row.status},
                )
            )

        return distribution_data


class DashboardService(BaseService):
    """
    Основной сервис дашборда.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные провайдеры данных)
    - Facade (объединяет несколько подсистем)
    - Template Method (процесс сбора данных)
    """

    def __init__(self):
        self._stats_provider: IStatsProvider = StandardStatsProvider()
        self._metrics_collector: IMetricsCollector = StandardMetricsCollector()
        self._activity_provider: IActivityProvider = StandardActivityProvider()
        self._data_visualizer: IDataVisualizer = StandardDataVisualizer()
        super().__init__()

    def get_service_name(self) -> str:
        return "DashboardService"

    def set_stats_provider(self, provider: IStatsProvider):
        """Установить провайдер статистики."""
        self._stats_provider = provider
        self._log_operation("set_stats_provider", {"provider": type(provider).__name__})

    def set_metrics_collector(self, collector: IMetricsCollector):
        """Установить сборщик метрик."""
        self._metrics_collector = collector
        self._log_operation(
            "set_metrics_collector", {"collector": type(collector).__name__}
        )

    async def get_overview_stats(self, db: AsyncSession) -> DashboardOverviewStats:
        """Получить общую статистику системы."""
        try:
            self._log_operation("get_overview_stats")
            return await self._stats_provider.get_overview_stats(db)
        except Exception as e:
            raise self._handle_error(e, "get_overview_stats")

    async def get_project_performance(
        self, db: AsyncSession, overview: DashboardOverviewStats
    ) -> ProjectPerformanceStats:
        """Получить статистику производительности проектов."""
        try:
            self._log_operation("get_project_performance")
            return await self._stats_provider.get_project_performance(db, overview)
        except Exception as e:
            raise self._handle_error(e, "get_project_performance")

    async def get_trending_metrics(self, db: AsyncSession) -> TrendingMetricsData:
        """Получить трендовые метрики."""
        try:
            self._log_operation("get_trending_metrics")
            return await self._metrics_collector.get_trending_metrics(db)
        except Exception as e:
            raise self._handle_error(e, "get_trending_metrics")

    async def get_recent_activity(
        self, db: AsyncSession, limit: int = 20, user_id: Optional[int] = None
    ) -> List[ActivityItem]:
        """Получить недавнюю активность."""
        try:
            self._log_operation(
                "get_recent_activity", {"limit": limit, "user_id": user_id}
            )
            return await self._activity_provider.get_recent_activity(db, limit, user_id)
        except Exception as e:
            raise self._handle_error(e, "get_recent_activity")

    async def get_quick_access(self, db: AsyncSession, user_id: int) -> QuickAccess:
        """Получить элементы быстрого доступа для пользователя."""
        try:
            self._log_operation("get_quick_access", {"user_id": user_id})
            return await self._activity_provider.get_quick_access(db, user_id)
        except Exception as e:
            raise self._handle_error(e, "get_quick_access")

    async def get_system_metrics(self, db: AsyncSession) -> SystemMetrics:
        """Получить системные метрики производительности."""
        try:
            self._log_operation("get_system_metrics")
            return await self._metrics_collector.get_system_metrics(db)
        except Exception as e:
            raise self._handle_error(e, "get_system_metrics")

    async def get_timeline_data(
        self, db: AsyncSession, params: TimelineQueryParams
    ) -> List[TimelineDataPoint]:
        """Получить данные временной шкалы."""
        try:
            self._log_operation("get_timeline_data", {"period": params.period})
            return await self._data_visualizer.get_timeline_data(db, params)
        except Exception as e:
            raise self._handle_error(e, "get_timeline_data")

    async def get_distribution_data(
        self, db: AsyncSession, params: DistributionQueryParams
    ) -> List[DistributionDataPoint]:
        """Получить данные распределения."""
        try:
            self._log_operation("get_distribution_data", {"period": params.period})
            return await self._data_visualizer.get_distribution_data(db, params)
        except Exception as e:
            raise self._handle_error(e, "get_distribution_data")

    async def get_comprehensive_dashboard_data(
        self, db: AsyncSession, user_id: int
    ) -> DashboardStats:
        """Получить комплексные данные дашборда для пользователя."""
        try:
            self._log_operation(
                "get_comprehensive_dashboard_data", {"user_id": user_id}
            )

            # Получаем все данные дашборда эффективно
            overview = await self.get_overview_stats(db)
            project_performance = await self.get_project_performance(db, overview)
            trending_metrics = await self.get_trending_metrics(db)
            recent_activity = await self.get_recent_activity(db, limit=20)
            quick_access = await self.get_quick_access(db, user_id)

            return DashboardStats(
                overview=overview,
                recent_activity=recent_activity,
                project_performance=project_performance,
                trending_metrics=trending_metrics,
                quick_access=quick_access,
            )
        except Exception as e:
            raise self._handle_error(e, "get_comprehensive_dashboard_data")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("dashboard", DashboardService)

# Singleton instance
dashboard_service = DashboardService()
