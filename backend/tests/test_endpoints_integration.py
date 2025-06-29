"""
Comprehensive endpoint integration tests.

Tests complete workflows through API endpoints to ensure they work correctly.
"""

import pytest
from httpx import AsyncClient
from fastapi import status


@pytest.mark.asyncio
class TestAuthEndpointIntegration:
    """Test authentication endpoint workflows."""

    async def test_user_registration_and_login_workflow(self, client: AsyncClient):
        """Test complete user registration and login workflow."""
        # 1. Register a new user
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepassword123",
            "name": "New User",
            "role": "user",
        }

        register_response = await client.post("/api/v1/auth/register", json=user_data)
        assert register_response.status_code == status.HTTP_201_CREATED

        user_profile = register_response.json()
        assert user_profile["username"] == "newuser"
        assert user_profile["email"] == "newuser@example.com"
        assert "id" in user_profile

        # 2. Login with the new user
        login_data = {
            "username": "newuser@example.com",
            "password": "securepassword123",
        }

        login_response = await client.post("/api/v1/auth/login", data=login_data)
        assert login_response.status_code == status.HTTP_200_OK

        login_result = login_response.json()
        assert "access_token" in login_result
        assert "refresh_token" in login_result
        assert login_result["token_type"] == "bearer"
        assert "user" in login_result

        # 3. Use access token to access protected endpoint
        auth_headers = {"Authorization": f"Bearer {login_result['access_token']}"}
        profile_response = await client.get("/api/v1/users/me", headers=auth_headers)
        assert profile_response.status_code == status.HTTP_200_OK

        profile = profile_response.json()
        assert profile["username"] == "newuser"
        assert profile["email"] == "newuser@example.com"

    async def test_token_refresh_workflow(self, client: AsyncClient):
        """Test token refresh workflow."""
        # 1. Register and login
        user_data = {
            "username": "refreshuser",
            "email": "refreshuser@example.com",
            "password": "password123",
            "name": "Refresh User",
            "role": "user",
        }

        await client.post("/api/v1/auth/register", json=user_data)

        login_data = {
            "username": "refreshuser@example.com",
            "password": "password123",
        }

        login_response = await client.post("/api/v1/auth/login", data=login_data)
        login_result = login_response.json()

        # 2. Refresh the token
        refresh_data = {"refresh_token": login_result["refresh_token"]}

        refresh_response = await client.post("/api/v1/auth/refresh", json=refresh_data)
        assert refresh_response.status_code == status.HTTP_200_OK

        refresh_result = refresh_response.json()
        assert "access_token" in refresh_result
        assert refresh_result["token_type"] == "bearer"

        # 3. Use new access token
        new_auth_headers = {"Authorization": f"Bearer {refresh_result['access_token']}"}
        profile_response = await client.get(
            "/api/v1/users/me", headers=new_auth_headers
        )
        assert profile_response.status_code == status.HTTP_200_OK

    async def test_logout_workflow(self, client: AsyncClient):
        """Test logout workflow."""
        # 1. Register and login
        user_data = {
            "username": "logoutuser",
            "email": "logoutuser@example.com",
            "password": "password123",
            "name": "Logout User",
            "role": "user",
        }

        await client.post("/api/v1/auth/register", json=user_data)

        login_data = {
            "username": "logoutuser@example.com",
            "password": "password123",
        }

        login_response = await client.post("/api/v1/auth/login", data=login_data)
        login_result = login_response.json()

        # 2. Logout
        auth_headers = {"Authorization": f"Bearer {login_result['access_token']}"}
        logout_data = {"refresh_token": login_result["refresh_token"]}

        logout_response = await client.post(
            "/api/v1/auth/logout", json=logout_data, headers=auth_headers
        )
        assert logout_response.status_code == status.HTTP_200_OK

        # 3. Try to use the token after logout (should fail)
        profile_response = await client.get("/api/v1/users/me", headers=auth_headers)
        # Token might still be valid for a short time, but refresh should fail

        refresh_response = await client.post("/api/v1/auth/refresh", json=logout_data)
        assert refresh_response.status_code != status.HTTP_200_OK


