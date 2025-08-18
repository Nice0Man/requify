"""
CRUD операции для Enhanced Role System.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, desc, asc, select
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.schemas.enhanced_role import (
    EnhancedRoleCreate,
    EnhancedRoleUpdate,
    UserRoleAssignmentCreate,
    UserRoleAssignmentUpdate,
    RoleScope,
    RoleFilter,
    AssignmentFilter,
)


class CRUDEnhancedRole(CRUDBase[EnhancedRole, EnhancedRoleCreate, EnhancedRoleUpdate]):
    """CRUD операции для расширенных ролей"""

    async def get_by_name(
        self, db: AsyncSession, *, name: str
    ) -> Optional[EnhancedRole]:
        """Получить роль по имени"""
        result = await db.execute(select(self.model).filter(self.model.name == name))
        return result.scalar_one_or_none()

    async def get_by_scope(
        self, db: AsyncSession, *, scope: RoleScope, skip: int = 0, limit: int = 100
    ) -> List[EnhancedRole]:
        """Получить роли по области действия"""
        result = await db.execute(
            select(self.model)
            .filter(self.model.scope == scope.value)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_system_roles(self, db: AsyncSession) -> List[EnhancedRole]:
        """Получить системные роли"""
        result = await db.execute(
            select(self.model)
            .filter(self.model.is_system == True)
            .order_by(self.model.priority.desc())
        )
        return result.scalars().all()

    async def get_assignable_roles(
        self, db: AsyncSession, *, scope: Optional[RoleScope] = None
    ) -> List[EnhancedRole]:
        """Получить роли, которые можно назначать"""
        query = select(self.model).filter(
            and_(self.model.is_active == True, self.model.is_assignable == True)
        )

        if scope:
            query = query.filter(self.model.scope == scope.value)

        query = query.order_by(self.model.priority.desc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_filtered(
        self, db: AsyncSession, *, filters: RoleFilter, skip: int = 0, limit: int = 100
    ) -> List[EnhancedRole]:
        """Получить роли с фильтрацией"""
        query = select(self.model)

        if filters.scope:
            query = query.filter(self.model.scope == filters.scope.value)

        if filters.is_system is not None:
            query = query.filter(self.model.is_system == filters.is_system)

        if filters.is_active is not None:
            query = query.filter(self.model.is_active == filters.is_active)

        if filters.is_assignable is not None:
            query = query.filter(self.model.is_assignable == filters.is_assignable)

        if filters.min_level is not None:
            query = query.filter(self.model.role_level >= filters.min_level)

        if filters.max_level is not None:
            query = query.filter(self.model.role_level <= filters.max_level)

        query = query.order_by(self.model.priority.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def search(
        self,
        db: AsyncSession,
        *,
        query: str,
        scope: Optional[RoleScope] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EnhancedRole]:
        """Поиск ролей по названию и описанию"""
        search_query = select(self.model).filter(
            or_(
                self.model.name.ilike(f"%{query}%"),
                self.model.display_name.ilike(f"%{query}%"),
                self.model.description.ilike(f"%{query}%"),
            )
        )

        if scope:
            search_query = search_query.filter(self.model.scope == scope.value)

        search_query = (
            search_query.order_by(self.model.priority.desc()).offset(skip).limit(limit)
        )
        result = await db.execute(search_query)
        return result.scalars().all()


class CRUDUserRoleAssignment(
    CRUDBase[UserRoleAssignment, UserRoleAssignmentCreate, UserRoleAssignmentUpdate]
):
    """CRUD операции для назначения ролей пользователям"""

    async def get_user_assignments(
        self, db: AsyncSession, *, user_id: int, active_only: bool = True
    ) -> List[UserRoleAssignment]:
        """Получить все назначения ролей пользователя"""
        query = select(self.model).filter(self.model.user_id == user_id)

        if active_only:
            query = query.filter(self.model.is_active == True)

        query = query.options(
            selectinload(self.model.role),
            selectinload(self.model.company),
            selectinload(self.model.department),
            selectinload(self.model.team),
            selectinload(self.model.project),
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_user_assignments_by_context(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        company_id: Optional[int] = None,
        department_id: Optional[int] = None,
        team_id: Optional[int] = None,
        project_id: Optional[int] = None,
        active_only: bool = True,
    ) -> List[UserRoleAssignment]:
        """Получить назначения ролей пользователя в определенном контексте"""
        query = select(self.model).filter(self.model.user_id == user_id)

        if active_only:
            query = query.filter(self.model.is_active == True)

        if company_id is not None:
            query = query.filter(self.model.company_id == company_id)

        if department_id is not None:
            query = query.filter(self.model.department_id == department_id)

        if team_id is not None:
            query = query.filter(self.model.team_id == team_id)

        if project_id is not None:
            query = query.filter(self.model.project_id == project_id)

        query = query.options(selectinload(self.model.role))
        result = await db.execute(query)
        return result.scalars().all()

    async def get_role_assignments(
        self, db: AsyncSession, *, role_id: int, active_only: bool = True
    ) -> List[UserRoleAssignment]:
        """Получить все назначения определенной роли"""
        query = select(self.model).filter(self.model.role_id == role_id)

        if active_only:
            query = query.filter(self.model.is_active == True)

        query = query.options(
            selectinload(self.model.user),
            selectinload(self.model.company),
            selectinload(self.model.department),
            selectinload(self.model.team),
            selectinload(self.model.project),
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_assignments_by_scope(
        self,
        db: AsyncSession,
        *,
        scope: RoleScope,
        context_id: int,
        active_only: bool = True,
    ) -> List[UserRoleAssignment]:
        """Получить назначения ролей в определенной области"""
        query = (
            select(self.model)
            .join(EnhancedRole)
            .filter(EnhancedRole.scope == scope.value)
        )

        if scope == RoleScope.COMPANY:
            query = query.filter(self.model.company_id == context_id)
        elif scope == RoleScope.DEPARTMENT:
            query = query.filter(self.model.department_id == context_id)
        elif scope == RoleScope.TEAM:
            query = query.filter(self.model.team_id == context_id)
        elif scope == RoleScope.PROJECT:
            query = query.filter(self.model.project_id == context_id)

        if active_only:
            query = query.filter(self.model.is_active == True)

        query = query.options(
            selectinload(self.model.role), selectinload(self.model.user)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_filtered(
        self,
        db: AsyncSession,
        *,
        filters: AssignmentFilter,
        skip: int = 0,
        limit: int = 100,
    ) -> List[UserRoleAssignment]:
        """Получить назначения ролей с фильтрацией"""
        query = select(self.model)

        if filters.user_id:
            query = query.filter(self.model.user_id == filters.user_id)

        if filters.role_id:
            query = query.filter(self.model.role_id == filters.role_id)

        if filters.company_id:
            query = query.filter(self.model.company_id == filters.company_id)

        if filters.department_id:
            query = query.filter(self.model.department_id == filters.department_id)

        if filters.team_id:
            query = query.filter(self.model.team_id == filters.team_id)

        if filters.project_id:
            query = query.filter(self.model.project_id == filters.project_id)

        if filters.is_active is not None:
            query = query.filter(self.model.is_active == filters.is_active)

        if filters.scope:
            query = query.join(EnhancedRole).filter(
                EnhancedRole.scope == filters.scope.value
            )

        query = (
            query.options(selectinload(self.model.role), selectinload(self.model.user))
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def has_assignment(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        role_id: int,
        company_id: Optional[int] = None,
        department_id: Optional[int] = None,
        team_id: Optional[int] = None,
        project_id: Optional[int] = None,
    ) -> bool:
        """Проверить есть ли у пользователя назначение роли в контексте"""
        query = select(self.model).filter(
            and_(
                self.model.user_id == user_id,
                self.model.role_id == role_id,
                self.model.is_active == True,
            )
        )

        if company_id:
            query = query.filter(self.model.company_id == company_id)
        else:
            query = query.filter(self.model.company_id.is_(None))

        if department_id:
            query = query.filter(self.model.department_id == department_id)
        else:
            query = query.filter(self.model.department_id.is_(None))

        if team_id:
            query = query.filter(self.model.team_id == team_id)
        else:
            query = query.filter(self.model.team_id.is_(None))

        if project_id:
            query = query.filter(self.model.project_id == project_id)
        else:
            query = query.filter(self.model.project_id.is_(None))

        result = await db.execute(query)
        return result.scalar_one_or_none() is not None

    async def revoke_assignment(
        self,
        db: AsyncSession,
        *,
        assignment_id: int,
        revoked_by: Optional[int] = None,
        reason: Optional[str] = None,
    ) -> Optional[UserRoleAssignment]:
        """Отозвать назначение роли"""
        assignment = await self.get(db, id=assignment_id)
        if not assignment:
            return None

        assignment.revoke(revoked_by=revoked_by, reason=reason)
        await db.commit()
        await db.refresh(assignment)
        return assignment

    async def approve_assignment(
        self, db: AsyncSession, *, assignment_id: int, approved_by: int
    ) -> Optional[UserRoleAssignment]:
        """Одобрить назначение роли"""
        assignment = await self.get(db, id=assignment_id)
        if not assignment:
            return None

        assignment.approve(approved_by=approved_by)
        await db.commit()
        await db.refresh(assignment)
        return assignment

    async def extend_assignment(
        self, db: AsyncSession, *, assignment_id: int, days: int
    ) -> Optional[UserRoleAssignment]:
        """Продлить назначение роли"""
        assignment = await self.get(db, id=assignment_id)
        if not assignment:
            return None

        assignment.extend_expiration(days=days)
        await db.commit()
        await db.refresh(assignment)
        return assignment

    async def get_expired_assignments(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[UserRoleAssignment]:
        """Получить истекшие назначения ролей"""
        query = (
            select(self.model)
            .filter(
                and_(
                    self.model.expires_at.isnot(None),
                    self.model.expires_at < datetime.now(timezone.utc),
                    self.model.is_active == True,
                )
            )
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def cleanup_expired_assignments(self, db: AsyncSession) -> int:
        """Очистить истекшие назначения ролей"""
        expired = await self.get_expired_assignments(db)
        count = 0

        for assignment in expired:
            assignment.is_active = False
            count += 1

        await db.commit()
        return count


# Создаем экземпляры CRUD
enhanced_role = CRUDEnhancedRole(EnhancedRole)
user_role_assignment = CRUDUserRoleAssignment(UserRoleAssignment)
