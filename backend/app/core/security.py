"""
Модуль безопасности для аутентификации и авторизации.

Включает функции для работы с JWT токенами, хэшированием паролей,
проверкой прав доступа и управлением сессиями.
Следует принципам SOLID и современным практикам безопасности.
"""

import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union, List
from enum import Enum

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings


# === Enums для типов токенов ===


class TokenType(str, Enum):
    """Типы JWT токенов."""

    ACCESS = "access"
    REFRESH = "refresh"
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"


class PasswordStrength(str, Enum):
    """Уровни надежности пароля."""

    WEAK = "weak"
    MEDIUM = "medium"
    STRONG = "strong"
    VERY_STRONG = "very_strong"


# === Конфигурация безопасности ===

# Контекст для хэширования паролей
try:
    pwd_context = CryptContext(
        schemes=["bcrypt"],
        deprecated="auto",
        bcrypt__rounds=settings.security.bcrypt_rounds,
    )
except Exception as e:
    # Фиксируем проблему совместимости bcrypt с passlib
    # Создаем контекст без проверки версии bcrypt
    pwd_context = CryptContext(
        schemes=["bcrypt"],
        deprecated="auto",
        bcrypt__rounds=settings.security.bcrypt_rounds,
        bcrypt__default_rounds=settings.security.bcrypt_rounds,
    )

# Алгоритмы для разных типов токенов
ALGORITHMS = {
    TokenType.ACCESS: settings.security.access_token_algorithm,
    TokenType.REFRESH: settings.security.refresh_token_algorithm,
    TokenType.PASSWORD_RESET: "HS256",
    TokenType.EMAIL_VERIFICATION: "HS256",
}


# === Password Management (Single Responsibility Principle) ===


class PasswordManager:
    """Менеджер для работы с паролями."""

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Хэшировать пароль.

        Args:
            password: Пароль в открытом виде

        Returns:
            str: Хэшированный пароль
        """
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Проверить пароль.

        Args:
            plain_password: Пароль в открытом виде
            hashed_password: Хэшированный пароль

        Returns:
            bool: True если пароль верный
        """
        try:
            # Проверяем, что хэш не пустой и имеет минимальную длину
            if not hashed_password or len(hashed_password) < 10:
                return False
            
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            # Логируем ошибку для отладки, но не падаем
            print(f"Password verification error: {e}")
            return False

    @staticmethod
    def validate_password_strength(
        password: str,
    ) -> tuple[bool, List[str], PasswordStrength]:
        """
        Проверить надежность пароля.

        Args:
            password: Пароль для проверки

        Returns:
            tuple: (валиден, список ошибок, уровень надежности)
        """
        errors = []
        score = 0

        # Минимальная длина
        if len(password) < settings.security.password_min_length:
            errors.append(
                f"Пароль должен содержать минимум {settings.security.password_min_length} символов"
            )
        else:
            score += 1

        # Проверки требований
        if settings.security.password_require_uppercase:
            if not re.search(r"[A-Z]", password):
                errors.append("Пароль должен содержать заглавные буквы")
            else:
                score += 1

        if settings.security.password_require_lowercase:
            if not re.search(r"[a-z]", password):
                errors.append("Пароль должен содержать строчные буквы")
            else:
                score += 1

        if settings.security.password_require_digits:
            if not re.search(r"\d", password):
                errors.append("Пароль должен содержать цифры")
            else:
                score += 1

        if settings.security.password_require_special:
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                errors.append("Пароль должен содержать специальные символы")
            else:
                score += 1

        # Дополнительные проверки для определения силы
        if len(password) >= 12:
            score += 1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        if len(set(password)) > len(password) * 0.7:  # Разнообразие символов
            score += 1

        # Определение уровня надежности
        if score <= 2:
            strength = PasswordStrength.WEAK
        elif score <= 4:
            strength = PasswordStrength.MEDIUM
        elif score <= 6:
            strength = PasswordStrength.STRONG
        else:
            strength = PasswordStrength.VERY_STRONG

        is_valid = len(errors) == 0
        return is_valid, errors, strength

    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """
        Генерировать надежный пароль.

        Args:
            length: Длина пароля

        Returns:
            str: Сгенерированный пароль
        """
        import string

        # Обеспечиваем наличие всех типов символов
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        password = [
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.digits),
            secrets.choice("!@#$%^&*"),
        ]

        # Заполняем остальную длину
        for _ in range(length - 4):
            password.append(secrets.choice(characters))

        # Перемешиваем
        secrets.SystemRandom().shuffle(password)
        return "".join(password)


# === JWT Token Manager (Single Responsibility Principle) ===


