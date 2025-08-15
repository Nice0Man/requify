"""
System Backup and Maintenance Router.

Роутер для резервного копирования и обслуживания системы.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission

from app.api.v1.domains.system.backup.schemas import (
    BackupCreateRequest,
    BackupCreateResponse,
    BackupListResponse,
    BackupRestoreRequest,
    BackupRestoreResponse,
    MaintenanceStartRequest,
    MaintenanceResponse,
    MaintenanceStatus,
    CacheClearRequest,
    CacheClearResponse,
    CacheStatsResponse,
    SystemInfo,
    BackupType,
    BackupStatus,
)
from app.services.admin_service import BackupService, MaintenanceService, CacheService

permission_checker = PermissionChecker()
router = APIRouter()


# === Backup Operations ===


@router.post(
    "/create",
    response_model=BackupCreateResponse,
    summary="Create Backup",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def create_backup(
    request: BackupCreateRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Create system backup.

    Requires MANAGE_SYSTEM permission.
    Supports full, incremental, and differential backups.
    """
    try:
        backup_result = await BackupService.create_backup(
            db=db,
            backup_type=request.backup_type,
            description=request.description,
            include_uploads=request.include_uploads,
            include_logs=request.include_logs,
            compression=request.compression,
            created_by_user_id=current_user.id,
        )

        return BackupCreateResponse(
            backup_id=backup_result["backup_id"],
            message=backup_result["message"],
            estimated_duration=backup_result.get("estimated_duration"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create backup: {str(e)}",
        )


@router.get(
    "/list",
    response_model=BackupListResponse,
    summary="List Backups",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def list_backups(
    current_user: CurrentUserDep,
    db: SessionDep,
    backup_type: BackupType = Query(None, description="Filter by backup type"),
    status_filter: BackupStatus = Query(
        None, alias="status", description="Filter by status"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
):
    """
    Get list of system backups.

    Requires MANAGE_SYSTEM permission.
    Supports filtering by type and status.
    """
    try:
        backups_data = await BackupService.get_backups_list(
            db=db,
            backup_type=backup_type,
            status=status_filter,
            page=page,
            size=size,
        )

        return BackupListResponse(
            backups=backups_data["backups"],
            total=backups_data["total"],
            page=page,
            pages=backups_data["pages"],
            total_size_bytes=backups_data["total_size_bytes"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get backups list: {str(e)}",
        )


@router.post(
    "/restore",
    response_model=BackupRestoreResponse,
    summary="Restore Backup",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def restore_backup(
    request: BackupRestoreRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Restore system from backup.

    Requires MANAGE_SYSTEM permission.
    DANGEROUS operation - use with caution.
    """
    try:
        restore_result = await BackupService.restore_backup(
            db=db,
            backup_id=request.backup_id,
            restore_uploads=request.restore_uploads,
            restore_database=request.restore_database,
            force=request.force,
            restored_by_user_id=current_user.id,
        )

        return BackupRestoreResponse(
            success=restore_result["success"],
            message=restore_result["message"],
            restore_id=restore_result.get("restore_id"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to restore backup: {str(e)}",
        )


@router.delete(
    "/{backup_id}",
    summary="Delete Backup",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def delete_backup(
    backup_id: int,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Delete backup file and record.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        await BackupService.delete_backup(
            db=db,
            backup_id=backup_id,
            deleted_by_user_id=current_user.id,
        )

        return {"success": True, "message": "Backup deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete backup: {str(e)}",
        )


# === Maintenance Operations ===


@router.get(
    "/maintenance/status",
    response_model=MaintenanceStatus,
    summary="Get Maintenance Status",
)
async def get_maintenance_status():
    """
    Get current maintenance mode status.

    Public endpoint to check if system is under maintenance.
    """
    try:
        status_info = await MaintenanceService.get_maintenance_status()

        return MaintenanceStatus(
            enabled=status_info["enabled"],
            mode=status_info["mode"],
            message=status_info.get("message"),
            started_at=status_info.get("started_at"),
            estimated_end=status_info.get("estimated_end"),
            started_by_user_id=status_info.get("started_by_user_id"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get maintenance status: {str(e)}",
        )


@router.post(
    "/maintenance/start",
    response_model=MaintenanceResponse,
    summary="Start Maintenance",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def start_maintenance(
    request: MaintenanceStartRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Start maintenance mode.

    Requires MANAGE_SYSTEM permission.
    Affects system availability.
    """
    try:
        result = await MaintenanceService.start_maintenance(
            db=db,
            mode=request.mode,
            message=request.message,
            estimated_duration=request.estimated_duration,
            started_by_user_id=current_user.id,
        )

        return MaintenanceResponse(
            success=result["success"],
            message=result["message"],
            status=result["status"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start maintenance: {str(e)}",
        )


@router.post(
    "/maintenance/stop",
    response_model=MaintenanceResponse,
    summary="Stop Maintenance",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def stop_maintenance(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Stop maintenance mode.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        result = await MaintenanceService.stop_maintenance(
            db=db,
            stopped_by_user_id=current_user.id,
        )

        return MaintenanceResponse(
            success=result["success"],
            message=result["message"],
            status=result["status"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop maintenance: {str(e)}",
        )


# === Cache Operations ===


@router.get(
    "/cache/stats",
    response_model=CacheStatsResponse,
    summary="Get Cache Statistics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_cache_stats(current_user: CurrentUserDep):
    """
    Get cache statistics and information.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        stats = await CacheService.get_cache_stats()

        return CacheStatsResponse(
            caches=stats["caches"],
            total_size=stats["total_size"],
            total_entries=stats["total_entries"],
            overall_hit_rate=stats.get("overall_hit_rate"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache stats: {str(e)}",
        )


@router.post(
    "/cache/clear",
    response_model=CacheClearResponse,
    summary="Clear Cache",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def clear_cache(
    request: CacheClearRequest,
    *,
    current_user: CurrentUserDep,
):
    """
    Clear system cache.

    Requires MANAGE_SYSTEM permission.
    Can affect system performance temporarily.
    """
    try:
        result = await CacheService.clear_cache(
            cache_names=request.cache_names,
            pattern=request.pattern,
        )

        return CacheClearResponse(
            success=result["success"],
            message=result["message"],
            cleared_caches=result["cleared_caches"],
            cleared_entries=result["cleared_entries"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}",
        )
