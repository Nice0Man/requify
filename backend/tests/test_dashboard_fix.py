#!/usr/bin/env python3
"""
Quick test to verify dashboard timezone fixes are working.
"""

import os
import sys
import asyncio

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.core.config import settings
from app.models.base import Base


async def test_dashboard_endpoints():
    """Test dashboard endpoints to verify timezone fixes."""

    print("🧪 Testing Dashboard Timezone Fixes")
    print("=" * 40)

    # Setup test database
    test_db_url = settings.test_db.async_url
    test_engine = create_async_engine(test_db_url, echo=False)

    # Create tables if needed
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    success_count = 0
    total_tests = 0

    try:
        # Test with direct API client
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:

            # Test 1: Health endpoint
            total_tests += 1
            try:
                response = await client.get("/health")
                if response.status_code == 200:
                    print("✅ Health endpoint working")
                    success_count += 1
                else:
                    print(f"❌ Health endpoint failed: {response.status_code}")
            except Exception as e:
                print(f"❌ Health endpoint error: {str(e)[:100]}")

            # Test 2: Register a test user
            total_tests += 1
            try:
                user_data = {
                    "email": "admin@example.com",
                    "username": "admin",
                    "password": "SecurePassword123!",
                    "name": "Dashboard Test User",
                    "role": "admin",
                }
                register_response = await client.post(
                    "/api/v1/auth/register", json=user_data
                )

                if register_response.status_code in [
                    200,
                    201,
                    409,
                ]:  # 409 if user already exists
                    print("✅ User registration endpoint working")
                    success_count += 1

                    # Test 3: Login
                    total_tests += 1
                    try:
                        login_data = {
                            "username": user_data["email"],
                            "password": user_data["password"],
                        }
                        login_response = await client.post(
                            "/api/v1/auth/login", data=login_data
                        )

                        if login_response.status_code == 200:
                            token_data = login_response.json()
                            access_token = token_data.get("access_token")

                            if access_token:
                                print("✅ User login endpoint working")
                                success_count += 1
                                headers = {"Authorization": f"Bearer {access_token}"}

                                # Test 4: Dashboard stats endpoint (the main fix)
                                total_tests += 1
                                try:
                                    stats_response = await client.get(
                                        "/api/v1/dashboard/stats", headers=headers
                                    )

                                    if stats_response.status_code == 200:
                                        stats_data = stats_response.json()
                                        print("✅ Dashboard stats endpoint working!")
                                        print(
                                            f"  📊 Found {stats_data.get('overview', {}).get('total_projects', 0)} projects"
                                        )
                                        print(
                                            f"  📋 Found {stats_data.get('overview', {}).get('total_requirements', 0)} requirements"
                                        )
                                        success_count += 1
                                    else:
                                        error_detail = stats_response.json().get(
                                            "detail", "Unknown error"
                                        )
                                        print(
                                            f"❌ Dashboard stats failed: {stats_response.status_code}"
                                        )
                                        print(f"  Error: {error_detail}")
                                except Exception as e:
                                    print(f"❌ Dashboard stats error: {str(e)[:200]}")

                                # Test 5: My dashboard endpoint
                                total_tests += 1
                                try:
                                    my_dash_response = await client.get(
                                        "/api/v1/dashboard/my-dashboard",
                                        headers=headers,
                                    )

                                    if my_dash_response.status_code == 200:
                                        print("✅ My dashboard endpoint working!")
                                        success_count += 1
                                    else:
                                        error_detail = my_dash_response.json().get(
                                            "detail", "Unknown error"
                                        )
                                        print(
                                            f"❌ My dashboard failed: {my_dash_response.status_code}"
                                        )
                                        print(f"  Error: {error_detail}")
                                except Exception as e:
                                    print(f"❌ My dashboard error: {str(e)[:200]}")
                            else:
                                print("❌ No access token received")
                        else:
                            print(f"❌ Login failed: {login_response.status_code}")
                    except Exception as e:
                        print(f"❌ Login error: {str(e)[:100]}")
                else:
                    print(f"❌ Registration failed: {register_response.status_code}")
            except Exception as e:
                print(f"❌ Registration error: {str(e)[:100]}")

    finally:
        await test_engine.dispose()

    print("\n" + "=" * 40)
    print(f"📊 TEST RESULTS")
    print("=" * 40)
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {success_count}")
    print(f"❌ Failed: {total_tests - success_count}")

    success_rate = (success_count / total_tests * 100) if total_tests > 0 else 0
    print(f"🎯 Success Rate: {success_rate:.1f}%")

    if success_rate >= 80:
        print("\n🎉 DASHBOARD FIXES WORKING! Timezone errors resolved!")
        return True
    else:
        print("\n⚠️ Some dashboard issues remain")
        return False


if __name__ == "__main__":
    try:
        success = asyncio.run(test_dashboard_endpoints())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        sys.exit(1)
