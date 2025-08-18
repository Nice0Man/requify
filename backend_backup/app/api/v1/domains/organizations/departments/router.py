"""
Departments Management Router.

Современный роутер для управления департаментами в рамках домена Organizations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    # DepartmentPermissions,
    # CompanyPermissions,
)

router = APIRouter()

# # Department Management
# 

@router.get("/")
async def get_departments(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    parent_id: Optional[int] = Query(None, description="Filter by parent department"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(CompanyPermissions.departments_read()),
):
    """
    Получить список департаментов.

    Доступ: COMPANY_VIEWER+ (в контексте компании)
    """
    # TODO: Implement departments list with hierarchy support
    return {"departments": []}

@router.post("/")
async def create_department(
    # department_data: DepartmentCreate,
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(CompanyPermissions.departments_create()),
):
    """
    Создать новый департамент.

    Доступ: COMPANY_ADMIN+ или DEPARTMENT_HEAD (для поддепартаментов)
    """
    # TODO: Implement department creation
    return {"message": "Department created"}

@router.get("/hierarchy")
async def get_departments_hierarchy(
    company_id: Optional[int] = Query(None, description="Company ID"),
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(CompanyPermissions.departments_read()),
):
    """
    Получить иерархию департаментов.

    Доступ: COMPANY_VIEWER+
    """
    # TODO: Implement departments hierarchy
    return {"hierarchy": []}

@router.get("/{department_id}")
async def get_department(
    department_id: int,
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(DepartmentPermissions.read()),
):
    """
    Получить информацию о департаменте.

    Доступ: DEPARTMENT_VIEWER+ (в контексте департамента)
    """
    # TODO: Implement department retrieval
    return {"department": {"id": department_id}}

@router.put("/{department_id}")
async def update_department(
    department_id: int,
    # department_data: DepartmentUpdate,
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(DepartmentPermissions.update()),
):
    """
    Обновить департамент.

    Доступ: DEPARTMENT_ADMIN+ (в контексте департамента)
    """
    # TODO: Implement department update
    return {"message": "Department updated"}

@router.delete("/{department_id}")
async def delete_department(
    department_id: int,
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(DepartmentPermissions.delete()),
):
    """
    Удалить департамент.

    Доступ: COMPANY_ADMIN+ или DEPARTMENT_HEAD (owner)
    """
    # TODO: Implement department deletion
    return {"message": f"Department {department_id} deleted"}

# # Department Members Management
# 

@router.get("/{department_id}/members")
async def get_department_members(
    department_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(DepartmentPermissions.members_read()),
):
    """
    Получить участников департамента.

    Доступ: DEPARTMENT_VIEWER+
    """
    # TODO: Implement department members list
    return {"members": []}

@router.post("/{department_id}/members")
async def add_department_member(
    department_id: int,
    # member_data: DepartmentMemberAdd,
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(DepartmentPermissions.members_add()),
):
    """
    Добавить участника в департамент.

    Доступ: DEPARTMENT_ADMIN+
    """
    # TODO: Implement adding department member
    return {"message": "Member added to department"}

@router.delete("/{department_id}/members/{user_id}")
async def remove_department_member(
    department_id: int,
    user_id: int,
    # db: SessionDep,
    # current_user: CurrentActiveUserDep = Depends(DepartmentPermissions.members_remove()),
):
    """
    Удалить участника из департамента.

    Доступ: DEPARTMENT_ADMIN+
    """
    # TODO: Implement removing department member
    return {"message": f"User {user_id} removed from department {department_id}"}
