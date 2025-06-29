#!/usr/bin/env python3
"""
Enhanced Comprehensive Test Validation Runner for Requify Backend
Tests database connections, models, CRUD operations, and API endpoints.
"""

import os
import sys
import asyncio
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Add the parent directory to Python path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Import application components
from app.core.config import settings
from app.db.session import get_db
from app.db.db_helper import db_helper
from app import crud
from app.models import User, Project, Requirement, TestResult
from app.schemas import UserCreate, ProjectCreate, RequirementCreate, TestResultCreate
from app.core.security import get_password_hash


class TestValidationResults:
    def __init__(self):
        self.results = []
        self.start_time = time.time()

    def add_result(self, test_name: str, success: bool, error_msg: str = None):
        """Add a test result"""
        self.results.append(
            {
                "test": test_name,
                "success": success,
                "error": error_msg,
                "timestamp": datetime.now(),
            }
        )

        # Real-time feedback
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if not success and error_msg:
            print(f"  Error: {error_msg}")

    def get_summary(self) -> Dict[str, Any]:
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


async def cleanup_test_data(db: AsyncSession):
    """Clean up test data to avoid unique constraint violations"""
    try:
        # Delete in reverse dependency order
        await db.execute(
            text(
                "DELETE FROM test_results WHERE created_at > NOW() - INTERVAL '1 hour'"
            )
        )
        await db.execute(
            text("DELETE FROM requirements WHERE title LIKE 'Test Requirement%'")
        )
        await db.execute(text("DELETE FROM projects WHERE code LIKE 'TEST%'"))
        await db.execute(
            text(
                "DELETE FROM users WHERE username LIKE '%testuser%' OR username LIKE '%cruduser%'"
            )
        )
        await db.commit()
        print("🧹 Test data cleaned up")
    except Exception as e:
        await db.rollback()
        print(f"⚠️ Test cleanup warning: {e}")


async def test_database_connection(results: TestValidationResults):
    """Test database connectivity"""
    try:
        async with db_helper.async_session_scope() as db:
            # Test basic connection
            result = await db.execute(text("SELECT 1"))
            assert result.scalar() == 1

            # Test database exists
            result = await db.execute(text("SELECT current_database()"))
            db_name = result.scalar()

            results.add_result("Database Connection", True)
            return True
    except Exception as e:
        results.add_result("Database Connection", False, str(e))
        return False


async def test_models_validation(results: TestValidationResults):
    """Test model creation and validation"""
    try:
        async with db_helper.async_session_scope() as db:
            # Clean up first
            await cleanup_test_data(db)

            # Create a test user with unique identifier
            timestamp = int(time.time())
            user_data = UserCreate(
                username=f"testuser_{timestamp}",
                email=f"test_{timestamp}@example.com",
                password="TestPass123!",
                name="Test User",
                role="developer",
            )

            user = await crud.user.create(db, obj_in=user_data)
            results.add_result("User Model Creation", True)

            # Create a test project with unique code
            project_data = ProjectCreate(
                code=f"TEST{timestamp}",
                name=f"Test Project {timestamp}",
                description="Test project description",
                owner_id=user.id,
            )

            project = await crud.project.create(db, obj_in=project_data)
            results.add_result("Project Model Creation", True)

            # Test model relationships
            assert project.owner_id == user.id
            results.add_result("Model Relationships", True)

            return True
    except Exception as e:
        results.add_result("Model Validation", False, str(e))
        return False


async def test_crud_operations(results: TestValidationResults):
    """Test CRUD operations"""
    try:
        async with db_helper.async_session_scope() as db:
            timestamp = int(time.time())

            # Test user CRUD
            user_data = UserCreate(
                username=f"cruduser_{timestamp}",
                email=f"crud_{timestamp}@example.com",
                password="CrudPass123!",
                role="developer",
            )

            # Create
            user = await crud.user.create(db, obj_in=user_data)
            assert user.username == user_data.username

            # Read
            found_user = await crud.user.get(db, id=user.id)
            assert found_user.id == user.id

            # Update
            user_update = {"name": "Updated Name"}
            updated_user = await crud.user.update(
                db, db_obj=found_user, obj_in=user_update
            )
            assert updated_user.name == "Updated Name"

            # Test project CRUD
            project_data = ProjectCreate(
                code=f"CRUD{timestamp}",
                name=f"CRUD Test Project {timestamp}",
                description="CRUD test project",
                owner_id=user.id,
            )

            project = await crud.project.create(db, obj_in=project_data)
            assert project.code == project_data.code

            results.add_result("CRUD Operations", True)
            return True
    except Exception as e:
        results.add_result("CRUD Operations", False, str(e))
        return False


