"""
Testing permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class TestingPermissions:
    """Testing permission dependencies."""

    @staticmethod
    def read() -> Callable:
        """Dependency for reading test results."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_TEST_RESULTS, ["view_test_results"]
        )

    @staticmethod
    def write() -> Callable:
        """Dependency for creating tests."""
        return PermissionDependencyFactory.create_simple(
            Permission.CREATE_TEST, ["create_test"]
        )

    @staticmethod
    def execute() -> Callable:
        """Dependency for executing tests."""
        return PermissionDependencyFactory.create_simple(
            Permission.EXECUTE_TEST, ["execute_test"]
        )

    @staticmethod
    def manage_plans() -> Callable:
        """Dependency for managing test plans."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_TEST_PLANS, ["manage_test_plans"]
        )


# Export instances
get_testing_read_user = TestingPermissions.read()
get_testing_write_user = TestingPermissions.write()
get_testing_execute_user = TestingPermissions.execute()
get_test_plans_manager_user = TestingPermissions.manage_plans()
