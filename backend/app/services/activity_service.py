"""
Activity Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Set
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, text
from fastapi import HTTPException, status

from app.models.user import User
from app.models.requirement import Requirement
from app.models.project import Project
from app.models.comment import Comment
from app.models.activity import Activity
from app.crud.activity import activity as activity_crud
from app.utils.logger import logger
from .base import BaseService, ServiceError


class ActivityServiceError(ServiceError):
    """Ошибки сервиса активности."""

    pass


class ActivityValidationError(ActivityServiceError):
    """Ошибка валидации активности."""

    pass


class ActivityPermissionError(ActivityServiceError):
    """Ошибка прав доступа к активности."""

    pass


class ActivityType(str, Enum):
    """Типы активности в системе."""

    # Активность с требованиями
    REQUIREMENT_CREATED = "requirement_created"
    REQUIREMENT_UPDATED = "requirement_updated"
    REQUIREMENT_STATUS_CHANGED = "requirement_status_changed"
    REQUIREMENT_DELETED = "requirement_deleted"

    # Активность с проектами
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_STATUS_CHANGED = "project_status_changed"

    # Активность с комментариями
    COMMENT_CREATED = "comment_created"
    COMMENT_UPDATED = "comment_updated"
    COMMENT_DELETED = "comment_deleted"

    # Активность с отношениями
    RELATIONSHIP_CREATED = "relationship_created"
    RELATIONSHIP_DELETED = "relationship_deleted"

    # Активность с релизами
    RELEASE_CREATED = "release_created"
    RELEASE_PUBLISHED = "release_published"

    # Активность пользователей
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_JOINED_PROJECT = "user_joined_project"
    USER_LEFT_PROJECT = "user_left_project"


class ActivityTargetType(str, Enum):
    """Типы целевых объектов активности."""

    REQUIREMENT = "requirement"
    PROJECT = "project"
    COMMENT = "comment"
    RELEASE = "release"
    USER = "user"
    TEAM = "team"
    RELATIONSHIP = "relationship"


class ActivityPriority(str, Enum):
    """Приоритеты активности."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class ActivityRecord:
    """Запись активности."""

    id: int
    user_id: int
    activity_type: ActivityType
    target_type: ActivityTargetType
    target_id: int
    metadata: Dict[str, Any]
    project_id: Optional[int] = None
    created_at: datetime = None
    priority: ActivityPriority = ActivityPriority.NORMAL


@dataclass
class ActivityFeed:
    """Лента активности."""

    activities: List[ActivityRecord]
    total_count: int
    has_more: bool
    last_activity_at: Optional[datetime] = None


