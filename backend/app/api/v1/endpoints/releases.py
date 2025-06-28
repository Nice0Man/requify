"""
API эндпоинты для работы с релизами.

Включает операции CRUD для релизов и управление их жизненным циклом.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_releases_read_user,
    get_releases_write_user,
    get_releases_delete_user,
)
from app.core.config import settings
from app import crud, schemas
from app.schemas.release import ReleaseCreate, ReleaseUpdate

router = APIRouter()


@router.get("/", response_model=List[schemas.Release])
async def get_releases(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить список релизов.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        project_id: Фильтр по ID проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Release]: Список релизов
    """
    if project_id:
        releases = await crud.release.get_by_project(
            db, project_id=project_id, skip=skip, limit=limit
        )
    else:
        releases = await crud.release.get_multi(db, skip=skip, limit=limit)

    return releases


@router.post("/", response_model=schemas.Release, status_code=status.HTTP_201_CREATED)
async def create_release(
    release_data: ReleaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Создать новый релиз.

    Args:
        release_data: Данные релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Созданный релиз
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=release_data.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Проверяем уникальность версии в рамках проекта
    existing_release = await crud.release.get_by_version(
        db, project_id=release_data.project_id, version=release_data.version
    )
    if existing_release:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Release with this version already exists in the project",
        )

    release = await crud.release.create(db, obj_in=release_data)
    return release


@router.get("/{release_id}", response_model=schemas.Release)
async def get_release(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить релиз по ID.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Данные релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    return release


@router.put("/{release_id}", response_model=schemas.Release)
async def update_release(
    release_id: int,
    release_data: ReleaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Обновить данные релиза.

    Args:
        release_id: ID релиза
        release_data: Обновленные данные релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Обновленные данные релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Если обновляется версия, проверяем уникальность
    if release_data.version and release_data.version != release.version:
        existing_release = await crud.release.get_by_version(
            db, project_id=release.project_id, version=release_data.version
        )
        if existing_release:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Release with this version already exists in the project",
            )

    updated_release = await crud.release.update(db, db_obj=release, obj_in=release_data)
    return updated_release


@router.delete("/{release_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_release(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_delete_user),
):
    """
    Удалить релиз.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    await crud.release.remove(db, id=release_id)


@router.post(
    "/create-from-requirements",
    response_model=schemas.Release,
    status_code=status.HTTP_201_CREATED,
)
async def create_release_from_requirements(
    release_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Создать релиз на основе требований.

    Функция 11 из ТЗ: Создание релиза с учетом связей требований.
    Роль пользователя: Менеджер проекта или вышестоящая роль.

    Args:
        release_data: Данные релиза с списком требований
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Созданный релиз с привязанными требованиями

    Raises:
        HTTPException: Если данные некорректны
    """
    project_id = release_data.get("project_id")
    requirement_ids = release_data.get("requirement_ids", [])

    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Project ID is required"
        )

    # Проверяем существование проекта
    project = await crud.project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Проверяем существование требований
    if requirement_ids:
        for req_id in requirement_ids:
            requirement = await crud.requirement.get(db, id=req_id)
            if not requirement:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Requirement with ID {req_id} not found",
                )
            if requirement.project_id != project_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Requirement {req_id} does not belong to project {project_id}",
                )

    # Создаем релиз
    release_create_data = ReleaseCreate(
        name=release_data.get("name", "Auto Release"),
        version=release_data.get("version", "1.0.0"),
        description=release_data.get(
            "description", f"Релиз создан на основе {len(requirement_ids)} требований"
        ),
        project_id=project_id,
        status=release_data.get("status", "planning"),
    )

    # Проверяем уникальность версии
    existing_release = await crud.release.get_by_version(
        db, project_id=project_id, version=release_create_data.version
    )
    if existing_release:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Release with this version already exists in the project",
        )

    release = await crud.release.create(db, obj_in=release_create_data)

    # Привязываем требования к релизу
    if requirement_ids:
        for req_id in requirement_ids:
            requirement = await crud.requirement.get(db, id=req_id)
            if requirement:
                await crud.requirement.update(
                    db, db_obj=requirement, obj_in={"release_id": release.id}
                )

    return release


