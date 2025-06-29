"""
Comprehensive RBAC (Role-Based Access Control) validation tests.

This module tests that all API endpoints correctly enforce the appropriate
permissions based on user roles and scopes.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status

from app.core.security import create_access_token
from app.models.user import User
from app.crud import user as crud_user
from app.schemas.user import UserCreate


# Test data for different user roles
USER_ROLES_TEST_DATA = {
    "superuser": {
        "email": "superuser@test.com",
        "username": "superuser",
        "password": "SecurePass123!",
        "role": "admin",
        "is_superuser": True,
    },
    "admin": {
        "email": "admin@test.com", 
        "username": "admin",
        "password": "SecurePass456!",
        "role": "admin",
        "is_superuser": False,
    },
    "product_manager": {
        "email": "product_manager@test.com",
        "username": "product_manager", 
        "password": "SecurePass789!",
        "role": "product_manager",
        "is_superuser": False,
    },
    "manager": {
        "email": "manager@test.com",
        "username": "manager", 
        "password": "SecurePass101!",
        "role": "manager",
        "is_superuser": False,
    },
    "senior_developer": {
        "email": "senior_developer@test.com",
        "username": "senior_developer",
        "password": "SecurePass202!",
        "role": "senior_developer", 
        "is_superuser": False,
    },
    "developer": {
        "email": "developer@test.com",
        "username": "developer",
        "password": "SecurePass303!",
        "role": "developer", 
        "is_superuser": False,
    },
    "analyst": {
        "email": "analyst@test.com",
        "username": "analyst",
        "password": "SecurePass404!", 
        "role": "analyst",
        "is_superuser": False,
    },
    "tester": {
        "email": "tester@test.com",
        "username": "tester",
        "password": "SecurePass505!",
        "role": "tester",
        "is_superuser": False,
    },
    "viewer": {
        "email": "viewer@test.com",
        "username": "viewer", 
        "password": "SecurePass606!",
        "role": "viewer",
        "is_superuser": False,
    },
}


# Expected permissions by role
EXPECTED_SCOPES_BY_ROLE = {
    "superuser": [
        "me", "users:read", "users:write", "users:delete",
        "projects:read", "projects:write", "projects:delete",
        "requirements:read", "requirements:write", "requirements:delete", 
        "releases:read", "releases:write", "releases:delete",
        "testing:read", "testing:write", "testing:execute",
        "admin:read", "admin:write", "system:admin"
    ],
    "admin": [
        "me", "users:read", "users:write", "users:delete",
        "projects:read", "projects:write", "projects:delete",
        "requirements:read", "requirements:write", "requirements:delete",
        "releases:read", "releases:write", "releases:delete", 
        "testing:read", "testing:write", "testing:execute",
        "admin:read", "admin:write"
    ],
    "product_manager": [
        "me", "users:read", 
        "projects:read", "projects:write", "projects:delete",
        "requirements:read", "requirements:write", "requirements:delete",
        "releases:read", "releases:write", "releases:delete",
        "testing:read", "admin:read"
    ],
    "manager": [
        "me", "users:read", 
        "projects:read", "projects:write", "projects:delete",
        "requirements:read", "requirements:write", "requirements:delete",
        "releases:read", "releases:write", "releases:delete",
        "testing:read", "testing:write", "admin:read"
    ],
    "senior_developer": [
        "me", "projects:read", "requirements:read",
        "releases:read", "releases:write", "releases:delete",
        "testing:read", "testing:write", "admin:read"
    ],
    "developer": [
        "me", "projects:read", "requirements:read",
        "releases:read", "releases:write", "testing:read", "admin:read"
    ],
    "analyst": [
        "me", "projects:read", "requirements:read", "releases:read", "testing:read"
    ],
    "tester": [
        "me", "projects:read", "requirements:read", "releases:read",
        "testing:read", "testing:write", "testing:execute"
    ],
    "viewer": [
        "me", "projects:read", "requirements:read", "releases:read", "testing:read"
    ],
}


# API endpoints and their required permissions
API_ENDPOINTS_PERMISSIONS = {
    # Users API
    "GET /api/v1/users/": ["users:read"],
    "POST /api/v1/users/": ["users:write"],
    "GET /api/v1/users/me": ["me"],
    "PUT /api/v1/users/me": ["me"],
    "GET /api/v1/users/1": ["users:read"],
    "PUT /api/v1/users/1": ["users:write"], 
    "DELETE /api/v1/users/1": ["users:delete"],
    
    # Projects API
    "GET /api/v1/projects/": ["projects:read"],
    "POST /api/v1/projects/": ["projects:write"],
    "GET /api/v1/projects/1": ["projects:read"],
    "PUT /api/v1/projects/1": ["projects:write"],
    "DELETE /api/v1/projects/1": ["projects:delete"],
    
    # Requirements API
    "GET /api/v1/requirements/": ["requirements:read"],
    "POST /api/v1/requirements/": ["requirements:write"],
    "GET /api/v1/requirements/1": ["requirements:read"],
    "PUT /api/v1/requirements/1": ["requirements:write"],
    "DELETE /api/v1/requirements/1": ["requirements:delete"],
    
    # Releases API
    "GET /api/v1/releases/": ["releases:read"],
    "POST /api/v1/releases/": ["releases:write"],
    "GET /api/v1/releases/1": ["releases:read"],
    "PUT /api/v1/releases/1": ["releases:write"],
    "DELETE /api/v1/releases/1": ["releases:delete"],
    
    # Testing API
    "GET /api/v1/testing/results": ["testing:read"],
    "GET /api/v1/testing/plans": ["testing:read"],
    "POST /api/v1/testing/plans": ["testing:write"],
    "POST /api/v1/testing/executions": ["testing:execute"],
    
    # Admin API  
    "GET /api/v1/admin/users": ["admin:read"],
    "GET /api/v1/admin/system-info": ["admin:read"],
    "GET /api/v1/admin/health": ["admin:read"],
    "GET /api/v1/admin/metrics": ["admin:read"],
    "POST /api/v1/admin/backup": ["admin:write"],
    "POST /api/v1/admin/system-settings": ["admin:write"],
    
    # Dashboard API
    "GET /api/v1/dashboard/": ["me"],
    "GET /api/v1/dashboard/stats": ["projects:read"],
    "GET /api/v1/dashboard/health": ["admin:read"],
    "GET /api/v1/dashboard/metrics": ["admin:read"],
    "GET /api/v1/dashboard/export/stats": ["admin:read"],
    
    # Reference API
    "GET /api/v1/reference/requirement-types": ["me"],
    "POST /api/v1/reference/requirement-types": ["admin:write"],
}


@pytest.fixture
async def test_users(db_session: AsyncSession):
    """Create test users with different roles."""
    users = {}
    
    for role_name, user_data in USER_ROLES_TEST_DATA.items():
        user_create = UserCreate(**user_data)
        user = await crud_user.create(db_session, obj_in=user_create)
        if user_data.get("is_superuser"):
            user.is_superuser = True
            await db_session.commit()
            await db_session.refresh(user)
        users[role_name] = user
    
    return users


@pytest.fixture
def auth_headers():
    """Generate auth headers for different user roles."""
    def _headers(user: User, scopes: list = None):
        if scopes is None:
            scopes = EXPECTED_SCOPES_BY_ROLE.get(user.role, ["me"])
        
        token = create_access_token(
            subject=user.email,
            user_id=user.id,
            scopes=scopes
        )
        return {"Authorization": f"Bearer {token}"}
    
    return _headers


class TestRBACPermissions:
    """Test Role-Based Access Control permissions."""

    @pytest.mark.asyncio
    async def test_role_scope_mapping(self, test_users):
        """Test that roles are correctly mapped to scopes."""
        from app.api.v1.endpoints.auth import _get_user_scopes
        
        for role_name, expected_scopes in EXPECTED_SCOPES_BY_ROLE.items():
            user = test_users[role_name]
            actual_scopes = _get_user_scopes(user)
            
            # Check all expected scopes are present
            for scope in expected_scopes:
                assert scope in actual_scopes, f"Role {role_name} missing scope {scope}"
            
            # Check no unexpected scopes
            for scope in actual_scopes:
                assert scope in expected_scopes, f"Role {role_name} has unexpected scope {scope}"

    @pytest.mark.asyncio 
    async def test_admin_access_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test admin panel access permissions."""
        
        # Test users who SHOULD have admin access
        admin_users = ["superuser", "admin", "product_manager", "manager", "senior_developer", "developer"]
        for role in admin_users:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.get("/api/v1/admin/system-info", headers=headers)
            assert response.status_code in [200, 404], f"Role {role} should have admin access"

        # Test users who should NOT have admin access
        non_admin_users = ["analyst", "tester", "viewer"]
        for role in non_admin_users:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.get("/api/v1/admin/system-info", headers=headers)
            assert response.status_code == 401, f"Role {role} should NOT have admin access"

    @pytest.mark.asyncio
    async def test_projects_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test project-related permissions."""
        
        # Test read permissions - all users should have this
        for role_name, user in test_users.items():
            headers = auth_headers(user)
            response = await client.get("/api/v1/projects/", headers=headers)
            assert response.status_code in [200, 404], f"Role {role_name} should have projects:read"

        # Test write permissions - только PM, Manager и Admin согласно ТЗ
        write_roles = ["superuser", "admin", "product_manager", "manager"]
        for role in write_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/projects/", headers=headers, json={
                "name": "Test Project",
                "code": "TEST001",
                "description": "Test project for RBAC"
            })
            assert response.status_code in [201, 422, 400], f"Role {role} should have projects:write"

        # Test delete permissions - только PM, Manager и Admin
        delete_roles = ["superuser", "admin", "product_manager", "manager"]
        non_delete_roles = ["senior_developer", "developer", "analyst", "tester", "viewer"]
        
        for role in non_delete_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.delete("/api/v1/projects/999", headers=headers)
            assert response.status_code == 401, f"Role {role} should NOT have projects:delete"

    @pytest.mark.asyncio
    async def test_requirements_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test requirements-related permissions."""
        
        # Test write permissions - только PM, Manager и Admin согласно ТЗ
        write_roles = ["superuser", "admin", "product_manager", "manager"]
        for role in write_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/requirements/", headers=headers, json={
                "title": "Test Requirement",
                "description": "Test requirement for RBAC",
                "project_id": 1
            })
            assert response.status_code in [201, 422, 400], f"Role {role} should have requirements:write"

        # Test roles that should NOT have write access - analyst теперь только читает
        no_write_roles = ["senior_developer", "developer", "analyst", "tester", "viewer"]
        for role in no_write_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/requirements/", headers=headers, json={
                "title": "Test Requirement",
                "description": "Test requirement for RBAC",
                "project_id": 1
            })
            assert response.status_code == 401, f"Role {role} should NOT have requirements:write"

    @pytest.mark.asyncio
    async def test_releases_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test releases-related permissions."""
        
        # Test write permissions - PM, Manager, Senior Developer, Developer
        write_roles = ["superuser", "admin", "product_manager", "manager", "senior_developer", "developer"]
        for role in write_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/releases/", headers=headers, json={
                "name": "Test Release",
                "version": "1.0.0",
                "project_id": 1
            })
            assert response.status_code in [201, 422, 400], f"Role {role} should have releases:write"

        # Test roles that should NOT have write access
        no_write_roles = ["analyst", "tester", "viewer"]
        for role in no_write_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/releases/", headers=headers, json={
                "name": "Test Release", 
                "version": "1.0.0",
                "project_id": 1
            })
            assert response.status_code == 401, f"Role {role} should NOT have releases:write"

    @pytest.mark.asyncio
    async def test_testing_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test testing-related permissions."""
        
        # Test execute permissions - only testers and above should have this
        execute_roles = ["superuser", "admin", "manager", "tester"]
        for role in execute_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/testing/executions", headers=headers, json={
                "test_case_id": 1,
                "result": "passed"
            })
            # Note: We expect 422/400 for missing data, not 401 for permissions
            assert response.status_code != 401, f"Role {role} should have testing:execute"

        # Test roles that should NOT have execute access
        no_execute_roles = ["analyst", "developer", "viewer"]
        for role in no_execute_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.post("/api/v1/testing/executions", headers=headers, json={
                "test_case_id": 1,
                "result": "passed"
            })
            assert response.status_code == 401, f"Role {role} should NOT have testing:execute"

    @pytest.mark.asyncio
    async def test_dashboard_admin_features(self, client: AsyncClient, test_users, auth_headers):
        """Test dashboard admin features access."""
        
        # Test admin dashboard features
        admin_roles = ["superuser", "admin", "manager", "developer"]
        for role in admin_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            # Test health endpoint (requires admin:read)
            response = await client.get("/api/v1/dashboard/health", headers=headers)
            assert response.status_code in [200, 404], f"Role {role} should access dashboard health"
            
            # Test metrics endpoint (requires admin:read)
            response = await client.get("/api/v1/dashboard/metrics", headers=headers)
            assert response.status_code in [200, 404], f"Role {role} should access dashboard metrics"

        # Test roles without admin access
        non_admin_roles = ["analyst", "tester", "viewer"]
        for role in non_admin_roles:
            user = test_users[role]
            headers = auth_headers(user)
            
            response = await client.get("/api/v1/dashboard/health", headers=headers)
            assert response.status_code == 401, f"Role {role} should NOT access dashboard health"
            
            response = await client.get("/api/v1/dashboard/metrics", headers=headers)
            assert response.status_code == 401, f"Role {role} should NOT access dashboard metrics"

    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test that endpoints reject unauthorized requests."""
        
        # Test some critical endpoints without authentication
        critical_endpoints = [
            "GET /api/v1/admin/users",
            "GET /api/v1/admin/system-info", 
            "POST /api/v1/admin/backup",
            "DELETE /api/v1/users/1",
            "DELETE /api/v1/projects/1",
        ]
        
        for endpoint in critical_endpoints:
            method, url = endpoint.split(" ", 1)
            
            if method == "GET":
                response = await client.get(url)
            elif method == "POST":
                response = await client.post(url, json={})
            elif method == "DELETE":
                response = await client.delete(url)
            
            assert response.status_code == 401, f"Endpoint {endpoint} should require authentication"

    @pytest.mark.asyncio
    async def test_scope_validation(self, client: AsyncClient, test_users, auth_headers):
        """Test that endpoints properly validate required scopes."""
        
        # Create a user with limited scopes
        user = test_users["viewer"]
        
        # Try to access endpoint requiring higher permissions
        headers = auth_headers(user)
        
        # Viewer should not be able to create projects (requires projects:write)
        response = await client.post("/api/v1/projects/", headers=headers, json={
            "name": "Test Project",
            "code": "TEST001"
        })
        assert response.status_code == 401, "Viewer should not have projects:write permission"
        
        # Viewer should not be able to access admin endpoints
        response = await client.get("/api/v1/admin/users", headers=headers)
        assert response.status_code == 401, "Viewer should not have admin:read permission"

    @pytest.mark.asyncio
    async def test_product_manager_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test Product Manager permissions according to TZ."""
        
        pm_user = test_users["product_manager"]
        headers = auth_headers(pm_user)
        
        # PM should be able to create projects (function 13 from TZ)
        response = await client.post("/api/v1/projects/", headers=headers, json={
            "name": "PM Test Project",
            "code": "PMTEST001"
        })
        assert response.status_code in [201, 422, 400], "PM should create projects"
        
        # PM should be able to create requirements (function 1 from TZ)
        response = await client.post("/api/v1/requirements/", headers=headers, json={
            "title": "PM Test Requirement",
            "description": "Test requirement from PM",
            "project_id": 1
        })
        assert response.status_code in [201, 422, 400], "PM should create requirements"
        
        # PM should be able to create releases (function 9 from TZ)
        response = await client.post("/api/v1/releases/", headers=headers, json={
            "name": "PM Test Release",
            "version": "1.0.0",
            "project_id": 1
        })
        assert response.status_code in [201, 422, 400], "PM should create releases"

    @pytest.mark.asyncio
    async def test_analyst_read_only_permissions(self, client: AsyncClient, test_users, auth_headers):
        """Test that Analyst only has read permissions according to TZ."""
        
        analyst_user = test_users["analyst"]
        headers = auth_headers(analyst_user)
        
        # Analyst should NOT be able to create projects
        response = await client.post("/api/v1/projects/", headers=headers, json={
            "name": "Analyst Test Project",
            "code": "ANALTEST001"
        })
        assert response.status_code == 401, "Analyst should NOT create projects"
        
        # Analyst should NOT be able to create requirements  
        response = await client.post("/api/v1/requirements/", headers=headers, json={
            "title": "Analyst Test Requirement",
            "description": "Test requirement from analyst",
            "project_id": 1
        })
        assert response.status_code == 401, "Analyst should NOT create requirements"
        
        # But should be able to read
        response = await client.get("/api/v1/projects/", headers=headers)
        assert response.status_code in [200, 404], "Analyst should read projects"


