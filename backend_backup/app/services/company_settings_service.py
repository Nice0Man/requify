"""
Company Settings Service.

Сервис для управления настройками компании.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.crud.company_settings import company_settings as settings_crud
from app.crud.company import company as company_crud
from app.models.company_settings import CompanySettings
from app.models.user import User
from app.services.permission_service import permission_service
from app.core.constants import Permission, RoleScope
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
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class CompanySettingsServiceError(ServiceError):
    """Ошибки сервиса настроек компании."""

    pass


class CompanySettingsNotFoundError(CompanySettingsServiceError):
    """Настройки компании не найдены."""

    def __init__(self, company_id: int):
        super().__init__(
            f"Company settings for company {company_id} not found", "SETTINGS_NOT_FOUND"
        )


class CompanySettingsValidationError(CompanySettingsServiceError):
    """Ошибки валидации настроек компании."""

    pass


# Абстрактные интерфейсы
class ICompanySettingsRepository(ABC):
    """Интерфейс репозитория настроек компании."""

    @abstractmethod
    async def get_by_company(
        self, db: AsyncSession, company_id: int
    ) -> Optional[CompanySettings]:
        """Получить настройки компании."""
        pass

    @abstractmethod
    async def create_for_company(
        self, db: AsyncSession, company_id: int, settings_data: Dict[str, Any]
    ) -> CompanySettings:
        """Создать настройки для компании."""
        pass

    @abstractmethod
    async def update_for_company(
        self, db: AsyncSession, company_id: int, update_data: Dict[str, Any]
    ) -> CompanySettings:
        """Обновить настройки компании."""
        pass


class ISettingsValidator(ABC):
    """Интерфейс валидатора настроек."""

    @abstractmethod
    def validate_settings(
        self, settings_data: CompanySettingsCreate
    ) -> CompanySettingsValidation:
        """Валидировать настройки."""
        pass

    @abstractmethod
    def validate_sso_config(self, sso_config: SSOConfiguration) -> bool:
        """Валидировать конфигурацию SSO."""
        pass


class ICompanySettingsPermissionChecker(ABC):
    """Интерфейс проверки прав доступа к настройкам компании."""

    @abstractmethod
    async def can_access_company(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права доступа к компании."""
        pass

    @abstractmethod
    async def can_manage_company_settings(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права на управление настройками компании."""
        pass


# Конкретные реализации
class CompanySettingsRepository(ICompanySettingsRepository):
    """Репозиторий настроек компании."""

    def __init__(self):
        self.crud = settings_crud

    async def get_by_company(
        self, db: AsyncSession, company_id: int
    ) -> Optional[CompanySettings]:
        """Получить настройки компании."""
        return await self.crud.get_by_company(db, company_id=company_id)

    async def create_for_company(
        self, db: AsyncSession, company_id: int, settings_data: Dict[str, Any]
    ) -> CompanySettings:
        """Создать настройки для компании."""
        return await self.crud.create_for_company(
            db, obj_in=settings_data, company_id=company_id
        )

    async def update_for_company(
        self, db: AsyncSession, company_id: int, update_data: Dict[str, Any]
    ) -> CompanySettings:
        """Обновить настройки компании."""
        return await self.crud.update_for_company(
            db, company_id=company_id, obj_in=update_data
        )


class StandardSettingsValidator(ISettingsValidator):
    """Стандартный валидатор настроек."""

    def validate_settings(
        self, settings_data: CompanySettingsCreate
    ) -> CompanySettingsValidation:
        """Валидировать настройки."""
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

    def validate_sso_config(self, sso_config: SSOConfiguration) -> bool:
        """Валидировать конфигурацию SSO."""
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


class CompanySettingsPermissionChecker(ICompanySettingsPermissionChecker):
    """Проверка прав доступа к настройкам компании."""

    async def can_access_company(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права доступа к компании."""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # Проверить доступ через Enhanced Role System
        return await permission_service.check_user_permission(
            db=db,
            user=user,
            permission=Permission.VIEW_PROJECT,
            scope=RoleScope.COMPANY,
            context_id=company_id,
        )

    async def can_manage_company_settings(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права на управление настройками компании."""
        if user.is_system_admin:
            return True

        if user.company_id == company_id and user.is_company_admin:
            return True

        # Проверить права через Enhanced Role System
        return await permission_service.check_user_permission(
            db=db,
            user=user,
            permission=Permission.MANAGE_PROJECT,
            scope=RoleScope.COMPANY,
            context_id=company_id,
        )


class CompanySettingsService(BaseService):
    """
    Основной сервис для управления настройками компании.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы)
    - Template Method (процесс обновления настроек)
    """

    def __init__(self):
        self._repository: ICompanySettingsRepository = CompanySettingsRepository()
        self._validator: ISettingsValidator = StandardSettingsValidator()
        self._permission_checker: ICompanySettingsPermissionChecker = (
            CompanySettingsPermissionChecker()
        )
        super().__init__()

    def get_service_name(self) -> str:
        return "CompanySettingsService"

    def set_repository(self, repository: ICompanySettingsRepository):
        """Установить репозиторий настроек."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: ISettingsValidator):
        """Установить валидатор настроек."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def get_company_settings(
        self, db: AsyncSession, company_id: int, current_user: User
    ) -> Optional[CompanySettings]:
        """Получить настройки компании."""
        try:
            self._log_operation(
                "get_company_settings",
                {"company_id": company_id, "user_id": current_user.id},
            )

            # Проверить права доступа к компании
            if not await self._permission_checker.can_access_company(
                db, current_user, company_id
            ):
                raise PermissionError("Access denied to company")

            return await self._repository.get_by_company(db, company_id)

        except Exception as e:
            raise self._handle_error(e, "get_company_settings")

    async def create_or_update_settings(
        self,
        db: AsyncSession,
        company_id: int,
        settings_data: CompanySettingsCreate,
        current_user: User,
    ) -> CompanySettings:
        """Создать или обновить настройки компании."""
        try:
            self._log_operation(
                "create_or_update_settings",
                {"company_id": company_id, "user_id": current_user.id},
            )

            # Проверить права на управление настройками
            if not await self._permission_checker.can_manage_company_settings(
                db, current_user, company_id
            ):
                raise PermissionError(
                    "Insufficient permissions to manage company settings"
                )

            # Проверить существование компании
            company = await company_crud.get(db, id=company_id)
            if not company:
                raise NotFoundError("Company not found")

            # Валидировать настройки
            validation_result = self._validator.validate_settings(settings_data)
            if not validation_result.is_valid:
                raise CompanySettingsValidationError(
                    f"Settings validation failed: {', '.join(validation_result.errors)}"
                )

            # Создать или обновить настройки
            settings = await self._repository.create_for_company(
                db, company_id, settings_data.dict()
            )

            return settings

        except Exception as e:
            raise self._handle_error(e, "create_or_update_settings")

    async def update_settings(
        self,
        db: AsyncSession,
        company_id: int,
        settings_data: CompanySettingsUpdate,
        current_user: User,
    ) -> CompanySettings:
        """Обновить настройки компании."""
        try:
            self._log_operation(
                "update_settings",
                {"company_id": company_id, "user_id": current_user.id},
            )

            # Проверить права на управление настройками
            if not await self._permission_checker.can_manage_company_settings(
                db, current_user, company_id
            ):
                raise PermissionError(
                    "Insufficient permissions to manage company settings"
                )

            # Получить существующие настройки
            settings = await self._repository.get_by_company(db, company_id)
            if not settings:
                raise CompanySettingsNotFoundError(company_id)

            # Обновить настройки
            updated_settings = await self._repository.update_for_company(
                db, company_id, settings_data.dict(exclude_unset=True)
            )

            if not updated_settings:
                raise CompanySettingsServiceError("Failed to update company settings")

            return updated_settings

        except Exception as e:
            raise self._handle_error(e, "update_settings")

    async def get_password_policy(
        self, db: AsyncSession, company_id: int, current_user: User
    ) -> PasswordPolicySettings:
        """Получить политику паролей компании."""
        try:
            self._log_operation(
                "get_password_policy",
                {"company_id": company_id, "user_id": current_user.id},
            )

            # Проверить права доступа
            if not await self._permission_checker.can_access_company(
                db, current_user, company_id
            ):
                raise PermissionError("Access denied to company")

            policy_dict = await settings_crud.get_password_policy(
                db, company_id=company_id
            )
            return PasswordPolicySettings(**policy_dict)

        except Exception as e:
            raise self._handle_error(e, "get_password_policy")

    async def update_password_policy(
        self,
        db: AsyncSession,
        company_id: int,
        policy_data: PasswordPolicySettings,
        current_user: User,
    ) -> CompanySettings:
        """Обновить политику паролей."""
        try:
            self._log_operation(
                "update_password_policy",
                {"company_id": company_id, "user_id": current_user.id},
            )

            # Проверить права на управление настройками
            if not await self._permission_checker.can_manage_company_settings(
                db, current_user, company_id
            ):
                raise PermissionError(
                    "Insufficient permissions to manage password policy"
                )

            settings = await settings_crud.update_password_policy(
                db, company_id=company_id, password_policy=policy_data.dict()
            )

            if not settings:
                raise CompanySettingsNotFoundError(company_id)

            return settings

        except Exception as e:
            raise self._handle_error(e, "update_password_policy")

    async def configure_sso(
        self,
        db: AsyncSession,
        company_id: int,
        sso_config: SSOConfiguration,
        current_user: User,
    ) -> CompanySettings:
        """Настроить SSO."""
        try:
            self._log_operation(
                "configure_sso",
                {
                    "company_id": company_id,
                    "provider": sso_config.provider.value,
                    "user_id": current_user.id,
                },
            )

            # Проверить права на управление настройками
            if not await self._permission_checker.can_manage_company_settings(
                db, current_user, company_id
            ):
                raise PermissionError("Insufficient permissions to configure SSO")

            # Валидировать конфигурацию SSO
            if not self._validator.validate_sso_config(sso_config):
                raise CompanySettingsValidationError("Invalid SSO configuration")

            settings = await settings_crud.update_sso_configuration(
                db,
                company_id=company_id,
                sso_provider=sso_config.provider.value,
                sso_config=sso_config.dict(exclude={"provider"}),
            )

            if not settings:
                raise CompanySettingsNotFoundError(company_id)

            return settings

        except Exception as e:
            raise self._handle_error(e, "configure_sso")

    async def backup_settings(
        self, db: AsyncSession, company_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Создать резервную копию настроек."""
        try:
            self._log_operation(
                "backup_settings",
                {"company_id": company_id, "user_id": current_user.id},
            )

            # Проверить права на управление настройками
            if not await self._permission_checker.can_manage_company_settings(
                db, current_user, company_id
            ):
                raise PermissionError("Insufficient permissions to backup settings")

            backup = await settings_crud.backup_settings(db, company_id=company_id)

            if not backup:
                raise CompanySettingsNotFoundError(company_id)

            return backup

        except Exception as e:
            raise self._handle_error(e, "backup_settings")

    async def get_settings_statistics(
        self, db: AsyncSession, current_user: User
    ) -> Dict[str, Any]:
        """Получить статистику настроек."""
        try:
            self._log_operation("get_settings_statistics", {"user_id": current_user.id})

            # Только системные администраторы могут просматривать статистику
            if not current_user.is_system_admin:
                raise PermissionError(
                    "Only system administrators can view settings statistics"
                )

            return await settings_crud.get_settings_statistics(db)

        except Exception as e:
            raise self._handle_error(e, "get_settings_statistics")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("company_settings", CompanySettingsService)

# Singleton instance
company_settings_service = CompanySettingsService()
