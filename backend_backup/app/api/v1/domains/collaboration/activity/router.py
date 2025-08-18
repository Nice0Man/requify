"""
Activity Management Router.

Роутер для работы с активностью пользователей.
"""

from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query

from app.api.dependencies import SessionDep, CurrentUserDep
from app.services.activity_service import activity_service, ActivityType
from .schemas import (
    ActivityTypeEnum,
    ActivityFeedResponse,
    ActivityStatisticsResponse,
    ActivityFilterRequest,
)

router = APIRouter()


@router.get(
    "/feed",
    response_model=ActivityFeedResponse,
    summary="Get Activity Feed",
    description="Get user's activity feed",
)
async def get_activity_feed(
    db: SessionDep,
    current_user: CurrentUserDep,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    activity_types: Optional[List[ActivityTypeEnum]] = Query(
        None, description="Filter by activity types"
    ),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
):
    """
    Получить ленту активности пользователя.
    """
    # Конвертируем типы активности
    activity_type_values = None
    if activity_types:
        activity_type_values = [ActivityType(at.value) for at in activity_types]

    result = await activity_service.get_user_activity_feed(
        db=db,
        user=current_user,
        page=page,
        size=size,
        activity_types=activity_type_values,
        start_date=start_date,
        end_date=end_date,
    )

    return ActivityFeedResponse(
        activities=result["activities"],
        total=result["total"],
        page=result["page"],
        pages=result["pages"],
        size=result["size"],
    )


@router.get(
    "/projects/{project_id}/feed",
    response_model=List,
    summary="Get Project Activity Feed",
    description="Get activity feed for a specific project",
)
async def get_project_activity_feed(
    project_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
    limit: int = Query(20, ge=1, le=100, description="Number of activities to return"),
    activity_types: Optional[List[ActivityTypeEnum]] = Query(
        None, description="Filter by activity types"
    ),
):
    """
    Получить ленту активности для проекта.
    """
    # Конвертируем типы активности
    activity_type_values = None
    if activity_types:
        activity_type_values = [ActivityType(at.value) for at in activity_types]

    activities = await activity_service.get_project_activity_feed(
        db=db,
        project_id=project_id,
        user=current_user,
        limit=limit,
        activity_types=activity_type_values,
    )

    return activities


@router.get(
    "/recent",
    response_model=List,
    summary="Get Recent Activity",
    description="Get user's recent activity",
)
async def get_recent_activity(
    db: SessionDep,
    current_user: CurrentUserDep,
    limit: int = Query(10, ge=1, le=50, description="Number of activities to return"),
):
    """
    Получить последнюю активность пользователя.
    """
    activities = await activity_service.get_recent_activity(
        db=db,
        user=current_user,
        limit=limit,
    )

    return activities


@router.get(
    "/statistics",
    response_model=ActivityStatisticsResponse,
    summary="Get Activity Statistics",
    description="Get activity statistics for user",
)
async def get_activity_statistics(
    db: SessionDep,
    current_user: CurrentUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    days: int = Query(30, ge=1, le=365, description="Period in days"),
):
    """
    Получить статистику активности пользователя.
    """
    stats = await activity_service.get_activity_statistics(
        db=db,
        user=current_user,
        project_id=project_id,
        days=days,
    )

    return ActivityStatisticsResponse(
        user_id=stats["user_id"],
        project_id=stats.get("project_id"),
        period_days=stats["period_days"],
        total_activity=stats.get("total_activity", 0),
        total_comments=stats["total_comments"],
        total_requirements=stats["total_requirements"],
        daily_activity=stats["daily_activity"],
    )
