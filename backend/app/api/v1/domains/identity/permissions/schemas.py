"""
Permission Management Schemas.

Schemas for permission-related operations including permission checking,
granting/revoking permissions, and permission matrix management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema
from app.core.constants import Permission, RoleScope


# === Permission Request Schemas ===


class PermissionCheckRequest(BaseSchema):
    """Schema for checking single permission."""

    permission: Permission = Field(..., description="Permission to check")
    context_type: Optional[str] = Field(
        None, description="Context type (company, project, team)"
    )
    context_id: Optional[int] = Field(None, description="Context ID")


class PermissionBulkCheckRequest(BaseSchema):
    """Schema for checking multiple permissions."""

    permissions: List[PermissionCheckRequest] = Field(
        ..., description="List of permissions to check"
    )


class PermissionGrantRequest(BaseSchema):
    """Schema for granting permission to user."""

    permission: Permission = Field(..., description="Permission to grant")
    context_type: Optional[str] = Field(None, description="Context type")
    context_id: Optional[int] = Field(None, description="Context ID")
    expires_at: Optional[datetime] = Field(
        None, description="Permission expiration date"
    )


class PermissionRevokeRequest(BaseSchema):
    """Schema for revoking permission from user."""

    permission: Permission = Field(..., description="Permission to revoke")
    context_type: Optional[str] = Field(None, description="Context type")
    context_id: Optional[int] = Field(None, description="Context ID")


# === Permission Response Schemas ===


class PermissionResponse(BaseSchema):
    """Basic permission information."""

    name: Permission = Field(..., description="Permission name")
    description: str = Field(..., description="Permission description")
    category: str = Field(..., description="Permission category")
    scope: List[RoleScope] = Field(..., description="Available scopes")


class PermissionCheckResponse(BaseSchema):
    """Response for permission check."""

    permission: Permission = Field(..., description="Checked permission")
    granted: bool = Field(..., description="Is permission granted")
    context_type: Optional[str] = Field(None, description="Context type")
    context_id: Optional[int] = Field(None, description="Context ID")
    source: str = Field(..., description="Permission source (role, direct)")
    expires_at: Optional[datetime] = Field(None, description="Permission expiration")


class PermissionBulkCheckResponse(BaseSchema):
    """Response for bulk permission check."""

    user_id: int = Field(..., description="User ID")
    permissions: List[PermissionCheckResponse] = Field(
        ..., description="Permission check results"
    )
    checked_at: datetime = Field(
        default_factory=datetime.utcnow, description="Check timestamp"
    )


class UserPermissionsResponse(BaseSchema):
    """User permissions response."""

    user_id: int = Field(..., description="User ID")
    permissions: List[PermissionCheckResponse] = Field(
        ..., description="User permissions"
    )
    roles: List[str] = Field(..., description="User roles")
    effective_permissions: List[Permission] = Field(
        ..., description="Effective permissions list"
    )


class PermissionMatrixResponse(BaseSchema):
    """Permission matrix response."""

    matrix: Dict[str, Dict[str, bool]] = Field(..., description="Permission matrix")
    roles: List[str] = Field(..., description="Included roles")
    permissions: List[Permission] = Field(..., description="Included permissions")
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Generation timestamp"
    )


class PermissionAuditEntry(BaseSchema):
    """Permission audit trail entry."""

    id: int = Field(..., description="Audit entry ID")
    user_id: int = Field(..., description="Target user ID")
    permission: Permission = Field(..., description="Permission")
    action: str = Field(..., description="Action (granted, revoked)")
    context_type: Optional[str] = Field(None, description="Context type")
    context_id: Optional[int] = Field(None, description="Context ID")
    performed_by: int = Field(..., description="User who performed action")
    performed_at: datetime = Field(..., description="Action timestamp")
    reason: Optional[str] = Field(None, description="Reason for action")
    audit_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional metadata"
    )


class PermissionAuditResponse(BaseSchema):
    """Permission audit trail response."""

    user_id: int = Field(..., description="User ID")
    entries: List[PermissionAuditEntry] = Field(..., description="Audit entries")
    total: int = Field(..., description="Total entries")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")


class PermissionUsageStats(BaseSchema):
    """Permission usage statistics."""

    permission: Permission = Field(..., description="Permission")
    total_grants: int = Field(..., description="Total grants")
    active_grants: int = Field(..., description="Active grants")
    revoked_grants: int = Field(..., description="Revoked grants")
    expired_grants: int = Field(..., description="Expired grants")
    most_granted_context: Optional[str] = Field(
        None, description="Most granted context"
    )
    usage_trend: str = Field(
        ..., description="Usage trend (increasing, decreasing, stable)"
    )


class PermissionUsageStatsResponse(BaseSchema):
    """System-wide permission usage statistics."""

    total_permissions: int = Field(..., description="Total number of permissions")
    total_grants: int = Field(..., description="Total permission grants")
    active_grants: int = Field(..., description="Active grants")
    permission_stats: List[PermissionUsageStats] = Field(
        ..., description="Per-permission statistics"
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Generation timestamp"
    )


class PermissionOperationResponse(BaseSchema):
    """Response for permission operations."""

    success: bool = Field(..., description="Operation success")
    message: str = Field(..., description="Operation message")
    permission: Optional[Permission] = Field(None, description="Affected permission")
    user_id: Optional[int] = Field(None, description="Affected user ID")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Operation timestamp"
    )
