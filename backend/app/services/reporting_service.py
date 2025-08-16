"""
Reporting Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

import asyncio
import csv
import io
<<<<<<< HEAD
import logging
from collections import defaultdict
=======
import json
from collections import defaultdict
from datetime import datetime, UTC
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from abc import ABC, abstractmethod
>>>>>>> dev-backend
from dataclasses import dataclass
from datetime import UTC, datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, or_, desc

from app.models.user import User
from app.models.project import Project
from app.models.requirement import Requirement
from app.utils.logger import logger
from .base import BaseService, ServiceError


class ReportingServiceError(ServiceError):
    """Ошибки сервиса отчетов."""

    pass


class ReportGenerationError(ReportingServiceError):
    """Ошибка генерации отчета."""

    pass


class UnsupportedFormatError(ReportingServiceError):
    """Ошибка неподдерживаемого формата."""

    pass


class ReportFormat(str, Enum):
    """Форматы отчетов."""

    JSON = "json"
    CSV = "csv"
    HTML = "html"
    PDF = "pdf"
    EXCEL = "excel"


class ReportType(str, Enum):
    """Типы отчетов."""

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
    """Фильтры для отчетов."""

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
    """Конфигурация отчета."""

    report_type: ReportType
    report_format: ReportFormat
    filters: ReportFilter
    include_details: bool = True
    include_statistics: bool = True
    group_by: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


@dataclass
class ReportData:
    """Данные отчета."""

    title: str
    description: str
    generated_at: datetime
    generated_by: Optional[str]
    filters_applied: Dict[str, Any]
    summary: Dict[str, Any]
    data: List[Dict[str, Any]]
    metadata: Dict[str, Any]


@dataclass
class ReportResult:
    """Результат генерации отчета."""

    report_data: ReportData
    content: Union[str, bytes]
    content_type: str
    file_extension: str


# Абстрактные интерфейсы
class IReportGenerator(ABC):
    """Интерфейс генератора отчетов."""

    @abstractmethod
    async def generate_report(
        self, db: AsyncSession, config: ReportConfig, user_id: Optional[int] = None
    ) -> ReportData:
        """Сгенерировать данные отчета."""
        pass

    @abstractmethod
    def get_supported_types(self) -> List[ReportType]:
        """Получить поддерживаемые типы отчетов."""
        pass


class IReportFormatter(ABC):
    """Интерфейс форматировщика отчетов."""

    @abstractmethod
    def format_report(self, report_data: ReportData) -> ReportResult:
        """Отформатировать отчет."""
        pass

    @abstractmethod
    def get_supported_format(self) -> ReportFormat:
        """Получить поддерживаемый формат."""
        pass


class IReportRepository(ABC):
    """Интерфейс репозитория отчетов."""

    @abstractmethod
    async def save_report(
        self,
        db: AsyncSession,
        report_result: ReportResult,
        user_id: Optional[int] = None,
    ) -> int:
        """Сохранить отчет."""
        pass

    @abstractmethod
    async def get_report_history(
        self, db: AsyncSession, user_id: Optional[int] = None, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Получить историю отчетов."""
        pass


# Конкретные реализации генераторов
class RequirementsStatusGenerator(IReportGenerator):
    """Генератор отчетов по статусам требований."""

    async def generate_report(
        self, db: AsyncSession, config: ReportConfig, user_id: Optional[int] = None
    ) -> ReportData:
<<<<<<< HEAD
        """Генерирует отчёт по статусам требований"""
        from sqlalchemy import func, select

        from app import crud
        from app.db.session import async_session_scope
        from app.models.requirement import Requirement
=======
        """Сгенерировать отчет по статусам требований."""
        stmt = select(Requirement).options(selectinload(Requirement.project))
>>>>>>> dev-backend

        # Применение фильтров
        if config.filters.project_ids:
            stmt = stmt.where(Requirement.project_id.in_(config.filters.project_ids))

        if config.filters.statuses:
            stmt = stmt.where(Requirement.status.in_(config.filters.statuses))

        if config.filters.date_from:
            stmt = stmt.where(Requirement.created_at >= config.filters.date_from)

        if config.filters.date_to:
            stmt = stmt.where(Requirement.created_at <= config.filters.date_to)

        result = await db.execute(stmt)
        requirements = result.scalars().all()

        # Группировка по статусам
        status_counts = defaultdict(int)
        data = []

