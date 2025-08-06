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
from app.core.exceptions import UserNotFoundError, PermissionDeniedError
from app.core.constants import (
    Permission,
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
)
from app.services import auth0_service, Auth0UserInfo

# OAuth2 scheme for FastAPI docs - set auto_error=True for proper error handling
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.run.api_v1_str}/auth/login",
    scopes={
        # Basic user permissions
        "me": "Read information about the current user",
        "use_api": "Basic API access",
        # Company level permissions
        "view_company_users": "View users in company",
        "manage_company_users": "Manage users in company",
        "view_company_settings": "View company settings",
        "manage_company_settings": "Manage company settings",
        "view_company_analytics": "View company analytics",
        # Project permissions
        "view_project": "View projects information",
        "create_project": "Create new projects",
        "manage_project": "Manage projects",
        "delete_project": "Delete projects",
        "view_project_analytics": "View project analytics",
        # Requirements permissions
        "view_requirement": "View requirements information",
        "create_requirement": "Create new requirements",
        "edit_requirement": "Edit requirements",
        "delete_requirement": "Delete requirements",
        "approve_requirement": "Approve requirements",
        "export_requirements": "Export requirements",
        # Release permissions
        "view_release": "View releases information",
        "create_release": "Create new releases",
        "manage_release": "Manage releases",
        "delete_release": "Delete releases",
        "publish_release": "Publish releases",
        "deploy_release": "Deploy releases",
        # Testing permissions
        "view_test_results": "View testing information",
        "create_test": "Create tests",
        "execute_test": "Execute tests",
        "manage_test_plans": "Manage test plans",
        # Admin permissions
        "manage_company": "Manage company",
        "manage_system": "System administration operations",
        "view_reports": "View reports",
        "create_reports": "Create reports",
        "export_reports": "Export reports",
        # Documentation permissions
        "view_specification": "View specifications",
        "create_specification": "Create specifications",
        "edit_specification": "Edit specifications",
        # Comment permissions
        "create_comment": "Create comments",
        "edit_comment": "Edit comments",
        "moderate_comments": "Moderate comments",
    },
    auto_error=True,  # Enable proper error handling
)

# Simplified HTTPBearer for cases where OAuth2 doesn't work
security = HTTPBearer(auto_error=False)


# === Enhanced Role System Utilities ===


def check_user_permission(
    user: User,
    permission: Permission,
    company_id: Optional[int] = None,
    department_id: Optional[int] = None,
    team_id: Optional[int] = None,
    project_id: Optional[int] = None,
) -> bool:
    """
    Проверить, есть ли у пользователя указанное разрешение в заданном контексте.

    Args:
        user: Пользователь
        permission: Требуемое разрешение
        company_id: ID компании (опционально)
        department_id: ID департамента (опционально)
        team_id: ID команды (опционально)
        project_id: ID проекта (опционально)

    Returns:
        bool: True если разрешение есть, False иначе
    """
    # Системные админы имеют все права
    if user.is_system_admin:
        return True

    # Если указана компания - проверяем права в компании
    if company_id:
        return user.has_permission_in_company(permission, company_id)

    # Проверяем права в основной компании пользователя
    if user.company_id:
        return user.has_permission_in_company(permission, user.company_id)

    return False


def require_permission(permission: Permission) -> callable:
    """
    Декоратор для создания dependency, требующего определенное разрешение.

    Args:
        permission: Требуемое разрешение

    Returns:
        callable: Dependency функция
    """

    async def permission_dependency(
        current_user: User = Security(get_current_user, scopes=[permission.value]),
    ) -> User:
        if not check_user_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission.value}' required",
            )
        return current_user

    return permission_dependency


def require_company_permission(permission: Permission) -> callable:
    """
    Декоратор для создания dependency, требующего разрешение в контексте компании.

    Args:
        permission: Требуемое разрешение

    Returns:
        callable: Dependency функция
    """

    async def company_permission_dependency(
        company_id: int,
        current_user: User = Security(get_current_user, scopes=[permission.value]),
    ) -> User:
        if not check_user_permission(current_user, permission, company_id=company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission.value}' required in company {company_id}",
            )
        return current_user

    return company_permission_dependency


