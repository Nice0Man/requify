"""CRUD операции для модели Comment."""

from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from requify.app.crud.base import CRUDBase
from requify.app.models.comment import Comment
from requify.app.schemas.comment import CommentCreate, CommentUpdate


class CRUDComment(CRUDBase[Comment, CommentCreate, CommentUpdate]):
    """CRUD операции для модели Comment."""

    async def get_by_requirement(
        self, db: AsyncSession, *, requirement_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Получить комментарии требования."""
        stmt = (
            select(Comment)
            .where(Comment.requirement_id == requirement_id)
            .options(selectinload(Comment.author))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def create(
        self, db: AsyncSession, *, obj_in: CommentCreate, author_id: int
    ) -> Comment:
        """Создать новый комментарий."""
        db_obj = Comment(
            text=obj_in.text,
            requirement_id=obj_in.requirement_id,
            author_id=author_id,
        )

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


comment = CRUDComment(Comment)
