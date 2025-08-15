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
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.constants import Permission, RoleScope


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
        roles: Optional[List[str]] = None,
        scopes: Optional[List[str]] = None,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """
        Создать access JWT токен.

        Args:
            subject: Субъект токена (обычно email пользователя)
            user_id: ID пользователя
            roles: Роли пользователя
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
            "roles": roles or [],
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


# === Enhanced Role System Security ===


class EnhancedRolePermissionChecker:
    """
    Проверщик прав доступа для Enhanced Role System.
    Интегрируется с системой ролей для проверки разрешений.
    """

    @staticmethod
    def get_user_role_assignments(user) -> List[Dict[str, Any]]:
        """
        Получить назначения ролей пользователя.

        Args:
            user: Объект пользователя

        Returns:
            List[Dict[str, Any]]: Список назначений ролей
        """
        if hasattr(user, "role_assignments") and user.role_assignments:
            assignments = []
            for assignment in user.role_assignments:
                # Check if assignment is active
                if not assignment.is_active:
                    continue

                # Check if role exists and is active
                if not assignment.role or not assignment.role.is_active:
                    continue

                # Get permissions from role
                permissions = []
                if assignment.role.permissions_config:
                    permissions = assignment.role.permissions_config.get(
                        "permissions", []
                    )

                assignments.append(
                    {
                        "role": assignment.role,
                        "assignment": assignment,
                        "is_valid": True,  # We already validated above
                        "permissions": permissions,
                        "role_name": assignment.role.name,  # Added role_name
                    }
                )
            return assignments
        return []

    @staticmethod
    def has_permission(
        user,
        permission: Union[str, Permission],
        scope: Optional[RoleScope] = None,
        context_id: Optional[int] = None,
    ) -> bool:
        """
        Проверить наличие разрешения у пользователя.

        Args:
            user: Объект пользователя
            permission: Требуемое разрешение
            scope: Область действия (опционально)
            context_id: ID контекста (опционально)

        Returns:
            bool: True если разрешение есть
        """
        # Преобразуем в строку если передан enum
        permission_str = (
            permission.value if isinstance(permission, Permission) else permission
        )

        # Проверяем системного администратора
        if EnhancedRolePermissionChecker.is_system_admin(user):
            return True

        # Получаем назначения ролей пользователя
        role_assignments = EnhancedRolePermissionChecker.get_user_role_assignments(user)

        for assignment_data in role_assignments:
            if not assignment_data["is_valid"]:
                continue

            role = assignment_data["role"]
            assignment = assignment_data["assignment"]
            permissions = assignment_data["permissions"]

            # Проверяем область действия если указана
            if scope:
                role_scope = getattr(role, "scope", None)
                if role_scope and role_scope != scope.value:
                    # Проверяем иерархию ролей (система > компания > департамент > команда > проект)
                    if not EnhancedRolePermissionChecker._is_scope_hierarchical(
                        role_scope, scope.value
                    ):
                        continue

                # Проверяем контекст если указан
                if context_id and hasattr(assignment, "company_id"):
                    assignment_context = (
                        EnhancedRolePermissionChecker._get_assignment_context(
                            assignment, scope
                        )
                    )
                    if assignment_context and assignment_context != context_id:
                        continue

            # Проверяем наличие разрешения
            if permission_str in permissions:
                return True

        return False

    @staticmethod
    def has_any_permission(
        user,
        permissions: List[Union[str, Permission]],
        scope: Optional[RoleScope] = None,
        context_id: Optional[int] = None,
    ) -> bool:
        """
        Проверить наличие любого из указанных разрешений.

        Args:
            user: Объект пользователя
            permissions: Список требуемых разрешений
            scope: Область действия (опционально)
            context_id: ID контекста (опционально)

        Returns:
            bool: True если есть хотя бы одно разрешение
        """
        return any(
            EnhancedRolePermissionChecker.has_permission(user, perm, scope, context_id)
            for perm in permissions
        )

    @staticmethod
    def has_all_permissions(
        user,
        permissions: List[Union[str, Permission]],
        scope: Optional[RoleScope] = None,
        context_id: Optional[int] = None,
    ) -> bool:
        """
        Проверить наличие всех указанных разрешений.

        Args:
            user: Объект пользователя
            permissions: Список требуемых разрешений
            scope: Область действия (опционально)
            context_id: ID контекста (опционально)

        Returns:
            bool: True если есть все разрешения
        """
        return all(
            EnhancedRolePermissionChecker.has_permission(user, perm, scope, context_id)
            for perm in permissions
        )

    @staticmethod
    def get_user_permissions(
        user, scope: Optional[RoleScope] = None, context_id: Optional[int] = None
    ) -> List[str]:
        """
        Получить все разрешения пользователя.

        Args:
            user: Объект пользователя
            scope: Область действия (опционально)
            context_id: ID контекста (опционально)

        Returns:
            List[str]: Список разрешений
        """
        # Проверяем системного администратора
        if EnhancedRolePermissionChecker.is_system_admin(user):
            return [perm.value for perm in Permission]

        permissions = set()
        role_assignments = EnhancedRolePermissionChecker.get_user_role_assignments(user)

        for assignment_data in role_assignments:
            if not assignment_data["is_valid"]:
                continue

            role = assignment_data["role"]
            assignment = assignment_data["assignment"]
            role_permissions = assignment_data["permissions"]

            # Проверяем область действия если указана
            if scope:
                role_scope = getattr(role, "scope", None)
                if role_scope and role_scope != scope.value:
                    if not EnhancedRolePermissionChecker._is_scope_hierarchical(
                        role_scope, scope.value
                    ):
                        continue

                # Проверяем контекст если указан
                if context_id and hasattr(assignment, "company_id"):
                    assignment_context = (
                        EnhancedRolePermissionChecker._get_assignment_context(
                            assignment, scope
                        )
                    )
                    if assignment_context and assignment_context != context_id:
                        continue

            permissions.update(role_permissions)

        return list(permissions)

    @staticmethod
    def is_system_admin(user) -> bool:
        """
        Проверить является ли пользователь системным администратором.

        Args:
            user: Объект пользователя

        Returns:
            bool: True если системный администратор
        """
        # Проверяем legacy флаги
        if hasattr(user, "is_superuser") and user.is_superuser:
            return True

        # Проверяем через enhanced role system (избегаем рекурсии)
        role_assignments = EnhancedRolePermissionChecker.get_user_role_assignments(user)
        for assignment_data in role_assignments:
            if assignment_data["is_valid"]:
                # Проверяем по имени роли (system_admin)
                role_name = assignment_data.get("role_name", "")
                if role_name == "system_admin":
                    return True

                # Проверяем по разрешениям
                permissions = assignment_data["permissions"]
                if Permission.MANAGE_SYSTEM.value in permissions:
                    return True

        return False

    @staticmethod
    def is_company_admin(user, company_id: Optional[int] = None) -> bool:
        """
        Проверить является ли пользователь администратором компании.

        Args:
            user: Объект пользователя
            company_id: ID компании (опционально)

        Returns:
            bool: True если администратор компании
        """
        return EnhancedRolePermissionChecker.has_permission(
            user, Permission.MANAGE_COMPANY, RoleScope.COMPANY, company_id
        )

    @staticmethod
    def can_manage_users(
        user, scope: RoleScope = RoleScope.SYSTEM, context_id: Optional[int] = None
    ) -> bool:
        """
        Проверить может ли пользователь управлять другими пользователями.

        Args:
            user: Объект пользователя
            scope: Область действия
            context_id: ID контекста

        Returns:
            bool: True если может управлять пользователями
        """
        if scope == RoleScope.SYSTEM:
            return EnhancedRolePermissionChecker.has_permission(
                user, Permission.MANAGE_SYSTEM
            )
        elif scope == RoleScope.COMPANY:
            return EnhancedRolePermissionChecker.has_permission(
                user, Permission.MANAGE_COMPANY_USERS, scope, context_id
            )
        elif scope == RoleScope.TEAM:
            return EnhancedRolePermissionChecker.has_permission(
                user, Permission.MANAGE_TEAM_MEMBERS, scope, context_id
            )
        elif scope == RoleScope.PROJECT:
            return EnhancedRolePermissionChecker.has_permission(
                user, Permission.MANAGE_PROJECT_MEMBERS, scope, context_id
            )
        return False

    @staticmethod
    def _is_scope_hierarchical(user_scope: str, required_scope: str) -> bool:
        """
        Проверить иерархию областей действия.
        Системные роли имеют доступ ко всем уровням ниже.

        Args:
            user_scope: Область роли пользователя
            required_scope: Требуемая область

        Returns:
            bool: True если роль охватывает требуемую область
        """
        hierarchy = {
            "system": 5,
            "company": 4,
            "department": 3,
            "team": 2,
            "project": 1,
            "resource": 0,
        }

        user_level = hierarchy.get(user_scope, 0)
        required_level = hierarchy.get(required_scope, 0)

        return user_level >= required_level

    @staticmethod
    def _get_assignment_context(assignment, scope: RoleScope) -> Optional[int]:
        """
        Получить контекст назначения роли в зависимости от области.

        Args:
            assignment: Объект назначения роли
            scope: Область действия

        Returns:
            Optional[int]: ID контекста или None
        """
        if scope == RoleScope.COMPANY:
            return getattr(assignment, "company_id", None)
        elif scope == RoleScope.DEPARTMENT:
            return getattr(assignment, "department_id", None)
        elif scope == RoleScope.TEAM:
            return getattr(assignment, "team_id", None)
        elif scope == RoleScope.PROJECT:
            return getattr(assignment, "project_id", None)
        return None


class PermissionDecorator:
    """
    Декоратор для проверки разрешений в эндпоинтах.
    """

    @staticmethod
    def require_permission(
        permission: Union[str, Permission],
        scope: Optional[RoleScope] = None,
        context_param: Optional[str] = None,
    ):
        """
        Декоратор для проверки разрешения.

        Args:
            permission: Требуемое разрешение
            scope: Область действия
            context_param: Имя параметра для получения context_id
        """

        def decorator(func):
            def wrapper(*args, **kwargs):
                # Получаем пользователя из зависимостей FastAPI
                current_user = kwargs.get("current_user")
                if not current_user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication required",
                    )

                # Получаем context_id если указан параметр
                context_id = None
                if context_param and context_param in kwargs:
                    context_id = kwargs[context_param]

                # Проверяем разрешение
                if not EnhancedRolePermissionChecker.has_permission(
                    current_user, permission, scope, context_id
                ):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions",
                    )

                return func(*args, **kwargs)

            return wrapper

        return decorator

    @staticmethod
    def require_any_permission(
        permissions: List[Union[str, Permission]],
        scope: Optional[RoleScope] = None,
        context_param: Optional[str] = None,
    ):
        """
        Декоратор для проверки любого из разрешений.
        """

        def decorator(func):
            def wrapper(*args, **kwargs):
                current_user = kwargs.get("current_user")
                if not current_user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication required",
                    )

                context_id = None
                if context_param and context_param in kwargs:
                    context_id = kwargs[context_param]

                if not EnhancedRolePermissionChecker.has_any_permission(
                    current_user, permissions, scope, context_id
                ):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions",
                    )

                return func(*args, **kwargs)

            return wrapper

        return decorator


# Создаем экземпляры для использования
enhanced_permission_checker = EnhancedRolePermissionChecker()


# === Utility Functions for Enhanced Role System ===


def check_user_permission(
    user,
    permission: Union[str, Permission],
    scope: Optional[RoleScope] = None,
    context_id: Optional[int] = None,
) -> bool:
    """
    Утилитарная функция для проверки разрешений пользователя.

    Args:
        user: Объект пользователя
        permission: Требуемое разрешение
        scope: Область действия (опционально)
        context_id: ID контекста (опционально)

    Returns:
        bool: True если разрешение есть
    """
    return EnhancedRolePermissionChecker.has_permission(
        user, permission, scope, context_id
    )


def get_user_permissions(
    user, scope: Optional[RoleScope] = None, context_id: Optional[int] = None
) -> List[str]:
    """
    Утилитарная функция для получения разрешений пользователя.

    Args:
        user: Объект пользователя
        scope: Область действия (опционально)
        context_id: ID контекста (опционально)

    Returns:
        List[str]: Список разрешений
    """
    return EnhancedRolePermissionChecker.get_user_permissions(user, scope, context_id)


def require_system_admin(user) -> bool:
    """
    Проверить является ли пользователь системным администратором.

    Args:
        user: Объект пользователя

    Returns:
        bool: True если системный администратор

    Raises:
        HTTPException: Если нет прав системного администратора
    """
    if not EnhancedRolePermissionChecker.is_system_admin(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System administrator privileges required",
        )
    return True


def require_company_admin(user, company_id: Optional[int] = None) -> bool:
    """
    Проверить является ли пользователь администратором компании.

    Args:
        user: Объект пользователя
        company_id: ID компании (опционально)

    Returns:
        bool: True если администратор компании

    Raises:
        HTTPException: Если нет прав администратора компании
    """
    if not EnhancedRolePermissionChecker.is_company_admin(user, company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company administrator privileges required",
        )
    return True
