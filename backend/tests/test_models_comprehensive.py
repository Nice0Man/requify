"""
Comprehensive tests for ALL models in the application.
Tests relationships, validations, constraints, and business logic.
Based on SQLAlchemy best practices and pytest patterns.
"""

import pytest
from datetime import datetime, UTC, timedelta
from typing import Dict, Any, List
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import IntegrityError

# Import all models
from app.models.base import Base
from app.models.user import User
from app.models.company import Company, CompanyStatus, CompanyType
from app.models.department import Department, DepartmentType
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.requirement_types import RequirementType
from app.models.requirement_priorities import RequirementPriority
from app.models.requirement_statuses import RequirementStatus
from app.models.comment import Comment
from app.models.release import Release, ReleaseStatus
from app.models.spec import Spec
from app.models.relationship import Relationship
from app.models.relationship_types import RelationshipType
from app.models.requirement_group import RequirementGroup
from app.models.requirement_group_version import RequirementGroupVersion
from app.models.test_result import TestResult, TestStatus
from app.models.user_profile import UserProfile
from app.models.user_settings import UserSettings
from app.models.refresh_token import RefreshToken
from app.models.dashboard import (
    UserDashboardPreferences,
    DashboardNotification,
    DashboardActivity,
    DashboardWidget,
)
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.constants import TeamRole, ProjectStatus
from app.core.constants import RoleScope, SystemRole


# ============================================================================
# FIXTURES AND SETUP
# ============================================================================


@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def sample_company(db_session: Session) -> Company:
    """Create a sample company for testing."""
    company = Company(
        name="Test Company",
        slug="test-company",
        description="A test company for unit tests",
        status=CompanyStatus.ACTIVE,
        company_type=CompanyType.SMALL_BUSINESS,
    )
    db_session.add(company)
    db_session.commit()
    return company


