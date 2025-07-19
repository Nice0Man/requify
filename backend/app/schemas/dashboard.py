from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

from app.models.constants import (
    ProjectStatus,
    RequirementStatus,
    Priority,
    NotificationType,
    Theme,
    DashboardLayout,
)


class ActivityType(str, Enum):
    """Types of activities that can be tracked"""

    PROJECT_CREATED = "project_created"
    REQUIREMENT_ADDED = "requirement_added"
    TASK_COMPLETED = "task_completed"
    REVIEW_SUBMITTED = "review_submitted"
    COMMENT_ADDED = "comment_added"
    STATUS_CHANGED = "status_changed"


class DashboardOverviewStats(BaseModel):
    """Overview statistics for dashboard"""

    total_projects: int = Field(..., description="Total number of projects", ge=0)
    active_projects: int = Field(..., description="Number of active projects", ge=0)
    completed_projects: int = Field(
        ..., description="Number of completed projects", ge=0
    )
    total_requirements: int = Field(
        ..., description="Total number of requirements", ge=0
    )
    pending_requirements: int = Field(
        ..., description="Number of pending requirements", ge=0
    )
    approved_requirements: int = Field(
        ..., description="Number of approved requirements", ge=0
    )
    total_users: int = Field(..., description="Total number of users", ge=0)
    active_users: int = Field(..., description="Number of active users", ge=0)


class ProjectPerformanceStats(BaseModel):
    """Project performance metrics"""

    completion_rate: float = Field(
        ..., description="Overall completion rate", ge=0, le=100
    )
    on_time_delivery: float = Field(
        ..., description="On-time delivery percentage", ge=0, le=100
    )
    quality_score: float = Field(..., description="Quality score", ge=0, le=100)
    team_productivity: float = Field(
        ..., description="Team productivity metric", ge=0, le=100
    )


class TrendingMetricsData(BaseModel):
    """Trending metrics data"""

    requirements_this_week: int = Field(..., description="Requirements this week", ge=0)
    requirements_last_week: int = Field(..., description="Requirements last week", ge=0)
    releases_this_month: int = Field(..., description="Releases this month", ge=0)
    releases_last_month: int = Field(..., description="Releases last month", ge=0)
    active_teams: int = Field(..., description="Number of active teams", ge=0)
    avg_project_duration: float = Field(
        ..., description="Average project duration in days", ge=0
    )


class QuickProject(BaseModel):
    """Quick project information"""

    id: int = Field(..., description="Project ID")
    name: str = Field(..., description="Project name")
    code: str = Field(..., description="Project code")
    status: str = Field(..., description="Project status")
    completion_percentage: float = Field(
        ..., description="Completion percentage", ge=0, le=100
    )
    team_size: int = Field(..., description="Team size", ge=0)
    requirements_count: int = Field(..., description="Requirements count", ge=0)
    next_milestone: Optional[str] = Field(None, description="Next milestone")
    health_score: str = Field(
        ..., description="Health score", pattern="^(good|warning|critical)$"
    )


class QuickRequirement(BaseModel):
    """Quick requirement information"""

    id: int = Field(..., description="Requirement ID")
    title: str = Field(..., description="Requirement title")
    project_name: str = Field(..., description="Project name")
    status: str = Field(..., description="Requirement status")
    priority: str = Field(..., description="Requirement priority")
    assigned_to: Optional[str] = Field(None, description="Assigned user")
    due_date: Optional[str] = Field(None, description="Due date")
    progress: float = Field(..., description="Progress percentage", ge=0, le=100)


class PendingApproval(BaseModel):
    """Pending approval item"""

    id: int = Field(..., description="Approval ID")
    type: str = Field(
        ..., description="Approval type", pattern="^(requirement|release|project|user)$"
    )
    title: str = Field(..., description="Approval title")
    requested_by: str = Field(..., description="Requested by user")
    requested_at: str = Field(..., description="Request timestamp")
    urgency: str = Field(
        ..., description="Urgency level", pattern="^(low|medium|high)$"
    )


