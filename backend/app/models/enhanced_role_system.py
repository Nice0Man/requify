"""
Расширенная система ролей для обработки всех бизнес-потребностей.
Поддерживает роли на уровне: System, Company, Department, Team, Project.
"""

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, List, Optional, Set, Dict, Any
from enum import Enum as PyEnum

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Integer,
    Index,
    Enum,
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


class RoleScope(PyEnum):
    """Области действия ролей"""

    SYSTEM = "system"  # Системный уровень (все компании)
    COMPANY = "company"  # Компания
    DEPARTMENT = "department"  # Департамент
    TEAM = "team"  # Команда
    PROJECT = "project"  # Проект
    RESOURCE = "resource"  # Ресурс (требование, релиз, тест)


class SystemRole(PyEnum):
    """Системные роли (глобальные)"""

    SYSTEM_ADMIN = "system_admin"  # Полный доступ ко всей системе
    PLATFORM_ADMIN = "platform_admin"  # Управление платформой
    SUPPORT_ADMIN = "support_admin"  # Продвинутая поддержка
    SUPPORT_AGENT = "support_agent"  # Базовая поддержка
    BILLING_ADMIN = "billing_admin"  # Управление биллингом
    SECURITY_AUDITOR = "security_auditor"  # Аудит безопасности
    COMPLIANCE_OFFICER = "compliance_officer"  # Соответствие требованиям
    DEVELOPER = "developer"  # Техническая поддержка
    DATA_ANALYST = "data_analyst"  # Аналитик данных


class CompanyRole(PyEnum):
    """Роли на уровне компании"""

    COMPANY_ADMIN = "company_admin"  # Админ компании
    COMPANY_OWNER = "company_owner"  # Владелец компании
    BILLING_MANAGER = "billing_manager"  # Менеджер по биллингу
    HR_MANAGER = "hr_manager"  # HR менеджер
    COMPLIANCE_MANAGER = "compliance_manager"  # Менеджер по соответствию
    SECURITY_MANAGER = "security_manager"  # Менеджер безопасности
    COMPANY_VIEWER = "company_viewer"  # Просмотр данных компании


class DepartmentRole(PyEnum):
    """Роли на уровне департамента"""

    DEPARTMENT_HEAD = "department_head"  # Руководитель департамента
    DEPARTMENT_ADMIN = "department_admin"  # Админ департамента
    DEPUTY_HEAD = "deputy_head"  # Заместитель руководителя
    SENIOR_MANAGER = "senior_manager"  # Старший менеджер
    MANAGER = "manager"  # Менеджер
    COORDINATOR = "coordinator"  # Координатор
    DEPARTMENT_VIEWER = "department_viewer"  # Просмотр данных департамента


class TeamRole(PyEnum):
    """Роли на уровне команды"""

    TEAM_LEAD = "team_lead"  # Лидер команды
    TECH_LEAD = "tech_lead"  # Технический лидер
    SENIOR_MEMBER = "senior_member"  # Старший участник
    MEMBER = "member"  # Участник команды
    MENTOR = "mentor"  # Ментор
    SCRUM_MASTER = "scrum_master"  # Скрам-мастер
    PRODUCT_OWNER = "product_owner"  # Владелец продукта
    TEAM_VIEWER = "team_viewer"  # Просмотр данных команды


class ProjectRole(PyEnum):
    """Роли на уровне проекта"""

    PROJECT_MANAGER = "project_manager"  # Менеджер проекта
    PROJECT_OWNER = "project_owner"  # Владелец проекта
    ARCHITECT = "architect"  # Архитектор
    SENIOR_DEVELOPER = "senior_developer"  # Старший разработчик
    DEVELOPER = "developer"  # Разработчик
    FRONTEND_DEVELOPER = "frontend_developer"  # Frontend разработчик
    BACKEND_DEVELOPER = "backend_developer"  # Backend разработчик
    MOBILE_DEVELOPER = "mobile_developer"  # Mobile разработчик
    DEVOPS_ENGINEER = "devops_engineer"  # DevOps инженер
    QA_ENGINEER = "qa_engineer"  # QA инженер
    TEST_AUTOMATION_ENGINEER = "test_automation_engineer"  # Автотестировщик
    BUSINESS_ANALYST = "business_analyst"  # Бизнес-аналитик
    PRODUCT_ANALYST = "product_analyst"  # Продуктовый аналитик
    DATA_ANALYST = "data_analyst"  # Аналитик данных
    UX_DESIGNER = "ux_designer"  # UX дизайнер
    UI_DESIGNER = "ui_designer"  # UI дизайнер
    TECHNICAL_WRITER = "technical_writer"  # Технический писатель
    PROJECT_VIEWER = "project_viewer"  # Просмотр данных проекта
    STAKEHOLDER = "stakeholder"  # Заинтересованная сторона
    CLIENT = "client"  # Клиент


