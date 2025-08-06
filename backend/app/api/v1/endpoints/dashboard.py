"""
Dashboard API endpoints - refactored to use dashboard service.
Follows clean architecture principles with separated business logic.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import (,
    get_current_active_user,
    get_dashboard_admin_user,
    get_dashboard_user,
    get_db,
    get_export_user,
    DashboardPermissions,
    get_stats_read_user,
)
    SessionDep,

from app.services.dashboard_service import dashboard_service
from app.core.exceptions import ServiceError
from app.schemas import (
    UserProfileResponse,
    DashboardStats,
    DashboardOverviewStats,
    Notification,
    QuickProject,
    QuickRequirement,
    ActivityItem,
    MyDashboardResponse,
    DashboardNotification as NotificationSchema,
    SystemMetrics,
    TimelineDataPoint,
    DistributionDataPoint,
    ProjectTrendDataPoint,
    TimelineQueryParams,
    DistributionQueryParams,
    UserPreferences,
)
from app.crud import user_preferences, notification, activity

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: UserProfileResponse = Depends(get_stats_read_user),
    db: SessionDep,
):
    """Get comprehensive dashboard statistics"""
    try:
        return await dashboard_service.get_comprehensive_dashboard_data(
            db, current_user.id
        )
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard stats: {str(e)}",
        )


@router.get("/", response_model=DashboardStats)
async def get_dashboard_overview(
    current_user: UserProfileResponse = Depends(get_dashboard_user),
    db: SessionDep,
):
    """Get dashboard overview - same as /stats for backward compatibility"""
    return await get_dashboard_stats(current_user, db)


@router.get("/overview", response_model=DashboardOverviewStats)
async def get_dashboard_overview_stats(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """Get dashboard overview statistics only"""
    try:
        return await dashboard_service.get_overview_stats(db)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get overview stats: {str(e)}",
        )


@router.get("/my-projects", response_model=List[QuickProject])
async def get_my_projects(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    """Get user's projects"""
    try:
        quick_access = await dashboard_service.get_quick_access(db, current_user.id)

        # Apply pagination
        skip = (page - 1) * size
        projects = quick_access.my_projects[skip : skip + size]

        return projects
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get my projects: {str(e)}",
        )


@router.get("/my-requirements", response_model=List[QuickRequirement])
async def get_my_requirements(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """Get user's requirements"""
    try:
        quick_access = await dashboard_service.get_quick_access(db, current_user.id)
        return quick_access.my_requirements
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get my requirements: {str(e)}",
        )


@router.get("/my-activity", response_model=List[ActivityItem])
async def get_my_activity(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
    limit: int = Query(20, ge=1, le=100),
):
    """Get user's activity"""
    try:
        return await dashboard_service.get_recent_activity(
            db, limit=limit, user_id=current_user.id
        )
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get my activity: {str(e)}",
        )


@router.get("/my-notifications", response_model=List[NotificationSchema])
async def get_my_notifications(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
    limit: int = Query(10, ge=1, le=100),
):
    """Get user's notifications"""
    try:
        user_notifications = await notification.get_user_notifications(
            db, user_id=current_user.id, limit=limit
        )

        notification_items = []
        for notif in user_notifications:
            notification_items.append(
                NotificationSchema(
                    id=str(notif.id),
                    type=notif.type,
                    title=notif.title,
                    message=notif.message,
                    action_url=notif.action_url,
                    action_text=notif.action_text,
                    timestamp=notif.created_at.isoformat(),
                    read=notif.is_read,
                    priority=notif.priority or "medium",
                )
            )

        return notification_items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get my notifications: {str(e)}",
        )


@router.get("/activity/recent", response_model=List[ActivityItem])
async def get_recent_dashboard_activity(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
    limit: int = Query(10, ge=1, le=100),
):
    """Get recent dashboard activity"""
    try:
        return await dashboard_service.get_recent_activity(db, limit=limit)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recent activity: {str(e)}",
        )


