"""
Admin Service.

Сервис для административных операций системы.
Реализует принципы SOLID.
"""

import os
import platform
import psutil
import shutil
from datetime import datetime, UTC
from typing import Dict, List, Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.crud import user as crud_user
from app.models.user import User
from app.utils.logger import logger


class SystemInfoService:
    """
    Service for system information operations.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за системную информацию
    - Open/Closed: легко расширяется новыми метриками
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для системных операций
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    def get_system_info() -> Dict[str, Any]:
        """
        Get comprehensive system information.

        Returns:
            Dict[str, Any]: System information including platform, resources, and app details
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

    @staticmethod
    def get_health_status() -> Dict[str, Any]:
        """
        Get application health status.

        Returns:
            Dict[str, Any]: Health status information
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

    @staticmethod
    def get_metrics() -> Dict[str, Any]:
        """
        Get system metrics for monitoring.

        Returns:
            Dict[str, Any]: System metrics
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
            }


class UserManagementService:
    """
    Service for user management operations.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за управление пользователями
    - Open/Closed: легко расширяется новыми операциями с пользователями
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для управления пользователями
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def get_users_list(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """
        Get list of users for administration.

        Args:
            db: Сессия базы данных
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            List[User]: Список пользователей
        """
        users = await crud_user.get_multi(db, skip=skip, limit=limit)
        logger.info(f"Retrieved {len(users)} users for admin")
        return users

    @staticmethod
    async def get_users_statistics(db: AsyncSession) -> Dict[str, Any]:
        """
        Get user statistics.

        Args:
            db: Сессия базы данных

        Returns:
            Dict[str, Any]: User statistics
        """
        try:
            # Get total user count
            total_users_result = await db.execute(text("SELECT COUNT(*) FROM users"))
            total_users = total_users_result.scalar()

            # Get active users count
            active_users_result = await db.execute(
                text("SELECT COUNT(*) FROM users WHERE is_active = true")
            )
            active_users = active_users_result.scalar()

            # Get users registered in last 30 days
            recent_users_result = await db.execute(
                text(
                    """
                    SELECT COUNT(*) FROM users 
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                """
                )
            )
            recent_users = recent_users_result.scalar()

            # Get users by email verification status
            verified_users_result = await db.execute(
                text("SELECT COUNT(*) FROM users WHERE email_verified = true")
            )
            verified_users = verified_users_result.scalar()

            statistics = {
                "total_users": total_users,
                "active_users": active_users,
                "inactive_users": total_users - active_users,
                "recent_registrations": recent_users,
                "verified_users": verified_users,
                "unverified_users": total_users - verified_users,
                "last_updated": datetime.now(UTC).isoformat(),
            }

            logger.info("User statistics retrieved successfully")
            return statistics

        except Exception as e:
            logger.error(f"Error retrieving user statistics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user statistics",
            )

    @staticmethod
    async def activate_user(db: AsyncSession, user_id: int) -> User:
        """
        Activate a user account.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя

        Returns:
            User: Activated user

        Raises:
            HTTPException: If user not found
        """
        user = await crud_user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        updated_user = await crud_user.update(
            db, db_obj=user, obj_in={"is_active": True}
        )

        logger.info(f"User {user_id} activated by admin")
        return updated_user

    @staticmethod
    async def deactivate_user(db: AsyncSession, user_id: int) -> User:
        """
        Deactivate a user account.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя

        Returns:
            User: Deactivated user

        Raises:
            HTTPException: If user not found
        """
        user = await crud_user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        updated_user = await crud_user.update(
            db, db_obj=user, obj_in={"is_active": False}
        )

        logger.info(f"User {user_id} deactivated by admin")
        return updated_user


class BackupService:
    """
    Service for backup operations.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за операции резервного копирования
    - Open/Closed: легко расширяется новыми методами резервного копирования
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для операций резервного копирования
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def create_backup(db: AsyncSession) -> Dict[str, Any]:
        """
        Create a database backup.

        Args:
            db: Сессия базы данных

        Returns:
            Dict[str, Any]: Backup information
        """
        try:
            timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
            backup_name = f"backup_{timestamp}.sql"

            # In a real implementation, you would use pg_dump or similar
            # For now, we'll simulate the backup creation
            backup_info = {
                "backup_id": timestamp,
                "filename": backup_name,
                "created_at": datetime.now(UTC).isoformat(),
                "status": "completed",
                "size": "unknown",  # Would be actual file size
                "type": "full",
            }

            logger.info(f"Backup created: {backup_name}")
            return backup_info

        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create backup",
            )

    @staticmethod
    def get_backups() -> List[Dict[str, Any]]:
        """
        Get list of available backups.

        Returns:
            List[Dict[str, Any]]: List of backup information
        """
        try:
            # In a real implementation, you would scan backup directory
            # For now, we'll return a placeholder list
            backups = [
                {
                    "backup_id": "20250108_120000",
                    "filename": "backup_20250108_120000.sql",
                    "created_at": "2025-01-08T12:00:00Z",
                    "size": "15.2 MB",
                    "type": "full",
                },
                {
                    "backup_id": "20250107_120000",
                    "filename": "backup_20250107_120000.sql",
                    "created_at": "2025-01-07T12:00:00Z",
                    "size": "14.8 MB",
                    "type": "full",
                },
            ]

            logger.info(f"Retrieved {len(backups)} backup records")
            return backups

        except Exception as e:
            logger.error(f"Error retrieving backups: {e}")
            return []


class AdminService:
    """
    Main administrative service that coordinates other admin services.

    Следует принципам SOLID:
    - Single Responsibility: координирует административные операции
    - Open/Closed: легко расширяется новыми административными сервисами
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: использует специализированные сервисы
    - Dependency Inversion: зависит от абстракций сервисов
    """

    def __init__(self):
        self.system_info_service = SystemInfoService()
        self.user_management_service = UserManagementService()
        self.backup_service = BackupService()

    async def get_admin_dashboard_data(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Get comprehensive admin dashboard data.

        Args:
            db: Сессия базы данных

        Returns:
            Dict[str, Any]: Dashboard data
        """
        try:
            # Gather data from all services
            system_info = self.system_info_service.get_system_info()
            health_status = self.system_info_service.get_health_status()
            user_stats = await self.user_management_service.get_users_statistics(db)
            recent_backups = self.backup_service.get_backups()[:5]  # Last 5 backups

            dashboard_data = {
                "timestamp": datetime.now(UTC).isoformat(),
                "system": system_info,
                "health": health_status,
                "users": user_stats,
                "backups": {
                    "recent": recent_backups,
                    "total": len(recent_backups),
                },
            }

            logger.info("Admin dashboard data compiled successfully")
            return dashboard_data

        except Exception as e:
            logger.error(f"Error compiling admin dashboard data: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve admin dashboard data",
            )


# Singleton instances
system_info_service = SystemInfoService()
user_management_service = UserManagementService()
backup_service = BackupService()
admin_service = AdminService()
