"""
Quality Testing Schemas.

Pydantic models для операций с тестированием.
"""

from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Testing Enums ===


class TestStatus(str, Enum):
    """Статусы тестов."""

    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


class TestPriority(str, Enum):
    """Приоритеты тестов."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TestType(str, Enum):
    """Типы тестирования."""

    FUNCTIONAL = "functional"
    INTEGRATION = "integration"
    UNIT = "unit"
    PERFORMANCE = "performance"
    SECURITY = "security"
    USER_ACCEPTANCE = "user_acceptance"
    REGRESSION = "regression"


class ExecutionResult(str, Enum):
    """Результаты выполнения тестов."""

    PASS = "pass"
    FAIL = "fail"
    SKIP = "skip"
    ERROR = "error"


# === Test Plan Schemas ===


class TestPlanCreateRequest(BaseSchema):
    """Schema for creating a test plan."""

    name: str = Field(..., min_length=1, max_length=255, description="Название плана")
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание плана"
    )
    project_id: int = Field(..., description="ID проекта")
    test_type: TestType = Field(..., description="Тип тестирования")


class TestPlanUpdateRequest(BaseSchema):
    """Schema for updating a test plan."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Название плана"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание плана"
    )
    status: Optional[TestStatus] = Field(None, description="Статус плана")
    test_type: Optional[TestType] = Field(None, description="Тип тестирования")


class TestPlanResponse(BaseSchema):
    """Basic test plan information."""

    id: int = Field(..., description="ID плана")
    name: str = Field(..., description="Название плана")
    description: Optional[str] = Field(None, description="Описание плана")
    project_id: int = Field(..., description="ID проекта")
    status: TestStatus = Field(..., description="Статус плана")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")


class TestPlanDetailResponse(TestPlanResponse):
    """Detailed test plan information."""

    test_type: TestType = Field(..., description="Тип тестирования")
    created_by: int = Field(..., description="ID создателя")

    # Статистика
    test_cases_count: int = Field(0, description="Количество тест-кейсов")
    passed_tests: int = Field(0, description="Пройденные тесты")
    failed_tests: int = Field(0, description="Проваленные тесты")
    pending_tests: int = Field(0, description="Ожидающие тесты")


class TestPlanListResponse(BaseSchema):
    """Response for test plan list with pagination."""

    test_plans: List[TestPlanResponse] = Field(..., description="Список планов")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


# === Test Case Schemas ===


class TestCaseCreateRequest(BaseSchema):
    """Schema for creating a test case."""

    title: str = Field(
        ..., min_length=1, max_length=255, description="Заголовок тест-кейса"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание тест-кейса"
    )
    plan_id: int = Field(..., description="ID плана тестирования")
    priority: TestPriority = Field(TestPriority.MEDIUM, description="Приоритет")
    steps: List[str] = Field(..., description="Шаги выполнения")
    expected_result: str = Field(..., description="Ожидаемый результат")


class TestCaseUpdateRequest(BaseSchema):
    """Schema for updating a test case."""

    title: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Заголовок"
    )
    description: Optional[str] = Field(None, max_length=1000, description="Описание")
    priority: Optional[TestPriority] = Field(None, description="Приоритет")
    steps: Optional[List[str]] = Field(None, description="Шаги выполнения")
    expected_result: Optional[str] = Field(None, description="Ожидаемый результат")
    status: Optional[TestStatus] = Field(None, description="Статус")


class TestCaseResponse(BaseSchema):
    """Basic test case information."""

    id: int = Field(..., description="ID тест-кейса")
    title: str = Field(..., description="Заголовок")
    description: Optional[str] = Field(None, description="Описание")
    plan_id: int = Field(..., description="ID плана")
    status: TestStatus = Field(..., description="Статус")
    priority: TestPriority = Field(..., description="Приоритет")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")


