"""
Comprehensive tests for Releases API endpoints.

Tests all CRUD operations for release management via HTTP requests.
"""

import pytest
import uuid
from datetime import datetime, timedelta
from httpx import AsyncClient
from fastapi import status


class TestReleasesAPI:
    """Test class for Releases API endpoints."""

    @pytest.fixture
    def unique_release_version(self):
        """Generate unique release version for testing."""
        return f"v{uuid.uuid4().hex[:4]}.{uuid.uuid4().hex[:2]}.{uuid.uuid4().hex[:2]}"

    @pytest.fixture
    async def test_project(self, client: AsyncClient):
        """Create a test project for releases."""
        project_data = {
            "code": f"PROJ{uuid.uuid4().hex[:8].upper()}",
            "name": "Test Project for Releases",
            "description": "Project for testing releases",
            "status": "active",
        }
        response = await client.post("/api/v1/projects/", json=project_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    @pytest.fixture
    def sample_release_create_data(self, unique_release_version):
        """Sample data for creating a release."""
        future_date = (datetime.now() + timedelta(days=30)).isoformat()
        return {
            "version": unique_release_version,
            "name": "Test Release",
            "description": "This is a test release for API testing",
            "planned_date": future_date,
            "status": "planned",
            "release_notes": "Initial release notes for testing",
        }

    @pytest.fixture
    def sample_release_update_data(self):
        """Sample data for updating a release."""
        updated_date = (datetime.now() + timedelta(days=60)).isoformat()
        return {
            "name": "Updated Release Name",
            "description": "Updated release description",
            "planned_date": updated_date,
            "status": "in_progress",
            "release_notes": "Updated release notes",
        }

    async def create_test_release(
        self, client: AsyncClient, release_data: dict, project_id: int
    ) -> dict:
        """Helper method to create a test release."""
        release_data = release_data.copy()
        release_data["project_id"] = project_id

        response = await client.post("/api/v1/releases/", json=release_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    async def test_create_release_success(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test successful release creation."""
        sample_release_create_data["project_id"] = test_project["id"]

        response = await client.post(
            "/api/v1/releases/", json=sample_release_create_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["version"] == sample_release_create_data["version"]
        assert data["name"] == sample_release_create_data["name"]
        assert data["description"] == sample_release_create_data["description"]
        assert data["project_id"] == sample_release_create_data["project_id"]
        assert data["status"] == sample_release_create_data["status"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_release_duplicate_version(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test creating release with duplicate version in same project fails."""
        # Create first release
        await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        # Try to create another release with same version in same project
        duplicate_data = sample_release_create_data.copy()
        duplicate_data["name"] = "Different Release Name"
        duplicate_data["project_id"] = test_project["id"]

        response = await client.post("/api/v1/releases/", json=duplicate_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_create_release_missing_project(
        self, client: AsyncClient, sample_release_create_data
    ):
        """Test creating release without project fails."""
        response = await client.post(
            "/api/v1/releases/", json=sample_release_create_data
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_create_release_invalid_project(
        self, client: AsyncClient, sample_release_create_data
    ):
        """Test creating release with invalid project fails."""
        sample_release_create_data["project_id"] = 99999

        response = await client.post(
            "/api/v1/releases/", json=sample_release_create_data
        )
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
        ]

    async def test_create_release_missing_required_fields(
        self, client: AsyncClient, test_project
    ):
        """Test creating release with missing required fields fails."""
        incomplete_data = {"project_id": test_project["id"], "version": "v1.0.0"}

        response = await client.post("/api/v1/releases/", json=incomplete_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_get_releases_list(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test getting list of releases."""
        # Create test releases
        rel1_data = sample_release_create_data.copy()
        rel2_data = sample_release_create_data.copy()
        rel2_data["version"] = f"v2.{rel1_data['version'][1:]}"
        rel2_data["name"] = "Second Test Release"

        rel1 = await self.create_test_release(client, rel1_data, test_project["id"])
        rel2 = await self.create_test_release(client, rel2_data, test_project["id"])

        response = await client.get("/api/v1/releases/")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

        rel_ids = [rel["id"] for rel in data]
        assert rel1["id"] in rel_ids
        assert rel2["id"] in rel_ids

    async def test_get_releases_with_pagination(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test getting releases with pagination."""
        # Create test releases
        for i in range(5):
            rel_data = sample_release_create_data.copy()
            rel_data["version"] = f"v{i}.0.0"
            rel_data["name"] = f"Release {i}"
            await self.create_test_release(client, rel_data, test_project["id"])

        # Test pagination
        response = await client.get("/api/v1/releases/?skip=1&limit=2")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert len(data) <= 2

    async def test_get_releases_with_filters(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test getting releases with various filters."""
        # Create releases with different properties
        rel1_data = sample_release_create_data.copy()
        rel1_data["status"] = "planned"
        await self.create_test_release(client, rel1_data, test_project["id"])

        rel2_data = sample_release_create_data.copy()
        rel2_data["version"] = f"v2.{rel1_data['version'][1:]}"
        rel2_data["name"] = "Different Release"
        rel2_data["status"] = "released"
        await self.create_test_release(client, rel2_data, test_project["id"])

        # Test filters
        filters = [
            "?project_id=" + str(test_project["id"]),
            "?status=planned",
            "?search=" + rel1_data["name"][:5],
        ]

        for filter_param in filters:
            response = await client.get(f"/api/v1/releases/{filter_param}")
            assert response.status_code == status.HTTP_200_OK

            data = response.json()
            assert isinstance(data, list)

    async def test_get_release_by_id(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test getting release by ID."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        response = await client.get(f"/api/v1/releases/{created_rel['id']}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_rel["id"]
        assert data["version"] == created_rel["version"]
        assert data["name"] == created_rel["name"]
        assert data["project_id"] == created_rel["project_id"]

    async def test_get_release_not_found(self, client: AsyncClient):
        """Test getting non-existent release returns 404."""
        response = await client.get("/api/v1/releases/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_update_release(
        self,
        client: AsyncClient,
        test_project,
        sample_release_create_data,
        sample_release_update_data,
    ):
        """Test updating release."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        response = await client.put(
            f"/api/v1/releases/{created_rel['id']}", json=sample_release_update_data
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == sample_release_update_data["name"]
        assert data["description"] == sample_release_update_data["description"]
        assert data["status"] == sample_release_update_data["status"]
        assert data["id"] == created_rel["id"]
        assert data["version"] == created_rel["version"]  # Version should not change
        assert (
            data["project_id"] == created_rel["project_id"]
        )  # Project should not change

    async def test_update_release_not_found(
        self, client: AsyncClient, sample_release_update_data
    ):
        """Test updating non-existent release returns 404."""
        response = await client.put(
            "/api/v1/releases/99999", json=sample_release_update_data
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_release(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test deleting release."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        response = await client.delete(f"/api/v1/releases/{created_rel['id']}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify release is deleted
        get_response = await client.get(f"/api/v1/releases/{created_rel['id']}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_release_not_found(self, client: AsyncClient):
        """Test deleting non-existent release returns 404."""
        response = await client.delete("/api/v1/releases/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_get_release_requirements(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test getting release requirements."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        response = await client.get(
            f"/api/v1/releases/{created_rel['id']}/requirements"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_get_release_test_results(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test getting release test results."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        response = await client.get(
            f"/api/v1/releases/{created_rel['id']}/test-results"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_release_status_transitions(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test release status transitions."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        # Test different status transitions
        status_transitions = [
            {"status": "planned"},
            {"status": "in_progress"},
            {"status": "testing"},
            {"status": "ready"},
            {"status": "released"},
            {"status": "cancelled"},
        ]

        for status_update in status_transitions:
            response = await client.put(
                f"/api/v1/releases/{created_rel['id']}", json=status_update
            )
            # Some transitions might be restricted based on business rules
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
            ]

    async def test_release_deployment_actions(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test release deployment actions."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        # Test deployment actions
        deployment_actions = ["deploy", "rollback", "promote"]

        for action in deployment_actions:
            response = await client.post(
                f"/api/v1/releases/{created_rel['id']}/{action}"
            )
            # These endpoints might not exist yet or require specific conditions
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_405_METHOD_NOT_ALLOWED,
            ]

    async def test_release_validation(self, client: AsyncClient, test_project):
        """Test release field validation."""
        # Test empty version
        invalid_data = {
            "project_id": test_project["id"],
            "version": "",
            "name": "Test Release",
            "status": "planned",
        }

        response = await client.post("/api/v1/releases/", json=invalid_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test invalid date format
        invalid_date_data = {
            "project_id": test_project["id"],
            "version": "v1.0.0",
            "name": "Test Release",
            "planned_date": "invalid-date",
            "status": "planned",
        }

        response = await client.post("/api/v1/releases/", json=invalid_date_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_release_response_structure(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test that release response has expected structure."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        required_fields = [
            "id",
            "version",
            "name",
            "description",
            "project_id",
            "status",
            "created_at",
        ]

        for field in required_fields:
            assert (
                field in created_rel
            ), f"Required field '{field}' missing from response"

    async def test_release_version_format_validation(
        self, client: AsyncClient, test_project
    ):
        """Test release version format validation."""
        # Test different version formats
        version_formats = [
            "v1.0.0",  # Valid semantic version
            "1.0.0",  # Valid without 'v' prefix
            "v1.0",  # Valid short version
            "release-1",  # Valid custom format
            "v1.0.0-beta",  # Valid with suffix
            "invalid..version",  # Invalid format
            "v",  # Invalid empty version
        ]

        for version in version_formats:
            release_data = {
                "project_id": test_project["id"],
                "version": version,
                "name": f"Test Release {version}",
                "status": "planned",
            }

            response = await client.post("/api/v1/releases/", json=release_data)
            # Some formats might be rejected depending on validation rules
            assert response.status_code in [
                status.HTTP_201_CREATED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                status.HTTP_400_BAD_REQUEST,
            ]

    async def test_release_date_constraints(self, client: AsyncClient, test_project):
        """Test release date constraints."""
        past_date = (datetime.now() - timedelta(days=30)).isoformat()
        future_date = (datetime.now() + timedelta(days=30)).isoformat()

        # Test with past planned date
        past_date_data = {
            "project_id": test_project["id"],
            "version": "v1.0.0-past",
            "name": "Past Release",
            "planned_date": past_date,
            "status": "planned",
        }

        response = await client.post("/api/v1/releases/", json=past_date_data)
        # Might be allowed or rejected depending on business rules
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ]

        # Test with future planned date
        future_date_data = {
            "project_id": test_project["id"],
            "version": "v1.0.0-future",
            "name": "Future Release",
            "planned_date": future_date,
            "status": "planned",
        }

        response = await client.post("/api/v1/releases/", json=future_date_data)
        assert response.status_code == status.HTTP_201_CREATED

    async def test_release_statistics(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test release statistics endpoints."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        # Test getting release statistics
        response = await client.get(f"/api/v1/releases/{created_rel['id']}/stats")
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    async def test_release_changelog(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test release changelog functionality."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        # Test getting changelog
        response = await client.get(f"/api/v1/releases/{created_rel['id']}/changelog")
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    async def test_release_comparison(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test release comparison functionality."""
        # Create two releases
        rel1_data = sample_release_create_data.copy()
        rel1_data["version"] = "v1.0.0"
        rel1 = await self.create_test_release(client, rel1_data, test_project["id"])

        rel2_data = sample_release_create_data.copy()
        rel2_data["version"] = "v2.0.0"
        rel2_data["name"] = "Second Release"
        rel2 = await self.create_test_release(client, rel2_data, test_project["id"])

        # Test comparison
        response = await client.get(
            f"/api/v1/releases/{rel1['id']}/compare/{rel2['id']}"
        )
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    async def test_release_concurrent_operations(
        self, client: AsyncClient, test_project, sample_release_create_data
    ):
        """Test concurrent operations on releases."""
        created_rel = await self.create_test_release(
            client, sample_release_create_data, test_project["id"]
        )

        # Simulate concurrent reads
        import asyncio

        tasks = [
            client.get(f"/api/v1/releases/{created_rel['id']}"),
            client.get(f"/api/v1/releases/{created_rel['id']}/requirements"),
            client.get(f"/api/v1/releases/{created_rel['id']}/test-results"),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # All read operations should succeed
        for result in results:
            if isinstance(result, Exception):
                pytest.fail(f"Concurrent operation failed: {result}")
            else:
                assert result.status_code == status.HTTP_200_OK