def require_system_role(system_role: SystemRole) -> callable:
    """
    Декоратор для создания dependency, требующего системную роль.

    Args:
        system_role: Требуемая системная роль

    Returns:
        callable: Dependency функция
    """

    async def system_role_dependency(
        current_user: User = Security(get_current_user, scopes=["manage_system"]),
    ) -> User:
        if not current_user.is_system_admin and not current_user.has_system_role(
            system_role
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"System role '{system_role.value}' required",
            )
        return current_user

    return system_role_dependency


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


async def get_user_from_auth0_token(
    token: str,
    db: AsyncSession,
) -> Optional[User]:
    """
    Получает пользователя из Auth0 токена.

    Args:
        token: Auth0 JWT токен
        db: Database session

    Returns:
        User объект или None если токен невалидный
    """
    if not auth0_service.is_enabled:
        return None

    # Валидируем токен и получаем информацию о пользователе
    user_info = auth0_service.get_user_info(token)
    if not user_info:
        return None

    # Ищем пользователя в локальной базе данных по Auth0 ID
    user = await crud_user.get_by_auth0_id(db, auth0_id=user_info.sub)

    # Если пользователь не найден, создаем нового
    if not user and user_info.email:
        # Проверяем, есть ли пользователь с таким email
        existing_user = await crud_user.get_by_email(db, email=user_info.email)

        if existing_user:
            # Обновляем существующего пользователя Auth0 ID
            user = await crud_user.update(
                db, db_obj=existing_user, obj_in={"auth0_id": user_info.sub}
            )
        else:
            # Создаем нового пользователя
            from app.schemas.user import UserCreate

            user_data = UserCreate(
                email=user_info.email,
                name=user_info.name or user_info.email.split("@")[0],
                username=user_info.nickname or user_info.email.split("@")[0],
                password="",  # Пароль не нужен для Auth0 пользователей
                is_active=True,
                auth0_id=user_info.sub,
            )
            user = await crud_user.create(db, obj_in=user_data)

    return user


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

    # Попытка аутентификации через Auth0 (если включен)
    user = None
    token_scopes = []

    if auth0_service.is_enabled:
        user = await get_user_from_auth0_token(token, db)
        if user:
            # Для Auth0 пользователей используем базовые права
            token_scopes = ["me", "projects:read", "requirements:read", "releases:read"]

    # Если Auth0 не дал результата, пробуем обычную JWT аутентификацию
    if not user:
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


# === Permission-based Dependencies (Enhanced Role System) ===


async def get_users_read_user(
    current_user: User = Security(get_current_user, scopes=["view_company_users"]),
) -> User:
    """Пользователь с правами чтения пользователей."""
    if not check_user_permission(current_user, Permission.VIEW_COMPANY_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view company users required",
        )
    return current_user


async def get_users_write_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"]),
) -> User:
    """Пользователь с правами записи пользователей."""
    if not check_user_permission(current_user, Permission.MANAGE_COMPANY_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage company users required",
        )
    return current_user


async def get_users_delete_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"]),
) -> User:
    """Пользователь с правами удаления пользователей."""
    if not check_user_permission(current_user, Permission.REMOVE_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to remove users required",
        )
    return current_user


async def get_projects_read_user(
    current_user: User = Security(get_current_user, scopes=["view_project"]),
) -> User:
    """Пользователь с правами чтения проектов."""
    if not check_user_permission(current_user, Permission.VIEW_PROJECT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view projects required",
        )
    return current_user


