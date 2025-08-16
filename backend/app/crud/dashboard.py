"""
CRUD operations for dashboard-related models.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, delete, desc, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.dashboard import (
    DashboardActivity,
    DashboardNotification,
    DashboardWidget,
    UserDashboardPreferences,
)
from app.schemas.dashboard import ActivityItem
from app.schemas.dashboard import DashboardNotification as NotificationSchema
from app.schemas.dashboard import QuickProject, QuickRequirement
from app.schemas.dashboard import UserDashboardPreferences as PreferencesSchema


class CRUDUserPreferences(
    CRUDBase[UserDashboardPreferences, Dict[str, Any], Dict[str, Any]]
):
    """CRUD operations for user dashboard preferences"""

    async def get_by_user_id(
        self, db: AsyncSession, *, user_id: int
    ) -> Optional[UserDashboardPreferences]:
        """Get user preferences by user ID"""
        result = await db.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update_preferences(
        self, db: AsyncSession, *, user_id: int, preferences_data: Dict[str, Any]
    ) -> UserDashboardPreferences:
        """Create or update user preferences"""
        # Check if preferences exist
        existing = await self.get_by_user_id(db, user_id=user_id)

        if existing:
            # Update existing preferences
            for key, value in preferences_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            existing.updated_at = datetime.now()
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            # Create new preferences
            preferences_data["user_id"] = user_id
            new_preferences = self.model(**preferences_data)
            db.add(new_preferences)
            await db.commit()
            await db.refresh(new_preferences)
            return new_preferences

    def get_default_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get default preferences for a user"""
        return {
            "user_id": user_id,
            "show_quick_stats": True,
            "show_recent_activity": True,
            "show_my_projects": True,
            "show_pending_approvals": True,
            "activity_limit": 20,
            "refresh_interval": 300,
            "theme": "light",
            "notifications_enabled": True,
            "email_notifications": True,
            "timezone": "UTC",
        }


class CRUDDashboardNotification(
    CRUDBase[DashboardNotification, Dict[str, Any], Dict[str, Any]]
):
    """CRUD operations for dashboard notifications"""

    async def get_user_notifications(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
    ) -> List[DashboardNotification]:
        """Get notifications for a user"""
        query = select(self.model).where(self.model.user_id == user_id)

        if unread_only:
            query = query.where(self.model.is_read == False)

        # Filter out expired notifications
        query = query.where(
            or_(self.model.expires_at.is_(None), self.model.expires_at > datetime.now())
        )

        query = query.order_by(desc(self.model.created_at)).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    async def mark_as_read(
        self, db: AsyncSession, *, notification_id: int, user_id: int
    ) -> Optional[DashboardNotification]:
        """Mark a notification as read"""
        result = await db.execute(
            select(self.model).where(
                and_(self.model.id == notification_id, self.model.user_id == user_id)
            )
        )
        notification = result.scalar_one_or_none()

        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now()
            await db.commit()
            await db.refresh(notification)

        return notification

    async def mark_all_as_read(self, db: AsyncSession, *, user_id: int) -> int:
        """Mark all notifications as read for a user"""
        result = await db.execute(
            update(self.model)
            .where(and_(self.model.user_id == user_id, self.model.is_read == False))
            .values(is_read=True, read_at=datetime.now())
        )
        await db.commit()
        return result.rowcount

    async def create_notification(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
        priority: str = "medium",
        project_id: Optional[int] = None,
        requirement_id: Optional[int] = None,
        expires_at: Optional[datetime] = None,
    ) -> DashboardNotification:
        """Create a new notification"""
        notification_data = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "action_url": action_url,
            "action_text": action_text,
            "priority": priority,
            "project_id": project_id,
            "requirement_id": requirement_id,
            "expires_at": expires_at,
        }

        notification = self.model(**notification_data)
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    async def cleanup_expired(self, db: AsyncSession) -> int:
        """Clean up expired notifications"""
        result = await db.execute(
            delete(self.model).where(
                and_(
                    self.model.expires_at.is_not(None),
                    self.model.expires_at < datetime.now(),
                )
            )
        )
        await db.commit()
        return result.rowcount


