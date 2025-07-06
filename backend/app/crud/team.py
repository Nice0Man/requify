"""
CRUD operations for teams and team members.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.crud.base import CRUDBase
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.models.constants import TeamStatus, TeamRole
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamSearchRequest,
    TeamStats,
    TeamMemberStats,
)


class CRUDTeam(CRUDBase[Team, TeamCreate, TeamUpdate]):
    """CRUD operations for teams"""

    async def get_by_code(self, db: AsyncSession, *, code: str) -> Optional[Team]:
        """Получить команду по коду"""
        stmt = select(self.model).where(self.model.code == code)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_members(
        self, db: AsyncSession, *, team_id: int
    ) -> Optional[Team]:
        """Получить команду с участниками"""
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.members).selectinload(TeamMember.user),
                selectinload(self.model.owner),
            )
            .where(self.model.id == team_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_owner(
        self, db: AsyncSession, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Team]:
        """Получить команды по владельцу"""
        stmt = (
            select(self.model)
            .where(self.model.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_user_teams(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Team]:
        """Получить команды пользователя (как владельца или участника)"""
        stmt = (
            select(self.model)
            .join(TeamMember, TeamMember.team_id == self.model.id, isouter=True)
            .where(
                or_(
                    self.model.owner_id == user_id,
                    and_(TeamMember.user_id == user_id, TeamMember.is_active == True),
                )
            )
            .distinct()
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def search_teams(
        self, db: AsyncSession, *, search_params: TeamSearchRequest
    ) -> tuple[List[Team], int]:
        """Поиск команд с фильтрацией"""
        stmt = select(self.model).options(selectinload(self.model.owner))
        count_stmt = select(func.count(self.model.id))

        # Применяем фильтры
        filters = []

        if search_params.query:
            query_filter = or_(
                self.model.name.ilike(f"%{search_params.query}%"),
                self.model.code.ilike(f"%{search_params.query}%"),
                self.model.description.ilike(f"%{search_params.query}%"),
            )
            filters.append(query_filter)

        if search_params.status:
            filters.append(self.model.status == search_params.status)

        if search_params.is_public is not None:
            filters.append(self.model.is_public == search_params.is_public)

        if search_params.owner_id:
            filters.append(self.model.owner_id == search_params.owner_id)

        if search_params.has_member:
            # Поиск команд с определенным участником
            stmt = stmt.join(TeamMember, TeamMember.team_id == self.model.id)
            count_stmt = count_stmt.join(
                TeamMember, TeamMember.team_id == self.model.id
            )
            filters.append(
                and_(
                    TeamMember.user_id == search_params.has_member,
                    TeamMember.is_active == True,
                )
            )

        if filters:
            stmt = stmt.where(and_(*filters))
            count_stmt = count_stmt.where(and_(*filters))

        # Сортировка
        if search_params.sort_by == "name":
            order_col = self.model.name
        elif search_params.sort_by == "code":
            order_col = self.model.code
        elif search_params.sort_by == "updated_at":
            order_col = self.model.updated_at
        else:
            order_col = self.model.created_at

        if search_params.sort_order == "asc":
            stmt = stmt.order_by(asc(order_col))
        else:
            stmt = stmt.order_by(desc(order_col))

        # Пагинация
        offset = (search_params.page - 1) * search_params.per_page
        stmt = stmt.offset(offset).limit(search_params.per_page)

        # Выполняем запросы
        result = await db.execute(stmt)
        teams = result.scalars().all()

        count_result = await db.execute(count_stmt)
        total = count_result.scalar()

        return teams, total

    async def get_team_stats(self, db: AsyncSession) -> TeamStats:
        """Получить статистику команд"""
        # Основные счетчики
        total_stmt = select(func.count(self.model.id))
        active_stmt = select(func.count(self.model.id)).where(
            self.model.status == TeamStatus.ACTIVE
        )
        inactive_stmt = select(func.count(self.model.id)).where(
            self.model.status == TeamStatus.INACTIVE
        )
        archived_stmt = select(func.count(self.model.id)).where(
            self.model.status == TeamStatus.ARCHIVED
        )

        # Общее количество участников
        members_stmt = select(func.count(TeamMember.id)).where(
            TeamMember.is_active == True
        )

        # Средний размер команды
        avg_size_stmt = (
            select(func.avg(func.count(TeamMember.id)))
            .select_from(self.model)
            .join(TeamMember, TeamMember.team_id == self.model.id, isouter=True)
            .where(TeamMember.is_active == True)
            .group_by(self.model.id)
        )

        # Выполняем запросы
        total = (await db.execute(total_stmt)).scalar() or 0
        active = (await db.execute(active_stmt)).scalar() or 0
        inactive = (await db.execute(inactive_stmt)).scalar() or 0
        archived = (await db.execute(archived_stmt)).scalar() or 0
        total_members = (await db.execute(members_stmt)).scalar() or 0
        avg_size = (await db.execute(avg_size_stmt)).scalar() or 0.0

        # Распределение по статусам
        teams_by_status = {
            TeamStatus.ACTIVE: active,
            TeamStatus.INACTIVE: inactive,
            TeamStatus.ARCHIVED: archived,
        }

        return TeamStats(
            total_teams=total,
            active_teams=active,
            inactive_teams=inactive,
            archived_teams=archived,
            total_members=total_members,
            average_team_size=float(avg_size),
            teams_by_status=teams_by_status,
        )

    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: TeamCreate, owner_id: int
    ) -> Team:
        """Создать команду с указанным владельцем"""
        # Проверяем уникальность кода
        existing = await self.get_by_code(db, code=obj_in.code)
        if existing:
            raise ValueError(f"Команда с кодом '{obj_in.code}' уже существует")

        # Создаем команду
        team_data = obj_in.model_dump()
        team_data["owner_id"] = owner_id
        team_data["status"] = TeamStatus.ACTIVE

        team = await self.create(db, obj_in=team_data)

        # Автоматически добавляем владельца как участника с ролью OWNER
        member_data = {
            "team_id": team.id,
            "user_id": owner_id,
            "role": TeamRole.OWNER,
            "is_active": True,
        }

        member = TeamMember(**member_data)
        db.add(member)
        await db.commit()
        await db.refresh(team)

        return team

    async def update_status(
        self, db: AsyncSession, *, team_id: int, status: TeamStatus
    ) -> Optional[Team]:
        """Обновить статус команды"""
        team = await self.get(db, id=team_id)
        if not team:
            return None

        team.status = status
        await db.commit()
        await db.refresh(team)
        return team

    async def archive_team(self, db: AsyncSession, *, team_id: int) -> Optional[Team]:
        """Архивировать команду"""
        return await self.update_status(db, team_id=team_id, status=TeamStatus.ARCHIVED)

    async def restore_team(self, db: AsyncSession, *, team_id: int) -> Optional[Team]:
        """Восстановить команду из архива"""
        return await self.update_status(db, team_id=team_id, status=TeamStatus.ACTIVE)


class CRUDTeamMember(CRUDBase[TeamMember, TeamMemberCreate, TeamMemberUpdate]):
    """CRUD operations for team members"""

    async def get_by_team_and_user(
        self, db: AsyncSession, *, team_id: int, user_id: int
    ) -> Optional[TeamMember]:
        """Получить участника по команде и пользователю"""
        stmt = select(self.model).where(
            and_(self.model.team_id == team_id, self.model.user_id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_team_members(
        self, db: AsyncSession, *, team_id: int, active_only: bool = True
    ) -> List[TeamMember]:
        """Получить участников команды"""
        stmt = (
            select(self.model)
            .options(selectinload(self.model.user))
            .where(self.model.team_id == team_id)
        )

        if active_only:
            stmt = stmt.where(self.model.is_active == True)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_user_memberships(
        self, db: AsyncSession, *, user_id: int, active_only: bool = True
    ) -> List[TeamMember]:
        """Получить участие пользователя в командах"""
        stmt = (
            select(self.model)
            .options(selectinload(self.model.team))
            .where(self.model.user_id == user_id)
        )

        if active_only:
            stmt = stmt.where(self.model.is_active == True)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def add_member(
        self,
        db: AsyncSession,
        *,
        team_id: int,
        user_id: int,
        role: TeamRole = TeamRole.DEVELOPER,
    ) -> TeamMember:
        """Добавить участника в команду"""
        # Проверяем, не является ли пользователь уже участником
        existing = await self.get_by_team_and_user(db, team_id=team_id, user_id=user_id)
        if existing:
            if existing.is_active:
                raise ValueError("Пользователь уже является участником команды")
            else:
                # Реактивируем участника
                existing.is_active = True
                existing.role = role
                existing.left_at = None
                await db.commit()
                await db.refresh(existing)
                return existing

        # Создаем нового участника
        member_data = {
            "team_id": team_id,
            "user_id": user_id,
            "role": role,
            "is_active": True,
        }

        return await self.create(db, obj_in=member_data)

    async def remove_member(
        self, db: AsyncSession, *, team_id: int, user_id: int
    ) -> Optional[TeamMember]:
        """Удалить участника из команды"""
        member = await self.get_by_team_and_user(db, team_id=team_id, user_id=user_id)
        if not member:
            return None

        member.deactivate()
        await db.commit()
        await db.refresh(member)
        return member

    async def update_member_role(
        self, db: AsyncSession, *, team_id: int, user_id: int, role: TeamRole
    ) -> Optional[TeamMember]:
        """Обновить роль участника"""
        member = await self.get_by_team_and_user(db, team_id=team_id, user_id=user_id)
        if not member or not member.is_active:
            return None

        member.role = role
        await db.commit()
        await db.refresh(member)
        return member

    async def get_members_by_role(
        self, db: AsyncSession, *, team_id: int, role: TeamRole
    ) -> List[TeamMember]:
        """Получить участников команды по роли"""
        stmt = (
            select(self.model)
            .options(selectinload(self.model.user))
            .where(
                and_(
                    self.model.team_id == team_id,
                    self.model.role == role,
                    self.model.is_active == True,
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_member_stats(
        self, db: AsyncSession, *, team_id: Optional[int] = None
    ) -> TeamMemberStats:
        """Получить статистику участников"""
        base_query = select(func.count(self.model.id))

        if team_id:
            base_query = base_query.where(self.model.team_id == team_id)

        # Основные счетчики
        total_stmt = base_query
        active_stmt = base_query.where(self.model.is_active == True)
        inactive_stmt = base_query.where(self.model.is_active == False)

        # Распределение по ролям
        roles_stmt = (
            select(self.model.role, func.count(self.model.id))
            .where(self.model.is_active == True)
            .group_by(self.model.role)
        )

        if team_id:
            roles_stmt = roles_stmt.where(self.model.team_id == team_id)

        # Выполняем запросы
        total = (await db.execute(total_stmt)).scalar() or 0
        active = (await db.execute(active_stmt)).scalar() or 0
        inactive = (await db.execute(inactive_stmt)).scalar() or 0

        roles_result = await db.execute(roles_stmt)
        members_by_role = {role: count for role, count in roles_result.all()}

        return TeamMemberStats(
            total_members=total,
            active_members=active,
            inactive_members=inactive,
            members_by_role=members_by_role,
        )


# Создаем экземпляры CRUD
team = CRUDTeam(Team)
team_member = CRUDTeamMember(TeamMember)
