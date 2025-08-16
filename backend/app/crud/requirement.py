"""
CRUD операции для модели Requirement.
"""

from datetime import UTC, datetime
from typing import List, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementUpdate


class CRUDRequirement(CRUDBase[Requirement, RequirementCreate, RequirementUpdate]):
    """CRUD операции для модели Requirement."""

    async def get_with_details(
        self, db: AsyncSession, *, id: int
    ) -> Optional[Requirement]:
        """
        Получить требование с подробной информацией.

        Args:
            db: Сессия базы данных
            id: ID требования

        Returns:
            Требование со связанными данными или None если не найден
        """
        stmt = (
            select(Requirement)
            .where(Requirement.id == id)
            .options(
                selectinload(Requirement.type),
                selectinload(Requirement.priority),
                selectinload(Requirement.status),
                selectinload(Requirement.project),
                selectinload(Requirement.author),
                selectinload(Requirement.last_modifier),
                selectinload(Requirement.release),
                selectinload(Requirement.spec),
                selectinload(Requirement.comments),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        skip: int = 0,
        limit: int = 100,
        **filters,
    ) -> List[Requirement]:
        """
        Получить требования проекта с фильтрами.

        Args:
            db: Сессия базы данных
            project_id: ID проекта
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей
            **filters: Дополнительные фильтры (status_id, priority_id, type_id)

        Returns:
            Список требований
        """
        try:
            stmt = (
                select(Requirement)
                .where(Requirement.project_id == project_id)
                .options(
                    selectinload(Requirement.type),
                    selectinload(Requirement.priority),
                    selectinload(Requirement.status),
                    selectinload(Requirement.project),
                )
                .offset(skip)
                .limit(limit)
                .order_by(Requirement.created_at.desc())
            )

            # Применяем дополнительные фильтры
            for field, value in filters.items():
                if hasattr(Requirement, field) and value is not None:
                    stmt = stmt.where(getattr(Requirement, field) == value)

            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception:
            # Fallback to basic query without relationships
            stmt = (
                select(Requirement)
                .where(Requirement.project_id == project_id)
                .offset(skip)
                .limit(limit)
                .order_by(Requirement.created_at.desc())
            )

            # Применяем дополнительные фильтры
            for field, value in filters.items():
                if hasattr(Requirement, field) and value is not None:
                    stmt = stmt.where(getattr(Requirement, field) == value)

            result = await db.execute(stmt)
            return list(result.scalars().all())

    async def get_by_release(
        self,
        db: AsyncSession,
        *,
        release_id: int,
        skip: int = 0,
        limit: int = 100,
        **filters,
    ) -> List[Requirement]:
        """
        Получить требования релиза с фильтрами.

        Args:
            db: Сессия базы данных
            release_id: ID релиза
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей
            **filters: Дополнительные фильтры (status_id, priority_id, type_id)

        Returns:
            Список требований
        """
        try:
            stmt = (
                select(Requirement)
                .where(Requirement.release_id == release_id)
                .options(
                    selectinload(Requirement.type),
                    selectinload(Requirement.priority),
                    selectinload(Requirement.status),
                    selectinload(Requirement.project),
                    selectinload(Requirement.release),
                )
                .offset(skip)
                .limit(limit)
                .order_by(Requirement.created_at.desc())
            )

            # Применяем дополнительные фильтры
            for field, value in filters.items():
                if hasattr(Requirement, field) and value is not None:
                    stmt = stmt.where(getattr(Requirement, field) == value)

            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception:
            # Fallback to basic query without relationships
            stmt = (
                select(Requirement)
                .where(Requirement.release_id == release_id)
                .offset(skip)
                .limit(limit)
                .order_by(Requirement.created_at.desc())
            )

            # Применяем дополнительные фильтры
            for field, value in filters.items():
                if hasattr(Requirement, field) and value is not None:
                    stmt = stmt.where(getattr(Requirement, field) == value)

            result = await db.execute(stmt)
            return list(result.scalars().all())

    async def get_by_spec(
        self, db: AsyncSession, *, spec_id: int, skip: int = 0, limit: int = 100
    ) -> List[Requirement]:
        """
        Получить требования спецификации.

        Args:
            db: Сессия базы данных
            spec_id: ID спецификации
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список требований
        """
        stmt = (
            select(Requirement)
            .where(Requirement.spec_id == spec_id)
            .options(
                selectinload(Requirement.type),
                selectinload(Requirement.priority),
                selectinload(Requirement.status),
                selectinload(Requirement.author),
                selectinload(Requirement.last_modifier),
            )
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def search(
        self,
        db: AsyncSession,
        *,
        query: str,
        project_id: Optional[int] = None,
        status_id: Optional[int] = None,
        priority_id: Optional[int] = None,
        type_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Requirement]:
        """
        Поиск требований по различным критериям.

        Args:
            db: Сессия базы данных
            query: Поисковый запрос
            project_id: ID проекта для фильтрации
            status_id: ID статуса для фильтрации
            priority_id: ID приоритета для фильтрации
            type_id: ID типа для фильтрации
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список требований
        """
        stmt = select(Requirement)

        # Поиск по тексту в заголовке и описании
        if query:
            stmt = stmt.where(
                or_(
                    Requirement.title.ilike(f"%{query}%"),
                    Requirement.description.ilike(f"%{query}%"),
                )
            )

        # Применяем фильтры
        if project_id is not None:
            stmt = stmt.where(Requirement.project_id == project_id)
        if status_id is not None:
            stmt = stmt.where(Requirement.status_id == status_id)
        if priority_id is not None:
            stmt = stmt.where(Requirement.priority_id == priority_id)
        if type_id is not None:
            stmt = stmt.where(Requirement.type_id == type_id)

        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def count_by_project(self, db: AsyncSession, *, project_id: int) -> int:
        """
        Подсчитать количество требований в проекте.

        Args:
            db: Сессия базы данных
            project_id: ID проекта

        Returns:
            Количество требований
        """
        stmt = select(func.count(Requirement.id)).where(
            Requirement.project_id == project_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def count_by_status(
        self, db: AsyncSession, *, status_id: int, project_id: Optional[int] = None
    ) -> int:
        """
        Подсчитать количество требований по статусу.

        Args:
            db: Сессия базы данных
            status_id: ID статуса
            project_id: ID проекта для фильтрации (опционально)

        Returns:
            Количество требований
        """
        stmt = select(func.count(Requirement.id)).where(
            Requirement.status_id == status_id
        )

        if project_id is not None:
            stmt = stmt.where(Requirement.project_id == project_id)

        result = await db.execute(stmt)
        return result.scalar() or 0

    async def create(
        self, db: AsyncSession, *, obj_in: RequirementCreate, author_id: int
    ) -> Requirement:
        """
        Создать новое требование.

        Args:
            db: Сессия базы данных
            obj_in: Схема для создания требования
            author_id: ID автора требования

        Returns:
            Созданное требование
        """
        # Создаем требование, исключая deadline из схемы
        requirement_data = obj_in.model_dump()

        db_obj = Requirement(
            **requirement_data,
            author_id=author_id,
            last_modified_by=author_id,
            created_at=datetime.now(UTC).replace(tzinfo=None),
            updated_at=datetime.now(UTC).replace(tzinfo=None),
        )

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def create_with_author(
        self, db: AsyncSession, *, obj_in: RequirementCreate, author_id: int
    ) -> Requirement:
        """
        Создать новое требование с указанием автора.
        Это переопределение метода create из базового класса.

        Args:
            db: Сессия базы данных
            obj_in: Схема для создания требования
            author_id: ID автора требования

        Returns:
            Созданное требование
        """
        return await self.create(db, obj_in=obj_in, author_id=author_id)

    async def get_multi_with_filters(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100, **filters
    ) -> List[Requirement]:
        """Получить требования с фильтрами."""
        try:
            query = select(self.model)

            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    query = query.where(getattr(self.model, field) == value)

            query = (
                query.options(
                    selectinload(self.model.type),
                    selectinload(self.model.priority),
                    selectinload(self.model.status),
                    selectinload(self.model.project),
                )
                .offset(skip)
                .limit(limit)
                .order_by(self.model.created_at.desc())
            )

            result = await db.execute(query)
            return list(result.scalars().all())
        except Exception:
            # Fallback to basic query without relationships if there's an issue
            query = (
                select(self.model)
                .offset(skip)
                .limit(limit)
                .order_by(self.model.created_at.desc())
            )

            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    query = query.where(getattr(self.model, field) == value)

            result = await db.execute(query)
            return list(result.scalars().all())

    async def get_requirement_with_details(
        self, db: AsyncSession, *, requirement_id: int
    ) -> Optional[Requirement]:
        """Получить требование с подробной информацией."""
        query = (
            select(self.model)
            .where(self.model.id == requirement_id)
            .options(
                selectinload(self.model.type),
                selectinload(self.model.priority),
                selectinload(self.model.status),
                selectinload(self.model.project),
                selectinload(self.model.release),
                selectinload(self.model.spec),
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def search_requirements(
        self,
        db: AsyncSession,
        *,
        search_term: str,
        skip: int = 0,
        limit: int = 100,
        **filters,
    ) -> List[Requirement]:
        """Поиск требований по тексту с фильтрами."""
        return await self.search(
            db, query=search_term, skip=skip, limit=limit, **filters
        )

    async def update_status_only(
        self, db: AsyncSession, *, requirement_id: int, status_id: int
    ) -> Optional[Requirement]:
        """Обновить статус требования."""
        requirement = await self.get(db, id=requirement_id)
        if not requirement:
            return None

        requirement.status_id = status_id
        db.add(requirement)
        await db.commit()
        await db.refresh(requirement)
        return requirement


# Создаем экземпляр CRUD для использования в API
requirement = CRUDRequirement(Requirement)
