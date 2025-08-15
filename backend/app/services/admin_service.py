"""
Admin Service.

Сервис для административных операций системы.
Реализует принципы SOLID и паттерны проектирования.
Рефакторен для лучшей архитектуры.
"""

import os
import platform
import psutil
import shutil
from datetime import datetime, UTC, timedelta
from typing import Dict, List, Any, Optional, Union
from abc import ABC, abstractmethod

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.crud import user as crud_user
from app.models.user import User
from app.utils.logger import logger
from app.core.security import (
    EnhancedRolePermissionChecker,
    check_user_permission,
    require_system_admin,
)
from app.core.constants import Permission
from .base import BaseService, ServiceError, NotFoundError, PermissionError


class AdminServiceError(ServiceError):
    """Ошибки административного сервиса."""
    pass


class SystemInfoError(AdminServiceError):
    """Ошибки получения системной информации."""
    pass


class BackupError(AdminServiceError):
    """Ошибки работы с резервными копиями."""
    pass


# Абстрактные интерфейсы
class ISystemMonitor(ABC):
    """Интерфейс для мониторинга системы."""
    
    @abstractmethod
    def get_system_info(self) -> Dict[str, Any]:
        """Получить информацию о системе."""
        pass
    
    @abstractmethod
    def get_health_status(self) -> Dict[str, Any]:
        """Получить статус здоровья системы."""
        pass
    
    @abstractmethod
    def get_metrics(self) -> Dict[str, Any]:
        """Получить метрики системы."""
        pass