@router.get("/projects/stats", response_model=Dict[str, Any])
async def get_dashboard_projects_stats(
    current_user: UserProfileResponse = Depends(get_stats_read_user),
    db: SessionDep,
):
    """Get dashboard projects statistics"""
    try:
        overview = await dashboard_service.get_overview_stats(db)
        project_performance = await dashboard_service.get_project_performance(
            db, overview
        )

        return {
            "total_projects": overview.total_projects,
            "active_projects": overview.active_projects,
            "completed_projects": overview.completed_projects,
            "completion_rate": project_performance.completion_rate,
            "on_time_delivery": project_performance.on_time_delivery,
            "quality_score": project_performance.quality_score,
        }
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get projects stats: {str(e)}",
        )


@router.get("/projects/recent", response_model=List[QuickProject])
async def get_recent_projects_dashboard(
    current_user: UserProfileResponse = Depends(get_stats_read_user),
    db: SessionDep,
    limit: int = Query(5, ge=1, le=20),
):
    """Get recent projects for dashboard"""
    try:
        quick_access = await dashboard_service.get_quick_access(db, current_user.id)
        return quick_access.my_projects[:limit]
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recent projects: {str(e)}",
        )


@router.get("/requirements/stats", response_model=Dict[str, Any])
async def get_dashboard_requirements_stats(
    current_user: UserProfileResponse = Depends(get_stats_read_user),
    db: SessionDep,
):
    """Get dashboard requirements statistics"""
    try:
        overview = await dashboard_service.get_overview_stats(db)

        return {
            "total_requirements": overview.total_requirements,
            "pending_requirements": overview.pending_requirements,
            "approved_requirements": overview.approved_requirements,
            "approval_rate": (
                (overview.approved_requirements / overview.total_requirements * 100)
                if overview.total_requirements > 0
                else 0
            ),
        }
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get requirements stats: {str(e)}",
        )


@router.get("/requirements/recent", response_model=List[QuickRequirement])
async def get_recent_requirements_dashboard(
    current_user: UserProfileResponse = Depends(get_stats_read_user),
    db: SessionDep,
    limit: int = Query(5, ge=1, le=20),
):
    """Get recent requirements for dashboard"""
    try:
        quick_access = await dashboard_service.get_quick_access(db, current_user.id)
        return quick_access.my_requirements[:limit]
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recent requirements: {str(e)}",
        )


@router.get("/health", response_model=Dict[str, str])
async def get_dashboard_health(
    current_user: UserProfileResponse = Depends(AdminPermissions.analytics()),
    db: SessionDep,
):
    """Get dashboard health status"""
    return {"status": "healthy", "service": "dashboard"}


@router.get("/metrics", response_model=Dict[str, Any])
async def get_dashboard_metrics(
    current_user: UserProfileResponse = Depends(AdminPermissions.analytics()),
    db: SessionDep,
):
    """Get dashboard metrics"""
    try:
        overview = await dashboard_service.get_overview_stats(db)
        trending = await dashboard_service.get_trending_metrics(db)
        performance = await dashboard_service.get_project_performance(db, overview)

        return {
            "overview": overview.model_dump(),
            "trending": trending.model_dump(),
            "performance": performance.model_dump(),
            "timestamp": datetime.now().isoformat(),
        }
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard metrics: {str(e)}",
        )


@router.get("/search", response_model=Dict[str, Any])
async def search_dashboard(
    query: str = Query(..., min_length=1),
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """Search across dashboard items"""
    try:
        results = await dashboard_service.search_dashboard(db, query, current_user.id)
        return results
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search dashboard: {str(e)}",
        )


@router.get("/filter", response_model=Dict[str, Any])
async def filter_dashboard(
    status: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """Filter dashboard items by various criteria"""
    try:
        # Парсим даты если они предоставлены
        parsed_date_from = None
        parsed_date_to = None

        if date_from:
            try:
                parsed_date_from = datetime.fromisoformat(
                    date_from.replace("Z", "+00:00")
                )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_from format. Use ISO format.",
                )

        if date_to:
            try:
                parsed_date_to = datetime.fromisoformat(date_to.replace("Z", "+00:00"))
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_to format. Use ISO format.",
                )

        results = await dashboard_service.filter_dashboard(
            db,
            status=status,
            project_id=project_id,
            user_id=current_user.id,
            date_from=parsed_date_from,
            date_to=parsed_date_to,
        )
        return results
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to filter dashboard: {str(e)}",
        )


