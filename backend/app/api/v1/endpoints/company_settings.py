"""
API endpoints для настроек компании.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

    AdminPermissions,
from app.api.dependencies import get_db, get_current_active_user, SessionDep,
from app.models.user import User
from app.services.company_settings_service import company_settings_service
from app.schemas.company_settings import (
    CompanySettingsCreate,
    CompanySettingsUpdate,
    CompanySettingsResponse,
    CompanySettingsProfile,
    PasswordPolicySettings,
    NotificationSettings,
    SSOConfiguration,
    CompanySettingsValidation,
    FileStorageProvider,
    ProjectVisibility,
    SSOProvider,
)

router = APIRouter()


@router.get("/company/{company_id}/settings", response_model=CompanySettingsResponse)
async def get_company_settings(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Получить настройки компании.
    """
    settings = company_settings_service.get_company_settings(
        db=db, company_id=company_id, current_user=current_user
    )

    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company settings not found"
        )

    response = CompanySettingsResponse(**settings.__dict__)

    # Добавить вычисляемые поля
    response.is_sso_configured = settings.enable_sso and settings.validate_sso_config()
    response.password_policy_strength = "strong" if settings.enforce_2fa else "medium"
    response.total_integrations_count = len(settings.get_allowed_integrations())

    return response


@router.post(
    "/company/{company_id}/settings",
    response_model=CompanySettingsResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_update_company_settings(
    *,
    company_id: int,
    settings_in: CompanySettingsCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Создать или обновить настройки компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.create_or_update_settings(
        db=db,
        company_id=company_id,
        settings_data=settings_in,
        current_user=current_user,
    )

    return CompanySettingsResponse(**settings.__dict__)


@router.put("/company/{company_id}/settings", response_model=CompanySettingsResponse)
async def update_company_settings(
    *,
    company_id: int,
    settings_in: CompanySettingsUpdate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Обновить настройки компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.update_settings(
        db=db,
        company_id=company_id,
        settings_data=settings_in,
        current_user=current_user,
    )

    return CompanySettingsResponse(**settings.__dict__)


@router.get(
    "/company/{company_id}/settings/profile", response_model=CompanySettingsProfile
)
async def get_company_settings_profile(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsProfile:
    """
    Получить упрощенный профиль настроек компании.

    Возвращает только основные настройки без чувствительных данных.
    """
    settings = company_settings_service.get_company_settings(
        db=db, company_id=company_id, current_user=current_user
    )

    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company settings not found"
        )

    return CompanySettingsProfile(
        domain=settings.domain,
        enable_sso=settings.enable_sso,
        enforce_2fa=settings.enforce_2fa,
        default_language=settings.default_language,
        default_currency=settings.default_currency,
        default_timezone=settings.default_timezone,
        enable_email_notifications=settings.enable_email_notifications,
        enable_slack_integration=settings.enable_slack_integration,
        default_project_visibility=ProjectVisibility(
            settings.default_project_visibility
        ),
        allow_external_collaborators=settings.allow_external_collaborators,
        enable_analytics=settings.enable_analytics,
        allow_data_export=settings.allow_data_export,
        file_storage_provider=FileStorageProvider(settings.file_storage_provider),
        max_file_size_mb=settings.max_file_size_mb,
    )


# Password Policy Endpoints


@router.get(
    "/company/{company_id}/settings/password-policy",
    response_model=PasswordPolicySettings,
)
async def get_password_policy(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> PasswordPolicySettings:
    """
    Получить политику паролей компании.
    """
    return company_settings_service.get_password_policy(
        db=db, company_id=company_id, current_user=current_user
    )


@router.put(
    "/company/{company_id}/settings/password-policy",
    response_model=CompanySettingsResponse,
)
async def update_password_policy(
    *,
    company_id: int,
    policy_in: PasswordPolicySettings,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Обновить политику паролей компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.update_password_policy(
        db=db, company_id=company_id, policy_data=policy_in, current_user=current_user
    )

    return CompanySettingsResponse(**settings.__dict__)


# Notification Settings Endpoints


@router.get(
    "/company/{company_id}/settings/notifications", response_model=NotificationSettings
)
async def get_notification_settings(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> NotificationSettings:
    """
    Получить настройки уведомлений компании.
    """
    return company_settings_service.get_notification_settings(
        db=db, company_id=company_id, current_user=current_user
    )


@router.put(
    "/company/{company_id}/settings/notifications",
    response_model=CompanySettingsResponse,
)
async def update_notification_settings(
    *,
    company_id: int,
    notification_in: NotificationSettings,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Обновить настройки уведомлений компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.update_notification_settings(
        db=db,
        company_id=company_id,
        notification_data=notification_in,
        current_user=current_user,
    )

    return CompanySettingsResponse(**settings.__dict__)


# SSO Configuration Endpoints


@router.get("/company/{company_id}/settings/sso", response_model=Dict[str, Any])
async def get_sso_configuration(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить конфигурацию SSO компании.

    Требует права на управление настройками компании.
    """
    config = company_settings_service.get_sso_configuration(
        db=db, company_id=company_id, current_user=current_user
    )

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSO configuration not found or disabled",
        )

    return config


@router.post(
    "/company/{company_id}/settings/sso", response_model=CompanySettingsResponse
)
async def configure_sso(
    *,
    company_id: int,
    sso_config: SSOConfiguration,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Настроить SSO для компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.configure_sso(
        db=db, company_id=company_id, sso_config=sso_config, current_user=current_user
    )

    return CompanySettingsResponse(**settings.__dict__)


@router.delete(
    "/company/{company_id}/settings/sso", response_model=CompanySettingsResponse
)
async def disable_sso(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Отключить SSO для компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.disable_sso(
        db=db, company_id=company_id, current_user=current_user
    )

    return CompanySettingsResponse(**settings.__dict__)


# File Upload Settings


@router.get("/company/{company_id}/settings/file-upload", response_model=Dict[str, Any])
async def get_file_upload_settings(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить настройки загрузки файлов компании.
    """
    return company_settings_service.get_file_upload_settings(
        db=db, company_id=company_id, current_user=current_user
    )


@router.post(
    "/company/{company_id}/settings/validate-file", response_model=Dict[str, Any]
)
async def validate_file_upload(
    company_id: int,
    file_size_bytes: int = Query(..., description="Размер файла в байтах"),
    file_extension: str = Query(..., description="Расширение файла (без точки)"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Валидировать возможность загрузки файла.

    Проверяет размер файла и тип согласно настройкам компании.
    """
    return company_settings_service.validate_file_upload(
        db=db,
        company_id=company_id,
        file_size_bytes=file_size_bytes,
        file_extension=file_extension,
        current_user=current_user,
    )


# Export Settings


@router.get("/company/{company_id}/settings/export", response_model=Dict[str, Any])
async def get_export_settings(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить настройки экспорта данных компании.
    """
    return company_settings_service.get_export_settings(
        db=db, company_id=company_id, current_user=current_user
    )


@router.get(
    "/company/{company_id}/settings/export/check/{format_name}",
    response_model=Dict[str, bool],
)
async def check_export_format(
    company_id: int,
    format_name: str,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, bool]:
    """
    Проверить, разрешен ли формат экспорта.
    """
    allowed = company_settings_service.can_export_format(
        db=db, company_id=company_id, format_name=format_name, current_user=current_user
    )

    return {"allowed": allowed}


# Custom Settings


@router.post(
    "/company/{company_id}/settings/custom/{key}",
    response_model=CompanySettingsResponse,
)
async def update_custom_setting(
    *,
    company_id: int,
    key: str,
    value: Dict[str, Any],
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Обновить кастомную настройку компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.update_custom_setting(
        db=db,
        company_id=company_id,
        key=key,
        value=value["value"],
        current_user=current_user,
    )

    return CompanySettingsResponse(**settings.__dict__)


@router.delete(
    "/company/{company_id}/settings/custom/{key}",
    response_model=CompanySettingsResponse,
)
async def delete_custom_setting(
    company_id: int,
    key: str,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Удалить кастомную настройку компании.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.delete_custom_setting(
        db=db, company_id=company_id, key=key, current_user=current_user
    )

    return CompanySettingsResponse(**settings.__dict__)


# Backup and Restore


@router.post("/company/{company_id}/settings/backup", response_model=Dict[str, Any])
async def backup_settings(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Создать резервную копию настроек компании.

    Требует права на управление настройками компании.
    """
    return company_settings_service.backup_settings(
        db=db, company_id=company_id, current_user=current_user
    )


@router.post(
    "/company/{company_id}/settings/restore", response_model=CompanySettingsResponse
)
async def restore_settings(
    *,
    company_id: int,
    backup_data: Dict[str, Any],
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsResponse:
    """
    Восстановить настройки компании из резервной копии.

    Требует права на управление настройками компании.
    """
    settings = company_settings_service.restore_settings(
        db=db, company_id=company_id, backup_data=backup_data, current_user=current_user
    )

    return CompanySettingsResponse(**settings.__dict__)


# Administrative Endpoints


@router.get("/settings/statistics", response_model=Dict[str, Any])
async def get_settings_statistics(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить статистику настроек компаний.

    Доступно только системным администраторам.
    """
    return company_settings_service.get_settings_statistics(
        db=db, current_user=current_user
    )


@router.get("/settings/providers/sso", response_model=List[str])
async def get_available_sso_providers() -> List[str]:
    """
    Получить список доступных провайдеров SSO.
    """
    return [provider.value for provider in SSOProvider]


@router.get("/settings/providers/storage", response_model=List[str])
async def get_available_storage_providers() -> List[str]:
    """
    Получить список доступных провайдеров хранения файлов.
    """
    return [provider.value for provider in FileStorageProvider]


@router.get("/settings/visibility/levels", response_model=List[str])
async def get_project_visibility_levels() -> List[str]:
    """
    Получить доступные уровни видимости проектов.
    """
    return [level.value for level in ProjectVisibility]


@router.post(
    "/company/{company_id}/settings/validate", response_model=CompanySettingsValidation
)
async def validate_settings(
    *,
    company_id: int,
    settings_in: CompanySettingsCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySettingsValidation:
    """
    Валидировать настройки компании без сохранения.

    Проверяет корректность настроек и возвращает рекомендации.
    """
    # Проверить права доступа
    if not company_settings_service._can_access_company(current_user, company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
        )

    return company_settings_service._validate_settings(settings_in)
