"""
CRUD операции для спецификаций.

Этот модуль предоставляет базовые операции создания, чтения, обновления
и удаления спецификаций, а также специализированные методы для работы
с документами и связанными требованиями.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import and_, or_, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.future import select

from app.crud.base import CRUDBase
from app.models.specification import Specification, specification_requirements
from app.models.requirement import Requirement
from app.schemas.specification import (
    SpecificationCreate,
    SpecificationUpdate,
    SpecificationStatus,
)


class CRUDSpecification(
    CRUDBase[Specification, SpecificationCreate, SpecificationUpdate]
):
    """CRUD операции для спецификаций"""

    async def get_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Specification]:
        """
        Получение спецификаций по проекту.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            status: Фильтр по статусу
            search: Поисковый запрос

        Returns:
            List[Specification]: Список спецификаций
        """
        query = select(Specification).where(Specification.project_id == project_id)

        if status:
            query = query.where(Specification.status == status)

        if search:
            search_filter = or_(
                Specification.title.ilike(f"%{search}%"),
                Specification.description.ilike(f"%{search}%"),
                Specification.version.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        query = query.offset(skip).limit(limit).order_by(desc(Specification.created_at))
        result = await db.execute(query)
        return result.scalars().all()

    async def get_with_requirements(
        self, db: AsyncSession, *, id: int
    ) -> Optional[Specification]:
        """
        Получение спецификации с загруженными требованиями.

        Args:
            db: Асинхронная сессия базы данных
            id: ID спецификации

        Returns:
            Optional[Specification]: Спецификация с требованиями или None
        """
        query = (
            select(Specification)
            .options(selectinload(Specification.requirements))
            .where(Specification.id == id)
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_status(
        self,
        db: AsyncSession,
        *,
        status: str,
        project_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Specification]:
        """
        Получение спецификаций по статусу.

        Args:
            db: Асинхронная сессия базы данных
            status: Статус спецификации
            project_id: Опциональный фильтр по проекту
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[Specification]: Список спецификаций
        """
        query = select(Specification).where(Specification.status == status)

        if project_id:
            query = query.where(Specification.project_id == project_id)

        query = query.offset(skip).limit(limit).order_by(desc(Specification.updated_at))
        result = await db.execute(query)
        return result.scalars().all()

    async def search_specifications(
        self,
        db: AsyncSession,
        *,
        search_query: str,
        project_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Specification]:
        """
        Поиск спецификаций по тексту.

        Args:
            db: Асинхронная сессия базы данных
            search_query: Поисковый запрос
            project_id: Опциональный фильтр по проекту
            status: Опциональный фильтр по статусу
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[Specification]: Список найденных спецификаций
        """
        search_filter = or_(
            Specification.title.ilike(f"%{search_query}%"),
            Specification.description.ilike(f"%{search_query}%"),
            Specification.content.ilike(f"%{search_query}%"),
            Specification.version.ilike(f"%{search_query}%"),
        )

        query = select(Specification).where(search_filter)

        if project_id:
            query = query.where(Specification.project_id == project_id)

        if status:
            query = query.where(Specification.status == status)

        query = query.offset(skip).limit(limit).order_by(desc(Specification.updated_at))
        result = await db.execute(query)
        return result.scalars().all()

    async def count_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        status: Optional[str] = None,
    ) -> int:
        """
        Подсчёт спецификаций по проекту.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта
            status: Опциональный фильтр по статусу

        Returns:
            int: Количество спецификаций
        """
        query = select(func.count(Specification.id)).where(
            Specification.project_id == project_id
        )

        if status:
            query = query.where(Specification.status == status)

        result = await db.execute(query)
        return result.scalar() or 0

    async def get_statistics(
        self,
        db: AsyncSession,
        *,
        project_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Получение статистики по спецификациям.

        Args:
            db: Асинхронная сессия базы данных
            project_id: Опциональный фильтр по проекту

        Returns:
            Dict[str, Any]: Статистика спецификаций
        """
        query = select(
            Specification.status, func.count(Specification.id).label("count")
        )

        if project_id:
            query = query.where(Specification.project_id == project_id)

        query = query.group_by(Specification.status)
        result = await db.execute(query)

        statistics = {
            "total": 0,
            "by_status": {},
        }

        for row in result:
            statistics["by_status"][row.status] = row.count
            statistics["total"] += row.count

        return statistics

    async def get_latest_version(
        self,
        db: AsyncSession,
        *,
        project_id: int,
        title: str,
    ) -> Optional[Specification]:
        """
        Получение последней версии спецификации.

        Args:
            db: Асинхронная сессия базы данных
            project_id: ID проекта
            title: Название спецификации

        Returns:
            Optional[Specification]: Последняя версия спецификации или None
        """
        query = (
            select(Specification)
            .where(
                and_(
                    Specification.project_id == project_id, Specification.title == title
                )
            )
            .order_by(desc(Specification.version_number))
            .limit(1)
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def update_status(
        self,
        db: AsyncSession,
        *,
        id: int,
        status: str,
        updated_by: int,
    ) -> Optional[Specification]:
        """
        Обновление статуса спецификации.

        Args:
            db: Асинхронная сессия базы данных
            id: ID спецификации
            status: Новый статус
            updated_by: ID пользователя, обновляющего статус

        Returns:
            Optional[Specification]: Обновлённая спецификация или None
        """
        specification = await self.get(db, id=id)
        if not specification:
            return None

        specification.status = status
        specification.updated_by = updated_by

        db.add(specification)
        await db.commit()
        await db.refresh(specification)
        return specification

    async def add_requirements_to_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        requirement_ids: List[int],
        order_start: int = 0,
    ) -> None:
        """
        Привязать требования к спецификации.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            requirement_ids: Список ID требований для привязки
            order_start: Начальный порядковый номер для требований
        """
        from sqlalchemy import insert
        from datetime import datetime, UTC

        # Проверяем, что все требования существуют
        stmt = select(Requirement.id).where(Requirement.id.in_(requirement_ids))
        result = await db.execute(stmt)
        existing_ids = {row[0] for row in result.fetchall()}

        # Фильтруем только существующие требования
        valid_requirement_ids = [
            req_id for req_id in requirement_ids if req_id in existing_ids
        ]

        if not valid_requirement_ids:
            return

        # Проверяем, какие требования уже привязаны к спецификации
        stmt = select(specification_requirements.c.requirement_id).where(
            specification_requirements.c.specification_id == specification_id
        )
        result = await db.execute(stmt)
        already_linked = {row[0] for row in result.fetchall()}

        # Фильтруем только новые требования
        new_requirement_ids = [
            req_id for req_id in valid_requirement_ids if req_id not in already_linked
        ]

        if not new_requirement_ids:
            return

        # Создаем записи в association table
        insert_data = []
        for i, req_id in enumerate(new_requirement_ids):
            insert_data.append(
                {
                    "specification_id": specification_id,
                    "requirement_id": req_id,
                    "order_index": order_start + i,
                    "created_at": datetime.now(UTC),
                }
            )

        if insert_data:
            stmt = insert(specification_requirements).values(insert_data)
            await db.execute(stmt)
            await db.commit()

    async def remove_requirements_from_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        requirement_ids: List[int],
    ) -> None:
        """
        Отвязать требования от спецификации.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            requirement_ids: Список ID требований для отвязки
        """
        from sqlalchemy import delete

        stmt = delete(specification_requirements).where(
            and_(
                specification_requirements.c.specification_id == specification_id,
                specification_requirements.c.requirement_id.in_(requirement_ids),
            )
        )
        await db.execute(stmt)
        await db.commit()

    async def reorder_requirements_in_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        requirement_order: List[int],
    ) -> None:
        """
        Изменить порядок требований в спецификации.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            requirement_order: Список ID требований в новом порядке
        """
        from sqlalchemy import update

        for i, req_id in enumerate(requirement_order):
            stmt = (
                update(specification_requirements)
                .where(
                    and_(
                        specification_requirements.c.specification_id
                        == specification_id,
                        specification_requirements.c.requirement_id == req_id,
                    )
                )
                .values(order_index=i)
            )
            await db.execute(stmt)

        await db.commit()

    async def get_specification_requirements(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Requirement]:
        """
        Получить требования спецификации с учетом порядка.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[Requirement]: Упорядоченный список требований
        """
        stmt = (
            select(Requirement)
            .join(
                specification_requirements,
                Requirement.id == specification_requirements.c.requirement_id,
            )
            .where(specification_requirements.c.specification_id == specification_id)
            .order_by(specification_requirements.c.order_index)
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def create_with_requirements(
        self,
        db: AsyncSession,
        *,
        obj_in: SpecificationCreate,
        requirement_ids: Optional[List[int]] = None,
    ) -> Specification:
        """
        Создание спецификации с привязкой требований.

        Args:
            db: Асинхронная сессия базы данных
            obj_in: Данные для создания спецификации
            requirement_ids: Список ID требований для привязки

        Returns:
            Specification: Созданная спецификация
        """
        specification = await self.create(db, obj_in=obj_in)

        if requirement_ids:
            # Привязываем требования к спецификации
            await self.add_requirements_to_specification(
                db, specification_id=specification.id, requirement_ids=requirement_ids
            )

            # Обновляем объект спецификации с загруженными требованиями
            await db.refresh(specification, ["requirements"])

        return specification

    async def duplicate_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        new_title: str,
        copy_requirements: bool = True,
    ) -> Specification:
        """
        Дублировать спецификацию.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID исходной спецификации
            new_title: Название новой спецификации
            copy_requirements: Копировать ли требования

        Returns:
            Specification: Новая спецификация
        """
        # Получаем исходную спецификацию
        original = await self.get(db, id=specification_id)
        if not original:
            raise ValueError(f"Specification with id {specification_id} not found")

        # Создаем данные для новой спецификации
        spec_data = {
            "title": new_title,
            "description": original.description,
            "type": original.type,
            "content": original.content,
            "template_config": original.template_config,
            "export_formats": original.export_formats,
            "auto_update": original.auto_update,
            "project_id": original.project_id,
            "release_id": original.release_id,
            "author_id": original.author_id,
            "version": "0.0.1",  # Новая версия
            "status": "draft",  # Всегда начинаем с черновика
        }

        # Создаем новую спецификацию
        from app.schemas.specification import SpecificationCreate

        new_spec = await self.create(db, obj_in=SpecificationCreate(**spec_data))

        # Копируем требования если нужно
        if copy_requirements and original.requirements:
            requirement_ids = [req.id for req in original.requirements]
            await self.add_requirements_to_specification(
                db, specification_id=new_spec.id, requirement_ids=requirement_ids
            )
            await db.refresh(new_spec, ["requirements"])

        return new_spec

    async def get_specifications_by_requirements(
        self,
        db: AsyncSession,
        *,
        requirement_ids: List[int],
        skip: int = 0,
        limit: int = 100,
    ) -> List[Specification]:
        """
        Получить спецификации, содержащие указанные требования.

        Args:
            db: Асинхронная сессия базы данных
            requirement_ids: Список ID требований
            skip: Количество записей для пропуска
            limit: Максимальное количество записей

        Returns:
            List[Specification]: Список спецификаций
        """
        stmt = (
            select(Specification)
            .join(
                specification_requirements,
                Specification.id == specification_requirements.c.specification_id,
            )
            .where(specification_requirements.c.requirement_id.in_(requirement_ids))
            .distinct()
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_specification_stats(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
    ) -> Dict[str, Any]:
        """
        Получить статистику спецификации.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации

        Returns:
            Dict[str, Any]: Статистика спецификации
        """
        # Получаем количество требований
        stmt = select(func.count(specification_requirements.c.requirement_id)).where(
            specification_requirements.c.specification_id == specification_id
        )
        result = await db.execute(stmt)
        requirements_count = result.scalar() or 0

        # Получаем статистику по статусам требований
        stmt = (
            select(Requirement.status_id, func.count(Requirement.id).label("count"))
            .join(
                specification_requirements,
                Requirement.id == specification_requirements.c.requirement_id,
            )
            .where(specification_requirements.c.specification_id == specification_id)
            .group_by(Requirement.status_id)
        )
        result = await db.execute(stmt)
        status_stats = {row.status_id: row.count for row in result.fetchall()}

        # Получаем статистику по типам требований
        stmt = (
            select(Requirement.type_id, func.count(Requirement.id).label("count"))
            .join(
                specification_requirements,
                Requirement.id == specification_requirements.c.requirement_id,
            )
            .where(specification_requirements.c.specification_id == specification_id)
            .group_by(Requirement.type_id)
        )
        result = await db.execute(stmt)
        type_stats = {row.type_id: row.count for row in result.fetchall()}

        return {
            "requirements_count": requirements_count,
            "status_distribution": status_stats,
            "type_distribution": type_stats,
        }

    async def generate_specification_content(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        template: Optional[str] = None,
    ) -> str:
        """
        Сгенерировать содержимое спецификации на основе требований.

        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            template: Шаблон для генерации (опционально)

        Returns:
            str: Сгенерированное содержимое
        """
        # Получаем спецификацию с требованиями
        spec = await self.get(db, id=specification_id)
        if not spec:
            raise ValueError(f"Specification with id {specification_id} not found")

        # Получаем требования в правильном порядке
        requirements = await self.get_specification_requirements(
            db, specification_id=specification_id
        )

        # Базовый шаблон, если не предоставлен
        if not template:
            template = """
# {title}

## Описание
{description}

## Требования

{requirements_section}

## Заключение
Данная спецификация содержит {requirements_count} требований.
"""

        # Генерируем секцию требований
        requirements_section = ""
        for i, req in enumerate(requirements, 1):
            requirements_section += f"""
### {i}. {req.title}

{req.description or 'Описание отсутствует'}

**Тип:** {req.type.name if req.type else 'Не указан'}
**Приоритет:** {req.priority.name if req.priority else 'Не указан'}
**Статус:** {req.status.name if req.status else 'Не указан'}

---
"""

        # Заполняем шаблон
        content = template.format(
            title=spec.title,
            description=spec.description or "Описание отсутствует",
            requirements_section=requirements_section.strip(),
            requirements_count=len(requirements),
        )

        return content.strip()


# Создание экземпляра CRUD
specification = CRUDSpecification(Specification)
