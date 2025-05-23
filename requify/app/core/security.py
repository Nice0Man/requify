"""
Модуль безопасности для аутентификации и авторизации.

Включает функции для работы с JWT токенами, хэшированием паролей
и проверкой прав доступа.
"""

import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from jose import jwt
from passlib.context import CryptContext

from requify.app.core.config import settings

# Контекст для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Алгоритм для JWT
ALGORITHM = "HS256"


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Создать JWT токен доступа.

    Args:
        subject: Субъект токена (обычно user_id)
        expires_delta: Время жизни токена

    Returns:
        str: JWT токен
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.auth.access_token_expire_minutes
        )

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.auth.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Создать JWT refresh токен.

    Args:
        subject: Субъект токена (обычно user_id)
        expires_delta: Время жизни токена

    Returns:
        str: JWT refresh токен
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.auth.refresh_token_expire_days
        )

    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.auth.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Проверить и декодировать JWT токен.

    Args:
        token: JWT токен

    Returns:
        Optional[Dict[str, Any]]: Декодированные данные токена или None
    """
    try:
        payload = jwt.decode(token, settings.auth.secret_key, algorithms=[ALGORITHM])
        return payload
    except jwt.JWTError:
        return None


def get_password_hash(password: str) -> str:
    """
    Хэшировать пароль.

    Args:
        password: Пароль в открытом виде

    Returns:
        str: Хэшированный пароль
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверить пароль.

    Args:
        plain_password: Пароль в открытом виде
        hashed_password: Хэшированный пароль

    Returns:
        bool: True если пароль верный, False иначе
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_password_reset_token(email: str) -> str:
    """
    Генерировать токен для сброса пароля.

    Args:
        email: Email пользователя

    Returns:
        str: Токен для сброса пароля
    """
    delta = timedelta(hours=settings.auth.email_reset_token_expire_hours)
    now = datetime.utcnow()
    expires = now + delta

    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.auth.secret_key,
        algorithm=ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Проверить токен сброса пароля.

    Args:
        token: Токен сброса пароля

    Returns:
        Optional[str]: Email пользователя или None
    """
    try:
        decoded_token = jwt.decode(
            token, settings.auth.secret_key, algorithms=[ALGORITHM]
        )
        return decoded_token["sub"]
    except jwt.JWTError:
        return None


def generate_api_key() -> str:
    """
    Генерировать случайный API ключ.

    Returns:
        str: API ключ
    """
    return secrets.token_urlsafe(32)


class PermissionChecker:
    """
    Класс для проверки прав доступа (Open/Closed Principle).
    """

    @staticmethod
    def can_read_project(user: Dict[str, Any], project_id: int) -> bool:
        """
        Проверить право на чтение проекта.

        Args:
            user: Данные пользователя
            project_id: ID проекта

        Returns:
            bool: True если есть право, False иначе
        """
        # TODO: Реализовать проверку прав на чтение проекта
        # Пока разрешаем всем авторизованным пользователям
        return True

    @staticmethod
    def can_write_project(user: Dict[str, Any], project_id: int) -> bool:
        """
        Проверить право на запись в проект.

        Args:
            user: Данные пользователя
            project_id: ID проекта

        Returns:
            bool: True если есть право, False иначе
        """
        # TODO: Реализовать проверку прав на запись в проект
        # Пока разрешаем только суперпользователям
        return user.get("is_superuser", False)

    @staticmethod
    def can_delete_project(user: Dict[str, Any], project_id: int) -> bool:
        """
        Проверить право на удаление проекта.

        Args:
            user: Данные пользователя
            project_id: ID проекта

        Returns:
            bool: True если есть право, False иначе
        """
        # TODO: Реализовать проверку прав на удаление проекта
        # Пока разрешаем только суперпользователям
        return user.get("is_superuser", False)

    @staticmethod
    def can_manage_users(user: Dict[str, Any]) -> bool:
        """
        Проверить право на управление пользователями.

        Args:
            user: Данные пользователя

        Returns:
            bool: True если есть право, False иначе
        """
        # TODO: Реализовать проверку прав на управление пользователями
        return user.get("is_superuser", False)


# Экземпляр проверщика прав
permission_checker = PermissionChecker()