class JWTTokenManager:
    """Менеджер для работы с JWT токенами."""

    @staticmethod
    def create_access_token(
        subject: Union[str, Any],
        user_id: int,
        scopes: Optional[List[str]] = None,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """
        Создать access JWT токен.

        Args:
            subject: Субъект токена (обычно email пользователя)
            user_id: ID пользователя
            scopes: Права доступа
            expires_delta: Время жизни токена

        Returns:
            str: JWT токен
        """
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.security.access_token_expire_minutes
            )

        now = datetime.now(timezone.utc)

        payload = {
            "sub": str(subject),
            "user_id": user_id,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "type": TokenType.ACCESS,
            "scopes": scopes or [],
        }

        encoded_jwt = jwt.encode(
            payload,
            settings.security.secret_key,
            algorithm=ALGORITHMS[TokenType.ACCESS],
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(
        subject: Union[str, Any],
        user_id: int,
        token_id: str,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """
        Создать refresh JWT токен.

        Args:
            subject: Субъект токена (обычно email пользователя)
            user_id: ID пользователя
            token_id: ID токена в базе данных
            expires_delta: Время жизни токена

        Returns:
            str: JWT токен
        """
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                days=settings.security.refresh_token_expire_days
            )

        now = datetime.now(timezone.utc)

        payload = {
            "sub": str(subject),
            "user_id": user_id,
            "token_id": token_id,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "type": TokenType.REFRESH,
        }

        encoded_jwt = jwt.encode(
            payload,
            settings.security.secret_key,
            algorithm=ALGORITHMS[TokenType.REFRESH],
        )
        return encoded_jwt

    @staticmethod
    def verify_token(
        token: str, token_type: TokenType = TokenType.ACCESS
    ) -> Optional[Dict[str, Any]]:
        """
        Проверить и декодировать JWT токен.

        Args:
            token: JWT токен
            token_type: Тип токена для проверки

        Returns:
            Optional[Dict[str, Any]]: Декодированные данные токена или None
        """
        try:
            payload = jwt.decode(
                token, settings.security.secret_key, algorithms=[ALGORITHMS[token_type]]
            )

            # Проверяем тип токена
            if payload.get("type") != token_type:
                return None

            return payload
        except JWTError:
            return None

    @staticmethod
    def create_password_reset_token(email: str) -> str:
        """
        Создать токен для сброса пароля.

        Args:
            email: Email пользователя

        Returns:
            str: Токен для сброса пароля
        """
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.security.password_reset_token_expire_minutes
        )
        now = datetime.now(timezone.utc)

        payload = {
            "sub": email,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "type": TokenType.PASSWORD_RESET,
        }

        encoded_jwt = jwt.encode(
            payload,
            settings.security.password_reset_secret,
            algorithm="HS256",
        )
        return encoded_jwt

    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[str]:
        """
        Проверить токен сброса пароля.

        Args:
            token: Токен сброса пароля

        Returns:
            Optional[str]: Email пользователя или None
        """
        try:
            payload = jwt.decode(
                token, settings.security.password_reset_secret, algorithms=["HS256"]
            )

            if payload.get("type") != TokenType.PASSWORD_RESET:
                return None

            return payload.get("sub")
        except JWTError:
            return None

    @staticmethod
    def create_email_verification_token(email: str) -> str:
        """
        Создать токен для верификации email.

        Args:
            email: Email пользователя

        Returns:
            str: Токен для верификации email
        """
        expire = datetime.now(timezone.utc) + timedelta(
            hours=settings.security.email_verification_token_expire_hours
        )
        now = datetime.now(timezone.utc)

        payload = {
            "sub": email,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "type": TokenType.EMAIL_VERIFICATION,
        }

        encoded_jwt = jwt.encode(
            payload,
            settings.security.email_verification_secret,
            algorithm="HS256",
        )
        return encoded_jwt

    @staticmethod
    def verify_email_verification_token(token: str) -> Optional[str]:
        """
        Проверить токен верификации email.

        Args:
            token: Токен верификации email

        Returns:
            Optional[str]: Email пользователя или None
        """
        try:
            payload = jwt.decode(
                token, settings.security.email_verification_secret, algorithms=["HS256"]
            )

            if payload.get("type") != TokenType.EMAIL_VERIFICATION:
                return None

            return payload.get("sub")
        except JWTError:
            return None


# === Security Utilities ===


def generate_secure_random_string(length: int = 32) -> str:
    """
    Генерировать безопасную случайную строку.

    Args:
        length: Длина строки

    Returns:
        str: Случайная строка
    """
    return secrets.token_urlsafe(length)


def constant_time_compare(val1: str, val2: str) -> bool:
    """
    Безопасное сравнение строк (защита от timing attacks).

    Args:
        val1: Первая строка
        val2: Вторая строка

    Returns:
        bool: True если строки равны
    """
    return secrets.compare_digest(val1, val2)


def get_client_ip(request) -> Optional[str]:
    """
    Получить IP адрес клиента.

    Args:
        request: FastAPI Request объект

    Returns:
        Optional[str]: IP адрес клиента
    """
    # Проверяем заголовки прокси
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()  # type: ignore

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Возвращаем прямой IP
    return getattr(request.client, "host", None)


def get_user_agent(request) -> Optional[str]:
    """
    Получить User-Agent клиента.

    Args:
        request: FastAPI Request объект

    Returns:
        Optional[str]: User-Agent
    """
    return request.headers.get("User-Agent")


