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
from app.services import auth0_service
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


class AuthenticationError(HTTPException):
    """Custom authentication error with proper HTTP status."""
    
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthenticationService:
    """
    Service for handling authentication logic.
    
    Follows Single Responsibility Principle:
    - Only handles token validation and user retrieval
    - Delegates specific business logic to other services
    """
    
    @staticmethod
    async def get_user_from_auth0_token(
        token: str, 
        db: AsyncSession
    ) -> Optional[User]:
        """Get user from Auth0 token if Auth0 is enabled."""
        if not auth0_service.is_enabled:
            return None

        user_info = auth0_service.get_user_info(token)
        if not user_info:
            return None

        # Try to find existing user
        user = await crud_user.get_by_auth0_id(db, auth0_id=user_info.sub)
        
        if not user and user_info.email:
            # Handle user creation/linking
            existing_user = await crud_user.get_by_email(db, email=user_info.email)
            
            if existing_user:
                user = await crud_user.update(
                    db, 
                    db_obj=existing_user, 
                    obj_in={"auth0_id": user_info.sub}
                )
            else:
                from app.schemas.user import UserCreate
                
                user_data = UserCreate(
                    email=user_info.email,
                    name=user_info.name or user_info.email.split("@")[0],
                    username=user_info.nickname or user_info.email.split("@")[0],
                    password="",  # Auth0 users don't need passwords
                    is_active=True,
                    auth0_id=user_info.sub,
                )
                user = await crud_user.create(db, obj_in=user_data)

        return user

    @staticmethod
    async def validate_jwt_token(
        token: str, 
        db: AsyncSession
    ) -> tuple[User, List[str]]:
        """Validate JWT token and return user with scopes."""
        payload = JWTTokenManager.verify_token(token, TokenType.ACCESS)
        if payload is None:
            raise AuthenticationError()

        user_id = payload.get("user_id")
        email = payload.get("sub")
        token_scopes = payload.get("scopes", [])

        if user_id is None or email is None:
            raise AuthenticationError()

        user = await crud_user.get(db, id=user_id)
        if user is None:
            raise AuthenticationError()

        if user.email != email:
            raise AuthenticationError("Token user mismatch")

        return user, token_scopes

    @staticmethod
    def validate_scopes(
        required_scopes: List[str], 
        token_scopes: List[str]
    ) -> None:
        """Validate that token has required scopes."""
        for scope in required_scopes:
            if scope not in token_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    @staticmethod
    def validate_user_active(user: User) -> None:
        """Validate that user is active."""
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated",
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
    auth_service = AuthenticationService()
    
    # Try Auth0 authentication first
    user = await auth_service.get_user_from_auth0_token(token, db)
    token_scopes = []
    
    if user:
        # Auth0 users get basic scopes
        token_scopes = ["me", "use_api", "view_project", "view_requirement"]
        logger.info(f"Auth0 user authenticated: {user.email}")
    else:
        # Standard JWT authentication
        user, token_scopes = await auth_service.validate_jwt_token(token, db)
        logger.debug(f"JWT user authenticated: {user.email}")

    # Validate user is active
    auth_service.validate_user_active(user)
    
    # Validate scopes
    auth_service.validate_scopes(security_scopes.scopes, token_scopes)
    
    return user


async def get_current_active_user(
    current_user: User = Security(get_current_user, scopes=["me"]),
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
        auth_service = AuthenticationService()
        
        # Try Auth0 first
        user = await auth_service.get_user_from_auth0_token(token_str, db)
        if user:
            return user if user.is_active else None
            
        # Try JWT
        user, _ = await auth_service.validate_jwt_token(token_str, db)
        return user if user.is_active else None
        
    except Exception:
        # Don't raise exceptions for optional authentication
        return None


# Type aliases for cleaner dependency injection
CurrentUserDep = Annotated[User, Depends(get_current_user)]
CurrentActiveUserDep = Annotated[User, Depends(get_current_active_user)]
SuperuserDep = Annotated[User, Depends(get_superuser)]
OptionalUserDep = Annotated[Optional[User], Depends(get_optional_user)]
