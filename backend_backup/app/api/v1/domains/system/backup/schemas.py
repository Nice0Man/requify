"""
System Backup and Maintenance Schemas.

Схемы для резервного копирования и обслуживания системы.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import Field

from app.api.v1.common.schemas import BaseSchema, CreateSchema


# === Backup Enums ===


class BackupType(str, Enum):
    """Типы резервных копий."""

    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"


class BackupStatus(str, Enum):
    """Статусы резервных копий."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# === Backup Schemas ===


class BackupCreateRequest(CreateSchema):
    """Схема для создания резервной копии."""

    backup_type: BackupType = Field(
        default=BackupType.FULL, description="Тип резервной копии"
    )
    description: Optional[str] = Field(None, description="Описание резервной копии")
    include_uploads: bool = Field(
        default=True, description="Включить загруженные файлы"
    )
    include_logs: bool = Field(default=False, description="Включить логи")
    compression: bool = Field(default=True, description="Использовать сжатие")


class BackupInfo(BaseSchema):
    """Схема для информации о резервной копии."""

    id: int = Field(..., description="ID резервной копии")
    filename: str = Field(..., description="Имя файла")
    backup_type: BackupType = Field(..., description="Тип резервной копии")
    status: BackupStatus = Field(..., description="Статус резервной копии")
    description: Optional[str] = Field(None, description="Описание")

    # Timing
    created_at: datetime = Field(..., description="Время создания")
    started_at: Optional[datetime] = Field(None, description="Время начала")
    completed_at: Optional[datetime] = Field(None, description="Время завершения")

    # Size and statistics
    size_bytes: Optional[int] = Field(None, description="Размер в байтах")
    compressed_size_bytes: Optional[int] = Field(
        None, description="Размер после сжатия"
    )
    compression_ratio: Optional[float] = Field(None, description="Коэффициент сжатия")

    # Content
    include_uploads: bool = Field(..., description="Включены ли файлы")
    include_logs: bool = Field(..., description="Включены ли логи")
    tables_count: Optional[int] = Field(None, description="Количество таблиц")
    files_count: Optional[int] = Field(None, description="Количество файлов")

    # Result
    success: bool = Field(default=False, description="Успешно ли завершена")
    error_message: Optional[str] = Field(None, description="Сообщение об ошибке")

    # Metadata
    created_by_user_id: Optional[int] = Field(
        None, description="ID пользователя создавшего"
    )
    storage_path: Optional[str] = Field(None, description="Путь к файлу")
    checksum: Optional[str] = Field(None, description="Контрольная сумма")

    class Config:
        from_attributes = True


class BackupListResponse(BaseSchema):
    """Схема для списка резервных копий."""

    backups: List[BackupInfo] = Field(..., description="Список резервных копий")
    total: int = Field(..., description="Общее количество")
    page: int = Field(..., description="Текущая страница")
    pages: int = Field(..., description="Общее количество страниц")
    total_size_bytes: int = Field(..., description="Общий размер всех копий")


class BackupCreateResponse(BaseSchema):
    """Схема для ответа при создании резервной копии."""

    backup_id: int = Field(..., description="ID созданной резервной копии")
    message: str = Field(..., description="Сообщение о результате")
    estimated_duration: Optional[int] = Field(
        None, description="Предполагаемая длительность в секундах"
    )


class BackupRestoreRequest(CreateSchema):
    """Схема для восстановления из резервной копии."""

    backup_id: int = Field(..., description="ID резервной копии")
    restore_uploads: bool = Field(default=True, description="Восстановить файлы")
    restore_database: bool = Field(default=True, description="Восстановить базу данных")
    force: bool = Field(default=False, description="Принудительное восстановление")


class BackupRestoreResponse(BaseSchema):
    """Схема для ответа при восстановлении."""

    success: bool = Field(..., description="Успешно ли восстановление")
    message: str = Field(..., description="Сообщение о результате")
    restore_id: Optional[int] = Field(None, description="ID операции восстановления")


# === Maintenance Schemas ===


