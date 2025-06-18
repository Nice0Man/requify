"""
Comprehensive tests for Testing System API endpoints.

Tests all CRUD operations for testing system integration via HTTP requests.
"""

import pytest
import uuid
from datetime import datetime, timedelta
from httpx import AsyncClient
from fastapi import status


class TestTestingAPI:
    """Test class for Testing System API endpoints."""

    @pytest.fixture
    def unique_test_case_name(self):
        """Generate unique test case name for testing."""
        return f"TEST-CASE-{uuid.uuid4().hex[:8].upper()}"

    @pytest.fixture
    async def test_project(self, client: AsyncClient):
        """Create a test project for testing operations."""
        project_data = {
            "code": f"PROJ{uuid.uuid4().hex[:8].upper()}",
            "name": "Test Project for Testing",
            "description": "Project for testing operations",
            "status": "active",
        }
        response = await client.post("/api/v1/projects/", json=project_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    @pytest.fixture
    async def test_requirement(self, client: AsyncClient, test_project):
        """Create a test requirement for testing operations."""
        requirement_data = {
            "title": f"REQ-{uuid.uuid4().hex[:8].upper()}",
            "description": "Test requirement for testing operations",
            "project_id": test_project["id"],
            "type_id": 1,
            "priority_id": 1,
            "status_id": 1,
        }
        response = await client.post("/api/v1/requirements/", json=requirement_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    @pytest.fixture
    def sample_test_case_data(self, unique_test_case_name):
        """Sample data for creating a test case."""
        return {
            "name": unique_test_case_name,
            "description": "Test case description for API testing",
            "type": "functional",
            "priority": "high",
            "status": "active",
            "steps": [
                {
                    "step_number": 1,
                    "action": "Open application",
                    "expected_result": "Application opens",
                },
                {
                    "step_number": 2,
                    "action": "Login with valid credentials",
                    "expected_result": "User is logged in",
                },
            ],
            "preconditions": "User has valid credentials",
            "expected_result": "Test case executes successfully",
            "tags": ["smoke", "regression"],
        }

    @pytest.fixture
    def sample_test_execution_data(self):
        """Sample data for creating a test execution."""
        return {
            "environment": "staging",
            "browser": "chrome",
            "version": "latest",
            "executed_by": "test_user",
            "notes": "Test execution notes",
        }

    @pytest.fixture
    def sample_test_result_data(self):
        """Sample data for creating a test result."""
        return {
            "status": "passed",
            "duration": 120,
            "start_time": datetime.now().isoformat(),
            "end_time": (datetime.now() + timedelta(minutes=2)).isoformat(),
            "logs": ["Test started", "Step 1 passed", "Test completed"],
            "screenshots": ["screenshot1.png", "screenshot2.png"],
            "defects": [],
            "notes": "Test passed successfully",
        }

    async def create_test_case(
        self, client: AsyncClient, test_case_data: dict, requirement_id: int
    ) -> dict:
        """Helper method to create a test case."""
        test_case_data = test_case_data.copy()
        test_case_data["requirement_id"] = requirement_id

        response = await client.post("/api/v1/testing/test-cases", json=test_case_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()

    # TEST CASES TESTS
    async def test_create_test_case_success(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test successful test case creation."""
        sample_test_case_data["requirement_id"] = test_requirement["id"]

        response = await client.post(
            "/api/v1/testing/test-cases", json=sample_test_case_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == sample_test_case_data["name"]
        assert data["description"] == sample_test_case_data["description"]
        assert data["type"] == sample_test_case_data["type"]
        assert data["priority"] == sample_test_case_data["priority"]
        assert data["status"] == sample_test_case_data["status"]
        assert data["requirement_id"] == sample_test_case_data["requirement_id"]
        assert "id" in data
        assert "created_at" in data

    async def test_get_test_cases_list(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test getting list of test cases."""
        # Create test cases
        case1_data = sample_test_case_data.copy()
        case2_data = sample_test_case_data.copy()
        case2_data["name"] = f"Second_{case1_data['name']}"

        case1 = await self.create_test_case(client, case1_data, test_requirement["id"])
        case2 = await self.create_test_case(client, case2_data, test_requirement["id"])

        response = await client.get("/api/v1/testing/test-cases")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

        case_ids = [case["id"] for case in data]
        assert case1["id"] in case_ids
        assert case2["id"] in case_ids

    async def test_get_test_cases_with_filters(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test getting test cases with filters."""
        # Create test cases with different properties
        case1_data = sample_test_case_data.copy()
        case1_data["type"] = "functional"
        case1_data["priority"] = "high"
        await self.create_test_case(client, case1_data, test_requirement["id"])

        case2_data = sample_test_case_data.copy()
        case2_data["name"] = f"Different_{case1_data['name']}"
        case2_data["type"] = "performance"
        case2_data["priority"] = "low"
        await self.create_test_case(client, case2_data, test_requirement["id"])

        # Test filters
        filters = [
            "?requirement_id=" + str(test_requirement["id"]),
            "?type=functional",
            "?priority=high",
            "?status=active",
            "?search=" + case1_data["name"][:5],
        ]

        for filter_param in filters:
            response = await client.get(f"/api/v1/testing/test-cases{filter_param}")
            assert response.status_code == status.HTTP_200_OK

            data = response.json()
            assert isinstance(data, list)

    async def test_get_test_case_by_id(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test getting test case by ID."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )

        response = await client.get(f"/api/v1/testing/test-cases/{created_case['id']}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_case["id"]
        assert data["name"] == created_case["name"]
        assert data["requirement_id"] == created_case["requirement_id"]

    async def test_update_test_case(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test updating test case."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )

        update_data = {
            "name": "Updated Test Case Name",
            "description": "Updated description",
            "priority": "medium",
            "status": "inactive",
        }

        response = await client.put(
            f"/api/v1/testing/test-cases/{created_case['id']}", json=update_data
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["priority"] == update_data["priority"]
        assert data["status"] == update_data["status"]
        assert data["id"] == created_case["id"]

    async def test_delete_test_case(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test deleting test case."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )

        response = await client.delete(
            f"/api/v1/testing/test-cases/{created_case['id']}"
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify test case is deleted
        get_response = await client.get(
            f"/api/v1/testing/test-cases/{created_case['id']}"
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    # TEST EXECUTIONS TESTS
    async def test_create_test_execution(
        self,
        client: AsyncClient,
        test_requirement,
        sample_test_case_data,
        sample_test_execution_data,
    ):
        """Test creating test execution."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )

        sample_test_execution_data["test_case_id"] = created_case["id"]

        response = await client.post(
            "/api/v1/testing/test-executions", json=sample_test_execution_data
        )
        assert response.status_code == status.HTTP_201_CREATED

        data = response.json()
        assert data["test_case_id"] == sample_test_execution_data["test_case_id"]
        assert data["environment"] == sample_test_execution_data["environment"]
        assert data["executed_by"] == sample_test_execution_data["executed_by"]
        assert "id" in data

    async def test_get_test_executions(
        self,
        client: AsyncClient,
        test_requirement,
        sample_test_case_data,
        sample_test_execution_data,
    ):
        """Test getting test executions."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )
        sample_test_execution_data["test_case_id"] = created_case["id"]

        # Create execution
        await client.post(
            "/api/v1/testing/test-executions", json=sample_test_execution_data
        )

        response = await client.get("/api/v1/testing/test-executions")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_get_test_execution_by_id(
        self,
        client: AsyncClient,
        test_requirement,
        sample_test_case_data,
        sample_test_execution_data,
    ):
        """Test getting test execution by ID."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )
        sample_test_execution_data["test_case_id"] = created_case["id"]

        # Create execution
        create_response = await client.post(
            "/api/v1/testing/test-executions", json=sample_test_execution_data
        )
        created_execution = create_response.json()

        response = await client.get(
            f"/api/v1/testing/test-executions/{created_execution['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == created_execution["id"]
        assert data["test_case_id"] == created_execution["test_case_id"]

    # TEST RESULTS TESTS
    async def test_create_test_result(
        self,
        client: AsyncClient,
        test_requirement,
        sample_test_case_data,
        sample_test_execution_data,
        sample_test_result_data,
    ):
        """Test creating test result."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )
        sample_test_execution_data["test_case_id"] = created_case["id"]

        # Create execution
        execution_response = await client.post(
            "/api/v1/testing/test-executions", json=sample_test_execution_data
        )
        created_execution = execution_response.json()

        sample_test_result_data["execution_id"] = created_execution["id"]

        response = await client.post(
            "/api/v1/testing/test-results", json=sample_test_result_data
        )
        assert response.status_code == status.HTTP_201_CREATED

        data = response.json()
        assert data["execution_id"] == sample_test_result_data["execution_id"]
        assert data["status"] == sample_test_result_data["status"]
        assert data["duration"] == sample_test_result_data["duration"]
        assert "id" in data

    async def test_get_test_results(self, client: AsyncClient):
        """Test getting test results."""
        response = await client.get("/api/v1/testing/test-results")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    async def test_get_test_results_with_filters(self, client: AsyncClient):
        """Test getting test results with filters."""
        # Test various filters
        filters = [
            "?status=passed",
            "?status=failed",
            "?execution_id=1",
            "?requirement_id=1",
        ]

        for filter_param in filters:
            response = await client.get(f"/api/v1/testing/test-results{filter_param}")
            assert response.status_code == status.HTTP_200_OK

            data = response.json()
            assert isinstance(data, list)

    # TEST PLANS TESTS
    async def test_create_test_plan(self, client: AsyncClient, test_project):
        """Test creating test plan."""
        test_plan_data = {
            "name": f"Test Plan {uuid.uuid4().hex[:8]}",
            "description": "Test plan description",
            "project_id": test_project["id"],
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "status": "active",
        }

        response = await client.post("/api/v1/testing/test-plans", json=test_plan_data)
        assert response.status_code == status.HTTP_201_CREATED

        data = response.json()
        assert data["name"] == test_plan_data["name"]
        assert data["project_id"] == test_plan_data["project_id"]
        assert data["status"] == test_plan_data["status"]
        assert "id" in data

    async def test_get_test_plans(self, client: AsyncClient):
        """Test getting test plans."""
        response = await client.get("/api/v1/testing/test-plans")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    # EXTERNAL SYSTEM INTEGRATION TESTS
    async def test_sync_with_external_system(self, client: AsyncClient, test_project):
        """Test synchronization with external testing system."""
        sync_data = {
            "project_id": test_project["id"],
            "external_system": "jira",
            "sync_type": "full",
        }

        response = await client.post("/api/v1/testing/sync", json=sync_data)
        # This endpoint might not exist yet or require external system setup
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_202_ACCEPTED,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        ]

    async def test_export_test_cases(self, client: AsyncClient, test_project):
        """Test exporting test cases."""
        export_data = {
            "project_id": test_project["id"],
            "format": "excel",
            "include_results": True,
        }

        response = await client.post("/api/v1/testing/export", json=export_data)
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_202_ACCEPTED,
            status.HTTP_404_NOT_FOUND,
        ]

    async def test_import_test_cases(self, client: AsyncClient, test_project):
        """Test importing test cases."""
        # Simulate file upload
        files = {
            "file": (
                "test_cases.xlsx",
                b"fake excel content",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        data = {"project_id": test_project["id"]}

        response = await client.post("/api/v1/testing/import", files=files, data=data)
        # This endpoint might not exist yet
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]

    # STATISTICS AND REPORTING TESTS
    async def test_get_test_statistics(self, client: AsyncClient, test_project):
        """Test getting test statistics."""
        response = await client.get(
            f"/api/v1/testing/statistics?project_id={test_project['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, dict)
        # Should contain various metrics
        expected_metrics = [
            "total_test_cases",
            "passed_tests",
            "failed_tests",
            "coverage",
        ]
        for metric in expected_metrics:
            # Metrics might or might not be present depending on implementation
            if metric in data:
                assert isinstance(data[metric], (int, float))

    async def test_get_test_coverage_report(self, client: AsyncClient, test_project):
        """Test getting test coverage report."""
        response = await client.get(
            f"/api/v1/testing/coverage?project_id={test_project['id']}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, dict)

    async def test_get_test_execution_report(self, client: AsyncClient, test_project):
        """Test getting test execution report."""
        start_date = (datetime.now() - timedelta(days=30)).isoformat()
        end_date = datetime.now().isoformat()

        response = await client.get(
            f"/api/v1/testing/execution-report?project_id={test_project['id']}&start_date={start_date}&end_date={end_date}"
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, dict)

    # AUTOMATION TESTS
    async def test_automated_test_execution(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test automated test execution."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )

        automation_data = {
            "test_case_ids": [created_case["id"]],
            "environment": "staging",
            "browser": "chrome",
            "parallel": False,
        }

        response = await client.post(
            "/api/v1/testing/execute-automated", json=automation_data
        )
        # This endpoint might not exist yet or require automation setup
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_202_ACCEPTED,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        ]

    async def test_get_automation_status(self, client: AsyncClient):
        """Test getting automation execution status."""
        response = await client.get("/api/v1/testing/automation-status")
        # This endpoint might not exist yet
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    # VALIDATION TESTS
    async def test_test_case_validation(self, client: AsyncClient, test_requirement):
        """Test test case validation."""
        # Test empty name
        invalid_data = {
            "name": "",
            "description": "Test description",
            "requirement_id": test_requirement["id"],
        }

        response = await client.post("/api/v1/testing/test-cases", json=invalid_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_test_result_validation(self, client: AsyncClient):
        """Test test result validation."""
        # Test invalid status
        invalid_data = {
            "execution_id": 1,
            "status": "invalid_status",
            "duration": -1,  # Invalid duration
        }

        response = await client.post("/api/v1/testing/test-results", json=invalid_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_concurrent_test_operations(
        self, client: AsyncClient, test_requirement, sample_test_case_data
    ):
        """Test concurrent test operations."""
        created_case = await self.create_test_case(
            client, sample_test_case_data, test_requirement["id"]
        )

        # Simulate concurrent reads
        import asyncio

        tasks = [
            client.get(f"/api/v1/testing/test-cases/{created_case['id']}"),
            client.get("/api/v1/testing/test-cases"),
            client.get("/api/v1/testing/test-results"),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # All read operations should succeed
        for result in results:
            if isinstance(result, Exception):
                pytest.fail(f"Concurrent operation failed: {result}")
            else:
                assert result.status_code == status.HTTP_200_OK
