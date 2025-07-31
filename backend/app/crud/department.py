"""
CRUD операции для модели Department.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, func, desc, asc

from app.crud.base import CRUDBase
from app.models.department import Department
from app.models.team import Team
from app.models.project import Project
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class CRUDDepartment(CRUDBase[Department, DepartmentCreate, DepartmentUpdate]):
    """CRUD операции для департаментов"""

    def get_by_company(
        self,
        db: Session,
        *,
        company_id: int,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False,
    ) -> List[Department]:
        """Получить департаменты компании"""
        query = db.query(self.model).filter(self.model.company_id == company_id)

        if not include_inactive:
            query = query.filter(self.model.is_active == True)

        return query.offset(skip).limit(limit).all()

    def get_by_slug(
        self, db: Session, *, company_id: int, slug: str
    ) -> Optional[Department]:
        """Получить департамент по slug в рамках компании"""
        return (
            db.query(self.model)
            .filter(and_(self.model.company_id == company_id, self.model.slug == slug))
            .first()
        )

    def get_hierarchy(
        self, db: Session, *, company_id: int, parent_id: Optional[int] = None
    ) -> List[Department]:
        """Получить иерархию департаментов"""
        query = db.query(self.model).filter(self.model.company_id == company_id)

        if parent_id is None:
            # Корневые департаменты
            query = query.filter(self.model.parent_id.is_(None))
        else:
            # Дочерние департаменты
            query = query.filter(self.model.parent_id == parent_id)

        return query.order_by(self.model.name).all()

    def get_with_children(
        self, db: Session, *, department_id: int
    ) -> Optional[Department]:
        """Получить департамент с дочерними департаментами"""
        return (
            db.query(self.model)
            .filter(self.model.id == department_id)
            .options(selectinload(self.model.children))
            .first()
        )

    def get_root_departments(self, db: Session, *, company_id: int) -> List[Department]:
        """Получить корневые департаменты компании"""
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.company_id == company_id, self.model.parent_id.is_(None)
                )
            )
            .order_by(self.model.name)
            .all()
        )

    def create_with_company(
        self, db: Session, *, obj_in: DepartmentCreate, company_id: int
    ) -> Department:
        """Создать департамент с привязкой к компании"""
        db_obj = self.model(
            company_id=company_id, **obj_in.dict(exclude={"company_id"})
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_head(
        self, db: Session, *, head_id: int, company_id: Optional[int] = None
    ) -> List[Department]:
        """Получить департаменты по руководителю"""
        query = db.query(self.model).filter(self.model.head_id == head_id)

        if company_id:
            query = query.filter(self.model.company_id == company_id)

        return query.all()

    def get_statistics(self, db: Session, *, department_id: int) -> Dict[str, Any]:
        """Получить статистику департамента"""
        department = self.get(db, id=department_id)
        if not department:
            return {}

        # Количество команд
        teams_count = (
            db.query(func.count(Team.id))
            .filter(Team.department_id == department_id)
            .scalar()
        )

        # Количество проектов
        projects_count = (
            db.query(func.count(Project.id))
            .filter(Project.department_id == department_id)
            .scalar()
        )

        # Активные проекты
        active_projects = (
            db.query(func.count(Project.id))
            .filter(
                and_(
                    Project.department_id == department_id,
                    Project.status.in_(["active", "in_progress"]),
                )
            )
            .scalar()
        )

        # Дочерние департаменты
        children_count = (
            db.query(func.count(Department.id))
            .filter(Department.parent_id == department_id)
            .scalar()
        )

        return {
            "department_id": department_id,
            "teams_count": teams_count,
            "projects_count": projects_count,
            "active_projects": active_projects,
            "children_count": children_count,
            "employee_count": department.employee_count,
            "budget_allocated": department.budget_allocated,
        }

    def search(
        self,
        db: Session,
        *,
        company_id: int,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Department]:
        """Поиск департаментов по названию и описанию"""
        search_query = db.query(self.model).filter(
            and_(
                self.model.company_id == company_id,
                or_(
                    self.model.name.ilike(f"%{query}%"),
                    self.model.description.ilike(f"%{query}%"),
                    self.model.slug.ilike(f"%{query}%"),
                ),
            )
        )

        return search_query.offset(skip).limit(limit).all()

    def get_by_type(
        self,
        db: Session,
        *,
        company_id: int,
        department_type: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Department]:
        """Получить департаменты по типу"""
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.company_id == company_id,
                    self.model.type == department_type,
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_employee_count(
        self, db: Session, *, department_id: int
    ) -> Optional[Department]:
        """Обновить количество сотрудников в департаменте"""
        department = self.get(db, id=department_id)
        if not department:
            return None

        # Подсчитать сотрудников через команды
        employee_count = (
            db.query(func.count(func.distinct(Team.members)))
            .filter(Team.department_id == department_id)
            .scalar()
            or 0
        )

        department.employee_count = employee_count
        db.commit()
        db.refresh(department)
        return department

    def update_team_count(
        self, db: Session, *, department_id: int
    ) -> Optional[Department]:
        """Обновить количество команд в департаменте"""
        department = self.get(db, id=department_id)
        if not department:
            return None

        team_count = (
            db.query(func.count(Team.id))
            .filter(Team.department_id == department_id)
            .scalar()
            or 0
        )

        department.team_count = team_count
        db.commit()
        db.refresh(department)
        return department

    def can_delete(self, db: Session, *, department_id: int) -> Dict[str, Any]:
        """Проверить можно ли удалить департамент"""
        department = self.get(db, id=department_id)
        if not department:
            return {"can_delete": False, "reason": "Department not found"}

        # Проверить дочерние департаменты
        children_count = (
            db.query(func.count(Department.id))
            .filter(Department.parent_id == department_id)
            .scalar()
        )

        if children_count > 0:
            return {
                "can_delete": False,
                "reason": f"Department has {children_count} child departments",
            }

        # Проверить команды
        teams_count = (
            db.query(func.count(Team.id))
            .filter(Team.department_id == department_id)
            .scalar()
        )

        if teams_count > 0:
            return {
                "can_delete": False,
                "reason": f"Department has {teams_count} teams",
            }

        # Проверить проекты
        projects_count = (
            db.query(func.count(Project.id))
            .filter(Project.department_id == department_id)
            .scalar()
        )

        if projects_count > 0:
            return {
                "can_delete": False,
                "reason": f"Department has {projects_count} projects",
            }

        return {"can_delete": True, "reason": None}

    def get_tree(self, db: Session, *, company_id: int) -> List[Dict[str, Any]]:
        """Получить полное дерево департаментов компании"""

        def build_tree(parent_id: Optional[int] = None) -> List[Dict[str, Any]]:
            departments = self.get_hierarchy(
                db, company_id=company_id, parent_id=parent_id
            )

            result = []
            for dept in departments:
                dept_data = {
                    "id": dept.id,
                    "name": dept.name,
                    "slug": dept.slug,
                    "type": dept.type,
                    "is_active": dept.is_active,
                    "employee_count": dept.employee_count,
                    "team_count": dept.team_count,
                    "children": build_tree(dept.id),
                }
                result.append(dept_data)

            return result

        return build_tree()


department = CRUDDepartment(Department)
