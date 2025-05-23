"""
API эндпоинты для работы с пользователями.

Включает операции CRUD для пользователей системы.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.api.deps import get_db, get_current_user, get_superuser
from requify.app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Получить список пользователей.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[dict]: Список пользователей
    """
    # TODO: Реализовать получение пользователей из БД
    return [
        {
            "id": 1,
            "email": "admin@requify.local",
            "name": "Admin User",
            "is_active": True,
            "is_superuser": True,
        }
    ]


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_superuser),
):
    """
    Создать нового пользователя.

    Args:
        user_data: Данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        dict: Созданный пользователь
    """
    # TODO: Реализовать создание пользователя
    return {
        "id": 2,
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "is_active": True,
        "is_superuser": False,
    }


@router.get("/{user_id}", response_model=dict)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Получить пользователя по ID.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Данные пользователя

    Raises:
        HTTPException: Если пользователь не найден
    """
    # TODO: Реализовать получение пользователя по ID
    if user_id != 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {
        "id": 1,
        "email": "admin@requify.local",
        "name": "Admin User",
        "is_active": True,
        "is_superuser": True,
    }


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int,
    user_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Обновить данные пользователя.

    Args:
        user_id: ID пользователя
        user_data: Обновленные данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Обновленные данные пользователя

    Raises:
        HTTPException: Если пользователь не найден
    """
    # TODO: Реализовать обновление пользователя
    if user_id != 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {
        "id": user_id,
        "email": user_data.get("email", "admin@requify.local"),
        "name": user_data.get("name", "Admin User"),
        "is_active": user_data.get("is_active", True),
        "is_superuser": True,
    }


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_superuser),
):
    """
    Удалить пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Raises:
        HTTPException: Если пользователь не найден
    """
    # TODO: Реализовать удаление пользователя
    if user_id != 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Пока ничего не удаляем, только возвращаем успешный статус
    pass


@router.get("/me/", response_model=dict)
async def get_current_user_info(current_user=Depends(get_current_user)):
    """
    Получить информацию о текущем пользователе.

    Args:
        current_user: Текущий пользователь

    Returns:
        dict: Информация о текущем пользователе
    """
    return current_user
