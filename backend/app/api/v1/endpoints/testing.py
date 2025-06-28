"""
API эндпоинты для работы с системой тестирования.

Включает интеграцию с внешними системами тестирования и управление тестовыми планами.
"""

from datetime import datetime, timedelta, UTC
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.api.deps import (
    get_db,
    get_testing_read_user,
    get_testing_write_user,
    get_testing_execute_user,
)
from requify.app.core.config import settings
from requify.app import crud, schemas
from requify.app.schemas.test_result import TestResultCreate, TestResultUpdate

router = APIRouter()


@router.get("/results", response_model=List[schemas.TestResult])
async def get_test_results(
    skip: int = 0,
    limit: int = 100,
    requirement_id: Optional[int] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить список результатов тестирования.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        requirement_id: Фильтр по ID требования
        status: Фильтр по статусу тестирования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.TestResult]: Список результатов тестирования
    """
    if requirement_id:
        results = await crud.test_result.get_by_requirement(
            db, requirement_id=requirement_id, skip=skip, limit=limit
        )
    elif status:
        results = await crud.test_result.get_by_status(
            db, status=status, skip=skip, limit=limit
        )
    else:
        results = await crud.test_result.get_multi(db, skip=skip, limit=limit)

    return results


@router.get("/plans", response_model=List[schemas.TestPlan])
async def get_test_plans(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить список тестовых планов.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        project_id: Фильтр по ID проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[dict]: Список тестовых планов
    """
    # Реализуем с помощью группировки тест-результатов по проектам
    if project_id:
        # Проверяем существование проекта
        project = await crud.project.get(db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )

        # Получаем статистику тестирования для проекта
        summary = await crud.test_result.get_test_summary(db, project_id=project_id)

        return [
            schemas.TestPlan(
                id=project_id,
                name=f"Test Plan for {project.name}",
                description=f"Автоматически созданный план тестирования для проекта {project.name}",
                status="active",
                project_id=project_id,
                created_at=project.created_at.isoformat(),
                updated_at=project.updated_at.isoformat(),
                statistics=summary,
            )
        ]
    else:
        # Получаем все проекты с тестовыми планами
        projects = await crud.project.get_multi(db, skip=skip, limit=limit)
        plans = []

        for project in projects:
            summary = await crud.test_result.get_test_summary(db, project_id=project.id)
            plans.append(
                schemas.TestPlan(
                    id=project.id,
                    name=f"Test Plan for {project.name}",
                    description=f"Автоматически созданный план тестирования для проекта {project.name}",
                    status="active",
                    project_id=project.id,
                    created_at=project.created_at.isoformat(),
                    updated_at=project.updated_at.isoformat(),
                    statistics=summary,
                )
            )

        return plans


@router.post("/plans", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_test_plan(
    plan_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_write_user),
):
    """
    Создать новый тестовый план.

    Args:
        plan_data: Данные тестового плана
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Созданный тестовый план
    """
    project_id = plan_data.get("project_id")
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Project ID is required"
        )

    # Проверяем существование проекта
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    from datetime import datetime, UTC

    # Создаем тестовый план как структуру данных
    plan = {
        "id": hash(f"{project_id}-{plan_data.get('name', 'Test Plan')}") % 10000,
        "name": plan_data.get("name", f"Test Plan for {project.name}"),
        "description": plan_data.get("description", "Auto-generated test plan"),
        "status": plan_data.get("status", "draft"),
        "project_id": project_id,
        "created_at": datetime.now(UTC).isoformat(),
        "updated_at": datetime.now(UTC).isoformat(),
    }

    return plan


