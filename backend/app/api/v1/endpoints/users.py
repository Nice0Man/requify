"""
API эндпоинты для работы с пользователями.

Включает операции CRUD для пользователей системы.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse

from app.api.dependencies import (
    SessionDep,
    get_current_active_user,
    get_superuser,
    UserPermissions,
    ValidationDependencies,
)
from app.core.config import settings
from app import crud, models
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    User as UserSchema,
    UserDetailed,
    UserWithProfile,
    UserWithStats,
    UserStats,
    UserActivity,
    UserValidation,
    UserAvailability,
    UserAudit,
    UserPublicProfile,
)
from app.schemas.user_profile import (
    UserProfileResponse,
    UserProfileUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[UserDetailed])
async def get_users(
    db: SessionDep,
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    is_active: Optional[bool] = Query(None, description="Фильтр по статусу активности"),
    role: Optional[str] = Query(None, description="Фильтр по роли"),
    search: Optional[str] = Query(
        None,
        description="Поиск по username, email, first_name, last_name, department, phone",
    ),
    current_user: User = Depends(UserPermissions.read()),
):
    """
    Получить список пользователей с фильтрацией.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        is_active: Фильтр по статусу активности
        role: Фильтр по роли пользователя
        search: Поисковый запрос
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.User]: Список пользователей
    """
    if search:
        users = await crud.user.search_users(
            db, search_term=search, skip=skip, limit=limit
        )
    elif role:
        users = await crud.user.get_by_role(db, role=role, skip=skip, limit=limit)
    elif is_active is not None:
        users = await crud.user.get_by_active_status(
            db, is_active=is_active, skip=skip, limit=limit
        )
    else:
        users = await crud.user.get_multi(db, skip=skip, limit=limit)

    # Загружаем профили для всех пользователей, если они не загружены
    complete_users = []
    for user in users:
        if not hasattr(user, "profile") or user.profile is None:
            user_with_profile = await crud.user.get_with_profile(db, id=user.id)
            complete_users.append(user_with_profile or user)
        else:
            complete_users.append(user)

    return complete_users


@router.post("/", response_model=UserWithProfile, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.write()),
):
    """
    Создать нового пользователя.

    Args:
        user_in: Данные создаваемого пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен иметь права users:write)

    Returns:
        schemas.User: Созданный пользователь

    Raises:
        HTTPException: Если пользователь с таким email уже существует
    """
    # Проверяем уникальность email
    existing_user = await crud.user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    # Проверяем уникальность username, если указан
    if user_in.username:
        existing_username = await crud.user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует",
            )

    # Создаем пользователя
    user = await crud.user.create(db, obj_in=user_in)

    # Создаем профиль пользователя (если не создался автоматически)
    if not user.profile:
        from app.crud import user_profile as crud_user_profile
        from app.schemas.user_profile import UserProfileCreate

        profile_data = UserProfileCreate(
            display_name=user.username,
            first_name=getattr(user_in, "first_name", None),
            last_name=getattr(user_in, "last_name", None),
        )
        profile = await crud_user_profile.create_for_user(
            db, user_id=user.id, obj_in=profile_data
        )
        user.profile = profile

    return user


@router.get("/me", response_model=UserDetailed)
async def get_current_user_info(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """
    Получить информацию о текущем пользователе.

    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        UserDetailed: Полная информация о текущем пользователе
    """
    # Получаем пользователя с профилем
    user_with_profile = await crud.user.get_with_profile(db, id=current_user.id)
    return user_with_profile or current_user


@router.put("/me", response_model=UserDetailed)
async def update_current_user(
    user_in: UserUpdate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """
    Обновить данные текущего пользователя.

    Args:
        user_in: Обновленные данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.User: Обновленный пользователь

    Raises:
        HTTPException: Если email или username уже используются
    """
    # Получаем пользователя в текущей сессии, чтобы избежать проблем с SQLAlchemy session
    user_in_session = await crud.user.get(db, id=current_user.id)
    if not user_in_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Проверяем уникальность email, если изменился
    if user_in.email and user_in.email != user_in_session.email:
        existing_user = await crud.user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

    # Проверяем уникальность username, если изменился
    if user_in.username and user_in.username != user_in_session.username:
        existing_username = await crud.user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует",
            )

    user = await crud.user.update(db, db_obj=user_in_session, obj_in=user_in)

    # Получаем обновленного пользователя с профилем
    updated_user = await crud.user.get_with_profile(db, id=user.id)
    return updated_user or user


@router.get("/{user_id}", response_model=UserDetailed)
async def get_user(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
):
    """
    Получить пользователя по ID.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        UserDetailed: Данные пользователя

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get_with_profile(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.put("/{user_id}", response_model=UserDetailed)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.write()),
):
    """
    Обновить данные пользователя.

    Args:
        user_id: ID пользователя
        user_in: Обновленные данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        UserDetailed: Обновленный пользователь

    Raises:
        HTTPException: Если пользователь не найден или email/username уже используются
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Проверяем уникальность email, если изменился
    if user_in.email and user_in.email != user.email:
        existing_user = await crud.user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

    # Проверяем уникальность username, если изменился
    if user_in.username and user_in.username != user.username:
        existing_username = await crud.user.get_by_username(
            db, username=user_in.username
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует",
            )

    user = await crud.user.update(db, db_obj=user, obj_in=user_in)

    # Получаем обновленного пользователя с профилем
    updated_user = await crud.user.get_with_profile(db, id=user.id)
    return updated_user or user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.delete()),
):
    """
    Удалить пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен иметь права users:delete)

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    await crud.user.remove(db, id=user_id)


