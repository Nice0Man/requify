"""
API endpoints for team management.
"""

from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.exceptions import (
    BusinessLogicError,
    NotFoundError,
    PermissionDeniedError,
    ValidationError,
)
from app.crud import team as crud_team
from app.crud import team_member as crud_team_member
from app.models.constants import TeamRole, TeamStatus
from app.models.user import User
from app.schemas.team import (
    TeamBulkCreate,
    TeamBulkDelete,
    TeamBulkUpdate,
    TeamCreate,
    TeamDetailResponse,
    TeamListResponse,
    TeamMemberBulkAdd,
    TeamMemberBulkRemove,
    TeamMemberBulkUpdate,
    TeamMemberCreate,
    TeamMemberResponse,
    TeamMemberStats,
    TeamMemberUpdate,
    TeamPermissionCheck,
    TeamPermissionResponse,
    TeamResponse,
    TeamSearchRequest,
    TeamStats,
    TeamUpdate,
)

router = APIRouter()


# Utility functions
async def get_team_or_404(db: AsyncSession, team_id: int, load_members: bool = False):
    """Получить команду или вернуть 404"""
    if load_members:
        team = await crud_team.get_with_members(db, team_id=team_id)
    else:
        team = await crud_team.get(db, id=team_id)

    if not team:
        raise NotFoundError("team", team_id)
    return team


async def check_team_permission(
    db: AsyncSession, team_id: int, user_id: int, permission: str
) -> bool:
    """Проверить разрешение пользователя для команды"""
    team = await get_team_or_404(db, team_id)

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


async def require_team_permission(
    db: AsyncSession, team_id: int, user_id: int, permission: str
):
    """Требовать разрешение для команды или выбросить исключение"""
    has_permission = await check_team_permission(db, team_id, user_id, permission)
    if not has_permission:
        raise PermissionDeniedError("team_operation", "team")


