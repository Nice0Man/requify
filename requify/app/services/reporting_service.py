"""
Сервис отчётности.

Отвечает за формирование различных отчётов по требованиям,
проектам, статистике и аналитике системы.
"""

import asyncio
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import io
import csv
import json
from collections import defaultdict
import logging

from requify.app.core.config import settings
from requify.app.core.exceptions import ReportGenerationError
from requify.app.models.requirement import Requirement
from requify.app.models.project import Project
from requify.app.models.user import User
from requify.app.models.test_result import TestResult

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

    Реализует принципы SOLID:
    - Single Responsibility: отвечает только за генерацию отчётов
    - Open/Closed: легко расширяется новыми типами отчётов
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: разделены интерфейсы для разных типов отчётов
    - Dependency Inversion: зависит от абстракций
    """

    def __init__(self):
        self.report_generators = {
            ReportType.REQUIREMENTS_STATUS: self._generate_requirements_status_report,
            ReportType.REQUIREMENTS_BY_PROJECT: self._generate_requirements_by_project_report,
            ReportType.REQUIREMENTS_BY_USER: self._generate_requirements_by_user_report,
            ReportType.PROJECT_PROGRESS: self._generate_project_progress_report,
            ReportType.TESTING_RESULTS: self._generate_testing_results_report,
            ReportType.DEADLINES_OVERVIEW: self._generate_deadlines_overview_report,
            ReportType.CHANGE_HISTORY: self._generate_change_history_report,
            ReportType.PERFORMANCE_METRICS: self._generate_performance_metrics_report,
            ReportType.USER_ACTIVITY: self._generate_user_activity_report,
            ReportType.EXPORT_ALL_DATA: self._generate_export_all_data_report,
        }

    async def generate_report(
        self, config: ReportConfig, generated_by: Optional[str] = None
    ) -> Union[Dict[str, Any], str, bytes]:
        """Генерирует отчёт по заданной конфигурации"""
        try:
            # Получаем генератор для типа отчёта
            generator = self.report_generators.get(config.type)
            if not generator:
                raise ReportGenerationError(
                    f"Неподдерживаемый тип отчёта: {config.type}"
                )

            logger.info(f"Генерация отчёта {config.type} в формате {config.format}")

            # Генерируем данные отчёта
            report_data = await generator(config.filters, generated_by)

            # Форматируем результат
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
        # TODO: Получить данные из базы данных
        # Пока используем заглушки

        requirements_data = [
            {
                "id": 1,
                "name": "Авторизация пользователей",
                "status": "in_progress",
                "priority": "high",
                "project": "Веб-портал",
                "assignee": "Иван Иванов",
                "created_at": "2025-01-15",
                "updated_at": "2025-01-20",
            },
            {
                "id": 2,
                "name": "Управление проектами",
                "status": "draft",
                "priority": "medium",
                "project": "Система управления",
                "assignee": "Петр Петров",
                "created_at": "2025-01-18",
                "updated_at": "2025-01-18",
            },
        ]

        # Группировка по статусам
        status_counts = defaultdict(int)
        for req in requirements_data:
            status_counts[req["status"]] += 1

        summary = {
            "total_requirements": len(requirements_data),
            "by_status": dict(status_counts),
            "completion_rate": (
                round(
                    (status_counts.get("completed", 0) / len(requirements_data)) * 100,
                    2,
                )
                if requirements_data
                else 0
            ),
        }

        return ReportData(
            title="Отчёт по статусам требований",
            description="Сводка по текущим статусам всех требований в системе",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=requirements_data,
            metadata={"total_count": len(requirements_data)},
        )

    async def _generate_requirements_by_project_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по требованиям в разрезе проектов"""
        # TODO: Получить данные из базы данных

        projects_data = [
            {
                "project_id": 1,
                "project_name": "Веб-портал",
                "total_requirements": 25,
                "completed": 18,
                "in_progress": 5,
                "draft": 2,
                "completion_percentage": 72.0,
                "avg_completion_time": 7.5,  # дней
            },
            {
                "project_id": 2,
                "project_name": "Система управления",
                "total_requirements": 15,
                "completed": 10,
                "in_progress": 3,
                "draft": 2,
                "completion_percentage": 66.7,
                "avg_completion_time": 9.2,
            },
        ]

        summary = {
            "total_projects": len(projects_data),
            "total_requirements": sum(p["total_requirements"] for p in projects_data),
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
            generated_at=datetime.utcnow(),
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
        # TODO: Получить данные из базы данных

        users_data = [
            {
                "user_id": 1,
                "user_name": "Иван Иванов",
                "role": "Аналитик",
                "assigned_requirements": 12,
                "completed_requirements": 8,
                "in_progress_requirements": 3,
                "overdue_requirements": 1,
                "avg_completion_time": 6.5,
                "workload_percentage": 85.0,
            },
            {
                "user_id": 2,
                "user_name": "Петр Петров",
                "role": "Разработчик",
                "assigned_requirements": 8,
                "completed_requirements": 6,
                "in_progress_requirements": 2,
                "overdue_requirements": 0,
                "avg_completion_time": 8.2,
                "workload_percentage": 70.0,
            },
        ]

        summary = {
            "total_users": len(users_data),
            "average_workload": (
                round(
                    sum(u["workload_percentage"] for u in users_data) / len(users_data),
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
            generated_at=datetime.utcnow(),
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
        # TODO: Получить данные из базы данных

        progress_data = [
            {
                "project_id": 1,
                "project_name": "Веб-портал",
                "start_date": "2025-01-01",
                "planned_end_date": "2025-03-31",
                "current_progress": 65.0,
                "requirements_completed": 18,
                "requirements_total": 25,
                "days_elapsed": 22,
                "days_remaining": 67,
                "on_schedule": True,
                "risk_level": "low",
            }
        ]

        summary = {
            "projects_analyzed": len(progress_data),
            "projects_on_schedule": sum(1 for p in progress_data if p["on_schedule"]),
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
            description="Анализ текущего состояния и прогресса проектов",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=progress_data,
            metadata={"analysis_date": datetime.utcnow().isoformat()},
        )

    async def _generate_testing_results_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по результатам тестирования"""
        # TODO: Получить данные из базы данных

        testing_data = [
            {
                "requirement_id": 1,
                "requirement_name": "Авторизация пользователей",
                "test_status": "passed",
                "test_date": "2025-01-20",
                "tester": "Анна Тестирова",
                "test_duration": 2.5,  # часов
                "bugs_found": 0,
                "test_coverage": 95.0,
            },
            {
                "requirement_id": 2,
                "requirement_name": "Управление проектами",
                "test_status": "failed",
                "test_date": "2025-01-19",
                "tester": "Анна Тестирова",
                "test_duration": 3.0,
                "bugs_found": 2,
                "test_coverage": 88.0,
            },
        ]

        summary = {
            "total_tests": len(testing_data),
            "passed_tests": sum(
                1 for t in testing_data if t["test_status"] == "passed"
            ),
            "failed_tests": sum(
                1 for t in testing_data if t["test_status"] == "failed"
            ),
            "average_coverage": (
                round(
                    sum(t["test_coverage"] for t in testing_data) / len(testing_data), 2
                )
                if testing_data
                else 0
            ),
            "total_bugs_found": sum(t["bugs_found"] for t in testing_data),
        }

        return ReportData(
            title="Отчёт по результатам тестирования",
            description="Сводка результатов тестирования требований",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=testing_data,
            metadata={"reporting_period": "последние 30 дней"},
        )

    async def _generate_deadlines_overview_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует обзор дедлайнов"""
        # TODO: Получить данные из базы данных

        deadlines_data = [
            {
                "requirement_id": 1,
                "requirement_name": "Авторизация пользователей",
                "deadline": "2025-01-25",
                "days_until_deadline": 3,
                "status": "in_progress",
                "assignee": "Иван Иванов",
                "completion_percentage": 75.0,
                "risk_level": "medium",
            }
        ]

        summary = {
            "total_deadlines": len(deadlines_data),
            "overdue": sum(1 for d in deadlines_data if d["days_until_deadline"] < 0),
            "due_soon": sum(
                1 for d in deadlines_data if 0 <= d["days_until_deadline"] <= 7
            ),
            "at_risk": sum(
                1 for d in deadlines_data if d["risk_level"] in ["high", "critical"]
            ),
        }

        return ReportData(
            title="Обзор дедлайнов",
            description="Анализ приближающихся и просроченных дедлайнов",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=deadlines_data,
            metadata={"analysis_horizon": "30 дней"},
        )

    async def _generate_change_history_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по истории изменений"""
        # TODO: Получить данные из базы данных

        changes_data = [
            {
                "change_id": 1,
                "requirement_id": 1,
                "requirement_name": "Авторизация пользователей",
                "change_type": "status_change",
                "old_value": "draft",
                "new_value": "in_progress",
                "changed_by": "Иван Иванов",
                "change_date": "2025-01-20T10:30:00Z",
                "comment": "Началась разработка",
            }
        ]

        summary = {
            "total_changes": len(changes_data),
            "changes_by_type": defaultdict(int),
            "most_active_users": {},
            "changes_this_week": 0,
        }

        return ReportData(
            title="История изменений",
            description="Детализированная история всех изменений в системе",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=changes_data,
            metadata={"tracking_period": "последние 90 дней"},
        )

    async def _generate_performance_metrics_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по метрикам производительности"""
        # TODO: Получить данные из базы данных

        metrics_data = {
            "system_metrics": {
                "average_response_time": 245,  # мс
                "uptime_percentage": 99.8,
                "active_users_count": 45,
                "peak_concurrent_users": 12,
            },
            "workflow_metrics": {
                "average_requirement_lifecycle": 14.5,  # дней
                "average_approval_time": 2.3,  # дней
                "average_testing_time": 1.8,  # дней
                "requirements_per_day": 3.2,
            },
            "quality_metrics": {
                "requirements_with_defects": 5.2,  # %
                "first_pass_success_rate": 87.5,  # %
                "rework_rate": 12.3,  # %
            },
        }

        summary = {
            "report_type": "performance_metrics",
            "measurement_period": "последние 30 дней",
            "key_indicators": {
                "system_health": "excellent",
                "workflow_efficiency": "good",
                "quality_score": "good",
            },
        }

        return ReportData(
            title="Метрики производительности",
            description="Ключевые показатели эффективности системы",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=[metrics_data],
            metadata={"baseline_period": "предыдущие 30 дней"},
        )

    async def _generate_user_activity_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует отчёт по активности пользователей"""
        # TODO: Получить данные из базы данных

        activity_data = [
            {
                "user_id": 1,
                "user_name": "Иван Иванов",
                "login_count": 25,
                "requirements_created": 5,
                "requirements_updated": 12,
                "comments_added": 8,
                "last_activity": "2025-01-22T15:30:00Z",
                "total_time_spent": 42.5,  # часов
            }
        ]

        summary = {
            "active_users": len(activity_data),
            "total_logins": sum(u["login_count"] for u in activity_data),
            "total_requirements_created": sum(
                u["requirements_created"] for u in activity_data
            ),
            "total_comments": sum(u["comments_added"] for u in activity_data),
        }

        return ReportData(
            title="Активность пользователей",
            description="Статистика активности и вовлечённости пользователей",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=activity_data,
            metadata={"tracking_period": "последние 30 дней"},
        )

    async def _generate_export_all_data_report(
        self, filters: ReportFilter, generated_by: Optional[str]
    ) -> ReportData:
        """Генерирует полный экспорт данных"""
        # TODO: Получить все данные из базы данных

        export_data = {
            "requirements": [],
            "projects": [],
            "users": [],
            "test_results": [],
            "comments": [],
        }

        summary = {
            "export_type": "full_data_export",
            "tables_exported": len(export_data),
            "total_records": sum(
                len(v) if isinstance(v, list) else 0 for v in export_data.values()
            ),
        }

        return ReportData(
            title="Полный экспорт данных",
            description="Экспорт всех данных системы для резервного копирования",
            generated_at=datetime.utcnow(),
            generated_by=generated_by,
            filters_applied=self._serialize_filters(filters),
            summary=summary,
            data=[export_data],
            metadata={"export_version": "1.0", "format": "structured"},
        )

    def _serialize_filters(self, filters: ReportFilter) -> Dict[str, Any]:
        """Сериализует фильтры для включения в отчёт"""
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
        output = io.StringIO()

        if not report_data.data:
            return "Нет данных для экспорта"

        # Получаем заголовки из первой записи
        if isinstance(report_data.data[0], dict):
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
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }}
                .summary {{ background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .footer {{ margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 0.9em; color: #666; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{report_data.title}</h1>
                <p>{report_data.description}</p>
                <p><strong>Создано:</strong> {report_data.generated_at.strftime("%d.%m.%Y %H:%M")}</p>
                {f"<p><strong>Автор:</strong> {report_data.generated_by}</p>" if report_data.generated_by else ""}
            </div>
            
            <div class="summary">
                <h2>Сводка</h2>
                {self._format_summary_as_html(report_data.summary)}
            </div>
            
            <div class="data">
                <h2>Данные</h2>
                {self._format_data_as_html_table(report_data.data)}
            </div>
            
            <div class="footer">
                <p>Сгенерировано системой Requify</p>
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
                for subkey, subvalue in value.items():
                    html += f"<li>{subkey}: {subvalue}</li>"
                html += "</ul></li>"
            else:
                html += f"<li><strong>{key}:</strong> {value}</li>"
        html += "</ul>"
        return html

    def _format_data_as_html_table(self, data: List[Dict[str, Any]]) -> str:
        """Форматирует данные в HTML таблицу"""
        if not data:
            return "<p>Нет данных для отображения</p>"

        # Получаем все возможные ключи
        all_keys = set()
        for item in data:
            if isinstance(item, dict):
                all_keys.update(item.keys())

        html = "<table><thead><tr>"
        for key in sorted(all_keys):
            html += f"<th>{key}</th>"
        html += "</tr></thead><tbody>"

        for item in data:
            if isinstance(item, dict):
                html += "<tr>"
                for key in sorted(all_keys):
                    value = item.get(key, "")
                    html += f"<td>{value}</td>"
                html += "</tr>"

        html += "</tbody></table>"
        return html


# Экземпляр сервиса для использования в приложении
reporting_service = ReportingService()
