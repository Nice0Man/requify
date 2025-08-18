"""
Session Management Router.

Роутер для управления сессиями пользователей.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.v1.domains.auth.sessions.schemas import (
    SessionListResponse,
    RevokeSessionRequest,
    RevokeSessionResponse,
)
from app.services.session_service import SessionService

router = APIRouter()


@router.get("/", response_model=SessionListResponse, summary="Get User Sessions")
async def get_user_sessions(
    db: SessionDep,
    current_user: CurrentUserDep,
    request: Request = None,
    active_only: bool = True,
):
    """
    Get list of user active sessions.

    - **active_only**: Only return active sessions
    """
    try:
        sessions = await SessionService.get_user_sessions(
            db=db,
            user=current_user,
            request=request,
            active_only=active_only,
        )

        # Find current session
        current_session_id = None
        for session in sessions:
            if session.is_current:
                current_session_id = session.id
                break

        return SessionListResponse(
            sessions=sessions,
            total=len(sessions),
            current_session_id=current_session_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/revoke", response_model=RevokeSessionResponse, summary="Revoke Sessions")
async def revoke_sessions(
    db: SessionDep,
    request: RevokeSessionRequest,
    current_user: CurrentUserDep,
    request_obj: Request = None,
):
    """
    Revoke user sessions.

    - **session_id**: Specific session ID to revoke (optional)
    - **revoke_all**: Revoke all sessions
    - **except_current**: Keep current session when revoking all
    """
    try:
        revoked_count = await SessionService.revoke_user_sessions(
            db=db,
            user=current_user,
            request=request_obj,
            session_id=request.session_id,
            revoke_all=request.revoke_all,
            except_current=request.except_current,
        )

        message = "Session revoked successfully"
        if request.revoke_all:
            if request.except_current:
                message = (
                    f"All sessions except current revoked ({revoked_count} sessions)"
                )
            else:
                message = f"All sessions revoked ({revoked_count} sessions)"
        elif request.session_id:
            message = "Specific session revoked"

        return RevokeSessionResponse(
            message=message,
            revoked_sessions=revoked_count,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
