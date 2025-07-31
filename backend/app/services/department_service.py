"""
Сервис для бизнес-логики департаментов.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.crud.department import department as department_crud
from app.crud.user import user as user_crud
from app.crud.company import company as company_crud
from app.models.department import Department
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentHierarchy,
    DepartmentStats,
)


class DepartmentService:
    """Сервис для работы с департаментами"""

    def __init__(self):
        self.crud = department_crud

    def create_department(
        self, db: Session, *, department_data: DepartmentCreate, current_user: User
    ) -> Department:
        """Создать новый департамент"""

        # Проверить права на создание департамента
        if not self._can_create_department(current_user, department_data.company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to create department",
            )

        # Проверить существование компании
        company = company_crud.get(db, id=department_data.company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Проверить уникальность slug в рамках компании
        if department_data.slug:
            existing = self.crud.get_by_slug(
                db, company_id=department_data.company_id, slug=department_data.slug
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department with this slug already exists",
                )

        # Проверить родительский департамент
        if department_data.parent_id:
            parent = self.crud.get(db, id=department_data.parent_id)
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent department not found",
                )

            if parent.company_id != department_data.company_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent department must be in the same company",
                )

        # Проверить руководителя
        if department_data.head_id:
            head = user_crud.get(db, id=department_data.head_id)
            if not head:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department head not found",
                )

        # Создать департамент
        return self.crud.create_with_company(
            db, obj_in=department_data, company_id=department_data.company_id
        )

    def get_department(
        self, db: Session, *, department_id: int, current_user: User
    ) -> Optional[Department]:
        """Получить департамент по ID"""

        department = self.crud.get(db, id=department_id)
        if not department:
            return None

        # Проверить права доступа
        if not self._can_access_department(current_user, department):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

        return department

    def get_company_departments(
        self,
        db: Session,
        *,
        company_id: int,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False
    ) -> List[Department]:
        """Получить департаменты компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_by_company(
            db,
            company_id=company_id,
            skip=skip,
            limit=limit,
            include_inactive=include_inactive,
        )

    def get_department_hierarchy(
        self,
        db: Session,
        *,
        company_id: int,
        current_user: User,
        parent_id: Optional[int] = None
    ) -> List[DepartmentHierarchy]:
        """Получить иерархию департаментов"""

        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        departments = self.crud.get_hierarchy(
            db, company_id=company_id, parent_id=parent_id
        )

        # Преобразовать в схему с дочерними элементами
        hierarchy = []
        for dept in departments:
            children = self.get_department_hierarchy(
                db, company_id=company_id, current_user=current_user, parent_id=dept.id
            )

            dept_hierarchy = DepartmentHierarchy(
                **dept.__dict__,
                children=children,
                level=dept.level,
                full_name=dept.full_name,
                has_children=dept.has_children,
                is_root=dept.is_root
            )
            hierarchy.append(dept_hierarchy)

        return hierarchy

    def update_department(
        self,
        db: Session,
        *,
        department_id: int,
        department_data: DepartmentUpdate,
        current_user: User
    ) -> Department:
        """Обновить департамент"""

        department = self.crud.get(db, id=department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )

        # Проверить права на редактирование
        if not self._can_edit_department(current_user, department):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to edit department",
            )

        # Проверить slug на уникальность
        if department_data.slug and department_data.slug != department.slug:
            existing = self.crud.get_by_slug(
                db, company_id=department.company_id, slug=department_data.slug
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department with this slug already exists",
                )

        # Проверить новый родительский департамент
        if department_data.parent_id is not None:
            if department_data.parent_id == department.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department cannot be parent of itself",
                )

            if department_data.parent_id != 0:  # 0 означает сделать корневым
                parent = self.crud.get(db, id=department_data.parent_id)
                if not parent:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Parent department not found",
                    )

                if parent.company_id != department.company_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Parent department must be in the same company",
                    )

                # Проверить на циклические зависимости
                if self._creates_cycle(db, department.id, department_data.parent_id):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This would create a circular dependency",
                    )

        # Проверить нового руководителя
        if department_data.head_id:
            head = user_crud.get(db, id=department_data.head_id)
            if not head:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department head not found",
                )

        return self.crud.update(db, db_obj=department, obj_in=department_data)

    def delete_department(
        self, db: Session, *, department_id: int, current_user: User
    ) -> bool:
        """Удалить департамент"""

        department = self.crud.get(db, id=department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )

        # Проверить права на удаление
        if not self._can_delete_department(current_user, department):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete department",
            )

        # Проверить возможность удаления
        can_delete_result = self.crud.can_delete(db, department_id=department_id)
        if not can_delete_result["can_delete"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=can_delete_result["reason"],
            )

        self.crud.remove(db, id=department_id)
        return True

    def get_department_statistics(
        self, db: Session, *, department_id: int, current_user: User
    ) -> DepartmentStats:
        """Получить статистику департамента"""

        department = self.crud.get(db, id=department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )

        if not self._can_access_department(current_user, department):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

        stats = self.crud.get_statistics(db, department_id=department_id)
        return DepartmentStats(**stats)

    def search_departments(
        self,
        db: Session,
        *,
        company_id: int,
        query: str,
        current_user: User,
        skip: int = 0,
        limit: int = 100
    ) -> List[Department]:
        """Поиск департаментов"""

        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.search(
            db, company_id=company_id, query=query, skip=skip, limit=limit
        )

    def get_company_department_tree(
        self, db: Session, *, company_id: int, current_user: User
    ) -> List[Dict[str, Any]]:
        """Получить полное дерево департаментов компании"""

        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_tree(db, company_id=company_id)

    # Приватные методы для проверки прав доступа

    def _can_create_department(self, user: User, company_id: int) -> bool:
        """Проверить права на создание департамента"""
        # System Admin может всё
        if user.is_system_admin:
            return True

        # Company Admin может создавать департаменты в своей компании
        if user.company_id == company_id and user.is_company_admin:
            return True

        # TODO: Проверить роли через Enhanced Role System
        return False

    def _can_access_department(self, user: User, department: Department) -> bool:
        """Проверить права доступа к департаменту"""
        return self._can_access_company(user, department.company_id)

    def _can_access_company(self, user: User, company_id: int) -> bool:
        """Проверить права доступа к компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # TODO: Проверить доступ через Enhanced Role System
        return False

    def _can_edit_department(self, user: User, department: Department) -> bool:
        """Проверить права на редактирование департамента"""
        if user.is_system_admin:
            return True

        if user.company_id == department.company_id and user.is_company_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_delete_department(self, user: User, department: Department) -> bool:
        """Проверить права на удаление департамента"""
        return self._can_edit_department(user, department)

    def _creates_cycle(
        self, db: Session, department_id: int, new_parent_id: int
    ) -> bool:
        """Проверить создаст ли новый parent циклическую зависимость"""
        current_id = new_parent_id

        while current_id:
            if current_id == department_id:
                return True

            parent_dept = self.crud.get(db, id=current_id)
            if not parent_dept:
                break

            current_id = parent_dept.parent_id

        return False


# Создаем экземпляр сервиса
department_service = DepartmentService()
