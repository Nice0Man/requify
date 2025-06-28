"""CRUD операции для модели Comment."""

from typing import List, Dict, Any, Optional
from sqlalchemy import select, desc, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

from app.crud.base import CRUDBase
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate


class CRUDComment(CRUDBase[Comment, CommentCreate, CommentUpdate]):
    """CRUD операции для модели Comment."""

    async def get_by_requirement(
        self, 
        db: AsyncSession, 
        *, 
        requirement_id: int, 
        skip: int = 0, 
        limit: int = 100,
        order_by: str = "created_at",
        order_desc: bool = True
    ) -> List[Comment]:
        """Получить комментарии требования."""
        query = (
            select(Comment)
            .where(Comment.requirement_id == requirement_id)
            .options(selectinload(Comment.author))
            .offset(skip)
            .limit(limit)
        )
        
        # Добавляем сортировку
        if order_by == "created_at":
            order_field = Comment.created_at
        elif order_by == "updated_at":
            order_field = Comment.updated_at
        else:
            order_field = Comment.created_at
            
        if order_desc:
            query = query.order_by(desc(order_field))
        else:
            query = query.order_by(order_field)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_multi_with_filters(
        self,
        db: AsyncSession,
        *,
        requirement_id: Optional[int] = None,
        author_id: Optional[int] = None,
        project_id: Optional[int] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Comment]:
        """Получить комментарии с фильтрами."""
        from app.models.requirement import Requirement
        
        query = select(Comment).options(
            selectinload(Comment.author),
            selectinload(Comment.requirement)
        )
        
        # Применяем фильтры
        filters = []
        
        if requirement_id is not None:
            filters.append(Comment.requirement_id == requirement_id)
            
        if author_id is not None:
            filters.append(Comment.author_id == author_id)
            
        if project_id is not None:
            query = query.join(Requirement, Comment.requirement_id == Requirement.id)
            filters.append(Requirement.project_id == project_id)
            
        if search:
            filters.append(Comment.text.ilike(f"%{search}%"))
        
        if filters:
            query = query.where(and_(*filters))
        
        query = (
            query
            .offset(skip)
            .limit(limit)
            .order_by(desc(Comment.created_at))
        )
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_recent_comments(
        self,
        db: AsyncSession,
        *,
        limit: int = 100,
        project_id: Optional[int] = None
    ) -> List[Comment]:
        """Получить последние комментарии."""
        from app.models.requirement import Requirement
        
        query = select(Comment).options(
            selectinload(Comment.author),
            selectinload(Comment.requirement)
        )
        
        if project_id is not None:
            query = query.join(Requirement, Comment.requirement_id == Requirement.id)
            query = query.where(Requirement.project_id == project_id)
        
        query = (
            query
            .limit(limit)
            .order_by(desc(Comment.created_at))
        )
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_comment_statistics(
        self,
        db: AsyncSession,
        *,
        project_id: Optional[int] = None,
        requirement_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Получить статистику комментариев."""
        from app.models.requirement import Requirement
        from app.models.user import User
        
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)
        
        base_query = select(Comment)
        
        # Базовые фильтры
        filters = []
        if requirement_id is not None:
            filters.append(Comment.requirement_id == requirement_id)
        elif project_id is not None:
            base_query = base_query.join(Requirement, Comment.requirement_id == Requirement.id)
            filters.append(Requirement.project_id == project_id)
        
        if filters:
            base_query = base_query.where(and_(*filters))
        
        # Общее количество комментариев
        total_query = select(func.count(Comment.id))
        if filters:
            if project_id and not requirement_id:
                total_query = total_query.select_from(
                    Comment.join(Requirement, Comment.requirement_id == Requirement.id)
                ).where(and_(*filters))
            else:
                total_query = total_query.select_from(Comment).where(and_(*filters))
        
        total_result = await db.execute(total_query)
        total_comments = total_result.scalar() or 0
        
        # Комментарии за сегодня
        today_query = select(func.count(Comment.id)).where(
            Comment.created_at >= today_start
        )
        if filters:
            if project_id and not requirement_id:
                today_query = today_query.select_from(
                    Comment.join(Requirement, Comment.requirement_id == Requirement.id)
                ).where(and_(*filters, Comment.created_at >= today_start))
            else:
                today_query = today_query.where(and_(*filters, Comment.created_at >= today_start))
        
        today_result = await db.execute(today_query)
        comments_today = today_result.scalar() or 0
        
        # Комментарии за неделю
        week_query = select(func.count(Comment.id)).where(
            Comment.created_at >= week_start
        )
        if filters:
            if project_id and not requirement_id:
                week_query = week_query.select_from(
                    Comment.join(Requirement, Comment.requirement_id == Requirement.id)
                ).where(and_(*filters, Comment.created_at >= week_start))
            else:
                week_query = week_query.where(and_(*filters, Comment.created_at >= week_start))
        
        week_result = await db.execute(week_query)
        comments_this_week = week_result.scalar() or 0
        
        # Комментарии за месяц
        month_query = select(func.count(Comment.id)).where(
            Comment.created_at >= month_start
        )
        if filters:
            if project_id and not requirement_id:
                month_query = month_query.select_from(
                    Comment.join(Requirement, Comment.requirement_id == Requirement.id)
                ).where(and_(*filters, Comment.created_at >= month_start))
            else:
                month_query = month_query.where(and_(*filters, Comment.created_at >= month_start))
        
        month_result = await db.execute(month_query)
        comments_this_month = month_result.scalar() or 0
        
        # Самые активные авторы
        authors_query = (
            select(
                User.username,
                func.count(Comment.id).label('comment_count')
            )
            .join(User, Comment.author_id == User.id)
        )
        
        if filters:
            if project_id and not requirement_id:
                authors_query = authors_query.join(
                    Requirement, Comment.requirement_id == Requirement.id
                ).where(and_(*filters))
            else:
                authors_query = authors_query.where(and_(*filters))
        
        authors_query = (
            authors_query
            .group_by(User.id, User.username)
            .order_by(desc('comment_count'))
            .limit(5)
        )
        
        authors_result = await db.execute(authors_query)
        most_active_authors = [username for username, count in authors_result]
        
        # Наиболее комментируемые требования
        requirements_query = (
            select(
                Requirement.title,
                func.count(Comment.id).label('comment_count')
            )
            .join(Requirement, Comment.requirement_id == Requirement.id)
        )
        
        if filters:
            requirements_query = requirements_query.where(and_(*filters))
        
        requirements_query = (
            requirements_query
            .group_by(Requirement.id, Requirement.title)
            .order_by(desc('comment_count'))
            .limit(5)
        )
        
        requirements_result = await db.execute(requirements_query)
        most_commented_requirements = [title for title, count in requirements_result]
        
        # Среднее количество комментариев на требование
        if requirement_id:
            avg_comments = float(total_comments) if total_comments > 0 else 0.0
        else:
            req_count_query = select(func.count(func.distinct(Requirement.id)))
            if project_id:
                req_count_query = req_count_query.select_from(
                    Requirement.outerjoin(Comment, Requirement.id == Comment.requirement_id)
                ).where(Requirement.project_id == project_id)
            else:
                req_count_query = req_count_query.select_from(
                    Requirement.outerjoin(Comment, Requirement.id == Comment.requirement_id)
                )
            
            req_count_result = await db.execute(req_count_query)
            req_count = req_count_result.scalar() or 1
            avg_comments = float(total_comments) / float(req_count) if req_count > 0 else 0.0
        
        return {
            'total_comments': total_comments,
            'comments_today': comments_today,
            'comments_this_week': comments_this_week,
            'comments_this_month': comments_this_month,
            'most_active_authors': most_active_authors,
            'most_commented_requirements': most_commented_requirements,
            'average_comments_per_requirement': avg_comments
        }

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

    async def get_comments_count_by_requirement(
        self, db: AsyncSession, *, requirement_id: int
    ) -> int:
        """Получить количество комментариев для требования."""
        query = select(func.count(Comment.id)).where(
            Comment.requirement_id == requirement_id
        )
        result = await db.execute(query)
        return result.scalar() or 0

    async def get_user_comments(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Comment]:
        """Получить комментарии пользователя."""
        query = (
            select(Comment)
            .where(Comment.author_id == user_id)
            .options(
                selectinload(Comment.requirement),
                selectinload(Comment.author)
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(Comment.created_at))
        )
        
        result = await db.execute(query)
        return result.scalars().all()


comment = CRUDComment(Comment)
