"""
API эндпоинты для работы с проектами.

Включает операции CRUD для проектов и управление их жизненным циклом.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import (
    get_current_active_user,
    get_db,
    get_projects_delete_user,
    get_projects_read_user,
    get_projects_write_user,
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
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
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
            db, query=search, skip=skip, limit=limit
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
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
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

    # Автоматически устанавливаем текущего пользователя как владельца
    project_data = project_in.model_dump()
    project_data["owner_id"] = current_user.id

    project = await crud.project.create(db, obj_in=project_data)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectWithStats)
async def get_project(
    project_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
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
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
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
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.delete()),
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
    status_id: Optional[int] = Query(None, description="Фильтр по ID статуса"),
    priority_id: Optional[int] = Query(None, description="Фильтр по ID приоритета"),
    type_id: Optional[int] = Query(None, description="Фильтр по ID типа"),
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Получить все требования проекта.

    Args:
        project_id: ID проекта
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        status_id: Фильтр по ID статуса
        priority_id: Фильтр по ID приоритета
        type_id: Фильтр по ID типа
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

    # Формируем фильтры
    filters = {}
    if status_id:
        filters["status_id"] = status_id
    if priority_id:
        filters["priority_id"] = priority_id
    if type_id:
        filters["type_id"] = type_id

    # Получаем требования проекта
    requirements = await crud.requirement.get_by_project(
        db, project_id=project_id, skip=skip, limit=limit, **filters
    )

    return requirements


@router.post("/{project_id}/sync-to-release", response_model=Dict[str, Any])
async def sync_project_requirements_to_release(
    project_id: int,
    release_id: int,
    requirement_ids: Optional[List[int]] = None,
    sync_all: bool = False,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Синхронизировать требования проекта с релизом.

    Args:
        project_id: ID проекта
        release_id: ID релиза для синхронизации
        requirement_ids: Список ID конкретных требований для синхронизации (опционально)
        sync_all: Синхронизировать все требования проекта (по умолчанию False)
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        Dict[str, Any]: Результат синхронизации

    Raises:
        HTTPException: Если проект или релиз не найдены
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    # Проверяем существование релиза
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Релиз не найден"
        )

    try:
        synced_count = 0

        if sync_all:
            # Синхронизируем все требования проекта
            project_requirements = await crud.requirement.get_by_project(
                db, project_id=project_id, skip=0, limit=10000
            )

            for req in project_requirements:
                if req.release_id != release_id:
                    req.release_id = release_id
                    db.add(req)
                    synced_count += 1

        elif requirement_ids:
            # Синхронизируем конкретные требования
            for req_id in requirement_ids:
                requirement = await crud.requirement.get(db, id=req_id)
                if requirement and requirement.project_id == project_id:
                    if requirement.release_id != release_id:
                        requirement.release_id = release_id
                        db.add(requirement)
                        synced_count += 1
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Необходимо указать либо requirement_ids, либо установить sync_all=true",
            )

        await db.commit()

        return {
            "message": f"Синхронизировано {synced_count} требований проекта с релизом",
            "project_id": project_id,
            "release_id": release_id,
            "synced_requirements": synced_count,
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка синхронизации: {str(e)}",
        )


@router.get("/{project_id}/releases", response_model=List[schemas.Release])
async def get_project_releases(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Получить все релизы проекта.

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

    # Получаем релизы проекта
    releases = await crud.release.get_by_project(
        db, project_id=project_id, skip=skip, limit=limit
    )

    return releases


@router.get("/{project_id}/stats", response_model=dict)
async def get_project_stats(
    project_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
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


@router.delete("/{project_id}/team/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member_from_project(
    project_id: int,
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Удалить участника команды из проекта.
    """
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    # Удаляем участника из проекта
    success = await crud.project.remove_team_member(
        db, project_id=project_id, user_id=user_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден в проекте"
        )


@router.post("/bulk", response_model=List[schemas.Project])
async def bulk_create_projects(
    projects_data: List[schemas.ProjectCreate],
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Массовое создание проектов.
    """
    created_projects = []
    for project_data in projects_data:
        project = await crud.project.create(
            db, obj_in=project_data, owner_id=current_user.id
        )
        created_projects.append(project)

    return created_projects


@router.put("/bulk", response_model=List[schemas.Project])
async def bulk_update_projects(
    projects_data: List[Dict[str, Any]],
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Массовое обновление проектов.
    """
    updated_projects = []
    for project_update in projects_data:
        project_id = project_update.get("id")
        if not project_id:
            continue

        project = await crud.project.get(db, id=project_id)
        if project:
            updated_project = await crud.project.update(
                db, db_obj=project, obj_in=project_update
            )
            updated_projects.append(updated_project)

    return updated_projects


@router.delete("/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete_projects(
    project_ids: List[int],
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.delete()),
):
    """
    Массовое удаление проектов.
    """
    for project_id in project_ids:
        project = await crud.project.get(db, id=project_id)
        if project:
            await crud.project.remove(db, id=project_id)


@router.post("/import", response_model=List[schemas.Project])
async def import_projects(
    import_data: Dict[str, Any],
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Импорт проектов из файла/данных.
    """
    imported_projects = await crud.project.import_projects(
        db, import_data=import_data, owner_id=current_user.id
    )
    return imported_projects


@router.get("/export", response_model=Dict[str, Any])
async def export_projects(
    format: str = Query("json", regex="^(json|csv|xlsx)$"),
    project_ids: Optional[List[int]] = Query(None),
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Экспорт проектов в различных форматах.
    """
    export_data = await crud.project.export_projects(
        db, format=format, project_ids=project_ids, user_id=current_user.id
    )
    return export_data


@router.post("/{project_id}/archive", response_model=schemas.Project)
async def archive_project(
    project_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Архивировать проект.
    """
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    archived_project = await crud.project.archive(db, project_id=project_id)
    return archived_project


@router.post("/{project_id}/unarchive", response_model=schemas.Project)
async def unarchive_project(
    project_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Разархивировать проект.
    """
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    unarchived_project = await crud.project.unarchive(db, project_id=project_id)
    return unarchived_project


@router.post("/{project_id}/favorite", response_model=Dict[str, Any])
async def toggle_project_favorite(
    project_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """
    Добавить/убрать проект из избранного.
    """
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    is_favorite = await crud.project.toggle_favorite(
        db, project_id=project_id, user_id=current_user.id
    )
    return {"project_id": project_id, "is_favorite": is_favorite}