class ActivityItem(BaseModel):
    """Activity feed item"""

    id: str = Field(..., description="Unique activity identifier")
    type: str = Field(
        ...,
        description="Type of activity",
        pattern="^(project|requirement|release|user|testing)$",
    )
    title: str = Field(..., description="Activity title", min_length=1, max_length=200)
    description: str = Field(..., description="Activity description", max_length=1000)
    timestamp: str = Field(..., description="When the activity occurred")
    user_name: str = Field(
        ..., description="Name of the user who performed the activity"
    )
    user_avatar: Optional[str] = Field(None, description="User avatar URL")
    project_name: Optional[str] = Field(
        None, description="Related project name if applicable"
    )
    status: Optional[str] = Field(None, description="Activity status")
    priority: Optional[str] = Field(
        None, description="Activity priority", pattern="^(low|medium|high|critical)$"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "act_123",
                "type": "requirement",
                "title": "Task Completed",
                "description": "User authentication module has been completed",
                "timestamp": "2024-01-15T14:30:00Z",
                "user_name": "John Doe",
                "user_avatar": "https://example.com/avatar.jpg",
                "project_name": "E-commerce Platform",
                "status": "completed",
                "priority": "high",
            }
        }


class QuickAccess(BaseModel):
    """Quick access items"""

    my_projects: List[QuickProject] = Field(
        default_factory=list, description="User's projects"
    )
    my_requirements: List[QuickRequirement] = Field(
        default_factory=list, description="User's requirements"
    )
    pending_approvals: List[PendingApproval] = Field(
        default_factory=list, description="Pending approvals"
    )


class SystemMetrics(BaseModel):
    """System performance metrics for dashboard monitoring"""

    cpuUsage: float = Field(
        ..., description="CPU usage percentage", ge=0, le=100, alias="cpu_usage"
    )
    memoryUsage: float = Field(
        ..., description="Memory usage percentage", ge=0, le=100, alias="memory_usage"
    )
    diskUsage: float = Field(
        ..., description="Disk usage percentage", ge=0, le=100, alias="disk_usage"
    )
    networkLatency: float = Field(
        ...,
        description="Network latency in milliseconds",
        ge=0,
        alias="network_latency",
    )
    uptime: int = Field(..., description="System uptime in seconds", ge=0)
    activeUsers: int = Field(
        ..., description="Number of active users", ge=0, alias="active_users"
    )
    responseTime: float = Field(
        ...,
        description="Average response time in milliseconds",
        ge=0,
        alias="response_time",
    )
    errorRate: float = Field(
        ..., description="Error rate percentage", ge=0, le=100, alias="error_rate"
    )
    throughput: float = Field(
        ..., description="Requests per second throughput", ge=0, alias="throughput"
    )
    availability: float = Field(
        ..., description="System availability percentage", ge=0, le=100
    )
    lastUpdated: Optional[str] = Field(
        None, description="Last update timestamp", alias="last_updated"
    )

    class Config:
        allow_population_by_field_name = True
        json_schema_extra = {
            "example": {
                "cpuUsage": 25.5,
                "memoryUsage": 65.2,
                "diskUsage": 45.8,
                "networkLatency": 15.3,
                "uptime": 86400,
                "activeUsers": 12,
                "responseTime": 120.5,
                "errorRate": 0.5,
                "throughput": 150.0,
                "availability": 99.9,
                "lastUpdated": "2024-01-15T14:30:00Z",
            }
        }


class DashboardStats(BaseModel):
    """Comprehensive dashboard statistics matching frontend expectations"""

    overview: DashboardOverviewStats = Field(..., description="Overview statistics")
    recent_activity: List["ActivityItem"] = Field(
        default_factory=list, description="Recent activity items"
    )
    project_performance: ProjectPerformanceStats = Field(
        ..., description="Project performance metrics"
    )
    trending_metrics: TrendingMetricsData = Field(..., description="Trending metrics")
    quick_access: QuickAccess = Field(..., description="Quick access items")

    class Config:
        json_schema_extra = {
            "example": {
                "overview": {
                    "total_projects": 15,
                    "active_projects": 12,
                    "completed_projects": 3,
                    "total_requirements": 150,
                    "pending_requirements": 25,
                    "approved_requirements": 125,
                    "total_users": 50,
                    "active_users": 35,
                },
                "recent_activity": [],
                "project_performance": {
                    "completion_rate": 85.5,
                    "on_time_delivery": 92.0,
                    "quality_score": 88.5,
                    "team_productivity": 78.2,
                },
                "trending_metrics": {
                    "requirements_this_week": 12,
                    "requirements_last_week": 8,
                    "releases_this_month": 3,
                    "releases_last_month": 2,
                    "active_teams": 5,
                    "avg_project_duration": 45.5,
                },
                "quick_access": {
                    "my_projects": [],
                    "my_requirements": [],
                    "pending_approvals": [],
                },
            }
        }


