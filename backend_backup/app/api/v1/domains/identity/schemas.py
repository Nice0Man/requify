"""
Common Identity Management Schemas.

Общие схемы для домена управления идентификацией, используемые во всех поддоменах.
Конкретные схемы находятся в соответствующих поддоменах.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import Field, EmailStr

from app.api.v1.common.schemas import BaseSchema


# === Common Identity Enums ===


class IdentityStatus(str, Enum):
    """Общие статусы для сущностей идентификации."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"
    DELETED = "deleted"


class ContextType(str, Enum):
    """Типы контекста для разрешений и ролей."""

    SYSTEM = "system"
    COMPANY = "company"
    PROJECT = "project"
    TEAM = "team"
    DEPARTMENT = "department"


# === Base Identity Schemas ===


class IdentityOperationResponse(BaseSchema):
    """Базовая схема для ответа операции идентификации."""

    success: bool = Field(..., description="Успешно ли выполнена операция")
    message: str = Field(..., description="Сообщение о результате")
    entity_id: Optional[int] = Field(None, description="ID сущности")
    entity_type: Optional[str] = Field(None, description="Тип сущности")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время операции"
    )


class IdentityErrorResponse(BaseSchema):
    """Схема для ошибок операций идентификации."""

    error_code: str = Field(..., description="Код ошибки")
    error_message: str = Field(..., description="Сообщение об ошибке")
    entity_type: Optional[str] = Field(None, description="Тип сущности")
    entity_id: Optional[int] = Field(None, description="ID сущности")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время ошибки"
    )
    request_id: Optional[str] = Field(None, description="ID запроса")


# === Common User Info Schemas ===


class BasicUserInfo(BaseSchema):
    """Базовая информация о пользователе."""

    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    is_active: bool = Field(..., description="Is user active")


class UserContext(BaseSchema):
    """Контекст пользователя для разрешений."""

    user_id: int = Field(..., description="User ID")
    context_type: ContextType = Field(..., description="Context type")
    context_id: int = Field(..., description="Context ID")
    roles: List[str] = Field(..., description="User roles in context")


# === Common Pagination Schemas ===


class PaginationRequest(BaseSchema):
    """Схема для запроса пагинации."""

    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")


class PaginationInfo(BaseSchema):
    """Схема для информации о пагинации."""

    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    total: int = Field(..., description="Общее количество элементов")
    pages: int = Field(..., description="Общее количество страниц")


class BaseListResponse(BaseSchema):
    """Базовая схема для списков с пагинацией."""

    pagination: PaginationInfo = Field(..., description="Информация о пагинации")


from .root.schemas import (
    TimezoneResponse,
    LanguageResponse,
    TimezoneListResponse,
    LanguageListResponse,
)


# Импорты из поддоменов для обратной совместимости
from .users.schemas import (
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse,
    UserDetailResponse,
    UserListResponse,
    UserOperationResponse,
)

from .profiles.schemas import (
    ProfileUpdateRequest,
    UserPreferencesRequest,
    ExtendedProfileResponse,
    PublicProfileResponse,
    UserPreferencesResponse,
    UserActivityResponse,
    UserStatsResponse,
    AvatarUploadResponse,
)

from .roles.schemas import (
    RoleCreateRequest,
    RoleUpdateRequest,
    RoleResponse,
    RoleDetailResponse,
    RoleListResponse,
    RoleOperationResponse,
)

from .permissions.schemas import (
    PermissionCheckRequest,
    PermissionBulkCheckRequest,
    PermissionCheckResponse,
    UserPermissionsResponse,
    PermissionMatrixResponse,
    PermissionOperationResponse,
)

__all__ = [
    # Основные схемы идентификации
    "TimezoneResponse",
    "LanguageResponse",
    "TimezoneListResponse",
    "LanguageListResponse",
    # Схемы пользователей
    "UserCreateRequest",
    "UserUpdateRequest",
    "UserResponse",
    "UserDetailResponse",
    "UserListResponse",
    "UserOperationResponse",
    # Схемы профилей
    "ProfileUpdateRequest",
    "UserPreferencesRequest",
    "ExtendedProfileResponse",
    "PublicProfileResponse",
    "UserPreferencesResponse",
    "UserActivityResponse",
    "UserStatsResponse",
    "AvatarUploadResponse",
    # Схемы ролей
    "RoleCreateRequest",
    "RoleUpdateRequest",
    "RoleResponse",
    "RoleDetailResponse",
    "RoleListResponse",
    "RoleOperationResponse",
    # Схемы разрешений
    "PermissionCheckRequest",
    "PermissionBulkCheckRequest",
    "PermissionCheckResponse",
    "UserPermissionsResponse",
    "PermissionMatrixResponse",
    "PermissionOperationResponse",
]
