"""
Test Management Service.

Сервис для управления тестами с полным циклом операций CRUD.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, UTC

from app.models.user import User
from app.core.constants import Permission, RoleScope
from app.utils.logger import logger
from app.core.security import require_system_admin, check_user_permission
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class TestManagementError(ServiceError):
    """Ошибки управления тестами."""

    pass


class TestNotFoundError(TestManagementError):
    """Тест-план/тест-кейс не найден."""

    def __init__(self, test_id: int, test_type: str = "test"):
        super().__init__(f"{test_type} with id {test_id} not found", "TEST_NOT_FOUND")


class TestValidationError(TestManagementError):
    """Ошибки валидации тестов."""

    pass


class TestStatus(str, Enum):
    """Статусы тест-планов и тест-кейсов."""

    DRAFT = "draft"
    ACTIVE = "active"
    EXECUTED = "executed"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


class TestType(str, Enum):
    """Типы тестов."""

    FUNCTIONAL = "functional"
    UNIT = "unit"
    INTEGRATION = "integration"
    SYSTEM = "system"
    ACCEPTANCE = "acceptance"
    REGRESSION = "regression"
    PERFORMANCE = "performance"


class TestPriority(str, Enum):
    """Приоритеты тестов."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Абстрактные интерфейсы
class ITestRepository(ABC):
    """Интерфейс репозитория тестов."""

    @abstractmethod
    async def get_test_plans(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Any]:
        """Получить список тест-планов."""
        pass

    @abstractmethod
    async def create_test_plan(
        self, db: AsyncSession, test_plan_data: Dict[str, Any]
    ) -> Any:
        """Создать тест-план."""
        pass

    @abstractmethod
    async def get_test_cases(
        self,
        db: AsyncSession,
        test_plan_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Any]:
        """Получить список тест-кейсов."""
        pass


class ITestValidator(ABC):
    """Интерфейс валидатора тестов."""

    @abstractmethod
    async def validate_test_plan_creation(
        self, db: AsyncSession, test_plan_data: Dict[str, Any], user: User
    ) -> None:
        """Валидация создания тест-плана."""
        pass

    @abstractmethod
    async def validate_test_case_creation(
        self, db: AsyncSession, test_case_data: Dict[str, Any], user: User
    ) -> None:
        """Валидация создания тест-кейса."""
        pass


