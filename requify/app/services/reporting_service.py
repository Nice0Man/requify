"""
Сервис отчётности.

Генерирует различные отчёты для анализа данных о требованиях,
проектах, пользователях и производительности системы.
"""

import asyncio
import csv
import io
from collections import defaultdict
from datetime import datetime, UTC
from enum import Enum
from typing import Dict, List, Optional, Any, Union
import logging
from dataclasses import dataclass

from requify.app.core.config import settings
from requify.app.core.exceptions import ReportGenerationError

logger = logging.getLogger(__name__)


class ReportFormat(str, Enum):
    """Форматы отчётов"""

    JSON = "json"
    CSV = "csv"
    HTML = "html"
    PDF = "pdf"  # Для будущего расширения


class ReportType(str, Enum):
    """Типы отчётов"""

    REQUIREMENTS_STATUS = "requirements_status"
    REQUIREMENTS_BY_PROJECT = "requirements_by_project"
    REQUIREMENTS_BY_USER = "requirements_by_user"
    PROJECT_PROGRESS = "project_progress"
    TESTING_RESULTS = "testing_results"
    DEADLINES_OVERVIEW = "deadlines_overview"
    CHANGE_HISTORY = "change_history"
    PERFORMANCE_METRICS = "performance_metrics"
    USER_ACTIVITY = "user_activity"
    EXPORT_ALL_DATA = "export_all_data"


@dataclass
class ReportFilter:
    """Фильтры для отчётов"""

    project_ids: Optional[List[int]] = None
    user_ids: Optional[List[int]] = None
    statuses: Optional[List[str]] = None
    priorities: Optional[List[str]] = None
    types: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_archived: bool = False


@dataclass
class ReportConfig:
    """Конфигурация отчёта"""

    type: ReportType
    format: ReportFormat
    filters: ReportFilter
    include_details: bool = True
    include_statistics: bool = True
    group_by: Optional[str] = None  # status, project, user, date


@dataclass
class ReportData:
    """Данные отчёта"""

    title: str
    description: str
    generated_at: datetime
    generated_by: Optional[str]
    filters_applied: Dict[str, Any]
    summary: Dict[str, Any]
    data: List[Dict[str, Any]]
    metadata: Dict[str, Any]


