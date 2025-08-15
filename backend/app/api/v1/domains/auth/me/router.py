"""
Current User (Me) Router.

Роутер для операций с данными текущего пользователя.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.domains.auth.me.schemas import (
    CurrentUserResponse,
    AccountStatusResponse,
)
from app.models.user import User
from app.api.dependencies import CurrentUserDep, SessionDep

router = APIRouter()


@router.get("/", response_model=CurrentUserResponse, summary="Get Current User Info")
async def get_current_user_info(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Get information about current authenticated user.
    """
    # Get detailed user info with fresh session context
    from app.crud import user as crud_user
    from app.schemas.user import UserDetailed

    fresh_user = await crud_user.get_by_email_with_profile(db, email=current_user.email)
    if not fresh_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_detailed = UserDetailed.model_validate(fresh_user)

    return CurrentUserResponse(
        user=user_detailed,
    )


@router.get(
    "/status", response_model=AccountStatusResponse, summary="Get Account Status"
)
async def get_account_status(
    current_user: CurrentUserDep,
):
    """
    Get current user account status information.
    """
    return AccountStatusResponse(
        is_active=current_user.is_active,
        email_verified=current_user.is_email_verified,
        two_factor_enabled=getattr(current_user, "two_factor_enabled", False),
        last_login=current_user.last_login_at,
        account_locked=not current_user.is_active,
        lock_reason=None if current_user.is_active else "Account deactivated",
    )
