"""
API endpoints for team management.
"""

import logging
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
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
from app.services.team_service import team_service

router = APIRouter()

logger = logging.getLogger(__name__)


# Utility functions removed - business logic moved to team_service


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
    try:
        return await team_service.get_teams_list(
            db=db,
            user=current_user,
            skip=skip,
            limit=limit,
            query=query,
            status=status,
            is_public=is_public,
            owner_id=owner_id,
            my_teams=my_teams,
        )
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
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
    try:
        return await team_service.create_team(
            db=db, team_data=team_in, owner=current_user
        )
    except (PermissionDeniedError, BusinessLogicError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/{team_id}", response_model=TeamDetailResponse, summary="Получить команду")
async def get_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить детальную информацию о команде.
    """
    try:
        return await team_service.get_team_detail(
            db=db, team_id=team_id, user=current_user
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.update_team(
            db=db, team_id=team_id, team_data=team_in, user=current_user
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.delete_team(
            db=db, team_id=team_id, user=current_user
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    period: Optional[str] = Query(
        None, description="Period filter (current, last_month, etc.)"
    ),
):
    """
    Получить общую статистику команд.
    """
    logger.info(
        f"User {current_user.username} (role: {current_user.role}) requesting team stats with period: {period}"
    )

    # Проверка прав - только администраторы и пользователи могут видеть общую статистику
    # Временно расширяем доступ для отладки
    allowed_roles = ["admin", "manager", "analyst", "developer", "user"]
    if current_user.role not in allowed_roles:
        logger.warning(
            f"User {current_user.username} with role {current_user.role} tried to access team stats"
        )
        raise PermissionDeniedError("view_team_stats", "team")

    try:
        stats = await crud_team.get_team_stats(db)
        return stats
    except Exception as e:
        logger.error(f"Error getting team stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get team stats: {str(e)}",
        )


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
