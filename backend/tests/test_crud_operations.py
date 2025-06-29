"""
Comprehensive CRUD operations tests.

Tests all CRUD classes and their methods to ensure they work correctly.
"""

import pytest
from datetime import datetime, UTC
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import (
    user as crud_user,
    project as crud_project,
    requirement as crud_requirement,
    comment as crud_comment,
    release as crud_release,
    spec as crud_spec,
    relationship as crud_relationship,
    relationship_types as crud_relationship_types,
    requirement_types as crud_requirement_types,
    requirement_priorities as crud_requirement_priorities,
    requirement_statuses as crud_requirement_statuses,
    test_result as crud_test_result,
    refresh_token as crud_refresh_token,
)
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.requirement import RequirementCreate, RequirementUpdate
from app.schemas.comment import CommentCreate, CommentUpdate
from app.schemas.release import ReleaseCreate, ReleaseUpdate
from app.schemas.spec import SpecCreate, SpecUpdate
from app.schemas.relationship import RelationshipCreate, RelationshipUpdate
from app.schemas.relationship_types import RelationshipTypeCreate
from app.schemas.requirement_types import RequirementTypeCreate
from app.schemas.requirement_priorities import RequirementPriorityCreate
from app.schemas.requirement_statuses import RequirementStatusCreate
from app.schemas.test_result import TestResultCreate, TestResultUpdate
from app.models.test_result import TestStatus


@pytest.mark.asyncio
class TestUserCRUD:
    """Test User CRUD operations."""

    async def test_create_user(self, db_session: AsyncSession):
        """Test user creation."""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="password123",
            name="Test User",
            role="user",
        )

        user = await crud_user.create(db_session, obj_in=user_data)

        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.role == "user"
        assert user.is_active is True
        assert user.is_superuser is False

    async def test_get_user(self, db_session: AsyncSession):
        """Test getting user by ID."""
        user_data = UserCreate(
            username="getuser",
            email="getuser@example.com",
            password="password123",
            name="Get User",
            role="user",
        )

        created_user = await crud_user.create(db_session, obj_in=user_data)
        fetched_user = await crud_user.get(db_session, id=created_user.id)

        assert fetched_user is not None
        assert fetched_user.id == created_user.id
        assert fetched_user.username == "getuser"
        assert fetched_user.email == "getuser@example.com"

    async def test_get_user_by_email(self, db_session: AsyncSession):
        """Test getting user by email."""
        user_data = UserCreate(
            username="emailuser",
            email="emailuser@example.com",
            password="password123",
            name="Email User",
            role="user",
        )

        created_user = await crud_user.create(db_session, obj_in=user_data)
        fetched_user = await crud_user.get_by_email(
            db_session, email="emailuser@example.com"
        )

        assert fetched_user is not None
        assert fetched_user.id == created_user.id
        assert fetched_user.email == "emailuser@example.com"

    async def test_get_user_by_username(self, db_session: AsyncSession):
        """Test getting user by username."""
        user_data = UserCreate(
            username="usernameuser",
            email="usernameuser@example.com",
            password="password123",
            name="Username User",
            role="user",
        )

        created_user = await crud_user.create(db_session, obj_in=user_data)
        fetched_user = await crud_user.get_by_username(
            db_session, username="usernameuser"
        )

        assert fetched_user is not None
        assert fetched_user.id == created_user.id
        assert fetched_user.username == "usernameuser"

    async def test_update_user(self, db_session: AsyncSession):
        """Test updating user."""
        user_data = UserCreate(
            username="updateuser",
            email="updateuser@example.com",
            password="password123",
            name="Update User",
            role="user",
        )

        created_user = await crud_user.create(db_session, obj_in=user_data)

        update_data = UserUpdate(
            name="Updated User",
            role="admin",
        )

        updated_user = await crud_user.update(
            db_session, db_obj=created_user, obj_in=update_data
        )

        assert updated_user.name == "Updated User"
        assert updated_user.role == "admin"
        assert updated_user.username == "updateuser"  # Unchanged
        assert updated_user.email == "updateuser@example.com"  # Unchanged

    async def test_delete_user(self, db_session: AsyncSession):
        """Test deleting user."""
        user_data = UserCreate(
            username="deleteuser",
            email="deleteuser@example.com",
            password="password123",
            name="Delete User",
            role="user",
        )

        created_user = await crud_user.create(db_session, obj_in=user_data)
        user_id = created_user.id

        deleted_user = await crud_user.remove(db_session, id=user_id)

        assert deleted_user.id == user_id

        # Verify user is deleted
        fetched_user = await crud_user.get(db_session, id=user_id)
        assert fetched_user is None

    async def test_get_multi_users(self, db_session: AsyncSession):
        """Test getting multiple users."""
        # Create multiple users
        for i in range(5):
            user_data = UserCreate(
                username=f"multiuser{i}",
                email=f"multiuser{i}@example.com",
                password="password123",
                name=f"Multi User {i}",
                role="user",
            )
            await crud_user.create(db_session, obj_in=user_data)

        # Get users with pagination
        users = await crud_user.get_multi(db_session, skip=0, limit=3)

        assert len(users) >= 3
        assert all(user.id is not None for user in users)

    async def test_authenticate_user(self, db_session: AsyncSession):
        """Test user authentication."""
        user_data = UserCreate(
            username="authuser",
            email="authuser@example.com",
            password="password123",
            name="Auth User",
            role="user",
        )

        created_user = await crud_user.create(db_session, obj_in=user_data)

        # Test correct password
        authenticated_user = await crud_user.authenticate(
            db_session, email="authuser@example.com", password="password123"
        )
        assert authenticated_user is not None
        assert authenticated_user.id == created_user.id

        # Test incorrect password
        failed_auth = await crud_user.authenticate(
            db_session, email="authuser@example.com", password="wrongpassword"
        )
        assert failed_auth is None


