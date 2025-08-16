"""
CRUD операции для модели Project.
"""

from typing import List, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    """CRUD операции для модели Project."""

    async def get_by_code(self, db: AsyncSession, *, code: str) -> Optional[Project]:
        """
        Получить проект по коду.

        Args:
            db: Сессия базы данных
            code: Код проекта

        Returns:
            Проект или None если не найден
        """
        stmt = select(Project).where(Project.code == code)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_stats(self, db: AsyncSession, *, id: int) -> Optional[Project]:
        """
        Получить проект со статистикой.

        Args:
            db: Сессия базы данных
            id: ID проекта

        Returns:
            Проект со связанными данными или None если не найден
        """
        stmt = (
            select(Project)
            .where(Project.id == id)
            .options(
                selectinload(Project.requirements),
                selectinload(Project.releases),
                selectinload(Project.specs),
                selectinload(Project.requirement_groups),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """
        Получить проекты по статусу.

        Args:
            db: Сессия базы данных
            status: Статус проекта
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список проектов
        """
        stmt = select(Project).where(Project.status == status).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_by_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """
        Получить проекты по пользователю.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список проектов
        """
        stmt = (
            select(Project).where(Project.owner_id == user_id).offset(skip).limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def count_by_status(self, db: AsyncSession, *, status: str) -> int:
        """
        Подсчитать количество проектов по статусу.

        Args:
            db: Сессия базы данных
            status: Статус проекта

        Returns:
            Количество проектов
        """
        stmt = select(func.count(Project.id)).where(Project.status == status)
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def search_by_name(
        self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """
        Поиск проектов по имени.

        Args:
            db: Сессия базы данных
            query: Поисковый запрос
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список проектов
        """
        stmt = (
            select(Project)
            .where(Project.name.ilike(f"%{query}%"))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def search_projects(
        self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """
        Поиск проектов по названию, коду или описанию.

        Args:
            db: Сессия базы данных
            query: Поисковый запрос
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список проектов
        """
        stmt = (
            select(Project)
            .where(
                or_(
                    Project.name.ilike(f"%{query}%"),
                    Project.code.ilike(f"%{query}%"),
                    Project.description.ilike(f"%{query}%"),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def is_code_taken(
        self, db: AsyncSession, *, code: str, exclude_id: Optional[int] = None
    ) -> bool:
        """
        Проверить занят ли код проекта.

        Args:
            db: Сессия базы данных
            code: Код проекта для проверки
            exclude_id: ID проекта, который нужно исключить из проверки

        Returns:
            True если код занят, False иначе
        """
        stmt = select(Project).where(Project.code == code)
        if exclude_id is not None:
            stmt = stmt.where(Project.id != exclude_id)

        result = await db.execute(stmt)
        project = result.scalar_one_or_none()
        return project is not None

    async def get_project_stats(self, db: AsyncSession, *, project_id: int) -> dict:
        """
        Получить статистику проекта.

        Args:
            db: Сессия базы данных
            project_id: ID проекта

        Returns:
            Словарь со статистикой проекта
        """
        # Подсчет требований
        from app.models.requirement import Requirement

        total_requirements_stmt = select(func.count(Requirement.id)).where(
            Requirement.project_id == project_id
        )
        total_requirements = await db.execute(total_requirements_stmt)
        total_requirements = total_requirements.scalar() or 0

        # Подсчет релизов
        from app.models.release import Release

        releases_stmt = select(func.count(Release.id)).where(
            Release.project_id == project_id
        )
        releases_count = await db.execute(releases_stmt)
        releases_count = releases_count.scalar() or 0

        # Подсчет спецификаций
        from app.models.spec import Spec

        specs_stmt = select(func.count(Spec.id)).where(Spec.project_id == project_id)
        specs_count = await db.execute(specs_stmt)
        specs_count = specs_count.scalar() or 0

        # Подсчет групп требований
        from app.models.requirement_group import RequirementGroup

        groups_stmt = select(func.count(RequirementGroup.id)).where(
            RequirementGroup.project_id == project_id
        )
        groups_count = await db.execute(groups_stmt)
        groups_count = groups_count.scalar() or 0

        # Подсчет завершенных требований по статусам
        from app.models.requirement_statuses import RequirementStatus

        # Получаем ID статусов для завершенных требований
        completed_statuses_stmt = select(RequirementStatus.id).where(
            RequirementStatus.name.in_(["done", "completed", "closed", "implemented"])
        )
        completed_statuses_result = await db.execute(completed_statuses_stmt)
        completed_status_ids = [row[0] for row in completed_statuses_result.fetchall()]

        # Подсчитываем требования с завершенными статусами
        if completed_status_ids:
            completed_requirements_stmt = select(func.count(Requirement.id)).where(
                Requirement.project_id == project_id,
                Requirement.status_id.in_(completed_status_ids),
            )
            completed_requirements = await db.execute(completed_requirements_stmt)
            completed_requirements = completed_requirements.scalar() or 0
        else:
            completed_requirements = 0

        return {
            "total_requirements": total_requirements,
            "requirements_completed": completed_requirements,
            "active_releases": releases_count,
            "specs_count": specs_count,
            "requirement_groups_count": groups_count,
        }


# Создаем экземпляр CRUD для использования в API
project = CRUDProject(Project)