<<<<<<< HEAD
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
        from sqlalchemy import func, select

        from app import crud
        from app.db.session import async_session_scope
        from app.models.project import Project
        from app.models.requirement import Requirement

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
        from sqlalchemy import func, select

        from app import crud
        from app.db.session import async_session_scope
        from app.models.requirement import Requirement
        from app.models.user import User

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
        from datetime import timedelta

        from app import crud
        from app.db.session import async_session_scope

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
        from app import crud
        from app.db.session import async_session_scope

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
        from datetime import timedelta

        from app import crud
        from app.db.session import async_session_scope

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
        from app import crud
        from app.db.session import async_session_scope

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
        from app import crud
        from app.db.session import async_session_scope

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
        from sqlalchemy import func

        from app import crud
        from app.db.session import async_session_scope

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
        from app import crud
        from app.db.session import async_session_scope

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
=======
        for req in requirements:
            status_counts[req.status] += 1
            if config.include_details:
                data.append(
>>>>>>> dev-backend
                    {
                        "id": req.id,
                        "title": req.title,
                        "status": req.status,
                        "priority": req.priority,
                        "project_name": req.project.name if req.project else None,
                        "created_at": (
                            req.created_at.isoformat() if req.created_at else None
                        ),
                    }
                )

            summary = {
                "total_requirements": len(requirements),
                "status_distribution": dict(status_counts),
            }

            return ReportData(
                title="Requirements Status Report",
                description="Отчет по статусам требований",
                generated_at=datetime.now(UTC),
                generated_by=str(user_id) if user_id else None,
                filters_applied=config.filters.__dict__,
                summary=summary,
                data=data,
                metadata={"report_type": config.report_type.value},
            )

    def get_supported_types(self) -> List[ReportType]:
        return [ReportType.REQUIREMENTS_STATUS]


class ProjectProgressGenerator(IReportGenerator):
    """Генератор отчетов по прогрессу проектов."""

    async def generate_report(
        self, db: AsyncSession, config: ReportConfig, user_id: Optional[int] = None
    ) -> ReportData:
        """Сгенерировать отчет по прогрессу проектов."""
        stmt = select(Project).options(selectinload(Project.requirements))

        if config.filters.project_ids:
            stmt = stmt.where(Project.id.in_(config.filters.project_ids))

        if not config.filters.include_archived:
            stmt = stmt.where(Project.is_active == True)

        result = await db.execute(stmt)
        projects = result.scalars().all()

        data = []
        total_requirements = 0
        total_completed = 0

        for project in projects:
            req_count = len(project.requirements)
            completed_count = sum(
                1 for req in project.requirements if req.status == "completed"
            )
            progress = (completed_count / req_count * 100) if req_count > 0 else 0

            total_requirements += req_count
            total_completed += completed_count

            project_data = {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "requirements_total": req_count,
                "requirements_completed": completed_count,
                "progress_percentage": round(progress, 2),
                "status": project.status if hasattr(project, "status") else "active",
                "created_at": (
                    project.created_at.isoformat() if project.created_at else None
                ),
            }

            if config.include_details:
                project_data["requirements"] = [
                    {
                        "id": req.id,
                        "title": req.title,
                        "status": req.status,
                        "priority": req.priority,
                    }
                    for req in project.requirements
                ]

            data.append(project_data)

        overall_progress = (
            (total_completed / total_requirements * 100)
            if total_requirements > 0
            else 0
        )

        summary = {
            "total_projects": len(projects),
            "total_requirements": total_requirements,
            "total_completed": total_completed,
            "overall_progress": round(overall_progress, 2),
        }

        return ReportData(
            title="Project Progress Report",
            description="Отчет по прогрессу проектов",
            generated_at=datetime.now(UTC),
            generated_by=str(user_id) if user_id else None,
            filters_applied=config.filters.__dict__,
            summary=summary,
            data=data,
            metadata={"report_type": config.report_type.value},
        )

    def get_supported_types(self) -> List[ReportType]:
        return [ReportType.PROJECT_PROGRESS]


