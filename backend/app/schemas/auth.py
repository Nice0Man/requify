"""
Схемы для аутентификации.

Модуль содержит схемы для работы с JWT токенами,
данными аутентификации и авторизации, следуя принципам SOLID и DRY.
Обновлены в соответствии с новой архитектурой SQLModel:
- Использование базовых классов из base.py
- Поддержка Enhanced Role System
- Связи с UserProfile, Company, Dashboard
- Стандартизированная структура CRUD операций
"""

from datetime import datetime, UTC
from typing import Optional, List, Dict, Any, TYPE_CHECKING

from pydantic import Field, EmailStr, field_validator, model_validator

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)

if TYPE_CHECKING:
    from app.schemas.user import UserComplete

# === Base Token Schemas (Single Responsibility Principle) ===


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


class TokenPair(BaseSchema):
    """Схема для пары токенов (access + refresh)."""

    access_token: str = Field(..., description="Access токен")
    refresh_token: str = Field(..., description="Refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: int = Field(
        ..., description="Время жизни refresh токена в секундах"
    )


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


# === Authentication Request/Response Schemas ===


class LoginRequest(CreateSchema, ValidationMixin):
    """Схема для запроса аутентификации."""

    email: EmailStr = Field(..., description="Email")
    username: Optional[str] = Field(None, description="Username")
    password: str = Field(..., min_length=1, description="Пароль")
    remember_me: bool = Field(default=False, description="Запомнить меня")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация и нормализация email."""
        return str(v).lower().strip()


class LoginResponse(BaseSchema):
    """Схема для ответа после успешной аутентификации."""

    access_token: str = Field(..., description="Access токен")
    refresh_token: str = Field(..., description="Refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: Optional[int] = Field(
        None, description="Время жизни refresh токена в секундах"
    )

    # Полная информация о пользователе
    user: "UserComplete" = Field(..., description="Полная информация о пользователе")


class RefreshTokenRequest(CreateSchema, ValidationMixin):
    """Схема для запроса обновления токена."""

    refresh_token: str = Field(..., description="Refresh токен")

    @field_validator("refresh_token")
    @classmethod
    def validate_refresh_token(cls, v):
        """Валидация refresh токена."""
        if not v or not v.strip():
            raise ValueError("Refresh token cannot be empty")
        return v.strip()


class RefreshTokenResponse(BaseSchema):
    """Схема для ответа при обновлении токена."""

    access_token: str = Field(..., description="Новый access токен")
    refresh_token: Optional[str] = Field(
        None, description="Новый refresh токен (если ротация включена)"
    )
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: Optional[int] = Field(
        None, description="Время жизни refresh токена в секундах"
    )


class LogoutRequest(CreateSchema):
    """Схема для запроса выхода из системы."""

    refresh_token: Optional[str] = Field(None, description="Refresh токен для отзыва")
    logout_all: bool = Field(default=False, description="Выйти из всех устройств")


class LogoutResponse(BaseSchema):
    """Схема для ответа при выходе из системы."""

    message: str = Field(default="Successfully logged out", description="Сообщение")
    revoked_tokens: int = Field(default=0, description="Количество отозванных токенов")
    sessions_revoked: int = Field(default=0, description="Количество отозванных сессий")


# === Registration Schemas ===


class RegisterRequest(CreateSchema, ValidationMixin):
    """
    Схема для регистрации нового пользователя через форму.

    Наследует валидацию от UserBase и добавляет confirm_password.
    Используется для frontend форм, в то время как UserCreate
    используется для backend API.
    """

    username: str = Field(
        ..., min_length=2, max_length=50, description="Имя пользователя"
    )
    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., min_length=8, description="Пароль")
    confirm_password: str = Field(..., description="Подтверждение пароля")
    company_id: Optional[int] = Field(
        None, description="ID компании (если регистрируется в компании)"
    )
    auth0_id: Optional[str] = Field(None, description="Auth0 ID пользователя")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        """Валидация имени пользователя - синхронизирована с UserBase."""
        if not v or not v.strip():
            raise ValueError("Username cannot be empty")

        v = v.strip()

        # Используем более строгую валидацию как в UserBase
        import re

        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, dots, hyphens and underscores"
            )

        if v.startswith((".", "-", "_")) or v.endswith((".", "-", "_")):
            raise ValueError(
                "Username cannot start or end with dot, hyphen or underscore"
            )

        if any(combo in v for combo in ["..", "--", "__", ".-", "-_", "_."]):
            raise ValueError("Username cannot contain consecutive special characters")

        return v.lower()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация и нормализация email - синхронизирована с UserBase."""
        email_str = str(v).lower().strip()

        # Проверяем на запрещенные домены
        forbidden_domains = ["temp-mail.org", "10minutemail.com", "guerrillamail.com"]
        domain = email_str.split("@")[1] if "@" in email_str else ""

        if domain in forbidden_domains:
            raise ValueError(f"Email domain {domain} is not allowed")

        # Проверяем длину локальной части
        local_part = email_str.split("@")[0] if "@" in email_str else ""
        if len(local_part) > 64:
            raise ValueError("Email local part cannot exceed 64 characters")

        return email_str

    @field_validator("company_id")
    @classmethod
    def validate_company_id(cls, v):
        """Валидация ID компании."""
        if v is not None:
            if v <= 0:
                raise ValueError("Company ID must be a positive integer")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        """Проверка совпадения паролей."""
        if self.password != self.confirm_password:
            raise ValueError("Пароли не совпадают")
        return self


