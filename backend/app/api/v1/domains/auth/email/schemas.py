"""
Email Verification Schemas.

Схемы для верификации email адресов.
"""

from typing import Optional, TYPE_CHECKING

from pydantic import Field, EmailStr, field_validator

from app.api.v1.common.schemas import (
    BaseSchema,
    ValidationMixin,
)

if TYPE_CHECKING:
    from app.schemas.user import UserDetailed


# === Email Verification Schemas ===


class EmailVerificationRequest(BaseSchema):
    """Схема для запроса верификации email."""

    email: EmailStr = Field(..., description="Email для верификации")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        """Валидация email."""
        return str(v).lower().strip()


class EmailVerificationResponse(BaseSchema):
    """Схема для ответа после запроса верификации email."""

    message: str = Field(..., description="Сообщение о результате")
    verification_token_sent: bool = Field(
        default=True, description="Отправлен ли токен верификации"
    )


class EmailVerificationConfirm(BaseSchema, ValidationMixin):
    """Схема для подтверждения верификации email."""

    token: str = Field(..., description="Токен верификации email")

    @field_validator("token")
    @classmethod
    def validate_token(cls, v):
        """Валидация токена."""
        if not v or not v.strip():
            raise ValueError("Verification token cannot be empty")
        return v.strip()


class EmailVerificationConfirmResponse(BaseSchema):
    """Схема для ответа после верификации email."""

    message: str = Field(..., description="Сообщение о результате")
    verified: bool = Field(..., description="Успешно ли подтвержден email")
    user: Optional["UserDetailed"] = Field(
        None, description="Информация о пользователе после верификации"
    )


def rebuild_email_models():
    """Rebuild models to resolve forward references."""
    try:
        from app.schemas.user import UserDetailed

        globals_dict = globals()
        models_to_rebuild = [
            "EmailVerificationConfirmResponse",
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
