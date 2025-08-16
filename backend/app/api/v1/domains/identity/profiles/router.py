"""
Profile Management Router.

Handles extended user profile operations including profile management,
avatar uploads, preferences, and public profiles.
"""

from typing import Annotated
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.user_profile_service import UserProfileService
from app.services.file_service import file_service
from .schemas import (
    ProfileUpdateRequest,
    UserPreferencesRequest,
    AvatarUploadRequest,
    ExtendedProfileResponse,
    PublicProfileResponse,
    UserPreferencesResponse,
    UserActivityResponse,
    UserActivityListResponse,
    UserStatsResponse,
    AvatarUploadResponse,
    ProfileOperationResponse,
)

# Initialize services
user_profile_service = UserProfileService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Current User Profile Management
# =============================================================================


@router.get(
    "/me",
    summary="Get My Extended Profile",
    description="Get current user's extended profile information",
    response_model=ExtendedProfileResponse,
)
async def get_my_extended_profile(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение расширенного профиля текущего пользователя.
    """
    try:
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=current_user.id, current_user=current_user
        )

        return ExtendedProfileResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=profile.first_name if profile else None,
            last_name=profile.last_name if profile else None,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            position=profile.position if profile else None,
            department=profile.department if profile else None,
            location=getattr(profile, "location", None) if profile else None,
            website=getattr(profile, "website", None) if profile else None,
            linkedin_url=getattr(profile, "linkedin_url", None) if profile else None,
            github_url=getattr(profile, "github_url", None) if profile else None,
            avatar_url=profile.get_avatar_or_default() if profile else None,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at,
            last_login_at=current_user.last_login_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get extended profile: {str(e)}",
        )


@router.put(
    "/me",
    summary="Update My Extended Profile",
    description="Update current user's extended profile",
    response_model=ExtendedProfileResponse,
)
async def update_my_extended_profile(
    profile_data: ProfileUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление расширенного профиля текущего пользователя.
    """
    try:
        # Update profile
        await user_profile_service.update_profile(
            db=db,
            user_id=current_user.id,
            profile_data={
                "bio": profile_data.bio,
                "phone": profile_data.phone,
                "position": profile_data.position,
                "department": profile_data.department,
                "location": profile_data.location,
                "website": str(profile_data.website) if profile_data.website else None,
                "linkedin_url": (
                    str(profile_data.linkedin_url)
                    if profile_data.linkedin_url
                    else None
                ),
                "github_url": (
                    str(profile_data.github_url) if profile_data.github_url else None
                ),
            },
            current_user=current_user,
        )

        # Get updated profile
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=current_user.id, current_user=current_user
        )

        return ExtendedProfileResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=profile.first_name if profile else None,
            last_name=profile.last_name if profile else None,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            position=profile.position if profile else None,
            department=profile.department if profile else None,
            location=getattr(profile, "location", None) if profile else None,
            website=getattr(profile, "website", None) if profile else None,
            linkedin_url=getattr(profile, "linkedin_url", None) if profile else None,
            github_url=getattr(profile, "github_url", None) if profile else None,
            avatar_url=profile.get_avatar_or_default() if profile else None,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at,
            last_login_at=current_user.last_login_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}",
        )


@router.put(
    "/me/avatar",
    summary="Upload Avatar",
    description="Upload user avatar image",
    response_model=AvatarUploadResponse,
)
async def upload_avatar(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    avatar_data: Annotated[UploadFile, File(description="User avatar")],
):
    """
    Загрузка аватара пользователя.
    """
    try:
        # Upload avatar using file service
        avatar_url = await file_service.upload_avatar(
            db=db,
            user_id=current_user.id,
            file=avatar_data,
        )

        # Update user profile with new avatar URL
        await user_profile_service.update_profile(
            db=db,
            user_id=current_user.id,
            profile_data={"avatar_url": avatar_url},
            current_user=current_user,
        )

        return AvatarUploadResponse(
            success=True, avatar_url=avatar_url, message="Avatar uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload avatar: {str(e)}",
        )