class CRUDDashboardActivity(
    CRUDBase[DashboardActivity, Dict[str, Any], Dict[str, Any]]
):
    """CRUD operations for dashboard activities"""

    async def get_recent_activities(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        activity_types: Optional[List[str]] = None,
        limit: int = 20,
        days_back: int = 30,
    ) -> List[DashboardActivity]:
        """Get recent activities with filtering"""
        since_date = datetime.now() - timedelta(days=days_back)

        query = select(self.model).where(self.model.created_at >= since_date)

        if user_id:
            query = query.where(self.model.user_id == user_id)

        if project_id:
            query = query.where(self.model.project_id == project_id)

        if activity_types:
            query = query.where(self.model.activity_type.in_(activity_types))

        query = query.order_by(desc(self.model.created_at)).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    async def create_activity(
        self,
        db: AsyncSession,
        *,
        activity_type: str,
        activity_title: str,
        user_id: int,
        user_name: str,
        activity_description: Optional[str] = None,
        project_id: Optional[int] = None,
        requirement_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        entity_name: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None,
    ) -> DashboardActivity:
        """Create a new activity record"""
        activity_data = {
            "activity_type": activity_type,
            "activity_title": activity_title,
            "activity_description": activity_description,
            "user_id": user_id,
            "user_name": user_name,
            "project_id": project_id,
            "requirement_id": requirement_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "entity_name": entity_name,
            "status": status,
            "priority": priority,
            "extra_data": extra_data,
        }

        activity = self.model(**activity_data)
        db.add(activity)
        await db.commit()
        await db.refresh(activity)
        return activity

    async def get_activity_stats(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        days_back: int = 30,
    ) -> Dict[str, int]:
        """Get activity statistics"""
        since_date = datetime.now() - timedelta(days=days_back)

        query = select(
            self.model.activity_type, func.count(self.model.id).label("count")
        ).where(self.model.created_at >= since_date)

        if user_id:
            query = query.where(self.model.user_id == user_id)

        if project_id:
            query = query.where(self.model.project_id == project_id)

        query = query.group_by(self.model.activity_type)

        result = await db.execute(query)
        return {row.activity_type: row.count for row in result}


class CRUDDashboardWidget(CRUDBase[DashboardWidget, Dict[str, Any], Dict[str, Any]]):
    """CRUD operations for dashboard widgets"""

    async def get_user_widgets(
        self, db: AsyncSession, *, user_id: int, visible_only: bool = True
    ) -> List[DashboardWidget]:
        """Get user's dashboard widgets"""
        query = select(self.model).where(self.model.user_id == user_id)

        if visible_only:
            query = query.where(self.model.is_visible == True)

        query = query.order_by(self.model.position)

        result = await db.execute(query)
        return result.scalars().all()

    async def update_widget_positions(
        self, db: AsyncSession, *, user_id: int, widget_positions: List[Dict[str, Any]]
    ) -> bool:
        """Update widget positions for a user"""
        try:
            for widget_data in widget_positions:
                widget_id = widget_data["id"]
                position = widget_data["position"]

                await db.execute(
                    update(self.model)
                    .where(
                        and_(self.model.id == widget_id, self.model.user_id == user_id)
                    )
                    .values(position=position, updated_at=datetime.now())
                )

            await db.commit()
            return True
        except Exception:
            await db.rollback()
            return False

    async def create_default_widgets(
        self, db: AsyncSession, *, user_id: int
    ) -> List[DashboardWidget]:
        """Create default widgets for a new user"""
        default_widgets = [
            {
                "user_id": user_id,
                "widget_type": "quick_stats",
                "widget_title": "Quick Stats",
                "position": 0,
                "size": "large",
                "config": {"show_charts": True},
            },
            {
                "user_id": user_id,
                "widget_type": "my_projects",
                "widget_title": "My Projects",
                "position": 1,
                "size": "medium",
                "config": {"limit": 5},
            },
            {
                "user_id": user_id,
                "widget_type": "recent_activity",
                "widget_title": "Recent Activity",
                "position": 2,
                "size": "medium",
                "config": {"limit": 10},
            },
            {
                "user_id": user_id,
                "widget_type": "notifications",
                "widget_title": "Notifications",
                "position": 3,
                "size": "small",
                "config": {"show_unread_only": True},
            },
        ]

        widgets = []
        for widget_data in default_widgets:
            widget = self.model(**widget_data)
            db.add(widget)
            widgets.append(widget)

        await db.commit()
        for widget in widgets:
            await db.refresh(widget)

        return widgets


# Create CRUD instances
user_preferences = CRUDUserPreferences(UserDashboardPreferences)
notification = CRUDDashboardNotification(DashboardNotification)
activity = CRUDDashboardActivity(DashboardActivity)
widget = CRUDDashboardWidget(DashboardWidget)
