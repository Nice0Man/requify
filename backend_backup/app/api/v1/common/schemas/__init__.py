"""
Общие схемы для API v2.
Экспорт всех базовых классов и утилит для схем.
"""

# Базовые классы и утилиты
from .base import (
    # Базовые классы
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    TimestampedBase,
    ListResponseSchema,
    # Утилиты и генераторы
    create_crud_schemas,
    ValidationMixin,
    # Константы
    FieldLimits,
    StandardDescriptions,
)

# Общие схемы и типы
from .common import (
    # Перечисления
    StatusEnum,
    PriorityEnum,
    SortOrderEnum,
    # Схемы ответов
    HealthCheckResponse,
    MessageResponse,
    ErrorResponse,
    ValidationErrorResponse,
    # Схемы для пагинации и поиска
    PaginationRequest,
    SortRequest,
    SearchRequest,
    DateRangeFilter,
    # Метаданные
    MetadataSchema,
    ResponseWithMetadata,
    # Аудит
    AuditInfo,
    # Статистика
    CountStatistic,
    TimeSeriesPoint,
    TimeSeriesStatistic,
    # Массовые операции
    BulkOperation,
    BulkOperationResult,
    # Файлы
    FileInfo,
    UploadResponse,
    # Уведомления
    NotificationBase,
    NotificationResponse,
    Notification,
    # Настройки
    SettingBase,
    SettingResponse,
    # API информация
    APIVersion,
    APIInfo,
)

__all__ = [
    # Базовые классы
    "BaseSchema",
    "CreateSchema",
    "UpdateSchema",
    "ResponseSchema",
    "TimestampedBase",
    "ListResponseSchema",
    # Утилиты
    "create_crud_schemas",
    "ValidationMixin",
    "FieldLimits",
    "StandardDescriptions",
    # Перечисления
    "StatusEnum",
    "PriorityEnum",
    "SortOrderEnum",
    # Схемы ответов
    "HealthCheckResponse",
    "MessageResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
    # Пагинация и поиск
    "PaginationRequest",
    "SortRequest",
    "SearchRequest",
    "DateRangeFilter",
    # Метаданные
    "MetadataSchema",
    "ResponseWithMetadata",
    # Аудит
    "AuditInfo",
    # Статистика
    "CountStatistic",
    "TimeSeriesPoint",
    "TimeSeriesStatistic",
    # Массовые операции
    "BulkOperation",
    "BulkOperationResult",
    # Файлы
    "FileInfo",
    "UploadResponse",
    # Уведомления
    "NotificationBase",
    "NotificationResponse",
    "Notification",
    # Настройки
    "SettingBase",
    "SettingResponse",
    # API информация
    "APIVersion",
    "APIInfo",
]
