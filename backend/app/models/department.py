from typing import TYPE_CHECKING, List, Optional
from enum import Enum as PyEnum

from sqlalchemy import String, Boolean, Integer, Index, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company
    from .team import Team
    from .project import Project

class DepartmentType(PyEnum):
    """Типы департаментов"""

    ENGINEERING = "engineering"
    PRODUCT = "product"
    DESIGN = "design"
    QA = "qa"
    DEVOPS = "devops"
    MARKETING = "marketing"
    SALES = "sales"
    SUPPORT = "support"
    HR = "hr"
    FINANCE = "finance"
    OPERATIONS = "operations"
    ADMINISTRATION = "administration"
    CUSTOM = "custom"

class Department(Base, TimestampedMixin):
    """
    Модель департамента компании.

    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "departments"
    __table_args__ = (
        Index("ix_departments_company_id", "company_id"),
        Index("ix_departments_name", "name"),
        Index("ix_departments_type", "type"),
        Index("ix_departments_is_active", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Название департамента"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="Описание департамента"
    )
    type: Mapped[str] = mapped_column(
        Enum(DepartmentType),
        default=DepartmentType.CUSTOM,
        nullable=False,
        comment="Тип департамента",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли департамент"
    )

    # Связи
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании",
    )

    #     # Отношения
    # 
    company: Mapped["Company"] = relationship(
        "Company", back_populates="departments", lazy="select"
    )

    teams: Mapped[List["Team"]] = relationship(
        "Team", back_populates="department", lazy="select"
    )

    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="department", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Department(id={self.id}, name='{self.name}', company_id={self.company_id})>"
