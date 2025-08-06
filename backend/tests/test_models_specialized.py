"""
Specialized tests for specific model groups and business logic.
Tests mixins, constants, and specialized functionality.
"""

import pytest
from datetime import datetime, UTC, timedelta
from sqlalchemy import create_engine, select, func, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import IntegrityError

# Import specialized models and mixins
from app.models.base import Base, TimestampedMixin
from app.models.mixins import (
    AuthMixin,
    PermissionsMixin,
    EmailVerificationMixin,
    ActivityMixin,
)
from app.models.constants import TeamRole as ModelTeamRole, ProjectStatus
from app.core.constants import (
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
)

# Import all remaining models
from app.models.user import User
from app.models.company import Company
from app.models.department import Department, DepartmentType
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.requirement_types import RequirementType
from app.models.requirement_priorities import RequirementPriority
from app.models.requirement_statuses import RequirementStatus
from app.models.relationship_types import RelationshipType
from app.models.user_profile import UserProfile
from app.models.user_settings import UserSettings
from app.models.refresh_token import RefreshToken
from app.models.spec import Spec
from app.models.release import Release, ReleaseStatus
from app.models.comment import Comment
from app.models.relationship import Relationship
from app.models.requirement_group import RequirementGroup
from app.models.requirement_group_version import RequirementGroupVersion
from app.models.test_result import TestResult, TestStatus
from app.models.dashboard import (
    UserDashboardPreferences,
    DashboardNotification,
    DashboardActivity,
    DashboardWidget,
)
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment


@pytest.fixture(scope="function")
def specialized_db_session():
    """Create a test database session for specialized tests."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def minimal_test_data(specialized_db_session: Session):
    """Create minimal test data for specialized tests."""
    # Create company
    company = Company(name="Test Co", slug="test-co")
    specialized_db_session.add(company)
    specialized_db_session.commit()

    # Create user
    user = User(
        email="test@example.com",
        password_hash="hash",
        name="Test User",
        company_id=company.id,
    )
    specialized_db_session.add(user)
    specialized_db_session.commit()

    # Create reference data
    req_type = RequirementType(name="Functional")
    req_priority = RequirementPriority(name="High", level=8)
    req_status = RequirementStatus(name="Draft")
    rel_type = RelationshipType(name="depends_on")

    specialized_db_session.add_all([req_type, req_priority, req_status, rel_type])
    specialized_db_session.commit()

    return {
        "company": company,
        "user": user,
        "requirement_type": req_type,
        "requirement_priority": req_priority,
        "requirement_status": req_status,
        "relationship_type": rel_type,
    }


# ============================================================================
# MIXIN TESTS
# ============================================================================


class TestMixins:
    """Test all mixin functionality."""

    def test_timestamped_mixin(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test TimestampedMixin functionality."""
        user = minimal_test_data["user"]

        # Test initial timestamps
        assert user.created_at is not None
        assert user.updated_at is not None
        initial_created = user.created_at
        initial_updated = user.updated_at

        # Test that created_at doesn't change on update
        user.name = "Updated Name"
        specialized_db_session.commit()
        specialized_db_session.refresh(user)

        assert user.created_at == initial_created
        assert user.updated_at > initial_updated

    def test_mixin_inheritance(self, specialized_db_session: Session):
        """Test that mixins are properly inherited."""
        # Test that models inherit from TimestampedMixin
        user = User(email="mixin@test.com", password_hash="hash", name="Mixin Test")

        # Check that mixin attributes exist
        assert hasattr(user, "created_at")
        assert hasattr(user, "updated_at")

        # Test default values
        specialized_db_session.add(user)
        specialized_db_session.commit()

        assert user.created_at is not None
        assert user.updated_at is not None


# ============================================================================
# CONSTANTS TESTS
# ============================================================================


