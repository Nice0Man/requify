"""
Enhanced Permission Service with Role Inheritance and Team-based Access Control.

This service implements a sophisticated permission system that follows RBAC best practices
with proper role hierarchy, team inheritance, and efficient permission resolution.

Key Features:
- Role hierarchy with inheritance (System > Company > Department > Team > Project)
- Team-based permission inheritance
- Efficient permission caching and resolution
- Attribute-based access control (ABAC) support
- Context-aware permission checking
- Audit trail for permission changes
"""

from typing import List, Optional, Dict, Any, Set, Tuple, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_
from datetime import datetime, timedelta
from functools import lru_cache
import asyncio
from dataclasses import dataclass

from app.models.user import User
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.project import Project
from app.models.company import Company
from app.models.department import Department
from app.core.constants import (
    Permission,
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
)
from app.utils.logger import logger


@dataclass
class PermissionContext:
    """Context for permission checking."""

    user_id: int
    resource_type: str
    resource_id: Optional[int] = None
    action: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    company_id: Optional[int] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    project_id: Optional[int] = None


@dataclass
class PermissionResult:
    """Result of permission check."""

    granted: bool
    reason: str
    attributes: List[str]
    scope: Optional[RoleScope] = None
    role_name: Optional[str] = None
    inherited_from: Optional[str] = None