@router.post("/{user_id}/activate", response_model=UserDetailed)
async def activate_user(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_superuser),
):
    """
    Активировать пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        UserDetailed: Активированный пользователь

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    user = await crud.user.activate(db, user_id=user_id)

    # Получаем активированного пользователя с профилем
    updated_user = await crud.user.get_with_profile(db, id=user.id)
    return updated_user or user


@router.post("/{user_id}/deactivate", response_model=UserDetailed)
async def deactivate_user(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_superuser),
):
    """
    Деактивировать пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        UserDetailed: Деактивированный пользователь

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    user = await crud.user.deactivate(db, user_id=user_id)

    # Получаем деактивированного пользователя с профилем
    updated_user = await crud.user.get_with_profile(db, id=user.id)
    return updated_user or user


@router.get("/username/{username}", response_model=UserDetailed)
async def get_user_by_username(
    username: str,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
):
    """
    Получить пользователя по username.
    """
    user = await crud.user.get_by_username_with_profile(db, username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.get("/email/{email}", response_model=UserDetailed)
async def get_user_by_email(
    email: str,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
):
    """
    Получить пользователя по email.
    """
    user = await crud.user.get_by_email_with_profile(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
):
    """
    Получить профиль пользователя.
    """
    user = await crud.user.get_with_profile(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    if not user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль пользователя не найден",
        )

    return user.profile


@router.get("/{user_id}/stats", response_model=UserStats)
async def get_user_stats(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
):
    """
    Получить статистику пользователя.
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Получаем статистику пользователя
    stats = await crud.user.get_user_stats(db, user_id=user_id)
    return stats


@router.get("/{user_id}/activity", response_model=List[UserActivity])
async def get_user_activity(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Получить активность пользователя.
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Получаем активность пользователя
    activity = await crud.user.get_user_activity(db, user_id=user_id, limit=limit)
    return activity


@router.post("/validate", response_model=UserValidation)
async def validate_user_data(
    user_data: Dict[str, Any],
    db: SessionDep,
):
    """
    Валидация данных пользователя.
    """
    result = await crud.user.validate_user_data(db, user_data=user_data)
    return result


@router.get("/check-username/{username}", response_model=UserAvailability)
async def check_username_availability(
    username: str,
    db: SessionDep,
):
    """
    Проверить доступность username.
    """
    user = await crud.user.get_by_username(db, username=username)
    return {"available": user is None}


@router.get("/check-email/{email}", response_model=UserAvailability)
async def check_email_availability(
    email: str,
    db: SessionDep,
):
    """
    Проверить доступность email.
    """
    user = await crud.user.get_by_email(db, email=email)
    return {"available": user is None}


@router.get("/{user_id}/audit", response_model=List[UserAudit])
async def get_user_audit_log(
    user_id: int,
    db: SessionDep,
    current_user: User = Depends(get_superuser),
    limit: int = Query(50, ge=1, le=200),
):
    """
    Получить журнал аудита пользователя (только для админов).
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Получаем журнал аудита пользователя
    audit_log = await crud.user.get_user_audit_log(db, user_id=user_id, limit=limit)
    return audit_log


@router.get("/me/avatar")
async def get_current_user_avatar(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """
    Получить URL аватара текущего пользователя.

    Returns:
        dict: Информация об аватаре пользователя
    """
    # Получаем пользователя с профилем
    user_with_profile = await crud.user.get_with_profile(db, id=current_user.id)

    # Приоритет: аватар из профиля, затем из основной модели пользователя (устаревшее)
    avatar_url = None
    if user_with_profile and user_with_profile.profile:
        avatar_url = user_with_profile.profile.avatar_url

    # Fallback на устаревшее поле в User модели
    if not avatar_url:
        avatar_url = getattr(current_user, "avatar_url", None)

    return {
        "avatar_url": avatar_url,
        "has_avatar": avatar_url is not None,
    }


@router.get("/file-service/health")
async def get_file_service_health():
    """
    Проверка здоровья файлового сервиса и CDN.

    Returns:
        dict: Статус файлового сервиса, MinIO и CDN
    """
    from app.services.file_service import file_service

    health_status = file_service.get_health_status()

    # Добавляем общий статус
    health_status["healthy"] = (
        health_status.get("minio_connected", False)
        if health_status["storage_type"] == "minio"
        else True  # Для локального хранилища всегда здоров
    )

    # HTTP статус код
    status_code = (
        status.HTTP_200_OK
        if health_status["healthy"]
        else status.HTTP_503_SERVICE_UNAVAILABLE
    )

    return JSONResponse(status_code=status_code, content=health_status)


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """
    Загрузить аватар для текущего пользователя.

    Args:
        file: Файл изображения для аватара
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Информация о загруженном аватаре

    Raises:
        HTTPException: При ошибках валидации или загрузки
    """
    from app.services.file_service import file_service

    try:
        # Загружаем аватар через файловый сервис
        avatar_url = await file_service.upload_avatar(
            file=file, user_id=current_user.id, db=db
        )

        # Обновляем аватар в профиле пользователя
        from app.crud import user_profile as crud_user_profile

        # Получаем или создаем профиль пользователя
        user_with_profile = await crud.user.get_with_profile(db, id=current_user.id)
        if not user_with_profile or not user_with_profile.profile:
            # Создаем профиль, если его нет
            from app.schemas.user_profile import UserProfileCreate

            profile_data = UserProfileCreate(
                display_name=current_user.username, avatar_url=avatar_url
            )
            await crud_user_profile.create_for_user(
                db, user_id=current_user.id, obj_in=profile_data
            )
        else:
            # Обновляем существующий профиль
            from app.schemas.user_profile import UserProfileUpdate

            profile_update = UserProfileUpdate(avatar_url=avatar_url)
            await crud_user_profile.update(
                db, db_obj=user_with_profile.profile, obj_in=profile_update
            )

        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url,
            "user_id": current_user.id,
        }

    except HTTPException:
        # Перебрасываем HTTP исключения без изменений
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}",
        )


