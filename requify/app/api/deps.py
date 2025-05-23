"""
Зависимости для API (Dependency Injection).

Этот модуль содержит все зависимости, используемые в API endpoints,
следуя принципу Dependency Inversion из SOLID.
"""

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.core.config import settings
from requify.app.db.db_helper import get_async_session

# Схема безопасности
security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость для получения сессии базы данных.

    Yields:
        AsyncSession: Асинхронная сессия SQLAlchemy
    """
    async with get_async_session() as session:
        yield session


async def get_current_user(
    token: str = Depends(security), session: AsyncSession = Depends(get_db)
):
    """
    Зависимость для получения текущего пользователя из токена.

    Args:
        token: JWT токен из заголовка Authorization
        session: Сессия базы данных

    Returns:
        User: Объект пользователя

    Raises:
        HTTPException: Если токен недействителен
    """
    # TODO: Реализовать проверку токена и получение пользователя
    # Пока заглушка
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Здесь будет логика проверки токена
    # user = await verify_token(token.credentials, session)
    # if user is None:
    #     raise credentials_exception
    # return user

    # Временная заглушка
    return {"id": 1, "email": "admin@requify.local"}


async def get_superuser(current_user=Depends(get_current_user)):
    """
    Зависимость для проверки прав суперпользователя.

    Args:
        current_user: Текущий пользователь

    Returns:
        User: Объект пользователя с правами суперпользователя

    Raises:
        HTTPException: Если пользователь не является суперпользователем
    """
    # TODO: Проверить права суперпользователя
    # if not current_user.is_superuser:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="The user doesn't have enough privileges"
    #     )
    return current_user
