"""
Authentication Service.

Сервис для аутентификации пользователей.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
Рефакторен с использованием паттернов проектирования.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List, Tuple

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
from .base import BaseService, ServiceError, ValidationError, NotFoundError


class AuthenticationError(ServiceError):
    """Base class for authentication errors."""

    def __init__(self, message: str = "Authentication failed", error_code: str = "AUTH_FAILED"):
        super().__init__(message, error_code)


class InvalidCredentialsError(AuthenticationError):
    """Raised when user credentials are invalid."""

    def __init__(self, message: str = "Incorrect username or password"):
        super().__init__(message, "INVALID_CREDENTIALS")


class InactiveUserError(AuthenticationError):
    """Raised when user account is inactive."""

    def __init__(self, message: str = "User account is deactivated"):
        super().__init__(message, "INACTIVE_USER")


class TokenValidationError(AuthenticationError):
    """Raised when token validation fails."""

    def __init__(self, message: str = "Token validation failed"):
        super().__init__(message, "INVALID_TOKEN")


class IAuthenticationStrategy:
    """Интерфейс для стратегий аутентификации."""
    
    async def authenticate(self, db: AsyncSession, credentials: Dict[str, Any]) -> User:
        """Аутентификация пользователя."""
        raise NotImplementedError


class EmailPasswordStrategy(IAuthenticationStrategy):
    """Стратегия аутентификации по email/username и паролю."""
    
    async def authenticate(self, db: AsyncSession, credentials: Dict[str, Any]) -> User:
        """
        Аутентификация пользователя по email/username и паролю.
        
        Args:
            db: Сессия базы данных
            credentials: Словарь с username_or_email и password
        
        Returns:
            User: Аутентифицированный пользователь
        
        Raises:
            InvalidCredentialsError: Если учетные данные неверны
            InactiveUserError: Если аккаунт неактивен
        """
        username_or_email = credentials.get("username_or_email")
        password = credentials.get("password")
        
        if not username_or_email or not password:
            raise ValidationError("Username/email and password are required")
        
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


class TokenFactory:
    """Фабрика для создания токенов."""
    
    @staticmethod
    async def create_token_pair(
        db: AsyncSession, 
        user: User, 
        request: Request
    ) -> Dict[str, Any]:
        """
        Создание пары токенов (access + refresh).
        
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
            expires_at=datetime.now(timezone.utc).replace(tzinfo=None)
            + refresh_token_expires,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        # Create JWT tokens
        access_token_expires = timedelta(
            minutes=settings.security.access_token_expire_minutes
        )

        # Import here to avoid circular imports
        from app.services.permission_service import permission_service

        # Get user scopes asynchronously
        user_scopes = await permission_service.get_user_scopes(db, user)

        access_token = JWTTokenManager.create_access_token(
            subject=user.email,
            user_id=user.id,
            scopes=user_scopes,
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


class TokenValidator:
    """Валидатор токенов."""
    
    def __init__(self):
        self.security_manager = JWTTokenManager()
    
    async def validate_access_token(
        self, token: str, db: AsyncSession
    ) -> Tuple[User, List[str]]:
        """
        Валидация access токена.
        
        Args:
            token: JWT access token
            db: Database session
        
        Returns:
            Tuple of (User, list of scopes)
        
        Raises:
            TokenValidationError: If token is invalid or expired
        """
        try:
            # Decode and validate JWT token
            payload = JWTTokenManager.verify_token(token, TokenType.ACCESS)

            if not payload:
                raise TokenValidationError("Invalid token")

            user_id = payload.get("user_id")
            if not user_id:
                raise TokenValidationError("Invalid token payload")

            # Get user from database
            user = await crud_user.get(db, id=int(user_id))
            if not user:
                raise NotFoundError("User not found")

            if not user.is_active:
                raise InactiveUserError()

            # Extract scopes from token (fallback to basic scopes)
            token_scopes = payload.get("scopes", ["me", "use_api"])
            return user, token_scopes

        except TokenValidationError:
            raise
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise TokenValidationError("Could not validate credentials")


class AuthenticationService(BaseService):
    """
    Основной сервис аутентификации.
    
    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (для разных методов аутентификации)
    - Factory (для создания токенов)
    - Template Method (для процесса аутентификации)
    """

    def __init__(self):
        self._authentication_strategies: Dict[str, IAuthenticationStrategy] = {}
        self._token_factory = TokenFactory()
        self._token_validator = TokenValidator()
        super().__init__()
    
    def get_service_name(self) -> str:
        return "AuthenticationService"
    
    def _setup(self):
        """Инициализация сервиса с регистрацией стратегий."""
        if not self._initialized:
            # Регистрация стандартных стратегий аутентификации
            self.register_strategy("email_password", EmailPasswordStrategy())
            super()._setup()
    
    def register_strategy(self, name: str, strategy: IAuthenticationStrategy):
        """Регистрация новой стратегии аутентификации."""
        self._authentication_strategies[name] = strategy
        self._log_operation("register_strategy", {"strategy": name})
    
    async def authenticate_user(
        self, 
        db: AsyncSession, 
        credentials: Dict[str, Any], 
        strategy: str = "email_password"
    ) -> User:
        """
        Аутентификация пользователя с использованием указанной стратегии.
        
        Args:
            db: Сессия базы данных
            credentials: Данные для аутентификации
            strategy: Название стратегии аутентификации
        
        Returns:
            User: Аутентифицированный пользователь
        
        Raises:
            ValueError: Если стратегия не найдена
            AuthenticationError: Если аутентификация не удалась
        """
        try:
            self._log_operation("authenticate_user", {
                "strategy": strategy,
                "username": credentials.get("username_or_email", "unknown")
            })
            
            if strategy not in self._authentication_strategies:
                raise ValueError(f"Authentication strategy '{strategy}' not found")
            
            auth_strategy = self._authentication_strategies[strategy]
            user = await auth_strategy.authenticate(db, credentials)
            
            # Обновление времени последнего входа
            await self._update_last_login(db, user)
            
            return user
            
        except Exception as e:
            raise self._handle_error(e, "authenticate_user")
    
    async def create_user_tokens(
        self, 
        db: AsyncSession, 
        user: User, 
        request: Request
    ) -> Dict[str, Any]:
        """
        Создание токенов для пользователя.
        
        Args:
            db: Сессия базы данных
            user: Пользователь
            request: HTTP запрос
        
        Returns:
            dict: Словарь с токенами и временем жизни
        """
        try:
            self._log_operation("create_user_tokens", {"user_id": user.id})
            return await self._token_factory.create_token_pair(db, user, request)
        except Exception as e:
            raise self._handle_error(e, "create_user_tokens")
    
    async def validate_access_token(
        self, token: str, db: AsyncSession
    ) -> Tuple[User, List[str]]:
        """
        Валидация access токена.
        
        Args:
            token: JWT access token
            db: Database session
        
        Returns:
            Tuple of (User, list of scopes)
        """
        try:
            self._log_operation("validate_access_token")
            return await self._token_validator.validate_access_token(token, db)
        except Exception as e:
            raise self._handle_error(e, "validate_access_token")
    
    async def _update_last_login(self, db: AsyncSession, user: User) -> None:
        """
        Обновление времени последнего входа пользователя.
        
        Args:
            db: Сессия базы данных
            user: Пользователь
        """
        user.last_login_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
        self._log_operation("update_last_login", {"user_id": user.id})


# Регистрация сервиса в фабрике
from .base import ServiceFactory
ServiceFactory.register_service("authentication", AuthenticationService)