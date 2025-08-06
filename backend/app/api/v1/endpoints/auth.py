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


from app.api.deps import (
    get_db,
    get_current_user,
    get_current_active_user,
    get_optional_user,
    get_user_from_auth0_token,
    check_user_permission,
)
from app.services import auth0_service
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
    UserComplete,
    UserWithProfile,
    User,
    UserInDB,
    UserProfileResponse,
    UserProfileCreate,
)

router = APIRouter()


# === Authentication Endpoints ===


@router.post(
    "/register", response_model=UserWithProfile, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Регистрация нового пользователя.

    Args:
        user_in: Данные нового пользователя
        db: Сессия базы данных

    Returns:
        UserWithProfile: Пользователь с профилем

    Raises:
        HTTPException: Если пользователь с таким email или username уже существует
    """
    # Проверяем уникальность email
    existing_user = await crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Проверяем уникальность username
    if user_in.username:
        existing_username = await crud_user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username already exists",
            )

    # Создаем пользователя
    user = await crud_user.create(db, obj_in=user_in)

    # Создаем профиль пользователя (если не создался автоматически)
    from app.crud import user_profile as crud_user_profile

    if not user.profile:
        profile_data = UserProfileCreate(
            display_name=user.username,
            first_name=getattr(user_in, "first_name", None),
            last_name=getattr(user_in, "last_name", None),
        )
        profile = await crud_user_profile.create_for_user(
            db, user_id=user.id, obj_in=profile_data
        )
        # Присваиваем профиль пользователю для избежания дополнительного запроса
        user.profile = profile

    # Отправляем email для верификации
    try:
        verification_token = JWTTokenManager.create_email_verification_token(user.email)
        user_display_name = user.profile.display_name if user.profile else user.username
        await email_service.send_email_verification(
            user_email=user.email,
            verification_token=verification_token,
            user_name=user_display_name,
        )
        logger.info(f"Verification email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {e}")
        # Не прерываем регистрацию из-за ошибки отправки email

    # Возвращаем пользователя с профилем
    return UserWithProfile.model_validate(user)


@router.post("/login", response_model=LoginResponse)
async def login_for_access_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 совместимый эндпоинт для получения токенов доступа.

    Создает пару access/refresh токенов для аутентифицированного пользователя.
    Поддерживает вход по email или username.

    Args:
        request: HTTP запрос
        db: Сессия базы данных
        form_data: Данные формы с username и password

    Returns:
        LoginResponse: Токены доступа и информация о пользователе

    Raises:
        HTTPException: Если учетные данные неверны или пользователь неактивен
    """
    # Пытаемся найти пользователя по email или username через CRUD методы
    user = await crud_user.get_by_email_with_profile(db, email=form_data.username)
    if not user:
        user = await crud_user.get_by_username_with_profile(
            db, username=form_data.username
        )

    # Проверяем существование пользователя и правильность пароля
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
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

    # Используем уже загруженного пользователя с профилем
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.security.access_token_expire_minutes * 60,
        refresh_expires_in=settings.security.refresh_token_expire_days * 24 * 60 * 60,
        user=UserComplete.model_validate(user),
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    request: Request,
    refresh_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
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
    # Проверяем JWT токен
    payload = JWTTokenManager.verify_token(
        refresh_request.refresh_token, TokenType.REFRESH
    )
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Получаем токен из базы данных
    token_id = payload.get("token_id")
    if not token_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token format",
        )

    refresh_token_record = await crud_refresh_token.get_valid_token(db, token=token_id)
    if not refresh_token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked",
        )

    # Проверяем пользователя
    user = refresh_token_record.user
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )

    # Отмечаем токен как использованный
    await crud_refresh_token.mark_as_used(db, token=refresh_token_record)

    # Создаем новый access токен
    access_token_expires = timedelta(
        minutes=settings.security.access_token_expire_minutes
    )
    access_token = JWTTokenManager.create_access_token(
        subject=user.email,
        user_id=user.id,
        scopes=_get_user_scopes(user),
        expires_delta=access_token_expires,
    )

    response_data = {
        "access_token": access_token,
        "expires_in": settings.security.access_token_expire_minutes * 60,
    }

    # Ротация refresh токена (если включена)
    if settings.security.refresh_token_rotate:
        # Отзываем старый токен
        await crud_refresh_token.revoke_token(
            db, token=refresh_token_record, reason="token_rotation"
        )

        # Создаем новый refresh токен
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)

        refresh_token_expires = timedelta(
            days=settings.security.refresh_token_expire_days
        )
        new_refresh_token_record = await crud_refresh_token.create_for_user(
            db,
            user_id=user.id,
            expires_at=datetime.now(UTC).replace(tzinfo=None) + refresh_token_expires,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        new_refresh_token = JWTTokenManager.create_refresh_token(
            subject=user.email,
            user_id=user.id,
            token_id=new_refresh_token_record.token,
            expires_delta=refresh_token_expires,
        )

        response_data.update(
            {
                "refresh_token": new_refresh_token,
                "refresh_expires_in": settings.security.refresh_token_expire_days
                * 24
                * 60
                * 60,
            }
        )

    return RefreshTokenResponse(**response_data)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    logout_request: LogoutRequest,
    db: AsyncSession = Depends(get_db),
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
    revoked_count = 0

    if logout_request.logout_all:
        # Отзываем все токены пользователя
        revoked_count = await crud_refresh_token.revoke_user_tokens(
            db, user_id=current_user.id, reason="logout_all"
        )
    elif logout_request.refresh_token:
        # Отзываем конкретный токен
        payload = JWTTokenManager.verify_token(
            logout_request.refresh_token, TokenType.REFRESH
        )
        if payload:
            token_id = payload.get("token_id")
            if token_id:
                refresh_token_record = await crud_refresh_token.get_by_token(
                    db, token=token_id
                )
                if (
                    refresh_token_record
                    and refresh_token_record.user_id == current_user.id
                ):
                    await crud_refresh_token.revoke_token(
                        db, token=refresh_token_record, reason="logout"
                    )
                    revoked_count = 1

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
    payload = JWTTokenManager.verify_token(token_request.token, TokenType.ACCESS)

    if not payload:
        return TokenValidationResponse(valid=False)

    # Получаем пользователя через CRUD метод с предварительной загрузкой профиля
    user_id = payload.get("user_id")
    if user_id:
        user = await crud_user.get_with_profile(db, id=user_id)

        if user and user.is_active:
            expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC).replace(
                tzinfo=None
            )

            return TokenValidationResponse(
                valid=True,
                expires_at=expires_at,
                user=UserComplete.model_validate(user),
            )

    return TokenValidationResponse(valid=False)