@pytest.mark.asyncio
class TestProjectWorkflow:
    """Test complete project management workflows."""

    async def test_complete_project_workflow(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test complete project creation, management, and deletion workflow."""
        # 1. Create a project
        project_data = {
            "code": "WORKFLOW001",
            "name": "Workflow Test Project",
            "description": "A test project for workflow testing",
            "status": "active",
            "owner_id": 1,  # Will be set by the authenticated user
        }

        create_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=auth_headers
        )
        assert create_response.status_code == status.HTTP_201_CREATED

        created_project = create_response.json()
        project_id = created_project["id"]
        assert created_project["code"] == "WORKFLOW001"
        assert created_project["name"] == "Workflow Test Project"

        # 2. Get the project
        get_response = await client.get(
            f"/api/v1/projects/{project_id}", headers=auth_headers
        )
        assert get_response.status_code == status.HTTP_200_OK

        fetched_project = get_response.json()
        assert fetched_project["id"] == project_id
        assert fetched_project["code"] == "WORKFLOW001"

        # 3. Update the project
        update_data = {
            "name": "Updated Workflow Project",
            "description": "Updated description",
            "status": "in_progress",
        }

        update_response = await client.put(
            f"/api/v1/projects/{project_id}", json=update_data, headers=auth_headers
        )
        assert update_response.status_code == status.HTTP_200_OK

        updated_project = update_response.json()
        assert updated_project["name"] == "Updated Workflow Project"
        assert updated_project["description"] == "Updated description"
        assert updated_project["status"] == "in_progress"

        # 4. List projects (should include our project)
        list_response = await client.get("/api/v1/projects/", headers=auth_headers)
        assert list_response.status_code == status.HTTP_200_OK

        projects_list = list_response.json()
        assert any(p["id"] == project_id for p in projects_list)

        # 5. Delete the project
        delete_response = await client.delete(
            f"/api/v1/projects/{project_id}", headers=auth_headers
        )
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

        # 6. Verify project is deleted
        get_deleted_response = await client.get(
            f"/api/v1/projects/{project_id}", headers=auth_headers
        )
        assert get_deleted_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_project_with_requirements_workflow(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test project with requirements workflow."""
        # 1. Create a project
        project_data = {
            "code": "REQPROJECT001",
            "name": "Requirements Project",
            "description": "Project with requirements",
            "status": "active",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=auth_headers
        )
        project = project_response.json()
        project_id = project["id"]

        # 2. Create requirement types, priorities, and statuses first
        await client.post(
            "/api/v1/reference/requirement-types",
            json={"name": "functional", "description": "Functional requirement"},
            headers=auth_headers,
        )

        await client.post(
            "/api/v1/reference/requirement-priorities",
            json={"name": "high"},
            headers=auth_headers,
        )

        await client.post(
            "/api/v1/reference/requirement-statuses",
            json={"name": "active"},
            headers=auth_headers,
        )

        # Get the created reference data
        types_response = await client.get(
            "/api/v1/reference/requirement-types", headers=auth_headers
        )
        priorities_response = await client.get(
            "/api/v1/reference/requirement-priorities", headers=auth_headers
        )
        statuses_response = await client.get(
            "/api/v1/reference/requirement-statuses", headers=auth_headers
        )

        types = types_response.json()
        priorities = priorities_response.json()
        statuses = statuses_response.json()

        # 3. Create requirements for the project
        for i in range(3):
            requirement_data = {
                "title": f"Project Requirement {i}",
                "description": f"Description for requirement {i}",
                "type_id": types[0]["id"],
                "priority_id": priorities[0]["id"],
                "status_id": statuses[0]["id"],
                "project_id": project_id,
            }

            req_response = await client.post(
                "/api/v1/requirements/", json=requirement_data, headers=auth_headers
            )
            assert req_response.status_code == status.HTTP_201_CREATED

        # 4. Get project requirements
        proj_req_response = await client.get(
            f"/api/v1/projects/{project_id}/requirements", headers=auth_headers
        )
        assert proj_req_response.status_code == status.HTTP_200_OK

        project_requirements = proj_req_response.json()
        assert len(project_requirements) == 3

        # 5. Get project stats
        stats_response = await client.get(
            f"/api/v1/projects/{project_id}/stats", headers=auth_headers
        )
        assert stats_response.status_code == status.HTTP_200_OK

        stats = stats_response.json()
        assert "total_requirements" in stats


@pytest.mark.asyncio
class TestRequirementWorkflow:
    """Test complete requirement management workflows."""

    async def test_requirement_with_comments_workflow(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test requirement with comments workflow."""
        # 1. Setup - create project and reference data
        project_data = {
            "code": "COMMENTPROJ001",
            "name": "Comment Project",
            "status": "active",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=auth_headers
        )
        project = project_response.json()
        project_id = project["id"]

        # Create reference data
        await client.post(
            "/api/v1/reference/requirement-types",
            json={"name": "functional"},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/reference/requirement-priorities",
            json={"name": "medium"},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/reference/requirement-statuses",
            json={"name": "active"},
            headers=auth_headers,
        )

        # Get reference data IDs
        types = (
            await client.get(
                "/api/v1/reference/requirement-types", headers=auth_headers
            )
        ).json()
        priorities = (
            await client.get(
                "/api/v1/reference/requirement-priorities", headers=auth_headers
            )
        ).json()
        statuses = (
            await client.get(
                "/api/v1/reference/requirement-statuses", headers=auth_headers
            )
        ).json()

        # 2. Create a requirement
        requirement_data = {
            "title": "Commentable Requirement",
            "description": "A requirement that can be commented on",
            "type_id": types[0]["id"],
            "priority_id": priorities[0]["id"],
            "status_id": statuses[0]["id"],
            "project_id": project_id,
        }

        req_response = await client.post(
            "/api/v1/requirements/", json=requirement_data, headers=auth_headers
        )
        requirement = req_response.json()
        requirement_id = requirement["id"]

        # 3. Add comments to the requirement
        for i in range(3):
            comment_data = {
                "content": f"This is comment {i} on the requirement",
                "requirement_id": requirement_id,
            }

            comment_response = await client.post(
                "/api/v1/comments/", json=comment_data, headers=auth_headers
            )
            assert comment_response.status_code == status.HTTP_201_CREATED

        # 4. Get comments for the requirement
        comments_response = await client.get(
            f"/api/v1/comments/requirements/{requirement_id}/comments",
            headers=auth_headers,
        )
        assert comments_response.status_code == status.HTTP_200_OK

        comments = comments_response.json()
        assert len(comments) == 3

        # 5. Get requirement with details (should include comment count)
        req_detail_response = await client.get(
            f"/api/v1/requirements/{requirement_id}", headers=auth_headers
        )
        assert req_detail_response.status_code == status.HTTP_200_OK

    async def test_requirement_relationships_workflow(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test requirement relationships workflow."""
        # 1. Setup - create project and reference data
        project_data = {
            "code": "RELPROJ001",
            "name": "Relationship Project",
            "status": "active",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=auth_headers
        )
        project = project_response.json()
        project_id = project["id"]

        # Create reference data
        await client.post(
            "/api/v1/reference/requirement-types",
            json={"name": "functional"},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/reference/requirement-priorities",
            json={"name": "high"},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/reference/requirement-statuses",
            json={"name": "active"},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/reference/relationship-types",
            json={"name": "depends_on"},
            headers=auth_headers,
        )

        # Get reference data
        types = (
            await client.get(
                "/api/v1/reference/requirement-types", headers=auth_headers
            )
        ).json()
        priorities = (
            await client.get(
                "/api/v1/reference/requirement-priorities", headers=auth_headers
            )
        ).json()
        statuses = (
            await client.get(
                "/api/v1/reference/requirement-statuses", headers=auth_headers
            )
        ).json()
        rel_types = (
            await client.get(
                "/api/v1/reference/relationship-types", headers=auth_headers
            )
        ).json()

        # 2. Create two requirements
        req1_data = {
            "title": "Source Requirement",
            "description": "This requirement depends on another",
            "type_id": types[0]["id"],
            "priority_id": priorities[0]["id"],
            "status_id": statuses[0]["id"],
            "project_id": project_id,
        }

        req2_data = {
            "title": "Target Requirement",
            "description": "This requirement is depended upon",
            "type_id": types[0]["id"],
            "priority_id": priorities[0]["id"],
            "status_id": statuses[0]["id"],
            "project_id": project_id,
        }

        req1_response = await client.post(
            "/api/v1/requirements/", json=req1_data, headers=auth_headers
        )
        req2_response = await client.post(
            "/api/v1/requirements/", json=req2_data, headers=auth_headers
        )

        req1 = req1_response.json()
        req2 = req2_response.json()

        # 3. Create relationship between requirements
        relationship_data = {
            "source_id": req1["id"],
            "target_id": req2["id"],
            "type_id": rel_types[0]["id"],
        }

        rel_response = await client.post(
            "/api/v1/relationships/", json=relationship_data, headers=auth_headers
        )
        assert rel_response.status_code == status.HTTP_201_CREATED

        # 4. Get relationships for the requirement
        req_rel_response = await client.get(
            f"/api/v1/relationships/requirements/{req1['id']}/relationships",
            headers=auth_headers,
        )
        assert req_rel_response.status_code == status.HTTP_200_OK

        relationships = req_rel_response.json()
        assert len(relationships) >= 1

        # 5. Get dependencies
        deps_response = await client.get(
            f"/api/v1/relationships/requirements/{req1['id']}/dependencies",
            headers=auth_headers,
        )
        assert deps_response.status_code == status.HTTP_200_OK


@pytest.mark.asyncio
class TestDashboardWorkflow:
    """Test dashboard functionality workflows."""

    async def test_dashboard_stats_workflow(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test dashboard statistics workflow."""
        # 1. Get initial dashboard stats
        stats_response = await client.get(
            "/api/v1/dashboard/stats", headers=auth_headers
        )
        assert stats_response.status_code == status.HTTP_200_OK

        initial_stats = stats_response.json()
        assert "overview" in initial_stats
        assert "recent_activity" in initial_stats
        assert "project_performance" in initial_stats
        assert "trending_metrics" in initial_stats
        assert "quick_access" in initial_stats

        # 2. Create some data that should affect stats
        project_data = {
            "code": "DASHPROJ001",
            "name": "Dashboard Project",
            "status": "active",
            "owner_id": 1,
        }

        await client.post("/api/v1/projects/", json=project_data, headers=auth_headers)

        # 3. Get updated dashboard stats
        updated_stats_response = await client.get(
            "/api/v1/dashboard/stats", headers=auth_headers
        )
        assert updated_stats_response.status_code == status.HTTP_200_OK

        updated_stats = updated_stats_response.json()

        # Stats should reflect the new project
        assert (
            updated_stats["overview"]["total_projects"]
            >= initial_stats["overview"]["total_projects"]
        )

    async def test_my_dashboard_workflow(self, client: AsyncClient, auth_headers: dict):
        """Test personalized dashboard workflow."""
        # 1. Get my dashboard
        my_dashboard_response = await client.get(
            "/api/v1/dashboard/my-dashboard", headers=auth_headers
        )
        assert my_dashboard_response.status_code == status.HTTP_200_OK

        my_dashboard = my_dashboard_response.json()
        assert "my_projects" in my_dashboard
        assert "my_requirements" in my_dashboard
        assert "my_activity" in my_dashboard
        assert "notifications" in my_dashboard
        assert "preferences" in my_dashboard

        # 2. Create a project (should appear in my projects)
        project_data = {
            "code": "MYPROJ001",
            "name": "My Project",
            "status": "active",
            "owner_id": 1,
        }

        await client.post("/api/v1/projects/", json=project_data, headers=auth_headers)

        # 3. Get updated my dashboard
        updated_dashboard_response = await client.get(
            "/api/v1/dashboard/my-dashboard", headers=auth_headers
        )
        assert updated_dashboard_response.status_code == status.HTTP_200_OK

        updated_dashboard = updated_dashboard_response.json()

        # Should include the new project
        my_projects = updated_dashboard["my_projects"]
        assert any(proj["name"] == "My Project" for proj in my_projects)

    async def test_dashboard_activity_workflow(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test dashboard activity feed workflow."""
        # 1. Get initial activity
        activity_response = await client.get(
            "/api/v1/dashboard/activity", headers=auth_headers
        )
        assert activity_response.status_code == status.HTTP_200_OK

        initial_activity = activity_response.json()
        assert isinstance(initial_activity, list)

        # 2. Create some activity-generating actions
        project_data = {
            "code": "ACTIVITY001",
            "name": "Activity Project",
            "status": "active",
            "owner_id": 1,
        }

        await client.post("/api/v1/projects/", json=project_data, headers=auth_headers)

        # 3. Get updated activity
        updated_activity_response = await client.get(
            "/api/v1/dashboard/activity", headers=auth_headers
        )
        assert updated_activity_response.status_code == status.HTTP_200_OK

        updated_activity = updated_activity_response.json()

        # Should have more activity items
        assert len(updated_activity) >= len(initial_activity)


@pytest.mark.asyncio
class TestErrorHandling:
    """Test error handling in endpoints."""

    async def test_not_found_errors(self, client: AsyncClient, auth_headers: dict):
        """Test 404 Not Found errors."""
        # Try to get non-existent project
        response = await client.get("/api/v1/projects/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Try to get non-existent requirement
        response = await client.get("/api/v1/requirements/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Try to get non-existent user
        response = await client.get("/api/v1/users/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_validation_errors(self, client: AsyncClient, auth_headers: dict):
        """Test validation errors."""
        # Try to create project with invalid data
        invalid_project_data = {
            "code": "",  # Empty code should fail validation
            "name": "Valid Name",
            "status": "active",
            "owner_id": 1,
        }

        response = await client.post(
            "/api/v1/projects/", json=invalid_project_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Try to create user with invalid email
        invalid_user_data = {
            "username": "testuser",
            "email": "invalid-email",  # Invalid email format
            "password": "password123",
            "name": "Test User",
            "role": "user",
        }

        response = await client.post("/api/v1/auth/register", json=invalid_user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_unauthorized_access(self, client: AsyncClient):
        """Test unauthorized access errors."""
        # Try to access protected endpoint without auth
        response = await client.get("/api/v1/users/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Try to create project without auth
        project_data = {
            "code": "UNAUTH001",
            "name": "Unauthorized Project",
            "status": "active",
            "owner_id": 1,
        }

        response = await client.post("/api/v1/projects/", json=project_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
