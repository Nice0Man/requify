"""
Core authentication dependencies.

Следует принципам SOLID и современным практикам безопасности:
- Single Responsibility: Только базовая аутентификация
- Interface Segregation: Разделение на специфичные интерфейсы
- Dependency Inversion: Зависимость от абстракций
"""

from typing import Optional, Annotated, List
from fastapi import Depends, HTTPException, status, Request, Security
from fastapi.security import (
    OAuth2PasswordBearer,
    HTTPBearer,
    HTTPAuthorizationCredentials,
    SecurityScopes,
)
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, UTC

from app.core.config import settings
from app.core.security import JWTTokenManager, TokenType
from app.crud import user as crud_user
from app.models.user import User
from app.utils.logger import logger
from app.services.auth_service import AuthenticationService, authentication_service
from app.services.auth0_service import Auth0Service
from .database import SessionDep


# OAuth2 scheme configuration
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.run.api_v1_str}/auth/login",
    scopes={
        "me": "Read information about the current user",
        "use_api": "Basic API access",
        "view_company_users": "View users in company",
        "manage_company_users": "Manage users in company",
        "view_company_settings": "View company settings",
        "manage_company_settings": "Manage company settings",
        "view_company_analytics": "View company analytics",
        "view_project": "View projects information",
        "create_project": "Create new projects",
        "manage_project": "Manage projects",
        "delete_project": "Delete projects",
        "view_requirement": "View requirements information",
        "create_requirement": "Create new requirements",
        "edit_requirement": "Edit requirements",
        "delete_requirement": "Delete requirements",
        "approve_requirement": "Approve requirements",
        "view_release": "View releases information",
        "create_release": "Create new releases",
        "manage_release": "Manage releases",
        "delete_release": "Delete releases",
        "publish_release": "Publish releases",
        "view_test_results": "View testing information",
        "create_test": "Create tests",
        "execute_test": "Execute tests",
        "manage_test_plans": "Manage test plans",
        "manage_company": "Manage company",
        "manage_system": "System administration operations",
        "view_reports": "View reports",
        "create_reports": "Create reports",
        "export_reports": "Export reports",
    },
    auto_error=True,
)

# Fallback security scheme
security = HTTPBearer(auto_error=False)

# Initialize services
auth0_service = Auth0Service()


class AuthenticationError(HTTPException):
    """Custom authentication error with proper HTTP status."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    security_scopes: SecurityScopes,
    request: Request,
    db: SessionDep,
    token: str = Security(oauth2_scheme),
) -> User:
    """
    Get current authenticated user with scope validation.

    Enhanced with Auth0 support and proper error handling.

    Args:
        security_scopes: Required access scopes
        request: HTTP request context
        db: Database session
        token: JWT token from OAuth2

    Returns:
        User: Authenticated user object

    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Standard JWT authentication
        user, token_scopes = await authentication_service.validate_access_token(
            token, db
        )
        logger.debug(f"JWT user authenticated: {user.email}")

        # Validate user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated",
            )

        # Load user role assignments for permission checking
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        from app.models.enhanced_role_system import UserRoleAssignment

        # Reload user with role assignments
        stmt = (
            select(User)
            .where(User.id == user.id)
            .options(
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.role
                )
            )
        )
        result = await db.execute(stmt)
        user_with_roles = result.scalar_one_or_none()
        if user_with_roles:
            user = user_with_roles

        # Validate scopes
        for scope in security_scopes.scopes:
            if scope not in token_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise AuthenticationError()


async def get_current_active_user(
    current_user: User = Security(get_current_user, scopes=[]),
) -> User:
    """
    Get current active user (alias for backward compatibility).

    Args:
        current_user: Current authenticated user

    Returns:
        User: Active user object
    """
    return current_user


async def get_superuser(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """
    Get current user with superuser privileges.

    Args:
        current_user: Current authenticated user

    Returns:
        User: Superuser object

    Raises:
        HTTPException: If user is not superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser privileges required",
        )
    return current_user


async def get_optional_user(
    request: Request,
    oauth2_token: Optional[str] = Depends(oauth2_scheme),
    bearer_token: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: SessionDep = Depends(),
) -> Optional[User]:
    """
    Get optional user without raising exceptions.

    Useful for endpoints that work with or without authentication.

    Args:
        request: HTTP request context
        oauth2_token: Optional OAuth2 token
        bearer_token: Optional bearer token
        db: Database session

    Returns:
        Optional[User]: User object or None
    """
    # Get token from any source
    token_str = oauth2_token or (bearer_token.credentials if bearer_token else None)

    if not token_str:
        return None

    try:
        # Try Auth0 first
        user = await auth0_service.validate_token_and_get_user(token_str, db)
        if user:
            return user if user.is_active else None

        # Try JWT
        user, _ = await authentication_service.validate_access_token(token_str, db)
        return user if user.is_active else None

    except Exception:
        # Don't raise exceptions for optional authentication
        return None


# Type aliases for cleaner dependency injection
CurrentUserDep = Annotated[User, Depends(get_current_user)]
CurrentActiveUserDep = Annotated[User, Depends(get_current_active_user)]
SuperuserDep = Annotated[User, Depends(get_superuser)]
OptionalUserDep = Annotated[Optional[User], Depends(get_optional_user)]
