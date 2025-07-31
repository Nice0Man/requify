from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional, Set

from sqlalchemy import Boolean, DateTime, Integer, String, Index, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin
from .mixins import (
    AuthMixin,
    PermissionsMixin,
    EmailVerificationMixin,
    ActivityMixin,
    UserIndexesMixin,
)

if TYPE_CHECKING:
    from .company import Company
    from .user_profile import UserProfile
    from .project import Project
    from .requirement import Requirement
    from .comment import Comment
    from .requirement_group_version import RequirementGroupVersion
    from .test_result import TestResult
    from .refresh_token import RefreshToken
    from .team import Team
    from .team_member import TeamMember
    from .user_settings import UserSettings as UserSettingsModel
    from .enhanced_role_system import UserRoleAssignment, EnhancedRole, Permission
    from .dashboard import (
        UserDashboardPreferences,
        DashboardNotification,
        DashboardActivity,
        DashboardWidget,
    )


class User(
    Base,
    TimestampedMixin,
    AuthMixin,
    PermissionsMixin,
    EmailVerificationMixin,
    ActivityMixin,
    UserIndexesMixin,
):
    """
    Основная модель пользователя системы.

    Архитектура обновлена:
    - Профильные данные вынесены в UserProfile (1-к-1)
    - Настройки поведения в UserSettings (1-к-1)
    - Связь с компанией через company_id
    - Роли управляются через Enhanced Role System (UserRoleAssignment)
    - Поддержка System Admin и Company Admin
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # =============================================================================
    # Связь с компанией (reference-only, без обратного отношения)
    # =============================================================================

    company_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("companies.id"),
        nullable=True,
        comment="Основная компания пользователя (NULL для System Admin, reference-only)",
    )

    # NOTE: Это поле только для быстрого доступа к компании пользователя
    # Фактическое членство в командах и департаментах определяется через TeamMember

    # =============================================================================
    # Отношения - Core
    # =============================================================================

    # Основная компания (reference-only, без обратного отношения)
    company: Mapped[Optional["Company"]] = relationship(
        "Company", lazy="select", foreign_keys=[company_id], viewonly=True
    )

    # Профиль пользователя (1-к-1)
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="user",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Настройки пользователя (1-к-1)
    user_settings: Mapped[Optional["UserSettingsModel"]] = relationship(
        "UserSettings",
        back_populates="user",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Роли пользователя (Enhanced Role System)
    role_assignments: Mapped[List["UserRoleAssignment"]] = relationship(
        "UserRoleAssignment",
        foreign_keys="UserRoleAssignment.user_id",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # =============================================================================
    # Отношения - Business Logic
    # =============================================================================

    # Проекты
    owned_projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="owner", lazy="select"
    )

    # Требования
    authored_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        foreign_keys="Requirement.author_id",
        back_populates="author",
        lazy="select",
    )

    modified_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        foreign_keys="Requirement.last_modified_by",
        back_populates="last_modifier",
        lazy="select",
    )

    # Комментарии
    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="author", lazy="select"
    )

    # Версии групп требований
    group_versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion",
        foreign_keys="RequirementGroupVersion.created_by",
        back_populates="created_by_user",
        lazy="select",
    )

    # Результаты тестирования
    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult", back_populates="tester", lazy="select"
    )

    # =============================================================================
    # Отношения - Authentication & Sessions
    # =============================================================================

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        "RefreshToken",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # =============================================================================
    # Отношения - Dashboard
    # =============================================================================

    dashboard_preferences: Mapped[Optional["UserDashboardPreferences"]] = relationship(
        "UserDashboardPreferences",
        back_populates="user",
        lazy="select",
        uselist=False,
        cascade="all, delete-orphan",
    )

    notifications: Mapped[List["DashboardNotification"]] = relationship(
        "DashboardNotification",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    activities: Mapped[List["DashboardActivity"]] = relationship(
        "DashboardActivity",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    dashboard_widgets: Mapped[List["DashboardWidget"]] = relationship(
        "DashboardWidget",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # =============================================================================
    # Отношения - Teams
    # =============================================================================

    owned_teams: Mapped[List["Team"]] = relationship(
        "Team",
        back_populates="owner",
        lazy="select",
        cascade="all, delete-orphan",
    )

    team_memberships: Mapped[List["TeamMember"]] = relationship(
        "TeamMember",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

    # =============================================================================
    # Business Logic Methods - Core
    # =============================================================================

    @property
    def full_name(self) -> str:
        """Полное имя пользователя (из профиля или deprecated полей)"""
        if self.profile:
            return self.profile.full_name

        # Fallback на deprecated поля
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return self.username

    @property
    def display_name(self) -> str:
        """Отображаемое имя для UI"""
        if self.profile and self.profile.display_name:
            return self.profile.display_name
        return self.full_name

    @property
    def avatar_display_url(self) -> str:
        """URL аватара для отображения"""
        if self.profile:
            return self.profile.get_avatar_or_default()
        # Fallback
        if self.avatar_url:
            return self.avatar_url
        return f"https://ui-avatars.com/api/?name={self.username}&size=256&background=random"

    # =============================================================================
    # Business Logic Methods - Company & Roles
    # =============================================================================

    @property
    def is_system_admin(self) -> bool:
        """Является ли пользователь системным администратором"""
        from .enhanced_role_system import SystemRole, RoleScope

        for assignment in self.role_assignments:
            if (assignment.is_active and 
                assignment.role and 
                assignment.role.scope == RoleScope.SYSTEM and
                assignment.role.system_role == SystemRole.SYSTEM_ADMIN):
                return True
        return False

    @property
    def is_company_admin(self) -> bool:
        """Является ли пользователь админом своей основной компании"""
        if not self.company_id:
            return False
        return self.is_company_admin_of(self.company_id)

    def is_company_admin_of(self, company_id: int) -> bool:
        """Является ли пользователь админом указанной компании"""
        from .enhanced_role_system import CompanyRole, RoleScope

        # Системные админы являются админами всех компаний
        if self.is_system_admin:
            return True

        for assignment in self.role_assignments:
            if (
                assignment.is_active
                and assignment.company_id == company_id
                and assignment.role
                and assignment.role.scope == RoleScope.COMPANY
                and assignment.role.company_role == CompanyRole.COMPANY_ADMIN
            ):
                return True
        return False

    def get_companies(self) -> List["Company"]:
        """Получить все компании, в которых участвует пользователь"""
        companies = []
        seen_ids = set()

        # Основная компания
        if self.company and self.company.id not in seen_ids:
            companies.append(self.company)
            seen_ids.add(self.company.id)

        # Компании через назначения ролей
        for assignment in self.role_assignments:
            if (assignment.is_active and 
                assignment.company_id and 
                assignment.company_id not in seen_ids):
                # Получаем компанию из базы данных если не загружена
                if hasattr(assignment, 'company') and assignment.company:
                    companies.append(assignment.company)
                    seen_ids.add(assignment.company_id)

        return companies

    def get_permissions_in_company(self, company_id: int) -> Set["Permission"]:
        """Получить все разрешения пользователя в указанной компании"""
        from .enhanced_role_system import Permission

        permissions = set()

        # Системные права действуют везде
        if self.is_system_admin:
            return set(Permission)

        # Права в конкретной компании через назначения ролей
        for assignment in self.role_assignments:
            if (assignment.is_active and 
                assignment.company_id == company_id and 
                assignment.role):
                # Добавляем права роли
                if assignment.role.permissions:
                    permissions.update(assignment.role.permissions)

        return permissions

    def has_permission_in_company(
        self, permission: "Permission", company_id: int
    ) -> bool:
        """Проверить, есть ли разрешение в указанной компании"""
        permissions = self.get_permissions_in_company(company_id)
        return permission in permissions

    def can_manage_company(self, company_id: int) -> bool:
        """Может ли пользователь управлять компанией"""
        from .role_system import Permission

        return self.is_system_admin or self.has_permission_in_company(
            Permission.MANAGE_COMPANY, company_id
        )

    def can_manage_project(self, project) -> bool:
        """Может ли пользователь управлять проектом"""
        from .role_system import Permission

        # Системный админ может всё
        if self.is_system_admin:
            return True

        # Владелец проекта
        if project.owner_id == self.id:
            return True

        # Проверяем права в компании проекта
        if project.company_id:
            return self.has_permission_in_company(
                Permission.MANAGE_PROJECT, project.company_id
            )

        return False

    def get_company_scope_filter(self) -> dict:
        """Получить фильтр для партиционирования по компаниям"""
        if self.is_system_admin:
            return {}  # Системный админ видит всё

        company_ids = [c.id for c in self.get_companies()]
        if company_ids:
            return {"company_id__in": company_ids}

        return {"company_id": -1}  # Нет доступа ни к каким компаниям

    # =============================================================================
    # Business Logic Methods - Utility
    # =============================================================================

    def update_last_login(self) -> None:
        """Обновить время последнего входа"""
        self.last_login = datetime.now(UTC)

    def create_profile_if_missing(self) -> "UserProfile":
        """Создать профиль если он отсутствует"""
        if not self.profile:
            from .user_profile import UserProfile

            self.profile = UserProfile(
                user_id=self.id,
                display_name=self.username,
                first_name=self.first_name,  # Миграция из deprecated полей
                last_name=self.last_name,
                phone=self.phone,
                bio=self.bio,
                position=self.position,
                avatar_url=self.avatar_url,
                timezone=self.timezone,
            )
        return self.profile

    def ensure_company_membership(self) -> None:
        """Убедиться, что пользователь состоит в компании (если не System Admin)"""
        if self.is_system_admin:
            return  # System Admin может не принадлежать компании

        if not self.company_id:
            raise ValueError("Regular user must belong to a company")

    def add_role_assignment(
        self, 
        role: "EnhancedRole", 
        company_id: Optional[int] = None,
        department_id: Optional[int] = None,
        team_id: Optional[int] = None,
        project_id: Optional[int] = None,
        assigned_by: Optional[int] = None
    ) -> "UserRoleAssignment":
        """Добавить назначение роли"""
        from .enhanced_role_system import UserRoleAssignment

        # Проверяем, нет ли уже такой роли в этом контексте
        for assignment in self.role_assignments:
            if (assignment.role_id == role.id and 
                assignment.company_id == company_id and
                assignment.department_id == department_id and
                assignment.team_id == team_id and
                assignment.project_id == project_id and
                assignment.is_active):
                return assignment  # Уже есть

        # Создаём новое назначение роли
        new_assignment = UserRoleAssignment(
            user_id=self.id,
            role_id=role.id,
            company_id=company_id,
            department_id=department_id,
            team_id=team_id,
            project_id=project_id,
            assigned_by=assigned_by,
        )
        self.role_assignments.append(new_assignment)
        return new_assignment
