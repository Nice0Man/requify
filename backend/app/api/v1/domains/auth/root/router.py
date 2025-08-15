"""
Root Authentication Router.

Роутер для основных операций аутентификации: login, register, logout, refresh token.
"""

from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import CurrentUserDep, SessionDep
from app.api.v1.domains.auth.root.schemas import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    LogoutRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    TokenValidationRequest,
    TokenValidationResponse,
)
from app.services.auth_service import AuthService
from app.services.token_service import TokenService
from app.services.user_registration_service import UserRegistrationService
from app.crud import user as crud_user

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="Authenticate User")
async def login(
    db: SessionDep,
    request_obj: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    Authenticate user and return JWT tokens.

    - **email**: User email
    - **password**: User password
    - **remember_me**: Whether to extend token lifetime
    """
    try:
        # Authenticate user
        user = await AuthService.authenticate_user(
            db=db,
            email=form_data.username,  # OAuth2PasswordRequestForm uses username field for email
            password=form_data.password,
        )

        # Generate tokens
        remember_me = hasattr(form_data, "remember_me") and form_data.remember_me
        tokens = await TokenService.create_tokens_for_user(
            db=db,
            user=user,
            request=request_obj,
            remember_me=remember_me,
        )

        # Update last login timestamp
        await AuthService.update_last_login(db, user)

        # Get detailed user info - reload with fresh session context
        fresh_user = await crud_user.get_by_email_with_profile(db, email=user.email)
        if not fresh_user:
            raise HTTPException(status_code=404, detail="User not found")

        from app.schemas.user import UserDetailed

        user_detailed = UserDetailed.model_validate(fresh_user)

        return LoginResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            expires_in=tokens["expires_in"],
            refresh_expires_in=tokens.get("refresh_expires_in"),
            user=user_detailed,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/register", response_model=RegisterResponse, summary="Register User")
async def register(
    request: RegisterRequest,
    *,
    db: SessionDep,
):
    """
    Register a new user.

    - **username**: Unique username
    - **email**: Valid email address
    - **password**: Strong password
    - **confirm_password**: Password confirmation
    - **company_id**: Optional company ID
    """
    try:
        # Register user
        user = await UserRegistrationService.register_user(
            db=db,
            username=request.username,
            email=request.email,
            password=request.password,
            company_id=request.company_id,
            auth0_id=request.auth0_id,
        )

        # Get detailed user info
        from app.schemas.user import UserDetailed

        user_detailed = UserDetailed.model_validate(user)

        return RegisterResponse(
            user=user_detailed,
            message="User registered successfully",
            email_verification_required=True,
            verification_token_sent=True,
        )

    except Exception as e:
        if "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/logout", response_model=LogoutResponse, summary="Logout User")
async def logout(
    request: LogoutRequest,
    *,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """
    Logout user and revoke tokens.

    - **refresh_token**: Optional refresh token to revoke
    - **logout_all**: Whether to logout from all devices
    """
    try:
        revoked_count = await AuthService.logout_user(
            db=db,
            user=current_user,
            refresh_token=request.refresh_token,
            logout_all=request.logout_all,
        )

        return LogoutResponse(
            message="Successfully logged out",
            revoked_tokens=revoked_count,
            sessions_revoked=revoked_count,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/refresh", response_model=RefreshTokenResponse, summary="Refresh Token")
async def refresh_token(
    request: RefreshTokenRequest,
    request_obj: Request,
    *,
    db: SessionDep,
):
    """
    Refresh access token using refresh token.

    - **refresh_token**: Valid refresh token
    """
    try:
        tokens = await TokenService.refresh_access_token(
            db=db,
            refresh_token=request.refresh_token,
            request=request_obj,
        )

        return RefreshTokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens.get("refresh_token"),
            token_type="bearer",
            expires_in=tokens["expires_in"],
            refresh_expires_in=tokens.get("refresh_expires_in"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/validate-token", response_model=TokenValidationResponse, summary="Validate Token"
)
async def validate_token(
    request: TokenValidationRequest,
    *,
    db: SessionDep,
):
    """
    Validate JWT token and return user info if valid.

    - **token**: JWT token to validate
    """
    try:
        validation_result = await TokenService.validate_token(
            db=db,
            token=request.token,
        )

        return TokenValidationResponse(
            valid=validation_result["valid"],
            expires_at=validation_result.get("expires_at"),
            scopes=validation_result.get("scopes", []),
            user=validation_result.get("user"),
        )

    except Exception as e:
        return TokenValidationResponse(
            valid=False,
            expires_at=None,
            scopes=[],
            user=None,
        )
