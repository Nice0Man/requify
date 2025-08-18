#!/usr/bin/env python3
"""
Script to check CI/CD readiness for Requify Backend.

Validates that all necessary files and configurations are in place
for successful CI/CD pipeline execution.
"""

import sys
import os
from pathlib import Path
import json
import yaml
import subprocess
from typing import List, Dict, Any

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))


class CIReadinessChecker:
    """Checks if the project is ready for CI/CD."""

    def __init__(self):
        self.project_root = project_root
        self.backend_root = self.project_root / "backend"
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.success_count = 0
        self.total_checks = 0

    def check_file_exists(self, file_path: Path, description: str) -> bool:
        """Check if a file exists."""
        self.total_checks += 1
        if file_path.exists():
            print(f"✅ {description}")
            self.success_count += 1
            return True
        else:
            error_msg = f"❌ {description} - File missing: {file_path}"
            print(error_msg)
            self.errors.append(error_msg)
            return False

    def check_directory_exists(self, dir_path: Path, description: str) -> bool:
        """Check if a directory exists."""
        self.total_checks += 1
        if dir_path.exists() and dir_path.is_dir():
            print(f"✅ {description}")
            self.success_count += 1
            return True
        else:
            error_msg = f"❌ {description} - Directory missing: {dir_path}"
            print(error_msg)
            self.errors.append(error_msg)
            return False

    def check_yaml_syntax(self, yaml_file: Path, description: str) -> bool:
        """Check YAML file syntax."""
        self.total_checks += 1
        try:
            with open(yaml_file, "r", encoding="utf-8") as f:
                yaml.safe_load(f)
            print(f"✅ {description}")
            self.success_count += 1
            return True
        except Exception as e:
            error_msg = f"❌ {description} - YAML syntax error: {e}"
            print(error_msg)
            self.errors.append(error_msg)
            return False

    def check_python_syntax(self, py_file: Path, description: str) -> bool:
        """Check Python file syntax."""
        self.total_checks += 1
        try:
            result = subprocess.run(
                [sys.executable, "-m", "py_compile", str(py_file)],
                capture_output=True,
                text=True,
                cwd=self.backend_root,
            )

            if result.returncode == 0:
                print(f"✅ {description}")
                self.success_count += 1
                return True
            else:
                error_msg = f"❌ {description} - Python syntax error: {result.stderr}"
                print(error_msg)
                self.errors.append(error_msg)
                return False
        except Exception as e:
            error_msg = f"❌ {description} - Error checking syntax: {e}"
            print(error_msg)
            self.errors.append(error_msg)
            return False

    def check_poetry_config(self) -> bool:
        """Check Poetry configuration."""
        pyproject_file = self.backend_root / "pyproject.toml"
        poetry_lock = self.backend_root / "poetry.lock"

        checks_passed = 0
        total_poetry_checks = 2

        if self.check_file_exists(pyproject_file, "Poetry pyproject.toml exists"):
            checks_passed += 1

        if self.check_file_exists(poetry_lock, "Poetry lock file exists"):
            checks_passed += 1

        return checks_passed == total_poetry_checks

    def check_github_actions(self) -> bool:
        """Check GitHub Actions configuration."""
        workflows_dir = self.project_root / ".github" / "workflows"
        api_testing_workflow = workflows_dir / "api-testing.yml"

        checks_passed = 0
        total_gh_checks = 2

        if self.check_directory_exists(
            workflows_dir, "GitHub workflows directory exists"
        ):
            checks_passed += 1

        if api_testing_workflow.exists():
            if self.check_yaml_syntax(
                api_testing_workflow, "GitHub Actions workflow syntax is valid"
            ):
                checks_passed += 1

        return checks_passed == total_gh_checks

    def check_test_configuration(self) -> bool:
        """Check test configuration files."""
        pytest_ini = self.backend_root / "pytest.ini"
        conftest_py = self.backend_root / "tests" / "conftest.py"
        test_domains = self.backend_root / "tests" / "test_all_domains.py"

        checks_passed = 0
        total_test_checks = 3

        if self.check_file_exists(pytest_ini, "pytest.ini configuration exists"):
            checks_passed += 1

        if conftest_py.exists():
            if self.check_python_syntax(conftest_py, "conftest.py syntax is valid"):
                checks_passed += 1

        if test_domains.exists():
            if self.check_python_syntax(
                test_domains, "test_all_domains.py syntax is valid"
            ):
                checks_passed += 1

        return checks_passed == total_test_checks

    def check_test_data(self) -> bool:
        """Check test data files."""
        test_data_dir = self.backend_root / "test_data"
        login_data = test_data_dir / "login.json"

        checks_passed = 0
        total_data_checks = 2

        if self.check_directory_exists(test_data_dir, "Test data directory exists"):
            checks_passed += 1

        if self.check_file_exists(login_data, "Test login data exists"):
            checks_passed += 1

        return checks_passed == total_data_checks

    def check_scripts(self) -> bool:
        """Check CI/CD related scripts."""
        scripts_dir = self.backend_root / "scripts"
        ci_setup = scripts_dir / "ci_setup.py"
        run_ci_tests = scripts_dir / "run_ci_tests.py"

        checks_passed = 0
        total_script_checks = 3

        if self.check_directory_exists(scripts_dir, "Scripts directory exists"):
            checks_passed += 1

        if ci_setup.exists():
            if self.check_python_syntax(ci_setup, "ci_setup.py syntax is valid"):
                checks_passed += 1

        if run_ci_tests.exists():
            if self.check_python_syntax(
                run_ci_tests, "run_ci_tests.py syntax is valid"
            ):
                checks_passed += 1

        return checks_passed == total_script_checks

    def check_documentation(self) -> bool:
        """Check documentation files."""
        readme_ci = self.backend_root / "tests" / "README_CI_CD.md"

        checks_passed = 0
        total_doc_checks = 1

        if self.check_file_exists(readme_ci, "CI/CD documentation exists"):
            checks_passed += 1

        return checks_passed == total_doc_checks

    def check_environment_examples(self) -> bool:
        """Check environment configuration examples."""
        docker_env_example = self.project_root / "deploy" / "docker.env.example"

        checks_passed = 0
        total_env_checks = 1

        if self.check_file_exists(
            docker_env_example, "Environment example file exists"
        ):
            checks_passed += 1

        return checks_passed == total_env_checks

    def generate_summary(self) -> Dict[str, Any]:
        """Generate summary of the readiness check."""
        success_rate = (
            (self.success_count / self.total_checks * 100)
            if self.total_checks > 0
            else 0
        )

        return {
            "total_checks": self.total_checks,
            "successful_checks": self.success_count,
            "failed_checks": len(self.errors),
            "warnings": len(self.warnings),
            "success_rate": success_rate,
            "ready_for_ci": success_rate >= 80 and len(self.errors) == 0,
            "errors": self.errors,
            "warnings": self.warnings,
        }

    def run_all_checks(self) -> Dict[str, Any]:
        """Run all readiness checks."""
        print("🔍 Checking CI/CD Readiness for Requify Backend")
        print("=" * 60)

        print("\n📦 Poetry Configuration:")
        self.check_poetry_config()

        print("\n🚀 GitHub Actions:")
        self.check_github_actions()

        print("\n🧪 Test Configuration:")
        self.check_test_configuration()

        print("\n📊 Test Data:")
        self.check_test_data()

        print("\n📜 Scripts:")
        self.check_scripts()

        print("\n📚 Documentation:")
        self.check_documentation()

        print("\n🌍 Environment:")
        self.check_environment_examples()

        print("\n" + "=" * 60)
        summary = self.generate_summary()

        print(f"📈 Summary:")
        print(f"   Total checks: {summary['total_checks']}")
        print(f"   Successful: {summary['successful_checks']}")
        print(f"   Failed: {summary['failed_checks']}")
        print(f"   Success rate: {summary['success_rate']:.1f}%")

        if summary["ready_for_ci"]:
            print(f"\n🎉 Project is READY for CI/CD!")
            return summary
        else:
            print(f"\n⚠️  Project needs attention before CI/CD:")
            for error in summary["errors"]:
                print(f"   • {error}")

            if summary["warnings"]:
                print(f"\n💡 Warnings:")
                for warning in summary["warnings"]:
                    print(f"   • {warning}")

            return summary


def main():
    """Main function."""
    checker = CIReadinessChecker()
    summary = checker.run_all_checks()

    # Exit with appropriate code
    if summary["ready_for_ci"]:
        print(f"\n✅ All systems ready for CI/CD deployment!")
        sys.exit(0)
    else:
        print(f"\n❌ Please fix the issues above before proceeding with CI/CD.")
        sys.exit(1)


if __name__ == "__main__":
    main()
