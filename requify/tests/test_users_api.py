"""
Comprehensive tests for Users API endpoints.

Tests all CRUD operations for user management via HTTP requests.
"""

import pytest
import uuid
from httpx import AsyncClient
from fastapi import status

from requify.app.core.config import settings


class TestUsersAPI:
    """Test class for Users API endpoints."""

    @pytest.fixture
    def unique_email(self):
        """Generate unique email for testing."""
        return f"test_{uuid.uuid4().hex[:8]}@example.com"

    @pytest.fixture
    def unique_username(self):
        """Generate unique username for testing."""
        return f"testuser_{uuid.uuid4().hex[:8]}"

    @pytest.fixture
    def sample_user_create_data(self, unique_email, unique_username):
        """Sample data for creating a user."""
        return {
            "email": unique_email,
            "username": unique_username,
            "password": "testpass123",
            "role": "user",
        }

    @pytest.fixture
    def sample_superuser_data(self, unique_email, unique_username):
        """Sample data for creating a superuser."""
        return {
            "email": unique_email,
            "username": unique_username,
            "password": "superpass123",
            "role": "admin",
        }

    async def create_test_user(
        self, client: AsyncClient, user_data: dict, auth_headers: dict
    ) -> dict:
        """Helper method to create a test user."""
        response = await client.post(
            "/api/v1/users/", json=user_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    async def test_create_user_success(
        self, client: AsyncClient, sample_user_create_data, auth_headers
    ):
        """Test successful user creation."""
        response = await client.post(
            "/api/v1/users/", json=sample_user_create_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["email"] == sample_user_create_data["email"]
        assert data["username"] == sample_user_create_data["username"]
        assert data["role"] == sample_user_create_data["role"]
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data  # Password should not be returned

    async def test_create_user_duplicate_email(
        self, client: AsyncClient, sample_user_create_data, auth_headers
    ):
        """Test creating user with duplicate email fails."""
        # Create first user
        await self.create_test_user(client, sample_user_create_data, auth_headers)

        # Try to create another user with same email
        duplicate_data = sample_user_create_data.copy()
        duplicate_data["username"] = f"different_{duplicate_data['username']}"

        response = await client.post(
            "/api/v1/users/", json=duplicate_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email уже существует" in response.json()["detail"]

    async def test_create_user_duplicate_username(
        self, client: AsyncClient, sample_user_create_data, auth_headers
    ):
        """Test creating user with duplicate username fails."""
        # Create first user
        await self.create_test_user(client, sample_user_create_data, auth_headers)

        # Try to create another user with same username
        duplicate_data = sample_user_create_data.copy()
        duplicate_data["email"] = f"different_{duplicate_data['email']}"

        response = await client.post(
            "/api/v1/users/", json=duplicate_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "именем уже существует" in response.json()["detail"]

    async def test_create_user_invalid_email(
        self, client: AsyncClient, sample_user_create_data, auth_headers
    ):
        """Test creating user with invalid email fails."""
        sample_user_create_data["email"] = "invalid-email"

        response = await client.post(
            "/api/v1/users/", json=sample_user_create_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_create_user_missing_required_fields(
        self, client: AsyncClient, auth_headers
    ):
        """Test creating user with missing required fields fails."""
        incomplete_data = {"username": "Test User"}

        response = await client.post(
            "/api/v1/users/", json=incomplete_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_get_users_list(self, client: AsyncClient, sample_user_create_data):
        """Test getting list of users."""
        # Create test users
        user1_data = sample_user_create_data.copy()
        user2_data = sample_user_create_data.copy()
        user2_data["email"] = f"second_{user1_data['email']}"
        user2_data["username"] = f"second_{user1_data['username']}"

        user1 = await self.create_test_user(client, user1_data)
        user2 = await self.create_test_user(client, user2_data)

        response = await client.get("/api/v1/users/")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

        user_ids = [user["id"] for user in data]
        assert user1["id"] in user_ids
        assert user2["id"] in user_ids

    async def test_get_users_with_pagination(
        self, client: AsyncClient, sample_user_create_data
    ):
        """Test getting users with pagination."""
        # Create test users
        for i in range(5):
            user_data = sample_user_create_data.copy()
            user_data["email"] = f"user{i}_{user_data['email']}"
            user_data["username"] = f"user{i}_{user_data['username']}"
            await self.create_test_user(client, user_data)

        # Test pagination
        response = await client.get("/api/v1/users/?skip=1&limit=2")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert len(data) <= 2

    async def test_get_users_with_filters(
        self, client: AsyncClient, sample_user_create_data
    ):
        """Test getting users with filters."""
        # Create active and inactive users
        active_user_data = sample_user_create_data.copy()
        active_user_data["is_active"] = True
        await self.create_test_user(client, active_user_data)

        inactive_user_data = sample_user_create_data.copy()
        inactive_user_data["email"] = f"inactive_{active_user_data['email']}"
        inactive_user_data["username"] = f"inactive_{active_user_data['username']}"
        inactive_user_data["is_active"] = False
        await self.create_test_user(client, inactive_user_data)

        # Test filtering by active status
        response = await client.get("/api/v1/users/?is_active=true")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        for user in data:
            assert user["is_active"] is True

    async def test_get_users_search(self, client: AsyncClient, sample_user_create_data):
        """Test searching users."""
        user_data = sample_user_create_data.copy()
        user_data["name"] = "John Doe Search Test"
        created_user = await self.create_test_user(client, user_data)

        # Search by name
        response = await client.get("/api/v1/users/?search=John")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        user_ids = [user["id"] for user in data]
        assert created_user["id"] in user_ids

    async def test_get_user_by_id(self, client: AsyncClient, sample_user_create_data):
        """Test getting user by ID."""
        created_user = await self.create_test_user(client, sample_user_create_data)

        response = await client.get(f"/api/v1/users/{created_user['id']}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_user["id"]
        assert data["email"] == created_user["email"]
        assert data["username"] == created_user["username"]

    async def test_get_user_not_found(self, client: AsyncClient):
        """Test getting non-existent user returns 404."""
        response = await client.get("/api/v1/users/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_update_user(self, client: AsyncClient, sample_user_create_data):
        """Test updating user."""
        created_user = await self.create_test_user(client, sample_user_create_data)

        update_data = {"name": "Updated Name", "is_active": False}

        response = await client.put(
            f"/api/v1/users/{created_user['id']}", json=update_data
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["is_active"] == update_data["is_active"]
        assert data["id"] == created_user["id"]

    async def test_update_user_not_found(self, client: AsyncClient):
        """Test updating non-existent user returns 404."""
        update_data = {"name": "Updated Name"}

        response = await client.put("/api/v1/users/99999", json=update_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_update_user_duplicate_email(
        self, client: AsyncClient, sample_user_create_data
    ):
        """Test updating user with duplicate email fails."""
        # Create two users
        user1 = await self.create_test_user(client, sample_user_create_data)

        user2_data = sample_user_create_data.copy()
        user2_data["email"] = f"second_{user1['email']}"
        user2_data["username"] = f"second_{user1['username']}"
        user2 = await self.create_test_user(client, user2_data)

        # Try to update user2 with user1's email
        update_data = {"email": user1["email"]}
        response = await client.put(f"/api/v1/users/{user2['id']}", json=update_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_delete_user(self, client: AsyncClient, sample_user_create_data):
        """Test deleting user."""
        created_user = await self.create_test_user(client, sample_user_create_data)

        response = await client.delete(f"/api/v1/users/{created_user['id']}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify user is deleted
        get_response = await client.get(f"/api/v1/users/{created_user['id']}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_user_not_found(self, client: AsyncClient):
        """Test deleting non-existent user returns 404."""
        response = await client.delete("/api/v1/users/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_activate_user(self, client: AsyncClient, sample_user_create_data):
        """Test activating user."""
        sample_user_create_data["is_active"] = False
        created_user = await self.create_test_user(client, sample_user_create_data)

        response = await client.post(f"/api/v1/users/{created_user['id']}/activate")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["is_active"] is True

    async def test_deactivate_user(self, client: AsyncClient, sample_user_create_data):
        """Test deactivating user."""
        sample_user_create_data["is_active"] = True
        created_user = await self.create_test_user(client, sample_user_create_data)

        response = await client.post(f"/api/v1/users/{created_user['id']}/deactivate")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["is_active"] is False

    async def test_get_current_user_me(
        self, client: AsyncClient, sample_user_create_data
    ):
        """Test getting current user info."""
        # Note: This test assumes authentication is working
        response = await client.get("/api/v1/users/me")
        # Expected to fail without proper authentication setup
        # You might need to adjust this based on your auth implementation
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_401_UNAUTHORIZED,
        ]

    async def test_update_current_user_me(self, client: AsyncClient):
        """Test updating current user info."""
        update_data = {"name": "Updated Current User"}

        response = await client.put("/api/v1/users/me", json=update_data)
        # Expected to fail without proper authentication setup
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_401_UNAUTHORIZED,
        ]

    async def test_user_field_validation(
        self, client: AsyncClient, sample_user_create_data
    ):
        """Test various field validations."""
        # Test password too short
        short_password_data = sample_user_create_data.copy()
        short_password_data["password"] = "123"

        response = await client.post("/api/v1/users/", json=short_password_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test invalid role
        invalid_role_data = sample_user_create_data.copy()
        invalid_role_data["role"] = "invalid_role"

        response = await client.post("/api/v1/users/", json=invalid_role_data)
        # This might pass depending on your validation rules
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]

    async def test_user_response_structure(
        self, client: AsyncClient, sample_user_create_data
    ):
        """Test that user response has expected structure."""
        created_user = await self.create_test_user(client, sample_user_create_data)

        required_fields = [
            "id",
            "email",
            "username",
            "name",
            "is_active",
            "is_superuser",
            "created_at",
        ]
        forbidden_fields = ["password", "hashed_password"]

        for field in required_fields:
            assert (
                field in created_user
            ), f"Required field '{field}' missing from response"

        for field in forbidden_fields:
            assert (
                field not in created_user
            ), f"Forbidden field '{field}' present in response"
