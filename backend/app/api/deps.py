"""
Зависимости для API (Dependency Injection).

Этот модуль содержит все зависимости, используемые в API endpoints,
следуя принципу Dependency Inversion из SOLID и современным практикам безопасности.
"""

from typing import AsyncGenerator, Optional, List
from fastapi import Depends, HTTPException, status, Request, Security
from fastapi.security import (
    OAuth2PasswordBearer,
    HTTPBearer,
    HTTPAuthorizationCredentials,
    SecurityScopes,
)
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, UTC

from app.core.config import settings
from app.core.security import JWTTokenManager, TokenType, get_client_ip
from app.db.db_helper import get_async_session
from app.crud import user as crud_user
from app.models.user import User
from app.utils.logger import logger

# OAuth2 scheme for FastAPI docs - set auto_error=True for proper error handling
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
        "releases:read": "Read releases information",
        "releases:write": "Create and update releases",
        "releases:delete": "Delete releases",
        "testing:read": "Read testing information",
        "testing:write": "Create and update tests",
        "testing:execute": "Execute tests",
        "admin:read": "Read admin information",
        "admin:write": "Admin write operations",
        "system:admin": "System administration operations",
    },
    auto_error=True,  # Enable proper error handling
)

# Simplified HTTPBearer for cases where OAuth2 doesn't work
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
    security_scopes: SecurityScopes,
    request: Request,
    db: AsyncSession = Depends(get_db),
    token: str = Security(oauth2_scheme),
) -> User:
    """
    Simplified dependency for getting current user from access token with scope checking.

    Prioritizes OAuth2PasswordBearer for better FastAPI docs integration.

    Args:
        security_scopes: Required access scopes
        request: HTTP request
        db: Database session
        token: JWT token from OAuth2PasswordBearer

    Returns:
        User: User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    # Verify and decode access token
    payload = JWTTokenManager.verify_token(token, TokenType.ACCESS)
    if payload is None:
        raise credentials_exception

    # Extract data from token
    user_id = payload.get("user_id")
    email = payload.get("sub")
    token_scopes = payload.get("scopes", [])

    if user_id is None or email is None:
        raise credentials_exception

    # Get user from database
    user = await crud_user.get(db, id=user_id)
    if user is None:
        raise credentials_exception

    # Additional email verification for security
    if user.email != email:
        raise credentials_exception

    # Check user activity
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )

    # Check scopes
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )

    return user


async def get_current_user_fallback(
    security_scopes: SecurityScopes,
    request: Request,
    oauth2_token: Optional[str] = Depends(oauth2_scheme),
    bearer_token: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Fallback dependency with dual authentication support for problematic endpoints.
    Use this only when oauth2_scheme causes issues.
    """
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    # Get token from any source
    token_str = None
    if oauth2_token:
        token_str = oauth2_token
    elif bearer_token:
        token_str = bearer_token.credentials

    # Check token presence
    if not token_str:
        raise credentials_exception

    # Verify and decode access token
    payload = JWTTokenManager.verify_token(token_str, TokenType.ACCESS)
    if payload is None:
        raise credentials_exception

    # Extract data from token
    user_id = payload.get("user_id")
    email = payload.get("sub")
    token_scopes = payload.get("scopes", [])

    if user_id is None or email is None:
        raise credentials_exception

    # Get user from database
    user = await crud_user.get(db, id=user_id)
    if user is None:
        raise credentials_exception

    # Additional email verification for security
    if user.email != email:
        raise credentials_exception

    # Check user activity
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )

    # Check scopes
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )

    return user


async def get_current_active_user(
    current_user: User = Security(get_current_user, scopes=["me"]),
) -> User:
    """
    Зависимость для получения текущего активного пользователя.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Объект активного пользователя
    """
    return current_user


