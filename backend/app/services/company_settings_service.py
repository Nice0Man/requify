"""
Сервис для бизнес-логики настроек компании.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.crud.company_settings import company_settings as settings_crud
from app.crud.company import company as company_crud
from app.models.company_settings import CompanySettings
from app.models.user import User
from app.schemas.company_settings import (
    CompanySettingsCreate,
    CompanySettingsUpdate,
    CompanySettingsResponse,
    PasswordPolicySettings,
    NotificationSettings,
    SSOConfiguration,
    IntegrationSettings,
    CompanySettingsValidation,
)


class CompanySettingsService:
    """Сервис для работы с настройками компании"""

    def __init__(self):
        self.crud = settings_crud

    def get_company_settings(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Optional[CompanySettings]:
        """Получить настройки компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_by_company(db, company_id=company_id)

    def create_or_update_settings(
        self,
        db: Session,
        *,
        company_id: int,
        settings_data: CompanySettingsCreate,
        current_user: User,
    ) -> CompanySettings:
        """Создать или обновить настройки компании"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage company settings",
            )

        # Проверить существование компании
        company = company_crud.get(db, id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Валидировать настройки
        validation_result = self._validate_settings(settings_data)
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Settings validation failed: {', '.join(validation_result.errors)}",
            )

        # Создать или обновить настройки
        settings = self.crud.create_for_company(
            db, obj_in=settings_data, company_id=company_id
        )

        return settings

    def update_settings(
        self,
        db: Session,
        *,
        company_id: int,
        settings_data: CompanySettingsUpdate,
        current_user: User,
    ) -> CompanySettings:
        """Обновить настройки компании"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage company settings",
            )

        # Получить существующие настройки
        settings = self.crud.get_by_company(db, company_id=company_id)
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        # Обновить настройки
        updated_settings = self.crud.update_for_company(
            db, company_id=company_id, obj_in=settings_data
        )

        if not updated_settings:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update company settings",
            )

        return updated_settings

    def get_password_policy(
        self, db: Session, *, company_id: int, current_user: User
    ) -> PasswordPolicySettings:
        """Получить политику паролей компании"""

        # Проверить права доступа
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        policy_dict = self.crud.get_password_policy(db, company_id=company_id)
        return PasswordPolicySettings(**policy_dict)

    def update_password_policy(
        self,
        db: Session,
        *,
        company_id: int,
        policy_data: PasswordPolicySettings,
        current_user: User,
    ) -> CompanySettings:
        """Обновить политику паролей"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage password policy",
            )

        settings = self.crud.update_password_policy(
            db, company_id=company_id, password_policy=policy_data.dict()
        )

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def get_notification_settings(
        self, db: Session, *, company_id: int, current_user: User
    ) -> NotificationSettings:
        """Получить настройки уведомлений"""

        # Проверить права доступа
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        settings_dict = self.crud.get_notification_settings(db, company_id=company_id)
        return NotificationSettings(**settings_dict)

    def update_notification_settings(
        self,
        db: Session,
        *,
        company_id: int,
        notification_data: NotificationSettings,
        current_user: User,
    ) -> CompanySettings:
        """Обновить настройки уведомлений"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage notification settings",
            )

        settings = self.crud.update_notification_settings(
            db, company_id=company_id, notification_settings=notification_data.dict()
        )

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def configure_sso(
        self,
        db: Session,
        *,
        company_id: int,
        sso_config: SSOConfiguration,
        current_user: User,
    ) -> CompanySettings:
        """Настроить SSO"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to configure SSO",
            )

        # Валидировать конфигурацию SSO
        if not self._validate_sso_config(sso_config):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid SSO configuration",
            )

        settings = self.crud.update_sso_configuration(
            db,
            company_id=company_id,
            sso_provider=sso_config.provider.value,
            sso_config=sso_config.dict(exclude={"provider"}),
        )

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def disable_sso(
        self, db: Session, *, company_id: int, current_user: User
    ) -> CompanySettings:
        """Отключить SSO"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to disable SSO",
            )

        settings = self.crud.disable_sso(db, company_id=company_id)

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def get_sso_configuration(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Optional[Dict[str, Any]]:
        """Получить конфигурацию SSO"""

        # Проверить права на просмотр конфигурации SSO
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view SSO configuration",
            )

        return self.crud.get_sso_configuration(db, company_id=company_id)

    def validate_file_upload(
        self,
        db: Session,
        *,
        company_id: int,
        file_size_bytes: int,
        file_extension: str,
        current_user: User,
    ) -> Dict[str, Any]:
        """Валидировать загрузку файла"""

        # Проверить права доступа
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.validate_file_upload(
            db,
            company_id=company_id,
            file_size_bytes=file_size_bytes,
            file_extension=file_extension,
        )

    def get_file_upload_settings(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Получить настройки загрузки файлов"""

        # Проверить права доступа
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_file_upload_settings(db, company_id=company_id)

    def can_export_format(
        self, db: Session, *, company_id: int, format_name: str, current_user: User
    ) -> bool:
        """Проверить, разрешен ли формат экспорта"""

        # Проверить права доступа
        if not self._can_access_company(current_user, company_id):
            return False

        return self.crud.can_export_format(
            db, company_id=company_id, format_name=format_name
        )

    def get_export_settings(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Получить настройки экспорта"""

        # Проверить права доступа
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_export_settings(db, company_id=company_id)

    def update_custom_setting(
        self, db: Session, *, company_id: int, key: str, value: Any, current_user: User
    ) -> CompanySettings:
        """Обновить кастомную настройку"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update custom settings",
            )

        settings = self.crud.update_custom_setting(
            db, company_id=company_id, key=key, value=value
        )

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def delete_custom_setting(
        self, db: Session, *, company_id: int, key: str, current_user: User
    ) -> CompanySettings:
        """Удалить кастомную настройку"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete custom settings",
            )

        settings = self.crud.delete_custom_setting(db, company_id=company_id, key=key)

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def backup_settings(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Создать резервную копию настроек"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to backup settings",
            )

        backup = self.crud.backup_settings(db, company_id=company_id)

        if not backup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return backup

    def restore_settings(
        self,
        db: Session,
        *,
        company_id: int,
        backup_data: Dict[str, Any],
        current_user: User,
    ) -> CompanySettings:
        """Восстановить настройки из резервной копии"""

        # Проверить права на управление настройками
        if not self._can_manage_company_settings(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to restore settings",
            )

        settings = self.crud.restore_settings(
            db, company_id=company_id, backup_data=backup_data
        )

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return settings

    def get_settings_statistics(
        self, db: Session, *, current_user: User
    ) -> Dict[str, Any]:
        """Получить статистику настроек"""

        # Только системные администраторы могут просматривать статистику
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view settings statistics",
            )

        return self.crud.get_settings_statistics(db)

    # Приватные методы для валидации и проверки прав

    def _validate_settings(
        self, settings_data: CompanySettingsCreate
    ) -> CompanySettingsValidation:
        """Валидировать настройки"""
        errors = []
        warnings = []
        recommendations = []

        # Валидация SSO
        if settings_data.enable_sso:
            if not settings_data.sso_provider:
                errors.append("SSO provider must be specified when SSO is enabled")

            if not settings_data.sso_config:
                errors.append("SSO configuration must be provided when SSO is enabled")

        # Валидация политики паролей
        if settings_data.password_policy:
            min_length = settings_data.password_policy.get("min_length", 8)
            if min_length < 8:
                warnings.append(
                    "Password minimum length less than 8 characters is not recommended"
                )

        # Валидация файлов
        if settings_data.max_file_size_mb > 500:
            warnings.append("Large file size limit may impact performance")

        # Рекомендации по безопасности
        if not settings_data.enforce_2fa:
            recommendations.append(
                "Consider enabling mandatory 2FA for better security"
            )

        if not settings_data.require_email_verification:
            recommendations.append(
                "Email verification is recommended for better security"
            )

        return CompanySettingsValidation(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            recommendations=recommendations,
        )

    def _validate_sso_config(self, sso_config: SSOConfiguration) -> bool:
        """Валидировать конфигурацию SSO"""
        required_fields = {
            "google": ["client_id", "client_secret"],
            "microsoft": ["client_id", "client_secret", "tenant_id"],
            "okta": ["client_id", "client_secret", "domain"],
            "auth0": ["client_id", "client_secret", "domain"],
        }

        provider_requirements = required_fields.get(sso_config.provider.value, [])

        config_dict = sso_config.dict()
        for field in provider_requirements:
            if not config_dict.get(field):
                return False

        return True

    def _can_access_company(self, user: User, company_id: int) -> bool:
        """Проверить права доступа к компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # TODO: Проверить доступ через Enhanced Role System
        return False

    def _can_manage_company_settings(self, user: User, company_id: int) -> bool:
        """Проверить права на управление настройками компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id and user.is_company_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False


# Создаем экземпляр сервиса
company_settings_service = CompanySettingsService()
