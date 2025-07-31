"""
Сервис для бизнес-логики профиля пользователя.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.crud.user_profile import user_profile as profile_crud
from app.crud.user import user as user_crud
from app.models.user_profile import UserProfile
from app.models.user import User
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


class UserProfileService:
    """Сервис для работы с профилями пользователей"""

    def __init__(self):
        self.crud = profile_crud

    def get_user_profile(
        self, db: Session, *, user_id: int, current_user: User
    ) -> Optional[UserProfile]:
        """Получить профиль пользователя"""

        # Проверить права доступа
        if not self._can_access_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to profile"
            )

        return self.crud.get_by_user_id(db, user_id=user_id)

    def get_current_user_profile(
        self, db: Session, *, current_user: User
    ) -> Optional[UserProfile]:
        """Получить профиль текущего пользователя"""
        return self.crud.get_by_user_id(db, user_id=current_user.id)

    def create_or_update_profile(
        self,
        db: Session,
        *,
        user_id: int,
        profile_data: UserProfileCreate,
        current_user: User,
    ) -> UserProfile:
        """Создать или обновить профиль пользователя"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to edit this profile",
            )

        # Проверить существование пользователя
        user = user_crud.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Валидировать данные профиля
        validation_result = self._validate_profile_data(profile_data)
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Profile validation failed: {', '.join(validation_result.errors)}",
            )

        # Создать или обновить профиль
        profile = self.crud.create_for_user(db, obj_in=profile_data, user_id=user_id)

        return profile

    def update_profile(
        self,
        db: Session,
        *,
        user_id: int,
        profile_data: UserProfileUpdate,
        current_user: User,
    ) -> UserProfile:
        """Обновить профиль пользователя"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to edit this profile",
            )

        # Получить существующий профиль
        profile = self.crud.get_by_user_id(db, user_id=user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        # Обновить профиль
        updated_profile = self.crud.update_for_user(
            db, user_id=user_id, obj_in=profile_data
        )

        if not updated_profile:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user profile",
            )

        return updated_profile

    def get_public_profile(
        self, db: Session, *, user_id: int, current_user: User
    ) -> UserProfilePublic:
        """Получить публичную версию профиля"""

        profile = self.crud.get_by_user_id(db, user_id=user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        # Создать публичную версию
        public_profile = UserProfilePublic(
            id=profile.id,
            user_id=profile.user_id,
            display_name=profile.display_name,
            first_name=profile.first_name,
            last_name=profile.last_name,
            position=profile.position,
            department=profile.department,
            bio=profile.bio,
            avatar_url=profile.avatar_url,
        )

        # Добавить вычисляемые поля
        public_profile.full_name = profile.full_name
        public_profile.short_name = profile.short_name
        public_profile.avatar_or_default = profile.get_avatar_or_default()

        return public_profile

    def get_profile_completion_status(
        self, db: Session, *, user_id: int, current_user: User
    ) -> UserProfileCompletion:
        """Получить статус заполненности профиля"""

        # Проверить права доступа
        if not self._can_access_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to profile"
            )

        profile = self.crud.get_by_user_id(db, user_id=user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        # Определить недостающие поля
        missing_fields = []
        recommendations = []

        if not profile.first_name:
            missing_fields.append("first_name")
        if not profile.last_name:
            missing_fields.append("last_name")
        if not profile.display_name:
            missing_fields.append("display_name")
        if not profile.phone:
            missing_fields.append("phone")
        if not profile.position:
            missing_fields.append("position")
        if not profile.department:
            missing_fields.append("department")
        if not profile.bio:
            missing_fields.append("bio")
        if not profile.avatar_url:
            missing_fields.append("avatar_url")

        # Рекомендации
        if not profile.phone_verified and profile.phone:
            recommendations.append("Verify your phone number")
        if profile.profile_completion_percentage < 50:
            recommendations.append("Complete at least 50% of your profile")
        if not profile.hire_date:
            recommendations.append("Add your hire date")
        if not profile.employee_id:
            recommendations.append("Add your employee ID")

        return UserProfileCompletion(
            profile_completed=profile.profile_completed,
            profile_completion_percentage=profile.profile_completion_percentage,
            missing_fields=missing_fields,
            recommendations=recommendations,
        )

    def update_avatar(
        self, db: Session, *, user_id: int, avatar_url: str, current_user: User
    ) -> UserProfile:
        """Обновить аватар пользователя"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update avatar",
            )

        profile = self.crud.update_avatar(db, user_id=user_id, avatar_url=avatar_url)

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return profile

    def update_contact_info(
        self,
        db: Session,
        *,
        user_id: int,
        contact_info: ContactInfo,
        current_user: User,
    ) -> UserProfile:
        """Обновить контактную информацию"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update contact info",
            )

        profile = self.crud.update_contact_info(
            db, user_id=user_id, phone=contact_info.phone
        )

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return profile

    def update_work_info(
        self, db: Session, *, user_id: int, work_info: WorkInfo, current_user: User
    ) -> UserProfile:
        """Обновить рабочую информацию"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update work info",
            )

        profile = self.crud.update_work_info(
            db,
            user_id=user_id,
            position=work_info.position,
            department=work_info.department,
            employee_id=work_info.employee_id,
            hire_date=work_info.hire_date,
        )

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return profile

    def update_localization(
        self,
        db: Session,
        *,
        user_id: int,
        localization: LocalizationSettings,
        current_user: User,
    ) -> UserProfile:
        """Обновить настройки локализации"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update localization settings",
            )

        profile = self.crud.update_localization(
            db,
            user_id=user_id,
            timezone=localization.timezone,
            language=localization.language,
        )

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return profile

    def verify_phone(
        self, db: Session, *, user_id: int, current_user: User
    ) -> UserProfile:
        """Подтвердить телефон пользователя"""

        # Проверить права на редактирование
        if not self._can_edit_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to verify phone",
            )

        profile = self.crud.update_phone_verification(
            db, user_id=user_id, verified=True
        )

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return profile

    def search_profiles(
        self,
        db: Session,
        *,
        query: str,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[UserProfileSummary]:
        """Поиск профилей пользователей"""

        # Проверить права на поиск
        if not self._can_search_profiles(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to search profiles",
            )

        profiles = self.crud.search_profiles(db, query=query, skip=skip, limit=limit)

        return [
            UserProfileSummary(
                user_id=profile.user_id,
                display_name=profile.display_name,
                full_name=profile.full_name,
                short_name=profile.short_name,
                position=profile.position,
                department=profile.department,
                avatar_or_default=profile.get_avatar_or_default(),
                profile_completion_percentage=profile.profile_completion_percentage,
            )
            for profile in profiles
        ]

    def get_company_profiles(
        self,
        db: Session,
        *,
        company_id: int,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[UserProfileSummary]:
        """Получить профили пользователей компании"""

        # Проверить права доступа к компании
        if not self._can_access_company_profiles(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to company profiles",
            )

        profiles = self.crud.get_profiles_by_company(
            db, company_id=company_id, skip=skip, limit=limit
        )

        return [
            UserProfileSummary(
                user_id=profile.user_id,
                display_name=profile.display_name,
                full_name=profile.full_name,
                short_name=profile.short_name,
                position=profile.position,
                department=profile.department,
                avatar_or_default=profile.get_avatar_or_default(),
                profile_completion_percentage=profile.profile_completion_percentage,
            )
            for profile in profiles
        ]

    def get_department_profiles(
        self,
        db: Session,
        *,
        department: str,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[UserProfileSummary]:
        """Получить профили отдела"""

        # Проверить права доступа к отделу
        if not self._can_access_department_profiles(current_user, department):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to department profiles",
            )

        profiles = self.crud.get_profiles_by_department(
            db, department=department, skip=skip, limit=limit
        )

        return [
            UserProfileSummary(
                user_id=profile.user_id,
                display_name=profile.display_name,
                full_name=profile.full_name,
                short_name=profile.short_name,
                position=profile.position,
                department=profile.department,
                avatar_or_default=profile.get_avatar_or_default(),
                profile_completion_percentage=profile.profile_completion_percentage,
            )
            for profile in profiles
        ]

    def validate_profile(
        self, db: Session, *, user_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Валидировать профиль пользователя"""

        # Проверить права доступа
        if not self._can_access_profile(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to profile"
            )

        return self.crud.validate_profile_data(db, user_id=user_id)

    def get_profile_statistics(
        self, db: Session, *, current_user: User
    ) -> UserProfileStats:
        """Получить статистику профилей"""

        # Только системные администраторы могут просматривать статистику
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view profile statistics",
            )

        stats_data = self.crud.get_profile_statistics(db)
        return UserProfileStats(**stats_data)

    def bulk_update_completion_status(
        self, db: Session, *, current_user: User
    ) -> Dict[str, int]:
        """Пересчитать статус заполненности для всех профилей"""

        # Только системные администраторы могут выполнять массовые операции
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can perform bulk operations",
            )

        updated_count = self.crud.bulk_update_completion_status(db)
        return {"updated_profiles": updated_count}

    # Приватные методы для валидации и проверки прав

    def _validate_profile_data(
        self, profile_data: UserProfileCreate
    ) -> ProfileValidation:
        """Валидировать данные профиля"""
        errors = []
        warnings = []
        suggestions = []

        # Проверить базовые требования
        if not profile_data.display_name and not profile_data.first_name:
            errors.append("Display name or first name is required")

        # Предупреждения
        if not profile_data.phone:
            warnings.append("Phone number is recommended for better communication")

        if not profile_data.position:
            warnings.append("Position helps others understand your role")

        # Рекомендации
        if not profile_data.bio:
            suggestions.append("Add a bio to tell others about yourself")

        if not profile_data.avatar_url:
            suggestions.append("Upload an avatar to personalize your profile")

        return ProfileValidation(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            completion_suggestions=suggestions,
        )

    def _can_access_profile(self, user: User, target_user_id: int) -> bool:
        """Проверить права доступа к профилю"""
        # Пользователь может видеть свой профиль
        if user.id == target_user_id:
            return True

        # Системные администраторы могут видеть все профили
        if user.is_system_admin:
            return True

        # Сотрудники одной компании могут видеть публичную информацию
        if user.company_id:
            target_user = user_crud.get(db=None, id=target_user_id)  # TODO: передать db
            if target_user and target_user.company_id == user.company_id:
                return True

        # TODO: Проверить доступ через Enhanced Role System
        return False

    def _can_edit_profile(self, user: User, target_user_id: int) -> bool:
        """Проверить права на редактирование профиля"""
        # Пользователь может редактировать свой профиль
        if user.id == target_user_id:
            return True

        # Системные администраторы могут редактировать все профили
        if user.is_system_admin:
            return True

        # Администраторы компании могут редактировать профили сотрудников
        if user.is_company_admin and user.company_id:
            target_user = user_crud.get(db=None, id=target_user_id)  # TODO: передать db
            if target_user and target_user.company_id == user.company_id:
                return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_search_profiles(self, user: User) -> bool:
        """Проверить права на поиск профилей"""
        # Все аутентифицированные пользователи могут искать профили в своей компании
        return user.company_id is not None or user.is_system_admin

    def _can_access_company_profiles(self, user: User, company_id: int) -> bool:
        """Проверить права доступа к профилям компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # TODO: Проверить доступ через Enhanced Role System
        return False

    def _can_access_department_profiles(self, user: User, department: str) -> bool:
        """Проверить права доступа к профилям отдела"""
        if user.is_system_admin:
            return True

        # Проверить, работает ли пользователь в том же отделе
        user_profile = self.crud.get_by_user_id(
            db=None, user_id=user.id
        )  # TODO: передать db
        if user_profile and user_profile.department == department:
            return True

        # TODO: Проверить доступ через Enhanced Role System
        return False


# Создаем экземпляр сервиса
user_profile_service = UserProfileService()
