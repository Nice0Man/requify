"""
System Metrics and Statistics Router.

Роутер для метрик и статистики системы.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.api.dependencies import CurrentUserDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission

from app.api.v1.domains.system.metrics.schemas import (
    SystemMetricsResponse,
    MetricsResponse,
    MetricsRequest,
    ApplicationMetrics,
    ErrorMetrics,
    ErrorDetailsResponse,
    PerformanceMetrics,
    CustomMetricsListResponse,
    TimeRange,
)
from app.services.admin_service import AdminService, admin_service

permission_checker = PermissionChecker()
router = APIRouter()


# === System Metrics ===


@router.get(
    "/system",
    response_model=SystemMetricsResponse,
    summary="Get System Metrics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_system_metrics(current_user: CurrentUserDep):
    """
    Get current system metrics.

    Requires MANAGE_SYSTEM permission.
    Includes performance, resource usage, and database metrics.
    """
    try:
        metrics = await admin_service.get_system_metrics()

        return SystemMetricsResponse(
            # Performance metrics
            response_time_avg=metrics["response_time_avg"],
            response_time_p95=metrics["response_time_p95"],
            response_time_p99=metrics["response_time_p99"],
            requests_per_second=metrics["requests_per_second"],
            error_rate=metrics["error_rate"],
            # Resource usage
            cpu_usage=metrics["cpu_usage"],
            memory_usage=metrics["memory_usage"],
            memory_total=metrics["memory_total"],
            memory_available=metrics["memory_available"],
            disk_usage=metrics["disk_usage"],
            disk_total=metrics["disk_total"],
            disk_free=metrics["disk_free"],
            # Network
            network_bytes_sent=metrics["network_bytes_sent"],
            network_bytes_recv=metrics["network_bytes_recv"],
            active_connections=metrics["active_connections"],
            # Database
            db_connections_active=metrics["db_connections_active"],
            db_connections_idle=metrics["db_connections_idle"],
            db_queries_per_second=metrics["db_queries_per_second"],
            db_slow_queries=metrics["db_slow_queries"],
            db_size=metrics["db_size"],
            # Cache metrics
            cache_hit_rate=metrics.get("cache_hit_rate"),
            cache_memory_usage=metrics.get("cache_memory_usage"),
            cache_operations_per_second=metrics.get("cache_operations_per_second"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system metrics: {str(e)}",
        )


@router.post(
    "/timeseries",
    response_model=MetricsResponse,
    summary="Get Time Series Metrics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_metrics_timeseries(
    request: MetricsRequest,
    *,
    current_user: CurrentUserDep,
):
    """
    Get historical metrics as time series.

    Requires MANAGE_SYSTEM permission.
    Supports custom time ranges and metric selection.
    """
    try:
        metrics_data = await admin_service.get_metrics_timeseries(
            metric_names=request.metric_names,
            time_range=request.time_range,
            resolution=request.resolution,
            start_time=request.start_time,
            end_time=request.end_time,
            labels=request.labels,
        )

        return MetricsResponse(
            series=metrics_data["series"],
            time_range=request.time_range,
            resolution=metrics_data["resolution"],
            generated_at=metrics_data["generated_at"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics timeseries: {str(e)}",
        )


# === Application Metrics ===


@router.get(
    "/application",
    response_model=ApplicationMetrics,
    summary="Get Application Metrics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_application_metrics(
    current_user: CurrentUserDep,
):
    """
    Get application-specific metrics.

    Requires MANAGE_SYSTEM permission.
    Includes user activity, business metrics, and content statistics.
    """
    try:
        metrics = await admin_service.get_application_metrics()

        return ApplicationMetrics(
            # User activity
            active_users_1h=metrics["active_users_1h"],
            active_users_24h=metrics["active_users_24h"],
            new_registrations_24h=metrics["new_registrations_24h"],
            total_sessions=metrics["total_sessions"],
            # Business metrics
            total_users=metrics["total_users"],
            total_companies=metrics["total_companies"],
            total_projects=metrics["total_projects"],
            total_requirements=metrics["total_requirements"],
            # Content metrics
            files_uploaded_24h=metrics["files_uploaded_24h"],
            total_file_size=metrics["total_file_size"],
            comments_created_24h=metrics["comments_created_24h"],
            # API metrics
            api_requests_24h=metrics["api_requests_24h"],
            api_errors_24h=metrics["api_errors_24h"],
            average_api_response_time=metrics["average_api_response_time"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get application metrics: {str(e)}",
        )


# === Error Metrics ===


@router.get(
    "/errors",
    response_model=ErrorMetrics,
    summary="Get Error Metrics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_error_metrics(current_user: CurrentUserDep):
    """
    Get error and exception metrics.

    Requires MANAGE_SYSTEM permission.
    Includes error rates and top error types.
    """
    try:
        metrics = await admin_service.get_error_metrics()

        return ErrorMetrics(
            errors_4xx_24h=metrics["errors_4xx_24h"],
            errors_5xx_24h=metrics["errors_5xx_24h"],
            exceptions_24h=metrics["exceptions_24h"],
            critical_errors_24h=metrics["critical_errors_24h"],
            top_error_types=metrics["top_error_types"],
            top_error_endpoints=metrics["top_error_endpoints"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get error metrics: {str(e)}",
        )


@router.get(
    "/errors/details",
    response_model=ErrorDetailsResponse,
    summary="Get Error Details",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_error_details(
    current_user: CurrentUserDep,
    time_range: TimeRange = Query(TimeRange.DAY, description="Time range for errors"),
    limit: int = Query(50, ge=1, le=500, description="Number of error types to return"),
):
    """
    Get detailed error information.

    Requires MANAGE_SYSTEM permission.
    Provides detailed breakdown of errors with counts and timings.
    """
    try:
        details = await admin_service.get_error_details(
            time_range=time_range,
            limit=limit,
        )

        return ErrorDetailsResponse(
            errors=details["errors"],
            total=details["total"],
            time_range=time_range,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get error details: {str(e)}",
        )


# === Performance Metrics ===


@router.get(
    "/performance",
    response_model=PerformanceMetrics,
    summary="Get Performance Metrics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_performance_metrics(current_user: CurrentUserDep):
    """
    Get system performance metrics.

    Requires MANAGE_SYSTEM permission.
    Includes response times, throughput, and slowest endpoints.
    """
    try:
        metrics = await admin_service.get_performance_metrics()

        return PerformanceMetrics(
            avg_response_time=metrics["avg_response_time"],
            p50_response_time=metrics["p50_response_time"],
            p90_response_time=metrics["p90_response_time"],
            p95_response_time=metrics["p95_response_time"],
            p99_response_time=metrics["p99_response_time"],
            requests_per_second=metrics["requests_per_second"],
            requests_per_minute=metrics["requests_per_minute"],
            avg_db_query_time=metrics["avg_db_query_time"],
            slow_queries_count=metrics["slow_queries_count"],
            slowest_endpoints=metrics["slowest_endpoints"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance metrics: {str(e)}",
        )


# === Custom Metrics ===


@router.get(
    "/custom",
    response_model=CustomMetricsListResponse,
    summary="Get Custom Metrics",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_SYSTEM))
    ],
)
async def get_custom_metrics(current_user: CurrentUserDep):
    """
    Get list of available custom metrics.

    Requires MANAGE_SYSTEM permission.
    """
    try:
        metrics = await admin_service.get_custom_metrics()

        return CustomMetricsListResponse(
            metrics=metrics["metrics"],
            total=metrics["total"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get custom metrics: {str(e)}",
        )
