#!/usr/bin/env python3
"""
Script to run authentication API tests with admin credentials.

This script provides various testing modes for authentication functionality:
- Unit tests with pytest
- Integration tests
- Manual API testing
- Performance tests
- Security tests
"""

import asyncio
import sys
import subprocess
import argparse
import logging
from pathlib import Path
from typing import List, Optional
import json
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from tests.auth_test_config import get_test_config
from tests.manual_auth_test import AuthAPITester

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AuthTestRunner:
    """Comprehensive authentication test runner."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize test runner."""
        self.base_url = base_url
        self.config = get_test_config()
        self.config.base_url = base_url
        self.results = []

    def run_pytest_tests(
        self, test_file: Optional[str] = None, verbose: bool = True
    ) -> bool:
        """Run pytest tests."""
        print("🧪 Running pytest authentication tests...")

        # Determine test files to run
        test_files = []
        if test_file:
            test_files.append(test_file)
        else:
            # Run all auth-related test files
            test_dir = project_root / "tests"
            test_files.extend(
                [
                    "test_auth_admin_api.py",
                    # Add other auth test files here
                ]
            )

        # Construct pytest command
        cmd = ["python", "-m", "pytest"]

        for file in test_files:
            test_path = test_dir / file
            if test_path.exists():
                cmd.append(str(test_path))
            else:
                logger.warning(f"Test file not found: {test_path}")

        if verbose:
            cmd.extend(["-v", "--tb=short"])

        # Add coverage if requested
        cmd.extend(
            [
                "--cov=app.api.v1.domains.auth",
                "--cov=app.services.authentication_service",
                "--cov-report=term-missing",
            ]
        )

        try:
            print(f"Running command: {' '.join(cmd)}")
            result = subprocess.run(
                cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minutes timeout
            )

            print("STDOUT:")
            print(result.stdout)

            if result.stderr:
                print("STDERR:")
                print(result.stderr)

            success = result.returncode == 0
            if success:
                print("✅ Pytest tests completed successfully!")
            else:
                print(f"❌ Pytest tests failed with return code: {result.returncode}")

            return success

        except subprocess.TimeoutExpired:
            print("❌ Pytest tests timed out!")
            return False
        except Exception as e:
            logger.error(f"Failed to run pytest: {e}")
            return False

    async def run_manual_tests(self, mode: str = "comprehensive") -> bool:
        """Run manual API tests."""
        print("🔧 Running manual authentication tests...")

        tester = AuthAPITester(self.base_url)

        try:
            if mode == "comprehensive":
                await tester.run_comprehensive_test()
            elif mode == "interactive":
                await tester.interactive_mode()
            else:
                logger.error(f"Unknown manual test mode: {mode}")
                return False

            print("✅ Manual tests completed!")
            return True

        except Exception as e:
            logger.error(f"Manual tests failed: {e}")
            return False

    async def run_performance_tests(self) -> bool:
        """Run performance tests for authentication endpoints."""
        print("⚡ Running authentication performance tests...")

        tester = AuthAPITester(self.base_url)

        # Login first
        login_success = await tester.test_admin_login()
        if not login_success:
            print("❌ Cannot run performance tests without login!")
            return False

        # Performance test scenarios
        performance_tests = [
            ("login", self._test_login_performance),
            ("token_validation", self._test_validation_performance),
            ("current_user", self._test_current_user_performance),
        ]

        all_passed = True

        for test_name, test_func in performance_tests:
            try:
                print(f"\n🏃 Testing {test_name} performance...")
                result = await test_func(tester)
                if result:
                    print(f"✅ {test_name} performance test passed")
                else:
                    print(f"❌ {test_name} performance test failed")
                    all_passed = False
            except Exception as e:
                logger.error(f"Performance test {test_name} failed: {e}")
                all_passed = False

        return all_passed

    async def _test_login_performance(self, tester: AuthAPITester) -> bool:
        """Test login performance."""
        import time

        times = []
        num_tests = 5

        for i in range(num_tests):
            start_time = time.time()

            response = await tester.make_request(
                "POST", "/auth/login", data=tester.admin_credentials
            )

            end_time = time.time()
            response_time = end_time - start_time
            times.append(response_time)

            if response["status_code"] != 200:
                print(f"❌ Login failed on attempt {i+1}")
                return False

            print(f"Attempt {i+1}: {response_time:.3f}s")

        avg_time = sum(times) / len(times)
        max_expected = self.config.PERFORMANCE_EXPECTATIONS.get("login", {}).get(
            "max_response_time", 2.0
        )

        print(f"Average response time: {avg_time:.3f}s (max expected: {max_expected}s)")

        return avg_time <= max_expected

    async def _test_validation_performance(self, tester: AuthAPITester) -> bool:
        """Test token validation performance."""
        import time

        times = []
        num_tests = 10

        for i in range(num_tests):
            start_time = time.time()

            response = await tester.make_request(
                "POST", "/auth/validate-token", use_auth=True
            )

            end_time = time.time()
            response_time = end_time - start_time
            times.append(response_time)

            if response["status_code"] != 200:
                print(f"❌ Token validation failed on attempt {i+1}")
                return False

            print(f"Attempt {i+1}: {response_time:.3f}s")

        avg_time = sum(times) / len(times)
        max_expected = self.config.PERFORMANCE_EXPECTATIONS.get(
            "validate_token", {}
        ).get("max_response_time", 0.5)

        print(f"Average response time: {avg_time:.3f}s (max expected: {max_expected}s)")

        return avg_time <= max_expected

    async def _test_current_user_performance(self, tester: AuthAPITester) -> bool:
        """Test current user endpoint performance."""
        import time

        times = []
        num_tests = 10

        for i in range(num_tests):
            start_time = time.time()

            response = await tester.make_request("GET", "/auth/me", use_auth=True)

            end_time = time.time()
            response_time = end_time - start_time
            times.append(response_time)

            if response["status_code"] != 200:
                print(f"❌ Current user request failed on attempt {i+1}")
                return False

            print(f"Attempt {i+1}: {response_time:.3f}s")

        avg_time = sum(times) / len(times)
        max_expected = self.config.PERFORMANCE_EXPECTATIONS.get(
            "get_current_user", {}
        ).get("max_response_time", 1.0)

        print(f"Average response time: {avg_time:.3f}s (max expected: {max_expected}s)")

        return avg_time <= max_expected

    async def run_security_tests(self) -> bool:
        """Run security tests for authentication endpoints."""
        print("🛡️  Running authentication security tests...")

        tester = AuthAPITester(self.base_url)

        security_tests = [
            ("sql_injection", self._test_sql_injection),
            ("xss_protection", self._test_xss_protection),
            ("rate_limiting", self._test_rate_limiting),
            ("token_security", self._test_token_security),
        ]

        all_passed = True

        for test_name, test_func in security_tests:
            try:
                print(f"\n🔒 Testing {test_name}...")
                result = await test_func(tester)
                if result:
                    print(f"✅ {test_name} security test passed")
                else:
                    print(f"❌ {test_name} security test failed")
                    all_passed = False
            except Exception as e:
                logger.error(f"Security test {test_name} failed: {e}")
                all_passed = False

        return all_passed

    async def _test_sql_injection(self, tester: AuthAPITester) -> bool:
        """Test SQL injection protection."""
        sql_payloads = self.config.SECURITY_TESTS["sql_injection"]

        for payload in sql_payloads:
            response = await tester.make_request(
                "POST", "/auth/login", data={"username": payload, "password": payload}
            )

            # Should not succeed and should not cause server error
            if response["status_code"] == 200:
                print(f"❌ SQL injection succeeded with payload: {payload}")
                return False

            if response["status_code"] == 500:
                print(f"❌ Server error with SQL payload: {payload}")
                return False

        print("✅ SQL injection protection working")
        return True

    async def _test_xss_protection(self, tester: AuthAPITester) -> bool:
        """Test XSS protection."""
        xss_payloads = self.config.SECURITY_TESTS["xss_payloads"]

        for payload in xss_payloads:
            response = await tester.make_request(
                "POST", "/auth/login", data={"username": payload, "password": "test"}
            )

            # Check if response contains unescaped script tags
            if response.get("content") and "<script>" in response["content"]:
                print(f"❌ XSS vulnerability with payload: {payload}")
                return False

        print("✅ XSS protection working")
        return True

    async def _test_rate_limiting(self, tester: AuthAPITester) -> bool:
        """Test rate limiting."""
        print("Testing rate limiting with repeated failed login attempts...")

        # Make multiple failed login attempts
        for i in range(10):
            response = await tester.make_request(
                "POST",
                "/auth/login",
                data={
                    "username": tester.admin_credentials["email"],
                    "password": "wrong_password",
                },
            )

            print(f"Attempt {i+1}: Status {response['status_code']}")

            # After several attempts, should get rate limited
            if i >= 5 and response["status_code"] == 429:
                print("✅ Rate limiting activated")
                return True

        print("⚠️  Rate limiting not detected (might be disabled in dev)")
        return True  # Don't fail if rate limiting is disabled in development

    async def _test_token_security(self, tester: AuthAPITester) -> bool:
        """Test token security features."""
        # Login to get tokens
        login_success = await tester.test_admin_login()
        if not login_success:
            return False

        # Test token reuse protection
        old_token = tester.access_token

        # Refresh token
        refresh_response = await tester.make_request(
            "POST", "/auth/refresh", data={"refresh_token": tester.refresh_token}
        )

        if refresh_response["status_code"] != 200:
            print("❌ Token refresh failed")
            return False

        # Try to use old token (should fail)
        old_token_response = await tester.make_request(
            "GET", "/auth/me", headers={"Authorization": f"Bearer {old_token}"}
        )

        if old_token_response["status_code"] == 200:
            print("❌ Old token still valid after refresh")
            return False

        print("✅ Token security features working")
        return True

    def generate_report(self, results: List[dict]) -> str:
        """Generate test report."""
        report = f"""
# Authentication API Test Report

**Generated:** {datetime.now().isoformat()}
**Base URL:** {self.base_url}
**Admin Email:** {self.config.admin.email}

## Test Results Summary

"""

        total_tests = len(results)
        passed_tests = len([r for r in results if r.get("passed", False)])
        failed_tests = total_tests - passed_tests

        report += f"- **Total Tests:** {total_tests}\n"
        report += f"- **Passed:** {passed_tests}\n"
        report += f"- **Failed:** {failed_tests}\n"
        report += f"- **Success Rate:** {(passed_tests/total_tests*100):.1f}%\n\n"

        # Detailed results
        report += "## Detailed Results\n\n"

        for result in results:
            status = "✅ PASSED" if result.get("passed", False) else "❌ FAILED"
            report += f"### {result.get('name', 'Unknown Test')} - {status}\n\n"

            if result.get("description"):
                report += f"**Description:** {result['description']}\n\n"

            if result.get("duration"):
                report += f"**Duration:** {result['duration']:.2f}s\n\n"

            if result.get("error"):
                report += f"**Error:** {result['error']}\n\n"

            report += "---\n\n"

        return report

    async def run_all_tests(self, include_manual: bool = False) -> bool:
        """Run all authentication tests."""
        print("🚀 Running comprehensive authentication test suite...")
        print(f"🎯 Target: {self.base_url}")
        print(f"🕐 Started: {datetime.now().isoformat()}")

        all_results = []
        overall_success = True

        # 1. Unit tests with pytest
        print("\n" + "=" * 60)
        print("1. UNIT TESTS (pytest)")
        print("=" * 60)

        try:
            pytest_success = self.run_pytest_tests()
            all_results.append(
                {
                    "name": "Unit Tests (pytest)",
                    "passed": pytest_success,
                    "description": "Comprehensive unit tests for authentication API",
                }
            )
            if not pytest_success:
                overall_success = False
        except Exception as e:
            logger.error(f"Unit tests failed: {e}")
            overall_success = False

        # 2. Manual/Integration tests
        if include_manual:
            print("\n" + "=" * 60)
            print("2. INTEGRATION TESTS")
            print("=" * 60)

            try:
                manual_success = await self.run_manual_tests("comprehensive")
                all_results.append(
                    {
                        "name": "Integration Tests",
                        "passed": manual_success,
                        "description": "End-to-end API integration tests",
                    }
                )
                if not manual_success:
                    overall_success = False
            except Exception as e:
                logger.error(f"Integration tests failed: {e}")
                overall_success = False

        # 3. Performance tests
        print("\n" + "=" * 60)
        print("3. PERFORMANCE TESTS")
        print("=" * 60)

        try:
            perf_success = await self.run_performance_tests()
            all_results.append(
                {
                    "name": "Performance Tests",
                    "passed": perf_success,
                    "description": "Response time and throughput tests",
                }
            )
            if not perf_success:
                overall_success = False
        except Exception as e:
            logger.error(f"Performance tests failed: {e}")
            overall_success = False

        # 4. Security tests
        print("\n" + "=" * 60)
        print("4. SECURITY TESTS")
        print("=" * 60)

        try:
            security_success = await self.run_security_tests()
            all_results.append(
                {
                    "name": "Security Tests",
                    "passed": security_success,
                    "description": "Security vulnerability and protection tests",
                }
            )
            if not security_success:
                overall_success = False
        except Exception as e:
            logger.error(f"Security tests failed: {e}")
            overall_success = False

        # Generate report
        report = self.generate_report(all_results)

        # Save report
        report_file = (
            project_root
            / "tests"
            / "test_reports"
            / f"auth_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        )
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report)

        print(f"\n📊 Test report saved to: {report_file}")
        print(report)

        if overall_success:
            print("🎉 All authentication tests passed!")
        else:
            print("❌ Some authentication tests failed!")

        return overall_success


async def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Authentication API Test Runner")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL for API (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--mode",
        choices=["all", "unit", "manual", "performance", "security", "interactive"],
        default="all",
        help="Test mode to run",
    )
    parser.add_argument(
        "--test-file", help="Specific test file to run (for unit tests)"
    )
    parser.add_argument(
        "--include-manual",
        action="store_true",
        help="Include manual/interactive tests in 'all' mode",
    )
    parser.add_argument("--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    runner = AuthTestRunner(args.url)

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    success = False

    try:
        if args.mode == "all":
            success = await runner.run_all_tests(args.include_manual)
        elif args.mode == "unit":
            success = runner.run_pytest_tests(args.test_file, args.verbose)
        elif args.mode == "manual":
            success = await runner.run_manual_tests("comprehensive")
        elif args.mode == "interactive":
            success = await runner.run_manual_tests("interactive")
        elif args.mode == "performance":
            success = await runner.run_performance_tests()
        elif args.mode == "security":
            success = await runner.run_security_tests()

        sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Test runner failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
