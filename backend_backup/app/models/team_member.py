from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolea, ForeignKeyn, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin
from .constants import TeamRole

if TYPE_CHECKING:
    from .team import Team
    from .user import User


class TeamMember(Base, TimestampedMixin):
    """
    Модель участника команды.

    Представляет связь между пользователем и командой с определенной ролью.
    Включает информацию о роли, статусе и времени присоединения.
    """

    __tablename__ = "team_members"
    __table_args__ = (
        Index("ix_team_members_team_user", "team_id", "user_id", unique=True),
        Index("ix_team_members_user_role", "user_id", "role"),
        Index("ix_team_members_team_role", "team_id", "role"),
        Index("ix_team_members_is_active", "is_active"),
        Index("ix_team_members_joined_at", "joined_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Внешние ключи
    team_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID команды",
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID пользователя",
    )

    # Роль в команде
    role: Mapped[str] = mapped_column(
        String(20),
        default=TeamRole.DEVELOPER,
        nullable=False,
        comment="Роль участника в команде",
    )

    # Статус участия
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли участник"
    )

    # Временные метки
    joined_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=False,
        comment="Время присоединения к команде",
    )
    left_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время выхода из команды"
    )

    # Дополнительная информация
    title: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Должность участника в команде"
    )
    hourly_rate: Mapped[Optional[float]] = mapped_column(
        nullable=True, comment="Почасовая ставка участника"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="Заметки о участнике"
    )

    # Отношения
    team: Mapped["Team"] = relationship("Team", back_populates="members", lazy="select")
    user: Mapped["User"] = relationship(
        "User", back_populates="team_memberships", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<TeamMember(id={self.id}, team_id={self.team_id}, user_id={self.user_id}, role='{self.role}')>"

    @property
    def is_owner(self) -> bool:
        """Проверка, является ли участник владельцем команды."""
        return self.role == TeamRole.OWNER

    @property
    def is_admin(self) -> bool:
        """Проверка, является ли участник администратором команды."""
        return self.role in [TeamRole.OWNER, TeamRole.ADMIN]

    @property
    def can_manage_members(self) -> bool:
        """Проверка, может ли участник управлять другими участниками."""
        return self.role in [TeamRole.OWNER, TeamRole.ADMIN, TeamRole.LEAD]

    @property
    def can_manage_settings(self) -> bool:
        """Проверка, может ли участник управлять настройками команды."""
        return self.role in [TeamRole.OWNER, TeamRole.ADMIN]

    @property
    def display_name(self) -> str:
        """Отображаемое имя участника."""
        if self.user:
            return self.user.name or self.user.username
        return f"User {self.user_id}"

    def has_permission(self, permission: str) -> bool:
        """Проверка разрешения участника."""
        role_permissions = {
            TeamRole.OWNER: [
                "read",
                "write",
                "delete",
                "manage_members",
                "manage_settings",
                "full_access",
            ],
            TeamRole.ADMIN: [
                "read",
                "write",
                "delete",
                "manage_members",
                "manage_settings",
            ],
            TeamRole.LEAD: ["read", "write", "delete", "manage_members"],
            TeamRole.DEVELOPER: ["read", "write"],
            TeamRole.ANALYST: ["read", "write"],
            TeamRole.TESTER: ["read", "write"],
            TeamRole.VIEWER: ["read"],
        }

        return permission in role_permissions.get(self.role, [])

    def deactivate(self) -> None:
        """Деактивировать участника команды."""
        self.is_active = False
        self.left_at = datetime.now(UTC).replace(tzinfo=None)

    def activate(self) -> None:
        """Активировать участника команды."""
        self.is_active = True
        self.left_at = None