class ProjectPerformance(BaseModel):
    """Project performance metrics"""

    project_id: str = Field(..., description="Unique project identifier")
    project_name: str = Field(
        ..., description="Project name", min_length=1, max_length=200
    )
    completion_percentage: float = Field(
        ..., description="Project completion percentage", ge=0, le=100
    )
    tasks_completed: int = Field(..., description="Number of completed tasks", ge=0)
    tasks_total: int = Field(..., description="Total number of tasks", ge=0)
    last_updated: datetime = Field(..., description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "proj_123",
                "project_name": "E-commerce Platform",
                "completion_percentage": 75.5,
                "tasks_completed": 45,
                "tasks_total": 60,
                "last_updated": "2024-01-15T10:30:00Z",
            }
        }


class TrendingMetrics(BaseModel):
    """Trending performance metrics"""

    weekly_growth: float = Field(..., description="Weekly growth percentage", ge=-100)
    monthly_growth: float = Field(..., description="Monthly growth percentage", ge=-100)
    top_performing_projects: List[ProjectPerformance] = Field(
        default_factory=list,
        description="List of top performing projects",
        max_items=10,
    )

    class Config:
        json_schema_extra = {
            "example": {
                "weekly_growth": 12.5,
                "monthly_growth": 45.2,
                "top_performing_projects": [],
            }
        }


class DashboardOverview(BaseModel):
    """Main dashboard overview data"""

    stats: DashboardOverviewStats = Field(..., description="Overview statistics")
    recent_activity: List["ActivityItem"] = Field(
        default_factory=list, description="Recent activity items", max_items=50
    )
    trending_metrics: TrendingMetrics = Field(
        ..., description="Trending performance metrics"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "stats": {
                    "total_projects": 15,
                    "active_projects": 12,
                    "completed_projects": 3,
                    "total_requirements": 150,
                    "pending_requirements": 25,
                    "approved_requirements": 125,
                    "total_users": 50,
                    "active_users": 35,
                },
                "recent_activity": [],
                "trending_metrics": {
                    "weekly_growth": 12.5,
                    "monthly_growth": 45.2,
                    "top_performing_projects": [],
                },
            }
        }


class MyProject(BaseModel):
    """User's project information"""

    id: str = Field(..., description="Unique project identifier")
    name: str = Field(..., description="Project name", min_length=1, max_length=200)
    description: Optional[str] = Field(
        None, description="Project description", max_length=2000
    )
    status: ProjectStatus = Field(..., description="Current project status")
    created_at: datetime = Field(..., description="Project creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    requirements_count: int = Field(
        ..., description="Number of requirements in project", ge=0
    )
    completion_percentage: float = Field(
        ..., description="Project completion percentage", ge=0, le=100
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "proj_123",
                "name": "E-commerce Platform",
                "description": "A modern e-commerce platform with advanced features",
                "status": "active",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
                "requirements_count": 25,
                "completion_percentage": 75.5,
            }
        }


class MyRequirement(BaseModel):
    """User's requirement information"""

    id: str = Field(..., description="Unique requirement identifier")
    title: str = Field(
        ..., description="Requirement title", min_length=1, max_length=200
    )
    description: Optional[str] = Field(
        None, description="Requirement description", max_length=2000
    )
    status: RequirementStatus = Field(..., description="Current requirement status")
    priority: Priority = Field(..., description="Requirement priority level")
    project_id: str = Field(..., description="ID of the parent project")
    assigned_to: Optional[str] = Field(None, description="ID of assigned user")
    created_at: datetime = Field(..., description="Requirement creation timestamp")
    due_date: Optional[datetime] = Field(
        None, description="Due date for the requirement"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "req_123",
                "title": "User Authentication",
                "description": "Implement secure user authentication system",
                "status": "in_progress",
                "priority": "high",
                "project_id": "proj_456",
                "assigned_to": "user_789",
                "created_at": "2024-01-10T09:00:00Z",
                "due_date": "2024-02-01T23:59:59Z",
            }
        }


class Notification(BaseModel):
    """User notification"""

    id: str = Field(..., description="Unique notification identifier")
    type: NotificationType = Field(..., description="Type of notification")
    title: str = Field(
        ..., description="Notification title", min_length=1, max_length=200
    )
    message: str = Field(
        ..., description="Notification message", min_length=1, max_length=1000
    )
    is_read: bool = Field(False, description="Whether the notification has been read")
    created_at: datetime = Field(..., description="Notification creation timestamp")
    user_id: str = Field(..., description="ID of the user receiving the notification")
    action_url: Optional[str] = Field(None, description="URL for notification action")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "notif_123",
                "type": "info",
                "title": "New Requirement Added",
                "message": "A new requirement has been added to your project",
                "is_read": False,
                "created_at": "2024-01-15T11:00:00Z",
                "user_id": "user_456",
                "action_url": "/projects/proj_789/requirements/req_123",
            }
        }