async def get_projects_write_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами записи проектов."""
    if not check_user_permission(current_user, Permission.MANAGE_PROJECT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage projects required",
        )
    return current_user


async def get_projects_delete_user(
    current_user: User = Security(get_current_user, scopes=["delete_project"]),
) -> User:
    """Пользователь с правами удаления проектов."""
    if not check_user_permission(current_user, Permission.DELETE_PROJECT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete projects required",
        )
    return current_user


async def get_requirements_read_user(
    current_user: User = Security(get_current_user, scopes=["view_requirement"]),
) -> User:
    """Пользователь с правами чтения требований."""
    if not check_user_permission(current_user, Permission.VIEW_REQUIREMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view requirements required",
        )
    return current_user


async def get_requirements_write_user(
    current_user: User = Security(get_current_user, scopes=["edit_requirement"]),
) -> User:
    """Пользователь с правами записи требований."""
    if not check_user_permission(current_user, Permission.EDIT_REQUIREMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to edit requirements required",
        )
    return current_user


async def get_requirements_delete_user(
    current_user: User = Security(get_current_user, scopes=["delete_requirement"]),
) -> User:
    """Пользователь с правами удаления требований."""
    if not check_user_permission(current_user, Permission.DELETE_REQUIREMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete requirements required",
        )
    return current_user


async def get_releases_read_user(
    current_user: User = Security(get_current_user, scopes=["view_release"]),
) -> User:
    """Пользователь с правами чтения релизов."""
    if not check_user_permission(current_user, Permission.VIEW_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view releases required",
        )
    return current_user


async def get_releases_write_user(
    current_user: User = Security(get_current_user, scopes=["manage_release"]),
) -> User:
    """Пользователь с правами записи релизов."""
    if not check_user_permission(current_user, Permission.MANAGE_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage releases required",
        )
    return current_user


async def get_releases_delete_user(
    current_user: User = Security(get_current_user, scopes=["delete_release"]),
) -> User:
    """Пользователь с правами удаления релизов."""
    if not check_user_permission(current_user, Permission.DELETE_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete releases required",
        )
    return current_user


async def get_testing_read_user(
    current_user: User = Security(get_current_user, scopes=["view_test_results"]),
) -> User:
    """Пользователь с правами чтения тестирования."""
    if not check_user_permission(current_user, Permission.VIEW_TEST_RESULTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view test results required",
        )
    return current_user


async def get_testing_write_user(
    current_user: User = Security(get_current_user, scopes=["create_test"]),
) -> User:
    """Пользователь с правами записи тестирования."""
    if not check_user_permission(current_user, Permission.CREATE_TEST):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create tests required",
        )
    return current_user


async def get_testing_execute_user(
    current_user: User = Security(get_current_user, scopes=["execute_test"]),
) -> User:
    """Пользователь с правами выполнения тестов."""
    if not check_user_permission(current_user, Permission.EXECUTE_TEST):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to execute tests required",
        )
    return current_user


async def get_admin_read_user(
    current_user: User = Security(get_current_user, scopes=["view_company_settings"]),
) -> User:
    """Пользователь с правами чтения админских данных."""
    if not check_user_permission(current_user, Permission.VIEW_COMPANY_SETTINGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view company settings required",
        )
    return current_user


async def get_admin_write_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами записи админских данных."""
    if not check_user_permission(current_user, Permission.MANAGE_COMPANY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage company required",
        )
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
    # Базовый доступ для всех активных пользователей
    return current_user


async def get_dashboard_admin_user(
    current_user: User = Security(get_current_user, scopes=["view_company_analytics"]),
) -> User:
    """
    Зависимость для доступа к административным данным дашборда.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Пользователь с правами на чтение админ данных
    """
    if not check_user_permission(current_user, Permission.VIEW_COMPANY_ANALYTICS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view company analytics required",
        )
    return current_user


async def get_stats_read_user(
    current_user: User = Security(get_current_user, scopes=["view_project"]),
) -> User:
    """
    Зависимость для чтения статистических данных.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Пользователь с правами на чтение статистики
    """
    if not check_user_permission(current_user, Permission.VIEW_PROJECT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view project statistics required",
        )
    return current_user


async def get_export_user(
    current_user: User = Security(get_current_user, scopes=["export_reports"]),
) -> User:
    """
    Зависимость для экспорта данных.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Пользователь с правами на экспорт данных
    """
    if not check_user_permission(current_user, Permission.EXPORT_REPORTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to export reports required",
        )
    return current_user


# === Improved Admin User Validation ===


async def get_admin_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
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
    # Проверка через Enhanced Role System
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.MANAGE_COMPANY)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required for this operation",
        )
    return current_user


async def get_product_manager_user(
    current_user: User = Security(
        get_current_user, scopes=["edit_requirement", "manage_project"]
    ),
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
    # Проверяем права на управление требованиями и проектами
    has_requirement_rights = check_user_permission(
        current_user, Permission.EDIT_REQUIREMENT
    )
    has_project_rights = check_user_permission(current_user, Permission.MANAGE_PROJECT)

    if not (
        current_user.is_system_admin or (has_requirement_rights and has_project_rights)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Product Manager permissions required.",
        )
    return current_user


async def get_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
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
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.MANAGE_PROJECT)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager permissions required.",
        )
    return current_user


