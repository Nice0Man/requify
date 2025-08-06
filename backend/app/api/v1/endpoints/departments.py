"""
API endpoints для департаментов.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

    AdminPermissions,
from app.api.dependencies import get_db, get_current_active_user, SessionDep,
from app.models.user import User
from app.services.department_service import department_service
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentListResponse,
    DepartmentHierarchy,
    DepartmentStats,
    DepartmentType,
)

router = APIRouter()


@router.post(
    "/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED
)
async def create_department(
    *,
    db: SessionDep,
    department_in: DepartmentCreate,
    current_user: User = Depends(get_current_active_user),
) -> DepartmentResponse:
    """
    Создать новый департамент.

    Требует права на создание департаментов в компании.
    """
    department = department_service.create_department(
        db=db, department_data=department_in, current_user=current_user
    )

    return DepartmentResponse(
        **department.__dict__,
        level=department.level,
        full_name=department.full_name,
        has_children=department.has_children,
        is_root=department.is_root,
    )


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> DepartmentResponse:
    """
    Получить департамент по ID.
    """
    department = department_service.get_department(
        db=db, department_id=department_id, current_user=current_user
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )

    return DepartmentResponse(
        **department.__dict__,
        level=department.level,
        full_name=department.full_name,
        has_children=department.has_children,
        is_root=department.is_root,
    )


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    *,
    db: SessionDep,
    department_id: int,
    department_in: DepartmentUpdate,
    current_user: User = Depends(get_current_active_user),
) -> DepartmentResponse:
    """
    Обновить департамент.

    Требует права на редактирование департамента.
    """
    department = department_service.update_department(
        db=db,
        department_id=department_id,
        department_data=department_in,
        current_user=current_user,
    )

    return DepartmentResponse(
        **department.__dict__,
        level=department.level,
        full_name=department.full_name,
        has_children=department.has_children,
        is_root=department.is_root,
    )


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    department_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    Удалить департамент.

    Требует права на удаление департамента.
    Нельзя удалить департамент с дочерними департаментами, командами или проектами.
    """
    department_service.delete_department(
        db=db, department_id=department_id, current_user=current_user
    )


@router.get("/company/{company_id}", response_model=List[DepartmentResponse])
async def get_company_departments(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    include_inactive: bool = Query(
        False, description="Включить неактивные департаменты"
    ),
    type: Optional[DepartmentType] = Query(
        None, description="Фильтр по типу департамента"
    ),
) -> List[DepartmentResponse]:
    """
    Получить департаменты компании.

    Поддерживает пагинацию и фильтрацию по типу.
    """
    if type:
        # Фильтрация по типу
        from app.crud.department import department as department_crud

        departments = department_crud.get_by_type(
            db=db,
            company_id=company_id,
            department_type=type.value,
            skip=skip,
            limit=limit,
        )

        # Проверяем права доступа
        if not department_service._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )
    else:
        departments = department_service.get_company_departments(
            db=db,
            company_id=company_id,
            current_user=current_user,
            skip=skip,
            limit=limit,
            include_inactive=include_inactive,
        )

    return [
        DepartmentResponse(
            **dept.__dict__,
            level=dept.level,
            full_name=dept.full_name,
            has_children=dept.has_children,
            is_root=dept.is_root,
        )
        for dept in departments
    ]


@router.get("/company/{company_id}/hierarchy", response_model=List[DepartmentHierarchy])
async def get_company_department_hierarchy(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    parent_id: Optional[int] = Query(None, description="ID родительского департамента"),
) -> List[DepartmentHierarchy]:
    """
    Получить иерархию департаментов компании.

    Если parent_id не указан, возвращает корневые департаменты с их дочерними элементами.
    """
    return department_service.get_department_hierarchy(
        db=db, company_id=company_id, current_user=current_user, parent_id=parent_id
    )


@router.get("/company/{company_id}/tree", response_model=List[Dict[str, Any]])
async def get_company_department_tree(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Получить полное дерево департаментов компании.

    Возвращает компактное представление дерева для UI компонентов.
    """
    return department_service.get_company_department_tree(
        db=db, company_id=company_id, current_user=current_user
    )


@router.get("/{department_id}/statistics", response_model=DepartmentStats)
async def get_department_statistics(
    department_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> DepartmentStats:
    """
    Получить статистику департамента.

    Включает количество команд, проектов, сотрудников и другие метрики.
    """
    return department_service.get_department_statistics(
        db=db, department_id=department_id, current_user=current_user
    )


@router.get("/company/{company_id}/search", response_model=List[DepartmentResponse])
async def search_departments(
    company_id: int,
    q: str = Query(..., min_length=1, description="Поисковый запрос"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[DepartmentResponse]:
    """
    Поиск департаментов по названию, описанию и slug.

    Поддерживает пагинацию результатов.
    """
    departments = department_service.search_departments(
        db=db,
        company_id=company_id,
        query=q,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )

    return [
        DepartmentResponse(
            **dept.__dict__,
            level=dept.level,
            full_name=dept.full_name,
            has_children=dept.has_children,
            is_root=dept.is_root,
        )
        for dept in departments
    ]


@router.get("/company/{company_id}/roots", response_model=List[DepartmentResponse])
async def get_root_departments(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[DepartmentResponse]:
    """
    Получить корневые департаменты компании.

    Возвращает только департаменты верхнего уровня (без родительского департамента).
    """
    # Проверяем права доступа
    if not department_service._can_access_company(current_user, company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
        )

    from app.crud.department import department as department_crud

    departments = department_crud.get_root_departments(db=db, company_id=company_id)

    return [
        DepartmentResponse(
            **dept.__dict__,
            level=dept.level,
            full_name=dept.full_name,
            has_children=dept.has_children,
            is_root=dept.is_root,
        )
        for dept in departments
    ]


@router.get("/{department_id}/children", response_model=List[DepartmentResponse])
async def get_department_children(
    department_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[DepartmentResponse]:
    """
    Получить дочерние департаменты.
    """
    # Сначала получаем департамент для проверки прав
    department = department_service.get_department(
        db=db, department_id=department_id, current_user=current_user
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )

    from app.crud.department import department as department_crud

    children = department_crud.get_hierarchy(
        db=db, company_id=department.company_id, parent_id=department_id
    )

    return [
        DepartmentResponse(
            **child.__dict__,
            level=child.level,
            full_name=child.full_name,
            has_children=child.has_children,
            is_root=child.is_root,
        )
        for child in children
    ]


@router.post("/{department_id}/update-counts", response_model=DepartmentResponse)
async def update_department_counts(
    department_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> DepartmentResponse:
    """
    Обновить счетчики департамента (количество сотрудников и команд).

    Полезно после изменений в командах или участниках.
    """
    # Проверяем существование и права
    department = department_service.get_department(
        db=db, department_id=department_id, current_user=current_user
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )

    # Проверяем права на редактирование
    if not department_service._can_edit_department(current_user, department):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update department",
        )

    # Обновляем счетчики
    from app.crud.department import department as department_crud

    department_crud.update_employee_count(db=db, department_id=department_id)
    updated_dept = department_crud.update_team_count(db=db, department_id=department_id)

    if not updated_dept:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update department counts",
        )

    return DepartmentResponse(
        **updated_dept.__dict__,
        level=updated_dept.level,
        full_name=updated_dept.full_name,
        has_children=updated_dept.has_children,
        is_root=updated_dept.is_root,
    )
