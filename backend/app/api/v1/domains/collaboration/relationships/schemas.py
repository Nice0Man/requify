"""
Relationship Schemas.

Схемы для работы с отношениями между требованиями.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field


class RelationshipTypeEnum(str, Enum):
    """Типы отношений между требованиями."""

    DEPENDS_ON = "depends_on"
    BLOCKS = "blocks"
    RELATES_TO = "relates_to"
    PARENT_OF = "parent_of"
    CHILD_OF = "child_of"
    DUPLICATES = "duplicates"
    CONFLICTS_WITH = "conflicts_with"


class RequirementRef(BaseModel):
    """Ссылка на требование."""

    id: int = Field(..., description="ID требования")
    title: str = Field(..., description="Заголовок требования")
    status: Optional[str] = Field(None, description="Статус требования")
    project_id: int = Field(..., description="ID проекта")


class RelationshipBase(BaseModel):
    """Базовая схема отношения."""

    relationship_type: str = Field(..., description="Тип отношения")


class RelationshipCreateRequest(RelationshipBase):
    """Схема запроса на создание отношения."""

    source_id: int = Field(..., description="ID исходного требования")
    target_id: int = Field(..., description="ID целевого требования")


class RelationshipResponse(RelationshipBase):
    """Схема ответа с данными отношения."""

    source: RequirementRef = Field(..., description="Исходное требование")
    target: RequirementRef = Field(..., description="Целевое требование")
    created_at: datetime = Field(..., description="Время создания")

    class Config:
        from_attributes = True


class RelationshipListResponse(BaseModel):
    """Схема ответа со списком отношений."""

    relationships: List[RelationshipResponse] = Field(
        ..., description="Список отношений"
    )
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Номер страницы")
    pages: int = Field(..., description="Общее количество страниц")
    size: int = Field(..., description="Размер страницы")


class RequirementDependenciesResponse(BaseModel):
    """Схема ответа с зависимостями требования."""

    requirement_id: int = Field(..., description="ID требования")
    dependencies: List[RequirementRef] = Field(..., description="Зависимости")
    dependents: List[RequirementRef] = Field(..., description="Зависимые требования")
    transitive_dependencies: List[RequirementRef] = Field(
        ..., description="Транзитивные зависимости"
    )
    transitive_dependents: List[RequirementRef] = Field(
        ..., description="Транзитивно зависимые"
    )


class RequirementTraceMatrixResponse(BaseModel):
    """Схема ответа с матрицей трассировки."""

    requirement_id: int = Field(..., description="ID требования")
    trace_matrix: dict = Field(..., description="Матрица трассировки")
    total_relationships: int = Field(..., description="Общее количество связей")
