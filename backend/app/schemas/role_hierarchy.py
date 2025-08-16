"""
Схемы для иерархии ролей (DAG).
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Set
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.base import BaseSchema
from app.models.role_hierarchy import InheritanceType


class RoleHierarchyBase(BaseSchema):
    """Базовая схема для иерархии ролей"""

    parent_role_id: int = Field(..., description="ID родительской роли")
    child_role_id: int = Field(..., description="ID дочерней роли")
    inheritance_type: InheritanceType = Field(
        default=InheritanceType.FULL, description="Тип наследования"
    )
    priority: int = Field(default=0, description="Приоритет наследования")
    conditions: Optional[Dict[str, Any]] = Field(
        None, description="Условия наследования"
    )
    inherited_permissions: Optional[List[str]] = Field(
        None, description="Список наследуемых разрешений (для PARTIAL)"
    )
    excluded_permissions: Optional[List[str]] = Field(
        None, description="Список исключаемых разрешений (для RESTRICT)"
    )
    permission_overrides: Optional[Dict[str, Any]] = Field(
        None, description="Переопределения разрешений (для OVERRIDE)"
    )
    description: Optional[str] = Field(None, description="Описание связи наследования")
    effective_from: Optional[datetime] = Field(None, description="Дата начала действия")
    effective_until: Optional[datetime] = Field(
        None, description="Дата окончания действия"
    )

    @field_validator("parent_role_id", "child_role_id")
    @classmethod
    def role_ids_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("ID роли должен быть положительным числом")
        return v

    @model_validator(mode="after")
    def validate_role_hierarchy(self):
        parent_id = self.parent_role_id
        child_id = self.child_role_id

        if parent_id and child_id and parent_id == child_id:
            raise ValueError("Роль не может наследовать сама от себя")

        inheritance_type = self.inheritance_type
        inherited_permissions = self.inherited_permissions
        excluded_permissions = self.excluded_permissions
        permission_overrides = self.permission_overrides

        # Валидация типов наследования
        if inheritance_type == InheritanceType.PARTIAL and not inherited_permissions:
            raise ValueError(
                "Для PARTIAL наследования нужно указать inherited_permissions"
            )

        if inheritance_type == InheritanceType.RESTRICT and not excluded_permissions:
            raise ValueError(
                "Для RESTRICT наследования нужно указать excluded_permissions"
            )

        if inheritance_type == InheritanceType.OVERRIDE and not permission_overrides:
            raise ValueError(
                "Для OVERRIDE наследования нужно указать permission_overrides"
            )

        # Валидация временных рамок
        effective_from = self.effective_from
        effective_until = self.effective_until

        if effective_from and effective_until and effective_from >= effective_until:
            raise ValueError("Дата начала должна быть раньше даты окончания")

        return self


class RoleHierarchyCreate(RoleHierarchyBase):
    """Схема для создания связи иерархии ролей"""

    created_by: Optional[int] = Field(None, description="ID создателя")


class RoleHierarchyUpdate(BaseSchema):
    """Схема для обновления связи иерархии ролей"""

    inheritance_type: Optional[InheritanceType] = None
    priority: Optional[int] = None
    conditions: Optional[Dict[str, Any]] = None
    inherited_permissions: Optional[List[str]] = None
    excluded_permissions: Optional[List[str]] = None
    permission_overrides: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None


class RoleHierarchyInDB(RoleHierarchyBase):
    """Схема иерархии ролей в базе данных"""

    id: int
    is_active: bool
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoleHierarchyResponse(RoleHierarchyInDB):
    """Схема ответа для иерархии ролей"""

    parent_role_name: Optional[str] = Field(
        None, description="Название родительской роли"
    )
    child_role_name: Optional[str] = Field(None, description="Название дочерней роли")
    is_effective: bool = Field(..., description="Действует ли наследование сейчас")


# Схемы для кеша иерархии
class RoleHierarchyCacheBase(BaseSchema):
    """Базовая схема для кеша иерархии ролей"""

    role_id: int = Field(..., description="ID роли")
    cache_type: str = Field(..., description="Тип кеша")
    cache_data: Dict[str, Any] = Field(..., description="Кешированные данные")
    expires_at: Optional[datetime] = Field(None, description="Дата истечения кеша")


class RoleHierarchyCacheCreate(RoleHierarchyCacheBase):
    """Схема для создания кеша иерархии ролей"""

    pass


class RoleHierarchyCacheUpdate(BaseSchema):
    """Схема для обновления кеша иерархии ролей"""

    cache_data: Optional[Dict[str, Any]] = None
    is_valid: Optional[bool] = None
    expires_at: Optional[datetime] = None


class RoleHierarchyCacheInDB(RoleHierarchyCacheBase):
    """Схема кеша иерархии ролей в базе данных"""

    id: int
    is_valid: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Схемы для API ответов
class RoleInheritanceInfo(BaseSchema):
    """Информация о наследовании роли"""

    role_id: int
    role_name: str
    effective_permissions: Set[str] = Field(..., description="Эффективные разрешения")
    direct_permissions: Set[str] = Field(..., description="Собственные разрешения")
    inherited_permissions: Set[str] = Field(
        ..., description="Унаследованные разрешения"
    )
    parent_roles: List[int] = Field(..., description="ID родительских ролей")
    child_roles: List[int] = Field(..., description="ID дочерних ролей")


class InheritancePathStep(BaseSchema):
    """Шаг в пути наследования"""

    role_id: int
    role_name: str
    inheritance_type: InheritanceType
    priority: int


class InheritancePathResponse(BaseSchema):
    """Ответ с путем наследования между ролями"""

    source_role_id: int
    target_role_id: int
    path_exists: bool
    path_steps: List[InheritancePathStep] = Field(
        ..., description="Шаги пути наследования"
    )
    effective_permissions: Set[str] = Field(
        ..., description="Результирующие разрешения"
    )


class RoleHierarchyValidationRequest(BaseSchema):
    """Запрос на валидацию связи наследования"""

    parent_role_id: int
    child_role_id: int


class RoleHierarchyValidationResponse(BaseSchema):
    """Ответ валидации связи наследования"""

    is_valid: bool
    errors: List[str] = Field(default_factory=list, description="Список ошибок")
    warnings: List[str] = Field(
        default_factory=list, description="Список предупреждений"
    )


class RoleConflictInfo(BaseSchema):
    """Информация о конфликте в иерархии ролей"""

    conflict_type: str
    description: str
    affected_roles: List[int]
    severity: str = Field(..., description="Серьезность: low, medium, high, critical")
    suggested_fix: Optional[str] = Field(None, description="Предлагаемое решение")


class RoleHierarchyStatsResponse(BaseSchema):
    """Статистика иерархии ролей"""

    total_roles: int
    total_relationships: int
    active_relationships: int
    inheritance_types_distribution: Dict[str, int]
    max_depth: int
    roles_with_multiple_parents: int
    orphaned_roles: int
    potential_conflicts: List[RoleConflictInfo]


class BulkRoleHierarchyCreate(BaseSchema):
    """Схема для массового создания связей иерархии"""

    relationships: List[RoleHierarchyCreate] = Field(
        ..., description="Список связей для создания"
    )
    validate_dag: bool = Field(default=True, description="Проверять DAG на циклы")
    skip_conflicts: bool = Field(
        default=False, description="Пропускать конфликтующие связи"
    )


class BulkRoleHierarchyResponse(BaseSchema):
    """Ответ на массовое создание связей иерархии"""

    created_count: int
    skipped_count: int
    errors: List[str] = Field(default_factory=list)
    created_relationships: List[RoleHierarchyResponse] = Field(default_factory=list)


# Схемы для экспорта/импорта иерархии
class RoleHierarchyExport(BaseSchema):
    """Схема для экспорта иерархии ролей"""

    roles: List[Dict[str, Any]]
    relationships: List[RoleHierarchyInDB]
    export_timestamp: datetime
    export_version: str = "1.0"


class RoleHierarchyImport(BaseSchema):
    """Схема для импорта иерархии ролей"""

    relationships: List[RoleHierarchyCreate]
    import_mode: str = Field(
        default="merge", description="Режим импорта: merge, replace, append"
    )
    validate_before_import: bool = Field(
        default=True, description="Валидировать перед импортом"
    )