async def test_api_endpoints(results: TestValidationResults):
    """Test API endpoints"""
    try:
        base_url = f"http://localhost:{settings.app_config.port}"
        timeout = httpx.Timeout(connect=5.0, read=5.0, write=5.0, pool=5.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            # Test health endpoint
            response = await client.get(f"{base_url}/health")
            assert response.status_code == 200

            # Test docs endpoint
            response = await client.get(f"{base_url}/docs")
            assert response.status_code == 200

            # Test auth endpoint (should return 422 for missing data, not 500)
            response = await client.post(f"{base_url}/api/v1/auth/login")
            assert response.status_code in [400, 422]  # Bad request or validation error

            # Test dashboard stats (should return 401 unauthorized)
            response = await client.get(f"{base_url}/api/v1/dashboard/stats")
            assert response.status_code == 401  # Unauthorized

            results.add_result("API Endpoints", True)
            return True
    except Exception as e:
        results.add_result("API Endpoints", False, str(e))
        return False


async def test_database_integrity(results: TestValidationResults):
    """Test database integrity constraints"""
    try:
        async with db_helper.async_session_scope() as db:
            # Test unique constraints
            result = await db.execute(
                text(
                    """
                SELECT conname, contype 
                FROM pg_constraint 
                WHERE contype = 'u' 
                AND conname LIKE '%uq_%'
                LIMIT 5
            """
                )
            )
            constraints = result.fetchall()
            assert len(constraints) > 0
            results.add_result("Unique Constraints", True)

            # Test foreign key constraints
            result = await db.execute(
                text(
                    """
                SELECT conname, contype 
                FROM pg_constraint 
                WHERE contype = 'f'
                LIMIT 5
            """
                )
            )
            fk_constraints = result.fetchall()
            assert len(fk_constraints) > 0
            results.add_result("Foreign Key Constraints", True)

            return True
    except Exception as e:
        results.add_result("Database Integrity", False, str(e))
        return False


async def test_connection_pooling(results: TestValidationResults):
    """Test database connection pooling"""
    try:
        # Test multiple concurrent connections
        async def test_concurrent_connection():
            async with db_helper.async_session_scope() as db:
                result = await db.execute(text("SELECT 1"))
                return result.scalar()

        # Run 5 concurrent connections
        tasks = [test_concurrent_connection() for _ in range(5)]
        results_list = await asyncio.gather(*tasks)

        assert all(r == 1 for r in results_list)
        results.add_result("Connection Pooling", True)
        return True
    except Exception as e:
        results.add_result("Connection Pooling", False, str(e))
        return False


async def main():
    """Main test runner"""
    print("🚀 Starting Enhanced Requify Backend Validation")
    print("=" * 60)

    results = TestValidationResults()

    # Run all tests
    await test_database_connection(results)

    print("\n🔍 Validating Models...")
    await test_models_validation(results)

    print("\n🔧 Validating CRUD Operations...")
    await test_crud_operations(results)

    print("\n🌐 Validating API Endpoints...")
    await test_api_endpoints(results)

    print("\n💾 Validating Database Integrity...")
    await test_database_integrity(results)

    print("\n🔗 Validating Connection Pooling...")
    await test_connection_pooling(results)

    # Generate summary
    summary = results.get_summary()

    print("\n" + "=" * 60)
    print("📊 ENHANCED TEST VALIDATION SUMMARY")
    print("=" * 60)
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
        print("🎉 EXCELLENT! System is highly stable")
    elif summary["success_rate"] >= 75:
        print("✅ GOOD! System is stable with minor issues")
    elif summary["success_rate"] >= 50:
        print("⚠️ FAIR! Some issues need attention")
    else:
        print("🚨 CRITICAL! Major issues detected")

    if summary["failed_tests"]:
        print(f"\n⚠️ VALIDATION ISSUES: Please review failed tests above")
    else:
        print(f"\n🎊 ALL TESTS PASSED! System is fully functional")


if __name__ == "__main__":
    asyncio.run(main())
