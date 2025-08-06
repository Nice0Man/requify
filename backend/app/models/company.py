from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional
from enum import Enum as PyEnum

from sqlalchemy import String, Boolean, Integer, Index, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project
    from .department import Department


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
    Основная модель компании.
    
    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "companies"
    __table_args__ = (
        Index("ix_companies_slug", "slug", unique=True),
        Index("ix_companies_status", "status"),
        Index("ix_companies_is_active", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Название компании"
    )
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, comment="URL-friendly идентификатор"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1000), nullable=True, comment="Описание компании"
    )
    
    # Статус и тип
    status: Mapped[str] = mapped_column(
        Enum(CompanyStatus),
        default=CompanyStatus.ACTIVE,
        nullable=False,
        comment="Статус компании",
    )
    company_type: Mapped[str] = mapped_column(
        Enum(CompanyType),
        default=CompanyType.SMALL_BUSINESS,
        nullable=False,
        comment="Тип компании",
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активна ли компания"
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    users: Mapped[List["User"]] = relationship(
        "User", back_populates="company", lazy="select"
    )

    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="company", lazy="select"
    )

    departments: Mapped[List["Department"]] = relationship(
        "Department", back_populates="company", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Company(id={self.id}, name='{self.name}', slug='{self.slug}')>"