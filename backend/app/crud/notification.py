"""
CRUD операции для Notification модели.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, func, desc, update
from datetime import datetime, timedelta

from app.crud.base import CRUDBase
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate


class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    """CRUD операции для уведомлений."""

    async def get_user_notifications(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        unread_only: bool = False,
    ) -> List[Notification]:
        """Получить уведомления пользователя."""
        query = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .options(selectinload(Notification.user))
            .order_by(desc(Notification.created_at))
            .offset(skip)
            .limit(limit)
        )

        if unread_only:
            query = query.where(Notification.is_read == False)

        result = await db.execute(query)
        return result.scalars().all()

    async def count_user_notifications(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        unread_only: bool = False,
    ) -> int:
        """Подсчитать количество уведомлений пользователя."""
        query = select(func.count(Notification.id)).where(
            Notification.user_id == user_id
        )

        if unread_only:
            query = query.where(Notification.is_read == False)

        result = await db.execute(query)
        return result.scalar()

    async def mark_as_read(
        self,
        db: AsyncSession,
        *,
        notification_id: int,
        user_id: int,
    ) -> Optional[Notification]:
        """Отметить уведомление как прочитанное."""
        # Сначала проверяем, что уведомление принадлежит пользователю
        notification = await self.get_by_id_and_user(
            db, notification_id=notification_id, user_id=user_id
        )
        if not notification:
            return None

        # Обновляем уведомление
        update_data = {
            "is_read": True,
            "read_at": datetime.utcnow(),
        }

        return await self.update(db, db_obj=notification, obj_in=update_data)

    async def mark_as_unread(
        self,
        db: AsyncSession,
        *,
        notification_id: int,
        user_id: int,
    ) -> Optional[Notification]:
        """Отметить уведомление как непрочитанное."""
        notification = await self.get_by_id_and_user(
            db, notification_id=notification_id, user_id=user_id
        )
        if not notification:
            return None

        update_data = {
            "is_read": False,
            "read_at": None,
        }

        return await self.update(db, db_obj=notification, obj_in=update_data)

    async def mark_all_as_read(
        self,
        db: AsyncSession,
        *,
        user_id: int,
    ) -> int:
        """Отметить все уведомления пользователя как прочитанные."""
        query = (
            update(Notification)
            .where(
                and_(
                    Notification.user_id == user_id,
                    Notification.is_read == False,
                )
            )
            .values(
                is_read=True,
                read_at=datetime.utcnow(),
            )
        )

        result = await db.execute(query)
        await db.commit()
        return result.rowcount

    async def get_by_id_and_user(
        self,
        db: AsyncSession,
        *,
        notification_id: int,
        user_id: int,
    ) -> Optional[Notification]:
        """Получить уведомление по ID, проверив принадлежность пользователю."""
        query = select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )

        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_notification(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[dict] = None,
    ) -> Notification:
        """Создать новое уведомление."""
        notification_data = {
            "user_id": user_id,
            "notification_type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
            "is_read": False,
        }

        return await self.create(db, obj_in=notification_data)

    async def get_unread_count(
        self,
        db: AsyncSession,
        *,
        user_id: int,
    ) -> int:
        """Получить количество непрочитанных уведомлений."""
        return await self.count_user_notifications(
            db, user_id=user_id, unread_only=True
        )

    async def delete_old_notifications(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        older_than_days: int = 30,
    ) -> int:
        """Удалить старые уведомления пользователя."""
        cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)

        query = select(Notification).where(
            and_(
                Notification.user_id == user_id,
                Notification.created_at < cutoff_date,
                Notification.is_read == True,  # Удаляем только прочитанные
            )
        )

        result = await db.execute(query)
        notifications_to_delete = result.scalars().all()

        count = len(notifications_to_delete)
        for notification in notifications_to_delete:
            await db.delete(notification)

        await db.commit()
        return count


# Создаем экземпляр CRUD
notification = CRUDNotification(Notification)
