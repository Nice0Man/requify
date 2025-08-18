"""
System Administration Router.

Роутер для административных операций системы.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission

from app.api.v1.domains.system.admin.schemas import (
    AdminUserListResponse,
    AdminCompanyListResponse,
    UserStatsResponse,
    CompanyStatsResponse,
    UserActionRequest,
    UserActionResponse,
    AdminUsersFilterRequest,
    AdminCompaniesFilterRequest,
)
from app.services.admin_service import AdminService
from app.services.file_service import file_service

permission_checker = PermissionChecker()
router = APIRouter()


# === User Administration ===


@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="Get Admin Users List",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_admin_users(
    current_user: CurrentUserDep,
    db: SessionDep,
    search: str = Query(None, description="Search query"),
    is_active: bool = Query(None, description="Filter by active status"),
    email_verified: bool = Query(None, description="Filter by email verification"),
    company_id: int = Query(None, description="Filter by company"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
):
    """
    Get paginated list of users for administration.

    Requires MANAGE_SYSTEM permission.
    Supports filtering and searching.
    """
    try:
        filter_request = AdminUsersFilterRequest(
            search=search,
            is_active=is_active,
            email_verified=email_verified,
            company_id=company_id,
            page=page,
            size=size,
        )

        users_data = await AdminService.get_users_for_admin(
            db=db, filters=filter_request
        )

        return AdminUserListResponse(
            users=users_data["users"],
            total=users_data["total"],
            page=page,
            pages=users_data["pages"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}",
        )


@router.get(
    "/users/stats",
    response_model=UserStatsResponse,
    summary="Get Users Statistics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_users_stats(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Get comprehensive users statistics.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        stats = await AdminService.get_users_statistics(db=db)

        return UserStatsResponse(
            total_users=stats["total_users"],
            active_users=stats["active_users"],
            verified_users=stats["verified_users"],
            users_last_30_days=stats["users_last_30_days"],
            users_last_7_days=stats["users_last_7_days"],
            users_today=stats["users_today"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user statistics: {str(e)}",
        )


@router.post(
    "/users/action",
    response_model=UserActionResponse,
    summary="Perform User Action",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def perform_user_action(
    request: UserActionRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Perform administrative action on user.

    Requires MANAGE_SYSTEM permission.
    Actions: activate, deactivate, verify_email, reset_password
    """
    try:
        result = await AdminService.perform_user_action(
            db=db,
            user_id=request.user_id,
            action=request.action,
            reason=request.reason,
            admin_user=current_user,
        )

        return UserActionResponse(
            success=result["success"],
            message=result["message"],
            user_id=request.user_id,
            action=request.action,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to perform user action: {str(e)}",
        )


# === Company Administration ===


@router.get(
    "/companies",
    response_model=AdminCompanyListResponse,
    summary="Get Admin Companies List",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_admin_companies(
    current_user: CurrentUserDep,
    db: SessionDep,
    search: str = Query(None, description="Search query"),
    is_active: bool = Query(None, description="Filter by active status"),
    subscription_plan: str = Query(None, description="Filter by subscription plan"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
):
    """
    Get paginated list of companies for administration.

    Requires MANAGE_SYSTEM permission.
    Supports filtering and searching.
    """
    try:
        filter_request = AdminCompaniesFilterRequest(
            search=search,
            is_active=is_active,
            subscription_plan=subscription_plan,
            page=page,
            size=size,
        )

        companies_data = await AdminService.get_companies_for_admin(
            db=db, filters=filter_request
        )

        return AdminCompanyListResponse(
            companies=companies_data["companies"],
            total=companies_data["total"],
            page=page,
            pages=companies_data["pages"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get companies: {str(e)}",
        )


@router.get(
    "/companies/stats",
    response_model=CompanyStatsResponse,
    summary="Get Companies Statistics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_companies_stats(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Get comprehensive companies statistics.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        stats = await AdminService.get_companies_statistics(db=db)

        return CompanyStatsResponse(
            total_companies=stats["total_companies"],
            active_companies=stats["active_companies"],
            companies_last_30_days=stats["companies_last_30_days"],
            companies_last_7_days=stats["companies_last_7_days"],
            companies_today=stats["companies_today"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get company statistics: {str(e)}",
        )


# === File Storage Administration ===


@router.get(
    "/file-service/health",
    summary="Get File Service Health Status",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_file_service_health(
    current_user: CurrentUserDep,
):
    """
    Get file service health status including MinIO connection and bucket status.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        return file_service.get_health_status()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get file service health: {str(e)}",
        )


@router.post(
    "/file-service/fix-bucket-policies",
    summary="Fix MinIO Bucket Policies",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def fix_bucket_policies(
    current_user: CurrentUserDep,
):
    """
    Force update MinIO bucket policies to fix access issues.

    Requires MANAGE_SYSTEM permission.
    This endpoint creates missing buckets and sets correct access policies.
    """
    try:
        result = file_service.force_bucket_policies_update()

        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=result["error"],
            )

        return {
            "success": True,
            "message": "Bucket policies updated successfully",
            "buckets": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update bucket policies: {str(e)}",
        )
