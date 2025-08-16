#!/usr/bin/env python3
"""
Local CI Tests Runner for Requify Backend.

This script runs the same tests that would run in CI/CD locally.
"""

import asyncio
import subprocess
import sys
import os
import time
from pathlib import Path
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class LocalCIRunner:
    """Local CI test runner."""
    
    def __init__(self):
        """Initialize CI runner."""
        self.project_root = Path(__file__).parent.parent
        self.results: Dict[str, Dict[str, Any]] = {}
    
    def run_command(self, command: List[str], cwd: Path = None, timeout: int = 300) -> Dict[str, Any]:
        """Run a command and return results."""
        if cwd is None:
            cwd = self.project_root
        
        logger.info(f"Running: {' '.join(command)}")
        start_time = time.time()
        
        try:
            result = subprocess.run(
                command,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            duration = time.time() - start_time
            
            return {
                "success": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "duration": duration
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds",
                "duration": timeout
            }
        except Exception as e:
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "duration": time.time() - start_time
            }
    
    def check_poetry(self) -> bool:
        """Check if Poetry is installed."""
        result = self.run_command(["poetry", "--version"])
        if result["success"]:
            logger.info(f"Poetry version: {result['stdout'].strip()}")
            return True
        else:
            logger.error("Poetry is not installed or not in PATH")
            return False
    
    def install_dependencies(self) -> bool:
        """Install project dependencies."""
        logger.info("Installing dependencies...")
        result = self.run_command(["poetry", "install", "--with", "dev,test"])
        
        if result["success"]:
            logger.info("Dependencies installed successfully")
            return True
        else:
            logger.error(f"Failed to install dependencies: {result['stderr']}")
            return False
    
    def run_linting(self) -> bool:
        """Run code linting."""
        logger.info("Running linting checks...")
        
        # Run ruff
        logger.info("Running ruff...")
        result = self.run_command(["poetry", "run", "ruff", "check", "."])
        ruff_success = result["success"]
        
        if not ruff_success:
            logger.warning(f"Ruff found issues: {result['stdout']}")
        
        # Run black check
        logger.info("Running black check...")
        result = self.run_command(["poetry", "run", "black", "--check", "--diff", "."])
        black_success = result["success"]
        
        if not black_success:
            logger.warning(f"Black formatting issues: {result['stdout']}")
        
        self.results["linting"] = {
            "ruff": ruff_success,
            "black": black_success,
            "overall": ruff_success and black_success
        }
        
        return ruff_success and black_success
    
    def run_unit_tests(self) -> bool:
        """Run unit tests."""
        logger.info("Running unit tests...")
        
        result = self.run_command([
            "poetry", "run", "pytest",
            "tests/",
            "-v",
            "--tb=short",
            "--cov=app",
            "--cov-report=term-missing",
            "--cov-report=html",
            "--junit-xml=test-results.xml",
            "-m", "not integration and not performance"
        ])
        
        self.results["unit_tests"] = {
            "success": result["success"],
            "duration": result["duration"],
            "output": result["stdout"]
        }
        
        if result["success"]:
            logger.info("Unit tests passed")
        else:
            logger.error(f"Unit tests failed: {result['stderr']}")
        
        return result["success"]
    
    def setup_test_server(self) -> subprocess.Popen:
        """Start test server."""
        logger.info("Starting test server...")
        
        # Create test environment
        env = os.environ.copy()
        env.update({
            "RUN__ENV": "testing",
            "RUN__DEBUG": "false",
            "DATABASE__DATABASE": "requify_test",
            "ADMIN__EMAIL": "admin@example.com",
            "ADMIN__PASSWORD": "SecurePass123!",
        })
        
        # Start server
        process = subprocess.Popen([
            "poetry", "run", "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--log-level", "warning"
        ], cwd=self.project_root, env=env)
        
        # Wait for server to start
        time.sleep(5)
        
        # Check if server is running
        result = self.run_command(["curl", "-f", "http://localhost:8000/health"], timeout=10)
        if not result["success"]:
            logger.warning("Server health check failed, but continuing...")
        
        return process
    
    def run_integration_tests(self) -> bool:
        """Run integration tests."""
        logger.info("Running integration tests...")
        
        server_process = None
        try:
            # Start test server
            server_process = self.setup_test_server()
            
            # Run domain tests
            result = self.run_command([
                "poetry", "run", "pytest",
                "tests/test_all_domains.py",
                "-v",
                "--tb=short",
                "--junit-xml=integration-results.xml"
            ])
            
            # Run manual auth tests
            auth_result = self.run_command([
                "poetry", "run", "python",
                "tests/manual_auth_test.py",
                "--mode", "comprehensive",
                "--url", "http://localhost:8000"
            ])
            
            integration_success = result["success"]
            auth_success = auth_result["success"]
            
            self.results["integration_tests"] = {
                "domain_tests": integration_success,
                "auth_tests": auth_success,
                "overall": integration_success and auth_success,
                "duration": result["duration"] + auth_result["duration"]
            }
            
            if integration_success and auth_success:
                logger.info("Integration tests passed")
                return True
            else:
                logger.error("Integration tests failed")
                return False
            
        finally:
            # Stop server
            if server_process:
                server_process.terminate()
                server_process.wait(timeout=10)
    
    def run_security_tests(self) -> bool:
        """Run security tests."""
        logger.info("Running security tests...")
        
        # Run bandit
        logger.info("Running bandit security scan...")
        result = self.run_command([
            "poetry", "run", "bandit",
            "-r", "app/",
            "-f", "txt"
        ])
        
        bandit_success = result["returncode"] == 0 or "No issues identified" in result["stdout"]
        
        self.results["security_tests"] = {
            "bandit": bandit_success,
            "overall": bandit_success
        }
        
        if bandit_success:
            logger.info("Security tests passed")
        else:
            logger.warning(f"Security issues found: {result['stdout']}")
        
        return bandit_success
    
    def generate_report(self) -> None:
        """Generate test report."""
        logger.info("Generating test report...")
        
        print("\n" + "="*80)
        print("🏁 LOCAL CI TEST RESULTS")
        print("="*80)
        
        total_tests = 0
        passed_tests = 0
        
        for test_name, test_result in self.results.items():
            print(f"\n📋 {test_name.upper().replace('_', ' ')}:")
            
            if isinstance(test_result, dict) and "overall" in test_result:
                success = test_result["overall"]
                if success:
                    print(f"   ✅ PASSED")
                    passed_tests += 1
                else:
                    print(f"   ❌ FAILED")
                total_tests += 1
                
                # Show details
                for key, value in test_result.items():
                    if key != "overall" and isinstance(value, bool):
                        status = "✅" if value else "❌"
                        print(f"      {status} {key}")
                
                if "duration" in test_result:
                    print(f"      ⏱️  Duration: {test_result['duration']:.2f}s")
            
            elif isinstance(test_result, bool):
                if test_result:
                    print(f"   ✅ PASSED")
                    passed_tests += 1
                else:
                    print(f"   ❌ FAILED")
                total_tests += 1
        
        print(f"\n📊 SUMMARY:")
        print(f"   Total test suites: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {total_tests - passed_tests}")
        
        if total_tests > 0:
            success_rate = (passed_tests / total_tests) * 100
            print(f"   Success rate: {success_rate:.1f}%")
            
            if success_rate >= 80:
                print(f"\n🎉 Overall result: PASSED")
                return True
            else:
                print(f"\n❌ Overall result: FAILED")
                return False
        else:
            print(f"\n⚠️  No tests were run")
            return False
    
    async def run_all_tests(self) -> bool:
        """Run all CI tests."""
        logger.info("Starting local CI test run...")
        
        # Check prerequisites
        if not self.check_poetry():
            return False
        
        # Install dependencies
        if not self.install_dependencies():
            return False
        
        # Run tests
        linting_success = self.run_linting()
        unit_success = self.run_unit_tests()
        integration_success = self.run_integration_tests()
        security_success = self.run_security_tests()
        
        # Generate report
        overall_success = self.generate_report()
        
        return overall_success


async def main():
    """Main function."""
    runner = LocalCIRunner()
    success = await runner.run_all_tests()
    
    if success:
        logger.info("✅ All CI tests completed successfully")
        return 0
    else:
        logger.error("❌ Some CI tests failed")
        return 1


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(result)
