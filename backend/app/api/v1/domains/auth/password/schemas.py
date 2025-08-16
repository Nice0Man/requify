"""
Password Management Schemas.

Схемы для операций с паролями: смена, сброс, подтверждение.
"""

from pydantic import Field, EmailStr, field_validator, model_validator

from app.api.v1.common.schemas import (
    BaseSchema,
    CreateSchema,
    ValidationMixin,
)


# === Password Change Schemas ===


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


class PasswordChangeResponse(BaseSchema):
    """Схема для ответа после смены пароля."""

    message: str = Field(
        default="Password changed successfully", description="Сообщение"
    )
    password_changed: bool = Field(
        default=True, description="Успешно ли изменен пароль"
    )


# === Password Reset Schemas ===


class PasswordResetRequest(CreateSchema, ValidationMixin):
    """Схема для запроса сброса пароля."""

    email: EmailStr = Field(..., description="Email пользователя")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация email."""
        return str(v).lower().strip()


class PasswordResetResponse(BaseSchema):
    """Схема для ответа после запроса сброса пароля."""

    message: str = Field(..., description="Сообщение о результате")
    reset_token_sent: bool = Field(
        default=True, description="Отправлен ли токен на email"
    )


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


class PasswordResetConfirmResponse(BaseSchema):
    """Схема для ответа после сброса пароля."""

    message: str = Field(..., description="Сообщение о результате")
    password_changed: bool = Field(..., description="Успешно ли изменен пароль")
