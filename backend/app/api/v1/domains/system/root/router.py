"""
Root System Endpoints Router.

Роутер для базовых системных эндпоинтов.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.api.dependencies import CurrentUserDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission

from app.api.v2.domains.system.root.schemas import (
    RootResponse,
    SystemStatusResponse,
    SystemInfoResponse,
)
from app.services.admin_service import SystemService

permission_checker = PermissionChecker()
router = APIRouter()


@router.get(
    "/",
    response_model=RootResponse,
    summary="System Root",
    description="Базовая информация о системе",
)
async def get_root():
    """
    Get basic system information.

    Получить базовую информацию о системе.
    """
    try:
        system_info = await SystemService.get_basic_info()

        return RootResponse(
            message="Requirements Management System API v2",
            version="2.0.0",
            status="operational",
            timestamp=system_info.current_time,
            endpoints={
                "health": "/api/v2/system/health",
                "admin": "/api/v2/system/admin",
                "metrics": "/api/v2/system/metrics",
                "audit": "/api/v2/system/audit",
                "backup": "/api/v2/system/backup",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system information: {str(e)}",
        )


@router.get(
    "/status",
    response_model=SystemStatusResponse,
    summary="System Status",
    description="Статус системы",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_SYSTEM_INFO))
    ],
)
async def get_system_status(current_user: CurrentUserDep):
    """
    Get system status information.

    Получить информацию о статусе системы.
    Requires VIEW_SYSTEM_INFO permission.
    """
    try:
        status_info = await SystemService.get_system_status()

        return SystemStatusResponse(
            status=status_info.status,
            uptime=status_info.uptime,
            last_restart=status_info.last_restart,
            active_users=status_info.active_users_count,
            total_projects=status_info.total_projects,
            total_requirements=status_info.total_requirements,
            system_load=status_info.system_load,
            memory_usage=status_info.memory_usage,
            disk_usage=status_info.disk_usage,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system status: {str(e)}",
        )


@router.get(
    "/info",
    response_model=SystemInfoResponse,
    summary="System Information",
    description="Детальная информация о системе",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_system_info(current_user: CurrentUserDep):
    """
    Get detailed system information.

    Получить детальную информацию о системе.
    Requires MANAGE_SYSTEM permission.
    """
    try:
        info = await SystemService.get_detailed_info()

        return SystemInfoResponse(
            version=info.version,
            build_date=info.build_date,
            environment=info.environment,
            database_version=info.database_version,
            python_version=info.python_version,
            fastapi_version=info.fastapi_version,
            configuration=info.configuration,
            features_enabled=info.features_enabled,
            security_settings=info.security_settings,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system information: {str(e)}",
        )
