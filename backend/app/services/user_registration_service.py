"""
User Registration Service.

Сервис для регистрации пользователей.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import JWTTokenManager
from app.crud import user as crud_user
from app.models.user import User
from app.schemas import UserCreate, UserProfileCreate
from app.services import email_service
from app.utils.logger import logger


class UserRegistrationService:
    """
    Service for user registration logic.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за регистрацию пользователей
    - Open/Closed: легко расширяется новой логикой регистрации
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для регистрации
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def validate_unique_user(db: AsyncSession, user_in: UserCreate) -> None:
        """
        Validate that user email and username are unique.

        Args:
            db: Сессия базы данных
            user_in: Данные нового пользователя

        Raises:
            HTTPException: Если email или username уже существует
        """
        # Check email uniqueness
        existing_user = await crud_user.get_by_email(db, email=user_in.email)
        if existing_user:
            logger.warning(f"Registration attempt with existing email: {user_in.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Check username uniqueness
        if user_in.username:
            existing_username = await crud_user.get_by_username(
                db, username=user_in.username
            )
            if existing_username:
                logger.warning(
                    f"Registration attempt with existing username: {user_in.username}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this username already exists",
                )

        logger.info(f"User validation passed for email: {user_in.email}")

    @staticmethod
    async def create_user_with_profile(db: AsyncSession, user_in: UserCreate) -> User:
        """
        Create user and associated profile.

        Args:
            db: Сессия базы данных
            user_in: Данные нового пользователя

        Returns:
            User: Созданный пользователь с профилем
        """
        # Create user
        user = await crud_user.create(db, obj_in=user_in)

        # Create profile if not exists
        from app.crud import user_profile as crud_user_profile

        if not user.profile:
            profile_data = UserProfileCreate(
                display_name=user.username or user.name,
                first_name=getattr(user_in, "first_name", None),
                last_name=getattr(user_in, "last_name", None),
                bio=getattr(user_in, "bio", None),
                phone=getattr(user_in, "phone", None),
                avatar_url=getattr(user_in, "avatar_url", None),
            )
            profile = await crud_user_profile.create_for_user(
                db, user_id=user.id, obj_in=profile_data
            )
            user.profile = profile

        logger.info(f"User created successfully: {user.email}")
        return user

    @staticmethod
    async def send_verification_email(user: User) -> None:
        """
        Send email verification to user.

        Args:
            user: Пользователь для отправки верификации
        """
        try:
            verification_token = JWTTokenManager.create_email_verification_token(
                user.email
            )
            user_display_name = (
                user.profile.display_name
                if user.profile
                else (user.username or user.name)
            )

            await email_service.send_email_verification(
                user_email=user.email,
                verification_token=verification_token,
                user_name=user_display_name,
            )
            logger.info(f"Verification email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {e}")
            # Don't fail registration due to email sending issues

    @staticmethod
    async def verify_email(db: AsyncSession, token: str) -> User:
        """
        Verify user email using token.

        Args:
            db: Сессия базы данных
            token: Токен верификации

        Returns:
            User: Пользователь с подтвержденным email

        Raises:
            HTTPException: Если токен невалиден или пользователь не найден
        """
        email = JWTTokenManager.verify_email_verification_token(token)
        if not email:
            logger.warning(f"Invalid email verification token provided")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        user = await crud_user.get_by_email(db, email=email)
        if not user:
            logger.warning(f"User not found for email verification: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        if user.email_verified:
            logger.info(f"Email already verified for user: {user.email}")
            return user

        # Mark email as verified
        from datetime import datetime, timezone

        await crud_user.update(
            db,
            db_obj=user,
            obj_in={
                "email_verified": True,
                "email_verified_at": datetime.now(timezone.utc).replace(tzinfo=None),
            },
        )

        logger.info(f"Email verified successfully for user: {user.email}")
        return user

    @staticmethod
    async def resend_verification_email(db: AsyncSession, email: str) -> bool:
        """
        Resend verification email to user.

        Args:
            db: Сессия базы данных
            email: Email пользователя

        Returns:
            bool: True если email отправлен, False если пользователь не найден
        """
        user = await crud_user.get_by_email(db, email=email)

        # Always return success for security (don't reveal email existence)
        if user and user.is_active:
            if user.email_verified:
                logger.info(f"Email already verified for user: {user.email}")
                return True

            try:
                verification_token = JWTTokenManager.create_email_verification_token(
                    user.email
                )
                user_display_name = (
                    user.profile.display_name
                    if user.profile
                    else (user.username or user.name)
                )

                await email_service.send_email_verification(
                    user_email=user.email,
                    verification_token=verification_token,
                    user_name=user_display_name,
                )
                logger.info(f"Verification email resent to {user.email}")
            except Exception as e:
                logger.error(
                    f"Failed to resend verification email to {user.email}: {e}"
                )
        else:
            logger.warning(f"Verification email request for non-existent user: {email}")

        return True  # Always return True for security


# Singleton instance
user_registration_service = UserRegistrationService()
