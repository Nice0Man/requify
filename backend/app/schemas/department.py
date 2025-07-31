"""
Схемы для модели Department.
"""

from typing import Optional, List
from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum


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


class DepartmentBase(BaseModel):
    """Базовая схема для департамента"""

    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    type: DepartmentType

    # Иерархия
    parent_id: Optional[int] = None

    # Руководство
    head_id: Optional[int] = None

    # Статус
    is_active: bool = True

    # Метаданные
    employee_count: int = 0
    team_count: int = 0
    budget_allocated: Optional[float] = None

    # Контактная информация
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("slug")
    def generate_slug(cls, v, values):
        if v:
            return v
        if "name" in values:
            return values["name"].lower().replace(" ", "-").replace("_", "-")
        return None


class DepartmentCreate(DepartmentBase):
    """Схема для создания департамента"""

    company_id: int

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()


class DepartmentUpdate(BaseModel):
    """Схема для обновления департамента"""

    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    type: Optional[DepartmentType] = None
    parent_id: Optional[int] = None
    head_id: Optional[int] = None
    is_active: Optional[bool] = None
    employee_count: Optional[int] = None
    team_count: Optional[int] = None
    budget_allocated: Optional[float] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class DepartmentInDB(DepartmentBase):
    """Схема для данных из базы данных"""

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DepartmentResponse(DepartmentInDB):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    level: Optional[int] = None
    full_name: Optional[str] = None
    has_children: Optional[bool] = None
    is_root: Optional[bool] = None


class DepartmentListResponse(BaseModel):
    """Схема для списка департаментов"""

    departments: List[DepartmentResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class DepartmentHierarchy(DepartmentResponse):
    """Схема для иерархии департаментов"""

    children: List["DepartmentHierarchy"] = []
    parent: Optional[DepartmentResponse] = None


# Обновляем forward reference
DepartmentHierarchy.model_rebuild()


class DepartmentStats(BaseModel):
    """Схема для статистики департамента"""

    department_id: int
    total_employees: int
    total_teams: int
    total_projects: int
    active_projects: int
    completed_projects: int
    budget_utilized: Optional[float] = None
    budget_remaining: Optional[float] = None
