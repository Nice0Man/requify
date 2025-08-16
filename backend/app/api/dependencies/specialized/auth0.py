"""
Auth0 specialized dependencies.

Специализированные dependencies для интеграции с Auth0.
"""

from typing import Optional
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services import auth0_service
from app.crud import user as crud_user
from ..core.database import SessionDep


async def get_user_from_auth0_token(
    token: str,
    db: SessionDep,
) -> Optional[User]:
    """
    Get user from Auth0 token.

    Integrates with Auth0 service for external authentication.

    Args:
        token: Auth0 JWT token
        db: Database session

    Returns:
        Optional[User]: User object or None if invalid token
    """
    if not auth0_service.is_enabled:
        return None

    # Validate token and get user info
    user_info = auth0_service.get_user_info(token)
    if not user_info:
        return None

    # Find user in local database by Auth0 ID
    user = await crud_user.get_by_auth0_id(db, auth0_id=user_info.sub)

    # Create new user if not found but email exists
    if not user and user_info.email:
        existing_user = await crud_user.get_by_email(db, email=user_info.email)

        if existing_user:
            # Link existing user to Auth0
            user = await crud_user.update(
                db, db_obj=existing_user, obj_in={"auth0_id": user_info.sub}
            )
        else:
            # Create new user from Auth0 data
            from app.schemas.user import UserCreate

            user_data = UserCreate(
                email=user_info.email,
                name=user_info.name or user_info.email.split("@")[0],
                username=user_info.nickname or user_info.email.split("@")[0],
                password="",  # Auth0 users don't need passwords
                is_active=True,
                auth0_id=user_info.sub,
            )
            user = await crud_user.create(db, obj_in=user_data)

    return user