class UserActivityGenerator(IReportGenerator):
    """Генератор отчетов по активности пользователей."""

    async def generate_report(
        self, db: AsyncSession, config: ReportConfig, user_id: Optional[int] = None
    ) -> ReportData:
        """Сгенерировать отчет по активности пользователей."""
        # Простая реализация - количество требований по пользователям
        stmt = (
            select(
                User.id,
                User.username,
                User.email,
                func.count(Requirement.id).label("requirements_count"),
            )
            .join(Requirement, User.id == Requirement.created_by, isouter=True)
            .group_by(User.id, User.username, User.email)
        )

        if config.filters.user_ids:
            stmt = stmt.where(User.id.in_(config.filters.user_ids))

        if config.filters.date_from:
            stmt = stmt.where(Requirement.created_at >= config.filters.date_from)

        if config.filters.date_to:
            stmt = stmt.where(Requirement.created_at <= config.filters.date_to)

        result = await db.execute(stmt)
        user_stats = result.fetchall()

        data = []
        total_users = 0
        total_activity = 0

        for row in user_stats:
            total_users += 1
            total_activity += row.requirements_count

            data.append(
                {
                    "user_id": row.id,
                    "username": row.username,
                    "email": row.email,
                    "requirements_created": row.requirements_count,
                    "activity_level": (
                        "high"
                        if row.requirements_count > 10
                        else "medium" if row.requirements_count > 5 else "low"
                    ),
                }
            )

        # Сортировка по активности
        data.sort(key=lambda x: x["requirements_created"], reverse=True)

        summary = {
            "total_users": total_users,
            "total_activity": total_activity,
            "average_activity": (
                round(total_activity / total_users, 2) if total_users > 0 else 0
            ),
            "most_active_user": data[0]["username"] if data else None,
        }

        return ReportData(
            title="User Activity Report",
            description="Отчет по активности пользователей",
            generated_at=datetime.now(UTC),
            generated_by=str(user_id) if user_id else None,
            filters_applied=config.filters.__dict__,
            summary=summary,
            data=data,
            metadata={"report_type": config.report_type.value},
        )

    def get_supported_types(self) -> List[ReportType]:
        return [ReportType.USER_ACTIVITY]


# Конкретные реализации форматировщиков
class JsonReportFormatter(IReportFormatter):
    """Форматировщик отчетов в JSON."""

    def format_report(self, report_data: ReportData) -> ReportResult:
        """Отформатировать отчет в JSON."""
        content = json.dumps(
            {
                "title": report_data.title,
                "description": report_data.description,
                "generated_at": report_data.generated_at.isoformat(),
                "generated_by": report_data.generated_by,
                "filters_applied": report_data.filters_applied,
                "summary": report_data.summary,
                "data": report_data.data,
                "metadata": report_data.metadata,
            },
            ensure_ascii=False,
            indent=2,
        )

        return ReportResult(
            report_data=report_data,
            content=content,
            content_type="application/json",
            file_extension="json",
        )

    def get_supported_format(self) -> ReportFormat:
        return ReportFormat.JSON


class CsvReportFormatter(IReportFormatter):
    """Форматировщик отчетов в CSV."""

    def format_report(self, report_data: ReportData) -> ReportResult:
        """Отформатировать отчет в CSV."""
        if not report_data.data:
            content = "No data available"
        else:
            output = io.StringIO()

            # Заголовки
            fieldnames = list(report_data.data[0].keys()) if report_data.data else []
            writer = csv.DictWriter(output, fieldnames=fieldnames)

            # Метаинформация
            writer.writerow(
                {fieldnames[0]: f"# {report_data.title}"} if fieldnames else {}
            )
            writer.writerow(
                {fieldnames[0]: f"# Generated at: {report_data.generated_at}"}
                if fieldnames
                else {}
            )
            writer.writerow({})  # Пустая строка

            # Заголовки колонок
            writer.writeheader()

            # Данные
            for row in report_data.data:
                # Преобразование сложных объектов в строки
                clean_row = {}
                for key, value in row.items():
                    if isinstance(value, (list, dict)):
                        clean_row[key] = json.dumps(value, ensure_ascii=False)
                    else:
                        clean_row[key] = value
                writer.writerow(clean_row)

            content = output.getvalue()
            output.close()

        return ReportResult(
            report_data=report_data,
            content=content,
            content_type="text/csv",
            file_extension="csv",
        )

    def get_supported_format(self) -> ReportFormat:
        return ReportFormat.CSV


