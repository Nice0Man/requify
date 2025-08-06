"""
API endpoints для профилей пользователей.
"""

from typing import List, Optional, Dict, Any
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    UploadFile,
    File,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_active_user, SessionDep, UserPermissions
from app.models.user import User
from app.services.user_profile_service import user_profile_service
from app.schemas.user_profile import (
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileResponse,
    UserProfilePublic,
    UserProfileSummary,
    UserProfileCompletion,
    UserProfileStats,
    ContactInfo,
    WorkInfo,
    PersonalInfo,
    LocalizationSettings,
    ProfileValidation,
)

router = APIRouter()


@router.get("/profiles/me", response_model=UserProfileResponse)
async def get_my_profile(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Получить профиль текущего пользователя.
    """
    profile = user_profile_service.get_current_user_profile(
        db=db, current_user=current_user
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )

    response = UserProfileResponse(**profile.__dict__)

    # Добавить вычисляемые поля
    response.full_name = profile.full_name
    response.short_name = profile.short_name
    response.avatar_or_default = profile.get_avatar_or_default()

    return response


@router.post(
    "/profiles/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_update_my_profile(
    *,
    profile_in: UserProfileCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Создать или обновить профиль текущего пользователя.
    """
    profile = user_profile_service.create_or_update_profile(
        db=db,
        user_id=current_user.id,
        profile_data=profile_in,
        current_user=current_user,
    )

    return UserProfileResponse(**profile.__dict__)


@router.put("/profiles/me", response_model=UserProfileResponse)
async def update_my_profile(
    *,
    profile_in: UserProfileUpdate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить профиль текущего пользователя.
    """
    profile = user_profile_service.update_profile(
        db=db,
        user_id=current_user.id,
        profile_data=profile_in,
        current_user=current_user,
    )

    return UserProfileResponse(**profile.__dict__)


@router.get("/profiles/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Получить профиль пользователя по ID.

    Требует права на просмотр профиля.
    """
    profile = user_profile_service.get_user_profile(
        db=db, user_id=user_id, current_user=current_user
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )

    response = UserProfileResponse(**profile.__dict__)

    # Добавить вычисляемые поля
    response.full_name = profile.full_name
    response.short_name = profile.short_name
    response.avatar_or_default = profile.get_avatar_or_default()

    return response


@router.get("/profiles/{user_id}/public", response_model=UserProfilePublic)
async def get_user_public_profile(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfilePublic:
    """
    Получить публичную версию профиля пользователя.

    Возвращает только публичную информацию без чувствительных данных.
    """
    return user_profile_service.get_public_profile(
        db=db, user_id=user_id, current_user=current_user
    )


@router.put("/profiles/{user_id}", response_model=UserProfileResponse)
async def update_user_profile(
    *,
    user_id: int,
    profile_in: UserProfileUpdate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить профиль пользователя.

    Требует права на редактирование профиля.
    """
    profile = user_profile_service.update_profile(
        db=db, user_id=user_id, profile_data=profile_in, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


# Profile Completion


@router.get("/profiles/me/completion", response_model=UserProfileCompletion)
async def get_my_profile_completion(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileCompletion:
    """
    Получить статус заполненности профиля текущего пользователя.
    """
    return user_profile_service.get_profile_completion_status(
        db=db, user_id=current_user.id, current_user=current_user
    )


@router.get("/profiles/{user_id}/completion", response_model=UserProfileCompletion)
async def get_user_profile_completion(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileCompletion:
    """
    Получить статус заполненности профиля пользователя.

    Требует права на просмотр профиля.
    """
    return user_profile_service.get_profile_completion_status(
        db=db, user_id=user_id, current_user=current_user
    )


# Avatar Management


@router.put("/profiles/me/avatar", response_model=UserProfileResponse)
async def update_my_avatar(
    *,
    avatar_url: str,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить аватар текущего пользователя.
    """
    profile = user_profile_service.update_avatar(
        db=db, user_id=current_user.id, avatar_url=avatar_url, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


@router.put("/profiles/{user_id}/avatar", response_model=UserProfileResponse)
async def update_user_avatar(
    *,
    user_id: int,
    avatar_url: str,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить аватар пользователя.

    Требует права на редактирование профиля.
    """
    profile = user_profile_service.update_avatar(
        db=db, user_id=user_id, avatar_url=avatar_url, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


# Contact Information


@router.put("/profiles/me/contact", response_model=UserProfileResponse)
async def update_my_contact_info(
    *,
    contact_info: ContactInfo,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить контактную информацию текущего пользователя.
    """
    profile = user_profile_service.update_contact_info(
        db=db,
        user_id=current_user.id,
        contact_info=contact_info,
        current_user=current_user,
    )

    return UserProfileResponse(**profile.__dict__)


@router.put("/profiles/{user_id}/contact", response_model=UserProfileResponse)
async def update_user_contact_info(
    *,
    user_id: int,
    contact_info: ContactInfo,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить контактную информацию пользователя.

    Требует права на редактирование профиля.
    """
    profile = user_profile_service.update_contact_info(
        db=db, user_id=user_id, contact_info=contact_info, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


# Work Information


@router.put("/profiles/me/work", response_model=UserProfileResponse)
async def update_my_work_info(
    *,
    work_info: WorkInfo,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить рабочую информацию текущего пользователя.
    """
    profile = user_profile_service.update_work_info(
        db=db, user_id=current_user.id, work_info=work_info, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


@router.put("/profiles/{user_id}/work", response_model=UserProfileResponse)
async def update_user_work_info(
    *,
    user_id: int,
    work_info: WorkInfo,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить рабочую информацию пользователя.

    Требует права на редактирование профиля.
    """
    profile = user_profile_service.update_work_info(
        db=db, user_id=user_id, work_info=work_info, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


# Localization Settings


@router.put("/profiles/me/localization", response_model=UserProfileResponse)
async def update_my_localization(
    *,
    localization: LocalizationSettings,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить настройки локализации текущего пользователя.
    """
    profile = user_profile_service.update_localization(
        db=db,
        user_id=current_user.id,
        localization=localization,
        current_user=current_user,
    )

    return UserProfileResponse(**profile.__dict__)


@router.put("/profiles/{user_id}/localization", response_model=UserProfileResponse)
async def update_user_localization(
    *,
    user_id: int,
    localization: LocalizationSettings,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Обновить настройки локализации пользователя.

    Требует права на редактирование профиля.
    """
    profile = user_profile_service.update_localization(
        db=db, user_id=user_id, localization=localization, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


# Phone Verification


@router.post("/profiles/me/verify-phone", response_model=UserProfileResponse)
async def verify_my_phone(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Подтвердить номер телефона текущего пользователя.

    В реальной реализации здесь должна быть логика отправки и проверки SMS-кода.
    """
    profile = user_profile_service.verify_phone(
        db=db, user_id=current_user.id, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


@router.post("/profiles/{user_id}/verify-phone", response_model=UserProfileResponse)
async def verify_user_phone(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileResponse:
    """
    Подтвердить номер телефона пользователя.

    Требует права на редактирование профиля.
    """
    profile = user_profile_service.verify_phone(
        db=db, user_id=user_id, current_user=current_user
    )

    return UserProfileResponse(**profile.__dict__)


# Profile Search and Listing


@router.get("/profiles/search", response_model=List[UserProfileSummary])
async def search_profiles(
    q: str = Query(..., min_length=2, description="Поисковый запрос"),
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(50, ge=1, le=100, description="Максимальное количество записей"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[UserProfileSummary]:
    """
    Поиск профилей пользователей по имени, должности или отделу.

    Требует аутентификации.
    """
    return user_profile_service.search_profiles(
        db=db, query=q, current_user=current_user, skip=skip, limit=limit
    )


@router.get("/profiles/company/{company_id}", response_model=List[UserProfileSummary])
async def get_company_profiles(
    company_id: int,
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(50, ge=1, le=100, description="Максимальное количество записей"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[UserProfileSummary]:
    """
    Получить профили пользователей компании.

    Требует права доступа к компании.
    """
    return user_profile_service.get_company_profiles(
        db=db, company_id=company_id, current_user=current_user, skip=skip, limit=limit
    )


@router.get(
    "/profiles/department/{department}", response_model=List[UserProfileSummary]
)
async def get_department_profiles(
    department: str,
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(50, ge=1, le=100, description="Максимальное количество записей"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[UserProfileSummary]:
    """
    Получить профили пользователей отдела.

    Требует права доступа к отделу.
    """
    return user_profile_service.get_department_profiles(
        db=db, department=department, current_user=current_user, skip=skip, limit=limit
    )


# Profile Validation


@router.post("/profiles/me/validate", response_model=Dict[str, Any])
async def validate_my_profile(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Валидировать профиль текущего пользователя.

    Проверяет корректность и полноту данных профиля.
    """
    return user_profile_service.validate_profile(
        db=db, user_id=current_user.id, current_user=current_user
    )


@router.post("/profiles/{user_id}/validate", response_model=Dict[str, Any])
async def validate_user_profile(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Валидировать профиль пользователя.

    Требует права на просмотр профиля.
    """
    return user_profile_service.validate_profile(
        db=db, user_id=user_id, current_user=current_user
    )


# Administrative Endpoints


@router.get("/profiles/statistics", response_model=UserProfileStats)
async def get_profile_statistics(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> UserProfileStats:
    """
    Получить статистику профилей пользователей.

    Доступно только системным администраторам.
    """
    return user_profile_service.get_profile_statistics(db=db, current_user=current_user)


@router.post("/profiles/bulk/update-completion", response_model=Dict[str, int])
async def bulk_update_completion_status(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, int]:
    """
    Пересчитать статус заполненности для всех профилей.

    Доступно только системным администраторам.
    """
    return user_profile_service.bulk_update_completion_status(
        db=db, current_user=current_user
    )


# Utility Endpoints


@router.get("/profiles/timezones", response_model=List[str])
async def get_available_timezones() -> List[str]:
    """
    Получить список доступных часовых поясов.
    """
    return [
        "Europe/Moscow",
        "Europe/London",
        "Europe/Berlin",
        "America/New_York",
        "America/Los_Angeles",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Australia/Sydney",
        "UTC",
    ]


@router.get("/profiles/languages", response_model=List[str])
async def get_available_languages() -> List[str]:
    """
    Получить список доступных языков интерфейса.
    """
    return ["ru", "en", "de", "fr", "es", "zh", "ja"]