class MaintenanceMode(str, Enum):
    """Режимы обслуживания."""

    DISABLED = "disabled"
    READ_ONLY = "read_only"
    FULL_MAINTENANCE = "full_maintenance"


class MaintenanceStatus(BaseSchema):
    """Схема для статуса обслуживания."""

    enabled: bool = Field(..., description="Включен ли режим обслуживания")
    mode: MaintenanceMode = Field(..., description="Режим обслуживания")
    message: Optional[str] = Field(None, description="Сообщение пользователям")
    started_at: Optional[datetime] = Field(None, description="Время начала")
    estimated_end: Optional[datetime] = Field(
        None, description="Предполагаемое время окончания"
    )
    started_by_user_id: Optional[int] = Field(None, description="Кем начато")


class MaintenanceStartRequest(CreateSchema):
    """Схема для запуска режима обслуживания."""

    mode: MaintenanceMode = Field(..., description="Режим обслуживания")
    message: Optional[str] = Field(None, description="Сообщение пользователям")
    estimated_duration: Optional[int] = Field(
        None, description="Предполагаемая длительность в минутах"
    )


class MaintenanceResponse(BaseSchema):
    """Схема для ответа операций обслуживания."""

    success: bool = Field(..., description="Успешно ли выполнена операция")
    message: str = Field(..., description="Сообщение о результате")
    status: MaintenanceStatus = Field(..., description="Текущий статус обслуживания")


# === Cache Management Schemas ===


class CacheInfo(BaseSchema):
    """Схема для информации о кеше."""

    name: str = Field(..., description="Название кеша")
    type: str = Field(..., description="Тип кеша (redis, memory, file)")
    size: int = Field(..., description="Размер кеша")
    entries_count: int = Field(..., description="Количество записей")
    hit_rate: Optional[float] = Field(None, description="Процент попаданий")
    last_access: Optional[datetime] = Field(None, description="Последний доступ")


class CacheStatsResponse(BaseSchema):
    """Схема для статистики кеша."""

    caches: List[CacheInfo] = Field(..., description="Список кешей")
    total_size: int = Field(..., description="Общий размер")
    total_entries: int = Field(..., description="Общее количество записей")
    overall_hit_rate: Optional[float] = Field(
        None, description="Общий процент попаданий"
    )


class CacheClearRequest(CreateSchema):
    """Схема для очистки кеша."""

    cache_names: Optional[List[str]] = Field(
        None, description="Названия кешей для очистки (все если None)"
    )
    pattern: Optional[str] = Field(
        None, description="Паттерн для очистки конкретных ключей"
    )


class CacheClearResponse(BaseSchema):
    """Схема для ответа очистки кеша."""

    success: bool = Field(..., description="Успешно ли выполнена очистка")
    message: str = Field(..., description="Сообщение о результате")
    cleared_caches: List[str] = Field(..., description="Очищенные кеши")
    cleared_entries: int = Field(..., description="Количество очищенных записей")


# === System Information Schemas ===


class SystemInfo(BaseSchema):
    """Схема для системной информации."""

    # Application info
    app_version: str = Field(..., description="Версия приложения")
    app_environment: str = Field(..., description="Окружение (dev, prod, test)")
    uptime: float = Field(..., description="Время работы в секундах")

    # System info
    platform: str = Field(..., description="Платформа")
    python_version: str = Field(..., description="Версия Python")
    database_version: str = Field(..., description="Версия базы данных")

    # Resources
    cpu_usage: float = Field(..., description="Использование CPU в процентах")
    memory_usage: float = Field(..., description="Использование памяти в процентах")
    disk_usage: float = Field(..., description="Использование диска в процентах")

    # Database
    database_size: int = Field(..., description="Размер базы данных в байтах")
    active_connections: int = Field(..., description="Активные подключения к БД")

    # Additional stats
    total_users: int = Field(..., description="Общее количество пользователей")
    total_companies: int = Field(..., description="Общее количество компаний")
    total_projects: int = Field(..., description="Общее количество проектов")
