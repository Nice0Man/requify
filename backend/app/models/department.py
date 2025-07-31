"""
Модель департамента компании.
Реализует иерархическую структуру: Company -> Department -> Team -> User.
"""

from typing import TYPE_CHECKING, List, Optional
from enum import Enum as PyEnum

from sqlalchemy import String, Text, Boolean, Integer, Index, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company
    from .user import User
    from .team import Team
    from .project import Project


class DepartmentType(PyEnum):
    """Типы департаментов"""

    ENGINEERING = "engineering"  # Разработка
    PRODUCT = "product"  # Продукт
    DESIGN = "design"  # Дизайн
    QA = "qa"  # Тестирование
    DEVOPS = "devops"  # DevOps/Infrastructure
    MARKETING = "marketing"  # Маркетинг
    SALES = "sales"  # Продажи
    SUPPORT = "support"  # Поддержка
    HR = "hr"  # HR
    FINANCE = "finance"  # Финансы
    LEGAL = "legal"  # Юридический
    OPERATIONS = "operations"  # Операционный
    RESEARCH = "research"  # Исследования
    BUSINESS_ANALYSIS = "business_analysis"  # Бизнес-анализ
    PROJECT_MANAGEMENT = "project_management"  # Управление проектами
    ADMINISTRATION = "administration"  # Администрация
    CUSTOM = "custom"  # Кастомный


