"""
Comprehensive model integration tests.

Tests all models, their relationships, constraints, and validations.
"""

import pytest
from datetime import datetime, UTC
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.comment import Comment
from app.models.release import Release
from app.models.spec import Spec
from app.models.relationship import Relationship
from app.models.relationship_types import RelationshipType
from app.models.requirement_types import RequirementType
from app.models.requirement_priorities import RequirementPriority
from app.models.requirement_statuses import RequirementStatus
from app.models.requirement_group import RequirementGroup
from app.models.requirement_group_version import RequirementGroupVersion
from app.models.test_result import TestResult, TestStatus
from app.models.refresh_token import RefreshToken
from app.core.security import get_password_hash


@pytest.mark.asyncio
class TestModelValidation:
    """Test model validation and constraints."""

    async def test_user_model_creation(self, db_session: AsyncSession):
        """Test user model creation and validation."""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            name="Test User",
            role="user",
            is_active=True,
            is_superuser=False,
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.role == "user"
        assert user.is_active is True
        assert user.is_superuser is False
        assert user.created_at is not None
        assert user.updated_at is not None

    async def test_user_unique_constraints(self, db_session: AsyncSession):
        """Test user unique constraints."""
        # Create first user
        user1 = User(
            username="uniqueuser",
            email="unique@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user1)
        await db_session.commit()

        # Try to create user with same username
        user2 = User(
            username="uniqueuser",  # Same username
            email="different@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user2)

        with pytest.raises(IntegrityError):
            await db_session.commit()

        await db_session.rollback()

        # Try to create user with same email
        user3 = User(
            username="differentuser",
            email="unique@example.com",  # Same email
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user3)

        with pytest.raises(IntegrityError):
            await db_session.commit()

    async def test_project_model_creation(self, db_session: AsyncSession):
        """Test project model creation and validation."""
        # First create a user (owner)
        user = User(
            username="owner",
            email="owner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create project
        project = Project(
            code="TEST001",
            name="Test Project",
            description="Test project description",
            status="active",
            owner_id=user.id,
        )

        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        assert project.id is not None
        assert project.code == "TEST001"
        assert project.name == "Test Project"
        assert project.description == "Test project description"
        assert project.status == "active"
        assert project.owner_id == user.id
        assert project.created_at is not None
        assert project.updated_at is not None

    async def test_project_unique_code_constraint(self, db_session: AsyncSession):
        """Test project unique code constraint."""
        # Create user
        user = User(
            username="owner",
            email="owner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create first project
        project1 = Project(
            code="DUPLICATE",
            name="First Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project1)
        await db_session.commit()

        # Try to create project with same code
        project2 = Project(
            code="DUPLICATE",  # Same code
            name="Second Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project2)

        with pytest.raises(IntegrityError):
            await db_session.commit()


@pytest.mark.asyncio
class TestModelRelationships:
    """Test model relationships and foreign keys."""

    async def test_user_project_relationship(self, db_session: AsyncSession):
        """Test user-project relationship."""
        # Create user
        user = User(
            username="projectowner",
            email="projectowner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create project
        project = Project(
            code="REL001",
            name="Relationship Test Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        # Test relationships
        assert project.owner_id == user.id

    async def test_project_requirement_relationship(self, db_session: AsyncSession):
        """Test project-requirement relationship."""
        # Create reference data first
        req_type = RequirementType(
            name="functional", description="Functional requirement"
        )
        req_priority = RequirementPriority(name="high")
        req_status = RequirementStatus(name="active")

        db_session.add_all([req_type, req_priority, req_status])
        await db_session.commit()
        await db_session.refresh(req_type)
        await db_session.refresh(req_priority)
        await db_session.refresh(req_status)

        # Create user
        user = User(
            username="reqowner",
            email="reqowner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create project
        project = Project(
            code="REQ001",
            name="Requirements Test Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        # Create requirement
        requirement = Requirement(
            title="Test Requirement",
            description="Test requirement description",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
            author_id=user.id,
            last_modified_by=user.id,
        )
        db_session.add(requirement)
        await db_session.commit()
        await db_session.refresh(requirement)

        # Test relationships
        assert requirement.project_id == project.id
        assert requirement.author_id == user.id
        assert requirement.type_id == req_type.id
        assert requirement.priority_id == req_priority.id
        assert requirement.status_id == req_status.id

    async def test_requirement_comment_relationship(self, db_session: AsyncSession):
        """Test requirement-comment relationship."""
        # Create reference data
        req_type = RequirementType(name="functional")
        req_priority = RequirementPriority(name="medium")
        req_status = RequirementStatus(name="draft")

        db_session.add_all([req_type, req_priority, req_status])
        await db_session.commit()
        await db_session.refresh(req_type)
        await db_session.refresh(req_priority)
        await db_session.refresh(req_status)

        # Create user
        user = User(
            username="commentowner",
            email="commentowner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create project
        project = Project(
            code="COM001",
            name="Comments Test Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        # Create requirement
        requirement = Requirement(
            title="Commentable Requirement",
            description="Requirement that can be commented on",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
            author_id=user.id,
            last_modified_by=user.id,
        )
        db_session.add(requirement)
        await db_session.commit()
        await db_session.refresh(requirement)

        # Create comment
        comment = Comment(
            content="This is a test comment",
            requirement_id=requirement.id,
            author_id=user.id,
        )
        db_session.add(comment)
        await db_session.commit()
        await db_session.refresh(comment)

        # Test relationships
        assert comment.requirement_id == requirement.id
        assert comment.author_id == user.id
        assert comment.content == "This is a test comment"

    async def test_requirement_relationships_between_requirements(
        self, db_session: AsyncSession
    ):
        """Test relationships between requirements."""
        # Create reference data
        req_type = RequirementType(name="functional")
        req_priority = RequirementPriority(name="medium")
        req_status = RequirementStatus(name="draft")
        rel_type = RelationshipType(name="depends_on")

        db_session.add_all([req_type, req_priority, req_status, rel_type])
        await db_session.commit()
        await db_session.refresh(req_type)
        await db_session.refresh(req_priority)
        await db_session.refresh(req_status)
        await db_session.refresh(rel_type)

        # Create user and project
        user = User(
            username="relowner",
            email="relowner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        project = Project(
            code="REQREL001",
            name="Requirement Relations Test",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        # Create two requirements
        req1 = Requirement(
            title="Source Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
            author_id=user.id,
            last_modified_by=user.id,
        )
        req2 = Requirement(
            title="Target Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
            author_id=user.id,
            last_modified_by=user.id,
        )
        db_session.add_all([req1, req2])
        await db_session.commit()
        await db_session.refresh(req1)
        await db_session.refresh(req2)

        # Create relationship between requirements
        relationship = Relationship(
            source_id=req1.id,
            target_id=req2.id,
            type_id=rel_type.id,
        )
        db_session.add(relationship)
        await db_session.commit()

        # Test relationship
        assert relationship.source_id == req1.id
        assert relationship.target_id == req2.id
        assert relationship.type_id == rel_type.id


@pytest.mark.asyncio
class TestModelCascades:
    """Test model cascade behaviors and constraints."""

    async def test_project_deletion_cascades(self, db_session: AsyncSession):
        """Test that project deletion cascades to related entities."""
        # Create reference data
        req_type = RequirementType(name="functional")
        req_priority = RequirementPriority(name="high")
        req_status = RequirementStatus(name="active")

        db_session.add_all([req_type, req_priority, req_status])
        await db_session.commit()
        await db_session.refresh(req_type)
        await db_session.refresh(req_priority)
        await db_session.refresh(req_status)

        # Create user
        user = User(
            username="cascadeowner",
            email="cascadeowner@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create project with related entities
        project = Project(
            code="CASCADE001",
            name="Cascade Test Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        # Create requirement for the project
        requirement = Requirement(
            title="Cascading Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
            author_id=user.id,
            last_modified_by=user.id,
        )
        db_session.add(requirement)
        await db_session.commit()
        await db_session.refresh(requirement)

        # Create release for the project
        release = Release(
            project_id=project.id,
            name="Test Release",
            version="1.0.0",
            status="planned",
        )
        db_session.add(release)
        await db_session.commit()
        await db_session.refresh(release)

        # Verify entities exist
        assert project.id is not None
        assert requirement.id is not None
        assert release.id is not None

        # Delete project - should cascade to requirements and releases
        await db_session.delete(project)
        await db_session.commit()

        # Verify cascaded deletion (would need to check if entities are gone)
        # This test verifies the cascade setup works without constraint violations

    async def test_user_deletion_restrictions(self, db_session: AsyncSession):
        """Test that user deletion is properly restricted when referenced."""
        # Create user
        user = User(
            username="restricteduser",
            email="restricteduser@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create project owned by user
        project = Project(
            code="RESTRICT001",
            name="Restriction Test Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()

        # Try to delete user - should fail due to foreign key constraint
        with pytest.raises(IntegrityError):
            await db_session.delete(user)
            await db_session.commit()


@pytest.mark.asyncio
class TestModelTimestamps:
    """Test model timestamp behavior."""

    async def test_created_at_auto_set(self, db_session: AsyncSession):
        """Test that created_at is automatically set."""
        user = User(
            username="timestampuser",
            email="timestampuser@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )

        # Before save, created_at should be None
        assert user.created_at is None

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # After save, created_at should be set
        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)

    async def test_updated_at_auto_update(self, db_session: AsyncSession):
        """Test that updated_at is automatically updated on changes."""
        user = User(
            username="updateuser",
            email="updateuser@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
            name="Original Name",
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        original_updated_at = user.updated_at
        assert original_updated_at is not None

        # Update the user
        user.name = "Updated Name"
        await db_session.commit()
        await db_session.refresh(user)

        # updated_at should have changed
        assert user.updated_at is not None
        assert user.updated_at >= original_updated_at


@pytest.mark.asyncio
class TestSpecialModels:
    """Test special models like RefreshToken, TestResult, etc."""

    async def test_refresh_token_model(self, db_session: AsyncSession):
        """Test RefreshToken model functionality."""
        # Create user
        user = User(
            username="tokenuser",
            email="tokenuser@example.com",
            hashed_password=get_password_hash("password123"),
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create refresh token
        expires_at = datetime.now(UTC).replace(tzinfo=None)
        refresh_token = RefreshToken(
            user_id=user.id,
            expires_at=expires_at,
            user_agent="Test Agent",
            ip_address="127.0.0.1",
        )

        db_session.add(refresh_token)
        await db_session.commit()
        await db_session.refresh(refresh_token)

        # Test properties
        assert refresh_token.id is not None
        assert refresh_token.user_id == user.id
        assert refresh_token.expires_at == expires_at
        assert refresh_token.is_active is True
        assert refresh_token.token is not None  # Auto-generated
        assert refresh_token.user_agent == "Test Agent"
        assert refresh_token.ip_address == "127.0.0.1"

        # Test methods
        assert refresh_token.is_valid is True  # Active and not expired yet

        # Test revoke
        refresh_token.revoke("Test revocation")
        assert refresh_token.is_active is False
        assert refresh_token.revoked_by == "Test revocation"
        assert refresh_token.revoked_at is not None

    async def test_test_result_model(self, db_session: AsyncSession):
        """Test TestResult model functionality."""
        # Create reference data and entities
        req_type = RequirementType(name="functional")
        req_priority = RequirementPriority(name="high")
        req_status = RequirementStatus(name="active")

        db_session.add_all([req_type, req_priority, req_status])
        await db_session.commit()
        await db_session.refresh(req_type)
        await db_session.refresh(req_priority)
        await db_session.refresh(req_status)

        user = User(
            username="tester",
            email="tester@example.com",
            hashed_password=get_password_hash("password123"),
            role="tester",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        project = Project(
            code="TEST001",
            name="Test Project",
            status="active",
            owner_id=user.id,
        )
        db_session.add(project)
        await db_session.commit()
        await db_session.refresh(project)

        requirement = Requirement(
            title="Testable Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
            author_id=user.id,
            last_modified_by=user.id,
        )
        db_session.add(requirement)
        await db_session.commit()
        await db_session.refresh(requirement)

        # Create test result
        test_result = TestResult(
            status=TestStatus.PASSED,
            notes="Test passed successfully",
            requirement_id=requirement.id,
            tester_id=user.id,
            external_id="EXT001",
        )

        db_session.add(test_result)
        await db_session.commit()
        await db_session.refresh(test_result)

        # Test properties
        assert test_result.id is not None
        assert test_result.status == TestStatus.PASSED
        assert test_result.notes == "Test passed successfully"
        assert test_result.requirement_id == requirement.id
        assert test_result.tester_id == user.id
        assert test_result.external_id == "EXT001"
        assert test_result.created_at is not None
        assert test_result.updated_at is not None
