"""
API эндпоинты для работы со спецификациями.

Включает операции CRUD для спецификаций и управление связанными требованиями.
"""

from datetime import datetime, UTC
from typing import List, Optional
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
from app.services.reporting_service import (
    reporting_service,
    ReportConfig,
    ReportType,
    ReportFilter,
)

router = APIRouter()


@router.get("/", response_model=List[schemas.Spec])
async def get_specifications(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    project_id: Optional[int] = Query(None, description="Фильтр по ID проекта"),
    search: Optional[str] = Query(None, description="Поиск по названию или описанию"),
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Получить список спецификаций с фильтрацией и поиском.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        project_id: Фильтр по ID проекта
        search: Поисковый запрос
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Spec]: Список спецификаций
    """
    if search:
        specs = await crud.spec.search_specs(
            db, search_term=search, project_id=project_id, skip=skip, limit=limit
        )
    elif project_id:
        specs = await crud.spec.get_by_project(
            db, project_id=project_id, skip=skip, limit=limit
        )
    else:
        specs = await crud.spec.get_multi(db, skip=skip, limit=limit)

    return specs


@router.post("/", response_model=schemas.Spec, status_code=status.HTTP_201_CREATED)
async def create_specification(
    spec_in: schemas.SpecCreate,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Создать новую спецификацию.

    Args:
        spec_in: Данные создаваемой спецификации
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Spec: Созданная спецификация

    Raises:
        HTTPException: Если проект не найден или спецификация с таким названием уже существует
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=spec_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Проект не найден",
        )

    # Проверяем уникальность названия в рамках проекта
    existing_spec = await crud.spec.get_by_name(
        db, name=spec_in.name, project_id=spec_in.project_id
    )
    if existing_spec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Спецификация с таким названием уже существует в проекте",
        )

    spec = await crud.spec.create(db, obj_in=spec_in)
    return spec


@router.get("/{spec_id}", response_model=schemas.Spec)
async def get_specification(
    spec_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Получить спецификацию по ID.

    Args:
        spec_id: ID спецификации
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Spec: Спецификация

    Raises:
        HTTPException: Если спецификация не найдена
    """
    spec = await crud.spec.get(db, id=spec_id)
    if not spec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецификация не найдена",
        )

    return spec


@router.put("/{spec_id}", response_model=schemas.Spec)
async def update_specification(
    spec_id: int,
    spec_in: schemas.SpecUpdate,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.write()),
):
    """
    Обновить спецификацию.

    Args:
        spec_id: ID спецификации
        spec_in: Данные для обновления
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Spec: Обновленная спецификация

    Raises:
        HTTPException: Если спецификация не найдена
    """
    spec = await crud.spec.get(db, id=spec_id)
    if not spec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецификация не найдена",
        )

    # Проверяем уникальность названия при изменении
    if spec_in.name and spec_in.name != spec.name:
        existing_spec = await crud.spec.get_by_name(
            db, name=spec_in.name, project_id=spec.project_id
        )
        if existing_spec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Спецификация с таким названием уже существует в проекте",
            )

    spec = await crud.spec.update(db, db_obj=spec, obj_in=spec_in)
    return spec


@router.delete("/{spec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_specification(
    spec_id: int,
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.delete()),
):
    """
    Удалить спецификацию.

    Args:
        spec_id: ID спецификации
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если спецификация не найдена
    """
    spec = await crud.spec.get(db, id=spec_id)
    if not spec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецификация не найдена",
        )

    await crud.spec.remove(db, id=spec_id)


@router.get("/{spec_id}/requirements", response_model=List[schemas.Requirement])
async def get_specification_requirements(
    spec_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_id: Optional[int] = Query(None, description="Фильтр по статусу"),
    type_id: Optional[int] = Query(None, description="Фильтр по типу"),
    priority_id: Optional[int] = Query(None, description="Фильтр по приоритету"),
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Получить требования спецификации.

    Args:
        spec_id: ID спецификации
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        status_id: Фильтр по статусу
        type_id: Фильтр по типу
        priority_id: Фильтр по приоритету
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список требований спецификации

    Raises:
        HTTPException: Если спецификация не найдена
    """
    spec = await crud.spec.get(db, id=spec_id)
    if not spec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецификация не найдена",
        )

    # Возвращаем пустой список пока не реализована связь
    return []


@router.post("/{spec_id}/generate-document", response_model=schemas.Report)
async def generate_specification_document(
    spec_id: int,
    format: str = Query("html", description="Формат документа (html, pdf, docx)"),
    db: SessionDep,
    current_user: User = Depends(ProjectPermissions.read()),
):
    """
    Сгенерировать документ спецификации.

    Args:
        spec_id: ID спецификации
        format: Формат документа
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Информация о сгенерированном документе

    Raises:
        HTTPException: Если спецификация не найдена
    """
    spec = await crud.spec.get(db, id=spec_id)
    if not spec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецификация не найдена",
        )

    # Проверяем поддерживаемые форматы
    supported_formats = ["html", "pdf", "docx"]
    if format not in supported_formats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неподдерживаемый формат. Доступные форматы: {', '.join(supported_formats)}",
        )

    # Получаем требования спецификации
    requirements = await crud.requirement.get_by_spec(db, spec_id=spec_id)

    # Инициализируем сервис генерации документов
    doc_generator = reporting_service

    try:
        # Генерируем документ
        document_data = await doc_generator.generate_report(
            config=ReportConfig(
                type=ReportType.SPECIFICATION,
                format=format,
                filters=ReportFilter(project_ids=[spec.project_id]),
                include_details=True,
                include_statistics=True,
                group_by=None,
            ),
            generated_by=current_user.email,
            requirements=requirements,
            spec=spec,
            format=format,
            download_url=f"/api/v1/specifications/{spec_id}/download/{format}",
            generated_at=datetime.now(UTC).isoformat() + "Z",
            file_path=document_data["file_path"],
            file_size=document_data["file_size"],
        )

        return schemas.Report(
            id=document_data["id"],
            status="generated",
            spec_id=spec_id,
            spec_name=spec.name,
            format=format,
            download_url=f"/api/v1/specifications/{spec_id}/download/{format}",
            generated_at=datetime.now(UTC).isoformat() + "Z",
            file_path=document_data["file_path"],
            file_size=document_data["file_size"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при генерации документа: {str(e)}",
        )