class Department(Base, TimestampedMixin):
    """
    Модель департамента компании.

    Организационная структура:
    Company (1) -> Department (N) -> Team (N) -> User (N)

    Департамент группирует команды по функциональному назначению:
    - Инженерный департамент (команды backend, frontend, mobile)
    - Продуктовый департамент (команды аналитики, дизайна, PM)
    - QA департамент (команды ручного и автотестирования)
    """

    __tablename__ = "departments"
    __table_args__ = (
        Index("ix_departments_company_id", "company_id"),
        Index("ix_departments_type", "type"),
        Index("ix_departments_is_active", "is_active"),
        Index("ix_departments_head_id", "head_id"),
        Index("ix_departments_parent_id", "parent_id"),
        Index("ix_departments_slug", "company_id", "slug", unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # =============================================================================
    # Основная информация
    # =============================================================================

    name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Название департамента"
    )
    slug: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="URL-friendly идентификатор"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание департамента"
    )

    # =============================================================================
    # Связи и иерархия
    # =============================================================================

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании",
    )

    # Иерархия департаментов (например, подотделы)
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        comment="Родительский департамент",
    )

    # Руководитель департамента
    head_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="Руководитель департамента",
    )

    # =============================================================================
    # Классификация и настройки
    # =============================================================================

    type: Mapped[DepartmentType] = mapped_column(
        String(50),
        nullable=False,
        default=DepartmentType.CUSTOM,
        comment="Тип департамента",
    )

    # Настройки
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли департамент"
    )
    is_billable: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Участвует ли в биллинге"
    )
    auto_assign_projects: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Автоматически назначать проекты этого типа",
    )

    # =============================================================================
    # Организационные метрики
    # =============================================================================

    employee_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="Количество сотрудников"
    )
    team_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="Количество команд"
    )

    # Бюджет и KPI
    annual_budget: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True, comment="Годовой бюджет департамента"
    )
    cost_center_code: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Код центра затрат"
    )

    # =============================================================================
    # Локализация и контакты
    # =============================================================================

    location: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, comment="Основное местоположение"
    )
    email: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Email департамента"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Телефон департамента"
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    # Компания
    company: Mapped["Company"] = relationship(
        "Company", back_populates="departments", lazy="select"
    )

    # Иерархия департаментов
    parent: Mapped[Optional["Department"]] = relationship(
        "Department", remote_side=[id], back_populates="children", lazy="select"
    )
    children: Mapped[List["Department"]] = relationship(
        "Department",
        back_populates="parent",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Руководитель департамента
    head: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[head_id], lazy="select"
    )

    # Команды департамента
    teams: Mapped[List["Team"]] = relationship(
        "Team", back_populates="department", lazy="select", cascade="all, delete-orphan"
    )

    # Проекты департамента
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="department", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Department(id={self.id}, name='{self.name}', type='{self.type}', company_id={self.company_id})>"

    # =============================================================================
    # Business Logic Methods - Core
    # =============================================================================

    @property
    def full_name(self) -> str:
        """Полное название с учетом иерархии"""
        if self.parent:
            return f"{self.parent.full_name} / {self.name}"
        return self.name

    @property
    def level(self) -> int:
        """Уровень в иерархии (0 = корневой департамент)"""
        level = 0
        current = self.parent
        while current:
            level += 1
            current = current.parent
        return level

    @property
    def is_root(self) -> bool:
        """Корневой ли департамент"""
        return self.parent_id is None

    @property
    def has_children(self) -> bool:
        """Есть ли подчиненные департаменты"""
        return len(self.children) > 0

    @property
    def total_team_count(self) -> int:
        """Общее количество команд (включая подчиненные департаменты)"""
        total = len(self.teams)
        for child in self.children:
            total += child.total_team_count
        return total

    @property
    def total_employee_count(self) -> int:
        """Общее количество сотрудников (включая подчиненные департаменты)"""
        total = self.employee_count
        for child in self.children:
            total += child.total_employee_count
        return total

    # =============================================================================
    # Business Logic Methods - Teams & Users
    # =============================================================================

    def get_all_teams(self, include_children: bool = True) -> List["Team"]:
        """Получить все команды департамента"""
        teams = list(self.teams)

        if include_children:
            for child in self.children:
                teams.extend(child.get_all_teams(include_children=True))

        return teams

    def get_all_users(self, include_children: bool = True) -> List["User"]:
        """Получить всех пользователей департамента"""
        users = []

        # Пользователи из команд
        for team in self.get_all_teams(include_children=include_children):
            for member in team.members:
                if member.user not in users:
                    users.append(member.user)

        return users

    def get_active_teams(self) -> List["Team"]:
        """Получить активные команды"""
        return [team for team in self.teams if team.is_active]

    def can_add_team(self) -> bool:
        """Можно ли добавить команду"""
        # Проверяем лимиты через компанию
        if not self.company or not self.company.subscription:
            return True

        subscription = self.company.subscription
        if not subscription.max_teams:
            return True

        # Считаем все команды в компании
        total_teams = sum(dept.total_team_count for dept in self.company.departments)
        return total_teams < subscription.max_teams

    # =============================================================================
    # Business Logic Methods - Projects
    # =============================================================================

    def get_department_projects(self, include_children: bool = True) -> List["Project"]:
        """Получить проекты департамента"""
        projects = list(self.projects)

        if include_children:
            for child in self.children:
                projects.extend(child.get_department_projects(include_children=True))

        return projects

    def get_active_projects(self) -> List["Project"]:
        """Получить активные проекты"""
        return [project for project in self.projects if project.is_active]

    # =============================================================================
    # Business Logic Methods - Management
    # =============================================================================

    def assign_head(self, user: "User") -> None:
        """Назначить руководителя департамента"""
        # Проверяем, что пользователь принадлежит этой компании
        if user.company_id != self.company_id:
            raise ValueError("User must belong to the same company")

        self.head_id = user.id

    def add_subdepartment(
        self, name: str, dept_type: DepartmentType = DepartmentType.CUSTOM
    ) -> "Department":
        """Добавить подчиненный департамент"""
        from datetime import datetime, UTC

        subdept = Department(
            name=name,
            slug=name.lower().replace(" ", "_"),
            type=dept_type,
            company_id=self.company_id,
            parent_id=self.id,
            created_at=datetime.now(UTC),
        )

        self.children.append(subdept)
        return subdept

    def get_path(self) -> List["Department"]:
        """Получить путь до корневого департамента"""
        path = [self]
        current = self.parent
        while current:
            path.insert(0, current)
            current = current.parent
        return path

    def get_department_scope_filter(self, include_children: bool = True) -> dict:
        """Получить фильтр для партиционирования по департаменту"""
        if include_children and self.has_children:
            # Включаем все дочерние департаменты
            dept_ids = [self.id]
            for child in self.children:
                dept_ids.extend(self._get_all_child_ids(child))
            return {"department_id__in": dept_ids}
        else:
            return {"department_id": self.id}

    def _get_all_child_ids(self, dept: "Department") -> List[int]:
        """Рекурсивно получить все ID дочерних департаментов"""
        ids = [dept.id]
        for child in dept.children:
            ids.extend(self._get_all_child_ids(child))
        return ids

    def update_counters(self) -> None:
        """Обновить счетчики команд и сотрудников"""
        self.team_count = len(self.teams)
        self.employee_count = len(self.get_all_users(include_children=False))

    def activate(self) -> None:
        """Активировать департамент"""
        self.is_active = True

    def deactivate(self) -> None:
        """Деактивировать департамент"""
        self.is_active = False
        # Также деактивируем все команды
        for team in self.teams:
            team.deactivate()
