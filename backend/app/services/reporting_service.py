"""
Reporting Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

import asyncio
import csv
import io
import json
from collections import defaultdict
from datetime import datetime, UTC
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from abc import ABC, abstractmethod
from dataclasses import dataclass

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
        """Сгенерировать отчет по статусам требований."""
        stmt = select(Requirement).options(selectinload(Requirement.project))

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

        for req in requirements:
            status_counts[req.status] += 1
            if config.include_details:
                data.append(
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
