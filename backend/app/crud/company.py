"""
CRUD операции для модели Company.
Обновлено для работы с 4NF архитектурой.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, func, desc

from app.crud.base import CRUDBase
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.models.user import User
from app.models.project import Project
from app.models.department import Department
from app.models.company_contact import CompanyContact
from app.models.company_subscription import CompanySubscription
from app.models.company_settings import CompanySettings
from app.models.company_branding import CompanyBranding


class CRUDCompany(CRUDBase[Company, CompanyCreate, CompanyUpdate]):
    """CRUD операции для компании"""

    def get_by_name(self, db: Session, *, name: str) -> Optional[Company]:
        """Получить компанию по названию"""
        return db.query(self.model).filter(self.model.name == name).first()

    def get_by_slug(self, db: Session, *, slug: str) -> Optional[Company]:
        """Получить компанию по slug"""
        return db.query(self.model).filter(self.model.slug == slug).first()

    def get_with_relationships(
        self, db: Session, *, company_id: int
    ) -> Optional[Company]:
        """Получить компанию со всеми связанными данными"""
        return (
            db.query(self.model)
            .options(
                selectinload(self.model.contact),
                selectinload(self.model.subscription),
                selectinload(self.model.settings),
                selectinload(self.model.branding),
                selectinload(self.model.departments),
            )
            .filter(self.model.id == company_id)
            .first()
        )

    def create_with_defaults(self, db: Session, *, obj_in: CompanyCreate) -> Company:
        """Создать компанию с базовыми настройками по умолчанию"""
        # Создать основную запись компании
        company_data = obj_in.dict()

        # Автогенерация slug если не указан
        if not company_data.get("slug"):
            company_data["slug"] = self._generate_slug(db, company_data["name"])

        db_obj = self.model(**company_data)
        db.add(db_obj)
        db.flush()  # Получить ID без коммита

        # Создать связанные записи по умолчанию

        # Создать пустой контакт
        contact = CompanyContact(company_id=db_obj.id)
        db.add(contact)

        # Создать базовую подписку (trial)
        subscription = CompanySubscription(
            company_id=db_obj.id,
            plan="trial",
            status="trial",
            max_users=5,
            max_projects=3,
            max_departments=2,
        )
        db.add(subscription)

        # Создать базовые настройки
        settings = CompanySettings(company_id=db_obj.id)
        db.add(settings)

        # Создать базовый брендинг
        branding = CompanyBranding(company_id=db_obj.id)
        db.add(branding)

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_active(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Company]:
        """Получить список активных компаний"""
        return (
            db.query(self.model)
            .filter(and_(self.model.is_active == True, self.model.status == "active"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_companies(
        self,
        db: Session,
        *,
        query: str,
        company_type: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Company]:
        """Поиск компаний с фильтрами"""
        search_filter = or_(
            self.model.name.ilike(f"%{query}%"),
            self.model.legal_name.ilike(f"%{query}%"),
            self.model.description.ilike(f"%{query}%"),
            self.model.industry.ilike(f"%{query}%"),
        )

        filters = [search_filter]

        if company_type:
            filters.append(self.model.type == company_type)

        if status:
            filters.append(self.model.status == status)

        return (
            db.query(self.model).filter(and_(*filters)).offset(skip).limit(limit).all()
        )

    def get_companies_by_type(
        self, db: Session, *, company_type: str, skip: int = 0, limit: int = 100
    ) -> List[Company]:
        """Получить компании по типу"""
        return (
            db.query(self.model)
            .filter(self.model.type == company_type)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_by_status(
        self, db: Session, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Company]:
        """Получить компании по статусу"""
        return (
            db.query(self.model)
            .filter(self.model.status == status)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def activate(self, db: Session, *, company_id: int) -> Optional[Company]:
        """Активировать компанию"""
        company = self.get(db, id=company_id)
        if company:
            company.is_active = True
            company.status = "active"
            db.commit()
            db.refresh(company)
        return company

    def deactivate(self, db: Session, *, company_id: int) -> Optional[Company]:
        """Деактивировать компанию"""
        company = self.get(db, id=company_id)
        if company:
            company.is_active = False
            company.status = "inactive"
            db.commit()
            db.refresh(company)
        return company

    def suspend(
        self, db: Session, *, company_id: int, reason: str = None
    ) -> Optional[Company]:
        """Приостановить компанию"""
        company = self.get(db, id=company_id)
        if company:
            company.status = "suspended"
            # Можно добавить поле reason в модель если нужно
            db.commit()
            db.refresh(company)
        return company

    def get_company_stats(self, db: Session, *, company_id: int) -> Dict[str, Any]:
        """Получить статистику компании через новую архитектуру"""
        company = self.get(db, id=company_id)
        if not company:
            return {}

        # Используем property из модели Company для подсчета пользователей
        current_user_count = company.current_user_count

        # Подсчет проектов через новую связь с Company
        projects_count = (
            db.query(func.count(Project.id))
            .filter(Project.company_id == company_id)
            .scalar()
        ) or 0

        active_projects_count = (
            db.query(func.count(Project.id))
            .filter(and_(Project.company_id == company_id, Project.is_active == True))
            .scalar()
        ) or 0

        # Подсчет отделов
        departments_count = (
            db.query(func.count(Department.id))
            .filter(Department.company_id == company_id)
            .scalar()
        ) or 0

        # Получить информацию о подписке
        subscription = (
            db.query(CompanySubscription)
            .filter(CompanySubscription.company_id == company_id)
            .first()
        )

        subscription_info = {}
        if subscription:
            subscription_info = {
                "plan": subscription.plan,
                "status": subscription.status,
                "max_users": subscription.max_users,
                "max_projects": subscription.max_projects,
                "max_departments": subscription.max_departments,
                "trial_ends_at": subscription.trial_ends_at,
                "subscription_ends_at": subscription.subscription_ends_at,
            }

        return {
            "total_users": current_user_count,
            "total_projects": projects_count,
            "active_projects": active_projects_count,
            "total_departments": departments_count,
            "subscription": subscription_info,
            "last_activity_date": company.updated_at,
        }

    def get_all_with_stats(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Получить все компании с базовой статистикой"""
        companies = db.query(self.model).offset(skip).limit(limit).all()

        result = []
        for company in companies:
            company_data = {
                "id": company.id,
                "name": company.name,
                "slug": company.slug,
                "type": company.type,
                "status": company.status,
                "is_active": company.is_active,
                "created_at": company.created_at,
                "current_user_count": company.current_user_count,
                "current_project_count": (
                    db.query(func.count(Project.id))
                    .filter(Project.company_id == company.id)
                    .scalar()
                )
                or 0,
            }
            result.append(company_data)

        return result

    def get_companies_statistics(self, db: Session) -> Dict[str, Any]:
        """Получить общую статистику компаний"""
        total_companies = db.query(func.count(self.model.id)).scalar()

        active_companies = (
            db.query(func.count(self.model.id))
            .filter(self.model.is_active == True)
            .scalar()
        )

        # Статистика по типам
        type_stats = (
            db.query(self.model.type, func.count(self.model.id).label("count"))
            .group_by(self.model.type)
            .all()
        )

        # Статистика по статусам
        status_stats = (
            db.query(self.model.status, func.count(self.model.id).label("count"))
            .group_by(self.model.status)
            .all()
        )

        # Топ индустрий
        industry_stats = (
            db.query(self.model.industry, func.count(self.model.id).label("count"))
            .filter(self.model.industry.isnot(None))
            .group_by(self.model.industry)
            .order_by(desc("count"))
            .limit(10)
            .all()
        )

        return {
            "total_companies": total_companies,
            "active_companies": active_companies,
            "activation_rate": (
                round((active_companies / total_companies * 100), 2)
                if total_companies > 0
                else 0
            ),
            "type_distribution": {type_name: count for type_name, count in type_stats},
            "status_distribution": {status: count for status, count in status_stats},
            "top_industries": [industry for industry, count in industry_stats],
        }

    def _generate_slug(self, db: Session, name: str) -> str:
        """Сгенерировать уникальный slug из названия"""
        import re
        import random
        import string

        # Базовый slug
        base_slug = re.sub(r"[^a-zA-Z0-9\s-]", "", name.lower())
        base_slug = re.sub(r"[\s-]+", "-", base_slug).strip("-")

        # Проверить уникальность
        original_slug = base_slug
        counter = 1

        while self.get_by_slug(db, slug=base_slug):
            if counter == 1:
                # Добавить случайные символы
                random_suffix = "".join(
                    random.choices(string.ascii_lowercase + string.digits, k=4)
                )
                base_slug = f"{original_slug}-{random_suffix}"
            else:
                base_slug = f"{original_slug}-{counter}"
            counter += 1

        return base_slug

    def update_company_status(
        self, db: Session, *, company_id: int, status: str
    ) -> Optional[Company]:
        """Обновить статус компании"""
        company = self.get(db, id=company_id)
        if company:
            company.status = status
            # Автоматически активировать/деактивировать на основе статуса
            if status in ["active", "trial"]:
                company.is_active = True
            elif status in ["suspended", "inactive", "archived"]:
                company.is_active = False

            db.commit()
            db.refresh(company)
        return company

    def is_slug_available(
        self, db: Session, *, slug: str, exclude_id: Optional[int] = None
    ) -> bool:
        """Проверить доступность slug"""
        query = db.query(self.model).filter(self.model.slug == slug)
        if exclude_id:
            query = query.filter(self.model.id != exclude_id)
        return query.first() is None

    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> tuple[List[Company], int]:
        """
        Получить список компаний с фильтрацией и подсчетом общего количества.
        
        Args:
            db: Сессия базы данных
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            search: Поисковый запрос
            status: Фильтр по статусу
            
        Returns:
            Кортеж (список компаний, общее количество)
        """
        query = db.query(self.model)
        
        # Применение фильтров
        filters = []
        
        if search:
            search_filter = or_(
                self.model.name.ilike(f"%{search}%"),
                self.model.legal_name.ilike(f"%{search}%"),
                self.model.description.ilike(f"%{search}%"),
                self.model.industry.ilike(f"%{search}%"),
            )
            filters.append(search_filter)
        
        if status:
            filters.append(self.model.status == status)
        
        if filters:
            query = query.filter(and_(*filters))
        
        # Подсчет общего количества
        total = query.count()
        
        # Получение данных с пагинацией
        companies = query.offset(skip).limit(limit).all()
        
        return companies, total

    def get_company_statistics(
        self,
        db: Session,
        *,
        company_id: int,
    ) -> Dict[str, Any]:
        """
        Получить статистику компании.
        
        Args:
            db: Сессия базы данных
            company_id: ID компании
            
        Returns:
            Словарь со статистикой компании
        """
        from app.models.user import User
        from app.models.project import Project
        from app.models.department import Department
        
        # Базовая информация о компании
        company = db.query(self.model).filter(self.model.id == company_id).first()
        if not company:
            return {}
        
        # Подсчет пользователей
        users_count = db.query(func.count(User.id)).filter(User.company_id == company_id).scalar() or 0
        
        # Подсчет проектов
        projects_count = db.query(func.count(Project.id)).filter(Project.company_id == company_id).scalar() or 0
        
        # Подсчет департаментов
        departments_count = db.query(func.count(Department.id)).filter(Department.company_id == company_id).scalar() or 0
        
        # Активные проекты
        from app.models.project import ProjectStatus
        active_projects_count = (
            db.query(func.count(Project.id))
            .filter(
                Project.company_id == company_id,
                Project.status == ProjectStatus.ACTIVE
            )
            .scalar() or 0
        )
        
        # Статистика пользователей по ролям
        from app.models.user import UserStatus
        active_users_count = (
            db.query(func.count(User.id))
            .filter(
                User.company_id == company_id,
                User.status == UserStatus.ACTIVE
            )
            .scalar() or 0
        )
        
        return {
            "company_id": company_id,
            "company_name": company.name,
            "company_status": company.status.value if company.status else None,
            "users": {
                "total": users_count,
                "active": active_users_count,
            },
            "projects": {
                "total": projects_count,
                "active": active_projects_count,
            },
            "departments": {
                "total": departments_count,
            },
            "created_at": company.created_at.isoformat() if company.created_at else None,
            "updated_at": company.updated_at.isoformat() if company.updated_at else None,
        }


# Создаем экземпляр CRUD
company = CRUDCompany(Company)