@pytest.fixture
def sample_user(db_session: Session, sample_company: Company) -> User:
    """Create a sample user for testing."""
    user = User(
        email="test@example.com",
        password_hash="hashed_password",
        name="Test User",
        is_active=True,
        company_id=sample_company.id,
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def sample_department(db_session: Session, sample_company: Company) -> Department:
    """Create a sample department for testing."""
    department = Department(
        name="Engineering",
        description="Software engineering department",
        type=DepartmentType.ENGINEERING,
        company_id=sample_company.id,
    )
    db_session.add(department)
    db_session.commit()
    return department


@pytest.fixture
def sample_team(
    db_session: Session, sample_department: Department, sample_user: User
) -> Team:
    """Create a sample team for testing."""
    team = Team(
        name="Backend Team",
        description="Backend development team",
        department_id=sample_department.id,
        owner_id=sample_user.id,
    )
    db_session.add(team)
    db_session.commit()
    return team


@pytest.fixture
def sample_project(
    db_session: Session,
    sample_company: Company,
    sample_department: Department,
    sample_user: User,
    sample_team: Team,
) -> Project:
    """Create a sample project for testing."""
    project = Project(
        code="TEST-001",
        name="Test Project",
        description="A test project",
        status=ProjectStatus.DRAFT,
        company_id=sample_company.id,
        department_id=sample_department.id,
        owner_id=sample_user.id,
        team_id=sample_team.id,
    )
    db_session.add(project)
    db_session.commit()
    return project


@pytest.fixture
def reference_data(db_session: Session):
    """Create reference data for testing."""
    # Requirement types
    req_type = RequirementType(name="Functional", description="Functional requirements")
    req_priority = RequirementPriority(name="High", level=8, color="#FF0000")
    req_status = RequirementStatus(name="Draft", color="#CCCCCC")
    rel_type = RelationshipType(name="depends_on")

    db_session.add_all([req_type, req_priority, req_status, rel_type])
    db_session.commit()

    return {
        "requirement_type": req_type,
        "requirement_priority": req_priority,
        "requirement_status": req_status,
        "relationship_type": rel_type,
    }


# ============================================================================
# BASE MODEL TESTS
# ============================================================================


class TestBaseModel:
    """Test base model functionality."""

    def test_timestamped_mixin(self, db_session: Session, sample_user: User):
        """Test that TimestampedMixin works correctly."""
        initial_created = sample_user.created_at
        initial_updated = sample_user.updated_at

        assert initial_created is not None
        assert initial_updated is not None
        # Allow small difference due to microsecond precision
        assert abs((initial_created - initial_updated).total_seconds()) < 1

        # Update the user
        sample_user.name = "Updated Name"
        db_session.commit()

        # Check that updated_at changed
        assert sample_user.updated_at > initial_updated
        assert sample_user.created_at == initial_created


# ============================================================================
# COMPANY MODEL TESTS
# ============================================================================


class TestCompanyModel:
    """Test Company model."""

    def test_company_creation(self, db_session: Session):
        """Test basic company creation."""
        company = Company(
            name="Acme Corp",
            slug="acme-corp",
            description="A test company",
            status=CompanyStatus.ACTIVE,
            company_type=CompanyType.STARTUP,
        )
        db_session.add(company)
        db_session.commit()

        assert company.id is not None
        assert company.name == "Acme Corp"
        assert company.is_active is True

    def test_company_unique_slug(self, db_session: Session):
        """Test that company slug must be unique."""
        company1 = Company(name="Company 1", slug="test-slug")
        company2 = Company(name="Company 2", slug="test-slug")

        db_session.add(company1)
        db_session.commit()

        db_session.add(company2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_company_relationships(
        self, db_session: Session, sample_company: Company, sample_user: User
    ):
        """Test company relationships."""
        assert sample_user in sample_company.users
        assert sample_user.company == sample_company


# ============================================================================
# USER MODEL TESTS
# ============================================================================


class TestUserModel:
    """Test User model."""

    def test_user_creation(self, db_session: Session, sample_company: Company):
        """Test basic user creation."""
        user = User(
            email="newuser@example.com",
            password_hash="hashed_password",
            name="New User",
            company_id=sample_company.id,
        )
        db_session.add(user)
        db_session.commit()

        assert user.id is not None
        assert user.email == "newuser@example.com"
        assert user.is_active is True

    def test_user_unique_email(self, db_session: Session, sample_company: Company):
        """Test that user email must be unique."""
        user1 = User(
            email="test@example.com",
            password_hash="hash1",
            name="User 1",
            company_id=sample_company.id,
        )
        user2 = User(
            email="test@example.com",
            password_hash="hash2",
            name="User 2",
            company_id=sample_company.id,
        )

        db_session.add(user1)
        db_session.commit()

        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_company_relationship(
        self, db_session: Session, sample_user: User, sample_company: Company
    ):
        """Test user-company relationship."""
        assert sample_user.company == sample_company
        assert sample_user in sample_company.users

    def test_user_profile_relationship(self, db_session: Session, sample_user: User):
        """Test user-profile relationship."""
        profile = UserProfile(
            user_id=sample_user.id,
            first_name="Test",
            last_name="User",
            display_name="Test User",
        )
        db_session.add(profile)
        db_session.commit()

        # Refresh the user
        db_session.refresh(sample_user)

        assert sample_user.profile == profile
        assert profile.user == sample_user


# ============================================================================
# DEPARTMENT MODEL TESTS
# ============================================================================


class TestDepartmentModel:
    """Test Department model."""

    def test_department_creation(self, db_session: Session, sample_company: Company):
        """Test basic department creation."""
        department = Department(
            name="Marketing",
            description="Marketing department",
            type=DepartmentType.MARKETING,
            company_id=sample_company.id,
        )
        db_session.add(department)
        db_session.commit()

        assert department.id is not None
        assert department.type == DepartmentType.MARKETING

    def test_department_company_relationship(
        self,
        db_session: Session,
        sample_department: Department,
        sample_company: Company,
    ):
        """Test department-company relationship."""
        assert sample_department.company == sample_company
        assert sample_department in sample_company.departments


# ============================================================================
# TEAM MODEL TESTS
# ============================================================================


class TestTeamModel:
    """Test Team model."""

    def test_team_creation(
        self, db_session: Session, sample_department: Department, sample_user: User
    ):
        """Test basic team creation."""
        team = Team(
            name="QA Team",
            description="Quality assurance team",
            department_id=sample_department.id,
            owner_id=sample_user.id,
        )
        db_session.add(team)
        db_session.commit()

        assert team.id is not None
        assert team.is_active is True

    def test_team_relationships(
        self,
        db_session: Session,
        sample_team: Team,
        sample_department: Department,
        sample_user: User,
    ):
        """Test team relationships."""
        assert sample_team.department == sample_department
        assert sample_team.owner == sample_user
        assert sample_team in sample_department.teams
        assert sample_team in sample_user.owned_teams


# ============================================================================
# TEAM MEMBER MODEL TESTS
# ============================================================================


class TestTeamMemberModel:
    """Test TeamMember model."""

    def test_team_member_creation(
        self, db_session: Session, sample_team: Team, sample_user: User
    ):
        """Test basic team member creation."""
        member = TeamMember(
            team_id=sample_team.id,
            user_id=sample_user.id,
            role=TeamRole.DEVELOPER,
            title="Senior Developer",
        )
        db_session.add(member)
        db_session.commit()

        assert member.id is not None
        assert member.role == TeamRole.DEVELOPER
        assert member.is_active is True

    def test_team_member_unique_constraint(
        self, db_session: Session, sample_team: Team, sample_user: User
    ):
        """Test that team-user combination must be unique."""
        member1 = TeamMember(
            team_id=sample_team.id, user_id=sample_user.id, role=TeamRole.DEVELOPER
        )
        member2 = TeamMember(
            team_id=sample_team.id, user_id=sample_user.id, role=TeamRole.LEAD
        )

        db_session.add(member1)
        db_session.commit()

        db_session.add(member2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_team_member_relationships(
        self, db_session: Session, sample_team: Team, sample_user: User
    ):
        """Test team member relationships."""
        member = TeamMember(
            team_id=sample_team.id, user_id=sample_user.id, role=TeamRole.DEVELOPER
        )
        db_session.add(member)
        db_session.commit()

        assert member.team == sample_team
        assert member.user == sample_user
        assert member in sample_team.members
        assert member in sample_user.team_memberships

    def test_team_member_permissions(
        self, db_session: Session, sample_team: Team, sample_user: User
    ):
        """Test team member permission methods."""
        owner = TeamMember(
            team_id=sample_team.id, user_id=sample_user.id, role=TeamRole.OWNER
        )
        developer = TeamMember(
            team_id=sample_team.id, user_id=sample_user.id, role=TeamRole.DEVELOPER
        )

        assert owner.is_owner is True
        assert owner.is_admin is True
        assert owner.can_manage_members is True
        assert owner.can_manage_settings is True
        assert owner.has_permission("full_access") is True

        assert developer.is_owner is False
        assert developer.is_admin is False
        assert developer.can_manage_members is False
        assert developer.can_manage_settings is False
        assert developer.has_permission("read") is True
        assert developer.has_permission("full_access") is False


# ============================================================================
# PROJECT MODEL TESTS
# ============================================================================


class TestProjectModel:
    """Test Project model."""

    def test_project_creation(
        self,
        db_session: Session,
        sample_company: Company,
        sample_department: Department,
        sample_user: User,
    ):
        """Test basic project creation."""
        project = Project(
            code="PROJ-001",
            name="Test Project",
            description="A test project",
            company_id=sample_company.id,
            department_id=sample_department.id,
            owner_id=sample_user.id,
        )
        db_session.add(project)
        db_session.commit()

        assert project.id is not None
        assert project.status == ProjectStatus.DRAFT

    def test_project_unique_code(
        self,
        db_session: Session,
        sample_company: Company,
        sample_department: Department,
        sample_user: User,
    ):
        """Test that project code must be unique."""
        project1 = Project(
            code="UNIQUE-001",
            name="Project 1",
            company_id=sample_company.id,
            department_id=sample_department.id,
            owner_id=sample_user.id,
        )
        project2 = Project(
            code="UNIQUE-001",
            name="Project 2",
            company_id=sample_company.id,
            department_id=sample_department.id,
            owner_id=sample_user.id,
        )

        db_session.add(project1)
        db_session.commit()

        db_session.add(project2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_project_relationships(
        self,
        db_session: Session,
        sample_project: Project,
        sample_company: Company,
        sample_department: Department,
        sample_user: User,
        sample_team: Team,
    ):
        """Test project relationships."""
        assert sample_project.company == sample_company
        assert sample_project.department == sample_department
        assert sample_project.owner == sample_user
        assert sample_project.team == sample_team

        assert sample_project in sample_company.projects
        assert sample_project in sample_department.projects
        assert sample_project in sample_user.owned_projects
        assert sample_project in sample_team.projects


# ============================================================================
# REQUIREMENT MODEL TESTS
# ============================================================================


class TestRequirementModel:
    """Test Requirement model."""

    def test_requirement_creation(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test basic requirement creation."""
        requirement = Requirement(
            title="Test Requirement",
            description="A test requirement",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        assert requirement.id is not None
        assert requirement.title == "Test Requirement"

    def test_requirement_relationships(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test requirement relationships."""
        requirement = Requirement(
            title="Test Requirement",
            description="A test requirement",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        assert requirement.project == sample_project
        assert requirement.author == sample_user
        assert requirement.type == reference_data["requirement_type"]
        assert requirement.priority == reference_data["requirement_priority"]
        assert requirement.status == reference_data["requirement_status"]

        assert requirement in sample_project.requirements
        assert requirement in sample_user.authored_requirements
        assert requirement in reference_data["requirement_type"].requirements


# ============================================================================
# COMMENT MODEL TESTS
# ============================================================================


class TestCommentModel:
    """Test Comment model."""

    def test_comment_creation(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test basic comment creation."""
        # First create a requirement
        requirement = Requirement(
            title="Test Requirement",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        # Now create a comment
        comment = Comment(
            content="This is a test comment",
            requirement_id=requirement.id,
            author_id=sample_user.id,
        )
        db_session.add(comment)
        db_session.commit()

        assert comment.id is not None
        assert comment.content == "This is a test comment"

    def test_comment_relationships(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test comment relationships."""
        # Create requirement first
        requirement = Requirement(
            title="Test Requirement",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        # Create comment
        comment = Comment(
            content="Test comment",
            requirement_id=requirement.id,
            author_id=sample_user.id,
        )
        db_session.add(comment)
        db_session.commit()

        assert comment.requirement == requirement
        assert comment.author == sample_user
        assert comment in requirement.comments
        assert comment in sample_user.comments


# ============================================================================
# RELEASE MODEL TESTS
# ============================================================================


class TestReleaseModel:
    """Test Release model."""

    def test_release_creation(self, db_session: Session, sample_project: Project):
        """Test basic release creation."""
        release = Release(
            version="1.0.0",
            name="Initial Release",
            description="First release of the project",
            project_id=sample_project.id,
        )
        db_session.add(release)
        db_session.commit()

        assert release.id is not None
        assert release.status == ReleaseStatus.PLANNED

    def test_release_relationships(self, db_session: Session, sample_project: Project):
        """Test release relationships."""
        release = Release(
            version="1.0.0", name="Test Release", project_id=sample_project.id
        )
        db_session.add(release)
        db_session.commit()

        assert release.project == sample_project
        assert release in sample_project.releases


# ============================================================================
# SPEC MODEL TESTS
# ============================================================================


class TestSpecModel:
    """Test Spec model."""

    def test_spec_creation(
        self, db_session: Session, sample_project: Project, sample_user: User
    ):
        """Test basic spec creation."""
        spec = Spec(
            name="Technical Specification",
            description="Technical specification for the project",
            project_id=sample_project.id,
            generated_by=sample_user.id,
        )
        db_session.add(spec)
        db_session.commit()

        assert spec.id is not None
        assert spec.version == "1.0"

    def test_spec_relationships(
        self, db_session: Session, sample_project: Project, sample_user: User
    ):
        """Test spec relationships."""
        spec = Spec(
            name="Test Spec", project_id=sample_project.id, generated_by=sample_user.id
        )
        db_session.add(spec)
        db_session.commit()

        assert spec.project == sample_project
        assert spec.generated_by_user == sample_user
        assert spec in sample_project.specs


# ============================================================================
# RELATIONSHIP MODEL TESTS
# ============================================================================


class TestRelationshipModel:
    """Test Relationship model."""

    def test_relationship_creation(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test basic relationship creation."""
        # Create two requirements
        req1 = Requirement(
            title="Requirement 1",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        req2 = Requirement(
            title="Requirement 2",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add_all([req1, req2])
        db_session.commit()

        # Create relationship
        relationship = Relationship(
            source_id=req1.id,
            target_id=req2.id,
            type_id=reference_data["relationship_type"].id,
        )
        db_session.add(relationship)
        db_session.commit()

        assert relationship.source_id == req1.id
        assert relationship.target_id == req2.id

    def test_relationship_relationships(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test relationship relationships."""
        # Create requirements
        req1 = Requirement(
            title="Requirement 1",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        req2 = Requirement(
            title="Requirement 2",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add_all([req1, req2])
        db_session.commit()

        # Create relationship
        relationship = Relationship(
            source_id=req1.id,
            target_id=req2.id,
            type_id=reference_data["relationship_type"].id,
        )
        db_session.add(relationship)
        db_session.commit()

        assert relationship.source == req1
        assert relationship.target == req2
        assert relationship.type == reference_data["relationship_type"]
        assert relationship in req1.source_relationships
        assert relationship in req2.target_relationships


# ============================================================================
# TEST RESULT MODEL TESTS
# ============================================================================


class TestTestResultModel:
    """Test TestResult model."""

    def test_test_result_creation(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test basic test result creation."""
        # Create requirement first
        requirement = Requirement(
            title="Test Requirement",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        # Create test result
        test_result = TestResult(
            status=TestStatus.PASSED,
            notes="Test passed successfully",
            requirement_id=requirement.id,
            tester_id=sample_user.id,
        )
        db_session.add(test_result)
        db_session.commit()

        assert test_result.id is not None
        assert test_result.status == TestStatus.PASSED

    def test_test_result_relationships(
        self,
        db_session: Session,
        sample_project: Project,
        sample_user: User,
        reference_data,
    ):
        """Test test result relationships."""
        # Create requirement
        requirement = Requirement(
            title="Test Requirement",
            project_id=sample_project.id,
            author_id=sample_user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        # Create test result
        test_result = TestResult(
            status=TestStatus.PASSED,
            requirement_id=requirement.id,
            tester_id=sample_user.id,
        )
        db_session.add(test_result)
        db_session.commit()

        assert test_result.requirement == requirement
        assert test_result.tester == sample_user
        assert test_result in requirement.test_results
        assert test_result in sample_user.test_results


# ============================================================================
# USER PROFILE MODEL TESTS
# ============================================================================


class TestUserProfileModel:
    """Test UserProfile model."""

    def test_user_profile_creation(self, db_session: Session, sample_user: User):
        """Test basic user profile creation."""
        profile = UserProfile(
            user_id=sample_user.id,
            first_name="John",
            last_name="Doe",
            display_name="John Doe",
            position="Software Engineer",
            department="Engineering",
        )
        db_session.add(profile)
        db_session.commit()

        assert profile.id is not None
        assert profile.profile_completed is False

    def test_user_profile_business_logic(self, db_session: Session, sample_user: User):
        """Test user profile business logic methods."""
        profile = UserProfile(
            user_id=sample_user.id,
            first_name="John",
            last_name="Doe",
            display_name="John Doe",
        )

        assert profile.full_name == "Doe John"
        assert profile.short_name == "Doe J."

        completion = profile.calculate_completion_percentage()
        assert completion > 0

        profile.update_completion_status()
        assert profile.profile_completion_percentage == completion


# ============================================================================
# USER SETTINGS MODEL TESTS
# ============================================================================


class TestUserSettingsModel:
    """Test UserSettings model."""

    def test_user_settings_creation(self, db_session: Session, sample_user: User):
        """Test basic user settings creation."""
        settings = UserSettings(
            user_id=sample_user.id,
            notification_settings={"email": True, "push": False},
            interface_settings={"theme": "dark", "language": "en"},
        )
        db_session.add(settings)
        db_session.commit()

        assert settings.id is not None
        assert settings.notification_settings["email"] is True

    def test_user_settings_relationship(self, db_session: Session, sample_user: User):
        """Test user settings relationship."""
        settings = UserSettings(
            user_id=sample_user.id, notification_settings={"email": True}
        )
        db_session.add(settings)
        db_session.commit()

        db_session.refresh(sample_user)

        assert sample_user.settings == settings
        assert settings.user == sample_user


# ============================================================================
# REFRESH TOKEN MODEL TESTS
# ============================================================================


class TestRefreshTokenModel:
    """Test RefreshToken model."""

    def test_refresh_token_creation(self, db_session: Session, sample_user: User):
        """Test basic refresh token creation."""
        expires_at = datetime.now(UTC) + timedelta(days=30)
        token = RefreshToken(
            token="test_token_123",
            user_id=sample_user.id,
            expires_at=expires_at.replace(tzinfo=None),
        )
        db_session.add(token)
        db_session.commit()

        assert token.id is not None
        assert token.is_active is True
        assert token.is_expired is False
        assert token.is_valid is True

    def test_refresh_token_expiration(self, db_session: Session, sample_user: User):
        """Test refresh token expiration logic."""
        # Create expired token
        expires_at = datetime.now(UTC) - timedelta(days=1)
        token = RefreshToken(
            token="expired_token",
            user_id=sample_user.id,
            expires_at=expires_at.replace(tzinfo=None),
            is_active=True  # Set explicitly
        )

        assert token.is_expired is True
        assert token.is_valid is False

    def test_refresh_token_revocation(self, db_session: Session, sample_user: User):
        """Test refresh token revocation."""
        expires_at = datetime.now(UTC) + timedelta(days=30)
        token = RefreshToken(
            token="test_token",
            user_id=sample_user.id,
            expires_at=expires_at.replace(tzinfo=None),
        )

        token.revoke("User logged out")

        assert token.is_active is False
        assert token.revoked_by == "User logged out"
        assert token.revoked_at is not None
        assert token.is_valid is False


# ============================================================================
# DASHBOARD MODEL TESTS
# ============================================================================


class TestDashboardModels:
    """Test Dashboard related models."""

    def test_dashboard_preferences_creation(
        self, db_session: Session, sample_user: User
    ):
        """Test dashboard preferences creation."""
        preferences = UserDashboardPreferences(
            user_id=sample_user.id,
            show_quick_stats=True,
            theme="dark",
            custom_settings={"layout": "grid"},
        )
        db_session.add(preferences)
        db_session.commit()

        assert preferences.id is not None
        assert preferences.theme == "dark"

    def test_dashboard_notification_creation(
        self, db_session: Session, sample_user: User, sample_project: Project
    ):
        """Test dashboard notification creation."""
        notification = DashboardNotification(
            user_id=sample_user.id,
            type="info",
            title="Test Notification",
            message="This is a test notification",
            project_id=sample_project.id,
        )
        db_session.add(notification)
        db_session.commit()

        assert notification.id is not None
        assert notification.is_read is False

    def test_dashboard_activity_creation(
        self, db_session: Session, sample_user: User, sample_project: Project
    ):
        """Test dashboard activity creation."""
        activity = DashboardActivity(
            activity_type="project_created",
            activity_title="Project Created",
            user_id=sample_user.id,
            user_name=sample_user.name,
            project_id=sample_project.id,
            entity_type="project",
            entity_id=sample_project.id,
            entity_name=sample_project.name,
        )
        db_session.add(activity)
        db_session.commit()

        assert activity.id is not None
        assert activity.activity_type == "project_created"

    def test_dashboard_widget_creation(self, db_session: Session, sample_user: User):
        """Test dashboard widget creation."""
        widget = DashboardWidget(
            user_id=sample_user.id,
            widget_type="stats",
            widget_title="Project Statistics",
            position=1,
            config={"chart_type": "pie"},
        )
        db_session.add(widget)
        db_session.commit()

        assert widget.id is not None
        assert widget.is_visible is True

    def test_dashboard_relationships(
        self, db_session: Session, sample_user: User, sample_project: Project
    ):
        """Test dashboard model relationships."""
        # Create preferences
        preferences = UserDashboardPreferences(user_id=sample_user.id)
        notification = DashboardNotification(
            user_id=sample_user.id,
            type="info",
            title="Test",
            message="Test message",
            project_id=sample_project.id,
        )
        activity = DashboardActivity(
            activity_type="test",
            activity_title="Test",
            user_id=sample_user.id,
            user_name=sample_user.name,
        )
        widget = DashboardWidget(
            user_id=sample_user.id, widget_type="test", widget_title="Test Widget"
        )

        db_session.add_all([preferences, notification, activity, widget])
        db_session.commit()

        db_session.refresh(sample_user)
        db_session.refresh(sample_project)

        assert preferences in [sample_user.dashboard_preferences]
        assert notification in sample_user.notifications
        assert notification in sample_project.notifications
        assert activity in sample_user.activities
        assert widget in sample_user.dashboard_widgets


# ============================================================================
# ENHANCED ROLE SYSTEM TESTS
# ============================================================================


class TestEnhancedRoleSystem:
    """Test Enhanced Role System models."""

    def test_enhanced_role_creation(self, db_session: Session):
        """Test enhanced role creation."""
        role = EnhancedRole(
            name="system_admin",
            display_name="System Administrator",
            description="Full system access",
            scope=RoleScope.SYSTEM.value,  # Use .value for SQLite compatibility
            role_level=10,
            system_role=SystemRole.SYSTEM_ADMIN.value,  # Use correct enum value
            is_system=True,
        )
        db_session.add(role)
        db_session.commit()

        assert role.id is not None
        assert role.scope == RoleScope.SYSTEM.value

    def test_user_role_assignment_creation(
        self, db_session: Session, sample_user: User, sample_company: Company
    ):
        """Test user role assignment creation."""
        # Create role first
        role = EnhancedRole(
            name="company_admin",
            display_name="Company Administrator",
            scope=RoleScope.COMPANY.value,
            role_level=8,
        )
        db_session.add(role)
        db_session.commit()

        # Create assignment
        assignment = UserRoleAssignment(
            user_id=sample_user.id,
            role_id=role.id,
            company_id=sample_company.id,
            is_primary=True,
        )
        db_session.add(assignment)
        db_session.commit()

        assert assignment.id is not None
        assert assignment.is_valid is True
        assert assignment.scope_level == RoleScope.COMPANY.value

    def test_user_role_assignment_expiration(
        self, db_session: Session, sample_user: User
    ):
        """Test user role assignment expiration logic."""
        role = EnhancedRole(
            name="test_role", display_name="Test Role", scope=RoleScope.SYSTEM.value
        )
        db_session.add(role)
        db_session.commit()

        # Create expired assignment
        assignment = UserRoleAssignment(
            user_id=sample_user.id,
            role_id=role.id,
            expires_at=(datetime.now(UTC) - timedelta(days=1)).replace(tzinfo=None),
        )

        assert assignment.is_expired is True
        assert assignment.is_valid is False

    def test_user_role_assignment_relationships(
        self, db_session: Session, sample_user: User
    ):
        """Test user role assignment relationships."""
        role = EnhancedRole(
            name="test_role", display_name="Test Role", scope=RoleScope.SYSTEM.value
        )
        db_session.add(role)
        db_session.commit()

        assignment = UserRoleAssignment(user_id=sample_user.id, role_id=role.id)
        db_session.add(assignment)
        db_session.commit()

        assert assignment.user == sample_user
        assert assignment.role == role
        assert assignment in sample_user.role_assignments


# ============================================================================
# REQUIREMENT GROUP MODELS TESTS
# ============================================================================


class TestRequirementGroupModels:
    """Test Requirement Group models."""

    def test_requirement_group_creation(
        self, db_session: Session, sample_project: Project
    ):
        """Test requirement group creation."""
        group = RequirementGroup(
            name="Authentication Requirements", project_id=sample_project.id
        )
        db_session.add(group)
        db_session.commit()

        assert group.id is not None
        assert group.name == "Authentication Requirements"

    def test_requirement_group_version_creation(
        self, db_session: Session, sample_project: Project, sample_user: User
    ):
        """Test requirement group version creation."""
        group = RequirementGroup(name="Test Group", project_id=sample_project.id)
        db_session.add(group)
        db_session.commit()

        version = RequirementGroupVersion(
            group_id=group.id,
            version=1,
            snapshot_data={"requirements": [], "metadata": {}},
            created_by=sample_user.id,
        )
        db_session.add(version)
        db_session.commit()

        assert version.id is not None
        assert version.version == 1

    def test_requirement_group_relationships(
        self, db_session: Session, sample_project: Project, sample_user: User
    ):
        """Test requirement group relationships."""
        group = RequirementGroup(name="Test Group", project_id=sample_project.id)
        db_session.add(group)
        db_session.commit()

        version = RequirementGroupVersion(
            group_id=group.id, version=1, snapshot_data={}, created_by=sample_user.id
        )
        db_session.add(version)
        db_session.commit()

        assert group.project == sample_project
        assert version.group == group
        assert version.created_by_user == sample_user
        assert group in sample_project.requirement_groups
        assert version in group.versions
        assert version in sample_user.group_versions


# ============================================================================
# INTEGRATION TESTS
# ============================================================================


class TestModelIntegration:
    """Test model integration and complex relationships."""

    def test_complete_workflow(self, db_session: Session, reference_data):
        """Test complete workflow with all models."""
        # Create company
        company = Company(name="Integration Test Co", slug="integration-test")
        db_session.add(company)
        db_session.commit()

        # Create user
        user = User(
            email="integration@test.com",
            password_hash="hash",
            name="Integration User",
            company_id=company.id,
        )
        db_session.add(user)
        db_session.commit()

        # Create user profile
        profile = UserProfile(
            user_id=user.id, first_name="Integration", last_name="User"
        )
        db_session.add(profile)
        db_session.commit()

        # Create department
        department = Department(
            name="Engineering", company_id=company.id, type=DepartmentType.ENGINEERING
        )
        db_session.add(department)
        db_session.commit()

        # Create team
        team = Team(name="Backend Team", department_id=department.id, owner_id=user.id)
        db_session.add(team)
        db_session.commit()

        # Create team member
        member = TeamMember(team_id=team.id, user_id=user.id, role=TeamRole.OWNER)
        db_session.add(member)
        db_session.commit()

        # Create project
        project = Project(
            code="INT-001",
            name="Integration Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
            team_id=team.id,
        )
        db_session.add(project)
        db_session.commit()

        # Create requirement
        requirement = Requirement(
            title="Integration Requirement",
            project_id=project.id,
            author_id=user.id,
            type_id=reference_data["requirement_type"].id,
            priority_id=reference_data["requirement_priority"].id,
            status_id=reference_data["requirement_status"].id,
        )
        db_session.add(requirement)
        db_session.commit()

        # Create comment
        comment = Comment(
            content="Integration test comment",
            requirement_id=requirement.id,
            author_id=user.id,
        )
        db_session.add(comment)
        db_session.commit()

        # Create test result
        test_result = TestResult(
            status=TestStatus.PASSED, requirement_id=requirement.id, tester_id=user.id
        )
        db_session.add(test_result)
        db_session.commit()

        # Verify all relationships
        assert user.company == company
        assert user.profile == profile
        assert user in company.users
        assert member.team == team
        assert member.user == user
        assert project.owner == user
        assert project.team == team
        assert requirement.project == project
        assert requirement.author == user
        assert comment.requirement == requirement
        assert comment.author == user
        assert test_result.requirement == requirement
        assert test_result.tester == user

        # Verify collections
        assert len(user.owned_projects) == 1
        assert len(user.authored_requirements) == 1
        assert len(user.comments) == 1
        assert len(user.test_results) == 1
        assert len(project.requirements) == 1
        assert len(requirement.comments) == 1
        assert len(requirement.test_results) == 1

    def test_cascade_deletes(
        self, db_session: Session, sample_company: Company, sample_user: User
    ):
        """Test cascade delete behavior."""
        # Create user profile
        profile = UserProfile(user_id=sample_user.id, first_name="Test")
        db_session.add(profile)
        db_session.commit()

        # Create dashboard preferences
        preferences = UserDashboardPreferences(user_id=sample_user.id)
        db_session.add(preferences)
        db_session.commit()

        user_id = sample_user.id

        # Delete user should cascade to profile and preferences
        db_session.delete(sample_user)
        db_session.commit()

        # Verify cascades
        assert db_session.get(UserProfile, profile.id) is None
        assert db_session.get(UserDashboardPreferences, preferences.id) is None

    def test_constraint_violations(self, db_session: Session, sample_company: Company):
        """Test constraint violations."""
        # Test unique email constraint
        existing_user = User(
            email="existing@test.com",
            password_hash="hash",
            name="Existing User",
            company_id=sample_company.id,
        )
        db_session.add(existing_user)
        db_session.commit()

        # Test duplicate email constraint
        with pytest.raises(IntegrityError):
            duplicate_user = User(
                email="existing@test.com",  # Same email
                password_hash="hash2",
                name="Duplicate User",
                company_id=sample_company.id,
            )
            db_session.add(duplicate_user)
            db_session.commit()

    def test_query_performance(self, db_session: Session, sample_company: Company):
        """Test query performance and N+1 prevention."""
        # Create multiple users with profiles
        users = []
        for i in range(5):
            user = User(
                email=f"user{i}@test.com",
                password_hash="hash",
                name=f"User {i}",
                company_id=sample_company.id,
            )
            db_session.add(user)
            users.append(user)

        db_session.commit()

        for user in users:
            profile = UserProfile(
                user_id=user.id,
                first_name=f"First{user.id}",
                last_name=f"Last{user.id}",
            )
            db_session.add(profile)

        db_session.commit()

        # Test eager loading to prevent N+1
        from sqlalchemy.orm import selectinload

        query_users = (
            db_session.execute(
                select(User)
                .options(selectinload(User.profile))
                .where(User.company_id == sample_company.id)
            )
            .scalars()
            .all()
        )

        assert len(query_users) == 5

        # Access profiles without additional queries
        for user in query_users:
            assert user.profile is not None
            assert user.profile.first_name.startswith("First")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
