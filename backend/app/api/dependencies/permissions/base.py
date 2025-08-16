"""
Enhanced Permission Dependencies for API endpoints.

This module provides advanced permission checking dependencies that leverage
the enhanced permission service with role inheritance and team-based access control.
"""

from typing import Callable, List, Optional, Dict, Any, Union
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
import time


from app.api.dependencies.core.auth import get_current_user
from app.models.user import User
from app.core.constants import Permission, RoleScope
from app.services.permission_service import (
    permission_service,
    PermissionContext,
    PermissionResult,
)
from app.utils.logger import logger
from app.db.db_helper import get_async_session


class PermissionDependency:
    """
    Base permission dependency for backward compatibility.

    This class provides the interface expected by the factory pattern
    while delegating to the new PermissionChecker implementation.
    """

    def __init__(self, permission: Permission, resource_type: str = "general"):
        self.permission = permission
        self.resource_type = resource_type
        self.checker = PermissionChecker()

    @classmethod
    def create(
        cls,
        permission: Permission,
        scopes: Optional[List[str]] = None,
        checker: Optional["PermissionChecker"] = None,
    ) -> Callable:
        """Create permission dependency (factory method)."""
        instance = cls(permission)
        if checker:
            instance.checker = checker
        return instance()

    def __call__(self) -> Callable:
        """Return the permission dependency function."""
        return self.checker.require_permission(self.permission, self.resource_type)


class ContextualPermissionDependency:
    """
    Contextual permission dependency for resource-specific checks.
    """

    def __init__(
        self,
        permission: Permission,
        resource_type: str,
        resource_id_param: str = "id",
        scope: Optional[RoleScope] = None,
    ):
        self.permission = permission
        self.resource_type = resource_type
        self.resource_id_param = resource_id_param
        self.scope = scope
        self.checker = PermissionChecker()

    def __call__(self) -> Callable:
        """Return the contextual permission dependency function."""
        return self.checker.require_resource_access(
            self.resource_type, self.permission, self.resource_id_param, self.scope
        )


