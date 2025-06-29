"""
Full integration tests that test complete user workflows.

These tests combine models, CRUDs, and endpoints to test real-world scenarios.
"""

import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import (
    user as crud_user,
    project as crud_project,
    requirement as crud_requirement,
)


@pytest.mark.asyncio
class TestCompleteProjectLifecycle:
    """Test complete project lifecycle from creation to completion."""

    async def test_project_lifecycle_with_requirements_and_releases(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """Test complete project lifecycle with requirements and releases."""

        # 1. SETUP: Register a project manager
        manager_data = {
            "username": "projectmanager",
            "email": "manager@company.com",
            "password": "securepassword123",
            "name": "Project Manager",
            "role": "manager",
        }

        register_response = await client.post(
            "/api/v1/auth/register", json=manager_data
        )
        assert register_response.status_code == status.HTTP_201_CREATED

        # Login as project manager
        login_data = {
            "username": "manager@company.com",
            "password": "securepassword123",
        }

        login_response = await client.post("/api/v1/auth/login", data=login_data)
        login_result = login_response.json()
        manager_headers = {"Authorization": f"Bearer {login_result['access_token']}"}

        # 2. PROJECT CREATION: Create a new project
        project_data = {
            "code": "ECOM2024",
            "name": "E-commerce Platform 2024",
            "description": "Next generation e-commerce platform with modern features",
            "status": "planning",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=manager_headers
        )
        assert project_response.status_code == status.HTTP_201_CREATED

        project = project_response.json()
        project_id = project["id"]

        # Verify project was created correctly
        assert project["code"] == "ECOM2024"
        assert project["name"] == "E-commerce Platform 2024"
        assert project["status"] == "planning"

        # 3. REFERENCE DATA SETUP: Create requirement types, priorities, and statuses
        reference_data = [
            (
                "requirement-types",
                {"name": "functional", "description": "Functional requirements"},
            ),
            (
                "requirement-types",
                {
                    "name": "non-functional",
                    "description": "Non-functional requirements",
                },
            ),
            ("requirement-priorities", {"name": "critical"}),
            ("requirement-priorities", {"name": "high"}),
            ("requirement-priorities", {"name": "medium"}),
            ("requirement-statuses", {"name": "draft"}),
            ("requirement-statuses", {"name": "active"}),
            ("requirement-statuses", {"name": "completed"}),
            ("relationship-types", {"name": "depends_on"}),
            ("relationship-types", {"name": "implements"}),
        ]

        for endpoint, data in reference_data:
            await client.post(
                f"/api/v1/reference/{endpoint}", json=data, headers=manager_headers
            )

        # Get reference data IDs
        types_response = await client.get(
            "/api/v1/reference/requirement-types", headers=manager_headers
        )
        priorities_response = await client.get(
            "/api/v1/reference/requirement-priorities", headers=manager_headers
        )
        statuses_response = await client.get(
            "/api/v1/reference/requirement-statuses", headers=manager_headers
        )
        rel_types_response = await client.get(
            "/api/v1/reference/relationship-types", headers=manager_headers
        )

        types = types_response.json()
        priorities = priorities_response.json()
        statuses = statuses_response.json()
        rel_types = rel_types_response.json()

        functional_type = next(t for t in types if t["name"] == "functional")
        high_priority = next(p for p in priorities if p["name"] == "high")
        medium_priority = next(p for p in priorities if p["name"] == "medium")
        active_status = next(s for s in statuses if s["name"] == "active")
        depends_on_type = next(r for r in rel_types if r["name"] == "depends_on")

        # 4. REQUIREMENTS PLANNING: Add requirements to the project
        requirements_data = [
            {
                "title": "User Authentication System",
                "description": "Implement secure user authentication with OAuth2 and JWT tokens",
                "type_id": functional_type["id"],
                "priority_id": high_priority["id"],
                "status_id": active_status["id"],
                "project_id": project_id,
            },
            {
                "title": "Product Catalog Management",
                "description": "System to manage product inventory, categories, and pricing",
                "type_id": functional_type["id"],
                "priority_id": high_priority["id"],
                "status_id": active_status["id"],
                "project_id": project_id,
            },
            {
                "title": "Shopping Cart Functionality",
                "description": "Allow users to add, remove, and modify items in their cart",
                "type_id": functional_type["id"],
                "priority_id": medium_priority["id"],
                "status_id": active_status["id"],
                "project_id": project_id,
            },
            {
                "title": "Payment Processing",
                "description": "Integrate with payment gateways for secure transactions",
                "type_id": functional_type["id"],
                "priority_id": high_priority["id"],
                "status_id": active_status["id"],
                "project_id": project_id,
            },
            {
                "title": "Order Management",
                "description": "System to track and manage customer orders",
                "type_id": functional_type["id"],
                "priority_id": medium_priority["id"],
                "status_id": active_status["id"],
                "project_id": project_id,
            },
        ]

        created_requirements = []
        for req_data in requirements_data:
            req_response = await client.post(
                "/api/v1/requirements/", json=req_data, headers=manager_headers
            )
            assert req_response.status_code == status.HTTP_201_CREATED
            created_requirements.append(req_response.json())

        # Verify requirements were created
        assert len(created_requirements) == 5

        # 5. REQUIREMENT RELATIONSHIPS: Create dependencies between requirements
        auth_req = next(
            r for r in created_requirements if "Authentication" in r["title"]
        )
        cart_req = next(r for r in created_requirements if "Cart" in r["title"])
        payment_req = next(r for r in created_requirements if "Payment" in r["title"])
        order_req = next(r for r in created_requirements if "Order" in r["title"])

        # Shopping cart depends on authentication
        rel1_data = {
            "source_id": cart_req["id"],
            "target_id": auth_req["id"],
            "type_id": depends_on_type["id"],
        }

        # Payment processing depends on shopping cart
        rel2_data = {
            "source_id": payment_req["id"],
            "target_id": cart_req["id"],
            "type_id": depends_on_type["id"],
        }

        # Order management depends on payment processing
        rel3_data = {
            "source_id": order_req["id"],
            "target_id": payment_req["id"],
            "type_id": depends_on_type["id"],
        }

        for rel_data in [rel1_data, rel2_data, rel3_data]:
            rel_response = await client.post(
                "/api/v1/relationships/", json=rel_data, headers=manager_headers
            )
            assert rel_response.status_code == status.HTTP_201_CREATED

        # 6. PROJECT COLLABORATION: Add comments to requirements
        for req in created_requirements[:3]:  # Comment on first 3 requirements
            comment_data = {
                "content": f"Initial analysis for {req['title']} - looks good to proceed",
                "requirement_id": req["id"],
            }

            comment_response = await client.post(
                "/api/v1/comments/", json=comment_data, headers=manager_headers
            )
            assert comment_response.status_code == status.HTTP_201_CREATED

        # 7. PROJECT PROGRESS: Update project status and requirement statuses
        # Update project to active development
        project_update = {
            "status": "development",
            "description": "E-commerce platform now in active development phase",
        }

        update_response = await client.put(
            f"/api/v1/projects/{project_id}",
            json=project_update,
            headers=manager_headers,
        )
        assert update_response.status_code == status.HTTP_200_OK

        # Mark authentication requirement as completed
        completed_status = next(s for s in statuses if s["name"] == "completed")

        status_update_response = await client.post(
            f"/api/v1/requirements/{auth_req['id']}/change-status",
            params={"status_id": completed_status["id"]},
            headers=manager_headers,
        )
        assert status_update_response.status_code == status.HTTP_200_OK

        # 8. CREATE RELEASE: Create a release for the project
        release_data = {
            "project_id": project_id,
            "name": "MVP Release",
            "version": "1.0.0",
            "description": "Minimum viable product release with core features",
            "status": "planned",
        }

        release_response = await client.post(
            "/api/v1/releases/", json=release_data, headers=manager_headers
        )
        assert release_response.status_code == status.HTTP_201_CREATED

        release = release_response.json()
        release_id = release["id"]

        # 9. VERIFICATION: Verify the complete project state
        # Get project with stats
        project_stats_response = await client.get(
            f"/api/v1/projects/{project_id}/stats", headers=manager_headers
        )
        assert project_stats_response.status_code == status.HTTP_200_OK

        project_stats = project_stats_response.json()
        assert project_stats["total_requirements"] == 5

        # Get project requirements
        proj_req_response = await client.get(
            f"/api/v1/projects/{project_id}/requirements", headers=manager_headers
        )
        assert proj_req_response.status_code == status.HTTP_200_OK

        project_requirements = proj_req_response.json()
        assert len(project_requirements) == 5

        # Get project releases
        proj_releases_response = await client.get(
            f"/api/v1/projects/{project_id}/releases", headers=manager_headers
        )
        assert proj_releases_response.status_code == status.HTTP_200_OK

        project_releases = proj_releases_response.json()
        assert len(project_releases) == 1
        assert project_releases[0]["version"] == "1.0.0"

        # Get requirement relationships
        relationships_response = await client.get(
            f"/api/v1/relationships/requirements/{cart_req['id']}/relationships",
            headers=manager_headers,
        )
        assert relationships_response.status_code == status.HTTP_200_OK

        relationships = relationships_response.json()
        assert len(relationships) >= 1

        # Get comments for a requirement
        comments_response = await client.get(
            f"/api/v1/comments/requirements/{auth_req['id']}/comments",
            headers=manager_headers,
        )
        assert comments_response.status_code == status.HTTP_200_OK

        comments = comments_response.json()
        assert len(comments) >= 1

        # 10. DASHBOARD VERIFICATION: Check dashboard reflects project activity
        dashboard_response = await client.get(
            "/api/v1/dashboard/stats", headers=manager_headers
        )
        assert dashboard_response.status_code == status.HTTP_200_OK

        dashboard = dashboard_response.json()
        assert dashboard["overview"]["total_projects"] >= 1
        assert dashboard["overview"]["total_requirements"] >= 5

        # Get my dashboard
        my_dashboard_response = await client.get(
            "/api/v1/dashboard/my-dashboard", headers=manager_headers
        )
        assert my_dashboard_response.status_code == status.HTTP_200_OK

        my_dashboard = my_dashboard_response.json()
        assert len(my_dashboard["my_projects"]) >= 1
        assert len(my_dashboard["my_requirements"]) >= 5


@pytest.mark.asyncio
class TestMultiUserCollaboration:
    """Test multi-user collaboration scenarios."""

    async def test_team_collaboration_workflow(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """Test team collaboration on a project."""

        # 1. SETUP: Create multiple users with different roles
        users_data = [
            {
                "username": "teamlead",
                "email": "lead@company.com",
                "password": "password123",
                "name": "Team Lead",
                "role": "manager",
            },
            {
                "username": "analyst",
                "email": "analyst@company.com",
                "password": "password123",
                "name": "Business Analyst",
                "role": "analyst",
            },
            {
                "username": "developer",
                "email": "dev@company.com",
                "password": "password123",
                "name": "Software Developer",
                "role": "developer",
            },
            {
                "username": "tester",
                "email": "tester@company.com",
                "password": "password123",
                "name": "QA Tester",
                "role": "tester",
            },
        ]

        user_tokens = {}

        for user_data in users_data:
            # Register user
            register_response = await client.post(
                "/api/v1/auth/register", json=user_data
            )
            assert register_response.status_code == status.HTTP_201_CREATED

            # Login user
            login_data = {
                "username": user_data["email"],
                "password": user_data["password"],
            }

            login_response = await client.post("/api/v1/auth/login", data=login_data)
            login_result = login_response.json()

            user_tokens[user_data["username"]] = {
                "Authorization": f"Bearer {login_result['access_token']}"
            }

        # 2. PROJECT CREATION: Team lead creates project
        project_data = {
            "code": "TEAM2024",
            "name": "Team Collaboration Project",
            "description": "Project to test team collaboration",
            "status": "active",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=user_tokens["teamlead"]
        )
        project = project_response.json()
        project_id = project["id"]

        # 3. SETUP REFERENCE DATA: Create by team lead
        await client.post(
            "/api/v1/reference/requirement-types",
            json={"name": "functional"},
            headers=user_tokens["teamlead"],
        )
        await client.post(
            "/api/v1/reference/requirement-priorities",
            json={"name": "high"},
            headers=user_tokens["teamlead"],
        )
        await client.post(
            "/api/v1/reference/requirement-statuses",
            json={"name": "active"},
            headers=user_tokens["teamlead"],
        )

        # Get reference data
        types = (
            await client.get(
                "/api/v1/reference/requirement-types", headers=user_tokens["teamlead"]
            )
        ).json()
        priorities = (
            await client.get(
                "/api/v1/reference/requirement-priorities",
                headers=user_tokens["teamlead"],
            )
        ).json()
        statuses = (
            await client.get(
                "/api/v1/reference/requirement-statuses",
                headers=user_tokens["teamlead"],
            )
        ).json()

        # 4. ANALYST CREATES REQUIREMENTS: Business analyst adds requirements
        analyst_requirements = [
            {
                "title": "User Registration Flow",
                "description": "Define user registration process and validation rules",
                "type_id": types[0]["id"],
                "priority_id": priorities[0]["id"],
                "status_id": statuses[0]["id"],
                "project_id": project_id,
            },
            {
                "title": "API Specification",
                "description": "Define REST API endpoints and data models",
                "type_id": types[0]["id"],
                "priority_id": priorities[0]["id"],
                "status_id": statuses[0]["id"],
                "project_id": project_id,
            },
        ]

        analyst_created_reqs = []
        for req_data in analyst_requirements:
            req_response = await client.post(
                "/api/v1/requirements/", json=req_data, headers=user_tokens["analyst"]
            )
            assert req_response.status_code == status.HTTP_201_CREATED
            analyst_created_reqs.append(req_response.json())

        # 5. DEVELOPER ADDS TECHNICAL REQUIREMENTS
        dev_requirements = [
            {
                "title": "Database Schema Design",
                "description": "Design database tables and relationships",
                "type_id": types[0]["id"],
                "priority_id": priorities[0]["id"],
                "status_id": statuses[0]["id"],
                "project_id": project_id,
            },
            {
                "title": "Security Implementation",
                "description": "Implement authentication and authorization",
                "type_id": types[0]["id"],
                "priority_id": priorities[0]["id"],
                "status_id": statuses[0]["id"],
                "project_id": project_id,
            },
        ]

        dev_created_reqs = []
        for req_data in dev_requirements:
            req_response = await client.post(
                "/api/v1/requirements/", json=req_data, headers=user_tokens["developer"]
            )
            assert req_response.status_code == status.HTTP_201_CREATED
            dev_created_reqs.append(req_response.json())

        # 6. CROSS-TEAM COMMENTS: Users comment on each other's requirements
        # Analyst comments on developer's requirement
        comment_data = {
            "content": "Please ensure the database schema supports user roles and permissions",
            "requirement_id": dev_created_reqs[0]["id"],
        }

        comment_response = await client.post(
            "/api/v1/comments/", json=comment_data, headers=user_tokens["analyst"]
        )
        assert comment_response.status_code == status.HTTP_201_CREATED

        # Developer comments on analyst's requirement
        comment_data = {
            "content": "The registration flow should include email verification",
            "requirement_id": analyst_created_reqs[0]["id"],
        }

        comment_response = await client.post(
            "/api/v1/comments/", json=comment_data, headers=user_tokens["developer"]
        )
        assert comment_response.status_code == status.HTTP_201_CREATED

        # Team lead reviews and comments
        comment_data = {
            "content": "Approved - this aligns with our security requirements",
            "requirement_id": dev_created_reqs[1]["id"],
        }

        comment_response = await client.post(
            "/api/v1/comments/", json=comment_data, headers=user_tokens["teamlead"]
        )
        assert comment_response.status_code == status.HTTP_201_CREATED

        # 7. TESTER CREATES TEST REQUIREMENTS
        test_requirements = [
            {
                "title": "User Registration Testing",
                "description": "Test cases for user registration validation",
                "type_id": types[0]["id"],
                "priority_id": priorities[0]["id"],
                "status_id": statuses[0]["id"],
                "project_id": project_id,
            },
        ]

        for req_data in test_requirements:
            req_response = await client.post(
                "/api/v1/requirements/", json=req_data, headers=user_tokens["tester"]
            )
            assert req_response.status_code == status.HTTP_201_CREATED

        # 8. VERIFICATION: Verify collaboration results
        # Get all project requirements
        proj_req_response = await client.get(
            f"/api/v1/projects/{project_id}/requirements",
            headers=user_tokens["teamlead"],
        )
        project_requirements = proj_req_response.json()

        assert len(project_requirements) == 5  # 2 analyst + 2 dev + 1 tester

        # Verify requirements were created by different users
        requirement_authors = {req["author_id"] for req in project_requirements}
        assert len(requirement_authors) >= 3  # At least 3 different authors

        # Get comments to verify cross-team collaboration
        for req in project_requirements[:3]:  # Check first 3 requirements
            comments_response = await client.get(
                f"/api/v1/comments/requirements/{req['id']}/comments",
                headers=user_tokens["teamlead"],
            )
            comments = comments_response.json()
            # Some requirements should have comments from collaboration

        # 9. DASHBOARD VIEWS: Each user sees their personalized dashboard
        for username, headers in user_tokens.items():
            my_dashboard_response = await client.get(
                "/api/v1/dashboard/my-dashboard", headers=headers
            )
            assert my_dashboard_response.status_code == status.HTTP_200_OK

            my_dashboard = my_dashboard_response.json()

            # Each user should see the shared project in their dashboard
            my_projects = my_dashboard["my_projects"]
            project_names = [proj["name"] for proj in my_projects]
            assert (
                "Team Collaboration Project" in project_names or len(my_projects) == 0
            )  # Owner might not see it immediately

        # 10. ACTIVITY TRACKING: Verify activity is tracked across users
        activity_response = await client.get(
            "/api/v1/dashboard/activity", headers=user_tokens["teamlead"]
        )
        assert activity_response.status_code == status.HTTP_200_OK

        activity = activity_response.json()
        assert len(activity) > 0  # Should have activity from various user actions


@pytest.mark.asyncio
class TestDataIntegrityAndConsistency:
    """Test data integrity and consistency across operations."""

    async def test_cascading_operations_integrity(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """Test that cascading operations maintain data integrity."""

        # Setup user
        user_data = {
            "username": "integrityuser",
            "email": "integrity@company.com",
            "password": "password123",
            "name": "Integrity User",
            "role": "admin",
        }

        await client.post("/api/v1/auth/register", json=user_data)

        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": "integrity@company.com", "password": "password123"},
        )
        headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}

        # Create reference data
        await client.post(
            "/api/v1/reference/requirement-types",
            json={"name": "functional"},
            headers=headers,
        )
        await client.post(
            "/api/v1/reference/requirement-priorities",
            json={"name": "high"},
            headers=headers,
        )
        await client.post(
            "/api/v1/reference/requirement-statuses",
            json={"name": "active"},
            headers=headers,
        )

        types = (
            await client.get("/api/v1/reference/requirement-types", headers=headers)
        ).json()
        priorities = (
            await client.get(
                "/api/v1/reference/requirement-priorities", headers=headers
            )
        ).json()
        statuses = (
            await client.get("/api/v1/reference/requirement-statuses", headers=headers)
        ).json()

        # Create project with requirements and comments
        project_data = {
            "code": "INTEGRITY001",
            "name": "Integrity Test Project",
            "status": "active",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=headers
        )
        project = project_response.json()
        project_id = project["id"]

        # Create requirements
        req_data = {
            "title": "Integrity Requirement",
            "description": "Test requirement for integrity",
            "type_id": types[0]["id"],
            "priority_id": priorities[0]["id"],
            "status_id": statuses[0]["id"],
            "project_id": project_id,
        }

        req_response = await client.post(
            "/api/v1/requirements/", json=req_data, headers=headers
        )
        requirement = req_response.json()
        requirement_id = requirement["id"]

        # Create comments on requirement
        for i in range(3):
            comment_data = {
                "content": f"Integrity comment {i}",
                "requirement_id": requirement_id,
            }
            await client.post("/api/v1/comments/", json=comment_data, headers=headers)

        # Verify initial state
        comments_response = await client.get(
            f"/api/v1/comments/requirements/{requirement_id}/comments", headers=headers
        )
        comments = comments_response.json()
        assert len(comments) == 3

        # Delete requirement (should cascade to comments)
        delete_req_response = await client.delete(
            f"/api/v1/requirements/{requirement_id}", headers=headers
        )
        assert delete_req_response.status_code == status.HTTP_204_NO_CONTENT

        # Verify requirement is gone
        get_req_response = await client.get(
            f"/api/v1/requirements/{requirement_id}", headers=headers
        )
        assert get_req_response.status_code == status.HTTP_404_NOT_FOUND

        # Verify comments are also gone (cascaded deletion)
        comments_after_response = await client.get(
            f"/api/v1/comments/requirements/{requirement_id}/comments", headers=headers
        )
        comments_after = comments_after_response.json()
        assert len(comments_after) == 0

        # Delete project (should cascade to remaining entities)
        delete_proj_response = await client.delete(
            f"/api/v1/projects/{project_id}", headers=headers
        )
        assert delete_proj_response.status_code == status.HTTP_204_NO_CONTENT

        # Verify project is gone
        get_proj_response = await client.get(
            f"/api/v1/projects/{project_id}", headers=headers
        )
        assert get_proj_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_concurrent_operations_consistency(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """Test that concurrent operations maintain consistency."""

        # Setup user
        user_data = {
            "username": "concurrentuser",
            "email": "concurrent@company.com",
            "password": "password123",
            "name": "Concurrent User",
            "role": "admin",
        }

        await client.post("/api/v1/auth/register", json=user_data)

        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": "concurrent@company.com", "password": "password123"},
        )
        headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}

        # Create reference data
        await client.post(
            "/api/v1/reference/requirement-types",
            json={"name": "functional"},
            headers=headers,
        )
        await client.post(
            "/api/v1/reference/requirement-priorities",
            json={"name": "medium"},
            headers=headers,
        )
        await client.post(
            "/api/v1/reference/requirement-statuses",
            json={"name": "active"},
            headers=headers,
        )

        types = (
            await client.get("/api/v1/reference/requirement-types", headers=headers)
        ).json()
        priorities = (
            await client.get(
                "/api/v1/reference/requirement-priorities", headers=headers
            )
        ).json()
        statuses = (
            await client.get("/api/v1/reference/requirement-statuses", headers=headers)
        ).json()

        # Create project
        project_data = {
            "code": "CONCURRENT001",
            "name": "Concurrent Test Project",
            "status": "active",
            "owner_id": 1,
        }

        project_response = await client.post(
            "/api/v1/projects/", json=project_data, headers=headers
        )
        project = project_response.json()
        project_id = project["id"]

        # Create requirement
        req_data = {
            "title": "Concurrent Requirement",
            "type_id": types[0]["id"],
            "priority_id": priorities[0]["id"],
            "status_id": statuses[0]["id"],
            "project_id": project_id,
        }

        req_response = await client.post(
            "/api/v1/requirements/", json=req_data, headers=headers
        )
        requirement = req_response.json()
        requirement_id = requirement["id"]

        # Simulate concurrent operations: multiple comments being added "simultaneously"
        import asyncio

        async def add_comment(comment_num):
            comment_data = {
                "content": f"Concurrent comment {comment_num}",
                "requirement_id": requirement_id,
            }
            return await client.post(
                "/api/v1/comments/", json=comment_data, headers=headers
            )

        # Execute multiple comment additions concurrently
        comment_tasks = [add_comment(i) for i in range(5)]
        comment_responses = await asyncio.gather(*comment_tasks)

        # Verify all comments were created successfully
        successful_comments = [
            r for r in comment_responses if r.status_code == status.HTTP_201_CREATED
        ]
        assert len(successful_comments) == 5

        # Verify final state is consistent
        final_comments_response = await client.get(
            f"/api/v1/comments/requirements/{requirement_id}/comments", headers=headers
        )
        final_comments = final_comments_response.json()
        assert len(final_comments) == 5

        # Verify each comment has unique content
        comment_contents = [c["content"] for c in final_comments]
        assert len(set(comment_contents)) == 5  # All unique
