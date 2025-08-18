"""
CRUD операции для Activity модели.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc
from datetime import datetime, timedelta

from app.crud.base import CRUDBase
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate


class CRUDActivity(CRUDBase[Activity, ActivityCreate, ActivityUpdate]):
    """CRUD операции для активности."""

    async def get_user_activities(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        activity_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Activity]:
        """Получить активности пользователя с фильтрацией."""
        query = (
            select(Activity)
            .where(Activity.user_id == user_id)
            .options(selectinload(Activity.user), selectinload(Activity.project))
            .order_by(desc(Activity.created_at))
            .offset(skip)
            .limit(limit)
        )

        conditions = []
        if activity_types:
            conditions.append(Activity.activity_type.in_(activity_types))
        if start_date:
            conditions.append(Activity.created_at >= start_date)
        if end_date:
            conditions.append(Activity.created_at <= end_date)

        if conditions:
            query = query.where(and_(*conditions))

        result = await db.execute(query)
        return result.scalars().all()

    async def get_project_activities(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        skip: int = 0,
        limit: int = 20,
        activity_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Activity]:
        """Получить активности по проекту."""
        query = (
            select(Activity)
            .where(Activity.project_id == project_id)
            .options(selectinload(Activity.user), selectinload(Activity.project))
            .order_by(desc(Activity.created_at))
            .offset(skip)
            .limit(limit)
        )

        conditions = []
        if activity_types:
            conditions.append(Activity.activity_type.in_(activity_types))
        if start_date:
            conditions.append(Activity.created_at >= start_date)
        if end_date:
            conditions.append(Activity.created_at <= end_date)

        if conditions:
            query = query.where(and_(*conditions))

        result = await db.execute(query)
        return result.scalars().all()

    async def count_user_activities(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        activity_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> int:
        """Подсчитать количество активностей пользователя."""
        query = select(func.count(Activity.id)).where(Activity.user_id == user_id)

        conditions = []
        if activity_types:
            conditions.append(Activity.activity_type.in_(activity_types))
        if start_date:
            conditions.append(Activity.created_at >= start_date)
        if end_date:
            conditions.append(Activity.created_at <= end_date)

        if conditions:
            query = query.where(and_(*conditions))

        result = await db.execute(query)
        return result.scalar()

    async def get_daily_activity_stats(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        days: int = 30,
    ) -> List[Dict[str, Any]]:
        """Получить статистику активности по дням."""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # SQL для группировки по дням
        query = (
            select(
                func.date(Activity.created_at).label("activity_date"),
                func.count(Activity.id).label("activity_count"),
                Activity.activity_type,
            )
            .where(
                and_(
                    Activity.user_id == user_id,
                    Activity.created_at >= start_date,
                    Activity.created_at <= end_date,
                )
            )
            .group_by(func.date(Activity.created_at), Activity.activity_type)
            .order_by(func.date(Activity.created_at))
        )

        result = await db.execute(query)
        rows = result.fetchall()

        # Группируем по дням
        daily_stats = {}
        for row in rows:
            date_str = row.activity_date.isoformat()
            if date_str not in daily_stats:
                daily_stats[date_str] = {"date": date_str, "total": 0, "by_type": {}}

            daily_stats[date_str]["total"] += row.activity_count
            daily_stats[date_str]["by_type"][row.activity_type] = row.activity_count

        return list(daily_stats.values())

    async def record_activity(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        activity_type: str,
        target_type: str,
        target_id: str,
        project_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Activity:
        """Записать новую активность."""
        activity_data = {
            "user_id": user_id,
            "activity_type": activity_type,
            "target_type": target_type,
            "target_id": target_id,
            "project_id": project_id,
            "activity_metadata": metadata or {},
        }

        return await self.create(db, obj_in=activity_data)


# Создаем экземпляр CRUD
activity = CRUDActivity(Activity)
