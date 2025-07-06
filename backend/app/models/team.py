from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Text, Index, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin
from .constants import TeamStatus

if TYPE_CHECKING:
    from .user import User
    from .project import Project
    from .team_member import TeamMember
    from .dashboard import DashboardNotification, DashboardActivity


class Team(Base, TimestampedMixin):
    """
    Модель команды.

    Представляет команду разработчиков, аналитиков и других участников проекта.
    Команда может быть привязана к одному или нескольким проектам.
    """

    __tablename__ = "teams"
    __table_args__ = (
        Index("ix_teams_name", "name"),
        Index("ix_teams_code_unique", "code", unique=True),
        Index("ix_teams_owner_status", "owner_id", "status"),
        Index("ix_teams_status_created", "status", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Название команды"
    )
    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="Уникальный код команды"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание команды"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default=TeamStatus.ACTIVE,
        nullable=False,
        comment="Статус команды",
    )
    is_public: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Публичная ли команда"
    )
    max_members: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальное количество участников"
    )
    
    # Владелец команды
    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Владелец команды",
    )

    # Отношения
    owner: Mapped["User"] = relationship(
        "User", back_populates="owned_teams", lazy="select"
    )

    members: Mapped[List["TeamMember"]] = relationship(
        "TeamMember",
        back_populates="team",
        cascade="all, delete-orphan",
        lazy="select",
    )

    projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="team",
        lazy="select",
    )

    # Dashboard relationships
    notifications: Mapped[List["DashboardNotification"]] = relationship(
        "DashboardNotification",
        back_populates="team",
        lazy="select",
        cascade="all, delete-orphan",
    )

    activities: Mapped[List["DashboardActivity"]] = relationship(
        "DashboardActivity",
        back_populates="team",
        lazy="select",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Team(id={self.id}, name='{self.name}', code='{self.code}')>"

    @property
    def member_count(self) -> int:
        """Количество участников команды."""
        return len(self.members) if self.members else 0

    @property
    def is_full(self) -> bool:
        """Проверка, заполнена ли команда до максимума."""
        if not self.max_members:
            return False
        return self.member_count >= self.max_members

    def can_add_member(self) -> bool:
        """Проверка, можно ли добавить участника."""
        return self.status == TeamStatus.ACTIVE and not self.is_full

    def get_member_by_user_id(self, user_id: int) -> Optional["TeamMember"]:
        """Получить участника команды по ID пользователя."""
        if not self.members:
            return None
        return next((member for member in self.members if member.user_id == user_id), None)

    def has_member(self, user_id: int) -> bool:
        """Проверить, является ли пользователь участником команды."""
        return self.get_member_by_user_id(user_id) is not None 