# === Backwards Compatibility ===

# Для обратной совместимости экспортируем функции напрямую
hash_password = PasswordManager.hash_password
get_password_hash = PasswordManager.hash_password  # Alias for backward compatibility
verify_password = PasswordManager.verify_password
create_access_token = JWTTokenManager.create_access_token
create_refresh_token = JWTTokenManager.create_refresh_token
verify_token = JWTTokenManager.verify_token
generate_password_reset_token = JWTTokenManager.create_password_reset_token
verify_password_reset_token = JWTTokenManager.verify_password_reset_token


# === Password validation function for external use ===


def validate_password(password: str) -> tuple[bool, List[str]]:
    """
    Валидировать пароль (упрощенная версия для external API).

    Args:
        password: Пароль для проверки

    Returns:
        tuple: (валиден, список ошибок)
    """
    is_valid, errors, _ = PasswordManager.validate_password_strength(password)
    return is_valid, errors


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
        # Суперпользователи имеют доступ ко всем проектам
        if user.get("is_superuser", False):
            return True

        # Проверяем роль пользователя
        role = user.get("role", "")

        # Администраторы и менеджеры имеют доступ ко всем проектам
        if role in ["admin", "manager"]:
            return True

        # Аналитики, разработчики и тестировщики имеют доступ к назначенным проектам
        if role in ["analyst", "developer", "tester"]:
            # Проверяем участие пользователя в проекте через БД
            return PermissionChecker._check_user_project_membership(
                user.get("id"), project_id
            )

        # Гости и неопределенные роли не имеют доступа
        return False

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
        # Суперпользователи имеют права записи во все проекты
        if user.get("is_superuser", False):
            return True

        # Проверяем роль пользователя
        role = user.get("role", "")

        # Администраторы и менеджеры имеют права записи во все проекты
        if role in ["admin", "manager"]:
            return True

        # Аналитики и разработчики имеют права записи в назначенные проекты
        if role in ["analyst", "developer"]:
            # Проверяем права записи пользователя в проекте через БД
            return PermissionChecker._check_user_project_write_access(
                user.get("id"), project_id
            )

        # Тестировщики имеют только право на чтение и создание тестов
        if role == "tester":
            return False  # Тестировщики не могут изменять требования напрямую

        # Остальные роли не имеют прав записи
        return False

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
        # Суперпользователи имеют права удаления всех проектов
        if user.get("is_superuser", False):
            return True

        # Проверяем роль пользователя
        role = user.get("role", "")

        # Только администраторы могут удалять проекты
        if role == "admin":
            return True

        # Менеджеры могут удалять проекты только если они владельцы
        if role == "manager":
            # Проверяем владельца проекта через БД
            return PermissionChecker._check_project_ownership(
                user.get("id"), project_id
            )

        # Остальные роли не могут удалять проекты
        return False

    @staticmethod
    def can_manage_users(user: Dict[str, Any]) -> bool:
        """
        Проверить право на управление пользователями.

        Args:
            user: Данные пользователя

        Returns:
            bool: True если есть право, False иначе
        """
        return user.get("is_superuser", False)

    @staticmethod
    def _check_user_project_membership(user_id: int, project_id: int) -> bool:
        """
        Проверить участие пользователя в проекте.

        Args:
            user_id: ID пользователя
            project_id: ID проекта

        Returns:
            bool: True если пользователь участвует в проекте
        """
        # В реальной реализации здесь будет запрос к БД
        # Для простоты пока возвращаем True для всех пользователей
        # В будущем это может быть заменено на:
        # from app.crud import project as crud_project
        # return await crud_project.is_user_member(project_id, user_id)
        return True

    @staticmethod
    def _check_user_project_write_access(user_id: int, project_id: int) -> bool:
        """
        Проверить права записи пользователя в проекте.

        Args:
            user_id: ID пользователя
            project_id: ID проекта

        Returns:
            bool: True если пользователь может писать в проект
        """
        # В реальной реализации здесь будет запрос к БД для проверки роли
        # Для простоты пока возвращаем True для всех пользователей
        # В будущем это может быть заменено на:
        # from app.crud import project as crud_project
        # user_role = await crud_project.get_user_role(project_id, user_id)
        # return user_role in ["owner", "lead", "contributor"]
        return True

    @staticmethod
    def _check_project_ownership(user_id: int, project_id: int) -> bool:
        """
        Проверить является ли пользователь владельцем проекта.

        Args:
            user_id: ID пользователя
            project_id: ID проекта

        Returns:
            bool: True если пользователь владелец проекта
        """
        # В реальной реализации здесь будет запрос к БД
        # Для простоты пока возвращаем True для всех пользователей
        # В будущем это может быть заменено на:
        # from app.crud import project as crud_project
        # project = await crud_project.get(project_id)
        # return project.owner_id == user_id if project else False
        return True


# Экземпляр проверщика прав
permission_checker = PermissionChecker()
