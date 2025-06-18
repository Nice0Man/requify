from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, case

from requify.app.crud.base import CRUDBase
from requify.app.models.test_result import TestResult
from requify.app.schemas.test_result import TestResultCreate, TestResultUpdate


class CRUDTestResult(CRUDBase[TestResult, TestResultCreate, TestResultUpdate]):
    async def get_by_requirement(
        self, db: AsyncSession, *, requirement_id: int, skip: int = 0, limit: int = 100
    ) -> List[TestResult]:
        """Get test results for a specific requirement"""
        query = (
            select(self.model)
            .where(self.model.requirement_id == requirement_id)
            .options(selectinload(self.model.requirement))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.completed_at), desc(self.model.created_at))
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[TestResult]:
        """Get test results by status"""
        query = (
            select(self.model)
            .where(self.model.status == status)
            .options(selectinload(self.model.requirement))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.completed_at), desc(self.model.created_at))
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_test_summary(
        self,
        db: AsyncSession,
        *,
        requirement_id: Optional[int] = None,
        project_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get test execution summary with statistics"""
        from requify.app.models.requirement import Requirement
        from requify.app.models.project import Project

        query = select(
            func.count(self.model.id).label("total_tests"),
            func.sum(case((self.model.status == "passed", 1), else_=0)).label(
                "passed_tests"
            ),
            func.sum(case((self.model.status == "failed", 1), else_=0)).label(
                "failed_tests"
            ),
            func.sum(case((self.model.status == "blocked", 1), else_=0)).label(
                "blocked_tests"
            ),
        )

        if requirement_id:
            query = query.where(self.model.requirement_id == requirement_id)
        elif project_id:
            query = query.join(
                Requirement, self.model.requirement_id == Requirement.id
            ).where(Requirement.project_id == project_id)

        result = await db.execute(query)
        row = result.first()

        return {
            "total_tests": row.total_tests or 0,
            "passed_tests": row.passed_tests or 0,
            "failed_tests": row.failed_tests or 0,
            "blocked_tests": row.blocked_tests or 0,
            "pass_rate": round(
                (row.passed_tests or 0) / max(row.total_tests or 1, 1) * 100, 2
            ),
        }


test_result = CRUDTestResult(TestResult)
