from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Boolean, Integer, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .department import Department
    from .project import Project


class Team(Base, TimestampedMixin):
    """
    Модель команды.
    
    Упрощенная структура с основными полями согласно лучшим практикам SQLAlchemy.
    """

    __tablename__ = "teams"
    __table_args__ = (
        Index("ix_teams_name", "name"),
        Index("ix_teams_department_id", "department_id"),
        Index("ix_teams_owner_id", "owner_id"),
        Index("ix_teams_is_active", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Название команды"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="Описание команды"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активна ли команда"
    )

    # Связи
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID департамента",
    )
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Владелец команды",
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    department: Mapped["Department"] = relationship(
        "Department", back_populates="teams", lazy="select"
    )

    owner: Mapped["User"] = relationship(
        "User", back_populates="owned_teams", lazy="select"
    )

    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="team", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Team(id={self.id}, name='{self.name}', department_id={self.department_id})>"