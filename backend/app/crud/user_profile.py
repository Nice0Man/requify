"""
CRUD операции для модели UserProfile.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.user_profile import UserProfile
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate


class CRUDUserProfile(CRUDBase[UserProfile, UserProfileCreate, UserProfileUpdate]):
    """CRUD операции для профиля пользователя"""

    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[UserProfile]:
        """Получить профиль пользователя по user_id"""
        return db.query(self.model).filter(self.model.user_id == user_id).first()

    def create_for_user(
        self, db: Session, *, obj_in: UserProfileCreate, user_id: int
    ) -> UserProfile:
        """Создать профиль для пользователя"""
        # Проверить, нет ли уже профиля для этого пользователя
        existing = self.get_by_user_id(db, user_id=user_id)
        if existing:
            # Обновить существующий профиль
            return self.update(db, db_obj=existing, obj_in=obj_in)

        # Создать новый профиль
        db_obj = self.model(user_id=user_id, **obj_in.dict())

        # Обновить статус заполненности
        db_obj.update_completion_status()

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_for_user(
        self, db: Session, *, user_id: int, obj_in: UserProfileUpdate
    ) -> Optional[UserProfile]:
        """Обновить профиль пользователя"""
        profile = self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        # Обновить профиль
        updated_profile = self.update(db, db_obj=profile, obj_in=obj_in)

        # Пересчитать статус заполненности
        if updated_profile:
            updated_profile.update_completion_status()
            db.commit()
            db.refresh(updated_profile)

        return updated_profile

    def get_profiles_by_company(
        self, db: Session, *, company_id: int, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили пользователей компании"""
        return (
            db.query(self.model)
            .join(self.model.user)
            .filter(self.model.user.has(company_id=company_id))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_by_department(
        self, db: Session, *, department: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по отделу"""
        return (
            db.query(self.model)
            .filter(self.model.department == department)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_by_position(
        self, db: Session, *, position: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по должности"""
        return (
            db.query(self.model)
            .filter(self.model.position == position)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_profiles(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Поиск профилей по имени, должности или отделу"""
        search_term = f"%{query}%"
        return (
            db.query(self.model)
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
            .all()
        )

    def get_completed_profiles(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить завершенные профили"""
        return (
            db.query(self.model)
            .filter(self.model.profile_completed == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_incomplete_profiles(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить незавершенные профили"""
        return (
            db.query(self.model)
            .filter(self.model.profile_completed == False)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_by_completion_percentage(
        self, db: Session, *, min_percentage: int, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили с процентом заполненности выше указанного"""
        return (
            db.query(self.model)
            .filter(self.model.profile_completion_percentage >= min_percentage)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_with_phone(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили с указанным телефоном"""
        return (
            db.query(self.model)
            .filter(and_(self.model.phone.isnot(None), self.model.phone != ""))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_by_language(
        self, db: Session, *, language: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по языку"""
        return (
            db.query(self.model)
            .filter(self.model.language == language)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_by_timezone(
        self, db: Session, *, timezone: str, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили по часовому поясу"""
        return (
            db.query(self.model)
            .filter(self.model.timezone == timezone)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_phone_verification(
        self, db: Session, *, user_id: int, verified: bool = True
    ) -> Optional[UserProfile]:
        """Обновить статус верификации телефона"""
        profile = self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        profile.phone_verified = verified
        db.commit()
        db.refresh(profile)
        return profile

    def update_avatar(
        self, db: Session, *, user_id: int, avatar_url: str
    ) -> Optional[UserProfile]:
        """Обновить аватар пользователя"""
        profile = self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        profile.avatar_url = avatar_url
        profile.update_completion_status()
        db.commit()
        db.refresh(profile)
        return profile

    def update_contact_info(
        self, db: Session, *, user_id: int, phone: Optional[str] = None
    ) -> Optional[UserProfile]:
        """Обновить контактную информацию"""
        profile = self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        if phone is not None:
            profile.phone = phone
            profile.phone_verified = False  # Сбросить верификацию при изменении

        profile.update_completion_status()
        db.commit()
        db.refresh(profile)
        return profile

    def update_work_info(
        self,
        db: Session,
        *,
        user_id: int,
        position: Optional[str] = None,
        department: Optional[str] = None,
        employee_id: Optional[str] = None,
        hire_date: Optional[datetime] = None,
    ) -> Optional[UserProfile]:
        """Обновить рабочую информацию"""
        profile = self.get_by_user_id(db, user_id=user_id)
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
        db.commit()
        db.refresh(profile)
        return profile

    def update_localization(
        self,
        db: Session,
        *,
        user_id: int,
        timezone: Optional[str] = None,
        language: Optional[str] = None,
    ) -> Optional[UserProfile]:
        """Обновить настройки локализации"""
        profile = self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None

        if timezone is not None:
            profile.timezone = timezone
        if language is not None:
            profile.language = language

        db.commit()
        db.refresh(profile)
        return profile

    def get_profile_statistics(self, db: Session) -> Dict[str, Any]:
        """Получить статистику профилей"""
        total_profiles = db.query(func.count(self.model.id)).scalar()

        completed_profiles = (
            db.query(func.count(self.model.id))
            .filter(self.model.profile_completed == True)
            .scalar()
        )

        avg_completion = (
            db.query(func.avg(self.model.profile_completion_percentage)).scalar() or 0
        )

        # Статистика по должностям
        position_stats = (
            db.query(self.model.position, func.count(self.model.id).label("count"))
            .filter(self.model.position.isnot(None))
            .group_by(self.model.position)
            .order_by(desc("count"))
            .limit(10)
            .all()
        )

        # Статистика по отделам
        department_stats = (
            db.query(self.model.department, func.count(self.model.id).label("count"))
            .filter(self.model.department.isnot(None))
            .group_by(self.model.department)
            .order_by(desc("count"))
            .limit(10)
            .all()
        )

        # Статистика по языкам
        language_stats = (
            db.query(self.model.language, func.count(self.model.id).label("count"))
            .group_by(self.model.language)
            .all()
        )

        # Статистика по часовым поясам
        timezone_stats = (
            db.query(self.model.timezone, func.count(self.model.id).label("count"))
            .group_by(self.model.timezone)
            .all()
        )

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

    def get_profiles_needing_completion(
        self, db: Session, *, threshold: int = 50, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили с низким процентом заполненности"""
        return (
            db.query(self.model)
            .filter(self.model.profile_completion_percentage < threshold)
            .order_by(self.model.profile_completion_percentage)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def bulk_update_completion_status(self, db: Session) -> int:
        """Пересчитать статус заполненности для всех профилей"""
        profiles = db.query(self.model).all()
        updated_count = 0

        for profile in profiles:
            old_percentage = profile.profile_completion_percentage
            profile.update_completion_status()

            if profile.profile_completion_percentage != old_percentage:
                updated_count += 1

        if updated_count > 0:
            db.commit()

        return updated_count

    def get_profile_by_employee_id(
        self, db: Session, *, employee_id: str
    ) -> Optional[UserProfile]:
        """Получить профиль по табельному номеру"""
        return (
            db.query(self.model).filter(self.model.employee_id == employee_id).first()
        )

    def get_profiles_hired_after(
        self, db: Session, *, hire_date: datetime, skip: int = 0, limit: int = 100
    ) -> List[UserProfile]:
        """Получить профили пользователей, принятых после указанной даты"""
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.hire_date.isnot(None), self.model.hire_date >= hire_date
                )
            )
            .order_by(desc(self.model.hire_date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def validate_profile_data(self, db: Session, *, user_id: int) -> Dict[str, Any]:
        """Валидировать данные профиля"""
        profile = self.get_by_user_id(db, user_id=user_id)
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
