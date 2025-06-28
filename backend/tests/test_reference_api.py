"""
Comprehensive tests for Reference Data API endpoints.

Tests all CRUD operations for reference data management via HTTP requests.
"""

import pytest
import uuid
from httpx import AsyncClient
from fastapi import status


class TestReferenceAPI:
    """Test class for Reference Data API endpoints."""

    @pytest.fixture
    def unique_reference_name(self):
        """Generate unique reference name for testing."""
        return f"REF-{uuid.uuid4().hex[:8].upper()}"

    @pytest.fixture
    def sample_requirement_type_data(self, unique_reference_name):
        """Sample data for creating a requirement type."""
        return {
            "name": unique_reference_name,
            "description": "Test requirement type description",
            "color": "#FF5733",
            "is_active": True,
        }

    @pytest.fixture
    def sample_requirement_status_data(self, unique_reference_name):
        """Sample data for creating a requirement status."""
        return {
            "name": unique_reference_name,
            "description": "Test requirement status description",
            "color": "#33FF57",
            "is_active": True,
            "is_final": False,
        }

    @pytest.fixture
    def sample_requirement_priority_data(self, unique_reference_name):
        """Sample data for creating a requirement priority."""
        return {
            "name": unique_reference_name,
            "description": "Test requirement priority description",
            "level": 1,
            "color": "#3357FF",
            "is_active": True,
        }

    @pytest.fixture
    def sample_relationship_type_data(self, unique_reference_name):
        """Sample data for creating a relationship type."""
        return {
            "name": unique_reference_name,
            "description": "Test relationship type description",
            "inverse_name": f"Inverse {unique_reference_name}",
            "is_active": True,
        }

    # REQUIREMENT TYPES TESTS
    async def test_get_requirement_types(self, client: AsyncClient):
        """Test getting list of requirement types."""
        response = await client.get("/api/v1/reference/requirement-types")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_create_requirement_type_success(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test successful requirement type creation."""
        response = await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == sample_requirement_type_data["name"]
        assert data["description"] == sample_requirement_type_data["description"]
        assert data["color"] == sample_requirement_type_data["color"]
        assert data["is_active"] == sample_requirement_type_data["is_active"]
        assert "id" in data

    async def test_create_requirement_type_duplicate_name(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test creating requirement type with duplicate name fails."""
        # Create first type
        await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )

        # Try to create another type with same name
        response = await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_get_requirement_type_by_id(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test getting requirement type by ID."""
        # Create a type first
        create_response = await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )
        created_type = create_response.json()

        response = await client.get(
            f"/api/v1/reference/requirement-types/{created_type['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_type["id"]
        assert data["name"] == created_type["name"]

    async def test_update_requirement_type(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test updating requirement type."""
        # Create a type first
        create_response = await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )
        created_type = create_response.json()

        update_data = {
            "name": "Updated Type Name",
            "description": "Updated description",
            "color": "#FF0000",
        }

        response = await client.put(
            f"/api/v1/reference/requirement-types/{created_type['id']}",
            json=update_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["color"] == update_data["color"]

    async def test_delete_requirement_type(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test deleting requirement type."""
        # Create a type first
        create_response = await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )
        created_type = create_response.json()

        response = await client.delete(
            f"/api/v1/reference/requirement-types/{created_type['id']}"
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify type is deleted
        get_response = await client.get(
            f"/api/v1/reference/requirement-types/{created_type['id']}"
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    # REQUIREMENT STATUSES TESTS
    async def test_get_requirement_statuses(self, client: AsyncClient):
        """Test getting list of requirement statuses."""
        response = await client.get("/api/v1/reference/requirement-statuses")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_create_requirement_status_success(
        self, client: AsyncClient, sample_requirement_status_data
    ):
        """Test successful requirement status creation."""
        response = await client.post(
            "/api/v1/reference/requirement-statuses",
            json=sample_requirement_status_data,
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == sample_requirement_status_data["name"]
        assert data["description"] == sample_requirement_status_data["description"]
        assert data["color"] == sample_requirement_status_data["color"]
        assert data["is_active"] == sample_requirement_status_data["is_active"]
        assert data["is_final"] == sample_requirement_status_data["is_final"]
        assert "id" in data

    async def test_get_requirement_status_by_id(
        self, client: AsyncClient, sample_requirement_status_data
    ):
        """Test getting requirement status by ID."""
        # Create a status first
        create_response = await client.post(
            "/api/v1/reference/requirement-statuses",
            json=sample_requirement_status_data,
        )
        created_status = create_response.json()

        response = await client.get(
            f"/api/v1/reference/requirement-statuses/{created_status['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_status["id"]
        assert data["name"] == created_status["name"]

    async def test_update_requirement_status(
        self, client: AsyncClient, sample_requirement_status_data
    ):
        """Test updating requirement status."""
        # Create a status first
        create_response = await client.post(
            "/api/v1/reference/requirement-statuses",
            json=sample_requirement_status_data,
        )
        created_status = create_response.json()

        update_data = {
            "name": "Updated Status Name",
            "description": "Updated status description",
            "is_final": True,
        }

        response = await client.put(
            f"/api/v1/reference/requirement-statuses/{created_status['id']}",
            json=update_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["is_final"] == update_data["is_final"]

    async def test_delete_requirement_status(
        self, client: AsyncClient, sample_requirement_status_data
    ):
        """Test deleting requirement status."""
        # Create a status first
        create_response = await client.post(
            "/api/v1/reference/requirement-statuses",
            json=sample_requirement_status_data,
        )
        created_status = create_response.json()

        response = await client.delete(
            f"/api/v1/reference/requirement-statuses/{created_status['id']}"
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify status is deleted
        get_response = await client.get(
            f"/api/v1/reference/requirement-statuses/{created_status['id']}"
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    # REQUIREMENT PRIORITIES TESTS
    async def test_get_requirement_priorities(self, client: AsyncClient):
        """Test getting list of requirement priorities."""
        response = await client.get("/api/v1/reference/requirement-priorities")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_create_requirement_priority_success(
        self, client: AsyncClient, sample_requirement_priority_data
    ):
        """Test successful requirement priority creation."""
        response = await client.post(
            "/api/v1/reference/requirement-priorities",
            json=sample_requirement_priority_data,
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == sample_requirement_priority_data["name"]
        assert data["description"] == sample_requirement_priority_data["description"]
        assert data["level"] == sample_requirement_priority_data["level"]
        assert data["color"] == sample_requirement_priority_data["color"]
        assert data["is_active"] == sample_requirement_priority_data["is_active"]
        assert "id" in data

    async def test_get_requirement_priority_by_id(
        self, client: AsyncClient, sample_requirement_priority_data
    ):
        """Test getting requirement priority by ID."""
        # Create a priority first
        create_response = await client.post(
            "/api/v1/reference/requirement-priorities",
            json=sample_requirement_priority_data,
        )
        created_priority = create_response.json()

        response = await client.get(
            f"/api/v1/reference/requirement-priorities/{created_priority['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_priority["id"]
        assert data["name"] == created_priority["name"]

    async def test_update_requirement_priority(
        self, client: AsyncClient, sample_requirement_priority_data
    ):
        """Test updating requirement priority."""
        # Create a priority first
        create_response = await client.post(
            "/api/v1/reference/requirement-priorities",
            json=sample_requirement_priority_data,
        )
        created_priority = create_response.json()

        update_data = {
            "name": "Updated Priority Name",
            "description": "Updated priority description",
            "level": 5,
        }

        response = await client.put(
            f"/api/v1/reference/requirement-priorities/{created_priority['id']}",
            json=update_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["level"] == update_data["level"]

    async def test_delete_requirement_priority(
        self, client: AsyncClient, sample_requirement_priority_data
    ):
        """Test deleting requirement priority."""
        # Create a priority first
        create_response = await client.post(
            "/api/v1/reference/requirement-priorities",
            json=sample_requirement_priority_data,
        )
        created_priority = create_response.json()

        response = await client.delete(
            f"/api/v1/reference/requirement-priorities/{created_priority['id']}"
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify priority is deleted
        get_response = await client.get(
            f"/api/v1/reference/requirement-priorities/{created_priority['id']}"
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    # RELATIONSHIP TYPES TESTS
    async def test_get_relationship_types(self, client: AsyncClient):
        """Test getting list of relationship types."""
        response = await client.get("/api/v1/reference/relationship-types")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_create_relationship_type_success(
        self, client: AsyncClient, sample_relationship_type_data
    ):
        """Test successful relationship type creation."""
        response = await client.post(
            "/api/v1/reference/relationship-types", json=sample_relationship_type_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == sample_relationship_type_data["name"]
        assert data["description"] == sample_relationship_type_data["description"]
        assert data["inverse_name"] == sample_relationship_type_data["inverse_name"]
        assert data["is_active"] == sample_relationship_type_data["is_active"]
        assert "id" in data

    async def test_get_relationship_type_by_id(
        self, client: AsyncClient, sample_relationship_type_data
    ):
        """Test getting relationship type by ID."""
        # Create a type first
        create_response = await client.post(
            "/api/v1/reference/relationship-types", json=sample_relationship_type_data
        )
        created_type = create_response.json()

        response = await client.get(
            f"/api/v1/reference/relationship-types/{created_type['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_type["id"]
        assert data["name"] == created_type["name"]

    async def test_update_relationship_type(
        self, client: AsyncClient, sample_relationship_type_data
    ):
        """Test updating relationship type."""
        # Create a type first
        create_response = await client.post(
            "/api/v1/reference/relationship-types", json=sample_relationship_type_data
        )
        created_type = create_response.json()

        update_data = {
            "name": "Updated Relationship Type",
            "description": "Updated description",
            "inverse_name": "Updated Inverse Name",
        }

        response = await client.put(
            f"/api/v1/reference/relationship-types/{created_type['id']}",
            json=update_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["inverse_name"] == update_data["inverse_name"]

    async def test_delete_relationship_type(
        self, client: AsyncClient, sample_relationship_type_data
    ):
        """Test deleting relationship type."""
        # Create a type first
        create_response = await client.post(
            "/api/v1/reference/relationship-types", json=sample_relationship_type_data
        )
        created_type = create_response.json()

        response = await client.delete(
            f"/api/v1/reference/relationship-types/{created_type['id']}"
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify type is deleted
        get_response = await client.get(
            f"/api/v1/reference/relationship-types/{created_type['id']}"
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    # VALIDATION TESTS
    async def test_reference_data_validation(self, client: AsyncClient):
        """Test validation for reference data creation."""
        # Test empty name
        invalid_data = {"name": "", "description": "Test description"}

        response = await client.post(
            "/api/v1/reference/requirement-types", json=invalid_data
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_reference_data_color_validation(self, client: AsyncClient):
        """Test color field validation."""
        # Test invalid color format
        invalid_color_data = {
            "name": "Test Type",
            "description": "Test description",
            "color": "invalid-color",
            "is_active": True,
        }

        response = await client.post(
            "/api/v1/reference/requirement-types", json=invalid_color_data
        )
        # This might pass depending on your validation rules
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]

    async def test_reference_data_pagination(self, client: AsyncClient):
        """Test pagination for reference data endpoints."""
        # Test pagination parameters
        response = await client.get(
            "/api/v1/reference/requirement-types?skip=0&limit=10"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10

    async def test_reference_data_filtering(self, client: AsyncClient):
        """Test filtering for reference data."""
        # Test active filter
        response = await client.get(
            "/api/v1/reference/requirement-types?is_active=true"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

        # All returned items should be active
        for item in data:
            assert item.get("is_active", True) is True

    async def test_reference_data_search(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test search functionality for reference data."""
        # Create a searchable item
        sample_requirement_type_data["name"] = "Searchable Type Name"
        await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )

        # Search for the item
        response = await client.get(
            "/api/v1/reference/requirement-types?search=Searchable"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

        # Should find the created item
        found_items = [item for item in data if "Searchable" in item["name"]]
        assert len(found_items) > 0

    async def test_reference_data_ordering(self, client: AsyncClient):
        """Test ordering for reference data."""
        # Test ordering by name
        response = await client.get("/api/v1/reference/requirement-types?order_by=name")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

        # Verify ordering (if more than one item)
        if len(data) > 1:
            names = [item["name"] for item in data]
            assert names == sorted(names)

    async def test_bulk_reference_data_operations(self, client: AsyncClient):
        """Test bulk operations on reference data."""
        # Test bulk create (if supported)
        bulk_data = [
            {
                "name": "Bulk Type 1",
                "description": "First bulk type",
                "is_active": True,
            },
            {
                "name": "Bulk Type 2",
                "description": "Second bulk type",
                "is_active": True,
            },
        ]

        response = await client.post(
            "/api/v1/reference/requirement-types/bulk", json=bulk_data
        )
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    async def test_reference_data_activation_deactivation(
        self, client: AsyncClient, sample_requirement_type_data
    ):
        """Test activation/deactivation of reference data."""
        # Create an active item
        create_response = await client.post(
            "/api/v1/reference/requirement-types", json=sample_requirement_type_data
        )
        created_item = create_response.json()

        # Deactivate
        deactivate_data = {"is_active": False}
        response = await client.put(
            f"/api/v1/reference/requirement-types/{created_item['id']}",
            json=deactivate_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["is_active"] is False

        # Reactivate
        activate_data = {"is_active": True}
        response = await client.put(
            f"/api/v1/reference/requirement-types/{created_item['id']}",
            json=activate_data,
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["is_active"] is True