@router.get("/export/stats", response_model=Dict[str, Any])
async def export_dashboard_stats(
    current_user: UserProfileResponse = Depends(get_export_user),
    db: SessionDep,
):
    """Export dashboard statistics"""
    try:
        overview = await dashboard_service.get_overview_stats(db)
        performance = await dashboard_service.get_project_performance(db, overview)
        trending = await dashboard_service.get_trending_metrics(db)

        return {
            "overview": overview.model_dump(),
            "performance": performance.model_dump(),
            "trending": trending.model_dump(),
            "exported_at": datetime.now().isoformat(),
            "exported_by": current_user.username,
        }
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export dashboard stats: {str(e)}",
        )


@router.get("/export/activity", response_model=Dict[str, Any])
async def export_dashboard_activity(
    current_user: UserProfileResponse = Depends(get_export_user),
    db: SessionDep,
    limit: int = Query(100, ge=1, le=1000),
):
    """Export dashboard activity"""
    try:
        recent_activity = await dashboard_service.get_recent_activity(db, limit=limit)

        return {
            "activity": [item.model_dump() for item in recent_activity],
            "total": len(recent_activity),
            "exported_at": datetime.now().isoformat(),
            "exported_by": current_user.username,
        }
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export dashboard activity: {str(e)}",
        )


@router.get("/my-dashboard", response_model=MyDashboardResponse)
async def get_my_dashboard(
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """Get user's personalized dashboard"""
    try:
        return await dashboard_service.get_personalized_dashboard(db, current_user.id)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user dashboard: {str(e)}",
        )


@router.get("/activity", response_model=List[ActivityItem])
async def get_dashboard_activity(
    limit: int = Query(20, ge=1, le=100),
    types: Optional[List[str]] = Query(None),
    project_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """Get dashboard activity with filtering"""
    try:
        activities = await activity.get_recent_activities(
            db,
            user_id=user_id,
            project_id=project_id,
            activity_types=types,
            limit=limit,
        )

        activity_items = []
        for act in activities:
            activity_items.append(
                ActivityItem(
                    id=f"activity_{act.id}",
                    type=act.entity_type or "general",
                    title=act.activity_title,
                    description=act.activity_description or "",
                    timestamp=act.created_at.isoformat(),
                    user_name=act.user_name,
                    project_name=(
                        act.entity_name if act.entity_type == "project" else ""
                    ),
                    status=act.status,
                    priority=act.priority,
                )
            )

        return activity_items

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard activity: {str(e)}",
        )


@router.post("/preferences")
async def update_user_preferences(
    preferences_data: UserPreferences,
    current_user: UserProfileResponse = Depends(get_current_active_user),
    db: SessionDep,
):
    """Update user dashboard preferences"""
    try:
        updated_preferences = await user_preferences.create_or_update_preferences(
            db, user_id=current_user.id, preferences_data=preferences_data
        )

        return {
            "message": "Preferences updated successfully",
            "preferences_id": updated_preferences.id,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}",
        )


@router.post("/notifications")
async def create_notification(
    notification_data: Notification,
    current_user: UserProfileResponse = Depends(AdminPermissions.analytics()),
    db: SessionDep,
):
    """Create a new dashboard notification"""
    try:
        new_notification = await notification.create_notification(
            db,
            user_id=notification_data.get("user_id", current_user.id),
            notification_type=notification_data["type"],
            title=notification_data["title"],
            message=notification_data["message"],
            action_url=notification_data.get("action_url"),
            action_text=notification_data.get("action_text"),
            priority=notification_data.get("priority", "medium"),
            project_id=notification_data.get("project_id"),
            requirement_id=notification_data.get("requirement_id"),
        )

        return {
            "message": "Notification created successfully",
            "notification_id": new_notification.id,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}",
        )


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: UserProfileResponse = Depends(get_current_active_user),
    db: SessionDep,
):
    """Mark a notification as read"""
    try:
        updated_notification = await notification.mark_as_read(
            db, notification_id=notification_id, user_id=current_user.id
        )

        if not updated_notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
            )

        return {"message": "Notification marked as read"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}",
        )


