"""
API эндпоинты для работы со справочными данными.

Включает операции для типов, приоритетов, статусов требований и типов связей.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user, get_admin_user
from app import crud, schemas
from app.models.user import User

router = APIRouter()


# Типы требований
@router.get("/requirement-types", response_model=List[schemas.RequirementType])
async def get_requirement_types(
    skip: int = 0,
    limit: int = 100,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """Получить список типов требований."""
    types = await crud.requirement_type.get_active_types(db, skip=skip, limit=limit)
    return types


@router.post(
    "/requirement-types",
    response_model=schemas.RequirementType,
    status_code=status.HTTP_201_CREATED,
)
async def create_requirement_type(
    type_in: schemas.RequirementTypeCreate,
    db: SessionDep,
    current_user: User = Depends(AdminPermissions.write()),
):
    """Создать новый тип требования."""
    # Проверяем уникальность названия
    existing_type = await crud.requirement_type.get_by_name(db, name=type_in.name)
    if existing_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Тип с таким названием уже существует",
        )

    req_type = await crud.requirement_type.create(db, obj_in=type_in)
    return req_type


# Приоритеты требований
@router.get("/requirement-priorities", response_model=List[schemas.RequirementPriority])
async def get_requirement_priorities(
    skip: int = 0,
    limit: int = 100,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """Получить список приоритетов требований."""
    priorities = await crud.requirement_priority.get_active_priorities(
        db, skip=skip, limit=limit
    )
    return priorities


@router.post(
    "/requirement-priorities",
    response_model=schemas.RequirementPriority,
    status_code=status.HTTP_201_CREATED,
)
async def create_requirement_priority(
    priority_in: schemas.RequirementPriorityCreate,
    db: SessionDep,
    current_user: User = Depends(AdminPermissions.write()),
):
    """Создать новый приоритет требования."""
    # Проверяем уникальность названия
    existing_priority = await crud.requirement_priority.get_by_name(
        db, name=priority_in.name
    )
    if existing_priority:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Приоритет с таким названием уже существует",
        )

    priority = await crud.requirement_priority.create(db, obj_in=priority_in)
    return priority


# Статусы требований
@router.get("/requirement-statuses", response_model=List[schemas.RequirementStatus])
async def get_requirement_statuses(
    skip: int = 0,
    limit: int = 100,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """Получить список статусов требований."""
    statuses = await crud.requirement_status.get_active_statuses(
        db, skip=skip, limit=limit
    )
    return statuses


@router.post(
    "/requirement-statuses",
    response_model=schemas.RequirementStatus,
    status_code=status.HTTP_201_CREATED,
)
async def create_requirement_status(
    status_in: schemas.RequirementStatusCreate,
    db: SessionDep,
    current_user: User = Depends(AdminPermissions.write()),
):
    """Создать новый статус требования."""
    # Проверяем уникальность названия
    existing_status = await crud.requirement_status.get_by_name(db, name=status_in.name)
    if existing_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Статус с таким названием уже существует",
        )

    req_status = await crud.requirement_status.create(db, obj_in=status_in)
    return req_status


# Типы связей
@router.get("/relationship-types", response_model=List[schemas.RelationshipType])
async def get_relationship_types(
    skip: int = 0,
    limit: int = 100,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """Получить список типов связей между требованиями."""
    relationship_types = await crud.relationship_type.get_active_types(
        db, skip=skip, limit=limit
    )
    return relationship_types


@router.post(
    "/relationship-types",
    response_model=schemas.RelationshipType,
    status_code=status.HTTP_201_CREATED,
)
async def create_relationship_type(
    type_in: schemas.RelationshipTypeCreate,
    db: SessionDep,
    current_user: User = Depends(AdminPermissions.write()),
):
    """Создать новый тип связи."""
    # Проверяем уникальность названия
    existing_type = await crud.relationship_type.get_by_name(db, name=type_in.name)
    if existing_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Тип связи с таким названием уже существует",
        )

    rel_type = await crud.relationship_type.create(db, obj_in=type_in)
    return rel_type
