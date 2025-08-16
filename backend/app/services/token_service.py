"""
Token Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from datetime import datetime, timedelta, UTC
from typing import Tuple, Optional, Dict, Any, List
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
import secrets

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
from .base import BaseService, ServiceError


class TokenServiceError(ServiceError):
    """Ошибки сервиса токенов."""

    pass


class TokenValidationError(TokenServiceError):
    """Ошибка валидации токена."""

    pass


class TokenExpiredError(TokenServiceError):
    """Ошибка истекшего токена."""

    pass


class InactiveUserError(TokenServiceError):
    """Ошибка неактивного пользователя."""

    pass


class TokenScope(str, Enum):
    """Области действия токенов."""

    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    API = "api"
    REFRESH = "refresh"


class TokenStatus(str, Enum):
    """Статусы токенов."""

    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    SUSPENDED = "suspended"


@dataclass
class TokenInfo:
    """Информация о токене."""

    token: str
    token_type: TokenType
    expires_at: datetime
    scope: List[TokenScope]
    user_id: int
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


@dataclass
class TokenPair:
    """Пара access и refresh токенов."""

    access_token: TokenInfo
    refresh_token: TokenInfo
    token_type: str = "Bearer"
    expires_in: int = 0


# Абстрактные интерфейсы
class ITokenGenerator(ABC):
    """Интерфейс генератора токенов."""

    @abstractmethod
    async def generate_token_pair(
        self, user: User, scopes: List[TokenScope], remember_me: bool = False
    ) -> TokenPair:
        """Сгенерировать пару токенов."""
        pass


class ITokenValidator(ABC):
    """Интерфейс валидатора токенов."""

    @abstractmethod
    async def validate_token(
        self, token: str, token_type: TokenType, db: AsyncSession
    ) -> Tuple[User, List[str]]:
        """Валидировать токен."""
        pass


class ITokenStorage(ABC):
    """Интерфейс хранилища токенов."""

    @abstractmethod
    async def store_refresh_token(
        self,
        db: AsyncSession,
        user_id: int,
        token_data: Dict[str, Any],
        expires_at: datetime,
    ) -> str:
        """Сохранить refresh токен."""
        pass

    @abstractmethod
    async def revoke_refresh_token(self, db: AsyncSession, token_id: str) -> bool:
        """Отозвать refresh токен."""
        pass


# Конкретные реализации
class JWTTokenGenerator(ITokenGenerator):
    """Генератор JWT токенов."""

    def __init__(self):
        self.jwt_manager = JWTTokenManager()

    async def generate_token_pair(
        self, user: User, scopes: List[TokenScope], remember_me: bool = False
    ) -> TokenPair:
        """Сгенерировать пару JWT токенов."""
        # Настройка времени жизни
        access_expires = timedelta(
            minutes=settings.security.access_token_expire_minutes
        )
        refresh_expires = timedelta(days=settings.security.refresh_token_expire_days)

        if remember_me:
            access_expires *= 2
            refresh_expires *= 2

        # Данные для токенов
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "scopes": [scope.value for scope in scopes],
            "is_active": user.is_active,
        }

        # Генерация токенов
        access_token = self.jwt_manager.create_access_token(
            subject=user.email,
            user_id=user.id,
            scopes=[scope.value for scope in scopes],
            expires_delta=access_expires,
        )

        refresh_token = self.jwt_manager.create_access_token(
            subject=user.email,
            user_id=user.id,
            scopes=["refresh"],
            expires_delta=refresh_expires,
        )

        access_token_info = TokenInfo(
            token=access_token,
            token_type=TokenType.ACCESS,
            expires_at=datetime.now(UTC),
            scope=scopes,
            user_id=user.id,
        )

        refresh_token_info = TokenInfo(
            token=refresh_token,
            token_type=TokenType.REFRESH,
            expires_at=datetime.now(UTC),
            scope=[TokenScope.REFRESH],
            user_id=user.id,
        )

        return TokenPair(
            access_token=access_token_info,
            refresh_token=refresh_token_info,
            expires_in=int(access_expires.total_seconds()),
        )


class JWTTokenValidator(ITokenValidator):
    """Валидатор JWT токенов."""

    def __init__(self):
        self.jwt_manager = JWTTokenManager()

    async def validate_token(
        self, token: str, token_type: TokenType, db: AsyncSession
    ) -> Tuple[User, List[str]]:
        """Валидировать JWT токен."""
        try:
            # Декодирование токена
            payload = self.jwt_manager.decode_token(token, token_type)

            if not payload:
                raise TokenValidationError("Invalid token payload")

            # Извлечение данных
            user_id = payload.get("sub")
            if not user_id:
                raise TokenValidationError("Missing user ID in token")

            # Получение пользователя
            user = await crud_user.get(db, id=int(user_id))
            if not user:
                raise TokenValidationError("User not found")

            if not user.is_active:
                raise InactiveUserError("User account is deactivated")

            # Извлечение разрешений
            scopes = payload.get("scopes", [])

            return user, scopes

        except Exception as e:
            if isinstance(e, TokenServiceError):
                raise
            raise TokenValidationError(f"Token validation failed: {str(e)}")


class DatabaseTokenStorage(ITokenStorage):
    """Хранилище токенов в базе данных."""

    async def store_refresh_token(
        self,
        db: AsyncSession,
        user_id: int,
        token_data: Dict[str, Any],
        expires_at: datetime,
    ) -> str:
        """Сохранить refresh токен в БД."""
        refresh_token_record = await crud_refresh_token.create_for_user(
            db,
            user_id=user_id,
            expires_at=expires_at,
            user_agent=token_data.get("user_agent"),
            ip_address=token_data.get("ip_address"),
        )

        return str(refresh_token_record.id)

    async def revoke_refresh_token(self, db: AsyncSession, token_id: str) -> bool:
        """Отозвать refresh токен."""
        try:
            success = await crud_refresh_token.revoke_token(
                db, token_id=int(token_id), reason="manual_revocation"
            )
            return success
        except Exception:
            return False


class TokenSecurityManager:
    """Менеджер безопасности токенов."""

    def __init__(self):
        self._suspicious_ips: set = set()
        self._failed_attempts: Dict[str, int] = {}

    def check_token_security(
        self, user: User, ip_address: str, user_agent: str
    ) -> bool:
        """Проверить безопасность токена."""
        # Проверка подозрительного IP
        if ip_address in self._suspicious_ips:
            logger.warning(f"Token request from suspicious IP: {ip_address}")
            return False

        # Проверка превышения лимита неудачных попыток
        if self._failed_attempts.get(ip_address, 0) > 10:
            logger.warning(f"Too many failed attempts from IP: {ip_address}")
            return False

        return True

    def report_failed_attempt(self, ip_address: str):
        """Зарегистрировать неудачную попытку."""
        self._failed_attempts[ip_address] = self._failed_attempts.get(ip_address, 0) + 1

    def reset_failed_attempts(self, ip_address: str):
        """Сбросить счетчик неудачных попыток."""
        if ip_address in self._failed_attempts:
            del self._failed_attempts[ip_address]


class TokenService(BaseService):
    """
    Основной сервис токенов.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные генераторы и валидаторы)
    - Factory (создание токенов)
    - Repository (хранение токенов)
    """

    def __init__(self):
        self._generator: ITokenGenerator = JWTTokenGenerator()
        self._validator: ITokenValidator = JWTTokenValidator()
        self._storage: ITokenStorage = DatabaseTokenStorage()
        self._security_manager = TokenSecurityManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "TokenService"

    def set_generator(self, generator: ITokenGenerator):
        """Установить генератор токенов."""
        self._generator = generator
        self._log_operation("set_generator", {"generator": type(generator).__name__})

    def set_validator(self, validator: ITokenValidator):
        """Установить валидатор токенов."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def create_tokens_for_user(
        self,
        db: AsyncSession,
        user: User,
        request: Request,
        remember_me: bool = False,
        scopes: Optional[List[TokenScope]] = None,
    ) -> Dict[str, Any]:
        """Создать токены для пользователя."""
        try:
            self._log_operation(
                "create_tokens_for_user",
                {"user_id": user.id, "remember_me": remember_me},
            )

            # Получение информации о клиенте
            ip_address = get_client_ip(request)
            user_agent = get_user_agent(request)

            # Проверка безопасности
            if not self._security_manager.check_token_security(
                user, ip_address, user_agent
            ):
                raise TokenServiceError("Security check failed")

            # Определение областей действия
            if scopes is None:
                scopes = [TokenScope.READ, TokenScope.WRITE]
                # Check if user has admin role instead of is_superuser
                if (
                    hasattr(user, "role")
                    and user.role
                    and user.role.name in ["admin", "system_admin"]
                ):
                    scopes.append(TokenScope.ADMIN)

            # Генерация токенов
            token_pair = await self._generator.generate_token_pair(
                user, scopes, remember_me
            )

            # Сохранение refresh токена
            token_data = {
                "ip_address": ip_address,
                "user_agent": user_agent,
                "scopes": [scope.value for scope in scopes],
            }

            refresh_token_id = await self._storage.store_refresh_token(
                db,
                user.id,
                token_data,
                token_pair.refresh_token.expires_at.replace(tzinfo=None),
            )

            # Сброс счетчика неудачных попыток
            self._security_manager.reset_failed_attempts(ip_address)

            # Обновление времени последнего входа
            user.last_login_at = datetime.now(UTC).replace(tzinfo=None)
            await db.commit()

            return {
                "access_token": token_pair.access_token.token,
                "refresh_token": token_pair.refresh_token.token,
                "token_type": token_pair.token_type,
                "expires_in": token_pair.expires_in,
                "scopes": [scope.value for scope in scopes],
                "refresh_token_id": refresh_token_id,
            }

        except Exception as e:
            self._security_manager.report_failed_attempt(get_client_ip(request))
            raise self._handle_error(e, "create_tokens_for_user")

    async def validate_access_token(
        self, token: str, db: AsyncSession
    ) -> Tuple[User, List[str]]:
        """Валидировать access токен."""
        try:
            self._log_operation(
                "validate_access_token", {"token_provided": bool(token)}
            )

            return await self._validator.validate_token(token, TokenType.ACCESS, db)

        except Exception as e:
            raise self._handle_error(e, "validate_access_token")

    async def refresh_access_token(
        self, db: AsyncSession, refresh_token: str, request: Request
    ) -> Dict[str, Any]:
        """Обновить access токен по refresh токену."""
        try:
            self._log_operation(
                "refresh_access_token", {"token_provided": bool(refresh_token)}
            )

            # Валидация refresh токена
            user, _ = await self._validator.validate_token(
                refresh_token, TokenType.REFRESH, db
            )

            # Проверка активности пользователя
            if not user.is_active:
                raise InactiveUserError("User account is deactivated")

            # Создание нового access токена
            scopes = [TokenScope.READ, TokenScope.WRITE]
            if user.is_superuser:
                scopes.append(TokenScope.ADMIN)

            token_pair = await self._generator.generate_token_pair(user, scopes, False)

            return {
                "access_token": token_pair.access_token.token,
                "token_type": token_pair.token_type,
                "expires_in": token_pair.expires_in,
                "scopes": [scope.value for scope in scopes],
            }

        except Exception as e:
            raise self._handle_error(e, "refresh_access_token")

    async def revoke_refresh_token(
        self, db: AsyncSession, token_id: str, user: User
    ) -> bool:
        """Отозвать refresh токен."""
        try:
            self._log_operation(
                "revoke_refresh_token", {"token_id": token_id, "user_id": user.id}
            )

            # Проверка принадлежности токена пользователю
            token_record = await crud_refresh_token.get(db, id=int(token_id))
            if not token_record or token_record.user_id != user.id:
                raise TokenServiceError("Token not found or does not belong to user")

            # Отзыв токена
            success = await self._storage.revoke_refresh_token(db, token_id)

            if success:
                logger.info(f"Refresh token {token_id} revoked for user {user.email}")

            return success

        except Exception as e:
            raise self._handle_error(e, "revoke_refresh_token")

    async def revoke_all_user_tokens(
        self,
        db: AsyncSession,
        user: User,
        exclude_current: bool = True,
        current_token_id: Optional[str] = None,
    ) -> int:
        """Отозвать все токены пользователя."""
        try:
            self._log_operation(
                "revoke_all_user_tokens",
                {"user_id": user.id, "exclude_current": exclude_current},
            )

            exclude_id = int(current_token_id) if current_token_id else None

            revoked_count = await crud_refresh_token.revoke_user_tokens(
                db, user_id=user.id, reason="revoke_all", exclude_token_id=exclude_id
            )

            logger.info(f"Revoked {revoked_count} tokens for user {user.email}")

            return revoked_count

        except Exception as e:
            raise self._handle_error(e, "revoke_all_user_tokens")

    async def get_token_info(
        self, token: str, token_type: TokenType
    ) -> Optional[Dict[str, Any]]:
        """Получить информацию о токене без его валидации."""
        try:
            jwt_manager = JWTTokenManager()
            payload = jwt_manager.decode_token(token, token_type, verify=False)

            if not payload:
                return None

            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "scopes": payload.get("scopes", []),
                "issued_at": payload.get("iat"),
                "expires_at": payload.get("exp"),
                "token_type": token_type.value,
            }

        except Exception as e:
            logger.error(f"Failed to get token info: {e}")
            return None

    async def refresh_access_token(
        self, db: AsyncSession, refresh_token: str, request: Request
    ) -> Dict[str, Any]:
        """
        Обновить access токен используя refresh токен.

        Args:
            db: Сессия базы данных
            refresh_token: Refresh токен
            request: HTTP запрос

        Returns:
            Dict[str, Any]: Новые токены
        """
        try:
            # Проверяем refresh токен
            user, _ = await self.validate_access_token(refresh_token, db)

            # Создаем новые токены
            return await self.create_tokens_for_user(db=db, user=user, request=request)
        except Exception as e:
            raise self._handle_error(e, "refresh_access_token")

    async def validate_token(self, db: AsyncSession, token: str) -> Dict[str, Any]:
        """
        Валидировать токен и вернуть информацию о пользователе.

        Args:
            db: Сессия базы данных
            token: JWT токен

        Returns:
            Dict[str, Any]: Информация о пользователе и токене
        """
        try:
            user, scopes = await self.validate_access_token(token, db)

            return {
                "valid": True,
                "user_id": user.id,
                "email": user.email,
                "scopes": scopes,
                "is_active": user.is_active,
            }
        except Exception as e:
            raise self._handle_error(e, "validate_token")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("token", TokenService)

# Singleton instance
token_service = TokenService()