async def get_superuser(
    current_user: User = Security(get_current_user, scopes=["system:admin"]),
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
            detail="Superuser privileges required",
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
        # Создаем пустой SecurityScopes для вызова get_current_user_fallback
        security_scopes = SecurityScopes()
        return await get_current_user_fallback(
            security_scopes, request, oauth2_token, bearer_token, db
        )
    except HTTPException:
        return None


# === Scope-based Dependencies ===


async def get_users_read_user(
    current_user: User = Security(get_current_user, scopes=["users:read"]),
) -> User:
    """Пользователь с правами чтения пользователей."""
    return current_user


async def get_users_write_user(
    current_user: User = Security(get_current_user, scopes=["users:write"]),
) -> User:
    """Пользователь с правами записи пользователей."""
    return current_user


async def get_users_delete_user(
    current_user: User = Security(get_current_user, scopes=["users:delete"]),
) -> User:
    """Пользователь с правами удаления пользователей."""
    return current_user


async def get_projects_read_user(
    current_user: User = Security(get_current_user, scopes=["projects:read"]),
) -> User:
    """Пользователь с правами чтения проектов."""
    return current_user


async def get_projects_write_user(
    current_user: User = Security(get_current_user, scopes=["projects:write"]),
) -> User:
    """Пользователь с правами записи проектов."""
    return current_user


async def get_projects_delete_user(
    current_user: User = Security(get_current_user, scopes=["projects:delete"]),
) -> User:
    """Пользователь с правами удаления проектов."""
    return current_user


async def get_requirements_read_user(
    current_user: User = Security(get_current_user, scopes=["requirements:read"]),
) -> User:
    """Пользователь с правами чтения требований."""
    return current_user


async def get_requirements_write_user(
    current_user: User = Security(get_current_user, scopes=["requirements:write"]),
) -> User:
    """Пользователь с правами записи требований."""
    return current_user


async def get_requirements_delete_user(
    current_user: User = Security(get_current_user, scopes=["requirements:delete"]),
) -> User:
    """Пользователь с правами удаления требований."""
    return current_user


async def get_releases_read_user(
    current_user: User = Security(get_current_user, scopes=["releases:read"]),
) -> User:
    """Пользователь с правами чтения релизов."""
    return current_user


async def get_releases_write_user(
    current_user: User = Security(get_current_user, scopes=["releases:write"]),
) -> User:
    """Пользователь с правами записи релизов."""
    return current_user


async def get_releases_delete_user(
    current_user: User = Security(get_current_user, scopes=["releases:delete"]),
) -> User:
    """Пользователь с правами удаления релизов."""
    return current_user


async def get_testing_read_user(
    current_user: User = Security(get_current_user, scopes=["testing:read"]),
) -> User:
    """Пользователь с правами чтения тестирования."""
    return current_user


async def get_testing_write_user(
    current_user: User = Security(get_current_user, scopes=["testing:write"]),
) -> User:
    """Пользователь с правами записи тестирования."""
    return current_user


async def get_testing_execute_user(
    current_user: User = Security(get_current_user, scopes=["testing:execute"]),
) -> User:
    """Пользователь с правами выполнения тестов."""
    return current_user


async def get_admin_read_user(
    current_user: User = Security(get_current_user, scopes=["admin:read"]),
) -> User:
    """Пользователь с правами чтения админских данных."""
    return current_user


async def get_admin_write_user(
    current_user: User = Security(get_current_user, scopes=["admin:write"]),
) -> User:
    """Пользователь с правами записи админских данных."""
    return current_user


# === Additional Permission-Based Dependencies ===


async def get_dashboard_read_user(
    current_user: User = Security(get_current_user, scopes=["me"]),
) -> User:
    """
    Зависимость для чтения данных дашборда.
    Базовый доступ для всех авторизованных пользователей.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с правами на чтение дашборда
    """
    return current_user


async def get_dashboard_admin_user(
    current_user: User = Security(get_current_user, scopes=["admin:read"]),
) -> User:
    """
    Зависимость для доступа к административным данным дашборда.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с правами на чтение админ данных
    """
    return current_user


async def get_stats_read_user(
    current_user: User = Security(get_current_user, scopes=["projects:read"]),
) -> User:
    """
    Зависимость для чтения статистических данных.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с правами на чтение статистики
    """
    return current_user


async def get_export_user(
    current_user: User = Security(get_current_user, scopes=["admin:read"]),
) -> User:
    """
    Зависимость для экспорта данных.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с правами на экспорт данных
    """
    return current_user


# === Improved Admin User Validation ===


async def get_admin_user(
    current_user: User = Security(get_current_user, scopes=["admin:write"]),
) -> User:
    """
    Зависимость для проверки прав администратора с записью.
    
    Args:
        current_user: Текущий активный пользователь
        
    Returns:
        User: Объект пользователя с правами администратора
        
    Raises:
        HTTPException: Если пользователь не является администратором
    """
    # Дополнительная проверка роли для критических операций
    if not (current_user.is_superuser or current_user.role in ["admin", "manager"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required for this operation",
        )
    return current_user


async def get_product_manager_user(
    current_user: User = Security(get_current_user, scopes=["requirements:write", "projects:write"]),
) -> User:
    """
    Зависимость для продуктовых менеджеров и выше.
    
    Продуктовые менеджеры управляют требованиями, проектами и релизами согласно ТЗ.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с ролью продуктового менеджера или выше
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["product_manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Product Manager role or higher required.",
        )
    return current_user


async def get_manager_user(
    current_user: User = Security(get_current_user, scopes=["projects:write"]),
) -> User:
    """
    Зависимость для менеджеров и выше.
    
    Менеджеры управляют проектами и требованиями.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с ролью менеджера или выше
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["manager", "product_manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager role or higher required.",
        )
    return current_user


async def get_senior_developer_user(
    current_user: User = Security(get_current_user, scopes=["releases:write"]),
) -> User:
    """
    Зависимость для старших разработчиков и выше.
    
    Старшие разработчики имеют расширенные права по работе с релизами.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с ролью старшего разработчика или выше
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["senior_developer", "product_manager", "manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Senior Developer role or higher required.",
        )
    return current_user


async def get_analyst_user(
    current_user: User = Security(get_current_user, scopes=["me"]),
) -> User:
    """
    Зависимость для аналитиков и выше.
    
    Аналитики имеют только права чтения согласно ТЗ.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с ролью аналитика или выше
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["analyst", "developer", "senior_developer", "tester", "product_manager", "manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Analyst role or higher required.",
        )
    return current_user


async def get_developer_user(
    current_user: User = Security(get_current_user, scopes=["releases:write"]),
) -> User:
    """
    Зависимость для разработчиков и выше.
    
    Разработчики работают с релизами и читают требования.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с ролью разработчика или выше
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["developer", "senior_developer", "product_manager", "manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer role or higher required.",
        )
    return current_user


async def get_tester_user(
    current_user: User = Security(get_current_user, scopes=["testing:write"]),
) -> User:
    """
    Зависимость для тестировщиков и выше.
    
    Тестировщики выполняют тестирование и читают требования.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с ролью тестировщика или выше
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["tester", "developer", "senior_developer", "product_manager", "manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Tester role or higher required.",
        )
    return current_user


async def get_spec_creator_user(
    current_user: User = Security(get_current_user, scopes=["projects:write"]),
) -> User:
    """
    Зависимость для создания спецификаций.
    
    Создавать спецификации могут аналитики и выше.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с правами создания спецификаций
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["analyst", "manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Analyst role or higher required to create specifications.",
        )
    return current_user


async def get_release_manager_user(
    current_user: User = Security(get_current_user, scopes=["releases:write"]),
) -> User:
    """
    Зависимость для управления релизами.
    
    Управлять релизами могут менеджеры и выше.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        User: Пользователь с правами управления релизами
        
    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    allowed_roles = ["manager", "admin"]
    if not (current_user.is_superuser or current_user.role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager role or higher required for release management.",
        )
    return current_user


# === Utility Functions ===


def _validate_user_access(request: Request, user: User, token_payload: dict) -> None:
    """
    Дополнительная валидация доступа пользователя.

    Args:
        request: HTTP запрос
        user: Пользователь
        token_payload: Данные JWT токена

    Raises:
        HTTPException: Если доступ должен быть ограничен
    """
    # Проверка активности пользователя
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Проверка валидности токена по времени
    current_time = datetime.now(UTC).timestamp()
    token_exp = token_payload.get("exp")
    if token_exp and current_time > token_exp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )

    # Проверка соответствия пользователя в токене
    token_user_id = token_payload.get("sub")
    if token_user_id and str(user.id) != str(token_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token user mismatch",
        )

    # Проверка User-Agent для базовой защиты от автоматизированных атак
    user_agent = request.headers.get("User-Agent", "")
    if not user_agent or len(user_agent) < 10:
        logger.warning(
            f"Suspicious request without proper User-Agent from user {user.id}"
        )

    # Проверка на подозрительную активность
    # В продакшене можно добавить проверку IP адреса, геолокации, частоты запросов
    client_ip = request.client.host if request.client else "unknown"
    if client_ip and client_ip != "127.0.0.1" and client_ip != "localhost":
        # Базовая проверка на подозрительные IP (можно расширить)
        suspicious_patterns = ["192.168.", "10.", "172."]
        if not any(pattern in client_ip for pattern in suspicious_patterns):
            logger.info(f"External access from IP {client_ip} for user {user.id}")

    # Проверка времени последней активности (если доступно в модели)
    if hasattr(user, "last_login") and user.last_login:
        time_since_last_login = datetime.now(UTC) - user.last_login
        if time_since_last_login.days > 90:  # 90 дней без активности
            logger.warning(
                f"User {user.id} accessed after {time_since_last_login.days} days of inactivity"
            )

    # Проверка scopes из токена
    token_scopes = token_payload.get("scopes", [])
    if isinstance(token_scopes, str):
        token_scopes = token_scopes.split(" ")

    # Логирование успешной валидации для аудита
    logger.debug(
        f"User {user.id} ({user.username}) validated successfully with scopes: {token_scopes}"
    )


# === Backward Compatibility ===

# Алиасы для обратной совместимости
get_current_user_dep = get_current_user
get_superuser_dep = get_superuser
