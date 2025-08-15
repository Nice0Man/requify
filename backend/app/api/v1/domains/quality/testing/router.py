"""
Quality Testing Router.

Handles all testing-related operations including test plans,
test cases, test execution, and integration testing.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from .schemas import (
    TestPlanCreateRequest,
    TestPlanUpdateRequest,
    TestPlanResponse,
    TestPlanDetailResponse,
    TestPlanListResponse,
    TestCaseCreateRequest,
    TestCaseUpdateRequest,
    TestCaseResponse,
    TestCaseDetailResponse,
    TestCaseListResponse,
    TestExecutionCreateRequest,
    TestExecutionResponse,
    TestExecutionListResponse,
    TestOperationResponse,
)

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Test Plans Management
# =============================================================================


@router.get(
    "/plans",
    summary="Get Test Plans",
    description="Get paginated list of test plans",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestPlanListResponse,
)
async def get_test_plans(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """
    Получение списка планов тестирования.

    Доступ: QA_VIEWER+
    """
    try:
        result = await test_management_service.get_test_plans_list(
            db=db,
            skip=skip,
            limit=limit,
            project_id=project_id,
            status=status,
            current_user=current_user,
        )

        test_plans = [
            TestPlanResponse(
                id=plan.id,
                name=plan.name,
                description=plan.description,
                project_id=plan.project_id,
                status=plan.status,
                created_at=plan.created_at,
                updated_at=plan.updated_at,
            )
            for plan in result
        ]

        total = len(result)
        pages = (total + limit - 1) // limit

        return TestPlanListResponse(
            test_plans=test_plans,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get test plans: {str(e)}",
        )


@router.post(
    "/plans",
    status_code=status.HTTP_201_CREATED,
    summary="Create Test Plan",
    description="Create new test plan",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestPlanDetailResponse,
)
async def create_test_plan(
    plan_data: TestPlanCreateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Создание нового плана тестирования.

    Доступ: QA_ENGINEER+
    """
    try:
        new_plan = await test_management_service.create_test_plan(
            db=db,
            name=plan_data.name,
            description=plan_data.description,
            project_id=plan_data.project_id,
            test_type=plan_data.test_type,
            created_by=current_user.id,
        )

        return TestPlanDetailResponse(
            id=new_plan.id,
            name=new_plan.name,
            description=new_plan.description,
            project_id=new_plan.project_id,
            status=new_plan.status,
            test_type=new_plan.test_type,
            created_at=new_plan.created_at,
            updated_at=new_plan.updated_at,
            created_by=new_plan.created_by,
            test_cases_count=0,
            passed_tests=0,
            failed_tests=0,
            pending_tests=0,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create test plan: {str(e)}",
        )


