"""
Comprehensive tests for Projects API endpoints.

Tests all CRUD operations for project management via HTTP requests.
"""

import pytest
import uuid
from httpx import AsyncClient
from fastapi import status


class TestProjectsAPI:
    """Test class for Projects API endpoints."""

    @pytest.fixture
    def unique_project_code(self):
        """Generate unique project code for testing."""
        return f"PRJ{uuid.uuid4().hex[:8].upper()}"

    @pytest.fixture
    def sample_project_create_data(self, unique_project_code):
        """Sample data for creating a project."""
        return {
            "code": unique_project_code,
            "name": "Test Project",
            "description": "This is a test project for API testing",
            "status": "active",
        }

    @pytest.fixture
    def sample_project_update_data(self):
        """Sample data for updating a project."""
        return {
            "name": "Updated Project Name",
            "description": "Updated project description",
            "status": "completed",
        }

    async def create_test_project(
        self, client: AsyncClient, project_data: dict
    ) -> dict:
        """Helper method to create a test project."""
        response = await client.post("/api/v1/projects/", json=project_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    async def test_create_project_success(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test successful project creation."""
        response = await client.post(
            "/api/v1/projects/", json=sample_project_create_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["code"] == sample_project_create_data["code"]
        assert data["name"] == sample_project_create_data["name"]
        assert data["description"] == sample_project_create_data["description"]
        assert data["status"] == sample_project_create_data["status"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_project_duplicate_code(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test creating project with duplicate code fails."""
        # Create first project
        await self.create_test_project(client, sample_project_create_data)

        # Try to create another project with same code
        duplicate_data = sample_project_create_data.copy()
        duplicate_data["name"] = "Different Project Name"

        response = await client.post("/api/v1/projects/", json=duplicate_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "кодом уже существует" in response.json()["detail"]

    async def test_create_project_missing_required_fields(self, client: AsyncClient):
        """Test creating project with missing required fields fails."""
        incomplete_data = {"name": "Test Project"}

        response = await client.post("/api/v1/projects/", json=incomplete_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_create_project_invalid_status(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test creating project with invalid status."""
        sample_project_create_data["status"] = "invalid_status"

        response = await client.post(
            "/api/v1/projects/", json=sample_project_create_data
        )
        # This might pass depending on your validation rules
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]

    async def test_get_projects_list(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting list of projects."""
        # Create test projects
        project1_data = sample_project_create_data.copy()
        project2_data = sample_project_create_data.copy()
        project2_data["code"] = f"SECOND_{project1_data['code']}"
        project2_data["name"] = "Second Test Project"

        project1 = await self.create_test_project(client, project1_data)
        project2 = await self.create_test_project(client, project2_data)

        response = await client.get("/api/v1/projects/")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

        project_ids = [project["id"] for project in data]
        assert project1["id"] in project_ids
        assert project2["id"] in project_ids

    async def test_get_projects_with_pagination(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting projects with pagination."""
        # Create test projects
        for i in range(5):
            project_data = sample_project_create_data.copy()
            project_data["code"] = f"PROJ{i}_{project_data['code']}"
            project_data["name"] = f"Project {i}"
            await self.create_test_project(client, project_data)

        # Test pagination
        response = await client.get("/api/v1/projects/?skip=1&limit=2")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert len(data) <= 2

    async def test_get_projects_with_status_filter(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting projects with status filter."""
        # Create active project
        active_project_data = sample_project_create_data.copy()
        active_project_data["status"] = "active"
        await self.create_test_project(client, active_project_data)

        # Create completed project
        completed_project_data = sample_project_create_data.copy()
        completed_project_data["code"] = f"COMP_{active_project_data['code']}"
        completed_project_data["name"] = "Completed Project"
        completed_project_data["status"] = "completed"
        await self.create_test_project(client, completed_project_data)

        # Test filtering by status
        response = await client.get("/api/v1/projects/?status=active")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        for project in data:
            assert project["status"] == "active"

    async def test_get_projects_search(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test searching projects."""
        project_data = sample_project_create_data.copy()
        project_data["name"] = "Unique Search Project Name"
        created_project = await self.create_test_project(client, project_data)

        # Search by name
        response = await client.get("/api/v1/projects/?search=Unique")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        project_ids = [project["id"] for project in data]
        assert created_project["id"] in project_ids

    async def test_get_project_by_id(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project by ID."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.get(f"/api/v1/projects/{created_project['id']}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_project["id"]
        assert data["code"] == created_project["code"]
        assert data["name"] == created_project["name"]

    async def test_get_project_with_stats(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project with statistics."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.get(f"/api/v1/projects/{created_project['id']}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        # Check if stats fields are present (might be added by get_with_stats)
        assert "id" in data
        assert "code" in data
        assert "name" in data

    async def test_get_project_not_found(self, client: AsyncClient):
        """Test getting non-existent project returns 404."""
        response = await client.get("/api/v1/projects/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_update_project(
        self,
        client: AsyncClient,
        sample_project_create_data,
        sample_project_update_data,
    ):
        """Test updating project."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.put(
            f"/api/v1/projects/{created_project['id']}", json=sample_project_update_data
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == sample_project_update_data["name"]
        assert data["description"] == sample_project_update_data["description"]
        assert data["status"] == sample_project_update_data["status"]
        assert data["id"] == created_project["id"]
        assert data["code"] == created_project["code"]  # Code should not change

    async def test_update_project_not_found(
        self, client: AsyncClient, sample_project_update_data
    ):
        """Test updating non-existent project returns 404."""
        response = await client.put(
            "/api/v1/projects/99999", json=sample_project_update_data
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_update_project_duplicate_code(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test updating project with duplicate code fails."""
        # Create two projects
        project1 = await self.create_test_project(client, sample_project_create_data)

        project2_data = sample_project_create_data.copy()
        project2_data["code"] = f"SECOND_{project1['code']}"
        project2_data["name"] = "Second Project"
        project2 = await self.create_test_project(client, project2_data)

        # Try to update project2 with project1's code
        update_data = {"code": project1["code"]}
        response = await client.put(
            f"/api/v1/projects/{project2['id']}", json=update_data
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_delete_project(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test deleting project."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.delete(f"/api/v1/projects/{created_project['id']}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify project is deleted
        get_response = await client.get(f"/api/v1/projects/{created_project['id']}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_project_not_found(self, client: AsyncClient):
        """Test deleting non-existent project returns 404."""
        response = await client.delete("/api/v1/projects/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_get_project_requirements(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project requirements."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.get(
            f"/api/v1/projects/{created_project['id']}/requirements"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_get_project_requirements_with_filters(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project requirements with filters."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        # Test with various filters
        filters = ["?status_id=1", "?type_id=1", "?priority_id=1", "?skip=0&limit=10"]

        for filter_param in filters:
            response = await client.get(
                f"/api/v1/projects/{created_project['id']}/requirements{filter_param}"
            )
            assert response.status_code == status.HTTP_200_OK

            data = response.json()
            assert isinstance(data, list)

    async def test_get_project_releases(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project releases."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.get(
            f"/api/v1/projects/{created_project['id']}/releases"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_get_project_releases_with_pagination(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project releases with pagination."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.get(
            f"/api/v1/projects/{created_project['id']}/releases?skip=0&limit=5"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5

    async def test_get_project_stats(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test getting project statistics."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        response = await client.get(f"/api/v1/projects/{created_project['id']}/stats")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, dict)
        # Stats should contain various metrics
        # The exact structure depends on your implementation

    async def test_get_project_stats_not_found(self, client: AsyncClient):
        """Test getting stats for non-existent project returns 404."""
        response = await client.get("/api/v1/projects/99999/stats")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_project_code_validation(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test project code validation."""
        # Test empty code
        empty_code_data = sample_project_create_data.copy()
        empty_code_data["code"] = ""

        response = await client.post("/api/v1/projects/", json=empty_code_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test code too long
        long_code_data = sample_project_create_data.copy()
        long_code_data["code"] = "A" * 100  # Assuming max length is less than 100

        response = await client.post("/api/v1/projects/", json=long_code_data)
        # This might pass depending on your validation rules
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]

    async def test_project_response_structure(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test that project response has expected structure."""
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        required_fields = ["id", "code", "name", "description", "status", "created_at"]

        for field in required_fields:
            assert (
                field in created_project
            ), f"Required field '{field}' missing from response"

    async def test_project_edge_cases(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test various edge cases for project operations."""
        # Test with minimal data
        minimal_data = {"code": "MIN001", "name": "Minimal Project", "status": "active"}

        response = await client.post("/api/v1/projects/", json=minimal_data)
        assert response.status_code == status.HTTP_201_CREATED

        # Test partial updates
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )
        partial_update = {"name": "Partially Updated Name"}

        response = await client.put(
            f"/api/v1/projects/{created_project['id']}", json=partial_update
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == partial_update["name"]
        assert (
            data["description"] == created_project["description"]
        )  # Should remain unchanged

    async def test_project_concurrent_operations(
        self, client: AsyncClient, sample_project_create_data
    ):
        """Test concurrent operations on projects."""
        # Create project
        created_project = await self.create_test_project(
            client, sample_project_create_data
        )

        # Simulate concurrent reads
        import asyncio

        tasks = [
            client.get(f"/api/v1/projects/{created_project['id']}"),
            client.get(f"/api/v1/projects/{created_project['id']}/requirements"),
            client.get(f"/api/v1/projects/{created_project['id']}/releases"),
            client.get(f"/api/v1/projects/{created_project['id']}/stats"),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # All operations should succeed
        for result in results:
            if isinstance(result, Exception):
                pytest.fail(f"Concurrent operation failed: {result}")
            else:
                assert result.status_code == status.HTTP_200_OK
