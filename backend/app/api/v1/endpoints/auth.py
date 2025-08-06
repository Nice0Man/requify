"""
Эндпоинты для аутентификации.

Модуль содержит эндпоинты для входа в систему, получения токенов доступа,
обновления токенов, управления сессиями и выхода из системы.
Следует принципам SOLID и современным практикам безопасности.
"""

from datetime import datetime, timedelta, UTC
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession


from app.api.dependencies import (
    get_db,
    get_current_user,
    get_current_active_user,
    get_optional_user,
    get_user_from_auth0_token,
    get_admin_write_user,
    SessionDep,
    UserPermissions,
    PermissionDependencyFactory,
    ValidationDependencies,
)
from app.services import (
    auth0_service,
    authentication_service,
    token_service,
    user_registration_service,
    password_service,
    session_service,
    AuthenticationError,
    InvalidCredentialsError,
    InactiveUserError,
    TokenValidationError,
)
from app.core.config import settings
from app.core.security import (
    JWTTokenManager,
    PasswordManager,
    verify_password,
    get_client_ip,
    get_user_agent,
    TokenType,
)
from app.crud import user as crud_user, crud_refresh_token
from app.models.user import User
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.services import email_service
from app.utils.logger import logger
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutRequest,
    LogoutResponse,
    PasswordChangeRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    TokenValidationRequest,
    TokenValidationResponse,
    SessionListResponse,
    RevokeSessionRequest,
    ActiveSession,
    AuthError,
    EmailVerificationRequest,
    EmailVerificationConfirm,
    EmailVerificationResponse,
)
from app.schemas import (
    UserCreate,
    UserDetailed,
    UserWithProfile,
    User,
    UserInDB,
    UserProfileResponse,
    UserProfileCreate,
)
from app.core.constants import CompanyRole, Permission, ProjectRole, SystemRole, RoleScope

router = APIRouter()


# === Error Handling Classes (imported from services) ===


class PermissionDeniedError(HTTPException):
    """Raised when user lacks required permissions."""

    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


# === Services are now imported from app.services ===


# === Authentication Endpoints ===


@router.post(
    "/register", response_model=UserWithProfile, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user_in: UserCreate,
    db: SessionDep,
) -> Any:
    """
    Регистрация нового пользователя.

    Применяет принципы SOLID:
    - Single Responsibility: каждый сервис отвечает за свою область
    - Open/Closed: легко расширяется новой логикой
    - Dependency Inversion: зависит от абстракций, а не реализаций

    Args:
        user_in: Данные нового пользователя
        db: Сессия базы данных

    Returns:
        UserWithProfile: Пользователь с профилем

    Raises:
        HTTPException: Если пользователь с таким email или username уже существует
    """
    try:
        # Валидация уникальности (Single Responsibility)
        await user_registration_service.validate_unique_user(db, user_in)

        # Создание пользователя с профилем (Single Responsibility)
        user = await user_registration_service.create_user_with_profile(db, user_in)

        # Отправка email верификации (Single Responsibility)
        await user_registration_service.send_verification_email(user)

        # Возвращаем пользователя с профилем
        return UserWithProfile.model_validate(user)

    except HTTPException:
        # Re-raise HTTP exceptions (уже правильно сформированы)
        raise
    except Exception as e:
        logger.error(f"Unexpected error during user registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to internal error",
        )


