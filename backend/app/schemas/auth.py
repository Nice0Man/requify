"""
Схемы для аутентификации.

Модуль содержит Pydantic модели для работы с JWT токенами,
данными аутентификации и авторизации, следуя принципам SOLID и DRY.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

# === Base Token Schemas (Single Responsibility Principle) ===


class TokenBase(BaseModel):
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


class TokenPair(BaseModel):
    """Схема для пары токенов (access + refresh)."""

    access_token: str = Field(..., description="Access токен")
    refresh_token: str = Field(..., description="Refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: int = Field(
        ..., description="Время жизни refresh токена в секундах"
    )


# === JWT Payload Schemas ===


class AccessTokenPayload(BaseModel):
    """Схема для данных внутри access JWT токена."""

    sub: str = Field(..., description="Subject (user email)")
    exp: int = Field(..., description="Expiration time (timestamp)")
    iat: int = Field(..., description="Issued at (timestamp)")
    type: str = Field(default="access", description="Тип токена")
    user_id: int = Field(..., description="ID пользователя")
    scopes: list[str] = Field(default_factory=list, description="Права доступа")


class RefreshTokenPayload(BaseModel):
    """Схема для данных внутри refresh JWT токена."""

    sub: str = Field(..., description="Subject (user email)")
    exp: int = Field(..., description="Expiration time (timestamp)")
    iat: int = Field(..., description="Issued at (timestamp)")
    type: str = Field(default="refresh", description="Тип токена")
    user_id: int = Field(..., description="ID пользователя")
    token_id: str = Field(..., description="ID refresh токена в БД")


class TokenData(BaseModel):
    """Схема для валидации токена."""

    email: Optional[str] = Field(None, description="Email пользователя")
    user_id: Optional[int] = Field(None, description="ID пользователя")
    scopes: list[str] = Field(default_factory=list, description="Права доступа")


# === Authentication Request/Response Schemas ===


class LoginRequest(BaseModel):
    """Схема для запроса аутентификации."""

    email: EmailStr = Field(..., description="Email")
    username: Optional[str] = Field(None, description="Username")
    password: str = Field(..., min_length=1, description="Пароль")
    remember_me: bool = Field(default=False, description="Запомнить меня")


class LoginResponse(BaseModel):
    """Схема для ответа после успешной аутентификации."""

    access_token: str = Field(..., description="Access токен")
    refresh_token: str = Field(..., description="Refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: int = Field(
        ..., description="Время жизни refresh токена в секундах"
    )

    # Информация о пользователе
    user: "UserProfile" = Field(..., description="Информация о пользователе")
    permissions: list[str] = Field(
        default_factory=list, description="Права доступа пользователя"
    )

    class Config:
        from_attributes = True


class RefreshTokenRequest(BaseModel):
    """Схема для запроса обновления токена."""

    refresh_token: str = Field(..., description="Refresh токен")


class RefreshTokenResponse(BaseModel):
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


class LogoutRequest(BaseModel):
    """Схема для запроса выхода из системы."""

    refresh_token: Optional[str] = Field(None, description="Refresh токен для отзыва")
    logout_all: bool = Field(default=False, description="Выйти из всех устройств")


class LogoutResponse(BaseModel):
    """Схема для ответа при выходе из системы."""

    message: str = Field(default="Successfully logged out", description="Сообщение")
    revoked_tokens: int = Field(default=0, description="Количество отозванных токенов")


# === User Profile Schema (for authentication responses) ===


class UserProfile(BaseModel):
    """Схема профиля пользователя для аутентификации."""

    id: int = Field(..., description="ID пользователя")
    username: str = Field(..., description="Имя пользователя")
    email: EmailStr = Field(..., description="Email пользователя")
    name: Optional[str] = Field(None, description="Полное имя")
    role: str = Field(..., description="Роль пользователя")
    is_active: bool = Field(..., description="Активен ли пользователь")
    is_superuser: bool = Field(..., description="Является ли суперпользователем")
    email_verified: bool = Field(default=False, description="Подтвержден ли email")
    email_verified_at: Optional[datetime] = Field(
        None, description="Время подтверждения email"
    )
    last_login: Optional[datetime] = Field(None, description="Время последнего входа")

    class Config:
        from_attributes = True


# === Password Management Schemas ===


class PasswordChangeRequest(BaseModel):
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


class PasswordResetRequest(BaseModel):
    """Схема для запроса сброса пароля."""

    email: EmailStr = Field(..., description="Email пользователя")


class PasswordResetConfirm(BaseModel):
    """Схема для подтверждения сброса пароля."""

    token: str = Field(..., description="Токен сброса пароля")
    new_password: str = Field(..., min_length=8, description="Новый пароль")
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @model_validator(mode="after")
    def passwords_match(self):
        """Проверка совпадения паролей."""
        if self.new_password != self.confirm_password:
            raise ValueError("Пароли не совпадают")
        return self


# === Token Validation Schemas ===


class TokenValidationRequest(BaseModel):
    """Схема для валидации токена."""

    token: str = Field(..., description="Токен для валидации")


class TokenValidationResponse(BaseModel):
    """Схема для ответа валидации токена."""

    valid: bool = Field(..., description="Валиден ли токен")
    expires_at: Optional[datetime] = Field(None, description="Время истечения")
    user: Optional[UserProfile] = Field(None, description="Информация о пользователе")


# === Session Management Schemas ===


class ActiveSession(BaseModel):
    """Схема для активной сессии пользователя."""

    id: int = Field(..., description="ID сессии")
    created_at: datetime = Field(..., description="Время создания")
    last_used_at: Optional[datetime] = Field(
        None, description="Время последнего использования"
    )
    expires_at: datetime = Field(..., description="Время истечения")
    ip_address: Optional[str] = Field(None, description="IP адрес")
    user_agent: Optional[str] = Field(None, description="User agent")
    is_current: bool = Field(default=False, description="Текущая ли это сессия")

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """Схема для списка активных сессий."""

    sessions: list[ActiveSession] = Field(..., description="Список активных сессий")
    total: int = Field(..., description="Общее количество сессий")


class RevokeSessionRequest(BaseModel):
    """Схема для отзыва сессии."""

    session_id: Optional[int] = Field(None, description="ID сессии для отзыва")
    revoke_all: bool = Field(default=False, description="Отозвать все сессии")


# === Error Schemas ===


class AuthError(BaseModel):
    """Схема для ошибок аутентификации."""

    error: str = Field(..., description="Код ошибки")
    error_description: str = Field(..., description="Описание ошибки")
    error_details: Optional[dict] = Field(None, description="Дополнительные детали")


# === Email Verification Schemas ===


class EmailVerificationRequest(BaseModel):
    """Схема для запроса верификации email."""

    email: EmailStr = Field(..., description="Email для верификации")

    @field_validator("email")
    def validate_email(cls, v):
        """Валидация email"""
        return str(v).lower()


class EmailVerificationConfirm(BaseModel):
    """Схема для подтверждения верификации email."""

    token: str = Field(..., description="Токен верификации email")

    @field_validator("token")
    def validate_token(cls, v):
        """Валидация токена"""
        if not v or not v.strip():
            raise ValueError("Verification token cannot be empty")
        return v.strip()


class EmailVerificationResponse(BaseModel):
    """Схема для ответа после верификации email."""

    message: str = Field(..., description="Сообщение о результате")
    verified: bool = Field(..., description="Успешно ли подтвержден email")


# Forward reference resolution
LoginResponse.model_rebuild()
TokenValidationResponse.model_rebuild()
