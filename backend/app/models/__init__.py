"""
SQLAlchemy модели.
Полностью обновлено для 4NF архитектуры с многопользовательской поддержкой.
"""

# Импортируем все модели для Alembic автогенерации миграций

# =============================================================================
# Core models (базовые модели)
# =============================================================================
from .user import User
from .user_profile import UserProfile
from .user_settings import UserSettings, UserSettingsHistory

# =============================================================================
# Company models (4NF декомпозиция)
# =============================================================================
from .company import Company, CompanyStatus, CompanyType
from .company_contact import CompanyContact
from .company_subscription import (
    CompanySubscription,
    SubscriptionStatus,
    SubscriptionPlan,
    BillingPeriod,
)
from .company_settings import CompanySettings
from .company_branding import CompanyBranding

# =============================================================================
# Organization models (организационная структура)
# =============================================================================
from .department import Department, DepartmentType

# =============================================================================
# Enhanced Role System (расширенная система ролей)
# =============================================================================
from .enhanced_role_system import (
    EnhancedRole,
    UserRoleAssignment,
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
    Permission,
)

# =============================================================================
# Authentication
# =============================================================================
from .refresh_token import RefreshToken

# =============================================================================
# Business models
# =============================================================================
from .project import Project
from .requirement import Requirement
from .requirement_group import RequirementGroup
from .requirement_group_version import RequirementGroupVersion
from .spec import Spec
from .release import Release
from .relationship import Relationship
from .comment import Comment
from .test_result import TestResult

# =============================================================================
# Team models
# =============================================================================
from .team import Team
from .team_member import TeamMember

# =============================================================================
# Dashboard models
# =============================================================================
from .dashboard import (
    UserDashboardPreferences,
    DashboardNotification,
    DashboardActivity,
    DashboardWidget,
)

# =============================================================================
# Testing models
# =============================================================================
# from .test_plan import TestPlan
# from .test_case import TestCase
# from .test_execution import TestExecution

# =============================================================================
# Reference data (Enums)
# =============================================================================
from .requirement_statuses import RequirementStatus
from .requirement_priorities import RequirementPriority
from .requirement_types import RequirementType
from .relationship_types import RelationshipType

__all__ = [
    # =============================================================================
    # Core models
    # =============================================================================
    "User",
    "UserProfile",
    "UserSettings",
    "UserSettingsHistory",
    # =============================================================================
    # Company models (4NF)
    # =============================================================================
    "Company",
    "CompanyStatus",
    "CompanyType",
    "CompanyContact",
    "CompanySubscription",
    "SubscriptionStatus",
    "SubscriptionPlan",
    "BillingPeriod",
    "CompanySettings",
    "CompanyBranding",
    # =============================================================================
    # Organization models
    # =============================================================================
    "Department",
    "DepartmentType",
    # =============================================================================
    # Enhanced Role System
    # =============================================================================
    "EnhancedRole",
    "UserRoleAssignment",
    "RoleScope",
    "SystemRole",
    "CompanyRole",
    "DepartmentRole",
    "TeamRole",
    "ProjectRole",
    "Permission",
    # =============================================================================
    # Authentication
    # =============================================================================
    "RefreshToken",
    # =============================================================================
    # Business models
    # =============================================================================
    "Project",
    "Requirement",
    "RequirementGroup",
    "RequirementGroupVersion",
    "Spec",
    "Release",
    "Relationship",
    "Comment",
    "TestResult",
    # =============================================================================
    # Team models
    # =============================================================================
    "Team",
    "TeamMember",
    # =============================================================================
    # Dashboard models
    # =============================================================================
    "UserDashboardPreferences",
    "DashboardNotification",
    "DashboardActivity",
    "DashboardWidget",
    # =============================================================================
    # Testing models
    # =============================================================================
    # "TestPlan",
    # "TestCase",
    # "TestExecution",
    # =============================================================================
    # Reference data (Enums)
    # =============================================================================
    "RequirementStatus",
    "RequirementPriority",
    "RequirementType",
    "RelationshipType",
]
