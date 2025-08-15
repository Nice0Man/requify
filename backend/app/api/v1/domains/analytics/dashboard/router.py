"""
Analytics Dashboard Router.

Handles dashboard analytics operations including real-time metrics,
KPI calculations, and dashboard widget management.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.dashboard_service import DashboardService
from app.services.analytics_service import AnalyticsService
from .schemas import (
    DashboardOverviewResponse,
    DashboardWidgetResponse,
    DashboardMetricsResponse,
    DashboardKPIResponse,
    DashboardConfigRequest,
    DashboardConfigResponse,
    DashboardFilterRequest,
    DashboardExportRequest,
    DashboardExportResponse,
    DashboardOperationResponse,
)

# Initialize services
dashboard_service = DashboardService()
analytics_service = AnalyticsService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Dashboard Overview
# =============================================================================


@router.get(
    "/overview",
    summary="Get Dashboard Overview",
    description="Get comprehensive dashboard overview with key metrics",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_DASHBOARD, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=DashboardOverviewResponse,
)
async def get_dashboard_overview(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    period: str = Query("last_30_days", description="Time period filter"),
):
    """
    Получение общего обзора дашборда.

    Доступ: COMPANY_VIEWER+
    """
    try:
        overview_data = await dashboard_service.get_dashboard_overview(
            db=db,
            user=current_user,
            project_id=project_id,
            period=period,
        )

        return DashboardOverviewResponse(
            user_id=current_user.id,
            period=period,
            project_id=project_id,
            overview_data=overview_data,
            generated_at=overview_data.get("generated_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get dashboard overview: {str(e)}",
        )


@router.get(
    "/metrics",
    summary="Get Dashboard Metrics",
    description="Get real-time dashboard metrics and KPIs",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_ANALYTICS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=DashboardMetricsResponse,
)
async def get_dashboard_metrics(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    metric_types: List[str] = Query(
        ["projects", "requirements", "quality"], description="Types of metrics to retrieve"
    ),
    period: str = Query("last_7_days", description="Time period for metrics"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
):
    """
    Получение метрик дашборда в реальном времени.

    Доступ: ANALYTICS_VIEWER+
    """
    try:
        metrics_data = await analytics_service.get_dashboard_metrics(
            db=db,
            user=current_user,
            metric_types=metric_types,
            period=period,
            project_id=project_id,
        )

        return DashboardMetricsResponse(
            user_id=current_user.id,
            period=period,
            project_id=project_id,
            metric_types=metric_types,
            metrics=metrics_data,
            generated_at=metrics_data.get("generated_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get dashboard metrics: {str(e)}",
        )


@router.get(
    "/widgets",
    summary="Get Dashboard Widgets",
    description="Get user's dashboard widgets configuration",
    response_model=List[DashboardWidgetResponse],
)
async def get_dashboard_widgets(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    widget_type: Optional[str] = Query(None, description="Filter by widget type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
):
    """
    Получение виджетов дашборда пользователя.

    Доступ: Аутентифицированные пользователи
    """
    try:
        widgets = await dashboard_service.get_user_widgets(
            db=db,
            user_id=current_user.id,
            widget_type=widget_type,
            is_active=is_active,
        )

        return [
            DashboardWidgetResponse(
                id=widget.id,
                name=widget.name,
                widget_type=widget.widget_type,
                position=widget.position,
                size=widget.size,
                config=widget.config,
                is_active=widget.is_active,
                created_at=widget.created_at,
                updated_at=widget.updated_at,
            )
            for widget in widgets
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get dashboard widgets: {str(e)}",
        )


@router.get(
    "/config",
    summary="Get Dashboard Configuration",
    description="Get user's dashboard configuration",
    response_model=DashboardConfigResponse,
)
async def get_dashboard_config(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение конфигурации дашборда пользователя.

    Доступ: Аутентифицированные пользователи
    """
    try:
        config = await dashboard_service.get_user_dashboard_config(
            db=db, user_id=current_user.id
        )

        return DashboardConfigResponse(
            user_id=current_user.id,
            layout=config.get("layout", "grid"),
            theme=config.get("theme", "light"),
            refresh_interval=config.get("refresh_interval", 30),
            filters=config.get("filters", {}),
            widgets_order=config.get("widgets_order", []),
            preferences=config.get("preferences", {}),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get dashboard config: {str(e)}",
        )