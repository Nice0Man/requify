"""
Analytics Reports Router.

Handles analytics reporting operations including business intelligence reports,
data visualization, trend analysis, and automated reporting.
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
from app.services.reporting_service import ReportingService
from app.services.analytics_service import AnalyticsService
from .schemas import (
    AnalyticsReportRequest,
    AnalyticsReportResponse,
    ReportTemplateResponse,
    TrendAnalysisResponse,
    BusinessIntelligenceResponse,
    ReportGenerationResponse,
    ReportListResponse,
    ReportScheduleRequest,
    ReportScheduleResponse,
)

# Initialize services
reporting_service = ReportingService()
analytics_service = AnalyticsService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# # Analytics Reports Generation
# 

@router.get(
    "/",
    summary="Get Analytics Reports",
    description="Get list of available analytics reports",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_REPORTS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=ReportListResponse,
)
async def get_analytics_reports(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
):
    """
    Получение списка аналитических отчетов.

    Доступ: REPORT_VIEWER+
    """
    try:
        reports = await reporting_service.get_analytics_reports_list(
            db=db,
            skip=skip,
            limit=limit,
            report_type=report_type,
            project_id=project_id,
            current_user=current_user,
        )

        total = len(reports)
        pages = (total + limit - 1) // limit

        return ReportListResponse(
            reports=reports,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get analytics reports: {str(e)}",
        )

@router.post(
    "/generate",
    status_code=status.HTTP_201_CREATED,
    summary="Generate Analytics Report",
    description="Generate new analytics report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.GENERATE_REPORTS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=ReportGenerationResponse,
)
async def generate_analytics_report(
    report_request: AnalyticsReportRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Генерация аналитического отчета.

    Доступ: REPORT_GENERATOR+
    """
    try:
        result = await reporting_service.generate_analytics_report(
            db=db,
            report_type=report_request.report_type,
            parameters=report_request.parameters,
            format=report_request.format,
            period=report_request.period,
            filters=report_request.filters,
            generated_by=current_user.id,
        )

        return ReportGenerationResponse(
            success=True,
            report_id=result["report_id"],
            download_url=result["download_url"],
            format=report_request.format,
            file_size_bytes=result.get("file_size_bytes", 0),
            estimated_completion=result.get("estimated_completion"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate analytics report: {str(e)}",
        )
