"""
Схемы для модели RelationshipType (типы связей между требованиями).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional

from pydantic import BaseModel, Field

# === Перечисления ===


class RelationshipTypeCategory(str, Enum):
    """Категории типов связей"""

    DEPENDENCY = "dependency"
    HIERARCHY = "hierarchy"
    SIMILARITY = "similarity"
    CONFLICT = "conflict"
    TRACE = "trace"


class StandardRelationshipType(str, Enum):
    """Стандартные типы связей"""

    DEPENDS_ON = "depends_on"
    BLOCKS = "blocks"
    PARENT_OF = "parent_of"
    CHILD_OF = "child_of"
    RELATED_TO = "related_to"
    CONFLICTS_WITH = "conflicts_with"
    IMPLEMENTS = "implements"
    DERIVES_FROM = "derives_from"
    REFINES = "refines"
    SATISFIES = "satisfies"


# === Базовые схемы ===


class RelationshipTypeBase(BaseSchema, ValidationMixin):
    """
    Базовая схема типа связи между требованиями.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " типа связи",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " типа связи",
    )
    category: Optional[RelationshipTypeCategory] = Field(
        None, description="Категория типа связи"
    )
    is_bidirectional: bool = Field(
        False, description="Является ли связь двунаправленной"
    )
    inverse_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Название обратной связи (для односторонних связей)",
    )
    color: Optional[str] = Field(
        None,
        regex="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Цвет связи в формате hex",
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия типа связи"""
        v = cls.validate_non_empty_string(v, "name")

        # Базовая валидация для безопасности
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError("Relationship type name contains forbidden characters")

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания типа связи"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.LONG_STRING_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.LONG_STRING_MAX} characters"
                )
        return v

    @field_validator("inverse_name")
    @classmethod
    def validate_inverse_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия обратной связи"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError("Inverse name contains forbidden characters")
        return v


# === CRUD схемы ===


class RelationshipTypeCreate(RelationshipTypeBase, CreateSchema):
    """
    Схема для создания типа связи.
    Наследует все поля от базовой схемы.
    """

    pass


class RelationshipTypeUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления типа связи.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " типа связи",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " типа связи",
    )
    category: Optional[RelationshipTypeCategory] = Field(
        None, description="Категория типа связи"
    )
    is_bidirectional: Optional[bool] = Field(
        None, description="Является ли связь двунаправленной"
    )
    inverse_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Название обратной связи",
    )
    color: Optional[str] = Field(
        None,
        regex="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Цвет связи в формате hex",
    )
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "name")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError("Relationship type name contains forbidden characters")
        return v


class RelationshipTypeResponse(RelationshipTypeBase, ResponseSchema):
    """
    Схема ответа для типа связи.
    Включает все данные из БД включая id и временные метки.
    """

    pass


# === Списки и пагинация ===


class RelationshipTypeListResponse(ListResponseSchema[RelationshipTypeResponse]):
    """Список типов связей с пагинацией"""

    pass


# === Статистика ===


class RelationshipTypeStatistics(StatisticsSchema):
    """
    Схема статистики типов связей.
    """

    total_types: int = Field(0, ge=0, description="Общее количество типов связей")
    active_types: int = Field(0, ge=0, description="Активных типов")
    inactive_types: int = Field(0, ge=0, description="Неактивных типов")

    usage_by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Использование по типам связей"
    )

    category_distribution: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по категориям"
    )

    bidirectional_count: int = Field(
        0, ge=0, description="Количество двунаправленных связей"
    )
    unidirectional_count: int = Field(
        0, ge=0, description="Количество односторонних связей"
    )


# === Поиск и фильтрация ===


class RelationshipTypeFilter(BaseSchema):
    """
    Фильтр для типов связей.
    """

    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    category: Optional[RelationshipTypeCategory] = Field(
        None, description="Фильтр по категории"
    )
    is_bidirectional: Optional[bool] = Field(
        None, description="Фильтр по направленности"
    )
    name_contains: Optional[str] = Field(
        None, min_length=1, description="Поиск по содержанию в названии"
    )


# === Массовые операции ===


class RelationshipTypeBulkCreate(BaseSchema):
    """
    Схема для массового создания типов связей.
    """

    types: List[RelationshipTypeCreate] = Field(
        ..., min_length=1, max_length=20, description="Список типов связей для создания"
    )


# === Константы и утилиты ===


class RelationshipTypeConfig:
    """
    Конфигурация схем типов связей.
    """

    # Стандартные типы связей для инициализации
    STANDARD_TYPES = [
        {
            "name": "Depends On",
            "description": "Требование зависит от другого требования",
            "category": RelationshipTypeCategory.DEPENDENCY,
            "is_bidirectional": False,
            "inverse_name": "Blocks",
            "color": "#dc2626",
            "is_active": True,
        },
        {
            "name": "Parent Of",
            "description": "Родительское требование",
            "category": RelationshipTypeCategory.HIERARCHY,
            "is_bidirectional": False,
            "inverse_name": "Child Of",
            "color": "#059669",
            "is_active": True,
        },
        {
            "name": "Related To",
            "description": "Связанное требование",
            "category": RelationshipTypeCategory.SIMILARITY,
            "is_bidirectional": True,
            "inverse_name": None,
            "color": "#3b82f6",
            "is_active": True,
        },
        {
            "name": "Conflicts With",
            "description": "Конфликтующее требование",
            "category": RelationshipTypeCategory.CONFLICT,
            "is_bidirectional": True,
            "inverse_name": None,
            "color": "#dc2626",
            "is_active": True,
        },
        {
            "name": "Implements",
            "description": "Реализует требование",
            "category": RelationshipTypeCategory.TRACE,
            "is_bidirectional": False,
            "inverse_name": "Implemented By",
            "color": "#10b981",
            "is_active": True,
        },
        {
            "name": "Derives From",
            "description": "Производное от требования",
            "category": RelationshipTypeCategory.TRACE,
            "is_bidirectional": False,
            "inverse_name": "Source For",
            "color": "#8b5cf6",
            "is_active": True,
        },
        {
            "name": "Refines",
            "description": "Уточняет требование",
            "category": RelationshipTypeCategory.HIERARCHY,
            "is_bidirectional": False,
            "inverse_name": "Refined By",
            "color": "#f59e0b",
            "is_active": True,
        },
        {
            "name": "Satisfies",
            "description": "Удовлетворяет требование",
            "category": RelationshipTypeCategory.TRACE,
            "is_bidirectional": False,
            "inverse_name": "Satisfied By",
            "color": "#06b6d4",
            "is_active": True,
        },
    ]

    # Схемы для различных контекстов
    MINIMAL = RelationshipTypeResponse
    DETAILED = RelationshipTypeResponse
    LIST = RelationshipTypeListResponse


# === Псевдонимы для обратной совместимости ===

RelationshipType = RelationshipTypeResponse  # Базовый тип связи