class RegisterResponse(BaseSchema):
    """
    Схема для ответа после регистрации.

    Возвращает созданного пользователя с профилем и информацию
    о необходимости верификации email.
    """

    user: "UserComplete" = Field(..., description="Созданный пользователь")
    message: str = Field(
        default="User registered successfully", description="Сообщение"
    )
    email_verification_required: bool = Field(
        default=True, description="Требуется ли подтверждение email"
    )
    verification_token_sent: bool = Field(
        default=False, description="Отправлен ли токен верификации на email"
    )


# === Password Management Schemas ===


class PasswordChangeRequest(CreateSchema, ValidationMixin):
    """Схема для смены пароля."""

    current_password: str = Field(..., description="Текущий пароль")
    new_password: str = Field(..., min_length=8, description="Новый пароль")
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @model_validator(mode="after")
    def passwords_match(self):
        """Проверка совпадения паролей."""
        if self.new_password != self.confirm_password:
            raise ValueError("Пароли не совпадают")
        return self


class PasswordResetRequest(CreateSchema, ValidationMixin):
    """Схема для запроса сброса пароля."""

    email: EmailStr = Field(..., description="Email пользователя")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация email."""
        return str(v).lower().strip()


class PasswordResetConfirm(CreateSchema, ValidationMixin):
    """Схема для подтверждения сброса пароля."""

    token: str = Field(..., description="Токен сброса пароля")
    new_password: str = Field(..., min_length=8, description="Новый пароль")
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @field_validator("token")
    @classmethod
    def validate_token(cls, v):
        """Валидация токена."""
        if not v or not v.strip():
            raise ValueError("Reset token cannot be empty")
        return v.strip()

    @model_validator(mode="after")
    def passwords_match(self):
        """Проверка совпадения паролей."""
        if self.new_password != self.confirm_password:
            raise ValueError("Пароли не совпадают")
        return self


class PasswordResetResponse(BaseSchema):
    """Схема для ответа после сброса пароля."""

    message: str = Field(..., description="Сообщение о результате")
    password_changed: bool = Field(..., description="Успешно ли изменен пароль")


# === Token Validation Schemas ===


class TokenValidationRequest(BaseSchema):
    """Схема для валидации токена."""

    token: str = Field(..., description="Токен для валидации")

    @field_validator("token")
    @classmethod
    def validate_token(cls, v):
        """Валидация токена."""
        if not v or not v.strip():
            raise ValueError("Token cannot be empty")
        return v.strip()


class TokenValidationResponse(BaseSchema):
    """Схема для ответа валидации токена."""

    valid: bool = Field(..., description="Валиден ли токен")
    expires_at: Optional[datetime] = Field(None, description="Время истечения")
    user: Optional["UserComplete"] = Field(
        None, description="Информация о пользователе"
    )
    scopes: List[str] = Field(default_factory=list, description="Права доступа токена")


# === Session Management Schemas ===


class ActiveSession(BaseSchema):
    """Схема для активной сессии пользователя."""

    id: int = Field(..., description="ID сессии")
    created_at: datetime = Field(..., description="Время создания")
    last_used_at: Optional[datetime] = Field(
        None, description="Время последнего использования"
    )
    expires_at: datetime = Field(..., description="Время истечения")
    ip_address: Optional[str] = Field(None, description="IP адрес")
    user_agent: Optional[str] = Field(None, description="User agent")
    device_type: Optional[str] = Field(None, description="Тип устройства")
    location: Optional[str] = Field(None, description="Местоположение")
    is_current: bool = Field(default=False, description="Текущая ли это сессия")

    class Config:
        from_attributes = True


class SessionListResponse(BaseSchema):
    """Схема для списка активных сессий."""

    sessions: List[ActiveSession] = Field(..., description="Список активных сессий")
    total: int = Field(..., description="Общее количество сессий")
    current_session_id: Optional[int] = Field(None, description="ID текущей сессии")


class RevokeSessionRequest(BaseSchema):
    """Схема для отзыва сессии."""

    session_id: Optional[int] = Field(None, description="ID сессии для отзыва")
    revoke_all: bool = Field(default=False, description="Отозвать все сессии")
    except_current: bool = Field(
        default=True, description="Исключить текущую сессию при отзыве всех"
    )


class RevokeSessionResponse(BaseSchema):
    """Схема для ответа при отзыве сессий."""

    message: str = Field(..., description="Сообщение о результате")
    revoked_sessions: int = Field(..., description="Количество отозванных сессий")


# === Error Schemas ===


class AuthError(BaseSchema):
    """Схема для ошибок аутентификации."""

    error: str = Field(..., description="Код ошибки")
    error_description: str = Field(..., description="Описание ошибки")
    error_details: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные детали"
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(UTC), description="Время ошибки"
    )


# === Email Verification Schemas ===


class EmailVerificationRequest(BaseSchema):
    """Схема для запроса верификации email."""

    email: EmailStr = Field(..., description="Email для верификации")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация email."""
        return str(v).lower().strip()


