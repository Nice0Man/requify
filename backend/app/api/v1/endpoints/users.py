"""
API эндпоинты для работы с пользователями.

Включает операции CRUD для пользователей системы.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_current_active_user,
    get_users_read_user,
    get_users_write_user,
    get_users_delete_user,
    get_superuser,
)
from app.core.config import settings
from app import crud, schemas, models
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
async def get_users(
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
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

    return users


@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_write_user),
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

    user = await crud.user.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=schemas.User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Получить информацию о текущем пользователе.

    Args:
        current_user: Текущий пользователь

    Returns:
        schemas.User: Информация о текущем пользователе
    """
    return current_user


@router.put("/me", response_model=schemas.User)
async def update_current_user(
    user_in: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
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
    return user


@router.get("/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить пользователя по ID.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.User: Данные пользователя

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_write_user),
):
    """
    Обновить данные пользователя.

    Args:
        user_id: ID пользователя
        user_in: Обновленные данные пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.User: Обновленный пользователь

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
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_delete_user),
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


@router.post("/{user_id}/activate", response_model=schemas.User)
async def activate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_superuser),
):
    """
    Активировать пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        schemas.User: Активированный пользователь

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    user = await crud.user.activate(db, user_id=user_id)
    return user


@router.post("/{user_id}/deactivate", response_model=schemas.User)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_superuser),
):
    """
    Деактивировать пользователя.

    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        current_user: Текущий пользователь (должен быть суперпользователем)

    Returns:
        schemas.User: Деактивированный пользователь

    Raises:
        HTTPException: Если пользователь не найден
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    user = await crud.user.deactivate(db, user_id=user_id)
    return user


@router.get("/username/{username}", response_model=schemas.User)
async def get_user_by_username(
    username: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить пользователя по username.
    """
    user = await crud.user.get_by_username(db, username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.get("/email/{email}", response_model=schemas.User)
async def get_user_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить пользователя по email.
    """
    user = await crud.user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.get("/{user_id}/profile", response_model=schemas.UserProfile)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить профиль пользователя.
    """
    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    return user


@router.get("/{user_id}/stats", response_model=schemas.UserStats)
async def get_user_stats(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
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


@router.get("/{user_id}/activity", response_model=List[schemas.UserActivity])
async def get_user_activity(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
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


@router.post("/validate", response_model=schemas.UserValidation)
async def validate_user_data(
    user_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
):
    """
    Валидация данных пользователя.
    """
    result = await crud.user.validate_user_data(db, user_data=user_data)
    return result


@router.get("/check-username/{username}", response_model=schemas.UserAvailability)
async def check_username_availability(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Проверить доступность username.
    """
    user = await crud.user.get_by_username(db, username=username)
    return {"available": user is None}


@router.get("/check-email/{email}", response_model=schemas.UserAvailability)
async def check_email_availability(
    email: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Проверить доступность email.
    """
    user = await crud.user.get_by_email(db, email=email)
    return {"available": user is None}


@router.get("/{user_id}/audit", response_model=List[schemas.UserAudit])
async def get_user_audit_log(
    user_id: int,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_superuser),
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
async def get_current_user_avatar(current_user: User = Depends(get_current_active_user)):
    """
    Получить URL аватара текущего пользователя.
    
    Returns:
        dict: Информация об аватаре пользователя
    """
    return {
        "avatar_url": current_user.avatar_url,
        "has_avatar": current_user.avatar_url is not None
    }


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
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
            file=file,
            user_id=current_user.id,
            db=db
        )
        
        # Обновляем пользователя в БД
        updated_user = await crud.user.update_avatar(
            db, user_id=current_user.id, avatar_url=avatar_url
        )
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url,
            "user_id": current_user.id
        }
        
    except HTTPException:
        # Перебрасываем HTTP исключения без изменений
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )


@router.delete("/me/avatar")
async def delete_avatar(
    db: AsyncSession = Depends(get_db),
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
        # Удаляем аватар через CRUD
        updated_user = await crud.user.remove_avatar(db, user_id=current_user.id)
        
        return {
            "message": "Avatar deleted successfully",
            "user_id": current_user.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete avatar: {str(e)}"
        )


@router.get("/me/settings", response_model=schemas.UserSettings)
async def get_my_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Получить мои настройки.
    """
    settings = await crud.user.get_user_settings(db, user_id=current_user.id)
    return settings


@router.put("/me/settings", response_model=schemas.UserSettings)
async def update_my_settings(
    settings_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Обновить мои настройки.
    """
    settings = await crud.user.update_user_settings(
        db, user_id=current_user.id, settings_data=settings_data
    )
    return settings


@router.get("/{user_id}/settings", response_model=schemas.UserSettings)
async def get_user_settings(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Получить настройки пользователя.
    """
    # Проверяем, что пользователь может видеть настройки
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для просмотра настроек",
        )

    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Получаем настройки пользователя
    settings = await crud.user.get_user_settings(db, user_id=user_id)
    return settings


@router.put("/{user_id}/settings", response_model=schemas.UserSettings)
async def update_user_settings(
    user_id: int,
    settings_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Обновить настройки пользователя.
    """
    # Проверяем, что пользователь может изменять настройки
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для изменения настроек",
        )

    user = await crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    # Обновляем настройки пользователя
    settings = await crud.user.update_user_settings(
        db, user_id=user_id, settings_data=settings_data
    )
    return settings


@router.get("/search", response_model=List[schemas.User])
async def search_users(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_users_read_user),
):
    """
    Поиск пользователей.
    """
    users = await crud.user.search_users(db, query=q, limit=limit)
    return users
