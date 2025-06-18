from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, desc

from requify.app.crud.base import CRUDBase
from requify.app.models.spec import Spec
from requify.app.schemas.spec import SpecCreate, SpecUpdate


class CRUDSpec(CRUDBase[Spec, SpecCreate, SpecUpdate]):
    async def get_by_project(
        self, db: AsyncSession, *, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[Spec]:
        """Get specifications for a specific project"""
        query = (
            select(self.model)
            .where(self.model.project_id == project_id)
            .options(selectinload(self.model.project))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.created_at))
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_name(
        self, db: AsyncSession, *, name: str, project_id: Optional[int] = None
    ) -> Optional[Spec]:
        """Get specification by name, optionally filtered by project"""
        query = select(self.model).where(self.model.name == name)

        if project_id:
            query = query.where(self.model.project_id == project_id)

        query = query.options(selectinload(self.model.project))
        result = await db.execute(query)
        return result.scalars().first()

    async def search_specs(
        self,
        db: AsyncSession,
        *,
        search_term: str,
        project_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Spec]:
        """Search specifications by name or description"""
        search_filter = or_(
            self.model.name.ilike(f"%{search_term}%"),
            self.model.description.ilike(f"%{search_term}%"),
        )

        query = select(self.model).where(search_filter)

        if project_id:
            query = query.where(self.model.project_id == project_id)

        query = (
            query.options(selectinload(self.model.project))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.created_at))
        )

        result = await db.execute(query)
        return result.scalars().all()


spec = CRUDSpec(Spec)
