"""
OAuth2 Authentication Router.

Роутер для OAuth2 интеграции (Auth0, Google, GitHub и др.).
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, SessionDep
from app.api.v1.domains.auth.oauth2.schemas import (
    OAuth2AuthorizeRequest,
    OAuth2AuthorizeResponse,
    OAuth2CallbackRequest,
    OAuth2CallbackResponse,
    OAuth2LinkRequest,
    OAuth2LinkResponse,
    OAuth2UnlinkRequest,
    OAuth2UnlinkResponse,
)
from app.models.user import User
from app.services.auth0_service import Auth0Service

router = APIRouter()


@router.post(
    "/authorize", response_model=OAuth2AuthorizeResponse, summary="OAuth2 Authorize"
)
async def oauth2_authorize(
    request: OAuth2AuthorizeRequest,
):
    """
    Initialize OAuth2 authorization flow.

    - **provider**: OAuth2 provider (auth0, google, github, microsoft)
    - **redirect_uri**: Optional redirect URI
    - **state**: Optional state parameter for CSRF protection
    """
    try:
        if request.provider == "auth0":
            authorization_data = await Auth0Service.get_authorization_url(
                redirect_uri=request.redirect_uri,
                state=request.state,
            )
        else:
            # TODO: Implement other providers
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"Provider {request.provider} not implemented yet",
            )

        return OAuth2AuthorizeResponse(
            authorization_url=authorization_data["authorization_url"],
            state=authorization_data["state"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post(
    "/callback/{provider}",
    response_model=OAuth2CallbackResponse,
    summary="OAuth2 Callback",
)
async def oauth2_callback(
    provider: str,
    request: OAuth2CallbackRequest,
    db: SessionDep,
):
    """
    Handle OAuth2 callback from provider.

    - **provider**: OAuth2 provider
    - **code**: Authorization code from provider
    - **state**: State parameter for CSRF protection
    """
    try:
        if request.error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"OAuth2 error: {request.error} - {request.error_description}",
            )

        if provider == "auth0":
            auth_result = await Auth0Service.handle_callback(
                db=db,
                code=request.code,
                state=request.state,
            )
        else:
            # TODO: Implement other providers
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"Provider {provider} not implemented yet",
            )

        # Get detailed user info
        from app.schemas.user import UserDetailed

        user_detailed = UserDetailed.model_validate(auth_result["user"])

        return OAuth2CallbackResponse(
            access_token=auth_result["access_token"],
            refresh_token=auth_result["refresh_token"],
            token_type="bearer",
            expires_in=auth_result["expires_in"],
            refresh_expires_in=auth_result.get("refresh_expires_in"),
            user=user_detailed,
            is_new_user=auth_result.get("is_new_user", False),
        )

    except Exception as e:
        if "invalid" in str(e).lower() or "expired" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth2 authentication failed",
        )


@router.post("/link", response_model=OAuth2LinkResponse, summary="Link OAuth2 Account")
async def link_oauth2_account(
    db: SessionDep,
    request: OAuth2LinkRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Link OAuth2 account to current user.

    - **provider**: OAuth2 provider
    - **access_token**: Access token from provider
    """
    try:
        if request.provider == "auth0":
            await Auth0Service.link_account(
                db=db,
                user=current_user,
                access_token=request.access_token,
            )
        else:
            # TODO: Implement other providers
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"Provider {request.provider} not implemented yet",
            )

        return OAuth2LinkResponse(
            message="OAuth2 account linked successfully",
            linked=True,
            provider=request.provider,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post(
    "/unlink", response_model=OAuth2UnlinkResponse, summary="Unlink OAuth2 Account"
)
async def unlink_oauth2_account(
    db: SessionDep,
    request: OAuth2UnlinkRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Unlink OAuth2 account from current user.

    - **provider**: OAuth2 provider to unlink
    """
    try:
        if request.provider == "auth0":
            await Auth0Service.unlink_account(
                db=db,
                user=current_user,
            )
        else:
            # TODO: Implement other providers
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"Provider {request.provider} not implemented yet",
            )

        return OAuth2UnlinkResponse(
            message="OAuth2 account unlinked successfully",
            unlinked=True,
            provider=request.provider,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
