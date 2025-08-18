"""
User Management Router.

Handles all user-related operations including CRUD operations,
activation/deactivation, and role assignments.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    UserPermissions,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.user_profile_service import user_profile_service
from app.services.user_profile_service import UserProfileService
from app.services.admin_service import admin_service
from app.services.permission_service import PermissionService
from .schemas import (
    UserCreateRequest,
    UserUpdateRequest,
    UserProfileUpdateRequest,
    UserResponse,
    UserDetailResponse,
    UserListResponse,
    UserOperationResponse,
    UserRoleResponse,
    UserRoleAssignmentRequest,
)

# Initialize services
user_profile_service = UserProfileService()
permission_service = PermissionService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

def _get_context_type(assignment):
    """Determine context type based on assignment fields"""
    if assignment.project_id:
        return "project"
    elif assignment.team_id:
        return "team"
    elif assignment.department_id:
        return "department"
    elif assignment.company_id:
        return "company"
    else:
        return "system"

def _get_context_id(assignment):
    """Determine context ID based on assignment fields"""
    if assignment.project_id:
        return assignment.project_id
    elif assignment.team_id:
        return assignment.team_id
    elif assignment.department_id:
        return assignment.department_id
    elif assignment.company_id:
        return assignment.company_id
    else:
        return None

# # User CRUD Operations
# 

@router.get(
    "/",
    summary="Get Users List",
    description="Get paginated list of users with filtering (Admin+ only)",
    dependencies=[Depends(UserPermissions.read())],
    response_model=UserListResponse,
)
async def get_users(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search query"),
    company_id: Optional[int] = Query(None, description="Filter by company"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
):
    """
    Получение списка пользователей с фильтрацией и пагинацией.

    Доступ ограничен ролями с разрешением VIEW_USERS.
    """
    try:
        result = await admin_service.get_users(
            db=db,
            current_user=current_user,
            skip=skip,
            limit=limit,
            filters={
                "search": search,
                "company_id": company_id,
                "is_active": is_active,
            },
        )

        # Convert to response format
        users = [
            UserResponse(
                id=user.id,
                email=user.email,
                first_name=getattr(user, "first_name", None),
                last_name=getattr(user, "last_name", None),
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )
            for user in result
        ]

        total = len(result)  # For simplicity, use result length as total
        pages = (total + limit - 1) // limit

        return UserListResponse(
            users=users, total=total, page=(skip // limit) + 1, size=limit, pages=pages
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get users: {str(e)}",
        )

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create User",
    description="Create new user (Admin only)",
    dependencies=[Depends(UserPermissions.create())],
    response_model=UserDetailResponse,
)
async def create_user(
    user_data: UserCreateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Создание нового пользователя.

    Только для администраторов с разрешением MANAGE_USERS.
    """
    try:
        new_user = await admin_service.create_user(
            db=db,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            password=user_data.password,
            company_id=user_data.company_id,
            is_active=user_data.is_active,
            created_by=current_user.id,
        )

        return UserDetailResponse(
            id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            is_active=new_user.is_active,
            created_at=new_user.created_at,
            updated_at=new_user.updated_at,
            company_id=new_user.company_id,
            bio=None,
            phone=None,
            timezone=None,
            language=None,
            avatar_url=None,
            last_login_at=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create user: {str(e)}",
        )

