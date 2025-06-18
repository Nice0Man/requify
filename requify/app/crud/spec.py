from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, desc, func

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
        search_filter = self.model.name.ilike(f"%{search_term}%")

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

    async def get_with_requirements(
        self, db: AsyncSession, *, spec_id: int
    ) -> Optional[Spec]:
        """Get specification with all its requirements"""
        from requify.app.models.requirement import Requirement

        query = (
            select(self.model)
            .where(self.model.id == spec_id)
            .options(
                selectinload(self.model.project), selectinload(self.model.requirements)
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_requirements_count(self, db: AsyncSession, *, spec_id: int) -> int:
        """Get count of requirements for a specification"""
        from requify.app.models.requirement import Requirement

        query = select(func.count(Requirement.id)).where(Requirement.spec_id == spec_id)
        result = await db.execute(query)
        return result.scalar() or 0

    async def get_specs_with_stats(
        self,
        db: AsyncSession,
        *,
        project_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[dict]:
        """Get specifications with requirement statistics"""
        from requify.app.models.requirement import Requirement

        query = select(
            self.model, func.count(Requirement.id).label("requirements_count")
        ).outerjoin(Requirement, self.model.id == Requirement.spec_id)

        if project_id:
            query = query.where(self.model.project_id == project_id)

        query = (
            query.group_by(self.model.id)
            .options(selectinload(self.model.project))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.created_at))
        )

        result = await db.execute(query)
        specs_with_stats = []

        for spec, req_count in result:
            spec_dict = spec.__dict__.copy()
            spec_dict["requirements_count"] = req_count
            specs_with_stats.append(spec_dict)

        return specs_with_stats


spec = CRUDSpec(Spec)