class UserPreferences(BaseModel):
    """User dashboard preferences"""

    user_id: str = Field(..., description="Unique user identifier")
    theme: Theme = Field(Theme.LIGHT, description="UI theme preference")
    notifications_enabled: bool = Field(
        True, description="Whether notifications are enabled"
    )
    email_notifications: bool = Field(
        True, description="Whether email notifications are enabled"
    )
    dashboard_layout: DashboardLayout = Field(
        DashboardLayout.DEFAULT, description="Dashboard layout preference"
    )
    timezone: str = Field(
        "UTC", description="User's timezone", min_length=1, max_length=50
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "theme": "light",
                "notifications_enabled": True,
                "email_notifications": True,
                "dashboard_layout": "default",
                "timezone": "UTC",
            }
        }


class UserDashboardPreferences(BaseModel):
    """Frontend-compatible user dashboard preferences"""

    show_quick_stats: bool = Field(True, description="Show quick stats widget")
    show_recent_activity: bool = Field(True, description="Show recent activity widget")
    show_my_projects: bool = Field(True, description="Show my projects widget")
    show_pending_approvals: bool = Field(
        True, description="Show pending approvals widget"
    )
    default_project_filter: Optional[str] = Field(
        None, description="Default project filter"
    )
    activity_limit: int = Field(20, description="Activity items limit", ge=1, le=100)
    refresh_interval: int = Field(
        300, description="Refresh interval in seconds", ge=30, le=3600
    )


class DashboardNotification(BaseModel):
    """Dashboard notification matching frontend expectations"""

    id: str = Field(..., description="Unique notification identifier")
    type: str = Field(
        ..., description="Notification type", pattern="^(info|warning|error|success)$"
    )
    title: str = Field(
        ..., description="Notification title", min_length=1, max_length=200
    )
    message: str = Field(
        ..., description="Notification message", min_length=1, max_length=1000
    )
    action_url: Optional[str] = Field(None, description="Action URL")
    action_text: Optional[str] = Field(None, description="Action button text")
    timestamp: str = Field(..., description="Notification timestamp")
    read: bool = Field(False, description="Whether notification is read")
    priority: str = Field(
        ..., description="Notification priority", pattern="^(low|medium|high)$"
    )


class MyDashboard(BaseModel):
    """Complete user dashboard data"""

    user_id: str = Field(..., description="Unique user identifier")
    overview: DashboardOverview = Field(..., description="Dashboard overview data")
    my_projects: List[MyProject] = Field(
        default_factory=list, description="User's projects", max_items=100
    )
    notifications: List[Notification] = Field(
        default_factory=list, description="User's notifications", max_items=100
    )
    preferences: UserPreferences = Field(
        ..., description="User's dashboard preferences"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "overview": {
                    "stats": {
                        "total_projects": 5,
                        "active_projects": 4,
                        "completed_projects": 1,
                        "total_requirements": 50,
                        "pending_requirements": 15,
                        "approved_requirements": 35,
                        "total_users": 10,
                        "active_users": 8,
                    },
                    "recent_activity": [],
                    "trending_metrics": {
                        "weekly_growth": 8.5,
                        "monthly_growth": 25.0,
                        "top_performing_projects": [],
                    },
                },
                "my_projects": [],
                "notifications": [],
                "preferences": {
                    "user_id": "user_123",
                    "theme": "light",
                    "notifications_enabled": True,
                    "email_notifications": True,
                    "dashboard_layout": "default",
                    "timezone": "UTC",
                },
            }
        }


class MyDashboardResponse(BaseModel):
    """Frontend-compatible personalized dashboard response"""

    my_projects: List[QuickProject] = Field(
        default_factory=list, description="User's projects"
    )
    my_requirements: List[QuickRequirement] = Field(
        default_factory=list, description="User's requirements"
    )
    my_activity: List["ActivityItem"] = Field(
        default_factory=list, description="User's recent activity"
    )
    notifications: List[DashboardNotification] = Field(
        default_factory=list, description="User's notifications"
    )
    preferences: UserDashboardPreferences = Field(..., description="User's preferences")

    class Config:
        json_schema_extra = {
            "example": {
                "my_projects": [],
                "my_requirements": [],
                "my_activity": [],
                "notifications": [],
                "preferences": {
                    "show_quick_stats": True,
                    "show_recent_activity": True,
                    "show_my_projects": True,
                    "show_pending_approvals": True,
                    "activity_limit": 20,
                    "refresh_interval": 300,
                },
            }
        }
