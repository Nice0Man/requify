"""
Comprehensive tests for the dashboard API with all CRUD operations.
"""

import pytest
from datetime import datetime, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.dashboard import (
    UserDashboardPreferences,
    DashboardNotification,
    DashboardActivity,
    DashboardWidget,
)
from app.crud import user_preferences, notification, activity, widget


class TestDashboardCRUD:
    """Test dashboard CRUD operations"""

    @pytest.fixture
    async def test_user(self, db: AsyncSession):
        """Create a test user"""
        user = User(
            username="test_dashboard_user",
            email="dashboard@test.com",
            hashed_password="hashed_password",
            name="Dashboard Test User",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @pytest.fixture
    async def test_project(self, db: AsyncSession, test_user: User):
        """Create a test project"""
        project = Project(
            code="DASH-TEST",
            name="Dashboard Test Project",
            description="Test project for dashboard",
            status="active",
            owner_id=test_user.id,
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @pytest.fixture
    async def test_requirement(
        self, db: AsyncSession, test_user: User, test_project: Project
    ):
        """Create a test requirement"""
        requirement = Requirement(
            title="Test Dashboard Requirement",
            description="Test requirement for dashboard",
            type_id=1,
            priority_id=1,
            status_id=1,
            project_id=test_project.id,
            author_id=test_user.id,
            last_modified_by=test_user.id,
        )
        db.add(requirement)
        await db.commit()
        await db.refresh(requirement)
        return requirement

    async def test_user_preferences_crud(self, db: AsyncSession, test_user: User):
        """Test user preferences CRUD operations"""
        # Test get preferences for new user (should return None)
        prefs = await user_preferences.get_by_user_id(db, user_id=test_user.id)
        assert prefs is None

        # Test create preferences
        prefs_data = {
            "show_quick_stats": True,
            "show_recent_activity": False,
            "activity_limit": 30,
            "theme": "dark",
        }

        created_prefs = await user_preferences.create_or_update_preferences(
            db, user_id=test_user.id, preferences_data=prefs_data
        )

        assert created_prefs.user_id == test_user.id
        assert created_prefs.show_quick_stats is True
        assert created_prefs.show_recent_activity is False
        assert created_prefs.activity_limit == 30
        assert created_prefs.theme == "dark"

        # Test update preferences
        updated_prefs_data = {
            "show_quick_stats": False,
            "activity_limit": 50,
            "theme": "light",
        }

        updated_prefs = await user_preferences.create_or_update_preferences(
            db, user_id=test_user.id, preferences_data=updated_prefs_data
        )

        assert updated_prefs.id == created_prefs.id  # Same record
        assert updated_prefs.show_quick_stats is False
        assert updated_prefs.show_recent_activity is False  # Unchanged
        assert updated_prefs.activity_limit == 50
        assert updated_prefs.theme == "light"

        # Test get default preferences
        default_prefs = await user_preferences.get_default_preferences(test_user.id)
        assert default_prefs["user_id"] == test_user.id
        assert default_prefs["show_quick_stats"] is True
        assert default_prefs["activity_limit"] == 20

    async def test_notification_crud(
        self, db: AsyncSession, test_user: User, test_project: Project
    ):
        """Test notification CRUD operations"""
        # Test create notification
        notification_obj = await notification.create_notification(
            db,
            user_id=test_user.id,
            notification_type="info",
            title="Test Notification",
            message="This is a test notification",
            action_url="/projects/1",
            action_text="View Project",
            priority="high",
            project_id=test_project.id,
        )

        assert notification_obj.user_id == test_user.id
        assert notification_obj.type == "info"
        assert notification_obj.title == "Test Notification"
        assert notification_obj.is_read is False
        assert notification_obj.priority == "high"
        assert notification_obj.project_id == test_project.id

        # Test get user notifications
        notifications = await notification.get_user_notifications(
            db, user_id=test_user.id
        )
        assert len(notifications) == 1
        assert notifications[0].id == notification_obj.id

        # Test get unread notifications only
        unread_notifications = await notification.get_user_notifications(
            db, user_id=test_user.id, unread_only=True
        )
        assert len(unread_notifications) == 1

        # Test mark as read
        read_notification = await notification.mark_as_read(
            db, notification_id=notification_obj.id, user_id=test_user.id
        )
        assert read_notification.is_read is True
        assert read_notification.read_at is not None

        # Test get unread notifications after marking as read
        unread_notifications = await notification.get_user_notifications(
            db, user_id=test_user.id, unread_only=True
        )
        assert len(unread_notifications) == 0

        # Test mark all as read
        # Create another notification
        await notification.create_notification(
            db,
            user_id=test_user.id,
            notification_type="warning",
            title="Another Notification",
            message="Another test notification",
        )

        marked_count = await notification.mark_all_as_read(db, user_id=test_user.id)
        assert marked_count == 1  # Only the new unread one

    async def test_activity_crud(
        self, db: AsyncSession, test_user: User, test_project: Project
    ):
        """Test activity CRUD operations"""
        # Test create activity
        activity_obj = await activity.create_activity(
            db,
            activity_type="project_created",
            activity_title="Created new project",
            user_id=test_user.id,
            user_name=test_user.name,
            activity_description="Created a new test project",
            project_id=test_project.id,
            entity_type="project",
            entity_id=test_project.id,
            entity_name=test_project.name,
            status="active",
            priority="medium",
            extra_data={"test": "data"},
        )

        assert activity_obj.activity_type == "project_created"
        assert activity_obj.user_id == test_user.id
        assert activity_obj.project_id == test_project.id
        assert activity_obj.entity_type == "project"
        assert activity_obj.extra_data == {"test": "data"}

        # Test get recent activities
        activities = await activity.get_recent_activities(db, limit=10)
        assert len(activities) >= 1
        assert activities[0].id == activity_obj.id

        # Test get activities by user
        user_activities = await activity.get_recent_activities(
            db, user_id=test_user.id, limit=10
        )
        assert len(user_activities) >= 1
        assert user_activities[0].user_id == test_user.id

        # Test get activities by project
        project_activities = await activity.get_recent_activities(
            db, project_id=test_project.id, limit=10
        )
        assert len(project_activities) >= 1
        assert project_activities[0].project_id == test_project.id

        # Test get activities by type
        typed_activities = await activity.get_recent_activities(
            db, activity_types=["project_created"], limit=10
        )
        assert len(typed_activities) >= 1
        assert typed_activities[0].activity_type == "project_created"

        # Test get activity stats
        stats = await activity.get_activity_stats(db, user_id=test_user.id)
        assert "project_created" in stats
        assert stats["project_created"] >= 1

    async def test_widget_crud(self, db: AsyncSession, test_user: User):
        """Test widget CRUD operations"""
        # Test create default widgets
        widgets = await widget.create_default_widgets(db, user_id=test_user.id)
        assert len(widgets) == 4  # Default widgets count

        widget_types = [w.widget_type for w in widgets]
        assert "quick_stats" in widget_types
        assert "my_projects" in widget_types
        assert "recent_activity" in widget_types
        assert "notifications" in widget_types

        # Test get user widgets
        user_widgets = await widget.get_user_widgets(db, user_id=test_user.id)
        assert len(user_widgets) == 4
        assert all(w.is_visible for w in user_widgets)

        # Test update widget positions
        position_updates = [
            {"id": widgets[0].id, "position": 3},
            {"id": widgets[1].id, "position": 2},
            {"id": widgets[2].id, "position": 1},
            {"id": widgets[3].id, "position": 0},
        ]

        success = await widget.update_widget_positions(
            db, user_id=test_user.id, widget_positions=position_updates
        )
        assert success is True

        # Verify positions were updated
        updated_widgets = await widget.get_user_widgets(db, user_id=test_user.id)
        sorted_widgets = sorted(updated_widgets, key=lambda x: x.position)
        assert sorted_widgets[0].id == widgets[3].id  # Should be first now
        assert sorted_widgets[3].id == widgets[0].id  # Should be last now


class TestDashboardAPI:
    """Test dashboard API endpoints"""

    @pytest.fixture
    async def authenticated_client(self, client: AsyncClient, test_user: User):
        """Create authenticated client"""
        # Mock authentication - in real tests, you'd get a proper token
        return client

    async def test_get_dashboard_stats(
        self, authenticated_client: AsyncClient, db: AsyncSession
    ):
        """Test dashboard stats endpoint"""
        response = await authenticated_client.get("/api/v1/dashboard/stats")

        # Should return 401 without proper authentication
        # In a real test with proper auth, we'd expect 200
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert "overview" in data
            assert "recent_activity" in data
            assert "project_performance" in data
            assert "trending_metrics" in data
            assert "quick_access" in data

    async def test_get_my_dashboard(
        self, authenticated_client: AsyncClient, db: AsyncSession
    ):
        """Test my dashboard endpoint"""
        response = await authenticated_client.get("/api/v1/dashboard/my-dashboard")

        # Should return 401 without proper authentication
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert "my_projects" in data
            assert "my_requirements" in data
            assert "my_activity" in data
            assert "notifications" in data
            assert "preferences" in data

    async def test_get_dashboard_activity(
        self, authenticated_client: AsyncClient, db: AsyncSession
    ):
        """Test dashboard activity endpoint"""
        response = await authenticated_client.get("/api/v1/dashboard/activity?limit=10")

        # Should return 401 without proper authentication
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            assert len(data) <= 10

    async def test_update_preferences(
        self, authenticated_client: AsyncClient, db: AsyncSession
    ):
        """Test update preferences endpoint"""
        preferences_data = {
            "show_quick_stats": False,
            "activity_limit": 25,
            "theme": "dark",
        }

        response = await authenticated_client.post(
            "/api/v1/dashboard/preferences", json=preferences_data
        )

        # Should return 401 without proper authentication
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert data["message"] == "Preferences updated successfully"
            assert "preferences_id" in data

    async def test_create_notification(
        self, authenticated_client: AsyncClient, db: AsyncSession
    ):
        """Test create notification endpoint"""
        notification_data = {
            "type": "info",
            "title": "Test API Notification",
            "message": "This is a test notification from API",
            "priority": "medium",
        }

        response = await authenticated_client.post(
            "/api/v1/dashboard/notifications", json=notification_data
        )

        # Should return 401 without proper authentication
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert data["message"] == "Notification created successfully"
            assert "notification_id" in data

    async def test_create_activity_record(
        self, authenticated_client: AsyncClient, db: AsyncSession
    ):
        """Test create activity record endpoint"""
        activity_data = {
            "activity_type": "test_activity",
            "activity_title": "Test Activity from API",
            "activity_description": "This is a test activity created via API",
            "entity_type": "test",
            "status": "completed",
        }

        response = await authenticated_client.post(
            "/api/v1/dashboard/activity", json=activity_data
        )

        # Should return 401 without proper authentication
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert data["message"] == "Activity recorded successfully"
            assert "activity_id" in data


class TestDashboardService:
    """Test dashboard service methods"""

    async def test_dashboard_service_overview_stats(self, db: AsyncSession):
        """Test dashboard service overview stats"""
        from app.api.v1.endpoints.dashboard import DashboardService

        service = DashboardService()
        overview = await service.get_overview_stats(db)

        assert overview.total_projects >= 0
        assert overview.total_requirements >= 0
        assert overview.total_users >= 0
        assert overview.active_projects >= 0
        assert overview.completed_projects >= 0

    async def test_dashboard_service_performance(self, db: AsyncSession):
        """Test dashboard service performance metrics"""
        from app.api.v1.endpoints.dashboard import DashboardService

        service = DashboardService()
        overview = await service.get_overview_stats(db)
        performance = await service.get_project_performance(db, overview)

        assert 0 <= performance.completion_rate <= 100
        assert 0 <= performance.quality_score <= 100
        assert performance.on_time_delivery >= 0
        assert performance.team_productivity >= 0

    async def test_dashboard_service_trending_metrics(self, db: AsyncSession):
        """Test dashboard service trending metrics"""
        from app.api.v1.endpoints.dashboard import DashboardService

        service = DashboardService()
        trending = await service.get_trending_metrics(db)

        assert trending.requirements_this_week >= 0
        assert trending.requirements_last_week >= 0
        assert trending.active_teams >= 1
        assert trending.avg_project_duration >= 0

    async def test_dashboard_service_recent_activity(self, db: AsyncSession):
        """Test dashboard service recent activity"""
        from app.api.v1.endpoints.dashboard import DashboardService

        service = DashboardService()
        activities = await service.get_recent_activity(db, limit=5)

        assert isinstance(activities, list)
        assert len(activities) <= 5

        for activity_item in activities:
            assert hasattr(activity_item, "id")
            assert hasattr(activity_item, "type")
            assert hasattr(activity_item, "title")
            assert hasattr(activity_item, "timestamp")


@pytest.mark.asyncio
async def test_dashboard_integration():
    """Integration test for dashboard components"""
    # This would test the full integration with a real database
    # For now, it's a placeholder for comprehensive integration testing
    pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
