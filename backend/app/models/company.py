"""
Основная модель компании (декомпозирована согласно 4NF).
Содержит только атомарные данные без многозначных зависимостей.
"""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional
from enum import Enum as PyEnum

from sqlalchemy import String, Boolean, DateTime, Integer, Index, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project
    from .department import Department
    from .company_contact import CompanyContact
    from .company_subscription import CompanySubscription
    from .company_settings import CompanySettings
    from .company_branding import CompanyBranding


class CompanyStatus(PyEnum):
    """Статусы компании"""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
    TRIAL = "trial"
    ARCHIVED = "archived"


class CompanyType(PyEnum):
    """Типы компаний"""

    STARTUP = "startup"
    SMALL_BUSINESS = "small_business"
    MEDIUM_BUSINESS = "medium_business"
    ENTERPRISE = "enterprise"
    NON_PROFIT = "non_profit"
    GOVERNMENT = "government"
    EDUCATIONAL = "educational"


class Company(Base, TimestampedMixin):
    """
    Основная модель компании (4NF - Fourth Normal Form).

    Содержит только атомарные, неделимые данные:
    - Базовая идентификация
    - Классификация
    - Статус

    Многозначные зависимости вынесены в отдельные модели:
    - CompanyContact (контактная информация)
    - CompanySubscription (подписка и биллинг)
    - CompanySettings (настройки и конфигурация)
    - CompanyBranding (брендинг и визуальная идентичность)
    - Department (структурные подразделения)
    """

    __tablename__ = "companies"
    __table_args__ = (
        Index("ix_companies_slug", "slug", unique=True),
        Index("ix_companies_status", "status"),
        Index("ix_companies_type", "type"),
        Index("ix_companies_is_active", "is_active"),
        Index("ix_companies_legal_name", "legal_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # =============================================================================
    # Основная идентификация (атомарные данные)
    # =============================================================================

    name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Название компании"
    )
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, comment="URL-friendly идентификатор"
    )
    legal_name: Mapped[Optional[str]] = mapped_column(
        String(300), nullable=True, comment="Юридическое название"
    )

    # Базовое описание
    description: Mapped[Optional[str]] = mapped_column(
        String(1000), nullable=True, comment="Краткое описание компании"
    )

    # =============================================================================
    # Классификация (атомарные данные)
    # =============================================================================

    type: Mapped[CompanyType] = mapped_column(
        Enum(CompanyType),
        nullable=False,
        default=CompanyType.SMALL_BUSINESS,
        comment="Тип компании",
    )
    industry: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Отрасль"
    )
    size_category: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Категория размера (micro, small, medium, large)",
    )
    employee_count: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Количество сотрудников"
    )

    # =============================================================================
    # Статус (атомарные данные)
    # =============================================================================

    status: Mapped[CompanyStatus] = mapped_column(
        Enum(CompanyStatus),
        nullable=False,
        default=CompanyStatus.TRIAL,
        comment="Статус компании",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активна ли компания"
    )

    # =============================================================================
    # Отношения (1-к-1 и 1-ко-многим)
    # =============================================================================

    # NOTE: Пользователи доступны через иерархию Department -> Team -> TeamMember -> User
    # Прямое отношение users удалено для избежания избыточных связей

    # Проекты компании
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="company", lazy="select"
    )

    # Департаменты компании (NEW - структурная организация)
    departments: Mapped[List["Department"]] = relationship(
        "Department",
        back_populates="company",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # =============================================================================
    # Декомпозированные данные (1-к-1 отношения)
    # =============================================================================

    # Контактная информация
    contact: Mapped[Optional["CompanyContact"]] = relationship(
        "CompanyContact",
        back_populates="company",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Подписка и биллинг
    subscription: Mapped[Optional["CompanySubscription"]] = relationship(
        "CompanySubscription",
        back_populates="company",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Настройки компании
    settings: Mapped[Optional["CompanySettings"]] = relationship(
        "CompanySettings",
        back_populates="company",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Брендинг
    branding: Mapped[Optional["CompanyBranding"]] = relationship(
        "CompanyBranding",
        back_populates="company",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Company(id={self.id}, name='{self.name}', slug='{self.slug}')>"

    # =============================================================================
    # Business Logic Methods - Core
    # =============================================================================

    @property
    def is_trial(self) -> bool:
        """Находится ли компания в пробном периоде"""
        return self.status == CompanyStatus.TRIAL

    @property
    def is_subscription_active(self) -> bool:
        """Активна ли подписка (через декомпозированную модель)"""
        return self.subscription and self.subscription.status == "active"

    @property
    def days_until_trial_end(self) -> Optional[int]:
        """Количество дней до окончания пробного периода"""
        if not self.subscription or not self.subscription.trial_ends_at:
            return None

        delta = self.subscription.trial_ends_at - datetime.now(UTC)
        return max(0, delta.days)

    @property
    def is_trial_expired(self) -> bool:
        """Истек ли пробный период"""
        if not self.subscription or not self.subscription.trial_ends_at:
            return False
        return datetime.now(UTC) > self.subscription.trial_ends_at

    @property
    def current_user_count(self) -> int:
        """Текущее количество пользователей через иерархию департаментов"""
        total_users = set()  # Используем set для избежания дубликатов

        for department in self.departments:
            for team in department.teams:
                for member in team.members:
                    total_users.add(member.user_id)

        return len(total_users)

    @property
    def current_project_count(self) -> int:
        """Текущее количество проектов"""
        return len(self.projects) if self.projects else 0

    @property
    def current_department_count(self) -> int:
        """Текущее количество департаментов"""
        return len(self.departments) if self.departments else 0

    def can_add_user(self) -> bool:
        """Можно ли добавить пользователя"""
        if not self.subscription or not self.subscription.max_users:
            return True
        return self.current_user_count < self.subscription.max_users

    def can_add_project(self) -> bool:
        """Можно ли добавить проект"""
        if not self.subscription or not self.subscription.max_projects:
            return True
        return self.current_project_count < self.subscription.max_projects

    def can_add_department(self) -> bool:
        """Можно ли добавить департамент"""
        if not self.subscription or not self.subscription.max_departments:
            return True
        return self.current_department_count < self.subscription.max_departments

    def is_domain_allowed(self, email: str) -> bool:
        """Разрешен ли домен email для этой компании"""
        if (
            not self.settings
            or not self.settings.domain
            or not self.settings.allow_domain_signup
        ):
            return False

        email_domain = email.split("@")[-1].lower()
        return email_domain == self.settings.domain.lower()

    def get_company_scope_filter(self) -> dict:
        """Получить фильтр для партиционирования по компании"""
        return {"company_id": self.id}

    def activate(self) -> None:
        """Активировать компанию"""
        self.status = CompanyStatus.ACTIVE
        self.is_active = True

    def suspend(self, reason: str = None) -> None:
        """Заблокировать компанию"""
        self.status = CompanyStatus.SUSPENDED
        self.is_active = False

    def deactivate(self) -> None:
        """Деактивировать компанию"""
        self.status = CompanyStatus.INACTIVE
        self.is_active = False

    # =============================================================================
    # Helper Methods for Decomposed Data
    # =============================================================================

    def ensure_contact(self) -> "CompanyContact":
        """Создать контактную информацию если отсутствует"""
        if not self.contact:
            from .company_contact import CompanyContact

            self.contact = CompanyContact(company_id=self.id)
        return self.contact

    def ensure_subscription(self) -> "CompanySubscription":
        """Создать подписку если отсутствует"""
        if not self.subscription:
            from .company_subscription import CompanySubscription

            self.subscription = CompanySubscription(company_id=self.id)
        return self.subscription

    def ensure_settings(self) -> "CompanySettings":
        """Создать настройки если отсутствуют"""
        if not self.settings:
            from .company_settings import CompanySettings

            self.settings = CompanySettings(company_id=self.id)
        return self.settings

    def ensure_branding(self) -> "CompanyBranding":
        """Создать брендинг если отсутствует"""
        if not self.branding:
            from .company_branding import CompanyBranding

            self.branding = CompanyBranding(company_id=self.id)
        return self.branding