@dataclass
class ActivityFilter:
    """Фильтр активности."""

    activity_types: Optional[List[ActivityType]] = None
    target_types: Optional[List[ActivityTargetType]] = None
    user_ids: Optional[List[int]] = None
    project_ids: Optional[List[int]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


# Абстрактные интерфейсы
class IActivityRepository(ABC):
    """Интерфейс репозитория активности."""

    @abstractmethod
    async def create_activity(
        self, db: AsyncSession, activity_data: Dict[str, Any]
    ) -> Activity:
        """Создать запись активности."""
        pass

    @abstractmethod
    async def get_user_activities(
        self, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """Получить активности пользователя."""
        pass

    @abstractmethod
    async def get_project_activities(
        self, db: AsyncSession, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """Получить активности проекта."""
        pass


class IActivityValidator(ABC):
    """Интерфейс валидатора активности."""

    @abstractmethod
    async def validate_activity_creation(
        self,
        db: AsyncSession,
        user_id: int,
        activity_type: ActivityType,
        target_type: ActivityTargetType,
        target_id: int,
    ) -> bool:
        """Валидировать создание активности."""
        pass


class IActivityAggregator(ABC):
    """Интерфейс агрегатора активности."""

    @abstractmethod
    async def aggregate_daily_activities(
        self, db: AsyncSession, date: datetime
    ) -> Dict[str, Any]:
        """Агрегировать активность за день."""
        pass


class IActivityNotifier(ABC):
    """Интерфейс для уведомлений об активности."""

    @abstractmethod
    async def notify_activity_created(
        self, activity: ActivityRecord, affected_users: List[User]
    ):
        """Уведомить о создании активности."""
        pass


# Конкретные реализации
class DatabaseActivityRepository(IActivityRepository):
    """Репозиторий активности в базе данных."""

    async def create_activity(
        self, db: AsyncSession, activity_data: Dict[str, Any]
    ) -> Activity:
        """Создать запись активности."""
        return await activity_crud.create(db, obj_in=activity_data)

    async def get_user_activities(
        self, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """Получить активности пользователя."""
        stmt = (
            select(Activity)
            .options(selectinload(Activity.user))
            .where(Activity.user_id == user_id)
            .order_by(desc(Activity.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_project_activities(
        self, db: AsyncSession, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """Получить активности проекта."""
        stmt = (
            select(Activity)
            .options(selectinload(Activity.user))
            .where(Activity.project_id == project_id)
            .order_by(desc(Activity.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_activities_with_filter(
        self,
        db: AsyncSession,
        activity_filter: ActivityFilter,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Activity]:
        """Получить активности с фильтром."""
        stmt = select(Activity).options(selectinload(Activity.user))

        # Применение фильтров
        if activity_filter.activity_types:
            stmt = stmt.where(
                Activity.activity_type.in_(
                    [t.value for t in activity_filter.activity_types]
                )
            )

        if activity_filter.target_types:
            stmt = stmt.where(
                Activity.target_type.in_(
                    [t.value for t in activity_filter.target_types]
                )
            )

        if activity_filter.user_ids:
            stmt = stmt.where(Activity.user_id.in_(activity_filter.user_ids))

        if activity_filter.project_ids:
            stmt = stmt.where(Activity.project_id.in_(activity_filter.project_ids))

        if activity_filter.date_from:
            stmt = stmt.where(Activity.created_at >= activity_filter.date_from)

        if activity_filter.date_to:
            stmt = stmt.where(Activity.created_at <= activity_filter.date_to)

        stmt = stmt.order_by(desc(Activity.created_at)).offset(skip).limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def search_activities(
        self, db: AsyncSession, query: str, project_id: Optional[int] = None
    ) -> List[Activity]:
        """Поиск активностей."""
        stmt = (
            select(Activity)
            .options(selectinload(Activity.user))
            .where(
                or_(
                    Activity.metadata.op("->>")("description").ilike(f"%{query}%"),
                    Activity.metadata.op("->>")("title").ilike(f"%{query}%"),
                )
            )
        )

        if project_id:
            stmt = stmt.where(Activity.project_id == project_id)

        result = await db.execute(stmt)
        return result.scalars().all()


class StandardActivityValidator(IActivityValidator):
    """Стандартный валидатор активности."""

    async def validate_activity_creation(
        self,
        db: AsyncSession,
        user_id: int,
        activity_type: ActivityType,
        target_type: ActivityTargetType,
        target_id: int,
    ) -> bool:
        """Валидировать создание активности."""
        # Проверка пользователя
        user_stmt = select(User).where(User.id == user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()

        if not user or not user.is_active:
            raise ActivityValidationError("Invalid or inactive user")

        # Проверка существования целевого объекта
        if not await self._validate_target_exists(db, target_type, target_id):
            raise ActivityValidationError(
                f"Target {target_type} with ID {target_id} not found"
            )

        return True

    async def _validate_target_exists(
        self, db: AsyncSession, target_type: ActivityTargetType, target_id: int
    ) -> bool:
        """Проверить существование целевого объекта."""
        if target_type == ActivityTargetType.REQUIREMENT:
            stmt = select(Requirement).where(Requirement.id == target_id)
        elif target_type == ActivityTargetType.PROJECT:
            stmt = select(Project).where(Project.id == target_id)
        elif target_type == ActivityTargetType.USER:
            stmt = select(User).where(User.id == target_id)
        else:
            # Для других типов пока возвращаем True
            return True

        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None


class ActivityAggregator(IActivityAggregator):
    """Агрегатор активности."""

    async def aggregate_daily_activities(
        self, db: AsyncSession, date: datetime
    ) -> Dict[str, Any]:
        """Агрегировать активность за день."""
        start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)

        # Подсчет активностей по типам
        stmt = (
            select(Activity.activity_type, func.count(Activity.id).label("count"))
            .where(
                and_(Activity.created_at >= start_date, Activity.created_at < end_date)
            )
            .group_by(Activity.activity_type)
        )

        result = await db.execute(stmt)
        activity_counts = {row.activity_type: row.count for row in result}

        # Подсчет уникальных пользователей
        users_stmt = select(func.count(func.distinct(Activity.user_id))).where(
            and_(Activity.created_at >= start_date, Activity.created_at < end_date)
        )

        users_result = await db.execute(users_stmt)
        unique_users = users_result.scalar()

        return {
            "date": date.date(),
            "activity_counts": activity_counts,
            "unique_users": unique_users,
            "total_activities": sum(activity_counts.values()),
        }


class ActivityNotificationManager(IActivityNotifier):
    """Менеджер уведомлений об активности."""

    async def notify_activity_created(
        self, activity: ActivityRecord, affected_users: List[User]
    ):
        """Уведомить о создании активности."""
        # Логика уведомления заинтересованных пользователей
        logger.info(
            f"Activity {activity.activity_type} created by user {activity.user_id}"
        )

        # Здесь можно добавить интеграцию с NotificationService
        for user in affected_users:
            if user.id != activity.user_id:  # Не уведомляем самого автора
                logger.debug(f"Notifying user {user.id} about activity {activity.id}")


class ActivityService(BaseService):
    """
    Основной сервис активности.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы)
    - Observer (уведомления)
    - Command (операции с активностью)
    """

    def __init__(self):
        self._repository: IActivityRepository = DatabaseActivityRepository()
        self._validator: IActivityValidator = StandardActivityValidator()
        self._aggregator: IActivityAggregator = ActivityAggregator()
        self._notifier: IActivityNotifier = ActivityNotificationManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "ActivityService"

    def set_repository(self, repository: IActivityRepository):
        """Установить репозиторий активности."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: IActivityValidator):
        """Установить валидатор активности."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def record_activity(
        self,
        db: AsyncSession,
        user_id: int,
        activity_type: ActivityType,
        target_type: ActivityTargetType,
        target_id: int,
        metadata: Optional[Dict[str, Any]] = None,
        project_id: Optional[int] = None,
        priority: ActivityPriority = ActivityPriority.NORMAL,
    ) -> Activity:
        """Записать событие активности."""
        try:
            self._log_operation(
                "record_activity",
                {
                    "user_id": user_id,
                    "activity_type": activity_type.value,
                    "target_type": target_type.value,
                    "target_id": target_id,
                },
            )

            # Валидация
            await self._validator.validate_activity_creation(
                db, user_id, activity_type, target_type, target_id
            )

            # Подготовка данных
            activity_data = {
                "user_id": user_id,
                "activity_type": activity_type.value,
                "target_type": target_type.value,
                "target_id": target_id,
                "metadata": metadata or {},
                "project_id": project_id,
                "created_at": datetime.utcnow(),
            }

            # Создание активности
            activity = await self._repository.create_activity(db, activity_data)

            # Создание записи для уведомлений
            activity_record = ActivityRecord(
                id=activity.id,
                user_id=user_id,
                activity_type=activity_type,
                target_type=target_type,
                target_id=target_id,
                metadata=metadata or {},
                project_id=project_id,
                created_at=activity.created_at,
                priority=priority,
            )

            # Уведомления (асинхронно)
            # В реальной реализации здесь должна быть логика определения заинтересованных пользователей
            affected_users = []  # TODO: получить заинтересованных пользователей
            await self._notifier.notify_activity_created(
                activity_record, affected_users
            )

            return activity

        except Exception as e:
            raise self._handle_error(e, "record_activity")

    async def get_user_feed(
        self, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 50
    ) -> ActivityFeed:
        """Получить ленту активности пользователя."""
        try:
            self._log_operation(
                "get_user_feed", {"user_id": user_id, "skip": skip, "limit": limit}
            )

            activities = await self._repository.get_user_activities(
                db, user_id, skip, limit
            )

            # Подсчет общего количества
            total_stmt = select(func.count(Activity.id)).where(
                Activity.user_id == user_id
            )
            total_result = await db.execute(total_stmt)
            total_count = total_result.scalar()

            # Конвертация в ActivityRecord
            activity_records = [
                self._convert_to_activity_record(activity) for activity in activities
            ]

            return ActivityFeed(
                activities=activity_records,
                total_count=total_count,
                has_more=skip + len(activities) < total_count,
                last_activity_at=activities[0].created_at if activities else None,
            )

        except Exception as e:
            raise self._handle_error(e, "get_user_feed")

    async def get_project_feed(
        self, db: AsyncSession, project_id: int, skip: int = 0, limit: int = 50
    ) -> ActivityFeed:
        """Получить ленту активности проекта."""
        try:
            self._log_operation(
                "get_project_feed",
                {"project_id": project_id, "skip": skip, "limit": limit},
            )

            activities = await self._repository.get_project_activities(
                db, project_id, skip, limit
            )

            # Подсчет общего количества
            total_stmt = select(func.count(Activity.id)).where(
                Activity.project_id == project_id
            )
            total_result = await db.execute(total_stmt)
            total_count = total_result.scalar()

            # Конвертация в ActivityRecord
            activity_records = [
                self._convert_to_activity_record(activity) for activity in activities
            ]

            return ActivityFeed(
                activities=activity_records,
                total_count=total_count,
                has_more=skip + len(activities) < total_count,
                last_activity_at=activities[0].created_at if activities else None,
            )

        except Exception as e:
            raise self._handle_error(e, "get_project_feed")

    async def get_filtered_activities(
        self,
        db: AsyncSession,
        activity_filter: ActivityFilter,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Activity]:
        """Получить активности с фильтром."""
        try:
            self._log_operation(
                "get_filtered_activities",
                {
                    "filter_types": (
                        len(activity_filter.activity_types)
                        if activity_filter.activity_types
                        else 0
                    ),
                    "skip": skip,
                    "limit": limit,
                },
            )

            return await self._repository.get_activities_with_filter(
                db, activity_filter, skip, limit
            )

        except Exception as e:
            raise self._handle_error(e, "get_filtered_activities")

    async def search_activities(
        self, db: AsyncSession, query: str, project_id: Optional[int] = None
    ) -> List[Activity]:
        """Поиск активностей."""
        try:
            self._log_operation(
                "search_activities", {"query": query, "project_id": project_id}
            )

            if not query.strip():
                return []

            return await self._repository.search_activities(
                db, query.strip(), project_id
            )

        except Exception as e:
            raise self._handle_error(e, "search_activities")

    async def get_activity_statistics(
        self, db: AsyncSession, date: datetime, project_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Получить статистику активности."""
        try:
            self._log_operation(
                "get_activity_statistics",
                {"date": date.date(), "project_id": project_id},
            )

            stats = await self._aggregator.aggregate_daily_activities(db, date)

            if project_id:
                # Дополнительная фильтрация по проекту
                start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)

                project_stmt = select(func.count(Activity.id)).where(
                    and_(
                        Activity.project_id == project_id,
                        Activity.created_at >= start_date,
                        Activity.created_at < end_date,
                    )
                )

                project_result = await db.execute(project_stmt)
                stats["project_activities"] = project_result.scalar()

            return stats

        except Exception as e:
            raise self._handle_error(e, "get_activity_statistics")

    def _convert_to_activity_record(self, activity: Activity) -> ActivityRecord:
        """Конвертировать Activity в ActivityRecord."""
        return ActivityRecord(
            id=activity.id,
            user_id=activity.user_id,
            activity_type=ActivityType(activity.activity_type),
            target_type=ActivityTargetType(activity.target_type),
            target_id=activity.target_id,
            metadata=activity.metadata or {},
            project_id=activity.project_id,
            created_at=activity.created_at,
            priority=ActivityPriority.NORMAL,  # По умолчанию
        )


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("activity", ActivityService)

# Singleton instance
activity_service = ActivityService()
