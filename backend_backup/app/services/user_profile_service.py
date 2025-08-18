"""
Сервис для бизнес-логики профиля пользователя.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.crud.user_profile import user_profile as profile_crud
from app.crud.user import user as user_crud
from app.models.user_profile import UserProfile
from app.models.user import User
from app.services.permission_service import permission_service
from app.core.constants import Permission, RoleScope
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
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class UserProfileRepository:
    """Репозиторий для работы с профилями пользователей."""

    def __init__(self):
        self.crud = profile_crud

    async def get_by_user_id(
        self, db: AsyncSession, user_id: int
    ) -> Optional[UserProfile]:
        """Получить профиль по ID пользователя."""
        return await self.crud.get_by_user_id(db, user_id=user_id)

    async def create_for_user(
        self, db: AsyncSession, user_id: int, profile_data: UserProfileCreate
    ) -> UserProfile:
        """Создать профиль для пользователя."""
        return await self.crud.create_for_user(db, obj_in=profile_data, user_id=user_id)

    async def update_profile(
        self, db: AsyncSession, profile: UserProfile, update_data: UserProfileUpdate
    ) -> UserProfile:
        """Обновить существующий профиль."""
        return await self.crud.update(db, db_obj=profile, obj_in=update_data)

    async def delete_profile(self, db: AsyncSession, user_id: int) -> bool:
        """Удалить профиль пользователя."""
        return await self.crud.remove_by_user_id(db, user_id=user_id)

    async def get_profiles_by_filters(
        self, db: AsyncSession, filters: Dict[str, Any], skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по фильтрам."""
        return await self.crud.get_by_filters(
            db, filters=filters, skip=skip, limit=limit
        )


class IProfileValidator:
    """Интерфейс для валидаторов профиля."""

    def validate(self, profile_data: Any) -> ProfileValidation:
        """Валидация данных профиля."""
        raise NotImplementedError


class BasicProfileValidator(IProfileValidator):
    """Базовый валидатор профиля."""

    def validate(self, profile_data: UserProfileCreate) -> ProfileValidation:
        """Валидация основных данных профиля."""
        errors = []
        warnings = []

        # Проверка обязательных полей
        if hasattr(profile_data, "first_name") and not profile_data.first_name:
            errors.append("First name is required")

        if hasattr(profile_data, "last_name") and not profile_data.last_name:
            errors.append("Last name is required")

        # Проверка email
        if hasattr(profile_data, "email") and profile_data.email:
            if "@" not in profile_data.email:
                errors.append("Invalid email format")

        # Проверка телефона
        if hasattr(profile_data, "phone") and profile_data.phone:
            if len(profile_data.phone) < 10:
                warnings.append("Phone number seems too short")

        return ProfileValidation(
            is_valid=len(errors) == 0, errors=errors, warnings=warnings
        )


class CompanyProfileValidator(BasicProfileValidator):
    """Валидатор профиля для корпоративных пользователей."""

    def validate(self, profile_data: UserProfileCreate) -> ProfileValidation:
        """Валидация профиля с дополнительными корпоративными требованиями."""
        result = super().validate(profile_data)

        # Дополнительные проверки для корпоративных пользователей
        if hasattr(profile_data, "company") and not profile_data.company:
            result.errors.append("Company information is required for corporate users")

        if hasattr(profile_data, "position") and not profile_data.position:
            result.warnings.append("Position information is recommended")

        return result


class ProfilePermissionChecker:
    """Класс для проверки прав доступа к профилям."""

    @staticmethod
    async def can_access_profile(
        db: AsyncSession, current_user: User, target_user_id: int
    ) -> bool:
        """Проверить права на просмотр профиля."""
        # Пользователь может просматривать свой собственный профиль
        if current_user.id == target_user_id:
            return True

        # Проверить системные права
        return await permission_service.has_permission(
            db, current_user, Permission.VIEW_USERS
        )

    @staticmethod
    async def can_edit_profile(
        db: AsyncSession, current_user: User, target_user_id: int
    ) -> bool:
        """Проверить права на редактирование профиля."""
        # Пользователь может редактировать свой собственный профиль
        if current_user.id == target_user_id:
            return True

        # Проверить административные права
        return await permission_service.has_permission(
            db, current_user, Permission.MANAGE_USERS
        )


