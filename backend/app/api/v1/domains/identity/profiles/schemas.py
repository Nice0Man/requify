"""
Profile Management Schemas.

Schemas for extended user profile operations including profile data,
preferences, avatar management, and activity tracking.
"""

from datetime import datetime
from typing import Annotated, Optional, Dict, Any, List
from enum import Enum

from fastapi import File, UploadFile
from pydantic import Field, HttpUrl

from app.api.v1.common.schemas import BaseSchema


# === Profile Enums ===


class NotificationFrequency(str, Enum):
    """Notification frequency options."""

    IMMEDIATE = "immediate"
    DAILY = "daily"
    WEEKLY = "weekly"
    NEVER = "never"


class Theme(str, Enum):
    """UI theme options."""

    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"


class ActivityType(str, Enum):
    """User activity types."""

    LOGIN = "login"
    LOGOUT = "logout"
    PROFILE_UPDATE = "profile_update"
    PASSWORD_CHANGE = "password_change"
    PERMISSION_CHANGE = "permission_change"
    PROJECT_ACCESS = "project_access"
    REQUIREMENT_EDIT = "requirement_edit"


# === Profile Request Schemas ===


class ProfileUpdateRequest(BaseSchema):
    """Schema for updating user profile."""

    bio: Optional[str] = Field(None, max_length=1000, description="User bio")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    position: Optional[str] = Field(None, max_length=100, description="Job position")
    department: Optional[str] = Field(None, max_length=100, description="Department")
    location: Optional[str] = Field(None, max_length=100, description="Location")
    website: Optional[HttpUrl] = Field(None, description="Personal website")
    linkedin_url: Optional[HttpUrl] = Field(None, description="LinkedIn profile")
    github_url: Optional[HttpUrl] = Field(None, description="GitHub profile")


class UserPreferencesRequest(BaseSchema):
    """Schema for updating user preferences."""

    timezone: Optional[str] = Field(None, description="User timezone")
    language: Optional[str] = Field(None, description="Preferred language")
    theme: Optional[Theme] = Field(None, description="UI theme preference")
    notifications_email: Optional[bool] = Field(
        None, description="Email notifications enabled"
    )
    notifications_browser: Optional[bool] = Field(
        None, description="Browser notifications enabled"
    )
    notification_frequency: Optional[NotificationFrequency] = Field(
        None, description="Notification frequency"
    )
    date_format: Optional[str] = Field(None, description="Preferred date format")
    time_format: Optional[str] = Field(None, description="Preferred time format")


class AvatarUploadRequest(BaseSchema):
    """Schema for avatar upload."""

    file: Annotated[UploadFile, File(..., description="Avatar image file")]


# === Profile Response Schemas ===


class ExtendedProfileResponse(BaseSchema):
    """Extended user profile response."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    bio: Optional[str] = Field(None, description="User bio")
    phone: Optional[str] = Field(None, description="Phone number")
    position: Optional[str] = Field(None, description="Job position")
    department: Optional[str] = Field(None, description="Department")
    location: Optional[str] = Field(None, description="Location")
    website: Optional[str] = Field(None, description="Personal website")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile")
    github_url: Optional[str] = Field(None, description="GitHub profile")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    is_active: bool = Field(..., description="Is user active")
    created_at: datetime = Field(..., description="Profile creation date")
    updated_at: datetime = Field(..., description="Last update date")
    last_login_at: Optional[datetime] = Field(None, description="Last login date")


class PublicProfileResponse(BaseSchema):
    """Public user profile response (limited data)."""

    id: int = Field(..., description="User ID")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    position: Optional[str] = Field(None, description="Job position")
    department: Optional[str] = Field(None, description="Department")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    bio: Optional[str] = Field(None, description="User bio")


class UserPreferencesResponse(BaseSchema):
    """User preferences response."""

    timezone: str = Field(..., description="User timezone")
    language: str = Field(..., description="Preferred language")
    theme: Theme = Field(..., description="UI theme preference")
    notifications_email: bool = Field(..., description="Email notifications enabled")
    notifications_browser: bool = Field(
        ..., description="Browser notifications enabled"
    )
    notification_frequency: NotificationFrequency = Field(
        ..., description="Notification frequency"
    )
    date_format: str = Field(..., description="Preferred date format")
    time_format: str = Field(..., description="Preferred time format")


class UserActivityResponse(BaseSchema):
    """User activity response."""

    id: int = Field(..., description="Activity ID")
    activity_type: ActivityType = Field(..., description="Activity type")
    description: str = Field(..., description="Activity description")
    activity_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional metadata"
    )
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent")
    timestamp: datetime = Field(..., description="Activity timestamp")


class UserActivityListResponse(BaseSchema):
    """User activity list with pagination."""

    activities: List[UserActivityResponse] = Field(
        ..., description="List of activities"
    )
    total: int = Field(..., description="Total number of activities")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")


class UserStatsResponse(BaseSchema):
    """User statistics response."""

    total_logins: int = Field(..., description="Total login count")
    last_login_at: Optional[datetime] = Field(None, description="Last login date")
    projects_count: int = Field(..., description="Number of projects")
    requirements_created: int = Field(..., description="Requirements created")
    requirements_updated: int = Field(..., description="Requirements updated")
    activity_score: float = Field(..., description="Activity score")
    profile_completion: float = Field(..., description="Profile completion percentage")


class AvatarUploadResponse(BaseSchema):
    """Avatar upload response."""

    success: bool = Field(..., description="Upload success")
    avatar_url: str = Field(..., description="New avatar URL")
    message: str = Field(..., description="Response message")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Upload timestamp"
    )


class ProfileOperationResponse(BaseSchema):
    """Response for profile operations."""

    success: bool = Field(..., description="Operation success")
    message: str = Field(..., description="Operation message")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Operation timestamp"
    )
