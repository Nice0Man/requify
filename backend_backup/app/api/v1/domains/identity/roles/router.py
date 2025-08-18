"""
Role Management Router.

Handles role-related operations including CRUD operations,
role assignments, and permission management.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.role_service import RoleService
from .schemas import (
    RoleCreateRequest,
    RoleUpdateRequest,
    RolePermissionsUpdateRequest,
    RoleResponse,
    RoleDetailResponse,
    RoleListResponse,
    RolePermissionsResponse,
    RoleUsersResponse,
    RoleStatsResponse,
    RoleOperationResponse,
)

# Initialize services
role_service = RoleService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# # Role CRUD Operations
# 

@router.get(
    "/",
    summary="Get Roles List",
    description="Get list of available roles (Admin+)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_USERS))
    ],
    response_model=RoleListResponse,
)
async def get_roles(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    scope: Optional[RoleScope] = Query(None, description="Filter by role scope"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
):
    """
    Получение списка ролей.

    Доступно пользователям с разрешением VIEW_USERS.
    """
    try:
        result = await role_service.get_all_roles(
            db=db, scope=scope, skip=skip, limit=limit
        )

        roles = [
            RoleResponse(
                id=role.id,
                name=role.name,
                description=role.description,
                scope=role.scope,
                is_active=role.is_active,
                created_at=role.created_at,
                updated_at=role.updated_at,
            )
            for role in result["roles"]
        ]

        total = result["total"]
        pages = (total + limit - 1) // limit

        return RoleListResponse(
            roles=roles, total=total, page=(skip // limit) + 1, size=limit, pages=pages
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get roles: {str(e)}",
        )

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Role",
    description="Create new role (System Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
    response_model=RoleDetailResponse,
)
async def create_role(
    role_data: RoleCreateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Создание новой роли.

    Только для системных администраторов.
    """
    try:
        new_role = await role_service.create_role(
            db=db,
            name=role_data.name,
            description=role_data.description,
            scope=role_data.scope,
            permissions=role_data.permissions,
            is_active=role_data.is_active,
            created_by=current_user.id,
        )

        return RoleDetailResponse(
            id=new_role.id,
            name=new_role.name,
            description=new_role.description,
            scope=new_role.scope,
            is_active=new_role.is_active,
            created_at=new_role.created_at,
            updated_at=new_role.updated_at,
            permissions=role_data.permissions,
            users_count=0,
            created_by=current_user.id,
            updated_by=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create role: {str(e)}",
        )

@router.get(
    "/{role_id}",
    summary="Get Role Details",
    description="Get role details and permissions",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_USERS))
    ],
)
async def get_role_details(
    role_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение детальной информации о роли.
    """
    try:
        role = await role_service.get_role_with_details(db=db, role_id=role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Get role permissions and users count
        permissions = await role_service.get_role_permissions(db=db, role_id=role_id)
        users_count = await role_service.get_role_users_count(db=db, role_id=role_id)

        return RoleDetailResponse(
            id=role.id,
            name=role.name,
            description=role.description,
            scope=role.scope,
            is_active=role.is_active,
            created_at=role.created_at,
            updated_at=role.updated_at,
            permissions=permissions,
            users_count=users_count,
            created_by=role.created_by,
            updated_by=role.updated_by,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get role details: {str(e)}",
        )

@router.put(
    "/{role_id}",
    summary="Update Role",
    description="Update role information and permissions (System Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
    response_model=RoleDetailResponse,
)
async def update_role(
    role_id: int,
    role_data: RoleUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление роли.

    Только для системных администраторов.
    """
    try:
        # Prepare update data
        update_data = {}
        if role_data.name is not None:
            update_data["name"] = role_data.name
        if role_data.description is not None:
            update_data["description"] = role_data.description
        if role_data.is_active is not None:
            update_data["is_active"] = role_data.is_active

        # Update role
        updated_role = await role_service.update_role(
            db=db, role_id=role_id, update_data=update_data, updated_by=current_user.id
        )

        if not updated_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Get role permissions and users count
        permissions = await role_service.get_role_permissions(db=db, role_id=role_id)
        users_count = await role_service.get_role_users_count(db=db, role_id=role_id)

        return RoleDetailResponse(
            id=updated_role.id,
            name=updated_role.name,
            description=updated_role.description,
            scope=updated_role.scope,
            is_active=updated_role.is_active,
            created_at=updated_role.created_at,
            updated_at=updated_role.updated_at,
            permissions=permissions,
            users_count=users_count,
            created_by=updated_role.created_by,
            updated_by=updated_role.updated_by,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update role: {str(e)}",
        )

@router.delete(
    "/{role_id}",
    summary="Delete Role",
    description="Delete role (System Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def delete_role(
    role_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Удаление роли.

    Только для системных администраторов.
    """
    try:
        success = await role_service.delete_role(
            db=db, role_id=role_id, deleted_by=current_user.id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )
        return {"success": True, "message": "Role deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete role: {str(e)}",
        )

# # Role Permissions Management
# 

@router.get(
    "/{role_id}/permissions",
    summary="Get Role Permissions",
    description="Get permissions assigned to role",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_USERS))
    ],
)
async def get_role_permissions(
    role_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение разрешений роли.
    """
    try:
        permissions = await role_service.get_role_permissions(db=db, role_id=role_id)
        return permissions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get role permissions: {str(e)}",
        )

@router.put(
    "/{role_id}/permissions",
    summary="Update Role Permissions",
    description="Update permissions for role (System Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
    response_model=RoleOperationResponse,
)
async def update_role_permissions(
    role_id: int,
    permissions_data: RolePermissionsUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление разрешений роли.
    """
    try:
        # Update role permissions
        success = await role_service.update_role_permissions(
            db=db,
            role_id=role_id,
            permissions=permissions_data.permissions,
            updated_by=current_user.id,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        return RoleOperationResponse(
            success=True,
            message="Role permissions updated successfully",
            role_id=role_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update role permissions: {str(e)}",
        )

# # Role Users Management
# 

@router.get(
    "/{role_id}/users",
    summary="Get Role Users",
    description="Get users assigned to role",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_USERS))
    ],
)
async def get_role_users(
    role_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
):
    """
    Получение пользователей с данной ролью.
    """
    try:
        users = await role_service.get_users_by_role(
            db=db, role_id=role_id, skip=skip, limit=limit
        )
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get role users: {str(e)}",
        )

# # Role Statistics
# 

@router.get(
    "/{role_id}/stats",
    summary="Get Role Statistics",
    description="Get role usage statistics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_USERS))
    ],
)
async def get_role_stats(
    role_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение статистики роли.
    """
    try:
        stats = await role_service.get_role_stats(db=db, role_id=role_id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get role stats: {str(e)}",
        )