@router.delete("/me/avatar")
async def delete_avatar(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
):
    """
    Удалить аватар текущего пользователя.

    Args:
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат удаления аватара
    """
    try:
        # Удаляем аватар из профиля пользователя
        from app.crud import user_profile as crud_user_profile

        user_with_profile = await crud.user.get_with_profile(db, id=current_user.id)
        if user_with_profile and user_with_profile.profile:
            # Обновляем профиль, убирая аватар
            from app.schemas.user_profile import UserProfileUpdate

            profile_update = UserProfileUpdate(avatar_url=None)
            await crud_user_profile.update(
                db, db_obj=user_with_profile.profile, obj_in=profile_update
            )

        # Также удаляем из основной модели пользователя (для совместимости)
        try:
            await crud.user.remove_avatar(db, user_id=current_user.id)
        except AttributeError:
            # Метод может не существовать в новой версии CRUD
            pass

        return {"message": "Avatar deleted successfully", "user_id": current_user.id}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete avatar: {str(e)}",
        )


@router.get("/search", response_model=List[UserDetailed])
async def search_users(
    q: str = Query(..., min_length=1),
    db: SessionDep,
    current_user: User = Depends(UserPermissions.read()),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Поиск пользователей.
    """
    users = await crud.user.search_users(db, search_term=q, limit=limit)
    return users
