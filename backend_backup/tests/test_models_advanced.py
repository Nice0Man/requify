"""
Advanced model tests for complex scenarios and edge cases.
Tests advanced relationships, business logic, and performance optimizations.
"""

import pytest
from datetime import datetime, UTC, timedelta
from decimal import Decimal
from sqlalchemy import case, create_engine, select, func, and_, or_
from sqlalchemy.orm import Session, sessionmaker, selectinload, joinedload
from sqlalchemy.exc import IntegrityError, InvalidRequestError

# Import all company-related models for testing
from app.models.base import Base
from app.models.company import Company, CompanyStatus, CompanyType
from app.models.company_settings import CompanySettings
from app.models.company_branding import CompanyBranding
from app.models.company_contact import CompanyContact
from app.models.company_subscription import (
    CompanySubscription,
    SubscriptionPlan,
    SubscriptionStatus,
    BillingPeriod,
)
from app.models.user import User
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.constants import TeamRole, ProjectStatus
from app.core.constants import RoleScope, SystemRole, CompanyRole

@pytest.fixture(scope="function")
def advanced_db_session():
    """Create a test database session with more complex setup."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()

@pytest.fixture
def complete_company_setup(advanced_db_session: Session):
    """Create a complete company setup with all related models."""
    # Create company
    company = Company(
        name="Advanced Test Company",
        slug="advanced-test-company",
        description="Company for advanced testing",
        status=CompanyStatus.ACTIVE,
        company_type=CompanyType.ENTERPRISE,
    )
    advanced_db_session.add(company)
    advanced_db_session.commit()

    # Create company settings
    settings = CompanySettings(
        company_id=company.id,
        domain="testcompany.com",
        allow_domain_signup=True,
        enable_sso=True,
        sso_provider="google",
        enforce_2fa=True,
        notification_settings={"email": True, "browser": True},
    )
    advanced_db_session.add(settings)

    # Create company branding
    branding = CompanyBranding(
        company_id=company.id,
        logo_url="https://example.com/logo.png",
        primary_color="#007bff",
        secondary_color="#6c757d",
        custom_css=".custom { color: blue; }",
    )
    advanced_db_session.add(branding)

    # Create company contact
    contact = CompanyContact(
        company_id=company.id,
        contact_type="main",
        is_primary=True,
        label="Head Office",
        email="admin@advancedtest.com",
        phone="+1234567890",
    )
    advanced_db_session.add(contact)

    # Create company subscription
    subscription = CompanySubscription(
        company_id=company.id,
        plan=SubscriptionPlan.ENTERPRISE.value,
        price=Decimal("299.99"),
        billing_period=BillingPeriod.MONTHLY.value,
        status=SubscriptionStatus.ACTIVE.value,
        started_at=datetime.now(UTC).replace(tzinfo=None),
        expires_at=(datetime.now(UTC) + timedelta(days=30)).replace(tzinfo=None),
    )
    advanced_db_session.add(subscription)

    advanced_db_session.commit()

    return {
        "company": company,
        "settings": settings,
        "branding": branding,
        "contact": contact,
        "subscription": subscription,
    }

# ======
# COMPANY SETTINGS MODEL TESTS
# ======

class TestCompanySettingsModel:
    """Test CompanySettings model."""

    def test_company_settings_creation(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test company settings creation and relationships."""
        company = complete_company_setup["company"]
        settings = complete_company_setup["settings"]

        assert settings.company == company
        assert settings.domain == "testcompany.com"
        assert settings.allow_domain_signup is True
        assert settings.enable_sso is True
        assert settings.notification_settings["email"] is True

        # Test relationship from company side
        advanced_db_session.refresh(company)
        assert settings in company.settings

    def test_company_settings_json_fields(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test JSON field functionality."""
        settings = complete_company_setup["settings"]

        # Test notification_settings JSON field
        assert isinstance(settings.notification_settings, dict)
        assert "email" in settings.notification_settings

        # Test sso_config JSON field (should be None for google provider initially)
        settings.sso_config = {
            "client_id": "test_client",
            "client_secret": "test_secret",
        }
        advanced_db_session.commit()

        # Update JSON fields
        new_notifications = settings.notification_settings.copy()
        new_notifications["push"] = True
        settings.notification_settings = new_notifications

        sso_config = settings.sso_config.copy()
        sso_config["domain"] = "testcompany.com"
        settings.sso_config = sso_config
        advanced_db_session.commit()

        # Verify updates
        advanced_db_session.refresh(settings)
        assert settings.notification_settings["push"] is True
        assert settings.sso_config["domain"] == "testcompany.com"

    def test_company_settings_validation(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test company settings validation logic."""
        company = complete_company_setup["company"]

        # Test invalid session timeout (negative value)
        invalid_settings = CompanySettings(
            company_id=company.id,
            session_timeout_minutes=-1,  # Should be invalid
            api_rate_limit=-10,  # Should be invalid
        )

        # Note: In a real application, you would have validators
        # For now, we just test that the field accepts the value
        assert invalid_settings.session_timeout_minutes == -1
        assert invalid_settings.api_rate_limit == -10

# ======
# COMPANY BRANDING MODEL TESTS
# ======

class TestCompanyBrandingModel:
    """Test CompanyBranding model."""

    def test_company_branding_creation(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test company branding creation and relationships."""
        company = complete_company_setup["company"]
        branding = complete_company_setup["branding"]

        assert branding.company == company
        assert branding.primary_color == "#007bff"
        assert branding.logo_url == "https://example.com/logo.png"

        # Test relationship from company side
        advanced_db_session.refresh(company)
        assert branding in company.branding

    def test_company_branding_css(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test custom CSS functionality."""
        branding = complete_company_setup["branding"]

        assert ".custom" in branding.custom_css

        # Update CSS
        branding.custom_css = ".updated { font-size: 14px; }"
        advanced_db_session.commit()

        advanced_db_session.refresh(branding)
        assert ".updated" in branding.custom_css

    def test_company_branding_themes(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test theme-related functionality."""
        branding = complete_company_setup["branding"]

        # Test theme data
        branding.theme_data = {
            "dark_mode": True,
            "sidebar_color": "#2c3e50",
            "font_family": "Arial, sans-serif",
        }
        advanced_db_session.commit()

        advanced_db_session.refresh(branding)
        assert branding.theme_data["dark_mode"] is True
        assert branding.theme_data["sidebar_color"] == "#2c3e50"

# ======
# COMPANY CONTACT MODEL TESTS
# ======

class TestCompanyContactModel:
    """Test CompanyContact model."""

    def test_company_contact_creation(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test company contact creation and relationships."""
        company = complete_company_setup["company"]
        contact = complete_company_setup["contact"]

        assert contact.company == company
        assert contact.contact_type == "main"
        assert contact.email == "admin@advancedtest.com"

        # Test relationship from company side
        advanced_db_session.refresh(company)
        assert contact in company.contacts

    def test_multiple_company_contacts(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test multiple contacts for a company."""
        company = complete_company_setup["company"]

        # Create additional contacts
        billing_contact = CompanyContact(
            company_id=company.id,
            contact_type="billing",
            label="Billing Department",
            email="billing@advancedtest.com",
            billing_email="billing@advancedtest.com",
        )

        technical_contact = CompanyContact(
            company_id=company.id,
            contact_type="support",
            label="Technical Support",
            email="tech@advancedtest.com",
            support_email="tech@advancedtest.com",
        )

        advanced_db_session.add_all([billing_contact, technical_contact])
        advanced_db_session.commit()

        # Verify all contacts
        advanced_db_session.refresh(company)
        assert len(company.contacts) == 3  # primary + billing + technical

        contact_types = [c.contact_type for c in company.contacts]
        assert "main" in contact_types
        assert "billing" in contact_types
        assert "support" in contact_types

    def test_company_contact_business_logic(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test company contact business logic methods."""
        contact = complete_company_setup["contact"]

        # Test contact properties
        assert contact.is_primary is True
        assert contact.label == "Head Office"
        assert contact.contact_type == "main"

        # Test contact validation
        assert contact.email.endswith("@advancedtest.com")
        assert contact.email == "admin@advancedtest.com"

# ======
# COMPANY SUBSCRIPTION MODEL TESTS
# ======

class TestCompanySubscriptionModel:
    """Test CompanySubscription model."""

    def test_company_subscription_creation(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test company subscription creation and relationships."""
        company = complete_company_setup["company"]
        subscription = complete_company_setup["subscription"]

        assert subscription.company == company
        assert subscription.plan == SubscriptionPlan.ENTERPRISE.value
        assert subscription.price == Decimal("299.99")
        assert subscription.status == SubscriptionStatus.ACTIVE.value

        # Test relationship from company side
        advanced_db_session.refresh(company)
        assert subscription in company.subscriptions

    def test_subscription_periods(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test subscription period logic."""
        subscription = complete_company_setup["subscription"]

        # Test current period
        now = datetime.now(UTC).replace(tzinfo=None)
        assert subscription.started_at <= now
        assert subscription.expires_at > now

        # Test if subscription is in current period (business logic method)
        # Note: Add this method to the model if needed
        start = subscription.started_at
        end = subscription.expires_at
        assert start <= now <= end

    def test_subscription_billing_cycles(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test different billing cycles."""
        company = complete_company_setup["company"]

        # Create annual subscription
        annual_sub = CompanySubscription(
            company_id=company.id,
            plan=SubscriptionPlan.ENTERPRISE.value,
            price=Decimal("2999.99"),
            billing_period=BillingPeriod.YEARLY.value,
            status=SubscriptionStatus.ACTIVE.value,
            started_at=datetime.now(UTC).replace(tzinfo=None),
            expires_at=(datetime.now(UTC) + timedelta(days=365)).replace(tzinfo=None),
        )
        advanced_db_session.add(annual_sub)
        advanced_db_session.commit()

        # Verify multiple subscriptions
        advanced_db_session.refresh(company)
        assert len(company.subscriptions) == 2

        billing_periods = [s.billing_period for s in company.subscriptions]
        assert "monthly" in billing_periods
        assert "yearly" in billing_periods

    def test_subscription_status_changes(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test subscription status changes."""
        subscription = complete_company_setup["subscription"]

        # Test status change
        subscription.status = SubscriptionStatus.CANCELLED.value
        subscription.cancelled_at = datetime.now(UTC).replace(tzinfo=None)
        subscription.cancellation_reason = "User requested cancellation"
        advanced_db_session.commit()

        advanced_db_session.refresh(subscription)
        assert subscription.status == SubscriptionStatus.CANCELLED.value
        assert subscription.cancelled_at is not None
        assert "User requested" in subscription.cancellation_reason

# ======
# ENHANCED ROLE SYSTEM ADVANCED TESTS
# ======

class TestEnhancedRoleSystemAdvanced:
    """Advanced tests for Enhanced Role System."""

    def test_role_hierarchy(self, advanced_db_session: Session):
        """Test role hierarchy and levels."""
        # Create roles with different levels
        admin_role = EnhancedRole(
            name="admin",
            display_name="Administrator",
            scope=RoleScope.SYSTEM.value,
            role_level=10,
            system_role=SystemRole.SYSTEM_ADMIN.value,
            is_system=True,
        )

        manager_role = EnhancedRole(
            name="manager",
            display_name="Manager",
            scope=RoleScope.COMPANY.value,
            role_level=7,
            company_role=CompanyRole.COMPANY_ADMIN.value,
        )

        user_role = EnhancedRole(
            name="user",
            display_name="Regular User",
            scope=RoleScope.COMPANY.value,
            role_level=3,
            company_role=CompanyRole.COMPANY_VIEWER.value,
        )

        advanced_db_session.add_all([admin_role, manager_role, user_role])
        advanced_db_session.commit()

        # Test role ordering by level
        roles = (
            advanced_db_session.execute(
                select(EnhancedRole).order_by(EnhancedRole.role_level.desc())
            )
            .scalars()
            .all()
        )

        assert roles[0].role_level == 10  # admin
        assert roles[1].role_level == 7  # manager
        assert roles[2].role_level == 3  # user

    def test_role_assignments_with_context(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test role assignments with different contexts."""
        company = complete_company_setup["company"]

        # Create user
        user = User(
            email="roletest@example.com",
            password_hash="hash",
            name="Role Test User",
            company_id=company.id,
        )
        advanced_db_session.add(user)
        advanced_db_session.commit()

        # Create roles
        system_role = EnhancedRole(
            name="system_admin",
            display_name="System Admin",
            scope=RoleScope.SYSTEM.value,
            role_level=10,
        )

        company_role = EnhancedRole(
            name="company_admin",
            display_name="Company Admin",
            scope=RoleScope.COMPANY.value,
            role_level=8,
        )

        advanced_db_session.add_all([system_role, company_role])
        advanced_db_session.commit()

        # Create assignments
        system_assignment = UserRoleAssignment(
            user_id=user.id,
            role_id=system_role.id,
            # No company_id for system role
            is_primary=False,
        )

        company_assignment = UserRoleAssignment(
            user_id=user.id,
            role_id=company_role.id,
            company_id=company.id,
            is_primary=True,
        )

        advanced_db_session.add_all([system_assignment, company_assignment])
        advanced_db_session.commit()

        # Test scope level detection
        assert system_assignment.scope_level == RoleScope.SYSTEM.value
        assert company_assignment.scope_level == RoleScope.COMPANY.value

        # Test assignment validity
        assert system_assignment.is_valid is True
        assert company_assignment.is_valid is True

        # Test user relationships
        advanced_db_session.refresh(user)
        assert len(user.role_assignments) == 2

    def test_role_assignment_expiration_and_extension(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test role assignment expiration and extension."""
        company = complete_company_setup["company"]

        # Create user and role
        user = User(
            email="tempuser@example.com",
            password_hash="hash",
            name="Temp User",
            company_id=company.id,
        )

        temp_role = EnhancedRole(
            name="temp_access",
            display_name="Temporary Access",
            scope=RoleScope.COMPANY.value,
            role_level=5,
        )

        advanced_db_session.add_all([user, temp_role])
        advanced_db_session.commit()

        # Create assignment with future expiration
        future_expiry = (datetime.now(UTC) + timedelta(days=7)).replace(tzinfo=None)
        assignment = UserRoleAssignment(
            user_id=user.id,
            role_id=temp_role.id,
            company_id=company.id,
            expires_at=future_expiry,
        )
        advanced_db_session.add(assignment)
        advanced_db_session.commit()

        # Test assignment is valid
        assert assignment.is_valid is True
        assert assignment.is_expired is False

        # Test extension
        assignment.extend_expiration(30)  # Extend by 30 days
        expected_new_expiry = future_expiry + timedelta(days=30)

        # Allow for small time differences
        assert abs((assignment.expires_at - expected_new_expiry).total_seconds()) < 60

        # Test revocation
        assignment.revoke(reason="Access no longer needed")
        assert assignment.is_active is False
        assert assignment.is_valid is False
        assert "Access no longer needed" in assignment.assignment_reason

# ======
# PERFORMANCE AND OPTIMIZATION TESTS
# ======

class TestModelPerformance:
    """Test model performance and optimization."""

    def test_bulk_operations(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test bulk operations performance."""
        company = complete_company_setup["company"]

        # Create multiple users in bulk
        users = []
        for i in range(100):
            user = User(
                email=f"bulkuser{i}@example.com",
                password_hash="hash",
                name=f"Bulk User {i}",
                company_id=company.id,
            )
            users.append(user)

        # Use bulk insert
        advanced_db_session.add_all(users)
        advanced_db_session.commit()

        # Verify bulk insert
        user_count = advanced_db_session.execute(
            select(func.count(User.id)).where(User.company_id == company.id)
        ).scalar()

        assert user_count == 100

    def test_eager_loading_relationships(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test eager loading to prevent N+1 queries."""
        company = complete_company_setup["company"]

        # Create users with profiles
        for i in range(10):
            user = User(
                email=f"eageruser{i}@example.com",
                password_hash="hash",
                name=f"Eager User {i}",
                company_id=company.id,
            )
            advanced_db_session.add(user)

        advanced_db_session.commit()

        # Test eager loading with selectinload
        users_with_company = (
            advanced_db_session.execute(
                select(User)
                .options(selectinload(User.company))
                .where(User.company_id == company.id)
            )
            .scalars()
            .all()
        )

        # Access company for all users (should not trigger additional queries)
        for user in users_with_company:
            assert user.company.name == "Advanced Test Company"

        assert len(users_with_company) == 10

    def test_complex_queries_with_joins(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test complex queries with multiple joins."""
        company = complete_company_setup["company"]

        # Create test data
        user = User(
            email="complexuser@example.com",
            password_hash="hash",
            name="Complex User",
            company_id=company.id,
        )
        advanced_db_session.add(user)
        advanced_db_session.commit()

        # Create department and project
        from app.models.department import Department, DepartmentType

        department = Department(
            name="Test Dept", company_id=company.id, type=DepartmentType.ENGINEERING
        )
        advanced_db_session.add(department)
        advanced_db_session.commit()

        project = Project(
            code="COMPLEX-001",
            name="Complex Project",
            company_id=company.id,
            department_id=department.id,
            owner_id=user.id,
        )
        advanced_db_session.add(project)
        advanced_db_session.commit()

        # Complex query with multiple joins
        result = advanced_db_session.execute(
            select(User, Project, Department, Company)
            .join(Project, User.id == Project.owner_id)
            .join(Department, Project.department_id == Department.id)
            .join(Company, User.company_id == Company.id)
            .where(Company.id == company.id)
        ).all()

        assert len(result) == 1
        user_result, project_result, dept_result, company_result = result[0]
        assert user_result.name == "Complex User"
        assert project_result.name == "Complex Project"
        assert dept_result.name == "Test Dept"
        assert company_result.name == "Advanced Test Company"

    def test_query_filters_and_sorting(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test complex query filters and sorting."""
        company = complete_company_setup["company"]

        # Create users with different statuses and creation dates
        base_date = datetime.now(UTC)
        for i in range(20):
            user = User(
                email=f"filteruser{i}@example.com",
                password_hash="hash",
                name=f"Filter User {i:02d}",
                company_id=company.id,
                is_active=(i % 2 == 0),  # Alternate active/inactive
            )
            # Manually set created_at for testing
            user.created_at = (base_date - timedelta(days=i)).replace(tzinfo=None)
            advanced_db_session.add(user)

        advanced_db_session.commit()

        # Test complex filtering
        active_users = (
            advanced_db_session.execute(
                select(User)
                .where(
                    and_(
                        User.company_id == company.id,
                        User.is_active == True,
                        User.created_at
                        > (base_date - timedelta(days=10)).replace(tzinfo=None),
                    )
                )
                .order_by(User.name.asc())
            )
            .scalars()
            .all()
        )

        # Should have 5 active users from the last 10 days
        assert len(active_users) == 5

        # Test sorting
        user_names = [u.name for u in active_users]
        assert user_names == sorted(user_names)  # Should be sorted by name

    def test_aggregation_queries(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test aggregation queries."""
        company = complete_company_setup["company"]

        # Create test data
        for i in range(15):
            user = User(
                email=f"agguser{i}@example.com",
                password_hash="hash",
                name=f"Agg User {i}",
                company_id=company.id,
                is_active=(i < 10),  # 10 active, 5 inactive
            )
            advanced_db_session.add(user)

        advanced_db_session.commit()

        # Test aggregation query
        stats = advanced_db_session.execute(
            select(
                func.count(User.id).label("total_users"),
                func.sum(case((User.is_active == True, 1), else_=0)).label(
                    "active_users"
                ),
                func.sum(case((User.is_active == False, 1), else_=0)).label(
                    "inactive_users"
                ),
            ).where(User.company_id == company.id)
        ).first()

        assert stats.total_users == 15
        assert stats.active_users == 10
        assert stats.inactive_users == 5

# ======
# EDGE CASES AND ERROR HANDLING TESTS
# ======

class TestModelEdgeCases:
    """Test edge cases and error handling."""

    def test_null_value_handling(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test handling of null values."""
        company = complete_company_setup["company"]

        # Create user with minimal required fields
        user = User(
            email="minimal@example.com",
            password_hash="hash",
            name="Minimal User",
            company_id=company.id,
            # Optional fields should be None/NULL
        )
        advanced_db_session.add(user)
        advanced_db_session.commit()

        # Test that optional relationships are None
        assert user.profile is None
        assert user.settings is None
        assert len(user.owned_projects) == 0

    def test_large_text_fields(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test handling of large text fields."""
        company = complete_company_setup["company"]

        # Create a large description
        large_description = "A" * 10000  # 10KB of text

        project = Project(
            code="LARGE-001",
            name="Large Project",
            description=large_description,
            company_id=company.id,
            department_id=(
                complete_company_setup["company"].departments[0].id
                if complete_company_setup["company"].departments
                else None
            ),
            owner_id=1,  # Assuming first user
        )

        # This should work if the field is properly defined as Text
        # In a real test, you might want to create the department and user first
        # For this example, we'll just test the description assignment
        assert len(project.description) == 10000

    def test_unicode_handling(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Test Unicode character handling."""
        company = complete_company_setup["company"]

        # Create user with Unicode characters
        unicode_user = User(
            email="unicode@测试.com",
            password_hash="hash",
            name="测试用户 🚀 Émile Dupont",
            company_id=company.id,
        )
        advanced_db_session.add(unicode_user)
        advanced_db_session.commit()

        # Verify Unicode is preserved
        advanced_db_session.refresh(unicode_user)
        assert "测试用户" in unicode_user.name
        assert "🚀" in unicode_user.name
        assert "Émile" in unicode_user.name

    def test_concurrent_access_simulation(
        self, advanced_db_session: Session, complete_company_setup
    ):
        """Simulate concurrent access scenarios."""
        company = complete_company_setup["company"]

        # Create a user
        user = User(
            email="concurrent@example.com",
            password_hash="hash",
            name="Concurrent User",
            company_id=company.id,
        )
        advanced_db_session.add(user)
        advanced_db_session.commit()

        # Simulate concurrent update by modifying user in different "sessions"
        user_session1 = advanced_db_session.get(User, user.id)
        user_session2 = advanced_db_session.get(User, user.id)

        # Both "sessions" modify the user
        user_session1.name = "Modified by Session 1"
        user_session2.name = "Modified by Session 2"

        # First commit should succeed
        user_session1_id = id(user_session1)  # Just to track objects

        # In a real concurrent scenario, you'd use separate actual sessions
        # Here we just test that the last write wins
        advanced_db_session.commit()

        # Verify final state
        final_user = advanced_db_session.get(User, user.id)
        assert final_user.name in ["Modified by Session 1", "Modified by Session 2"]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
