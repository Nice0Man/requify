"""
Общие схемы и типы для переиспользования.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field
from sqlmodel import SQLModel

from .base import BaseSchema, ResponseSchema, ListResponseSchema


# === Перечисления ===


class StatusEnum(str, Enum):
    """Базовое перечисление статусов"""

    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    DELETED = "deleted"


class PriorityEnum(str, Enum):
    """Перечисление приоритетов"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SortOrderEnum(str, Enum):
    """Порядок сортировки"""

    ASC = "asc"
    DESC = "desc"


# === Общие схемы ===


class HealthCheckResponse(BaseSchema):
    """Схема ответа для health check"""

    status: str = Field("ok", description="Статус сервиса")
    timestamp: datetime = Field(default_factory=datetime.now)
    version: Optional[str] = Field(None, description="Версия API")
    environment: Optional[str] = Field(None, description="Окружение")


class MessageResponse(BaseSchema):
    """Схема для простых сообщений"""

    message: str = Field(..., description="Сообщение")
    success: bool = Field(True, description="Успешность операции")
    code: Optional[str] = Field(None, description="Код ответа")


class ErrorResponse(BaseSchema):
    """Схема для ошибок"""

    error: str = Field(..., description="Описание ошибки")
    error_code: Optional[str] = Field(None, description="Код ошибки")
    details: Optional[Dict[str, Any]] = Field(None, description="Детали ошибки")
    timestamp: datetime = Field(default_factory=datetime.now)


class ValidationErrorResponse(BaseSchema):
    """Схема для ошибок валидации"""

    message: str = Field("Validation error", description="Сообщение об ошибке")
    errors: List[Dict[str, Any]] = Field(..., description="Детали ошибок валидации")


# === Схемы для пагинации ===


class PaginationRequest(BaseSchema):
    """Схема запроса с пагинацией"""

    page: int = Field(1, ge=1, description="Номер страницы")
    page_size: int = Field(50, ge=1, le=1000, description="Размер страницы")


class SortRequest(BaseSchema):
    """Схема запроса с сортировкой"""

    sort_by: Optional[str] = Field(None, description="Поле для сортировки")
    sort_order: SortOrderEnum = Field(
        SortOrderEnum.ASC, description="Порядок сортировки"
    )


class SearchRequest(PaginationRequest, SortRequest):
    """Схема поискового запроса"""

    query: Optional[str] = Field(
        None, min_length=1, max_length=500, description="Поисковый запрос"
    )


class DateRangeFilter(BaseSchema):
    """Фильтр по диапазону дат"""

    date_from: Optional[datetime] = Field(None, description="Дата начала")
    date_to: Optional[datetime] = Field(None, description="Дата окончания")


# === Метаданные ===


class MetadataSchema(BaseSchema):
    """Схема метаданных для ответов"""

    total: int = Field(0, ge=0, description="Общее количество записей")
    filtered: Optional[int] = Field(
        None, ge=0, description="Количество после фильтрации"
    )
    page: int = Field(1, ge=1, description="Текущая страница")
    page_size: int = Field(50, ge=1, description="Размер страницы")
    pages: int = Field(0, ge=0, description="Общее количество страниц")
    has_next: bool = Field(False, description="Есть ли следующая страница")
    has_prev: bool = Field(False, description="Есть ли предыдущая страница")


class ResponseWithMetadata(BaseSchema):
    """Базовая схема ответа с метаданными"""

    data: List[Any] = Field(default_factory=list, description="Данные")
    response_metadata: MetadataSchema = Field(
        ..., description="Метаданные", alias="metadata"
    )


# === Схемы для аудита ===


class AuditInfo(BaseSchema):
    """Информация для аудита"""

    created_by: Optional[int] = Field(None, description="ID создателя")
    created_at: Optional[datetime] = Field(None, description="Дата создания")
    updated_by: Optional[int] = Field(None, description="ID последнего редактора")
    updated_at: Optional[datetime] = Field(
        None, description="Дата последнего обновления"
    )


# === Схемы для статистики ===


