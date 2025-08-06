"""
Password Service.

Сервис для управления паролями пользователей.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import JWTTokenManager, PasswordManager, verify_password
from app.crud import user as crud_user, crud_refresh_token
from app.models.user import User
from app.services import email_service
from app.utils.logger import logger


class PasswordService:
    """
    Service for password management operations.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за операции с паролями
    - Open/Closed: легко расширяется новой логикой безопасности
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для работы с паролями
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def change_password(
        db: AsyncSession, user: User, current_password: str, new_password: str
    ) -> None:
        """
        Change user password.

        Args:
            db: Сессия базы данных
            user: Пользователь
            current_password: Текущий пароль
            new_password: Новый пароль

        Raises:
            HTTPException: Если текущий пароль неверен или новый пароль слабый
        """
        # Verify current password
        if not verify_password(current_password, user.password_hash):
            logger.warning(f"Invalid current password for user: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password",
            )

        # Validate new password strength
        is_valid, errors = PasswordManager.validate_password_strength(new_password)[:2]
        if not is_valid:
            logger.warning(f"Weak password attempt for user: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Password does not meet requirements",
                    "errors": errors,
                },
            )

        # Update password
        hashed_password = PasswordManager.hash_password(new_password)
        await crud_user.update(
            db, db_obj=user, obj_in={"password_hash": hashed_password}
        )

        # Revoke all refresh tokens for security
        await crud_refresh_token.revoke_user_tokens(
            db, user_id=user.id, reason="password_change"
        )

        logger.info(f"Password changed successfully for user: {user.email}")

    @staticmethod
    async def request_password_reset(db: AsyncSession, email: str) -> bool:
        """
        Request password reset.

        Args:
            db: Сессия базы данных
            email: Email пользователя

        Returns:
            bool: True если запрос обработан (всегда возвращает True для безопасности)
        """
        user = await crud_user.get_by_email(db, email=email)

        # Always return success for security (don't reveal email existence)
        if user and user.is_active:
            try:
                reset_token = JWTTokenManager.create_password_reset_token(user.email)
                user_display_name = (
                    user.profile.display_name
                    if user.profile
                    else (user.username or user.name)
                )

                # Send password reset email
                await email_service.send_password_reset_email(
                    user_email=user.email,
                    reset_token=reset_token,
                    user_name=user_display_name,
                )
                logger.info(f"Password reset email sent to: {user.email}")
            except Exception as e:
                logger.error(
                    f"Failed to send password reset email to {user.email}: {e}"
                )
        else:
            logger.warning(f"Password reset request for non-existent user: {email}")

        return True  # Always return True for security

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str) -> User:
        """
        Reset password using token.

        Args:
            db: Сессия базы данных
            token: Токен сброса пароля
            new_password: Новый пароль

        Returns:
            User: Пользователь с обновленным паролем

        Raises:
            HTTPException: Если токен невалиден или пароль слабый
        """
        email = JWTTokenManager.verify_password_reset_token(token)
        if not email:
            logger.warning("Invalid password reset token provided")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token",
            )

        user = await crud_user.get_by_email(db, email=email)
        if not user:
            logger.warning(f"User not found for password reset: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Validate new password strength
        is_valid, errors = PasswordManager.validate_password_strength(new_password)[:2]
        if not is_valid:
            logger.warning(f"Weak password in reset attempt for user: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Password does not meet requirements",
                    "errors": errors,
                },
            )

        # Update password
        hashed_password = PasswordManager.hash_password(new_password)
        await crud_user.update(
            db, db_obj=user, obj_in={"password_hash": hashed_password}
        )

        # Revoke all refresh tokens for security
        await crud_refresh_token.revoke_user_tokens(
            db, user_id=user.id, reason="password_reset"
        )

        logger.info(f"Password reset successfully for user: {user.email}")
        return user

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, list[str]]:
        """
        Validate password strength.

        Args:
            password: Пароль для проверки

        Returns:
            tuple[bool, list[str]]: (валиден ли пароль, список ошибок)
        """
        return PasswordManager.validate_password_strength(password)[:2]

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password.

        Args:
            password: Пароль для хеширования

        Returns:
            str: Хешированный пароль
        """
        return PasswordManager.hash_password(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify password against hash.

        Args:
            plain_password: Открытый пароль
            hashed_password: Хешированный пароль

        Returns:
            bool: True если пароль верен
        """
        return verify_password(plain_password, hashed_password)


# Singleton instance
password_service = PasswordService()