async def get_senior_developer_user(
    current_user: User = Security(get_current_user, scopes=["manage_release"]),
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
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.MANAGE_RELEASE)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Senior Developer permissions required.",
        )
    return current_user


async def get_analyst_user(
    current_user: User = Security(get_current_user, scopes=["view_requirement"]),
) -> User:
    """
    Зависимость для аналитиков и выше.

    Аналитики имеют права чтения требований и проектов согласно ТЗ.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Пользователь с ролью аналитика или выше

    Raises:
        HTTPException: Если у пользователя недостаточно прав
    """
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.VIEW_REQUIREMENT)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Analyst permissions required.",
        )
    return current_user


async def get_developer_user(
    current_user: User = Security(get_current_user, scopes=["view_release"]),
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
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.VIEW_RELEASE)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer permissions required.",
        )
    return current_user


async def get_tester_user(
    current_user: User = Security(get_current_user, scopes=["execute_test"]),
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
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.EXECUTE_TEST)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Tester permissions required.",
        )
    return current_user


async def get_spec_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_specification"]),
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
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.CREATE_SPECIFICATION)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Permission to create specifications required.",
        )
    return current_user


async def get_release_manager_user(
    current_user: User = Security(get_current_user, scopes=["publish_release"]),
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
    if not (
        current_user.is_system_admin
        or check_user_permission(current_user, Permission.PUBLISH_RELEASE)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Permission to publish releases required.",
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


# === Helper Functions ===


async def get_user_by_id_or_404(db: AsyncSession, user_id: int) -> User:
    """
    Получить пользователя по ID или вернуть 404 ошибку.

    Args:
        db: Сессия базы данных
        user_id: ID пользователя

    Returns:
        User: Объект пользователя

    Raises:
        UserNotFoundError: Если пользователь не найден
    """
    user = await crud_user.get(db, id=user_id)
    if user is None:
        raise UserNotFoundError(user_id)
    return user


async def get_user_by_email_or_404(db: AsyncSession, email: str) -> User:
    """
    Получить пользователя по email или вернуть 404 ошибку.

    Args:
        db: Сессия базы данных
        email: Email пользователя

    Returns:
        User: Объект пользователя

    Raises:
        UserNotFoundError: Если пользователь не найден
    """
    user = await crud_user.get_by_email(db, email=email)
    if user is None:
        raise UserNotFoundError(email)
    return user


async def get_user_by_username_or_404(db: AsyncSession, username: str) -> User:
    """
    Получить пользователя по username или вернуть 404 ошибку.

    Args:
        db: Сессия базы данных
        username: Имя пользователя

    Returns:
        User: Объект пользователя

    Raises:
        UserNotFoundError: Если пользователь не найден
    """
    user = await crud_user.get_by_username(db, username=username)
    if user is None:
        raise UserNotFoundError(username)
    return user


# === Complete Permission-based Dependencies for Enhanced Role System ===
# Автоматически генерируем dependency функции для всех Permission


# =============================================================================
# Системные разрешения
# =============================================================================


async def get_system_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами управления системой."""
    if not check_user_permission(current_user, Permission.MANAGE_SYSTEM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage system required",
        )
    return current_user


async def get_all_companies_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами управления всеми компаниями."""
    if not check_user_permission(current_user, Permission.MANAGE_ALL_COMPANIES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage all companies required",
        )
    return current_user


async def get_system_logs_viewer_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами просмотра системных логов."""
    if not check_user_permission(current_user, Permission.VIEW_SYSTEM_LOGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view system logs required",
        )
    return current_user


async def get_system_settings_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами управления системными настройками."""
    if not check_user_permission(current_user, Permission.MANAGE_SYSTEM_SETTINGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage system settings required",
        )
    return current_user


async def get_global_billing_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами управления глобальным биллингом."""
    if not check_user_permission(current_user, Permission.MANAGE_GLOBAL_BILLING):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage global billing required",
        )
    return current_user


async def get_system_auditor_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами аудита системы."""
    if not check_user_permission(current_user, Permission.AUDIT_SYSTEM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to audit system required",
        )
    return current_user


async def get_security_policies_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_system"]),
) -> User:
    """Пользователь с правами управления политиками безопасности."""
    if not check_user_permission(current_user, Permission.MANAGE_SECURITY_POLICIES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage security policies required",
        )
    return current_user


# =============================================================================
# Компанийные разрешения
# =============================================================================


async def get_company_settings_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_settings"]),
) -> User:
    """Пользователь с правами просмотра настроек компании."""
    if not check_user_permission(current_user, Permission.VIEW_COMPANY_SETTINGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view company settings required",
        )
    return current_user