# Team endpoints
@router.get("/", response_model=TeamListResponse, summary="Получить список команд")
async def get_teams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    query: Optional[str] = Query(None),
    status: Optional[TeamStatus] = Query(None),
    is_public: Optional[bool] = Query(None),
    owner_id: Optional[int] = Query(None),
    my_teams: bool = Query(False, description="Только команды пользователя"),
):
    """
    Получить список команд с фильтрацией и пагинацией.
    """
    if my_teams:
        teams = await crud_team.get_user_teams(
            db, user_id=current_user.id, skip=skip, limit=limit
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


@router.post("/", response_model=TeamResponse, summary="Создать команду")
async def create_team(
    team_in: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Создать новую команду.
    Пользователь автоматически становится владельцем и участником с ролью OWNER.
    Требует роль senior_developer или выше.
    """
    # Проверяем права на создание команды
    allowed_roles = ["admin", "manager", "senior_developer", "product_manager", "owner"]
    if current_user.role not in allowed_roles:
        raise PermissionDeniedError("create_team", "user")

    try:
        team = await crud_team.create_with_owner(
            db, obj_in=team_in, owner_id=current_user.id
        )
        return team
    except ValueError as e:
        raise BusinessLogicError(str(e))


@router.get("/{team_id}", response_model=TeamDetailResponse, summary="Получить команду")
async def get_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить детальную информацию о команде.
    """
    team = await get_team_or_404(db, team_id, load_members=True)

    # Проверяем права доступа
    if not team.is_public:
        await require_team_permission(db, team_id, current_user.id, "read")

    return team


@router.put("/{team_id}", response_model=TeamResponse, summary="Обновить команду")
async def update_team(
    team_id: int,
    team_in: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Обновить информацию о команде.
    Требует права управления настройками команды.
    """
    team = await get_team_or_404(db, team_id)
    await require_team_permission(db, team_id, current_user.id, "manage_settings")

    updated_team = await crud_team.update(db, db_obj=team, obj_in=team_in)
    return updated_team


@router.delete("/{team_id}", summary="Удалить команду")
async def delete_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Удалить команду.
    Только владелец команды может удалить её.
    """
    team = await get_team_or_404(db, team_id)

    if team.owner_id != current_user.id:
        raise PermissionDeniedError("delete_team", "team")

    await crud_team.remove(db, id=team_id)
    return {"message": "Команда успешно удалена"}


@router.post(
    "/{team_id}/archive", response_model=TeamResponse, summary="Архивировать команду"
)
async def archive_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Архивировать команду.
    Требует права управления настройками команды.
    """
    await require_team_permission(db, team_id, current_user.id, "manage_settings")

    team = await crud_team.archive_team(db, team_id=team_id)
    if not team:
        raise NotFoundError("team", team_id)

    return team


@router.post(
    "/{team_id}/restore", response_model=TeamResponse, summary="Восстановить команду"
)
async def restore_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Восстановить команду из архива.
    Требует права управления настройками команды.
    """
    await require_team_permission(db, team_id, current_user.id, "manage_settings")

    team = await crud_team.restore_team(db, team_id=team_id)
    if not team:
        raise NotFoundError("team", team_id)

    return team


# Team member endpoints
@router.get(
    "/{team_id}/members",
    response_model=List[TeamMemberResponse],
    summary="Получить участников команды",
)
async def get_team_members(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    active_only: bool = Query(True),
):
    """
    Получить список участников команды.
    """
    team = await get_team_or_404(db, team_id)

    # Проверяем права доступа
    if not team.is_public:
        await require_team_permission(db, team_id, current_user.id, "read")

    members = await crud_team_member.get_team_members(
        db, team_id=team_id, active_only=active_only
    )

    return members


@router.post(
    "/{team_id}/members",
    response_model=TeamMemberResponse,
    summary="Добавить участника в команду",
)
async def add_team_member(
    team_id: int,
    member_in: TeamMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Добавить участника в команду.
    Требует права управления участниками.
    """
    team = await get_team_or_404(db, team_id)
    await require_team_permission(db, team_id, current_user.id, "manage_members")

    # Проверяем ограничения команды
    if not team.can_add_member():
        if team.status != TeamStatus.ACTIVE:
            raise BusinessLogicError("Нельзя добавить участника в неактивную команду")
        if team.is_full:
            raise BusinessLogicError("Команда уже заполнена до максимума")

    try:
        member = await crud_team_member.add_member(
            db, team_id=team_id, user_id=member_in.user_id, role=member_in.role
        )
        return member
    except ValueError as e:
        raise BusinessLogicError(str(e))


@router.put(
    "/{team_id}/members/{user_id}",
    response_model=TeamMemberResponse,
    summary="Обновить участника команды",
)
async def update_team_member(
    team_id: int,
    user_id: int,
    member_in: TeamMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Обновить информацию об участнике команды.
    Требует права управления участниками.
    """
    await require_team_permission(db, team_id, current_user.id, "manage_members")

    member = await crud_team_member.get_by_team_and_user(
        db, team_id=team_id, user_id=user_id
    )
    if not member:
        raise NotFoundError("team_member", f"team_id={team_id}, user_id={user_id}")

    updated_member = await crud_team_member.update(db, db_obj=member, obj_in=member_in)
    return updated_member


@router.delete("/{team_id}/members/{user_id}", summary="Удалить участника из команды")
async def remove_team_member(
    team_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Удалить участника из команды.
    Требует права управления участниками или пользователь удаляет себя.
    """
    team = await get_team_or_404(db, team_id)

    # Проверяем права
    if user_id != current_user.id:
        await require_team_permission(db, team_id, current_user.id, "manage_members")

    # Нельзя удалить владельца команды
    if user_id == team.owner_id:
        raise BusinessLogicError("Нельзя удалить владельца команды")

    member = await crud_team_member.remove_member(db, team_id=team_id, user_id=user_id)
    if not member:
        raise NotFoundError("team_member", f"team_id={team_id}, user_id={user_id}")

    return {"message": "Участник успешно удален из команды"}


@router.post(
    "/{team_id}/members/{user_id}/role",
    response_model=TeamMemberResponse,
    summary="Изменить роль участника",
)
async def change_member_role(
    team_id: int,
    user_id: int,
    role: TeamRole,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Изменить роль участника команды.
    Требует права управления участниками.
    """
    await require_team_permission(db, team_id, current_user.id, "manage_members")

    # Нельзя изменить роль владельца команды
    team = await get_team_or_404(db, team_id)
    if user_id == team.owner_id and role != TeamRole.OWNER:
        raise BusinessLogicError("Нельзя изменить роль владельца команды")

    member = await crud_team_member.update_member_role(
        db, team_id=team_id, user_id=user_id, role=role
    )
    if not member:
        raise NotFoundError("team_member", f"team_id={team_id}, user_id={user_id}")

    return member


# Bulk operations
@router.post(
    "/bulk/create",
    response_model=List[TeamResponse],
    summary="Массовое создание команд",
)
async def bulk_create_teams(
    bulk_data: TeamBulkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Создать несколько команд одновременно.
    Требует роль manager или выше.
    """
    # Проверяем права на массовое создание команд (более строгие права)
    allowed_roles = ["admin", "manager", "product_manager"]
    if current_user.role not in allowed_roles:
        raise PermissionDeniedError("bulk_create_teams", "user")

    created_teams = []

    for team_data in bulk_data.teams:
        try:
            team = await crud_team.create_with_owner(
                db, obj_in=team_data, owner_id=current_user.id
            )
            created_teams.append(team)
        except ValueError as e:
            # Пропускаем команды с ошибками
            continue

    return created_teams


@router.post(
    "/{team_id}/members/bulk/add",
    response_model=List[TeamMemberResponse],
    summary="Массовое добавление участников",
)
async def bulk_add_members(
    team_id: int,
    bulk_data: TeamMemberBulkAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Добавить несколько участников в команду одновременно.
    """
    team = await get_team_or_404(db, team_id)
    await require_team_permission(db, team_id, current_user.id, "manage_members")

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


# Statistics endpoints
@router.get("/stats/overview", response_model=TeamStats, summary="Статистика команд")
async def get_team_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить общую статистику команд.
    """
    # Простая проверка прав - только администраторы могут видеть общую статистику
    if current_user.role not in ["admin", "manager"]:
        raise PermissionDeniedError("view_team_stats", "team")

    stats = await crud_team.get_team_stats(db)
    return stats


@router.get(
    "/{team_id}/stats",
    response_model=TeamMemberStats,
    summary="Статистика участников команды",
)
async def get_team_member_stats(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить статистику участников команды.
    """
    await require_team_permission(db, team_id, current_user.id, "read")

    stats = await crud_team_member.get_member_stats(db, team_id=team_id)
    return stats


# Permission endpoints
@router.post(
    "/permissions/check",
    response_model=TeamPermissionResponse,
    summary="Проверить права доступа",
)
async def check_permission(
    permission_check: TeamPermissionCheck,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Проверить права доступа пользователя к команде.
    """
    # Можно проверить только свои права или права других (если есть соответствующие разрешения)
    if permission_check.user_id != current_user.id:
        await require_team_permission(
            db, permission_check.team_id, current_user.id, "manage_members"
        )

    has_permission = await check_team_permission(
        db,
        permission_check.team_id,
        permission_check.user_id,
        permission_check.permission,
    )

    # Получаем дополнительную информацию
    team = await get_team_or_404(db, permission_check.team_id)
    member = await crud_team_member.get_by_team_and_user(
        db, team_id=permission_check.team_id, user_id=permission_check.user_id
    )

    return TeamPermissionResponse(
        has_permission=has_permission,
        user_role=member.role if member else None,
        is_member=member is not None and member.is_active,
        is_owner=team.owner_id == permission_check.user_id,
    )
