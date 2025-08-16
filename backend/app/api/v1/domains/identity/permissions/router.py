"""
Permission Management Router.

Handles permission-related operations including permission checking,
permission matrix, and system-wide permission management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.permission_service import PermissionService
from .schemas import (
    PermissionCheckRequest,
    PermissionBulkCheckRequest,
    PermissionGrantRequest,
    PermissionRevokeRequest,
    PermissionResponse,
    PermissionCheckResponse,
    PermissionBulkCheckResponse,
    UserPermissionsResponse,
    PermissionMatrixResponse,
    PermissionAuditResponse,
    PermissionUsageStatsResponse,
    PermissionOperationResponse,
)

# Initialize services
permission_service = PermissionService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Permission Checking
# =============================================================================


@router.post(
    "/check",
    summary="Check Permissions",
    description="Check if user has specific permissions",
    response_model=PermissionCheckResponse,
)
async def check_permissions(
    permission_check: PermissionCheckRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Проверка разрешений пользователя.

    Позволяет проверить наличие конкретных разрешений у пользователя.
    """
    try:
        has_permission = await permission_service.check_permission(
            db=db,
            user_id=current_user.id,
            permission=permission_check.permission,
            context_type=permission_check.context_type,
            context_id=permission_check.context_id,
        )

        return PermissionCheckResponse(
            permission=permission_check.permission,
            granted=has_permission,
            context_type=permission_check.context_type,
            context_id=permission_check.context_id,
            source="role",  # Could be enhanced to show actual source
            expires_at=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to check permission: {str(e)}",
        )


@router.post(
    "/check-bulk",
    summary="Check Multiple Permissions",
    description="Check multiple permissions at once",
    response_model=PermissionBulkCheckResponse,
)
async def check_bulk_permissions(
    bulk_check: PermissionBulkCheckRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Массовая проверка разрешений пользователя.
    """
    try:
        permission_results = []

        for permission_check in bulk_check.permissions:
            has_permission = await permission_service.check_permission(
                db=db,
                user_id=current_user.id,
                permission=permission_check.permission,
                context_type=permission_check.context_type,
                context_id=permission_check.context_id,
            )

            permission_results.append(
                PermissionCheckResponse(
                    permission=permission_check.permission,
                    granted=has_permission,
                    context_type=permission_check.context_type,
                    context_id=permission_check.context_id,
                    source="role",
                    expires_at=None,
                )
            )

        return PermissionBulkCheckResponse(
            user_id=current_user.id, permissions=permission_results
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to check permissions: {str(e)}",
        )


@router.get(
    "/my-permissions",
    summary="Get My Permissions",
    description="Get current user's permissions",
    response_model=UserPermissionsResponse,
)
async def get_my_permissions(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    context_type: Optional[str] = None,
    context_id: Optional[int] = None,
):
    """
    Получение разрешений текущего пользователя.
    """
    try:
        # Get user permissions
        user_perms = await permission_service.get_all_user_permissions(
            db=db,
            user_id=current_user.id,
            context_type=context_type,
            context_id=context_id,
        )

        # Get user roles
        user_roles = await permission_service.get_user_roles(
            db=db, user_id=current_user.id
        )

        # Format permissions
        permissions = [
            PermissionCheckResponse(
                permission=perm,
                granted=True,
                context_type=context_type,
                context_id=context_id,
                source="role",
                expires_at=None,
            )
            for perm in user_perms
        ]

        return UserPermissionsResponse(
            user_id=current_user.id,
            permissions=permissions,
            roles=[role.name for role in user_roles],
            effective_permissions=list(user_perms),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user permissions: {str(e)}",
        )


# =============================================================================
# System Permission Management
# =============================================================================


@router.get(
    "/",
    summary="Get All Permissions",
    description="Get list of all available permissions",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_SYSTEM))
    ],
)
async def get_all_permissions(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение списка всех доступных разрешений системы.

    Только для администраторов.
    """
    try:
        permissions = await permission_service.get_all_permissions(db=db)
        return permissions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get permissions: {str(e)}",
        )


@router.get(
    "/matrix",
    summary="Get Permission Matrix",
    description="Get detailed permission matrix (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_SYSTEM))
    ],
)
async def get_permission_matrix(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    role_id: Optional[int] = None,
    user_id: Optional[int] = None,
):
    """
    Получение матрицы разрешений.

    Только для администраторов.
    """
    try:
        matrix = await permission_service.get_permission_matrix(
            db=db, role_id=role_id, user_id=user_id
        )
        return matrix
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get permission matrix: {str(e)}",
        )


# =============================================================================
# User-Specific Permission Management
# =============================================================================


@router.get(
    "/users/{user_id}",
    summary="Get User Permissions",
    description="Get permissions for specific user (Admin+)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_USERS))
    ],
)
async def get_user_permissions(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    context_type: Optional[str] = None,
    context_id: Optional[int] = None,
):
    """
    Получение разрешений конкретного пользователя.
    """
    try:
        permissions = await permission_service.get_user_permissions(
            db=db, user_id=user_id, context_type=context_type, context_id=context_id
        )
        return permissions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user permissions: {str(e)}",
        )


@router.post(
    "/users/{user_id}/grant",
    summary="Grant Permission to User",
    description="Grant specific permission to user (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=PermissionOperationResponse,
)
async def grant_permission_to_user(
    user_id: int,
    permission_grant: PermissionGrantRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Предоставление разрешения пользователю.
    """
    try:
        success = await permission_service.grant_permission_to_user(
            db=db,
            user_id=user_id,
            permission=permission_grant.permission,
            context_type=permission_grant.context_type,
            context_id=permission_grant.context_id,
            expires_at=permission_grant.expires_at,
            granted_by=current_user.id,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to grant permission",
            )

        return PermissionOperationResponse(
            success=True,
            message="Permission granted successfully",
            permission=permission_grant.permission,
            user_id=user_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to grant permission: {str(e)}",
        )


@router.post(
    "/users/{user_id}/revoke",
    summary="Revoke Permission from User",
    description="Revoke specific permission from user (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=PermissionOperationResponse,
)
async def revoke_permission_from_user(
    user_id: int,
    permission_revoke: PermissionRevokeRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Отзыв разрешения у пользователя.
    """
    try:
        success = await permission_service.revoke_permission_from_user(
            db=db,
            user_id=user_id,
            permission=permission_revoke.permission,
            context_type=permission_revoke.context_type,
            context_id=permission_revoke.context_id,
            revoked_by=current_user.id,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to revoke permission or permission not found",
            )

        return PermissionOperationResponse(
            success=True,
            message="Permission revoked successfully",
            permission=permission_revoke.permission,
            user_id=user_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to revoke permission: {str(e)}",
        )


# =============================================================================
# Permission Auditing
# =============================================================================


@router.get(
    "/audit/{user_id}",
    summary="Get Permission Audit Trail",
    description="Get permission change history for user (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_SYSTEM))
    ],
)
async def get_permission_audit_trail(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение истории изменений разрешений пользователя.
    """
    try:
        audit_trail = await permission_service.get_permission_audit_trail(
            db=db, user_id=user_id
        )
        return audit_trail
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get permission audit trail: {str(e)}",
        )


@router.get(
    "/usage-stats",
    summary="Get Permission Usage Statistics",
    description="Get system-wide permission usage statistics (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_SYSTEM))
    ],
)
async def get_permission_usage_stats(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение статистики использования разрешений в системе.
    """
    try:
        stats = await permission_service.get_permission_usage_stats(db=db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get permission usage stats: {str(e)}",
        )
