"""
Зависимости для API (Dependency Injection).

Этот модуль содержит все зависимости, используемые в API endpoints,
следуя принципу Dependency Inversion из SOLID и современным практикам безопасности.
"""

from typing import AsyncGenerator, Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.core.config import settings
from requify.app.core.security import JWTTokenManager, TokenType, get_client_ip
from requify.app.db.db_helper import get_async_session
from requify.app.crud import user as crud_user
from requify.app.models.user import User

# OAuth2 scheme for FastAPI docs
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.app_config.api_v1_str}/auth/login",
    scopes={
        "me": "Read information about the current user",
        "users:read": "Read users information", 
        "users:write": "Create and update users",
        "users:delete": "Delete users",
        "projects:read": "Read projects information",
        "projects:write": "Create and update projects", 
        "projects:delete": "Delete projects",
        "requirements:read": "Read requirements information",
        "requirements:write": "Create and update requirements",
        "requirements:delete": "Delete requirements",
        "admin:read": "Read admin information",
        "admin:write": "Admin write operations",
        "system:admin": "System administration operations",
    },
    auto_error=False
)

# Fallback HTTPBearer for non-OAuth2 scenarios
security = HTTPBearer(auto_error=False)


# === Database Dependencies ===


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость для получения сессии базы данных.

    Yields:
        AsyncSession: Асинхронная сессия SQLAlchemy
    """
    async for session in get_async_session():
        yield session


# === Authentication Dependencies ===


async def get_current_user(
    request: Request,
    oauth2_token: Optional[str] = Depends(oauth2_scheme),
    bearer_token: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Зависимость для получения текущего пользователя из access токена.

    Args:
        request: HTTP запрос
        oauth2_token: JWT токен из OAuth2PasswordBearer (для FastAPI docs)
        bearer_token: JWT токен из HTTPBearer (для прямых API вызовов)
        db: Сессия базы данных

    Returns:
        User: Объект пользователя

    Raises:
        HTTPException: Если токен недействителен или пользователь не найден
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Получаем токен из любого источника
    token_str = None
    if oauth2_token:
        token_str = oauth2_token
    elif bearer_token:
        token_str = bearer_token.credentials

    # Проверяем наличие токена
    if not token_str:
        raise credentials_exception

    # Проверяем и декодируем access токен
    payload = JWTTokenManager.verify_token(token_str, TokenType.ACCESS)
    if payload is None:
        raise credentials_exception

    # Извлекаем данные из токена
    user_id = payload.get("user_id")
    email = payload.get("sub")

    if user_id is None or email is None:
        raise credentials_exception

    # Получаем пользователя из базы данных
    user = await crud_user.get(db, id=user_id)
    if user is None:
        raise credentials_exception

    # Дополнительная проверка email для безопасности
    if user.email != email:
        raise credentials_exception

    # Проверяем активность пользователя
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )

    # Можно добавить дополнительные проверки безопасности
    # например, проверку IP адреса если требуется
    # _validate_user_access(request, user, payload)

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Зависимость для получения текущего активного пользователя.

    Дублирует проверку активности для явности и обратной совместимости.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Объект активного пользователя

    Raises:
        HTTPException: Если пользователь неактивен
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )
    return current_user


async def get_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Зависимость для проверки прав суперпользователя.

    Args:
        current_user: Текущий активный пользователь

    Returns:
        User: Объект пользователя с правами суперпользователя

    Raises:
        HTTPException: Если пользователь не является суперпользователем
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


async def get_optional_user(
    request: Request,
    oauth2_token: Optional[str] = Depends(oauth2_scheme),
    bearer_token: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Зависимость для получения пользователя (опционально).

    Не вызывает исключения если токен отсутствует или недействителен.
    Полезно для эндпоинтов, которые могут работать как с авторизацией, так и без неё.

    Args:
        request: HTTP запрос
        oauth2_token: JWT токен из OAuth2PasswordBearer (для FastAPI docs)
        bearer_token: JWT токен из HTTPBearer (для прямых API вызовов)
        db: Сессия базы данных

    Returns:
        User: Объект пользователя или None
    """
    # Получаем токен из любого источника
    token_str = None
    if oauth2_token:
        token_str = oauth2_token
    elif bearer_token:
        token_str = bearer_token.credentials

    if not token_str:
        return None

    try:
        # Используем get_current_user но ловим исключения
        return await get_current_user(request, oauth2_token, bearer_token, db)
    except HTTPException:
        return None


