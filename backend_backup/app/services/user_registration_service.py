"""
User Registration Service.

Сервис для регистрации пользователей.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
Рефакторен с использованием паттернов проектирования.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import JWTTokenManager
from app.crud import user as crud_user
from app.models.user import User
from app.schemas import UserCreate, UserProfileCreate
from app.services import email_service
from app.utils.logger import logger
from .base import BaseService, ServiceError, ValidationError, NotFoundError


class UserRegistrationError(ServiceError):
    """Ошибки регистрации пользователей."""

    pass


class UserAlreadyExistsError(UserRegistrationError):
    """Пользователь уже существует."""

    def __init__(self, field: str, value: str):
        super().__init__(f"User with {field} '{value}' already exists", "USER_EXISTS")


class EmailVerificationError(UserRegistrationError):
    """Ошибки верификации email."""

    def __init__(self, message: str = "Email verification failed"):
        super().__init__(message, "EMAIL_VERIFICATION_FAILED")


class IUserValidator:
    """Интерфейс для валидаторов пользователей."""

    async def validate(self, db: AsyncSession, user_data: UserCreate) -> None:
        """Валидация данных пользователя."""
        raise NotImplementedError


class UniquenessValidator(IUserValidator):
    """Валидатор уникальности email и username."""

    async def validate(self, db: AsyncSession, user_data: UserCreate) -> None:
        """Проверка уникальности email и username."""
        # Check email uniqueness
        existing_user = await crud_user.get_by_email(db, email=user_data.email)
        if existing_user:
            logger.warning(
                f"Registration attempt with existing email: {user_data.email}"
            )
            raise UserAlreadyExistsError("email", user_data.email)

        # Check username uniqueness
        if user_data.username:
            existing_username = await crud_user.get_by_username(
                db, username=user_data.username
            )
            if existing_username:
                logger.warning(
                    f"Registration attempt with existing username: {user_data.username}"
                )
                raise UserAlreadyExistsError("username", user_data.username)

        logger.info(f"User validation passed for email: {user_data.email}")


class BusinessRulesValidator(IUserValidator):
    """Валидатор бизнес-правил регистрации."""

    async def validate(self, db: AsyncSession, user_data: UserCreate) -> None:
        """Проверка бизнес-правил."""
        # Проверка длины пароля
        if hasattr(user_data, "password") and len(user_data.password) < 8:
            raise ValidationError("Password must be at least 8 characters long")

        # Проверка формата email
        if "@" not in user_data.email:
            raise ValidationError("Invalid email format")

        # Дополнительные бизнес-правила...
        logger.info(f"Business rules validation passed for email: {user_data.email}")


class UserFactory:
    """Фабрика для создания пользователей."""

    @staticmethod
    async def create_user_with_profile(db: AsyncSession, user_data: UserCreate) -> User:
        """
        Создание пользователя с профилем.

        Args:
            db: Сессия базы данных
            user_data: Данные нового пользователя

        Returns:
            User: Созданный пользователь с профилем
        """
        # Create user
        user = await crud_user.create(db, obj_in=user_data)

        # Create profile if not exists
        from app.crud import user_profile as crud_user_profile

        if not user.profile:
            profile_data = UserProfileCreate(
                display_name=user.username or user.name,
                first_name=getattr(user_data, "first_name", None),
                last_name=getattr(user_data, "last_name", None),
                bio=getattr(user_data, "bio", None),
                phone=getattr(user_data, "phone", None),
                avatar_url=getattr(user_data, "avatar_url", None),
            )
            profile = await crud_user_profile.create_for_user(
                db, user_id=user.id, obj_in=profile_data
            )
            user.profile = profile

        logger.info(f"User created successfully: {user.email}")
        return user


class EmailVerificationManager:
    """Менеджер для работы с верификацией email."""

    def __init__(self):
        self.email_service = email_service

    async def send_verification_email(self, user: User) -> None:
        """
        Отправка верификационного email.

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

            await self.email_service.send_email_verification(
                user_email=user.email,
                verification_token=verification_token,
                user_name=user_display_name,
            )
            logger.info(f"Verification email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {e}")
            # Don't fail registration due to email sending issues

    async def verify_email_token(self, db: AsyncSession, token: str) -> User:
        """
        Верификация email токена.

        Args:
            db: Сессия базы данных
            token: Токен верификации

        Returns:
            User: Пользователь с подтвержденным email

        Raises:
            EmailVerificationError: Если токен невалиден
            NotFoundError: Если пользователь не найден
        """
        email = JWTTokenManager.verify_email_verification_token(token)
        if not email:
            logger.warning("Invalid email verification token provided")
            raise EmailVerificationError("Invalid or expired verification token")

        user = await crud_user.get_by_email(db, email=email)
        if not user:
            logger.warning(f"User not found for email verification: {email}")
            raise NotFoundError("User not found")

        if user.email_verified:
            logger.info(f"Email already verified for user: {user.email}")
            return user

        # Mark email as verified
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

    async def resend_verification_email(self, db: AsyncSession, email: str) -> bool:
        """
        Повторная отправка верификационного email.

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

            await self.send_verification_email(user)
        else:
            logger.warning(f"Verification email request for non-existent user: {email}")

        return True  # Always return True for security


class UserRegistrationService(BaseService):
    """
    Сервис для регистрации пользователей.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Chain of Responsibility (для валидации)
    - Factory (для создания пользователей)
    - Template Method (для процесса регистрации)
    """

    def __init__(self):
        self._validators: list[IUserValidator] = []
        self._user_factory = UserFactory()
        self._email_manager = EmailVerificationManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "UserRegistrationService"

    def _setup(self):
        """Инициализация сервиса с регистрацией валидаторов."""
        if not self._initialized:
            # Регистрация стандартных валидаторов
            self.add_validator(UniquenessValidator())
            self.add_validator(BusinessRulesValidator())
            super()._setup()

    def add_validator(self, validator: IUserValidator):
        """Добавление валидатора в цепочку."""
        self._validators.append(validator)
        self._log_operation(
            "add_validator", {"validator": validator.__class__.__name__}
        )

    async def validate_user_data(self, db: AsyncSession, user_data: UserCreate) -> None:
        """
        Валидация данных пользователя с помощью цепочки валидаторов.

        Args:
            db: Сессия базы данных
            user_data: Данные пользователя для валидации

        Raises:
            UserRegistrationError: Если валидация не пройдена
        """
        try:
            self._log_operation("validate_user_data", {"email": user_data.email})

            for validator in self._validators:
                await validator.validate(db, user_data)

        except Exception as e:
            raise self._handle_error(e, "validate_user_data")

    async def register_user(
        self, db: AsyncSession, user_data: UserCreate, send_verification: bool = True
    ) -> User:
        """
        Полная регистрация пользователя.

        Args:
            db: Сессия базы данных
            user_data: Данные нового пользователя
            send_verification: Отправить ли верификационный email

        Returns:
            User: Созданный пользователь

        Raises:
            UserRegistrationError: Если регистрация не удалась
        """
        try:
            self._log_operation(
                "register_user",
                {"email": user_data.email, "send_verification": send_verification},
            )

            # Валидация данных
            await self.validate_user_data(db, user_data)

            # Создание пользователя с профилем
            user = await self._user_factory.create_user_with_profile(db, user_data)

            # Отправка верификационного email (если требуется)
            if send_verification:
                await self._email_manager.send_verification_email(user)

            return user

        except Exception as e:
            raise self._handle_error(e, "register_user")

    async def verify_email(self, db: AsyncSession, token: str) -> User:
        """
        Верификация email пользователя.

        Args:
            db: Сессия базы данных
            token: Токен верификации

        Returns:
            User: Пользователь с подтвержденным email
        """
        try:
            self._log_operation("verify_email")
            return await self._email_manager.verify_email_token(db, token)
        except Exception as e:
            raise self._handle_error(e, "verify_email")

    async def resend_verification_email(self, db: AsyncSession, email: str) -> bool:
        """
        Повторная отправка верификационного email.

        Args:
            db: Сессия базы данных
            email: Email пользователя

        Returns:
            bool: Результат отправки
        """
        try:
            self._log_operation("resend_verification_email", {"email": email})
            return await self._email_manager.resend_verification_email(db, email)
        except Exception as e:
            raise self._handle_error(e, "resend_verification_email")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("user_registration", UserRegistrationService)

# Singleton instance
user_registration_service = UserRegistrationService()
