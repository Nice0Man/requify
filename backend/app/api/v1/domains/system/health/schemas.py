"""
System Health Monitoring Schemas.

Схемы для мониторинга здоровья системы.
"""

from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Health Check Schemas ===


class SystemHealthResponse(BaseSchema):
    """Схема для базового ответа о здоровье системы."""

    status: str = Field(
        ..., description="Статус системы (healthy, degraded, unhealthy)"
    )
    timestamp: datetime = Field(..., description="Время проверки")
    uptime: float = Field(..., description="Время работы в секундах")
    version: str = Field(..., description="Версия приложения")


class DetailedHealthResponse(BaseSchema):
    """Схема для детального ответа о здоровье системы."""

    status: str = Field(..., description="Общий статус системы")
    timestamp: datetime = Field(..., description="Время проверки")
    uptime: float = Field(..., description="Время работы в секундах")
    version: str = Field(..., description="Версия приложения")

    # Детали по компонентам
    database: Dict[str, Any] = Field(..., description="Статус базы данных")
    redis: Dict[str, Any] = Field(..., description="Статус Redis")
    storage: Dict[str, Any] = Field(..., description="Статус файлового хранилища")
    external_services: Dict[str, Any] = Field(
        ..., description="Статус внешних сервисов"
    )

    # Системные ресурсы
    system_resources: Dict[str, Any] = Field(..., description="Использование ресурсов")


class HealthCheckRequest(BaseSchema):
    """Схема для запроса проверки здоровья."""

    check_components: bool = Field(default=True, description="Проверить компоненты")
    check_resources: bool = Field(default=True, description="Проверить ресурсы")
    timeout: Optional[int] = Field(None, description="Таймаут проверки в секундах")


# === Health Status Enums ===


class HealthStatus:
    """Константы статусов здоровья."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class ComponentHealth(BaseSchema):
    """Схема для здоровья отдельного компонента."""

    name: str = Field(..., description="Название компонента")
    status: str = Field(..., description="Статус компонента")
    response_time: Optional[float] = Field(None, description="Время отклика в мс")
    last_check: datetime = Field(..., description="Время последней проверки")
    details: Optional[Dict[str, Any]] = Field(None, description="Дополнительные детали")
    error: Optional[str] = Field(None, description="Ошибка если есть")
