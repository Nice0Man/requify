"""
Расширенная система ролей для обработки всех бизнес-потребностей.
Поддерживает роли на уровне: System, Company, Department, Team, Project.
"""

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Optional
from app.core.constants import (
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
)

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Integer,
    Index,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .company import Company
    from .department import Department
    from .team import Team
    from .project import Project


class EnhancedRole(Base, TimestampedMixin):
    """
    Расширенная модель роли для всех бизнес-потребностей.

    Поддерживает роли на разных уровнях:
    - System (глобальные системные роли)
    - Company (роли в рамках компании)
    - Department (роли в рамках департамента)
    - Team (роли в рамках команды)
    - Project (роли в рамках проекта)
    """

    __tablename__ = "enhanced_roles"
    __table_args__ = (
        Index("ix_enhanced_roles_name", "name"),
        Index("ix_enhanced_roles_scope", "scope"),
        Index("ix_enhanced_roles_is_system", "is_system"),
        Index("ix_enhanced_roles_is_active", "is_active"),
        Index("ix_enhanced_roles_role_level", "role_level"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # =============================================================================
    # Основная информация
    # =============================================================================

    name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Название роли"
    )
    display_name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Отображаемое название роли"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание роли и обязанностей"
    )

    # =============================================================================
    # Классификация роли
    # =============================================================================

    scope: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="Область действия роли"
    )
    role_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Уровень роли (0=базовый, 10=высший)",
    )

    # Конкретные типы ролей
    system_role: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Системная роль"
    )
    company_role: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Роль в компании"
    )
    department_role: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Роль в департаменте"
    )
    team_role: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Роль в команде"
    )
    project_role: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Роль в проекте"
    )

    # =============================================================================
    # Статус и настройки
    # =============================================================================

    is_system: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Системная ли роль"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активна ли роль"
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Роль по умолчанию"
    )
    is_assignable: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Можно ли назначать роль"
    )
    requires_approval: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Требует одобрения для назначения",
    )

    # =============================================================================
    # Приоритет и иерархия
    # =============================================================================

    priority: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, comment="Приоритет роли (выше = важнее)"
    )
    max_assignees: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальное количество носителей роли"
    )

    # =============================================================================
    # Расширенные настройки
    # =============================================================================

    permissions_config: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Конфигурация разрешений (JSON)"
    )
    restrictions: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Ограничения роли (JSON)"
    )
    role_metadata: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Дополнительные метаданные роли"
    )

    def __repr__(self) -> str:
        return f"<EnhancedRole(id={self.id}, name='{self.name}', scope='{self.scope}', level={self.role_level})>"


class UserRoleAssignment(Base, TimestampedMixin):
    """
    Назначение роли пользователю в определенном контексте.

    Поддерживает назначение на разных уровнях:
    - System level (company_id, department_id, team_id, project_id = NULL)
    - Company level (department_id, team_id, project_id = NULL)
    - Department level (team_id, project_id = NULL)
    - Team level (project_id = NULL)
    - Project level (все ID заполнены)
    """

    __tablename__ = "user_role_assignments"
    __table_args__ = (
        Index("ix_user_role_assignments_user_id", "user_id"),
        Index("ix_user_role_assignments_role_id", "role_id"),
        Index("ix_user_role_assignments_company_id", "company_id"),
        Index("ix_user_role_assignments_department_id", "department_id"),
        Index("ix_user_role_assignments_team_id", "team_id"),
        Index("ix_user_role_assignments_project_id", "project_id"),
        Index("ix_user_role_assignments_is_active", "is_active"),
        Index(
            "ix_user_role_assignments_context",
            "user_id",
            "company_id",
            "department_id",
            "team_id",
            "project_id",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # =============================================================================
    # Основные связи
    # =============================================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID пользователя",
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("enhanced_roles.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID роли",
    )

    # =============================================================================
    # Контекст назначения (определяет область действия)
    # =============================================================================

    company_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID компании (NULL для системных ролей)",
    )
    department_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID департамента (NULL для ролей выше департамента)",
    )
    team_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID команды (NULL для ролей выше команды)",
    )
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID проекта (NULL для ролей выше проекта)",
    )

    # =============================================================================
    # Метаданные назначения
    # =============================================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активно ли назначение"
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Основная ли роль в данном контексте",
    )

    # Временные рамки
    starts_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата начала действия роли"
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата окончания действия роли"
    )

    # Кто назначил/одобрил
    assigned_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True, comment="Кем назначена роль"
    )
    approved_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True, comment="Кем одобрена роль"
    )

    # Дополнительная информация
    assignment_reason: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Причина назначения роли"
    )
    conditions: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Условия и ограничения назначения"
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    user: Mapped["User"] = relationship(
        "User", foreign_keys=[user_id], back_populates="role_assignments"
    )
    role: Mapped[EnhancedRole] = relationship("EnhancedRole", foreign_keys=[role_id])
    company: Mapped[Optional["Company"]] = relationship(
        "Company", foreign_keys=[company_id]
    )
    department: Mapped[Optional["Department"]] = relationship(
        "Department", foreign_keys=[department_id]
    )
    team: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_id])
    project: Mapped[Optional["Project"]] = relationship(
        "Project", foreign_keys=[project_id]
    )

    assigned_by_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[assigned_by]
    )
    approved_by_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[approved_by]
    )

    def __repr__(self) -> str:
        context = self._get_context_string()
        return f"<UserRoleAssignment(user_id={self.user_id}, role='{self.role.name}', context='{context}')>"

    # =============================================================================
    # Business Logic Methods
    # =============================================================================

    @property
    def is_expired(self) -> bool:
        """Истекло ли назначение роли"""
        if not self.expires_at:
            return False
        return datetime.now(UTC).replace(tzinfo=None) > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Валидно ли назначение (активно, не истекло, в правильном времени)"""
        if not self.is_active or self.is_expired:
            return False

        if self.starts_at and datetime.now(UTC).replace(tzinfo=None) < self.starts_at:
            return False

        return True

    @property
    def scope_level(self) -> str:
        """Определить уровень области действия назначения"""
        if self.project_id:
            return RoleScope.PROJECT.value
        elif self.team_id:
            return RoleScope.TEAM.value
        elif self.department_id:
            return RoleScope.DEPARTMENT.value
        elif self.company_id:
            return RoleScope.COMPANY.value
        else:
            return RoleScope.SYSTEM.value

    def _get_context_string(self) -> str:
        """Получить строковое представление контекста"""
        if self.project_id:
            return f"project:{self.project_id}"
        elif self.team_id:
            return f"team:{self.team_id}"
        elif self.department_id:
            return f"department:{self.department_id}"
        elif self.company_id:
            return f"company:{self.company_id}"
        else:
            return "system"

    def extend_expiration(self, days: int) -> None:
        """Продлить назначение роли на указанное количество дней"""
        if self.expires_at:
            self.expires_at += timedelta(days=days)
        else:
            self.expires_at = datetime.now(UTC) + timedelta(days=days)

    def revoke(
        self, revoked_by: Optional[int] = None, reason: Optional[str] = None
    ) -> None:
        """Отозвать назначение роли"""
        self.is_active = False
        self.expires_at = datetime.now(UTC)
        if reason:
            self.assignment_reason = (
                f"{self.assignment_reason or ''}\nRevoked: {reason}"
            )

    def approve(self, approved_by: int) -> None:
        """Одобрить назначение роли"""
        self.approved_by = approved_by
        self.is_active = True
