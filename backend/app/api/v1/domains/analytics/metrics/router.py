"""
Analytics Metrics Router.

Handles metrics collection and analysis operations including
custom metrics definition, real-time metrics tracking, and aggregation.
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
from app.services.analytics_service import AnalyticsService
from .schemas import (
    MetricDefinitionRequest,
    MetricDefinitionResponse,
    MetricValueRequest,
    MetricValueResponse,
    MetricAggregationRequest,
    MetricAggregationResponse,
    MetricListResponse,
    MetricOperationResponse,
    CustomMetricRequest,
    CustomMetricResponse,
)

# Initialize services
analytics_service = AnalyticsService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# # Metrics Definition Management
# 

@router.get(
    "/definitions",
    summary="Get Metric Definitions",
    description="Get list of metric definitions",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_METRICS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=MetricListResponse,
)
async def get_metric_definitions(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
):
    """
    Получение списка определений метрик.

    Доступ: METRICS_VIEWER+
    """
    try:
        definitions = await metrics_service.get_metric_definitions(
            db=db,
            skip=skip,
            limit=limit,
            category=category,
            is_active=is_active,
            current_user=current_user,
        )

        total = len(definitions)
        pages = (total + limit - 1) // limit

        return MetricListResponse(
            metrics=definitions,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get metric definitions: {str(e)}",
        )
