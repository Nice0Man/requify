"""
Token Service.

Сервис для управления токенами доступа и обновления.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
"""

from datetime import datetime, timedelta, UTC
from typing import Tuple, Optional

from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    JWTTokenManager,
    get_client_ip,
    get_user_agent,
    TokenType,
)
from app.crud import user as crud_user, crud_refresh_token
from app.models.user import User
from app.utils.logger import logger


class TokenValidationError(HTTPException):
    """Raised when token validation fails."""

    def __init__(self, detail: str = "Invalid or expired token"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InactiveUserError(HTTPException):
    """Raised when user account is inactive."""

    def __init__(self, detail: str = "User account is deactivated"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class TokenService:
    """
    Service for handling token operations.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за операции с токенами
    - Open/Closed: легко расширяется новыми типами токенов
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для работы с токенами
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def validate_refresh_token(db: AsyncSession, token: str) -> Tuple[User, any]:
        """
        Validate refresh token and return associated user.

        Args:
            db: Сессия базы данных
            token: Refresh токен

        Returns:
            Tuple[User, RefreshToken]: Пользователь и запись токена

        Raises:
            TokenValidationError: Если токен невалиден
            InactiveUserError: Если пользователь неактивен
        """
        payload = JWTTokenManager.verify_token(token, TokenType.REFRESH)
        if not payload:
            logger.warning("Invalid refresh token provided")
            raise TokenValidationError("Invalid refresh token")

        token_id = payload.get("token_id")
        if not token_id:
            logger.warning("Refresh token missing token_id")
            raise TokenValidationError("Invalid refresh token format")

        refresh_token_record = await crud_refresh_token.get_valid_token(
            db, token=token_id
        )
        if not refresh_token_record:
            logger.warning(f"Refresh token not found or expired: {token_id}")
            raise TokenValidationError("Refresh token expired or revoked")

        user = refresh_token_record.user
        if not user or not user.is_active:
            logger.warning(f"Inactive user for refresh token: {token_id}")
            raise InactiveUserError()

        logger.info(f"Refresh token validated for user: {user.email}")
        return user, refresh_token_record

    @staticmethod
    async def refresh_access_token(
        db: AsyncSession, user: User, refresh_token_record, request: Request
    ) -> dict:
        """
        Create new access token and optionally rotate refresh token.

        Args:
            db: Сессия базы данных
            user: Пользователь
            refresh_token_record: Запись refresh токена
            request: HTTP запрос

        Returns:
            dict: Новые токены
        """
        # Mark old token as used
        await crud_refresh_token.mark_as_used(db, token=refresh_token_record)

        # Create new access token
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

        response_data = {
            "access_token": access_token,
            "expires_in": settings.security.access_token_expire_minutes * 60,
        }

        # Handle refresh token rotation if enabled
        if settings.security.refresh_token_rotate:
            await crud_refresh_token.revoke_token(
                db, token=refresh_token_record, reason="token_rotation"
            )

            # Create new refresh token
            ip_address = get_client_ip(request)
            user_agent = get_user_agent(request)

            refresh_token_expires = timedelta(
                days=settings.security.refresh_token_expire_days
            )
            new_refresh_token_record = await crud_refresh_token.create_for_user(
                db,
                user_id=user.id,
                expires_at=datetime.now(UTC).replace(tzinfo=None)
                + refresh_token_expires,
                user_agent=user_agent,
                ip_address=ip_address,
            )

            new_refresh_token = JWTTokenManager.create_refresh_token(
                subject=user.email,
                user_id=user.id,
                token_id=new_refresh_token_record.token,
                expires_delta=refresh_token_expires,
            )

            response_data.update(
                {
                    "refresh_token": new_refresh_token,
                    "refresh_expires_in": settings.security.refresh_token_expire_days
                    * 24
                    * 60
                    * 60,
                }
            )

        logger.info(f"Access token refreshed for user: {user.email}")
        return response_data

    @staticmethod
    async def validate_access_token(db: AsyncSession, token: str) -> Optional[User]:
        """
        Validate access token and return associated user.

        Args:
            db: Сессия базы данных
            token: Access токен

        Returns:
            Optional[User]: Пользователь если токен валиден, иначе None
        """
        payload = JWTTokenManager.verify_token(token, TokenType.ACCESS)

        if not payload:
            logger.debug("Invalid access token provided")
            return None

        # Get user through CRUD method with profile preloading
        user_id = payload.get("user_id")
        if user_id:
            user = await crud_user.get_with_profile(db, id=user_id)

            if user and user.is_active:
                logger.debug(f"Access token validated for user: {user.email}")
                return user
            else:
                logger.warning(f"User not found or inactive for token: {user_id}")

        return None

    @staticmethod
    async def revoke_user_tokens(
        db: AsyncSession,
        user_id: int,
        reason: str = "user_request",
        specific_token_id: Optional[str] = None,
    ) -> int:
        """
        Revoke user tokens.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            reason: Причина отзыва
            specific_token_id: ID конкретного токена (опционально)

        Returns:
            int: Количество отозванных токенов
        """
        if specific_token_id:
            # Revoke specific token
            refresh_token_record = await crud_refresh_token.get_by_token(
                db, token=specific_token_id
            )
            if refresh_token_record and refresh_token_record.user_id == user_id:
                await crud_refresh_token.revoke_token(
                    db, token=refresh_token_record, reason=reason
                )
                logger.info(f"Token revoked for user {user_id}: {specific_token_id}")
                return 1
            return 0
        else:
            # Revoke all user tokens
            revoked_count = await crud_refresh_token.revoke_user_tokens(
                db, user_id=user_id, reason=reason
            )
            logger.info(
                f"All tokens revoked for user {user_id}: {revoked_count} tokens"
            )
            return revoked_count


# Singleton instance
token_service = TokenService()