@router.get("/plans/{plan_id}", response_model=schemas.TestPlan)
async def get_test_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить тестовый план по ID.

    Args:
        plan_id: ID тестового плана
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Данные тестового плана

    Raises:
        HTTPException: Если тестовый план не найден
    """
    # Используем project_id как plan_id для простоты
    project = await crud.project.get(db, id=plan_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Test plan not found"
        )

    summary = await crud.test_result.get_test_summary(db, project_id=plan_id)

    return schemas.TestPlan(
        id=plan_id,
        name=f"Test Plan for {project.name}",
        description=f"Автоматически созданный план тестирования для проекта {project.name}",
        status="active",
        project_id=plan_id,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
        statistics=summary,
    )


@router.get("/cases", response_model=List[schemas.TestCase])
async def get_test_cases(
    skip: int = 0,
    limit: int = 100,
    plan_id: Optional[int] = None,
    requirement_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить список тестовых случаев.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        plan_id: Фильтр по ID тестового плана
        requirement_id: Фильтр по ID требования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[dict]: Список тестовых случаев
    """
    # Реализуем тестовые случаи как представления требований с тестовыми результатами
    if requirement_id:
        requirement = await crud.requirement.get(db, id=requirement_id)
        if not requirement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
            )

        requirements = [requirement]
    elif plan_id:
        # plan_id соответствует project_id
        requirements = await crud.requirement.get_by_project(
            db, project_id=plan_id, skip=skip, limit=limit
        )
    else:
        requirements = await crud.requirement.get_multi(db, skip=skip, limit=limit)

    test_cases = []
    for req in requirements:
        test_results = await crud.test_result.get_by_requirement(
            db, requirement_id=req.id, limit=1
        )
        latest_result = test_results[0] if test_results else None

        test_cases.append(
            schemas.TestCase(
                id=req.id,
                name=f"Test Case for {req.title}",
                description=f"Тест для требования: {req.description}",
                status="active",
                priority=req.priority.name if req.priority else "medium",
                type="functional",
                requirement_id=req.id,
                plan_id=req.project_id,
                steps=[
                    schemas.TestCaseStep(
                        step=1,
                        action=f"Проверить выполнение требования: {req.title}",
                        expected="Требование выполнено в соответствии с описанием",
                    )
                ],
                latest_test_status=(
                    latest_result.status.value if latest_result else "not_started"
                ),
                created_at=req.created_at.isoformat(),
                updated_at=req.updated_at.isoformat(),
            )
        )

    return test_cases


@router.post(
    "/cases", response_model=schemas.TestCase, status_code=status.HTTP_201_CREATED
)
async def create_test_case(
    case_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_write_user),
):
    """
    Создать новый тестовый случай.

    Args:
        case_data: Данные тестового случая
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Созданный тестовый случай
    """
    requirement_id = case_data.get("requirement_id")
    if not requirement_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Requirement ID is required"
        )

    # Проверяем существование требования
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    # Создаем тест-результат как представление тестового случая
    from datetime import datetime, UTC

    test_result_data = TestResultCreate(
        requirement_id=requirement_id,
        status="not_started",
        notes=f"Test case: {case_data.get('name', 'Auto-generated test case')}",
        tester_id=current_user.id if hasattr(current_user, "id") else None,
    )

    test_result = await crud.test_result.create(db, obj_in=test_result_data)

    return schemas.TestCase(
        id=test_result.id,
        name=case_data.get("name", f"Test Case for {requirement.title}"),
        description=case_data.get(
            "description", f"Тест для требования: {requirement.description}"
        ),
        status="draft",
        priority=case_data.get("priority", "medium"),
        type=case_data.get("type", "functional"),
        requirement_id=requirement_id,
        plan_id=case_data.get("plan_id", requirement.project_id),
        steps=case_data.get("steps", []),
        created_at=test_result.created_at.isoformat(),
        updated_at=test_result.updated_at.isoformat(),
    )