class Permission(PyEnum):
    """Детализированные разрешения в системе"""

    # =============================================================================
    # Системные разрешения
    # =============================================================================
    MANAGE_SYSTEM = "manage_system"
    MANAGE_ALL_COMPANIES = "manage_all_companies"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    MANAGE_SYSTEM_SETTINGS = "manage_system_settings"
    MANAGE_GLOBAL_BILLING = "manage_global_billing"
    AUDIT_SYSTEM = "audit_system"
    MANAGE_SECURITY_POLICIES = "manage_security_policies"

    # =============================================================================
    # Компанийные разрешения
    # =============================================================================
    MANAGE_COMPANY = "manage_company"
    VIEW_COMPANY_SETTINGS = "view_company_settings"
    MANAGE_COMPANY_SETTINGS = "manage_company_settings"
    MANAGE_COMPANY_USERS = "manage_company_users"
    VIEW_COMPANY_USERS = "view_company_users"
    INVITE_USERS = "invite_users"
    REMOVE_USERS = "remove_users"
    MANAGE_COMPANY_BILLING = "manage_company_billing"
    VIEW_COMPANY_BILLING = "view_company_billing"
    MANAGE_COMPANY_SUBSCRIPTION = "manage_company_subscription"
    VIEW_COMPANY_ANALYTICS = "view_company_analytics"
    EXPORT_COMPANY_DATA = "export_company_data"

    # =============================================================================
    # Департаментские разрешения
    # =============================================================================
    CREATE_DEPARTMENT = "create_department"
    MANAGE_DEPARTMENT = "manage_department"
    VIEW_DEPARTMENT = "view_department"
    DELETE_DEPARTMENT = "delete_department"
    MANAGE_DEPARTMENT_USERS = "manage_department_users"
    VIEW_DEPARTMENT_USERS = "view_department_users"
    MANAGE_DEPARTMENT_BUDGET = "manage_department_budget"
    VIEW_DEPARTMENT_ANALYTICS = "view_department_analytics"

    # =============================================================================
    # Командные разрешения
    # =============================================================================
    CREATE_TEAM = "create_team"
    MANAGE_TEAM = "manage_team"
    VIEW_TEAM = "view_team"
    DELETE_TEAM = "delete_team"
    MANAGE_TEAM_MEMBERS = "manage_team_members"
    VIEW_TEAM_MEMBERS = "view_team_members"
    ASSIGN_TEAM_ROLES = "assign_team_roles"
    VIEW_TEAM_PERFORMANCE = "view_team_performance"

    # =============================================================================
    # Проектные разрешения
    # =============================================================================
    CREATE_PROJECT = "create_project"
    MANAGE_PROJECT = "manage_project"
    VIEW_PROJECT = "view_project"
    DELETE_PROJECT = "delete_project"
    ARCHIVE_PROJECT = "archive_project"
    MANAGE_PROJECT_SETTINGS = "manage_project_settings"
    MANAGE_PROJECT_MEMBERS = "manage_project_members"
    VIEW_PROJECT_MEMBERS = "view_project_members"
    MANAGE_PROJECT_BUDGET = "manage_project_budget"
    VIEW_PROJECT_ANALYTICS = "view_project_analytics"

    # =============================================================================
    # Требования
    # =============================================================================
    CREATE_REQUIREMENT = "create_requirement"
    EDIT_REQUIREMENT = "edit_requirement"
    VIEW_REQUIREMENT = "view_requirement"
    DELETE_REQUIREMENT = "delete_requirement"
    APPROVE_REQUIREMENT = "approve_requirement"
    REJECT_REQUIREMENT = "reject_requirement"
    LINK_REQUIREMENTS = "link_requirements"
    MANAGE_REQUIREMENT_VERSIONS = "manage_requirement_versions"
    EXPORT_REQUIREMENTS = "export_requirements"
    IMPORT_REQUIREMENTS = "import_requirements"

    # =============================================================================
    # Релизы
    # =============================================================================
    CREATE_RELEASE = "create_release"
    MANAGE_RELEASE = "manage_release"
    VIEW_RELEASE = "view_release"
    DELETE_RELEASE = "delete_release"
    PUBLISH_RELEASE = "publish_release"
    DEPLOY_RELEASE = "deploy_release"
    ROLLBACK_RELEASE = "rollback_release"
    APPROVE_RELEASE = "approve_release"

    # =============================================================================
    # Тестирование
    # =============================================================================
    CREATE_TEST = "create_test"
    EXECUTE_TEST = "execute_test"
    VIEW_TEST_RESULTS = "view_test_results"
    MANAGE_TEST_PLANS = "manage_test_plans"
    APPROVE_TEST_RESULTS = "approve_test_results"
    CREATE_TEST_AUTOMATION = "create_test_automation"
    MANAGE_TEST_ENVIRONMENTS = "manage_test_environments"

    # =============================================================================
    # Документация и спецификации
    # =============================================================================
    CREATE_SPECIFICATION = "create_specification"
    EDIT_SPECIFICATION = "edit_specification"
    VIEW_SPECIFICATION = "view_specification"
    DELETE_SPECIFICATION = "delete_specification"
    APPROVE_SPECIFICATION = "approve_specification"
    GENERATE_DOCUMENTATION = "generate_documentation"

    # =============================================================================
    # Коментарии и обратная связь
    # =============================================================================
    CREATE_COMMENT = "create_comment"
    EDIT_COMMENT = "edit_comment"
    DELETE_COMMENT = "delete_comment"
    MODERATE_COMMENTS = "moderate_comments"

    # =============================================================================
    # Интеграции и API
    # =============================================================================
    USE_API = "use_api"
    MANAGE_INTEGRATIONS = "manage_integrations"
    VIEW_API_LOGS = "view_api_logs"
    CREATE_API_KEYS = "create_api_keys"

    # =============================================================================
    # Отчеты и аналитика
    # =============================================================================
    VIEW_REPORTS = "view_reports"
    CREATE_REPORTS = "create_reports"
    EXPORT_REPORTS = "export_reports"
    VIEW_ADVANCED_ANALYTICS = "view_advanced_analytics"


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

    scope: Mapped[RoleScope] = mapped_column(
        String(20), nullable=False, comment="Область действия роли"
    )
    role_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Уровень роли (0=базовый, 10=высший)",
    )

    # Конкретные типы ролей
    system_role: Mapped[Optional[SystemRole]] = mapped_column(
        String(50), nullable=True, comment="Системная роль"
    )
    company_role: Mapped[Optional[CompanyRole]] = mapped_column(
        String(50), nullable=True, comment="Роль в компании"
    )
    department_role: Mapped[Optional[DepartmentRole]] = mapped_column(
        String(50), nullable=True, comment="Роль в департаменте"
    )
    team_role: Mapped[Optional[TeamRole]] = mapped_column(
        String(50), nullable=True, comment="Роль в команде"
    )
    project_role: Mapped[Optional[ProjectRole]] = mapped_column(
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

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
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
        return datetime.now(UTC) > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Валидно ли назначение (активно, не истекло, в правильном времени)"""
        if not self.is_active or self.is_expired:
            return False

        if self.starts_at and datetime.now(UTC) < self.starts_at:
            return False

        return True

    @property
    def scope_level(self) -> RoleScope:
        """Определить уровень области действия назначения"""
        if self.project_id:
            return RoleScope.PROJECT
        elif self.team_id:
            return RoleScope.TEAM
        elif self.department_id:
            return RoleScope.DEPARTMENT
        elif self.company_id:
            return RoleScope.COMPANY
        else:
            return RoleScope.SYSTEM

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
