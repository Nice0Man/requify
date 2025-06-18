"""
Test Runner for Comprehensive API Tests.

Provides utilities to run all API tests with different configurations and reporting.
"""

import pytest
import sys
import os
from pathlib import Path
import asyncio
from typing import List, Optional
import click


class APITestRunner:
    """Main test runner class for API tests."""

    def __init__(self, test_dir: str = None):
        """Initialize test runner."""
        if test_dir is None:
            self.test_dir = Path(__file__).parent
        else:
            self.test_dir = Path(test_dir)

    def run_all_tests(self, verbose: bool = True, coverage: bool = False) -> int:
        """Run all API tests."""
        args = [
            str(self.test_dir),
            "-v" if verbose else "",
            "--tb=short",
            "--strict-markers",
            "--asyncio-mode=auto",
        ]

        if coverage:
            args.extend(
                [
                    "--cov=requify.app",
                    "--cov-report=html:htmlcov",
                    "--cov-report=term",
                    "--cov-report=xml",
                ]
            )

        # Filter out empty strings
        args = [arg for arg in args if arg]

        return pytest.main(args)

    def run_specific_test_file(self, test_file: str, verbose: bool = True) -> int:
        """Run tests from a specific file."""
        test_path = self.test_dir / test_file
        if not test_path.exists():
            print(f"Test file {test_path} does not exist")
            return 1

        args = [
            str(test_path),
            "-v" if verbose else "",
            "--tb=short",
            "--asyncio-mode=auto",
        ]

        # Filter out empty strings
        args = [arg for arg in args if arg]

        return pytest.main(args)

    def run_tests_by_pattern(self, pattern: str, verbose: bool = True) -> int:
        """Run tests matching a specific pattern."""
        args = [
            str(self.test_dir),
            "-k",
            pattern,
            "-v" if verbose else "",
            "--tb=short",
            "--asyncio-mode=auto",
        ]

        # Filter out empty strings
        args = [arg for arg in args if arg]

        return pytest.main(args)

    def run_parallel_tests(self, num_workers: int = 4, verbose: bool = True) -> int:
        """Run tests in parallel using pytest-xdist."""
        args = [
            str(self.test_dir),
            f"-n{num_workers}",
            "-v" if verbose else "",
            "--tb=short",
            "--asyncio-mode=auto",
        ]

        # Filter out empty strings
        args = [arg for arg in args if arg]

        return pytest.main(args)

    def run_smoke_tests(self, verbose: bool = True) -> int:
        """Run only smoke tests (basic CRUD operations)."""
        pattern = "test_create_user_success or test_create_project_success or test_get_users_list or test_get_projects_list"
        return self.run_tests_by_pattern(pattern, verbose)

    def run_crud_tests(self, entity: str, verbose: bool = True) -> int:
        """Run CRUD tests for a specific entity."""
        test_file_map = {
            "users": "test_users_api.py",
            "projects": "test_projects_api.py",
            "requirements": "test_requirements_api.py",
            "releases": "test_releases_api.py",
            "reference": "test_reference_api.py",
            "testing": "test_testing_api.py",
        }

        if entity not in test_file_map:
            print(f"Unknown entity: {entity}")
            print(f"Available entities: {', '.join(test_file_map.keys())}")
            return 1

        return self.run_specific_test_file(test_file_map[entity], verbose)

    def generate_test_report(self, output_file: str = "test_report.html") -> int:
        """Generate a comprehensive test report."""
        args = [
            str(self.test_dir),
            "--html=" + output_file,
            "--self-contained-html",
            "--tb=short",
            "--asyncio-mode=auto",
        ]

        return pytest.main(args)


@click.command()
@click.option(
    "--test-type",
    "-t",
    type=click.Choice(
        [
            "all",
            "smoke",
            "users",
            "projects",
            "requirements",
            "releases",
            "reference",
            "testing",
        ]
    ),
    default="all",
    help="Type of tests to run",
)
@click.option("--verbose", "-v", is_flag=True, default=True, help="Verbose output")
@click.option("--coverage", "-c", is_flag=True, help="Generate coverage report")
@click.option("--parallel", "-p", type=int, help="Run tests in parallel with N workers")
@click.option("--pattern", "-k", help="Run tests matching pattern")
@click.option("--report", "-r", help="Generate HTML report file")
@click.option("--test-dir", help="Test directory path")
def run_tests(
    test_type: str,
    verbose: bool,
    coverage: bool,
    parallel: Optional[int],
    pattern: Optional[str],
    report: Optional[str],
    test_dir: Optional[str],
):
    """
    Run comprehensive API tests for Requify.

    Examples:
        python test_runner.py --test-type all --coverage
        python test_runner.py --test-type smoke
        python test_runner.py --test-type users --verbose
        python test_runner.py --parallel 4
        python test_runner.py --pattern "test_create*"
        python test_runner.py --report test_report.html
    """
    runner = APITestRunner(test_dir)

    if report:
        print(f"Generating test report: {report}")
        return runner.generate_test_report(report)

    if pattern:
        print(f"Running tests matching pattern: {pattern}")
        return runner.run_tests_by_pattern(pattern, verbose)

    if parallel:
        print(f"Running tests in parallel with {parallel} workers")
        return runner.run_parallel_tests(parallel, verbose)

    if test_type == "all":
        print("Running all API tests")
        return runner.run_all_tests(verbose, coverage)
    elif test_type == "smoke":
        print("Running smoke tests")
        return runner.run_smoke_tests(verbose)
    else:
        print(f"Running {test_type} tests")
        return runner.run_crud_tests(test_type, verbose)


if __name__ == "__main__":
    sys.exit(run_tests())


# Additional utility functions for test management
def setup_test_environment():
    """Setup test environment variables and configurations."""
    os.environ.setdefault("TESTING", "1")
    os.environ.setdefault(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/requify_test"
    )


def cleanup_test_data():
    """Cleanup test data after running tests."""
    # This would typically clean up any test databases or files
    pass


def validate_test_environment():
    """Validate that the test environment is properly configured."""
    required_env_vars = [
        "DATABASE_URL",
        "REDIS_URL",
    ]

    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print(f"Missing required environment variables: {', '.join(missing_vars)}")
        return False

    return True


class TestConfiguration:
    """Configuration management for tests."""

    @staticmethod
    def get_test_database_url():
        """Get test database URL."""
        return os.getenv(
            "TEST_DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/requify_test",
        )

    @staticmethod
    def get_test_redis_url():
        """Get test Redis URL."""
        return os.getenv("TEST_REDIS_URL", "redis://localhost:6379/1")

    @staticmethod
    def is_integration_testing_enabled():
        """Check if integration testing is enabled."""
        return os.getenv("ENABLE_INTEGRATION_TESTS", "false").lower() == "true"

    @staticmethod
    def get_test_timeout():
        """Get test timeout in seconds."""
        return int(os.getenv("TEST_TIMEOUT", "30"))


if __name__ == "__main__":
    # Setup environment
    setup_test_environment()

    # Validate environment
    if not validate_test_environment():
        sys.exit(1)

    # Run the CLI
    sys.exit(run_tests())
