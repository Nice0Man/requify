"""
Common System Administration Schemas.

Общие схемы для системного администрирования, используемые во всех поддоменах.
Конкретные схемы находятся в соответствующих поддоменах.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Common System Enums ===


class SystemStatus(str, Enum):
    """Общие статусы системы."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    MAINTENANCE = "maintenance"
    UNKNOWN = "unknown"


class OperationResult(str, Enum):
    """Результаты системных операций."""

    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"
    CANCELLED = "cancelled"


# === Base Response Schemas ===


class SystemOperationResponse(BaseSchema):
    """Базовая схема для ответа системной операции."""

    success: bool = Field(..., description="Успешно ли выполнена операция")
    message: str = Field(..., description="Сообщение о результате")
    operation_id: Optional[str] = Field(
        None, description="ID операции для отслеживания"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время операции"
    )


class SystemErrorResponse(BaseSchema):
    """Схема для ошибок системных операций."""

    error_code: str = Field(..., description="Код ошибки")
    error_message: str = Field(..., description="Сообщение об ошибке")
    details: Optional[Dict[str, Any]] = Field(None, description="Дополнительные детали")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Время ошибки"
    )
    request_id: Optional[str] = Field(None, description="ID запроса")


# === Common Info Schemas ===


class ResourceUsage(BaseSchema):
    """Схема для использования ресурсов."""

    cpu_percent: float = Field(..., description="Использование CPU в процентах")
    memory_percent: float = Field(..., description="Использование памяти в процентах")
    disk_percent: float = Field(..., description="Использование диска в процентах")
    memory_total: int = Field(..., description="Общая память в байтах")
    memory_available: int = Field(..., description="Доступная память в байтах")
    disk_total: int = Field(..., description="Общий размер диска в байтах")
    disk_free: int = Field(..., description="Свободное место в байтах")


class ServiceStatus(BaseSchema):
    """Схема для статуса сервиса."""

    name: str = Field(..., description="Название сервиса")
    status: SystemStatus = Field(..., description="Статус сервиса")
    uptime: Optional[float] = Field(None, description="Время работы в секундах")
    last_check: datetime = Field(..., description="Время последней проверки")
    response_time: Optional[float] = Field(None, description="Время отклика в мс")
    error_message: Optional[str] = Field(None, description="Сообщение об ошибке")


# === Pagination Schemas ===


class PaginationInfo(BaseSchema):
    """Схема для информации о пагинации."""

    page: int = Field(..., description="Текущая страница")
    size: int = Field(..., description="Размер страницы")
    total: int = Field(..., description="Общее количество элементов")
    pages: int = Field(..., description="Общее количество страниц")


class BaseListResponse(BaseSchema):
    """Базовая схема для списков с пагинацией."""

    pagination: PaginationInfo = Field(..., description="Информация о пагинации")


# Импорты из поддоменов для обратной совместимости
from .health.schemas import (
    SystemHealthResponse,
    DetailedHealthResponse,
    HealthCheckRequest,
    ComponentHealth,
)

from .admin.schemas import (
    AdminUserListResponse,
    AdminCompanyListResponse,
    UserStatsResponse,
    CompanyStatsResponse,
    UserActionRequest,
    UserActionResponse,
)

from .audit.schemas import (
    AuditLogListResponse,
    SecurityEventListResponse,
    SystemLogListResponse,
    AuditAction,
    AuditLevel,
)

from .backup.schemas import (
    BackupCreateRequest,
    BackupCreateResponse,
    BackupListResponse,
    BackupRestoreRequest,
    BackupRestoreResponse,
    MaintenanceStatus,
    MaintenanceStartRequest,
    MaintenanceResponse,
    CacheStatsResponse,
    CacheClearRequest,
    CacheClearResponse,
)

from .metrics.schemas import (
    SystemMetricsResponse,
    MetricsResponse,
    ApplicationMetrics,
    ErrorMetrics,
    PerformanceMetrics,
    CustomMetricsListResponse,
)


__all__ = [
    "SystemStatus",
    "OperationResult",
    "SystemOperationResponse",
    "SystemErrorResponse",
    "ResourceUsage",
    "ServiceStatus",
    "PaginationInfo",
    "BaseListResponse",
    "SystemHealthResponse",
    "DetailedHealthResponse",
    "HealthCheckRequest",
    "ComponentHealth",
    "AdminUserListResponse",
    "AdminCompanyListResponse",
    "UserStatsResponse",
    "CompanyStatsResponse",
    "UserActionRequest",
    "UserActionResponse",
    "AuditLogListResponse",
    "SecurityEventListResponse",
    "SystemLogListResponse",
    "AuditAction",
    "AuditLevel",
    "BackupCreateRequest",
    "BackupCreateResponse",
    "BackupListResponse",
    "BackupRestoreRequest",
    "BackupRestoreResponse",
    "MaintenanceStatus",
    "MaintenanceStartRequest",
    "MaintenanceResponse",
    "CacheStatsResponse",
    "CacheClearRequest",
    "CacheClearResponse",
    "SystemMetricsResponse",
    "MetricsResponse",
    "ApplicationMetrics",
    "ErrorMetrics",
    "PerformanceMetrics",
    "CustomMetricsListResponse",
]
