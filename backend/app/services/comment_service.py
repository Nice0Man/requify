"""
Comment Management Service.

Сервис для управления комментариями к требованиям,
включая создание, обновление, удаление и получение комментариев.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, update, delete, func, desc
from datetime import datetime
from fastapi import HTTPException, status

from app.models.user import User
from app.models.comment import Comment
from app.models.requirement import Requirement
from app.crud.base import CRUDBase
from app.core.constants import Permission
from app.services.permission_service import permission_service
from app.services.notification_service import notification_service, NotificationType
from app.services.activity_service import activity_service, ActivityType
from app.utils.logger import logger


class CommentService:
    """
    Сервис для управления комментариями.

    Предоставляет функциональность для:
    - Создания комментариев
    - Получения комментариев по требованию
    - Обновления комментариев
    - Удаления комментариев
    - Поиска комментариев
    """

    def __init__(self):
        self.crud = CRUDBase(Comment)

    async def create_comment(
        self,
        db: AsyncSession,
        *,
        requirement_id: int,
        content: str,
        author: User,
    ) -> Comment:
        """
        Создать новый комментарий к требованию.

        Args:
            db: Сессия базы данных
            requirement_id: ID требования
            content: Содержание комментария
            author: Автор комментария

        Returns:
            Comment: Созданный комментарий

        Raises:
            HTTPException: Если нет прав доступа или требование не найдено
        """
        # Проверяем, существует ли требование
        requirement_query = select(Requirement).where(Requirement.id == requirement_id)
        result = await db.execute(requirement_query)
        requirement = result.scalar_one_or_none()

        if not requirement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
            )

        # Проверяем права доступа к требованию
        has_permission = await permission_service.check_permission(
            user=author,
            permission=Permission.VIEW_REQUIREMENT,
            resource_id=requirement_id,
            db=db,
        )

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to comment on this requirement",
            )

        # Создаем комментарий
        comment_data = {
            "requirement_id": requirement_id,
            "content": content.strip(),
            "author_id": author.id,
        }

        comment = await self.crud.create(db, obj_in=comment_data)

        # Загружаем связанные данные
        await db.refresh(comment, ["author", "requirement"])

        # Записываем активность
        try:
            await activity_service.record_comment_activity(
                db=db,
                comment=comment,
                activity_type=ActivityType.COMMENT_CREATED,
                user_id=author.id,
                metadata={
                    "comment_content": (
                        comment.content[:100] + "..."
                        if len(comment.content) > 100
                        else comment.content
                    ),
                    "requirement_title": comment.requirement.title,
                },
            )
        except Exception as e:
            logger.warning(f"Failed to record comment activity: {e}")

        # Отправляем уведомление о новом комментарии
        try:
            await self._send_comment_notification(
                db=db, comment=comment, notification_type=NotificationType.COMMENT_ADDED
            )
        except Exception as e:
            logger.warning(f"Failed to send comment notification: {e}")

        logger.info(
            f"Comment {comment.id} created by user {author.id} for requirement {requirement_id}"
        )

        return comment

    async def get_requirement_comments(
        self,
        db: AsyncSession,
        *,
        requirement_id: int,
        user: User,
        page: int = 1,
        size: int = 20,
    ) -> Dict[str, Any]:
        """
        Получить комментарии к требованию с пагинацией.

        Args:
            db: Сессия базы данных
            requirement_id: ID требования
            user: Текущий пользователь
            page: Номер страницы
            size: Размер страницы

        Returns:
            Dict: Словарь с комментариями и информацией о пагинации
        """
        # Проверяем права доступа к требованию
        has_permission = await permission_service.check_permission(
            user=user,
            permission=Permission.VIEW_REQUIREMENT,
            resource_id=requirement_id,
            db=db,
        )

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view comments",
            )

        # Подсчитываем общее количество комментариев
        count_query = select(func.count(Comment.id)).where(
            Comment.requirement_id == requirement_id
        )
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Получаем комментарии с пагинацией
        offset = (page - 1) * size
        query = (
            select(Comment)
            .where(Comment.requirement_id == requirement_id)
            .options(selectinload(Comment.author))
            .order_by(desc(Comment.created_at))
            .offset(offset)
            .limit(size)
        )

        result = await db.execute(query)
        comments = result.scalars().all()

        return {
            "comments": comments,
            "total": total,
            "page": page,
            "pages": (total + size - 1) // size,
            "size": size,
        }

    async def update_comment(
        self,
        db: AsyncSession,
        *,
        comment_id: int,
        content: str,
        user: User,
    ) -> Comment:
        """
        Обновить содержание комментария.

        Args:
            db: Сессия базы данных
            comment_id: ID комментария
            content: Новое содержание
            user: Текущий пользователь

        Returns:
            Comment: Обновленный комментарий
        """
        # Получаем комментарий
        comment = await self.crud.get(db, id=comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )

        # Проверяем права (автор или администратор)
        if comment.author_id != user.id:
            has_admin_permission = await permission_service.check_permission(
                user=user, permission=Permission.MANAGE_SYSTEM, db=db
            )
            if not has_admin_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only edit your own comments",
                )

        # Обновляем комментарий
        update_data = {"content": content.strip()}
        updated_comment = await self.crud.update(db, db_obj=comment, obj_in=update_data)

        # Загружаем связанные данные
        await db.refresh(updated_comment, ["author", "requirement"])

        logger.info(f"Comment {comment_id} updated by user {user.id}")

        return updated_comment

    async def delete_comment(
        self,
        db: AsyncSession,
        *,
        comment_id: int,
        user: User,
    ) -> bool:
        """
        Удалить комментарий.

        Args:
            db: Сессия базы данных
            comment_id: ID комментария
            user: Текущий пользователь

        Returns:
            bool: True если удален успешно
        """
        # Получаем комментарий
        comment = await self.crud.get(db, id=comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )

        # Проверяем права (автор или администратор)
        if comment.author_id != user.id:
            has_admin_permission = await permission_service.check_permission(
                user=user, permission=Permission.MANAGE_SYSTEM, db=db
            )
            if not has_admin_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete your own comments",
                )

        # Удаляем комментарий
        await self.crud.remove(db, id=comment_id)

        logger.info(f"Comment {comment_id} deleted by user {user.id}")

        return True

    async def search_comments(
        self,
        db: AsyncSession,
        *,
        search_query: str,
        user: User,
        requirement_id: Optional[int] = None,
        author_id: Optional[int] = None,
        page: int = 1,
        size: int = 20,
    ) -> Dict[str, Any]:
        """
        Поиск комментариев по содержанию.

        Args:
            db: Сессия базы данных
            search_query: Поисковый запрос
            user: Текущий пользователь
            requirement_id: Фильтр по требованию (опционально)
            author_id: Фильтр по автору (опционально)
            page: Номер страницы
            size: Размер страницы

        Returns:
            Dict: Результаты поиска с пагинацией
        """
        # Базовое условие поиска
        conditions = [Comment.content.ilike(f"%{search_query}%")]

        # Дополнительные фильтры
        if requirement_id:
            conditions.append(Comment.requirement_id == requirement_id)

        if author_id:
            conditions.append(Comment.author_id == author_id)

        # TODO: Добавить проверку прав доступа к требованиям
        # Пока что возвращаем только комментарии к доступным требованиям

        # Подсчитываем общее количество
        count_query = select(func.count(Comment.id)).where(and_(*conditions))
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Получаем результаты с пагинацией
        offset = (page - 1) * size
        query = (
            select(Comment)
            .where(and_(*conditions))
            .options(selectinload(Comment.author), selectinload(Comment.requirement))
            .order_by(desc(Comment.created_at))
            .offset(offset)
            .limit(size)
        )

        result = await db.execute(query)
        comments = result.scalars().all()

        return {
            "comments": comments,
            "total": total,
            "page": page,
            "pages": (total + size - 1) // size,
            "size": size,
            "search_query": search_query,
        }

    async def get_recent_comments(
        self,
        db: AsyncSession,
        *,
        user: User,
        limit: int = 10,
    ) -> List[Comment]:
        """
        Получить последние комментарии пользователя.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            limit: Количество комментариев

        Returns:
            List[Comment]: Список последних комментариев
        """
        query = (
            select(Comment)
            .where(Comment.author_id == user.id)
            .options(selectinload(Comment.requirement))
            .order_by(desc(Comment.created_at))
            .limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_all_comments_for_admin(
        self,
        db: AsyncSession,
        *,
        user: User,
        page: int = 1,
        size: int = 20,
        search: Optional[str] = None,
        author_id: Optional[int] = None,
        project_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Получить все комментарии для администраторов.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь (должен быть администратором)
            page: Номер страницы
            size: Размер страницы
            search: Поисковый запрос
            author_id: Фильтр по автору
            project_id: Фильтр по проекту

        Returns:
            Dict: Комментарии с пагинацией
        """
        # Проверяем права администратора
        has_admin_permission = await permission_service.check_permission(
            user=user, permission=Permission.MANAGE_SYSTEM, db=db
        )
        if not has_admin_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin permissions required",
            )

        # Строим базовый запрос
        conditions = []

        if search:
            conditions.append(Comment.content.ilike(f"%{search}%"))

        if author_id:
            conditions.append(Comment.author_id == author_id)

        if project_id:
            # Фильтруем через требования
            conditions.append(Requirement.project_id == project_id)

        # Подсчитываем общее количество
        count_query = select(func.count(Comment.id))
        if project_id:
            count_query = count_query.join(Requirement)
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Получаем комментарии с пагинацией
        offset = (page - 1) * size
        query = (
            select(Comment)
            .options(selectinload(Comment.author), selectinload(Comment.requirement))
            .order_by(desc(Comment.created_at))
            .offset(offset)
            .limit(size)
        )

        if project_id:
            query = query.join(Requirement)

        if conditions:
            query = query.where(and_(*conditions))

        result = await db.execute(query)
        comments = result.scalars().all()

        return {
            "comments": comments,
            "total": total,
            "page": page,
            "pages": (total + size - 1) // size,
            "size": size,
        }

    async def get_comment_statistics(
        self,
        db: AsyncSession,
        *,
        user: User,
        requirement_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Получить статистику по комментариям.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            requirement_id: ID требования для фильтрации (опционально)

        Returns:
            Dict: Статистика комментариев
        """
        conditions = []
        if requirement_id:
            conditions.append(Comment.requirement_id == requirement_id)

        # Общее количество комментариев
        total_query = select(func.count(Comment.id))
        if conditions:
            total_query = total_query.where(and_(*conditions))

        total_result = await db.execute(total_query)
        total_comments = total_result.scalar()

        # Комментарии пользователя
        user_conditions = conditions + [Comment.author_id == user.id]
        user_query = select(func.count(Comment.id)).where(and_(*user_conditions))
        user_result = await db.execute(user_query)
        user_comments = user_result.scalar()

        return {
            "total_comments": total_comments,
            "user_comments": user_comments,
            "requirement_id": requirement_id,
        }

    async def _send_comment_notification(
        self,
        db: AsyncSession,
        comment: Comment,
        notification_type: NotificationType,
    ) -> None:
        """
        Отправить уведомление о комментарии.

        Args:
            db: Сессия базы данных
            comment: Комментарий
            notification_type: Тип уведомления
        """
        try:
            # TODO: Определить получателей уведомления
            # (автор требования, подписчики, команда проекта и т.д.)

            # Пока что отправляем уведомление автору требования
            if comment.requirement.author_id != comment.author_id:
                notification_data = {
                    "comment_id": comment.id,
                    "comment_content": (
                        comment.content[:100] + "..."
                        if len(comment.content) > 100
                        else comment.content
                    ),
                    "requirement_id": comment.requirement_id,
                    "requirement_title": comment.requirement.title,
                    "author_name": comment.author.full_name or comment.author.email,
                }

                await notification_service.send_notification(
                    db=db,
                    user_id=comment.requirement.author_id,
                    notification_type=notification_type,
                    data=notification_data,
                )

        except Exception as e:
            logger.error(f"Failed to send comment notification: {e}")


# Создаем экземпляр сервиса
comment_service = CommentService()
