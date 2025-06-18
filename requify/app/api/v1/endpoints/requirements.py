"""
API эндпоинты для работы с требованиями.

Включает операции CRUD для требований и управление их состоянием.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.api.deps import get_db, get_current_user
from requify.app.core.config import settings
from requify.app import crud, schemas
from requify.app.models.user import User

router = APIRouter()


@router.get("/search", response_model=List[schemas.Requirement])
async def search_requirements(
    query: str = Query(..., description="Поисковый запрос"),
    project_id: Optional[int] = Query(None, description="Фильтр по ID проекта"),
    status_id: Optional[int] = Query(None, description="Фильтр по ID статуса"),
    priority_id: Optional[int] = Query(None, description="Фильтр по ID приоритета"),
    type_id: Optional[int] = Query(None, description="Фильтр по ID типа"),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, le=1000, description="Максимальное количество возвращаемых записей"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Поиск требований по различным критериям.

    Функция 6 из ТЗ: Поиск требования.
    Любой сотрудник, имеющий права доступа к требованиям данного проекта.

    Args:
        query: Поисковый запрос (ищет в названии и описании)
        project_id: Фильтр по ID проекта
        status_id: Фильтр по ID статуса
        priority_id: Фильтр по ID приоритета
        type_id: Фильтр по ID типа
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Отфильтрованный список требований
    """
    filters = {}
    if project_id:
        filters["project_id"] = project_id
    if status_id:
        filters["status_id"] = status_id
    if priority_id:
        filters["priority_id"] = priority_id
    if type_id:
        filters["type_id"] = type_id

    requirements = await crud.requirement.search_requirements(
        db, search_term=query, skip=skip, limit=limit, **filters
    )
    return requirements