@router.get(
    "/plans/{plan_id}",
    summary="Get Test Plan",
    description="Get test plan by ID",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestPlanDetailResponse,
)
async def get_test_plan(
    plan_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение плана тестирования по ID.

    Доступ: QA_VIEWER+
    """
    try:
        plan = await test_management_service.get_test_plan_by_id(
            db=db, plan_id=plan_id, current_user=current_user
        )
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Test plan not found"
            )

        # Get statistics
        stats = await test_management_service.get_test_plan_statistics(
            db=db, plan_id=plan_id
        )

        return TestPlanDetailResponse(
            id=plan.id,
            name=plan.name,
            description=plan.description,
            project_id=plan.project_id,
            status=plan.status,
            test_type=plan.test_type,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            created_by=plan.created_by,
            test_cases_count=stats.get("test_cases_count", 0),
            passed_tests=stats.get("passed_tests", 0),
            failed_tests=stats.get("failed_tests", 0),
            pending_tests=stats.get("pending_tests", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get test plan: {str(e)}",
        )


@router.put(
    "/plans/{plan_id}",
    summary="Update Test Plan",
    description="Update test plan",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestPlanDetailResponse,
)
async def update_test_plan(
    plan_id: int,
    plan_data: TestPlanUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление плана тестирования.

    Доступ: QA_ENGINEER+
    """
    try:
        updated_plan = await test_management_service.update_test_plan(
            db=db,
            plan_id=plan_id,
            plan_data=plan_data.model_dump(exclude_unset=True),
            current_user=current_user,
        )

        if not updated_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Test plan not found"
            )

        # Get statistics
        stats = await test_management_service.get_test_plan_statistics(
            db=db, plan_id=plan_id
        )

        return TestPlanDetailResponse(
            id=updated_plan.id,
            name=updated_plan.name,
            description=updated_plan.description,
            project_id=updated_plan.project_id,
            status=updated_plan.status,
            test_type=updated_plan.test_type,
            created_at=updated_plan.created_at,
            updated_at=updated_plan.updated_at,
            created_by=updated_plan.created_by,
            test_cases_count=stats.get("test_cases_count", 0),
            passed_tests=stats.get("passed_tests", 0),
            failed_tests=stats.get("failed_tests", 0),
            pending_tests=stats.get("pending_tests", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update test plan: {str(e)}",
        )


@router.delete(
    "/plans/{plan_id}",
    summary="Delete Test Plan",
    description="Delete test plan",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestOperationResponse,
)
async def delete_test_plan(
    plan_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Удаление плана тестирования.

    Доступ: QA_LEAD+
    """
    try:
        success = await test_management_service.delete_test_plan(
            db=db, plan_id=plan_id, deleted_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Test plan not found"
            )

        return TestOperationResponse(
            success=True,
            message="Test plan deleted successfully",
            entity_id=plan_id,
            entity_type="test_plan",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete test plan: {str(e)}",
        )


@router.post(
    "/plans/{plan_id}/execute",
    summary="Execute Test Plan",
    description="Execute all test cases in the plan",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.EXECUTE_TEST, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestOperationResponse,
)
async def execute_test_plan(
    plan_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Выполнение всех тест-кейсов в плане.

    Доступ: QA_ENGINEER+
    """
    try:
        success = await test_management_service.execute_test_plan(
            db=db, plan_id=plan_id, executed_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Test plan not found"
            )

        return TestOperationResponse(
            success=True,
            message="Test plan execution started",
            entity_id=plan_id,
            entity_type="test_plan",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to execute test plan: {str(e)}",
        )


# =============================================================================
# Test Cases Management
# =============================================================================


@router.get(
    "/cases",
    summary="Get Test Cases",
    description="Get paginated list of test cases",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestCaseListResponse,
)
async def get_test_cases(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    plan_id: Optional[int] = Query(None, description="Filter by test plan"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """
    Получение списка тест-кейсов.

    Доступ: QA_VIEWER+
    """
    try:
        result = await test_management_service.get_test_cases_list(
            db=db,
            skip=skip,
            limit=limit,
            plan_id=plan_id,
            status=status,
            current_user=current_user,
        )

        test_cases = [
            TestCaseResponse(
                id=case.id,
                title=case.title,
                description=case.description,
                plan_id=case.plan_id,
                status=case.status,
                priority=case.priority,
                created_at=case.created_at,
                updated_at=case.updated_at,
            )
            for case in result
        ]

        total = len(result)
        pages = (total + limit - 1) // limit

        return TestCaseListResponse(
            test_cases=test_cases,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get test cases: {str(e)}",
        )


@router.post(
    "/cases",
    status_code=status.HTTP_201_CREATED,
    summary="Create Test Case",
    description="Create new test case",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestCaseDetailResponse,
)
async def create_test_case(
    case_data: TestCaseCreateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Создание нового тест-кейса.

    Доступ: QA_ENGINEER+
    """
    try:
        new_case = await test_management_service.create_test_case(
            db=db,
            title=case_data.title,
            description=case_data.description,
            plan_id=case_data.plan_id,
            priority=case_data.priority,
            steps=case_data.steps,
            expected_result=case_data.expected_result,
            created_by=current_user.id,
        )

        return TestCaseDetailResponse(
            id=new_case.id,
            title=new_case.title,
            description=new_case.description,
            plan_id=new_case.plan_id,
            status=new_case.status,
            priority=new_case.priority,
            steps=new_case.steps,
            expected_result=new_case.expected_result,
            created_at=new_case.created_at,
            updated_at=new_case.updated_at,
            created_by=new_case.created_by,
            executions_count=0,
            last_execution_result=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create test case: {str(e)}",
        )


# =============================================================================
# Integration Testing
# =============================================================================


@router.post(
    "/integration/run",
    summary="Run Integration Tests",
    description="Run integration tests",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.EXECUTE_INTEGRATION_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=TestOperationResponse,
)
async def run_integration_tests(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Project ID"),
):
    """
    Запуск интеграционных тестов.

    Доступ: QA_AUTOMATION+
    """
    try:
        job_id = await test_management_service.run_integration_tests(
            db=db, project_id=project_id, started_by=current_user.id
        )

        return TestOperationResponse(
            success=True,
            message=f"Integration tests started with job ID: {job_id}",
            entity_id=job_id,
            entity_type="integration_job",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to run integration tests: {str(e)}",
        )


@router.get(
    "/integration/jobs/{job_id}",
    summary="Get Integration Test Status",
    description="Get integration test job status",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def get_integration_test_status(
    job_id: str,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение статуса выполнения интеграционных тестов.

    Доступ: QA_VIEWER+
    """
    try:
        status_info = await test_management_service.get_integration_test_status(
            db=db, job_id=job_id, current_user=current_user
        )

        if not status_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration test job not found",
            )

        return status_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get integration test status: {str(e)}",
        )


@router.get(
    "/integration/results",
    summary="Get Integration Test Results",
    description="Get integration test results",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_TESTS, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def get_integration_test_results(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
):
    """
    Получение результатов интеграционных тестов.

    Доступ: QA_VIEWER+
    """
    try:
        results = await test_management_service.get_integration_test_results(
            db=db,
            skip=skip,
            limit=limit,
            project_id=project_id,
            current_user=current_user,
        )

        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get integration test results: {str(e)}",
        )
