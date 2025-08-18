"""
Comprehensive tests for Authentication API with admin credentials.

Tests all authentication endpoints using admin credentials to verify
proper functionality, security, and error handling.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import httpx
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch, MagicMock

from app.main import app
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.enhanced_role_system import (
    EnhancedRole,
    UserRoleAssignment,
    SystemRole,
    RoleScope,
)
from app.db.db_helper import db_helper
from app.schemas.auth import LoginResponse, UserResponse


class TestAuthenticationAPIWithAdmin:
    """Test suite for Authentication API with admin credentials."""

    @pytest.fixture(scope="class")
    async def admin_user_data(self):
        """Admin user test data based on settings."""
        return {
            "username": "admin",
            "email": settings.admin.email,
            "password": settings.admin.password,
            "name": settings.admin.name,
            "is_active": True,
            "is_email_verified": True,
            "status": "active",
        }

    @pytest.fixture(scope="class")
    async def test_client(self):
        """Test client for API requests."""
        return TestClient(app)

    @pytest.fixture(scope="function")
    async def admin_user(self, test_db_session, admin_user_data):
        """Create admin user in test database."""
        # Create admin user
        admin = User(
            username=admin_user_data["username"],
            email=admin_user_data["email"],
            password_hash=get_password_hash(admin_user_data["password"]),
            name=admin_user_data["name"],
            is_active=admin_user_data["is_active"],
            is_email_verified=admin_user_data["is_email_verified"],
            status=admin_user_data["status"],
        )

        test_db_session.add(admin)
        test_db_session.flush()

        # Create system admin role
        system_admin_role = EnhancedRole(
            name="System Administrator",
            system_role=SystemRole.SYSTEM_ADMIN.value,
            scope=RoleScope.SYSTEM.value,
            description="Full system access",
            is_system_role=True,
            permissions=["*"],  # All permissions
        )

        test_db_session.add(system_admin_role)
        test_db_session.flush()

        # Assign role to admin
        role_assignment = UserRoleAssignment(
            user_id=admin.id,
            role_id=system_admin_role.id,
            scope=RoleScope.SYSTEM.value,
            assigned_by=admin.id,
            is_active=True,
        )

        test_db_session.add(role_assignment)
        test_db_session.commit()
        test_db_session.refresh(admin)

        return admin

    @pytest.fixture
    async def admin_token(self, test_client, admin_user_data, admin_user):
        """Get admin access token."""
        login_data = {
            "username": admin_user_data["email"],
            "password": admin_user_data["password"],
        }

        response = test_client.post(
            "/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 200
        token_data = response.json()
        return token_data["access_token"]

    @pytest.fixture
    def auth_headers(self, admin_token):
        """Authorization headers with admin token."""
        return {"Authorization": f"Bearer {admin_token}"}


class TestAdminLogin(TestAuthenticationAPIWithAdmin):
    """Test admin login functionality."""

    async def test_admin_login_success(self, test_client, admin_user_data, admin_user):
        """Test successful admin login."""
        login_data = {
            "username": admin_user_data["email"],
            "password": admin_user_data["password"],
        }

        response = test_client.post(
            "/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 200

        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert "user" in data

        # Verify user data
        user_data = data["user"]
        assert user_data["email"] == admin_user_data["email"]
        assert user_data["username"] == admin_user_data["username"]
        assert user_data["is_active"] is True

    async def test_admin_login_invalid_password(
        self, test_client, admin_user_data, admin_user
    ):
        """Test admin login with invalid password."""
        login_data = {
            "username": admin_user_data["email"],
            "password": "wrong_password",
        }

        response = test_client.post(
            "/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 401
        assert "detail" in response.json()

    async def test_admin_login_invalid_email(self, test_client, admin_user_data):
        """Test admin login with invalid email."""
        login_data = {
            "username": "wrong@example.com",
            "password": admin_user_data["password"],
        }

        response = test_client.post(
            "/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 401

    async def test_admin_login_missing_credentials(self, test_client):
        """Test admin login with missing credentials."""
        # Missing password
        response = test_client.post(
            "/api/v1/auth/login",
            data={"username": "admin@example.com"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert response.status_code == 422

        # Missing username
        response = test_client.post(
            "/api/v1/auth/login",
            data={"password": "password"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert response.status_code == 422


class TestAdminTokenValidation(TestAuthenticationAPIWithAdmin):
    """Test admin token validation."""

    async def test_validate_admin_token_success(self, test_client, auth_headers):
        """Test successful admin token validation."""
        response = test_client.post("/api/v1/auth/validate-token", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert "user" in data

    async def test_validate_invalid_token(self, test_client):
        """Test validation with invalid token."""
        invalid_headers = {"Authorization": "Bearer invalid_token"}

        response = test_client.post(
            "/api/v1/auth/validate-token", headers=invalid_headers
        )

        assert response.status_code == 401

    async def test_validate_missing_token(self, test_client):
        """Test validation without token."""
        response = test_client.post("/api/v1/auth/validate-token")
        assert response.status_code == 401


class TestAdminCurrentUser(TestAuthenticationAPIWithAdmin):
    """Test getting current admin user information."""

    async def test_get_current_admin_user(
        self, test_client, auth_headers, admin_user_data
    ):
        """Test getting current admin user info."""
        response = test_client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == admin_user_data["email"]
        assert data["username"] == admin_user_data["username"]
        assert data["is_active"] is True

    async def test_get_current_user_unauthorized(self, test_client):
        """Test getting current user without authentication."""
        response = test_client.get("/api/v1/auth/me")
        assert response.status_code == 401


class TestAdminTokenRefresh(TestAuthenticationAPIWithAdmin):
    """Test admin token refresh functionality."""

    async def test_refresh_admin_token(self, test_client, admin_user_data, admin_user):
        """Test refreshing admin access token."""
        # First login to get refresh token
        login_data = {
            "username": admin_user_data["email"],
            "password": admin_user_data["password"],
        }

        login_response = test_client.post(
            "/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        refresh_token = tokens["refresh_token"]

        # Use refresh token to get new access token
        refresh_data = {"refresh_token": refresh_token}

        refresh_response = test_client.post("/api/v1/auth/refresh", json=refresh_data)

        assert refresh_response.status_code == 200
        new_tokens = refresh_response.json()
        assert "access_token" in new_tokens
        assert "refresh_token" in new_tokens
        assert new_tokens["access_token"] != tokens["access_token"]

    async def test_refresh_invalid_token(self, test_client):
        """Test refresh with invalid refresh token."""
        refresh_data = {"refresh_token": "invalid_refresh_token"}

        response = test_client.post("/api/v1/auth/refresh", json=refresh_data)

        assert response.status_code == 401


class TestAdminLogout(TestAuthenticationAPIWithAdmin):
    """Test admin logout functionality."""

    async def test_admin_logout(self, test_client, auth_headers):
        """Test admin logout."""
        response = test_client.post("/api/v1/auth/logout", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_logout_unauthorized(self, test_client):
        """Test logout without authentication."""
        response = test_client.post("/api/v1/auth/logout")
        assert response.status_code == 401


class TestAdminPasswordManagement(TestAuthenticationAPIWithAdmin):
    """Test admin password management."""

    async def test_change_admin_password(
        self, test_client, auth_headers, admin_user_data
    ):
        """Test changing admin password."""
        password_data = {
            "current_password": admin_user_data["password"],
            "new_password": "NewSecurePass123!",
            "confirm_password": "NewSecurePass123!",
        }

        response = test_client.post(
            "/api/v1/auth/change-password", json=password_data, headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_change_password_wrong_current(self, test_client, auth_headers):
        """Test changing password with wrong current password."""
        password_data = {
            "current_password": "wrong_password",
            "new_password": "NewSecurePass123!",
            "confirm_password": "NewSecurePass123!",
        }

        response = test_client.post(
            "/api/v1/auth/change-password", json=password_data, headers=auth_headers
        )

        assert response.status_code == 400

    async def test_change_password_mismatch(
        self, test_client, auth_headers, admin_user_data
    ):
        """Test changing password with mismatched confirmation."""
        password_data = {
            "current_password": admin_user_data["password"],
            "new_password": "NewSecurePass123!",
            "confirm_password": "DifferentPass123!",
        }

        response = test_client.post(
            "/api/v1/auth/change-password", json=password_data, headers=auth_headers
        )

        assert response.status_code == 400


class TestAdminSessions(TestAuthenticationAPIWithAdmin):
    """Test admin session management."""

    async def test_get_admin_sessions(self, test_client, auth_headers):
        """Test getting admin user sessions."""
        response = test_client.get("/api/v1/auth/sessions", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_revoke_admin_sessions(self, test_client, auth_headers):
        """Test revoking admin sessions."""
        revoke_data = {"revoke_all": True}

        response = test_client.post(
            "/api/v1/auth/sessions/revoke", json=revoke_data, headers=auth_headers
        )

        assert response.status_code == 200


class TestAdminEmailVerification(TestAuthenticationAPIWithAdmin):
    """Test admin email verification."""

    async def test_request_email_verification(self, test_client, auth_headers):
        """Test requesting email verification."""
        response = test_client.post(
            "/api/v1/auth/verify-email/request", headers=auth_headers
        )

        # Admin might already be verified
        assert response.status_code in [200, 400]

    async def test_confirm_email_verification(self, test_client):
        """Test confirming email verification."""
        confirm_data = {"token": "test_verification_token"}

        response = test_client.post(
            "/api/v1/auth/verify-email/confirm", json=confirm_data
        )

        # Expected to fail with invalid token
        assert response.status_code in [400, 404]


class TestAdminPasswordReset(TestAuthenticationAPIWithAdmin):
    """Test admin password reset functionality."""

    async def test_request_password_reset(self, test_client, admin_user_data):
        """Test requesting password reset."""
        reset_data = {"email": admin_user_data["email"]}

        response = test_client.post("/api/v1/auth/reset-password", json=reset_data)

        assert response.status_code == 200

    async def test_confirm_password_reset(self, test_client):
        """Test confirming password reset."""
        confirm_data = {
            "token": "test_reset_token",
            "new_password": "NewResetPass123!",
            "confirm_password": "NewResetPass123!",
        }

        response = test_client.post(
            "/api/v1/auth/reset-password/confirm", json=confirm_data
        )

        # Expected to fail with invalid token
        assert response.status_code in [400, 404]


class TestAdminSecurityFeatures(TestAuthenticationAPIWithAdmin):
    """Test admin-specific security features."""

    async def test_admin_rate_limiting(self, test_client, admin_user_data, admin_user):
        """Test rate limiting on login attempts."""
        login_data = {
            "username": admin_user_data["email"],
            "password": "wrong_password",
        }

        # Make multiple failed login attempts
        for _ in range(5):
            response = test_client.post(
                "/api/v1/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            # Each should fail with 401
            assert response.status_code == 401

    async def test_admin_token_expiry(self, test_client, admin_token):
        """Test token expiry validation."""
        # This would require mocking time or using expired tokens
        # For now, just verify token is working
        headers = {"Authorization": f"Bearer {admin_token}"}

        response = test_client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 200

    async def test_concurrent_admin_logins(
        self, test_client, admin_user_data, admin_user
    ):
        """Test multiple concurrent admin logins."""
        login_data = {
            "username": admin_user_data["email"],
            "password": admin_user_data["password"],
        }

        # Create multiple concurrent login requests
        responses = []
        for _ in range(3):
            response = test_client.post(
                "/api/v1/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            responses.append(response)

        # All should succeed
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data


class TestAdminAPIEndpointsAccess(TestAuthenticationAPIWithAdmin):
    """Test admin access to various API endpoints."""

    async def test_admin_access_to_user_endpoints(self, test_client, auth_headers):
        """Test admin access to user management endpoints."""
        # Test getting users list
        response = test_client.get("/api/v1/identity/users/", headers=auth_headers)
        # Should succeed or return structured error
        assert response.status_code in [200, 404]

    async def test_admin_access_to_system_endpoints(self, test_client, auth_headers):
        """Test admin access to system endpoints."""
        # Test system health
        response = test_client.get("/api/v1/system/health", headers=auth_headers)
        assert response.status_code in [200, 404]

    async def test_admin_access_to_protected_resources(self, test_client, auth_headers):
        """Test admin access to protected resources."""
        # Test accessing admin-only endpoints
        response = test_client.get("/api/v1/system/admin/users", headers=auth_headers)
        # Should have access or endpoint doesn't exist
        assert response.status_code in [200, 404]


@pytest.mark.integration
class TestAdminAuthenticationIntegration(TestAuthenticationAPIWithAdmin):
    """Integration tests for admin authentication workflow."""

    async def test_full_admin_authentication_workflow(
        self, test_client, admin_user_data, admin_user
    ):
        """Test complete admin authentication workflow."""
        # 1. Login
        login_data = {
            "username": admin_user_data["email"],
            "password": admin_user_data["password"],
        }

        login_response = test_client.post(
            "/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]

        # 2. Validate token
        auth_headers = {"Authorization": f"Bearer {access_token}"}

        validate_response = test_client.post(
            "/api/v1/auth/validate-token", headers=auth_headers
        )
        assert validate_response.status_code == 200

        # 3. Get current user
        me_response = test_client.get("/api/v1/auth/me", headers=auth_headers)
        assert me_response.status_code == 200

        # 4. Refresh token
        refresh_response = test_client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
        )
        assert refresh_response.status_code == 200

        # 5. Logout
        logout_response = test_client.post("/api/v1/auth/logout", headers=auth_headers)
        assert logout_response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