@router.post("/activity")
async def create_activity_record(
    activity_data: Dict[str, Any],
    current_user: UserProfileResponse = Depends(get_current_active_user),
    db: SessionDep,
):
    """Create a new activity record"""
    try:
        new_activity = await activity.create_activity(
            db,
            activity_type=activity_data["activity_type"],
            activity_title=activity_data["activity_title"],
            user_id=current_user.id,
            user_name=current_user.name or current_user.username,
            activity_description=activity_data.get("activity_description"),
            project_id=activity_data.get("project_id"),
            requirement_id=activity_data.get("requirement_id"),
            entity_type=activity_data.get("entity_type"),
            entity_id=activity_data.get("entity_id"),
            entity_name=activity_data.get("entity_name"),
            status=activity_data.get("status"),
            priority=activity_data.get("priority"),
            extra_data=activity_data.get("extra_data"),
        )

        return {
            "message": "Activity recorded successfully",
            "activity_id": new_activity.id,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create activity record: {str(e)}",
        )


@router.get("/metrics/system", response_model=SystemMetrics)
async def get_system_metrics(
    current_user: UserProfileResponse = Depends(AdminPermissions.analytics()),
    db: SessionDep,
):
    """
    Get real system metrics (enhanced version)
    Returns comprehensive system performance metrics including CPU, memory, disk usage, etc.
    """
    try:
        return await dashboard_service.get_system_metrics(db)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system metrics: {str(e)}",
        )


@router.get("/charts/timeline", response_model=List[TimelineDataPoint])
async def get_timeline_data(
    params: TimelineQueryParams = Depends(),
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """
    Get timeline chart data with comprehensive filtering

    Query Parameters:
    - period: Time period ('7d', '30d', '90d', '6m', '1y')
    - project_id: Filter by specific project
    - status: Filter by requirement status ('draft', 'active', 'completed', 'cancelled')
    - priority: Filter by priority ('low', 'medium', 'high', 'critical')
    - type: Filter by requirement type ('functional', 'non_functional', 'constraint')
    - assignee_id: Filter by assignee user ID
    - team_id: Filter by team ID
    - granularity: Timeline granularity ('day', 'week', 'month')
    - include_archived: Include archived requirements (default: false)

    Returns time-series data for requirement activity trends
    """
    try:
        return await dashboard_service.get_timeline_data(db, params)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get timeline data: {str(e)}",
        )


@router.get("/charts/distribution", response_model=List[DistributionDataPoint])
async def get_distribution_data(
    params: DistributionQueryParams = Depends(),
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """
    Get distribution chart data with comprehensive filtering

    Query Parameters:
    - period: Time period ('7d', '30d', '90d', '1y')
    - status: Filter by project status ('active', 'completed', 'on_hold', 'cancelled')
    - team_id: Filter by team ID
    - user_id: Filter by user/owner ID
    - page: Pagination page number (default: 1)
    - limit: Items per page (default: 20, max: 100)
    - sort: Sort field ('created_at', 'updated_at', 'name', 'progress')
    - order: Sort order ('asc', 'desc')

    Returns distribution data for project metrics (status, types, etc.)
    """
    try:
        return await dashboard_service.get_distribution_data(db, params)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get distribution data: {str(e)}",
        )


@router.get("/charts/project-trends", response_model=List[ProjectTrendDataPoint])
async def get_project_trends(
    period: str = Query("12m", description="Time period for trends (6m, 12m, 24m)"),
    current_user: UserProfileResponse = Depends(get_dashboard_read_user),
    db: SessionDep,
):
    """
    Get project trends data over specified period
    Returns monthly trend data showing project creation patterns and changes
    """
    try:
        return await dashboard_service.get_project_trends(db, period)
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project trends: {str(e)}",
        )


# Create router instance
dashboard_router = router
