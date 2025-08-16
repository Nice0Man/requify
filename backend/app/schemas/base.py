"""
Базовые SQLModel классы для унифицированной архитектуры схем.
Следует принципам SQLModel и лучшим практикам FastAPI.
"""

from datetime import datetime
from typing import Optional, TypeVar, Generic, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, ConfigDict

# Generic types для типизации
T = TypeVar("T")


class TimestampedBase(SQLModel):
    """
    Базовый класс для моделей с временными метками.
    Соответствует TimestampedMixin из models/base.py
    """

    created_at: Optional[datetime] = Field(
        None, description="Время создания записи", schema_extra={"readOnly": True}
    )
    updated_at: Optional[datetime] = Field(
        None,
        description="Время последнего обновления записи",
        schema_extra={"readOnly": True},
    )


class BaseSchema(SQLModel):
    """
    Основной базовый класс для всех схем в системе.
    Определяет общие настройки и поведение.
    """

    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
        use_enum_values=True,
    )


class CreateSchema(BaseSchema):
    """
    Базовый класс для схем создания (Create).
    Не содержит id, created_at, updated_at.
    """

    pass


class UpdateSchema(BaseSchema):
    """
    Базовый класс для схем обновления (Update).
    Все поля опциональны для частичных обновлений.
    """

    pass


class ResponseSchema(BaseSchema, TimestampedBase):
    """
    Базовый класс для схем ответов (Response).
    Включает id и временные метки.
    """

    id: int = Field(
        ...,
        gt=0,
        description="Уникальный идентификатор записи",
        schema_extra={"readOnly": True},
    )


class ListResponseSchema(BaseSchema, Generic[T]):
    """
    Базовый класс для ответов со списком элементов.
    Включает пагинацию и мета-информацию.
    """

    items: List[T] = Field(default_factory=list, description="Список элементов")
    total: int = Field(0, ge=0, description="Общее количество элементов")
    page: int = Field(1, ge=1, description="Номер текущей страницы")
    page_size: int = Field(50, ge=1, le=1000, description="Размер страницы")
    pages: int = Field(0, ge=0, description="Общее количество страниц")

    @property
    def has_next(self) -> bool:
        """Есть ли следующая страница"""
        return self.page < self.pages

    @property
    def has_prev(self) -> bool:
        """Есть ли предыдущая страница"""
        return self.page > 1


class StatisticsSchema(BaseSchema):
    """
    Базовый класс для схем статистики.
    """

    generated_at: datetime = Field(
        default_factory=datetime.now, description="Время генерации статистики"
    )
    period: Optional[str] = Field(
        None, description="Период статистики (day, week, month, year)"
    )


class SearchSchema(BaseSchema):
    """
    Базовый класс для схем поиска.
    """

    query: Optional[str] = Field(
        None, min_length=1, max_length=500, description="Поисковый запрос"
    )
    page: int = Field(1, ge=1, description="Номер страницы")
    page_size: int = Field(50, ge=1, le=1000, description="Размер страницы")
    sort_by: Optional[str] = Field(None, description="Поле для сортировки")
    sort_order: Optional[str] = Field(
        "asc", regex="^(asc|desc)$", description="Порядок сортировки: asc или desc"
    )


class FilterSchema(BaseSchema):
    """
    Базовый класс для схем фильтрации.
    """

    date_from: Optional[datetime] = Field(None, description="Фильтр по дате (от)")
    date_to: Optional[datetime] = Field(None, description="Фильтр по дате (до)")
    is_active: Optional[bool] = Field(None, description="Фильтр по активности")

    def to_dict(self, exclude_none: bool = True) -> Dict[str, Any]:
        """Конвертирует фильтр в словарь для использования в запросах"""
        data = self.model_dump(exclude_none=exclude_none)
        return data


class BulkActionSchema(BaseSchema):
    """
    Базовый класс для массовых операций.
    """

    ids: List[int] = Field(
        ..., min_length=1, description="Список ID для массовой операции"
    )
    action: str = Field(..., description="Тип действия")


class BulkResponseSchema(BaseSchema):
    """
    Базовый класс для ответов массовых операций.
    """

    success_count: int = Field(0, ge=0, description="Количество успешных операций")
    error_count: int = Field(0, ge=0, description="Количество ошибок")
    errors: List[str] = Field(default_factory=list, description="Список ошибок")
    processed_ids: List[int] = Field(
        default_factory=list, description="Список обработанных ID"
    )


# === Специфичные базовые классы для доменных сущностей ===