@router.get("/executions", response_model=List[schemas.TestExecution])
async def get_test_executions(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить список выполнений тестов.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        case_id: Фильтр по ID тестового случая
        status_filter: Фильтр по статусу выполнения
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[dict]: Список выполнений тестов
    """
    # Получаем тест-результаты как выполнения тестов
    if case_id:
        # case_id соответствует requirement_id
        test_results = await crud.test_result.get_by_requirement(
            db, requirement_id=case_id, skip=skip, limit=limit
        )
    elif status_filter:
        test_results = await crud.test_result.get_by_status(
            db, status=status_filter, skip=skip, limit=limit
        )
    else:
        test_results = await crud.test_result.get_multi(db, skip=skip, limit=limit)

    executions = []
    for result in test_results:
        executions.append(
            schemas.TestExecution(
                id=result.id,
                case_id=result.requirement_id,
                tester_id=result.tester_id,
                status=result.status.value,
                started_at=(
                    result.started_at.isoformat() if result.started_at else None
                ),
                completed_at=(
                    result.completed_at.isoformat() if result.completed_at else None
                ),
                duration=None,  # Можно вычислить как разность времени
                notes=result.notes,
                created_at=result.created_at.isoformat(),
                updated_at=result.updated_at.isoformat(),
            )
        )

    return executions


@router.post(
    "/executions",
    response_model=schemas.TestExecution,
    status_code=status.HTTP_201_CREATED,
)
async def execute_test_case(
    execution_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_execute_user),
):
    """
    Выполнить тестовый случай.

    Args:
        execution_data: Данные выполнения теста
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат выполнения теста
    """
    case_id = execution_data.get("case_id")
    requirement_id = execution_data.get("requirement_id", case_id)

    if not requirement_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Requirement ID is required"
        )

    # Проверяем существование требования
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    from datetime import datetime, UTC

    # Создаем или обновляем тест-результат
    existing_results = await crud.test_result.get_by_requirement(
        db, requirement_id=requirement_id, limit=1
    )

    if existing_results:
        # Обновляем существующий результат
        test_result = existing_results[0]
        update_data = TestResultUpdate(
            status=execution_data.get("status", "in_progress"),
            notes=execution_data.get("notes", "Test execution updated"),
            started_at=datetime.now(UTC).replace(tzinfo=None),
            tester_id=(
                current_user.id
                if hasattr(current_user, "id")
                else test_result.tester_id
            ),
        )

        if execution_data.get("status") in ["passed", "failed", "blocked"]:
            update_data.completed_at = datetime.now(UTC).replace(tzinfo=None)

        updated_result = await crud.test_result.update(
            db, db_obj=test_result, obj_in=update_data
        )
        return schemas.TestExecution(
            id=updated_result.id,
            case_id=requirement_id,
            status=updated_result.status.value,
            started_at=(
                updated_result.started_at.isoformat()
                if updated_result.started_at
                else None
            ),
            completed_at=(
                updated_result.completed_at.isoformat()
                if updated_result.completed_at
                else None
            ),
            notes=updated_result.notes,
            tester_id=updated_result.tester_id,
        )
    else:
        # Создаем новый результат
        test_result_data = TestResultCreate(
            requirement_id=requirement_id,
            status=execution_data.get("status", "in_progress"),
            notes=execution_data.get("notes", "Test execution started"),
            started_at=datetime.now(UTC).replace(tzinfo=None),
            tester_id=current_user.id if hasattr(current_user, "id") else None,
        )

        if execution_data.get("status") in ["passed", "failed", "blocked"]:
            test_result_data.completed_at = datetime.now(UTC).replace(tzinfo=None)

        test_result = await crud.test_result.create(db, obj_in=test_result_data)
        return schemas.TestExecution(
            id=test_result.id,
            case_id=requirement_id,
            status=test_result.status.value,
            started_at=(
                test_result.started_at.isoformat() if test_result.started_at else None
            ),
            completed_at=(
                test_result.completed_at.isoformat()
                if test_result.completed_at
                else None
            ),
            notes=test_result.notes,
            tester_id=test_result.tester_id,
        )


@router.get("/reports/summary", response_model=schemas.TestingSummary)
async def get_testing_summary(
    project_id: Optional[int] = None,
    plan_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить сводку по тестированию.

    Args:
        project_id: Фильтр по ID проекта
        plan_id: Фильтр по ID тестового плана
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Сводка по тестированию
    """
    target_project_id = project_id or plan_id

    if target_project_id:
        summary = await crud.test_result.get_test_summary(
            db, project_id=target_project_id
        )
        project = await crud.project.get(db, id=target_project_id)

        return schemas.TestingSummary(
            project_id=target_project_id,
            project_name=project.name if project else "Unknown",
            summary=summary,
            pass_rate=summary.get("pass_rate", 0),
            total_test_cases=summary.get("total_tests", 0),
            executed_tests=summary.get("passed_tests", 0)
            + summary.get("failed_tests", 0),
            pending_tests=summary.get("total_tests", 0)
            - (summary.get("passed_tests", 0) + summary.get("failed_tests", 0)),
        )
    else:
        # Общая сводка по всем проектам
        projects = await crud.project.get_multi(db)
        total_summary = schemas.TestingSummary(
            total_tests=0,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            pass_rate=0,
        )

        project_summaries = []
        for project in projects:
            project_summary = await crud.test_result.get_test_summary(
                db, project_id=project.id
            )
            project_summaries.append(
                schemas.TestingSummary(
                    project_id=project.id,
                    project_name=project.name,
                    summary=project_summary,
                )
            )

            # Накапливаем общую статистику
            total_summary.total_tests += project_summary.get("total_tests", 0)
            total_summary.passed_tests += project_summary.get("passed_tests", 0)
            total_summary.failed_tests += project_summary.get("failed_tests", 0)
            total_summary.skipped_tests += project_summary.get("skipped_tests", 0)

        # Вычисляем общий процент успешности
        if total_summary.total_tests > 0:
            total_summary.pass_rate = round(
                total_summary.passed_tests / total_summary.total_tests * 100, 2
            )

        return schemas.TestingSummary(
            overall_summary=total_summary,
            projects=project_summaries,
            total_projects=len(projects),
        )


@router.post("/asuts/requirement-status", response_model=schemas.TestResult)
async def request_requirement_testing_status(
    request_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_write_user),
):
    """
    Запросить статус тестирования требования из АСУТс.

    Функция 13 из ТЗ: Интеграция с внешними системами тестирования.
    Роль пользователя: Тестировщик или уполномоченный сотрудник.

    Args:
        request_data: Данные запроса
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Статус тестирования требования из АСУТс
    """
    requirement_id = request_data.get("requirement_id")
    if not requirement_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Requirement ID is required"
        )

    # Проверяем существование требования
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    # Получаем текущие результаты тестирования
    test_results = await crud.test_result.get_by_requirement(
        db, requirement_id=requirement_id
    )
    latest_result = test_results[0] if test_results else None

    # Имитируем запрос к АСУТс
    asuts_response = {
        "requirement_id": requirement_id,
        "external_test_id": f"ASUTS-TEST-{requirement_id}-{hash(requirement.title) % 10000}",
        "status": latest_result.status.value if latest_result else "not_started",
        "test_environment": "ASUTS_ENV_1",
        "test_suite": "AUTOMATED_REGRESSION",
        "execution_time": "2024-01-15T10:30:00Z",
        "test_coverage": 85.5,
        "defects_found": (
            0 if latest_result and latest_result.status.value == "passed" else 1
        ),
        "compliance_status": (
            "COMPLIANT"
            if latest_result and latest_result.status.value == "passed"
            else "NON_COMPLIANT"
        ),
        "integration_notes": "Статус получен из локальной системы тестирования",
        "last_sync": "2024-01-15T12:00:00Z",
    }

    # Обновляем локальный результат с данными из АСУТс
    if latest_result:
        await crud.test_result.update(
            db,
            db_obj=latest_result,
            obj_in={"external_id": latest_result.external_id},
        )

    return schemas.TestResult(
        id=latest_result.id,
        status=latest_result.status.value,
        notes=latest_result.notes,
        tester_id=latest_result.tester_id,
    )


