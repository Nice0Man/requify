"""
Сервис для бизнес-логики контактных данных компании.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.crud.company_contact import company_contact as company_contact_crud
from app.crud.company import company as company_crud
from app.models.company_contact import CompanyContact
from app.models.user import User
from app.schemas.company_contact import (
    CompanyContactCreate,
    CompanyContactUpdate,
    CompanyContactResponse,
)


class CompanyContactService:
    """Сервис для работы с контактными данными компании"""

    def __init__(self):
        self.crud = company_contact_crud

    def get_company_contact(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Optional[CompanyContact]:
        """Получить контактные данные компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_by_company(db, company_id=company_id)

    def create_or_update_company_contact(
        self,
        db: Session,
        *,
        company_id: int,
        contact_data: CompanyContactCreate,
        current_user: User,
    ) -> CompanyContact:
        """Создать или обновить контактные данные компании"""

        # Проверить права на редактирование компании
        if not self._can_edit_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to edit company contact",
            )

        # Проверить существование компании
        company = company_crud.get(db, id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Создать или обновить контактные данные
        contact = self.crud.create_for_company(
            db, obj_in=contact_data, company_id=company_id
        )

        return contact

    def update_company_contact(
        self,
        db: Session,
        *,
        company_id: int,
        contact_data: CompanyContactUpdate,
        current_user: User,
    ) -> CompanyContact:
        """Обновить контактные данные компании"""

        # Проверить права на редактирование
        if not self._can_edit_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to edit company contact",
            )

        # Получить существующие контактные данные
        contact = self.crud.get_by_company(db, company_id=company_id)
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company contact not found",
            )

        # Обновить контактные данные
        updated_contact = self.crud.update_for_company(
            db, company_id=company_id, obj_in=contact_data
        )

        if not updated_contact:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update company contact",
            )

        return updated_contact

    def search_companies_by_email(
        self, db: Session, *, email: str, current_user: User
    ) -> List[CompanyContact]:
        """Поиск компаний по email"""

        # Только системные администраторы могут искать по всем компаниям
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can search across all companies",
            )

        return self.crud.get_companies_by_email(db, email=email)

    def search_companies_by_phone(
        self, db: Session, *, phone: str, current_user: User
    ) -> List[CompanyContact]:
        """Поиск компаний по телефону"""

        # Только системные администраторы могут искать по всем компаниям
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can search across all companies",
            )

        return self.crud.get_companies_by_phone(db, phone=phone)

    def get_companies_by_location(
        self,
        db: Session,
        *,
        country: Optional[str] = None,
        city: Optional[str] = None,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[CompanyContact]:
        """Поиск компаний по местоположению"""

        # Только системные администраторы могут искать по всем компаниям
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can search across all companies",
            )

        if country:
            return self.crud.get_companies_by_country(
                db, country=country, skip=skip, limit=limit
            )
        elif city:
            return self.crud.get_companies_by_city(
                db, city=city, skip=skip, limit=limit
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either country or city must be specified",
            )

    def get_companies_by_timezone(
        self,
        db: Session,
        *,
        timezone: str,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[CompanyContact]:
        """Поиск компаний по временной зоне"""

        # Только системные администраторы могут искать по всем компаниям
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can search across all companies",
            )

        return self.crud.get_by_timezone(db, timezone=timezone, skip=skip, limit=limit)

    def search_company_contacts(
        self,
        db: Session,
        *,
        query: str,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[CompanyContact]:
        """Поиск контактных данных компаний"""

        # Только системные администраторы могут искать по всем компаниям
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can search across all companies",
            )

        return self.crud.search_contacts(db, query=query, skip=skip, limit=limit)

    def get_incomplete_contacts(
        self, db: Session, *, current_user: User, skip: int = 0, limit: int = 100
    ) -> List[CompanyContact]:
        """Получить компании с неполными контактными данными"""

        # Только системные администраторы могут просматривать все компании
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view all company contacts",
            )

        return self.crud.get_incomplete_contacts(db, skip=skip, limit=limit)

    def get_contact_statistics(
        self, db: Session, *, current_user: User
    ) -> Dict[str, Any]:
        """Получить статистику контактных данных"""

        # Только системные администраторы могут просматривать статистику
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view contact statistics",
            )

        return self.crud.get_contact_stats(db)

    def validate_contact_data(
        self, contact_data: CompanyContactCreate
    ) -> Dict[str, List[str]]:
        """Валидация контактных данных"""
        errors = {}

        # Проверить обязательные поля
        if not contact_data.primary_email:
            errors.setdefault("primary_email", []).append("Primary email is required")

        # Проверить форматы email
        emails = [
            contact_data.primary_email,
            contact_data.secondary_email,
            contact_data.support_email,
            contact_data.billing_email,
        ]

        for email in emails:
            if email and "@" not in email:
                errors.setdefault("email_format", []).append(
                    f"Invalid email format: {email}"
                )

        # Проверить URL сайта
        if contact_data.website and not contact_data.website.startswith(
            ("http://", "https://")
        ):
            errors.setdefault("website", []).append(
                "Website must start with http:// or https://"
            )

        # Проверить временную зону
        if contact_data.timezone:
            # Можно добавить валидацию временных зон
            pass

        # Проверить рабочие дни
        if contact_data.business_days:
            valid_days = [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ]
            for day in contact_data.business_days:
                if day.lower() not in valid_days:
                    errors.setdefault("business_days", []).append(
                        f"Invalid business day: {day}"
                    )

        return errors

    # Приватные методы для проверки прав доступа

    def _can_access_company(self, user: User, company_id: int) -> bool:
        """Проверить права доступа к компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # TODO: Проверить доступ через Enhanced Role System
        return False

    def _can_edit_company(self, user: User, company_id: int) -> bool:
        """Проверить права на редактирование компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id and user.is_company_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False


# Создаем экземпляр сервиса
company_contact_service = CompanyContactService()
