"""
Comment Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, update, delete, func, desc
from fastapi import HTTPException, status

from app.models.user import User
from app.models.comment import Comment
from app.models.requirement import Requirement
from app.crud.base import CRUDBase
from app.core.constants import Permission
from app.utils.logger import logger
from .base import BaseService, ServiceError


class CommentServiceError(ServiceError):
    """Ошибки сервиса комментариев."""

    pass


class CommentNotFoundError(CommentServiceError):
    """Ошибка - комментарий не найден."""

    pass


class CommentPermissionError(CommentServiceError):
    """Ошибка прав доступа к комментарию."""

    pass


class CommentValidationError(CommentServiceError):
    """Ошибка валидации комментария."""

    pass


class CommentStatus(str, Enum):
    """Статусы комментариев."""

    ACTIVE = "active"
    EDITED = "edited"
    DELETED = "deleted"
    HIDDEN = "hidden"
    SPAM = "spam"


class CommentType(str, Enum):
    """Типы комментариев."""

    GENERAL = "general"
    REVIEW = "review"
    APPROVAL = "approval"
    QUESTION = "question"
    SUGGESTION = "suggestion"


@dataclass
class CommentInfo:
    """Информация о комментарии."""

    id: int
    content: str
    author_id: int
    requirement_id: int
    comment_type: CommentType
    status: CommentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    parent_id: Optional[int] = None
    attachments: List[str] = None


@dataclass
class CommentThread:
    """Ветка комментариев."""

    root_comment: CommentInfo
    replies: List[CommentInfo]
    total_replies: int


# Абстрактные интерфейсы
class ICommentRepository(ABC):
    """Интерфейс репозитория комментариев."""

    @abstractmethod
    async def create_comment(
        self, db: AsyncSession, comment_data: Dict[str, Any]
    ) -> Comment:
        """Создать комментарий."""
        pass

    @abstractmethod
    async def get_comment_by_id(
        self, db: AsyncSession, comment_id: int
    ) -> Optional[Comment]:
        """Получить комментарий по ID."""
        pass

    @abstractmethod
    async def get_comments_by_requirement(
        self, db: AsyncSession, requirement_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Получить комментарии по требованию."""
        pass


class ICommentValidator(ABC):
    """Интерфейс валидатора комментариев."""

    @abstractmethod
    async def validate_comment_creation(
        self, db: AsyncSession, user: User, requirement_id: int, content: str
    ) -> bool:
        """Валидировать создание комментария."""
        pass

    @abstractmethod
    async def validate_comment_edit(
        self, db: AsyncSession, user: User, comment: Comment
    ) -> bool:
        """Валидировать редактирование комментария."""
        pass


class ICommentNotifier(ABC):
    """Интерфейс для уведомлений о комментариях."""

    @abstractmethod
    async def notify_comment_created(
        self, comment: Comment, requirement: Requirement, author: User
    ):
        """Уведомить о создании комментария."""
        pass

    @abstractmethod
    async def notify_comment_replied(
        self, reply: Comment, parent_comment: Comment, author: User
    ):
        """Уведомить об ответе на комментарий."""
        pass


