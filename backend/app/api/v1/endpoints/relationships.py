"""
API эндпоинты для работы со связями между требованиями.

Включает операции CRUD для связей и управление зависимостями между требованиями.
"""

from datetime import datetime, UTC
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_current_active_user,
    get_requirements_read_user,
    get_requirements_write_user,
    get_requirements_delete_user,
)
from app.core.config import settings
from app import crud, schemas
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[schemas.Relationship])
async def get_relationships(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    source_id: Optional[int] = Query(
        None, description="Фильтр по исходному требованию"
    ),
    target_id: Optional[int] = Query(
        None, description="Фильтр по целевому требованию"
    ),
    type_id: Optional[int] = Query(
        None, description="Фильтр по типу связи"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить список связей между требованиями.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        source_id: Фильтр по исходному требованию
        target_id: Фильтр по целевому требованию
        type_id: Фильтр по типу связи
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Relationship]: Список связей
    """
    # Build filters using the model field names
    filters = {}
    if source_id:
        filters["source_id"] = source_id
    if target_id:
        filters["target_id"] = target_id
    if type_id:
        filters["type_id"] = type_id

    relationships = await crud.relationship.get_multi(
        db, skip=skip, limit=limit, filters=filters
    )
    return relationships


@router.post(
    "/", response_model=schemas.Relationship, status_code=status.HTTP_201_CREATED
)
async def create_relationship(
    relationship_in: schemas.RelationshipCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Создать новую связь между требованиями.

    Args:
        relationship_in: Данные создаваемой связи
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Relationship: Созданная связь

    Raises:
        HTTPException: Если требования или тип связи не найдены, или связь уже существует
    """
    # Проверяем существование исходного требования
    source_req = await crud.requirement.get(
        db, id=relationship_in.source_id
    )
    if not source_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Исходное требование не найдено",
        )

    # Проверяем существование целевого требования
    target_req = await crud.requirement.get(
        db, id=relationship_in.target_id
    )
    if not target_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Целевое требование не найдено",
        )

    # Проверяем, что требования не одинаковые
    if relationship_in.source_id == relationship_in.target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя создать связь требования с самим собой",
        )

    # Проверяем существование типа связи
    rel_type = await crud.relationship_type.get(
        db, id=relationship_in.type_id
    )
    if not rel_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тип связи не найден",
        )

    # Create relationship with correct field names for the model
    relationship_data = {
        "source_id": relationship_in.source_id,
        "target_id": relationship_in.target_id,
        "type_id": relationship_in.type_id,
    }

    relationship = await crud.relationship.create(db, obj_in=relationship_data)
    return relationship


@router.get("/{relationship_id}", response_model=schemas.Relationship)
async def get_relationship(
    relationship_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить связь по ID.

    Args:
        relationship_id: ID связи
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Relationship: Данные связи

    Raises:
        HTTPException: Если связь не найдена
    """
    relationship = await crud.relationship.get(db, id=relationship_id)
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Связь не найдена",
        )
    return relationship


@router.put("/{relationship_id}", response_model=schemas.Relationship)
async def update_relationship(
    relationship_id: int,
    relationship_in: schemas.RelationshipUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Обновить связь между требованиями.

    Args:
        relationship_id: ID связи
        relationship_in: Данные для обновления
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Relationship: Обновленная связь

    Raises:
        HTTPException: Если связь не найдена
    """
    relationship = await crud.relationship.get(db, id=relationship_id)
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Связь не найдена",
        )

    # Если меняется тип связи, проверяем его существование
    if relationship_in.type_id:
        rel_type = await crud.relationship_type.get(
            db, id=relationship_in.type_id
        )
        if not rel_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Тип связи не найден",
            )

    relationship = await crud.relationship.update(
        db, db_obj=relationship, obj_in=relationship_in
    )
    return relationship


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_relationship(
    relationship_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_delete_user),
):
    """
    Удалить связь между требованиями.

    Args:
        relationship_id: ID связи
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если связь не найдена
    """
    relationship = await crud.relationship.get(db, id=relationship_id)
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Связь не найдена",
        )

    await crud.relationship.remove(db, id=relationship_id)


# Эндпоинты для работы со связями конкретного требования


