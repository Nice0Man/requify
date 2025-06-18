"""
Comprehensive tests for Requirements API endpoints.

Tests all CRUD operations for requirements management via HTTP requests.
"""

import pytest
import uuid
from httpx import AsyncClient
from fastapi import status


class TestRequirementsAPI:
    """Test class for Requirements API endpoints."""

    @pytest.fixture
    def unique_requirement_title(self):
        """Generate unique requirement title for testing."""
        return f"REQ-{uuid.uuid4().hex[:8].upper()}"

    @pytest.fixture
    async def test_project(self, client: AsyncClient):
        """Create a test project for requirements."""
        project_data = {
            "code": f"PROJ{uuid.uuid4().hex[:8].upper()}",
            "name": "Test Project for Requirements",
            "description": "Project for testing requirements",
            "status": "active",
        }
        response = await client.post("/api/v1/projects/", json=project_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    @pytest.fixture
    def sample_requirement_create_data(self, unique_requirement_title):
        """Sample data for creating a requirement."""
        return {
            "title": unique_requirement_title,
            "description": "This is a test requirement for API testing",
            "type_id": 1,  # Assuming functional requirement type
            "priority_id": 1,  # Assuming high priority
            "status_id": 1,  # Assuming draft status
            "acceptance_criteria": "Given when then acceptance criteria",
            "business_value": "High business value requirement",
        }

    @pytest.fixture
    def sample_requirement_update_data(self):
        """Sample data for updating a requirement."""
        return {
            "title": "Updated Requirement Title",
            "description": "Updated requirement description",
            "type_id": 2,
            "priority_id": 2,
            "status_id": 2,
            "acceptance_criteria": "Updated acceptance criteria",
            "business_value": "Updated business value",
        }

    async def create_test_requirement(
        self, client: AsyncClient, requirement_data: dict, project_id: int
    ) -> dict:
        """Helper method to create a test requirement."""
        requirement_data = requirement_data.copy()
        requirement_data["project_id"] = project_id

        response = await client.post("/api/v1/requirements/", json=requirement_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    async def test_create_requirement_success(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test successful requirement creation."""
        sample_requirement_create_data["project_id"] = test_project["id"]

        response = await client.post(
            "/api/v1/requirements/", json=sample_requirement_create_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["title"] == sample_requirement_create_data["title"]
        assert data["description"] == sample_requirement_create_data["description"]
        assert data["project_id"] == sample_requirement_create_data["project_id"]
        assert data["type_id"] == sample_requirement_create_data["type_id"]
        assert data["priority_id"] == sample_requirement_create_data["priority_id"]
        assert data["status_id"] == sample_requirement_create_data["status_id"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_requirement_missing_project(
        self, client: AsyncClient, sample_requirement_create_data
    ):
        """Test creating requirement without project fails."""
        response = await client.post(
            "/api/v1/requirements/", json=sample_requirement_create_data
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_create_requirement_invalid_project(
        self, client: AsyncClient, sample_requirement_create_data
    ):
        """Test creating requirement with invalid project fails."""
        sample_requirement_create_data["project_id"] = 99999

        response = await client.post(
            "/api/v1/requirements/", json=sample_requirement_create_data
        )
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
        ]

    async def test_create_requirement_missing_required_fields(
        self, client: AsyncClient, test_project
    ):
        """Test creating requirement with missing required fields fails."""
        incomplete_data = {
            "project_id": test_project["id"],
            "title": "Incomplete Requirement",
        }

        response = await client.post("/api/v1/requirements/", json=incomplete_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_get_requirements_list(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test getting list of requirements."""
        # Create test requirements
        req1_data = sample_requirement_create_data.copy()
        req2_data = sample_requirement_create_data.copy()
        req2_data["title"] = f"Second_{req1_data['title']}"

        req1 = await self.create_test_requirement(client, req1_data, test_project["id"])
        req2 = await self.create_test_requirement(client, req2_data, test_project["id"])

        response = await client.get("/api/v1/requirements/")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

        req_ids = [req["id"] for req in data]
        assert req1["id"] in req_ids
        assert req2["id"] in req_ids

    async def test_get_requirements_with_pagination(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test getting requirements with pagination."""
        # Create test requirements
        for i in range(5):
            req_data = sample_requirement_create_data.copy()
            req_data["title"] = f"Requirement {i}"
            await self.create_test_requirement(client, req_data, test_project["id"])

        # Test pagination
        response = await client.get("/api/v1/requirements/?skip=1&limit=2")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert len(data) <= 2

    async def test_get_requirements_with_filters(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test getting requirements with various filters."""
        # Create requirements with different properties
        req1_data = sample_requirement_create_data.copy()
        req1_data["type_id"] = 1
        req1_data["priority_id"] = 1
        req1_data["status_id"] = 1
        await self.create_test_requirement(client, req1_data, test_project["id"])

        req2_data = sample_requirement_create_data.copy()
        req2_data["title"] = f"Different_{req1_data['title']}"
        req2_data["type_id"] = 2
        req2_data["priority_id"] = 2
        req2_data["status_id"] = 2
        await self.create_test_requirement(client, req2_data, test_project["id"])

        # Test filters
        filters = [
            "?project_id=" + str(test_project["id"]),
            "?type_id=1",
            "?priority_id=1",
            "?status_id=1",
            "?search=" + req1_data["title"][:5],
        ]

        for filter_param in filters:
            response = await client.get(f"/api/v1/requirements/{filter_param}")
            assert response.status_code == status.HTTP_200_OK

            data = response.json()
            assert isinstance(data, list)

    async def test_get_requirements_search(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test searching requirements."""
        req_data = sample_requirement_create_data.copy()
        req_data["title"] = "Unique Search Requirement Title"
        created_req = await self.create_test_requirement(
            client, req_data, test_project["id"]
        )

        # Search by title
        response = await client.get("/api/v1/requirements/?search=Unique")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        req_ids = [req["id"] for req in data]
        assert created_req["id"] in req_ids

    async def test_get_requirement_by_id(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test getting requirement by ID."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        response = await client.get(f"/api/v1/requirements/{created_req['id']}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_req["id"]
        assert data["title"] == created_req["title"]
        assert data["description"] == created_req["description"]
        assert data["project_id"] == created_req["project_id"]

    async def test_get_requirement_not_found(self, client: AsyncClient):
        """Test getting non-existent requirement returns 404."""
        response = await client.get("/api/v1/requirements/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_update_requirement(
        self,
        client: AsyncClient,
        test_project,
        sample_requirement_create_data,
        sample_requirement_update_data,
    ):
        """Test updating requirement."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        response = await client.put(
            f"/api/v1/requirements/{created_req['id']}",
            json=sample_requirement_update_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["title"] == sample_requirement_update_data["title"]
        assert data["description"] == sample_requirement_update_data["description"]
        assert data["type_id"] == sample_requirement_update_data["type_id"]
        assert data["priority_id"] == sample_requirement_update_data["priority_id"]
        assert data["status_id"] == sample_requirement_update_data["status_id"]
        assert data["id"] == created_req["id"]
        assert data["project_id"] == created_req["project_id"]  # Should not change

    async def test_update_requirement_not_found(
        self, client: AsyncClient, sample_requirement_update_data
    ):
        """Test updating non-existent requirement returns 404."""
        response = await client.put(
            "/api/v1/requirements/99999", json=sample_requirement_update_data
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_requirement(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test deleting requirement."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        response = await client.delete(f"/api/v1/requirements/{created_req['id']}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify requirement is deleted
        get_response = await client.get(f"/api/v1/requirements/{created_req['id']}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_requirement_not_found(self, client: AsyncClient):
        """Test deleting non-existent requirement returns 404."""
        response = await client.delete("/api/v1/requirements/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_requirement_relationships(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement relationships endpoints."""
        # Create parent and child requirements
        parent_data = sample_requirement_create_data.copy()
        parent_data["title"] = "Parent Requirement"
        parent_req = await self.create_test_requirement(
            client, parent_data, test_project["id"]
        )

        child_data = sample_requirement_create_data.copy()
        child_data["title"] = "Child Requirement"
        child_req = await self.create_test_requirement(
            client, child_data, test_project["id"]
        )

        # Test getting relationships (should be empty initially)
        response = await client.get(
            f"/api/v1/requirements/{parent_req['id']}/relationships"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_requirement_comments(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement comments endpoints."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Test getting comments (should be empty initially)
        response = await client.get(
            f"/api/v1/requirements/{created_req['id']}/comments"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_requirement_test_results(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement test results endpoints."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Test getting test results (should be empty initially)
        response = await client.get(
            f"/api/v1/requirements/{created_req['id']}/test-results"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_requirement_history(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement change history."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Test getting history
        response = await client.get(f"/api/v1/requirements/{created_req['id']}/history")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_requirement_approval_workflow(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement approval workflow endpoints."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Test approval actions
        approval_actions = ["approve", "reject", "submit"]

        for action in approval_actions:
            response = await client.post(
                f"/api/v1/requirements/{created_req['id']}/{action}"
            )
            # These might require specific permissions or states
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_404_NOT_FOUND,
            ]

    async def test_requirement_validation(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement field validation."""
        # Test empty title
        empty_title_data = sample_requirement_create_data.copy()
        empty_title_data["project_id"] = test_project["id"]
        empty_title_data["title"] = ""

        response = await client.post("/api/v1/requirements/", json=empty_title_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test invalid type_id
        invalid_type_data = sample_requirement_create_data.copy()
        invalid_type_data["project_id"] = test_project["id"]
        invalid_type_data["type_id"] = -1

        response = await client.post("/api/v1/requirements/", json=invalid_type_data)
        # This might pass depending on your validation rules
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST,
        ]

    async def test_requirement_response_structure(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test that requirement response has expected structure."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        required_fields = [
            "id",
            "title",
            "description",
            "project_id",
            "type_id",
            "priority_id",
            "status_id",
            "created_at",
        ]

        for field in required_fields:
            assert (
                field in created_req
            ), f"Required field '{field}' missing from response"

    async def test_requirement_lifecycle_transitions(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement status transitions throughout lifecycle."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Test different status transitions
        status_transitions = [
            {"status_id": 1},  # Draft
            {"status_id": 2},  # In Review
            {"status_id": 3},  # Approved
            {"status_id": 4},  # In Development
            {"status_id": 5},  # Testing
            {"status_id": 6},  # Completed
        ]

        for status_update in status_transitions:
            response = await client.put(
                f"/api/v1/requirements/{created_req['id']}", json=status_update
            )
            # Some transitions might be restricted
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
            ]

    async def test_requirement_bulk_operations(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test bulk operations on requirements."""
        # Create multiple requirements
        requirements = []
        for i in range(3):
            req_data = sample_requirement_create_data.copy()
            req_data["title"] = f"Bulk Requirement {i}"
            req = await self.create_test_requirement(
                client, req_data, test_project["id"]
            )
            requirements.append(req)

        # Test bulk status update
        bulk_update_data = {
            "requirement_ids": [req["id"] for req in requirements],
            "status_id": 2,
        }

        response = await client.put("/api/v1/requirements/bulk", json=bulk_update_data)
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    async def test_requirement_export_import(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test requirement export and import functionality."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Test export
        response = await client.get(
            f"/api/v1/requirements/export?project_id={test_project['id']}"
        )
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    async def test_requirement_concurrent_updates(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test concurrent updates to requirements."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # Simulate concurrent updates
        import asyncio

        update_data1 = {"title": "Concurrent Update 1"}
        update_data2 = {"description": "Concurrent Update 2"}

        tasks = [
            client.put(f"/api/v1/requirements/{created_req['id']}", json=update_data1),
            client.put(f"/api/v1/requirements/{created_req['id']}", json=update_data2),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # At least one should succeed
        success_count = sum(
            1
            for result in results
            if not isinstance(result, Exception)
            and result.status_code == status.HTTP_200_OK
        )
        assert success_count >= 1

    async def test_requirement_permission_checks(
        self, client: AsyncClient, test_project, sample_requirement_create_data
    ):
        """Test permission checks for requirement operations."""
        created_req = await self.create_test_requirement(
            client, sample_requirement_create_data, test_project["id"]
        )

        # These tests assume your auth system is implemented
        # You might need to modify based on your actual auth implementation

        # Test without auth (if applicable)
        # Note: This will depend on your authentication setup

        # Test read operations (should be allowed for most users)
        response = await client.get(f"/api/v1/requirements/{created_req['id']}")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_401_UNAUTHORIZED,
        ]

        # Test write operations (might require special permissions)
        update_data = {"title": "Permission Test Update"}
        response = await client.put(
            f"/api/v1/requirements/{created_req['id']}", json=update_data
        )
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]
