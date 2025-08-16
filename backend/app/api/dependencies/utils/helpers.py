"""
Helper utilities for dependencies.

Вспомогательные функции для работы с dependencies.
"""

from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import user as crud_user
from app.models.user import User
from app.core.exceptions import UserNotFoundError


async def get_user_by_id_or_404(db: AsyncSession, user_id: int) -> User:
    """
    Get user by ID or raise 404.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        User: User object

    Raises:
        UserNotFoundError: If user not found
    """
    user = await crud_user.get(db, id=user_id)
    if user is None:
        raise UserNotFoundError(user_id)
    return user


async def get_user_by_email_or_404(db: AsyncSession, email: str) -> User:
    """
    Get user by email or raise 404.

    Args:
        db: Database session
        email: User email

    Returns:
        User: User object

    Raises:
        UserNotFoundError: If user not found
    """
    user = await crud_user.get_by_email(db, email=email)
    if user is None:
        raise UserNotFoundError(email)
    return user


async def get_user_by_username_or_404(db: AsyncSession, username: str) -> User:
    """
    Get user by username or raise 404.

    Args:
        db: Database session
        username: Username

    Returns:
        User: User object

    Raises:
        UserNotFoundError: If user not found
    """
    user = await crud_user.get_by_username(db, username=username)
    if user is None:
        raise UserNotFoundError(username)
    return user


def validate_user_active(user: User) -> None:
    """
    Validate that user is active.

    Args:
        user: User object

    Raises:
        HTTPException: If user is inactive
    """
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )


def validate_user_email_verified(user: User) -> None:
    """
    Validate that user email is verified.

    Args:
        user: User object

    Raises:
        HTTPException: If email not verified
    """
    if not getattr(user, "is_email_verified", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required",
        )


def validate_user_not_banned(user: User) -> None:
    """
    Validate that user is not banned.

    Args:
        user: User object

    Raises:
        HTTPException: If user is banned
    """
    if getattr(user, "is_banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is banned",
        )
