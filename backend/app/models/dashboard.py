"""
Dashboard-related models for user preferences, notifications, and activity tracking.
"""

from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    ForeignKey,
    Float,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base


class UserDashboardPreferences(Base):
    """User dashboard preferences model"""

    __tablename__ = "user_dashboard_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Layout preferences
    show_quick_stats = Column(Boolean, default=True)
    show_recent_activity = Column(Boolean, default=True)
    show_my_projects = Column(Boolean, default=True)
    show_pending_approvals = Column(Boolean, default=True)

    # Filter preferences
    default_project_filter = Column(String(100), nullable=True)
    activity_limit = Column(Integer, default=20)
    refresh_interval = Column(Integer, default=300)  # seconds

    # Display preferences
    theme = Column(String(20), default="light")
    notifications_enabled = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    timezone = Column(String(50), default="UTC")

    # Custom dashboard settings
    custom_settings = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("User", back_populates="dashboard_preferences")


class DashboardNotification(Base):
    """Dashboard notifications model"""

    __tablename__ = "dashboard_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Notification content
    type = Column(String(20), nullable=False)  # info, warning, error, success
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    # Action details
    action_url = Column(String(255), nullable=True)
    action_text = Column(String(100), nullable=True)

    # Status
    is_read = Column(Boolean, default=False)
    priority = Column(String(20), default="medium")  # low, medium, high, critical

    # Related entities
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    read_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
    project = relationship("Project", back_populates="notifications")
    requirement = relationship("Requirement", back_populates="notifications")
    team = relationship("Team", back_populates="notifications")


class DashboardActivity(Base):
    """Dashboard activity tracking model"""

    __tablename__ = "dashboard_activities"

    id = Column(Integer, primary_key=True, index=True)

    # Activity details
    activity_type = Column(
        String(50), nullable=False
    )  # project_created, requirement_added, etc.
    activity_title = Column(String(200), nullable=False)
    activity_description = Column(Text, nullable=True)

    # Actor information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String(100), nullable=False)  # Denormalized for performance

    # Related entities
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    # Entity details (denormalized for performance)
    entity_type = Column(
        String(50), nullable=True
    )  # project, requirement, user, team, etc.
    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String(200), nullable=True)

    # Activity metadata
    status = Column(String(50), nullable=True)
    priority = Column(String(20), nullable=True)
    extra_data = Column(JSON, nullable=True)  # Additional activity-specific data

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    user = relationship("User", back_populates="activities")
    project = relationship("Project", back_populates="activities")
    requirement = relationship("Requirement", back_populates="activities")
    team = relationship("Team", back_populates="activities")


class DashboardWidget(Base):
    """Dashboard widget configuration model"""

    __tablename__ = "dashboard_widgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Widget details
    widget_type = Column(String(50), nullable=False)  # stats, projects, activity, etc.
    widget_title = Column(String(100), nullable=False)

    # Layout
    position = Column(Integer, default=0)
    size = Column(String(20), default="medium")  # small, medium, large
    is_visible = Column(Boolean, default=True)

    # Configuration
    config = Column(JSON, nullable=True)  # Widget-specific configuration

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("User", back_populates="dashboard_widgets")