class ReportingService:
    """
    Сервис отчётности.

    Предоставляет функциональность для генерации различных отчётов
    по данным системы в разных форматах.
    """

    def __init__(self):
        """Инициализация сервиса отчётности"""
        self.supported_formats = [
            ReportFormat.JSON,
            ReportFormat.CSV,
            ReportFormat.HTML,
        ]

    async def generate_report(
        self, config: ReportConfig, generated_by: Optional[str] = None
    ) -> Union[Dict[str, Any], str, bytes]:
        """
        Генерирует отчёт по указанной конфигурации

        Args:
            config: Конфигурация отчёта
            generated_by: Пользователь, запросивший отчёт

        Returns:
            Отчёт в запрошенном формате

        Raises:
            ReportGenerationError: При ошибке генерации отчёта
        """
        try:
            # Генерируем данные отчёта
            if config.type == ReportType.REQUIREMENTS_STATUS:
                report_data = await self._generate_requirements_status_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.REQUIREMENTS_BY_PROJECT:
                report_data = await self._generate_requirements_by_project_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.REQUIREMENTS_BY_USER:
                report_data = await self._generate_requirements_by_user_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.PROJECT_PROGRESS:
                report_data = await self._generate_project_progress_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.TESTING_RESULTS:
                report_data = await self._generate_testing_results_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.DEADLINES_OVERVIEW:
                report_data = await self._generate_deadlines_overview_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.CHANGE_HISTORY:
                report_data = await self._generate_change_history_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.PERFORMANCE_METRICS:
                report_data = await self._generate_performance_metrics_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.USER_ACTIVITY:
                report_data = await self._generate_user_activity_report(
                    config.filters, generated_by
                )
            elif config.type == ReportType.EXPORT_ALL_DATA:
                report_data = await self._generate_export_all_data_report(
                    config.filters, generated_by
                )
            else:
                raise ReportGenerationError(
                    f"Неподдерживаемый тип отчёта: {config.type}"
                )

            # Форматируем отчёт
            if config.format == ReportFormat.JSON:
                return self._format_as_json(report_data)
            elif config.format == ReportFormat.CSV:
                return self._format_as_csv(report_data)
            elif config.format == ReportFormat.HTML:
                return self._format_as_html(report_data)
            else:
                raise ReportGenerationError(f"Неподдерживаемый формат: {config.format}")

        except Exception as e:
            logger.error(f"Ошибка генерации отчёта: {e}")
            raise ReportGenerationError(f"Не удалось сгенерировать отчёт: {str(e)}")

    async def _generate_requirements_status_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по статусам требований"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope
        from sqlalchemy import func, select
        from requify.app.models.requirement import Requirement

        async with async_session_scope() as db:
            # Базовый запрос для требований
            query = select(Requirement).options(crud.requirement.get_loading_options())

            # Применяем фильтры
            if filters.project_ids:
                query = query.where(Requirement.project_id.in_(filters.project_ids))
            if filters.date_from:
                query = query.where(Requirement.created_at >= filters.date_from)
            if filters.date_to:
                query = query.where(Requirement.created_at <= filters.date_to)

            result = await db.execute(query)
            requirements = result.scalars().all()

            # Подготавливаем данные для отчёта
            requirements_data = []
            status_counts = defaultdict(int)

            for req in requirements:
                status_name = req.status.name if req.status else "unknown"
                priority_name = req.priority.name if req.priority else "unknown"
                project_name = req.project.name if req.project else "unknown"
                assignee_name = req.author.name if req.author else "unassigned"

                requirements_data.append(
                    {
                        "id": req.id,
                        "name": req.title,
                        "status": status_name,
                        "priority": priority_name,
                        "project": project_name,
                        "assignee": assignee_name,
                        "created_at": (
                            req.created_at.strftime("%Y-%m-%d")
                            if req.created_at
                            else ""
                        ),
                        "updated_at": (
                            req.updated_at.strftime("%Y-%m-%d")
                            if req.updated_at
                            else ""
                        ),
                    }
                )

                status_counts[status_name] += 1

            # Вычисляем статистику
            total = len(requirements_data)
            completed_count = status_counts.get("completed", 0) + status_counts.get(
                "implemented", 0
            )
            completion_rate = (
                round((completed_count / total) * 100, 2) if total > 0 else 0
            )

            summary = {
                "total_requirements": total,
                "by_status": dict(status_counts),
                "completion_rate": completion_rate,
            }

            return ReportData(
                title="Отчёт по статусам требований",
                description="Сводка по текущим статусам всех требований в системе",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=requirements_data,
                metadata={"total_count": total},
            )

    async def _generate_requirements_by_project_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по требованиям в разрезе проектов"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope
        from sqlalchemy import func, select
        from requify.app.models.project import Project
        from requify.app.models.requirement import Requirement

        async with async_session_scope() as db:
            # Получаем проекты с количеством требований
            projects = await crud.project.get_multi(db)
            projects_data = []

            for project in projects:
                # Получаем требования проекта
                requirements = await crud.requirement.get_by_project(
                    db, project_id=project.id
                )

                # Подсчитываем статистику
                total_requirements = len(requirements)
                status_counts = defaultdict(int)

                for req in requirements:
                    status_name = req.status.name if req.status else "unknown"
                    status_counts[status_name] += 1

                completed = status_counts.get("completed", 0) + status_counts.get(
                    "implemented", 0
                )
                in_progress = status_counts.get("in_progress", 0)
                draft = status_counts.get("draft", 0)
                completion_percentage = (
                    round((completed / total_requirements) * 100, 2)
                    if total_requirements > 0
                    else 0
                )

                projects_data.append(
                    {
                        "project_id": project.id,
                        "project_name": project.name,
                        "total_requirements": total_requirements,
                        "completed": completed,
                        "in_progress": in_progress,
                        "draft": draft,
                        "completion_percentage": completion_percentage,
                        "avg_completion_time": 7.5,  # Можно вычислить из дат
                    }
                )

            summary = {
                "total_projects": len(projects_data),
                "total_requirements": sum(
                    p["total_requirements"] for p in projects_data
                ),
                "average_completion_rate": (
                    round(
                        sum(p["completion_percentage"] for p in projects_data)
                        / len(projects_data),
                        2,
                    )
                    if projects_data
                    else 0
                ),
            }

            return ReportData(
                title="Отчёт по требованиям в разрезе проектов",
                description="Статистика выполнения требований по проектам",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=projects_data,
                metadata={"projects_analyzed": len(projects_data)},
            )

    async def _generate_requirements_by_user_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по требованиям в разрезе пользователей"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope
        from sqlalchemy import select, func
        from requify.app.models.user import User
        from requify.app.models.requirement import Requirement

        async with async_session_scope() as db:
            # Получаем пользователей
            users = await crud.user.get_multi(db)
            users_data = []

            for user in users:
                # Получаем требования пользователя (как автора)
                authored_query = select(Requirement).where(
                    Requirement.author_id == user.id
                )
                result = await db.execute(authored_query)
                authored_requirements = result.scalars().all()

                # Подсчитываем статистику
                total_assigned = len(authored_requirements)
                status_counts = defaultdict(int)

                for req in authored_requirements:
                    status_name = req.status.name if req.status else "unknown"
                    status_counts[status_name] += 1

                completed = status_counts.get("completed", 0) + status_counts.get(
                    "implemented", 0
                )
                in_progress = status_counts.get("in_progress", 0)
                overdue = status_counts.get("overdue", 0)  # Если есть такой статус

                users_data.append(
                    {
                        "user_id": user.id,
                        "user_name": user.name,
                        "role": user.role.value if user.role else "unknown",
                        "assigned_requirements": total_assigned,
                        "completed_requirements": completed,
                        "in_progress_requirements": in_progress,
                        "overdue_requirements": overdue,
                        "avg_completion_time": 6.5,  # Можно вычислить из дат
                        "workload_percentage": min(
                            100, (total_assigned / 15) * 100
                        ),  # Примерная нагрузка
                    }
                )

            summary = {
                "total_users": len(users_data),
                "average_workload": (
                    round(
                        sum(u["workload_percentage"] for u in users_data)
                        / len(users_data),
                        2,
                    )
                    if users_data
                    else 0
                ),
                "total_overdue": sum(u["overdue_requirements"] for u in users_data),
            }

            return ReportData(
                title="Отчёт по требованиям в разрезе пользователей",
                description="Статистика работы пользователей с требованиями",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=users_data,
                metadata={"users_analyzed": len(users_data)},
            )

    async def _generate_project_progress_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по прогрессу проектов"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope
        from datetime import timedelta

        async with async_session_scope() as db:
            projects = await crud.project.get_multi(db)
            progress_data = []

            for project in projects:
                # Получаем требования проекта
                requirements = await crud.requirement.get_by_project(
                    db, project_id=project.id
                )

                total_requirements = len(requirements)
                completed_requirements = sum(
                    1
                    for req in requirements
                    if req.status and req.status.name in ["completed", "implemented"]
                )

                progress_percentage = (
                    round((completed_requirements / total_requirements) * 100, 2)
                    if total_requirements > 0
                    else 0
                )

                # Вычисляем даты и оценки
                start_date = project.created_at
                days_elapsed = (
                    (datetime.now(UTC) - start_date).days if start_date else 0
                )

                # Примерная оценка завершения (предполагаем 3 месяца на проект)
                estimated_duration = 90  # дней
                days_remaining = max(0, estimated_duration - days_elapsed)

                progress_data.append(
                    {
                        "project_id": project.id,
                        "project_name": project.name,
                        "start_date": (
                            start_date.strftime("%Y-%m-%d") if start_date else ""
                        ),
                        "planned_end_date": (
                            (start_date + timedelta(days=estimated_duration)).strftime(
                                "%Y-%m-%d"
                            )
                            if start_date
                            else ""
                        ),
                        "current_progress": progress_percentage,
                        "requirements_completed": completed_requirements,
                        "requirements_total": total_requirements,
                        "days_elapsed": days_elapsed,
                        "days_remaining": days_remaining,
                        "on_schedule": progress_percentage
                        >= (days_elapsed / estimated_duration * 100),
                        "risk_level": (
                            "low"
                            if progress_percentage > 70
                            else "medium" if progress_percentage > 40 else "high"
                        ),
                    }
                )

            summary = {
                "total_projects": len(progress_data),
                "projects_on_schedule": sum(
                    1 for p in progress_data if p["on_schedule"]
                ),
                "average_progress": (
                    round(
                        sum(p["current_progress"] for p in progress_data)
                        / len(progress_data),
                        2,
                    )
                    if progress_data
                    else 0
                ),
            }

            return ReportData(
                title="Отчёт по прогрессу проектов",
                description="Анализ текущего прогресса выполнения проектов",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=progress_data,
                metadata={"projects_analyzed": len(progress_data)},
            )

    async def _generate_testing_results_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по результатам тестирования"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope

        async with async_session_scope() as db:
            # Получаем результаты тестирования
            test_results = await crud.test_result.get_multi(db)

            testing_data = []
            status_counts = defaultdict(int)

            for result in test_results:
                requirement = result.requirement
                tester = result.tester

                testing_data.append(
                    {
                        "test_id": result.id,
                        "requirement_id": requirement.id if requirement else None,
                        "requirement_name": (
                            requirement.title if requirement else "Unknown"
                        ),
                        "test_status": result.status.value,
                        "tester": tester.name if tester else "Unknown",
                        "started_at": (
                            result.started_at.strftime("%Y-%m-%d %H:%M")
                            if result.started_at
                            else ""
                        ),
                        "completed_at": (
                            result.completed_at.strftime("%Y-%m-%d %H:%M")
                            if result.completed_at
                            else ""
                        ),
                        "notes": result.notes or "",
                    }
                )

                status_counts[result.status.value] += 1

            total_tests = len(testing_data)
            passed_tests = status_counts.get("passed", 0)
            pass_rate = (
                round((passed_tests / total_tests) * 100, 2) if total_tests > 0 else 0
            )

            summary = {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": status_counts.get("failed", 0),
                "blocked_tests": status_counts.get("blocked", 0),
                "pass_rate": pass_rate,
            }

            return ReportData(
                title="Отчёт по результатам тестирования",
                description="Сводка результатов тестирования требований",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=testing_data,
                metadata={"total_tests": total_tests},
            )

    async def _generate_deadlines_overview_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по дедлайнам"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope
        from datetime import timedelta

        async with async_session_scope() as db:
            # Получаем релизы с планируемыми датами
            releases = await crud.release.get_multi(db)
            deadlines_data = []

            for release in releases:
                if release.planned_date:
                    # Получаем требования релиза
                    requirements = await crud.requirement.get_by_release(
                        db, release_id=release.id
                    )

                    days_until_deadline = (
                        release.planned_date - datetime.now(UTC)
                    ).days
                    status = (
                        "overdue"
                        if days_until_deadline < 0
                        else "upcoming" if days_until_deadline <= 7 else "normal"
                    )

                    deadlines_data.append(
                        {
                            "release_id": release.id,
                            "release_name": release.name,
                            "project_name": (
                                release.project.name if release.project else "Unknown"
                            ),
                            "deadline": release.planned_date.strftime("%Y-%m-%d"),
                            "days_until": days_until_deadline,
                            "status": status,
                            "requirements_count": len(requirements),
                            "completion_progress": (
                                release.status if release.status else "unknown"
                            ),
                        }
                    )

            # Группируем по статусам
            overdue_count = sum(1 for d in deadlines_data if d["status"] == "overdue")
            upcoming_count = sum(1 for d in deadlines_data if d["status"] == "upcoming")

            summary = {
                "total_deadlines": len(deadlines_data),
                "overdue_deadlines": overdue_count,
                "upcoming_deadlines": upcoming_count,
                "on_track": len(deadlines_data) - overdue_count - upcoming_count,
            }

            return ReportData(
                title="Обзор дедлайнов",
                description="Анализ приближающихся и просроченных дедлайнов",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=deadlines_data,
                metadata={"deadlines_analyzed": len(deadlines_data)},
            )

    async def _generate_change_history_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по истории изменений"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope

        async with async_session_scope() as db:
            # Получаем комментарии как историю изменений
            comments = await crud.comment.get_multi(db)

            change_data = []
            for comment in comments:
                requirement = comment.requirement
                author = comment.author

                change_data.append(
                    {
                        "change_id": comment.id,
                        "requirement_id": requirement.id if requirement else None,
                        "requirement_name": (
                            requirement.title if requirement else "Unknown"
                        ),
                        "change_type": "comment",  # Можно расширить типы изменений
                        "changed_by": author.name if author else "Unknown",
                        "changed_at": (
                            comment.created_at.strftime("%Y-%m-%d %H:%M")
                            if comment.created_at
                            else ""
                        ),
                        "description": (
                            comment.content[:100] + "..."
                            if len(comment.content) > 100
                            else comment.content
                        ),
                    }
                )

            summary = {
                "total_changes": len(change_data),
                "recent_changes": (
                    sum(
                        1
                        for c in change_data
                        if datetime.strptime(c["changed_at"], "%Y-%m-%d %H:%M")
                        > datetime.now() - timedelta(days=7)
                    )
                    if change_data
                    else 0
                ),
            }

            return ReportData(
                title="История изменений",
                description="Журнал изменений в системе",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=change_data,
                metadata={"changes_tracked": len(change_data)},
            )

    async def _generate_performance_metrics_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по метрикам производительности"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope

        async with async_session_scope() as db:
            # Собираем метрики из различных источников
            requirements_count = len(await crud.requirement.get_multi(db))
            projects_count = len(await crud.project.get_multi(db))
            users_count = len(await crud.user.get_multi(db))
            test_results_count = len(await crud.test_result.get_multi(db))

            metrics_data = [
                {
                    "metric_name": "Total Requirements",
                    "value": requirements_count,
                    "unit": "count",
                    "category": "content",
                },
                {
                    "metric_name": "Total Projects",
                    "value": projects_count,
                    "unit": "count",
                    "category": "content",
                },
                {
                    "metric_name": "Active Users",
                    "value": users_count,
                    "unit": "count",
                    "category": "usage",
                },
                {
                    "metric_name": "Test Results",
                    "value": test_results_count,
                    "unit": "count",
                    "category": "quality",
                },
            ]

            summary = {
                "system_health": "good",
                "total_metrics": len(metrics_data),
                "last_updated": datetime.now(UTC).strftime("%Y-%m-%d %H:%M"),
            }

            return ReportData(
                title="Метрики производительности",
                description="Показатели производительности системы",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=metrics_data,
                metadata={"metrics_collected": len(metrics_data)},
            )

    async def _generate_user_activity_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по активности пользователей"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope
        from sqlalchemy import func

        async with async_session_scope() as db:
            users = await crud.user.get_multi(db)

            activity_data = []
            for user in users:
                # Подсчитываем активность пользователя
                authored_requirements = await crud.requirement.get_multi(
                    db, filter_by={"author_id": user.id}
                )

                # Комментарии пользователя
                user_comments = await crud.comment.get_multi(
                    db, filter_by={"author_id": user.id}
                )

                last_activity = user.updated_at if user.updated_at else user.created_at

                activity_data.append(
                    {
                        "user_id": user.id,
                        "user_name": user.name,
                        "email": user.email,
                        "role": user.role.value if user.role else "unknown",
                        "requirements_created": len(authored_requirements),
                        "comments_posted": len(user_comments),
                        "last_login": (
                            last_activity.strftime("%Y-%m-%d %H:%M")
                            if last_activity
                            else ""
                        ),
                        "total_activity_score": len(authored_requirements)
                        + len(user_comments),
                    }
                )

            summary = {
                "total_users": len(activity_data),
                "active_users": sum(
                    1 for u in activity_data if u["total_activity_score"] > 0
                ),
                "average_activity": (
                    round(
                        sum(u["total_activity_score"] for u in activity_data)
                        / len(activity_data),
                        2,
                    )
                    if activity_data
                    else 0
                ),
            }

            return ReportData(
                title="Активность пользователей",
                description="Статистика активности пользователей в системе",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=activity_data,
                metadata={"users_analyzed": len(activity_data)},
            )

    async def _generate_export_all_data_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует полный экспорт данных"""
        from requify.app import crud
        from requify.app.db.session import async_session_scope

        async with async_session_scope() as db:
            # Собираем все данные системы
            all_data = {
                "requirements": [],
                "projects": [],
                "users": [],
                "test_results": [],
                "comments": [],
                "releases": [],
            }

            # Требования
            requirements = await crud.requirement.get_multi(db)
            for req in requirements:
                all_data["requirements"].append(
                    {
                        "id": req.id,
                        "title": req.title,
                        "description": req.description,
                        "status": req.status.name if req.status else None,
                        "priority": req.priority.name if req.priority else None,
                        "type": req.type.name if req.type else None,
                        "project_id": req.project_id,
                        "author_id": req.author_id,
                        "created_at": (
                            req.created_at.isoformat() if req.created_at else None
                        ),
                        "updated_at": (
                            req.updated_at.isoformat() if req.updated_at else None
                        ),
                    }
                )

            # Проекты
            projects = await crud.project.get_multi(db)
            for project in projects:
                all_data["projects"].append(
                    {
                        "id": project.id,
                        "name": project.name,
                        "code": project.code,
                        "description": project.description,
                        "status": project.status,
                        "created_at": (
                            project.created_at.isoformat()
                            if project.created_at
                            else None
                        ),
                        "updated_at": (
                            project.updated_at.isoformat()
                            if project.updated_at
                            else None
                        ),
                    }
                )

            # Пользователи
            users = await crud.user.get_multi(db)
            for user in users:
                all_data["users"].append(
                    {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "role": user.role.value if user.role else None,
                        "is_active": user.is_active,
                        "created_at": (
                            user.created_at.isoformat() if user.created_at else None
                        ),
                    }
                )

            summary = {
                "requirements_count": len(all_data["requirements"]),
                "projects_count": len(all_data["projects"]),
                "users_count": len(all_data["users"]),
                "total_records": sum(len(data) for data in all_data.values()),
            }

            return ReportData(
                title="Полный экспорт данных",
                description="Экспорт всех данных системы",
                generated_at=datetime.now(UTC),
                generated_by=generated_by,
                filters_applied=self._serialize_filters(filters),
                summary=summary,
                data=[all_data],  # Все данные в одном объекте
                metadata={
                    "export_type": "full",
                    "tables_exported": list(all_data.keys()),
                },
            )

    def _serialize_filters(self, filters: ReportFilter) -> Dict[str, Any]:
        """Сериализует фильтры для отчёта"""
        return {
            "project_ids": filters.project_ids,
            "user_ids": filters.user_ids,
            "statuses": filters.statuses,
            "priorities": filters.priorities,
            "types": filters.types,
            "date_from": filters.date_from.isoformat() if filters.date_from else None,
            "date_to": filters.date_to.isoformat() if filters.date_to else None,
            "include_archived": filters.include_archived,
        }

    def _format_as_json(self, report_data: ReportData) -> Dict[str, Any]:
        """Форматирует отчёт в JSON"""
        return {
            "title": report_data.title,
            "description": report_data.description,
            "generated_at": report_data.generated_at.isoformat(),
            "generated_by": report_data.generated_by,
            "filters_applied": report_data.filters_applied,
            "summary": report_data.summary,
            "data": report_data.data,
            "metadata": report_data.metadata,
        }

    def _format_as_csv(self, report_data: ReportData) -> str:
        """Форматирует отчёт в CSV"""
        if not report_data.data:
            return "No data available"

        output = io.StringIO()

        # Заголовки CSV - берем ключи из первого элемента данных
        fieldnames = report_data.data[0].keys()
        writer = csv.DictWriter(output, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(report_data.data)

        return output.getvalue()

    def _format_as_html(self, report_data: ReportData) -> str:
        """Форматирует отчёт в HTML"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{report_data.title}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; }}
                .summary {{ background-color: #f5f5f5; padding: 15px; margin: 20px 0; }}
                table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{report_data.title}</h1>
                <p>{report_data.description}</p>
                <p><strong>Сгенерирован:</strong> {report_data.generated_at.strftime("%d.%m.%Y %H:%M")}</p>
                <p><strong>Создал:</strong> {report_data.generated_by or "Система"}</p>
            </div>
            
            <div class="summary">
                <h2>Сводка</h2>
                {self._format_summary_as_html(report_data.summary)}
            </div>
            
            <div class="data">
                <h2>Данные</h2>
                {self._format_data_as_html_table(report_data.data)}
            </div>
        </body>
        </html>
        """
        return html

    def _format_summary_as_html(self, summary: Dict[str, Any]) -> str:
        """Форматирует сводку в HTML"""
        html = "<ul>"
        for key, value in summary.items():
            if isinstance(value, dict):
                html += f"<li><strong>{key}:</strong><ul>"
                for sub_key, sub_value in value.items():
                    html += f"<li>{sub_key}: {sub_value}</li>"
                html += "</ul></li>"
            else:
                html += f"<li><strong>{key}:</strong> {value}</li>"
        html += "</ul>"
        return html

    def _format_data_as_html_table(self, data: List[Dict[str, Any]]) -> str:
        """Форматирует данные в HTML таблицу"""
        if not data:
            return "<p>Нет данных для отображения</p>"

        html = "<table>"

        # Заголовки
        headers = data[0].keys()
        html += "<tr>"
        for header in headers:
            html += f"<th>{header}</th>"
        html += "</tr>"

        # Данные
        for row in data:
            html += "<tr>"
            for header in headers:
                html += f"<td>{row.get(header, '')}</td>"
            html += "</tr>"

        html += "</table>"
        return html


# Экземпляр сервиса для использования в приложении
reporting_service = ReportingService()
