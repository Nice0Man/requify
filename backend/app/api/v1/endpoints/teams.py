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
        return await team_service.delete_team(db=db, team_id=team_id, user=current_user)
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
    try:
        return await team_service.archive_team(
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
    try:
        return await team_service.restore_team(
            db=db, team_id=team_id, user=current_user
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.get_team_members(
            db=db, team_id=team_id, user=current_user, active_only=active_only
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.add_team_member(
            db=db, team_id=team_id, member_data=member_in, user=current_user
        )
    except (NotFoundError, PermissionDeniedError, BusinessLogicError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.update_team_member(
            db=db,
            team_id=team_id,
            user_id=user_id,
            member_data=member_in,
            current_user=current_user,
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.remove_team_member(
            db=db, team_id=team_id, user_id=user_id, current_user=current_user
        )
    except (NotFoundError, PermissionDeniedError, BusinessLogicError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.change_member_role(
            db=db,
            team_id=team_id,
            user_id=user_id,
            role=role,
            current_user=current_user,
        )
    except (NotFoundError, PermissionDeniedError, BusinessLogicError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.bulk_create_teams(
            db=db, bulk_data=bulk_data, owner=current_user
        )
    except PermissionDeniedError:
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.bulk_add_members(
            db=db, team_id=team_id, bulk_data=bulk_data, current_user=current_user
        )
    except (NotFoundError, PermissionDeniedError):
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.get_team_stats(
            db=db, user=current_user, period=period
        )
    except PermissionDeniedError:
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
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
    try:
        return await team_service.get_team_member_stats(
            db=db, team_id=team_id, user=current_user
        )
    except PermissionDeniedError:
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
    try:
        return await team_service.check_permission(
            db=db, permission_check=permission_check, current_user=current_user
        )
    except PermissionDeniedError:
        raise
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