async def get_company_settings_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_settings"]),
) -> User:
    """Пользователь с правами управления настройками компании."""
    if not check_user_permission(current_user, Permission.MANAGE_COMPANY_SETTINGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage company settings required",
        )
    return current_user


async def get_user_inviter_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"]),
) -> User:
    """Пользователь с правами приглашения пользователей."""
    if not check_user_permission(current_user, Permission.INVITE_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to invite users required",
        )
    return current_user


async def get_user_remover_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"]),
) -> User:
    """Пользователь с правами удаления пользователей."""
    if not check_user_permission(current_user, Permission.REMOVE_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to remove users required",
        )
    return current_user


async def get_company_billing_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами управления биллингом компании."""
    if not check_user_permission(current_user, Permission.MANAGE_COMPANY_BILLING):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage company billing required",
        )
    return current_user


async def get_company_billing_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_analytics"]),
) -> User:
    """Пользователь с правами просмотра биллинга компании."""
    if not check_user_permission(current_user, Permission.VIEW_COMPANY_BILLING):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view company billing required",
        )
    return current_user


async def get_company_subscription_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами управления подпиской компании."""
    if not check_user_permission(current_user, Permission.MANAGE_COMPANY_SUBSCRIPTION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage company subscription required",
        )
    return current_user


async def get_company_data_exporter_user(
    current_user: User = Security(get_current_user, scopes=["export_reports"]),
) -> User:
    """Пользователь с правами экспорта данных компании."""
    if not check_user_permission(current_user, Permission.EXPORT_COMPANY_DATA):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to export company data required",
        )
    return current_user


# =============================================================================
# Департаментские разрешения
# =============================================================================


async def get_department_creator_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами создания департаментов."""
    if not check_user_permission(current_user, Permission.CREATE_DEPARTMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create department required",
        )
    return current_user


async def get_department_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами управления департаментом."""
    if not check_user_permission(current_user, Permission.MANAGE_DEPARTMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage department required",
        )
    return current_user


async def get_department_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_settings"]),
) -> User:
    """Пользователь с правами просмотра департамента."""
    if not check_user_permission(current_user, Permission.VIEW_DEPARTMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view department required",
        )
    return current_user


async def get_department_deleter_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами удаления департамента."""
    if not check_user_permission(current_user, Permission.DELETE_DEPARTMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete department required",
        )
    return current_user


async def get_department_users_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"]),
) -> User:
    """Пользователь с правами управления пользователями департамента."""
    if not check_user_permission(current_user, Permission.MANAGE_DEPARTMENT_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage department users required",
        )
    return current_user


async def get_department_users_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_users"]),
) -> User:
    """Пользователь с правами просмотра пользователей департамента."""
    if not check_user_permission(current_user, Permission.VIEW_DEPARTMENT_USERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view department users required",
        )
    return current_user


async def get_department_budget_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами управления бюджетом департамента."""
    if not check_user_permission(current_user, Permission.MANAGE_DEPARTMENT_BUDGET):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage department budget required",
        )
    return current_user


async def get_department_analytics_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_analytics"]),
) -> User:
    """Пользователь с правами просмотра аналитики департамента."""
    if not check_user_permission(current_user, Permission.VIEW_DEPARTMENT_ANALYTICS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view department analytics required",
        )
    return current_user


# =============================================================================
# Командные разрешения
# =============================================================================


async def get_team_creator_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами создания команд."""
    if not check_user_permission(current_user, Permission.CREATE_TEAM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create team required",
        )
    return current_user


async def get_team_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами управления командой."""
    if not check_user_permission(current_user, Permission.MANAGE_TEAM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage team required",
        )
    return current_user


async def get_team_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_project"]),
) -> User:
    """Пользователь с правами просмотра команды."""
    if not check_user_permission(current_user, Permission.VIEW_TEAM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view team required",
        )
    return current_user


