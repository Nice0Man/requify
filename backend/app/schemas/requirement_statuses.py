"""
Схемы для модели RequirementStatus (статусы требований).
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator

# === Перечисления ===


class RequirementStatusType(str, Enum):
    """Типы статусов требований"""

    DRAFT = "draft"
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_DEVELOPMENT = "in_development"
    TESTING = "testing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class RequirementStatusCategory(str, Enum):
    """Категории статусов"""

    PLANNING = "planning"
    DEVELOPMENT = "development"
    QUALITY_ASSURANCE = "quality_assurance"
    DEPLOYMENT = "deployment"
    MAINTENANCE = "maintenance"


# === Базовые схемы ===


class RequirementStatusBase(BaseSchema, ValidationMixin):
    """
    Базовая схема статуса требования.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " статуса требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " статуса требования",
    )
    color: Optional[str] = Field(
        None,
        regex="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Цвет статуса в формате hex",
    )
    category: Optional[RequirementStatusCategory] = Field(
        None, description="Категория статуса"
    )
    is_final: bool = Field(
        False, description="Является ли статус финальным (завершающим)"
    )
    order: Optional[int] = Field(None, ge=0, description="Порядок отображения статуса")
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия статуса требования"""
        v = cls.validate_non_empty_string(v, "name")

        # Базовая валидация для безопасности
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError("Status name contains forbidden characters")

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания статуса требования"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.LONG_STRING_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.LONG_STRING_MAX} characters"
                )
        return v


# === CRUD схемы ===


class RequirementStatusCreate(RequirementStatusBase, CreateSchema):
    """
    Схема для создания статуса требования.
    Наследует все поля от базовой схемы.
    """

    pass


class RequirementStatusUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления статуса требования.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description=StandardDescriptions.NAME + " статуса требования",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.LONG_STRING_MAX,
        description=StandardDescriptions.DESCRIPTION + " статуса требования",
    )
    color: Optional[str] = Field(
        None,
        regex="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Цвет статуса в формате hex",
    )
    category: Optional[RequirementStatusCategory] = Field(
        None, description="Категория статуса"
    )
    is_final: Optional[bool] = Field(None, description="Является ли статус финальным")
    order: Optional[int] = Field(None, ge=0, description="Порядок отображения статуса")
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "name")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError("Status name contains forbidden characters")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания при обновлении"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.LONG_STRING_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.LONG_STRING_MAX} characters"
                )
        return v


class RequirementStatusResponse(RequirementStatusBase, ResponseSchema):
    """
    Схема ответа для статуса требования.
    Включает все данные из БД включая id и временные метки.
    """

    pass


# === Списки и пагинация ===


class RequirementStatusListResponse(ListResponseSchema[RequirementStatusResponse]):
    """Список статусов требований с пагинацией"""

    pass


# === Статистика ===


class RequirementStatusStatistics(StatisticsSchema):
    """
    Схема статистики статусов требований.
    """

    total_statuses: int = Field(0, ge=0, description="Общее количество статусов")
    active_statuses: int = Field(0, ge=0, description="Активных статусов")
    inactive_statuses: int = Field(0, ge=0, description="Неактивных статусов")

    usage_by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Использование по статусам"
    )

    status_transitions: List[Dict[str, Any]] = Field(
        default_factory=list, description="Переходы между статусами"
    )

    category_distribution: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по категориям"
    )


# === Поиск и фильтрация ===


class RequirementStatusFilter(BaseSchema):
    """
    Фильтр для статусов требований.
    """

    is_active: Optional[bool] = Field(None, description="Фильтр по активности")
    category: Optional[RequirementStatusCategory] = Field(
        None, description="Фильтр по категории"
    )
    is_final: Optional[bool] = Field(None, description="Фильтр по финальности статуса")
    name_contains: Optional[str] = Field(
        None, min_length=1, description="Поиск по содержанию в названии"
    )


# === Переходы статусов ===


class RequirementStatusTransition(BaseSchema):
    """
    Схема перехода между статусами.
    """

    from_status_id: int = Field(..., description="Исходный статус")
    to_status_id: int = Field(..., description="Целевой статус")
    is_allowed: bool = Field(True, description="Разрешен ли переход")
    description: Optional[str] = Field(None, description="Описание условий перехода")


class RequirementStatusWorkflow(BaseSchema):
    """
    Схема рабочего процесса статусов.
    """

    name: str = Field(..., description="Название workflow")
    transitions: List[RequirementStatusTransition] = Field(
        default_factory=list, description="Разрешенные переходы"
    )
    default_status_id: int = Field(..., description="Статус по умолчанию")


# === Массовые операции ===


class RequirementStatusBulkUpdate(BaseSchema):
    """
    Схема для массового обновления статусов требований.
    """

    requirement_ids: List[int] = Field(
        ..., min_length=1, description="Список ID требований"
    )
    new_status_id: int = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )


# === Константы и утилиты ===


class RequirementStatusConfig:
    """
    Конфигурация схем статусов требований.
    """

    # Стандартные статусы для инициализации
    STANDARD_STATUSES = [
        {
            "name": "Draft",
            "description": "Черновик требования",
            "color": "#6b7280",
            "category": RequirementStatusCategory.PLANNING,
            "is_final": False,
            "order": 1,
            "is_active": True,
        },
        {
            "name": "In Review",
            "description": "Требование на рассмотрении",
            "color": "#f59e0b",
            "category": RequirementStatusCategory.PLANNING,
            "is_final": False,
            "order": 2,
            "is_active": True,
        },
        {
            "name": "Approved",
            "description": "Требование одобрено",
            "color": "#10b981",
            "category": RequirementStatusCategory.PLANNING,
            "is_final": False,
            "order": 3,
            "is_active": True,
        },
        {
            "name": "In Development",
            "description": "Требование в разработке",
            "color": "#3b82f6",
            "category": RequirementStatusCategory.DEVELOPMENT,
            "is_final": False,
            "order": 4,
            "is_active": True,
        },
        {
            "name": "Testing",
            "description": "Требование тестируется",
            "color": "#8b5cf6",
            "category": RequirementStatusCategory.QUALITY_ASSURANCE,
            "is_final": False,
            "order": 5,
            "is_active": True,
        },
        {
            "name": "Completed",
            "description": "Требование выполнено",
            "color": "#059669",
            "category": RequirementStatusCategory.DEPLOYMENT,
            "is_final": True,
            "order": 6,
            "is_active": True,
        },
        {
            "name": "Rejected",
            "description": "Требование отклонено",
            "color": "#dc2626",
            "category": RequirementStatusCategory.PLANNING,
            "is_final": True,
            "order": 7,
            "is_active": True,
        },
    ]

    # Схемы для различных контекстов
    MINIMAL = RequirementStatusResponse
    DETAILED = RequirementStatusResponse
    LIST = RequirementStatusListResponse


# === Псевдонимы для обратной совместимости ===

RequirementStatus = RequirementStatusResponse  # Базовый статус требования