# === Password Management ===


@router.post("/change-password")
async def change_password(
    password_request: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
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
    # Проверяем текущий пароль
    if not verify_password(
        password_request.current_password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password"
        )

    # Валидируем новый пароль
    is_valid, errors = PasswordManager.validate_password_strength(
        password_request.new_password
    )[:2]
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Password does not meet requirements", "errors": errors},
        )

    # Обновляем пароль
    hashed_password = PasswordManager.hash_password(password_request.new_password)
    await crud_user.update(
        db, db_obj=current_user, obj_in={"hashed_password": hashed_password}
    )

    # Отзываем все refresh токены для безопасности
    await crud_refresh_token.revoke_user_tokens(
        db, user_id=current_user.id, reason="password_change"
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
    user = await crud_user.get_by_email(db, email=reset_request.email)

    # Всегда возвращаем успех для безопасности (не раскрываем существование email)
    if user and user.is_active:
        reset_token = JWTTokenManager.create_password_reset_token(user.email)
        # Отправляем email с токеном сброса
        await email_service.send_password_reset_email(
            user_email=user.email,
            reset_token=reset_token,
            user_name=user.name or user.email,
        )

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
    user = await crud_user.get_by_email(db, email=reset_request.email)

    # Всегда возвращаем успех для безопасности (не раскрываем существование email)
    if user and user.is_active:
        reset_token = JWTTokenManager.create_password_reset_token(user.email)
        # Отправляем email с токеном восстановления
        await email_service.send_password_reset_email(
            user_email=user.email,
            reset_token=reset_token,
            user_name=user.name or user.email,
        )

        logger.info(f"Password reset requested for user: {user.email}")

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
    email = JWTTokenManager.verify_password_reset_token(reset_confirm.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    user = await crud_user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Валидируем новый пароль
    is_valid, errors = PasswordManager.validate_password_strength(
        reset_confirm.new_password
    )[:2]
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Password does not meet requirements", "errors": errors},
        )

    # Обновляем пароль
    hashed_password = PasswordManager.hash_password(reset_confirm.new_password)
    await crud_user.update(db, db_obj=user, obj_in={"hashed_password": hashed_password})

    # Отзываем все refresh токены
    await crud_refresh_token.revoke_user_tokens(
        db, user_id=user.id, reason="password_reset"
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
    user = await crud_user.get_by_email(db, email=verification_request.email)

    # Всегда возвращаем успех для безопасности (не раскрываем существование email)
    if user and user.is_active:
        if user.email_verified:
            return {"message": "Email is already verified"}

        try:
            verification_token = JWTTokenManager.create_email_verification_token(
                user.email
            )
            await email_service.send_email_verification(
                user_email=user.email,
                verification_token=verification_token,
                user_name=user.name or user.username,
            )
            logger.info(f"Verification email resent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {e}")

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
    email = JWTTokenManager.verify_email_verification_token(verification_confirm.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    user = await crud_user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user.email_verified:
        return EmailVerificationResponse(
            message="Email is already verified", verified=True
        )

    # Помечаем email как подтвержденный
    from datetime import datetime, timezone

    await crud_user.update(
        db,
        db_obj=user,
        obj_in={
            "email_verified": True,
            "email_verified_at": datetime.now(timezone.utc).replace(tzinfo=None),
        },
    )

    logger.info(f"Email verified for user {user.email}")

    return EmailVerificationResponse(
        message="Email verified successfully", verified=True
    )


# === Session Management ===


@router.get("/sessions", response_model=SessionListResponse)
async def get_user_sessions(
    request: Request,
    db: AsyncSession = Depends(get_db),
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
    tokens = await crud_refresh_token.get_user_tokens(
        db, user_id=current_user.id, active_only=True
    )

    # Получаем IP и User-Agent текущего запроса для определения текущей сессии
    current_ip = get_client_ip(request)
    current_user_agent = get_user_agent(request)

    sessions = []
    for token in tokens:
        # Определяем текущую сессию по IP и User-Agent
        is_current = False
        if (
            token.ip_address == current_ip
            and token.user_agent == current_user_agent
            and token.last_used_at
        ):
            try:
                time_since_last_use = (
                    datetime.now(UTC).replace(tzinfo=None) - token.last_used_at
                ).total_seconds()
                is_current = time_since_last_use < 300  # активность в последние 5 минут
            except Exception:
                is_current = False

        sessions.append(
            ActiveSession(
                id=token.id,
                created_at=token.created_at,
                last_used_at=token.last_used_at,
                expires_at=token.expires_at,
                ip_address=token.ip_address,
                user_agent=token.user_agent,
                is_current=bool(is_current),
            )
        )

    return SessionListResponse(sessions=sessions, total=len(sessions))


@router.post("/sessions/revoke")
async def revoke_sessions(
    revoke_request: RevokeSessionRequest,
    db: AsyncSession = Depends(get_db),
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
    if revoke_request.revoke_all:
        revoked_count = await crud_refresh_token.revoke_user_tokens(
            db, user_id=current_user.id, reason="session_revoke_all"
        )
        return {"message": f"Revoked {revoked_count} sessions"}

    elif revoke_request.session_id:
        tokens = await crud_refresh_token.get_user_tokens(
            db, user_id=current_user.id, active_only=True
        )

        for token in tokens:
            if token.id == revoke_request.session_id:
                await crud_refresh_token.revoke_token(
                    db, token=token, reason="session_revoke"
                )
                return {"message": "Session revoked successfully"}

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Either session_id or revoke_all must be specified",
    )


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
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
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
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
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
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
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

    # Проверяем права на просмотр ролей
    is_system_admin = getattr(current_user, "is_system_admin", False)
    if not (
        is_system_admin
        or check_user_permission(current_user, Permission.MANAGE_COMPANY_USERS)
        or check_user_permission(current_user, Permission.VIEW_COMPANY_USERS)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view roles",
        )

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
        can_assign = True
        if role.requires_approval and not getattr(
            current_user, "is_system_admin", False
        ):
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
    company_id: Optional[int] = None,
    department_id: Optional[int] = None,
    team_id: Optional[int] = None,
    project_id: Optional[int] = None,
    expires_at: Optional[datetime] = None,
    assignment_reason: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
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

    # Проверяем права на назначение ролей
    is_system_admin = getattr(current_user, "is_system_admin", False)
    if not (
        is_system_admin
        or check_user_permission(current_user, Permission.MANAGE_COMPANY_USERS)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to assign roles",
        )

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
    needs_approval = role.requires_approval and not is_system_admin

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
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
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

    # Проверяем права на отзыв роли
    is_system_admin = getattr(current_user, "is_system_admin", False)
    can_revoke = (
        is_system_admin
        or assignment.user_id
        == current_user.id  # Пользователь может отозвать свою роль
        or check_user_permission(current_user, Permission.MANAGE_COMPANY_USERS)
    )

    if not can_revoke:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to revoke this role",
        )

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
    db: AsyncSession = Depends(get_db),
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
        user=UserComplete.model_validate(user),
    )


@router.get("/oauth2/auth0/userinfo")
async def get_auth0_user_info(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
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
