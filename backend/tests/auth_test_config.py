"""
Configuration for authentication API tests.

Contains test settings, admin credentials, and test scenarios.
"""

from typing import Dict, List, Any
from dataclasses import dataclass, field
from app.core.config import settings


@dataclass
class AdminTestCredentials:
    """Admin credentials for testing."""

    email: str = settings.admin.email
    password: str = settings.admin.password
    username: str = "admin"
    name: str = settings.admin.name


@dataclass
class TestEndpoint:
    """Test endpoint configuration."""

    method: str
    path: str
    requires_auth: bool = True
    payload: Dict[str, Any] = field(default_factory=dict)
    expected_status: int = 200
    description: str = ""


@dataclass
class AuthTestConfig:
    """Authentication test configuration."""

    # Base configuration
    base_url: str = "http://localhost:8000"
    api_prefix: str = "/api/v1"
    timeout: int = 30

    # Admin credentials
    admin: AdminTestCredentials = field(default_factory=AdminTestCredentials)

    # Test scenarios
    endpoints: List[TestEndpoint] = field(
        default_factory=lambda: [
            # Authentication endpoints
            TestEndpoint(
                method="POST",
                path="/auth/login",
                requires_auth=False,
                description="Admin login with credentials",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/validate-token",
                requires_auth=True,
                description="Validate admin access token",
            ),
            TestEndpoint(
                method="GET",
                path="/auth/me",
                requires_auth=True,
                description="Get current admin user info",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/refresh",
                requires_auth=False,
                description="Refresh admin access token",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/logout",
                requires_auth=True,
                description="Admin logout",
            ),
            TestEndpoint(
                method="GET",
                path="/auth/sessions",
                requires_auth=True,
                description="Get admin user sessions",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/sessions/revoke",
                requires_auth=True,
                payload={"revoke_all": False},
                description="Revoke admin sessions",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/email/request",
                requires_auth=False,
                payload={"email": "{email}"},
                description="Request email verification",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/password/reset",
                requires_auth=False,
                payload={"email": "{email}"},
                description="Request password reset",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/password/change",
                requires_auth=True,
                payload={
                    "current_password": "{password}",
                    "new_password": "NewSecurePass123!",
                    "confirm_password": "NewSecurePass123!",
                },
                description="Change admin password",
            ),
            # Identity endpoints
            TestEndpoint(
                method="GET",
                path="/identity/users/",
                requires_auth=True,
                description="Get users list (admin access)",
            ),
            TestEndpoint(
                method="GET",
                path="/identity/users/me",
                requires_auth=True,
                description="Get current user profile",
            ),
            TestEndpoint(
                method="GET",
                path="/identity/roles/",
                requires_auth=True,
                description="Get roles list (admin access)",
            ),
            TestEndpoint(
                method="GET",
                path="/identity/permissions/",
                requires_auth=True,
                description="Get permissions list (admin access)",
            ),
            # System endpoints
            TestEndpoint(
                method="GET",
                path="/system/health",
                requires_auth=True,
                description="System health check (admin access)",
            ),
            TestEndpoint(
                method="GET",
                path="/system/admin/users",
                requires_auth=True,
                description="Admin users management",
            ),
            TestEndpoint(
                method="GET",
                path="/system/metrics",
                requires_auth=True,
                description="System metrics (admin access)",
            ),
        ]
    )

    # Invalid test scenarios
    invalid_scenarios: List[TestEndpoint] = field(
        default_factory=lambda: [
            TestEndpoint(
                method="POST",
                path="/auth/login",
                requires_auth=False,
                expected_status=401,
                description="Login with invalid password",
            ),
            TestEndpoint(
                method="GET",
                path="/auth/me",
                requires_auth=False,
                expected_status=401,
                description="Access protected endpoint without token",
            ),
            TestEndpoint(
                method="POST",
                path="/auth/validate-token",
                requires_auth=False,
                expected_status=401,
                description="Validate invalid token",
            ),
        ]
    )


# Test data templates
TEST_DATA_TEMPLATES = {
    "login": {
        "valid": {"username": "{email}", "password": "{password}"},
        "invalid_password": {"username": "{email}", "password": "wrong_password"},
        "invalid_email": {"username": "wrong@example.com", "password": "{password}"},
        "missing_password": {"username": "{email}"},
        "missing_username": {"password": "{password}"},
    },
    "change_password": {
        "valid": {
            "current_password": "{password}",
            "new_password": "NewSecurePass123!",
            "confirm_password": "NewSecurePass123!",
        },
        "wrong_current": {
            "current_password": "wrong_password",
            "new_password": "NewSecurePass123!",
            "confirm_password": "NewSecurePass123!",
        },
        "mismatch_confirm": {
            "current_password": "{password}",
            "new_password": "NewSecurePass123!",
            "confirm_password": "DifferentPass123!",
        },
        "weak_password": {
            "current_password": "{password}",
            "new_password": "weak",
            "confirm_password": "weak",
        },
    },
    "reset_password": {
        "valid": {"email": "{email}"},
        "invalid_email": {"email": "nonexistent@example.com"},
        "malformed_email": {"email": "not-an-email"},
    },
    "refresh_token": {
        "valid": {"refresh_token": "{refresh_token}"},
        "invalid": {"refresh_token": "invalid_refresh_token"},
        "expired": {"refresh_token": "expired_refresh_token"},
    },
}

# Expected response schemas
EXPECTED_RESPONSES = {
    "login_success": {
        "required_fields": [
            "access_token",
            "refresh_token",
            "token_type",
            "expires_in",
            "user",
        ],
        "user_fields": ["id", "email", "username", "name", "is_active"],
    },
    "token_validation": {
        "required_fields": ["valid", "user"],
        "user_fields": ["id", "email", "username"],
    },
    "current_user": {
        "required_fields": ["id", "email", "username", "name", "is_active"],
        "optional_fields": ["profile", "settings", "roles"],
    },
    "refresh_token": {
        "required_fields": ["access_token", "refresh_token", "token_type", "expires_in"]
    },
    "sessions": {
        "type": "array",
        "item_fields": ["id", "user_id", "created_at", "last_activity"],
    },
}

# Performance benchmarks
PERFORMANCE_EXPECTATIONS = {
    "login": {"max_response_time": 2.0},
    "validate_token": {"max_response_time": 0.5},
    "get_current_user": {"max_response_time": 1.0},
    "refresh_token": {"max_response_time": 1.0},
    "logout": {"max_response_time": 1.0},
}

# Security test patterns
SECURITY_TESTS = {
    "sql_injection": [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "admin'--",
        "admin' #",
        "admin'/*",
    ],
    "xss_payloads": [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//",
        '";alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//',
    ],
    "path_traversal": [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
        "....//....//....//etc/passwd",
        "..%2F..%2F..%2Fetc%2Fpasswd",
    ],
}

# Rate limiting test configuration
RATE_LIMIT_CONFIG = {
    "login_attempts": {
        "max_requests": 5,
        "time_window": 60,  # seconds
        "expected_status": 429,
    },
    "api_requests": {"max_requests": 100, "time_window": 60, "expected_status": 429},
}


def get_test_config() -> AuthTestConfig:
    """Get the test configuration instance."""
    return AuthTestConfig()


def format_test_data(template: Dict[str, Any], **kwargs) -> Dict[str, Any]:
    """Format test data template with provided values."""
    formatted = {}
    for key, value in template.items():
        if isinstance(value, str):
            formatted[key] = value.format(**kwargs)
        else:
            formatted[key] = value
    return formatted