@router.get(
    "/me",
    summary="Get My Profile",
    description="Get current user's profile information",
    response_model=UserDetailResponse,
)
async def get_my_profile(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение профиля текущего пользователя.

    Доступно всем аутентифицированным пользователям.
    """
    try:
        # Get user profile
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=current_user.id, current_user=current_user
        )

        return UserDetailResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=profile.first_name if profile else None,
            last_name=profile.last_name if profile else None,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at,
            company_id=current_user.company_id,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            timezone=profile.timezone if profile else None,
            language=profile.language if profile else None,
            avatar_url=profile.avatar_url if profile else None,
            last_login_at=current_user.last_login_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user profile: {str(e)}",
        )

@router.put(
    "/me",
    summary="Update My Profile",
    description="Update current user's profile information",
    response_model=UserDetailResponse,
)
async def update_my_profile(
    profile_data: UserProfileUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление профиля текущего пользователя.
    """
    try:
        # Update user basic info if provided
        user_updates = {}
        if profile_data.first_name is not None:
            user_updates["first_name"] = profile_data.first_name
        if profile_data.last_name is not None:
            user_updates["last_name"] = profile_data.last_name
        if profile_data.email is not None:
            user_updates["email"] = profile_data.email

        if user_updates:
            await admin_service.update_user(
                db=db, user_id=current_user.id, **user_updates
            )

        # Update profile
        await user_profile_service.update_user_profile(
            db=db,
            user_id=current_user.id,
            profile_data={
                "bio": profile_data.bio,
                "phone": profile_data.phone,
                "timezone": profile_data.timezone,
                "language": profile_data.language,
            },
            current_user=current_user,
        )

        # Get updated user and profile
        updated_user = await admin_service.get_user_by_id(
            db=db, user_id=current_user.id
        )
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=current_user.id, current_user=current_user
        )

        return UserDetailResponse(
            id=updated_user.id,
            email=updated_user.email,
            first_name=updated_user.first_name,
            last_name=updated_user.last_name,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at,
            updated_at=updated_user.updated_at,
            company_id=updated_user.company_id,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            timezone=profile.timezone if profile else None,
            language=profile.language if profile else None,
            avatar_url=profile.avatar_url if profile else None,
            last_login_at=updated_user.last_login_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}",
        )

@router.get(
    "/{user_id}",
    summary="Get User by ID",
    description="Get user profile by ID (team members+ can view colleagues)",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_USERS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=UserDetailResponse,
)
async def get_user_by_id(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение пользователя по ID.

    Доступ зависит от контекста (команда, проект, компания).
    """
    try:
        user = await admin_service.get_user_by_id(db=db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Get user profile
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=user_id, current_user=current_user
        )

        return UserDetailResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            company_id=user.company_id,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            timezone=profile.timezone if profile else None,
            language=profile.language if profile else None,
            avatar_url=profile.avatar_url if profile else None,
            last_login_at=user.last_login_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user: {str(e)}",
        )

@router.put(
    "/{user_id}",
    summary="Update User",
    description="Update user information (Admin+ or user themselves)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=UserDetailResponse,
)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление информации пользователя.

    Пользователи могут обновлять себя, администраторы - любых пользователей.
    """
    try:
        # Check if user is updating themselves or has admin permissions
        if user_id != current_user.id:
            # Additional permission check for updating other users
            has_permission = await permission_service.check_permission(
                db=db, user_id=current_user.id, permission=Permission.MANAGE_USERS
            )
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied to update other users",
                )

        # Update user
        user_updates = {}
        if user_data.first_name is not None:
            user_updates["first_name"] = user_data.first_name
        if user_data.last_name is not None:
            user_updates["last_name"] = user_data.last_name
        if user_data.email is not None:
            user_updates["email"] = user_data.email
        if user_data.is_active is not None and user_id != current_user.id:
            # Only admins can change active status of other users
            user_updates["is_active"] = user_data.is_active

        if user_updates:
            await admin_service.update_user(db=db, user_id=user_id, **user_updates)

        # Get updated user
        updated_user = await admin_service.get_user_by_id(db=db, user_id=user_id)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Get user profile
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=user_id, current_user=current_user
        )

        return UserDetailResponse(
            id=updated_user.id,
            email=updated_user.email,
            first_name=updated_user.first_name,
            last_name=updated_user.last_name,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at,
            updated_at=updated_user.updated_at,
            company_id=updated_user.company_id,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            timezone=profile.timezone if profile else None,
            language=profile.language if profile else None,
            avatar_url=profile.avatar_url if profile else None,
            last_login_at=updated_user.last_login_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update user: {str(e)}",
        )

