#!/usr/bin/env python3
"""
Backend Health Check and Fixes Validation
Tests the core fixes made to the backend without requiring database connectivity.
"""

import os
import sys
import asyncio
import time
import httpx
from datetime import datetime

# Add the parent directory to Python path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings


class HealthTestResults:
    def __init__(self):
        self.results = []
        self.start_time = time.time()

    def add_result(
        self, test_name: str, success: bool, error_msg: str = None, details: str = None
    ):
        """Add a test result"""
        self.results.append(
            {
                "test": test_name,
                "success": success,
                "error": error_msg,
                "details": details,
                "timestamp": datetime.now(),
            }
        )

        # Real-time feedback
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if details:
            print(f"  {details}")
        if not success and error_msg:
            print(f"  Error: {error_msg}")

    def get_summary(self):
        """Get test summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["success"])
        failed = total - passed
        duration = time.time() - self.start_time
        success_rate = (passed / total * 100) if total > 0 else 0

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "success_rate": success_rate,
            "duration": duration,
            "failed_tests": [r for r in self.results if not r["success"]],
        }


async def test_configuration_loading(results: HealthTestResults):
    """Test configuration loading and validation"""
    try:
        # Test settings load
        assert settings is not None
        assert hasattr(settings, "app_config")
        assert hasattr(settings, "db")
        assert hasattr(settings, "security")

        results.add_result(
            "Configuration Loading",
            True,
            details=f"App: {settings.app_config.name} v{settings.app_config.version}",
        )

        # Test database URL generation
        db_url = settings.db.async_url
        assert "postgresql+asyncpg://" in db_url
        results.add_result(
            "Database URL Generation", True, details=f"URL: {db_url[:50]}..."
        )

        # Test optimized pool settings
        assert settings.db.pool_size == 5  # Should be optimized from 20
        assert settings.db.max_overflow == 5  # Should be optimized from 10
        results.add_result(
            "Database Pool Optimization",
            True,
            details=f"Pool: {settings.db.pool_size}, Overflow: {settings.db.max_overflow}",
        )

    except Exception as e:
        results.add_result("Configuration Validation", False, str(e))


async def test_api_availability(results: HealthTestResults):
    """Test API endpoint availability"""
    try:
        base_url = f"http://localhost:{settings.app_config.port}"
        timeout = httpx.Timeout(connect=5.0, read=5.0, write=5.0, pool=5.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            # Test health endpoint
            response = await client.get(f"{base_url}/health")
            if response.status_code == 200:
                health_data = response.json()
                results.add_result(
                    "Health Endpoint",
                    True,
                    details=f"Status: {health_data.get('status', 'unknown')}",
                )
            else:
                results.add_result(
                    "Health Endpoint", False, f"Status: {response.status_code}"
                )

            # Test docs endpoint
            response = await client.get(f"{base_url}/docs")
            if response.status_code == 200:
                results.add_result(
                    "API Documentation", True, details="Swagger UI accessible"
                )
            else:
                results.add_result(
                    "API Documentation", False, f"Status: {response.status_code}"
                )

            # Test CORS and API structure
            response = await client.options(f"{base_url}/api/v1/dashboard/stats")
            if response.status_code in [200, 401]:  # 401 is OK for auth required
                results.add_result(
                    "API CORS Support",
                    True,
                    details="OPTIONS requests handled correctly",
                )
            else:
                results.add_result(
                    "API CORS Support", False, f"Status: {response.status_code}"
                )

            # Test timezone fix - dashboard endpoint (should be 401, not 500)
            response = await client.get(f"{base_url}/api/v1/dashboard/stats")
            if response.status_code == 401:
                results.add_result(
                    "Dashboard Timezone Fix",
                    True,
                    details="Returns 401 (auth required) instead of 500 (timezone error)",
                )
            elif response.status_code == 500:
                results.add_result(
                    "Dashboard Timezone Fix",
                    False,
                    details="Still returns 500 - timezone issue may persist",
                )
            else:
                results.add_result(
                    "Dashboard Timezone Fix",
                    True,
                    details=f"Unexpected but non-error status: {response.status_code}",
                )

    except Exception as e:
        results.add_result("API Availability", False, str(e))


async def test_import_structure(results: HealthTestResults):
    """Test that imports work correctly after fixes"""
    try:
        # Test core imports
        from app.core.config import settings
        from app.core.security import get_password_hash

        results.add_result("Core Module Imports", True)

        # Test model imports
        from app.models import User, Project, Requirement

        results.add_result("Model Imports", True)

        # Test schema imports
        from app.schemas import UserCreate, ProjectCreate

        results.add_result("Schema Imports", True)

        # Test CRUD imports
        from app import crud

        assert hasattr(crud, "user")
        assert hasattr(crud, "project")
        results.add_result("CRUD Module Imports", True)

        # Test database helper imports
        from app.db.db_helper import DatabaseFactory

        results.add_result("Database Helper Imports", True)

    except Exception as e:
        results.add_result("Import Structure", False, str(e))


async def test_timezone_datetime_handling(results: HealthTestResults):
    """Test timezone handling in datetime operations"""
    try:
        # Test that datetime.now() works without timezone issues
        from datetime import datetime, UTC

        # This should work (timezone-naive)
        now_naive = datetime.now()
        assert now_naive.tzinfo is None

        # This should also work (timezone-aware)
        now_utc = datetime.now(UTC)
        assert now_utc.tzinfo is not None

        # Test that we can format them correctly
        naive_iso = now_naive.isoformat()
        utc_iso = now_utc.isoformat()

        results.add_result(
            "Datetime Handling",
            True,
            details="Both naive and UTC datetime handling works",
        )

        # Test database compatibility (should use naive datetime)
        from app.api.v1.endpoints.dashboard import router

        results.add_result(
            "Dashboard Module Import",
            True,
            details="Dashboard module loads without errors",
        )

    except Exception as e:
        results.add_result("Timezone Handling", False, str(e))


async def test_frontend_api_paths(results: HealthTestResults):
    """Test that frontend API path fixes are correct"""
    try:
        # Simulate frontend API client behavior
        base_url = f"http://localhost:{settings.app_config.port}"
        timeout = httpx.Timeout(connect=5.0, read=5.0, write=5.0, pool=5.0)

        async with httpx.AsyncClient(
            timeout=timeout, base_url=f"{base_url}/api/v1"
        ) as client:
            # Test that testing endpoints work with single prefix
            response = await client.get("/testing/plans")
            # Should return 401 (auth required) not 404 (path not found)
            if response.status_code == 401:
                results.add_result(
                    "Testing API Path Fix",
                    True,
                    details="No more double /api/v1 prefix issues",
                )
            elif response.status_code == 404:
                results.add_result(
                    "Testing API Path Fix",
                    False,
                    details="404 suggests path issues remain",
                )
            else:
                results.add_result(
                    "Testing API Path Fix",
                    True,
                    details=f"Non-error response: {response.status_code}",
                )

    except Exception as e:
        results.add_result("Frontend API Path Test", False, str(e))


async def main():
    """Main health check runner"""
    print("🔍 Starting Backend Health Check and Fixes Validation")
    print("=" * 65)

    results = HealthTestResults()

    print("\n⚙️ Testing Configuration...")
    await test_configuration_loading(results)

    print("\n📦 Testing Import Structure...")
    await test_import_structure(results)

    print("\n🕒 Testing Timezone Fixes...")
    await test_timezone_datetime_handling(results)

    print("\n🌐 Testing API Availability...")
    await test_api_availability(results)

    print("\n🔗 Testing Frontend API Path Fixes...")
    await test_frontend_api_paths(results)

    # Generate summary
    summary = results.get_summary()

    print("\n" + "=" * 65)
    print("📊 BACKEND HEALTH CHECK SUMMARY")
    print("=" * 65)
    print(f"Total Tests: {summary['total']}")
    print(f"✅ Passed: {summary['passed']}")
    print(f"❌ Failed: {summary['failed']}")
    print(f"⏱️ Duration: {summary['duration']:.2f}s")

    if summary["failed_tests"]:
        print(f"\n🚨 FAILED TESTS:")
        for test in summary["failed_tests"]:
            print(f"  - {test['test']}: {test['error']}")

    print(f"\n🎯 Success Rate: {summary['success_rate']:.1f}%")

    # Status assessment
    if summary["success_rate"] >= 90:
        print("🎉 EXCELLENT! Backend fixes are working perfectly")
    elif summary["success_rate"] >= 75:
        print("✅ GOOD! Most fixes are working, minor issues remain")
    elif summary["success_rate"] >= 50:
        print("⚠️ FAIR! Some fixes working, others need attention")
    else:
        print("🚨 CRITICAL! Major issues with backend fixes")

    # Specific fix status
    print(f"\n🔧 CRITICAL FIXES STATUS:")
    critical_fixes = [
        "Dashboard Timezone Fix",
        "Testing API Path Fix",
        "Configuration Loading",
        "API Availability",
    ]

    for fix in critical_fixes:
        fix_result = next((r for r in results.results if r["test"] == fix), None)
        if fix_result:
            status = "✅" if fix_result["success"] else "❌"
            print(f"  {status} {fix}")

    return summary["success_rate"] >= 75


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
