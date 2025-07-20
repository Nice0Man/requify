"""
Сервис управления командами.

Отвечает за бизнес-логику команд, управление участниками,
проверку прав доступа и статистику команд.
Следует принципам SOLID и современным практикам.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import team as crud_team, team_member as crud_team_member
from app.models.user import User
from app.models.constants import TeamRole, TeamStatus
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamDetailResponse,
    TeamListResponse,
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamMemberResponse,
    TeamSearchRequest,
    TeamStats,
    TeamMemberStats,
    TeamBulkCreate,
    TeamMemberBulkAdd,
    TeamPermissionCheck,
    TeamPermissionResponse,
)
from app.core.exceptions import (
    ServiceError,
    NotFoundError,
    PermissionDeniedError,
    BusinessLogicError,
    ValidationError,
)

logger = logging.getLogger(__name__)


class TeamService:
    """
    Сервис управления командами.

    Реализует принципы SOLID:
    - Single Responsibility: отвечает только за логику команд
    - Open/Closed: легко расширяется новыми функциями
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: разделены интерфейсы для разных операций
    - Dependency Inversion: зависит от абстракций CRUD
    """

    @staticmethod
    async def get_team_or_404(
        db: AsyncSession, team_id: int, load_members: bool = False
    ) -> Any:
        """
        Получить команду или выбросить исключение 404.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            load_members: Загружать ли участников команды

        Returns:
            Объект команды

        Raises:
            NotFoundError: Если команда не найдена
        """
        try:
            if load_members:
                team = await crud_team.get_with_members(db, team_id=team_id)
            else:
                team = await crud_team.get(db, id=team_id)

            if not team:
                raise NotFoundError("team", team_id)
            return team
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error getting team {team_id}: {e}")
            raise ServiceError("team", f"Failed to get team: {str(e)}")

    @staticmethod
    async def check_team_permission(
        db: AsyncSession, team_id: int, user_id: int, permission: str
    ) -> bool:
        """
        Проверить разрешение пользователя для команды.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user_id: ID пользователя
            permission: Требуемое разрешение

        Returns:
            True если разрешение есть, False иначе
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)

            # Владелец команды имеет все права
            if team.owner_id == user_id:
                return True

            # Проверяем участие в команде
            member = await crud_team_member.get_by_team_and_user(
                db, team_id=team_id, user_id=user_id
            )

            if not member or not member.is_active:
                return False

            return member.has_permission(permission)
        except Exception as e:
            logger.error(f"Error checking team permission: {e}")
            return False

    @staticmethod
    async def require_team_permission(
        db: AsyncSession, team_id: int, user_id: int, permission: str
    ) -> None:
        """
        Требовать разрешение для команды или выбросить исключение.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user_id: ID пользователя
            permission: Требуемое разрешение

        Raises:
            PermissionDeniedError: Если нет разрешения
        """
        has_permission = await TeamService.check_team_permission(
            db, team_id, user_id, permission
        )
        if not has_permission:
            raise PermissionDeniedError("team_operation", "team")

    @staticmethod
    async def check_create_team_permission(user: User) -> None:
        """
        Проверить права на создание команды.

        Args:
            user: Пользователь

        Raises:
            PermissionDeniedError: Если нет прав
        """
        allowed_roles = [
            "admin",
            "manager",
            "senior_developer",
            "product_manager",
            "owner",
        ]
        if user.role not in allowed_roles:
            raise PermissionDeniedError("create_team", "user")

    @staticmethod
    async def check_bulk_create_permission(user: User) -> None:
        """
        Проверить права на массовое создание команд.

        Args:
            user: Пользователь

        Raises:
            PermissionDeniedError: Если нет прав
        """
        allowed_roles = ["admin", "manager", "product_manager"]
        if user.role not in allowed_roles:
            raise PermissionDeniedError("bulk_create_teams", "user")

    @staticmethod
    async def check_view_stats_permission(user: User) -> None:
        """
        Проверить права на просмотр статистики команд.

        Args:
            user: Пользователь

        Raises:
            PermissionDeniedError: Если нет прав
        """
        # Временно расширяем доступ для отладки
        allowed_roles = ["admin", "manager", "analyst", "developer", "user"]
        if user.role not in allowed_roles:
            logger.warning(
                f"User {user.username} with role {user.role} tried to access team stats"
            )
            raise PermissionDeniedError("view_team_stats", "team")

    @staticmethod
    async def get_teams_list(
        db: AsyncSession,
        user: User,
        skip: int = 0,
        limit: int = 20,
        query: Optional[str] = None,
        status: Optional[TeamStatus] = None,
        is_public: Optional[bool] = None,
        owner_id: Optional[int] = None,
        my_teams: bool = False,
    ) -> TeamListResponse:
        """
        Получить список команд с фильтрацией.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            skip: Количество пропускаемых записей
            limit: Лимит записей
            query: Поисковой запрос
            status: Фильтр по статусу
            is_public: Фильтр по публичности
            owner_id: Фильтр по владельцу
            my_teams: Только команды пользователя

        Returns:
            Список команд с пагинацией
        """
        try:
            if my_teams:
                teams = await crud_team.get_user_teams(
                    db, user_id=user.id, skip=skip, limit=limit
                )
                total = len(teams)
                return TeamListResponse(
                    teams=teams,
                    total=total,
                    page=skip // limit + 1,
                    per_page=limit,
                    total_pages=(total + limit - 1) // limit,
                )

            search_params = TeamSearchRequest(
                query=query,
                status=status,
                is_public=is_public,
                owner_id=owner_id,
                page=skip // limit + 1,
                per_page=limit,
            )

            teams, total = await crud_team.search_teams(db, search_params=search_params)

            return TeamListResponse(
                teams=teams,
                total=total,
                page=search_params.page,
                per_page=search_params.per_page,
                total_pages=(total + limit - 1) // limit,
            )
        except Exception as e:
            logger.error(f"Error getting teams list: {e}")
            raise ServiceError("team", f"Failed to get teams list: {str(e)}")

    @staticmethod
    async def create_team(
        db: AsyncSession, team_data: TeamCreate, owner: User
    ) -> TeamResponse:
        """
        Создать новую команду.

        Args:
            db: Сессия базы данных
            team_data: Данные команды
            owner: Владелец команды

        Returns:
            Созданная команда

        Raises:
            ServiceError: При ошибке создания
            PermissionDeniedError: Если нет прав
            BusinessLogicError: При нарушении бизнес-правил
        """
        try:
            await TeamService.check_create_team_permission(owner)

            team = await crud_team.create_with_owner(
                db, obj_in=team_data, owner_id=owner.id
            )
            return team
        except PermissionDeniedError:
            raise
        except ValueError as e:
            raise BusinessLogicError(str(e))
        except Exception as e:
            logger.error(f"Error creating team: {e}")
            raise ServiceError("team", f"Failed to create team: {str(e)}")

    @staticmethod
    async def get_team_detail(
        db: AsyncSession, team_id: int, user: User
    ) -> TeamDetailResponse:
        """
        Получить детальную информацию о команде.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user: Текущий пользователь

        Returns:
            Детальная информация о команде
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id, load_members=True)

            # Проверяем права доступа
            if not team.is_public:
                await TeamService.require_team_permission(db, team_id, user.id, "read")

            return team
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error getting team detail: {e}")
            raise ServiceError("team", f"Failed to get team detail: {str(e)}")

    @staticmethod
    async def update_team(
        db: AsyncSession, team_id: int, team_data: TeamUpdate, user: User
    ) -> TeamResponse:
        """
        Обновить команду.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            team_data: Данные для обновления
            user: Текущий пользователь

        Returns:
            Обновленная команда
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)
            await TeamService.require_team_permission(
                db, team_id, user.id, "manage_settings"
            )

            updated_team = await crud_team.update(db, db_obj=team, obj_in=team_data)
            return updated_team
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error updating team: {e}")
            raise ServiceError("team", f"Failed to update team: {str(e)}")

    @staticmethod
    async def delete_team(db: AsyncSession, team_id: int, user: User) -> Dict[str, str]:
        """
        Удалить команду.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user: Текущий пользователь

        Returns:
            Сообщение об успешном удалении
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)

            if team.owner_id != user.id:
                raise PermissionDeniedError("delete_team", "team")

            await crud_team.remove(db, id=team_id)
            return {"message": "Команда успешно удалена"}
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error deleting team: {e}")
            raise ServiceError("team", f"Failed to delete team: {str(e)}")

    @staticmethod
    async def archive_team(db: AsyncSession, team_id: int, user: User) -> TeamResponse:
        """
        Архивировать команду.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user: Текущий пользователь

        Returns:
            Архивированная команда
        """
        try:
            await TeamService.require_team_permission(
                db, team_id, user.id, "manage_settings"
            )

            team = await crud_team.archive_team(db, team_id=team_id)
            if not team:
                raise NotFoundError("team", team_id)

            return team
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error archiving team: {e}")
            raise ServiceError("team", f"Failed to archive team: {str(e)}")

    @staticmethod
    async def restore_team(db: AsyncSession, team_id: int, user: User) -> TeamResponse:
        """
        Восстановить команду из архива.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user: Текущий пользователь

        Returns:
            Восстановленная команда
        """
        try:
            await TeamService.require_team_permission(
                db, team_id, user.id, "manage_settings"
            )

            team = await crud_team.restore_team(db, team_id=team_id)
            if not team:
                raise NotFoundError("team", team_id)

            return team
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error restoring team: {e}")
            raise ServiceError("team", f"Failed to restore team: {str(e)}")

    @staticmethod
    async def get_team_members(
        db: AsyncSession, team_id: int, user: User, active_only: bool = True
    ) -> List[TeamMemberResponse]:
        """
        Получить участников команды.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user: Текущий пользователь
            active_only: Только активные участники

        Returns:
            Список участников команды
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)

            # Проверяем права доступа
            if not team.is_public:
                await TeamService.require_team_permission(db, team_id, user.id, "read")

            members = await crud_team_member.get_team_members(
                db, team_id=team_id, active_only=active_only
            )

            return members
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error getting team members: {e}")
            raise ServiceError("team", f"Failed to get team members: {str(e)}")

    @staticmethod
    async def add_team_member(
        db: AsyncSession, team_id: int, member_data: TeamMemberCreate, user: User
    ) -> TeamMemberResponse:
        """
        Добавить участника в команду.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            member_data: Данные участника
            user: Текущий пользователь

        Returns:
            Добавленный участник
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)
            await TeamService.require_team_permission(
                db, team_id, user.id, "manage_members"
            )

            # Проверяем ограничения команды
            if not team.can_add_member():
                if team.status != TeamStatus.ACTIVE:
                    raise BusinessLogicError(
                        "Нельзя добавить участника в неактивную команду"
                    )
                if team.is_full:
                    raise BusinessLogicError("Команда уже заполнена до максимума")

            member = await crud_team_member.add_member(
                db, team_id=team_id, user_id=member_data.user_id, role=member_data.role
            )
            return member
        except (NotFoundError, PermissionDeniedError, BusinessLogicError):
            raise
        except ValueError as e:
            raise BusinessLogicError(str(e))
        except Exception as e:
            logger.error(f"Error adding team member: {e}")
            raise ServiceError("team", f"Failed to add team member: {str(e)}")

    @staticmethod
    async def update_team_member(
        db: AsyncSession,
        team_id: int,
        user_id: int,
        member_data: TeamMemberUpdate,
        current_user: User,
    ) -> TeamMemberResponse:
        """
        Обновить участника команды.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user_id: ID пользователя-участника
            member_data: Данные для обновления
            current_user: Текущий пользователь

        Returns:
            Обновленный участник
        """
        try:
            await TeamService.require_team_permission(
                db, team_id, current_user.id, "manage_members"
            )

            member = await crud_team_member.get_by_team_and_user(
                db, team_id=team_id, user_id=user_id
            )
            if not member:
                raise NotFoundError(
                    "team_member", f"team_id={team_id}, user_id={user_id}"
                )

            updated_member = await crud_team_member.update(
                db, db_obj=member, obj_in=member_data
            )
            return updated_member
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error updating team member: {e}")
            raise ServiceError("team", f"Failed to update team member: {str(e)}")

    @staticmethod
    async def remove_team_member(
        db: AsyncSession, team_id: int, user_id: int, current_user: User
    ) -> Dict[str, str]:
        """
        Удалить участника из команды.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user_id: ID пользователя-участника
            current_user: Текущий пользователь

        Returns:
            Сообщение об успешном удалении
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)

            # Проверяем права
            if user_id != current_user.id:
                await TeamService.require_team_permission(
                    db, team_id, current_user.id, "manage_members"
                )

            # Нельзя удалить владельца команды
            if user_id == team.owner_id:
                raise BusinessLogicError("Нельзя удалить владельца команды")

            member = await crud_team_member.remove_member(
                db, team_id=team_id, user_id=user_id
            )
            if not member:
                raise NotFoundError(
                    "team_member", f"team_id={team_id}, user_id={user_id}"
                )

            return {"message": "Участник успешно удален из команды"}
        except (NotFoundError, PermissionDeniedError, BusinessLogicError):
            raise
        except Exception as e:
            logger.error(f"Error removing team member: {e}")
            raise ServiceError("team", f"Failed to remove team member: {str(e)}")

    @staticmethod
    async def change_member_role(
        db: AsyncSession, team_id: int, user_id: int, role: TeamRole, current_user: User
    ) -> TeamMemberResponse:
        """
        Изменить роль участника команды.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user_id: ID пользователя-участника
            role: Новая роль
            current_user: Текущий пользователь

        Returns:
            Участник с новой ролью
        """
        try:
            await TeamService.require_team_permission(
                db, team_id, current_user.id, "manage_members"
            )

            # Нельзя изменить роль владельца команды
            team = await TeamService.get_team_or_404(db, team_id)
            if user_id == team.owner_id and role != TeamRole.OWNER:
                raise BusinessLogicError("Нельзя изменить роль владельца команды")

            member = await crud_team_member.update_member_role(
                db, team_id=team_id, user_id=user_id, role=role
            )
            if not member:
                raise NotFoundError(
                    "team_member", f"team_id={team_id}, user_id={user_id}"
                )

            return member
        except (NotFoundError, PermissionDeniedError, BusinessLogicError):
            raise
        except Exception as e:
            logger.error(f"Error changing member role: {e}")
            raise ServiceError("team", f"Failed to change member role: {str(e)}")

    @staticmethod
    async def bulk_create_teams(
        db: AsyncSession, bulk_data: TeamBulkCreate, owner: User
    ) -> List[TeamResponse]:
        """
        Массовое создание команд.

        Args:
            db: Сессия базы данных
            bulk_data: Данные для массового создания
            owner: Владелец команд

        Returns:
            Список созданных команд
        """
        try:
            await TeamService.check_bulk_create_permission(owner)

            created_teams = []

            for team_data in bulk_data.teams:
                try:
                    team = await crud_team.create_with_owner(
                        db, obj_in=team_data, owner_id=owner.id
                    )
                    created_teams.append(team)
                except ValueError:
                    # Пропускаем команды с ошибками
                    continue

            return created_teams
        except PermissionDeniedError:
            raise
        except Exception as e:
            logger.error(f"Error bulk creating teams: {e}")
            raise ServiceError("team", f"Failed to bulk create teams: {str(e)}")

    @staticmethod
    async def bulk_add_members(
        db: AsyncSession, team_id: int, bulk_data: TeamMemberBulkAdd, current_user: User
    ) -> List[TeamMemberResponse]:
        """
        Массовое добавление участников.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            bulk_data: Данные для массового добавления
            current_user: Текущий пользователь

        Returns:
            Список добавленных участников
        """
        try:
            team = await TeamService.get_team_or_404(db, team_id)
            await TeamService.require_team_permission(
                db, team_id, current_user.id, "manage_members"
            )

            added_members = []

            for user_id in bulk_data.user_ids:
                try:
                    member = await crud_team_member.add_member(
                        db, team_id=team_id, user_id=user_id, role=bulk_data.role
                    )
                    added_members.append(member)
                except ValueError:
                    # Пропускаем пользователей с ошибками
                    continue

            return added_members
        except (NotFoundError, PermissionDeniedError):
            raise
        except Exception as e:
            logger.error(f"Error bulk adding members: {e}")
            raise ServiceError("team", f"Failed to bulk add members: {str(e)}")

    @staticmethod
    async def get_team_stats(
        db: AsyncSession, user: User, period: Optional[str] = None
    ) -> TeamStats:
        """
        Получить статистику команд.

        Args:
            db: Сессия базы данных
            user: Текущий пользователь
            period: Период для статистики

        Returns:
            Статистика команд
        """
        try:
            logger.info(
                f"User {user.username} (role: {user.role}) requesting team stats with period: {period}"
            )

            await TeamService.check_view_stats_permission(user)

            stats = await crud_team.get_team_stats(db)
            return stats
        except PermissionDeniedError:
            raise
        except Exception as e:
            logger.error(f"Error getting team stats: {e}")
            raise ServiceError("team", f"Failed to get team stats: {str(e)}")

    @staticmethod
    async def get_team_member_stats(
        db: AsyncSession, team_id: int, user: User
    ) -> TeamMemberStats:
        """
        Получить статистику участников команды.

        Args:
            db: Сессия базы данных
            team_id: ID команды
            user: Текущий пользователь

        Returns:
            Статистика участников
        """
        try:
            await TeamService.require_team_permission(db, team_id, user.id, "read")

            stats = await crud_team_member.get_member_stats(db, team_id=team_id)
            return stats
        except PermissionDeniedError:
            raise
        except Exception as e:
            logger.error(f"Error getting team member stats: {e}")
            raise ServiceError("team", f"Failed to get team member stats: {str(e)}")

    @staticmethod
    async def check_permission(
        db: AsyncSession, permission_check: TeamPermissionCheck, current_user: User
    ) -> TeamPermissionResponse:
        """
        Проверить права доступа пользователя к команде.

        Args:
            db: Сессия базы данных
            permission_check: Параметры проверки
            current_user: Текущий пользователь

        Returns:
            Результат проверки прав
        """
        try:
            # Можно проверить только свои права или права других (если есть соответствующие разрешения)
            if permission_check.user_id != current_user.id:
                await TeamService.require_team_permission(
                    db, permission_check.team_id, current_user.id, "manage_members"
                )

            has_permission = await TeamService.check_team_permission(
                db,
                permission_check.team_id,
                permission_check.user_id,
                permission_check.permission,
            )

            # Получаем дополнительную информацию
            team = await TeamService.get_team_or_404(db, permission_check.team_id)
            member = await crud_team_member.get_by_team_and_user(
                db, team_id=permission_check.team_id, user_id=permission_check.user_id
            )

            return TeamPermissionResponse(
                has_permission=has_permission,
                user_role=member.role if member else None,
                is_member=member is not None and member.is_active,
                is_owner=team.owner_id == permission_check.user_id,
            )
        except PermissionDeniedError:
            raise
        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            raise ServiceError("team", f"Failed to check permission: {str(e)}")


# Создаем экземпляр сервиса для использования в API
team_service = TeamService()