# Конкретные реализации
class DatabaseCommentRepository(ICommentRepository):
    """Репозиторий комментариев в базе данных."""

    def __init__(self):
        self.crud = CRUDBase(Comment)

    async def create_comment(
        self, db: AsyncSession, comment_data: Dict[str, Any]
    ) -> Comment:
        """Создать комментарий."""
        comment = await self.crud.create(db, obj_in=comment_data)
        await db.refresh(comment, ["author", "requirement"])
        return comment

    async def get_comment_by_id(
        self, db: AsyncSession, comment_id: int
    ) -> Optional[Comment]:
        """Получить комментарий по ID."""
        return await self.crud.get(db, id=comment_id)

    async def get_comments_by_requirement(
        self, db: AsyncSession, requirement_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Получить комментарии по требованию."""
        stmt = (
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.requirement_id == requirement_id)
            .order_by(desc(Comment.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def update_comment(
        self, db: AsyncSession, comment: Comment, updates: Dict[str, Any]
    ) -> Comment:
        """Обновить комментарий."""
        return await self.crud.update(db, db_obj=comment, obj_in=updates)

    async def delete_comment(self, db: AsyncSession, comment: Comment) -> bool:
        """Удалить комментарий."""
        await self.crud.remove(db, id=comment.id)
        return True

    async def search_comments(
        self,
        db: AsyncSession,
        query: str,
        requirement_id: Optional[int] = None,
        author_id: Optional[int] = None,
    ) -> List[Comment]:
        """Поиск комментариев."""
        stmt = (
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.content.ilike(f"%{query}%"))
        )

        if requirement_id:
            stmt = stmt.where(Comment.requirement_id == requirement_id)

        if author_id:
            stmt = stmt.where(Comment.author_id == author_id)

        result = await db.execute(stmt)
        return result.scalars().all()


class StandardCommentValidator(ICommentValidator):
    """Стандартный валидатор комментариев."""

    async def validate_comment_creation(
        self, db: AsyncSession, user: User, requirement_id: int, content: str
    ) -> bool:
        """Валидировать создание комментария."""
        # Проверка содержания
        if not content or not content.strip():
            raise CommentValidationError("Comment content cannot be empty")

        if len(content.strip()) > 10000:
            raise CommentValidationError("Comment content is too long")

        # Проверка существования требования
        stmt = select(Requirement).where(Requirement.id == requirement_id)
        result = await db.execute(stmt)
        requirement = result.scalar_one_or_none()

        if not requirement:
            raise CommentNotFoundError("Requirement not found")

        # Проверка прав доступа (упрощенная версия)
        # В реальной реализации здесь должна быть проверка через permission_service
        if not user.is_active:
            raise CommentPermissionError("User is not active")

        return True

    async def validate_comment_edit(
        self, db: AsyncSession, user: User, comment: Comment
    ) -> bool:
        """Валидировать редактирование комментария."""
        # Проверка прав автора
        if comment.author_id != user.id and not user.is_superuser:
            raise CommentPermissionError("Only author or admin can edit comment")

        # Проверка времени редактирования (например, можно редактировать только в течение часа)
        if comment.created_at:
            time_diff = datetime.utcnow() - comment.created_at
            if time_diff.total_seconds() > 3600 and not user.is_superuser:  # 1 час
                raise CommentPermissionError("Comment can only be edited within 1 hour")

        return True


class CommentNotificationManager(ICommentNotifier):
    """Менеджер уведомлений о комментариях."""

    async def notify_comment_created(
        self, comment: Comment, requirement: Requirement, author: User
    ):
        """Уведомить о создании комментария."""
        # Логика уведомления заинтересованных пользователей
        logger.info(
            f"New comment created by {author.email} on requirement {requirement.id}"
        )

        # Здесь можно добавить логику отправки уведомлений
        # через NotificationService когда он будет доступен

    async def notify_comment_replied(
        self, reply: Comment, parent_comment: Comment, author: User
    ):
        """Уведомить об ответе на комментарий."""
        logger.info(f"Reply to comment {parent_comment.id} by {author.email}")

        # Уведомление автора родительского комментария


class CommentThreadManager:
    """Менеджер веток комментариев."""

    async def get_comment_thread(
        self, db: AsyncSession, comment_id: int
    ) -> Optional[CommentThread]:
        """Получить ветку комментария."""
        # Получение корневого комментария
        stmt = select(Comment).where(Comment.id == comment_id)
        result = await db.execute(stmt)
        root_comment = result.scalar_one_or_none()

        if not root_comment:
            return None

        # Получение ответов
        replies_stmt = (
            select(Comment)
            .where(Comment.parent_id == comment_id)
            .order_by(Comment.created_at)
        )
        replies_result = await db.execute(replies_stmt)
        replies = replies_result.scalars().all()

        return CommentThread(
            root_comment=self._convert_to_comment_info(root_comment),
            replies=[self._convert_to_comment_info(reply) for reply in replies],
            total_replies=len(replies),
        )

    def _convert_to_comment_info(self, comment: Comment) -> CommentInfo:
        """Конвертировать Comment в CommentInfo."""
        return CommentInfo(
            id=comment.id,
            content=comment.content,
            author_id=comment.author_id,
            requirement_id=comment.requirement_id,
            comment_type=CommentType.GENERAL,  # По умолчанию
            status=CommentStatus.ACTIVE,  # По умолчанию
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            parent_id=getattr(comment, "parent_id", None),
        )


class CommentService(BaseService):
    """
    Основной сервис комментариев.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы)
    - Observer (уведомления)
    - Command (операции с комментариями)
    """

    def __init__(self):
        self._repository: ICommentRepository = DatabaseCommentRepository()
        self._validator: ICommentValidator = StandardCommentValidator()
        self._notifier: ICommentNotifier = CommentNotificationManager()
        self._thread_manager = CommentThreadManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "CommentService"

    def set_repository(self, repository: ICommentRepository):
        """Установить репозиторий комментариев."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: ICommentValidator):
        """Установить валидатор комментариев."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def create_comment(
        self,
        db: AsyncSession,
        requirement_id: int,
        content: str,
        author: User,
        comment_type: CommentType = CommentType.GENERAL,
        parent_id: Optional[int] = None,
    ) -> Comment:
        """Создать новый комментарий."""
        try:
            self._log_operation(
                "create_comment",
                {
                    "requirement_id": requirement_id,
                    "author_id": author.id,
                    "comment_type": comment_type.value,
                    "parent_id": parent_id,
                },
            )

            # Валидация
            await self._validator.validate_comment_creation(
                db, author, requirement_id, content
            )

            # Подготовка данных
            comment_data = {
                "requirement_id": requirement_id,
                "content": content.strip(),
                "author_id": author.id,
                "parent_id": parent_id,
                "created_at": datetime.utcnow(),
            }

            # Создание комментария
            comment = await self._repository.create_comment(db, comment_data)

            # Уведомления
            if parent_id:
                parent_comment = await self._repository.get_comment_by_id(db, parent_id)
                if parent_comment:
                    await self._notifier.notify_comment_replied(
                        comment, parent_comment, author
                    )
            else:
                # Получение требования для уведомления
                stmt = select(Requirement).where(Requirement.id == requirement_id)
                result = await db.execute(stmt)
                requirement = result.scalar_one_or_none()

                if requirement:
                    await self._notifier.notify_comment_created(
                        comment, requirement, author
                    )

            return comment

        except Exception as e:
            raise self._handle_error(e, "create_comment")

    async def get_comments_by_requirement(
        self, db: AsyncSession, requirement_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Получить комментарии по требованию."""
        try:
            self._log_operation(
                "get_comments_by_requirement",
                {"requirement_id": requirement_id, "skip": skip, "limit": limit},
            )

            return await self._repository.get_comments_by_requirement(
                db, requirement_id, skip, limit
            )

        except Exception as e:
            raise self._handle_error(e, "get_comments_by_requirement")

    async def update_comment(
        self, db: AsyncSession, comment_id: int, content: str, user: User
    ) -> Comment:
        """Обновить комментарий."""
        try:
            self._log_operation(
                "update_comment", {"comment_id": comment_id, "user_id": user.id}
            )

            # Получение комментария
            comment = await self._repository.get_comment_by_id(db, comment_id)
            if not comment:
                raise CommentNotFoundError(f"Comment with ID {comment_id} not found")

            # Валидация
            await self._validator.validate_comment_edit(db, user, comment)

            # Обновление
            updates = {"content": content.strip(), "updated_at": datetime.utcnow()}

            updated_comment = await self._repository.update_comment(
                db, comment, updates
            )

            return updated_comment

        except Exception as e:
            raise self._handle_error(e, "update_comment")

    async def delete_comment(
        self, db: AsyncSession, comment_id: int, user: User
    ) -> bool:
        """Удалить комментарий."""
        try:
            self._log_operation(
                "delete_comment", {"comment_id": comment_id, "user_id": user.id}
            )

            # Получение комментария
            comment = await self._repository.get_comment_by_id(db, comment_id)
            if not comment:
                raise CommentNotFoundError(f"Comment with ID {comment_id} not found")

            # Валидация прав
            if comment.author_id != user.id and not user.is_superuser:
                raise CommentPermissionError("Only author or admin can delete comment")

            # Удаление
            success = await self._repository.delete_comment(db, comment)

            return success

        except Exception as e:
            raise self._handle_error(e, "delete_comment")

    async def search_comments(
        self,
        db: AsyncSession,
        query: str,
        requirement_id: Optional[int] = None,
        author_id: Optional[int] = None,
    ) -> List[Comment]:
        """Поиск комментариев."""
        try:
            self._log_operation(
                "search_comments",
                {
                    "query": query,
                    "requirement_id": requirement_id,
                    "author_id": author_id,
                },
            )

            if not query.strip():
                return []

            return await self._repository.search_comments(
                db, query.strip(), requirement_id, author_id
            )

        except Exception as e:
            raise self._handle_error(e, "search_comments")

    async def get_comment_thread(
        self, db: AsyncSession, comment_id: int
    ) -> Optional[CommentThread]:
        """Получить ветку комментария."""
        try:
            self._log_operation("get_comment_thread", {"comment_id": comment_id})

            return await self._thread_manager.get_comment_thread(db, comment_id)

        except Exception as e:
            raise self._handle_error(e, "get_comment_thread")

    async def get_comment_statistics(
        self,
        db: AsyncSession,
        requirement_id: Optional[int] = None,
        author_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Получить статистику комментариев."""
        try:
            self._log_operation(
                "get_comment_statistics",
                {"requirement_id": requirement_id, "author_id": author_id},
            )

            # Базовый запрос
            stmt = select(func.count(Comment.id))

            if requirement_id:
                stmt = stmt.where(Comment.requirement_id == requirement_id)

            if author_id:
                stmt = stmt.where(Comment.author_id == author_id)

            result = await db.execute(stmt)
            total_comments = result.scalar()

            return {
                "total_comments": total_comments,
                "requirement_id": requirement_id,
                "author_id": author_id,
            }

        except Exception as e:
            raise self._handle_error(e, "get_comment_statistics")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("comment", CommentService)

# Singleton instance
comment_service = CommentService()