@pytest.mark.asyncio
class TestProjectCRUD:
    """Test Project CRUD operations."""

    async def test_create_project(self, db_session: AsyncSession):
        """Test project creation."""
        # Create owner user first
        user_data = UserCreate(
            username="projectowner",
            email="projectowner@example.com",
            password="password123",
            name="Project Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        # Create project
        project_data = ProjectCreate(
            code="TEST001",
            name="Test Project",
            description="Test project description",
            status="active",
            owner_id=owner.id,
        )

        project = await crud_project.create(db_session, obj_in=project_data)

        assert project.id is not None
        assert project.code == "TEST001"
        assert project.name == "Test Project"
        assert project.description == "Test project description"
        assert project.status == "active"
        assert project.owner_id == owner.id

    async def test_get_project_by_code(self, db_session: AsyncSession):
        """Test getting project by code."""
        # Create owner user first
        user_data = UserCreate(
            username="codeowner",
            email="codeowner@example.com",
            password="password123",
            name="Code Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        # Create project
        project_data = ProjectCreate(
            code="CODE001",
            name="Code Project",
            description="Project found by code",
            status="active",
            owner_id=owner.id,
        )

        created_project = await crud_project.create(db_session, obj_in=project_data)
        fetched_project = await crud_project.get_by_code(db_session, code="CODE001")

        assert fetched_project is not None
        assert fetched_project.id == created_project.id
        assert fetched_project.code == "CODE001"

    async def test_get_projects_by_user(self, db_session: AsyncSession):
        """Test getting projects by user."""
        # Create owner user
        user_data = UserCreate(
            username="userowner",
            email="userowner@example.com",
            password="password123",
            name="User Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        # Create multiple projects for the user
        for i in range(3):
            project_data = ProjectCreate(
                code=f"USER{i:03d}",
                name=f"User Project {i}",
                description=f"Project {i} owned by user",
                status="active",
                owner_id=owner.id,
            )
            await crud_project.create(db_session, obj_in=project_data)

        # Get projects by user
        user_projects = await crud_project.get_by_user(db_session, user_id=owner.id)

        assert len(user_projects) == 3
        assert all(p.owner_id == owner.id for p in user_projects)

    async def test_update_project(self, db_session: AsyncSession):
        """Test updating project."""
        # Create owner user
        user_data = UserCreate(
            username="updateowner",
            email="updateowner@example.com",
            password="password123",
            name="Update Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        # Create project
        project_data = ProjectCreate(
            code="UPDATE001",
            name="Update Project",
            description="Original description",
            status="active",
            owner_id=owner.id,
        )

        created_project = await crud_project.create(db_session, obj_in=project_data)

        # Update project
        update_data = ProjectUpdate(
            name="Updated Project",
            description="Updated description",
            status="completed",
        )

        updated_project = await crud_project.update(
            db_session, db_obj=created_project, obj_in=update_data
        )

        assert updated_project.name == "Updated Project"
        assert updated_project.description == "Updated description"
        assert updated_project.status == "completed"
        assert updated_project.code == "UPDATE001"  # Unchanged


@pytest.mark.asyncio
class TestRequirementCRUD:
    """Test Requirement CRUD operations."""

    async def test_create_requirement(self, db_session: AsyncSession):
        """Test requirement creation."""
        # Create reference data
        req_type = await crud_requirement_types.create(
            db_session,
            obj_in=RequirementTypeCreate(
                name="functional", description="Functional requirement"
            ),
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="high")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )

        # Create user and project
        user_data = UserCreate(
            username="reqowner",
            email="reqowner@example.com",
            password="password123",
            name="Req Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="REQ001",
            name="Requirement Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        # Create requirement
        req_data = RequirementCreate(
            title="Test Requirement",
            description="Test requirement description",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )

        requirement = await crud_requirement.create(
            db_session, obj_in=req_data, author_id=owner.id
        )

        assert requirement.id is not None
        assert requirement.title == "Test Requirement"
        assert requirement.description == "Test requirement description"
        assert requirement.type_id == req_type.id
        assert requirement.priority_id == req_priority.id
        assert requirement.status_id == req_status.id
        assert requirement.project_id == project.id
        assert requirement.author_id == owner.id

    async def test_get_requirements_by_project(self, db_session: AsyncSession):
        """Test getting requirements by project."""
        # Create reference data
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="medium")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )

        # Create user and project
        user_data = UserCreate(
            username="projreqowner",
            email="projreqowner@example.com",
            password="password123",
            name="Project Req Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="PROJREQ001",
            name="Project Requirements",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        # Create multiple requirements for the project
        for i in range(3):
            req_data = RequirementCreate(
                title=f"Project Requirement {i}",
                description=f"Requirement {i} for project",
                type_id=req_type.id,
                priority_id=req_priority.id,
                status_id=req_status.id,
                project_id=project.id,
            )
            await crud_requirement.create(
                db_session, obj_in=req_data, author_id=owner.id
            )

        # Get requirements by project
        project_requirements = await crud_requirement.get_by_project(
            db_session, project_id=project.id
        )

        assert len(project_requirements) == 3
        assert all(req.project_id == project.id for req in project_requirements)

    async def test_search_requirements(self, db_session: AsyncSession):
        """Test searching requirements."""
        # Create reference data
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="high")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )

        # Create user and project
        user_data = UserCreate(
            username="searchowner",
            email="searchowner@example.com",
            password="password123",
            name="Search Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="SEARCH001",
            name="Search Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        # Create requirements with searchable content
        searchable_req = RequirementCreate(
            title="Authentication System",
            description="Implement user authentication with OAuth2",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        await crud_requirement.create(
            db_session, obj_in=searchable_req, author_id=owner.id
        )

        other_req = RequirementCreate(
            title="Database Schema",
            description="Design database schema for users",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        await crud_requirement.create(db_session, obj_in=other_req, author_id=owner.id)

        # Search for requirements
        search_results = await crud_requirement.search(
            db_session, query="authentication"
        )

        assert len(search_results) >= 1
        assert any("Authentication" in req.title for req in search_results)


@pytest.mark.asyncio
class TestCommentCRUD:
    """Test Comment CRUD operations."""

    async def test_create_comment(self, db_session: AsyncSession):
        """Test comment creation."""
        # Create reference data and entities
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="medium")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )

        user_data = UserCreate(
            username="commentowner",
            email="commentowner@example.com",
            password="password123",
            name="Comment Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="COMMENT001",
            name="Comment Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        req_data = RequirementCreate(
            title="Commentable Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        requirement = await crud_requirement.create(
            db_session, obj_in=req_data, author_id=owner.id
        )

        # Create comment
        comment_data = CommentCreate(
            content="This is a test comment",
            requirement_id=requirement.id,
        )

        comment = await crud_comment.create(
            db_session, obj_in=comment_data, author_id=owner.id
        )

        assert comment.id is not None
        assert comment.content == "This is a test comment"
        assert comment.requirement_id == requirement.id
        assert comment.author_id == owner.id

    async def test_get_comments_by_requirement(self, db_session: AsyncSession):
        """Test getting comments by requirement."""
        # Create reference data and entities
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="medium")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )

        user_data = UserCreate(
            username="reqcommentowner",
            email="reqcommentowner@example.com",
            password="password123",
            name="Req Comment Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="REQCOMMENT001",
            name="Req Comment Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        req_data = RequirementCreate(
            title="Requirement with Comments",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        requirement = await crud_requirement.create(
            db_session, obj_in=req_data, author_id=owner.id
        )

        # Create multiple comments for the requirement
        for i in range(3):
            comment_data = CommentCreate(
                content=f"Comment {i} on requirement",
                requirement_id=requirement.id,
            )
            await crud_comment.create(
                db_session, obj_in=comment_data, author_id=owner.id
            )

        # Get comments by requirement
        requirement_comments = await crud_comment.get_by_requirement(
            db_session, requirement_id=requirement.id
        )

        assert len(requirement_comments) == 3
        assert all(
            comment.requirement_id == requirement.id for comment in requirement_comments
        )


@pytest.mark.asyncio
class TestRelationshipCRUD:
    """Test Relationship CRUD operations."""

    async def test_create_relationship(self, db_session: AsyncSession):
        """Test relationship creation."""
        # Create reference data
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="high")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )
        rel_type = await crud_relationship_types.create(
            db_session, obj_in=RelationshipTypeCreate(name="depends_on")
        )

        # Create user and project
        user_data = UserCreate(
            username="relowner",
            email="relowner@example.com",
            password="password123",
            name="Relationship Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="REL001",
            name="Relationship Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        # Create two requirements
        req1_data = RequirementCreate(
            title="Source Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        req1 = await crud_requirement.create(
            db_session, obj_in=req1_data, author_id=owner.id
        )

        req2_data = RequirementCreate(
            title="Target Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        req2 = await crud_requirement.create(
            db_session, obj_in=req2_data, author_id=owner.id
        )

        # Create relationship
        rel_data = RelationshipCreate(
            source_id=req1.id,
            target_id=req2.id,
            type_id=rel_type.id,
        )

        relationship = await crud_relationship.create(db_session, obj_in=rel_data)

        assert relationship.source_id == req1.id
        assert relationship.target_id == req2.id
        assert relationship.type_id == rel_type.id

    async def test_get_relationships_by_requirement(self, db_session: AsyncSession):
        """Test getting relationships by requirement."""
        # Create reference data
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="medium")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )
        rel_type = await crud_relationship_types.create(
            db_session, obj_in=RelationshipTypeCreate(name="implements")
        )

        # Create user and project
        user_data = UserCreate(
            username="reqrelowner",
            email="reqrelowner@example.com",
            password="password123",
            name="Req Rel Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="REQREL001",
            name="Req Relationship Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        # Create central requirement
        central_req_data = RequirementCreate(
            title="Central Requirement",
            type_id=req_type.id,
            priority_id=req_priority.id,
            status_id=req_status.id,
            project_id=project.id,
        )
        central_req = await crud_requirement.create(
            db_session, obj_in=central_req_data, author_id=owner.id
        )

        # Create related requirements and relationships
        for i in range(2):
            related_req_data = RequirementCreate(
                title=f"Related Requirement {i}",
                type_id=req_type.id,
                priority_id=req_priority.id,
                status_id=req_status.id,
                project_id=project.id,
            )
            related_req = await crud_requirement.create(
                db_session, obj_in=related_req_data, author_id=owner.id
            )

            # Create relationship
            rel_data = RelationshipCreate(
                source_id=central_req.id,
                target_id=related_req.id,
                type_id=rel_type.id,
            )
            await crud_relationship.create(db_session, obj_in=rel_data)

        # Get relationships by requirement
        relationships = await crud_relationship.get_by_requirement(
            db_session, requirement_id=central_req.id
        )

        assert len(relationships) >= 2
        assert all(rel.source_id == central_req.id for rel in relationships)


@pytest.mark.asyncio
class TestCRUDCounts:
    """Test CRUD count operations."""

    async def test_user_count(self, db_session: AsyncSession):
        """Test counting users."""
        initial_count = await crud_user.count(db_session)

        # Create some users
        for i in range(3):
            user_data = UserCreate(
                username=f"countuser{i}",
                email=f"countuser{i}@example.com",
                password="password123",
                name=f"Count User {i}",
                role="user",
            )
            await crud_user.create(db_session, obj_in=user_data)

        final_count = await crud_user.count(db_session)
        assert final_count == initial_count + 3

    async def test_project_count(self, db_session: AsyncSession):
        """Test counting projects."""
        # Create owner user
        user_data = UserCreate(
            username="countowner",
            email="countowner@example.com",
            password="password123",
            name="Count Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        initial_count = await crud_project.count(db_session)

        # Create some projects
        for i in range(2):
            project_data = ProjectCreate(
                code=f"COUNT{i:03d}",
                name=f"Count Project {i}",
                status="active",
                owner_id=owner.id,
            )
            await crud_project.create(db_session, obj_in=project_data)

        final_count = await crud_project.count(db_session)
        assert final_count == initial_count + 2

    async def test_requirement_count_by_project(self, db_session: AsyncSession):
        """Test counting requirements by project."""
        # Create reference data
        req_type = await crud_requirement_types.create(
            db_session, obj_in=RequirementTypeCreate(name="functional")
        )
        req_priority = await crud_requirement_priorities.create(
            db_session, obj_in=RequirementPriorityCreate(name="medium")
        )
        req_status = await crud_requirement_statuses.create(
            db_session, obj_in=RequirementStatusCreate(name="active")
        )

        # Create user and project
        user_data = UserCreate(
            username="countreqowner",
            email="countreqowner@example.com",
            password="password123",
            name="Count Req Owner",
            role="user",
        )
        owner = await crud_user.create(db_session, obj_in=user_data)

        project_data = ProjectCreate(
            code="COUNTREQ001",
            name="Count Req Project",
            status="active",
            owner_id=owner.id,
        )
        project = await crud_project.create(db_session, obj_in=project_data)

        # Create requirements for the project
        for i in range(4):
            req_data = RequirementCreate(
                title=f"Count Requirement {i}",
                type_id=req_type.id,
                priority_id=req_priority.id,
                status_id=req_status.id,
                project_id=project.id,
            )
            await crud_requirement.create(
                db_session, obj_in=req_data, author_id=owner.id
            )

        # Count requirements by project
        requirement_count = await crud_requirement.count_by_project(
            db_session, project_id=project.id
        )

        assert requirement_count == 4
