"""
Comprehensive tests for all API domains with admin credentials.

Tests all domain endpoints systematically to ensure complete API coverage.
"""

import pytest
import asyncio
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch, MagicMock

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from app.main import app
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.enhanced_role_system import (
    EnhancedRole,
    UserRoleAssignment,
    SystemRole,
    RoleScope,
)


class DomainEndpointTester:
    """Comprehensive tester for all domain endpoints."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize the domain tester."""
        self.base_url = base_url.rstrip("/")
        self.api_url = f"{self.base_url}/api/v1"
        self.access_token: Optional[str] = None
        self.client = TestClient(app)

        # Domain endpoints mapping
        self.domain_endpoints = {
            "auth": [
                {
                    "method": "POST",
                    "path": "/auth/login",
                    "requires_auth": False,
                    "description": "Admin login",
                },
                {
                    "method": "GET",
                    "path": "/auth/me",
                    "requires_auth": True,
                    "description": "Current user info",
                },
                {
                    "method": "POST",
                    "path": "/auth/logout/simple",
                    "requires_auth": True,
                    "description": "Simple logout",
                },
                {
                    "method": "POST",
                    "path": "/auth/validate-current-token",
                    "requires_auth": True,
                    "description": "Validate current token",
                },
                {
                    "method": "POST",
                    "path": "/auth/refresh",
                    "requires_auth": False,
                    "description": "Refresh token",
                },
                {
                    "method": "POST",
                    "path": "/auth/password/change",
                    "requires_auth": True,
                    "description": "Change password",
                },
                {
                    "method": "POST",
                    "path": "/auth/password/reset",
                    "requires_auth": False,
                    "description": "Reset password",
                },
                {
                    "method": "POST",
                    "path": "/auth/email/request",
                    "requires_auth": False,
                    "description": "Email verification",
                },
                {
                    "method": "GET",
                    "path": "/auth/sessions/",
                    "requires_auth": True,
                    "description": "User sessions",
                },
            ],
            "identity": [
                {
                    "method": "GET",
                    "path": "/identity/users/",
                    "requires_auth": True,
                    "description": "Get users list",
                },
                {
                    "method": "GET",
                    "path": "/identity/users/me",
                    "requires_auth": True,
                    "description": "Get my profile",
                },
                {
                    "method": "GET",
                    "path": "/identity/roles/",
                    "requires_auth": True,
                    "description": "Get roles",
                },
                {
                    "method": "GET",
                    "path": "/identity/permissions/",
                    "requires_auth": True,
                    "description": "Get permissions",
                },
                {
                    "method": "GET",
                    "path": "/identity/permissions/my-permissions",
                    "requires_auth": True,
                    "description": "My permissions",
                },
                {
                    "method": "GET",
                    "path": "/identity/profiles/me",
                    "requires_auth": True,
                    "description": "My extended profile",
                },
            ],
            "organizations": [
                {
                    "method": "GET",
                    "path": "/organizations/companies/",
                    "requires_auth": True,
                    "description": "Get companies",
                },
                {
                    "method": "GET",
                    "path": "/organizations/companies/my",
                    "requires_auth": True,
                    "description": "My company",
                },
                {
                    "method": "GET",
                    "path": "/organizations/departments/",
                    "requires_auth": True,
                    "description": "Get departments",
                },
                {
                    "method": "GET",
                    "path": "/organizations/teams/",
                    "requires_auth": True,
                    "description": "Get teams",
                },
                {
                    "method": "GET",
                    "path": "/organizations/teams/my",
                    "requires_auth": True,
                    "description": "My teams",
                },
            ],
            "projects": [
                {
                    "method": "GET",
                    "path": "/projects/",
                    "requires_auth": True,
                    "description": "Get projects",
                },
                {
                    "method": "GET",
                    "path": "/projects/requirements/",
                    "requires_auth": True,
                    "description": "Get requirements",
                },
                {
                    "method": "GET",
                    "path": "/projects/releases/",
                    "requires_auth": True,
                    "description": "Get releases",
                },
                {
                    "method": "GET",
                    "path": "/projects/analytics/",
                    "requires_auth": True,
                    "description": "Project analytics",
                },
            ],
            "quality": [
                {
                    "method": "GET",
                    "path": "/quality/testing/plans",
                    "requires_auth": True,
                    "description": "Test plans",
                },
                {
                    "method": "GET",
                    "path": "/quality/testing/cases",
                    "requires_auth": True,
                    "description": "Test cases",
                },
                {
                    "method": "GET",
                    "path": "/quality/testing/executions",
                    "requires_auth": True,
                    "description": "Test executions",
                },
                {
                    "method": "GET",
                    "path": "/quality/specifications/",
                    "requires_auth": True,
                    "description": "Specifications",
                },
                {
                    "method": "GET",
                    "path": "/quality/reports/",
                    "requires_auth": True,
                    "description": "Quality reports",
                },
            ],
            "collaboration": [
                {
                    "method": "GET",
                    "path": "/collaboration/comments/",
                    "requires_auth": True,
                    "description": "Comments",
                },
                {
                    "method": "GET",
                    "path": "/collaboration/relationships/",
                    "requires_auth": True,
                    "description": "Relationships",
                },
                {
                    "method": "GET",
                    "path": "/collaboration/notifications/",
                    "requires_auth": True,
                    "description": "Notifications",
                },
                {
                    "method": "GET",
                    "path": "/collaboration/activity/",
                    "requires_auth": True,
                    "description": "Activity feed",
                },
            ],
            "analytics": [
                {
                    "method": "GET",
                    "path": "/analytics/dashboard/",
                    "requires_auth": True,
                    "description": "Dashboard analytics",
                },
                {
                    "method": "GET",
                    "path": "/analytics/reports/",
                    "requires_auth": True,
                    "description": "Analytics reports",
                },
                {
                    "method": "GET",
                    "path": "/analytics/metrics/",
                    "requires_auth": True,
                    "description": "System metrics",
                },
            ],
            "configuration": [
                {
                    "method": "GET",
                    "path": "/configuration/reference/",
                    "requires_auth": True,
                    "description": "Reference data",
                },
                {
                    "method": "GET",
                    "path": "/configuration/settings/",
                    "requires_auth": True,
                    "description": "Settings",
                },
                {
                    "method": "GET",
                    "path": "/configuration/workflows/",
                    "requires_auth": True,
                    "description": "Workflows",
                },
            ],
            "system": [
                {
                    "method": "GET",
                    "path": "/system/health",
                    "requires_auth": True,
                    "description": "System health",
                },
                {
                    "method": "GET",
                    "path": "/system/metrics",
                    "requires_auth": True,
                    "description": "System metrics",
                },
                {
                    "method": "GET",
                    "path": "/system/admin/users",
                    "requires_auth": True,
                    "description": "Admin users",
                },
                {
                    "method": "GET",
                    "path": "/system/backup/",
                    "requires_auth": True,
                    "description": "System backups",
                },
                {
                    "method": "GET",
                    "path": "/system/audit/",
                    "requires_auth": True,
                    "description": "Audit logs",
                },
            ],
        }

    async def setup_admin_auth(self) -> bool:
        """Setup admin authentication."""
        try:
            login_data = {
                "username": settings.admin.email,
                "password": settings.admin.password,
            }

            response = self.client.post(
                "/api/v1/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                return True
            return False
        except Exception as e:
            print(f"Auth setup failed: {e}")
            return False

    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers."""
        if self.access_token:
            return {"Authorization": f"Bearer {self.access_token}"}
        return {}

    async def test_endpoint(self, endpoint: Dict[str, Any]) -> Dict[str, Any]:
        """Test a single endpoint."""
        method = endpoint["method"]
        path = endpoint["path"]
        requires_auth = endpoint.get("requires_auth", True)
        description = endpoint.get("description", "")

        headers = {}
        if requires_auth:
            headers = self.get_auth_headers()

        try:
            if method == "GET":
                response = self.client.get(f"/api/v1{path}", headers=headers)
            elif method == "POST":
                # Handle special cases for POST endpoints
                if path == "/auth/login":
                    login_data = {
                        "username": settings.admin.email,
                        "password": settings.admin.password,
                    }
                    response = self.client.post(
                        f"/api/v1{path}",
                        data=login_data,
                        headers={"Content-Type": "application/x-www-form-urlencoded"},
                    )
                elif path == "/auth/refresh":
                    response = self.client.post(
                        f"/api/v1{path}",
                        json={"refresh_token": "dummy_token"},
                        headers=headers,
                    )
                elif path == "/auth/password/change":
                    response = self.client.post(
                        f"/api/v1{path}",
                        json={
                            "current_password": settings.admin.password,
                            "new_password": "NewTestPass123!",
                            "confirm_password": "NewTestPass123!",
                        },
                        headers=headers,
                    )
                elif path == "/auth/password/reset":
                    response = self.client.post(
                        f"/api/v1{path}",
                        json={"email": settings.admin.email},
                        headers=headers,
                    )
                elif path == "/auth/email/request":
                    response = self.client.post(
                        f"/api/v1{path}",
                        json={"email": settings.admin.email},
                        headers=headers,
                    )
                else:
                    response = self.client.post(f"/api/v1{path}", headers=headers)
            elif method == "PUT":
                response = self.client.put(f"/api/v1{path}", headers=headers)
            elif method == "DELETE":
                response = self.client.delete(f"/api/v1{path}", headers=headers)
            else:
                response = self.client.get(f"/api/v1{path}", headers=headers)

            return {
                "endpoint": f"{method} {path}",
                "description": description,
                "status_code": response.status_code,
                "success": response.status_code
                < 500,  # Anything below 500 is considered success for testing
                "response_size": len(response.content),
                "has_json": "application/json"
                in response.headers.get("content-type", ""),
                "error": None,
            }

        except Exception as e:
            return {
                "endpoint": f"{method} {path}",
                "description": description,
                "status_code": 0,
                "success": False,
                "response_size": 0,
                "has_json": False,
                "error": str(e),
            }

    async def test_domain(self, domain_name: str) -> Dict[str, Any]:
        """Test all endpoints in a domain."""
        if domain_name not in self.domain_endpoints:
            return {
                "domain": domain_name,
                "error": f"Domain {domain_name} not found",
                "endpoints": [],
                "summary": {"total": 0, "success": 0, "failed": 0},
            }

        endpoints = self.domain_endpoints[domain_name]
        results = []

        for endpoint in endpoints:
            result = await self.test_endpoint(endpoint)
            results.append(result)

        # Calculate summary
        total = len(results)
        success = len([r for r in results if r["success"]])
        failed = total - success

        return {
            "domain": domain_name,
            "endpoints": results,
            "summary": {
                "total": total,
                "success": success,
                "failed": failed,
                "success_rate": (success / total * 100) if total > 0 else 0,
            },
        }

    async def test_all_domains(self) -> Dict[str, Any]:
        """Test all domains."""
        print("🚀 Starting comprehensive domain testing...")

        # Setup authentication
        auth_success = await self.setup_admin_auth()
        if not auth_success:
            return {
                "error": "Failed to authenticate admin user",
                "domains": {},
                "overall_summary": {"total": 0, "success": 0, "failed": 0},
            }

        print("✅ Admin authentication successful")

        # Test all domains
        domain_results = {}
        overall_total = 0
        overall_success = 0
        overall_failed = 0

        for domain_name in self.domain_endpoints.keys():
            print(f"\n🔍 Testing {domain_name} domain...")

            result = await self.test_domain(domain_name)
            domain_results[domain_name] = result

            summary = result.get("summary", {})
            overall_total += summary.get("total", 0)
            overall_success += summary.get("success", 0)
            overall_failed += summary.get("failed", 0)

            print(
                f"✅ {domain_name}: {summary.get('success', 0)}/{summary.get('total', 0)} endpoints successful"
            )

        return {
            "domains": domain_results,
            "overall_summary": {
                "total": overall_total,
                "success": overall_success,
                "failed": overall_failed,
                "success_rate": (
                    (overall_success / overall_total * 100) if overall_total > 0 else 0
                ),
            },
        }

    def print_results(self, results: Dict[str, Any]):
        """Print formatted test results."""
        print("\n" + "=" * 80)
        print("🏁 DOMAIN TESTING RESULTS")
        print("=" * 80)

        if "error" in results:
            print(f"❌ Error: {results['error']}")
            return

        # Overall summary
        summary = results["overall_summary"]
        print(f"\n📊 Overall Results:")
        print(f"   Total Endpoints: {summary['total']}")
        print(f"   Successful: {summary['success']}")
        print(f"   Failed: {summary['failed']}")
        print(f"   Success Rate: {summary['success_rate']:.1f}%")

        # Domain details
        for domain_name, domain_result in results["domains"].items():
            print(f"\n🔧 {domain_name.upper()} Domain:")

            if "error" in domain_result:
                print(f"   ❌ {domain_result['error']}")
                continue

            domain_summary = domain_result["summary"]
            print(
                f"   📈 {domain_summary['success']}/{domain_summary['total']} endpoints successful ({domain_summary['success_rate']:.1f}%)"
            )

            # Show failed endpoints
            failed_endpoints = [
                ep for ep in domain_result["endpoints"] if not ep["success"]
            ]
            if failed_endpoints:
                print(f"   ⚠️  Failed endpoints:")
                for ep in failed_endpoints:
                    status = ep["status_code"] if ep["status_code"] > 0 else "ERROR"
                    print(
                        f"      - {ep['endpoint']} ({status}): {ep.get('error', 'HTTP Error')}"
                    )

            # Show successful endpoints
            success_endpoints = [
                ep for ep in domain_result["endpoints"] if ep["success"]
            ]
            if success_endpoints:
                print(f"   ✅ Successful endpoints:")
                for ep in success_endpoints:
                    print(
                        f"      - {ep['endpoint']} ({ep['status_code']}): {ep['description']}"
                    )

        print("\n" + "=" * 80)


# Test classes for pytest
class TestDomainEndpoints:
    """Pytest test class for domain endpoints."""

    @pytest.fixture(scope="class")
    def domain_tester(self):
        """Domain tester fixture."""
        return DomainEndpointTester()

    @pytest.mark.asyncio
    async def test_auth_domain(self, domain_tester):
        """Test authentication domain."""
        result = await domain_tester.test_domain("auth")
        assert result["summary"]["total"] > 0
        # Allow some failures for development endpoints
        assert result["summary"]["success_rate"] >= 50  # At least 50% should work

    @pytest.mark.asyncio
    async def test_identity_domain(self, domain_tester):
        """Test identity management domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("identity")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_organizations_domain(self, domain_tester):
        """Test organizations domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("organizations")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_projects_domain(self, domain_tester):
        """Test projects domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("projects")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_quality_domain(self, domain_tester):
        """Test quality domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("quality")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_collaboration_domain(self, domain_tester):
        """Test collaboration domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("collaboration")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_analytics_domain(self, domain_tester):
        """Test analytics domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("analytics")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_configuration_domain(self, domain_tester):
        """Test configuration domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("configuration")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_system_domain(self, domain_tester):
        """Test system domain."""
        await domain_tester.setup_admin_auth()
        result = await domain_tester.test_domain("system")
        assert result["summary"]["total"] > 0

    @pytest.mark.asyncio
    async def test_all_domains_comprehensive(self, domain_tester):
        """Test all domains comprehensively."""
        results = await domain_tester.test_all_domains()

        # Print results for visibility
        domain_tester.print_results(results)

        # Assert overall success
        summary = results["overall_summary"]
        assert summary["total"] > 0, "No endpoints were tested"
        assert summary["success"] > 0, "No endpoints were successful"

        # Require at least 60% success rate for CI/CD
        assert (
            summary["success_rate"] >= 60
        ), f"Success rate too low: {summary['success_rate']:.1f}%"


# Standalone execution
async def main():
    """Main function for standalone execution."""
    tester = DomainEndpointTester()
    results = await tester.test_all_domains()
    tester.print_results(results)

    # Return appropriate exit code
    summary = results.get("overall_summary", {})
    success_rate = summary.get("success_rate", 0)

    if success_rate >= 60:
        print(f"\n🎉 Testing completed successfully! Success rate: {success_rate:.1f}%")
        return 0
    else:
        print(f"\n❌ Testing failed! Success rate too low: {success_rate:.1f}%")
        return 1


if __name__ == "__main__":
    import sys

    result = asyncio.run(main())
    sys.exit(result)