@router.delete(
    "/{user_id}",
    summary="Delete User",
    description="Delete user (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=UserOperationResponse,
)
async def delete_user(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Удаление пользователя.

    Только для администраторов.
    """
    try:
        # Prevent self-deletion
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account",
            )

        success = await admin_service.delete_user(
            db=db, user_id=user_id, deleted_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return UserOperationResponse(
            success=True, message="User deleted successfully", user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete user: {str(e)}",
        )

# # User State Management
# 

@router.post(
    "/{user_id}/activate",
    summary="Activate User",
    description="Activate user account (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=UserOperationResponse,
)
async def activate_user(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Активация пользователя.
    """
    try:
        success = await admin_service.activate_user(
            db=db, user_id=user_id, activated_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return UserOperationResponse(
            success=True, message="User activated successfully", user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to activate user: {str(e)}",
        )

@router.post(
    "/{user_id}/deactivate",
    summary="Deactivate User",
    description="Deactivate user account (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=UserOperationResponse,
)
async def deactivate_user(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Деактивация пользователя.
    """
    try:
        # Prevent self-deactivation
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account",
            )

        success = await admin_service.deactivate_user(
            db=db, user_id=user_id, deactivated_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return UserOperationResponse(
            success=True, message="User deactivated successfully", user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to deactivate user: {str(e)}",
        )

# # User Role Management
# 

@router.get(
    "/{user_id}/roles",
    summary="Get User Roles",
    description="Get user's role assignments",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_USERS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=List[UserRoleResponse],
)
async def get_user_roles(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение ролей пользователя.
    """
    try:
        from app.services.role_service import RoleService

        role_service = RoleService()

        user_roles = await role_service.get_user_role_assignments(
            db=db, user_id=user_id
        )

        return [
            UserRoleResponse(
                id=assignment.id,
                role_id=assignment.role_id,
                role_name=assignment.role.name,
                context_type=_get_context_type(assignment),
                context_id=_get_context_id(assignment),
                assigned_at=assignment.created_at,  # Using created_at as assigned_at
                assigned_by=assignment.assigned_by,
            )
            for assignment in user_roles
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user roles: {str(e)}",
        )

@router.post(
    "/{user_id}/roles",
    summary="Assign Role to User",
    description="Assign role to user (Admin+)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=UserRoleResponse,
)
async def assign_role_to_user(
    user_id: int,
    role_assignment: UserRoleAssignmentRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Назначение роли пользователю.
    """
    try:
        from app.services.role_service import RoleService

        role_service = RoleService()

        assignment = await role_service.assign_role_to_user(
            db=db,
            user_id=user_id,
            role_id=role_assignment.role_id,
            context_type=role_assignment.context_type,
            context_id=role_assignment.context_id,
            assigned_by=current_user.id,
        )

        return UserRoleResponse(
            id=assignment.id,
            role_id=assignment.role_id,
            role_name=assignment.role.name,
            context_type=assignment.context_type,
            context_id=assignment.context_id,
            assigned_at=assignment.assigned_at,
            assigned_by=assignment.assigned_by,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to assign role: {str(e)}",
        )

@router.delete(
    "/{user_id}/roles/{assignment_id}",
    summary="Revoke Role Assignment",
    description="Revoke role assignment from user (Admin+)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_USERS))
    ],
    response_model=UserOperationResponse,
)
async def revoke_role_assignment(
    user_id: int,
    assignment_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Отзыв назначения роли.
    """
    try:
        from app.services.role_service import RoleService

        role_service = RoleService()

        success = await role_service.revoke_role_assignment(
            db=db, assignment_id=assignment_id, revoked_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role assignment not found",
            )

        return UserOperationResponse(
            success=True,
            message="Role assignment revoked successfully",
            user_id=user_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to revoke role assignment: {str(e)}",
        )
