"""
Quality Reports Router.

Handles all quality reporting operations including test results,
quality metrics, coverage reports, and defect analysis.
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
from .schemas import (
    TestReportRequest,
    QualityMetricsResponse,
    CoverageReportResponse,
    DefectAnalysisResponse,
    ReportGenerationResponse,
    ReportListResponse,
)

# Initialize services
reporting_service = ReportingService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Test Reports
# =============================================================================


@router.get(
    "/summary",
    summary="Get Test Summary Report",
    description="Get comprehensive test summary report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_REPORTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=QualityMetricsResponse,
)
async def get_test_summary(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    period: str = Query("last_30_days", description="Report period"),
):
    """
    Получение сводного отчета по тестированию.

    Доступ: QA_VIEWER+
    """
    try:
        summary = await reporting_service.generate_test_summary_report(
            db=db,
            project_id=project_id,
            period=period,
            current_user=current_user,
        )

        return QualityMetricsResponse(
            project_id=project_id,
            period=period,
            metrics=summary,
            generated_at=summary.get("generated_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate test summary: {str(e)}",
        )


@router.get(
    "/coverage",
    summary="Get Test Coverage Report",
    description="Get test coverage analysis report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_REPORTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=CoverageReportResponse,
)
async def get_coverage_report(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    coverage_type: str = Query("requirements", description="Coverage type: requirements, code, functional"),
):
    """
    Получение отчета о покрытии тестами.

    Доступ: QA_VIEWER+
    """
    try:
        coverage = await reporting_service.generate_coverage_report(
            db=db,
            project_id=project_id,
            coverage_type=coverage_type,
            current_user=current_user,
        )

        return CoverageReportResponse(
            project_id=project_id,
            coverage_type=coverage_type,
            coverage_data=coverage,
            generated_at=coverage.get("generated_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate coverage report: {str(e)}",
        )


@router.get(
    "/quality-metrics",
    summary="Get Quality Metrics Report",
    description="Get detailed quality metrics report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_QUALITY_METRICS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=QualityMetricsResponse,
)
async def get_quality_metrics(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    period: str = Query("last_30_days", description="Metrics period"),
):
    """
    Получение метрик качества.

    Доступ: QA_LEAD+
    """
    try:
        metrics = await reporting_service.generate_quality_metrics_report(
            db=db,
            project_id=project_id,
            period=period,
            current_user=current_user,
        )

        return QualityMetricsResponse(
            project_id=project_id,
            period=period,
            metrics=metrics,
            generated_at=metrics.get("generated_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate quality metrics: {str(e)}",
        )


@router.get(
    "/defect-analysis",
    summary="Get Defect Analysis Report",
    description="Get defect analysis and trends report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_QUALITY_METRICS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=DefectAnalysisResponse,
)
async def get_defect_analysis(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    period: str = Query("last_30_days", description="Analysis period"),
):
    """
    Получение анализа дефектов.

    Доступ: QA_LEAD+
    """
    try:
        analysis = await reporting_service.generate_defect_analysis_report(
            db=db,
            project_id=project_id,
            period=period,
            current_user=current_user,
        )

        return DefectAnalysisResponse(
            project_id=project_id,
            period=period,
            analysis=analysis,
            generated_at=analysis.get("generated_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate defect analysis: {str(e)}",
        )


# =============================================================================
# Custom Reports Generation
# =============================================================================


@router.post(
    "/generate",
    summary="Generate Custom Report",
    description="Generate custom quality report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.GENERATE_REPORTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=ReportGenerationResponse,
)
async def generate_custom_report(
    report_request: TestReportRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Генерация пользовательского отчета.

    Доступ: QA_ENGINEER+
    """
    try:
        result = await reporting_service.generate_custom_report(
            db=db,
            report_type=report_request.report_type,
            project_id=report_request.project_id,
            parameters=report_request.parameters,
            format=report_request.format,
            include_charts=report_request.include_charts,
            include_recommendations=report_request.include_recommendations,
            generated_by=current_user.id,
        )

        return ReportGenerationResponse(
            success=True,
            report_id=result["report_id"],
            download_url=result["download_url"],
            format=report_request.format,
            file_size_bytes=result.get("file_size_bytes", 0),
            pages_count=result.get("pages_count", 0),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate report: {str(e)}",
        )


@router.get(
    "/",
    summary="Get Reports List",
    description="Get list of generated reports",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_REPORTS, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=ReportListResponse,
)
async def get_reports_list(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
):
    """
    Получение списка сгенерированных отчетов.

    Доступ: QA_VIEWER+
    """
    try:
        reports = await reporting_service.get_reports_list(
            db=db,
            skip=skip,
            limit=limit,
            project_id=project_id,
            report_type=report_type,
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
            detail=f"Failed to get reports list: {str(e)}",
        )


@router.get(
    "/{report_id}/download",
    summary="Download Report",
    description="Download generated report",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_REPORTS, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def download_report(
    report_id: str,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Скачивание сгенерированного отчета.

    Доступ: QA_VIEWER+
    """
    try:
        download_info = await reporting_service.prepare_report_download(
            db=db,
            report_id=report_id,
            current_user=current_user,
        )

        if not download_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        return download_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to prepare download: {str(e)}",
        )


# =============================================================================
# Automation Rate Reports
# =============================================================================


@router.get(
    "/automation-rate",
    summary="Get Automation Rate Report",
    description="Get test automation rate analysis",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_QUALITY_METRICS, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def get_automation_rate(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    period: str = Query("last_30_days", description="Analysis period"),
):
    """
    Получение отчета об уровне автоматизации тестирования.

    Доступ: QA_LEAD+
    """
    try:
        automation_data = await reporting_service.generate_automation_rate_report(
            db=db,
            project_id=project_id,
            period=period,
            current_user=current_user,
        )

        return automation_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate automation rate report: {str(e)}",
        )


# =============================================================================
# Trend Analysis
# =============================================================================


@router.get(
    "/trends",
    summary="Get Quality Trends",
    description="Get quality trends analysis over time",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_QUALITY_METRICS, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def get_quality_trends(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    project_id: Optional[int] = Query(None, description="Filter by project"),
    metric_type: str = Query("all", description="Metric type: all, defects, coverage, performance"),
    period: str = Query("last_90_days", description="Trend period"),
):
    """
    Получение анализа трендов качества.

    Доступ: QA_LEAD+
    """
    try:
        trends = await reporting_service.generate_quality_trends_report(
            db=db,
            project_id=project_id,
            metric_type=metric_type,
            period=period,
            current_user=current_user,
        )

        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate trends report: {str(e)}",
        )