async def get_team_deleter_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами удаления команды."""
    if not check_user_permission(current_user, Permission.DELETE_TEAM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete team required",
        )
    return current_user


async def get_team_members_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами управления участниками команды."""
    if not check_user_permission(current_user, Permission.MANAGE_TEAM_MEMBERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage team members required",
        )
    return current_user


async def get_team_members_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_project"]),
) -> User:
    """Пользователь с правами просмотра участников команды."""
    if not check_user_permission(current_user, Permission.VIEW_TEAM_MEMBERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view team members required",
        )
    return current_user


async def get_team_roles_assigner_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами назначения ролей в команде."""
    if not check_user_permission(current_user, Permission.ASSIGN_TEAM_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to assign team roles required",
        )
    return current_user


async def get_team_performance_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_project_analytics"]),
) -> User:
    """Пользователь с правами просмотра производительности команды."""
    if not check_user_permission(current_user, Permission.VIEW_TEAM_PERFORMANCE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view team performance required",
        )
    return current_user


# =============================================================================
# Проектные разрешения
# =============================================================================


async def get_project_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_project"]),
) -> User:
    """Пользователь с правами создания проектов."""
    if not check_user_permission(current_user, Permission.CREATE_PROJECT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create project required",
        )
    return current_user


async def get_project_archiver_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами архивирования проектов."""
    if not check_user_permission(current_user, Permission.ARCHIVE_PROJECT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to archive project required",
        )
    return current_user


async def get_project_settings_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами управления настройками проекта."""
    if not check_user_permission(current_user, Permission.MANAGE_PROJECT_SETTINGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage project settings required",
        )
    return current_user


async def get_project_members_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами управления участниками проекта."""
    if not check_user_permission(current_user, Permission.MANAGE_PROJECT_MEMBERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage project members required",
        )
    return current_user


async def get_project_members_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_project"]),
) -> User:
    """Пользователь с правами просмотра участников проекта."""
    if not check_user_permission(current_user, Permission.VIEW_PROJECT_MEMBERS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view project members required",
        )
    return current_user


async def get_project_budget_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_project"]),
) -> User:
    """Пользователь с правами управления бюджетом проекта."""
    if not check_user_permission(current_user, Permission.MANAGE_PROJECT_BUDGET):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage project budget required",
        )
    return current_user


async def get_project_analytics_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_project_analytics"]),
) -> User:
    """Пользователь с правами просмотра аналитики проекта."""
    if not check_user_permission(current_user, Permission.VIEW_PROJECT_ANALYTICS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view project analytics required",
        )
    return current_user


# =============================================================================
# Требования
# =============================================================================


async def get_requirement_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_requirement"]),
) -> User:
    """Пользователь с правами создания требований."""
    if not check_user_permission(current_user, Permission.CREATE_REQUIREMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create requirement required",
        )
    return current_user


async def get_requirement_approver_user(
    current_user: User = Security(get_current_user, scopes=["approve_requirement"]),
) -> User:
    """Пользователь с правами утверждения требований."""
    if not check_user_permission(current_user, Permission.APPROVE_REQUIREMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to approve requirement required",
        )
    return current_user


async def get_requirement_rejector_user(
    current_user: User = Security(get_current_user, scopes=["approve_requirement"]),
) -> User:
    """Пользователь с правами отклонения требований."""
    if not check_user_permission(current_user, Permission.REJECT_REQUIREMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to reject requirement required",
        )
    return current_user


async def get_requirements_linker_user(
    current_user: User = Security(get_current_user, scopes=["edit_requirement"]),
) -> User:
    """Пользователь с правами связывания требований."""
    if not check_user_permission(current_user, Permission.LINK_REQUIREMENTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to link requirements required",
        )
    return current_user


async def get_requirement_versions_manager_user(
    current_user: User = Security(get_current_user, scopes=["edit_requirement"]),
) -> User:
    """Пользователь с правами управления версиями требований."""
    if not check_user_permission(current_user, Permission.MANAGE_REQUIREMENT_VERSIONS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage requirement versions required",
        )
    return current_user


async def get_requirements_exporter_user(
    current_user: User = Security(get_current_user, scopes=["export_requirements"]),
) -> User:
    """Пользователь с правами экспорта требований."""
    if not check_user_permission(current_user, Permission.EXPORT_REQUIREMENTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to export requirements required",
        )
    return current_user


