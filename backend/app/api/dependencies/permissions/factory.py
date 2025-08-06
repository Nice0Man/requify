"""
Permission dependency factory.

Центральная фабрика для создания permission-based dependencies.
Следует принципам SOLID и паттерну Factory.
"""

from typing import Callable, List, Optional, Dict, Any
from fastapi import Security

from app.core.constants import Permission
from app.models.user import User
from ..core.auth import get_current_user
from .base import PermissionDependency, ContextualPermissionDependency, PermissionChecker


class PermissionDependencyFactory:
    """
    Centralized factory for creating permission-based dependencies.
    
    Follows Factory and Singleton patterns:
    - Creates different types of permission dependencies
    - Caches created dependencies for performance
    - Provides consistent interface for all permission types
    """
    
    _instances: Dict[str, Callable] = {}
    
    @classmethod
    def create_simple(
        cls,
        permission: Permission,
        scopes: Optional[List[str]] = None,
        checker: Optional[PermissionChecker] = None
    ) -> Callable:
        """
        Create simple permission dependency.
        
        Args:
            permission: Required permission
            scopes: OAuth2 scopes (auto-generated if None)
            checker: Custom permission checker
            
        Returns:
            Callable: FastAPI dependency function
        """
        key = f"simple_{permission.value}"
        
        if key not in cls._instances:
            effective_scopes = scopes or cls._generate_scopes(permission)
            cls._instances[key] = PermissionDependency.create(
                permission, effective_scopes, checker
            )
            
        return cls._instances[key]

    @classmethod
    def create_contextual(
        cls,
        permission: Permission,
        context_extractor: Callable[[Any], Dict],
        scopes: Optional[List[str]] = None,
        checker: Optional[PermissionChecker] = None
    ) -> Callable:
        """
        Create contextual permission dependency.
        
        Args:
            permission: Required permission
            context_extractor: Function to extract context
            scopes: OAuth2 scopes
            checker: Custom permission checker
            
        Returns:
            Callable: FastAPI dependency function
        """
        key = f"contextual_{permission.value}_{id(context_extractor)}"
        
        if key not in cls._instances:
            effective_scopes = scopes or cls._generate_scopes(permission)
            cls._instances[key] = ContextualPermissionDependency.create(
                permission, effective_scopes, context_extractor, checker
            )
            
        return cls._instances[key]

    @classmethod
    def create_combined(
        cls,
        permissions: List[Permission],
        scopes: Optional[List[str]] = None,
        checker: Optional[PermissionChecker] = None
    ) -> Callable:
        """
        Create dependency requiring multiple permissions.
        
        Args:
            permissions: List of required permissions
            scopes: OAuth2 scopes
            checker: Custom permission checker
            
        Returns:
            Callable: FastAPI dependency function
        """
        key = f"combined_{'_'.join(p.value for p in permissions)}"
        
        if key not in cls._instances:
            effective_scopes = scopes or []
            for permission in permissions:
                effective_scopes.extend(cls._generate_scopes(permission))
            
            async def combined_permission_dependency(
                current_user: User = Security(get_current_user, scopes=effective_scopes)
            ) -> User:
                from .base import BasePermissionChecker
                
                effective_checker = checker or BasePermissionChecker()
                
                for permission in permissions:
                    if not effective_checker.check_permission(current_user, permission):
                        raise effective_checker.get_permission_error(permission)
                
                return current_user
            
            combined_permission_dependency.__name__ = f"require_{'_and_'.join(p.value for p in permissions)}"
            cls._instances[key] = combined_permission_dependency
            
        return cls._instances[key]

    @staticmethod
    def _generate_scopes(permission: Permission) -> List[str]:
        """
        Generate OAuth2 scopes based on permission.
        
        Maps permissions to appropriate OAuth2 scopes.
        """
        permission_scope_mapping = {
            # User management
            Permission.VIEW_COMPANY_USERS: ["view_company_users"],
            Permission.MANAGE_COMPANY_USERS: ["manage_company_users"],
            Permission.INVITE_USERS: ["manage_company_users"],
            Permission.REMOVE_USERS: ["manage_company_users"],
            
            # Company management
            Permission.MANAGE_COMPANY: ["manage_company"],
            Permission.VIEW_COMPANY_SETTINGS: ["view_company_settings"],
            Permission.MANAGE_COMPANY_SETTINGS: ["manage_company_settings"],
            Permission.VIEW_COMPANY_ANALYTICS: ["view_company_analytics"],
            
            # Project management
            Permission.VIEW_PROJECT: ["view_project"],
            Permission.CREATE_PROJECT: ["create_project"],
            Permission.MANAGE_PROJECT: ["manage_project"],
            Permission.DELETE_PROJECT: ["delete_project"],
            
            # Requirements
            Permission.VIEW_REQUIREMENT: ["view_requirement"],
            Permission.CREATE_REQUIREMENT: ["create_requirement"],
            Permission.EDIT_REQUIREMENT: ["edit_requirement"],
            Permission.DELETE_REQUIREMENT: ["delete_requirement"],
            Permission.APPROVE_REQUIREMENT: ["approve_requirement"],
            
            # Releases
            Permission.VIEW_RELEASE: ["view_release"],
            Permission.CREATE_RELEASE: ["create_release"],
            Permission.MANAGE_RELEASE: ["manage_release"],
            Permission.DELETE_RELEASE: ["delete_release"],
            Permission.PUBLISH_RELEASE: ["publish_release"],
            
            # Testing
            Permission.VIEW_TEST_RESULTS: ["view_test_results"],
            Permission.CREATE_TEST: ["create_test"],
            Permission.EXECUTE_TEST: ["execute_test"],
            Permission.MANAGE_TEST_PLANS: ["manage_test_plans"],
            
            # System
            Permission.MANAGE_SYSTEM: ["manage_system"],
            Permission.VIEW_REPORTS: ["view_reports"],
            Permission.CREATE_REPORTS: ["create_reports"],
            Permission.EXPORT_REPORTS: ["export_reports"],
        }
        
        return permission_scope_mapping.get(permission, [permission.value.lower()])

    @classmethod
    def clear_cache(cls):
        """Clear dependency cache (useful for testing)."""
        cls._instances.clear()


# Convenience functions for common patterns
def require_permission(permission: Permission) -> Callable:
    """Create simple permission dependency."""
    return PermissionDependencyFactory.create_simple(permission)


def require_permissions(*permissions: Permission) -> Callable:
    """Create dependency requiring multiple permissions."""
    return PermissionDependencyFactory.create_combined(list(permissions))


def require_contextual_permission(
    permission: Permission,
    context_extractor: Callable[[Any], Dict]
) -> Callable:
    """Create contextual permission dependency."""
    return PermissionDependencyFactory.create_contextual(permission, context_extractor)