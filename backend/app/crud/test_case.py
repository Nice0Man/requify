"""
CRUD операции для тестовых случаев.

Предоставляет базовые операции создания, чтения, обновления
и удаления тестовых случаев, а также специализированные методы.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import and_, or_, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.future import select

from app.crud.base import CRUDBase
from app.models.test_case import (
    TestCase,
    TestCaseStatus,
    TestCasePriority,
    TestCaseType,
)
from app.schemas.test_case import TestCaseCreate, TestCaseUpdate


class CRUDTestCase(CRUDBase[TestCase, TestCaseCreate, TestCaseUpdate]):
    """CRUD операции для тестовых случаев"""

    async def get_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        type: Optional[str] = None,
        priority: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[TestCase]:
        """
        Получить тестовые случаи проекта с фильтрацией.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            status: Фильтр по статусу
            type: Фильтр по типу
            priority: Фильтр по приоритету
            is_active: Фильтр по активности

        Returns:
            List[TestCase]: Список тестовых случаев
        """
        query = select(TestCase).where(TestCase.project_id == project_id)

        # Применяем фильтры
        if status:
            query = query.where(TestCase.status == status)
        if type:
            query = query.where(TestCase.type == type)
        if priority:
            query = query.where(TestCase.priority == priority)
        if is_active is not None:
            query = query.where(TestCase.is_active == is_active)

        query = query.offset(skip).limit(limit).order_by(TestCase.created_at.desc())

        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_requirement(
        self,
        db: AsyncSession,
        *,
        requirement_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[TestCase]:
        """
        Получить тестовые случаи для требования.

        Args:
            db: Асинхронная сессия базы данных
            requirement_id: ID требования
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[TestCase]: Список тестовых случаев
        """
        query = (
            select(TestCase)
            .where(TestCase.requirement_id == requirement_id)
            .offset(skip)
            .limit(limit)
            .order_by(TestCase.created_at.desc())
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_test_plan(
        self,
        db: AsyncSession,
        *,
        test_plan_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[TestCase]:
        """
        Получить тестовые случаи плана тестирования.

        Args:
            db: Асинхронная сессия базы данных
            test_plan_id: ID плана тестирования
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[TestCase]: Список тестовых случаев
        """
        query = (
            select(TestCase)
            .where(TestCase.test_plan_id == test_plan_id)
            .offset(skip)
            .limit(limit)
            .order_by(TestCase.created_at.desc())
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def search(
        self,
        db: AsyncSession,
        *,
        project_id: Optional[int] = None,
        search_query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[TestCase]:
        """
        Поиск тестовых случаев по названию и описанию.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта (опционально)
            search_query: Поисковый запрос
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[TestCase]: Список найденных тестовых случаев
        """
        search_filter = or_(
            TestCase.name.icontains(search_query),
            TestCase.description.icontains(search_query),
            TestCase.test_steps.icontains(search_query),
            TestCase.expected_result.icontains(search_query),
        )

        query = select(TestCase).where(search_filter)

        if project_id:
            query = query.where(TestCase.project_id == project_id)

        query = query.offset(skip).limit(limit).order_by(TestCase.created_at.desc())

        result = await db.execute(query)
        return result.scalars().all()

    async def get_statistics(
        self,
        db: AsyncSession,
        *,
        project_id: Optional[int] = None,
        test_plan_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Получить статистику тестовых случаев.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта (опционально)
            test_plan_id: ID плана тестирования (опционально)

        Returns:
            Dict[str, Any]: Статистика тестовых случаев
        """
        query = select(TestCase)

        if project_id:
            query = query.where(TestCase.project_id == project_id)
        if test_plan_id:
            query = query.where(TestCase.test_plan_id == test_plan_id)

        # Общее количество
        total_query = select(func.count(TestCase.id)).select_from(query.subquery())
        total_result = await db.execute(total_query)
        total = total_result.scalar() or 0

        # Статистика по статусам
        status_query = (
            select(TestCase.status, func.count(TestCase.id).label("count"))
            .select_from(query.subquery())
            .group_by(TestCase.status)
        )
        status_result = await db.execute(status_query)
        status_stats = {row.status: row.count for row in status_result.fetchall()}

        # Статистика по типам
        type_query = (
            select(TestCase.type, func.count(TestCase.id).label("count"))
            .select_from(query.subquery())
            .group_by(TestCase.type)
        )
        type_result = await db.execute(type_query)
        type_stats = {row.type: row.count for row in type_result.fetchall()}

        # Статистика по приоритетам
        priority_query = (
            select(TestCase.priority, func.count(TestCase.id).label("count"))
            .select_from(query.subquery())
            .group_by(TestCase.priority)
        )
        priority_result = await db.execute(priority_query)
        priority_stats = {row.priority: row.count for row in priority_result.fetchall()}

        # Автоматизированные тесты
        automated_query = select(func.count(TestCase.id)).where(
            and_(TestCase.is_automated == True, query.whereclause)
        )
        automated_result = await db.execute(automated_query)
        automated_count = automated_result.scalar() or 0

        return {
            "total": total,
            "by_status": status_stats,
            "by_type": type_stats,
            "by_priority": priority_stats,
            "automated_count": automated_count,
            "automation_percentage": (
                (automated_count / total * 100) if total > 0 else 0
            ),
        }

    async def duplicate_test_case(
        self,
        db: AsyncSession,
        *,
        test_case_id: int,
        new_name: str,
        project_id: Optional[int] = None,
        test_plan_id: Optional[int] = None,
    ) -> TestCase:
        """
        Дублировать тестовый случай.

        Args:
            db: Асинхронная сессия базы данных
            test_case_id: ID исходного тестового случая
            new_name: Новое название
            project_id: ID нового проекта (опционально)
            test_plan_id: ID нового плана тестирования (опционально)

        Returns:
            TestCase: Новый тестовый случай
        """
        # Получаем исходный тестовый случай
        original = await self.get(db, id=test_case_id)
        if not original:
            raise ValueError(f"Test case with id {test_case_id} not found")

        # Создаем данные для нового тестового случая
        test_case_data = {
            "name": new_name,
            "description": original.description,
            "type": original.type,
            "priority": original.priority,
            "preconditions": original.preconditions,
            "test_steps": original.test_steps,
            "expected_result": original.expected_result,
            "test_data": original.test_data,
            "tags": original.tags,
            "estimated_duration": original.estimated_duration,
            "is_automated": original.is_automated,
            "automation_script": original.automation_script,
            "project_id": project_id or original.project_id,
            "requirement_id": original.requirement_id,
            "test_plan_id": test_plan_id or original.test_plan_id,
            "author_id": original.author_id,
            "parent_id": original.id,  # Указываем родительский тестовый случай
            "version": "1.0.0",  # Новая версия
            "status": TestCaseStatus.DRAFT,  # Всегда начинаем с черновика
        }

        # Создаем новый тестовый случай
        new_test_case = await self.create(db, obj_in=TestCaseCreate(**test_case_data))
        return new_test_case

    async def get_by_tags(
        self,
        db: AsyncSession,
        *,
        tags: List[str],
        project_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[TestCase]:
        """
        Получить тестовые случаи по тегам.

        Args:
            db: Асинхронная сессия базы данных
            tags: Список тегов
            project_id: ID проекта (опционально)
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[TestCase]: Список тестовых случаев
        """
        # Создаем условие для поиска по тегам (JSON contains)
        tag_conditions = []
        for tag in tags:
            tag_conditions.append(TestCase.tags.op("?")(tag))

        query = select(TestCase).where(or_(*tag_conditions))

        if project_id:
            query = query.where(TestCase.project_id == project_id)

        query = query.offset(skip).limit(limit).order_by(TestCase.created_at.desc())

        result = await db.execute(query)
        return result.scalars().all()

    async def update_status(
        self,
        db: AsyncSession,
        *,
        test_case_id: int,
        status: TestCaseStatus,
    ) -> Optional[TestCase]:
        """
        Обновить статус тестового случая.

        Args:
            db: Асинхронная сессия базы данных
            test_case_id: ID тестового случая
            status: Новый статус

        Returns:
            Optional[TestCase]: Обновленный тестовый случай
        """
        test_case = await self.get(db, id=test_case_id)
        if not test_case:
            return None

        update_data = {"status": status}
        return await self.update(db, db_obj=test_case, obj_in=update_data)

    async def get_ready_for_execution(
        self,
        db: AsyncSession,
        *,
        project_id: Optional[int] = None,
        test_plan_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[TestCase]:
        """
        Получить тестовые случаи, готовые к выполнению.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта (опционально)
            test_plan_id: ID плана тестирования (опционально)
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[TestCase]: Список готовых к выполнению тестовых случаев
        """
        query = select(TestCase).where(
            and_(
                TestCase.status.in_([TestCaseStatus.READY, TestCaseStatus.ACTIVE]),
                TestCase.is_active == True,
                TestCase.test_steps.isnot(None),
                TestCase.expected_result.isnot(None),
            )
        )

        if project_id:
            query = query.where(TestCase.project_id == project_id)
        if test_plan_id:
            query = query.where(TestCase.test_plan_id == test_plan_id)

        query = (
            query.offset(skip)
            .limit(limit)
            .order_by(TestCase.priority.desc(), TestCase.created_at.asc())
        )

        result = await db.execute(query)
        return result.scalars().all()


# Создание экземпляра CRUD
test_case = CRUDTestCase(TestCase)