@router.post("/asuts/release-status", response_model=schemas.TestResult)
async def request_release_testing_status(
    request_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_write_user),
):
    """
    Запросить статус тестирования релиза из АСУТс.

    Функция 13 из ТЗ: Интеграция с внешними системами тестирования.
    Роль пользователя: Тестировщик или уполномоченный сотрудник.

    Args:
        request_data: Данные запроса
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Статус тестирования релиза из АСУТс
    """
    release_id = request_data.get("release_id")
    if not release_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Release ID is required"
        )

    # Проверяем существование релиза
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Получаем требования релиза и их тесты
    requirements = await crud.requirement.get_by_release(db, release_id=release_id)
    total_requirements = len(requirements)
    tested_requirements = 0
    passed_requirements = 0

    for req in requirements:
        test_results = await crud.test_result.get_by_requirement(
            db, requirement_id=req.id, limit=1
        )
        if test_results:
            tested_requirements += 1
            if test_results[0].status.value == "passed":
                passed_requirements += 1

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Fetch data from asuts now not implemented",
    )


@router.post("/integration/run", response_model=schemas.TestResult)
async def run_integration_tests(
    test_config: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_write_user),
):
    """
    Запустить интеграционные тесты.

    Args:
        test_config: Конфигурация тестов
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат запуска интеграционных тестов
    """
    # fetch data from asuts now not implemented
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Fetch data from asuts now not implemented",
    )


@router.get("/integration/status/{job_id}", response_model=schemas.TestResult)
async def get_integration_test_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_testing_read_user),
):
    """
    Получить статус выполнения интеграционных тестов.

    Args:
        job_id: ID задачи
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.TestResult: Статус выполнения интеграционных тестов АСУТс (заглушка)
        fetch data from asuts now not implemented
    """
    # fetch data from asuts now not implemented
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Fetch data from asuts now not implemented",
    )