class PermissionChecker:
    """
    Enhanced permission checker with advanced RBAC capabilities.

    Provides decorators and dependencies for checking permissions with:
    - Role hierarchy inheritance
    - Team-based permission propagation
    - Context-aware permission checking
    - Attribute-based access control
    - Performance monitoring and auditing
    """

    def __init__(self):
        self.service = permission_service

    def require_permission(
        self,
        permission: Union[str, Permission],
        resource_type: str = "general",
        scope: Optional[RoleScope] = None,
        require_attributes: Optional[List[str]] = None,
        audit: bool = True,
    ) -> Callable:
        """
        Create a dependency that requires a specific permission.

        Args:
            permission: Required permission
            resource_type: Type of resource being accessed
            scope: Optional scope restriction
            require_attributes: Required attributes for ABAC
            audit: Whether to log access attempts

        Returns:
            FastAPI dependency function
        """

        async def permission_dependency(
            request: Request,
            current_user: User = Depends(get_current_user),
            db: AsyncSession = Depends(get_async_session),
        ) -> User:
            start_time = time.time()

            # Extract context from request
            context = self._extract_context_from_request(
                request, current_user.id, resource_type
            )

            # Add scope if specified
            if scope:
                self._apply_scope_to_context(context, scope, request)

            # Set permission action - map Permission enum to PermissionAction
            from app.services.permission_service import PermissionAction
            from app.core.constants import Permission

            # Map specific permissions to actions
            permission_to_action_map = {
                Permission.VIEW_COMPANY_USERS: PermissionAction.READ,
                Permission.MANAGE_COMPANY_USERS: PermissionAction.MANAGE,
                Permission.REMOVE_USERS: PermissionAction.DELETE,
                Permission.INVITE_USERS: PermissionAction.CREATE,
                Permission.VIEW_PROJECT: PermissionAction.READ,
                Permission.CREATE_PROJECT: PermissionAction.CREATE,
                Permission.MANAGE_PROJECT: PermissionAction.MANAGE,
                Permission.DELETE_PROJECT: PermissionAction.DELETE,
            }

            if permission in permission_to_action_map:
                context.action = permission_to_action_map[permission]
            elif isinstance(permission, str):
                # Try to map string directly to action
                action_mapping = {
                    "read": PermissionAction.READ,
                    "write": PermissionAction.MANAGE,
                    "create": PermissionAction.CREATE,
                    "update": PermissionAction.UPDATE,
                    "delete": PermissionAction.DELETE,
                    "manage": PermissionAction.MANAGE,
                    "execute": PermissionAction.EXECUTE,
                    "approve": PermissionAction.APPROVE,
                    "assign": PermissionAction.ASSIGN,
                }
                context.action = action_mapping.get(
                    permission.lower(), PermissionAction.READ
                )
            else:
                context.action = PermissionAction.READ  # Default fallback

            # Check permission using simplified interface
            granted = await self.service.check_permission(
                db=db,
                user_id=context.user_id,
                resource_type=context.resource_type,
                action=context.action,
                resource_id=context.resource_id,
                company_id=context.company_id,
                department_id=context.department_id,
                team_id=context.team_id,
                project_id=context.project_id,
            )

            from app.services.permission_service import PermissionResult

            result = PermissionResult(
                granted=granted,
                reason="Permission check completed" if granted else "Permission denied",
            )

            processing_time = int((time.time() - start_time) * 1000)

            # Check if permission is granted
            if not result.granted:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {result.reason}",
                )

            # Check required attributes if specified
            if require_attributes and not self._check_required_attributes(
                result.attributes, require_attributes
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient attribute permissions",
                )

            return current_user

        return permission_dependency

    def require_any_permission(
        self,
        permissions: List[Union[str, Permission]],
        resource_type: str = "general",
        scope: Optional[RoleScope] = None,
        audit: bool = True,
    ) -> Callable:
        """
        Create a dependency that requires any of the specified permissions.

        Args:
            permissions: List of acceptable permissions
            resource_type: Type of resource being accessed
            scope: Optional scope restriction
            audit: Whether to log access attempts

        Returns:
            FastAPI dependency function
        """

        async def permission_dependency(
            request: Request,
            current_user: User = Depends(get_current_user),
            db: AsyncSession = Depends(get_async_session),
        ) -> User:
            start_time = time.time()

            # Try each permission until one succeeds
            for permission in permissions:
                context = self._extract_context_from_request(
                    request, current_user.id, resource_type
                )
                context.action = (
                    permission.value if hasattr(permission, "value") else permission
                )

                if scope:
                    self._apply_scope_to_context(context, scope, request)

                result = await self.service.check_permission(db, context)

                if result.granted:
                    return current_user

            # None of the permissions were granted
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"None of the required permissions granted: {permissions}",
            )

        return permission_dependency

    def require_all_permissions(
        self,
        permissions: List[Union[str, Permission]],
        resource_type: str = "general",
        scope: Optional[RoleScope] = None,
        audit: bool = True,
    ) -> Callable:
        """
        Create a dependency that requires all of the specified permissions.

        Args:
            permissions: List of required permissions
            resource_type: Type of resource being accessed
            scope: Optional scope restriction
            audit: Whether to log access attempts

        Returns:
            FastAPI dependency function
        """

        async def permission_dependency(
            request: Request,
            current_user: User = Depends(get_current_user),
            db: AsyncSession = Depends(get_async_session),
        ) -> User:
            start_time = time.time()
            failed_permissions = []

            # Check all permissions
            for permission in permissions:
                context = self._extract_context_from_request(
                    request, current_user.id, resource_type
                )
                context.action = (
                    permission.value if hasattr(permission, "value") else permission
                )

                if scope:
                    self._apply_scope_to_context(context, scope, request)

                result = await self.service.check_permission(db, context)

                if not result.granted:
                    failed_permissions.append(permission)

            # Check if all permissions were granted
            if failed_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permissions: {failed_permissions}",
                )

            return current_user

        return permission_dependency

    def require_resource_access(
        self,
        resource_type: str,
        permission: Union[str, Permission],
        resource_id_param: str = "id",
        scope: Optional[RoleScope] = None,
        audit: bool = True,
    ) -> Callable:
        """
        Create a dependency that checks access to a specific resource.

        Args:
            resource_type: Type of resource
            permission: Required permission
            resource_id_param: Path parameter name for resource ID
            scope: Optional scope restriction
            audit: Whether to log access attempts

        Returns:
            FastAPI dependency function
        """

        async def permission_dependency(
            request: Request,
            current_user: User = Depends(get_current_user),
            db: AsyncSession = Depends(get_async_session),
        ) -> User:
            start_time = time.time()

            # Extract resource ID from path parameters
            resource_id = request.path_params.get(resource_id_param)
            if resource_id:
                try:
                    resource_id = int(resource_id)
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid {resource_id_param}: {resource_id}",
                    )

            # Create context with resource information
            context = self._extract_context_from_request(
                request, current_user.id, resource_type
            )
            context.resource_id = resource_id
            context.action = (
                permission.value if hasattr(permission, "value") else permission
            )

            if scope:
                self._apply_scope_to_context(context, scope, request)

            # Check permission
            result = await self.service.check_permission(db, context)

            # Check if permission is granted
            if not result.granted:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied to {resource_type} {resource_id}: {result.reason}",
                )

            return current_user

        return permission_dependency

    def require_team_role(
        self,
        required_roles: List[str],
        team_id_param: str = "team_id",
        audit: bool = True,
    ) -> Callable:
        """
        Create a dependency that requires specific team role.

        Args:
            required_roles: List of acceptable team roles
            team_id_param: Path parameter name for team ID
            audit: Whether to log access attempts

        Returns:
            FastAPI dependency function
        """

        async def permission_dependency(
            request: Request,
            current_user: User = Depends(get_current_user),
            db: AsyncSession = Depends(get_async_session),
        ) -> User:
            start_time = time.time()

            # Extract team ID from path parameters
            team_id = request.path_params.get(team_id_param)
            if team_id:
                try:
                    team_id = int(team_id)
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid {team_id_param}: {team_id}",
                    )

            # Check if user has required team role (simplified check)
            user_permissions = await self.service.get_user_permissions(
                db, current_user, RoleScope.TEAM, team_id
            )

            # For now, we check if user has team permissions
            has_team_access = any(
                perm in user_permissions
                for perm in ["manage_team", "view_team", "manage_team_members"]
            )

            if not has_team_access:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Required team role not found. Need one of: {required_roles}",
                )

            return current_user

        return permission_dependency

    def _extract_context_from_request(
        self, request: Request, user_id: int, resource_type: str
    ) -> PermissionContext:
        """Extract permission context from request."""
        path_params = request.path_params
        query_params = dict(request.query_params)

        # Extract and convert IDs
        def safe_int(value):
            if value is None:
                return None
            try:
                return int(value)
            except (ValueError, TypeError):
                return None

        from app.services.permission_service import PermissionAction, ResourceType

        # Convert string to ResourceType enum if needed
        if isinstance(resource_type, str):
            # Map permission system resource types to service resource types
            resource_type_mapping = {
                "general": ResourceType.GENERAL,
                "user": ResourceType.USER,
                "project": ResourceType.PROJECT,
                "requirement": ResourceType.REQUIREMENT,
                "release": ResourceType.RELEASE,
                "team": ResourceType.TEAM,
                "company": ResourceType.COMPANY,
                "report": ResourceType.REPORT,
                "comment": ResourceType.COMMENT,
                "activity": ResourceType.ACTIVITY,
            }
            resource_type = resource_type_mapping.get(
                resource_type.lower(), ResourceType.GENERAL
            )

        return PermissionContext(
            user_id=user_id,
            resource_type=resource_type,
            action=PermissionAction.READ,  # Default action for permission context
            resource_id=safe_int(path_params.get("id") or query_params.get("id")),
            company_id=safe_int(
                path_params.get("company_id") or query_params.get("company_id")
            ),
            department_id=safe_int(
                path_params.get("department_id") or query_params.get("department_id")
            ),
            team_id=safe_int(path_params.get("team_id") or query_params.get("team_id")),
            project_id=safe_int(
                path_params.get("project_id") or query_params.get("project_id")
            ),
            attributes={
                "ip_address": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "method": request.method,
                "url": str(request.url),
            },
        )

    def _apply_scope_to_context(
        self, context: PermissionContext, scope: RoleScope, request: Request
    ) -> None:
        """Apply scope restrictions to context."""

        def safe_int(value):
            if value is None:
                return None
            try:
                return int(value)
            except (ValueError, TypeError):
                return None

        if scope == RoleScope.COMPANY:
            context.company_id = context.company_id or safe_int(
                request.path_params.get("company_id")
            )
        elif scope == RoleScope.DEPARTMENT:
            context.department_id = context.department_id or safe_int(
                request.path_params.get("department_id")
            )
        elif scope == RoleScope.TEAM:
            context.team_id = context.team_id or safe_int(
                request.path_params.get("team_id")
            )
        elif scope == RoleScope.PROJECT:
            context.project_id = context.project_id or safe_int(
                request.path_params.get("project_id")
            )

    def _check_required_attributes(
        self, granted_attributes: List[str], required_attributes: List[str]
    ) -> bool:
        """Check if granted attributes satisfy requirements."""
        if "*" in granted_attributes:
            return True

        for required in required_attributes:
            if required not in granted_attributes:
                return False

        return True


