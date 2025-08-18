"""
CRUD операции для модели UserProfile.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, desc, select
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.user_profile import UserProfile
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate


class CRUDUserProfile(CRUDBase[UserProfile, UserProfileCreate, UserProfileUpdate]):
    """CRUD операции для профиля пользователя"""

    async def get_by_user_id(
        self, db: AsyncSession, *, user_id: int
    ) -> Optional[UserProfile]:
        """Получить профиль пользователя по user_id"""
        result = await db.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_for_user(
        self, db: AsyncSession, *, obj_in: UserProfileCreate, user_id: int
    ) -> UserProfile:
        """Создать профиль для пользователя"""
        # Проверить, нет ли уже профиля для этого пользователя
        existing = await self.get_by_user_id(db, user_id=user_id)
        if existing:
            # Обновить существующий профиль
            return await self.update(db, db_obj=existing, obj_in=obj_in)

        # Создать новый профиль
        db_obj = self.model(user_id=user_id, **obj_in.dict())

        # Обновить статус заполненности
        db_obj.update_completion_status()

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_for_user(
        self, db: AsyncSession, *, user_id: int, obj_in: UserProfileUpdate
    ) -> Optional[UserProfile]:
        """Обновить профиль пользователя"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        # Обновить профиль
        updated_profile = await self.update(db, db_obj=profile, obj_in=obj_in)

        # Пересчитать статус заполненности
        if updated_profile:
            updated_profile.update_completion_status()
            await db.commit()
            await db.refresh(updated_profile)

        return updated_profile

    async def get_profiles_by_company(
        self, db: AsyncSession, *, company_id: int, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили пользователей компании"""
        query = (
            select(self.model)
            .join(self.model.user)
            .filter(self.model.user.has(company_id=company_id))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_profiles_by_department(
        self, db: AsyncSession, *, department: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по отделу"""
        query = (
            select(self.model)
            .filter(self.model.department == department)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_profiles_by_position(
        self, db: AsyncSession, *, position: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по должности"""
        query = (
            select(self.model)
            .filter(self.model.position == position)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def search_profiles(
        self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Поиск профилей по имени, должности или отделу"""
        search_term = f"%{query}%"
        sql_query = (
            select(self.model)
            .filter(
                or_(
                    self.model.first_name.ilike(search_term),
                    self.model.last_name.ilike(search_term),
                    self.model.display_name.ilike(search_term),
                    self.model.position.ilike(search_term),
                    self.model.department.ilike(search_term),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(sql_query)
        return result.scalars().all()

    async def get_completed_profiles(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить завершенные профили"""
        query = (
            select(self.model)
            .filter(self.model.profile_completed == True)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_incomplete_profiles(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить незавершенные профили"""
        query = (
            select(self.model)
            .filter(self.model.profile_completed == False)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_profiles_by_completion_percentage(
        self, db: AsyncSession, *, min_percentage: int, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили с процентом заполненности выше указанного"""
        query = (
            select(self.model)
            .filter(self.model.profile_completion_percentage >= min_percentage)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_profiles_with_phone(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили с указанным телефоном"""
        query = (
            select(self.model)
            .filter(and_(self.model.phone.isnot(None), self.model.phone != ""))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_profiles_by_language(
        self, db: AsyncSession, *, language: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по языку"""
        query = (
            select(self.model)
            .filter(self.model.language == language)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_profiles_by_timezone(
        self, db: AsyncSession, *, timezone: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по часовому поясу"""
        query = (
            select(self.model)
            .filter(self.model.timezone == timezone)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def update_phone_verification(
        self, db: AsyncSession, *, user_id: int, verified: bool = True
    ) -> Optional[UserProfile]:
        """Обновить статус верификации телефона"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        profile.phone_verified = verified
        await db.commit()
        await db.refresh(profile)
        return profile

    async def update_avatar(
        self, db: AsyncSession, *, user_id: int, avatar_url: str
    ) -> Optional[UserProfile]:
        """Обновить аватар пользователя"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        profile.avatar_url = avatar_url
        profile.update_completion_status()
        await db.commit()
        await db.refresh(profile)
        return profile

    async def update_contact_info(
        self, db: AsyncSession, *, user_id: int, phone: Optional[str] = None
    ) -> Optional[UserProfile]:
        """Обновить контактную информацию"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        if phone is not None:
            profile.phone = phone
            profile.phone_verified = False  # Сбросить верификацию при изменении

        profile.update_completion_status()
        await db.commit()
        await db.refresh(profile)
        return profile

    async def update_work_info(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        position: Optional[str] = None,
        department: Optional[str] = None,
        employee_id: Optional[str] = None,
        hire_date: Optional[datetime] = None,
    ) -> Optional[UserProfile]:
        """Обновить рабочую информацию"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        if position is not None:
            profile.position = position
        if department is not None:
            profile.department = department
        if employee_id is not None:
            profile.employee_id = employee_id
        if hire_date is not None:
            profile.hire_date = hire_date

        profile.update_completion_status()
        await db.commit()
        await db.refresh(profile)
        return profile

    async def update_localization(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        timezone: Optional[str] = None,
        language: Optional[str] = None,
    ) -> Optional[UserProfile]:
        """Обновить настройки локализации"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        if timezone is not None:
            profile.timezone = timezone
        if language is not None:
            profile.language = language

        await db.commit()
        await db.refresh(profile)
        return profile

    async def get_profile_statistics(self, db: AsyncSession) -> Dict[str, Any]:
        """Получить статистику профилей"""
        total_profiles_result = await db.execute(select(func.count(self.model.id)))
        total_profiles = total_profiles_result.scalar()

        completed_profiles_result = await db.execute(
            select(func.count(self.model.id)).filter(
                self.model.profile_completed == True
            )
        )
        completed_profiles = completed_profiles_result.scalar()

        avg_completion_result = await db.execute(
            select(func.avg(self.model.profile_completion_percentage))
        )
        avg_completion = avg_completion_result.scalar() or 0

        # Статистика по должностям
        position_stats_result = await db.execute(
            select(self.model.position, func.count(self.model.id).label("count"))
            .filter(self.model.position.isnot(None))
            .group_by(self.model.position)
            .order_by(desc("count"))
            .limit(10)
        )
        position_stats = position_stats_result.all()

        # Статистика по отделам
        department_stats_result = await db.execute(
            select(self.model.department, func.count(self.model.id).label("count"))
            .filter(self.model.department.isnot(None))
            .group_by(self.model.department)
            .order_by(desc("count"))
            .limit(10)
        )
        department_stats = department_stats_result.all()

        # Статистика по языкам
        language_stats_result = await db.execute(
            select(
                self.model.language, func.count(self.model.id).label("count")
            ).group_by(self.model.language)
        )
        language_stats = language_stats_result.all()

        # Статистика по часовым поясам
        timezone_stats_result = await db.execute(
            select(
                self.model.timezone, func.count(self.model.id).label("count")
            ).group_by(self.model.timezone)
        )
        timezone_stats = timezone_stats_result.all()

        return {
            "total_profiles": total_profiles,
            "completed_profiles": completed_profiles,
            "completion_rate": (
                round((completed_profiles / total_profiles * 100), 2)
                if total_profiles > 0
                else 0
            ),
            "average_completion_percentage": round(avg_completion, 2),
            "most_common_positions": [pos for pos, count in position_stats],
            "most_common_departments": [dept for dept, count in department_stats],
            "language_distribution": {lang: count for lang, count in language_stats},
            "timezone_distribution": {tz: count for tz, count in timezone_stats},
        }

    async def get_profiles_needing_completion(
        self, db: AsyncSession, *, threshold: int = 50, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили с низким процентом заполненности"""
        query = (
            select(self.model)
            .filter(self.model.profile_completion_percentage < threshold)
            .order_by(self.model.profile_completion_percentage)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def bulk_update_completion_status(self, db: AsyncSession) -> int:
        """Пересчитать статус заполненности для всех профилей"""
        result = await db.execute(select(self.model))
        profiles = result.scalars().all()
        updated_count = 0

        for profile in profiles:
            old_percentage = profile.profile_completion_percentage
            profile.update_completion_status()

            if profile.profile_completion_percentage != old_percentage:
                updated_count += 1

        if updated_count > 0:
            await db.commit()

        return updated_count

    async def get_profile_by_employee_id(
        self, db: AsyncSession, *, employee_id: str
    ) -> Optional[UserProfile]:
        """Получить профиль по табельному номеру"""
        result = await db.execute(
            select(self.model).filter(self.model.employee_id == employee_id)
        )
        return result.scalar_one_or_none()

    async def get_profiles_hired_after(
        self, db: AsyncSession, *, hire_date: datetime, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили пользователей, принятых после указанной даты"""
        query = (
            select(self.model)
            .filter(
                and_(
                    self.model.hire_date.isnot(None), self.model.hire_date >= hire_date
                )
            )
            .order_by(desc(self.model.hire_date))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def validate_profile_data(
        self, db: AsyncSession, *, user_id: int
    ) -> Dict[str, Any]:
        """Валидировать данные профиля"""
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return {"valid": False, "errors": ["Profile not found"]}

        errors = []
        warnings = []
        suggestions = []

        # Проверить обязательные поля
        if not profile.display_name and not profile.first_name:
            errors.append("Display name or first name is required")

        # Предупреждения
        if not profile.phone:
            warnings.append("Phone number is not provided")

        if not profile.position:
            warnings.append("Position is not specified")

        if not profile.department:
            warnings.append("Department is not specified")

        # Рекомендации
        if not profile.bio:
            suggestions.append(
                "Consider adding a bio to make your profile more complete"
            )

        if not profile.avatar_url:
            suggestions.append("Upload an avatar to personalize your profile")

        if profile.profile_completion_percentage < 70:
            suggestions.append("Complete more profile fields to reach 70% completion")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "completion_suggestions": suggestions,
            "completion_percentage": profile.profile_completion_percentage,
        }


# Создаем экземпляр CRUD
user_profile = CRUDUserProfile(UserProfile)


from datetime import datetime
