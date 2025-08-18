"""
Схемы для Enhanced Role System.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional, List, Dict, Any
from sqlmodel import Field
from pydantic import field_validator
from datetime import datetime

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)

# Импортируем роли из централизованного файла констант
from app.core.constants import (
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
    Permission,
)


# Enhanced Role Schemas
class EnhancedRoleBase(BaseSchema, ValidationMixin):
    """Базовая схема для расширенной роли"""

    name: str = Field(
        ..., max_length=FieldLimits.SHORT_STRING_MAX, description="Название роли"
    )
    display_name: str = Field(
        ...,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Отображаемое название",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    scope: RoleScope = Field(..., description="Область действия роли")
    role_level: int = Field(0, ge=0, description="Уровень роли")

    # Конкретные типы ролей
    system_role: Optional[SystemRole] = Field(None, description="Системная роль")
    company_role: Optional[CompanyRole] = Field(None, description="Роль компании")
    department_role: Optional[DepartmentRole] = Field(
        None, description="Роль департамента"
    )
    team_role: Optional[TeamRole] = Field(None, description="Роль команды")
    project_role: Optional[ProjectRole] = Field(None, description="Проектная роль")

    # Статус и настройки
    is_system: bool = Field(False, description="Системная роль")
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)
    is_default: bool = Field(False, description="Роль по умолчанию")
    is_assignable: bool = Field(True, description="Можно назначать")
    requires_approval: bool = Field(False, description="Требует одобрения")

    # Приоритет и иерархия
    priority: int = Field(0, description=StandardDescriptions.PRIORITY)
    max_assignees: Optional[int] = Field(
        None, ge=0, description="Макс. количество назначений"
    )

    # Расширенные настройки
    permissions_config: Optional[Dict[str, Any]] = Field(
        None, description="Конфигурация разрешений"
    )
    restrictions: Optional[Dict[str, Any]] = Field(None, description="Ограничения")
    role_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Метаданные роли", alias="metadata"
    )


class EnhancedRoleCreate(CreateSchema, EnhancedRoleBase):
    """Схема для создания роли"""

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()

    @field_validator("display_name")
    def validate_display_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Display name must be at least 2 characters long")
        return v.strip()


class EnhancedRoleUpdate(UpdateSchema):
    """Схема для обновления роли"""

    name: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    display_name: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    description: Optional[str] = Field(None, max_length=FieldLimits.TEXT_MAX)
    scope: Optional[RoleScope] = None
    role_level: Optional[int] = Field(None, ge=0)

    system_role: Optional[SystemRole] = None
    company_role: Optional[CompanyRole] = None
    department_role: Optional[DepartmentRole] = None
    team_role: Optional[TeamRole] = None
    project_role: Optional[ProjectRole] = None

    is_system: Optional[bool] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    is_assignable: Optional[bool] = None
    requires_approval: Optional[bool] = None

    priority: Optional[int] = None
    max_assignees: Optional[int] = Field(None, ge=0)

    permissions_config: Optional[Dict[str, Any]] = None
    restrictions: Optional[Dict[str, Any]] = None
    role_metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")


class EnhancedRoleResponse(ResponseSchema, EnhancedRoleBase):
    """Схема для ответа API"""

    pass


# User Role Assignment Schemas
class UserRoleAssignmentBase(BaseSchema):
    """Базовая схема для назначения роли"""

    user_id: int = Field(..., gt=0, description=StandardDescriptions.USER_ID)
    role_id: int = Field(..., gt=0, description="ID роли")

    # Контекст назначения
    company_id: Optional[int] = Field(
        None, gt=0, description=StandardDescriptions.COMPANY_ID
    )
    department_id: Optional[int] = Field(None, gt=0, description="ID департамента")
    team_id: Optional[int] = Field(None, gt=0, description="ID команды")
    project_id: Optional[int] = Field(
        None, gt=0, description=StandardDescriptions.PROJECT_ID
    )

    # Метаданные
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)
    is_primary: bool = Field(False, description="Основная роль")

    # Временные рамки
    starts_at: Optional[datetime] = Field(None, description="Начало действия")
    expires_at: Optional[datetime] = Field(None, description="Окончание действия")

    # Дополнительная информация
    assignment_reason: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Причина назначения"
    )
    conditions: Optional[Dict[str, Any]] = Field(None, description="Условия назначения")


class UserRoleAssignmentCreate(CreateSchema, UserRoleAssignmentBase):
    """Схема для создания назначения роли"""

    @field_validator("user_id")
    def validate_user_id(cls, v):
        if v <= 0:
            raise ValueError("User ID must be positive")
        return v

    @field_validator("role_id")
    def validate_role_id(cls, v):
        if v <= 0:
            raise ValueError("Role ID must be positive")
        return v


class UserRoleAssignmentUpdate(UpdateSchema):
    """Схема для обновления назначения роли"""

    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    assignment_reason: Optional[str] = Field(None, max_length=FieldLimits.TEXT_MAX)
    conditions: Optional[Dict[str, Any]] = None


class UserRoleAssignmentResponse(ResponseSchema, UserRoleAssignmentBase):
    """Схема для ответа API"""

    assigned_by: Optional[int] = Field(None, description="ID назначившего")
    approved_by: Optional[int] = Field(None, description="ID одобрившего")

    # Добавляем вычисляемые поля
    is_expired: Optional[bool] = Field(None, description="Истекла ли роль")
    is_valid: Optional[bool] = Field(None, description="Действительна ли роль")
    scope_level: Optional[RoleScope] = Field(None, description="Уровень области")
    context_string: Optional[str] = Field(None, description="Строка контекста")


class UserRoleAssignmentWithDetails(UserRoleAssignmentResponse):
    """Схема с детальной информацией о назначении роли"""

    role: Optional[EnhancedRoleResponse] = None
    user: Optional[Dict[str, Any]] = None  # Базовая информация о пользователе
    company: Optional[Dict[str, Any]] = None
    department: Optional[Dict[str, Any]] = None
    team: Optional[Dict[str, Any]] = None
    project: Optional[Dict[str, Any]] = None


# List and Filter Schemas
class RoleListResponse(ListResponseSchema[EnhancedRoleResponse]):
    """Схема для списка ролей"""

    pass


class UserRoleAssignmentListResponse(ListResponseSchema[UserRoleAssignmentResponse]):
    """Схема для списка назначений ролей"""

    pass


class RoleFilter(BaseSchema):
    """Схема для фильтрации ролей"""

    scope: Optional[RoleScope] = Field(None, description="Фильтр по области")
    is_system: Optional[bool] = Field(None, description="Фильтр по системности")
    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    is_assignable: Optional[bool] = Field(
        None, description="Фильтр по возможности назначения"
    )
    min_level: Optional[int] = Field(None, ge=0, description="Минимальный уровень")
    max_level: Optional[int] = Field(None, ge=0, description="Максимальный уровень")


class AssignmentFilter(BaseSchema):
    """Схема для фильтрации назначений ролей"""

    user_id: Optional[int] = Field(None, gt=0, description=StandardDescriptions.USER_ID)
    role_id: Optional[int] = Field(None, gt=0, description="ID роли")
    company_id: Optional[int] = Field(
        None, gt=0, description=StandardDescriptions.COMPANY_ID
    )
    department_id: Optional[int] = Field(None, gt=0, description="ID департамента")
    team_id: Optional[int] = Field(None, gt=0, description="ID команды")
    project_id: Optional[int] = Field(
        None, gt=0, description=StandardDescriptions.PROJECT_ID
    )
    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    scope: Optional[RoleScope] = Field(None, description="Фильтр по области")