@router.post("/{release_id}/generate-specification", response_model=dict)
async def generate_release_specification(
    release_id: int,
    spec_options: dict = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Генерация спецификации релиза.

    Функция 12 из ТЗ: Автоматическая генерация спецификаций.
    Роль пользователя: Аналитик или вышестоящая роль.

    Args:
        release_id: ID релиза
        spec_options: Опции генерации спецификации
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Информация о сгенерированной спецификации

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get_with_requirements(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    if spec_options is None:
        spec_options = {}

    # Получаем требования релиза
    requirements = await crud.requirement.get_by_release(db, release_id=release_id)

    # Создаем спецификацию
    from datetime import datetime, UTC
    from app.schemas.spec import SpecCreate

    spec_data = SpecCreate(
        name=f"Specification for {release.name} {release.version}",
        description=f"Auto-generated specification for release {release.name}",
        content={
            "release_info": {
                "name": release.name,
                "version": release.version,
                "description": release.description,
            },
            "requirements": [
                {
                    "id": req.id,
                    "name": req.name,
                    "description": req.description,
                    "type": req.type.name if req.type else None,
                    "priority": req.priority.name if req.priority else None,
                    "status": req.status.name if req.status else None,
                }
                for req in requirements
            ],
            "sections": [
                "Введение",
                "Функциональные требования",
                "Нефункциональные требования",
                "Интерфейсы",
                "Тестирование",
            ],
            "generated_at": datetime.now(UTC).isoformat(),
            "generated_by": current_user.id if hasattr(current_user, "id") else None,
            "format": spec_options.get("format", "pdf"),
            "language": spec_options.get("language", "ru"),
        },
        version="1.0",
        project_id=release.project_id,
    )

    spec = await crud.spec.create(db, obj_in=spec_data)

    return {
        "release_id": release_id,
        "specification_id": spec.id,
        "format": spec_options.get("format", "pdf"),
        "language": spec_options.get("language", "ru"),
        "sections": spec_data.content["sections"],
        "generated_at": spec_data.content["generated_at"],
        "download_url": f"/api/v1/specs/{spec.id}/download",
        "status": "generated",
        "requirements_count": len(requirements),
    }


@router.post("/{release_id}/publish", response_model=dict)
async def publish_release(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Опубликовать релиз.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат публикации

    Raises:
        HTTPException: Если релиз не найден или не готов к публикации
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Проверяем, готов ли релиз к публикации
    if release.status in ["cancelled", "published"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot publish release with status '{release.status}'",
        )

    from datetime import datetime, UTC

    # Обновляем статус релиза
    updated_release = await crud.release.update(
        db,
        db_obj=release,
        obj_in={
            "status": "published",
            "release_date": datetime.now(UTC).replace(tzinfo=None),
        },
    )

    return {
        "release_id": release_id,
        "status": "published",
        "published_at": (
            updated_release.release_date.isoformat()
            if updated_release.release_date
            else None
        ),
        "published_by": current_user.id if hasattr(current_user, "id") else None,
        "notification_sent": True,
    }


@router.get("/{release_id}/requirements", response_model=List[schemas.Requirement])
async def get_release_requirements(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить требования релиза.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список требований релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    requirements = await crud.requirement.get_by_release(db, release_id=release_id)
    return requirements


@router.get("/{release_id}/changelog", response_model=dict)
async def get_release_changelog(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить changelog релиза.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Changelog релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Получаем требования релиза
    requirements = await crud.requirement.get_by_release(db, release_id=release_id)

    # Группируем требования по типам
    changelog = {
        "release_info": {
            "id": release.id,
            "name": release.name,
            "version": release.version,
            "description": release.description,
            "status": release.status,
            "release_date": (
                release.release_date.isoformat() if release.release_date else None
            ),
        },
        "changes": {
            "new_features": [],
            "improvements": [],
            "bug_fixes": [],
            "breaking_changes": [],
            "other": [],
        },
        "statistics": {
            "total_requirements": len(requirements),
            "by_type": {},
            "by_priority": {},
            "by_status": {},
        },
    }

    for req in requirements:
        req_info = {
            "id": req.id,
            "name": req.name,
            "description": req.description,
            "type": req.type.name if req.type else "unknown",
            "priority": req.priority.name if req.priority else "unknown",
            "status": req.status.name if req.status else "unknown",
        }

        # Классифицируем по типам изменений
        if req.type and req.type.name.lower() in ["feature", "новая функция"]:
            changelog["changes"]["new_features"].append(req_info)
        elif req.type and req.type.name.lower() in ["improvement", "улучшение"]:
            changelog["changes"]["improvements"].append(req_info)
        elif req.type and req.type.name.lower() in ["bug", "ошибка", "bug fix"]:
            changelog["changes"]["bug_fixes"].append(req_info)
        elif req.type and req.type.name.lower() in [
            "breaking",
            "критическое изменение",
        ]:
            changelog["changes"]["breaking_changes"].append(req_info)
        else:
            changelog["changes"]["other"].append(req_info)

        # Статистика по типам
        type_name = req.type.name if req.type else "unknown"
        changelog["statistics"]["by_type"][type_name] = (
            changelog["statistics"]["by_type"].get(type_name, 0) + 1
        )

        # Статистика по приоритетам
        priority_name = req.priority.name if req.priority else "unknown"
        changelog["statistics"]["by_priority"][priority_name] = (
            changelog["statistics"]["by_priority"].get(priority_name, 0) + 1
        )

        # Статистика по статусам
        status_name = req.status.name if req.status else "unknown"
        changelog["statistics"]["by_status"][status_name] = (
            changelog["statistics"]["by_status"].get(status_name, 0) + 1
        )

    return changelog
