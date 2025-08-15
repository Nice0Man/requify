"""
System Audit and Logging Router.

Роутер для аудита и логирования системы.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission

from app.api.v1.domains.system.audit.schemas import (
    AuditLogListResponse,
    AuditLogFilterRequest,
    SecurityEventListResponse,
    SecurityEventFilterRequest,
    SystemLogListResponse,
    SystemLogFilterRequest,
    AuditAction,
    AuditLevel,
)
from app.services.admin_service import AuditService

permission_checker = PermissionChecker()
router = APIRouter()


# === Audit Logs ===


@router.get(
    "/log",
    response_model=AuditLogListResponse,
    summary="Get Audit Log",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.AUDIT_SYSTEM))
    ],
)
async def get_audit_log(
    current_user: CurrentUserDep,
    db: SessionDep,
    action: AuditAction = Query(None, description="Filter by action type"),
    level: AuditLevel = Query(None, description="Filter by level"),
    user_id: int = Query(None, description="Filter by user ID"),
    user_email: str = Query(None, description="Filter by user email"),
    resource_type: str = Query(None, description="Filter by resource type"),
    success: bool = Query(None, description="Filter by success status"),
    search: str = Query(None, description="Search in description"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=500, description="Page size"),
):
    """
    Get paginated audit log entries.

    Requires AUDIT_SYSTEM permission.
    Supports comprehensive filtering and searching.
    """
    try:
        filter_request = AuditLogFilterRequest(
            action=action,
            level=level,
            user_id=user_id,
            user_email=user_email,
            resource_type=resource_type,
            success=success,
            search=search,
            page=page,
            size=size,
        )

        audit_data = await AuditService.get_audit_log(db=db, filters=filter_request)

        return AuditLogListResponse(
            entries=audit_data["entries"],
            total=audit_data["total"],
            page=page,
            pages=audit_data["pages"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get audit log: {str(e)}",
        )


# === Security Events ===


@router.get(
    "/security-events",
    response_model=SecurityEventListResponse,
    summary="Get Security Events",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.AUDIT_SYSTEM))
    ],
)
async def get_security_events(
    current_user: CurrentUserDep,
    db: SessionDep,
    event_type: str = Query(None, description="Filter by event type"),
    severity: str = Query(None, description="Filter by severity"),
    resolved: bool = Query(None, description="Filter by resolution status"),
    source_ip: str = Query(None, description="Filter by source IP"),
    user_id: int = Query(None, description="Filter by user ID"),
    min_risk_score: int = Query(None, ge=0, le=100, description="Minimum risk score"),
    search: str = Query(None, description="Search in description"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=500, description="Page size"),
):
    """
    Get paginated security events.

    Requires AUDIT_SYSTEM permission.
    Includes threat detection and security incidents.
    """
    try:
        filter_request = SecurityEventFilterRequest(
            event_type=event_type,
            severity=severity,
            resolved=resolved,
            source_ip=source_ip,
            user_id=user_id,
            min_risk_score=min_risk_score,
            search=search,
            page=page,
            size=size,
        )

        events_data = await AuditService.get_security_events(
            db=db, filters=filter_request
        )

        return SecurityEventListResponse(
            events=events_data["events"],
            total=events_data["total"],
            page=page,
            pages=events_data["pages"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security events: {str(e)}",
        )


@router.post(
    "/security-events/{event_id}/resolve",
    summary="Resolve Security Event",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.AUDIT_SYSTEM))
    ],
)
async def resolve_security_event(
    event_id: int,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Mark security event as resolved.

    Requires AUDIT_SYSTEM permission.
    """
    try:
        result = await AuditService.resolve_security_event(
            db=db,
            event_id=event_id,
            resolved_by_user_id=current_user.id,
        )

        return {"success": True, "message": "Security event resolved successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to resolve security event: {str(e)}",
        )


# === System Logs ===


@router.get(
    "/logs",
    response_model=SystemLogListResponse,
    summary="Get System Logs",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_system_logs(
    current_user: CurrentUserDep,
    level: str = Query(None, description="Filter by log level"),
    logger: str = Query(None, description="Filter by logger name"),
    module: str = Query(None, description="Filter by module"),
    search: str = Query(None, description="Search in message"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(100, ge=1, le=1000, description="Page size"),
):
    """
    Get paginated system logs.

    Requires MANAGE_SYSTEM permission.
    Provides access to application logs for debugging.
    """
    try:
        filter_request = SystemLogFilterRequest(
            level=level,
            logger=logger,
            module=module,
            search=search,
            page=page,
            size=size,
        )

        logs_data = await AuditService.get_system_logs(filters=filter_request)

        return SystemLogListResponse(
            logs=logs_data["logs"],
            total=logs_data["total"],
            page=page,
            pages=logs_data["pages"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system logs: {str(e)}",
        )