class UserRelatedSchema(BaseSchema):
    """
    Базовый класс для схем, связанных с пользователем.
    """

    created_by: Optional[int] = Field(None, description="ID создателя")
    updated_by: Optional[int] = Field(None, description="ID обновившего")


class CompanyRelatedSchema(BaseSchema):
    """
    Базовый класс для схем, связанных с компанией.
    """

    company_id: int = Field(..., gt=0, description="ID компании")


class ProjectRelatedSchema(BaseSchema):
    """
    Базовый класс для схем, связанных с проектом.
    """

    project_id: int = Field(..., gt=0, description="ID проекта")


# === Стандартные паттерны для CRUD операций ===


def create_crud_schemas(
    base_class: type,
    table_name: str,
    additional_create_fields: Dict[str, Any] = None,
    additional_response_fields: Dict[str, Any] = None,
    exclude_from_update: List[str] = None,
):
    """
    Фабрика для создания стандартных CRUD схем.

    Args:
        base_class: Базовый класс с полями сущности
        table_name: Имя таблицы для генерации имён классов
        additional_create_fields: Дополнительные поля для Create схемы
        additional_response_fields: Дополнительные поля для Response схемы
        exclude_from_update: Поля, исключаемые из Update схемы

    Returns:
        Tuple[Create, Update, Response, List] классов
    """

    class_name = table_name.title().replace("_", "")

    # Create схема
    create_class = type(
        f"{class_name}Create",
        (base_class, CreateSchema),
        additional_create_fields or {},
    )

    # Update схема (все поля опциональны)
    update_fields = {}
    exclude_fields = set(exclude_from_update or [])
    exclude_fields.update({"id", "created_at", "updated_at"})

    for field_name, field_info in base_class.model_fields.items():
        if field_name not in exclude_fields:
            # Делаем поле опциональным для Update
            update_fields[field_name] = (Optional[field_info.annotation], None)

    update_class = type(f"{class_name}Update", (UpdateSchema,), update_fields)

    # Response схема
    response_class = type(
        f"{class_name}Response",
        (base_class, ResponseSchema),
        additional_response_fields or {},
    )

    # List схема
    list_class = type(
        f"{class_name}ListResponse", (ListResponseSchema[response_class],), {}
    )

    return create_class, update_class, response_class, list_class


# === Валидаторы и утилиты ===


class ValidationMixin:
    """
    Миксин с общими валидаторами.
    """

    @classmethod
    def validate_positive_int(cls, v: int, field_name: str = "field") -> int:
        """Валидация положительного целого числа"""
        if v is not None and v <= 0:
            raise ValueError(f"{field_name} must be positive")
        return v

    @classmethod
    def validate_non_empty_string(cls, v: str, field_name: str = "field") -> str:
        """Валидация непустой строки"""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError(f"{field_name} cannot be empty")
        return v


# === Константы для стандартизации ===


class FieldLimits:
    """Константы для ограничений полей"""

    # Строковые поля
    SHORT_STRING_MAX = 100
    MEDIUM_STRING_MAX = 255
    LONG_STRING_MAX = 1000
    TEXT_MAX = 10000
    LARGE_TEXT_MAX = 100000

    # Специальные поля
    URL_MAX = 512
    EMAIL_MAX = 320
    PHONE_MAX = 20
    COMPANY_NAME_MAX = 200
    CODE_MAX = 50
    VERSION_MAX = 20

    # Числовые поля
    PRIORITY_MIN = 1
    PRIORITY_MAX = 10

    # Компания
    COMPANY_MAX_EMPLOYEES = 100000

    # Команды
    TEAM_MAX_MEMBERS = 100

    # Пагинация
    DEFAULT_PAGE_SIZE = 50
    MAX_PAGE_SIZE = 1000


class StandardDescriptions:
    """Стандартные описания для полей"""

    ID = "Уникальный идентификатор"
    NAME = "Название"
    TITLE = "Заголовок"
    DESCRIPTION = "Описание"
    STATUS = "Статус"
    PRIORITY = "Приоритет"
    CREATED_AT = "Время создания"
    UPDATED_AT = "Время последнего обновления"
    CREATED_BY = "ID создателя"
    UPDATED_BY = "ID последнего редактора"
    COMPANY_ID = "ID компании"
    PROJECT_ID = "ID проекта"
    USER_ID = "ID пользователя"
    IS_ACTIVE = "Активность записи"
    IS_DELETED = "Помечена как удалённая"
