"""
Activity Tracking Service.

Сервис для отслеживания активности пользователей,
включая создание записей активности и получение лент активности.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, text
from datetime import datetime, timedelta
from enum import Enum
from fastapi import HTTPException, status

from app.models.user import User
from app.models.requirement import Requirement
from app.models.project import Project
from app.models.comment import Comment
from app.models.relationship import Relationship
from app.models.activity import Activity
from app.core.constants import Permission
from app.services.permission_service import permission_service
from app.crud.activity import activity as activity_crud
from app.utils.logger import logger


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


class ActivityService:
    """
    Сервис для отслеживания и получения активности пользователей.

    Предоставляет функциональность для:
    - Записи событий активности
    - Получения ленты активности пользователя
    - Получения активности по проекту
    - Получения недавней активности
    - Статистики активности
    """

    def __init__(self):
        pass

    async def record_activity(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        activity_type: ActivityType,
        target_type: str,
        target_id: int,
        metadata: Optional[Dict[str, Any]] = None,
        project_id: Optional[int] = None,
    ) -> None:
        """
        Записать событие активности.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            activity_type: Тип активности
            target_type: Тип объекта (requirement, project, comment, etc.)
            target_id: ID объекта
            metadata: Дополнительные данные
            project_id: ID проекта (опционально)
        """
        try:
            await activity_crud.record_activity(
                db=db,
                user_id=user_id,
                activity_type=activity_type.value,
                target_type=target_type,
                target_id=str(target_id),
                project_id=project_id,
                metadata=metadata or {},
            )

            logger.info(
                f"Activity recorded: user={user_id}, type={activity_type}, "
                f"target={target_type}:{target_id}, project={project_id}"
            )

        except Exception as e:
            logger.error(f"Failed to record activity: {e}")

    async def get_user_activity_feed(
        self,
        db: AsyncSession,
        *,
        user: User,
        page: int = 1,
        size: int = 20,
        activity_types: Optional[List[ActivityType]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Получить ленту активности пользователя.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            page: Номер страницы
            size: Размер страницы
            activity_types: Фильтр по типам активности
            start_date: Начальная дата
            end_date: Конечная дата

        Returns:
            Dict: Лента активности с пагинацией
        """
        # Преобразуем типы активности в строки
        activity_type_strings = None
        if activity_types:
            activity_type_strings = [at.value for at in activity_types]

        # Получаем активности из базы данных
        skip = (page - 1) * size
        activities_db = await activity_crud.get_user_activities(
            db=db,
            user_id=user.id,
            skip=skip,
            limit=size,
            activity_types=activity_type_strings,
            start_date=start_date,
            end_date=end_date,
        )

        # Получаем общее количество
        total = await activity_crud.count_user_activities(
            db=db,
            user_id=user.id,
            activity_types=activity_type_strings,
            start_date=start_date,
            end_date=end_date,
        )

        # Конвертируем в формат API
        activities = []
        for activity_db in activities_db:
            # Получаем заголовок цели на основе типа и ID
            target_title = await self._get_target_title(
                db, activity_db.target_type, activity_db.target_id
            )

            activities.append(
                {
                    "id": f"activity_{activity_db.id}",
                    "type": activity_db.activity_type,
                    "timestamp": activity_db.created_at,
                    "user_id": activity_db.user_id,
                    "user_name": activity_db.user.full_name or activity_db.user.email,
                    "target_type": activity_db.target_type,
                    "target_id": (
                        int(activity_db.target_id)
                        if activity_db.target_id.isdigit()
                        else activity_db.target_id
                    ),
                    "target_title": target_title,
                    "project_id": activity_db.project_id,
                    "metadata": activity_db.metadata_dict,
                }
            )

        return {
            "activities": activities,
            "total": total,
            "page": page,
            "pages": (total + size - 1) // size,
            "size": size,
        }

    async def get_project_activity_feed(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        user: User,
        page: int = 1,
        size: int = 20,
        activity_types: Optional[List[ActivityType]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Получить ленту активности по проекту.

        Args:
            db: Сессия базы данных
            project_id: ID проекта
            user: Текущий пользователь
            page: Номер страницы
            size: Размер страницы
            activity_types: Фильтр по типам активности
            start_date: Начальная дата
            end_date: Конечная дата

        Returns:
            Dict: Лента активности проекта
        """
        # Проверяем права доступа к проекту
        has_permission = await permission_service.check_permission(
            user=user, permission=Permission.VIEW_PROJECT, resource_id=project_id, db=db
        )

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view project activity",
            )

        activities = []

        # Получаем активность по требованиям проекта
        requirements_query = select(Requirement.id).where(
            Requirement.project_id == project_id
        )
        requirements_result = await db.execute(requirements_query)
        requirement_ids = [row[0] for row in requirements_result.fetchall()]

        if requirement_ids:
            # Комментарии к требованиям проекта
            comments_query = (
                select(Comment)
                .where(Comment.requirement_id.in_(requirement_ids))
                .options(
                    selectinload(Comment.author), selectinload(Comment.requirement)
                )
                .order_by(desc(Comment.created_at))
                .limit(20)
            )

            if start_date:
                comments_query = comments_query.where(Comment.created_at >= start_date)
            if end_date:
                comments_query = comments_query.where(Comment.created_at <= end_date)

            comments_result = await db.execute(comments_query)
            comments = comments_result.scalars().all()

            for comment in comments:
                activities.append(
                    {
                        "id": f"comment_{comment.id}",
                        "type": ActivityType.COMMENT_CREATED,
                        "timestamp": comment.created_at,
                        "user_id": comment.author_id,
                        "user_name": comment.author.full_name or comment.author.email,
                        "target_type": "comment",
                        "target_id": comment.id,
                        "target_title": f"Comment on {comment.requirement.title}",
                        "project_id": project_id,
                        "metadata": {
                            "comment_content": (
                                comment.content[:100] + "..."
                                if len(comment.content) > 100
                                else comment.content
                            ),
                            "requirement_id": comment.requirement_id,
                            "requirement_title": comment.requirement.title,
                        },
                    }
                )

            # Требования проекта
            project_requirements_query = (
                select(Requirement)
                .where(Requirement.project_id == project_id)
                .options(selectinload(Requirement.author))
                .order_by(desc(Requirement.created_at))
                .limit(20)
            )

            if start_date:
                project_requirements_query = project_requirements_query.where(
                    Requirement.created_at >= start_date
                )
            if end_date:
                project_requirements_query = project_requirements_query.where(
                    Requirement.created_at <= end_date
                )

            project_requirements_result = await db.execute(project_requirements_query)
            project_requirements = project_requirements_result.scalars().all()

            for req in project_requirements:
                activities.append(
                    {
                        "id": f"requirement_{req.id}",
                        "type": ActivityType.REQUIREMENT_CREATED,
                        "timestamp": req.created_at,
                        "user_id": req.author_id,
                        "user_name": req.author.full_name or req.author.email,
                        "target_type": "requirement",
                        "target_id": req.id,
                        "target_title": req.title,
                        "project_id": project_id,
                        "metadata": {
                            "requirement_description": (
                                req.description[:100] + "..."
                                if req.description and len(req.description) > 100
                                else req.description
                            ),
                            "status": req.status.name if req.status else None,
                            "priority": req.priority.name if req.priority else None,
                        },
                    }
                )

        # Сортируем по времени и применяем пагинацию
        activities.sort(key=lambda x: x["timestamp"], reverse=True)

        # Фильтруем по типам активности если указано
        if activity_types:
            activities = [a for a in activities if a["type"] in activity_types]

        total = len(activities)
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        paginated_activities = activities[start_idx:end_idx]

        return {
            "project_id": project_id,
            "activities": paginated_activities,
            "total": total,
            "page": page,
            "pages": (total + size - 1) // size,
            "size": size,
        }

    async def get_recent_activity(
        self,
        db: AsyncSession,
        *,
        user: User,
        limit: int = 10,
        activity_types: Optional[List[ActivityType]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Получить недавнюю активность.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            limit: Количество записей
            activity_types: Фильтр по типам активности

        Returns:
            List: Список последних действий
        """
        # Используем существующий метод с ограничением по количеству
        feed_result = await self.get_user_activity_feed(
            db=db,
            user=user,
            page=1,
            size=limit,
            activity_types=activity_types,
        )

        return feed_result["activities"]

    async def get_activity_statistics(
        self,
        db: AsyncSession,
        *,
        user: User,
        project_id: Optional[int] = None,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Получить статистику активности.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            project_id: ID проекта для фильтрации
            days: Период в днях

        Returns:
            Dict: Статистика активности
        """
        start_date = datetime.utcnow() - timedelta(days=days)

        # Получаем статистику из таблицы активности
        activity_conditions = [
            Activity.user_id == user.id,
            Activity.created_at >= start_date,
        ]

        if project_id:
            activity_conditions.append(Activity.project_id == project_id)

        # Общее количество активностей
        total_activity_query = select(func.count(Activity.id)).where(
            and_(*activity_conditions)
        )
        total_activity_result = await db.execute(total_activity_query)
        total_activity = total_activity_result.scalar()

        # Активности по типам
        comments_activity_query = select(func.count(Activity.id)).where(
            and_(
                *activity_conditions,
                Activity.activity_type == ActivityType.COMMENT_CREATED.value,
            )
        )
        comments_result = await db.execute(comments_activity_query)
        comments_count = comments_result.scalar()

        requirements_activity_query = select(func.count(Activity.id)).where(
            and_(
                *activity_conditions,
                Activity.activity_type == ActivityType.REQUIREMENT_CREATED.value,
            )
        )
        requirements_result = await db.execute(requirements_activity_query)
        requirements_count = requirements_result.scalar()

        # Получаем статистику по дням из CRUD
        daily_stats = await activity_crud.get_daily_activity_stats(
            db=db, user_id=user.id, days=days
        )

        # Фильтруем по проекту если нужно
        if project_id:
            # Фильтруем статистику по проекту
            filtered_daily_stats = []
            for day_stat in daily_stats:
                # Получаем активности за этот день для проекта
                day_start = datetime.fromisoformat(day_stat["date"])
                day_end = day_start + timedelta(days=1)

                day_project_query = select(func.count(Activity.id)).where(
                    and_(
                        Activity.user_id == user.id,
                        Activity.project_id == project_id,
                        Activity.created_at >= day_start,
                        Activity.created_at < day_end,
                    )
                )
                day_project_result = await db.execute(day_project_query)
                day_project_count = day_project_result.scalar()

                filtered_daily_stats.append(
                    {
                        "date": day_stat["date"],
                        "comments": (
                            day_project_count
                            if ActivityType.COMMENT_CREATED.value
                            in day_stat.get("by_type", {})
                            else 0
                        ),
                        "total_activity": day_project_count,
                    }
                )
            daily_stats = filtered_daily_stats
        else:
            # Конвертируем формат
            daily_stats = [
                {
                    "date": day_stat["date"],
                    "comments": day_stat.get("by_type", {}).get(
                        ActivityType.COMMENT_CREATED.value, 0
                    ),
                    "total_activity": day_stat["total"],
                }
                for day_stat in daily_stats
            ]

        return {
            "user_id": user.id,
            "project_id": project_id,
            "period_days": days,
            "total_comments": comments_count,
            "total_requirements": requirements_count,
            "total_activity": total_activity,
            "daily_activity": daily_stats,
        }

    async def record_requirement_activity(
        self,
        db: AsyncSession,
        *,
        requirement: Requirement,
        activity_type: ActivityType,
        user_id: int,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Записать активность связанную с требованием.

        Args:
            db: Сессия базы данных
            requirement: Требование
            activity_type: Тип активности
            user_id: ID пользователя
            metadata: Дополнительные данные
        """
        await self.record_activity(
            db=db,
            user_id=user_id,
            activity_type=activity_type,
            target_type="requirement",
            target_id=requirement.id,
            project_id=requirement.project_id,
            metadata=metadata,
        )

    async def record_comment_activity(
        self,
        db: AsyncSession,
        *,
        comment: Comment,
        activity_type: ActivityType,
        user_id: int,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Записать активность связанную с комментарием.

        Args:
            db: Сессия базы данных
            comment: Комментарий
            activity_type: Тип активности
            user_id: ID пользователя
            metadata: Дополнительные данные
        """
        # Загружаем требование для получения project_id
        await db.refresh(comment, ["requirement"])

        await self.record_activity(
            db=db,
            user_id=user_id,
            activity_type=activity_type,
            target_type="comment",
            target_id=comment.id,
            project_id=comment.requirement.project_id,
            metadata=metadata,
        )

    async def record_relationship_activity(
        self,
        db: AsyncSession,
        *,
        relationship: Relationship,
        activity_type: ActivityType,
        user_id: int,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Записать активность связанную с отношениями.

        Args:
            db: Сессия базы данных
            relationship: Отношение
            activity_type: Тип активности
            user_id: ID пользователя
            metadata: Дополнительные данные
        """
        # Получаем project_id из исходного требования
        await db.refresh(relationship, ["source"])

        await self.record_activity(
            db=db,
            user_id=user_id,
            activity_type=activity_type,
            target_type="relationship",
            target_id=f"{relationship.source_id}_{relationship.target_id}_{relationship.type_id}",
            project_id=relationship.source.project_id,
            metadata=metadata,
        )

    async def _get_target_title(
        self, db: AsyncSession, target_type: str, target_id: str
    ) -> str:
        """
        Получить заголовок цели по типу и ID.

        Args:
            db: Сессия базы данных
            target_type: Тип объекта
            target_id: ID объекта

        Returns:
            str: Заголовок объекта
        """
        try:
            if target_type == "requirement":
                query = select(Requirement.title).where(
                    Requirement.id == int(target_id)
                )
                result = await db.execute(query)
                title = result.scalar_one_or_none()
                return title or f"Requirement {target_id}"

            elif target_type == "project":
                query = select(Project.name).where(Project.id == int(target_id))
                result = await db.execute(query)
                title = result.scalar_one_or_none()
                return title or f"Project {target_id}"

            elif target_type == "comment":
                query = (
                    select(Requirement.title)
                    .join(Comment, Comment.requirement_id == Requirement.id)
                    .where(Comment.id == int(target_id))
                )
                result = await db.execute(query)
                req_title = result.scalar_one_or_none()
                return (
                    f"Comment on {req_title}" if req_title else f"Comment {target_id}"
                )

            elif target_type == "relationship":
                # Для отношений target_id имеет формат "source_id_target_id_type_id"
                parts = target_id.split("_")
                if len(parts) >= 2:
                    source_id, target_req_id = parts[0], parts[1]
                    source_query = select(Requirement.title).where(
                        Requirement.id == int(source_id)
                    )
                    target_query = select(Requirement.title).where(
                        Requirement.id == int(target_req_id)
                    )

                    source_result = await db.execute(source_query)
                    target_result = await db.execute(target_query)

                    source_title = source_result.scalar_one_or_none()
                    target_title = target_result.scalar_one_or_none()

                    return f"Relationship: {source_title} -> {target_title}"

                return f"Relationship {target_id}"

            else:
                return f"{target_type.title()} {target_id}"

        except Exception as e:
            logger.warning(
                f"Failed to get target title for {target_type}:{target_id}: {e}"
            )
            return f"{target_type.title()} {target_id}"


# Создаем экземпляр сервиса
activity_service = ActivityService()