class CountStatistic(BaseSchema):
    """Базовая статистика с подсчётом"""

    label: str = Field(..., description="Название показателя")
    value: int = Field(0, ge=0, description="Значение")
    change: Optional[float] = Field(None, description="Изменение в процентах")
    trend: Optional[str] = Field(None, description="Тренд: up, down, stable")


class TimeSeriesPoint(BaseSchema):
    """Точка временного ряда"""

    timestamp: datetime = Field(..., description="Временная метка")
    value: float = Field(..., description="Значение")


class TimeSeriesStatistic(BaseSchema):
    """Статистика временного ряда"""

    label: str = Field(..., description="Название показателя")
    data: List[TimeSeriesPoint] = Field(default_factory=list, description="Данные ряда")
    total: Optional[float] = Field(None, description="Общее значение")
    average: Optional[float] = Field(None, description="Среднее значение")


# === Схемы для операций ===


class BulkOperation(BaseSchema):
    """Схема массовой операции"""

    action: str = Field(..., description="Тип операции")
    ids: List[int] = Field(..., min_length=1, description="Список ID")
    params: Optional[Dict[str, Any]] = Field(None, description="Параметры операции")


class BulkOperationResult(BaseSchema):
    """Результат массовой операции"""

    success_count: int = Field(0, ge=0, description="Количество успешных операций")
    error_count: int = Field(0, ge=0, description="Количество ошибок")
    total_count: int = Field(0, ge=0, description="Общее количество")
    errors: List[str] = Field(default_factory=list, description="Список ошибок")
    processed_ids: List[int] = Field(
        default_factory=list, description="Обработанные ID"
    )
    failed_ids: List[int] = Field(default_factory=list, description="Неудачные ID")


# === Схемы для файлов ===


class FileInfo(BaseSchema):
    """Информация о файле"""

    filename: str = Field(..., description="Имя файла")
    size: int = Field(..., ge=0, description="Размер файла в байтах")
    mime_type: Optional[str] = Field(None, description="MIME тип")
    url: Optional[str] = Field(None, description="URL файла")
    uploaded_at: datetime = Field(default_factory=datetime.now)


class UploadResponse(BaseSchema):
    """Ответ на загрузку файла"""

    file: FileInfo = Field(..., description="Информация о загруженном файле")
    message: str = Field("File uploaded successfully", description="Сообщение")


# === Схемы для уведомлений ===


class NotificationBase(BaseSchema):
    """Базовая схема уведомления"""

    title: str = Field(..., max_length=255, description="Заголовок уведомления")
    message: str = Field(..., max_length=1000, description="Текст уведомления")
    type: str = Field("info", description="Тип уведомления")
    priority: PriorityEnum = Field(PriorityEnum.MEDIUM, description="Приоритет")


class NotificationResponse(NotificationBase, ResponseSchema):
    """Схема ответа для уведомления"""

    read_at: Optional[datetime] = Field(None, description="Время прочтения")
    recipient_id: int = Field(..., description="ID получателя")


# === Схемы для настроек ===


class SettingBase(BaseSchema):
    """Базовая схема настройки"""

    key: str = Field(..., max_length=100, description="Ключ настройки")
    value: Any = Field(..., description="Значение настройки")
    description: Optional[str] = Field(None, description="Описание настройки")


class SettingResponse(SettingBase, ResponseSchema):
    """Схема ответа для настройки"""

    is_public: bool = Field(False, description="Публичная настройка")
    updated_by: Optional[int] = Field(None, description="Кто обновил")


# === Типы для документации API ===


class APIVersion(BaseSchema):
    """Информация о версии API"""

    version: str = Field(..., description="Версия API")
    build: Optional[str] = Field(None, description="Номер сборки")
    release_date: Optional[datetime] = Field(None, description="Дата релиза")


class APIInfo(BaseSchema):
    """Информация об API"""

    name: str = Field("Requify API", description="Название API")
    version: APIVersion = Field(..., description="Версия")
    environment: str = Field(..., description="Окружение")
    status: str = Field("healthy", description="Статус API")


# === Псевдонимы для обратной совместимости ===

Notification = NotificationResponse  # Базовое уведомление