class TestConstants:
    """Test all constants and enums."""

    def test_team_role_constants(self):
        """Test TeamRole constants."""
        # Test that all team roles are defined
        expected_roles = [
            "OWNER",
            "ADMIN",
            "LEAD",
            "DEVELOPER",
            "ANALYST",
            "TESTER",
            "VIEWER",
        ]

        for role in expected_roles:
            assert hasattr(ModelTeamRole, role)

        # Test role values
        assert ModelTeamRole.OWNER == "owner"
        assert ModelTeamRole.DEVELOPER == "developer"
        assert ModelTeamRole.VIEWER == "viewer"

    def test_project_status_constants(self):
        """Test ProjectStatus constants."""
        expected_statuses = [
            "DRAFT",
            "PLANNING",
            "ACTIVE",
            "ON_HOLD",
            "COMPLETED",
            "CANCELLED",
            "ARCHIVED",
        ]

        for status in expected_statuses:
            assert hasattr(ProjectStatus, status)

        # Test status values
        assert ProjectStatus.DRAFT == "draft"
        assert ProjectStatus.ACTIVE == "active"
        assert ProjectStatus.COMPLETED == "completed"

    def test_role_scope_constants(self):
        """Test RoleScope constants."""
        expected_scopes = ["SYSTEM", "COMPANY", "DEPARTMENT", "TEAM", "PROJECT"]

        for scope in expected_scopes:
            assert hasattr(RoleScope, scope)

        # Test scope values
        assert RoleScope.SYSTEM.value == "system"
        assert RoleScope.COMPANY.value == "company"
        assert RoleScope.PROJECT.value == "project"

    def test_enum_usage_in_models(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test that enums are properly used in models."""
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]

        # Create department
        department = Department(name="Engineering", company_id=company.id)
        specialized_db_session.add(department)
        specialized_db_session.commit()

        # Create team with role enum
        team = Team(name="Dev Team", department_id=department.id, owner_id=user.id)
        specialized_db_session.add(team)
        specialized_db_session.commit()

        # Create team member with role
        member = TeamMember(
            team_id=team.id, user_id=user.id, role=ModelTeamRole.DEVELOPER
        )
        specialized_db_session.add(member)
        specialized_db_session.commit()

        # Verify enum value is stored correctly
        assert member.role == ModelTeamRole.DEVELOPER

        # Create project with status enum
        project = Project(
            code="TEST-001",
            name="Test Project",
            status=ProjectStatus.ACTIVE,
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Verify enum value is stored correctly
        assert project.status == ProjectStatus.ACTIVE


# ============================================================================
# REFERENCE DATA MODELS TESTS
# ============================================================================


class TestReferenceDataModels:
    """Test reference data models (types, priorities, statuses)."""

    def test_requirement_type_model(self, specialized_db_session: Session):
        """Test RequirementType model."""
        req_type = RequirementType(name="Security", description="Security requirements")
        specialized_db_session.add(req_type)
        specialized_db_session.commit()

        assert req_type.id is not None
        assert req_type.name == "Security"

    def test_requirement_priority_model(self, specialized_db_session: Session):
        """Test RequirementPriority model."""
        priority = RequirementPriority(
            name="Critical",
            description="Critical priority requirements",
            level=10,
            color="#FF0000",
            is_active=True,
            sort_order=1,
        )
        specialized_db_session.add(priority)
        specialized_db_session.commit()

        assert priority.id is not None
        assert priority.level == 10
        assert priority.color == "#FF0000"
        assert priority.is_active is True

    def test_requirement_status_model(self, specialized_db_session: Session):
        """Test RequirementStatus model."""
        status = RequirementStatus(
            name="Approved",
            description="Approved requirements",
            color="#00FF00",
            is_final=False,
            is_active=True,
            sort_order=2,
            workflow_transitions=[1, 3, 5],  # Can transition to status IDs 1, 3, 5
        )
        specialized_db_session.add(status)
        specialized_db_session.commit()

        assert status.id is not None
        assert status.is_final is False
        assert len(status.workflow_transitions) == 3
        assert 1 in status.workflow_transitions

    def test_relationship_type_model(self, specialized_db_session: Session):
        """Test RelationshipType model."""
        rel_type = RelationshipType(name="blocks")
        specialized_db_session.add(rel_type)
        specialized_db_session.commit()

        assert rel_type.id is not None
        assert rel_type.name == "blocks"

    def test_reference_data_relationships(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test relationships between reference data and requirements."""
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]
        req_type = minimal_test_data["requirement_type"]
        req_priority = minimal_test_data["requirement_priority"]
        req_status = minimal_test_data["requirement_status"]

        # Create department and project
        department = Department(name="Engineering", company_id=company.id)
        specialized_db_session.add(department)
        specialized_db_session.commit()

        project = Project(
            code="REF-001",
            name="Reference Test Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Create requirement with references
        requirement = Requirement(
            title="Test Requirement",
            project_id=project.id,
            author_id=user.id,
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
        )
        specialized_db_session.add(requirement)
        specialized_db_session.commit()

        # Test relationships
        assert requirement.type == req_type
        assert requirement.priority == req_priority
        assert requirement.status == req_status

        # Test reverse relationships
        specialized_db_session.refresh(req_type)
        specialized_db_session.refresh(req_priority)
        specialized_db_session.refresh(req_status)

        assert requirement in req_type.requirements
        assert requirement in req_priority.requirements
        assert requirement in req_status.requirements


# ============================================================================
# USER PROFILE AND SETTINGS TESTS
# ============================================================================


class TestUserProfileAndSettings:
    """Test UserProfile and UserSettings models."""

    def test_user_profile_comprehensive(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test comprehensive UserProfile functionality."""
        user = minimal_test_data["user"]

        # Create comprehensive profile
        profile = UserProfile(
            user_id=user.id,
            first_name="John",
            last_name="Doe",
            middle_name="Michael",
            display_name="John M. Doe",
            phone="+1234567890",
            phone_verified=True,
            position="Senior Software Engineer",
            department="Engineering",
            employee_id="EMP001",
            hire_date=datetime.now(UTC).replace(tzinfo=None),
            bio="Experienced software engineer with focus on backend development",
            avatar_url="https://example.com/avatar.jpg",
            timezone="America/New_York",
            language="en",
        )
        specialized_db_session.add(profile)
        specialized_db_session.commit()

        # Test business logic methods
        assert profile.full_name == "Doe John Michael"
        assert profile.short_name == "Doe J. M."

        completion_pct = profile.calculate_completion_percentage()
        assert completion_pct > 80  # Should be high with all fields filled

        profile.update_completion_status()
        assert profile.profile_completed is True
        assert profile.profile_completion_percentage == completion_pct

        # Test avatar method
        avatar_url = profile.get_avatar_or_default()
        assert avatar_url == "https://example.com/avatar.jpg"

        # Test with no avatar
        profile.avatar_url = None
        default_avatar = profile.get_avatar_or_default(size=128)
        assert "ui-avatars.com" in default_avatar
        assert "size=128" in default_avatar

    def test_user_settings_comprehensive(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test comprehensive UserSettings functionality."""
        user = minimal_test_data["user"]

        # Create comprehensive settings
        settings = UserSettings(
            user_id=user.id,
            notification_settings={
                "email": True,
                "push": False,
                "sms": True,
                "digest_frequency": "daily",
            },
            interface_settings={
                "theme": "dark",
                "language": "en",
                "timezone": "UTC",
                "date_format": "YYYY-MM-DD",
                "sidebar_collapsed": False,
            },
            security_settings={
                "two_factor_enabled": True,
                "session_timeout": 3600,
                "login_alerts": True,
            },
            privacy_settings={
                "profile_visibility": "company",
                "activity_tracking": True,
                "data_sharing": False,
            },
        )
        specialized_db_session.add(settings)
        specialized_db_session.commit()

        # Test JSON field access
        assert settings.notification_settings["email"] is True
        assert settings.interface_settings["theme"] == "dark"
        assert settings.security_settings["two_factor_enabled"] is True
        assert settings.privacy_settings["profile_visibility"] == "company"

                # Test settings modification
        new_notifications = settings.notification_settings.copy()
        new_notifications["push"] = True
        settings.notification_settings = new_notifications
        
        new_interface = settings.interface_settings.copy()
        new_interface["theme"] = "light"
        settings.interface_settings = new_interface
        
        specialized_db_session.commit()
        
        specialized_db_session.refresh(settings)
        assert settings.notification_settings["push"] is True
        assert settings.interface_settings["theme"] == "light"


# ============================================================================
# REFRESH TOKEN ADVANCED TESTS
# ============================================================================


class TestRefreshTokenAdvanced:
    """Advanced tests for RefreshToken model."""

    def test_refresh_token_lifecycle(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test complete refresh token lifecycle."""
        user = minimal_test_data["user"]

        # Create token
        expires_at = datetime.now(UTC) + timedelta(days=30)
        token = RefreshToken(
            token="refresh_token_123",
            user_id=user.id,
            expires_at=expires_at.replace(tzinfo=None),
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0 (Test Browser)",
        )
        specialized_db_session.add(token)
        specialized_db_session.commit()

        # Test initial state
        assert token.is_valid is True
        assert token.is_expired is False
        assert token.is_active is True

        # Test usage tracking
        token.mark_used()
        assert token.last_used_at is not None

        # Test revocation
        token.revoke("User logged out")
        assert token.is_active is False
        assert token.revoked_at is not None
        assert token.revoked_by == "User logged out"
        assert token.is_valid is False

    def test_multiple_refresh_tokens(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test multiple refresh tokens for a user."""
        user = minimal_test_data["user"]

        # Create multiple tokens (different devices)
        tokens = []
        devices = [
            ("mobile_token", "Mobile App", "10.0.0.1"),
            ("desktop_token", "Desktop Browser", "192.168.1.100"),
            ("tablet_token", "Tablet App", "10.0.0.2"),
        ]

        for token_val, user_agent, ip in devices:
            token = RefreshToken(
                token=token_val,
                user_id=user.id,
                expires_at=(datetime.now(UTC) + timedelta(days=30)).replace(
                    tzinfo=None
                ),
                user_agent=user_agent,
                ip_address=ip,
            )
            tokens.append(token)

        specialized_db_session.add_all(tokens)
        specialized_db_session.commit()

        # Test user relationship
        specialized_db_session.refresh(user)
        assert len(user.refresh_tokens) == 3

        # Test selective revocation
        mobile_token = tokens[0]
        mobile_token.revoke("Device lost")

        active_tokens = [t for t in user.refresh_tokens if t.is_active]
        assert len(active_tokens) == 2


# ============================================================================
# SPEC MODEL ADVANCED TESTS
# ============================================================================


class TestSpecModelAdvanced:
    """Advanced tests for Spec model."""

    def test_spec_comprehensive(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test comprehensive Spec functionality."""
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]

        # Create department and project
        department = Department(name="Engineering", company_id=company.id)
        specialized_db_session.add(department)
        specialized_db_session.commit()

        project = Project(
            code="SPEC-001",
            name="Spec Test Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Create comprehensive spec
        spec = Spec(
            project_id=project.id,
            name="Technical Specification v2.0",
            description="Comprehensive technical specification",
            version="2.0",
            content={
                "sections": [
                    {"id": 1, "title": "Introduction", "content": "..."},
                    {"id": 2, "title": "Architecture", "content": "..."},
                    {"id": 3, "title": "API Specification", "content": "..."},
                ],
                "metadata": {
                    "total_pages": 50,
                    "last_review_date": "2024-01-15",
                    "reviewers": ["john.doe", "jane.smith"],
                },
            },
            format="pdf",
            language="en",
            status="approved",
            generated_by=user.id,
            template_id=1,
        )
        specialized_db_session.add(spec)
        specialized_db_session.commit()

        # Test relationships
        assert spec.project == project
        assert spec.generated_by_user == user
        assert spec in project.specs

        # Test JSON content
        assert len(spec.content["sections"]) == 3
        assert spec.content["metadata"]["total_pages"] == 50
        assert "john.doe" in spec.content["metadata"]["reviewers"]

    def test_spec_versioning(self, specialized_db_session: Session, minimal_test_data):
        """Test spec versioning functionality."""
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]

        # Create project
        department = Department(name="Engineering", company_id=company.id)
        specialized_db_session.add(department)
        specialized_db_session.commit()

        project = Project(
            code="VER-001",
            name="Versioning Test Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Create multiple spec versions
        versions = ["1.0", "1.1", "2.0", "2.1"]
        specs = []

        for version in versions:
            spec = Spec(
                project_id=project.id,
                name=f"Spec v{version}",
                version=version,
                generated_by=user.id,
                status="approved" if version != "2.1" else "draft",
            )
            specs.append(spec)

        specialized_db_session.add_all(specs)
        specialized_db_session.commit()

        # Test version querying
        specialized_db_session.refresh(project)
        assert len(project.specs) == 4

        # Query latest approved version
        latest_approved = (
            specialized_db_session.execute(
                select(Spec)
                .where(Spec.project_id == project.id, Spec.status == "approved")
                .order_by(Spec.version.desc())
            )
            .scalars()
            .first()
        )

        assert latest_approved.version == "2.0"


# ============================================================================
# REQUIREMENT GROUP MODELS ADVANCED TESTS
# ============================================================================


class TestRequirementGroupAdvanced:
    """Advanced tests for RequirementGroup models."""

    def test_requirement_group_versioning(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test requirement group versioning system."""
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]

        # Create project
        department = Department(name="Engineering", company_id=company.id)
        specialized_db_session.add(department)
        specialized_db_session.commit()

        project = Project(
            code="GROUP-001",
            name="Group Test Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Create requirement group
        group = RequirementGroup(
            name="Authentication Requirements", project_id=project.id
        )
        specialized_db_session.add(group)
        specialized_db_session.commit()

        # Create multiple versions
        version_data = [
            {
                "version": 1,
                "snapshot": {
                    "requirements": [
                        {"id": 1, "title": "Login functionality"},
                        {"id": 2, "title": "Password reset"},
                    ],
                    "metadata": {"created_by": "john.doe", "reason": "Initial version"},
                },
            },
            {
                "version": 2,
                "snapshot": {
                    "requirements": [
                        {"id": 1, "title": "Login functionality"},
                        {"id": 2, "title": "Password reset"},
                        {"id": 3, "title": "Two-factor authentication"},
                    ],
                    "metadata": {
                        "created_by": "jane.smith",
                        "reason": "Added 2FA requirement",
                    },
                },
            },
        ]

        versions = []
        for version_info in version_data:
            version = RequirementGroupVersion(
                group_id=group.id,
                version=version_info["version"],
                snapshot_data=version_info["snapshot"],
                created_by=user.id,
            )
            versions.append(version)

        specialized_db_session.add_all(versions)
        specialized_db_session.commit()

        # Test relationships
        specialized_db_session.refresh(group)
        specialized_db_session.refresh(user)

        assert len(group.versions) == 2
        assert len(user.group_versions) == 2

        # Test version ordering
        latest_version = (
            specialized_db_session.execute(
                select(RequirementGroupVersion)
                .where(RequirementGroupVersion.group_id == group.id)
                .order_by(RequirementGroupVersion.version.desc())
            )
            .scalars()
            .first()
        )

        assert latest_version.version == 2
        assert len(latest_version.snapshot_data["requirements"]) == 3


# ============================================================================
# DASHBOARD MODELS ADVANCED TESTS
# ============================================================================


class TestDashboardModelsAdvanced:
    """Advanced tests for Dashboard models."""

    def test_dashboard_comprehensive_workflow(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test comprehensive dashboard workflow."""
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]

        # Create project for context
        department = Department(name="Engineering", company_id=company.id)
        specialized_db_session.add(department)
        specialized_db_session.commit()

        project = Project(
            code="DASH-001",
            name="Dashboard Test Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Create dashboard preferences
        preferences = UserDashboardPreferences(
            user_id=user.id,
            show_quick_stats=True,
            show_recent_activity=True,
            show_my_projects=True,
            show_pending_approvals=False,
            default_project_filter="active",
            activity_limit=50,
            refresh_interval=60,
            theme="dark",
            notifications_enabled=True,
            email_notifications=False,
            timezone="America/New_York",
            custom_settings={
                "layout": "grid",
                "card_size": "medium",
                "auto_refresh": True,
            },
        )
        specialized_db_session.add(preferences)
        specialized_db_session.commit()

        # Create notifications
        notifications = [
            DashboardNotification(
                user_id=user.id,
                type="info",
                title="Project Created",
                message="New project has been created",
                project_id=project.id,
                priority="medium",
            ),
            DashboardNotification(
                user_id=user.id,
                type="warning",
                title="Deadline Approaching",
                message="Project deadline is in 3 days",
                project_id=project.id,
                priority="high",
                action_url=f"/projects/{project.id}",
                action_text="View Project",
            ),
        ]
        specialized_db_session.add_all(notifications)
        specialized_db_session.commit()

        # Create activities
        activities = [
            DashboardActivity(
                activity_type="project_created",
                activity_title="Created new project",
                activity_description="Dashboard Test Project was created",
                user_id=user.id,
                user_name=user.name,
                project_id=project.id,
                entity_type="project",
                entity_id=project.id,
                entity_name=project.name,
                status="success",
                extra_data={"project_code": project.code},
            ),
            DashboardActivity(
                activity_type="user_login",
                activity_title="User logged in",
                user_id=user.id,
                user_name=user.name,
                entity_type="user",
                entity_id=user.id,
                entity_name=user.name,
                extra_data={
                    "ip_address": "192.168.1.100",
                    "user_agent": "Test Browser",
                },
            ),
        ]
        specialized_db_session.add_all(activities)
        specialized_db_session.commit()

        # Create widgets
        widgets = [
            DashboardWidget(
                user_id=user.id,
                widget_type="project_stats",
                widget_title="Project Statistics",
                position=1,
                size="large",
                is_visible=True,
                config={
                    "chart_type": "doughnut",
                    "show_percentages": True,
                    "color_scheme": "blue",
                },
            ),
            DashboardWidget(
                user_id=user.id,
                widget_type="recent_activity",
                widget_title="Recent Activity",
                position=2,
                size="medium",
                is_visible=True,
                config={"max_items": 10, "show_timestamps": True},
            ),
        ]
        specialized_db_session.add_all(widgets)
        specialized_db_session.commit()

        # Test all relationships
        specialized_db_session.refresh(user)
        specialized_db_session.refresh(project)

        assert user.dashboard_preferences == preferences
        assert len(user.notifications) == 2
        assert len(user.activities) == 2
        assert len(user.dashboard_widgets) == 2
        assert len(project.notifications) == 2
        assert len(project.activities) == 1  # Only project-related activity

        # Test notification marking as read
        notification = notifications[0]
        notification.is_read = True
        notification.read_at = datetime.now(UTC).replace(tzinfo=None)
        specialized_db_session.commit()

        # Count unread notifications
        unread_count = specialized_db_session.execute(
            select(func.count(DashboardNotification.id)).where(
                DashboardNotification.user_id == user.id,
                DashboardNotification.is_read == False,
            )
        ).scalar()

        assert unread_count == 1


# ============================================================================
# COMPREHENSIVE INTEGRATION TESTS
# ============================================================================


class TestComprehensiveIntegration:
    """Comprehensive integration tests across all models."""

    def test_full_system_integration(
        self, specialized_db_session: Session, minimal_test_data
    ):
        """Test full system integration with all models."""
        # Use existing test data
        company = minimal_test_data["company"]
        user = minimal_test_data["user"]
        req_type = minimal_test_data["requirement_type"]
        req_priority = minimal_test_data["requirement_priority"]
        req_status = minimal_test_data["requirement_status"]
        rel_type = minimal_test_data["relationship_type"]

        # Create complete organizational structure
        department = Department(
            name="Product Engineering", company_id=company.id, type=DepartmentType.ENGINEERING
        )
        specialized_db_session.add(department)
        specialized_db_session.commit()

        team = Team(
            name="Backend Development Team",
            department_id=department.id,
            owner_id=user.id,
        )
        specialized_db_session.add(team)
        specialized_db_session.commit()

        team_member = TeamMember(
            team_id=team.id, user_id=user.id, role=ModelTeamRole.OWNER
        )
        specialized_db_session.add(team_member)
        specialized_db_session.commit()

        # Create project
        project = Project(
            code="FULL-INT-001",
            name="Full Integration Test Project",
            description="Testing all model integrations",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
            team_id=team.id,
        )
        specialized_db_session.add(project)
        specialized_db_session.commit()

        # Create requirements
        req1 = Requirement(
            title="User Authentication",
            description="Implement user authentication system",
            project_id=project.id,
            author_id=user.id,
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
        )

        req2 = Requirement(
            title="User Authorization",
            description="Implement user authorization system",
            project_id=project.id,
            author_id=user.id,
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
        )

        specialized_db_session.add_all([req1, req2])
        specialized_db_session.commit()

        # Create requirement relationship
        req_relationship = Relationship(
            source_id=req2.id, target_id=req1.id, type_id=rel_type.id
        )
        specialized_db_session.add(req_relationship)
        specialized_db_session.commit()

        # Create comments
        comment1 = Comment(
            content="This requirement needs more details",
            requirement_id=req1.id,
            author_id=user.id,
        )

        comment2 = Comment(
            content="Authorization depends on authentication",
            requirement_id=req2.id,
            author_id=user.id,
        )

        specialized_db_session.add_all([comment1, comment2])
        specialized_db_session.commit()

        # Create test results
        test1 = TestResult(
            status=TestStatus.PASSED,
            notes="Authentication tests passed",
            requirement_id=req1.id,
            tester_id=user.id,
        )

        test2 = TestResult(
            status=TestStatus.IN_PROGRESS,
            notes="Authorization tests in progress",
            requirement_id=req2.id,
            tester_id=user.id,
        )

        specialized_db_session.add_all([test1, test2])
        specialized_db_session.commit()

        # Create release
        release = Release(
            version="1.0.0",
            name="Initial Release",
            description="First release with auth system",
            project_id=project.id,
            status=ReleaseStatus.PLANNED,
        )
        specialized_db_session.add(release)
        specialized_db_session.commit()

        # Create specification
        spec = Spec(
            name="Authentication System Specification",
            description="Detailed specification for auth system",
            project_id=project.id,
            generated_by=user.id,
            content={
                "requirements": [req1.id, req2.id],
                "version": "1.0",
                "sections": ["Overview", "Technical Details", "Security"],
            },
        )
        specialized_db_session.add(spec)
        specialized_db_session.commit()

        # Create user profile
        profile = UserProfile(
            user_id=user.id,
            first_name="Integration",
            last_name="Tester",
            position="Senior Developer",
        )
        specialized_db_session.add(profile)
        specialized_db_session.commit()

        # Create dashboard elements
        notification = DashboardNotification(
            user_id=user.id,
            type="info",
            title="Integration Test Complete",
            message="All models integrated successfully",
            project_id=project.id,
        )

        activity = DashboardActivity(
            activity_type="integration_test",
            activity_title="Integration test completed",
            user_id=user.id,
            user_name=user.name,
            project_id=project.id,
            entity_type="project",
            entity_id=project.id,
            entity_name=project.name,
        )

        specialized_db_session.add_all([notification, activity])
        specialized_db_session.commit()

        # Verify complete integration
        specialized_db_session.refresh(user)
        specialized_db_session.refresh(company)
        specialized_db_session.refresh(project)

        # Test organizational structure
        assert user.company == company
        assert user.profile.first_name == "Integration"
        assert len(user.team_memberships) == 1
        assert user.team_memberships[0].team == team
        assert team.owner == user
        assert team.department == department
        assert department.company == company

        # Test project structure
        assert project.owner == user
        assert project.team == team
        assert project.department == department
        assert project.company == company
        assert len(project.requirements) == 2

        # Test requirements
        assert req1.project == project
        assert req1.author == user
        assert len(req1.comments) == 1
        assert len(req1.test_results) == 1
        assert len(req1.target_relationships) == 1  # req2 depends on req1

        assert req2.project == project
        assert len(req2.source_relationships) == 1  # req2 depends on req1

        # Test dashboard integration
        assert len(user.notifications) == 1
        assert len(user.activities) == 1
        assert len(project.notifications) == 1
        assert len(project.activities) == 1

        # Test release and spec
        assert release.project == project
        assert spec.project == project
        assert spec.generated_by_user == user

        # Verify data consistency
        total_requirements = specialized_db_session.execute(
            select(func.count(Requirement.id)).where(
                Requirement.project_id == project.id
            )
        ).scalar()
        assert total_requirements == 2

        total_comments = specialized_db_session.execute(
            select(func.count(Comment.id))
            .join(Requirement, Comment.requirement_id == Requirement.id)
            .where(Requirement.project_id == project.id)
        ).scalar()
        assert total_comments == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