@router.get("/", response_model=List[schemas.Requirement])
async def get_requirements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    project_id: Optional[int] = Query(None, description="Фильтр по ID проекта"),
    status_id: Optional[int] = Query(None, description="Фильтр по ID статуса"),
    priority_id: Optional[int] = Query(None, description="Фильтр по ID приоритета"),
    type_id: Optional[int] = Query(None, description="Фильтр по ID типа"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить список требований с фильтрацией.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        project_id: Фильтр по ID проекта
        status_id: Фильтр по ID статуса
        priority_id: Фильтр по ID приоритета
        type_id: Фильтр по ID типа
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список требований
    """
    filters = {}
    if status_id:
        filters["status_id"] = status_id
    if priority_id:
        filters["priority_id"] = priority_id
    if type_id:
        filters["type_id"] = type_id

    if project_id:
        requirements = await crud.requirement.get_by_project(
            db, project_id=project_id, skip=skip, limit=limit, **filters
        )
    else:
        requirements = await crud.requirement.get_multi_with_filters(
            db, skip=skip, limit=limit, **filters
        )

    return requirements


@router.post(
    "/", response_model=schemas.Requirement, status_code=status.HTTP_201_CREATED
)
async def create_requirement(
    requirement_in: schemas.RequirementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Создать новое требование.

    Args:
        requirement_in: Данные создаваемого требования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Requirement: Созданное требование

    Raises:
        HTTPException: Если проект не найден или ссылочные данные некорректны
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=requirement_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
        )

    # Проверяем существование типа, приоритета и статуса
    if requirement_in.type_id:
        req_type = await crud.requirement_type.get(db, id=requirement_in.type_id)
        if not req_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Тип требования не найден"
            )

    if requirement_in.priority_id:
        priority = await crud.requirement_priority.get(
            db, id=requirement_in.priority_id
        )
        if not priority:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Приоритет требования не найден",
            )

    if requirement_in.status_id:
        status_obj = await crud.requirement_status.get(db, id=requirement_in.status_id)
        if not status_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Статус требования не найден",
            )

    requirement = await crud.requirement.create(db, obj_in=requirement_in)
    return requirement


@router.get("/{requirement_id}", response_model=schemas.RequirementWithDetails)
async def get_requirement(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить требование по ID с подробной информацией.

    Args:
        requirement_id: ID требования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.RequirementWithDetails: Требование с дополнительной информацией

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get_with_details(
        db, requirement_id=requirement_id
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Требование не найдено"
        )
    return requirement


@router.put("/{requirement_id}", response_model=schemas.Requirement)
async def update_requirement(
    requirement_id: int,
    requirement_in: schemas.RequirementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Обновить данные требования.

    Args:
        requirement_id: ID требования
        requirement_in: Обновленные данные требования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Requirement: Обновленное требование

    Raises:
        HTTPException: Если требование не найдено или ссылочные данные некорректны
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Требование не найдено"
        )

    # Проверяем ссылочные данные, если они изменяются
    if (
        requirement_in.project_id
        and requirement_in.project_id != requirement.project_id
    ):
        project = await crud.project.get(db, id=requirement_in.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
            )

    if requirement_in.type_id and requirement_in.type_id != requirement.type_id:
        req_type = await crud.requirement_type.get(db, id=requirement_in.type_id)
        if not req_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Тип требования не найден"
            )

    if (
        requirement_in.priority_id
        and requirement_in.priority_id != requirement.priority_id
    ):
        priority = await crud.requirement_priority.get(
            db, id=requirement_in.priority_id
        )
        if not priority:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Приоритет требования не найден",
            )

    if requirement_in.status_id and requirement_in.status_id != requirement.status_id:
        status_obj = await crud.requirement_status.get(db, id=requirement_in.status_id)
        if not status_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Статус требования не найден",
            )

    requirement = await crud.requirement.update(
        db, db_obj=requirement, obj_in=requirement_in
    )
    return requirement


@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Удалить требование.

    Args:
        requirement_id: ID требования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Требование не найдено"
        )

    await crud.requirement.remove(db, id=requirement_id)


@router.post("/{requirement_id}/change-status", response_model=schemas.Requirement)
async def change_requirement_status(
    requirement_id: int,
    status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Изменить статус требования.

    Args:
        requirement_id: ID требования
        status_id: ID нового статуса
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Requirement: Требование с обновленным статусом

    Raises:
        HTTPException: Если требование или статус не найдены
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Требование не найдено"
        )

    # Проверяем существование статуса
    status_obj = await crud.requirement_status.get(db, id=status_id)
    if not status_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Статус требования не найден"
        )

    requirement = await crud.requirement.update_status(
        db, requirement_id=requirement_id, status_id=status_id
    )
    return requirement


@router.get("/{requirement_id}/tests", response_model=List[schemas.TestResult])
async def get_requirement_tests(
    requirement_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить результаты тестов для требования.

    Args:
        requirement_id: ID требования
        skip: Количество пропускаемых записей
        limit: Максимальное количество записей
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.TestResult]: Список результатов тестов

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Требование не найдено"
        )

    tests = await crud.test_result.get_by_requirement(
        db, requirement_id=requirement_id, skip=skip, limit=limit
    )
    return tests


@router.get(
    "/{requirement_id}/relationships", response_model=List[schemas.Relationship]
)
async def get_requirement_relationships(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить связи требования с другими требованиями.

    Args:
        requirement_id: ID требования
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Relationship]: Список связей

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Требование не найдено"
        )

    relationships = await crud.relationship.get_by_requirement(
        db, requirement_id=requirement_id
    )
    return relationships


@router.post(
    "/{requirement_id}/relationships",
    response_model=schemas.Relationship,
    status_code=status.HTTP_201_CREATED,
)
async def create_requirement_relationship(
    requirement_id: int,
    relationship_in: schemas.RelationshipCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Создать связь между требованиями.

    Args:
        requirement_id: ID исходного требования
        relationship_in: Данные создаваемой связи
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Relationship: Созданная связь

    Raises:
        HTTPException: Если требования или тип связи не найдены
    """
    # Проверяем существование исходного требования
    source_requirement = await crud.requirement.get(db, id=requirement_id)
    if not source_requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Исходное требование не найдено",
        )

    # Проверяем существование целевого требования
    target_requirement = await crud.requirement.get(
        db, id=relationship_in.target_requirement_id
    )
    if not target_requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Целевое требование не найдено",
        )

    # Проверяем существование типа связи
    relationship_type = await crud.relationship_type.get(db, id=relationship_in.type_id)
    if not relationship_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Тип связи не найден"
        )

    # Устанавливаем ID исходного требования
    relationship_in.source_requirement_id = requirement_id

    relationship = await crud.relationship.create(db, obj_in=relationship_in)
    return relationship