class TestCaseDetailResponse(TestCaseResponse):
    """Detailed test case information."""

    steps: List[str] = Field(..., description="Шаги выполнения")
    expected_result: str = Field(..., description="Ожидаемый результат")
    created_by: int = Field(..., description="ID создателя")

    # Статистика
    executions_count: int = Field(0, description="Количество выполнений")
    last_execution_result: Optional[ExecutionResult] = Field(
        None, description="Последний результат"
    )


class TestCaseListResponse(BaseSchema):
    """Response for test case list with pagination."""

    test_cases: List[TestCaseResponse] = Field(..., description="Список тест-кейсов")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


# === Test Execution Schemas ===


class TestExecutionCreateRequest(BaseSchema):
    """Schema for creating a test execution."""

    test_case_id: int = Field(..., description="ID тест-кейса")
    result: ExecutionResult = Field(..., description="Результат выполнения")
    actual_result: Optional[str] = Field(None, description="Фактический результат")
    notes: Optional[str] = Field(None, max_length=1000, description="Заметки")
    execution_time_seconds: Optional[int] = Field(
        None, ge=0, description="Время выполнения в секундах"
    )


class TestExecutionResponse(BaseSchema):
    """Test execution information."""

    id: int = Field(..., description="ID выполнения")
    test_case_id: int = Field(..., description="ID тест-кейса")
    result: ExecutionResult = Field(..., description="Результат")
    actual_result: Optional[str] = Field(None, description="Фактический результат")
    notes: Optional[str] = Field(None, description="Заметки")
    execution_time_seconds: Optional[int] = Field(None, description="Время выполнения")
    executed_by: int = Field(..., description="ID исполнителя")
    executed_at: datetime = Field(..., description="Дата выполнения")


class TestExecutionListResponse(BaseSchema):
    """Response for test execution list with pagination."""

    executions: List[TestExecutionResponse] = Field(
        ..., description="Список выполнений"
    )
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    pages: int = Field(..., description="Общее количество страниц")


# === Test Results and Reports Schemas ===


class TestResultSummary(BaseSchema):
    """Test results summary."""

    total_tests: int = Field(..., description="Общее количество тестов")
    passed_tests: int = Field(..., description="Пройденные тесты")
    failed_tests: int = Field(..., description="Проваленные тесты")
    blocked_tests: int = Field(..., description="Заблокированные тесты")
    skipped_tests: int = Field(..., description="Пропущенные тесты")
    pass_rate: float = Field(..., description="Процент прохождения")
    execution_time_total: Optional[int] = Field(
        None, description="Общее время выполнения"
    )


class TestReportResponse(BaseSchema):
    """Test report response."""

    id: int = Field(..., description="ID отчета")
    name: str = Field(..., description="Название отчета")
    project_id: Optional[int] = Field(None, description="ID проекта")
    test_plan_id: Optional[int] = Field(None, description="ID плана")
    summary: TestResultSummary = Field(..., description="Сводка результатов")
    generated_at: datetime = Field(..., description="Дата генерации")
    generated_by: int = Field(..., description="ID генератора")


# === Integration Testing Schemas ===


class IntegrationTestJobResponse(BaseSchema):
    """Integration test job response."""

    job_id: str = Field(..., description="ID задания")
    status: str = Field(..., description="Статус задания")
    project_id: Optional[int] = Field(None, description="ID проекта")
    started_at: datetime = Field(..., description="Время начала")
    completed_at: Optional[datetime] = Field(None, description="Время завершения")
    results: Optional[Dict[str, Any]] = Field(None, description="Результаты")
    error_message: Optional[str] = Field(None, description="Сообщение об ошибке")


# === Operation Response Schemas ===


class TestOperationResponse(BaseSchema):
    """Response for test operations."""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение операции")
    entity_id: int = Field(..., description="ID сущности")
    entity_type: str = Field(..., description="Тип сущности")
    timestamp: datetime = Field(
        default_factory=datetime.now(UTC), description="Время операции"
    )
