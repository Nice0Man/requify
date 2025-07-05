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
from app.services.email_service import email_service
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
    UserProfile,
    AuthError,
    EmailVerificationRequest,
    EmailVerificationConfirm,
    EmailVerificationResponse,
)
from app.schemas.user import UserCreate

router = APIRouter()


# === Authentication Endpoints ===


@router.post(
    "/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED
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
        UserProfile: Профиль зарегистрированного пользователя

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

    # Отправляем email для верификации
    try:
        verification_token = JWTTokenManager.create_email_verification_token(user.email)
        await email_service.send_email_verification(
            user_email=user.email,
            verification_token=verification_token,
            user_name=user.first_name or user.username,
        )
        logger.info(f"Verification email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {e}")
        # Не прерываем регистрацию из-за ошибки отправки email

    # Возвращаем профиль пользователя
    return UserProfile.model_validate(user)


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
    # Пытаемся найти пользователя по email или username
    user = await crud_user.get_by_email(db, email=form_data.username)
    if not user:
        user = await crud_user.get_by_username(db, username=form_data.username)

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

    # Формируем профиль пользователя
    user_profile = UserProfile.model_validate(user)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.security.access_token_expire_minutes * 60,
        refresh_expires_in=settings.security.refresh_token_expire_days * 24 * 60 * 60,
        user=user_profile,
        permissions=_get_user_scopes(user),
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

    # Получаем пользователя
    user_id = payload.get("user_id")
    if user_id:
        user = await crud_user.get(db, id=user_id)
        if user and user.is_active:
            expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC).replace(
                tzinfo=None
            )
            user_profile = UserProfile.model_validate(user)

            return TokenValidationResponse(
                valid=True, expires_at=expires_at, user=user_profile
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
                user_name=user.first_name or user.username,
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
    Получить права доступа пользователя на основе роли.

    Args:
        user: Пользователь

    Returns:
        list[str]: Список прав доступа (scopes)
    """
    scopes = ["me"]  # Базовый scope для всех пользователей

    if user.is_superuser:
        # Суперпользователь имеет все права
        scopes.extend(
            [
                "users:read",
                "users:write",
                "users:delete",
                "projects:read",
                "projects:write",
                "projects:delete",
                "requirements:read",
                "requirements:write",
                "requirements:delete",
                "releases:read",
                "releases:write",
                "releases:delete",
                "testing:read",
                "testing:write",
                "testing:execute",
                "admin:read",
                "admin:write",
                "system:admin",
            ]
        )
    elif user.role == "admin":
        # Администратор имеет широкие права, но не системные
        scopes.extend(
            [
                "users:read",
                "users:write",
                "users:delete",
                "projects:read",
                "projects:write",
                "projects:delete",
                "requirements:read",
                "requirements:write",
                "requirements:delete",
                "releases:read",
                "releases:write",
                "releases:delete",
                "testing:read",
                "testing:write",
                "testing:execute",
                "admin:read",
                "admin:write",
            ]
        )
    elif user.role == "product_manager":
        # Продуктовый менеджер - ключевая роль по ТЗ для управления требованиями и релизами
        scopes.extend(
            [
                "users:read",
                "projects:read",
                "projects:write",
                "projects:delete",  # PM создает и удаляет проекты по ТЗ
                "requirements:read",
                "requirements:write",
                "requirements:delete",  # PM управляет требованиями по ТЗ
                "releases:read",
                "releases:write",
                "releases:delete",  # PM формирует релизы по ТЗ
                "testing:read",
                "admin:read",  # Доступ к мониторингу
            ]
        )
    elif user.role == "manager":
        # Менеджер может управлять проектами и требованиями, имеет доступ к админ панели для мониторинга
        scopes.extend(
            [
                "users:read",
                "projects:read",
                "projects:write",
                "projects:delete",  # Менеджеры могут удалять проекты
                "requirements:read",
                "requirements:write",
                "requirements:delete",
                "releases:read",
                "releases:write",
                "releases:delete",  # Менеджеры могут удалять релизы
                "testing:read",
                "testing:write",
                "admin:read",  # Менеджеры могут читать админ данные для мониторинга
            ]
        )
    elif user.role == "senior_developer":
        # Старший разработчик - расширенные права по сравнению с обычным разработчиком
        scopes.extend(
            [
                "projects:read",
                "requirements:read",
                "releases:read",
                "releases:write",
                "releases:delete",  # Старший разработчик может удалять релизы
                "testing:read",
                "testing:write",  # Может участвовать в планировании тестирования
                "admin:read",  # Доступ к мониторингу системы
            ]
        )
    elif user.role == "developer":
        # Разработчик читает требования и работает с релизами, имеет доступ к админ панели для мониторинга
        scopes.extend(
            [
                "projects:read",
                "requirements:read",
                "releases:read",
                "releases:write",
                "testing:read",
                "admin:read",  # Разработчики могут читать админ данные для мониторинга системы
            ]
        )
    elif user.role == "analyst":
        # Аналитик только читает данные согласно ТЗ (убираем write права)
        scopes.extend(
            [
                "projects:read",  # Только чтение проектов
                "requirements:read",  # Только чтение требований
                "releases:read",
                "testing:read",
            ]
        )
    elif user.role == "tester":
        # Тестировщик работает с тестированием и читает требования
        scopes.extend(
            [
                "projects:read",
                "requirements:read",
                "releases:read",
                "testing:read",
                "testing:write",
                "testing:execute",
            ]
        )
    elif user.role == "viewer" or user.role == "user":
        # Пользователь по умолчанию имеет только права чтения
        scopes.extend(
            ["projects:read", "requirements:read", "releases:read", "testing:read"]
        )
    else:
        # Fallback для неизвестных ролей - только базовые права чтения
        scopes.extend(
            ["projects:read", "requirements:read", "releases:read", "testing:read"]
        )

    return scopes
