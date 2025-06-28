"""Simple API test to verify authentication setup."""

import pytest
from httpx import AsyncClient
from fastapi import status


@pytest.mark.asyncio
class TestSimpleAPI:
    """Simple API tests for verification."""

    async def test_create_user_with_auth(self, client: AsyncClient, auth_headers):
        """Test creating a user with proper authentication."""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "role": "user",
            "password": "testpass123",
        }

        response = await client.post(
            "/api/v1/users/", json=user_data, headers=auth_headers
        )
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert "id" in data

    async def test_get_users_with_auth(self, client: AsyncClient, auth_headers):
        """Test getting users list with authentication."""
        response = await client.get("/api/v1/users/", headers=auth_headers)
        print(f"Get users response status: {response.status_code}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
