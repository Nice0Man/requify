"""
Departments Management Schemas.

Pydantic models для операций с департаментами.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DepartmentType(str, Enum):
    """Типы департаментов."""

    BUSINESS = "business"
    TECHNICAL = "technical"
    SUPPORT = "support"
    MANAGEMENT = "management"
    SALES = "sales"
    MARKETING = "marketing"
    HR = "hr"
    FINANCE = "finance"
    OTHER = "other"


# =============================================================================
# Base Schemas
# =============================================================================


class DepartmentBase(BaseModel):
    """Базовая схема департамента."""

    name: str = Field(
        ..., min_length=1, max_length=255, description="Название департамента"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание департамента"
    )
    department_type: DepartmentType = Field(
        DepartmentType.OTHER, description="Тип департамента"
    )
    parent_id: Optional[int] = Field(None, description="ID родительского департамента")

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Engineering",
                    "description": "Software development and engineering teams",
                    "department_type": "technical",
                    "parent_id": None,
                }
            ]
        }
    )


class DepartmentCreate(DepartmentBase):
    """Схема для создания департамента."""

    company_id: int = Field(..., description="ID компании")
    head_user_id: Optional[int] = Field(
        None, description="ID руководителя департамента"
    )


class DepartmentUpdate(BaseModel):
    """Схема для обновления департамента."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    department_type: Optional[DepartmentType] = Field(None)
    parent_id: Optional[int] = Field(None)
    head_user_id: Optional[int] = Field(None)


# =============================================================================
# Response Schemas
# =============================================================================


class DepartmentRead(DepartmentBase):
    """Схема для чтения информации о департаменте."""

    id: int = Field(..., description="ID департамента")
    company_id: int = Field(..., description="ID компании")
    head_user_id: Optional[int] = Field(None, description="ID руководителя")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")

    # Статистика
    members_count: int = Field(0, description="Количество участников")
    teams_count: int = Field(0, description="Количество команд")
    subdepartments_count: int = Field(0, description="Количество поддепартаментов")

    model_config = ConfigDict(from_attributes=True)


class DepartmentWithChildren(DepartmentRead):
    """Схема департамента с дочерними департаментами."""

    children: List["DepartmentWithChildren"] = Field(
        [], description="Дочерние департаменты"
    )


class DepartmentListResponse(BaseModel):
    """Схема для списка департаментов."""

    departments: List[DepartmentRead] = Field(..., description="Список департаментов")
    total: int = Field(..., description="Общее количество")
    skip: int = Field(..., description="Пропущено записей")
    limit: int = Field(..., description="Лимит записей")


class DepartmentHierarchyResponse(BaseModel):
    """Схема для иерархии департаментов."""

    hierarchy: List[DepartmentWithChildren] = Field(
        ..., description="Иерархия департаментов"
    )
    company_id: int = Field(..., description="ID компании")


# =============================================================================
# Department Members Schemas
# =============================================================================


class DepartmentMemberRole(str, Enum):
    """Роли участников департамента."""

    HEAD = "head"
    DEPUTY_HEAD = "deputy_head"
    SENIOR_MANAGER = "senior_manager"
    MANAGER = "manager"
    COORDINATOR = "coordinator"
    MEMBER = "member"


class DepartmentMemberBase(BaseModel):
    """Базовая схема участника департамента."""

    user_id: int = Field(..., description="ID пользователя")
    role: DepartmentMemberRole = Field(
        DepartmentMemberRole.MEMBER, description="Роль в департаменте"
    )
    joined_at: Optional[datetime] = Field(None, description="Дата присоединения")


class DepartmentMemberAdd(BaseModel):
    """Схема для добавления участника в департамент."""

    user_id: int = Field(..., description="ID пользователя")
    role: DepartmentMemberRole = Field(DepartmentMemberRole.MEMBER, description="Роль")


class DepartmentMemberRead(DepartmentMemberBase):
    """Схема для чтения информации об участнике департамента."""

    id: int = Field(..., description="ID записи")
    department_id: int = Field(..., description="ID департамента")

    # User info (joined from user table)
    user_name: str = Field(..., description="Имя пользователя")
    user_email: str = Field(..., description="Email пользователя")
    user_avatar_url: Optional[str] = Field(None, description="URL аватара")

    created_at: datetime = Field(..., description="Дата создания записи")

    model_config = ConfigDict(from_attributes=True)


class DepartmentMembersResponse(BaseModel):
    """Схема для списка участников департамента."""

    members: List[DepartmentMemberRead] = Field(..., description="Список участников")
    department_id: int = Field(..., description="ID департамента")
    total: int = Field(..., description="Общее количество")
    skip: int = Field(..., description="Пропущено записей")
    limit: int = Field(..., description="Лимит записей")
