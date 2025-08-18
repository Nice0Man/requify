"""
User Management Schemas.

Schemas for user-related operations including user profiles,
filtering, creation, and updates.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import Field, EmailStr

from app.api.v1.common.schemas import BaseSchema


# === User Enums ===


class UserStatus(str, Enum):
    """User account status."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class UserRole(str, Enum):
    """Basic user roles."""

    USER = "user"
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"


# === User Request Schemas ===


class UserCreateRequest(BaseSchema):
    """Schema for creating a new user."""

    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    password: str = Field(..., min_length=8, description="User password")
    company_id: Optional[int] = Field(None, description="Company ID")
    is_active: bool = Field(True, description="Is user active")


class UserUpdateRequest(BaseSchema):
    """Schema for updating user information."""

    first_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="First name"
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Last name"
    )
    email: Optional[EmailStr] = Field(None, description="User email address")
    is_active: Optional[bool] = Field(None, description="Is user active")


class UserProfileUpdateRequest(BaseSchema):
    """Schema for updating user profile."""

    first_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="First name"
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Last name"
    )
    bio: Optional[str] = Field(None, max_length=500, description="User bio")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    timezone: Optional[str] = Field(None, description="User timezone")
    language: Optional[str] = Field(None, description="Preferred language")


class UserRoleAssignmentRequest(BaseSchema):
    """Schema for assigning role to user."""

    role_id: int = Field(..., description="Role ID to assign")
    context_type: Optional[str] = Field(
        None, description="Context type (company, project, team)"
    )
    context_id: Optional[int] = Field(None, description="Context ID")


# === User Response Schemas ===


class UserResponse(BaseSchema):
    """Basic user information."""

    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    is_active: bool = Field(..., description="Is user active")
    created_at: datetime = Field(..., description="User creation date")
    updated_at: datetime = Field(..., description="Last update date")


class UserDetailResponse(UserResponse):
    """Detailed user information."""

    bio: Optional[str] = Field(None, description="User bio")
    phone: Optional[str] = Field(None, description="Phone number")
    timezone: Optional[str] = Field(None, description="User timezone")
    language: Optional[str] = Field(None, description="Preferred language")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    last_login_at: Optional[datetime] = Field(None, description="Last login date")
    company_id: Optional[int] = Field(None, description="Company ID")


class UserListResponse(BaseSchema):
    """Response for user list with pagination."""

    users: List[UserResponse] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")


class UserRoleResponse(BaseSchema):
    """User role assignment information."""

    id: int = Field(..., description="Assignment ID")
    role_id: int = Field(..., description="Role ID")
    role_name: str = Field(..., description="Role name")
    context_type: Optional[str] = Field(None, description="Context type")
    context_id: Optional[int] = Field(None, description="Context ID")
    assigned_at: datetime = Field(..., description="Assignment date")
    assigned_by: int = Field(..., description="Assigned by user ID")


class UserOperationResponse(BaseSchema):
    """Response for user operations."""

    success: bool = Field(..., description="Operation success")
    message: str = Field(..., description="Operation message")
    user_id: int = Field(..., description="User ID")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Operation timestamp"
    )


# === Utility Response Schemas ===


class TimezoneResponse(BaseSchema):
    """Timezone information."""

    code: str = Field(..., description="Timezone code")
    name: str = Field(..., description="Timezone name")
    offset: str = Field(..., description="UTC offset")


class LanguageResponse(BaseSchema):
    """Language information."""

    code: str = Field(..., description="Language code")
    name: str = Field(..., description="Language name")
    native_name: str = Field(..., description="Native language name")
