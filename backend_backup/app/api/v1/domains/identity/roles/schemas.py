"""
Role Management Schemas.

Schemas for role-related operations including role creation,
updates, permission assignments, and user-role relationships.
"""

from datetime import datetime
from typing import Optional, List, Set
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema
from app.core.constants import Permission, RoleScope


# === Role Request Schemas ===


class RoleCreateRequest(BaseSchema):
    """Schema for creating a new role."""

    name: str = Field(..., min_length=1, max_length=100, description="Role name")
    description: Optional[str] = Field(
        None, max_length=500, description="Role description"
    )
    scope: RoleScope = Field(..., description="Role scope")
    permissions: List[Permission] = Field(..., description="List of permissions")
    is_active: bool = Field(True, description="Is role active")


class RoleUpdateRequest(BaseSchema):
    """Schema for updating a role."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Role name"
    )
    description: Optional[str] = Field(
        None, max_length=500, description="Role description"
    )
    is_active: Optional[bool] = Field(None, description="Is role active")


class RolePermissionsUpdateRequest(BaseSchema):
    """Schema for updating role permissions."""

    permissions: List[Permission] = Field(
        ..., description="List of permissions to assign"
    )


class RoleAssignmentRequest(BaseSchema):
    """Schema for role assignment."""

    user_ids: List[int] = Field(..., description="List of user IDs to assign role")
    context_type: Optional[str] = Field(
        None, description="Context type (company, project, team)"
    )
    context_id: Optional[int] = Field(None, description="Context ID")


# === Role Response Schemas ===


class RoleResponse(BaseSchema):
    """Basic role information."""

    id: int = Field(..., description="Role ID")
    name: str = Field(..., description="Role name")
    description: Optional[str] = Field(None, description="Role description")
    scope: RoleScope = Field(..., description="Role scope")
    is_active: bool = Field(..., description="Is role active")
    created_at: datetime = Field(..., description="Role creation date")
    updated_at: datetime = Field(..., description="Last update date")


class RoleDetailResponse(RoleResponse):
    """Detailed role information."""

    permissions: List[Permission] = Field(..., description="Role permissions")
    users_count: int = Field(..., description="Number of users with this role")
    created_by: Optional[int] = Field(None, description="Created by user ID")
    updated_by: Optional[int] = Field(None, description="Updated by user ID")


class RoleListResponse(BaseSchema):
    """Response for role list with pagination."""

    roles: List[RoleResponse] = Field(..., description="List of roles")
    total: int = Field(..., description="Total number of roles")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")


class RolePermissionResponse(BaseSchema):
    """Role permission information."""

    permission: Permission = Field(..., description="Permission")
    description: str = Field(..., description="Permission description")
    granted: bool = Field(..., description="Is permission granted")


class RolePermissionsResponse(BaseSchema):
    """Response for role permissions."""

    role_id: int = Field(..., description="Role ID")
    role_name: str = Field(..., description="Role name")
    permissions: List[RolePermissionResponse] = Field(
        ..., description="List of permissions"
    )


class RoleUserResponse(BaseSchema):
    """User assigned to role response."""

    user_id: int = Field(..., description="User ID")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    email: str = Field(..., description="Email")
    assigned_at: datetime = Field(..., description="Assignment date")
    assigned_by: Optional[int] = Field(None, description="Assigned by user ID")
    context_type: Optional[str] = Field(None, description="Context type")
    context_id: Optional[int] = Field(None, description="Context ID")


class RoleUsersResponse(BaseSchema):
    """Response for users with role."""

    role_id: int = Field(..., description="Role ID")
    role_name: str = Field(..., description="Role name")
    users: List[RoleUserResponse] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")


class RoleStatsResponse(BaseSchema):
    """Role statistics response."""

    role_id: int = Field(..., description="Role ID")
    role_name: str = Field(..., description="Role name")
    total_users: int = Field(..., description="Total users with role")
    active_users: int = Field(..., description="Active users with role")
    inactive_users: int = Field(..., description="Inactive users with role")
    permissions_count: int = Field(..., description="Number of permissions")
    usage_score: float = Field(..., description="Role usage score")
    last_assigned: Optional[datetime] = Field(None, description="Last assignment date")


class RoleOperationResponse(BaseSchema):
    """Response for role operations."""

    success: bool = Field(..., description="Operation success")
    message: str = Field(..., description="Operation message")
    role_id: Optional[int] = Field(None, description="Role ID")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Operation timestamp"
    )
