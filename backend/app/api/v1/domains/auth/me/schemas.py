"""
Current User (Me) Schemas.

Схемы для операций с данными текущего пользователя.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema

if TYPE_CHECKING:
    from app.schemas.user import UserDetailed


# === Current User Info Schemas ===


class CurrentUserResponse(BaseSchema):
    """Схема для ответа с информацией о текущем пользователе."""

    user: "UserDetailed" = Field(..., description="Полная информация о пользователе")


class AccountStatusResponse(BaseSchema):
    """Схема для статуса аккаунта пользователя."""

    is_active: bool = Field(..., description="Активен ли аккаунт")
    email_verified: bool = Field(..., description="Подтвержден ли email")
    two_factor_enabled: bool = Field(..., description="Включена ли 2FA")
    last_login: Optional[datetime] = Field(None, description="Время последнего входа")
    account_locked: bool = Field(default=False, description="Заблокирован ли аккаунт")
    lock_reason: Optional[str] = Field(None, description="Причина блокировки")


def rebuild_me_models():
    """Rebuild models to resolve forward references."""
    try:
        from app.schemas.user import UserDetailed

        globals_dict = globals()
        models_to_rebuild = [
            "CurrentUserResponse",
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