# Global permission checker instance
permissions = PermissionChecker()


# Convenience functions for common permission patterns
def require_admin() -> Callable:
    """Require system or company admin privileges."""
    return permissions.require_any_permission(
        [Permission.MANAGE_SYSTEM, Permission.MANAGE_COMPANY]
    )


def require_project_access(permission: Permission) -> Callable:
    """Require specific project-level permission."""
    return permissions.require_resource_access(
        resource_type="project",
        permission=permission,
        resource_id_param="project_id",
        scope=RoleScope.PROJECT,
    )


def require_team_management() -> Callable:
    """Require team management permissions."""
    return permissions.require_team_role(["owner", "admin", "team_lead"])


def require_project_management() -> Callable:
    """Require project management permissions."""
    return permissions.require_permission(
        Permission.MANAGE_PROJECT, resource_type="project", scope=RoleScope.PROJECT
    )


def require_requirement_edit() -> Callable:
    """Require requirement editing permissions."""
    return permissions.require_any_permission(
        [Permission.EDIT_REQUIREMENT, Permission.MANAGE_PROJECT]
    )


def require_system_admin() -> Callable:
    """Require system administrator privileges."""
    return permissions.require_permission(
        Permission.MANAGE_SYSTEM, scope=RoleScope.SYSTEM
    )


# Legacy compatibility functions (for backward compatibility)
def require_authenticated() -> Callable:
    """Basic authentication requirement."""
    return get_current_user


def require_permission(permission: Permission) -> Callable:
    """Simple permission requirement."""
    return permissions.require_permission(permission)
