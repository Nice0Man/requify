"""
System Health Monitoring Router.

Роутер для мониторинга здоровья системы.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission

from app.api.v1.domains.system.health.schemas import (
    SystemHealthResponse,
    DetailedHealthResponse,
    HealthCheckRequest,
)
from app.services.admin_service import SystemInfoService

permission_checker = PermissionChecker()
router = APIRouter()


@router.get("/", response_model=SystemHealthResponse, summary="Get System Health")
async def get_system_health():
    """
    Get basic system health status.

    Public endpoint for basic health checking.
    """
    try:
        health_info = SystemInfoService.get_system_health()

        return SystemHealthResponse(
            status=health_info["status"],
            timestamp=health_info["timestamp"],
            uptime=health_info["uptime"],
            version=health_info["version"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}",
        )


@router.get(
    "/detailed",
    response_model=DetailedHealthResponse,
    summary="Get Detailed System Health",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_detailed_health(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Get detailed system health information.

    Requires MANAGE_SYSTEM permission.
    Includes component status, resource usage, and diagnostics.
    """
    try:
        detailed_health = SystemInfoService.get_detailed_health_info(db=db)

        return DetailedHealthResponse(
            status=detailed_health["status"],
            timestamp=detailed_health["timestamp"],
            uptime=detailed_health["uptime"],
            version=detailed_health["version"],
            database=detailed_health["database"],
            redis=detailed_health.get("redis", {}),
            storage=detailed_health["storage"],
            external_services=detailed_health.get("external_services", {}),
            system_resources=detailed_health["system_resources"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Detailed health check failed: {str(e)}",
        )


@router.post(
    "/check",
    response_model=DetailedHealthResponse,
    summary="Run Health Check",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def run_health_check(
    request: HealthCheckRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Run comprehensive health check with custom parameters.

    Requires MANAGE_SYSTEM permission.
    Allows customization of what components to check.
    """
    try:
        health_result = SystemInfoService.run_health_check(
            db=db,
            check_components=request.check_components,
            check_resources=request.check_resources,
            timeout=request.timeout,
        )

        return DetailedHealthResponse(
            status=health_result["status"],
            timestamp=health_result["timestamp"],
            uptime=health_result["uptime"],
            version=health_result["version"],
            database=health_result["database"],
            redis=health_result.get("redis", {}),
            storage=health_result["storage"],
            external_services=health_result.get("external_services", {}),
            system_resources=health_result["system_resources"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check execution failed: {str(e)}",
        )