@router.post("/login", response_model=LoginResponse)
async def login_for_access_token(
    request: Request,
    db: SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 совместимый эндпоинт для получения токенов доступа.

    Реализует принципы SOLID:
    - Single Responsibility: аутентификация разделена на отдельные сервисы
    - Open/Closed: легко добавить новые методы аутентификации
    - Liskov Substitution: можно заменить сервисы на другие реализации
    - Interface Segregation: каждый сервис имеет четкий интерфейс
    - Dependency Inversion: зависит от абстракций сервисов

    Args:
        request: HTTP запрос
        db: Сессия базы данных
        form_data: Данные формы с username и password

    Returns:
        LoginResponse: Токены доступа и информация о пользователе

    Raises:
        HTTPException: Если учетные данные неверны или пользователь неактивен
    """
    try:
        # Аутентификация пользователя (Single Responsibility)
        user = await authentication_service.authenticate_user(
            db, form_data.username, form_data.password
        )

        # Создание токенов (Single Responsibility)
        tokens = await authentication_service.create_user_tokens(db, user, request)

        # Обновление времени последнего входа (Single Responsibility)
        await authentication_service.update_last_login(db, user)

        # Формирование ответа
        return LoginResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_in=tokens["expires_in"],
            refresh_expires_in=tokens["refresh_expires_in"],
            user=UserDetailed.model_validate(user),
        )

    except (InvalidCredentialsError, InactiveUserError, AuthenticationError):
        # Re-raise authentication errors (уже правильно сформированы)
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to internal error",
        )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    request: Request,
    refresh_request: RefreshTokenRequest,
    db: SessionDep,
) -> Any:
    """
    Обновить access токен используя refresh токен.

    Args:
        request: HTTP запрос
        refresh_request: Запрос с refresh токеном
        db: Сессия базы данных

    Returns:
        RefreshTokenResponse: Новые токены

    Raises:
        HTTPException: Если refresh токен недействителен
    """
    # Валидируем refresh токен и получаем пользователя
    user, refresh_token_record = await token_service.validate_refresh_token(
        db, refresh_request.refresh_token
    )

    # Создаем новые токены
    response_data = await token_service.refresh_access_token(
        db, user, refresh_token_record, request
    )

    return RefreshTokenResponse(**response_data)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    logout_request: LogoutRequest,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Выйти из системы и отозвать токены.

    Args:
        logout_request: Запрос выхода
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        LogoutResponse: Результат операции
    """
    if logout_request.logout_all:
        # Отзываем все токены пользователя
        revoked_count = await token_service.revoke_user_tokens(
            db, current_user.id, reason="logout_all"
        )
    elif logout_request.refresh_token:
        # Отзываем конкретный токен
        payload = JWTTokenManager.verify_token(
            logout_request.refresh_token, TokenType.REFRESH
        )
        if payload:
            token_id = payload.get("token_id")
            revoked_count = await token_service.revoke_user_tokens(
                db, current_user.id, reason="logout", specific_token_id=token_id
            )
        else:
            revoked_count = 0
    else:
        revoked_count = 0

    return LogoutResponse(
        message="Successfully logged out", revoked_tokens=revoked_count
    )


# === Token Validation ===


@router.post("/validate-token", response_model=TokenValidationResponse)
async def validate_token(
    token_request: TokenValidationRequest, db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Валидировать токен доступа.

    Args:
        token_request: Запрос валидации токена
        db: Сессия базы данных

    Returns:
        TokenValidationResponse: Результат валидации
    """
    user = await token_service.validate_access_token(db, token_request.token)

    if user:
        payload = JWTTokenManager.verify_token(token_request.token, TokenType.ACCESS)
        expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC).replace(tzinfo=None)

        return TokenValidationResponse(
            valid=True,
            expires_at=expires_at,
            user=UserDetailed.model_validate(user),
        )

    return TokenValidationResponse(valid=False)


# === Password Management ===


@router.post("/change-password")
async def change_password(
    password_request: PasswordChangeRequest,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Изменить пароль пользователя.

    Args:
        password_request: Запрос смены пароля
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат операции
    """
    await password_service.change_password(
        db,
        current_user,
        password_request.current_password,
        password_request.new_password,
    )

    return {"message": "Password changed successfully"}


@router.post("/reset-password")
async def request_password_reset(
    reset_request: PasswordResetRequest, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Запросить сброс пароля.

    Args:
        reset_request: Запрос сброса пароля
        db: Сессия базы данных

    Returns:
        dict: Результат операции
    """
    await password_service.request_password_reset(db, reset_request.email)
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/forgot-password")
async def forgot_password(
    reset_request: PasswordResetRequest, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Запросить восстановление пароля (альтернативный эндпоинт).

    Args:
        reset_request: Запрос восстановления пароля
        db: Сессия базы данных

    Returns:
        dict: Результат операции
    """
    await password_service.request_password_reset(db, reset_request.email)
    return {"message": "If the email exists, a password recovery link has been sent"}


@router.post("/reset-password/confirm")
async def confirm_password_reset(
    reset_confirm: PasswordResetConfirm, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Подтвердить сброс пароля.

    Args:
        reset_confirm: Подтверждение сброса пароля
        db: Сессия базы данных

    Returns:
        dict: Результат операции
    """
    await password_service.reset_password(
        db, reset_confirm.token, reset_confirm.new_password
    )
    return {"message": "Password reset successfully"}


# === Email Verification ===


@router.post("/verify-email/request")
async def request_email_verification(
    verification_request: EmailVerificationRequest, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Запросить повторную отправку email для верификации.

    Args:
        verification_request: Запрос верификации email
        db: Сессия базы данных

    Returns:
        dict: Результат операции
    """
    await user_registration_service.resend_verification_email(
        db, verification_request.email
    )
    return {
        "message": "If the email exists and is not verified, a verification link has been sent"
    }


@router.post("/verify-email/confirm", response_model=EmailVerificationResponse)
async def confirm_email_verification(
    verification_confirm: EmailVerificationConfirm, db: AsyncSession = Depends(get_db)
) -> EmailVerificationResponse:
    """
    Подтвердить верификацию email.

    Args:
        verification_confirm: Подтверждение верификации email
        db: Сессия базы данных

    Returns:
        EmailVerificationResponse: Результат верификации
    """
    user = await user_registration_service.verify_email(db, verification_confirm.token)
    return EmailVerificationResponse(
        message="Email verified successfully",
        verified=True,
        user=UserDetailed.model_validate(user),
    )


# === Session Management ===


@router.get("/sessions", response_model=SessionListResponse)
async def get_user_sessions(
    request: Request,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получить список активных сессий пользователя.

    Args:
        request: HTTP запрос
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        SessionListResponse: Список сессий
    """
    sessions = await session_service.get_user_sessions(db, current_user, request)
    return SessionListResponse(sessions=sessions, total=len(sessions))


@router.post("/sessions/revoke")
async def revoke_sessions(
    revoke_request: RevokeSessionRequest,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Отозвать сессии пользователя.

    Args:
        revoke_request: Запрос отзыва сессий
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат операции
    """
    revoked_count = await session_service.revoke_user_session(
        db, current_user, revoke_request.session_id, revoke_request.revoke_all
    )

    if revoke_request.revoke_all:
        return {"message": f"Revoked {revoked_count} sessions"}
    else:
        return {"message": "Session revoked successfully"}


# === Utility Functions ===


def _get_user_scopes(user: User) -> list[str]:
    """
    Получить права доступа пользователя на основе Enhanced Role System.

    Args:
        user: Пользователь

    Returns:
        list[str]: Список прав доступа (scopes) в соответствии с Permission enum
    """
    scopes = ["me", "use_api"]  # Базовые scopes для всех пользователей

    # Системные администраторы получают все права
    try:
        is_system_admin = user.is_system_admin
    except (AttributeError, Exception):
        # Fallback если role_assignments не загружены или есть другие проблемы
        is_system_admin = False

    if is_system_admin:
        scopes.extend([perm.value for perm in Permission])
        return scopes

    # Суперпользователи получают широкие права
    try:
        is_superuser = getattr(user, "is_superuser", False)
    except (AttributeError, Exception):
        is_superuser = False

    if is_superuser:
        scopes.extend(
            [
                # Основные права управления
                Permission.MANAGE_COMPANY.value,
                Permission.VIEW_COMPANY_SETTINGS.value,
                Permission.MANAGE_COMPANY_SETTINGS.value,
                Permission.MANAGE_COMPANY_USERS.value,
                Permission.VIEW_COMPANY_USERS.value,
                Permission.INVITE_USERS.value,
                Permission.REMOVE_USERS.value,
                Permission.VIEW_COMPANY_ANALYTICS.value,
                Permission.EXPORT_COMPANY_DATA.value,
                # Проектные права
                Permission.CREATE_PROJECT.value,
                Permission.MANAGE_PROJECT.value,
                Permission.VIEW_PROJECT.value,
                Permission.DELETE_PROJECT.value,
                Permission.ARCHIVE_PROJECT.value,
                Permission.MANAGE_PROJECT_SETTINGS.value,
                Permission.MANAGE_PROJECT_MEMBERS.value,
                Permission.VIEW_PROJECT_MEMBERS.value,
                Permission.VIEW_PROJECT_ANALYTICS.value,
                # Права на требования
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.DELETE_REQUIREMENT.value,
                Permission.APPROVE_REQUIREMENT.value,
                Permission.REJECT_REQUIREMENT.value,
                Permission.LINK_REQUIREMENTS.value,
                Permission.MANAGE_REQUIREMENT_VERSIONS.value,
                Permission.EXPORT_REQUIREMENTS.value,
                Permission.IMPORT_REQUIREMENTS.value,
                # Права на релизы
                Permission.CREATE_RELEASE.value,
                Permission.MANAGE_RELEASE.value,
                Permission.VIEW_RELEASE.value,
                Permission.DELETE_RELEASE.value,
                Permission.PUBLISH_RELEASE.value,
                Permission.DEPLOY_RELEASE.value,
                Permission.ROLLBACK_RELEASE.value,
                Permission.APPROVE_RELEASE.value,
                # Права на тестирование
                Permission.CREATE_TEST.value,
                Permission.EXECUTE_TEST.value,
                Permission.VIEW_TEST_RESULTS.value,
                Permission.MANAGE_TEST_PLANS.value,
                Permission.APPROVE_TEST_RESULTS.value,
                Permission.CREATE_TEST_AUTOMATION.value,
                Permission.MANAGE_TEST_ENVIRONMENTS.value,
                # Права на документацию
                Permission.CREATE_SPECIFICATION.value,
                Permission.EDIT_SPECIFICATION.value,
                Permission.VIEW_SPECIFICATION.value,
                Permission.DELETE_SPECIFICATION.value,
                Permission.APPROVE_SPECIFICATION.value,
                Permission.GENERATE_DOCUMENTATION.value,
                # Права на комментарии
                Permission.CREATE_COMMENT.value,
                Permission.EDIT_COMMENT.value,
                Permission.DELETE_COMMENT.value,
                Permission.MODERATE_COMMENTS.value,
                # Права на отчеты
                Permission.VIEW_REPORTS.value,
                Permission.CREATE_REPORTS.value,
                Permission.EXPORT_REPORTS.value,
                Permission.VIEW_ADVANCED_ANALYTICS.value,
                # Права на интеграции
                Permission.MANAGE_INTEGRATIONS.value,
                Permission.VIEW_API_LOGS.value,
                Permission.CREATE_API_KEYS.value,
            ]
        )
        return scopes

    # NOTE: Убираем обращения к role_assignments здесь, чтобы избежать greenlet ошибок
    # Функция _get_user_scopes должна быть быстрой и без обращений к БД
    # Enhanced role permissions будут получены через отдельные endpoints

    # Добавляем базовые права для всех пользователей
    if not any(
        scope in scopes
        for scope in [Permission.VIEW_PROJECT.value, Permission.VIEW_REQUIREMENT.value]
    ):
        scopes.extend(
            [
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.VIEW_RELEASE.value,
                Permission.VIEW_TEST_RESULTS.value,
                Permission.VIEW_SPECIFICATION.value,
                Permission.CREATE_COMMENT.value,
            ]
        )

    return list(set(scopes))  # Убираем дубликаты


def _get_role_specific_scopes(
    role: EnhancedRole, assignment: UserRoleAssignment
) -> list[str]:
    """
    Получить права для конкретной Enhanced роли.

    Args:
        role: Enhanced роль
        assignment: Назначение роли

    Returns:
        list[str]: Список прав доступа
    """
    scopes = []

    # Системные роли
    if role.system_role:
        if role.system_role == SystemRole.SYSTEM_ADMIN:
            scopes.extend([perm.value for perm in Permission])
        elif role.system_role in [SystemRole.PLATFORM_ADMIN, SystemRole.SUPPORT_ADMIN]:
            scopes.extend(
                [
                    Permission.MANAGE_ALL_COMPANIES.value,
                    Permission.VIEW_SYSTEM_LOGS.value,
                    Permission.MANAGE_SYSTEM_SETTINGS.value,
                    Permission.AUDIT_SYSTEM.value,
                ]
            )

    # Компанийные роли
    if role.company_role:
        if role.company_role in [CompanyRole.COMPANY_ADMIN, CompanyRole.COMPANY_OWNER]:
            scopes.extend(
                [
                    Permission.MANAGE_COMPANY.value,
                    Permission.MANAGE_COMPANY_SETTINGS.value,
                    Permission.MANAGE_COMPANY_USERS.value,
                    Permission.INVITE_USERS.value,
                    Permission.REMOVE_USERS.value,
                    Permission.VIEW_COMPANY_ANALYTICS.value,
                    Permission.EXPORT_COMPANY_DATA.value,
                ]
            )
        elif role.company_role == CompanyRole.BILLING_MANAGER:
            scopes.extend(
                [
                    Permission.MANAGE_COMPANY_BILLING.value,
                    Permission.VIEW_COMPANY_BILLING.value,
                    Permission.MANAGE_COMPANY_SUBSCRIPTION.value,
                ]
            )

    # Проектные роли
    if role.project_role:
        if role.project_role == ProjectRole.PROJECT_MANAGER:
            scopes.extend(
                [
                    Permission.MANAGE_PROJECT.value,
                    Permission.MANAGE_PROJECT_SETTINGS.value,
                    Permission.MANAGE_PROJECT_MEMBERS.value,
                    Permission.VIEW_PROJECT_ANALYTICS.value,
                    Permission.CREATE_REQUIREMENT.value,
                    Permission.EDIT_REQUIREMENT.value,
                    Permission.APPROVE_REQUIREMENT.value,
                    Permission.CREATE_RELEASE.value,
                    Permission.MANAGE_RELEASE.value,
                ]
            )
        elif role.project_role in [ProjectRole.SENIOR_DEVELOPER, ProjectRole.ARCHITECT]:
            scopes.extend(
                [
                    Permission.VIEW_PROJECT.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.EDIT_REQUIREMENT.value,
                    Permission.CREATE_RELEASE.value,
                    Permission.MANAGE_RELEASE.value,
                    Permission.DEPLOY_RELEASE.value,
                    Permission.CREATE_TEST.value,
                    Permission.EXECUTE_TEST.value,
                ]
            )
        elif role.project_role == ProjectRole.DEVELOPER:
            scopes.extend(
                [
                    Permission.VIEW_PROJECT.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.VIEW_RELEASE.value,
                    Permission.CREATE_TEST.value,
                    Permission.EXECUTE_TEST.value,
                ]
            )
        elif role.project_role in [
            ProjectRole.QA_ENGINEER,
            ProjectRole.TEST_AUTOMATION_ENGINEER,
        ]:
            scopes.extend(
                [
                    Permission.VIEW_PROJECT.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.CREATE_TEST.value,
                    Permission.EXECUTE_TEST.value,
                    Permission.VIEW_TEST_RESULTS.value,
                    Permission.MANAGE_TEST_PLANS.value,
                    Permission.CREATE_TEST_AUTOMATION.value,
                ]
            )
        elif role.project_role in [
            ProjectRole.BUSINESS_ANALYST,
            ProjectRole.PRODUCT_ANALYST,
        ]:
            scopes.extend(
                [
                    Permission.VIEW_PROJECT.value,
                    Permission.CREATE_REQUIREMENT.value,
                    Permission.EDIT_REQUIREMENT.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.CREATE_SPECIFICATION.value,
                    Permission.EDIT_SPECIFICATION.value,
                    Permission.VIEW_REPORTS.value,
                    Permission.CREATE_REPORTS.value,
                ]
            )

    return scopes


async def get_user_enhanced_permissions(user: User, db: AsyncSession) -> list[str]:
    """
    Асинхронно получить полные права пользователя с Enhanced Role System.

    Args:
        user: Пользователь
        db: Сессия базы данных

    Returns:
        list[str]: Полный список прав доступа включая Enhanced роли
    """
    # Начинаем с базовых прав
    permissions = set(["me", "use_api"])

    # Системные администраторы получают все права
    try:
        is_system_admin = user.is_system_admin
    except (AttributeError, Exception):
        is_system_admin = False

    if is_system_admin:
        permissions.update([perm.value for perm in Permission])
        return sorted(list(permissions))

    # Суперпользователи получают широкие права
    try:
        is_superuser = getattr(user, "is_superuser", False)
    except (AttributeError, Exception):
        is_superuser = False

    if is_superuser:
        permissions.update(
            [
                Permission.MANAGE_COMPANY.value,
                Permission.VIEW_COMPANY_SETTINGS.value,
                Permission.MANAGE_COMPANY_SETTINGS.value,
                Permission.MANAGE_COMPANY_USERS.value,
                Permission.VIEW_COMPANY_USERS.value,
                Permission.INVITE_USERS.value,
                Permission.REMOVE_USERS.value,
                Permission.VIEW_COMPANY_ANALYTICS.value,
                Permission.EXPORT_COMPANY_DATA.value,
                Permission.CREATE_PROJECT.value,
                Permission.MANAGE_PROJECT.value,
                Permission.VIEW_PROJECT.value,
                Permission.DELETE_PROJECT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.DELETE_REQUIREMENT.value,
                Permission.APPROVE_REQUIREMENT.value,
                Permission.CREATE_RELEASE.value,
                Permission.MANAGE_RELEASE.value,
                Permission.VIEW_RELEASE.value,
                Permission.DELETE_RELEASE.value,
                Permission.PUBLISH_RELEASE.value,
            ]
        )
        return sorted(list(permissions))

    # Получаем все активные назначения ролей пользователя через CRUD
    assignments = await crud_user.get_user_role_assignments(db, user_id=user.id)

    # Обрабатываем Enhanced роли
    for assignment in assignments:
        if not assignment.is_valid:
            continue

        role = assignment.role
        if not role or not role.is_active:
            continue

        # Добавляем права на основе конкретных ролей
        role_permissions = _get_role_specific_scopes(role, assignment)
        permissions.update(role_permissions)

    # Добавляем базовые права для всех пользователей
    if not any(
        perm in permissions
        for perm in [Permission.VIEW_PROJECT.value, Permission.VIEW_REQUIREMENT.value]
    ):
        permissions.update(
            [
                Permission.VIEW_PROJECT.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.VIEW_RELEASE.value,
                Permission.VIEW_TEST_RESULTS.value,
                Permission.VIEW_SPECIFICATION.value,
                Permission.CREATE_COMMENT.value,
            ]
        )

    return sorted(list(permissions))


# === Enhanced Role Management Endpoints ===


@router.get("/roles/my-roles")
async def get_my_roles(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Получить все роли текущего пользователя.

    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        dict: Информация о ролях пользователя
    """
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select

    # Получаем все активные назначения ролей пользователя
    stmt = (
        select(UserRoleAssignment)
        .where(
            UserRoleAssignment.user_id == current_user.id,
            UserRoleAssignment.is_active == True,
        )
        .options(
            selectinload(UserRoleAssignment.role),
            selectinload(UserRoleAssignment.company),
            selectinload(UserRoleAssignment.department),
            selectinload(UserRoleAssignment.team),
            selectinload(UserRoleAssignment.project),
        )
    )
    result = await db.execute(stmt)
    assignments = result.scalars().all()

    # Группируем роли по контексту
    roles_by_context = {
        "system": [],
        "company": [],
        "department": [],
        "team": [],
        "project": [],
    }

    permissions = set()

    for assignment in assignments:
        if not assignment.is_valid:
            continue

        role_info = {
            "id": assignment.role.id,
            "name": assignment.role.name,
            "display_name": assignment.role.display_name,
            "description": assignment.role.description,
            "scope": assignment.role.scope.value,
            "role_level": assignment.role.role_level,
            "assigned_at": assignment.created_at.isoformat(),
            "expires_at": (
                assignment.expires_at.isoformat() if assignment.expires_at else None
            ),
            "context_id": None,
            "context_name": None,
        }

        # Определяем контекст
        context_key = assignment.scope_level.value
        if assignment.company_id:
            role_info["context_id"] = assignment.company_id
            role_info["context_name"] = (
                assignment.company.name if assignment.company else None
            )
        elif assignment.department_id:
            role_info["context_id"] = assignment.department_id
            role_info["context_name"] = (
                assignment.department.name if assignment.department else None
            )
        elif assignment.team_id:
            role_info["context_id"] = assignment.team_id
            role_info["context_name"] = (
                assignment.team.name if assignment.team else None
            )
        elif assignment.project_id:
            role_info["context_id"] = assignment.project_id
            role_info["context_name"] = (
                assignment.project.name if assignment.project else None
            )

        roles_by_context[context_key].append(role_info)

        # Собираем разрешения
        role_permissions = _get_role_specific_scopes(assignment.role, assignment)
        permissions.update(role_permissions)

    # Получаем все права пользователя асинхронно (Enhanced роли)
    all_permissions = await get_user_enhanced_permissions(current_user, db)
    permissions.update(all_permissions)

    return {
        "user_id": current_user.id,
        "roles_by_context": roles_by_context,
        "permissions": sorted(list(permissions)),
        "total_roles": sum(
            len(roles) for roles in roles_by_context.values() if isinstance(roles, list)
        ),
        "has_system_admin": getattr(current_user, "is_system_admin", False),
        "has_superuser": getattr(current_user, "is_superuser", False),
    }


@router.get("/permissions/my-permissions")
async def get_my_permissions(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Получить все права текущего пользователя.

    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        dict: Полный список прав пользователя
    """
    permissions = await get_user_enhanced_permissions(current_user, db)

    return {
        "user_id": current_user.id,
        "permissions": permissions,
        "total_permissions": len(permissions),
        "has_system_admin": getattr(current_user, "is_system_admin", False),
        "has_superuser": getattr(current_user, "is_superuser", False),
        "generated_at": datetime.now(UTC).isoformat(),
    }


@router.get("/roles/available")
async def get_available_roles(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    scope: Optional[str] = None,
) -> dict:
    """
    Получить доступные роли для назначения.

    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных
        scope: Фильтр по области действия роли

    Returns:
        dict: Список доступных ролей
    """
    from sqlalchemy import select

    # Строим запрос
    stmt = select(EnhancedRole).where(
        EnhancedRole.is_active == True, EnhancedRole.is_assignable == True
    )

    if scope:
        try:
            scope_enum = RoleScope(scope)
            stmt = stmt.where(EnhancedRole.scope == scope_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid scope: {scope}",
            )

    result = await db.execute(stmt)
    roles = result.scalars().all()

    roles_data = []
    for role in roles:
        # Проверяем, может ли текущий пользователь назначать эту роль
        # Если роль требует одобрения, проверяем админские права
        is_system_admin = getattr(current_user, "is_system_admin", False)
        can_assign = True
        if role.requires_approval and not is_system_admin:
            can_assign = False

        roles_data.append(
            {
                "id": role.id,
                "name": role.name,
                "display_name": role.display_name,
                "description": role.description,
                "scope": role.scope.value,
                "role_level": role.role_level,
                "requires_approval": role.requires_approval,
                "can_assign": can_assign,
                "max_assignees": role.max_assignees,
                "system_role": role.system_role.value if role.system_role else None,
                "company_role": role.company_role.value if role.company_role else None,
                "department_role": (
                    role.department_role.value if role.department_role else None
                ),
                "team_role": role.team_role.value if role.team_role else None,
                "project_role": role.project_role.value if role.project_role else None,
            }
        )

    return {
        "roles": roles_data,
        "total": len(roles_data),
        "scopes": [scope.value for scope in RoleScope],
    }


@router.post("/roles/assign")
async def assign_role_to_user(
    user_id: int,
    role_id: int,
    db: SessionDep,
    company_id: Optional[int] = None,
    department_id: Optional[int] = None,
    team_id: Optional[int] = None,
    project_id: Optional[int] = None,
    expires_at: Optional[datetime] = None,
    assignment_reason: Optional[str] = None,
    current_user: User = Depends(UserPermissions.write()),
) -> dict:
    """
    Назначить роль пользователю.

    Args:
        user_id: ID пользователя
        role_id: ID роли
        company_id: ID компании (опционально)
        department_id: ID департамента (опционально)
        team_id: ID команды (опционально)
        project_id: ID проекта (опционально)
        expires_at: Дата истечения (опционально)
        assignment_reason: Причина назначения (опционально)
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        dict: Результат операции
    """
    from sqlalchemy import select

    # Получаем пользователя
    target_user = await crud_user.get(db, id=user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Получаем роль
    role_stmt = select(EnhancedRole).where(EnhancedRole.id == role_id)
    role_result = await db.execute(role_stmt)
    role = role_result.scalar_one_or_none()

    if not role or not role.is_active or not role.is_assignable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found or not assignable",
        )

    # Проверяем, требует ли роль одобрения
    needs_approval = role.requires_approval

    # Создаем назначение роли
    assignment = UserRoleAssignment(
        user_id=user_id,
        role_id=role_id,
        company_id=company_id,
        department_id=department_id,
        team_id=team_id,
        project_id=project_id,
        expires_at=expires_at,
        assigned_by=current_user.id,
        assignment_reason=assignment_reason,
        is_active=not needs_approval,  # Если требует одобрения, то неактивно
    )

    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    logger.info(
        f"Role {role.name} assigned to user {target_user.email} by {current_user.email} "
        f"(context: company={company_id}, department={department_id}, team={team_id}, project={project_id})"
    )

    return {
        "message": (
            "Role assigned successfully"
            if not needs_approval
            else "Role assignment pending approval"
        ),
        "assignment_id": assignment.id,
        "requires_approval": needs_approval,
        "is_active": assignment.is_active,
    }


@router.delete("/roles/revoke/{assignment_id}")
async def revoke_role_assignment(
    assignment_id: int,
    db: SessionDep,
    reason: Optional[str] = None,
    current_user: User = Depends(UserPermissions.write()),
) -> dict:
    """
    Отозвать назначение роли.

    Args:
        assignment_id: ID назначения роли
        reason: Причина отзыва (опционально)
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        dict: Результат операции
    """
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    # Получаем назначение роли
    stmt = (
        select(UserRoleAssignment)
        .where(UserRoleAssignment.id == assignment_id)
        .options(
            selectinload(UserRoleAssignment.role), selectinload(UserRoleAssignment.user)
        )
    )
    result = await db.execute(stmt)
    assignment = result.scalar_one_or_none()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role assignment not found"
        )

    # Проверяем, может ли пользователь отозвать свою собственную роль
    if assignment.user_id == current_user.id:
        # Пользователь может отозвать свою роль
        pass
    # Иначе права уже проверены через dependency get_users_write_user

    # Отзываем назначение
    assignment.revoke(revoked_by=current_user.id, reason=reason)
    await db.commit()

    logger.info(
        f"Role assignment {assignment_id} revoked by {current_user.email} "
        f"(user: {assignment.user.email}, role: {assignment.role.name}, reason: {reason})"
    )

    return {
        "message": "Role assignment revoked successfully",
        "assignment_id": assignment_id,
        "revoked_at": (
            assignment.expires_at.isoformat() if assignment.expires_at else None
        ),
    }


# === Auth0 OAuth2 Endpoints ===


@router.post("/oauth2/auth0", response_model=LoginResponse)
async def auth0_oauth2_callback(
    request: Request,
    token: str,
    db: SessionDep,
) -> Any:
    """
    Auth0 OAuth2 callback endpoint для обработки токенов от Auth0.

    Args:
        request: HTTP запрос
        token: JWT токен от Auth0
        db: Сессия базы данных

    Returns:
        LoginResponse: Токены доступа и информация о пользователе

    Raises:
        HTTPException: Если токен невалидный или произошла ошибка
    """
    if not auth0_service.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Auth0 is not configured",
        )

    # Получаем пользователя из Auth0 токена
    user = await get_user_from_auth0_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Auth0 token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверяем активность пользователя
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated",
        )

    # Получаем информацию о клиенте
    ip_address = get_client_ip(request)
    user_agent = get_user_agent(request)

    # Создаем refresh токен в базе данных
    refresh_token_expires = timedelta(days=settings.security.refresh_token_expire_days)
    refresh_token_record = await crud_refresh_token.create_for_user(
        db,
        user_id=user.id,
        expires_at=datetime.now(UTC).replace(tzinfo=None) + refresh_token_expires,
        user_agent=user_agent,
        ip_address=ip_address,
    )

    # Создаем JWT токены
    access_token_expires = timedelta(
        minutes=settings.security.access_token_expire_minutes
    )

    access_token = JWTTokenManager.create_access_token(
        subject=user.email,
        user_id=user.id,
        scopes=_get_user_scopes(user),
        expires_delta=access_token_expires,
    )

    refresh_token = JWTTokenManager.create_refresh_token(
        subject=user.email,
        user_id=user.id,
        token_id=refresh_token_record.token,
        expires_delta=refresh_token_expires,
    )

    # Обновляем время последнего входа
    user.last_login = datetime.now(UTC).replace(tzinfo=None)
    await db.commit()

    logger.info(f"User {user.email} logged in via Auth0 from {ip_address}")

    # Возвращаем токены и информацию о пользователе
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=int(access_token_expires.total_seconds()),
        user=UserDetailed.model_validate(user),
    )


@router.get("/oauth2/auth0/userinfo")
async def get_auth0_user_info(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Получить информацию о пользователе для совместимости с Auth0.

    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        dict: Информация о пользователе в формате Auth0
    """
    # Получаем пользователя с профилем для полной информации
    user_with_profile = await crud_user.get_with_profile(db, id=current_user.id)
    if not user_with_profile:
        user_with_profile = current_user

    profile = user_with_profile.profile

    return {
        "sub": current_user.auth0_id or str(current_user.id),
        "email": current_user.email,
        "email_verified": current_user.email_verified,
        "name": profile.full_name if profile else current_user.username,
        "given_name": profile.first_name if profile else None,
        "family_name": profile.last_name if profile else None,
        "nickname": current_user.username,
        "picture": profile.avatar_url if profile else None,
        "updated_at": (
            current_user.updated_at.isoformat() if current_user.updated_at else None
        ),
        "locale": profile.locale if profile else "ru-RU",
    }


@router.get("/oauth2/auth0/status")
async def get_auth0_status() -> dict:
    """
    Получить статус конфигурации Auth0.

    Returns:
        dict: Статус Auth0 интеграции
    """
    return {
        "enabled": auth0_service.is_enabled,
        "domain": settings.auth0.domain if auth0_service.is_enabled else None,
        "audience": settings.auth0.audience if auth0_service.is_enabled else None,
    }
