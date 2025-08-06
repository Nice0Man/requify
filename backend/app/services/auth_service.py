"""
Authentication Service.

Сервис для аутентификации пользователей.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
"""

from datetime import datetime, timedelta, UTC
from typing import Optional

from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    JWTTokenManager,
    verify_password,
    get_client_ip,
    get_user_agent,
    TokenType,
)
from app.crud import user as crud_user, crud_refresh_token
from app.models.user import User
from app.utils.logger import logger


class AuthenticationError(HTTPException):
    """Base class for authentication errors."""

    def __init__(self, detail: str = "Authentication failed", headers: dict = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )


class InvalidCredentialsError(AuthenticationError):
    """Raised when user credentials are invalid."""

    def __init__(self, detail: str = "Incorrect username or password"):
        super().__init__(detail=detail)


class InactiveUserError(HTTPException):
    """Raised when user account is inactive."""

    def __init__(self, detail: str = "User account is deactivated"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class AuthenticationService:
    """
    Service for handling authentication logic.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за аутентификацию
    - Open/Closed: легко расширяется новыми методами аутентификации
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий и минимальный интерфейс
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, username_or_email: str, password: str
    ) -> User:
        """
        Authenticate user by credentials.

        Args:
            db: Сессия базы данных
            username_or_email: Email или username пользователя
            password: Пароль

        Returns:
            User: Аутентифицированный пользователь

        Raises:
            InvalidCredentialsError: Если учетные данные неверны
            InactiveUserError: Если аккаунт неактивен
        """
        # Try to find user by email first
        user = await crud_user.get_by_email_with_profile(db, email=username_or_email)
        if not user:
            # Try to find by username
            user = await crud_user.get_by_username_with_profile(
                db, username=username_or_email
            )

        if not user or not verify_password(password, user.password_hash):
            logger.warning(f"Failed login attempt for: {username_or_email}")
            raise InvalidCredentialsError()

        if not user.is_active:
            logger.warning(f"Login attempt for inactive user: {user.email}")
            raise InactiveUserError()

        logger.info(f"User authenticated successfully: {user.email}")
        return user

    @staticmethod
    async def create_user_tokens(
        db: AsyncSession, user: User, request: Request
    ) -> dict:
        """
        Create access and refresh tokens for user.

        Args:
            db: Сессия базы данных
            user: Пользователь
            request: HTTP запрос

        Returns:
            dict: Словарь с токенами и временем жизни
        """
        # Get client information
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)

        # Create refresh token record
        refresh_token_expires = timedelta(
            days=settings.security.refresh_token_expire_days
        )
        refresh_token_record = await crud_refresh_token.create_for_user(
            db,
            user_id=user.id,
            expires_at=datetime.now(UTC).replace(tzinfo=None) + refresh_token_expires,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        # Create JWT tokens
        access_token_expires = timedelta(
            minutes=settings.security.access_token_expire_minutes
        )

        # Import here to avoid circular imports
        from app.api.v1.endpoints.auth import _get_user_scopes

        access_token = JWTTokenManager.create_access_token(
            subject=user.email,
            user_id=user.id,
            scopes=_get_user_scopes(user),
            expires_delta=access_token_expires,
        )

        refresh_token = JWTTokenManager.create_refresh_token(
            subject=user.email,
            user_id=user.id,
            token_id=refresh_token_record.token,
            expires_delta=refresh_token_expires,
        )

        logger.info(f"Tokens created for user: {user.email}")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": settings.security.access_token_expire_minutes * 60,
            "refresh_expires_in": settings.security.refresh_token_expire_days
            * 24
            * 60
            * 60,
        }

    @staticmethod
    async def update_last_login(db: AsyncSession, user: User) -> None:
        """
        Update user's last login timestamp.

        Args:
            db: Сессия базы данных
            user: Пользователь
        """
        user.last_login = datetime.now(UTC).replace(tzinfo=None)
        await db.commit()
        logger.info(f"Updated last login for user: {user.email}")


# Singleton instance
authentication_service = AuthenticationService()
