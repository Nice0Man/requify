"""
Analytics dependencies.

Специализированные dependencies для аналитики и метрик.
"""

from typing import Callable, Dict, Optional, List
from datetime import datetime, date, timedelta
from fastapi import Query, HTTPException, status
from enum import Enum

from app.utils.logger import logger


class TimeRange(str, Enum):
    """Predefined time ranges for analytics."""

    LAST_7_DAYS = "7d"
    LAST_30_DAYS = "30d"
    LAST_90_DAYS = "90d"
    LAST_YEAR = "1y"
    CUSTOM = "custom"


class MetricType(str, Enum):
    """Available metric types."""

    COUNT = "count"
    SUM = "sum"
    AVERAGE = "avg"
    MEDIAN = "median"
    MIN = "min"
    MAX = "max"


class AnalyticsDependencies:
    """
    Dependencies for analytics and reporting endpoints.

    Provides validation and preprocessing for analytics queries.
    """

    @staticmethod
    def time_range_params() -> Callable:
        """Validate time range parameters for analytics."""

        def validate_time_range(
            time_range: TimeRange = Query(
                TimeRange.LAST_30_DAYS, description="Predefined time range"
            ),
            start_date: Optional[date] = Query(
                None, description="Custom start date (for custom range)"
            ),
            end_date: Optional[date] = Query(
                None, description="Custom end date (for custom range)"
            ),
        ) -> Dict[str, datetime]:

            now = datetime.utcnow()

            if time_range == TimeRange.CUSTOM:
                if not start_date or not end_date:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="start_date and end_date required for custom time range",
                    )

                if start_date > end_date:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="start_date must be before end_date",
                    )

                # Convert to datetime
                start_datetime = datetime.combine(start_date, datetime.min.time())
                end_datetime = datetime.combine(end_date, datetime.max.time())

            else:
                # Predefined ranges
                if time_range == TimeRange.LAST_7_DAYS:
                    start_datetime = now - timedelta(days=7)
                elif time_range == TimeRange.LAST_30_DAYS:
                    start_datetime = now - timedelta(days=30)
                elif time_range == TimeRange.LAST_90_DAYS:
                    start_datetime = now - timedelta(days=90)
                elif time_range == TimeRange.LAST_YEAR:
                    start_datetime = now - timedelta(days=365)
                else:
                    start_datetime = now - timedelta(days=30)  # Default

                end_datetime = now

            # Validate range is not too large
            if (end_datetime - start_datetime).days > 730:  # 2 years max
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Time range cannot exceed 2 years",
                )

            logger.debug(f"Analytics time range: {start_datetime} to {end_datetime}")

            return {
                "start_date": start_datetime,
                "end_date": end_datetime,
                "range_type": time_range,
            }

        return validate_time_range

    @staticmethod
    def aggregation_params() -> Callable:
        """Validate aggregation parameters."""

        def validate_aggregation(
            group_by: Optional[str] = Query(None, description="Group results by field"),
            metric_type: MetricType = Query(
                MetricType.COUNT, description="Aggregation type"
            ),
            metric_field: Optional[str] = Query(
                None, description="Field to aggregate (for sum, avg, etc.)"
            ),
            limit: int = Query(100, ge=1, le=1000, description="Limit results"),
        ) -> Dict[str, any]:

            # Validate metric field is provided for non-count operations
            if metric_type != MetricType.COUNT and not metric_field:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"metric_field required for {metric_type.value} aggregation",
                )

            return {
                "group_by": group_by,
                "metric_type": metric_type,
                "metric_field": metric_field,
                "limit": limit,
            }

        return validate_aggregation

    @staticmethod
    def filter_params(allowed_filters: List[str]) -> Callable:
        """
        Validate filter parameters for analytics.

        Args:
            allowed_filters: List of allowed filter fields

        Returns:
            Callable: Filter validation dependency
        """

        def validate_filters(
            filters: Optional[str] = Query(None, description="JSON string of filters")
        ) -> Dict[str, any]:

            if not filters:
                return {}

            try:
                import json

                filter_dict = json.loads(filters)

                # Validate filter keys
                for key in filter_dict.keys():
                    if key not in allowed_filters:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid filter field: {key}. Allowed: {', '.join(allowed_filters)}",
                        )

                return filter_dict

            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON format for filters",
                )

        return validate_filters

    @staticmethod
    def export_params() -> Callable:
        """Validate export parameters."""

        def validate_export(
            format: str = Query(
                "json", regex="^(json|csv|xlsx)$", description="Export format"
            ),
            include_metadata: bool = Query(
                True, description="Include metadata in export"
            ),
        ) -> Dict[str, any]:
            return {"format": format, "include_metadata": include_metadata}

        return validate_export


# Common analytics dependency instances
analytics_time_range = AnalyticsDependencies.time_range_params()
analytics_aggregation = AnalyticsDependencies.aggregation_params()
analytics_export = AnalyticsDependencies.export_params()

# Specific filter instances for different domains
user_analytics_filters = AnalyticsDependencies.filter_params(
    ["company_id", "department_id", "is_active", "role", "created_date"]
)

project_analytics_filters = AnalyticsDependencies.filter_params(
    ["company_id", "status", "priority", "created_date", "updated_date"]
)

requirement_analytics_filters = AnalyticsDependencies.filter_params(
    ["project_id", "status", "priority", "type", "created_date", "updated_date"]
)
