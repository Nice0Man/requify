"""
API эндпоинты для работы с проектами.

Включает операции CRUD для проектов и управление их жизненным циклом.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_projects_read_user,
    get_projects_write_user,
    get_projects_delete_user,
)
from app.core.config import settings
from app import crud, schemas
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[schemas.Project])
async def get_projects(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    status: Optional[str] = Query(None, description="Фильтр по статусу"),
    search: Optional[str] = Query(None, description="Поиск по названию или описанию"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_read_user),
):
    """
    Получить список проектов с фильтрацией и поиском.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        status: Фильтр по статусу проекта
        search: Поисковый запрос
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Project]: Список проектов
    """
    if search:
        projects = await crud.project.search_projects(
            db, search_term=search, skip=skip, limit=limit
        )
    elif status:
        projects = await crud.project.get_by_status(
            db, status=status, skip=skip, limit=limit
        )
    else:
        projects = await crud.project.get_multi(db, skip=skip, limit=limit)

    return projects


@router.post("/", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: schemas.ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_write_user),
):
    """
    Создать новый проект.

    Args:
        project_in: Данные создаваемого проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Project: Созданный проект

    Raises:
        HTTPException: Если проект с таким кодом уже существует
    """
    # Проверяем уникальность кода проекта
    existing_project = await crud.project.get_by_code(db, code=project_in.code)
    if existing_project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Проект с таким кодом уже существует",
        )

    project = await crud.project.create(db, obj_in=project_in)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectWithStats)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_read_user),
):
    """
    Получить проект по ID с подробной информацией.

    Args:
        project_id: ID проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.ProjectWithStats: Проект с дополнительной информацией

    Raises:
        HTTPException: Если проект не найден
    """
    project = await crud.project.get_with_stats(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )
    return project


@router.put("/{project_id}", response_model=schemas.Project)
async def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_write_user),
):
    """
    Обновить данные проекта.

    Args:
        project_id: ID проекта
        project_in: Обновленные данные проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Project: Обновленный проект

    Raises:
        HTTPException: Если проект не найден или код уже используется
    """
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    # Проверяем уникальность кода, если он изменился
    if project_in.code and project_in.code != project.code:
        existing_project = await crud.project.get_by_code(db, code=project_in.code)
        if existing_project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Проект с таким кодом уже существует",
            )

    project = await crud.project.update(db, db_obj=project, obj_in=project_in)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_delete_user),
):
    """
    Удалить проект.

    Args:
        project_id: ID проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если проект не найден
    """
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    await crud.project.remove(db, id=project_id)


@router.get("/{project_id}/requirements", response_model=List[schemas.Requirement])
async def get_project_requirements(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_id: Optional[int] = Query(None, description="Фильтр по статусу"),
    type_id: Optional[int] = Query(None, description="Фильтр по типу"),
    priority_id: Optional[int] = Query(None, description="Фильтр по приоритету"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_read_user),
):
    """
    Получить требования проекта с фильтрацией.

    Args:
        project_id: ID проекта
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        status_id: Фильтр по ID статуса
        type_id: Фильтр по ID типа
        priority_id: Фильтр по ID приоритета
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список требований проекта

    Raises:
        HTTPException: Если проект не найден
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    # Фильтры для требований
    filters = {}
    if status_id:
        filters["status_id"] = status_id
    if type_id:
        filters["type_id"] = type_id
    if priority_id:
        filters["priority_id"] = priority_id

    requirements = await crud.requirement.get_by_project(
        db, project_id=project_id, skip=skip, limit=limit, **filters
    )
    return requirements


@router.get("/{project_id}/releases", response_model=List[schemas.Release])
async def get_project_releases(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_read_user),
):
    """
    Получить релизы проекта.

    Args:
        project_id: ID проекта
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Release]: Список релизов проекта

    Raises:
        HTTPException: Если проект не найден
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    releases = await crud.release.get_by_project(
        db, project_id=project_id, skip=skip, limit=limit
    )
    return releases


@router.get("/{project_id}/stats", response_model=dict)
async def get_project_stats(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_projects_read_user),
):
    """
    Получить статистику проекта.

    Args:
        project_id: ID проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Статистика проекта

    Raises:
        HTTPException: Если проект не найден
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    # Получаем реальную статистику из БД
    stats = await crud.project.get_project_stats(db, project_id=project_id)

    # Дополняем статистику метаданными
    stats.update(
        {
            "project_id": project_id,
            "project_name": project.name,
            "project_code": project.code,
            "project_status": project.status,
            "last_updated": (
                project.updated_at.isoformat() if project.updated_at else None
            ),
        }
    )

    return stats
