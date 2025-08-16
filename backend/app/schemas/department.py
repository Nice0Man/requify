"""
Схемы для модели Department.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional, List
from sqlmodel import Field
from pydantic import field_validator
from datetime import datetime
from enum import Enum

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    CompanyRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class DepartmentType(str, Enum):
    """Типы департаментов"""

    DEVELOPMENT = "development"
    MARKETING = "marketing"
    SALES = "sales"
    SUPPORT = "support"
    HR = "hr"
    FINANCE = "finance"
    OPERATIONS = "operations"
    LEGAL = "legal"
    RESEARCH = "research"
    DESIGN = "design"
    QA = "qa"
    DEVOPS = "devops"
    DATA = "data"
    PRODUCT = "product"
    BUSINESS = "business"
    ADMINISTRATION = "administration"
    CUSTOMER_SUCCESS = "customer_success"
    PROCUREMENT = "procurement"
    SECURITY = "security"
    OTHER = "other"


class DepartmentBase(BaseSchema, ValidationMixin):
    """Базовая схема для департамента"""

    name: str = Field(
        ...,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME,
    )
    slug: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="URL-слаг департамента",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    type: DepartmentType = Field(..., description="Тип департамента")

    # Иерархия
    parent_id: Optional[int] = Field(
        None, gt=0, description="ID родительского департамента"
    )

    # Руководство
    head_id: Optional[int] = Field(None, gt=0, description="ID руководителя")

    # Статус
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    # Метаданные
    employee_count: int = Field(0, ge=0, description="Количество сотрудников")
    team_count: int = Field(0, ge=0, description="Количество команд")
    budget_allocated: Optional[float] = Field(
        None, ge=0, description="Выделенный бюджет"
    )

    # Контактная информация
    location: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Местоположение"
    )
    email: Optional[str] = Field(
        None, max_length=FieldLimits.EMAIL_MAX, description="Email департамента"
    )
    phone: Optional[str] = Field(
        None, max_length=FieldLimits.PHONE_MAX, description="Телефон департамента"
    )

    @field_validator("slug")
    def generate_slug(cls, v, values):
        if v:
            return v
        if "name" in values:
            return values["name"].lower().replace(" ", "-").replace("_", "-")
        return None


class DepartmentCreate(CreateSchema, DepartmentBase, CompanyRelatedSchema):
    """Схема для создания департамента"""

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()


class DepartmentUpdate(UpdateSchema):
    """Схема для обновления департамента"""

    name: Optional[str] = Field(None, max_length=FieldLimits.MEDIUM_STRING_MAX)
    slug: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    description: Optional[str] = Field(None, max_length=FieldLimits.TEXT_MAX)
    type: Optional[DepartmentType] = None
    parent_id: Optional[int] = Field(None, gt=0)
    head_id: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None
    employee_count: Optional[int] = Field(None, ge=0)
    team_count: Optional[int] = Field(None, ge=0)
    budget_allocated: Optional[float] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=FieldLimits.MEDIUM_STRING_MAX)
    email: Optional[str] = Field(None, max_length=FieldLimits.EMAIL_MAX)
    phone: Optional[str] = Field(None, max_length=FieldLimits.PHONE_MAX)


class DepartmentResponse(ResponseSchema, DepartmentBase, CompanyRelatedSchema):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    level: Optional[int] = Field(None, ge=0, description="Уровень в иерархии")
    full_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description="Полное название с иерархией",
    )
    has_children: Optional[bool] = Field(
        None, description="Есть ли дочерние департаменты"
    )
    is_root: Optional[bool] = Field(None, description="Корневой департамент")


class DepartmentListResponse(ListResponseSchema[DepartmentResponse]):
    """Схема для списка департаментов"""

    pass


class DepartmentHierarchy(DepartmentResponse):
    """Схема для иерархии департаментов"""

    children: List["DepartmentHierarchy"] = Field(
        default_factory=list, description="Дочерние департаменты"
    )
    parent: Optional[DepartmentResponse] = Field(
        None, description="Родительский департамент"
    )


# Обновляем forward reference
DepartmentHierarchy.model_rebuild()


class DepartmentStats(BaseSchema):
    """Схема для статистики департамента"""

    department_id: int = Field(..., gt=0, description="ID департамента")
    total_employees: int = Field(0, ge=0, description="Общее количество сотрудников")
    total_teams: int = Field(0, ge=0, description="Общее количество команд")
    total_projects: int = Field(0, ge=0, description="Общее количество проектов")
    active_projects: int = Field(0, ge=0, description="Активные проекты")
    completed_projects: int = Field(0, ge=0, description="Завершенные проекты")
    budget_utilized: Optional[float] = Field(
        None, ge=0, description="Использованный бюджет"
    )
    budget_remaining: Optional[float] = Field(
        None, ge=0, description="Оставшийся бюджет"
    )
