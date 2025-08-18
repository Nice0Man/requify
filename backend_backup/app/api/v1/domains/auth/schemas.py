"""
Common Authentication Schemas.

Общие схемы для аутентификации, используемые во всех поддоменах.
Конкретные схемы находятся в соответствующих поддоменах.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Base Token Schemas ===


class TokenBase(BaseSchema):
    """Базовая схема токена."""

    token_type: str = Field(default="bearer", description="Тип токена")


class AccessToken(TokenBase):
    """Схема для access токена."""

    access_token: str = Field(..., description="Access токен")
    expires_in: int = Field(..., description="Время жизни токена в секундах")


class RefreshToken(TokenBase):
    """Схема для refresh токена."""

    refresh_token: str = Field(..., description="Refresh токен")
    expires_in: int = Field(..., description="Время жизни токена в секундах")


# === JWT Payload Schemas ===


class AccessTokenPayload(BaseSchema):
    """Схема для данных внутри access JWT токена."""

    sub: str = Field(..., description="Subject (user email)")
    exp: int = Field(..., description="Expiration time (timestamp)")
    iat: int = Field(..., description="Issued at (timestamp)")
    type: str = Field(default="access", description="Тип токена")
    user_id: int = Field(..., description="ID пользователя")
    scopes: List[str] = Field(default_factory=list, description="Права доступа")
    company_id: Optional[int] = Field(None, description="ID основной компании")
    auth0_id: Optional[str] = Field(None, description="Auth0 ID пользователя")


class RefreshTokenPayload(BaseSchema):
    """Схема для данных внутри refresh JWT токена."""

    sub: str = Field(..., description="Subject (user email)")
    exp: int = Field(..., description="Expiration time (timestamp)")
    iat: int = Field(..., description="Issued at (timestamp)")
    type: str = Field(default="refresh", description="Тип токена")
    user_id: int = Field(..., description="ID пользователя")
    token_id: str = Field(..., description="ID refresh токена в БД")
    company_id: Optional[int] = Field(None, description="ID основной компании")


class TokenData(BaseSchema):
    """Схема для валидации токена."""

    email: Optional[str] = Field(None, description="Email пользователя")
    user_id: Optional[int] = Field(None, description="ID пользователя")
    scopes: List[str] = Field(default_factory=list, description="Права доступа")
    company_id: Optional[int] = Field(None, description="ID компании")


# === Error Schemas ===


class AuthError(BaseSchema):
    """Схема для ошибок аутентификации."""

    error: str = Field(..., description="Код ошибки")
    error_description: str = Field(..., description="Описание ошибки")
    error_details: Optional[dict] = Field(None, description="Дополнительные детали")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время ошибки"
    )


# === Two-Factor Authentication Schemas ===


class TwoFactorSetupRequest(BaseSchema):
    """Схема для настройки 2FA."""

    password: str = Field(..., description="Текущий пароль для подтверждения")


class TwoFactorSetupResponse(BaseSchema):
    """Схема для ответа настройки 2FA."""

    secret: str = Field(..., description="Секретный ключ для 2FA")
    qr_code: str = Field(..., description="QR-код для настройки в приложении")
    backup_codes: List[str] = Field(..., description="Резервные коды")


# Импорты из поддоменов для обратной совместимости
from .root.schemas import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    LogoutRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    TokenValidationRequest,
    TokenValidationResponse,
)

from .password.schemas import (
    PasswordChangeRequest,
    PasswordChangeResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    PasswordResetConfirm,
    PasswordResetConfirmResponse,
)

from .sessions.schemas import (
    ActiveSession,
    SessionListResponse,
    RevokeSessionRequest,
    RevokeSessionResponse,
)

from .email.schemas import (
    EmailVerificationRequest,
    EmailVerificationResponse,
    EmailVerificationConfirm,
    EmailVerificationConfirmResponse,
)

from .me.schemas import (
    CurrentUserResponse,
    AccountStatusResponse,
)


__all__ = [
    "TokenBase",
    "AccessToken",
    "RefreshToken",
    "AccessTokenPayload",
    "RefreshTokenPayload",
    "TokenData",
    "AuthError",
    "TwoFactorSetupRequest",
    "TwoFactorSetupResponse",
    "LoginRequest",
    "LoginResponse",
    "RegisterRequest",
    "RegisterResponse",
    "LogoutRequest",
    "LogoutResponse",
    "RefreshTokenRequest",
    "RefreshTokenResponse",
    "TokenValidationRequest",
    "TokenValidationResponse",
    "PasswordChangeRequest",
    "PasswordChangeResponse",
    "PasswordResetRequest",
    "PasswordResetResponse",
    "PasswordResetConfirm",
    "PasswordResetConfirmResponse",
    "EmailVerificationRequest",
    "EmailVerificationResponse",
    "EmailVerificationConfirm",
    "EmailVerificationConfirmResponse",
    "CurrentUserResponse",
    "AccountStatusResponse",
    "ActiveSession",
    "SessionListResponse",
    "RevokeSessionRequest",
    "RevokeSessionResponse",
]
