"""
Интеграция с Автоматизированной Системой Управления Тестированием (АСУТс).

Модуль для взаимодействия с внешней системой тестирования,
следуя принципам SOLID и паттерну Adapter.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import httpx
import logging

from app.core.config import settings
from app.core.exceptions import ExternalServiceError

logger = logging.getLogger(__name__)


class TestingSystemInterface(ABC):
    """
    Интерфейс для интеграции с системой тестирования (Interface Segregation Principle).
    """

    @abstractmethod
    async def create_test_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создать тестовый план во внешней системе."""
        pass

    @abstractmethod
    async def execute_test_case(
        self, case_id: str, parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Выполнить тест-кейс во внешней системе."""
        pass

    @abstractmethod
    async def get_test_results(self, execution_id: str) -> Dict[str, Any]:
        """Получить результаты выполнения теста."""
        pass

    @abstractmethod
    async def sync_test_cases(self, project_id: int) -> List[Dict[str, Any]]:
        """Синхронизировать тест-кейсы с внешней системой."""
        pass


class TestingSystemIntegration(TestingSystemInterface):
    """
    Основная реализация интеграции с системой тестирования (Dependency Inversion Principle).
    """

    def __init__(self):
        self.base_url = settings.integrations.testing_system.base_url
        self.api_key = settings.integrations.testing_system.api_key
        self.timeout = settings.integrations.testing_system.timeout

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Выполнить HTTP запрос к внешней системе.

        Args:
            method: HTTP метод
            endpoint: Конечная точка API
            data: Данные для отправки
            params: Query параметры

        Returns:
            Dict[str, Any]: Ответ от внешней системы

        Raises:
            ExternalServiceError: При ошибке взаимодействия с внешней системой
        """
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method, url=url, json=data, params=params, headers=headers
                )
                response.raise_for_status()

                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(
                f"HTTP error from testing system: {e.response.status_code} - {e.response.text}"
            )
            raise ExternalServiceError(
                service_name="Testing System",
                message=f"HTTP {e.response.status_code}: {e.response.text}",
            )
        except httpx.RequestError as e:
            logger.error(f"Request error to testing system: {str(e)}")
            raise ExternalServiceError(
                service_name="Testing System", message=f"Request failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error with testing system: {str(e)}")
            raise ExternalServiceError(
                service_name="Testing System", message=f"Unexpected error: {str(e)}"
            )

    async def create_test_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Создать тестовый план во внешней системе.

        Args:
            plan_data: Данные тестового плана

        Returns:
            Dict[str, Any]: Созданный тестовый план с ID из внешней системы
        """
        logger.info(f"Creating test plan in external system: {plan_data.get('name')}")

        # Адаптируем данные для внешней системы
        external_plan_data = {
            "name": plan_data.get("name"),
            "description": plan_data.get("description"),
            "project_id": plan_data.get("project_id"),
            "status": "draft",
            "metadata": {
                "source": "requify",
                "created_by": plan_data.get("created_by"),
            },
        }

        result = await self._make_request(
            "POST", "/test-plans", data=external_plan_data
        )

        logger.info(f"Test plan created with external ID: {result.get('id')}")
        return result

    async def execute_test_case(
        self, case_id: str, parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Выполнить тест-кейс во внешней системе.

        Args:
            case_id: ID тест-кейса во внешней системе
            parameters: Параметры для выполнения теста

        Returns:
            Dict[str, Any]: Информация о запущенном выполнении
        """
        logger.info(f"Executing test case {case_id} in external system")

        execution_data = {
            "case_id": case_id,
            "parameters": parameters,
            "priority": parameters.get("priority", "normal"),
            "environment": parameters.get("environment", "default"),
            "metadata": {
                "source": "requify",
                "executed_by": parameters.get("executed_by"),
            },
        }

        result = await self._make_request(
            "POST", "/test-executions", data=execution_data
        )

        logger.info(f"Test execution started with ID: {result.get('execution_id')}")
        return result

    async def get_test_results(self, execution_id: str) -> Dict[str, Any]:
        """
        Получить результаты выполнения теста.

        Args:
            execution_id: ID выполнения теста

        Returns:
            Dict[str, Any]: Результаты выполнения теста
        """
        logger.info(f"Getting test results for execution {execution_id}")

        result = await self._make_request(
            "GET", f"/test-executions/{execution_id}/results"
        )

        # Адаптируем результаты для нашей системы
        adapted_result = {
            "execution_id": execution_id,
            "status": result.get("status"),
            "result": result.get("result"),
            "start_time": result.get("start_time"),
            "end_time": result.get("end_time"),
            "duration": result.get("duration"),
            "logs": result.get("logs", []),
            "screenshots": result.get("screenshots", []),
            "errors": result.get("errors", []),
            "metadata": result.get("metadata", {}),
        }

        return adapted_result

    async def sync_test_cases(self, project_id: int) -> List[Dict[str, Any]]:
        """
        Синхронизировать тест-кейсы с внешней системой.

        Args:
            project_id: ID проекта

        Returns:
            List[Dict[str, Any]]: Список синхронизированных тест-кейсов
        """
        logger.info(f"Syncing test cases for project {project_id}")

        params = {"project_id": project_id, "source": "requify"}
        result = await self._make_request("GET", "/test-cases", params=params)

        # Адаптируем тест-кейсы для нашей системы
        adapted_cases = []
        for case in result.get("test_cases", []):
            adapted_case = {
                "external_id": case.get("id"),
                "name": case.get("name"),
                "description": case.get("description"),
                "type": case.get("type"),
                "priority": case.get("priority"),
                "status": case.get("status"),
                "steps": case.get("steps", []),
                "expected_result": case.get("expected_result"),
                "tags": case.get("tags", []),
                "last_updated": case.get("updated_at"),
            }
            adapted_cases.append(adapted_case)

        logger.info(f"Synced {len(adapted_cases)} test cases")
        return adapted_cases

    async def health_check(self) -> bool:
        """
        Проверить доступность внешней системы тестирования.

        Returns:
            bool: True если система доступна, False иначе
        """
        try:
            await self._make_request("GET", "/health")
            return True
        except ExternalServiceError:
            return False