@pytest.mark.asyncio
async def test_permission_hierarchy():
    """Test that permission hierarchy is correctly implemented."""
    from app.api.v1.endpoints.auth import _get_user_scopes
    from app.models.user import User
    
    # Create mock users
    superuser = User(email="super@test.com", role="admin", is_superuser=True)
    admin = User(email="admin@test.com", role="admin", is_superuser=False)
    product_manager = User(email="pm@test.com", role="product_manager", is_superuser=False)
    manager = User(email="manager@test.com", role="manager", is_superuser=False)
    senior_developer = User(email="senior_dev@test.com", role="senior_developer", is_superuser=False)
    developer = User(email="dev@test.com", role="developer", is_superuser=False)
    analyst = User(email="analyst@test.com", role="analyst", is_superuser=False)
    viewer = User(email="viewer@test.com", role="viewer", is_superuser=False)
    
    # Test hierarchy: superuser > admin > product_manager > manager > senior_developer > developer > analyst/tester > viewer
    superuser_scopes = set(_get_user_scopes(superuser))
    admin_scopes = set(_get_user_scopes(admin))
    pm_scopes = set(_get_user_scopes(product_manager))
    manager_scopes = set(_get_user_scopes(manager))
    senior_dev_scopes = set(_get_user_scopes(senior_developer))
    developer_scopes = set(_get_user_scopes(developer))
    analyst_scopes = set(_get_user_scopes(analyst))
    viewer_scopes = set(_get_user_scopes(viewer))
    
    # Superuser should have all permissions
    assert "system:admin" in superuser_scopes
    assert admin_scopes.issubset(superuser_scopes)
    
    # Admin should have more permissions than product manager
    assert "admin:write" in admin_scopes
    assert "admin:write" not in pm_scopes
    
    # Product Manager should have core management permissions
    assert "requirements:write" in pm_scopes
    assert "projects:write" in pm_scopes
    assert "releases:write" in pm_scopes
    
    # Manager should have similar permissions to PM but with testing:write
    assert "testing:write" in manager_scopes
    assert "testing:write" not in pm_scopes
    
    # Senior Developer should have more permissions than regular developer
    assert "releases:delete" in senior_dev_scopes
    assert "releases:delete" not in developer_scopes
    assert "testing:write" in senior_dev_scopes
    assert "testing:write" not in developer_scopes
    
    # Developer should have releases:write but not delete
    assert "releases:write" in developer_scopes
    assert "releases:delete" not in developer_scopes
    
    # Analyst should only have read permissions (per TZ)
    assert "projects:write" not in analyst_scopes
    assert "requirements:write" not in analyst_scopes
    assert "projects:read" in analyst_scopes
    assert "requirements:read" in analyst_scopes
    
    # Viewer should have minimal permissions
    assert viewer_scopes.issubset(analyst_scopes)
    assert "projects:read" in viewer_scopes
    assert "requirements:read" in viewer_scopes


if __name__ == "__main__":
    """Run RBAC validation tests."""
    pytest.main([__file__, "-v"]) 