@router.delete(
    "/me/avatar",
    summary="Remove Avatar",
    description="Remove user avatar image",
    response_model=ProfileOperationResponse,
)
async def remove_avatar(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Удаление аватара пользователя.
    """
    try:
        # Get current profile to check if avatar exists
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=current_user.id, current_user=current_user
        )

        if profile and profile.avatar_url:
            # Remove avatar file
            await file_service.delete_avatar(
                db=db, user_id=current_user.id, avatar_url=profile.avatar_url
            )

        # Update profile to remove avatar URL
        await user_profile_service.update_profile(
            db=db,
            user_id=current_user.id,
            profile_data={"avatar_url": None},
            current_user=current_user,
        )

        return ProfileOperationResponse(
            success=True, message="Avatar removed successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to remove avatar: {str(e)}",
        )


@router.put(
    "/me/preferences",
    summary="Update User Preferences",
    description="Update user preferences and settings",
    response_model=UserPreferencesResponse,
)
async def update_user_preferences(
    preferences_data: UserPreferencesRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление пользовательских настроек.
    """
    try:
        # Prepare preferences data
        preferences = {}
        if preferences_data.timezone is not None:
            preferences["timezone"] = preferences_data.timezone
        if preferences_data.language is not None:
            preferences["language"] = preferences_data.language
        if preferences_data.theme is not None:
            preferences["theme"] = preferences_data.theme
        if preferences_data.notifications_email is not None:
            preferences["notifications_email"] = preferences_data.notifications_email
        if preferences_data.notifications_browser is not None:
            preferences["notifications_browser"] = (
                preferences_data.notifications_browser
            )
        if preferences_data.notification_frequency is not None:
            preferences["notification_frequency"] = (
                preferences_data.notification_frequency
            )
        if preferences_data.date_format is not None:
            preferences["date_format"] = preferences_data.date_format
        if preferences_data.time_format is not None:
            preferences["time_format"] = preferences_data.time_format

        # Update preferences
        await user_profile_service.update_user_preferences(
            db=db, user_id=current_user.id, preferences=preferences
        )

        # Get updated preferences
        updated_preferences = await user_profile_service.get_user_preferences(
            db=db, user_id=current_user.id
        )

        return UserPreferencesResponse(
            timezone=updated_preferences.get("timezone", "UTC"),
            language=updated_preferences.get("language", "en"),
            theme=updated_preferences.get("theme", "light"),
            notifications_email=updated_preferences.get("notifications_email", True),
            notifications_browser=updated_preferences.get(
                "notifications_browser", True
            ),
            notification_frequency=updated_preferences.get(
                "notification_frequency", "daily"
            ),
            date_format=updated_preferences.get("date_format", "YYYY-MM-DD"),
            time_format=updated_preferences.get("time_format", "24h"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update preferences: {str(e)}",
        )


@router.get(
    "/me/preferences",
    summary="Get User Preferences",
    description="Get current user preferences and settings",
    response_model=UserPreferencesResponse,
)
async def get_user_preferences(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение пользовательских настроек.
    """
    try:
        preferences = await user_profile_service.get_user_preferences(
            db=db, user_id=current_user.id
        )

        return UserPreferencesResponse(
            timezone=preferences.get("timezone", "UTC"),
            language=preferences.get("language", "en"),
            theme=preferences.get("theme", "light"),
            notifications_email=preferences.get("notifications_email", True),
            notifications_browser=preferences.get("notifications_browser", True),
            notification_frequency=preferences.get("notification_frequency", "daily"),
            date_format=preferences.get("date_format", "YYYY-MM-DD"),
            time_format=preferences.get("time_format", "24h"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user preferences: {str(e)}",
        )


# =============================================================================
# Other User Profiles
# =============================================================================


@router.get(
    "/{user_id}",
    summary="Get User Profile",
    description="Get user profile by ID (colleagues in team/project)",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_USERS, scope=RoleScope.TEAM
            )
        )
    ],
    response_model=ExtendedProfileResponse,
)
async def get_user_profile(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение профиля пользователя.

    Доступно коллегам по команде/проекту.
    """
    try:
        from app.services.admin_service import user_management_service

        # Get user basic info
        user = await user_management_service.get_user_by_id(db=db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Get user profile with context-aware access
        profile = await user_profile_service.get_user_profile(
            db=db, user_id=user_id, current_user=current_user
        )

        return ExtendedProfileResponse(
            id=user.id,
            email=user.email,
            first_name=profile.first_name if profile else None,
            last_name=profile.last_name if profile else None,
            bio=profile.bio if profile else None,
            phone=profile.phone if profile else None,
            position=profile.position if profile else None,
            department=profile.department if profile else None,
            location=getattr(profile, "location", None) if profile else None,
            website=getattr(profile, "website", None) if profile else None,
            linkedin_url=getattr(profile, "linkedin_url", None) if profile else None,
            github_url=getattr(profile, "github_url", None) if profile else None,
            avatar_url=profile.get_avatar_or_default() if profile else None,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login_at=user.last_login_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user profile: {str(e)}",
        )


@router.get(
    "/{user_id}/public",
    summary="Get Public Profile",
    description="Get public user profile information",
    response_model=PublicProfileResponse,
)
async def get_public_profile(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение публичной информации профиля.

    Доступно всем аутентифицированным пользователям.
    """
    try:
        from app.services.admin_service import user_management_service

        # Get user basic info
        user = await user_management_service.get_user_by_id(db=db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Get public profile info (limited data)
        profile = await user_profile_service.get_public_profile(db=db, user_id=user_id)

        return PublicProfileResponse(
            id=user.id,
            first_name=profile.first_name if profile else None,
            last_name=profile.last_name if profile else None,
            position=profile.position if profile else None,
            department=profile.department if profile else None,
            avatar_url=profile.get_avatar_or_default() if profile else None,
            bio=profile.bio if profile else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get public profile: {str(e)}",
        )


# =============================================================================
# Profile Statistics and Activity
# =============================================================================


@router.get(
    "/{user_id}/activity",
    summary="Get User Activity",
    description="Get user activity history (limited based on permissions)",
    response_model=UserActivityListResponse,
)
async def get_user_activity(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
):
    """
    Получение истории активности пользователя.

    Доступ ограничен в зависимости от прав.
    """
    try:
        # Check if user can view this activity
        if user_id != current_user.id:
            from app.services.permission_service import PermissionService

            permission_service = PermissionService()
            has_permission = await permission_service.check_permission(
                db=db, user_id=current_user.id, permission=Permission.VIEW_USERS
            )
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied to view user activity",
                )

        # Get user activity
        activity_data = await user_profile_service.get_user_activity(
            db=db, user_id=user_id, skip=skip, limit=limit
        )

        activities = [
            UserActivityResponse(
                id=activity.id,
                activity_type=activity.activity_type,
                description=activity.description,
                activity_metadata=activity.metadata,
                ip_address=activity.ip_address if user_id == current_user.id else None,
                user_agent=activity.user_agent if user_id == current_user.id else None,
                timestamp=activity.timestamp,
            )
            for activity in activity_data["activities"]
        ]

        total = activity_data["total"]
        pages = (total + limit - 1) // limit

        return UserActivityListResponse(
            activities=activities,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user activity: {str(e)}",
        )


@router.get(
    "/{user_id}/stats",
    summary="Get User Statistics",
    description="Get user statistics and metrics",
    response_model=UserStatsResponse,
)
async def get_user_stats(
    user_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение статистики пользователя.
    """
    try:
        # Check if user can view these stats
        if user_id != current_user.id:
            from app.services.permission_service import PermissionService

            permission_service = PermissionService()
            has_permission = await permission_service.check_permission(
                db=db, user_id=current_user.id, permission=Permission.VIEW_USERS
            )
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied to view user statistics",
                )

        # Get user statistics
        stats = await user_profile_service.get_user_statistics(db=db, user_id=user_id)

        return UserStatsResponse(
            total_logins=stats.get("total_logins", 0),
            last_login_at=stats.get("last_login_at"),
            projects_count=stats.get("projects_count", 0),
            requirements_created=stats.get("requirements_created", 0),
            requirements_updated=stats.get("requirements_updated", 0),
            activity_score=stats.get("activity_score", 0.0),
            profile_completion=stats.get("profile_completion", 0.0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user statistics: {str(e)}",
        )