async def get_requirements_importer_user(
    current_user: User = Security(get_current_user, scopes=["edit_requirement"]),
) -> User:
    """Пользователь с правами импорта требований."""
    if not check_user_permission(current_user, Permission.IMPORT_REQUIREMENTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to import requirements required",
        )
    return current_user


# =============================================================================
# Релизы
# =============================================================================


async def get_release_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_release"]),
) -> User:
    """Пользователь с правами создания релизов."""
    if not check_user_permission(current_user, Permission.CREATE_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create release required",
        )
    return current_user


async def get_release_publisher_user(
    current_user: User = Security(get_current_user, scopes=["publish_release"]),
) -> User:
    """Пользователь с правами публикации релизов."""
    if not check_user_permission(current_user, Permission.PUBLISH_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to publish release required",
        )
    return current_user


async def get_release_deployer_user(
    current_user: User = Security(get_current_user, scopes=["deploy_release"]),
) -> User:
    """Пользователь с правами развертывания релизов."""
    if not check_user_permission(current_user, Permission.DEPLOY_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to deploy release required",
        )
    return current_user


async def get_release_rollbacker_user(
    current_user: User = Security(get_current_user, scopes=["deploy_release"]),
) -> User:
    """Пользователь с правами отката релизов."""
    if not check_user_permission(current_user, Permission.ROLLBACK_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to rollback release required",
        )
    return current_user


async def get_release_approver_user(
    current_user: User = Security(get_current_user, scopes=["publish_release"]),
) -> User:
    """Пользователь с правами утверждения релизов."""
    if not check_user_permission(current_user, Permission.APPROVE_RELEASE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to approve release required",
        )
    return current_user


# =============================================================================
# Тестирование
# =============================================================================


async def get_test_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_test"]),
) -> User:
    """Пользователь с правами создания тестов."""
    if not check_user_permission(current_user, Permission.CREATE_TEST):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create test required",
        )
    return current_user


async def get_test_plans_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_test_plans"]),
) -> User:
    """Пользователь с правами управления планами тестирования."""
    if not check_user_permission(current_user, Permission.MANAGE_TEST_PLANS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage test plans required",
        )
    return current_user


async def get_test_results_approver_user(
    current_user: User = Security(get_current_user, scopes=["manage_test_plans"]),
) -> User:
    """Пользователь с правами утверждения результатов тестирования."""
    if not check_user_permission(current_user, Permission.APPROVE_TEST_RESULTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to approve test results required",
        )
    return current_user


async def get_test_automation_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_test"]),
) -> User:
    """Пользователь с правами создания автотестов."""
    if not check_user_permission(current_user, Permission.CREATE_TEST_AUTOMATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create test automation required",
        )
    return current_user


async def get_test_environments_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_test_plans"]),
) -> User:
    """Пользователь с правами управления тестовыми средами."""
    if not check_user_permission(current_user, Permission.MANAGE_TEST_ENVIRONMENTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage test environments required",
        )
    return current_user


# =============================================================================
# Документация и спецификации
# =============================================================================


async def get_specification_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_specification"]),
) -> User:
    """Пользователь с правами создания спецификаций."""
    if not check_user_permission(current_user, Permission.CREATE_SPECIFICATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create specification required",
        )
    return current_user


async def get_specification_editor_user(
    current_user: User = Security(get_current_user, scopes=["edit_specification"]),
) -> User:
    """Пользователь с правами редактирования спецификаций."""
    if not check_user_permission(current_user, Permission.EDIT_SPECIFICATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to edit specification required",
        )
    return current_user


async def get_specification_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_specification"]),
) -> User:
    """Пользователь с правами просмотра спецификаций."""
    if not check_user_permission(current_user, Permission.VIEW_SPECIFICATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view specification required",
        )
    return current_user


async def get_specification_deleter_user(
    current_user: User = Security(get_current_user, scopes=["edit_specification"]),
) -> User:
    """Пользователь с правами удаления спецификаций."""
    if not check_user_permission(current_user, Permission.DELETE_SPECIFICATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete specification required",
        )
    return current_user


async def get_specification_approver_user(
    current_user: User = Security(get_current_user, scopes=["edit_specification"]),
) -> User:
    """Пользователь с правами утверждения спецификаций."""
    if not check_user_permission(current_user, Permission.APPROVE_SPECIFICATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to approve specification required",
        )
    return current_user


