"""
Интеграция с системой управления проектами.

Реализует взаимодействие с внешней системой управления проектами
для синхронизации данных о проектах, задачах и требованиях.
"""

import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import httpx
import logging

from requify.app.core.config import settings
from requify.app.core.exceptions import ExternalSystemError
from requify.app.models.project import Project
from requify.app.models.requirement import Requirement

logger = logging.getLogger(__name__)


@dataclass
class ProjectData:
    """Данные проекта из внешней системы"""

    external_id: str
    name: str
    description: Optional[str]
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    manager_email: Optional[str]
    budget: Optional[float]
    priority: Optional[str]


@dataclass
class TaskData:
    """Данные задачи из внешней системы"""

    external_id: str
    project_id: str
    name: str
    description: Optional[str]
    status: str
    assignee_email: Optional[str]
    due_date: Optional[datetime]
    priority: Optional[str]
    estimated_hours: Optional[int]
    actual_hours: Optional[int]


class ProjectManagementIntegration:
    """
    Интеграция с системой управления проектами.

    Реализует принципы SOLID:
    - Single Responsibility: отвечает только за интеграцию с PM системой
    - Open/Closed: легко расширяется для новых типов данных
    - Liskov Substitution: может быть заменена другой реализацией
    - Interface Segregation: предоставляет только необходимые методы
    - Dependency Inversion: зависит от абстракций, а не от конкретных реализаций
    """

    def __init__(self):
        self.base_url = settings.integrations.project_management_api_url
        self.api_key = settings.integrations.project_management_api_key
        self.timeout = 30.0

        # Настройка заголовков
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": f"Requify-{settings.APP_VERSION}",
        }

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Выполняет HTTP запрос к API системы управления проектами"""
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Making {method} request to PM system: {url}")

                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    params=params,
                )

                if response.status_code == 401:
                    raise ExternalSystemError(
                        "Ошибка аутентификации в системе управления проектами"
                    )
                elif response.status_code == 404:
                    raise ExternalSystemError(
                        "Ресурс не найден в системе управления проектами"
                    )
                elif response.status_code >= 400:
                    raise ExternalSystemError(
                        f"Ошибка системы управления проектами: {response.status_code} - {response.text}"
                    )

                return response.json()

        except httpx.TimeoutException:
            raise ExternalSystemError(
                "Таймаут при обращении к системе управления проектами"
            )
        except httpx.ConnectError:
            raise ExternalSystemError(
                "Не удается подключиться к системе управления проектами"
            )
        except Exception as e:
            logger.error(f"Unexpected error in PM system integration: {e}")
            raise ExternalSystemError(
                f"Неожиданная ошибка при интеграции с PM системой: {str(e)}"
            )

    async def get_projects(
        self, limit: int = 100, offset: int = 0
    ) -> List[ProjectData]:
        """Получает список проектов из внешней системы"""
        try:
            params = {"limit": limit, "offset": offset, "include_inactive": "true"}

            response = await self._make_request("GET", "/projects", params=params)
            projects = response.get("projects", [])

            return [
                ProjectData(
                    external_id=project["id"],
                    name=project["name"],
                    description=project.get("description"),
                    status=project["status"],
                    start_date=self._parse_date(project.get("start_date")),
                    end_date=self._parse_date(project.get("end_date")),
                    manager_email=project.get("manager_email"),
                    budget=project.get("budget"),
                    priority=project.get("priority"),
                )
                for project in projects
            ]

        except Exception as e:
            logger.error(f"Error fetching projects from PM system: {e}")
            raise

    async def get_project(self, external_id: str) -> Optional[ProjectData]:
        """Получает данные конкретного проекта"""
        try:
            response = await self._make_request("GET", f"/projects/{external_id}")
            project = response.get("project")

            if not project:
                return None

            return ProjectData(
                external_id=project["id"],
                name=project["name"],
                description=project.get("description"),
                status=project["status"],
                start_date=self._parse_date(project.get("start_date")),
                end_date=self._parse_date(project.get("end_date")),
                manager_email=project.get("manager_email"),
                budget=project.get("budget"),
                priority=project.get("priority"),
            )

        except ExternalSystemError as e:
            if "404" in str(e):
                return None
            raise

    async def create_project(self, project_data: ProjectData) -> str:
        """Создает проект во внешней системе"""
        try:
            data = {
                "name": project_data.name,
                "description": project_data.description,
                "status": project_data.status,
                "start_date": (
                    project_data.start_date.isoformat()
                    if project_data.start_date
                    else None
                ),
                "end_date": (
                    project_data.end_date.isoformat() if project_data.end_date else None
                ),
                "manager_email": project_data.manager_email,
                "budget": project_data.budget,
                "priority": project_data.priority,
            }

            response = await self._make_request("POST", "/projects", data=data)
            return response["project"]["id"]

        except Exception as e:
            logger.error(f"Error creating project in PM system: {e}")
            raise

    async def update_project(self, external_id: str, project_data: ProjectData) -> bool:
        """Обновляет проект во внешней системе"""
        try:
            data = {
                "name": project_data.name,
                "description": project_data.description,
                "status": project_data.status,
                "start_date": (
                    project_data.start_date.isoformat()
                    if project_data.start_date
                    else None
                ),
                "end_date": (
                    project_data.end_date.isoformat() if project_data.end_date else None
                ),
                "manager_email": project_data.manager_email,
                "budget": project_data.budget,
                "priority": project_data.priority,
            }

            await self._make_request("PUT", f"/projects/{external_id}", data=data)
            return True

        except Exception as e:
            logger.error(f"Error updating project in PM system: {e}")
            raise

    async def get_project_tasks(self, project_external_id: str) -> List[TaskData]:
        """Получает задачи проекта из внешней системы"""
        try:
            params = {"project_id": project_external_id}
            response = await self._make_request("GET", "/tasks", params=params)
            tasks = response.get("tasks", [])

            return [
                TaskData(
                    external_id=task["id"],
                    project_id=task["project_id"],
                    name=task["name"],
                    description=task.get("description"),
                    status=task["status"],
                    assignee_email=task.get("assignee_email"),
                    due_date=self._parse_date(task.get("due_date")),
                    priority=task.get("priority"),
                    estimated_hours=task.get("estimated_hours"),
                    actual_hours=task.get("actual_hours"),
                )
                for task in tasks
            ]

        except Exception as e:
            logger.error(f"Error fetching tasks from PM system: {e}")
            raise

    async def sync_project_requirements(
        self, project_external_id: str, requirements: List[Requirement]
    ) -> Dict[str, Any]:
        """Синхронизирует требования проекта с внешней системой"""
        try:
            requirements_data = [
                {
                    "id": req.id,
                    "name": req.name,
                    "description": req.description,
                    "type": req.type.value if req.type else None,
                    "priority": req.priority.value if req.priority else None,
                    "status": req.status.value if req.status else None,
                    "version": req.version,
                    "created_at": (
                        req.created_at.isoformat() if req.created_at else None
                    ),
                    "updated_at": (
                        req.updated_at.isoformat() if req.updated_at else None
                    ),
                }
                for req in requirements
            ]

            data = {
                "project_id": project_external_id,
                "requirements": requirements_data,
            }

            response = await self._make_request(
                "POST", f"/projects/{project_external_id}/sync-requirements", data=data
            )

            return {
                "synced_count": response.get("synced_count", 0),
                "updated_count": response.get("updated_count", 0),
                "created_count": response.get("created_count", 0),
                "errors": response.get("errors", []),
            }

        except Exception as e:
            logger.error(f"Error syncing requirements with PM system: {e}")
            raise

    async def get_project_status_update(
        self, external_id: str
    ) -> Optional[Dict[str, Any]]:
        """Получает обновление статуса проекта"""
        try:
            response = await self._make_request(
                "GET", f"/projects/{external_id}/status"
            )
            return response.get("status_info")

        except ExternalSystemError as e:
            if "404" in str(e):
                return None
            raise

    async def notify_requirement_change(
        self,
        project_external_id: str,
        requirement_id: int,
        change_type: str,
        details: Dict[str, Any],
    ) -> bool:
        """Уведомляет внешнюю систему об изменении требования"""
        try:
            data = {
                "requirement_id": requirement_id,
                "change_type": change_type,
                "details": details,
                "timestamp": datetime.utcnow().isoformat(),
            }

            await self._make_request(
                "POST",
                f"/projects/{project_external_id}/requirement-changes",
                data=data,
            )

            return True

        except Exception as e:
            logger.error(f"Error notifying PM system about requirement change: {e}")
            # Не поднимаем исключение для уведомлений, только логируем
            return False

    async def health_check(self) -> Dict[str, Any]:
        """Проверяет состояние внешней системы"""
        try:
            start_time = datetime.utcnow()
            response = await self._make_request("GET", "/health")
            end_time = datetime.utcnow()

            response_time = (end_time - start_time).total_seconds()

            return {
                "status": "healthy",
                "response_time": response_time,
                "version": response.get("version"),
                "timestamp": end_time.isoformat(),
            }

        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            }

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Парсит строку даты в объект datetime"""
        if not date_str:
            return None

        try:
            # Поддерживаем несколько форматов
            formats = [
                "%Y-%m-%dT%H:%M:%S",
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S.%fZ",
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%d",
            ]

            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue

            logger.warning(f"Could not parse date: {date_str}")
            return None

        except Exception as e:
            logger.error(f"Error parsing date {date_str}: {e}")
            return None