@router.get(
    "/requirements/{requirement_id}/relationships",
    response_model=List[schemas.Relationship],
)
async def get_requirement_relationships(
    requirement_id: int,
    direction: str = Query(
        "all", description="Направление связей: outgoing, incoming, all"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить все связи требования.

    Args:
        requirement_id: ID требования
        direction: Направление связей (outgoing, incoming, all)
        skip: Количество пропускаемых записей
        limit: Максимальное количество записей
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Relationship]: Список связей требования

    Raises:
        HTTPException: Если требование не найдено
    """
    # Проверяем существование требования
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Требование не найдено",
        )

    if direction == "outgoing":
        relationships = await crud.relationship.get_outgoing_relationships(
            db, requirement_id=requirement_id, skip=skip, limit=limit
        )
    elif direction == "incoming":
        relationships = await crud.relationship.get_incoming_relationships(
            db, requirement_id=requirement_id, skip=skip, limit=limit
        )
    else:  # all
        relationships = await crud.relationship.get_all_relationships(
            db, requirement_id=requirement_id, skip=skip, limit=limit
        )

    return relationships


@router.post(
    "/requirements/{requirement_id}/relationships", response_model=schemas.Relationship
)
async def create_requirement_relationship(
    requirement_id: int,
    relationship_in: schemas.RelationshipCreateForRequirement,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Создать связь для конкретного требования.

    Args:
        requirement_id: ID исходного требования
        relationship_in: Данные связи (без source_requirement_id)
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Relationship: Созданная связь
    """
    # Создаем полную схему связи
    full_relationship = schemas.RelationshipCreate(
        source_id=requirement_id,
        target_id=relationship_in.target_id,
        type_id=relationship_in.type_id,
        description=relationship_in.description,
    )

    # Используем основную функцию создания связи
    return await create_relationship(full_relationship, db, current_user)


@router.get(
    "/requirements/{requirement_id}/dependencies",
    response_model=List[schemas.Requirement],
)
async def get_requirement_dependencies(
    requirement_id: int,
    recursive: bool = Query(False, description="Получить все зависимости рекурсивно"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить зависимости требования (требования, от которых зависит данное).

    Args:
        requirement_id: ID требования
        recursive: Получить все зависимости рекурсивно
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список требований-зависимостей

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Требование не найдено",
        )

    if recursive:
        dependencies = await crud.relationship.get_all_dependencies_recursive(
            db, requirement_id=requirement_id
        )
    else:
        dependencies = await crud.relationship.get_direct_dependencies(
            db, requirement_id=requirement_id
        )

    return dependencies


@router.get(
    "/requirements/{requirement_id}/dependents",
    response_model=List[schemas.Requirement],
)
async def get_requirement_dependents(
    requirement_id: int,
    recursive: bool = Query(
        False, description="Получить все зависимые требования рекурсивно"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить зависимые требования (требования, которые зависят от данного).

    Args:
        requirement_id: ID требования
        recursive: Получить все зависимые требования рекурсивно
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список зависимых требований

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Требование не найдено",
        )

    if recursive:
        dependents = await crud.relationship.get_all_dependents_recursive(
            db, requirement_id=requirement_id
        )
    else:
        dependents = await crud.relationship.get_direct_dependents(
            db, requirement_id=requirement_id
        )

    return dependents


@router.get(
    "/requirements/{requirement_id}/trace-matrix", response_model=schemas.TraceMatrix
)
async def get_requirement_trace_matrix(
    requirement_id: int,
    depth: int = Query(3, ge=1, le=10, description="Глубина трассировки"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить матрицу трассируемости для требования.

    Args:
        requirement_id: ID требования
        depth: Глубина трассировки
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Матрица трассируемости

    Raises:
        HTTPException: Если требование не найдено
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Требование не найдено",
        )

    trace_matrix = await crud.relationship.build_trace_matrix(
        db, requirement_id=requirement_id, depth=depth
    )

    return schemas.TraceMatrix(
        requirement_id=requirement_id,
        requirement_title=requirement.title,
        depth=depth,
        matrix=trace_matrix,
        generated_at=datetime.now(UTC).isoformat() + "Z",
    )
