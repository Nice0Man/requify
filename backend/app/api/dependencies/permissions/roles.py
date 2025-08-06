"""
Role-based permission dependencies.
Provides specific dependencies for common role-based access patterns.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class RolePermissions:
    """Role-based permission dependencies."""
    
    @staticmethod
    def analyst() -> Callable:
        """Dependency for analyst role - can view and analyze data."""
        return PermissionDependencyFactory.create_combined([
            Permission.VIEW_PROJECT,
            Permission.VIEW_REQUIREMENT,
            Permission.VIEW_RELEASE,
            Permission.VIEW_REPORTS,
        ])
    
    @staticmethod
    def manager() -> Callable:
        """Dependency for manager role - can manage projects and teams."""
        return PermissionDependencyFactory.create_combined([
            Permission.MANAGE_PROJECT,
            Permission.MANAGE_COMPANY_USERS,
            Permission.VIEW_COMPANY_ANALYTICS,
        ])
    
    @staticmethod
    def developer() -> Callable:
        """Dependency for developer role - can work with requirements and testing."""
        return PermissionDependencyFactory.create_combined([
            Permission.VIEW_REQUIREMENT,
            Permission.EDIT_REQUIREMENT,
            Permission.CREATE_TEST,
            Permission.EXECUTE_TEST,
        ])
    
    @staticmethod
    def qa_engineer() -> Callable:
        """Dependency for QA engineer role - focused on testing."""
        return PermissionDependencyFactory.create_combined([
            Permission.VIEW_REQUIREMENT,
            Permission.VIEW_TEST_RESULTS,
            Permission.CREATE_TEST,
            Permission.EXECUTE_TEST,
            Permission.MANAGE_TEST_PLANS,
        ])


# Export specialized role dependencies
get_analyst_user = RolePermissions.analyst()
get_manager_user = RolePermissions.manager()
get_developer_user = RolePermissions.developer()
get_qa_user = RolePermissions.qa_engineer()
