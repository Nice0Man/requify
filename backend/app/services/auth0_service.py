"""
Сервис для работы с Auth0 OAuth2.
"""

import logging
from typing import Optional, Dict, Any

import jwt

try:
    from auth0.management import Auth0
    from auth0.authentication import GetToken
    from auth0.exceptions import Auth0Error

    AUTH0_AVAILABLE = True
except ImportError:
    # Auth0 не установлен, создаем заглушки
    AUTH0_AVAILABLE = False

    class Auth0:
        def __init__(self, *args, **kwargs):
            pass

    class GetToken:
        def __init__(self, *args, **kwargs):
            pass

        def client_credentials(self, *args, **kwargs):
            return {"access_token": "mock"}

    class Auth0Error(Exception):
        pass


from jwt import PyJWKClient
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class Auth0UserInfo(BaseModel):
    """Модель информации о пользователе из Auth0."""

    sub: str  # Auth0 user ID
    email: Optional[str] = None
    email_verified: Optional[bool] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    nickname: Optional[str] = None
    locale: Optional[str] = None
    updated_at: Optional[str] = None


class Auth0Service:
    """Сервис для работы с Auth0 OAuth2."""

    def __init__(self):
        self.config = settings.auth0
        self.domain = self.config.domain
        self.client_id = self.config.client_id
        self.client_secret = self.config.client_secret
        self.audience = self.config.audience
        self.algorithms = self.config.algorithms
        self.issuer = self.config.issuer or f"https://{self.domain}/"

        # JWK Client для получения публичных ключей
        if self.domain:
            self.jwks_client = PyJWKClient(
                f"https://{self.domain}/.well-known/jwks.json"
            )
        else:
            self.jwks_client = None

        # Management API client
        self._management_client: Optional[Auth0] = None

    @property
    def is_enabled(self) -> bool:
        """Проверяет, включен ли Auth0."""
        return (
            AUTH0_AVAILABLE
            and self.config.enabled
            and bool(self.domain)
            and bool(self.client_id)
            and bool(self.audience)
        )

    async def get_management_client(self) -> Optional[Auth0]:
        """Получает клиент для Management API."""
        if not self.is_enabled:
            return None

        if self._management_client is None:
            try:
                get_token = GetToken(self.domain)
                token = get_token.client_credentials(
                    self.config.management_client_id,
                    self.config.management_client_secret,
                    f"https://{self.domain}/api/v2/",
                )
                mgmt_api_token = token["access_token"]

                self._management_client = Auth0(self.domain, mgmt_api_token)
            except Auth0Error as e:
                logger.error(f"Ошибка при получении Management API токена: {e}")
                return None

        return self._management_client

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Валидирует Auth0 JWT токен.

        Args:
            token: JWT токен от Auth0

        Returns:
            Декодированный payload токена или None при ошибке
        """
        if not self.is_enabled or not self.jwks_client:
            return None

        try:
            # Получаем публичный ключ из JWKS
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)

            # Декодируем и валидируем токен
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=self.algorithms,
                audience=self.audience,
                issuer=self.issuer,
                options={"verify_exp": True},
            )

            return payload

        except jwt.ExpiredSignatureError:
            logger.warning("Auth0 токен истек")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Невалидный Auth0 токен: {e}")
            return None
        except Exception as e:
            logger.error(f"Ошибка при валидации Auth0 токена: {e}")
            return None

    def get_user_info(self, token: str) -> Optional[Auth0UserInfo]:
        """
        Получает информацию о пользователе из Auth0 токена.

        Args:
            token: JWT токен от Auth0

        Returns:
            Информация о пользователе или None при ошибке
        """
        payload = self.validate_token(token)
        if not payload:
            return None

        try:
            return Auth0UserInfo(**payload)
        except Exception as e:
            logger.error(f"Ошибка при парсинге информации пользователя: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Получает полную информацию о пользователе через Management API.

        Args:
            user_id: Auth0 ID пользователя

        Returns:
            Информация о пользователе или None при ошибке
        """
        if not self.is_enabled:
            return None

        mgmt_client = await self.get_management_client()
        if not mgmt_client:
            return None

        try:
            user = mgmt_client.users.get(user_id)
            return user
        except Auth0Error as e:
            logger.error(f"Ошибка при получении пользователя {user_id}: {e}")
            return None

    async def validate_token_and_get_user(self, token: str, db) -> Optional[object]:
        """
        Validate Auth0 token and get user from database.

        Args:
            token: JWT token from Auth0
            db: Database session

        Returns:
            User object from database or None
        """
        if not self.is_enabled:
            return None

        # Validate token first
        payload = self.validate_token(token)
        if not payload:
            return None

        # Extract user info
        user_info = self.get_user_info(token)
        if not user_info or not user_info.email:
            return None

        # Get user from database by email
        from app.crud import user as crud_user

        try:
            user = await crud_user.get_by_email(db, email=user_info.email)
            return user
        except Exception as e:
            logger.error(f"Error getting user from database: {e}")
            return None

    async def create_user(
        self, email: str, password: str, name: str = None
    ) -> Optional[Dict[str, Any]]:
        """
        Создает пользователя в Auth0.

        Args:
            email: Email пользователя
            password: Пароль пользователя
            name: Имя пользователя (опционально)

        Returns:
            Информация о созданном пользователе или None при ошибке
        """
        if not self.is_enabled:
            return None

        mgmt_client = await self.get_management_client()
        if not mgmt_client:
            return None

        try:
            user_data = {
                "email": email,
                "password": password,
                "connection": "Username-Password-Authentication",
                "email_verified": False,
            }

            if name:
                user_data["name"] = name

            user = mgmt_client.users.create(user_data)
            return user
        except Auth0Error as e:
            logger.error(f"Ошибка при создании пользователя {email}: {e}")
            return None

    async def update_user(
        self, user_id: str, user_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Обновляет информацию о пользователе в Auth0.

        Args:
            user_id: Auth0 ID пользователя
            user_data: Данные для обновления

        Returns:
            Обновленная информация о пользователе или None при ошибке
        """
        if not self.is_enabled:
            return None

        mgmt_client = await self.get_management_client()
        if not mgmt_client:
            return None

        try:
            user = mgmt_client.users.update(user_id, user_data)
            return user
        except Auth0Error as e:
            logger.error(f"Ошибка при обновлении пользователя {user_id}: {e}")
            return None

    async def delete_user(self, user_id: str) -> bool:
        """
        Удаляет пользователя из Auth0.

        Args:
            user_id: Auth0 ID пользователя

        Returns:
            True при успешном удалении, False при ошибке
        """
        if not self.is_enabled:
            return False

        mgmt_client = await self.get_management_client()
        if not mgmt_client:
            return False

        try:
            mgmt_client.users.delete(user_id)
            return True
        except Auth0Error as e:
            logger.error(f"Ошибка при удалении пользователя {user_id}: {e}")
            return False


# Глобальный экземпляр сервиса
auth0_service = Auth0Service()
