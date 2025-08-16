"""
OAuth2 Authentication Schemas.

Схемы для OAuth2 интеграции (Auth0, Google, GitHub и др.).
"""

from typing import Optional, Dict, Any, TYPE_CHECKING

from pydantic import Field, field_validator

from app.api.v1.common.schemas import (
    BaseSchema,
    CreateSchema,
    ValidationMixin,
)

if TYPE_CHECKING:
    from app.schemas.user import UserDetailed


# === OAuth2 Authorization Schemas ===


class OAuth2AuthorizeRequest(BaseSchema):
    """Схема для запроса авторизации OAuth2."""

    provider: str = Field(..., description="Провайдер OAuth2 (auth0, google, github)")
    redirect_uri: Optional[str] = Field(None, description="URI для редиректа")
    state: Optional[str] = Field(None, description="State parameter для CSRF защиты")

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v):
        """Валидация провайдера."""
        allowed_providers = ["auth0", "google", "github", "microsoft"]
        if v.lower() not in allowed_providers:
            raise ValueError(f"Provider must be one of: {', '.join(allowed_providers)}")
        return v.lower()


class OAuth2AuthorizeResponse(BaseSchema):
    """Схема для ответа авторизации OAuth2."""

    authorization_url: str = Field(..., description="URL для авторизации")
    state: str = Field(..., description="State parameter")


# === OAuth2 Callback Schemas ===


class OAuth2CallbackRequest(CreateSchema, ValidationMixin):
    """Схема для обработки callback от OAuth2 провайдера."""

    code: str = Field(..., description="Authorization code")
    state: Optional[str] = Field(None, description="State parameter")
    error: Optional[str] = Field(None, description="Error code если произошла ошибка")
    error_description: Optional[str] = Field(None, description="Описание ошибки")

    @field_validator("code")
    @classmethod
    def validate_code(cls, v):
        """Валидация authorization code."""
        if not v or not v.strip():
            raise ValueError("Authorization code cannot be empty")
        return v.strip()


class OAuth2CallbackResponse(BaseSchema):
    """Схема для ответа после обработки OAuth2 callback."""

    access_token: str = Field(..., description="Access токен")
    refresh_token: str = Field(..., description="Refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена в секундах")
    refresh_expires_in: Optional[int] = Field(
        None, description="Время жизни refresh токена в секундах"
    )

    # Информация о пользователе
    user: "UserDetailed" = Field(..., description="Информация о пользователе")
    is_new_user: bool = Field(default=False, description="Новый ли это пользователь")


# === OAuth2 User Info Schemas ===


class OAuth2UserInfo(BaseSchema):
    """Схема для информации о пользователе от OAuth2 провайдера."""

    sub: str = Field(..., description="Subject identifier")
    email: Optional[str] = Field(None, description="Email")
    email_verified: Optional[bool] = Field(None, description="Подтвержден ли email")
    name: Optional[str] = Field(None, description="Полное имя")
    given_name: Optional[str] = Field(None, description="Имя")
    family_name: Optional[str] = Field(None, description="Фамилия")
    picture: Optional[str] = Field(None, description="URL аватара")
    locale: Optional[str] = Field(None, description="Локаль")
    provider: str = Field(..., description="Провайдер OAuth2")
    raw_data: Optional[Dict[str, Any]] = Field(
        None, description="Сырые данные от провайдера"
    )


# === OAuth2 Link/Unlink Schemas ===


class OAuth2LinkRequest(CreateSchema):
    """Схема для привязки OAuth2 аккаунта к существующему пользователю."""

    provider: str = Field(..., description="Провайдер OAuth2")
    access_token: str = Field(..., description="Access токен от провайдера")

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v):
        """Валидация провайдера."""
        allowed_providers = ["auth0", "google", "github", "microsoft"]
        if v.lower() not in allowed_providers:
            raise ValueError(f"Provider must be one of: {', '.join(allowed_providers)}")
        return v.lower()


class OAuth2LinkResponse(BaseSchema):
    """Схема для ответа после привязки OAuth2 аккаунта."""

    message: str = Field(..., description="Сообщение о результате")
    linked: bool = Field(..., description="Успешно ли привязан аккаунт")
    provider: str = Field(..., description="Провайдер")


class OAuth2UnlinkRequest(BaseSchema):
    """Схема для отвязки OAuth2 аккаунта."""

    provider: str = Field(..., description="Провайдер OAuth2")

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v):
        """Валидация провайдера."""
        allowed_providers = ["auth0", "google", "github", "microsoft"]
        if v.lower() not in allowed_providers:
            raise ValueError(f"Provider must be one of: {', '.join(allowed_providers)}")
        return v.lower()


class OAuth2UnlinkResponse(BaseSchema):
    """Схема для ответа после отвязки OAuth2 аккаунта."""

    message: str = Field(..., description="Сообщение о результате")
    unlinked: bool = Field(..., description="Успешно ли отвязан аккаунт")
    provider: str = Field(..., description="Провайдер")


def rebuild_oauth2_models():
    """Rebuild models to resolve forward references."""
    try:
        from app.schemas.user import UserDetailed

        globals_dict = globals()
        models_to_rebuild = [
            "OAuth2CallbackResponse",
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
