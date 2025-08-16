"""
Email Verification Router.

Роутер для верификации email адресов.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import SessionDep
from app.api.v1.domains.auth.email.schemas import (
    EmailVerificationRequest,
    EmailVerificationResponse,
    EmailVerificationConfirm,
    EmailVerificationConfirmResponse,
)
from app.services.email_service import EmailService

router = APIRouter()


@router.post(
    "/request",
    response_model=EmailVerificationResponse,
    summary="Request Email Verification",
)
async def request_email_verification(
    request: EmailVerificationRequest,
    db: SessionDep,
):
    """
    Request email verification token.

    - **email**: Email address to verify
    """
    try:
        await EmailService.send_verification_email(
            db=db,
            email=request.email,
        )

        return EmailVerificationResponse(
            message="Verification email sent successfully",
            verification_token_sent=True,
        )

    except Exception as e:
        # For security, always return success even if email doesn't exist
        return EmailVerificationResponse(
            message="If the email exists in our system, you will receive a verification link",
            verification_token_sent=True,
        )


@router.post(
    "/confirm",
    response_model=EmailVerificationConfirmResponse,
    summary="Confirm Email Verification",
)
async def confirm_email_verification(
    request: EmailVerificationConfirm,
    db: SessionDep,
):
    """
    Confirm email verification with token.

    - **token**: Email verification token
    """
    try:
        user = await EmailService.verify_email_with_token(
            db=db,
            token=request.token,
        )

        # Get detailed user info
        user_detailed = None
        if user:
            from app.schemas.user import UserDetailed

            user_detailed = UserDetailed.model_validate(user)

        return EmailVerificationConfirmResponse(
            message="Email verified successfully",
            verified=True,
            user=user_detailed,
        )

    except Exception as e:
        if "invalid" in str(e).lower() or "expired" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify email",
        )