class PermissionService:
    """
    Enhanced Permission Service with advanced RBAC capabilities.

    This service provides:
    1. Hierarchical role inheritance
    2. Team-based permission propagation
    3. Context-aware permission checking
    4. Efficient permission caching
    5. Attribute-based access control
    """

    def __init__(self):
        self._permission_cache = {}
        self._cache_ttl = timedelta(minutes=15)
        self._role_hierarchy = {
            RoleScope.SYSTEM: 5,
            RoleScope.COMPANY: 4,
            RoleScope.DEPARTMENT: 3,
            RoleScope.TEAM: 2,
            RoleScope.PROJECT: 1,
        }

    async def check_permission(
        self, db: AsyncSession, context: PermissionContext
    ) -> PermissionResult:
        """
        Check if user has permission for specific action on resource.

        Args:
            db: Database session
            context: Permission context

        Returns:
            PermissionResult with details about the check
        """
        # Check cache first
        cache_key = self._get_cache_key(context)
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            return cached_result

        # Get user with all role assignments
        user = await self._get_user_with_roles(db, context.user_id)
        if not user:
            result = PermissionResult(
                granted=False, reason="User not found", attributes=[]
            )
            self._cache_result(cache_key, result)
            return result

        # Check system admin first
        if await self._is_system_admin(db, user):
            result = PermissionResult(
                granted=True,
                reason="System administrator",
                attributes=["*"],
                scope=RoleScope.SYSTEM,
                role_name="system_admin",
            )
            self._cache_result(cache_key, result)
            return result

        # Get effective permissions for the context
        effective_permissions = await self._get_effective_permissions(db, user, context)

        # Check if requested permission is in effective permissions
        permission_granted = self._check_permission_in_set(
            context.action, effective_permissions
        )

        if permission_granted:
            best_role = self._get_best_matching_role(effective_permissions, context)
            result = PermissionResult(
                granted=True,
                reason=f"Permission granted via role: {best_role['role_name']}",
                attributes=best_role.get("attributes", ["*"]),
                scope=best_role.get("scope"),
                role_name=best_role["role_name"],
                inherited_from=best_role.get("inherited_from"),
            )
        else:
            result = PermissionResult(
                granted=False, reason="Permission denied", attributes=[]
            )

        self._cache_result(cache_key, result)
        return result

    async def get_user_permissions(
        self,
        db: AsyncSession,
        user: User,
        scope: Optional[RoleScope] = None,
        context_id: Optional[int] = None,
    ) -> List[str]:
        """
        Get all permissions for a user based on their role assignments.

        Args:
            db: Database session
            user: User object
            scope: Optional scope filter
            context_id: Optional context ID filter

        Returns:
            List of permission strings
        """
        permissions: Set[str] = set()

        # Get all active role assignments for the user
        assignments = await self._get_user_role_assignments(db, user.id)

        for assignment in assignments:
            if not self._is_assignment_valid(assignment):
                continue

            # Apply scope and context filters
            if scope and not self._assignment_matches_scope(
                assignment, scope, context_id
            ):
                continue

            # Get permissions from the role
            role_permissions = await self._get_role_permissions(
                assignment.role, assignment
            )
            permissions.update(role_permissions)

        # Get team-inherited permissions
        team_permissions = await self._get_team_inherited_permissions(db, user.id)
        permissions.update(team_permissions)

        # Add basic permissions for all authenticated users
        permissions.update(["me", "use_api"])

        # Add default view permissions if user has no other permissions
        if len(permissions) <= 2:  # Only has basic permissions
            permissions.update(
                [
                    Permission.VIEW_PROJECT.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.VIEW_RELEASE.value,
                    Permission.VIEW_TEST_RESULTS.value,
                    Permission.CREATE_COMMENT.value,
                ]
            )

        return sorted(list(permissions))

    async def check_user_permission(
        self,
        db: AsyncSession,
        user: User,
        permission: Permission,
        scope: Optional[RoleScope] = None,
        context_id: Optional[int] = None,
    ) -> bool:
        """
        Check if user has a specific permission.

        Args:
            db: Database session
            user: User object
            permission: Permission to check
            scope: Optional scope filter
            context_id: Optional context ID filter

        Returns:
            True if user has the permission
        """
        user_permissions = await self.get_user_permissions(db, user, scope, context_id)
        return permission.value in user_permissions

    async def is_system_admin(self, db: AsyncSession, user: User) -> bool:
        """
        Check if user is a system administrator.

        Args:
            db: Database session
            user: User object

        Returns:
            True if user is system admin
        """
        # Check if user has system admin permissions
        return await self.check_user_permission(db, user, Permission.MANAGE_SYSTEM)

    async def is_company_admin(
        self, db: AsyncSession, user: User, company_id: Optional[int] = None
    ) -> bool:
        """
        Check if user is a company administrator.

        Args:
            db: Database session
            user: User object
            company_id: Optional company ID to check

        Returns:
            True if user is company admin
        """
        # System admins are also company admins
        if await self.is_system_admin(db, user):
            return True

        # Check company-specific admin permissions
        scope = RoleScope.COMPANY if company_id else None
        return await self.check_user_permission(
            db, user, Permission.MANAGE_COMPANY, scope, company_id
        )

    async def get_user_scopes(
        self,
        db: AsyncSession,
        user: User,
        scope: Optional[RoleScope] = None,
        context_id: Optional[int] = None,
    ) -> List[str]:
        """
        Get OAuth2 scopes for a user based on their permissions.

        Args:
            db: Database session
            user: User object
            scope: Optional scope filter
            context_id: Optional context ID filter

        Returns:
            List of OAuth2 scope strings
        """
        # Get user permissions
        permissions = await self.get_user_permissions(db, user, scope, context_id)

        # Convert permissions to OAuth2 scopes
        scopes = ["openid"]  # Always include openid

        # Add basic scopes
        if "me" in permissions:
            scopes.append("profile")

        if "use_api" in permissions:
            scopes.append("api:read")

        # Add admin scopes
        if await self.is_system_admin(db, user):
            scopes.extend(["admin:all", "system:manage"])
        elif await self.is_company_admin(db, user):
            scopes.extend(["admin:company", "company:manage"])

        # Add specific permission scopes
        permission_scope_mapping = {
            Permission.MANAGE_PROJECT.value: "project:manage",
            Permission.VIEW_PROJECT.value: "project:read",
            Permission.CREATE_REQUIREMENT.value: "requirement:create",
            Permission.EDIT_REQUIREMENT.value: "requirement:write",
            Permission.VIEW_REQUIREMENT.value: "requirement:read",
            Permission.MANAGE_USERS.value: "user:manage",
            Permission.VIEW_USERS.value: "user:read",
            Permission.CREATE_RELEASE.value: "release:create",
            Permission.MANAGE_RELEASE.value: "release:manage",
            Permission.VIEW_RELEASE.value: "release:read",
            Permission.CREATE_TEST.value: "test:create",
            Permission.EXECUTE_TEST.value: "test:execute",
            Permission.VIEW_TEST_RESULTS.value: "test:read",
        }

        for permission in permissions:
            if permission in permission_scope_mapping:
                oauth_scope = permission_scope_mapping[permission]
                if oauth_scope not in scopes:
                    scopes.append(oauth_scope)

        return sorted(scopes)

    # Team inheritance methods
    async def _get_team_inherited_permissions(
        self, db: AsyncSession, user_id: int
    ) -> Set[str]:
        """Get permissions inherited from team memberships."""
        permissions = set()

        # Get user's team memberships
        stmt = (
            select(TeamMember)
            .where(TeamMember.user_id == user_id, TeamMember.is_active == True)
            .options(
                joinedload(TeamMember.team).joinedload(Team.department),
                joinedload(TeamMember.team).joinedload(Team.projects),
            )
        )

        result = await db.execute(stmt)
        memberships = result.scalars().all()

        for membership in memberships:
            # Get team-level permissions
            team_permissions = self._get_team_role_permissions(membership.role)
            permissions.update(team_permissions)

            # Get project-level permissions from team projects
            team = membership.team
            for project in team.projects:
                project_permissions = self._get_project_role_permissions_from_team(
                    membership.role, project
                )
                permissions.update(project_permissions)

        return permissions

    def _get_team_role_permissions(self, team_role: str) -> List[str]:
        """Get permissions for a team role."""
        team_role_permissions = {
            TeamRole.OWNER: [
                Permission.MANAGE_TEAM.value,
                Permission.MANAGE_TEAM_MEMBERS.value,
                Permission.VIEW_TEAM.value,
                Permission.VIEW_TEAM_MEMBERS.value,
                Permission.VIEW_PROJECT.value,
                Permission.MANAGE_PROJECT_MEMBERS.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.APPROVE_REQUIREMENT.value,
            ],
            TeamRole.ADMIN: [
                Permission.MANAGE_TEAM_MEMBERS.value,
                Permission.VIEW_TEAM.value,
                Permission.VIEW_TEAM_MEMBERS.value,
                Permission.VIEW_PROJECT.value,
                Permission.MANAGE_PROJECT_MEMBERS.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
            ],
            TeamRole.TEAM_LEAD: [
                Permission.VIEW_TEAM.value,
                Permission.VIEW_TEAM_MEMBERS.value,
                Permission.VIEW_PROJECT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.APPROVE_REQUIREMENT.value,
            ],
            TeamRole.SENIOR_DEVELOPER: [
                Permission.VIEW_TEAM.value,
                Permission.VIEW_PROJECT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
            ],
            TeamRole.DEVELOPER: [
                Permission.VIEW_TEAM.value,
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
                Permission.CREATE_COMMENT.value,
            ],
            TeamRole.ANALYST: [
                Permission.VIEW_TEAM.value,
                Permission.VIEW_PROJECT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_SPECIFICATION.value,
                Permission.VIEW_SPECIFICATION.value,
            ],
            TeamRole.TESTER: [
                Permission.VIEW_TEAM.value,
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
                Permission.VIEW_TEST_RESULTS.value,
            ],
            TeamRole.OBSERVER: [
                Permission.VIEW_TEAM.value,
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.VIEW_TEST_RESULTS.value,
            ],
        }

        if isinstance(team_role, str):
            try:
                team_role_enum = TeamRole(team_role)
                return team_role_permissions.get(team_role_enum, [])
            except ValueError:
                return []

        return team_role_permissions.get(team_role, [])

    def _get_project_role_permissions_from_team(
        self, team_role: str, project: Project
    ) -> List[str]:
        """Get project-level permissions inherited from team role."""
        # Team leads and above get enhanced project permissions
        if team_role in [TeamRole.OWNER, TeamRole.ADMIN, TeamRole.TEAM_LEAD]:
            return [
                Permission.VIEW_PROJECT.value,
                Permission.MANAGE_PROJECT_MEMBERS.value,
                Permission.VIEW_PROJECT_MEMBERS.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.APPROVE_REQUIREMENT.value,
                Permission.CREATE_RELEASE.value,
                Permission.VIEW_RELEASE.value,
            ]

        # Regular team members get basic project access
        return [
            Permission.VIEW_PROJECT.value,
            Permission.VIEW_PROJECT_MEMBERS.value,
            Permission.VIEW_REQUIREMENT.value,
            Permission.CREATE_COMMENT.value,
            Permission.VIEW_TEST_RESULTS.value,
        ]

    # Private helper methods from original implementation
    async def _get_user_role_assignments(
        self, db: AsyncSession, user_id: int
    ) -> List[UserRoleAssignment]:
        """Get all active role assignments for a user from the database."""
        stmt = (
            select(UserRoleAssignment)
            .where(
                UserRoleAssignment.user_id == user_id,
                UserRoleAssignment.is_active == True,
            )
            .options(
                selectinload(UserRoleAssignment.role),
                selectinload(UserRoleAssignment.company),
                selectinload(UserRoleAssignment.department),
                selectinload(UserRoleAssignment.team),
                selectinload(UserRoleAssignment.project),
            )
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    def _is_assignment_valid(self, assignment: UserRoleAssignment) -> bool:
        """Check if a role assignment is valid and active."""
        if not assignment.is_active:
            return False

        if assignment.expires_at and assignment.expires_at < datetime.now():
            return False

        if not assignment.role or not assignment.role.is_active:
            return False

        return True

    def _assignment_matches_scope(
        self,
        assignment: UserRoleAssignment,
        scope: RoleScope,
        context_id: Optional[int] = None,
    ) -> bool:
        """Check if assignment matches the requested scope and context."""
        # Check scope hierarchy - higher scopes can access lower scopes
        role_scope = assignment.role.scope
        if isinstance(role_scope, str):
            role_scope = RoleScope(role_scope)

        if not self._is_scope_hierarchical(role_scope, scope):
            return False

        # Check context if specified
        if context_id:
            assignment_context = self._get_assignment_context(assignment, scope)
            if assignment_context and assignment_context != context_id:
                return False

        return True

    def _is_scope_hierarchical(
        self, user_scope: RoleScope, required_scope: RoleScope
    ) -> bool:
        """Check if user scope can access required scope through hierarchy."""
        user_level = self._role_hierarchy.get(user_scope, 0)
        required_level = self._role_hierarchy.get(required_scope, 0)

        return user_level >= required_level

    def _get_assignment_context(
        self, assignment: UserRoleAssignment, scope: RoleScope
    ) -> Optional[int]:
        """Get the context ID for an assignment based on scope."""
        if scope == RoleScope.COMPANY:
            return assignment.company_id
        elif scope == RoleScope.DEPARTMENT:
            return assignment.department_id
        elif scope == RoleScope.TEAM:
            return assignment.team_id
        elif scope == RoleScope.PROJECT:
            return assignment.project_id
        return None

    async def _get_role_permissions(
        self, role: EnhancedRole, assignment: UserRoleAssignment
    ) -> List[str]:
        """Get permissions from a role and assignment."""
        permissions = []

        # Get permissions from role configuration
        if role.permissions_config and role.permissions_config.get("permissions"):
            permissions.extend(role.permissions_config["permissions"])

        # Add permissions based on specific role types
        permissions.extend(self._get_role_type_permissions(role))

        return permissions

    def _get_role_type_permissions(self, role: EnhancedRole) -> List[str]:
        """Get permissions based on specific role types."""
        permissions = []

        if role.system_role:
            permissions.extend(self._get_system_role_permissions(role.system_role))
        if role.company_role:
            permissions.extend(self._get_company_role_permissions(role.company_role))
        if role.department_role:
            permissions.extend(
                self._get_department_role_permissions(role.department_role)
            )
        if role.team_role:
            permissions.extend(self._get_team_role_permissions(role.team_role))
        if role.project_role:
            permissions.extend(self._get_project_role_permissions(role.project_role))

        return permissions

    def _get_system_role_permissions(self, system_role) -> List[str]:
        """Get permissions for system roles."""
        if isinstance(system_role, str):
            try:
                system_role = SystemRole(system_role)
            except ValueError:
                return []

        if system_role == SystemRole.SYSTEM_ADMIN:
            return [perm.value for perm in Permission]
        elif system_role in [SystemRole.PLATFORM_ADMIN, SystemRole.SUPPORT_ADMIN]:
            return [
                Permission.MANAGE_ALL_COMPANIES.value,
                Permission.VIEW_SYSTEM_LOGS.value,
                Permission.MANAGE_SYSTEM_SETTINGS.value,
                Permission.AUDIT_SYSTEM.value,
                Permission.VIEW_COMPANY_USERS.value,
                Permission.MANAGE_COMPANY_USERS.value,
            ]
        return []

    def _get_company_role_permissions(self, company_role) -> List[str]:
        """Get permissions for company roles."""
        if isinstance(company_role, str):
            try:
                company_role = CompanyRole(company_role)
            except ValueError:
                return []

        if company_role in [CompanyRole.COMPANY_ADMIN, CompanyRole.COMPANY_OWNER]:
            return [
                Permission.MANAGE_COMPANY.value,
                Permission.MANAGE_COMPANY_SETTINGS.value,
                Permission.MANAGE_COMPANY_USERS.value,
                Permission.INVITE_USERS.value,
                Permission.REMOVE_USERS.value,
                Permission.VIEW_COMPANY_ANALYTICS.value,
                Permission.EXPORT_COMPANY_DATA.value,
                Permission.VIEW_COMPANY_USERS.value,
                Permission.VIEW_COMPANY_SETTINGS.value,
            ]
        elif company_role == CompanyRole.BILLING_MANAGER:
            return [
                Permission.MANAGE_COMPANY_BILLING.value,
                Permission.VIEW_COMPANY_BILLING.value,
                Permission.MANAGE_COMPANY_SUBSCRIPTION.value,
            ]
        elif company_role == CompanyRole.HR_MANAGER:
            return [
                Permission.VIEW_COMPANY_USERS.value,
                Permission.MANAGE_COMPANY_USERS.value,
                Permission.INVITE_USERS.value,
            ]
        return []

    def _get_department_role_permissions(self, department_role) -> List[str]:
        """Get permissions for department roles."""
        if isinstance(department_role, str):
            try:
                department_role = DepartmentRole(department_role)
            except ValueError:
                return []

        if department_role == DepartmentRole.DEPARTMENT_HEAD:
            return [
                Permission.MANAGE_PROJECT.value,
                Permission.VIEW_PROJECT_ANALYTICS.value,
                Permission.MANAGE_PROJECT_MEMBERS.value,
                Permission.CREATE_PROJECT.value,
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_COMPANY_USERS.value,
            ]
        return []

    def _get_project_role_permissions(self, project_role) -> List[str]:
        """Get permissions for project roles."""
        if isinstance(project_role, str):
            try:
                project_role = ProjectRole(project_role)
            except ValueError:
                return []

        if project_role == ProjectRole.PROJECT_MANAGER:
            return [
                Permission.MANAGE_PROJECT.value,
                Permission.MANAGE_PROJECT_SETTINGS.value,
                Permission.MANAGE_PROJECT_MEMBERS.value,
                Permission.VIEW_PROJECT_ANALYTICS.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.APPROVE_REQUIREMENT.value,
                Permission.CREATE_RELEASE.value,
                Permission.MANAGE_RELEASE.value,
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.VIEW_RELEASE.value,
            ]
        elif project_role in [ProjectRole.SENIOR_DEVELOPER, ProjectRole.ARCHITECT]:
            return [
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.CREATE_RELEASE.value,
                Permission.MANAGE_RELEASE.value,
                Permission.DEPLOY_RELEASE.value,
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
                Permission.VIEW_RELEASE.value,
                Permission.VIEW_TEST_RESULTS.value,
            ]
        elif project_role == ProjectRole.DEVELOPER:
            return [
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.VIEW_RELEASE.value,
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
                Permission.VIEW_TEST_RESULTS.value,
            ]
        elif project_role in [
            ProjectRole.QA_ENGINEER,
            ProjectRole.TEST_AUTOMATION_ENGINEER,
        ]:
            return [
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
                Permission.VIEW_TEST_RESULTS.value,
                Permission.MANAGE_TEST_PLANS.value,
                Permission.CREATE_TEST_AUTOMATION.value,
            ]
        elif project_role in [
            ProjectRole.BUSINESS_ANALYST,
            ProjectRole.PRODUCT_ANALYST,
        ]:
            return [
                Permission.VIEW_PROJECT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_SPECIFICATION.value,
                Permission.EDIT_SPECIFICATION.value,
                Permission.VIEW_REPORTS.value,
                Permission.CREATE_REPORTS.value,
                Permission.VIEW_SPECIFICATION.value,
            ]

        return []

    # New enhanced methods
    async def _get_effective_permissions(
        self, db: AsyncSession, user: User, context: PermissionContext
    ) -> List[Dict[str, Any]]:
        """Get effective permissions considering hierarchy and inheritance."""
        permissions = []

        # Direct role assignments
        for assignment in user.role_assignments:
            if not self._is_assignment_valid(assignment):
                continue

            if self._assignment_matches_context(assignment, context):
                perm_data = await self._get_role_permission_data(
                    assignment.role, assignment
                )
                perm_data["source"] = "direct"
                perm_data["assignment_id"] = assignment.id
                permissions.append(perm_data)

        # Team-inherited permissions
        team_permissions = await self._get_team_inherited_permissions_enhanced(
            db, user.id, context
        )
        permissions.extend(team_permissions)

        # Sort by priority (higher scope = higher priority)
        permissions.sort(
            key=lambda x: self._role_hierarchy.get(
                x.get("scope", RoleScope.PROJECT), 0
            ),
            reverse=True,
        )

        return permissions

    async def _get_team_inherited_permissions_enhanced(
        self, db: AsyncSession, user_id: int, context: PermissionContext
    ) -> List[Dict[str, Any]]:
        """Get enhanced team inherited permissions with metadata."""
        # Get user's team memberships
        stmt = (
            select(TeamMember)
            .where(TeamMember.user_id == user_id, TeamMember.is_active == True)
            .options(
                joinedload(TeamMember.team).joinedload(Team.department),
                joinedload(TeamMember.team).joinedload(Team.projects),
            )
        )

        result = await db.execute(stmt)
        memberships = result.scalars().all()

        permissions = []

        for membership in memberships:
            team = membership.team

            # Get team-level permissions
            team_permissions = self._get_team_role_permissions(membership.role)

            if team_permissions:
                perm_data = {
                    "permissions": team_permissions,
                    "scope": RoleScope.TEAM,
                    "role_name": f"Team {membership.role}",
                    "source": "team_membership",
                    "team_id": team.id,
                    "priority": self._role_hierarchy.get(RoleScope.TEAM, 0),
                }
                permissions.append(perm_data)

            # Project-level inheritance from team projects
            for project in team.projects:
                if context.project_id and context.project_id != project.id:
                    continue

                project_permissions = self._get_project_role_permissions_from_team(
                    membership.role, project
                )

                if project_permissions:
                    perm_data = {
                        "permissions": project_permissions,
                        "scope": RoleScope.PROJECT,
                        "role_name": f"Project {membership.role} (via team)",
                        "source": "team_project_inheritance",
                        "team_id": team.id,
                        "project_id": project.id,
                        "inherited_from": f"team:{team.id}",
                        "priority": self._role_hierarchy.get(RoleScope.PROJECT, 0),
                    }
                    permissions.append(perm_data)

        return permissions

    async def _get_user_with_roles(
        self, db: AsyncSession, user_id: int
    ) -> Optional[User]:
        """Get user with all role assignments loaded."""
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.role
                ),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.company
                ),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.department
                ),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.team
                ),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.project
                ),
                selectinload(User.team_memberships).selectinload(TeamMember.team),
            )
        )

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def _is_system_admin(self, db: AsyncSession, user: User) -> bool:
        """Check if user is system administrator."""
        for assignment in user.role_assignments:
            if (
                self._is_assignment_valid(assignment)
                and assignment.role.system_role == SystemRole.SYSTEM_ADMIN.value
            ):
                return True
        return False

    def _assignment_matches_context(
        self, assignment: UserRoleAssignment, context: PermissionContext
    ) -> bool:
        """Check if assignment matches the given context."""
        # System-level roles match all contexts
        if assignment.scope_level == RoleScope.SYSTEM.value:
            return True

        # Company-level roles
        if assignment.scope_level == RoleScope.COMPANY.value:
            return not context.company_id or assignment.company_id == context.company_id

        # Department-level roles
        if assignment.scope_level == RoleScope.DEPARTMENT.value:
            return (
                not context.department_id
                or assignment.department_id == context.department_id
            )

        # Team-level roles
        if assignment.scope_level == RoleScope.TEAM.value:
            return not context.team_id or assignment.team_id == context.team_id

        # Project-level roles
        if assignment.scope_level == RoleScope.PROJECT.value:
            return not context.project_id or assignment.project_id == context.project_id

        return True

    async def _get_role_permission_data(
        self, role: EnhancedRole, assignment: UserRoleAssignment
    ) -> Dict[str, Any]:
        """Get permission data for a role."""
        permissions = []

        # Get permissions from role configuration
        if role.permissions_config and role.permissions_config.get("permissions"):
            permissions.extend(role.permissions_config["permissions"])

        # Get permissions from role type
        type_permissions = self._get_role_type_permissions(role)
        permissions.extend(type_permissions)

        return {
            "role_id": role.id,
            "role_name": role.name,
            "scope": (
                RoleScope(role.scope) if isinstance(role.scope, str) else role.scope
            ),
            "permissions": list(set(permissions)),  # Remove duplicates
            "attributes": (
                role.permissions_config.get("attributes", ["*"])
                if role.permissions_config
                else ["*"]
            ),
            "priority": self._role_hierarchy.get(RoleScope(role.scope), 0),
            "context": self._get_assignment_context_info(assignment),
        }

    def _get_assignment_context_info(
        self, assignment: UserRoleAssignment
    ) -> Dict[str, Any]:
        """Get context information from assignment."""
        return {
            "company_id": assignment.company_id,
            "department_id": assignment.department_id,
            "team_id": assignment.team_id,
            "project_id": assignment.project_id,
            "scope_level": assignment.scope_level,
        }

    def _check_permission_in_set(
        self, permission: str, permission_sets: List[Dict[str, Any]]
    ) -> bool:
        """Check if permission exists in any of the permission sets."""
        if not permission:
            return False

        for perm_set in permission_sets:
            if permission in perm_set.get("permissions", []):
                return True

        return False

    def _get_best_matching_role(
        self, permission_sets: List[Dict[str, Any]], context: PermissionContext
    ) -> Dict[str, Any]:
        """Get the best matching role for the permission."""
        if not permission_sets:
            return {"role_name": "unknown", "attributes": []}

        # Sort by priority and return the highest
        permission_sets.sort(key=lambda x: x.get("priority", 0), reverse=True)

        return permission_sets[0]

    def _get_cache_key(self, context: PermissionContext) -> str:
        """Generate cache key for permission context."""
        return (
            f"user:{context.user_id}:resource:{context.resource_type}:"
            f"id:{context.resource_id}:action:{context.action}:"
            f"company:{context.company_id}:dept:{context.department_id}:"
            f"team:{context.team_id}:project:{context.project_id}"
        )

    def _get_from_cache(self, cache_key: str) -> Optional[PermissionResult]:
        """Get result from cache if valid."""
        if cache_key in self._permission_cache:
            cached_data, timestamp = self._permission_cache[cache_key]
            if datetime.now() - timestamp < self._cache_ttl:
                return cached_data
            else:
                del self._permission_cache[cache_key]
        return None

    def _cache_result(self, cache_key: str, result: PermissionResult) -> None:
        """Cache permission result."""
        self._permission_cache[cache_key] = (result, datetime.now())

        # Clean old cache entries (simple cleanup)
        if len(self._permission_cache) > 1000:
            cutoff_time = datetime.now() - self._cache_ttl
            keys_to_remove = [
                key
                for key, (_, timestamp) in self._permission_cache.items()
                if timestamp < cutoff_time
            ]
            for key in keys_to_remove[:100]:  # Remove up to 100 old entries
                del self._permission_cache[key]

    async def invalidate_user_permissions(
        self, user_id: int, scope: Optional[RoleScope] = None
    ) -> None:
        """
        Invalidate cached permissions for a user.

        Args:
            user_id: User ID
            scope: Optional scope to invalidate
        """
        # Remove all cache entries for this user
        keys_to_remove = [
            key
            for key in self._permission_cache.keys()
            if key.startswith(f"user:{user_id}")
        ]

        for key in keys_to_remove:
            del self._permission_cache[key]

        logger.info(
            f"Invalidated {len(keys_to_remove)} cache entries for user {user_id}"
        )


# Create service instance
permission_service = PermissionService()
