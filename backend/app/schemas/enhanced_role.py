"""
Схемы для Enhanced Role System.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum


class RoleScope(str, Enum):
    """Области действия ролей"""

    SYSTEM = "system"
    COMPANY = "company"
    DEPARTMENT = "department"
    TEAM = "team"
    PROJECT = "project"
    RESOURCE = "resource"


class SystemRole(str, Enum):
    """Системные роли"""

    SYSTEM_ADMIN = "system_admin"
    PLATFORM_ADMIN = "platform_admin"
    SUPPORT_ADMIN = "support_admin"
    SUPPORT_AGENT = "support_agent"
    BILLING_ADMIN = "billing_admin"
    SECURITY_AUDITOR = "security_auditor"
    COMPLIANCE_OFFICER = "compliance_officer"
    DEVELOPER = "developer"
    DATA_ANALYST = "data_analyst"


class CompanyRole(str, Enum):
    """Роли на уровне компании"""

    COMPANY_ADMIN = "company_admin"
    COMPANY_OWNER = "company_owner"
    BILLING_MANAGER = "billing_manager"
    HR_MANAGER = "hr_manager"
    COMPLIANCE_MANAGER = "compliance_manager"
    SECURITY_MANAGER = "security_manager"
    COMPANY_VIEWER = "company_viewer"


class DepartmentRole(str, Enum):
    """Роли на уровне департамента"""

    DEPARTMENT_HEAD = "department_head"
    DEPARTMENT_ADMIN = "department_admin"
    DEPUTY_HEAD = "deputy_head"
    SENIOR_MANAGER = "senior_manager"
    MANAGER = "manager"
    COORDINATOR = "coordinator"
    DEPARTMENT_VIEWER = "department_viewer"


class TeamRole(str, Enum):
    """Роли на уровне команды"""

    TEAM_LEAD = "team_lead"
    TECH_LEAD = "tech_lead"
    SENIOR_MEMBER = "senior_member"
    MEMBER = "member"
    MENTOR = "mentor"
    SCRUM_MASTER = "scrum_master"
    PRODUCT_OWNER = "product_owner"
    TEAM_VIEWER = "team_viewer"


class ProjectRole(str, Enum):
    """Роли на уровне проекта"""

    PROJECT_MANAGER = "project_manager"
    PROJECT_OWNER = "project_owner"
    ARCHITECT = "architect"
    SENIOR_DEVELOPER = "senior_developer"
    DEVELOPER = "developer"
    FRONTEND_DEVELOPER = "frontend_developer"
    BACKEND_DEVELOPER = "backend_developer"
    MOBILE_DEVELOPER = "mobile_developer"
    DEVOPS_ENGINEER = "devops_engineer"
    QA_ENGINEER = "qa_engineer"
    TEST_AUTOMATION_ENGINEER = "test_automation_engineer"
    BUSINESS_ANALYST = "business_analyst"
    PRODUCT_ANALYST = "product_analyst"
    DATA_ANALYST = "data_analyst"
    UX_DESIGNER = "ux_designer"
    UI_DESIGNER = "ui_designer"
    TECHNICAL_WRITER = "technical_writer"
    PROJECT_VIEWER = "project_viewer"
    STAKEHOLDER = "stakeholder"
    CLIENT = "client"


# Enhanced Role Schemas
class EnhancedRoleBase(BaseModel):
    """Базовая схема для расширенной роли"""

    name: str
    display_name: str
    description: Optional[str] = None
    scope: RoleScope
    role_level: int = 0

    # Конкретные типы ролей
    system_role: Optional[SystemRole] = None
    company_role: Optional[CompanyRole] = None
    department_role: Optional[DepartmentRole] = None
    team_role: Optional[TeamRole] = None
    project_role: Optional[ProjectRole] = None

    # Статус и настройки
    is_system: bool = False
    is_active: bool = True
    is_default: bool = False
    is_assignable: bool = True
    requires_approval: bool = False

    # Приоритет и иерархия
    priority: int = 0
    max_assignees: Optional[int] = None

    # Расширенные настройки
    permissions_config: Optional[Dict[str, Any]] = None
    restrictions: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class EnhancedRoleCreate(EnhancedRoleBase):
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


class EnhancedRoleUpdate(BaseModel):
    """Схема для обновления роли"""

    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    scope: Optional[RoleScope] = None
    role_level: Optional[int] = None

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
    max_assignees: Optional[int] = None

    permissions_config: Optional[Dict[str, Any]] = None
    restrictions: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class EnhancedRoleInDB(EnhancedRoleBase):
    """Схема для данных из базы данных"""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnhancedRoleResponse(EnhancedRoleInDB):
    """Схема для ответа API"""

    pass


# User Role Assignment Schemas
class UserRoleAssignmentBase(BaseModel):
    """Базовая схема для назначения роли"""

    user_id: int
    role_id: int

    # Контекст назначения
    company_id: Optional[int] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    project_id: Optional[int] = None

    # Метаданные
    is_active: bool = True
    is_primary: bool = False

    # Временные рамки
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    # Дополнительная информация
    assignment_reason: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = None


class UserRoleAssignmentCreate(UserRoleAssignmentBase):
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


class UserRoleAssignmentUpdate(BaseModel):
    """Схема для обновления назначения роли"""

    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    assignment_reason: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = None


class UserRoleAssignmentInDB(UserRoleAssignmentBase):
    """Схема для данных из базы данных"""

    id: int
    assigned_by: Optional[int] = None
    approved_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserRoleAssignmentResponse(UserRoleAssignmentInDB):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    is_expired: Optional[bool] = None
    is_valid: Optional[bool] = None
    scope_level: Optional[RoleScope] = None
    context_string: Optional[str] = None


class UserRoleAssignmentWithDetails(UserRoleAssignmentResponse):
    """Схема с детальной информацией о назначении роли"""

    role: Optional[EnhancedRoleResponse] = None
    user: Optional[Dict[str, Any]] = None  # Базовая информация о пользователе
    company: Optional[Dict[str, Any]] = None
    department: Optional[Dict[str, Any]] = None
    team: Optional[Dict[str, Any]] = None
    project: Optional[Dict[str, Any]] = None


# List and Filter Schemas
class RoleListResponse(BaseModel):
    """Схема для списка ролей"""

    roles: List[EnhancedRoleResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class UserRoleAssignmentListResponse(BaseModel):
    """Схема для списка назначений ролей"""

    assignments: List[UserRoleAssignmentResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class RoleFilter(BaseModel):
    """Схема для фильтрации ролей"""

    scope: Optional[RoleScope] = None
    is_system: Optional[bool] = None
    is_active: Optional[bool] = None
    is_assignable: Optional[bool] = None
    min_level: Optional[int] = None
    max_level: Optional[int] = None


class AssignmentFilter(BaseModel):
    """Схема для фильтрации назначений ролей"""

    user_id: Optional[int] = None
    role_id: Optional[int] = None
    company_id: Optional[int] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    project_id: Optional[int] = None
    is_active: Optional[bool] = None
    scope: Optional[RoleScope] = None