class HtmlReportFormatter(IReportFormatter):
    """Форматировщик отчетов в HTML."""

    def format_report(self, report_data: ReportData) -> ReportResult:
        """Отформатировать отчет в HTML."""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{report_data.title}</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ border-bottom: 2px solid #333; margin-bottom: 20px; }}
                .summary {{ background-color: #f5f5f5; padding: 15px; margin-bottom: 20px; }}
                .data-table {{ border-collapse: collapse; width: 100%; }}
                .data-table th, .data-table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                .data-table th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{report_data.title}</h1>
                <p>{report_data.description}</p>
                <p><strong>Generated:</strong> {report_data.generated_at}</p>
                {f'<p><strong>Generated by:</strong> {report_data.generated_by}</p>' if report_data.generated_by else ''}
            </div>
            
            <div class="summary">
                <h2>Summary</h2>
                <ul>
        """

        for key, value in report_data.summary.items():
            html_content += f"<li><strong>{key}:</strong> {value}</li>"

        html_content += """
                </ul>
            </div>
            
            <div class="data-section">
                <h2>Data</h2>
        """

        if report_data.data:
            html_content += '<table class="data-table"><thead><tr>'

            # Заголовки
            headers = list(report_data.data[0].keys())
            for header in headers:
                html_content += f"<th>{header}</th>"

            html_content += "</tr></thead><tbody>"

            # Данные
            for row in report_data.data:
                html_content += "<tr>"
                for header in headers:
                    value = row.get(header, "")
                    if isinstance(value, (list, dict)):
                        value = json.dumps(value, ensure_ascii=False)
                    html_content += f"<td>{value}</td>"
                html_content += "</tr>"

            html_content += "</tbody></table>"
        else:
            html_content += "<p>No data available</p>"

        html_content += """
            </div>
        </body>
        </html>
        """

        return ReportResult(
            report_data=report_data,
            content=html_content,
            content_type="text/html",
            file_extension="html",
        )

    def get_supported_format(self) -> ReportFormat:
        return ReportFormat.HTML


class InMemoryReportRepository(IReportRepository):
    """Репозиторий отчетов в памяти."""

    def __init__(self):
        self._reports_history = []

    async def save_report(
        self,
        db: AsyncSession,
        report_result: ReportResult,
        user_id: Optional[int] = None,
    ) -> int:
        """Сохранить отчет."""
        report_id = len(self._reports_history) + 1

        self._reports_history.append(
            {
                "id": report_id,
                "title": report_result.report_data.title,
                "type": report_result.report_data.metadata.get("report_type"),
                "format": report_result.file_extension,
                "generated_at": report_result.report_data.generated_at,
                "generated_by": user_id,
                "size": len(report_result.content),
            }
        )

        return report_id

    async def get_report_history(
        self, db: AsyncSession, user_id: Optional[int] = None, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Получить историю отчетов."""
        filtered_reports = self._reports_history

        if user_id:
            filtered_reports = [
                report
                for report in self._reports_history
                if report["generated_by"] == user_id
            ]

        # Сортировка по дате создания (новые первыми)
        filtered_reports.sort(key=lambda x: x["generated_at"], reverse=True)

        return filtered_reports[:limit]


class ReportingService(BaseService):
    """
    Основной сервис отчетности.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные генераторы и форматировщики)
    - Factory (создание генераторов и форматировщиков)
    - Template Method (процесс генерации отчета)
    """

    def __init__(self):
        self._generators: Dict[ReportType, IReportGenerator] = {}
        self._formatters: Dict[ReportFormat, IReportFormatter] = {}
        self._repository: IReportRepository = InMemoryReportRepository()

        # Регистрация генераторов
        self._register_default_generators()

        # Регистрация форматировщиков
        self._register_default_formatters()

        super().__init__()

    def get_service_name(self) -> str:
        return "ReportingService"

    def _register_default_generators(self):
        """Зарегистрировать стандартные генераторы."""
        generators = [
            RequirementsStatusGenerator(),
            ProjectProgressGenerator(),
            UserActivityGenerator(),
        ]

        for generator in generators:
            for report_type in generator.get_supported_types():
                self._generators[report_type] = generator

    def _register_default_formatters(self):
        """Зарегистрировать стандартные форматировщики."""
        formatters = [
            JsonReportFormatter(),
            CsvReportFormatter(),
            HtmlReportFormatter(),
        ]

        for formatter in formatters:
            self._formatters[formatter.get_supported_format()] = formatter

    def register_generator(self, generator: IReportGenerator):
        """Зарегистрировать генератор отчетов."""
        for report_type in generator.get_supported_types():
            self._generators[report_type] = generator
        self._log_operation(
            "register_generator", {"generator": type(generator).__name__}
        )

    def register_formatter(self, formatter: IReportFormatter):
        """Зарегистрировать форматировщик отчетов."""
        self._formatters[formatter.get_supported_format()] = formatter
        self._log_operation(
            "register_formatter", {"formatter": type(formatter).__name__}
        )

    def set_repository(self, repository: IReportRepository):
        """Установить репозиторий отчетов."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    async def generate_report(
        self,
        db: AsyncSession,
        config: ReportConfig,
        user_id: Optional[int] = None,
        save_to_history: bool = True,
    ) -> ReportResult:
        """Сгенерировать отчет."""
        try:
            self._log_operation(
                "generate_report",
                {
                    "report_type": config.report_type.value,
                    "format": config.report_format.value,
                    "user_id": user_id,
                },
            )

            # Поиск генератора
            generator = self._generators.get(config.report_type)
            if not generator:
                raise ReportGenerationError(
                    f"No generator found for report type: {config.report_type}"
                )

            # Поиск форматировщика
            formatter = self._formatters.get(config.report_format)
            if not formatter:
                raise UnsupportedFormatError(
                    f"Unsupported format: {config.report_format}"
                )

            # Генерация данных
            report_data = await generator.generate_report(db, config, user_id)

            # Применение custom заголовков
            if config.title:
                report_data.title = config.title
            if config.description:
                report_data.description = config.description

            # Форматирование
            report_result = formatter.format_report(report_data)

            # Сохранение в историю
            if save_to_history:
                await self._repository.save_report(db, report_result, user_id)

            return report_result

        except Exception as e:
            raise self._handle_error(e, "generate_report")

    async def get_available_report_types(self) -> List[str]:
        """Получить доступные типы отчетов."""
        return [report_type.value for report_type in self._generators.keys()]

    async def get_available_formats(self) -> List[str]:
        """Получить доступные форматы."""
        return [report_format.value for report_format in self._formatters.keys()]

    async def get_report_history(
        self, db: AsyncSession, user_id: Optional[int] = None, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Получить историю отчетов."""
        try:
            self._log_operation(
                "get_report_history", {"user_id": user_id, "limit": limit}
            )

            return await self._repository.get_report_history(db, user_id, limit)

        except Exception as e:
            raise self._handle_error(e, "get_report_history")

    # Convenience методы для быстрой генерации
    async def generate_requirements_status_report(
        self,
        db: AsyncSession,
        user_id: Optional[int] = None,
        project_ids: Optional[List[int]] = None,
        format: ReportFormat = ReportFormat.JSON,
    ) -> ReportResult:
        """Сгенерировать отчет по статусам требований."""
        config = ReportConfig(
            report_type=ReportType.REQUIREMENTS_STATUS,
            report_format=format,
            filters=ReportFilter(project_ids=project_ids),
        )
        return await self.generate_report(db, config, user_id)

    async def generate_project_progress_report(
        self,
        db: AsyncSession,
        user_id: Optional[int] = None,
        project_ids: Optional[List[int]] = None,
        format: ReportFormat = ReportFormat.JSON,
    ) -> ReportResult:
        """Сгенерировать отчет по прогрессу проектов."""
        config = ReportConfig(
            report_type=ReportType.PROJECT_PROGRESS,
            report_format=format,
            filters=ReportFilter(project_ids=project_ids),
        )
        return await self.generate_report(db, config, user_id)

    async def generate_user_activity_report(
        self,
        db: AsyncSession,
        user_id: Optional[int] = None,
        target_user_ids: Optional[List[int]] = None,
        format: ReportFormat = ReportFormat.JSON,
    ) -> ReportResult:
        """Сгенерировать отчет по активности пользователей."""
        config = ReportConfig(
            report_type=ReportType.USER_ACTIVITY,
            report_format=format,
            filters=ReportFilter(user_ids=target_user_ids),
        )
        return await self.generate_report(db, config, user_id)


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("reporting", ReportingService)

# Singleton instance
reporting_service = ReportingService()