async def get_documentation_generator_user(
    current_user: User = Security(get_current_user, scopes=["create_specification"]),
) -> User:
    """Пользователь с правами генерации документации."""
    if not check_user_permission(current_user, Permission.GENERATE_DOCUMENTATION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to generate documentation required",
        )
    return current_user


# =============================================================================
# Комментарии и обратная связь
# =============================================================================


async def get_comment_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_comment"]),
) -> User:
    """Пользователь с правами создания комментариев."""
    if not check_user_permission(current_user, Permission.CREATE_COMMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create comment required",
        )
    return current_user


async def get_comment_editor_user(
    current_user: User = Security(get_current_user, scopes=["edit_comment"]),
) -> User:
    """Пользователь с правами редактирования комментариев."""
    if not check_user_permission(current_user, Permission.EDIT_COMMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to edit comment required",
        )
    return current_user


async def get_comment_deleter_user(
    current_user: User = Security(get_current_user, scopes=["edit_comment"]),
) -> User:
    """Пользователь с правами удаления комментариев."""
    if not check_user_permission(current_user, Permission.DELETE_COMMENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to delete comment required",
        )
    return current_user


async def get_comments_moderator_user(
    current_user: User = Security(get_current_user, scopes=["moderate_comments"]),
) -> User:
    """Пользователь с правами модерации комментариев."""
    if not check_user_permission(current_user, Permission.MODERATE_COMMENTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to moderate comments required",
        )
    return current_user


# =============================================================================
# Интеграции и API
# =============================================================================


async def get_api_user(
    current_user: User = Security(get_current_user, scopes=["use_api"]),
) -> User:
    """Пользователь с правами использования API."""
    if not check_user_permission(current_user, Permission.USE_API):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to use API required",
        )
    return current_user


async def get_integrations_manager_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами управления интеграциями."""
    if not check_user_permission(current_user, Permission.MANAGE_INTEGRATIONS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to manage integrations required",
        )
    return current_user


async def get_api_logs_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_analytics"]),
) -> User:
    """Пользователь с правами просмотра логов API."""
    if not check_user_permission(current_user, Permission.VIEW_API_LOGS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view API logs required",
        )
    return current_user


async def get_api_keys_creator_user(
    current_user: User = Security(get_current_user, scopes=["manage_company"]),
) -> User:
    """Пользователь с правами создания API ключей."""
    if not check_user_permission(current_user, Permission.CREATE_API_KEYS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create API keys required",
        )
    return current_user


# =============================================================================
# Отчеты и аналитика
# =============================================================================


async def get_reports_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_reports"]),
) -> User:
    """Пользователь с правами просмотра отчетов."""
    if not check_user_permission(current_user, Permission.VIEW_REPORTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view reports required",
        )
    return current_user


async def get_reports_creator_user(
    current_user: User = Security(get_current_user, scopes=["create_reports"]),
) -> User:
    """Пользователь с правами создания отчетов."""
    if not check_user_permission(current_user, Permission.CREATE_REPORTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to create reports required",
        )
    return current_user


async def get_reports_exporter_user(
    current_user: User = Security(get_current_user, scopes=["export_reports"]),
) -> User:
    """Пользователь с правами экспорта отчетов."""
    if not check_user_permission(current_user, Permission.EXPORT_REPORTS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to export reports required",
        )
    return current_user


async def get_advanced_analytics_viewer_user(
    current_user: User = Security(get_current_user, scopes=["view_company_analytics"]),
) -> User:
    """Пользователь с правами просмотра расширенной аналитики."""
    if not check_user_permission(current_user, Permission.VIEW_ADVANCED_ANALYTICS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to view advanced analytics required",
        )
    return current_user


# =============================================================================
# Алиасы для обратной совместимости и краткие формы
# =============================================================================

# Краткие алиасы для часто используемых dependency
get_project_creator = get_project_creator_user
get_requirement_creator = get_requirement_creator_user
get_release_creator = get_release_creator_user
get_test_creator = get_test_creator_user
get_spec_creator = get_specification_creator_user
get_comment_creator = get_comment_creator_user

# Алиасы для обратной совместимости
get_current_user_dep = get_current_user
get_superuser_dep = get_superuser
