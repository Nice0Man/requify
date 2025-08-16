"""
CRUD операции для модели CompanyContact.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.crud.base import CRUDBase
from app.models.company_contact import CompanyContact
from app.schemas.company_contact import CompanyContactCreate, CompanyContactUpdate


class CRUDCompanyContact(
    CRUDBase[CompanyContact, CompanyContactCreate, CompanyContactUpdate]
):
    """CRUD операции для контактных данных компании"""

    def get_by_company(
        self, db: Session, *, company_id: int
    ) -> Optional[CompanyContact]:
        """Получить контактные данные компании"""
        return db.query(self.model).filter(self.model.company_id == company_id).first()

    def create_for_company(
        self, db: Session, *, obj_in: CompanyContactCreate, company_id: int
    ) -> CompanyContact:
        """Создать контактные данные для компании"""
        # Проверить, нет ли уже контактных данных для этой компании
        existing = self.get_by_company(db, company_id=company_id)
        if existing:
            # Обновить существующие данные
            return self.update(db, db_obj=existing, obj_in=obj_in)

        # Создать новые контактные данные
        db_obj = self.model(company_id=company_id, **obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_for_company(
        self, db: Session, *, company_id: int, obj_in: CompanyContactUpdate
    ) -> Optional[CompanyContact]:
        """Обновить контактные данные компании"""
        contact = self.get_by_company(db, company_id=company_id)
        if not contact:
            return None

        return self.update(db, db_obj=contact, obj_in=obj_in)

    def get_companies_by_email(
        self, db: Session, *, email: str
    ) -> List[CompanyContact]:
        """Найти компании по email"""
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.primary_email == email,
                    self.model.secondary_email == email,
                    self.model.support_email == email,
                    self.model.billing_email == email,
                )
            )
            .all()
        )

    def get_companies_by_phone(
        self, db: Session, *, phone: str
    ) -> List[CompanyContact]:
        """Найти компании по телефону"""
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.primary_phone == phone,
                    self.model.secondary_phone == phone,
                    self.model.mobile_phone == phone,
                    self.model.fax == phone,
                )
            )
            .all()
        )

    def get_companies_by_country(
        self, db: Session, *, country: str, skip: int = 0, limit: int = 100
    ) -> List[CompanyContact]:
        """Найти компании по стране"""
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.country.ilike(f"%{country}%"),
                    self.model.country_code.ilike(f"%{country}%"),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_by_city(
        self, db: Session, *, city: str, skip: int = 0, limit: int = 100
    ) -> List[CompanyContact]:
        """Найти компании по городу"""
        return (
            db.query(self.model)
            .filter(self.model.city.ilike(f"%{city}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_contacts(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[CompanyContact]:
        """Поиск контактных данных компаний"""
        search_query = db.query(self.model).filter(
            or_(
                self.model.primary_email.ilike(f"%{query}%"),
                self.model.website.ilike(f"%{query}%"),
                self.model.city.ilike(f"%{query}%"),
                self.model.country.ilike(f"%{query}%"),
                self.model.primary_phone.ilike(f"%{query}%"),
            )
        )

        return search_query.offset(skip).limit(limit).all()

    def get_by_timezone(
        self, db: Session, *, timezone: str, skip: int = 0, limit: int = 100
    ) -> List[CompanyContact]:
        """Найти компании по временной зоне"""
        return (
            db.query(self.model)
            .filter(self.model.timezone == timezone)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_incomplete_contacts(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanyContact]:
        """Найти компании с неполными контактными данными"""
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.primary_email.is_(None),
                    self.model.primary_phone.is_(None),
                    self.model.country.is_(None),
                    self.model.city.is_(None),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_contact_stats(self, db: Session) -> Dict[str, Any]:
        """Получить статистику контактных данных"""
        total_contacts = db.query(func.count(self.model.id)).scalar()

        contacts_with_email = (
            db.query(func.count(self.model.id))
            .filter(self.model.primary_email.isnot(None))
            .scalar()
        )

        contacts_with_phone = (
            db.query(func.count(self.model.id))
            .filter(self.model.primary_phone.isnot(None))
            .scalar()
        )

        contacts_with_website = (
            db.query(func.count(self.model.id))
            .filter(self.model.website.isnot(None))
            .scalar()
        )

        unique_countries = db.query(
            func.count(func.distinct(self.model.country))
        ).scalar()
        unique_timezones = db.query(
            func.count(func.distinct(self.model.timezone))
        ).scalar()

        return {
            "total_contacts": total_contacts,
            "contacts_with_email": contacts_with_email,
            "contacts_with_phone": contacts_with_phone,
            "contacts_with_website": contacts_with_website,
            "unique_countries": unique_countries,
            "unique_timezones": unique_timezones,
            "completion_rate": (
                round((contacts_with_email / total_contacts * 100), 2)
                if total_contacts > 0
                else 0
            ),
        }


# Создаем экземпляр CRUD
company_contact = CRUDCompanyContact(CompanyContact)