class EmailVerificationConfirm(BaseSchema):
    """Схема для подтверждения верификации email."""

    token: str = Field(..., description="Токен верификации email")

    @field_validator("token")
    @classmethod
    def validate_token(cls, v):
        """Валидация токена."""
        if not v or not v.strip():
            raise ValueError("Verification token cannot be empty")
        return v.strip()


class EmailVerificationResponse(BaseSchema):
    """Схема для ответа после верификации email."""

    message: str = Field(..., description="Сообщение о результате")
    verified: bool = Field(..., description="Успешно ли подтвержден email")
    user: Optional["UserComplete"] = Field(
        None, description="Информация о пользователе после верификации"
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


class TwoFactorConfirmRequest(BaseSchema):
    """Схема для подтверждения включения 2FA."""

    token: str = Field(..., description="Токен из приложения")

    @field_validator("token")
    @classmethod
    def validate_token(cls, v):
        """Валидация токена."""
        if not v or not v.strip() or len(v) != 6:
            raise ValueError("Invalid 2FA token format")
        return v.strip()


class TwoFactorVerifyRequest(BaseSchema):
    """Схема для верификации 2FA при входе."""

    email: EmailStr = Field(..., description="Email пользователя")
    token: str = Field(..., description="Токен из приложения или резервный код")

    @field_validator("token")
    @classmethod
    def validate_token(cls, v):
        """Валидация токена."""
        if not v or not v.strip():
            raise ValueError("2FA token cannot be empty")
        return v.strip()


# === User Account Status Schemas ===


class AccountStatusResponse(BaseSchema):
    """Схема для статуса аккаунта пользователя."""

    is_active: bool = Field(..., description="Активен ли аккаунт")
    email_verified: bool = Field(..., description="Подтвержден ли email")
    two_factor_enabled: bool = Field(..., description="Включена ли 2FA")
    last_login: Optional[datetime] = Field(None, description="Время последнего входа")
    account_locked: bool = Field(default=False, description="Заблокирован ли аккаунт")
    lock_reason: Optional[str] = Field(None, description="Причина блокировки")