class UserProfileService(BaseService):
    """
    Сервис для работы с профилями пользователей.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (для валидации)
    - Template Method (для основных операций)
    """

    def __init__(self):
        self._repository = UserProfileRepository()
        self._validators: Dict[str, IProfileValidator] = {}
        self._permission_checker = ProfilePermissionChecker()
        super().__init__()

    def get_service_name(self) -> str:
        return "UserProfileService"

    def _setup(self):
        """Инициализация сервиса с регистрацией валидаторов."""
        if not self._initialized:
            self.register_validator("basic", BasicProfileValidator())
            self.register_validator("company", CompanyProfileValidator())
            super()._setup()

    def register_validator(self, name: str, validator: IProfileValidator):
        """Регистрация валидатора профиля."""
        self._validators[name] = validator
        self._log_operation("register_validator", {"validator": name})

    async def get_user_profile(
        self, db: AsyncSession, user_id: int, current_user: User
    ) -> Optional[UserProfile]:
        """
        Получить профиль пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            current_user: Текущий пользователь

        Returns:
            UserProfile: Профиль пользователя или None

        Raises:
            PermissionError: Если нет прав доступа
        """
        try:
            self._log_operation(
                "get_user_profile",
                {"user_id": user_id, "current_user_id": current_user.id},
            )

            # Проверить права доступа
            if not await self._permission_checker.can_access_profile(
                db, current_user, user_id
            ):
                raise PermissionError("Access denied to profile")

            return await self._repository.get_by_user_id(db, user_id)

        except Exception as e:
            raise self._handle_error(e, "get_user_profile")

    async def get_current_user_profile(
        self, db: AsyncSession, current_user: User
    ) -> Optional[UserProfile]:
        """Получить профиль текущего пользователя."""
        try:
            self._log_operation(
                "get_current_user_profile", {"user_id": current_user.id}
            )
            return await self._repository.get_by_user_id(db, current_user.id)
        except Exception as e:
            raise self._handle_error(e, "get_current_user_profile")

    async def create_or_update_profile(
        self,
        db: AsyncSession,
        user_id: int,
        profile_data: UserProfileCreate,
        current_user: User,
        validator_type: str = "basic",
    ) -> UserProfile:
        """
        Создать или обновить профиль пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            profile_data: Данные профиля
            current_user: Текущий пользователь
            validator_type: Тип валидатора

        Returns:
            UserProfile: Созданный/обновленный профиль

        Raises:
            PermissionError: Если нет прав на редактирование
            NotFoundError: Если пользователь не найден
            ValidationError: Если данные не валидны
        """
        try:
            self._log_operation(
                "create_or_update_profile",
                {
                    "user_id": user_id,
                    "current_user_id": current_user.id,
                    "validator_type": validator_type,
                },
            )

            # Проверить права на редактирование
            if not await self._permission_checker.can_edit_profile(
                db, current_user, user_id
            ):
                raise PermissionError("Not enough permissions to edit this profile")

            # Проверить существование пользователя
            user = await user_crud.get(db, id=user_id)
            if not user:
                raise NotFoundError("User not found")

            # Валидировать данные профиля
            validation_result = self._validate_profile_data(
                profile_data, validator_type
            )
            if not validation_result.is_valid:
                raise ValidationError(
                    f"Profile validation failed: {', '.join(validation_result.errors)}"
                )

            # Создать или обновить профиль
            return await self._repository.create_for_user(db, user_id, profile_data)

        except Exception as e:
            raise self._handle_error(e, "create_or_update_profile")

    async def update_profile(
        self,
        db: AsyncSession,
        user_id: int,
        update_data: UserProfileUpdate,
        current_user: User,
        validator_type: str = "basic",
    ) -> UserProfile:
        """
        Обновить существующий профиль.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            update_data: Данные для обновления
            current_user: Текущий пользователь
            validator_type: Тип валидатора

        Returns:
            UserProfile: Обновленный профиль
        """
        try:
            self._log_operation(
                "update_profile",
                {"user_id": user_id, "current_user_id": current_user.id},
            )

            # Проверить права на редактирование
            if not await self._permission_checker.can_edit_profile(
                db, current_user, user_id
            ):
                raise PermissionError("Not enough permissions to edit this profile")

            # Получить существующий профиль
            profile = await self._repository.get_by_user_id(db, user_id)
            if not profile:
                raise NotFoundError("Profile not found")

            # Валидировать данные (если нужно)
            if hasattr(update_data, "__dict__"):
                # Создаем временный объект для валидации
                temp_data = UserProfileCreate(**update_data.dict(exclude_unset=True))
                validation_result = self._validate_profile_data(
                    temp_data, validator_type
                )
                if not validation_result.is_valid:
                    raise ValidationError(
                        f"Profile validation failed: {', '.join(validation_result.errors)}"
                    )

            # Обновить профиль
            return await self._repository.update_profile(db, profile, update_data)

        except Exception as e:
            raise self._handle_error(e, "update_profile")

    async def delete_profile(
        self, db: AsyncSession, user_id: int, current_user: User
    ) -> bool:
        """
        Удалить профиль пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            current_user: Текущий пользователь

        Returns:
            bool: Успешность удаления
        """
        try:
            self._log_operation(
                "delete_profile",
                {"user_id": user_id, "current_user_id": current_user.id},
            )

            # Проверить права на редактирование
            if not await self._permission_checker.can_edit_profile(
                db, current_user, user_id
            ):
                raise PermissionError("Not enough permissions to delete this profile")

            return await self._repository.delete_profile(db, user_id)

        except Exception as e:
            raise self._handle_error(e, "delete_profile")

    async def get_profile_stats(
        self, db: AsyncSession, user_id: int, current_user: User
    ) -> UserProfileStats:
        """Получить статистику профиля."""
        try:
            self._log_operation("get_profile_stats", {"user_id": user_id})

            # Проверить права доступа
            if not await self._permission_checker.can_access_profile(
                db, current_user, user_id
            ):
                raise PermissionError("Access denied to profile")

            profile = await self._repository.get_by_user_id(db, user_id)
            if not profile:
                raise NotFoundError("Profile not found")

            # Вычислить статистики профиля
            return self._calculate_profile_stats(profile)

        except Exception as e:
            raise self._handle_error(e, "get_profile_stats")

    def _validate_profile_data(
        self, profile_data: UserProfileCreate, validator_type: str = "basic"
    ) -> ProfileValidation:
        """Валидация данных профиля с помощью указанного валидатора."""
        if validator_type not in self._validators:
            validator_type = "basic"

        validator = self._validators[validator_type]
        return validator.validate(profile_data)

    def _calculate_profile_stats(self, profile: UserProfile) -> UserProfileStats:
        """Вычисление статистик профиля."""
        # Подсчет заполненности профиля
        total_fields = 10  # Примерное количество полей
        filled_fields = 0

        if profile.first_name:
            filled_fields += 1
        if profile.last_name:
            filled_fields += 1
        if profile.email:
            filled_fields += 1
        if profile.phone:
            filled_fields += 1
        if profile.bio:
            filled_fields += 1
        if profile.company:
            filled_fields += 1
        if profile.position:
            filled_fields += 1
        if profile.location:
            filled_fields += 1
        if profile.website:
            filled_fields += 1
        if profile.avatar_url:
            filled_fields += 1

        completion_percentage = (filled_fields / total_fields) * 100

        return UserProfileStats(
            completion_percentage=completion_percentage,
            filled_fields_count=filled_fields,
            total_fields_count=total_fields,
            last_updated=profile.updated_at,
            profile_views=getattr(profile, "view_count", 0),
        )


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("user_profile", UserProfileService)

# Singleton instance для обратной совместимости
user_profile_service = UserProfileService()
