"""
Схемы для матрицы трассируемости требований.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TraceNode(BaseModel):
    """Узел в матрице трассируемости."""

    requirement_id: int = Field(..., description="ID требования")
    requirement_title: str = Field(..., description="Заголовок требования")
    requirement_type: str = Field(..., description="Тип требования")
    level: int = Field(..., ge=0, description="Уровень в иерархии")
    children: List["TraceNode"] = Field(
        default_factory=list, description="Дочерние требования"
    )
    parents: List["TraceNode"] = Field(
        default_factory=list, description="Родительские требования"
    )


class TraceLink(BaseModel):
    """Связь в матрице трассируемости."""

    source_id: int = Field(..., description="ID исходного требования")
    target_id: int = Field(..., description="ID целевого требования")
    relationship_type: str = Field(..., description="Тип связи")
    strength: float = Field(default=1.0, ge=0, le=1, description="Сила связи")


class TraceMatrix(BaseModel):
    """Матрица трассируемости требований."""

    requirement_id: int = Field(..., description="ID центрального требования")
    requirement_title: str = Field(..., description="Заголовок центрального требования")
    depth: int = Field(..., ge=1, le=10, description="Глубина трассировки")
    matrix: List[List[TraceNode]] = Field(
        default_factory=list, description="Матрица узлов по уровням"
    )
    links: List[TraceLink] = Field(
        default_factory=list, description="Связи между требованиями"
    )
    statistics: Dict[str, Any] = Field(
        default_factory=dict, description="Статистика матрицы"
    )
    generated_at: str = Field(..., description="Время генерации")

    class Config:
        from_attributes = True


class TraceMatrixConfig(BaseModel):
    """Конфигурация для генерации матрицы трассируемости."""

    include_forward: bool = Field(default=True, description="Включать прямые связи")
    include_backward: bool = Field(default=True, description="Включать обратные связи")
    relationship_types: Optional[List[str]] = Field(
        None, description="Типы связей для включения"
    )
    exclude_types: Optional[List[str]] = Field(
        None, description="Типы связей для исключения"
    )
    max_depth: int = Field(default=3, ge=1, le=10, description="Максимальная глубина")
    include_orphans: bool = Field(
        default=False, description="Включать требования без связей"
    )


class TraceMatrixSummary(BaseModel):
    """Сводка по матрице трассируемости."""

    total_requirements: int = Field(
        ..., ge=0, description="Общее количество требований"
    )
    total_links: int = Field(..., ge=0, description="Общее количество связей")
    max_depth_reached: int = Field(
        ..., ge=0, description="Максимальная достигнутая глубина"
    )
    coverage_percentage: float = Field(
        ..., ge=0, le=100, description="Процент покрытия"
    )
    orphan_requirements: int = Field(
        ..., ge=0, description="Количество требований без связей"
    )
    circular_dependencies: int = Field(
        ..., ge=0, description="Количество циклических зависимостей"
    )


class TraceMatrixExport(BaseModel):
    """Экспорт матрицы трассируемости."""

    format: str = Field(..., description="Формат экспорта")
    file_path: str = Field(..., description="Путь к файлу")
    file_size: int = Field(..., ge=0, description="Размер файла")
    download_url: str = Field(..., description="URL для скачивания")
    expires_at: datetime = Field(..., description="Время истечения ссылки")

    class Config:
        from_attributes = True


# Обновляем TraceNode для поддержки рекурсивных ссылок
TraceNode.model_rebuild()
