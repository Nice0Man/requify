"""
System Audit and Logging Schemas.

Схемы для аудита и логирования системы.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema


# === Audit Log Enums ===


class AuditAction(str, Enum):
    """Типы действий для аудита."""

    # User actions
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTER = "user_register"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"

    # Admin actions
    ADMIN_USER_ACTIVATE = "admin_user_activate"
    ADMIN_USER_DEACTIVATE = "admin_user_deactivate"
    ADMIN_USER_DELETE = "admin_user_delete"

    # System actions
    SYSTEM_BACKUP_CREATE = "system_backup_create"
    SYSTEM_MAINTENANCE_START = "system_maintenance_start"
    SYSTEM_MAINTENANCE_END = "system_maintenance_end"

    # Security events
    SECURITY_PASSWORD_RESET = "security_password_reset"
    SECURITY_EMAIL_VERIFY = "security_email_verify"
    SECURITY_FAILED_LOGIN = "security_failed_login"


class AuditLevel(str, Enum):
    """Уровни важности для аудита."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


# === Audit Log Schemas ===


class AuditLogEntry(BaseSchema):
    """Схема для записи аудита."""

    id: int = Field(..., description="ID записи")
    action: AuditAction = Field(..., description="Тип действия")
    level: AuditLevel = Field(..., description="Уровень важности")
    timestamp: datetime = Field(..., description="Время события")

    # User information
    user_id: Optional[int] = Field(None, description="ID пользователя")
    user_email: Optional[str] = Field(None, description="Email пользователя")

    # Request information
    ip_address: Optional[str] = Field(None, description="IP адрес")
    user_agent: Optional[str] = Field(None, description="User agent")
    request_id: Optional[str] = Field(None, description="ID запроса")

    # Event details
    resource_type: Optional[str] = Field(None, description="Тип ресурса")
    resource_id: Optional[str] = Field(None, description="ID ресурса")
    description: str = Field(..., description="Описание события")
    details: Optional[Dict[str, Any]] = Field(None, description="Дополнительные детали")

    # Result
    success: bool = Field(..., description="Успешно ли выполнено действие")
    error_message: Optional[str] = Field(None, description="Сообщение об ошибке")

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseSchema):
    """Схема для списка записей аудита."""

    entries: List[AuditLogEntry] = Field(..., description="Список записей аудита")
    total: int = Field(..., description="Общее количество записей")
    page: int = Field(..., description="Текущая страница")
    pages: int = Field(..., description="Общее количество страниц")


class AuditLogFilterRequest(BaseSchema):
    """Схема для фильтрации записей аудита."""

    action: Optional[AuditAction] = Field(None, description="Фильтр по типу действия")
    level: Optional[AuditLevel] = Field(None, description="Фильтр по уровню важности")
    user_id: Optional[int] = Field(None, description="Фильтр по пользователю")
    user_email: Optional[str] = Field(None, description="Фильтр по email пользователя")
    resource_type: Optional[str] = Field(None, description="Фильтр по типу ресурса")
    ip_address: Optional[str] = Field(None, description="Фильтр по IP адресу")
    success: Optional[bool] = Field(None, description="Фильтр по результату")
    date_from: Optional[datetime] = Field(None, description="Дата от")
    date_to: Optional[datetime] = Field(None, description="Дата до")
    search: Optional[str] = Field(None, description="Поиск в описании")
    page: int = Field(default=1, ge=1, description="Номер страницы")
    size: int = Field(default=50, ge=1, le=500, description="Размер страницы")


# === Security Event Schemas ===


class SecurityEvent(BaseSchema):
    """Схема для событий безопасности."""

    id: int = Field(..., description="ID события")
    event_type: str = Field(..., description="Тип события безопасности")
    severity: str = Field(..., description="Серьезность (low, medium, high, critical)")
    timestamp: datetime = Field(..., description="Время события")

    # Source information
    source_ip: Optional[str] = Field(None, description="IP источника")
    user_agent: Optional[str] = Field(None, description="User agent")
    user_id: Optional[int] = Field(None, description="ID пользователя если есть")

    # Event details
    description: str = Field(..., description="Описание события")
    details: Optional[Dict[str, Any]] = Field(None, description="Дополнительные детали")
    risk_score: Optional[int] = Field(None, description="Оценка риска (0-100)")

    # Response
    resolved: bool = Field(default=False, description="Решено ли событие")
    resolved_at: Optional[datetime] = Field(None, description="Время решения")
    resolved_by: Optional[int] = Field(None, description="Кем решено (user ID)")

    class Config:
        from_attributes = True


class SecurityEventListResponse(BaseSchema):
    """Схема для списка событий безопасности."""

    events: List[SecurityEvent] = Field(..., description="Список событий безопасности")
    total: int = Field(..., description="Общее количество событий")
    page: int = Field(..., description="Текущая страница")
    pages: int = Field(..., description="Общее количество страниц")


class SecurityEventFilterRequest(BaseSchema):
    """Схема для фильтрации событий безопасности."""

    event_type: Optional[str] = Field(None, description="Фильтр по типу события")
    severity: Optional[str] = Field(None, description="Фильтр по серьезности")
    resolved: Optional[bool] = Field(None, description="Фильтр по статусу решения")
    source_ip: Optional[str] = Field(None, description="Фильтр по IP источника")
    user_id: Optional[int] = Field(None, description="Фильтр по пользователю")
    date_from: Optional[datetime] = Field(None, description="Дата от")
    date_to: Optional[datetime] = Field(None, description="Дата до")
    min_risk_score: Optional[int] = Field(
        None, ge=0, le=100, description="Минимальная оценка риска"
    )
    search: Optional[str] = Field(None, description="Поиск в описании")
    page: int = Field(default=1, ge=1, description="Номер страницы")
    size: int = Field(default=50, ge=1, le=500, description="Размер страницы")


# === System Log Schemas ===


class SystemLogEntry(BaseSchema):
    """Схема для записи системного лога."""

    timestamp: datetime = Field(..., description="Время записи")
    level: str = Field(
        ..., description="Уровень лога (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )
    logger: str = Field(..., description="Имя логгера")
    message: str = Field(..., description="Сообщение")
    module: Optional[str] = Field(None, description="Модуль")
    function: Optional[str] = Field(None, description="Функция")
    line: Optional[int] = Field(None, description="Номер строки")
    extras: Optional[Dict[str, Any]] = Field(None, description="Дополнительные поля")


class SystemLogListResponse(BaseSchema):
    """Схема для списка системных логов."""

    logs: List[SystemLogEntry] = Field(..., description="Список записей логов")
    total: int = Field(..., description="Общее количество записей")
    page: int = Field(..., description="Текущая страница")
    pages: int = Field(..., description="Общее количество страниц")


class SystemLogFilterRequest(BaseSchema):
    """Схема для фильтрации системных логов."""

    level: Optional[str] = Field(None, description="Фильтр по уровню")
    logger: Optional[str] = Field(None, description="Фильтр по логгеру")
    module: Optional[str] = Field(None, description="Фильтр по модулю")
    date_from: Optional[datetime] = Field(None, description="Дата от")
    date_to: Optional[datetime] = Field(None, description="Дата до")
    search: Optional[str] = Field(None, description="Поиск в сообщении")
    page: int = Field(default=1, ge=1, description="Номер страницы")
    size: int = Field(default=100, ge=1, le=1000, description="Размер страницы")
