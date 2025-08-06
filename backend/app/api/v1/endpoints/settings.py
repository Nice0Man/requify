"""
API endpoints для настроек пользователя.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.crud.settings import settings_crud
from app.schemas.settings import (
    UserSettings,
    UserSettingsUpdate,
    UserProfileSettings,
    NotificationSettings,
    InterfaceSettings,
    SecuritySettings,
    PrivacySettings,
    SettingsResponse,
    UserSessionsResponse,
    RevokeSessionsRequest,
    ChangePasswordRequest,
    ExportSettingsResponse,
    ImportSettingsRequest,
)

router = APIRouter()


# =============================================================================
# Получение настроек
# =============================================================================


@router.get("/", response_model=UserSettings)
async def get_all_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить все настройки текущего пользователя.
    Соответствует settingsDAO.getAllSettings()
    """
    try:
        settings = await settings_crud.get_user_settings(db, user_id=current_user.id)
        return settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении настроек: {str(e)}",
        )


@router.get("/profile", response_model=UserProfileSettings)
async def get_profile_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить настройки профиля.
    Соответствует settingsDAO.getProfileSettings()
    """
    try:
        profile_settings = await settings_crud.get_profile_settings(
            db, user_id=current_user.id
        )
        return profile_settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении настроек профиля: {str(e)}",
        )


# =============================================================================
# Обновление настроек
# =============================================================================


@router.put("/", response_model=SettingsResponse)
async def update_all_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки пользователя (частичное обновление).
    """
    return await settings_crud.update_user_settings(
        db, user_id=current_user.id, settings_update=settings_update
    )


@router.put("/profile", response_model=SettingsResponse)
async def update_profile_settings(
    profile_settings: UserProfileSettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки профиля.
    Соответствует settingsDAO.updateProfileSettings()
    """
    return await settings_crud.update_profile_settings(
        db, user_id=current_user.id, profile_settings=profile_settings
    )


@router.put("/notifications", response_model=SettingsResponse)
async def update_notification_settings(
    notification_settings: NotificationSettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки уведомлений.
    Соответствует settingsDAO.updateNotificationSettings()
    """
    return await settings_crud.update_notification_settings(
        db, user_id=current_user.id, notification_settings=notification_settings
    )


@router.put("/interface", response_model=SettingsResponse)
async def update_interface_settings(
    interface_settings: InterfaceSettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки интерфейса.
    Соответствует settingsDAO.updateInterfaceSettings()
    """
    return await settings_crud.update_interface_settings(
        db, user_id=current_user.id, interface_settings=interface_settings
    )


@router.put("/security", response_model=SettingsResponse)
async def update_security_settings(
    security_settings: SecuritySettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки безопасности.
    """
    return await settings_crud.update_security_settings(
        db, user_id=current_user.id, security_settings=security_settings
    )


@router.put("/privacy", response_model=SettingsResponse)
async def update_privacy_settings(
    privacy_settings: PrivacySettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки приватности.
    """
    return await settings_crud.update_privacy_settings(
        db, user_id=current_user.id, privacy_settings=privacy_settings
    )


# =============================================================================
# Управление паролем
# =============================================================================


@router.post("/change-password", response_model=SettingsResponse)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Изменить пароль пользователя.
    Соответствует settingsDAO.changePassword()
    """
    return await settings_crud.change_password(
        db, user_id=current_user.id, password_data=password_data
    )


# =============================================================================
# Управление сессиями
# =============================================================================


@router.get("/sessions", response_model=UserSessionsResponse)
async def get_user_sessions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить активные сессии пользователя.
    Соответствует settingsDAO.getUserSessions()
    """
    return await settings_crud.get_user_sessions(db, user_id=current_user.id)


@router.post("/sessions/revoke", response_model=SettingsResponse)
async def revoke_sessions(
    revoke_data: RevokeSessionsRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Отозвать сессии пользователя.
    Соответствует settingsDAO.revokeSessions()
    """
    return await settings_crud.revoke_sessions(
        db, user_id=current_user.id, revoke_data=revoke_data
    )


# =============================================================================
# Импорт/экспорт настроек
# =============================================================================


@router.get("/export")
async def export_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Экспортировать настройки пользователя в JSON файл.
    """
    try:
        settings_json = await settings_crud.export_settings(db, user_id=current_user.id)

        # В реальном приложении здесь бы создавался файл и возвращался URL
        # Пока просто возвращаем JSON
        from fastapi.responses import Response

        return Response(
            content=settings_json,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=settings_user_{current_user.id}.json"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при экспорте настроек: {str(e)}",
        )


@router.post("/import", response_model=SettingsResponse)
async def import_settings(
    file: UploadFile = File(...),
    overwrite: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Импортировать настройки пользователя из JSON файла.
    """
    try:
        # Проверяем тип файла
        if not file.filename.endswith(".json"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Поддерживаются только JSON файлы",
            )

        # Читаем содержимое файла
        content = await file.read()
        settings_json = content.decode("utf-8")

        # Импортируем настройки
        return await settings_crud.import_settings(
            db,
            user_id=current_user.id,
            settings_json=settings_json,
            overwrite=overwrite,
        )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при чтении файла: некорректная кодировка",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при импорте настроек: {str(e)}",
        )


# =============================================================================
# Административные endpoints
# =============================================================================


@router.get("/admin/{user_id}", response_model=UserSettings)
async def get_user_settings_admin(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить настройки пользователя (только для администраторов).
    """
    # Проверяем права
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав"
        )

    try:
        settings = await settings_crud.get_user_settings(db, user_id=user_id)
        return settings
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении настроек: {str(e)}",
        )


@router.put("/admin/{user_id}", response_model=SettingsResponse)
async def update_user_settings_admin(
    user_id: int,
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить настройки пользователя (только для администраторов).
    """
    # Проверяем права
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав"
        )

    return await settings_crud.update_user_settings(
        db, user_id=user_id, settings_update=settings_update
    )


# =============================================================================
# Сброс настроек
# =============================================================================


@router.post("/reset", response_model=SettingsResponse)
async def reset_settings(
    section: str = None,  # profile, notifications, interface, security, privacy, all
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Сбросить настройки к значениям по умолчанию.

    Args:
        section: Секция для сброса (profile, notifications, interface, security, privacy, all)
                Если не указано - сбрасываются все настройки
    """
    try:
        # Создаем дефолтные настройки
        default_settings = settings_crud._create_default_settings(current_user)

        if section == "all" or section is None:
            # Сбрасываем все настройки
            settings_update = UserSettingsUpdate(
                profile=default_settings.profile,
                notifications=default_settings.notifications,
                interface=default_settings.interface,
                security=default_settings.security,
                privacy=default_settings.privacy,
            )
        elif section == "profile":
            settings_update = UserSettingsUpdate(profile=default_settings.profile)
        elif section == "notifications":
            settings_update = UserSettingsUpdate(
                notifications=default_settings.notifications
            )
        elif section == "interface":
            settings_update = UserSettingsUpdate(interface=default_settings.interface)
        elif section == "security":
            settings_update = UserSettingsUpdate(security=default_settings.security)
        elif section == "privacy":
            settings_update = UserSettingsUpdate(privacy=default_settings.privacy)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверная секция. Допустимые значения: profile, notifications, interface, security, privacy, all",
            )

        result = await settings_crud.update_user_settings(
            db, user_id=current_user.id, settings_update=settings_update
        )

        if result.success:
            result.message = (
                f"Настройки {section or 'все'} сброшены к значениям по умолчанию"
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сбросе настроек: {str(e)}",
        )