class ITestExecutor(ABC):
    """Интерфейс исполнителя тестов."""

    @abstractmethod
    async def execute_test_case(
        self, db: AsyncSession, test_case_id: int, execution_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Выполнить тест-кейс."""
        pass

    @abstractmethod
    async def execute_test_plan(
        self, db: AsyncSession, test_plan_id: int, execution_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Выполнить тест-план."""
        pass


class ITestReporter(ABC):
    """Интерфейс генератора отчетов."""

    @abstractmethod
    async def generate_test_report(
        self, db: AsyncSession, test_plan_id: int, report_type: str = "summary"
    ) -> Dict[str, Any]:
        """Генерировать отчет по тестам."""
        pass


# Конкретные реализации
class MockTestRepository(ITestRepository):
    """Mock репозиторий тестов (пока нет реальных CRUD)."""

    async def get_test_plans(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Any]:
        """Получить список тест-планов."""
        # TODO: Реализовать когда будет test_plan_crud
        return []

    async def create_test_plan(
        self, db: AsyncSession, test_plan_data: Dict[str, Any]
    ) -> Any:
        """Создать тест-план."""
        # TODO: Реализовать когда будет test_plan_crud
        return {
            "id": 1,
            "name": test_plan_data.get("name", "Test Plan"),
            "status": TestStatus.DRAFT.value,
            "created_at": datetime.now(UTC),
        }

    async def get_test_cases(
        self,
        db: AsyncSession,
        test_plan_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Any]:
        """Получить список тест-кейсов."""
        # TODO: Реализовать когда будет test_case_crud
        return []


class StandardTestValidator(ITestValidator):
    """Стандартный валидатор тестов."""

    async def validate_test_plan_creation(
        self, db: AsyncSession, test_plan_data: Dict[str, Any], user: User
    ) -> None:
        """Валидация создания тест-плана."""
        if not test_plan_data.get("name"):
            raise TestValidationError("Test plan name is required")

        if len(test_plan_data.get("name", "")) < 3:
            raise TestValidationError("Test plan name must be at least 3 characters")

        # Проверка уникальности в рамках проекта
        project_id = test_plan_data.get("project_id")
        if not project_id:
            raise TestValidationError("Project ID is required")

    async def validate_test_case_creation(
        self, db: AsyncSession, test_case_data: Dict[str, Any], user: User
    ) -> None:
        """Валидация создания тест-кейса."""
        if not test_case_data.get("title"):
            raise TestValidationError("Test case title is required")

        if not test_case_data.get("test_plan_id"):
            raise TestValidationError("Test plan ID is required")

        # Валидация шагов тестирования
        steps = test_case_data.get("test_steps", [])
        if not steps:
            raise TestValidationError("Test case must have at least one test step")


class BasicTestExecutor(ITestExecutor):
    """Базовый исполнитель тестов."""

    async def execute_test_case(
        self, db: AsyncSession, test_case_id: int, execution_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Выполнить тест-кейс."""
        # TODO: Реализовать реальную логику выполнения
        return {
            "test_case_id": test_case_id,
            "status": execution_data.get("status", TestStatus.EXECUTED.value),
            "result": execution_data.get("result", "passed"),
            "execution_time": datetime.now(UTC),
            "notes": execution_data.get("notes", ""),
        }

    async def execute_test_plan(
        self, db: AsyncSession, test_plan_id: int, execution_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Выполнить тест-план."""
        # TODO: Реализовать реальную логику выполнения плана
        return {
            "test_plan_id": test_plan_id,
            "execution_id": f"exec_{test_plan_id}_{int(datetime.now().timestamp())}",
            "status": "in_progress",
            "started_at": datetime.now(UTC),
            "test_cases_count": 0,
            "executed_count": 0,
            "passed_count": 0,
            "failed_count": 0,
        }


class StandardTestReporter(ITestReporter):
    """Стандартный генератор отчетов по тестам."""

    async def generate_test_report(
        self, db: AsyncSession, test_plan_id: int, report_type: str = "summary"
    ) -> Dict[str, Any]:
        """Генерировать отчет по тестам."""
        # TODO: Реализовать реальную логику генерации отчета
        return {
            "test_plan_id": test_plan_id,
            "report_type": report_type,
            "generated_at": datetime.now(UTC),
            "summary": {
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0,
                "pass_rate": 0.0,
            },
            "details": [],
        }


class TestPermissionChecker:
    """Проверка прав доступа к тестам."""

    @staticmethod
    async def can_view_tests(
        db: AsyncSession, user: User, project_id: Optional[int] = None
    ) -> bool:
        """Проверить права на просмотр тестов."""
        return await check_user_permission(db, user, Permission.VIEW_PROJECT)

    @staticmethod
    async def can_manage_tests(
        db: AsyncSession, user: User, project_id: Optional[int] = None
    ) -> bool:
        """Проверить права на управление тестами."""
        return await check_user_permission(db, user, Permission.CREATE_REQUIREMENT)

    @staticmethod
    async def can_execute_tests(
        db: AsyncSession, user: User, project_id: Optional[int] = None
    ) -> bool:
        """Проверить права на выполнение тестов."""
        return await check_user_permission(db, user, Permission.EDIT_REQUIREMENT)


class TestManagementService(BaseService):
    """
    Основной сервис для управления тестами.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы и исполнители)
    - Template Method (процесс выполнения тестов)
    - Command (операции с тестами)
    """

    def __init__(self):
        self._repository: ITestRepository = MockTestRepository()
        self._validator: ITestValidator = StandardTestValidator()
        self._executor: ITestExecutor = BasicTestExecutor()
        self._reporter: ITestReporter = StandardTestReporter()
        self._permission_checker = TestPermissionChecker()
        super().__init__()

    def get_service_name(self) -> str:
        return "TestManagementService"

    def set_repository(self, repository: ITestRepository):
        """Установить репозиторий тестов."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: ITestValidator):
        """Установить валидатор тестов."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def get_test_plans_list(
        self,
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        project_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Получить список тест-планов с фильтрацией и пагинацией.

        Args:
            db: Сессия базы данных
            current_user: Текущий пользователь
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            search: Поисковый запрос
            project_id: Фильтр по проекту

        Returns:
            Dict содержащий список тест-планов и метаданные пагинации
        """
        try:
            self._log_operation(
                "get_test_plans_list",
                {
                    "user_id": current_user.id,
                    "search": search,
                    "project_id": project_id,
                },
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_view_tests(
                db, current_user, project_id
            ):
                raise PermissionError("Insufficient permissions to view test plans")

            filters = {}
            if search:
                filters["search"] = search
            if project_id:
                filters["project_id"] = project_id

            test_plans = await self._repository.get_test_plans(
                db=db, skip=skip, limit=limit, filters=filters
            )

            total = len(test_plans)  # TODO: Получить реальный count из репозитория

            logger.info(
                f"Retrieved {len(test_plans)} test plans for user {current_user.id}, "
                f"total: {total}, filters: search='{search}', project_id='{project_id}'"
            )

            return {
                "test_plans": test_plans,
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": (skip + len(test_plans)) < total,
            }

        except Exception as e:
            raise self._handle_error(e, "get_test_plans_list")

    async def create_test_plan(
        self,
        db: AsyncSession,
        test_plan_data: Dict[str, Any],
        current_user: User,
    ) -> Any:
        """
        Создать новый тест-план.

        Args:
            db: Сессия базы данных
            test_plan_data: Данные для создания тест-плана
            current_user: Текущий пользователь

        Returns:
            Созданный тест-план
        """
        try:
            self._log_operation(
                "create_test_plan",
                {"user_id": current_user.id, "plan_name": test_plan_data.get("name")},
            )

            # Проверка прав доступа
            project_id = test_plan_data.get("project_id")
            if not await self._permission_checker.can_manage_tests(
                db, current_user, project_id
            ):
                raise PermissionError("Insufficient permissions to create test plans")

            # Валидация данных
            await self._validator.validate_test_plan_creation(
                db, test_plan_data, current_user
            )

            # Добавление метаданных
            test_plan_data["created_by"] = current_user.id
            test_plan_data["created_at"] = datetime.now(UTC)
            test_plan_data["status"] = TestStatus.DRAFT.value

            # Создание тест-плана
            test_plan = await self._repository.create_test_plan(db, test_plan_data)

            logger.info(
                f"Test plan created successfully: {test_plan.get('id')} by user {current_user.id}"
            )
            return test_plan

        except Exception as e:
            raise self._handle_error(e, "create_test_plan")

    async def get_test_plan_by_id(
        self,
        db: AsyncSession,
        test_plan_id: int,
        current_user: User,
    ) -> Any:
        """
        Получить тест-план по ID.

        Args:
            db: Сессия базы данных
            test_plan_id: ID тест-плана
            current_user: Текущий пользователь

        Returns:
            Тест-план или None, если не найден
        """
        try:
            self._log_operation(
                "get_test_plan_by_id",
                {"test_plan_id": test_plan_id, "user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_view_tests(db, current_user):
                raise PermissionError("Insufficient permissions to view this test plan")

            # TODO: Реализовать получение конкретного тест-плана из репозитория
            test_plan = {
                "id": test_plan_id,
                "name": f"Test Plan {test_plan_id}",
                "status": TestStatus.DRAFT.value,
                "created_at": datetime.now(UTC),
            }

            if not test_plan:
                raise TestNotFoundError(test_plan_id, "Test plan")

            return test_plan

        except Exception as e:
            raise self._handle_error(e, "get_test_plan_by_id")

    async def execute_test_case(
        self,
        db: AsyncSession,
        test_case_id: int,
        execution_data: Dict[str, Any],
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Выполнить тест-кейс.

        Args:
            db: Сессия базы данных
            test_case_id: ID тест-кейса
            execution_data: Данные выполнения
            current_user: Текущий пользователь

        Returns:
            Результат выполнения тест-кейса
        """
        try:
            self._log_operation(
                "execute_test_case",
                {"test_case_id": test_case_id, "user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_execute_tests(db, current_user):
                raise PermissionError("Insufficient permissions to execute test cases")

            # Добавление метаданных выполнения
            execution_data["executed_by"] = current_user.id
            execution_data["executed_at"] = datetime.now(UTC)

            # Выполнение тест-кейса
            result = await self._executor.execute_test_case(
                db, test_case_id, execution_data
            )

            logger.info(f"Test case {test_case_id} executed by user {current_user.id}")
            return result

        except Exception as e:
            raise self._handle_error(e, "execute_test_case")

    async def generate_test_report(
        self,
        db: AsyncSession,
        test_plan_id: int,
        report_type: str,
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Генерировать отчет по тестам.

        Args:
            db: Сессия базы данных
            test_plan_id: ID тест-плана
            report_type: Тип отчета
            current_user: Текущий пользователь

        Returns:
            Сгенерированный отчет
        """
        try:
            self._log_operation(
                "generate_test_report",
                {
                    "test_plan_id": test_plan_id,
                    "report_type": report_type,
                    "user_id": current_user.id,
                },
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_view_tests(db, current_user):
                raise PermissionError(
                    "Insufficient permissions to generate test reports"
                )

            # Генерация отчета
            report = await self._reporter.generate_test_report(
                db, test_plan_id, report_type
            )
            report["generated_by"] = current_user.id

            logger.info(
                f"Test report generated for plan {test_plan_id} by user {current_user.id}"
            )
            return report

        except Exception as e:
            raise self._handle_error(e, "generate_test_report")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("test_management", TestManagementService)

# Singleton instance
test_management_service = TestManagementService()
