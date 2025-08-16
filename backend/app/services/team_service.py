"""
Team Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Tuple
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc

from app.models.user import User
from app.models.team import Team
from app.models.project import Project
from app.crud import team as crud_team, team_member as crud_team_member
from app.utils.logger import logger
from .base import BaseService, ServiceError


class TeamServiceError(ServiceError):
    """Ошибки сервиса команд."""

    pass


class TeamNotFoundError(TeamServiceError):
    """Ошибка - команда не найдена."""

    pass


class TeamMemberNotFoundError(TeamServiceError):
    """Ошибка - участник команды не найден."""

    pass


class TeamPermissionError(TeamServiceError):
    """Ошибка прав доступа к команде."""

    pass


class TeamValidationError(TeamServiceError):
    """Ошибка валидации команды."""

    pass


class TeamRole(str, Enum):
    """Роли в команде."""

    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class TeamStatus(str, Enum):
    """Статусы команды."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"


class TeamMemberStatus(str, Enum):
    """Статусы участника команды."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    REJECTED = "rejected"


@dataclass
class TeamInfo:
    """Информация о команде."""

    id: int
    name: str
    description: Optional[str]
    status: TeamStatus
    created_at: datetime
    member_count: int
    project_count: int = 0
    owner_id: Optional[int] = None


@dataclass
class TeamMemberInfo:
    """Информация об участнике команды."""

    user_id: int
    team_id: int
    role: TeamRole
    status: TeamMemberStatus
    joined_at: datetime
    username: Optional[str] = None
    email: Optional[str] = None


@dataclass
class TeamStats:
    """Статистика команды."""

    total_members: int
    active_members: int
    total_projects: int
    active_projects: int
    activity_score: float = 0.0


@dataclass
class TeamFilter:
    """Фильтр для команд."""

    name: Optional[str] = None
    status: Optional[TeamStatus] = None
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


# Абстрактные интерфейсы
class ITeamRepository(ABC):
    """Интерфейс репозитория команд."""

    @abstractmethod
    async def create_team(self, db: AsyncSession, team_data: Dict[str, Any]) -> Team:
        """Создать команду."""
        pass

    @abstractmethod
    async def get_team_by_id(self, db: AsyncSession, team_id: int) -> Optional[Team]:
        """Получить команду по ID."""
        pass

    @abstractmethod
    async def get_teams_list(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[TeamFilter] = None,
    ) -> List[Team]:
        """Получить список команд."""
        pass


class ITeamMemberRepository(ABC):
    """Интерфейс репозитория участников команд."""

    @abstractmethod
    async def add_member(
        self,
        db: AsyncSession,
        team_id: int,
        user_id: int,
        role: TeamRole,
        added_by: int,
    ) -> Any:
        """Добавить участника в команду."""
        pass

    @abstractmethod
    async def get_team_members(
        self, db: AsyncSession, team_id: int, include_inactive: bool = False
    ) -> List[Any]:
        """Получить участников команды."""
        pass


class ITeamValidator(ABC):
    """Интерфейс валидатора команд."""

    @abstractmethod
    async def validate_team_creation(
        self, db: AsyncSession, team_data: Dict[str, Any], creator_id: int
    ) -> bool:
        """Валидировать создание команды."""
        pass

    @abstractmethod
    async def validate_member_addition(
        self, db: AsyncSession, team_id: int, user_id: int, role: TeamRole
    ) -> bool:
        """Валидировать добавление участника."""
        pass


class ITeamPermissionChecker(ABC):
    """Интерфейс проверки разрешений команды."""

    @abstractmethod
    async def can_user_access_team(
        self, db: AsyncSession, user_id: int, team_id: int, action: str
    ) -> bool:
        """Проверить доступ пользователя к команде."""
        pass


class ITeamAnalyzer(ABC):
    """Интерфейс анализатора команд."""

    @abstractmethod
    async def calculate_team_stats(self, db: AsyncSession, team_id: int) -> TeamStats:
        """Рассчитать статистику команды."""
        pass


# Конкретные реализации
class DatabaseTeamRepository(ITeamRepository):
    """Репозиторий команд в базе данных."""

    async def create_team(self, db: AsyncSession, team_data: Dict[str, Any]) -> Team:
        """Создать команду."""
        return await crud_team.create(db, obj_in=team_data)

    async def get_team_by_id(self, db: AsyncSession, team_id: int) -> Optional[Team]:
        """Получить команду по ID."""
        return await crud_team.get(db, id=team_id)

    async def get_teams_list(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[TeamFilter] = None,
    ) -> List[Team]:
        """Получить список команд."""
        stmt = select(Team).options(selectinload(Team.members))

        if filters:
            if filters.name:
                stmt = stmt.where(Team.name.ilike(f"%{filters.name}%"))

            if filters.status:
                stmt = stmt.where(Team.status == filters.status.value)

            if filters.date_from:
                stmt = stmt.where(Team.created_at >= filters.date_from)

            if filters.date_to:
                stmt = stmt.where(Team.created_at <= filters.date_to)

        stmt = stmt.offset(skip).limit(limit).order_by(desc(Team.created_at))

        result = await db.execute(stmt)
        return result.scalars().all()

    async def update_team(
        self, db: AsyncSession, team_id: int, team_data: Dict[str, Any]
    ) -> Team:
        """Обновить команду."""
        team = await self.get_team_by_id(db, team_id)
        if not team:
            raise TeamNotFoundError(f"Team with ID {team_id} not found")

        return await crud_team.update(db, db_obj=team, obj_in=team_data)

    async def delete_team(self, db: AsyncSession, team_id: int) -> bool:
        """Удалить команду."""
        team = await self.get_team_by_id(db, team_id)
        if not team:
            raise TeamNotFoundError(f"Team with ID {team_id} not found")

        await crud_team.remove(db, id=team_id)
        return True


class DatabaseTeamMemberRepository(ITeamMemberRepository):
    """Репозиторий участников команд в базе данных."""

    async def add_member(
        self,
        db: AsyncSession,
        team_id: int,
        user_id: int,
        role: TeamRole,
        added_by: int,
    ) -> Any:
        """Добавить участника в команду."""
        member_data = {
            "team_id": team_id,
            "user_id": user_id,
            "role": role.value,
            "status": TeamMemberStatus.ACTIVE.value,
            "added_by": added_by,
            "joined_at": datetime.utcnow(),
        }
        return await crud_team_member.create(db, obj_in=member_data)

    async def get_team_members(
        self, db: AsyncSession, team_id: int, include_inactive: bool = False
    ) -> List[Any]:
        """Получить участников команды."""
        stmt = (
            select(crud_team_member.model)
            .options(selectinload(crud_team_member.model.user))
            .where(crud_team_member.model.team_id == team_id)
        )

        if not include_inactive:
            stmt = stmt.where(
                crud_team_member.model.status == TeamMemberStatus.ACTIVE.value
            )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def remove_member(self, db: AsyncSession, team_id: int, user_id: int) -> bool:
        """Удалить участника из команды."""
        # Простая реализация - помечаем как неактивного
        stmt = select(crud_team_member.model).where(
            and_(
                crud_team_member.model.team_id == team_id,
                crud_team_member.model.user_id == user_id,
            )
        )

        result = await db.execute(stmt)
        member = result.scalar_one_or_none()

        if not member:
            raise TeamMemberNotFoundError(
                f"Member {user_id} not found in team {team_id}"
            )

        await crud_team_member.update(
            db, db_obj=member, obj_in={"status": TeamMemberStatus.INACTIVE.value}
        )
        return True

    async def update_member_role(
        self, db: AsyncSession, team_id: int, user_id: int, role: TeamRole
    ) -> Any:
        """Обновить роль участника."""
        stmt = select(crud_team_member.model).where(
            and_(
                crud_team_member.model.team_id == team_id,
                crud_team_member.model.user_id == user_id,
            )
        )

        result = await db.execute(stmt)
        member = result.scalar_one_or_none()

        if not member:
            raise TeamMemberNotFoundError(
                f"Member {user_id} not found in team {team_id}"
            )

        return await crud_team_member.update(
            db, db_obj=member, obj_in={"role": role.value}
        )


class StandardTeamValidator(ITeamValidator):
    """Стандартный валидатор команд."""

    async def validate_team_creation(
        self, db: AsyncSession, team_data: Dict[str, Any], creator_id: int
    ) -> bool:
        """Валидировать создание команды."""
        # Проверка обязательных полей
        if not team_data.get("name"):
            raise TeamValidationError("Team name is required")

        if len(team_data["name"]) < 3:
            raise TeamValidationError("Team name must be at least 3 characters long")

        # Проверка уникальности имени (в рамках пользователя)
        stmt = select(Team).where(
            and_(Team.name == team_data["name"], Team.created_by == creator_id)
        )
        result = await db.execute(stmt)
        existing_team = result.scalar_one_or_none()

        if existing_team:
            raise TeamValidationError(
                f"Team with name '{team_data['name']}' already exists"
            )

        return True

    async def validate_member_addition(
        self, db: AsyncSession, team_id: int, user_id: int, role: TeamRole
    ) -> bool:
        """Валидировать добавление участника."""
        # Проверка существования пользователя
        user_stmt = select(User).where(User.id == user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()

        if not user:
            raise TeamValidationError(f"User with ID {user_id} not found")

        if not user.is_active:
            raise TeamValidationError(f"User {user_id} is not active")

        # Проверка, что пользователь еще не в команде
        member_stmt = select(crud_team_member.model).where(
            and_(
                crud_team_member.model.team_id == team_id,
                crud_team_member.model.user_id == user_id,
                crud_team_member.model.status == TeamMemberStatus.ACTIVE.value,
            )
        )
        member_result = await db.execute(member_stmt)
        existing_member = member_result.scalar_one_or_none()

        if existing_member:
            raise TeamValidationError(
                f"User {user_id} is already a member of team {team_id}"
            )

        return True


class StandardTeamPermissionChecker(ITeamPermissionChecker):
    """Стандартный проверщик разрешений команды."""

    async def can_user_access_team(
        self, db: AsyncSession, user_id: int, team_id: int, action: str
    ) -> bool:
        """Проверить доступ пользователя к команде."""
        # Получение роли пользователя в команде
        stmt = select(crud_team_member.model).where(
            and_(
                crud_team_member.model.team_id == team_id,
                crud_team_member.model.user_id == user_id,
                crud_team_member.model.status == TeamMemberStatus.ACTIVE.value,
            )
        )

        result = await db.execute(stmt)
        member = result.scalar_one_or_none()

        if not member:
            # Проверка, является ли пользователь создателем команды
            team_stmt = select(Team).where(Team.id == team_id)
            team_result = await db.execute(team_stmt)
            team = team_result.scalar_one_or_none()

            if team and hasattr(team, "created_by") and team.created_by == user_id:
                return True  # Создатель имеет все права

            return False  # Не участник команды

        # Проверка разрешений по ролям
        role = TeamRole(member.role)

        if action == "read":
            return True  # Все участники могут читать
        elif action == "update":
            return role in [TeamRole.OWNER, TeamRole.ADMIN]
        elif action == "delete":
            return role == TeamRole.OWNER
        elif action == "manage_members":
            return role in [TeamRole.OWNER, TeamRole.ADMIN]
        else:
            return role == TeamRole.OWNER  # По умолчанию только владелец


class TeamAnalyzer(ITeamAnalyzer):
    """Анализатор команд."""

    async def calculate_team_stats(self, db: AsyncSession, team_id: int) -> TeamStats:
        """Рассчитать статистику команды."""
        # Подсчет участников
        total_members_stmt = select(func.count(crud_team_member.model.id)).where(
            crud_team_member.model.team_id == team_id
        )
        total_members_result = await db.execute(total_members_stmt)
        total_members = total_members_result.scalar()

        # Подсчет активных участников
        active_members_stmt = select(func.count(crud_team_member.model.id)).where(
            and_(
                crud_team_member.model.team_id == team_id,
                crud_team_member.model.status == TeamMemberStatus.ACTIVE.value,
            )
        )
        active_members_result = await db.execute(active_members_stmt)
        active_members = active_members_result.scalar()

        # Подсчет проектов (упрощенная реализация)
        # В реальной реализации здесь должна быть связь команды с проектами
        total_projects = 0
        active_projects = 0

        # Расчет активности (упрощенный)
        activity_score = (
            (active_members / total_members * 100) if total_members > 0 else 0
        )

        return TeamStats(
            total_members=total_members,
            active_members=active_members,
            total_projects=total_projects,
            active_projects=active_projects,
            activity_score=round(activity_score, 2),
        )


class TeamService(BaseService):
    """
    Основной сервис команд.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы и проверки разрешений)
    - Command (операции с командами)
    """

    def __init__(self):
        self._team_repository: ITeamRepository = DatabaseTeamRepository()
        self._member_repository: ITeamMemberRepository = DatabaseTeamMemberRepository()
        self._validator: ITeamValidator = StandardTeamValidator()
        self._permission_checker: ITeamPermissionChecker = (
            StandardTeamPermissionChecker()
        )
        self._analyzer: ITeamAnalyzer = TeamAnalyzer()
        super().__init__()

    def get_service_name(self) -> str:
        return "TeamService"

    def set_team_repository(self, repository: ITeamRepository):
        """Установить репозиторий команд."""
        self._team_repository = repository
        self._log_operation(
            "set_team_repository", {"repository": type(repository).__name__}
        )

    def set_member_repository(self, repository: ITeamMemberRepository):
        """Установить репозиторий участников."""
        self._member_repository = repository
        self._log_operation(
            "set_member_repository", {"repository": type(repository).__name__}
        )

    def set_validator(self, validator: ITeamValidator):
        """Установить валидатор."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def create_team(
        self,
        db: AsyncSession,
        name: str,
        description: Optional[str],
        creator_id: int,
        status: TeamStatus = TeamStatus.ACTIVE,
    ) -> Team:
        """Создать команду."""
        try:
            self._log_operation(
                "create_team",
                {"name": name, "creator_id": creator_id, "status": status.value},
            )

            # Подготовка данных
            team_data = {
                "name": name,
                "description": description,
                "status": status.value,
                "created_by": creator_id,
                "created_at": datetime.utcnow(),
            }

            # Валидация
            await self._validator.validate_team_creation(db, team_data, creator_id)

            # Создание команды
            team = await self._team_repository.create_team(db, team_data)

            # Добавление создателя как владельца
            await self._member_repository.add_member(
                db, team.id, creator_id, TeamRole.OWNER, creator_id
            )

            return team

        except Exception as e:
            raise self._handle_error(e, "create_team")

    async def get_team(
        self, db: AsyncSession, team_id: int, user_id: Optional[int] = None
    ) -> Optional[Team]:
        """Получить команду."""
        try:
            self._log_operation("get_team", {"team_id": team_id, "user_id": user_id})

            team = await self._team_repository.get_team_by_id(db, team_id)

            if not team:
                raise TeamNotFoundError(f"Team with ID {team_id} not found")

            # Проверка доступа
            if user_id:
                can_access = await self._permission_checker.can_user_access_team(
                    db, user_id, team_id, "read"
                )
                if not can_access:
                    raise TeamPermissionError("Access denied to team")

            return team

        except Exception as e:
            raise self._handle_error(e, "get_team")

    async def get_teams_list(
        self,
        db: AsyncSession,
        user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[TeamFilter] = None,
    ) -> List[Team]:
        """Получить список команд."""
        try:
            self._log_operation(
                "get_teams_list", {"user_id": user_id, "skip": skip, "limit": limit}
            )

            return await self._team_repository.get_teams_list(db, skip, limit, filters)

        except Exception as e:
            raise self._handle_error(e, "get_teams_list")

    async def update_team(
        self,
        db: AsyncSession,
        team_id: int,
        user_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[TeamStatus] = None,
    ) -> Team:
        """Обновить команду."""
        try:
            self._log_operation("update_team", {"team_id": team_id, "user_id": user_id})

            # Проверка доступа
            can_update = await self._permission_checker.can_user_access_team(
                db, user_id, team_id, "update"
            )
            if not can_update:
                raise TeamPermissionError("No permission to update team")

            # Подготовка данных для обновления
            update_data = {}
            if name is not None:
                update_data["name"] = name
            if description is not None:
                update_data["description"] = description
            if status is not None:
                update_data["status"] = status.value

            if update_data:
                update_data["updated_at"] = datetime.utcnow()

            return await self._team_repository.update_team(db, team_id, update_data)

        except Exception as e:
            raise self._handle_error(e, "update_team")

    async def delete_team(self, db: AsyncSession, team_id: int, user_id: int) -> bool:
        """Удалить команду."""
        try:
            self._log_operation("delete_team", {"team_id": team_id, "user_id": user_id})

            # Проверка доступа
            can_delete = await self._permission_checker.can_user_access_team(
                db, user_id, team_id, "delete"
            )
            if not can_delete:
                raise TeamPermissionError("No permission to delete team")

            return await self._team_repository.delete_team(db, team_id)

        except Exception as e:
            raise self._handle_error(e, "delete_team")

    async def add_member(
        self,
        db: AsyncSession,
        team_id: int,
        user_id: int,
        new_member_id: int,
        role: TeamRole = TeamRole.MEMBER,
    ) -> Any:
        """Добавить участника в команду."""
        try:
            self._log_operation(
                "add_member",
                {
                    "team_id": team_id,
                    "user_id": user_id,
                    "new_member_id": new_member_id,
                    "role": role.value,
                },
            )

            # Проверка доступа
            can_manage = await self._permission_checker.can_user_access_team(
                db, user_id, team_id, "manage_members"
            )
            if not can_manage:
                raise TeamPermissionError("No permission to manage team members")

            # Валидация
            await self._validator.validate_member_addition(
                db, team_id, new_member_id, role
            )

            # Добавление участника
            return await self._member_repository.add_member(
                db, team_id, new_member_id, role, user_id
            )

        except Exception as e:
            raise self._handle_error(e, "add_member")

    async def remove_member(
        self, db: AsyncSession, team_id: int, user_id: int, member_id: int
    ) -> bool:
        """Удалить участника из команды."""
        try:
            self._log_operation(
                "remove_member",
                {"team_id": team_id, "user_id": user_id, "member_id": member_id},
            )

            # Проверка доступа
            can_manage = await self._permission_checker.can_user_access_team(
                db, user_id, team_id, "manage_members"
            )
            if not can_manage:
                raise TeamPermissionError("No permission to manage team members")

            return await self._member_repository.remove_member(db, team_id, member_id)

        except Exception as e:
            raise self._handle_error(e, "remove_member")

    async def get_team_members(
        self,
        db: AsyncSession,
        team_id: int,
        user_id: Optional[int] = None,
        include_inactive: bool = False,
    ) -> List[Any]:
        """Получить участников команды."""
        try:
            self._log_operation(
                "get_team_members",
                {
                    "team_id": team_id,
                    "user_id": user_id,
                    "include_inactive": include_inactive,
                },
            )

            # Проверка доступа
            if user_id:
                can_access = await self._permission_checker.can_user_access_team(
                    db, user_id, team_id, "read"
                )
                if not can_access:
                    raise TeamPermissionError("Access denied to team members")

            return await self._member_repository.get_team_members(
                db, team_id, include_inactive
            )

        except Exception as e:
            raise self._handle_error(e, "get_team_members")

    async def update_member_role(
        self,
        db: AsyncSession,
        team_id: int,
        user_id: int,
        member_id: int,
        new_role: TeamRole,
    ) -> Any:
        """Обновить роль участника."""
        try:
            self._log_operation(
                "update_member_role",
                {
                    "team_id": team_id,
                    "user_id": user_id,
                    "member_id": member_id,
                    "new_role": new_role.value,
                },
            )

            # Проверка доступа
            can_manage = await self._permission_checker.can_user_access_team(
                db, user_id, team_id, "manage_members"
            )
            if not can_manage:
                raise TeamPermissionError("No permission to manage team members")

            return await self._member_repository.update_member_role(
                db, team_id, member_id, new_role
            )

        except Exception as e:
            raise self._handle_error(e, "update_member_role")

    async def get_team_stats(
        self, db: AsyncSession, team_id: int, user_id: Optional[int] = None
    ) -> TeamStats:
        """Получить статистику команды."""
        try:
            self._log_operation(
                "get_team_stats", {"team_id": team_id, "user_id": user_id}
            )

            # Проверка доступа
            if user_id:
                can_access = await self._permission_checker.can_user_access_team(
                    db, user_id, team_id, "read"
                )
                if not can_access:
                    raise TeamPermissionError("Access denied to team stats")

            return await self._analyzer.calculate_team_stats(db, team_id)

        except Exception as e:
            raise self._handle_error(e, "get_team_stats")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("team", TeamService)

# Singleton instance
team_service = TeamService()
