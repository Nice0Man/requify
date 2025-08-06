"""
Dashboard-related models for user preferences, notifications, and activity tracking.
"""

from datetime import datetime, UTC
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    ForeignKey,
    Float,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project
    from .requirement import Requirement
    from .team import Team


class UserDashboardPreferences(Base, TimestampedMixin):
    """User dashboard preferences model"""

    __tablename__ = "user_dashboard_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, unique=True
    )

    # Layout preferences
    show_quick_stats: Mapped[bool] = mapped_column(Boolean, default=True)
    show_recent_activity: Mapped[bool] = mapped_column(Boolean, default=True)
    show_my_projects: Mapped[bool] = mapped_column(Boolean, default=True)
    show_pending_approvals: Mapped[bool] = mapped_column(Boolean, default=True)

    # Filter preferences
    default_project_filter: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    activity_limit: Mapped[int] = mapped_column(Integer, default=20)
    refresh_interval: Mapped[int] = mapped_column(Integer, default=300)  # seconds

    # Display preferences
    theme: Mapped[str] = mapped_column(String(20), default="light")
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")

    # Custom dashboard settings
    custom_settings: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="dashboard_preferences")


class DashboardNotification(Base, TimestampedMixin):
    """Dashboard notifications model"""

    __tablename__ = "dashboard_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    # Notification content
    type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # info, warning, error, success
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    # Action details
    action_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    action_text: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[str] = mapped_column(
        String(20), default="medium"
    )  # low, medium, high, critical

    # Related entities
    project_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=True
    )
    requirement_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("requirements.id"), nullable=True
    )
    team_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("teams.id"), nullable=True
    )

    # Additional timestamps
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")
    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="notifications"
    )
    requirement: Mapped[Optional["Requirement"]] = relationship(
        "Requirement", back_populates="notifications"
    )
    team: Mapped[Optional["Team"]] = relationship(
        "Team", back_populates="notifications"
    )


class DashboardActivity(Base, TimestampedMixin):
    """Dashboard activity tracking model"""

    __tablename__ = "dashboard_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Activity details
    activity_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # project_created, requirement_added, etc.
    activity_title: Mapped[str] = mapped_column(String(200), nullable=False)
    activity_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Actor information
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    user_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # Denormalized for performance

    # Related entities
    project_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=True
    )
    requirement_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("requirements.id"), nullable=True
    )
    team_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("teams.id"), nullable=True
    )

    # Entity details (denormalized for performance)
    entity_type: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # project, requirement, user, team, etc.
    entity_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    entity_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Activity metadata
    status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    priority: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True
    )  # Additional activity-specific data

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="activities")
    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="activities"
    )
    requirement: Mapped[Optional["Requirement"]] = relationship(
        "Requirement", back_populates="activities"
    )
    team: Mapped[Optional["Team"]] = relationship("Team", back_populates="activities")


class DashboardWidget(Base, TimestampedMixin):
    """Dashboard widget configuration model"""

    __tablename__ = "dashboard_widgets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    # Widget details
    widget_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # stats, projects, activity, etc.
    widget_title: Mapped[str] = mapped_column(String(100), nullable=False)

    # Layout
    position: Mapped[int] = mapped_column(Integer, default=0)
    size: Mapped[str] = mapped_column(
        String(20), default="medium"
    )  # small, medium, large
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)

    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True
    )  # Widget-specific configuration

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="dashboard_widgets")
