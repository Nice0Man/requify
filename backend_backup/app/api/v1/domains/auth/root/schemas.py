"""
Root Authentication Schemas.

Схемы для основных операций аутентификации: login, register, logout.
"""

from datetime import datetime
from typing import Annotated, Optional, TYPE_CHECKING

from pydantic import Field, EmailStr, field_validator, model_validator

from app.api.v1.common.schemas import (
    BaseSchema,
    CreateSchema,
    ValidationMixin,
)

if TYPE_CHECKING:
    from app.schemas.user import UserDetailed


# === Base Token Schemas ===


class TokenPair(BaseSchema):
    """Схема для пары токенов (access + refresh)."""

    access_token: str = Field(..., description="Access токен")
    refresh_token: str = Field(..., description="Refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: int = Field(
        ..., description="Время жизни refresh токена в секундах"
    )


# === Login Schemas ===


class LoginRequest(BaseSchema):
    """Схема для запроса аутентификации."""

    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., min_length=1, description="Пароль")
    remember_me: bool = Field(default=False, description="Запомнить меня")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация email."""
        if not v or not str(v).strip():
            raise ValueError("Email cannot be empty")
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
    user: "UserDetailed" = Field(..., description="Полная информация о пользователе")


# === Register Schemas ===


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

    user: "UserDetailed" = Field(..., description="Созданный пользователь")
    message: str = Field(
        default="User registered successfully", description="Сообщение"
    )
    email_verification_required: bool = Field(
        default=True, description="Требуется ли подтверждение email"
    )
    verification_token_sent: bool = Field(
        default=False, description="Отправлен ли токен верификации на email"
    )


# === Logout Schemas ===


class LogoutRequest(CreateSchema):
    """Схема для запроса выхода из системы."""

    refresh_token: Optional[str] = Field(None, description="Refresh токен для отзыва")
    logout_all: bool = Field(default=False, description="Выйти из всех устройств")


class LogoutResponse(BaseSchema):
    """Схема для ответа при выходе из системы."""

    message: str = Field(default="Successfully logged out", description="Сообщение")
    revoked_tokens: int = Field(default=0, description="Количество отозванных токенов")
    sessions_revoked: int = Field(default=0, description="Количество отозванных сессий")


# === Token Validation Schemas ===


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
    scopes: list[str] = Field(default_factory=list, description="Права доступа токена")
    user: Optional["UserDetailed"] = Field(
        None, description="Информация о пользователе если токен валиден"
    )


def rebuild_auth_models():
    """Rebuild models to resolve forward references."""
    try:
        from app.schemas.user import UserDetailed

        # Import all response models that use UserDetailed
        globals_dict = globals()
        models_to_rebuild = [
            "LoginResponse",
            "RegisterResponse",
            "TokenValidationResponse",
        ]

        for model_name in models_to_rebuild:
            if model_name in globals_dict:
                model_class = globals_dict[model_name]
                if hasattr(model_class, "model_rebuild"):
                    try:
                        model_class.model_rebuild()
                    except Exception:
                        pass  # Ignore rebuild errors
    except Exception:
        pass  # Ignore any import or rebuild errors