class MockTestingSystemIntegration(TestingSystemInterface):
    """
    Mock-реализация интеграции для тестирования и разработки.
    """

    async def create_test_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock создание тестового плана."""
        return {
            "id": "mock-plan-123",
            "external_id": "ext-plan-456",
            "name": plan_data.get("name"),
            "status": "created",
        }

    async def execute_test_case(
        self, case_id: str, parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Mock выполнение тест-кейса."""
        return {
            "execution_id": "mock-exec-789",
            "case_id": case_id,
            "status": "running",
            "estimated_duration": 300,
        }

    async def get_test_results(self, execution_id: str) -> Dict[str, Any]:
        """Mock получение результатов."""
        return {
            "execution_id": execution_id,
            "status": "completed",
            "result": "passed",
            "duration": 120,
            "logs": ["Test started", "Test passed"],
            "errors": [],
        }

    async def sync_test_cases(self, project_id: int) -> List[Dict[str, Any]]:
        """Mock синхронизация тест-кейсов."""
        return [
            {
                "external_id": "mock-case-1",
                "name": "Mock Test Case 1",
                "description": "Mock test case for development",
                "type": "functional",
                "priority": "high",
                "status": "active",
            }
        ]


def get_testing_system_integration() -> TestingSystemInterface:
    """
    Фабричная функция для получения интеграции с системой тестирования.

    Returns:
        TestingSystemInterface: Экземпляр интеграции
    """
    if settings.debug:
        return MockTestingSystemIntegration()
    else:
        return TestingSystemIntegration()
