"""
Password Management Router.

Роутер для операций с паролями: смена, сброс, подтверждение.
"""

from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.v1.domains.auth.password.schemas import (
    PasswordChangeRequest,
    PasswordChangeResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    PasswordResetConfirm,
    PasswordResetConfirmResponse,
)

from app.services.password_service import PasswordService

router = APIRouter()


@router.post(
    "/change", response_model=PasswordChangeResponse, summary="Change Password"
)
async def change_password(
    request: PasswordChangeRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Change user password.

    - **current_password**: Current user password
    - **new_password**: New password (minimum 8 characters)
    - **confirm_password**: Password confirmation
    """
    try:
        await PasswordService.change_password(
            db=db,
            user=current_user,
            current_password=request.current_password,
            new_password=request.new_password,
        )

        return PasswordChangeResponse(
            message="Password changed successfully",
            password_changed=True,
        )

    except Exception as e:
        if "invalid" in str(e).lower() or "incorrect" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password",
        )


@router.post(
    "/reset", response_model=PasswordResetResponse, summary="Request Password Reset"
)
async def request_password_reset(
    request: PasswordResetRequest,
    *,
    db: SessionDep,
):
    """
    Request password reset by email.

    - **email**: User email address
    """
    try:
        await PasswordService.request_password_reset(
            db=db,
            email=request.email,
        )

        return PasswordResetResponse(
            message="Password reset email sent successfully",
            reset_token_sent=True,
        )

    except Exception as e:
        # Always return success for security reasons (don't reveal if email exists)
        return PasswordResetResponse(
            message="If the email exists in our system, you will receive a password reset link",
            reset_token_sent=True,
        )


@router.post(
    "/reset/confirm",
    response_model=PasswordResetConfirmResponse,
    summary="Confirm Password Reset",
)
async def confirm_password_reset(
    request: PasswordResetConfirm,
    *,
    db: SessionDep,
):
    """
    Confirm password reset with token.

    - **token**: Password reset token
    - **new_password**: New password (minimum 8 characters)
    - **confirm_password**: Password confirmation
    """
    try:
        await PasswordService.reset_password_with_token(
            db=db,
            token=request.token,
            new_password=request.new_password,
        )

        return PasswordResetConfirmResponse(
            message="Password reset successfully",
            password_changed=True,
        )

    except Exception as e:
        if "invalid" in str(e).lower() or "expired" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password",
        )