# === Role-based Dependencies ===


async def get_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Зависимость для проверки роли администратора.

    Args:
        current_user: Текущий активный пользователь

    Returns:
        User: Объект пользователя с ролью admin

    Raises:
        HTTPException: Если пользователь не администратор
    """
    if not (current_user.is_superuser or current_user.role in ["admin", "manager"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def get_manager_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Зависимость для проверки роли менеджера или выше.

    Args:
        current_user: Текущий активный пользователь

    Returns:
        User: Объект пользователя с ролью manager или выше

    Raises:
        HTTPException: Если пользователь не имеет прав менеджера
    """
    allowed_roles = ["admin", "manager"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager privileges required",
        )
    return current_user


# === Scope-based Dependencies ===


def require_scopes(required_scopes: List[str]):
    """
    Фабрика зависимостей для проверки областей доступа (scopes).

    Args:
        required_scopes: Список требуемых областей доступа

    Returns:
        Функция зависимости
    """

    async def check_scopes(
        request: Request,
        oauth2_token: Optional[str] = Depends(oauth2_scheme),
        bearer_token: Optional[HTTPAuthorizationCredentials] = Depends(security),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        """
        Проверить области доступа пользователя.

        Args:
            request: HTTP запрос
            oauth2_token: JWT токен из OAuth2PasswordBearer (для FastAPI docs)
            bearer_token: JWT токен из HTTPBearer (для прямых API вызовов)
            db: Сессия базы данных

        Returns:
            User: Пользователь с достаточными правами

        Raises:
            HTTPException: Если не хватает прав доступа
        """
        # Получаем пользователя
        user = await get_current_user(request, oauth2_token, bearer_token, db)

        # Получаем токен для проверки scopes
        token_str = None
        if oauth2_token:
            token_str = oauth2_token
        elif bearer_token:
            token_str = bearer_token.credentials

        # Проверяем токен на наличие scopes
        if token_str:
            payload = JWTTokenManager.verify_token(token_str, TokenType.ACCESS)
            if payload:
                user_scopes = payload.get("scopes", [])

                # Проверяем наличие всех требуемых scopes
                missing_scopes = set(required_scopes) - set(user_scopes)
                if missing_scopes:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Insufficient permissions. Missing scopes: {', '.join(missing_scopes)}",
                    )

        return user

    return check_scopes


# === Utility Functions ===


def _validate_user_access(request: Request, user: User, token_payload: dict) -> None:
    """
    Дополнительная валидация доступа пользователя.

    Можно расширить для проверки IP-адресов, времени доступа и т.д.

    Args:
        request: HTTP запрос
        user: Пользователь
        token_payload: Данные из токена

    Raises:
        HTTPException: Если доступ должен быть запрещен
    """
    # Пример: проверка времени создания токена
    issued_at = token_payload.get("iat")
    if issued_at and user.last_login:
        # Если токен создан до последнего входа в систему - он мог быть скомпрометирован
        token_time = issued_at
        login_time = user.last_login.timestamp()

        # Позволяем небольшую разницу во времени (5 минут)
        if token_time < login_time - 300:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token issued before last login. Please re-authenticate.",
            )

    # Дополнительные проверки безопасности можно добавить здесь
    # Например, проверка IP-адреса, User-Agent и т.д.


# === Backward Compatibility ===

# Алиасы для обратной совместимости
get_current_user_dep = get_current_user
get_superuser_dep = get_superuser
