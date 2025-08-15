"""
Relationship Management Service.

Сервис для управления связями между требованиями,
включая создание, удаление и анализ зависимостей.
"""

from typing import List, Optional, Dict, Any, Set, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_, delete, func, exists
from datetime import datetime
from fastapi import HTTPException, status

from app.models.user import User
from app.models.relationship import Relationship
from app.models.relationship_types import RelationshipType
from app.models.requirement import Requirement
from app.crud.base import CRUDBase
from app.core.constants import Permission
from app.services.permission_service import permission_service
from app.services.activity_service import activity_service, ActivityType
from app.utils.logger import logger


class RelationshipService:
    """
    Сервис для управления связями между требованиями.

    Предоставляет функциональность для:
    - Создания связей между требованиями
    - Получения связей требования
    - Удаления связей
    - Анализа зависимостей
    - Построения матрицы трассировки
    """

    def __init__(self):
        self.relationship_crud = CRUDBase(Relationship)
        self.relationship_type_crud = CRUDBase(RelationshipType)

    async def create_relationship(
        self,
        db: AsyncSession,
        *,
        source_id: int,
        target_id: int,
        relationship_type: str,
        user: User,
    ) -> Relationship:
        """
        Создать связь между требованиями.

        Args:
            db: Сессия базы данных
            source_id: ID исходного требования
            target_id: ID целевого требования
            relationship_type: Тип связи
            user: Текущий пользователь

        Returns:
            Relationship: Созданная связь

        Raises:
            HTTPException: Если нет прав доступа или связь невозможна
        """
        # Проверяем, что требования не одинаковые
        if source_id == target_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create relationship with the same requirement",
            )

        # Проверяем существование требований
        await self._check_requirements_exist(db, source_id, target_id)

        # Проверяем права доступа к обоим требованиям
        await self._check_requirements_permissions(db, user, source_id, target_id)

        # Получаем тип связи
        relationship_type_obj = await self._get_relationship_type(db, relationship_type)

        # Проверяем, не существует ли уже такая связь
        existing_relationship = await self._check_existing_relationship(
            db, source_id, target_id, relationship_type_obj.id
        )

        if existing_relationship:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Relationship already exists",
            )

        # Проверяем на циклические зависимости (для типов зависимостей)
        if relationship_type.lower() in ["depends", "dependency", "parent", "child"]:
            if await self._would_create_cycle(
                db, source_id, target_id, relationship_type_obj.id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This relationship would create a circular dependency",
                )

        # Создаем связь
        relationship_data = {
            "source_id": source_id,
            "target_id": target_id,
            "type_id": relationship_type_obj.id,
        }

        relationship = await self.relationship_crud.create(db, obj_in=relationship_data)

        # Загружаем связанные данные
        await db.refresh(relationship, ["source", "target", "type"])

        # Записываем активность
        try:
            await activity_service.record_relationship_activity(
                db=db,
                relationship=relationship,
                activity_type=ActivityType.RELATIONSHIP_CREATED,
                user_id=user.id,
                metadata={
                    "relationship_type": relationship_type,
                    "source_title": relationship.source.title,
                    "target_title": relationship.target.title,
                },
            )
        except Exception as e:
            logger.warning(f"Failed to record relationship activity: {e}")

        logger.info(
            f"Relationship created: {source_id} -{relationship_type}-> {target_id} by user {user.id}"
        )

        return relationship

    async def get_requirement_relationships(
        self,
        db: AsyncSession,
        *,
        requirement_id: int,
        user: User,
        relationship_types: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Получить все связи требования.

        Args:
            db: Сессия базы данных
            requirement_id: ID требования
            user: Текущий пользователь
            relationship_types: Фильтр по типам связей

        Returns:
            Dict: Словарь с исходящими и входящими связями
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
                detail="Not enough permissions to view requirement relationships",
            )

        # Условие фильтрации по типам
        type_condition = None
        if relationship_types:
            type_ids_query = select(RelationshipType.id).where(
                RelationshipType.name.in_(relationship_types)
            )
            type_ids_result = await db.execute(type_ids_query)
            type_ids = [row[0] for row in type_ids_result.fetchall()]
            if type_ids:
                type_condition = Relationship.type_id.in_(type_ids)

        # Исходящие связи (где requirement является источником)
        outgoing_query = (
            select(Relationship)
            .where(Relationship.source_id == requirement_id)
            .options(joinedload(Relationship.target), joinedload(Relationship.type))
        )
        if type_condition is not None:
            outgoing_query = outgoing_query.where(type_condition)

        outgoing_result = await db.execute(outgoing_query)
        outgoing_relationships = outgoing_result.scalars().all()

        # Входящие связи (где requirement является целью)
        incoming_query = (
            select(Relationship)
            .where(Relationship.target_id == requirement_id)
            .options(joinedload(Relationship.source), joinedload(Relationship.type))
        )
        if type_condition is not None:
            incoming_query = incoming_query.where(type_condition)

        incoming_result = await db.execute(incoming_query)
        incoming_relationships = incoming_result.scalars().all()

        return {
            "requirement_id": requirement_id,
            "outgoing_relationships": outgoing_relationships,
            "incoming_relationships": incoming_relationships,
            "total_outgoing": len(outgoing_relationships),
            "total_incoming": len(incoming_relationships),
        }

    async def delete_relationship(
        self,
        db: AsyncSession,
        *,
        source_id: int,
        target_id: int,
        relationship_type: str,
        user: User,
    ) -> bool:
        """
        Удалить связь между требованиями.

        Args:
            db: Сессия базы данных
            source_id: ID исходного требования
            target_id: ID целевого требования
            relationship_type: Тип связи
            user: Текущий пользователь

        Returns:
            bool: True если удалена успешно
        """
        # Проверяем права доступа к требованиям
        await self._check_requirements_permissions(
            db, user, source_id, target_id, edit=True
        )

        # Получаем тип связи
        relationship_type_obj = await self._get_relationship_type(db, relationship_type)

        # Находим связь
        relationship_query = select(Relationship).where(
            and_(
                Relationship.source_id == source_id,
                Relationship.target_id == target_id,
                Relationship.type_id == relationship_type_obj.id,
            )
        )
        result = await db.execute(relationship_query)
        relationship = result.scalar_one_or_none()

        if not relationship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found"
            )

        # Удаляем связь
        delete_query = delete(Relationship).where(
            and_(
                Relationship.source_id == source_id,
                Relationship.target_id == target_id,
                Relationship.type_id == relationship_type_obj.id,
            )
        )
        await db.execute(delete_query)
        await db.commit()

        logger.info(
            f"Relationship deleted: {source_id} -{relationship_type}-> {target_id} by user {user.id}"
        )

        return True

    async def get_requirement_dependencies(
        self,
        db: AsyncSession,
        *,
        requirement_id: int,
        user: User,
        include_transitive: bool = False,
    ) -> Dict[str, Any]:
        """
        Получить зависимости требования.

        Args:
            db: Сессия базы данных
            requirement_id: ID требования
            user: Текущий пользователь
            include_transitive: Включать транзитивные зависимости

        Returns:
            Dict: Зависимости требования
        """
        await self._check_requirement_permission(db, user, requirement_id)

        # Получаем типы зависимостей
        dependency_types = await self._get_dependency_type_ids(db)

        if include_transitive:
            dependencies = await self._get_transitive_dependencies(
                db, requirement_id, dependency_types
            )
        else:
            dependencies = await self._get_direct_dependencies(
                db, requirement_id, dependency_types
            )

        return {
            "requirement_id": requirement_id,
            "dependencies": dependencies,
            "include_transitive": include_transitive,
        }

    async def get_requirement_dependents(
        self,
        db: AsyncSession,
        *,
        requirement_id: int,
        user: User,
        include_transitive: bool = False,
    ) -> Dict[str, Any]:
        """
        Получить требования, зависящие от данного.

        Args:
            db: Сессия базы данных
            requirement_id: ID требования
            user: Текущий пользователь
            include_transitive: Включать транзитивные зависимости

        Returns:
            Dict: Зависимые требования
        """
        await self._check_requirement_permission(db, user, requirement_id)

        # Получаем типы зависимостей
        dependency_types = await self._get_dependency_type_ids(db)

        if include_transitive:
            dependents = await self._get_transitive_dependents(
                db, requirement_id, dependency_types
            )
        else:
            dependents = await self._get_direct_dependents(
                db, requirement_id, dependency_types
            )

        return {
            "requirement_id": requirement_id,
            "dependents": dependents,
            "include_transitive": include_transitive,
        }

    async def get_trace_matrix(
        self,
        db: AsyncSession,
        *,
        user: User,
        project_id: Optional[int] = None,
        relationship_types: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Построить матрицу трассировки.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            project_id: Фильтр по проекту
            relationship_types: Типы связей для включения

        Returns:
            Dict: Матрица трассировки
        """
        # TODO: Добавить проверку прав доступа к проекту

        # Получаем требования
        requirements_query = select(Requirement).options(
            selectinload(Requirement.project)
        )
        if project_id:
            requirements_query = requirements_query.where(
                Requirement.project_id == project_id
            )

        requirements_result = await db.execute(requirements_query)
        requirements = requirements_result.scalars().all()

        # Получаем все связи между этими требованиями
        requirement_ids = [req.id for req in requirements]

        relationships_query = (
            select(Relationship)
            .where(
                and_(
                    Relationship.source_id.in_(requirement_ids),
                    Relationship.target_id.in_(requirement_ids),
                )
            )
            .options(joinedload(Relationship.type))
        )

        if relationship_types:
            type_ids_query = select(RelationshipType.id).where(
                RelationshipType.name.in_(relationship_types)
            )
            type_ids_result = await db.execute(type_ids_query)
            type_ids = [row[0] for row in type_ids_result.fetchall()]
            if type_ids:
                relationships_query = relationships_query.where(
                    Relationship.type_id.in_(type_ids)
                )

        relationships_result = await db.execute(relationships_query)
        relationships = relationships_result.scalars().all()

        # Строим матрицу
        matrix = {}
        for req in requirements:
            matrix[req.id] = {"requirement": req, "relationships": {}}

        for rel in relationships:
            if rel.source_id not in matrix[rel.target_id]["relationships"]:
                matrix[rel.target_id]["relationships"][rel.source_id] = []
            matrix[rel.target_id]["relationships"][rel.source_id].append(rel.type.name)

        return {
            "project_id": project_id,
            "requirements": requirements,
            "matrix": matrix,
            "total_requirements": len(requirements),
            "total_relationships": len(relationships),
        }

    async def _check_requirements_exist(
        self, db: AsyncSession, source_id: int, target_id: int
    ) -> None:
        """Проверить существование требований."""
        source_exists = await db.execute(
            select(exists().where(Requirement.id == source_id))
        )
        target_exists = await db.execute(
            select(exists().where(Requirement.id == target_id))
        )

        if not source_exists.scalar():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source requirement {source_id} not found",
            )

        if not target_exists.scalar():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target requirement {target_id} not found",
            )

    async def _check_requirements_permissions(
        self,
        db: AsyncSession,
        user: User,
        source_id: int,
        target_id: int,
        edit: bool = False,
    ) -> None:
        """Проверить права доступа к требованиям."""
        permission = (
            Permission.EDIT_REQUIREMENT if edit else Permission.VIEW_REQUIREMENT
        )

        has_source_permission = await permission_service.check_permission(
            user=user, permission=permission, resource_id=source_id, db=db
        )

        has_target_permission = await permission_service.check_permission(
            user=user, permission=permission, resource_id=target_id, db=db
        )

        if not has_source_permission or not has_target_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage relationships for these requirements",
            )

    async def _check_requirement_permission(
        self, db: AsyncSession, user: User, requirement_id: int
    ) -> None:
        """Проверить права доступа к требованию."""
        has_permission = await permission_service.check_permission(
            user=user,
            permission=Permission.VIEW_REQUIREMENT,
            resource_id=requirement_id,
            db=db,
        )

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view requirement relationships",
            )

    async def _get_relationship_type(
        self, db: AsyncSession, relationship_type: str
    ) -> RelationshipType:
        """Получить тип связи по имени."""
        type_query = select(RelationshipType).where(
            RelationshipType.name == relationship_type
        )
        result = await db.execute(type_query)
        relationship_type_obj = result.scalar_one_or_none()

        if not relationship_type_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown relationship type: {relationship_type}",
            )

        return relationship_type_obj

    async def _check_existing_relationship(
        self, db: AsyncSession, source_id: int, target_id: int, type_id: int
    ) -> Optional[Relationship]:
        """Проверить существование связи."""
        existing_query = select(Relationship).where(
            and_(
                Relationship.source_id == source_id,
                Relationship.target_id == target_id,
                Relationship.type_id == type_id,
            )
        )
        result = await db.execute(existing_query)
        return result.scalar_one_or_none()

    async def _would_create_cycle(
        self, db: AsyncSession, source_id: int, target_id: int, type_id: int
    ) -> bool:
        """Проверить, создаст ли новая связь циклическую зависимость."""
        # Простая проверка: есть ли уже путь от target к source
        # В более сложной реализации можно использовать алгоритм поиска в глубину

        # Для простоты проверим только прямую обратную связь
        reverse_query = select(Relationship).where(
            and_(
                Relationship.source_id == target_id,
                Relationship.target_id == source_id,
                Relationship.type_id == type_id,
            )
        )
        result = await db.execute(reverse_query)
        return result.scalar_one_or_none() is not None

    async def _get_dependency_type_ids(self, db: AsyncSession) -> List[int]:
        """Получить ID типов зависимостей."""
        dependency_names = ["depends", "dependency", "parent", "child", "prerequisite"]
        query = select(RelationshipType.id).where(
            RelationshipType.name.in_(dependency_names)
        )
        result = await db.execute(query)
        return [row[0] for row in result.fetchall()]

    async def _get_direct_dependencies(
        self, db: AsyncSession, requirement_id: int, dependency_types: List[int]
    ) -> List[Requirement]:
        """Получить прямые зависимости."""
        query = (
            select(Requirement)
            .join(Relationship, Requirement.id == Relationship.target_id)
            .where(
                and_(
                    Relationship.source_id == requirement_id,
                    Relationship.type_id.in_(dependency_types),
                )
            )
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def _get_direct_dependents(
        self, db: AsyncSession, requirement_id: int, dependency_types: List[int]
    ) -> List[Requirement]:
        """Получить прямых зависимых."""
        query = (
            select(Requirement)
            .join(Relationship, Requirement.id == Relationship.source_id)
            .where(
                and_(
                    Relationship.target_id == requirement_id,
                    Relationship.type_id.in_(dependency_types),
                )
            )
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def _get_transitive_dependencies(
        self, db: AsyncSession, requirement_id: int, dependency_types: List[int]
    ) -> List[Requirement]:
        """Получить транзитивные зависимости с помощью итеративного алгоритма."""
        visited = set()
        all_dependencies = []
        queue = [requirement_id]

        while queue:
            current_id = queue.pop(0)
            if current_id in visited:
                continue

            visited.add(current_id)

            # Получаем прямые зависимости для текущего требования
            direct_deps = await self._get_direct_dependencies(
                db, current_id, dependency_types
            )

            for dep in direct_deps:
                if dep.id not in visited:
                    all_dependencies.append(dep)
                    queue.append(dep.id)

        # Удаляем дубликаты, сохраняя порядок
        seen = set()
        unique_dependencies = []
        for dep in all_dependencies:
            if dep.id not in seen:
                seen.add(dep.id)
                unique_dependencies.append(dep)

        return unique_dependencies

    async def _get_transitive_dependents(
        self, db: AsyncSession, requirement_id: int, dependency_types: List[int]
    ) -> List[Requirement]:
        """Получить транзитивных зависимых с помощью итеративного алгоритма."""
        visited = set()
        all_dependents = []
        queue = [requirement_id]

        while queue:
            current_id = queue.pop(0)
            if current_id in visited:
                continue

            visited.add(current_id)

            # Получаем прямых зависимых для текущего требования
            direct_deps = await self._get_direct_dependents(
                db, current_id, dependency_types
            )

            for dep in direct_deps:
                if dep.id not in visited:
                    all_dependents.append(dep)
                    queue.append(dep.id)

        # Удаляем дубликаты, сохраняя порядок
        seen = set()
        unique_dependents = []
        for dep in all_dependents:
            if dep.id not in seen:
                seen.add(dep.id)
                unique_dependents.append(dep)

        return unique_dependents

    async def get_all_relationships_for_admin(
        self,
        db: AsyncSession,
        *,
        user: User,
        page: int = 1,
        size: int = 20,
        relationship_types: Optional[List[str]] = None,
        project_id: Optional[int] = None,
        source_id: Optional[int] = None,
        target_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Получить все отношения для администраторов.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь (должен быть администратором)
            page: Номер страницы
            size: Размер страницы
            relationship_types: Фильтр по типам отношений
            project_id: Фильтр по проекту
            source_id: Фильтр по исходному требованию
            target_id: Фильтр по целевому требованию

        Returns:
            Dict: Отношения с пагинацией
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

        # Строим условия фильтрации
        conditions = []

        if relationship_types:
            type_ids_query = select(RelationshipType.id).where(
                RelationshipType.name.in_(relationship_types)
            )
            type_ids_result = await db.execute(type_ids_query)
            type_ids = [row[0] for row in type_ids_result.fetchall()]
            if type_ids:
                conditions.append(Relationship.type_id.in_(type_ids))

        if source_id:
            conditions.append(Relationship.source_id == source_id)

        if target_id:
            conditions.append(Relationship.target_id == target_id)

        if project_id:
            # Фильтруем по проекту через требования
            source_project_condition = (
                select(Requirement.id)
                .where(
                    and_(
                        Requirement.id == Relationship.source_id,
                        Requirement.project_id == project_id,
                    )
                )
                .exists()
            )
            conditions.append(source_project_condition)

        # Подсчитываем общее количество
        count_query = select(func.count(Relationship.source_id))
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Получаем отношения с пагинацией
        offset = (page - 1) * size
        query = (
            select(Relationship)
            .options(
                joinedload(Relationship.source),
                joinedload(Relationship.target),
                joinedload(Relationship.type),
            )
            .order_by(desc(Relationship.created_at))
            .offset(offset)
            .limit(size)
        )

        if conditions:
            query = query.where(and_(*conditions))

        result = await db.execute(query)
        relationships = result.scalars().all()

        return {
            "relationships": relationships,
            "total": total,
            "page": page,
            "pages": (total + size - 1) // size,
            "size": size,
        }


# Создаем экземпляр сервиса
relationship_service = RelationshipService()
