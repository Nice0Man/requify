"""
CRUD операции для иерархии ролей (DAG).
"""

from typing import List, Optional, Dict, Any, Set
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, desc, asc, select
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.role_hierarchy import RoleHierarchy, RoleHierarchyCache, InheritanceType
from app.schemas.role_hierarchy import (
    RoleHierarchyCreate,
    RoleHierarchyUpdate,
    RoleHierarchyCacheCreate,
    RoleHierarchyCacheUpdate,
)


class CRUDRoleHierarchy(
    CRUDBase[RoleHierarchy, RoleHierarchyCreate, RoleHierarchyUpdate]
):
    """CRUD операции для иерархии ролей"""

    async def get_by_parent_child(
        self, db: AsyncSession, *, parent_role_id: int, child_role_id: int
    ) -> Optional[RoleHierarchy]:
        """Получить связь наследования по ID родителя и потомка"""
        result = await db.execute(
            select(self.model).where(
                and_(
                    self.model.parent_role_id == parent_role_id,
                    self.model.child_role_id == child_role_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_parent_relationships(
        self, db: AsyncSession, *, role_id: int, active_only: bool = True
    ) -> List[RoleHierarchy]:
        """Получить все связи где роль является родителем"""
        query = select(self.model).where(self.model.parent_role_id == role_id)

        if active_only:
            query = query.where(self.model.is_active == True)

        query = query.options(
            selectinload(self.model.child_role), selectinload(self.model.parent_role)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_child_relationships(
        self, db: AsyncSession, *, role_id: int, active_only: bool = True
    ) -> List[RoleHierarchy]:
        """Получить все связи где роль является потомком"""
        query = select(self.model).where(self.model.child_role_id == role_id)

        if active_only:
            query = query.where(self.model.is_active == True)

        query = query.options(
            selectinload(self.model.child_role), selectinload(self.model.parent_role)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_effective_relationships(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[RoleHierarchy]:
        """Получить все эффективные (активные и в срок) связи наследования"""
        now = datetime.now(timezone.utc)

        query = select(self.model).where(
            and_(
                self.model.is_active == True,
                or_(
                    self.model.effective_from.is_(None),
                    self.model.effective_from <= now,
                ),
                or_(
                    self.model.effective_until.is_(None),
                    self.model.effective_until > now,
                ),
            )
        )

        query = (
            query.options(
                selectinload(self.model.parent_role),
                selectinload(self.model.child_role),
            )
            .order_by(self.model.priority.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_inheritance_type(
        self,
        db: AsyncSession,
        *,
        inheritance_type: InheritanceType,
        skip: int = 0,
        limit: int = 100,
    ) -> List[RoleHierarchy]:
        """Получить связи наследования по типу"""
        query = (
            select(self.model)
            .where(self.model.inheritance_type == inheritance_type)
            .options(
                selectinload(self.model.parent_role),
                selectinload(self.model.child_role),
            )
            .order_by(self.model.priority.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_role_ancestors(
        self, db: AsyncSession, *, role_id: int, max_depth: Optional[int] = None
    ) -> List[int]:
        """
        Получить всех предков роли (рекурсивно).

        Args:
            db: Сессия базы данных
            role_id: ID роли
            max_depth: Максимальная глубина поиска

        Returns:
            Список ID предков
        """
        ancestors = []
        visited = set()
        current_depth = 0

        async def find_parents(current_role_id: int, depth: int):
            if (max_depth and depth >= max_depth) or current_role_id in visited:
                return

            visited.add(current_role_id)

            parent_rels = await self.get_child_relationships(
                db, role_id=current_role_id, active_only=True
            )

            for rel in parent_rels:
                if rel.is_effective and rel.parent_role_id not in ancestors:
                    ancestors.append(rel.parent_role_id)
                    await find_parents(rel.parent_role_id, depth + 1)

        await find_parents(role_id, 0)
        return ancestors

    async def get_role_descendants(
        self, db: AsyncSession, *, role_id: int, max_depth: Optional[int] = None
    ) -> List[int]:
        """
        Получить всех потомков роли (рекурсивно).

        Args:
            db: Сессия базы данных
            role_id: ID роли
            max_depth: Максимальная глубина поиска

        Returns:
            Список ID потомков
        """
        descendants = []
        visited = set()

        async def find_children(current_role_id: int, depth: int):
            if (max_depth and depth >= max_depth) or current_role_id in visited:
                return

            visited.add(current_role_id)

            child_rels = await self.get_parent_relationships(
                db, role_id=current_role_id, active_only=True
            )

            for rel in child_rels:
                if rel.is_effective and rel.child_role_id not in descendants:
                    descendants.append(rel.child_role_id)
                    await find_children(rel.child_role_id, depth + 1)

        await find_children(role_id, 0)
        return descendants

    async def check_cycle(
        self, db: AsyncSession, *, parent_role_id: int, child_role_id: int
    ) -> bool:
        """
        Проверить, создаст ли новая связь цикл в иерархии.

        Args:
            db: Сессия базы данных
            parent_role_id: ID родительской роли
            child_role_id: ID дочерней роли

        Returns:
            True если связь создаст цикл
        """
        # Проверяем, является ли child предком parent
        parent_ancestors = await self.get_role_ancestors(db, role_id=parent_role_id)
        return child_role_id in parent_ancestors

    async def deactivate_relationship(
        self, db: AsyncSession, *, relationship_id: int
    ) -> Optional[RoleHierarchy]:
        """Деактивировать связь наследования"""
        relationship = await self.get(db, id=relationship_id)
        if not relationship:
            return None

        relationship.is_active = False
        await db.commit()
        await db.refresh(relationship)
        return relationship

    async def get_inheritance_conflicts(
        self, db: AsyncSession, *, role_id: int
    ) -> List[Dict[str, Any]]:
        """
        Найти конфликты в наследовании разрешений для роли.

        Args:
            db: Сессия базы данных
            role_id: ID роли

        Returns:
            Список конфликтов с описанием
        """
        conflicts = []

        # Получаем все родительские связи
        parent_rels = await self.get_child_relationships(
            db, role_id=role_id, active_only=True
        )

        # Группируем по типам наследования
        inheritance_groups = {}
        for rel in parent_rels:
            if rel.is_effective:
                itype = rel.inheritance_type
                if itype not in inheritance_groups:
                    inheritance_groups[itype] = []
                inheritance_groups[itype].append(rel)

        # Проверяем конфликты между разными типами наследования
        if len(inheritance_groups) > 1:
            conflicts.append(
                {
                    "type": "mixed_inheritance_types",
                    "description": f"Роль {role_id} имеет родителей с разными типами наследования",
                    "inheritance_types": list(inheritance_groups.keys()),
                    "affected_relationships": [
                        rel.id for rels in inheritance_groups.values() for rel in rels
                    ],
                }
            )

        # Проверяем конфликты приоритетов
        for itype, rels in inheritance_groups.items():
            if len(rels) > 1:
                priorities = [rel.priority for rel in rels]
                if len(set(priorities)) != len(priorities):
                    conflicts.append(
                        {
                            "type": "priority_conflict",
                            "description": f"Несколько связей типа {itype} имеют одинаковый приоритет",
                            "inheritance_type": itype,
                            "affected_relationships": [rel.id for rel in rels],
                            "priorities": priorities,
                        }
                    )

        return conflicts


class CRUDRoleHierarchyCache(
    CRUDBase[RoleHierarchyCache, RoleHierarchyCacheCreate, RoleHierarchyCacheUpdate]
):
    """CRUD операции для кеша иерархии ролей"""

    async def get_by_role_and_type(
        self, db: AsyncSession, *, role_id: int, cache_type: str
    ) -> Optional[RoleHierarchyCache]:
        """Получить кеш по роли и типу"""
        result = await db.execute(
            select(self.model).where(
                and_(
                    self.model.role_id == role_id,
                    self.model.cache_type == cache_type,
                    self.model.is_valid == True,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_valid_cache(
        self, db: AsyncSession, *, role_id: int, cache_type: str
    ) -> Optional[RoleHierarchyCache]:
        """Получить валидный (не истекший) кеш"""
        cache = await self.get_by_role_and_type(
            db, role_id=role_id, cache_type=cache_type
        )

        if cache and not cache.is_expired:
            return cache

        return None

    async def invalidate_role_cache(
        self, db: AsyncSession, *, role_id: int, cache_type: Optional[str] = None
    ) -> int:
        """
        Инвалидировать кеш для роли.

        Args:
            db: Сессия базы данных
            role_id: ID роли
            cache_type: Тип кеша (если None, то все типы)

        Returns:
            Количество инвалидированных записей
        """
        query = select(self.model).where(self.model.role_id == role_id)

        if cache_type:
            query = query.where(self.model.cache_type == cache_type)

        result = await db.execute(query)
        caches = result.scalars().all()

        count = 0
        for cache in caches:
            cache.is_valid = False
            count += 1

        await db.commit()
        return count

    async def cleanup_expired_cache(self, db: AsyncSession) -> int:
        """Очистить истекший кеш"""
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(self.model).where(
                or_(
                    self.model.is_valid == False,
                    and_(
                        self.model.expires_at.isnot(None), self.model.expires_at < now
                    ),
                )
            )
        )

        expired_caches = result.scalars().all()
        count = len(expired_caches)

        for cache in expired_caches:
            await db.delete(cache)

        await db.commit()
        return count

    async def update_cache(
        self,
        db: AsyncSession,
        *,
        role_id: int,
        cache_type: str,
        cache_data: Dict[str, Any],
        expires_in_hours: int = 24,
    ) -> RoleHierarchyCache:
        """
        Обновить или создать кеш для роли.

        Args:
            db: Сессия базы данных
            role_id: ID роли
            cache_type: Тип кеша
            cache_data: Данные для кеширования
            expires_in_hours: Срок действия кеша в часах

        Returns:
            Созданный или обновленный кеш
        """
        # Удаляем старый кеш
        await self.invalidate_role_cache(db, role_id=role_id, cache_type=cache_type)

        # Создаем новый кеш
        expires_at = datetime.now(timezone.utc) + datetime.timedelta(
            hours=expires_in_hours
        )

        cache = RoleHierarchyCache(
            role_id=role_id,
            cache_type=cache_type,
            cache_data=cache_data,
            expires_at=expires_at,
        )

        db.add(cache)
        await db.commit()
        await db.refresh(cache)

        return cache


# Создаем экземпляры CRUD
role_hierarchy = CRUDRoleHierarchy(RoleHierarchy)
role_hierarchy_cache = CRUDRoleHierarchyCache(RoleHierarchyCache)
