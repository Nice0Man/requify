"""
Constants and enums for the application.
This file contains enums and constants that are shared across models and schemas.
"""

from enum import Enum


class ProjectStatus(str, Enum):
    """Project status options"""

    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    PLANNING = "planning"
    DEVELOPMENT = "development"
    TESTING = "testing"


class RequirementStatus(str, Enum):
    """Requirement status options"""

    DRAFT = "draft"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"
    APPROVED = "approved"
    IMPLEMENTED = "implemented"
    IN_REVIEW = "in_review"
    REJECTED = "rejected"


class Priority(str, Enum):
    """Priority levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class UserRole(str, Enum):
    """User role options"""

    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    DEVELOPER = "developer"
    TESTER = "tester"
    USER = "user"


class NotificationType(str, Enum):
    """Notification types"""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"
    REMINDER = "reminder"


class TestStatus(str, Enum):
    """Test status options"""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


class ReleaseStatus(str, Enum):
    """Release status options"""

    PLANNED = "planned"
    IN_DEVELOPMENT = "in_development"
    TESTING = "testing"
    READY = "ready"
    RELEASED = "released"
    CANCELLED = "cancelled"


class Theme(str, Enum):
    """UI theme options"""

    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"


class DashboardLayout(str, Enum):
    """Dashboard layout options"""

    DEFAULT = "default"
    COMPACT = "compact"
    DETAILED = "detailed"