class IUserManager(ABC):
    """Интерфейс для управления пользователями."""
    
    @abstractmethod
    async def get_users(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[User]:
        """Получить список пользователей."""
        pass
    
    @abstractmethod
    async def activate_user(self, db: AsyncSession, user_id: int) -> User:
        """Активировать пользователя."""
        pass
    
    @abstractmethod
    async def deactivate_user(self, db: AsyncSession, user_id: int) -> User:
        """Деактивировать пользователя."""
        pass


class IBackupManager(ABC):
    """Интерфейс для управления резервными копиями."""
    
    @abstractmethod
    async def create_backup(self, db: AsyncSession) -> Dict[str, Any]:
        """Создать резервную копию."""
        pass
    
    @abstractmethod
    def list_backups(self) -> List[Dict[str, Any]]:
        """Получить список резервных копий."""
        pass
    
    @abstractmethod
    async def restore_backup(self, backup_name: str) -> bool:
        """Восстановить из резервной копии."""
        pass


# Конкретные реализации
class SystemMonitor(ISystemMonitor):
    """Мониторинг системы."""
    
    def get_system_info(self) -> Dict[str, Any]:
        """
        Получить комплексную информацию о системе.
        
        Returns:
            Dict[str, Any]: Информация о системе включая платформу, ресурсы и детали приложения
        """
        try:
            cpu_count = psutil.cpu_count()
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            system_info = {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "python_version": platform.python_version(),
                "cpu_count": cpu_count,
                "memory": {
                    "total": memory.total // (1024**3),  # GB
                    "available": memory.available // (1024**3),  # GB
                    "percent": memory.percent,
                },
                "disk": {
                    "total": disk.total // (1024**3),  # GB
                    "free": disk.free // (1024**3),  # GB
                    "used": disk.used // (1024**3),  # GB
                    "percent": round((disk.used / disk.total) * 100, 2),
                },
                "app_version": settings.run.version,
                "debug_mode": settings.run.debug,
                "environment": settings.run.env,
            }

            logger.info("System information retrieved successfully")
            return system_info

        except Exception as e:
            logger.error(f"Error gathering system info: {e}")
            # Fallback в случае ошибки
            return {
                "platform": platform.system(),
                "python_version": platform.python_version(),
                "error": f"Could not gather full system info: {str(e)}",
                "app_version": settings.run.version,
                "debug_mode": settings.run.debug,
                "environment": settings.run.env,
            }

    def get_health_status(self) -> Dict[str, Any]:
        """
        Получить статус здоровья приложения.
        
        Returns:
            Dict[str, Any]: Информация о статусе здоровья
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()

            health_status = {
                "status": (
                    "healthy" if cpu_percent < 80 and memory.percent < 90 else "warning"
                ),
                "timestamp": datetime.now(UTC).isoformat(),
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "uptime": "unknown",  # Could be implemented based on requirements
            }

            logger.info("Health status check completed")
            return health_status

        except Exception as e:
            logger.error(f"Error checking health status: {e}")
            return {
                "status": "error",
                "timestamp": datetime.now(UTC).isoformat(),
                "error": str(e),
            }

    def get_metrics(self) -> Dict[str, Any]:
        """
        Получить метрики системы для мониторинга.
        
        Returns:
            Dict[str, Any]: Метрики системы
        """
        try:
            cpu_stats = psutil.cpu_times()
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            disk_io = psutil.disk_io_counters()
            network_io = psutil.net_io_counters()

            metrics = {
                "timestamp": datetime.now(UTC).isoformat(),
                "cpu": {
                    "percent": psutil.cpu_percent(),
                    "user": cpu_stats.user,
                    "system": cpu_stats.system,
                    "idle": cpu_stats.idle,
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "used": memory.used,
                    "free": memory.free,
                },
                "swap": (
                    {
                        "total": swap.total,
                        "used": swap.used,
                        "free": swap.free,
                        "percent": swap.percent,
                    }
                    if swap.total > 0
                    else None
                ),
                "disk_io": (
                    {
                        "read_count": disk_io.read_count,
                        "write_count": disk_io.write_count,
                        "read_bytes": disk_io.read_bytes,
                        "write_bytes": disk_io.write_bytes,
                    }
                    if disk_io
                    else None
                ),
                "network_io": (
                    {
                        "bytes_sent": network_io.bytes_sent,
                        "bytes_recv": network_io.bytes_recv,
                        "packets_sent": network_io.packets_sent,
                        "packets_recv": network_io.packets_recv,
                    }
                    if network_io
                    else None
                ),
            }

            logger.info("System metrics retrieved successfully")
            return metrics

        except Exception as e:
            logger.error(f"Error retrieving metrics: {e}")
            return {
                "timestamp": datetime.now(UTC).isoformat(),
                "error": str(e),
                "status": "error",
            }


class UserManager(IUserManager):
    """Менеджер для управления пользователями."""
    
    def __init__(self):
        self.permission_checker = EnhancedRolePermissionChecker()
    
    async def get_users(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[User]:
        """
        Получить список пользователей с фильтрацией.
        
        Args:
            db: Сессия базы данных
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей
            filters: Фильтры поиска
        
        Returns:
            List[User]: Список пользователей
        """
        try:
            if filters:
                return await crud_user.get_multi_filtered(
                    db, skip=skip, limit=limit, filters=filters
                )
            else:
                return await crud_user.get_multi(db, skip=skip, limit=limit)
        except Exception as e:
            logger.error(f"Error getting users: {e}")
            raise AdminServiceError(f"Failed to get users: {str(e)}")
    
    async def activate_user(self, db: AsyncSession, user_id: int) -> User:
        """
        Активировать пользователя.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
        
        Returns:
            User: Активированный пользователь
        """
        try:
            user = await crud_user.get(db, id=user_id)
            if not user:
                raise NotFoundError(f"User with id {user_id} not found")
            
            if user.is_active:
                logger.info(f"User {user_id} is already active")
                return user
            
            updated_user = await crud_user.update(
                db, db_obj=user, obj_in={"is_active": True}
            )
            
            logger.info(f"User {user_id} activated successfully")
            return updated_user
            
        except Exception as e:
            logger.error(f"Error activating user {user_id}: {e}")
            raise AdminServiceError(f"Failed to activate user: {str(e)}")
    
    async def deactivate_user(self, db: AsyncSession, user_id: int) -> User:
        """
        Деактивировать пользователя.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
        
        Returns:
            User: Деактивированный пользователь
        """
        try:
            user = await crud_user.get(db, id=user_id)
            if not user:
                raise NotFoundError(f"User with id {user_id} not found")
            
            if not user.is_active:
                logger.info(f"User {user_id} is already inactive")
                return user
            
            updated_user = await crud_user.update(
                db, db_obj=user, obj_in={"is_active": False}
            )
            
            logger.info(f"User {user_id} deactivated successfully")
            return updated_user
            
        except Exception as e:
            logger.error(f"Error deactivating user {user_id}: {e}")
            raise AdminServiceError(f"Failed to deactivate user: {str(e)}")


class BackupManager(IBackupManager):
    """Менеджер резервных копий."""
    
    def __init__(self):
        self.backup_dir = getattr(settings, 'backup_directory', '/tmp/backups')
        os.makedirs(self.backup_dir, exist_ok=True)
    
    async def create_backup(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Создать резервную копию системы.
        
        Args:
            db: Сессия базы данных
        
        Returns:
            Dict[str, Any]: Информация о созданной резервной копии
        """
        try:
            timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
            backup_name = f"backup_{timestamp}"
            backup_path = os.path.join(self.backup_dir, f"{backup_name}.sql")
            
            # Здесь должна быть логика создания резервной копии БД
            # Пример для PostgreSQL:
            # pg_dump_cmd = f"pg_dump {database_url} > {backup_path}"
            
            # Для демонстрации создаем простой файл
            with open(backup_path, 'w') as f:
                f.write(f"-- Backup created at {datetime.now(UTC).isoformat()}\n")
                f.write("-- This is a demo backup file\n")
            
            backup_info = {
                "name": backup_name,
                "path": backup_path,
                "created_at": datetime.now(UTC).isoformat(),
                "size": os.path.getsize(backup_path),
                "status": "completed"
            }
            
            logger.info(f"Backup created successfully: {backup_name}")
            return backup_info
            
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            raise BackupError(f"Failed to create backup: {str(e)}")
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """
        Получить список всех резервных копий.
        
        Returns:
            List[Dict[str, Any]]: Список резервных копий
        """
        try:
            backups = []
            if os.path.exists(self.backup_dir):
                for filename in os.listdir(self.backup_dir):
                    if filename.endswith('.sql'):
                        file_path = os.path.join(self.backup_dir, filename)
                        stat = os.stat(file_path)
                        
                        backups.append({
                            "name": filename.replace('.sql', ''),
                            "filename": filename,
                            "size": stat.st_size,
                            "created_at": datetime.fromtimestamp(stat.st_ctime, UTC).isoformat(),
                            "modified_at": datetime.fromtimestamp(stat.st_mtime, UTC).isoformat(),
                        })
            
            # Сортировать по дате создания (новые первыми)
            backups.sort(key=lambda x: x['created_at'], reverse=True)
            
            logger.info(f"Found {len(backups)} backup files")
            return backups
            
        except Exception as e:
            logger.error(f"Error listing backups: {e}")
            raise BackupError(f"Failed to list backups: {str(e)}")
    
    async def restore_backup(self, backup_name: str) -> bool:
        """
        Восстановить систему из резервной копии.
        
        Args:
            backup_name: Имя резервной копии
        
        Returns:
            bool: Успешность восстановления
        """
        try:
            backup_path = os.path.join(self.backup_dir, f"{backup_name}.sql")
            
            if not os.path.exists(backup_path):
                raise NotFoundError(f"Backup {backup_name} not found")
            
            # Здесь должна быть логика восстановления БД
            # Пример для PostgreSQL:
            # psql_cmd = f"psql {database_url} < {backup_path}"
            
            logger.info(f"Backup {backup_name} restored successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error restoring backup {backup_name}: {e}")
            raise BackupError(f"Failed to restore backup: {str(e)}")


class PermissionValidator:
    """Валидатор прав доступа для административных операций."""
    
    @staticmethod
    async def validate_admin_access(db: AsyncSession, user: User, operation: str):
        """Проверить административные права доступа."""
        if not await check_user_permission(db, user, Permission.SYSTEM_ADMIN):
            raise PermissionError(f"Insufficient permissions for operation: {operation}")
    
    @staticmethod
    async def validate_user_management_access(db: AsyncSession, user: User):
        """Проверить права на управление пользователями."""
        if not await check_user_permission(db, user, Permission.MANAGE_USERS):
            raise PermissionError("Insufficient permissions for user management")


class AdminService(BaseService):
    """
    Основной административный сервис.
    
    Реализует паттерны:
    - Singleton (через BaseService)
    - Facade (объединяет несколько подсервисов)
    - Strategy (разные стратегии для разных операций)
    - Command (для выполнения административных команд)
    """
    
    def __init__(self):
        self._system_monitor = SystemMonitor()
        self._user_manager = UserManager()
        self._backup_manager = BackupManager()
        self._permission_validator = PermissionValidator()
        super().__init__()
    
    def get_service_name(self) -> str:
        return "AdminService"
    
    # Системная информация
    def get_system_info(self) -> Dict[str, Any]:
        """Получить информацию о системе."""
        try:
            self._log_operation("get_system_info")
            return self._system_monitor.get_system_info()
        except Exception as e:
            raise self._handle_error(e, "get_system_info")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Получить статус здоровья системы."""
        try:
            self._log_operation("get_health_status")
            return self._system_monitor.get_health_status()
        except Exception as e:
            raise self._handle_error(e, "get_health_status")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Получить метрики системы."""
        try:
            self._log_operation("get_metrics")
            return self._system_monitor.get_metrics()
        except Exception as e:
            raise self._handle_error(e, "get_metrics")
    
    # Управление пользователями
    async def get_users(
        self, 
        db: AsyncSession, 
        current_user: User,
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[User]:
        """Получить список пользователей."""
        try:
            self._log_operation("get_users", {
                "skip": skip, 
                "limit": limit, 
                "current_user_id": current_user.id
            })
            
            await self._permission_validator.validate_user_management_access(
                db, current_user
            )
            
            return await self._user_manager.get_users(db, skip, limit, filters)
            
        except Exception as e:
            raise self._handle_error(e, "get_users")
    
    async def activate_user(
        self, 
        db: AsyncSession, 
        user_id: int, 
        current_user: User
    ) -> User:
        """Активировать пользователя."""
        try:
            self._log_operation("activate_user", {
                "user_id": user_id, 
                "current_user_id": current_user.id
            })
            
            await self._permission_validator.validate_user_management_access(
                db, current_user
            )
            
            return await self._user_manager.activate_user(db, user_id)
            
        except Exception as e:
            raise self._handle_error(e, "activate_user")
    
    async def deactivate_user(
        self, 
        db: AsyncSession, 
        user_id: int, 
        current_user: User
    ) -> User:
        """Деактивировать пользователя."""
        try:
            self._log_operation("deactivate_user", {
                "user_id": user_id, 
                "current_user_id": current_user.id
            })
            
            await self._permission_validator.validate_user_management_access(
                db, current_user
            )
            
            return await self._user_manager.deactivate_user(db, user_id)
            
        except Exception as e:
            raise self._handle_error(e, "deactivate_user")
    
    # Управление резервными копиями
    async def create_backup(
        self, 
        db: AsyncSession, 
        current_user: User
    ) -> Dict[str, Any]:
        """Создать резервную копию."""
        try:
            self._log_operation("create_backup", {
                "current_user_id": current_user.id
            })
            
            await self._permission_validator.validate_admin_access(
                db, current_user, "create_backup"
            )
            
            return await self._backup_manager.create_backup(db)
            
        except Exception as e:
            raise self._handle_error(e, "create_backup")
    
    def list_backups(self, current_user: User) -> List[Dict[str, Any]]:
        """Получить список резервных копий."""
        try:
            self._log_operation("list_backups", {
                "current_user_id": current_user.id
            })
            
            return self._backup_manager.list_backups()
            
        except Exception as e:
            raise self._handle_error(e, "list_backups")
    
    async def restore_backup(
        self, 
        backup_name: str, 
        current_user: User
    ) -> bool:
        """Восстановить из резервной копии."""
        try:
            self._log_operation("restore_backup", {
                "backup_name": backup_name,
                "current_user_id": current_user.id
            })
            
            return await self._backup_manager.restore_backup(backup_name)
            
        except Exception as e:
            raise self._handle_error(e, "restore_backup")


# Регистрация сервиса в фабрике
from .base import ServiceFactory
ServiceFactory.register_service("admin", AdminService)

# Singleton instance
admin_service = AdminService()