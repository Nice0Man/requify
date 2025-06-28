"""
API эндпоинты для работы с пользователями.

Включает операции CRUD для пользователей системы.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_current_active_user,
    get_users_read_user,
    get_users_write_user,
    get_users_delete_user,
    get_superuser,
)
from app.core.config import settings
from app import crud, schemas
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
async def get_users(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    is_active: Optional[bool] = Query(None, description="Фильтр по статусу активности"),
    role: Optional[str] = Query(None, description="Фильтр по роли"),
    search: Optional[str] = Query(None, description="Поиск по email или имени"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить список пользователей с фильтрацией.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        is_active: Фильтр по статусу активности
        role: Фильтр по роли пользователя
        search: Поисковый запрос
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.User]: Список пользователей
    """
    if search:
        users = await crud.user.search_users(
            db, search_term=search, skip=skip, limit=limit
        )
    elif role:
        users = await crud.user.get_by_role(db, role=role, skip=skip, limit=limit)
    elif is_active is not None:
        users = await crud.user.get_by_active_status(
            db, is_active=is_active, skip=skip, limit=limit
        )
    else:
        users = await crud.user.get_multi(db, skip=skip, limit=limit)

    return users


@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_write_user),
):
    """
    Создать нового пользователя.

    Args:
        user_in: Данные создаваемого пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен иметь права users:write)

    Returns:
        schemas.User: Созданный пользователь

    Raises:
        HTTPException: Если пользователь с таким email уже существует
    """
    # Проверяем уникальность email
    existing_user = await crud.user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    # Проверяем уникальность username, если указан
    if user_in.username:
        existing_username = await crud.user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует",
            )

    user = await crud.user.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=schemas.User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Получить информацию о текущем пользователе.

    Args:
        current_user: Текущий пользователь

    Returns:
        schemas.User: Информация о текущем пользователе
    """
    return current_user


@router.put("/me", response_model=schemas.User)
async def update_current_user(
    user_in: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Обновить данные текущего пользователя.

    Args:
        user_in: Обновленные данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.User: Обновленный пользователь

    Raises:
        HTTPException: Если email или username уже используются
    """
    # Проверяем уникальность email, если изменился
    if user_in.email and user_in.email != current_user.email:
        existing_user = await crud.user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

    # Проверяем уникальность username, если изменился
    if user_in.username and user_in.username != current_user.username:
        existing_username = await crud.user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует",
            )

    user = await crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.get("/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить пользователя по ID.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.User: Данные пользователя

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_write_user),
):
    """
    Обновить данные пользователя.

    Args:
        user_id: ID пользователя
        user_in: Обновленные данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.User: Обновленный пользователь

    Raises:
        HTTPException: Если пользователь не найден или email/username уже используются
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Проверяем уникальность email, если изменился
    if user_in.email and user_in.email != user.email:
        existing_user = await crud.user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

    # Проверяем уникальность username, если изменился
    if user_in.username and user_in.username != user.username:
        existing_username = await crud.user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует",
            )

    user = await crud.user.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_delete_user),
):
    """
    Удалить пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен иметь права users:delete)

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    await crud.user.remove(db, id=user_id)


@router.post("/{user_id}/activate", response_model=schemas.User)
async def activate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_superuser),
):
    """
    Активировать пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        schemas.User: Активированный пользователь

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    user = await crud.user.activate(db, user_id=user_id)
    return user


@router.post("/{user_id}/deactivate", response_model=schemas.User)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_superuser),
):
    """
    Деактивировать пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        schemas.User: Деактивированный пользователь

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    user = await crud.user.deactivate(db, user_id=user_id)
    return user
