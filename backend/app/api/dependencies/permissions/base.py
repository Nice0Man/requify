"""
Base classes for permission-based dependencies.

Следует принципам SOLID:
- Single Responsibility: Базовые абстракции для permissions
- Open/Closed: Открыт для расширения, закрыт для модификации
- Liskov Substitution: Все наследники взаимозаменяемы
- Interface Segregation: Четкие интерфейсы для разных типов
- Dependency Inversion: Зависимость от абстракций
"""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Callable, Any, Optional, List
from fastapi import HTTPException, status, Security
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.constants import Permission
from ..core.auth import get_current_user


T = TypeVar('T', bound=User)


class PermissionChecker(ABC):
    """
    Abstract base class for permission checking.
    
    Follows Interface Segregation Principle by defining
    minimal interface for permission validation.
    """
    
    @abstractmethod
    def check_permission(
        self, 
        user: User, 
        permission: Permission,
        context: Optional[dict] = None
    ) -> bool:
        """Check if user has specific permission in given context."""
        pass

    @abstractmethod
    def get_permission_error(self, permission: Permission) -> HTTPException:
        """Get appropriate error for permission denial."""
        pass


class BasePermissionChecker(PermissionChecker):
    """
    Base implementation of permission checker.
    
    Provides default implementation following DRY principle.
    """
    
    def check_permission(
        self, 
        user: User, 
        permission: Permission,
        context: Optional[dict] = None
    ) -> bool:
        """Default permission check implementation."""
        # System admins have all permissions
        if getattr(user, 'is_system_admin', False):
            return True
            
        # Use enhanced role system if available
        if hasattr(user, 'has_permission'):
            return user.has_permission(permission, **(context or {}))
            
        # Fallback for basic user model
        return False

    def get_permission_error(self, permission: Permission) -> HTTPException:
        """Get standard permission error."""
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission '{permission.value}' required",
        )


class BaseDependency(Generic[T], ABC):
    """
    Abstract base class for all permission-based dependencies.
    
    Implements Template Method pattern:
    - Defines skeleton of dependency resolution
    - Allows subclasses to override specific steps
    """
    
    def __init__(
        self, 
        permission: Permission,
        scopes: List[str],
        checker: Optional[PermissionChecker] = None
    ):
        self.permission = permission
        self.scopes = scopes
        self.checker = checker or BasePermissionChecker()

    @abstractmethod
    async def get_user(self, **kwargs) -> T:
        """Get user from security context."""
        pass

    def validate_permission(self, user: T, context: Optional[dict] = None) -> None:
        """Validate user has required permission."""
        if not self.checker.check_permission(user, self.permission, context):
            raise self.checker.get_permission_error(self.permission)

    async def __call__(self, **kwargs) -> T:
        """Main dependency resolution method."""
        user = await self.get_user(**kwargs)
        context = self.extract_context(**kwargs)
        self.validate_permission(user, context)
        return user

    def extract_context(self, **kwargs) -> Optional[dict]:
        """Extract permission context from kwargs."""
        return None


class SecurityDependency(BaseDependency[User]):
    """
    Standard security dependency using FastAPI Security.
    
    Integrates with FastAPI's security system for OAuth2/scopes.
    """
    
    async def get_user(self, **kwargs) -> User:
        """Get user through FastAPI Security dependency."""
        # This will be injected by FastAPI's dependency system
        current_user = kwargs.get('current_user')
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Security dependency misconfigured"
            )
        return current_user


class PermissionDependency:
    """
    Factory for creating permission-based dependencies.
    
    Follows Factory pattern for creating different types of dependencies.
    """
    
    @staticmethod
    def create(
        permission: Permission,
        scopes: List[str],
        checker: Optional[PermissionChecker] = None
    ) -> Callable:
        """
        Create a permission-based dependency function.
        
        Args:
            permission: Required permission
            scopes: OAuth2 scopes
            checker: Custom permission checker
            
        Returns:
            Callable: FastAPI dependency function
        """
        dependency = SecurityDependency(permission, scopes, checker)
        
        async def permission_dependency(
            current_user: User = Security(get_current_user, scopes=scopes)
        ) -> User:
            return await dependency(current_user=current_user)
            
        permission_dependency.__name__ = f"require_{permission.value}"
        return permission_dependency


class ContextualPermissionDependency:
    """
    Factory for creating context-aware permission dependencies.
    
    Supports permissions that depend on specific context (e.g., company_id).
    """
    
    @staticmethod
    def create(
        permission: Permission,
        scopes: List[str],
        context_extractor: Callable[[Any], dict],
        checker: Optional[PermissionChecker] = None
    ) -> Callable:
        """
        Create a context-aware permission dependency.
        
        Args:
            permission: Required permission
            scopes: OAuth2 scopes
            context_extractor: Function to extract context from request
            checker: Custom permission checker
            
        Returns:
            Callable: FastAPI dependency function
        """
        class ContextualSecurityDependency(SecurityDependency):
            def extract_context(self, **kwargs) -> dict:
                return context_extractor(kwargs)
        
        dependency = ContextualSecurityDependency(permission, scopes, checker)
        
        async def contextual_permission_dependency(
            current_user: User = Security(get_current_user, scopes=scopes),
            **context_kwargs
        ) -> User:
            return await dependency(current_user=current_user, **context_kwargs)
            
        contextual_permission_dependency.__name__ = f"require_{permission.value}_contextual"
        return contextual_permission_dependency


# Utility decorators for common patterns
def require_permission(permission: Permission, scopes: List[str] = None):
    """
    Decorator for creating simple permission dependencies.
    
    Usage:
        @require_permission(Permission.MANAGE_USERS, ["manage_users"])
        async def my_dependency(user: User) -> User:
            return user
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            return PermissionDependency.create(
                permission, 
                scopes or [permission.value.lower()]
            )(*args, **kwargs)
        return wrapper
    return decorator
